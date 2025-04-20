
import { Asset, TradeSignal } from "@/types/trading";
import { getSignalLevel } from "./tradingUtils";

/**
 * Classe para gerenciar a conexão WebSocket com a API da Deriv
 */
class DerivAPI {
  private ws: WebSocket | null = null;
  private apiToken: string = '';
  private isAuthorized: boolean = false;
  private pingInterval: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private onSignalCallback: ((signal: TradeSignal) => void) | null = null;
  private activeAssets: string[] = [];
  private connectionTimeout: number | null = null;
  
  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }
  
  /**
   * Conecta ao WebSocket da Deriv
   */
  public connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log("WebSocket já está conectado");
        resolve(true);
        return;
      }
      
      // Limpar conexão anterior se existir
      if (this.ws) {
        this.ws.onclose = null; // Desabilitar callback de fechamento para evitar reconexão automática
        this.ws.close();
        this.ws = null;
      }
      
      console.log("Iniciando nova conexão WebSocket com a Deriv");
      
      try {
        this.ws = new WebSocket('wss://ws.binaryws.com/websockets/v3');
        
        // Timeout de conexão (10 segundos)
        this.connectionTimeout = window.setTimeout(() => {
          console.error("Timeout de conexão atingido");
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            resolve(false);
          }
        }, 10000);
        
        this.ws.onopen = () => {
          console.log('Conexão WebSocket estabelecida com a Deriv');
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          this.startPingInterval();
          this.reconnectAttempts = 0;
          
          if (this.apiToken) {
            console.log("Autenticando com token API");
            this.doAuthenticate();
          }
          
          resolve(true);
        };
        
        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);
            this.handleMessage(response);
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('Erro na conexão WebSocket:', error);
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          resolve(false);
        };
        
        this.ws.onclose = (event) => {
          console.log(`Conexão WebSocket fechada. Código: ${event.code}, Razão: ${event.reason}`);
          this.isAuthorized = false;
          this.clearPingInterval();
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          // Tentar reconectar
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Tentativa de reconexão ${this.reconnectAttempts} de ${this.maxReconnectAttempts}`);
            setTimeout(() => {
              this.connect();
            }, 3000 * this.reconnectAttempts);
          } else {
            console.error("Número máximo de tentativas de reconexão atingido");
          }
        };
      } catch (error) {
        console.error("Erro ao criar WebSocket:", error);
        resolve(false);
      }
    });
  }
  
  /**
   * Envia uma mensagem para o WebSocket
   */
  private send(request: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify(request);
        console.log(`Enviando mensagem: ${message}`);
        this.ws.send(message);
      } catch (error) {
        console.error('Erro ao enviar mensagem WebSocket:', error);
      }
    } else {
      console.error('WebSocket não está conectado. Estado atual:', this.ws?.readyState);
    }
  }
  
  /**
   * Autentica com o token da API
   */
  public authenticate(token: string): void {
    if (!token || token.trim() === '') {
      console.error("Token API vazio ou inválido");
      return;
    }
    
    console.log("Configurando token API");
    this.apiToken = token;
    
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.log("WebSocket não está aberto, tentando conectar primeiro");
      this.connect().then((connected) => {
        if (connected) {
          this.doAuthenticate();
        } else {
          console.error("Não foi possível conectar ao WebSocket para autenticação");
        }
      });
    } else {
      this.doAuthenticate();
    }
  }
  
  private doAuthenticate(): void {
    console.log("Enviando requisição de autenticação");
    this.send({
      authorize: this.apiToken,
      req_id: 1
    });
  }
  
  /**
   * Subscribe para ticks de um símbolo
   */
  public subscribe(symbol: string): void {
    if (!this.isAuthorized) {
      console.error(`Não autenticado, não é possível assinar ${symbol}`);
      return;
    }
    
    console.log(`Assinando ticks para ${symbol}`);
    
    if (!this.activeAssets.includes(symbol)) {
      this.activeAssets.push(symbol);
    }
    
    this.send({
      ticks: symbol,
      subscribe: 1,
      req_id: 2 + this.activeAssets.indexOf(symbol) // IDs únicos para cada assinatura
    });
  }
  
  /**
   * Unsubscribe de ticks de um símbolo
   */
  public unsubscribe(symbol: string): void {
    console.log(`Cancelando assinatura para ${symbol}`);
    this.activeAssets = this.activeAssets.filter(a => a !== symbol);
    
    this.send({
      forget_all: "ticks",
      req_id: 100
    });
    
    // Resubscribe nos símbolos ativos restantes
    if (this.activeAssets.length > 0) {
      console.log(`Reassinando ${this.activeAssets.length} ativos restantes`);
      this.activeAssets.forEach((asset, index) => {
        this.send({
          ticks: asset,
          subscribe: 1,
          req_id: 101 + index
        });
      });
    }
  }
  
  /**
   * Define o callback para sinal
   */
  public setSignalCallback(callback: (signal: TradeSignal) => void): void {
    this.onSignalCallback = callback;
  }
  
  /**
   * Verifica e atualiza assinaturas com base nos ativos selecionados
   */
  public updateSubscriptions(selectedAssets: string[]): void {
    if (!this.isAuthorized) {
      console.warn("Não autenticado, não é possível atualizar assinaturas");
      return;
    }
    
    console.log(`Atualizando assinaturas. Ativos selecionados: ${selectedAssets.join(', ')}`);
    
    // Cancelar todas as assinaturas primeiro
    if (this.activeAssets.length > 0) {
      this.send({
        forget_all: "ticks",
        req_id: 200
      });
      
      this.activeAssets = [];
    }
    
    // Assinar os ativos selecionados
    selectedAssets.forEach((assetId, index) => {
      this.activeAssets.push(assetId);
      this.send({
        ticks: assetId,
        subscribe: 1,
        req_id: 201 + index
      });
    });
  }
  
  /**
   * Processa mensagens recebidas do WebSocket
   */
  private handleMessage(response: any): void {
    // Resposta de autorização
    if (response.authorize) {
      console.log('Autorizado com sucesso na API Deriv');
      this.isAuthorized = true;
      
      // Reativamos subscrições se existirem
      if (this.activeAssets.length > 0) {
        console.log(`Reativando ${this.activeAssets.length} assinaturas`);
        this.activeAssets.forEach(asset => this.subscribe(asset));
      }
    }
    
    // Resposta de tick
    if (response.tick) {
      console.log(`Tick recebido para ${response.tick.symbol}: ${response.tick.quote}`);
      this.processTick(response.tick);
    }
    
    // Resposta de ping
    if (response.ping) {
      // Não fazemos nada aqui, mas confirmamos que recebemos o ping
      console.log("Ping recebido da API Deriv");
    }
    
    // Mensagem de erro
    if (response.error) {
      console.error('Erro da API Deriv:', response.error.code, response.error.message);
    }
  }
  
  /**
   * Processa um tick e possivelmente gera um sinal de negociação
   */
  private processTick(tick: any): void {
    const asset = this.findAssetBySymbol(tick.symbol);
    
    if (!asset) {
      console.warn(`Ativo não encontrado para o símbolo: ${tick.symbol}`);
      return;
    }

    // Aqui você aplicaria sua lógica real de análise técnica
    // Estamos simulando um sinal a cada 30 ticks (aproximadamente)
    if (Math.random() < 0.03 && this.onSignalCallback) {
      const direction = Math.random() > 0.5 ? 'CALL' : 'PUT';
      const score = Math.floor(Math.random() * 3) + 4; // 4-6
      const level = getSignalLevel(score) || 'C';
      
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Razões seriam baseadas na análise técnica real
      const reasons = ['Sinal API Deriv', `Preço: ${tick.quote}`, 'Tendência de alta'];
      
      const signal: TradeSignal = {
        id: Date.now().toString(),
        asset,
        direction,
        timestamp: now.getTime(),
        score,
        level,
        reasons,
        entryTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      };
      
      console.log(`Gerando sinal para ${asset.symbol}: ${direction} com score ${score}`);
      this.onSignalCallback(signal);
    }
  }
  
  /**
   * Encontra um ativo por símbolo
   */
  private findAssetBySymbol(symbol: string): Asset | undefined {
    // Importado de tradingUtils.ts
    const tradingAssets = [
      { id: "R_10", name: "Volatility 10 Index", symbol: "R_10", type: "synthetic" as const },
      { id: "R_25", name: "Volatility 25 Index", symbol: "R_25", type: "synthetic" as const },
      { id: "R_50", name: "Volatility 50 Index", symbol: "R_50", type: "synthetic" as const },
      { id: "R_75", name: "Volatility 75 Index", symbol: "R_75", type: "synthetic" as const },
      { id: "R_100", name: "Volatility 100 Index", symbol: "R_100", type: "synthetic" as const },
      { id: "BOOM1000", name: "Boom 1000 Index", symbol: "BOOM1000", type: "synthetic" as const },
      { id: "CRASH1000", name: "Crash 1000 Index", symbol: "CRASH1000", type: "synthetic" as const },
    ];
    
    return tradingAssets.find(asset => asset.symbol === symbol);
  }
  
  /**
   * Inicia o intervalo de ping para manter a conexão ativa
   */
  private startPingInterval(): void {
    this.clearPingInterval();
    console.log("Iniciando intervalo de ping");
    this.pingInterval = window.setInterval(() => {
      this.send({ ping: 1 });
    }, 30000);
  }
  
  /**
   * Limpa o intervalo de ping
   */
  private clearPingInterval(): void {
    if (this.pingInterval) {
      console.log("Limpando intervalo de ping");
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  /**
   * Desconecta do WebSocket
   */
  public disconnect(): void {
    console.log("Desconectando WebSocket");
    this.clearPingInterval();
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.ws) {
      this.ws.onclose = null; // Evitar tentativa de reconexão
      this.ws.close();
      this.ws = null;
    }
    
    this.isAuthorized = false;
    this.activeAssets = [];
    this.reconnectAttempts = 0;
  }
}

// Singleton instance para uso em toda a aplicação
export const derivAPI = new DerivAPI();

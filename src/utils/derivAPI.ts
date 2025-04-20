
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
        resolve(true);
        return;
      }
      
      this.ws = new WebSocket('wss://ws.binaryws.com/websockets/v3');
      
      this.ws.onopen = () => {
        console.log('Conexão WebSocket estabelecida com a Deriv');
        this.startPingInterval();
        this.reconnectAttempts = 0;
        
        if (this.apiToken) {
          this.authenticate(this.apiToken);
        }
        
        resolve(true);
      };
      
      this.ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        this.handleMessage(response);
      };
      
      this.ws.onerror = (error) => {
        console.error('Erro na conexão WebSocket:', error);
        resolve(false);
      };
      
      this.ws.onclose = () => {
        console.log('Conexão WebSocket fechada');
        this.isAuthorized = false;
        this.clearPingInterval();
        
        // Tentar reconectar
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.connect();
          }, 3000 * this.reconnectAttempts);
        }
      };
    });
  }
  
  /**
   * Envia uma mensagem para o WebSocket
   */
  private send(request: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(request));
    } else {
      console.error('WebSocket não está conectado');
    }
  }
  
  /**
   * Autentica com o token da API
   */
  public authenticate(token: string): void {
    this.apiToken = token;
    
    if (this.ws?.readyState !== WebSocket.OPEN) {
      this.connect().then(() => {
        this.doAuthenticate();
      });
    } else {
      this.doAuthenticate();
    }
  }
  
  private doAuthenticate(): void {
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
      console.error('Não autenticado, não é possível assinar');
      return;
    }
    
    if (!this.activeAssets.includes(symbol)) {
      this.activeAssets.push(symbol);
    }
    
    this.send({
      ticks: symbol,
      subscribe: 1,
      req_id: 2
    });
  }
  
  /**
   * Unsubscribe de ticks de um símbolo
   */
  public unsubscribe(symbol: string): void {
    this.activeAssets = this.activeAssets.filter(a => a !== symbol);
    
    this.send({
      forget_all: "ticks",
      req_id: 3
    });
    
    // Resubscribe nos símbolos ativos restantes
    this.activeAssets.forEach(asset => {
      this.send({
        ticks: asset,
        subscribe: 1,
        req_id: 4
      });
    });
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
    if (!this.isAuthorized) return;
    
    // Cancelar assinaturas que não estão mais selecionadas
    this.activeAssets.forEach(assetId => {
      if (!selectedAssets.includes(assetId)) {
        this.unsubscribe(assetId);
      }
    });
    
    // Assinar novos ativos selecionados
    selectedAssets.forEach(assetId => {
      if (!this.activeAssets.includes(assetId)) {
        this.subscribe(assetId);
      }
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
        this.activeAssets.forEach(asset => this.subscribe(asset));
      }
    }
    
    // Resposta de tick
    if (response.tick) {
      this.processTick(response.tick);
    }
    
    // Resposta de ping
    if (response.ping) {
      // Enviamos pong para manter a conexão ativa
    }
    
    // Mensagem de erro
    if (response.error) {
      console.error('Erro da API Deriv:', response.error);
    }
  }
  
  /**
   * Processa um tick e possivelmente gera um sinal de negociação
   */
  private processTick(tick: any): void {
    // Em uma aplicação real, você analisaria aqui os ticks para ver
    // se eles correspondem às suas condições de sinal
    
    // Para fins de demonstração, vamos criar um sinal com base 
    // em algumas condições aleatórias (como exemplo)
    const asset = this.findAssetBySymbol(tick.symbol);
    
    if (!asset) return;

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
    this.pingInterval = window.setInterval(() => {
      this.send({ ping: 1 });
    }, 30000);
  }
  
  /**
   * Limpa o intervalo de ping
   */
  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  /**
   * Desconecta do WebSocket
   */
  public disconnect(): void {
    this.clearPingInterval();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isAuthorized = false;
    this.activeAssets = [];
  }
}

// Singleton instance para uso em toda a aplicação
export const derivAPI = new DerivAPI();


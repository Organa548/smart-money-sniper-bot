
import { Asset, TradeSignal } from "@/types/trading";
import { wsManager } from "./websocketManager";
import { SubscriptionManager } from "./subscriptionManager";
import { SignalProcessor } from "./signalProcessor";
import { tradingAssets } from "@/utils/tradingUtils";

class DerivAPI {
  private apiToken: string = import.meta.env.VITE_DERIV_API_TOKEN || '';
  private apiId: string = import.meta.env.VITE_DERIV_API_ID || '';
  private isAuthorized: boolean = false;
  private subscriptionManager: SubscriptionManager;
  private signalProcessor: SignalProcessor;
  
  constructor() {
    console.log("DerivAPI inicializado");
    console.log("API Token definido:", this.apiToken ? "Sim" : "Não");
    console.log("API ID definido:", this.apiId ? "Sim" : "Não");
    
    this.subscriptionManager = new SubscriptionManager(wsManager.send.bind(wsManager));
    this.signalProcessor = new SignalProcessor();
    
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }
  
  public connect(): Promise<boolean> {
    console.log("Tentando conectar à API Deriv...");
    return new Promise(async (resolve) => {
      const connected = await wsManager.connect();
      
      if (connected) {
        console.log("Conexão WebSocket bem-sucedida, configurando handlers...");
        wsManager.setMessageHandler((event) => {
          try {
            const response = JSON.parse(event.data);
            console.log("Mensagem recebida da API Deriv:", JSON.stringify(response));
            this.handleMessage(response);
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        });
        
        wsManager.setCloseHandler((event) => {
          console.log(`Conexão WebSocket fechada. Código: ${event.code}, Razão: ${event.reason}`);
          this.isAuthorized = false;
          
          if (wsManager.getReconnectAttempts() < 5) {
            wsManager.incrementReconnectAttempts();
            console.log(`Tentativa de reconexão ${wsManager.getReconnectAttempts()} de 5`);
            setTimeout(() => {
              this.connect();
            }, 3000 * wsManager.getReconnectAttempts());
          } else {
            console.error("Número máximo de tentativas de reconexão atingido");
          }
        });
        
        // Autenticar imediatamente após conexão bem-sucedida
        if (this.apiToken && this.apiId) {
          console.log("Iniciando autenticação automática");
          this.doAuthenticate();
        } else {
          console.warn("API Token ou API ID não definidos, não é possível autenticar automaticamente");
        }
      } else {
        console.error("Falha ao conectar WebSocket com a Deriv");
      }
      
      resolve(connected);
    });
  }
  
  public authenticate(token: string, apiId: string): void {
    if (!token || token.trim() === '') {
      console.error("Token API vazio ou inválido");
      return;
    }
    
    if (!apiId || apiId.trim() === '') {
      console.error("API ID vazio ou inválido");
      return;
    }
    
    console.log("Configurando token API e API ID");
    this.apiToken = token;
    this.apiId = apiId;
    this.doAuthenticate();
  }
  
  private doAuthenticate(): void {
    console.log("Enviando requisição de autenticação");
    wsManager.send({
      authorize: this.apiToken,
      app_id: this.apiId,
      req_id: 1
    });
  }
  
  public subscribe(symbol: string): void {
    if (!this.isAuthorized) {
      console.error(`Não autenticado, não é possível assinar ${symbol}`);
      return;
    }
    this.subscriptionManager.subscribe(symbol);
  }
  
  public unsubscribe(symbol: string): void {
    this.subscriptionManager.unsubscribe(symbol);
  }
  
  public updateSubscriptions(selectedAssets: string[]): void {
    if (!this.isAuthorized) {
      console.warn("Não autenticado, não é possível atualizar assinaturas");
      return;
    }
    this.subscriptionManager.updateSubscriptions(selectedAssets);
  }
  
  public setSignalCallback(callback: (signal: TradeSignal) => void): void {
    this.signalProcessor.setSignalCallback(callback);
  }
  
  private handleMessage(response: any): void {
    if (response.authorize) {
      console.log('✅ Autorizado com sucesso na API Deriv! Balance:', response.authorize?.balance);
      this.isAuthorized = true;
      
      // Após autenticação bem-sucedida, ativar assinaturas
      console.log("Assinando ativos padrão após autenticação...");
      this.updateSubscriptions(tradingAssets.map(asset => asset.id));
    }
    
    if (response.tick) {
      // Reduzir logs para evitar poluição do console
      if (Math.random() < 0.01) {  // Apenas 1% dos ticks são logados
        console.log(`Tick recebido para ${response.tick.symbol}: ${response.tick.quote}`);
      }
      
      const asset = this.findAssetBySymbol(response.tick.symbol);
      if (asset) {
        this.signalProcessor.processTick(response.tick, asset);
      }
    }
    
    if (response.error) {
      console.error('Erro da API Deriv:', response.error.code, response.error.message);
    }
  }
  
  private findAssetBySymbol(symbol: string): Asset | undefined {
    return tradingAssets.find(asset => asset.symbol === symbol);
  }
  
  public disconnect(): void {
    console.log("Desconectando WebSocket");
    wsManager.disconnect();
    this.isAuthorized = false;
  }
}

export const derivAPI = new DerivAPI();

// Conectar automaticamente quando o módulo é carregado
console.log("Iniciando conexão automática com a Deriv API...");
derivAPI.connect().then(connected => {
  if (connected) {
    console.log("✅ Conexão inicial com a Deriv API bem-sucedida");
  } else {
    console.error("❌ Falha na conexão inicial com a Deriv API");
  }
});

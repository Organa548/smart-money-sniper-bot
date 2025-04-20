
import { Asset, TradeSignal } from "@/types/trading";
import { wsManager } from "./websocketManager";
import { SubscriptionManager } from "./subscriptionManager";
import { SignalProcessor } from "./signalProcessor";
import { tradingAssets } from "@/utils/tradingUtils";

class DerivAPI {
  private apiToken: string = '';
  private isAuthorized: boolean = false;
  private subscriptionManager: SubscriptionManager;
  private signalProcessor: SignalProcessor;
  
  constructor() {
    this.subscriptionManager = new SubscriptionManager(wsManager.send.bind(wsManager));
    this.signalProcessor = new SignalProcessor();
    
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }
  
  public connect(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const connected = await wsManager.connect();
      
      if (connected) {
        wsManager.setMessageHandler((event) => {
          try {
            const response = JSON.parse(event.data);
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
      }
      
      resolve(connected);
    });
  }
  
  public authenticate(token: string): void {
    if (!token || token.trim() === '') {
      console.error("Token API vazio ou inválido");
      return;
    }
    
    console.log("Configurando token API");
    this.apiToken = token;
    this.doAuthenticate();
  }
  
  private doAuthenticate(): void {
    console.log("Enviando requisição de autenticação");
    wsManager.send({
      authorize: this.apiToken,
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
      console.log('Autorizado com sucesso na API Deriv');
      this.isAuthorized = true;
      
      const activeAssets = this.subscriptionManager.getActiveAssets();
      if (activeAssets.length > 0) {
        console.log(`Reativando ${activeAssets.length} assinaturas`);
        activeAssets.forEach(asset => this.subscribe(asset));
      }
    }
    
    if (response.tick) {
      const asset = this.findAssetBySymbol(response.tick.symbol);
      this.signalProcessor.processTick(response.tick, asset);
    }
    
    if (response.error) {
      console.error('Erro da API Deriv:', response.error.code, response.error.message);
    }
  }
  
  private findAssetBySymbol(symbol: string): Asset | undefined {
    return tradingAssets.find(asset => asset.symbol === symbol);
  }
  
  public disconnect(): void {
    wsManager.disconnect();
    this.isAuthorized = false;
  }
}

export const derivAPI = new DerivAPI();

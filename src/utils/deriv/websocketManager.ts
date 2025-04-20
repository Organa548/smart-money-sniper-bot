import { wsManager } from "./websocketManager";

class WebSocketManager {
  private ws: WebSocket | null = null;
  private connectionTimeout: number | null = null;
  private pingInterval: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private lastError: string | null = null;
  private isConnecting: boolean = false;
  private connectionBlockedByBrowser: boolean = false;
  private websocketUrl: string = 'wss://ws.binaryws.com/websockets/v3';

  // Novo método para definir a URL do WebSocket
  public setWebsocketUrl(url: string): void {
    this.websocketUrl = url;
  }

  public connect(customUrl?: string): Promise<boolean> {
    const connectionUrl = customUrl || this.websocketUrl;
    
    console.log(`Conectando à URL: ${connectionUrl}`);
    
    return new Promise((resolve) => {
      try {
        if (typeof WebSocket === 'undefined') {
          console.error("WebSocket não suportado");
          this.lastError = "WebSocket não suportado";
          resolve(false);
          return;
        }
        
        this.ws = new WebSocket(connectionUrl);
        
        this.connectionTimeout = window.setTimeout(() => {
          console.error("Timeout de conexão atingido");
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            this.lastError = "Timeout de conexão";
            resolve(false);
          }
        }, 10000);
        
        this.ws.onopen = () => {
          console.log('✅ Conexão WebSocket estabelecida!');
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          this.startPingInterval();
          this.reconnectAttempts = 0;
          this.lastError = null;
          this.connectionBlockedByBrowser = false;
          resolve(true);
        };
        
        this.ws.onerror = (error) => {
          console.error('Erro na conexão WebSocket:', error);
          this.lastError = "Bloqueio de conexão pelo navegador ou servidor não disponível";
          this.connectionBlockedByBrowser = true;
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          resolve(false);
        };
        
        this.ws.onclose = (event) => {
          console.log(`Conexão WebSocket fechada. Código: ${event.code}, Razão: ${event.reason}`);
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          resolve(false);
        };
      } catch (error) {
        console.error("Erro ao criar WebSocket:", error);
        this.lastError = error instanceof Error ? error.message : "Erro desconhecido";
        resolve(false);
      }
    });
  }

  public send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(message);
        // Reduzindo logs para evitar poluição, exceto para mensagens importantes
        if (!messageStr.includes("ping") && !messageStr.includes("ticks")) {
          console.log(`Enviando mensagem: ${messageStr}`);
        }
        this.ws.send(messageStr);
      } catch (error) {
        console.error('Erro ao enviar mensagem WebSocket:', error);
      }
    } else {
      console.error('WebSocket não está conectado. Estado atual:', this.ws?.readyState);
    }
  }

  public setMessageHandler(handler: (event: MessageEvent) => void): void {
    if (this.ws) {
      this.ws.onmessage = handler;
    }
  }

  public setCloseHandler(handler: (event: CloseEvent) => void): void {
    if (this.ws) {
      this.ws.onclose = handler;
    }
  }

  private startPingInterval(): void {
    this.clearPingInterval();
    console.log("Iniciando intervalo de ping");
    this.pingInterval = window.setInterval(() => {
      this.send({ ping: 1 });
    }, 30000);
  }

  private clearPingInterval(): void {
    if (this.pingInterval) {
      console.log("Limpando intervalo de ping");
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public disconnect(): void {
    console.log("Desconectando WebSocket");
    this.clearPingInterval();
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.ws) {
      this.ws.onclose = null;
      try {
        this.ws.close();
      } catch (error) {
        console.error("Erro ao fechar WebSocket:", error);
      }
      this.ws = null;
    }
    
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  public incrementReconnectAttempts(): void {
    this.reconnectAttempts++;
  }
  
  public getLastError(): string | null {
    return this.lastError;
  }
  
  public isConnectionBlockedByBrowser(): boolean {
    return this.connectionBlockedByBrowser;
  }
  
  public resetConnectionAttempts(): void {
    this.reconnectAttempts = 0;
    this.connectionBlockedByBrowser = false;
  }
}

export const wsManager = new WebSocketManager();

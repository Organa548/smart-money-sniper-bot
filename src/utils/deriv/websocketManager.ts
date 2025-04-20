
class WebSocketManager {
  private ws: WebSocket | null = null;
  private connectionTimeout: number | null = null;
  private pingInterval: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  public connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log("WebSocket já está conectado");
        resolve(true);
        return;
      }
      
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.close();
        this.ws = null;
      }
      
      console.log("Iniciando nova conexão WebSocket com a Deriv");
      
      try {
        this.ws = new WebSocket('wss://ws.binaryws.com/websockets/v3');
        
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
          resolve(true);
        };
        
        this.ws.onerror = (error) => {
          console.error('Erro na conexão WebSocket:', error);
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          resolve(false);
        };
      } catch (error) {
        console.error("Erro ao criar WebSocket:", error);
        resolve(false);
      }
    });
  }

  public send(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const messageStr = JSON.stringify(message);
        console.log(`Enviando mensagem: ${messageStr}`);
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
      this.ws.close();
      this.ws = null;
    }
    
    this.reconnectAttempts = 0;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }

  public incrementReconnectAttempts(): void {
    this.reconnectAttempts++;
  }
}

export const wsManager = new WebSocketManager();

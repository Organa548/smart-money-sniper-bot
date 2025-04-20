
class WebSocketManager {
  private ws: WebSocket | null = null;
  private connectionTimeout: number | null = null;
  private pingInterval: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private lastError: string | null = null;
  private isConnecting: boolean = false;

  public connect(): Promise<boolean> {
    console.log("WebSocketManager: Iniciando conexão");
    
    // Se já estiver conectando, retorne uma promise que será resolvida quando a conexão atual terminar
    if (this.isConnecting) {
      console.log("Já há uma tentativa de conexão em andamento, aguardando...");
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkInterval);
            resolve(this.ws?.readyState === WebSocket.OPEN);
          }
        }, 500);
      });
    }
    
    return new Promise((resolve) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log("WebSocket já está conectado");
        resolve(true);
        return;
      }
      
      this.isConnecting = true;
      
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.close();
        this.ws = null;
      }
      
      console.log("Iniciando nova conexão WebSocket com a Deriv");
      
      try {
        // Verificar se o navegador suporta WebSockets
        if (typeof WebSocket === 'undefined') {
          console.error("WebSocket não é suportado neste ambiente");
          this.lastError = "WebSocket não suportado";
          this.isConnecting = false;
          resolve(false);
          return;
        }
        
        // Tentando conexão com protocolo wss (WebSocket Secure)
        this.ws = new WebSocket('wss://ws.binaryws.com/websockets/v3');
        console.log("Objeto WebSocket criado, aguardando conexão...");
        
        // Timeout reduzido para 10 segundos para evitar esperas muito longas
        this.connectionTimeout = window.setTimeout(() => {
          console.error("Timeout de conexão atingido após 10 segundos");
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            this.lastError = "Timeout de conexão";
            this.isConnecting = false;
            resolve(false);
          }
        }, 10000);
        
        this.ws.onopen = () => {
          console.log('✅ Conexão WebSocket estabelecida com a Deriv');
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          this.startPingInterval();
          this.reconnectAttempts = 0;
          this.lastError = null;
          this.isConnecting = false;
          resolve(true);
        };
        
        this.ws.onerror = (error) => {
          console.error('Erro na conexão WebSocket:', error);
          this.lastError = "Bloqueio de conexão pelo navegador ou servidor não disponível";
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          this.isConnecting = false;
          resolve(false);
        };
        
        this.ws.onclose = (event) => {
          console.log(`Conexão WebSocket fechada. Código: ${event.code}, Razão: ${event.reason}`);
          this.isConnecting = false;
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          resolve(false);
        };
      } catch (error) {
        console.error("Erro ao criar WebSocket:", error);
        this.lastError = error instanceof Error ? error.message : "Erro desconhecido";
        this.isConnecting = false;
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
      this.ws.close();
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
}

export const wsManager = new WebSocketManager();

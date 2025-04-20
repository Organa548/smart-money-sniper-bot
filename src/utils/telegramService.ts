
import { TradeSignal } from "@/types/trading";

export interface TelegramSettings {
  enabled: boolean;
  botToken: string;
  chatId: string;
  sendWins: boolean;
  sendLosses: boolean;
  sendResultsAutomatically: boolean;
  sendSignalAdvance: boolean;
}

export class TelegramService {
  private settings: TelegramSettings;
  
  constructor(settings: TelegramSettings) {
    this.settings = settings;
  }
  
  public updateSettings(settings: TelegramSettings): void {
    this.settings = settings;
  }
  
  public async sendSignal(signal: TradeSignal): Promise<boolean> {
    if (!this.settings.enabled || !this.settings.botToken || !this.settings.chatId) {
      console.log("Telegram desativado ou configurações incompletas");
      return false;
    }
    
    try {
      const message = this.formatSignalMessage(signal);
      return await this.sendMessage(message);
    } catch (error) {
      console.error("Erro ao enviar sinal para o Telegram:", error);
      return false;
    }
  }
  
  public async sendResult(signal: TradeSignal): Promise<boolean> {
    if (!this.settings.enabled || !this.settings.botToken || !this.settings.chatId) {
      return false;
    }
    
    if (!signal.result) {
      console.log("Sinal sem resultado definido");
      return false;
    }
    
    // Verificar configurações de envio baseado no resultado
    if ((signal.result === 'WIN' && !this.settings.sendWins) || 
        (signal.result === 'LOSS' && !this.settings.sendLosses)) {
      console.log(`Não enviando resultado ${signal.result} (desativado nas configurações)`);
      return false;
    }
    
    try {
      const message = this.formatResultMessage(signal);
      return await this.sendMessage(message);
    } catch (error) {
      console.error("Erro ao enviar resultado para o Telegram:", error);
      return false;
    }
  }
  
  public async sendTestMessage(): Promise<boolean> {
    if (!this.settings.enabled || !this.settings.botToken || !this.settings.chatId) {
      return false;
    }
    
    try {
      const message = "🔔 *Teste de Conexão* 🔔\n\nConfiguração do bot realizada com sucesso!";
      return await this.sendMessage(message);
    } catch (error) {
      console.error("Erro ao enviar mensagem de teste para o Telegram:", error);
      return false;
    }
  }
  
  private formatSignalMessage(signal: TradeSignal): string {
    const directionEmoji = signal.direction === 'CALL' ? '🟢' : '🔴';
    const levelStars = signal.level === 'A' ? '⭐⭐⭐' : signal.level === 'B' ? '⭐⭐' : '⭐';
    
    let message = `${directionEmoji} *SINAL IDENTIFICADO* ${directionEmoji}\n\n`;
    message += `*Ativo:* ${signal.asset.symbol}\n`;
    message += `*Direção:* ${signal.direction}\n`;
    message += `*Hora:* ${signal.entryTime}\n`;
    message += `*Nível:* ${signal.level} ${levelStars}\n`;
    message += `*Score:* ${signal.score}/6\n\n`;
    
    message += "*Confluências:*\n";
    signal.reasons.forEach(reason => {
      message += `• ${reason}\n`;
    });
    
    return message;
  }
  
  private formatResultMessage(signal: TradeSignal): string {
    const resultEmoji = signal.result === 'WIN' ? '✅' : '❌';
    
    let message = `${resultEmoji} *RESULTADO: ${signal.result}* ${resultEmoji}\n\n`;
    message += `*Ativo:* ${signal.asset.symbol}\n`;
    message += `*Direção:* ${signal.direction}\n`;
    message += `*Hora:* ${signal.entryTime}\n`;
    message += `*Nível:* ${signal.level}\n`;
    
    return message;
  }
  
  private async sendMessage(text: string): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${this.settings.botToken}/sendMessage`;
      
      const params = {
        chat_id: this.settings.chatId,
        text,
        parse_mode: 'Markdown'
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      const data = await response.json();
      
      if (!data.ok) {
        console.error("Erro API Telegram:", data.description);
        return false;
      }
      
      console.log("Mensagem enviada com sucesso para o Telegram");
      return true;
    } catch (error) {
      console.error("Erro ao enviar mensagem para o Telegram:", error);
      return false;
    }
  }
}

// Instância global para ser usada em toda a aplicação
export const telegramService = new TelegramService({
  enabled: false,
  botToken: "",
  chatId: "",
  sendWins: true,
  sendLosses: true,
  sendResultsAutomatically: true,
  sendSignalAdvance: true
});

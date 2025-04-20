
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
    console.log("TelegramService inicializado com token:", settings.botToken ? "Definido" : "Não definido");
    console.log("TelegramService inicializado com chatId:", settings.chatId ? "Definido" : "Não definido");
  }
  
  public updateSettings(settings: TelegramSettings): void {
    this.settings = settings;
    console.log("TelegramService configurações atualizadas");
  }
  
  public async sendSignal(signal: TradeSignal): Promise<boolean> {
    console.log("Tentando enviar sinal para o Telegram...");
    
    if (!this.settings.enabled) {
      console.log("Telegram desativado nas configurações");
      return false;
    }
    
    if (!this.settings.botToken || !this.settings.chatId) {
      console.error("Token do bot ou ChatID não configurados");
      return false;
    }
    
    try {
      const message = this.formatSignalMessage(signal);
      console.log("Mensagem formatada para o Telegram:", message);
      return await this.sendMessage(message);
    } catch (error) {
      console.error("Erro ao enviar sinal para o Telegram:", error);
      return false;
    }
  }
  
  public async sendResult(signal: TradeSignal): Promise<boolean> {
    console.log("Tentando enviar resultado para o Telegram...");
    
    if (!this.settings.enabled) {
      console.log("Telegram desativado nas configurações");
      return false;
    }
    
    if (!this.settings.botToken || !this.settings.chatId) {
      console.error("Token do bot ou ChatID não configurados");
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
      console.log("Mensagem de resultado formatada para o Telegram:", message);
      return await this.sendMessage(message);
    } catch (error) {
      console.error("Erro ao enviar resultado para o Telegram:", error);
      return false;
    }
  }
  
  public async sendTestMessage(): Promise<boolean> {
    console.log("Enviando mensagem de teste para o Telegram...");
    console.log("Token:", this.settings.botToken ? "Definido" : "Não definido");
    console.log("ChatID:", this.settings.chatId ? "Definido" : "Não definido");
    
    if (!this.settings.enabled) {
      console.log("Telegram desativado nas configurações");
      return false;
    }
    
    if (!this.settings.botToken || !this.settings.chatId) {
      console.error("Token do bot ou ChatID não configurados");
      return false;
    }
    
    try {
      const message = "🔔 *TESTE DE CONEXÃO* 🔔\n\nConfigurações do bot verificadas com sucesso!\nHora do teste: " + new Date().toLocaleTimeString();
      console.log("Enviando mensagem de teste:", message);
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
      console.log(`Enviando mensagem para o Telegram: URL: https://api.telegram.org/bot<TOKEN>/sendMessage`);
      console.log(`Chat ID utilizado: ${this.settings.chatId}`);
      
      const url = `https://api.telegram.org/bot${this.settings.botToken}/sendMessage`;
      
      const params = {
        chat_id: this.settings.chatId,
        text,
        parse_mode: 'Markdown'
      };
      
      console.log("Iniciando fetch para API do Telegram");
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      console.log("Resposta recebida da API do Telegram, status:", response.status);
      
      const data = await response.json();
      console.log("Dados da resposta:", JSON.stringify(data));
      
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

// Instância global atualizada para usar os segredos do Supabase
export const telegramService = new TelegramService({
  enabled: true,
  botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
  sendWins: true,
  sendLosses: true,
  sendResultsAutomatically: true,
  sendSignalAdvance: true
});

// Enviando uma mensagem de teste no carregamento do módulo
telegramService.sendTestMessage().then(success => {
  if (success) {
    console.log("✅ Mensagem de teste enviada com sucesso para o Telegram!");
  } else {
    console.error("❌ Falha ao enviar mensagem de teste para o Telegram!");
  }
});

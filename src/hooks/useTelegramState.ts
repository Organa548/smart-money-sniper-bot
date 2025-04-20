
import { useState, useEffect } from "react";
import { TelegramSettings } from "@/utils/telegramService";
import { telegramService } from "@/utils/telegramService";
import { toast } from "@/components/ui/use-toast";

// Default settings for telegram
const defaultTelegramSettings: TelegramSettings = {
  enabled: true,  // Sempre ativado por padrão
  botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || "",
  chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || "",
  sendWins: true,
  sendLosses: true,
  sendResultsAutomatically: true,
  sendSignalAdvance: true
};

export const useTelegramState = () => {
  const [telegramSettings, setTelegramSettings] = useState(defaultTelegramSettings);

  // Inicializar as configurações com os tokens secretos
  useEffect(() => {
    const settings = {
      ...defaultTelegramSettings,
      botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || defaultTelegramSettings.botToken,
      chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || defaultTelegramSettings.chatId
    };
    
    setTelegramSettings(settings);
    telegramService.updateSettings(settings);
    
    // Enviar uma mensagem de teste na inicialização
    console.log("Enviando mensagem de teste ao inicializar...");
    setTimeout(() => {
      handleTestTelegram();
    }, 3000);
  }, []);

  const handleSaveTelegramSettings = (newSettings: TelegramSettings) => {
    setTelegramSettings(newSettings);
    
    if (newSettings.enabled && newSettings.botToken && newSettings.chatId) {
      telegramService.updateSettings(newSettings);
      
      toast({
        title: "Configurações do Telegram Salvas",
        description: "As configurações do Telegram foram atualizadas",
        variant: "default",
      });
    }
  };

  const handleTestTelegram = async () => {
    console.log("Testando conexão com o Telegram...");
    
    try {
      // Garantir que estamos usando as configurações mais recentes
      telegramService.updateSettings(telegramSettings);
      
      const success = await telegramService.sendTestMessage();
      
      if (success) {
        console.log("✅ Teste do Telegram bem-sucedido!");
        toast({
          title: "Teste Bem-Sucedido",
          description: "Mensagem de teste enviada com sucesso para o Telegram",
          variant: "default",
        });
      } else {
        console.error("❌ Falha no teste do Telegram");
        toast({
          title: "Falha no Teste",
          description: "Não foi possível enviar a mensagem de teste. Verifique as configurações.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Erro ao testar conexão Telegram:", error);
      
      toast({
        title: "Erro no Teste",
        description: `Erro ao testar conexão: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    telegramSettings,
    setTelegramSettings: handleSaveTelegramSettings,
    handleTestTelegram
  };
};

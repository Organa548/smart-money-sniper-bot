
import { useState } from "react";
import { TelegramSettings } from "@/utils/telegramService";
import { telegramService } from "@/utils/telegramService";
import { toast } from "@/components/ui/use-toast";

// Default settings for telegram
const defaultTelegramSettings: TelegramSettings = {
  enabled: false,
  botToken: "",
  chatId: "",
  sendWins: true,
  sendLosses: true,
  sendResultsAutomatically: true,
  sendSignalAdvance: true
};

export const useTelegramState = () => {
  const [telegramSettings, setTelegramSettings] = useState(defaultTelegramSettings);

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
    const success = await telegramService.sendTestMessage();
    
    if (success) {
      toast({
        title: "Teste Bem-Sucedido",
        description: "Mensagem de teste enviada com sucesso para o Telegram",
        variant: "default",
      });
    } else {
      toast({
        title: "Falha no Teste",
        description: "Não foi possível enviar a mensagem de teste. Verifique as configurações.",
        variant: "destructive",
      });
    }
  };

  return {
    telegramSettings,
    setTelegramSettings: handleSaveTelegramSettings,
    handleTestTelegram
  };
};

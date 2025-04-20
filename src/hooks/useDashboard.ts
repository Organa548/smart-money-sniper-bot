
import { useState, useEffect } from "react";
import { SignalFilter, TradingStats, TradeSignal, MachineLearningRecommendation } from "@/types/trading";
import { calculateStats, isWithinOperatingHours, downloadCSV } from "@/utils/tradingUtils";
import { TradingSettingsType } from "@/components/TradingSettings";
import { tradingAssets } from "@/utils/tradingUtils";
import { useTradeSignals } from "./useTradeSignals";
import { useDerivConnection } from "./useDerivConnection";
import { toast } from "@/components/ui/use-toast";
import { telegramService, TelegramSettings } from "@/utils/telegramService";
import { mlAnalyzer } from "@/utils/machineLearning";

// Default settings for telegram and trading
const defaultTelegramSettings: TelegramSettings = {
  enabled: false,
  botToken: "",
  chatId: "",
  sendWins: true,
  sendLosses: true,
  sendResultsAutomatically: true,
  sendSignalAdvance: true
};

const defaultTradingSettings: TradingSettingsType = {
  operatingHours: [
    { enabled: true, startHour: 7, endHour: 9 },
    { enabled: true, startHour: 14, endHour: 16 },
    { enabled: true, startHour: 21, endHour: 23 }
  ],
  minScoreForSignal: 4,
  selectedAssets: tradingAssets.map(asset => asset.id),
  autoTrade: false,
  is24HoursMode: false
};

export const useDashboard = () => {
  const [filter, setFilter] = useState<SignalFilter>({});
  const [stats, setStats] = useState<TradingStats>({
    totalSignals: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    byHour: {},
    byAsset: {},
    byLevel: {}
  });
  const [telegramSettings, setTelegramSettings] = useState(defaultTelegramSettings);
  const [tradingSettings, setTradingSettings] = useState(defaultTradingSettings);
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [apiToken, setApiToken] = useState<string>('');
  const [apiId, setApiId] = useState<string>('');
  const [useRealSignals, setUseRealSignals] = useState(false);
  const [mlRecommendation, setMlRecommendation] = useState<MachineLearningRecommendation | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Update Telegram service when settings change
  useEffect(() => {
    telegramService.updateSettings(telegramSettings);
  }, [telegramSettings]);

  // Check if current time is within operating hours or 24-hour mode is enabled
  const operatingNow = tradingSettings.is24HoursMode || isWithinOperatingHours(tradingSettings.operatingHours);

  const { signals, setSignals } = useTradeSignals(
    isActive,
    operatingNow,
    tradingSettings,
    telegramSettings.enabled,
    useRealSignals
  );

  const { isConnected, connectionError } = useDerivConnection(
    apiToken,
    apiId,
    isActive,
    useRealSignals,
    tradingSettings,
    (newSignal) => {
      // Adicionar o novo sinal à lista
      setSignals(prev => [newSignal, ...prev]);
      
      // Se o Telegram estiver habilitado e a opção de envio antecipado também,
      // enviamos o sinal imediatamente
      if (telegramSettings.enabled && telegramSettings.sendSignalAdvance) {
        telegramService.sendSignal(newSignal);
      }
    },
    operatingNow
  );

  // Update statistics when signals change
  useEffect(() => {
    const newStats = calculateStats(signals);
    setStats(newStats);
    
    // Executar análise de ML quando tivermos sinais suficientes
    const recommendation = mlAnalyzer.analyzeSignals(signals);
    if (recommendation) {
      setMlRecommendation(recommendation);
    }
  }, [signals]);

  // Exportar para CSV
  const handleExportCsv = () => {
    downloadCSV(signals);
    toast({
      title: "Exportação Concluída",
      description: `${signals.length} sinais exportados para CSV`,
      variant: "default",
    });
  };

  // Atualizar resultados dos sinais
  const handleUpdateSignalResult = (signalId: string, result: 'WIN' | 'LOSS') => {
    setSignals(prev => prev.map(signal => {
      if (signal.id === signalId) {
        const updatedSignal = { ...signal, result };
        
        // Se o Telegram estiver habilitado e a opção de envio automático de resultados estiver ativa,
        // enviamos o resultado
        if (telegramSettings.enabled && 
            telegramSettings.sendResultsAutomatically && 
            ((result === 'WIN' && telegramSettings.sendWins) || 
             (result === 'LOSS' && telegramSettings.sendLosses))) {
          telegramService.sendResult(updatedSignal);
        }
        
        return updatedSignal;
      }
      return signal;
    }));
    
    toast({
      title: "Resultado Atualizado",
      description: `Sinal marcado como ${result}`,
      variant: result === 'WIN' ? "default" : "destructive",
    });
  };

  const handleToggleActive = () => {
    setIsActive(!isActive);
    
    if (!isActive) {
      toast({
        title: "Bot Ativado",
        description: tradingSettings.is24HoursMode 
          ? "Bot ativado no modo 24 horas" 
          : "Bot ativado nos horários configurados",
        variant: "default",
      });
    } else {
      toast({
        title: "Bot Desativado",
        description: "Todas as operações foram interrompidas",
        variant: "default",
      });
    }
  };

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
    signals,
    filter,
    setFilter,
    stats,
    telegramSettings,
    setTelegramSettings: handleSaveTelegramSettings,
    tradingSettings,
    setTradingSettings,
    isActive,
    currentTime,
    operatingNow,
    handleToggleActive,
    apiToken,
    setApiToken,
    apiId,
    setApiId,
    isConnected,
    useRealSignals,
    setUseRealSignals,
    connectionError,
    handleExportCsv,
    handleUpdateSignalResult,
    handleTestTelegram,
    mlRecommendation
  };
};

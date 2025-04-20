
import { useEffect } from "react";
import { downloadCSV, isWithinOperatingHours } from "@/utils/tradingUtils";
import { toast } from "@/components/ui/use-toast";
import { useTradeSignals } from "./useTradeSignals";
import { useDerivConnection } from "./useDerivConnection";
import { useTelegramState } from "./useTelegramState";
import { useTradingState } from "./useTradingState";
import { useApiState } from "./useApiState";
import { useSignalsState } from "./useSignalsState";
import { telegramService } from "@/utils/telegramService";
import { TradeSignal } from "@/types/trading";

export const useDashboard = () => {
  const {
    telegramSettings,
    setTelegramSettings,
    handleTestTelegram
  } = useTelegramState();

  const {
    tradingSettings,
    setTradingSettings,
    isActive,
    setIsActive,
    useRealSignals,
    setUseRealSignals
  } = useTradingState();

  const {
    apiToken,
    setApiToken,
    apiId,
    setApiId,
    currentTime
  } = useApiState();

  // Check if current time is within operating hours or 24-hour mode is enabled
  const operatingNow = tradingSettings.is24HoursMode || isWithinOperatingHours(tradingSettings.operatingHours);

  const { signals, setSignals } = useTradeSignals(
    isActive,
    operatingNow,
    tradingSettings,
    telegramSettings.enabled,
    useRealSignals
  );

  const { filter, setFilter, stats, mlRecommendation } = useSignalsState(signals);

  // Handler for receiving new signals from Deriv API
  const handleNewSignal = (newSignal: TradeSignal) => {
    console.log("Novo sinal recebido:", newSignal);
    setSignals(prev => [newSignal, ...prev]);
    
    // Enviar para o Telegram se configurado
    if (telegramSettings.enabled && telegramSettings.sendSignalAdvance) {
      console.log("Enviando sinal para o Telegram...");
      telegramService.sendSignal(newSignal);
    }
  };

  const { isConnected, connectionError } = useDerivConnection(
    apiToken,
    apiId,
    isActive,
    useRealSignals,
    tradingSettings,
    handleNewSignal,
    operatingNow
  );

  // Verificador de resultados de sinais
  useEffect(() => {
    const resultCheckInterval = setInterval(() => {
      if (!isActive) return;
      
      signals.forEach(signal => {
        if (signal.result === null) {
          const now = new Date().getTime();
          const signalTime = signal.timestamp;
          const minutesPassed = (now - signalTime) / (1000 * 60);
          
          // Verificar resultado após 5 minutos
          if (minutesPassed >= 5) {
            // Em uma implementação real, verificaríamos o preço atual vs o preço de entrada
            // Para demonstração, geramos um resultado com tendência a acerto (70%)
            const hasWon = Math.random() > 0.3;
            const result = hasWon ? 'WIN' : 'LOSS';
            
            // Atualizar o sinal com o resultado
            setSignals(prev => prev.map(s => {
              if (s.id === signal.id) {
                const updatedSignal = { ...s, result };
                
                // Enviar resultado para o Telegram se configurado
                if (telegramSettings.enabled && telegramSettings.sendResultsAutomatically &&
                   ((result === 'WIN' && telegramSettings.sendWins) || 
                    (result === 'LOSS' && telegramSettings.sendLosses))) {
                  telegramService.sendResult(updatedSignal);
                }
                
                return updatedSignal;
              }
              return s;
            }));
          }
        }
      });
    }, 30000); // Verificar a cada 30 segundos
    
    return () => clearInterval(resultCheckInterval);
  }, [isActive, signals, telegramSettings, setSignals]);

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

  const handleExportCsv = () => {
    downloadCSV(signals);
    toast({
      title: "Exportação Concluída",
      description: `${signals.length} sinais exportados para CSV`,
      variant: "default",
    });
  };

  const handleUpdateSignalResult = (signalId: string, result: 'WIN' | 'LOSS') => {
    setSignals(prev => prev.map(signal => {
      if (signal.id === signalId) {
        const updatedSignal = { ...signal, result };
        
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

  return {
    signals,
    filter,
    setFilter,
    stats,
    telegramSettings,
    setTelegramSettings,
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

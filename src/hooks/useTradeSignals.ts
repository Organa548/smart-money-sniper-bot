
import { useState, useEffect } from "react";
import { TradeSignal } from "@/types/trading";
import { generateMockSignal } from "@/utils/smartMoneyAnalysis";
import { tradingAssets } from "@/utils/tradingUtils";
import { toast } from "@/components/ui/use-toast";
import { TradingSettingsType } from "@/components/TradingSettings";

export const useTradeSignals = (
  isActive: boolean,
  operatingNow: boolean,
  tradingSettings: TradingSettingsType,
  telegramEnabled: boolean,
  useRealSignals: boolean,
) => {
  const [signals, setSignals] = useState<TradeSignal[]>([]);

  // Generate mock signals if not using real signals
  useEffect(() => {
    let signalInterval: number | null = null;
    
    if (isActive && (operatingNow || tradingSettings.is24HoursMode) && !useRealSignals) {
      signalInterval = window.setInterval(() => {
        const enabledAssets = tradingAssets.filter(asset => 
          tradingSettings.selectedAssets.includes(asset.id)
        );
        
        if (enabledAssets.length > 0) {
          const randomAsset = enabledAssets[Math.floor(Math.random() * enabledAssets.length)];
          const newSignal = generateMockSignal(randomAsset);
          
          if (newSignal && newSignal.score >= tradingSettings.minScoreForSignal) {
            setSignals(prev => [newSignal, ...prev]);
            
            if (telegramEnabled) {
              console.log("Sending signal to Telegram:", newSignal);
            }
          }
        }
      }, 60000);
    }
    
    return () => {
      if (signalInterval) {
        clearInterval(signalInterval);
      }
    };
  }, [isActive, operatingNow, tradingSettings, telegramEnabled, useRealSignals]);

  // Verifica resultados dos sinais periódicamente
  useEffect(() => {
    const resultCheckInterval = window.setInterval(() => {
      if (!isActive) return;
      
      // Verifica sinais pendentes que precisam ter resultado atualizado
      const pendingSignals = signals.filter(signal => signal.result === null);
      
      pendingSignals.forEach(signal => {
        // Se o sinal tem mais de 5 minutos, vamos determinar o resultado
        const now = new Date().getTime();
        const signalTime = signal.timestamp;
        const minutesPassed = (now - signalTime) / (1000 * 60);
        
        if (minutesPassed >= 5) {
          // Para mock, geramos resultado aleatório (70% win, 30% loss)
          // Em implementação real, verificaríamos o candle de fechamento
          const result = Math.random() > 0.3 ? 'WIN' as const : 'LOSS' as const;
          
          setSignals(prev => prev.map(s => {
            if (s.id === signal.id) {
              return { ...s, result };
            }
            return s;
          }));
          
          console.log(`Atualizando resultado do sinal ${signal.id} para ${result}`);
        }
      });
    }, 30000); // Verifica a cada 30 segundos
    
    return () => {
      clearInterval(resultCheckInterval);
    };
  }, [isActive, signals]);

  return {
    signals,
    setSignals
  };
};

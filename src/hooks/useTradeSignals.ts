
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

  return {
    signals,
    setSignals
  };
};

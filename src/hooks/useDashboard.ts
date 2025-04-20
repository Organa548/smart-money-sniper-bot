
import { useState, useEffect } from "react";
import { TradeSignal, SignalFilter, TradingStats } from "@/types/trading";
import { calculateStats, isWithinOperatingHours } from "@/utils/tradingUtils";
import { TradingSettingsType } from "@/components/TradingSettings";
import { generateMockSignal } from "@/utils/smartMoneyAnalysis";
import { tradingAssets } from "@/utils/tradingUtils";

// Default settings for telegram
const defaultTelegramSettings = {
  enabled: false,
  botToken: "",
  chatId: "",
  sendWins: true,
  sendLosses: true
};

// Default settings for trading
const defaultTradingSettings: TradingSettingsType = {
  operatingHours: [
    { enabled: true, startHour: 7, endHour: 9 },
    { enabled: true, startHour: 14, endHour: 16 },
    { enabled: true, startHour: 21, endHour: 23 }
  ],
  minScoreForSignal: 4,
  selectedAssets: tradingAssets.map(asset => asset.id),
  autoTrade: false
};

export const useDashboard = () => {
  const [signals, setSignals] = useState<TradeSignal[]>([]);
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

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Check if current time is within operating hours
  const operatingNow = isWithinOperatingHours();

  // Generate signals
  useEffect(() => {
    if (isActive && operatingNow) {
      const signalInterval = setInterval(() => {
        const enabledAssets = tradingAssets.filter(asset => 
          tradingSettings.selectedAssets.includes(asset.id)
        );
        
        if (enabledAssets.length > 0) {
          const randomAsset = enabledAssets[Math.floor(Math.random() * enabledAssets.length)];
          const newSignal = generateMockSignal(randomAsset);
          
          if (newSignal && newSignal.score >= tradingSettings.minScoreForSignal) {
            setSignals(prev => [newSignal, ...prev]);
            
            if (telegramSettings.enabled) {
              console.log("Sending signal to Telegram:", newSignal);
            }
          }
        }
      }, 60000);
      
      return () => clearInterval(signalInterval);
    }
  }, [isActive, operatingNow, tradingSettings, telegramSettings]);

  // Update statistics when signals change
  useEffect(() => {
    const newStats = calculateStats(signals);
    setStats(newStats);
  }, [signals]);

  const handleToggleActive = () => {
    setIsActive(!isActive);
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
    handleToggleActive
  };
};


import { useState, useEffect } from "react";
import { TradeSignal, SignalFilter, TradingStats } from "@/types/trading";
import { calculateStats, isWithinOperatingHours } from "@/utils/tradingUtils";
import { TradingSettingsType } from "@/components/TradingSettings";
import { generateMockSignal } from "@/utils/smartMoneyAnalysis";
import { tradingAssets } from "@/utils/tradingUtils";
import { derivAPI } from "@/utils/derivAPI";
import { toast } from "@/components/ui/use-toast";

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
  autoTrade: false,
  is24HoursMode: false
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
  const [apiToken, setApiToken] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [useRealSignals, setUseRealSignals] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Check if current time is within operating hours or 24-hour mode is enabled
  const operatingNow = tradingSettings.is24HoursMode || isWithinOperatingHours(tradingSettings.operatingHours);

  // Set up Deriv signal callback
  useEffect(() => {
    derivAPI.setSignalCallback((newSignal: TradeSignal) => {
      if (isActive && operatingNow) {
        setSignals(prev => [newSignal, ...prev]);
        
        if (telegramSettings.enabled) {
          console.log("Sending signal to Telegram:", newSignal);
        }
        
        toast({
          title: "Novo Sinal",
          description: `${newSignal.asset.symbol} ${newSignal.direction} - Score: ${newSignal.score}`,
          variant: "default",
        });
      }
    });
    
    return () => {
      // Clean up
      derivAPI.setSignalCallback(() => {});
    };
  }, [isActive, operatingNow, telegramSettings]);

  // Connect/disconnect from Deriv API based on token and active state
  useEffect(() => {
    const connect = async () => {
      if (apiToken && isActive && useRealSignals) {
        derivAPI.authenticate(apiToken);
        const connected = await derivAPI.connect();
        setIsConnected(connected);
        
        if (connected) {
          // Subscribe to selected assets
          derivAPI.updateSubscriptions(tradingSettings.selectedAssets);
        }
      } else if (!isActive || !useRealSignals) {
        derivAPI.disconnect();
        setIsConnected(false);
      }
    };
    
    connect();
    
    return () => {
      derivAPI.disconnect();
    };
  }, [apiToken, isActive, useRealSignals, tradingSettings.selectedAssets]);

  // Update subscriptions when selected assets change
  useEffect(() => {
    if (isActive && useRealSignals && isConnected) {
      derivAPI.updateSubscriptions(tradingSettings.selectedAssets);
    }
  }, [tradingSettings.selectedAssets, isActive, useRealSignals, isConnected]);

  // Generate mock signals if not using real signals
  useEffect(() => {
    let signalInterval: number | null = null;
    
    if (isActive && operatingNow && !useRealSignals) {
      signalInterval = window.setInterval(() => {
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
    }
    
    return () => {
      if (signalInterval) {
        clearInterval(signalInterval);
      }
    };
  }, [isActive, operatingNow, tradingSettings, telegramSettings, useRealSignals]);

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
    handleToggleActive,
    apiToken,
    setApiToken,
    isConnected,
    useRealSignals,
    setUseRealSignals
  };
};

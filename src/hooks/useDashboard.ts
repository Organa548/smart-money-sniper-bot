
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
  const [connectionError, setConnectionError] = useState<string | null>(null);

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
      if (isActive && (operatingNow || tradingSettings.is24HoursMode)) {
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
  }, [isActive, operatingNow, telegramSettings, tradingSettings.is24HoursMode]);

  // Connect/disconnect from Deriv API based on token and active state
  useEffect(() => {
    const connect = async () => {
      setConnectionError(null);
      
      if (apiToken && isActive && useRealSignals) {
        try {
          console.log("Tentando conectar à API Deriv...");
          derivAPI.authenticate(apiToken);
          const connected = await derivAPI.connect();
          
          if (connected) {
            console.log("Conexão bem-sucedida com a API Deriv");
            setIsConnected(true);
            // Subscribe to selected assets
            derivAPI.updateSubscriptions(tradingSettings.selectedAssets);
            
            toast({
              title: "API Deriv",
              description: "Conectado com sucesso à API Deriv",
              variant: "default",
            });
          } else {
            console.error("Falha ao conectar à API Deriv");
            setIsConnected(false);
            setConnectionError("Falha ao estabelecer conexão com a API");
            
            toast({
              title: "Erro de Conexão",
              description: "Não foi possível conectar à API Deriv. Verifique o token.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Erro ao conectar à API Deriv:", error);
          setIsConnected(false);
          setConnectionError(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          
          toast({
            title: "Erro de Conexão",
            description: "Ocorreu um erro ao conectar à API Deriv",
            variant: "destructive",
          });
        }
      } else if (!apiToken && useRealSignals) {
        setConnectionError("Token API não fornecido");
        setIsConnected(false);
      } else if (!isActive || !useRealSignals) {
        derivAPI.disconnect();
        setIsConnected(false);
        setConnectionError(null);
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
      try {
        derivAPI.updateSubscriptions(tradingSettings.selectedAssets);
      } catch (error) {
        console.error("Erro ao atualizar subscrições:", error);
        toast({
          title: "Erro",
          description: "Falha ao atualizar ativos na API Deriv",
          variant: "destructive",
        });
      }
    }
  }, [tradingSettings.selectedAssets, isActive, useRealSignals, isConnected]);

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
  }, [isActive, operatingNow, tradingSettings, telegramSettings, useRealSignals, tradingSettings.is24HoursMode]);

  // Update statistics when signals change
  useEffect(() => {
    const newStats = calculateStats(signals);
    setStats(newStats);
  }, [signals]);

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
    setUseRealSignals,
    connectionError
  };
};


import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import SignalsList from "@/components/SignalsList";
import SignalFilter from "@/components/SignalFilter";
import Statistics from "@/components/Statistics";
import TelegramConfig from "@/components/TelegramConfig";
import TradingSettings from "@/components/TradingSettings";
import { TradeSignal, SignalFilter as SignalFilterType, TradingStats } from "@/types/trading";
import { calculateStats, tradingAssets, downloadCSV, isWithinOperatingHours } from "@/utils/tradingUtils";
import { TradingSettingsType } from "@/components/TradingSettings";
import { generateMockSignal } from "@/utils/smartMoneyAnalysis";

// Default settings
const defaultTelegramSettings = {
  enabled: false,
  botToken: "",
  chatId: "",
  sendWins: true,
  sendLosses: true
};

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

const Dashboard: React.FC = () => {
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [filter, setFilter] = useState<SignalFilterType>({});
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

  // Generate signals (For demo purposes - would be replaced with real signal generation)
  useEffect(() => {
    if (isActive && operatingNow) {
      // Generate a signal every minute for demonstration
      const signalInterval = setInterval(() => {
        // Select a random asset from enabled assets
        const enabledAssets = tradingAssets.filter(asset => 
          tradingSettings.selectedAssets.includes(asset.id)
        );
        
        if (enabledAssets.length > 0) {
          const randomAsset = enabledAssets[Math.floor(Math.random() * enabledAssets.length)];
          const newSignal = generateMockSignal(randomAsset);
          
          if (newSignal && newSignal.score >= tradingSettings.minScoreForSignal) {
            setSignals(prev => [newSignal, ...prev]);
            
            // If Telegram is enabled, "send" the signal (demo only)
            if (telegramSettings.enabled) {
              console.log("Sending signal to Telegram:", newSignal);
              // In a real implementation, this would call a function to send to Telegram
            }
          }
        }
      }, 60000); // Every minute
      
      return () => clearInterval(signalInterval);
    }
  }, [isActive, operatingNow, tradingSettings, telegramSettings]);

  // Update statistics when signals change
  useEffect(() => {
    const newStats = calculateStats(signals);
    setStats(newStats);
  }, [signals]);

  // Handle toggle bot activation
  const handleToggleActive = () => {
    setIsActive(!isActive);
  };

  // Handle export of signals to CSV
  const handleExportCSV = () => {
    downloadCSV(signals);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Smart Money Sniper Bot</h1>
          <p className="text-trading-neutral">
            {operatingNow 
              ? "Horário operacional - Sistema pronto para gerar sinais" 
              : "Fora do horário operacional - Sistema em espera"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <div className="text-sm text-trading-neutral">Horário Atual (Brasília)</div>
            <div className="text-xl font-mono">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
          
          <Button
            onClick={handleToggleActive}
            className={isActive ? "bg-trading-loss hover:bg-trading-loss/80" : "bg-trading-win hover:bg-trading-win/80"}
          >
            {isActive ? "Parar Bot" : "Iniciar Bot"}
          </Button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <h2 className="text-xl font-bold">Sinais</h2>
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              className="bg-trading-card hover:bg-trading-card/80 border-trading-neutral"
              disabled={signals.length === 0}
            >
              Exportar CSV
            </Button>
          </div>
          
          <SignalFilter onFilterChange={setFilter} currentFilter={filter} />
          
          <SignalsList 
            signals={signals} 
            filter={filter} 
            title={`Sinais ${filter.level ? `Nível ${filter.level}` : ''} ${filter.asset ? `- ${filter.asset}` : ''}`} 
          />
        </div>
        
        <div className="space-y-6">
          <Statistics stats={stats} />
          
          <div className="bg-trading-card p-4 rounded-lg border border-trading-neutral/20">
            <h3 className="font-bold mb-2">Status do Bot</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-trading-neutral">Status:</span>
                <span className={isActive ? 'text-trading-win' : 'text-trading-loss'}>
                  {isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-trading-neutral">Horário operacional:</span>
                <span className={operatingNow ? 'text-trading-win' : 'text-trading-loss'}>
                  {operatingNow ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-trading-neutral">Sinais hoje:</span>
                <span>{signals.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString()).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-trading-neutral">Telegram:</span>
                <span className={telegramSettings.enabled ? 'text-trading-win' : 'text-trading-loss'}>
                  {telegramSettings.enabled ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-trading-card">
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-4">
          <TradingSettings 
            onSave={setTradingSettings}
            currentSettings={tradingSettings}
          />
        </TabsContent>
        
        <TabsContent value="telegram" className="mt-4">
          <TelegramConfig 
            onSave={setTelegramSettings}
            currentSettings={telegramSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

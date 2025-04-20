
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Statistics from "@/components/Statistics";
import TelegramConfig from "@/components/TelegramConfig";
import TradingSettings from "@/components/TradingSettings";
import DashboardHeader from "./dashboard/DashboardHeader";
import SignalsSection from "./dashboard/SignalsSection";
import StatusPanel from "./dashboard/StatusPanel";
import { useDashboard } from "@/hooks/useDashboard";

const Dashboard: React.FC = () => {
  const {
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
    connectionError
  } = useDashboard();

  const todaySignalsCount = signals.filter(
    s => new Date(s.timestamp).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <DashboardHeader
        isActive={isActive}
        operatingNow={operatingNow}
        currentTime={currentTime}
        onToggleActive={handleToggleActive}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <SignalsSection
            signals={signals}
            filter={filter}
            onFilterChange={setFilter}
            apiToken={apiToken}
            setApiToken={setApiToken}
            apiId={apiId}
            setApiId={setApiId}
            useRealSignals={useRealSignals}
            setUseRealSignals={setUseRealSignals}
            isConnected={isConnected}
            connectionError={connectionError}
          />
        </div>
        
        <div className="space-y-6">
          <Statistics stats={stats} />
          <StatusPanel
            isActive={isActive}
            operatingNow={operatingNow}
            telegramEnabled={telegramSettings.enabled}
            todaySignalsCount={todaySignalsCount}
            isConnected={isConnected} 
            useRealSignals={useRealSignals}
            is24HoursMode={tradingSettings.is24HoursMode}
            connectionError={connectionError}
          />
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

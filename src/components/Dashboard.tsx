
import React from "react";
import Statistics from "@/components/Statistics";
import TradingSettings from "@/components/TradingSettings";
import DashboardHeader from "./dashboard/DashboardHeader";
import SignalsSection from "./dashboard/SignalsSection";
import StatusPanel from "./dashboard/StatusPanel";
import MLRecommendation from "./MLRecommendation";
import { useDashboard } from "@/hooks/useDashboard";
import { TradingSettingsType } from "@/components/TradingSettings";

const Dashboard: React.FC = () => {
  const {
    signals,
    filter,
    setFilter,
    stats,
    tradingSettings,
    setTradingSettings,
    isActive,
    currentTime,
    operatingNow,
    handleToggleActive,
    isConnected,
    connectionError,
    handleExportCsv,
    handleUpdateSignalResult,
    mlRecommendation
  } = useDashboard();

  const todaySignalsCount = signals.filter(
    s => new Date(s.timestamp).toDateString() === new Date().toDateString()
  ).length;

  // Helper function to handle ML recommendation application
  const handleApplyRecommendation = (recommendation: Partial<TradingSettingsType>) => {
    setTradingSettings({
      ...tradingSettings,
      ...recommendation
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <DashboardHeader
        isActive={isActive}
        operatingNow={operatingNow}
        currentTime={currentTime}
        onToggleActive={handleToggleActive}
        connectedToAPI={isConnected}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <SignalsSection
            signals={signals}
            filter={filter}
            onFilterChange={setFilter}
            isConnected={isConnected}
            connectionError={connectionError}
            onExportCsv={handleExportCsv}
            onUpdateSignalResult={handleUpdateSignalResult}
          />
        </div>
        
        <div className="space-y-6">
          <Statistics stats={stats} />
          <StatusPanel
            isActive={isActive}
            operatingNow={operatingNow}
            telegramEnabled={true}
            todaySignalsCount={todaySignalsCount}
            isConnected={isConnected}
            is24HoursMode={tradingSettings.is24HoursMode}
            connectionError={connectionError}
          />
          {mlRecommendation && (
            <MLRecommendation 
              recommendation={mlRecommendation} 
              onApplyRecommendation={handleApplyRecommendation}
            />
          )}
        </div>
      </div>
      
      <TradingSettings 
        onSave={setTradingSettings}
        currentSettings={tradingSettings}
      />
    </div>
  );
};

export default Dashboard;

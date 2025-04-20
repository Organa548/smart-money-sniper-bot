
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import OperatingHours from "./settings/OperatingHours";
import SignalSettings from "./settings/SignalSettings";
import AssetSettings from "./settings/AssetSettings";
import AutoTradeToggle from "./settings/AutoTradeToggle";
import { useTradingSettings } from "@/hooks/useTradingSettings";

export interface TradingSettingsType {
  operatingHours: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  }[];
  minScoreForSignal: number;
  selectedAssets: string[];
  autoTrade: boolean;
}

interface TradingSettingsProps {
  onSave: (settings: TradingSettingsType) => void;
  currentSettings: TradingSettingsType;
}

const TradingSettings: React.FC<TradingSettingsProps> = ({ onSave, currentSettings }) => {
  const {
    settings,
    handleOperatingHoursChange,
    handleMinScoreChange,
    handleAssetToggle,
    handleAutoTradeToggle,
    handleSave
  } = useTradingSettings({ onSave, currentSettings });

  return (
    <Card className="w-full bg-trading-background border-trading-card">
      <CardHeader className="px-4 py-3 border-b border-trading-card">
        <CardTitle className="text-lg">Configurações de Operação</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <OperatingHours 
          operatingHours={settings.operatingHours}
          onOperatingHoursChange={handleOperatingHoursChange}
        />

        <Separator />

        <SignalSettings 
          minScore={settings.minScoreForSignal}
          onMinScoreChange={handleMinScoreChange}
        />

        <Separator />

        <AssetSettings 
          selectedAssets={settings.selectedAssets}
          onAssetToggle={handleAssetToggle}
        />

        <Separator />

        <AutoTradeToggle 
          enabled={settings.autoTrade}
          onToggle={handleAutoTradeToggle}
        />
      </CardContent>
      <CardFooter className="px-4 py-3 flex justify-end border-t border-trading-card">
        <Button 
          onClick={handleSave}
          className="bg-trading-highlight hover:bg-trading-highlight/80"
        >
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TradingSettings;

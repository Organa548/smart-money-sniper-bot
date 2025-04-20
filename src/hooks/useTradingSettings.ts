
import { useState } from "react";
import { TradingSettingsType } from "@/components/TradingSettings";

interface UseTradingSettingsProps {
  onSave: (settings: TradingSettingsType) => void;
  currentSettings: TradingSettingsType;
}

export const useTradingSettings = ({ onSave, currentSettings }: UseTradingSettingsProps) => {
  const [settings, setSettings] = useState<TradingSettingsType>(currentSettings);

  const handleOperatingHoursChange = (index: number, field: keyof typeof settings.operatingHours[0], value: any) => {
    const updatedHours = [...settings.operatingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value
    };
    
    setSettings({
      ...settings,
      operatingHours: updatedHours
    });
  };

  const handleMinScoreChange = (value: string) => {
    setSettings({
      ...settings,
      minScoreForSignal: parseInt(value)
    });
  };

  const handleAssetToggle = (assetId: string) => {
    const updatedAssets = settings.selectedAssets.includes(assetId)
      ? settings.selectedAssets.filter(id => id !== assetId)
      : [...settings.selectedAssets, assetId];
    
    setSettings({
      ...settings,
      selectedAssets: updatedAssets
    });
  };

  const handleAutoTradeToggle = (checked: boolean) => {
    setSettings({
      ...settings,
      autoTrade: checked
    });
  };

  const handleSave = () => {
    onSave(settings);
  };

  return {
    settings,
    handleOperatingHoursChange,
    handleMinScoreChange,
    handleAssetToggle,
    handleAutoTradeToggle,
    handleSave
  };
};

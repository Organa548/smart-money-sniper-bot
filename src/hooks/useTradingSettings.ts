
import { useState } from "react";
import { TradingSettingsType } from "@/components/TradingSettings";

interface UseTradingSettingsProps {
  onSave: (settings: TradingSettingsType) => void;
  currentSettings: TradingSettingsType;
}

export const useTradingSettings = ({ onSave, currentSettings }: UseTradingSettingsProps) => {
  const [settings, setSettings] = useState<TradingSettingsType>({
    ...currentSettings,
    is24HoursMode: currentSettings.is24HoursMode || false
  });

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

  const handleToggle24Hours = (checked: boolean) => {
    setSettings({
      ...settings,
      is24HoursMode: checked
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
    handleToggle24Hours,
    handleSave
  };
};


import { useState } from "react";
import { TradingSettingsType } from "@/components/TradingSettings";
import { tradingAssets } from "@/utils/tradingUtils";

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
  is24HoursMode: true // Ativando modo 24 horas por padrão
};

export const useTradingState = () => {
  const [tradingSettings, setTradingSettings] = useState(defaultTradingSettings);
  const [isActive, setIsActive] = useState(false);
  const [useRealSignals, setUseRealSignals] = useState(true); // Ativando sinais reais por padrão

  return {
    tradingSettings,
    setTradingSettings,
    isActive,
    setIsActive,
    useRealSignals,
    setUseRealSignals
  };
};

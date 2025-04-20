
import { useState, useEffect } from "react";
import { SignalFilter, TradingStats, MachineLearningRecommendation } from "@/types/trading";
import { calculateStats } from "@/utils/tradingUtils";
import { mlAnalyzer } from "@/utils/machineLearning";

export const useSignalsState = (signals: any[]) => {
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
  const [mlRecommendation, setMlRecommendation] = useState<MachineLearningRecommendation | null>(null);

  // Update statistics when signals change
  useEffect(() => {
    const newStats = calculateStats(signals);
    setStats(newStats);
    
    // Run ML analysis when we have enough signals
    const recommendation = mlAnalyzer.analyzeSignals(signals);
    if (recommendation) {
      setMlRecommendation(recommendation);
    }
  }, [signals]);

  return {
    filter,
    setFilter,
    stats,
    mlRecommendation
  };
};

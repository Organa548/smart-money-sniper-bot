
import { useState, useEffect } from "react";
import { SignalFilter, TradingStats, MachineLearningRecommendation } from "@/types/trading";
import { calculateStats } from "@/utils/tradingUtils";
import { mlAnalyzer } from "@/utils/machineLearning";
import { toast } from "@/components/ui/use-toast";

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
    
    // Run ML analysis when we have enough signals (mínimo 200 sinais)
    if (signals.length >= 200) {
      const recommendation = mlAnalyzer.analyzeSignals(signals);
      if (recommendation) {
        setMlRecommendation(recommendation);
        
        // Notify user once when we have a new recommendation
        if (!mlRecommendation) {
          toast({
            title: "Recomendação de IA Disponível",
            description: "Nossa inteligência artificial analisou seus dados e tem sugestões para melhorar seus resultados.",
            variant: "default",
          });
        }
      }
    } else {
      console.info(`Análise ML não disponível: ${signals.length}/200 sinais necessários`);
    }
  }, [signals, mlRecommendation]);

  return {
    filter,
    setFilter,
    stats,
    mlRecommendation
  };
};

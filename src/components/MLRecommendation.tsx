
import React from "react";
import { MachineLearningRecommendation } from "@/types/trading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { tradingAssets } from "@/utils/tradingUtils";
import { TradingSettingsType } from "@/components/TradingSettings";

interface MLRecommendationProps {
  recommendation: MachineLearningRecommendation | null;
  onApplyRecommendation: (settings: Partial<TradingSettingsType>) => void;
}

const MLRecommendation: React.FC<MLRecommendationProps> = ({ 
  recommendation, 
  onApplyRecommendation 
}) => {
  if (!recommendation) {
    return (
      <Card className="w-full bg-trading-background border-trading-card">
        <CardHeader className="px-4 py-3 border-b border-trading-card">
          <CardTitle className="text-lg">Recomendações de Aprendizado</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-4 text-trading-neutral">
            Análise ainda não disponível. São necessários pelo menos 200 sinais com resultados para gerar recomendações.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleApplyTimeRanges = () => {
    // Convertemos as recomendações de horário para o formato das configurações
    const operatingHours = recommendation.bestTimeRanges.map(range => ({
      enabled: true,
      startHour: range.startHour,
      endHour: range.endHour
    }));
    
    onApplyRecommendation({ operatingHours });
  };

  const handleApplyAssets = () => {
    // Extraímos apenas os IDs dos ativos recomendados
    const selectedAssets = recommendation.bestAssets.map(asset => asset.assetId);
    
    onApplyRecommendation({ selectedAssets });
  };

  const handleApplyScore = () => {
    onApplyRecommendation({ minScoreForSignal: recommendation.recommendedMinScore });
  };

  const handleApplyAll = () => {
    const operatingHours = recommendation.bestTimeRanges.map(range => ({
      enabled: true,
      startHour: range.startHour,
      endHour: range.endHour
    }));
    
    const selectedAssets = recommendation.bestAssets.map(asset => asset.assetId);
    
    onApplyRecommendation({
      operatingHours,
      selectedAssets,
      minScoreForSignal: recommendation.recommendedMinScore
    });
  };

  // Função para obter o nome do ativo a partir do ID
  const getAssetName = (assetId: string): string => {
    const asset = tradingAssets.find(a => a.id === assetId);
    return asset ? asset.name : assetId;
  };

  return (
    <Card className="w-full bg-trading-background border-trading-card">
      <CardHeader className="px-4 py-3 border-b border-trading-card">
        <CardTitle className="text-lg">Recomendações de ML</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Melhores Horários</h3>
          <div className="space-y-2">
            {recommendation.bestTimeRanges.map((range, index) => (
              <div key={index} className="flex justify-between items-center bg-trading-card p-2 rounded">
                <span>
                  {range.startHour}:00 - {range.endHour}:00
                </span>
                <span className="text-trading-win">
                  {range.winRate.toFixed(1)}% Win Rate
                </span>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleApplyTimeRanges} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Aplicar Horários
          </Button>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Melhores Ativos</h3>
          <div className="space-y-2">
            {recommendation.bestAssets.map((asset, index) => (
              <div key={index} className="flex justify-between items-center bg-trading-card p-2 rounded">
                <span>
                  {getAssetName(asset.assetId)}
                </span>
                <span className="text-trading-win">
                  {asset.winRate.toFixed(1)}% Win Rate
                </span>
              </div>
            ))}
          </div>
          <Button 
            onClick={handleApplyAssets} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Aplicar Ativos
          </Button>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Score Mínimo Recomendado</h3>
          <div className="bg-trading-card p-3 rounded flex justify-between items-center">
            <span>Usar apenas sinais com score ≥ {recommendation.recommendedMinScore}</span>
            <Button 
              onClick={handleApplyScore} 
              variant="outline" 
              size="sm"
            >
              Aplicar
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={handleApplyAll} 
          className="w-full bg-trading-highlight hover:bg-trading-highlight/80"
        >
          Aplicar Todas as Recomendações
        </Button>
        
        <p className="text-sm text-trading-neutral mt-4">
          Estas recomendações são baseadas na análise de seu histórico de sinais usando aprendizado de máquina.
        </p>
      </CardContent>
    </Card>
  );
};

export default MLRecommendation;

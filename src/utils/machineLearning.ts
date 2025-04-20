
import { TradeSignal, MachineLearningRecommendation } from "@/types/trading";

export class MLAnalyzer {
  private MIN_SIGNALS_FOR_ANALYSIS = 200;
  
  public analyzeSignals(signals: TradeSignal[]): MachineLearningRecommendation | null {
    // Verificar se temos dados suficientes para análise
    if (signals.length < this.MIN_SIGNALS_FOR_ANALYSIS) {
      console.log(`Análise ML não disponível: ${signals.length}/${this.MIN_SIGNALS_FOR_ANALYSIS} sinais necessários`);
      return null;
    }
    
    console.log(`Executando análise de ML com ${signals.length} sinais...`);
    
    // Filtrar apenas sinais com resultados definidos
    const signalsWithResults = signals.filter(signal => signal.result !== null);
    
    if (signalsWithResults.length < this.MIN_SIGNALS_FOR_ANALYSIS * 0.8) {
      console.log(`Insuficientes sinais com resultados: ${signalsWithResults.length}/${this.MIN_SIGNALS_FOR_ANALYSIS * 0.8} necessários`);
      return null;
    }
    
    // Analisar por hora
    const hourlyPerformance = this.analyzeByHour(signalsWithResults);
    
    // Analisar por ativo
    const assetPerformance = this.analyzeByAsset(signalsWithResults);
    
    // Analisar por Score
    const scoreAnalysis = this.analyzeByScore(signalsWithResults);
    
    // Gerar recomendações
    const recommendation: MachineLearningRecommendation = {
      bestTimeRanges: this.getBestTimeRanges(hourlyPerformance),
      bestAssets: this.getBestAssets(assetPerformance),
      recommendedMinScore: scoreAnalysis
    };
    
    return recommendation;
  }
  
  private analyzeByHour(signals: TradeSignal[]): Map<number, { total: number, wins: number, winRate: number }> {
    const hourlyStats = new Map<number, { total: number, wins: number, winRate: number }>();
    
    // Inicializar mapa com todas as horas
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats.set(hour, { total: 0, wins: 0, winRate: 0 });
    }
    
    // Contar resultados por hora
    signals.forEach(signal => {
      const hour = new Date(signal.timestamp).getHours();
      const stats = hourlyStats.get(hour)!;
      
      stats.total++;
      if (signal.result === 'WIN') {
        stats.wins++;
      }
      stats.winRate = (stats.wins / stats.total) * 100;
      
      hourlyStats.set(hour, stats);
    });
    
    return hourlyStats;
  }
  
  private analyzeByAsset(signals: TradeSignal[]): Map<string, { total: number, wins: number, winRate: number }> {
    const assetStats = new Map<string, { total: number, wins: number, winRate: number }>();
    
    // Agrupar por asset id
    signals.forEach(signal => {
      const assetId = signal.asset.id;
      
      if (!assetStats.has(assetId)) {
        assetStats.set(assetId, { total: 0, wins: 0, winRate: 0 });
      }
      
      const stats = assetStats.get(assetId)!;
      stats.total++;
      
      if (signal.result === 'WIN') {
        stats.wins++;
      }
      
      stats.winRate = (stats.wins / stats.total) * 100;
      assetStats.set(assetId, stats);
    });
    
    return assetStats;
  }
  
  private analyzeByScore(signals: TradeSignal[]): number {
    // Analisar desempenho por score
    const scoreStats = new Map<number, { total: number, wins: number, winRate: number }>();
    
    // Inicializar scores de 4 a 6
    for (let score = 4; score <= 6; score++) {
      scoreStats.set(score, { total: 0, wins: 0, winRate: 0 });
    }
    
    // Contar resultados por score
    signals.forEach(signal => {
      const score = signal.score;
      
      if (score >= 4 && score <= 6) {
        const stats = scoreStats.get(score)!;
        
        stats.total++;
        if (signal.result === 'WIN') {
          stats.wins++;
        }
        
        stats.winRate = (stats.wins / stats.total) * 100;
        scoreStats.set(score, stats);
      }
    });
    
    // Encontrar o score com melhor desempenho (taxa de acerto)
    let bestScore = 4;
    let bestWinRate = 0;
    
    scoreStats.forEach((stats, score) => {
      // Só consideramos se tiver pelo menos 10 sinais para este score
      if (stats.total >= 10 && stats.winRate > bestWinRate) {
        bestWinRate = stats.winRate;
        bestScore = score;
      }
    });
    
    return bestScore;
  }
  
  private getBestTimeRanges(hourlyStats: Map<number, { total: number, wins: number, winRate: number }>): 
    { startHour: number, endHour: number, winRate: number }[] {
    const bestTimeRanges: { startHour: number, endHour: number, winRate: number }[] = [];
    
    // Algoritmo para encontrar horários contíguos com bom desempenho
    let currentStart = -1;
    let currentEnd = -1;
    let currentWinRate = 0;
    let inRange = false;
    
    // Definimos um limiar para considerar um horário bom
    const THRESHOLD_WIN_RATE = 60; // 60% de taxa de acerto
    const MIN_SIGNALS = 5; // Mínimo de sinais para considerar significativo
    
    for (let hour = 0; hour < 24; hour++) {
      const stats = hourlyStats.get(hour)!;
      
      if (stats.total >= MIN_SIGNALS && stats.winRate >= THRESHOLD_WIN_RATE) {
        if (!inRange) {
          // Iniciando novo intervalo
          currentStart = hour;
          inRange = true;
        }
        currentEnd = hour;
        currentWinRate = stats.winRate;
      } else if (inRange) {
        // Terminando intervalo atual
        bestTimeRanges.push({
          startHour: currentStart,
          endHour: currentEnd + 1, // + 1 pois o fim é exclusivo (ex: 9-12 significa 9, 10, 11)
          winRate: currentWinRate
        });
        
        inRange = false;
      }
    }
    
    // Verificar se temos um intervalo no final do dia
    if (inRange) {
      bestTimeRanges.push({
        startHour: currentStart,
        endHour: currentEnd + 1, 
        winRate: currentWinRate
      });
    }
    
    // Ordenar por taxa de acerto (decrescente)
    bestTimeRanges.sort((a, b) => b.winRate - a.winRate);
    
    // Retornar no máximo 3 melhores intervalos
    return bestTimeRanges.slice(0, 3);
  }
  
  private getBestAssets(assetStats: Map<string, { total: number, wins: number, winRate: number }>): 
    { assetId: string, winRate: number }[] {
    const assets: { assetId: string, winRate: number }[] = [];
    
    assetStats.forEach((stats, assetId) => {
      // Só considerar ativos com pelo menos 10 sinais
      if (stats.total >= 10) {
        assets.push({
          assetId,
          winRate: stats.winRate
        });
      }
    });
    
    // Ordenar por taxa de acerto (decrescente)
    assets.sort((a, b) => b.winRate - a.winRate);
    
    // Retornar no máximo 5 melhores ativos
    return assets.slice(0, 5);
  }
}

export const mlAnalyzer = new MLAnalyzer();

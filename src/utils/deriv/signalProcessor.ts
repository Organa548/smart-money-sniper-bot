import { Asset, TradeSignal, CandleData } from "@/types/trading";
import { getSignalLevel } from "@/utils/tradingUtils";
import { analyzeSmartMoney } from "@/utils/smartMoneyAnalysis";

export class SignalProcessor {
  private onSignalCallback: ((signal: TradeSignal) => void) | null = null;
  private candles: Map<string, CandleData[]> = new Map();
  private lastProcessedCandle: Map<string, number> = new Map();
  private indicators: Map<string, any> = new Map();
  private testSignalSent: boolean = false;
  
  constructor() {
    this.initializeIndicators();
    
    // Enviar um sinal de teste após 10 segundos
    setTimeout(() => {
      this.generateTestSignal();
    }, 10000);
  }

  // Método para criar um sinal de teste imediato
  private generateTestSignal(): void {
    if (this.testSignalSent || !this.onSignalCallback) return;
    
    console.log("Gerando sinal de teste para verificação...");
    
    // Encontrar o primeiro ativo disponível
    const assetSymbol = "R_100"; // Um ativo comum da Deriv
    const asset: Asset = {
      id: "R_100",
      name: "Volatility 100 Index",
      symbol: "R_100",
      icon: "📊"
    };
    
    const now = new Date();
    const signal: TradeSignal = {
      id: "test-" + Date.now().toString(),
      asset,
      direction: "CALL",
      timestamp: now.getTime(),
      score: 5,
      level: "A",
      reasons: [
        "TESTE: Sinal gerado para verificação",
        "Conexão de API funcionando",
        "EMA Pullback",
        "RSI 30 (Oversold)",
        "Reversal Candle"
      ],
      entryTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      result: null
    };
    
    console.log("Enviando sinal de teste para callback:", signal);
    this.onSignalCallback(signal);
    this.testSignalSent = true;
    
    // Marcar o resultado após 15 segundos
    setTimeout(() => {
      if (this.onSignalCallback) {
        const resultSignal = {...signal, result: "WIN"};
        this.onSignalCallback(resultSignal);
      }
    }, 15000);
  }

  public setSignalCallback(callback: (signal: TradeSignal) => void): void {
    this.onSignalCallback = callback;
    
    // Se definirmos um novo callback e ainda não enviamos o sinal de teste, envie-o agora
    if (!this.testSignalSent) {
      this.generateTestSignal();
    }
  }

  private initializeIndicators(): void {
    // Inicializa indicadores vazios para cada ativo
    // Serão preenchidos conforme os candles chegarem
  }

  public processTick(tick: any, asset: Asset | undefined): void {
    if (!asset) {
      console.warn(`Ativo não encontrado para o símbolo: ${tick.symbol}`);
      return;
    }

    // Atualiza o candle atual com o tick
    this.updateCurrentCandle(asset.id, tick);
    
    // A cada minuto exato (ou a cada X segundos dependendo do timeframe),
    // processa o candle fechado e gera sinal se necessário
    const now = new Date();
    const secondsInMinute = now.getSeconds();
    
    // Se estamos nos últimos 15 segundos do minuto, analisamos para avisar com antecedência
    // Ou se estamos no primeiro segundo do novo minuto para garantir que analisamos candle fechado
    if ((secondsInMinute >= 45 && secondsInMinute <= 59) || secondsInMinute === 0) {
      const lastProcessed = this.lastProcessedCandle.get(asset.id) || 0;
      const currentMinute = now.getMinutes();
      
      // Evitar processar o mesmo candle múltiplas vezes no mesmo minuto
      if (lastProcessed !== currentMinute) {
        this.processCandle(asset);
        this.lastProcessedCandle.set(asset.id, currentMinute);
      }
    }
  }

  private updateCurrentCandle(assetId: string, tick: any): void {
    if (!this.candles.has(assetId)) {
      this.candles.set(assetId, []);
    }
    
    const candles = this.candles.get(assetId)!;
    const now = new Date();
    const currentMinuteStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      0,
      0
    ).getTime();
    
    // Se não temos um candle para o minuto atual, criamos um novo
    let currentCandle = candles.find(c => c.timestamp === currentMinuteStart);
    
    if (!currentCandle) {
      currentCandle = {
        timestamp: currentMinuteStart,
        open: tick.quote,
        high: tick.quote,
        low: tick.quote,
        close: tick.quote
      };
      
      // Adicionar o novo candle, mantendo apenas os últimos 100 candles
      candles.push(currentCandle);
      if (candles.length > 100) {
        candles.shift();
      }
    } else {
      // Atualiza o candle atual
      currentCandle.high = Math.max(currentCandle.high, tick.quote);
      currentCandle.low = Math.min(currentCandle.low, tick.quote);
      currentCandle.close = tick.quote;
    }
    
    // Atualiza a lista de candles
    this.candles.set(assetId, candles);
    
    // Atualizar indicadores técnicos
    this.updateIndicators(assetId);
  }

  private updateIndicators(assetId: string): void {
    // Implementação simplificada
    const candles = this.candles.get(assetId) || [];
    
    if (candles.length < 21) return; // Precisamos de pelo menos 21 candles para calcular EMA21
    
    // Cálculos básicos de indicadores (EMA, RSI, etc)
    const closes = candles.map(c => c.close);
    
    // EMA 21
    const ema21 = this.calculateEMA(closes, 21);
    
    // EMA 50
    const ema50 = candles.length >= 50 ? this.calculateEMA(closes, 50) : [];
    
    // RSI 14
    const rsi = this.calculateRSI(closes, 14);
    
    // Armazena os indicadores
    this.indicators.set(assetId, {
      ema21,
      ema50,
      rsi
    });
  }

  private calculateEMA(prices: number[], period: number): number[] {
    // Implementação simplificada do EMA
    if (prices.length < period) return [];
    
    const k = 2 / (period + 1);
    const emaValues: number[] = [];
    
    // Inicializa com SMA
    let sma = 0;
    for (let i = 0; i < period; i++) {
      sma += prices[i];
    }
    sma /= period;
    
    emaValues.push(sma);
    
    // Calcula EMA para o restante dos preços
    for (let i = period; i < prices.length; i++) {
      const ema = prices[i] * k + emaValues[emaValues.length - 1] * (1 - k);
      emaValues.push(ema);
    }
    
    return emaValues;
  }

  private calculateRSI(prices: number[], period: number): number[] {
    // Implementação simplificada do RSI
    if (prices.length <= period) return [];
    
    const rsiValues: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calcula ganhos e perdas
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
      
      if (i >= period) {
        // Calcula média de ganhos e perdas para o período
        let avgGain = 0;
        let avgLoss = 0;
        
        for (let j = i - period; j < i; j++) {
          avgGain += gains[j];
          avgLoss += losses[j];
        }
        
        avgGain /= period;
        avgLoss /= period;
        
        if (avgLoss === 0) {
          rsiValues.push(100);
        } else {
          const rs = avgGain / avgLoss;
          rsiValues.push(100 - (100 / (1 + rs)));
        }
      }
    }
    
    return rsiValues;
  }

  private processCandle(asset: Asset): void {
    if (!this.onSignalCallback) return;
    
    const candles = this.candles.get(asset.id) || [];
    if (candles.length < 50) return; // Precisamos de um número mínimo de candles para análise
    
    const technicalIndicators = this.indicators.get(asset.id) || {
      ema21: [],
      ema50: [],
      rsi: []
    };
    
    // Realizar análise técnica com confluências
    const analysis = analyzeSmartMoney(candles, technicalIndicators, asset);
    
    // Se o score for igual ou maior que 4, gerar um sinal
    if (analysis.score >= 4 && analysis.direction) {
      const direction = analysis.direction;
      const score = analysis.score;
      const level = getSignalLevel(score);
      
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Verificar se já temos um sinal recente para o mesmo ativo e direção
      // para evitar duplicação de sinais
      if (level) {
        const signal: TradeSignal = {
          id: Date.now().toString(),
          asset,
          direction,
          timestamp: now.getTime(),
          score,
          level,
          reasons: analysis.reasons,
          entryTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          result: null
        };
        
        console.log(`Gerando sinal real para ${asset.symbol}: ${direction} com score ${score} (Nível ${level})`);
        this.onSignalCallback(signal);
      }
    }
  }
}

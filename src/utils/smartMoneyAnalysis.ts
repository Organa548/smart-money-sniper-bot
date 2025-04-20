
import { TradeDirection, TradeSignal, Asset } from "@/types/trading";
import { getSignalLevel } from "./tradingUtils";

type CandleData = {
  timestamp: number;
  open: number;
  high: number;
  close: number;
  low: number;
};

type TechnicalIndicators = {
  ema21: number[];
  ema50: number[];
  rsi: number[];
};

// Mock data - In a real implementation, these would come from an API
const mockCandles: CandleData[] = [];
const mockIndicators: TechnicalIndicators = {
  ema21: [],
  ema50: [],
  rsi: []
};

// Smart Money Concepts (SMC) Analysis
export const analyzeSmartMoney = (
  candles: CandleData[],
  indicators: TechnicalIndicators,
  asset: Asset
): { score: number; reasons: string[]; direction: TradeDirection | null } => {
  // Initialize variables
  let score = 0;
  const reasons: string[] = [];
  let direction: TradeDirection | null = null;
  
  // Need at least 50 candles for proper analysis
  if (candles.length < 50) {
    return { score: 0, reasons: ["Insufficient data"], direction: null };
  }
  
  // Get latest candle and previous candles
  const currentCandle = candles[candles.length - 1];
  const previousCandle = candles[candles.length - 2];
  const thirdLastCandle = candles[candles.length - 3];
  
  // Current price
  const currentPrice = currentCandle.close;
  
  // 1. Check for Break of Structure (BOS)
  const hasUpwardBOS = checkUpwardBOS(candles);
  const hasDownwardBOS = checkDownwardBOS(candles);
  
  if (hasUpwardBOS) {
    score++;
    reasons.push("BOS (Up)");
    direction = "CALL";
  } else if (hasDownwardBOS) {
    score++;
    reasons.push("BOS (Down)");
    direction = "PUT";
  }
  
  // 2. Check for Change of Character (CHoCH)
  const hasUpwardCHoCH = checkUpwardCHoCH(candles);
  const hasDownwardCHoCH = checkDownwardCHoCH(candles);
  
  if (hasUpwardCHoCH) {
    score++;
    reasons.push("CHoCH (Up)");
    if (!direction) direction = "CALL";
  } else if (hasDownwardCHoCH) {
    score++;
    reasons.push("CHoCH (Down)");
    if (!direction) direction = "PUT";
  }
  
  // 3. Check for Order Blocks (OB)
  const hasUpwardOB = checkUpwardOB(candles);
  const hasDownwardOB = checkDownwardOB(candles);
  
  if (hasUpwardOB) {
    score++;
    reasons.push("OB (Up)");
    if (!direction) direction = "CALL";
  } else if (hasDownwardOB) {
    score++;
    reasons.push("OB (Down)");
    if (!direction) direction = "PUT";
  }
  
  // 4. Check for Fair Value Gaps (FVG)
  const hasUpwardFVG = checkUpwardFVG(candles);
  const hasDownwardFVG = checkDownwardFVG(candles);
  
  if (hasUpwardFVG) {
    score++;
    reasons.push("FVG (Up)");
    if (!direction) direction = "CALL";
  } else if (hasDownwardFVG) {
    score++;
    reasons.push("FVG (Down)");
    if (!direction) direction = "PUT";
  }
  
  // 5. Check for Liquidity Zones
  const isAtLiquidityZone = checkLiquidityZone(candles);
  if (isAtLiquidityZone) {
    score++;
    reasons.push("Liquidity Zone");
  }
  
  // 6. Check for Pullback with Confluence
  const hasEMAPullback = checkEMAPullback(candles, indicators);
  if (hasEMAPullback) {
    score++;
    reasons.push("EMA Pullback");
  }
  
  // 7. Check for RSI conditions
  const currentRSI = indicators.rsi[indicators.rsi.length - 1];
  
  if (currentRSI >= 35 && currentRSI <= 65) {
    score++;
    reasons.push(`RSI ${Math.round(currentRSI)}`);
  } else if (currentRSI > 65) {
    if (direction === "PUT") {
      score++;
      reasons.push(`RSI ${Math.round(currentRSI)} (Overbought)`);
    }
  } else if (currentRSI < 35) {
    if (direction === "CALL") {
      score++;
      reasons.push(`RSI ${Math.round(currentRSI)} (Oversold)`);
    }
  }
  
  // 8. Check for Strong Reversal Candles
  const hasReversalCandle = checkReversalCandle(candles);
  if (hasReversalCandle) {
    score++;
    reasons.push("Reversal Candle");
  }
  
  // 9. Check Support/Resistance with False Breakouts
  const hasFalseBreakout = checkFalseBreakout(candles);
  if (hasFalseBreakout) {
    score++;
    reasons.push("False Breakout");
  }
  
  // Make sure score doesn't exceed 6
  score = Math.min(score, 6);
  
  // Check if opposite signals exist, which could create confusion
  if (hasUpwardBOS && hasDownwardBOS || hasUpwardCHoCH && hasDownwardCHoCH) {
    score -= 1;
    reasons.push("Conflicting Signals");
  }
  
  // Only return a direction if score is high enough
  if (score < 4) {
    direction = null;
  }
  
  return { score, reasons, direction };
};

// Check for an upward Break of Structure
function checkUpwardBOS(candles: CandleData[]): boolean {
  // Simplified implementation - in a real system this would be more sophisticated
  const relevantCandles = candles.slice(-10);
  let lowestLow = Infinity;
  let lowestLowIndex = -1;
  
  // Find lowest low in recent candles
  for (let i = 0; i < relevantCandles.length - 3; i++) {
    if (relevantCandles[i].low < lowestLow) {
      lowestLow = relevantCandles[i].low;
      lowestLowIndex = i;
    }
  }
  
  // Check if we've broken above a recent swing high after making a low
  if (lowestLowIndex >= 0) {
    let highestHigh = -Infinity;
    let highestHighIndex = -1;
    
    // Find highest high before the lowest low
    for (let i = 0; i < lowestLowIndex; i++) {
      if (relevantCandles[i].high > highestHigh) {
        highestHigh = relevantCandles[i].high;
        highestHighIndex = i;
      }
    }
    
    // Check if recent price broke above the highest high
    if (highestHighIndex >= 0) {
      const recentCandles = relevantCandles.slice(-3);
      return recentCandles.some(candle => candle.close > highestHigh);
    }
  }
  
  return false;
}

// Check for a downward Break of Structure
function checkDownwardBOS(candles: CandleData[]): boolean {
  // Simplified implementation
  const relevantCandles = candles.slice(-10);
  let highestHigh = -Infinity;
  let highestHighIndex = -1;
  
  // Find highest high in recent candles
  for (let i = 0; i < relevantCandles.length - 3; i++) {
    if (relevantCandles[i].high > highestHigh) {
      highestHigh = relevantCandles[i].high;
      highestHighIndex = i;
    }
  }
  
  // Check if we've broken below a recent swing low after making a high
  if (highestHighIndex >= 0) {
    let lowestLow = Infinity;
    let lowestLowIndex = -1;
    
    // Find lowest low before the highest high
    for (let i = 0; i < highestHighIndex; i++) {
      if (relevantCandles[i].low < lowestLow) {
        lowestLow = relevantCandles[i].low;
        lowestLowIndex = i;
      }
    }
    
    // Check if recent price broke below the lowest low
    if (lowestLowIndex >= 0) {
      const recentCandles = relevantCandles.slice(-3);
      return recentCandles.some(candle => candle.close < lowestLow);
    }
  }
  
  return false;
}

// Check for an upward Change of Character
function checkUpwardCHoCH(candles: CandleData[]): boolean {
  // Simplified implementation
  const relevantCandles = candles.slice(-20);
  
  // Find pattern of lower lows followed by higher lows
  let hasLowerLows = false;
  let hasHigherLow = false;
  
  // Check for lower lows
  for (let i = 3; i < relevantCandles.length - 3; i++) {
    if (relevantCandles[i].low < relevantCandles[i-3].low) {
      hasLowerLows = true;
      
      // Now check if later we made a higher low
      for (let j = i + 3; j < relevantCandles.length; j++) {
        if (relevantCandles[j].low > relevantCandles[i].low) {
          hasHigherLow = true;
          break;
        }
      }
      
      if (hasHigherLow) break;
    }
  }
  
  return hasLowerLows && hasHigherLow;
}

// Check for a downward Change of Character
function checkDownwardCHoCH(candles: CandleData[]): boolean {
  // Simplified implementation
  const relevantCandles = candles.slice(-20);
  
  // Find pattern of higher highs followed by lower highs
  let hasHigherHighs = false;
  let hasLowerHigh = false;
  
  // Check for higher highs
  for (let i = 3; i < relevantCandles.length - 3; i++) {
    if (relevantCandles[i].high > relevantCandles[i-3].high) {
      hasHigherHighs = true;
      
      // Now check if later we made a lower high
      for (let j = i + 3; j < relevantCandles.length; j++) {
        if (relevantCandles[j].high < relevantCandles[i].high) {
          hasLowerHigh = true;
          break;
        }
      }
      
      if (hasLowerHigh) break;
    }
  }
  
  return hasHigherHighs && hasLowerHigh;
}

// Check for upward Order Block
function checkUpwardOB(candles: CandleData[]): boolean {
  // Simplified implementation
  const relevantCandles = candles.slice(-15);
  
  // Look for a bullish candle followed by strong move up
  for (let i = 0; i < relevantCandles.length - 5; i++) {
    const candle = relevantCandles[i];
    const isBullish = candle.close > candle.open;
    
    if (isBullish) {
      // Check if subsequent candles moved significantly higher
      const nextCandles = relevantCandles.slice(i + 1, i + 6);
      const highestClose = Math.max(...nextCandles.map(c => c.close));
      
      if (highestClose > candle.close * 1.005) { // More than 0.5% higher
        // Check if recent price returned to this zone
        const recentCandles = relevantCandles.slice(-3);
        return recentCandles.some(c => c.low <= candle.high && c.high >= candle.low);
      }
    }
  }
  
  return false;
}

// Check for downward Order Block
function checkDownwardOB(candles: CandleData[]): boolean {
  // Simplified implementation
  const relevantCandles = candles.slice(-15);
  
  // Look for a bearish candle followed by strong move down
  for (let i = 0; i < relevantCandles.length - 5; i++) {
    const candle = relevantCandles[i];
    const isBearish = candle.close < candle.open;
    
    if (isBearish) {
      // Check if subsequent candles moved significantly lower
      const nextCandles = relevantCandles.slice(i + 1, i + 6);
      const lowestClose = Math.min(...nextCandles.map(c => c.close));
      
      if (lowestClose < candle.close * 0.995) { // More than 0.5% lower
        // Check if recent price returned to this zone
        const recentCandles = relevantCandles.slice(-3);
        return recentCandles.some(c => c.low <= candle.high && c.high >= candle.low);
      }
    }
  }
  
  return false;
}

// Check for upward Fair Value Gap
function checkUpwardFVG(candles: CandleData[]): boolean {
  // Simplified implementation
  const relevantCandles = candles.slice(-10);
  
  // Look for a gap between candles
  for (let i = 1; i < relevantCandles.length - 1; i++) {
    const prevCandle = relevantCandles[i - 1];
    const currCandle = relevantCandles[i];
    
    // Check for a gap up
    if (currCandle.low > prevCandle.high) {
      // Check if price recently returned to fill this gap
      const recentCandles = relevantCandles.slice(-3);
      return recentCandles.some(c => c.low <= prevCandle.high);
    }
  }
  
  return false;
}

// Check for downward Fair Value Gap
function checkDownwardFVG(candles: CandleData[]): boolean {
  // Simplified implementation
  const relevantCandles = candles.slice(-10);
  
  // Look for a gap between candles
  for (let i = 1; i < relevantCandles.length - 1; i++) {
    const prevCandle = relevantCandles[i - 1];
    const currCandle = relevantCandles[i];
    
    // Check for a gap down
    if (currCandle.high < prevCandle.low) {
      // Check if price recently returned to fill this gap
      const recentCandles = relevantCandles.slice(-3);
      return recentCandles.some(c => c.high >= prevCandle.low);
    }
  }
  
  return false;
}

// Check for Liquidity Zone
function checkLiquidityZone(candles: CandleData[]): boolean {
  // Simplified implementation
  const relevantCandles = candles.slice(-30);
  
  // Look for clusters of swing highs or swing lows
  const swingHighs: number[] = [];
  const swingLows: number[] = [];
  
  // Identify swing points
  for (let i = 2; i < relevantCandles.length - 2; i++) {
    const curr = relevantCandles[i];
    const prev = relevantCandles[i - 1];
    const prevPrev = relevantCandles[i - 2];
    const next = relevantCandles[i + 1];
    const nextNext = relevantCandles[i + 2];
    
    // Swing high
    if (curr.high > prev.high && curr.high > next.high && curr.high > prevPrev.high && curr.high > nextNext.high) {
      swingHighs.push(curr.high);
    }
    
    // Swing low
    if (curr.low < prev.low && curr.low < next.low && curr.low < prevPrev.low && curr.low < nextNext.low) {
      swingLows.push(curr.low);
    }
  }
  
  // Check if current price is near a cluster of swing points
  const currentPrice = relevantCandles[relevantCandles.length - 1].close;
  
  // Check if price is near swing highs
  for (const high of swingHighs) {
    if (Math.abs(currentPrice - high) / high < 0.005) { // Within 0.5%
      return true;
    }
  }
  
  // Check if price is near swing lows
  for (const low of swingLows) {
    if (Math.abs(currentPrice - low) / low < 0.005) { // Within 0.5%
      return true;
    }
  }
  
  return false;
}

// Check for EMA Pullback
function checkEMAPullback(candles: CandleData[], indicators: TechnicalIndicators): boolean {
  // Simplified implementation
  if (indicators.ema21.length < 5 || indicators.ema50.length < 5) {
    return false;
  }
  
  const currentCandle = candles[candles.length - 1];
  const currentEMA21 = indicators.ema21[indicators.ema21.length - 1];
  const currentEMA50 = indicators.ema50[indicators.ema50.length - 1];
  
  // Check if price is near one of the EMAs
  const isNearEMA21 = Math.abs(currentCandle.close - currentEMA21) / currentEMA21 < 0.002; // Within 0.2%
  const isNearEMA50 = Math.abs(currentCandle.close - currentEMA50) / currentEMA50 < 0.002; // Within 0.2%
  
  return isNearEMA21 || isNearEMA50;
}

// Check for Reversal Candle
function checkReversalCandle(candles: CandleData[]): boolean {
  // Simplified implementation
  if (candles.length < 3) {
    return false;
  }
  
  const currentCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  
  // Check for bullish engulfing
  const isBullishEngulfing = currentCandle.close > currentCandle.open && 
                            prevCandle.close < prevCandle.open &&
                            currentCandle.close > prevCandle.open &&
                            currentCandle.open < prevCandle.close;
  
  // Check for bearish engulfing
  const isBearishEngulfing = currentCandle.close < currentCandle.open && 
                            prevCandle.close > prevCandle.open &&
                            currentCandle.close < prevCandle.open &&
                            currentCandle.open > prevCandle.close;
  
  // Check for bullish pinbar (hammer)
  const isBullishPinbar = currentCandle.close > currentCandle.open &&
                         (currentCandle.high - currentCandle.close) < 0.2 * (currentCandle.high - currentCandle.low) &&
                         (currentCandle.open - currentCandle.low) > 0.5 * (currentCandle.high - currentCandle.low);
  
  // Check for bearish pinbar (shooting star)
  const isBearishPinbar = currentCandle.close < currentCandle.open &&
                         (currentCandle.close - currentCandle.low) < 0.2 * (currentCandle.high - currentCandle.low) &&
                         (currentCandle.high - currentCandle.open) > 0.5 * (currentCandle.high - currentCandle.low);
  
  // Check for Marubozu (strong trend candle)
  const isBullishMarubozu = currentCandle.close > currentCandle.open &&
                           (currentCandle.high - currentCandle.close) < 0.1 * (currentCandle.high - currentCandle.low) &&
                           (currentCandle.open - currentCandle.low) < 0.1 * (currentCandle.high - currentCandle.low);
  
  const isBearishMarubozu = currentCandle.close < currentCandle.open &&
                           (currentCandle.close - currentCandle.low) < 0.1 * (currentCandle.high - currentCandle.low) &&
                           (currentCandle.high - currentCandle.open) < 0.1 * (currentCandle.high - currentCandle.low);
  
  return isBullishEngulfing || isBearishEngulfing || isBullishPinbar || isBearishPinbar || 
         isBullishMarubozu || isBearishMarubozu;
}

// Check for False Breakout
function checkFalseBreakout(candles: CandleData[]): boolean {
  // Simplified implementation
  if (candles.length < 20) {
    return false;
  }
  
  const relevantCandles = candles.slice(-20);
  
  // Find significant swing points
  const swingHighs: number[] = [];
  const swingLows: number[] = [];
  
  // Identify swing points (simplified)
  for (let i = 2; i < relevantCandles.length - 5; i++) {
    const curr = relevantCandles[i];
    const prev = relevantCandles[i - 1];
    const prevPrev = relevantCandles[i - 2];
    const next = relevantCandles[i + 1];
    const nextNext = relevantCandles[i + 2];
    
    // Swing high
    if (curr.high > prev.high && curr.high > next.high && curr.high > prevPrev.high && curr.high > nextNext.high) {
      swingHighs.push(curr.high);
    }
    
    // Swing low
    if (curr.low < prev.low && curr.low < next.low && curr.low < prevPrev.low && curr.low < nextNext.low) {
      swingLows.push(curr.low);
    }
  }
  
  // Check if recent price broke above resistance then reversed
  for (const highLevel of swingHighs) {
    // Look for a candle that broke above the level
    for (let i = relevantCandles.length - 5; i < relevantCandles.length - 1; i++) {
      if (relevantCandles[i].high > highLevel && relevantCandles[i-1].high < highLevel) {
        // Check if the next candle closed back below the level
        if (relevantCandles[i+1].close < highLevel) {
          return true;
        }
      }
    }
  }
  
  // Check if recent price broke below support then reversed
  for (const lowLevel of swingLows) {
    // Look for a candle that broke below the level
    for (let i = relevantCandles.length - 5; i < relevantCandles.length - 1; i++) {
      if (relevantCandles[i].low < lowLevel && relevantCandles[i-1].low > lowLevel) {
        // Check if the next candle closed back above the level
        if (relevantCandles[i+1].close > lowLevel) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Generate a mock trading signal for testing
export const generateMockSignal = (asset: Asset): TradeSignal | null => {
  // This function is just for UI demonstration - in a real app, signals would come from actual analysis
  const now = new Date();
  const score = Math.floor(Math.random() * 3) + 4; // Random score between 4-6
  const level = getSignalLevel(score) || 'C';
  
  // 70% chance for CALL, 30% for PUT
  const direction: TradeDirection = Math.random() > 0.3 ? 'CALL' : 'PUT';
  
  // Generate random reasons
  const allReasons = [
    'BOS', 'CHoCH', 'OB', 'FVG', 'Liquidity Zone', 
    'EMA Pullback', 'RSI 40', 'Reversal Candle', 'False Breakout'
  ];
  
  // Randomly select some reasons based on the score
  const reasons: string[] = [];
  const shuffledReasons = [...allReasons].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < score; i++) {
    if (shuffledReasons[i]) {
      reasons.push(shuffledReasons[i]);
    }
  }
  
  // 70% chance of WIN, 30% chance of LOSS for mock data
  const result = Math.random() > 0.3 ? 'WIN' : 'LOSS';
  
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  return {
    id: Date.now().toString(),
    asset,
    direction,
    timestamp: now.getTime(),
    score,
    level,
    reasons,
    result,
    entryTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  };
};

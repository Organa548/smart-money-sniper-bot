
import { Asset, TradeSignal } from "@/types/trading";
import { getSignalLevel } from "@/utils/tradingUtils";

export class SignalProcessor {
  constructor(private onSignalCallback: ((signal: TradeSignal) => void) | null = null) {}

  public setSignalCallback(callback: (signal: TradeSignal) => void): void {
    this.onSignalCallback = callback;
  }

  public processTick(tick: any, asset: Asset | undefined): void {
    if (!asset) {
      console.warn(`Ativo não encontrado para o símbolo: ${tick.symbol}`);
      return;
    }

    if (Math.random() < 0.03 && this.onSignalCallback) {
      const direction = Math.random() > 0.5 ? 'CALL' : 'PUT';
      const score = Math.floor(Math.random() * 3) + 4;
      const level = getSignalLevel(score) || 'C';
      
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      const reasons = ['Sinal API Deriv', `Preço: ${tick.quote}`, 'Tendência de alta'];
      
      const signal: TradeSignal = {
        id: Date.now().toString(),
        asset,
        direction,
        timestamp: now.getTime(),
        score,
        level,
        reasons,
        entryTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      };
      
      console.log(`Gerando sinal para ${asset.symbol}: ${direction} com score ${score}`);
      this.onSignalCallback(signal);
    }
  }
}

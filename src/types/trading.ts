
export type TradeDirection = 'CALL' | 'PUT';

export type Asset = {
  id: string;
  name: string;
  symbol: string;
  type: 'forex' | 'crypto' | 'indices' | 'synthetic';
};

export type TradeSignal = {
  id: string;
  asset: Asset;
  direction: TradeDirection;
  timestamp: number;
  score: number;
  level: 'A' | 'B' | 'C';
  reasons: string[];
  result?: 'WIN' | 'LOSS' | null;
  entryTime: string;
};

export type SignalFilter = {
  asset?: string;
  level?: 'A' | 'B' | 'C';
  startDate?: Date;
  endDate?: Date;
  result?: 'WIN' | 'LOSS' | null;
};

export type OperatingHours = {
  start: number;
  end: number;
};

export type TradingStats = {
  totalSignals: number;
  wins: number;
  losses: number;
  winRate: number;
  byHour: Record<number, { signals: number; wins: number; winRate: number }>;
  byAsset: Record<string, { signals: number; wins: number; winRate: number }>;
  byLevel: Record<string, { signals: number; wins: number; winRate: number }>;
};

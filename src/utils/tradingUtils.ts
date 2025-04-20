
import { TradeSignal, TradingStats, Asset, OperatingHours } from "@/types/trading";

// Available trading assets
export const tradingAssets: Asset[] = [
  { id: "R_10", name: "Volatility 10 Index", symbol: "R_10", type: "synthetic" },
  { id: "R_25", name: "Volatility 25 Index", symbol: "R_25", type: "synthetic" },
  { id: "R_50", name: "Volatility 50 Index", symbol: "R_50", type: "synthetic" },
  { id: "R_75", name: "Volatility 75 Index", symbol: "R_75", type: "synthetic" },
  { id: "R_100", name: "Volatility 100 Index", symbol: "R_100", type: "synthetic" },
  { id: "BOOM1000", name: "Boom 1000 Index", symbol: "BOOM1000", type: "synthetic" },
  { id: "CRASH1000", name: "Crash 1000 Index", symbol: "CRASH1000", type: "synthetic" },
];

// Operating hours in Brasilia time (UTC-3)
export const operatingHours: OperatingHours[] = [
  { start: 7, end: 9 },   // 07:00 - 09:00
  { start: 14, end: 16 }, // 14:00 - 16:00
  { start: 21, end: 23 }, // 21:00 - 23:00
];

// Check if current time is within operating hours
export const isWithinOperatingHours = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  
  return operatingHours.some(period => 
    currentHour >= period.start && currentHour < period.end
  );
};

// Calculate signal level based on score
export const getSignalLevel = (score: number): 'A' | 'B' | 'C' | null => {
  if (score >= 6) return 'A';
  if (score === 5) return 'B';
  if (score === 4) return 'C';
  return null; // Score too low to generate signal
};

// Format timestamp to display time (HH:MM)
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
};

// Format date (YYYY-MM-DD)
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR');
};

// Calculate trading statistics
export const calculateStats = (signals: TradeSignal[]): TradingStats => {
  const wins = signals.filter(s => s.result === 'WIN').length;
  const totalWithResults = signals.filter(s => s.result).length;
  
  // Initialize statistics object
  const stats: TradingStats = {
    totalSignals: signals.length,
    wins,
    losses: totalWithResults - wins,
    winRate: totalWithResults ? (wins / totalWithResults) * 100 : 0,
    byHour: {},
    byAsset: {},
    byLevel: {}
  };

  // Group by hour
  signals.forEach(signal => {
    const hour = new Date(signal.timestamp).getHours();
    
    // Initialize hour stats if needed
    if (!stats.byHour[hour]) {
      stats.byHour[hour] = { signals: 0, wins: 0, winRate: 0 };
    }
    
    const hourStats = stats.byHour[hour];
    hourStats.signals++;
    
    if (signal.result === 'WIN') {
      hourStats.wins++;
    }
    
    if (hourStats.signals > 0) {
      hourStats.winRate = (hourStats.wins / hourStats.signals) * 100;
    }
  });

  // Group by asset
  signals.forEach(signal => {
    const assetId = signal.asset.id;
    
    // Initialize asset stats if needed
    if (!stats.byAsset[assetId]) {
      stats.byAsset[assetId] = { signals: 0, wins: 0, winRate: 0 };
    }
    
    const assetStats = stats.byAsset[assetId];
    assetStats.signals++;
    
    if (signal.result === 'WIN') {
      assetStats.wins++;
    }
    
    if (assetStats.signals > 0) {
      assetStats.winRate = (assetStats.wins / assetStats.signals) * 100;
    }
  });

  // Group by level
  signals.forEach(signal => {
    const level = signal.level;
    
    // Initialize level stats if needed
    if (!stats.byLevel[level]) {
      stats.byLevel[level] = { signals: 0, wins: 0, winRate: 0 };
    }
    
    const levelStats = stats.byLevel[level];
    levelStats.signals++;
    
    if (signal.result === 'WIN') {
      levelStats.wins++;
    }
    
    if (levelStats.signals > 0) {
      levelStats.winRate = (levelStats.wins / levelStats.signals) * 100;
    }
  });

  return stats;
};

// Export signals to CSV
export const exportToCSV = (signals: TradeSignal[]): string => {
  const headers = ['ID', 'Asset', 'Direction', 'Date', 'Time', 'Score', 'Level', 'Reasons', 'Result'];
  
  const rows = signals.map(signal => [
    signal.id,
    signal.asset.symbol,
    signal.direction,
    formatDate(signal.timestamp),
    formatTime(signal.timestamp),
    signal.score.toString(),
    signal.level,
    signal.reasons.join(', '),
    signal.result || 'PENDING'
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// Generate download link for CSV
export const downloadCSV = (signals: TradeSignal[]): void => {
  const csvContent = exportToCSV(signals);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `smart-money-signals-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

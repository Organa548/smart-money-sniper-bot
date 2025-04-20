
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingStats } from "@/types/trading";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StatisticsProps {
  stats: TradingStats;
}

const Statistics: React.FC<StatisticsProps> = ({ stats }) => {
  return (
    <Card className="w-full bg-trading-background border-trading-card">
      <CardHeader className="px-4 py-3 border-b border-trading-card">
        <CardTitle className="text-lg">Estatísticas</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Sinais Totais" 
            value={stats.totalSignals} 
            iconClass="bg-trading-neutral/10 text-trading-neutral"
          />
          <StatCard 
            title="Ganhos" 
            value={stats.wins} 
            iconClass="bg-trading-win/10 text-trading-win"
          />
          <StatCard 
            title="Perdas" 
            value={stats.losses} 
            iconClass="bg-trading-loss/10 text-trading-loss"
          />
          <StatCard 
            title="Taxa de Acerto" 
            value={`${stats.winRate.toFixed(1)}%`} 
            iconClass="bg-trading-highlight/10 text-trading-highlight"
          />
        </div>

        <Tabs defaultValue="hour" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-trading-card">
            <TabsTrigger value="hour">Por Hora</TabsTrigger>
            <TabsTrigger value="asset">Por Ativo</TabsTrigger>
            <TabsTrigger value="level">Por Nível</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hour" className="mt-4">
            <div className="space-y-4">
              {Object.entries(stats.byHour).map(([hour, hourStats]) => (
                <HourStatRow 
                  key={hour} 
                  hour={parseInt(hour)} 
                  signals={hourStats.signals} 
                  winRate={hourStats.winRate} 
                />
              ))}
              {Object.keys(stats.byHour).length === 0 && (
                <div className="text-center py-4 text-trading-neutral">
                  Sem dados suficientes para estatísticas por hora.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="asset" className="mt-4">
            <div className="space-y-4">
              {Object.entries(stats.byAsset).map(([assetId, assetStats]) => (
                <StatRow 
                  key={assetId} 
                  label={assetId} 
                  signals={assetStats.signals} 
                  winRate={assetStats.winRate} 
                />
              ))}
              {Object.keys(stats.byAsset).length === 0 && (
                <div className="text-center py-4 text-trading-neutral">
                  Sem dados suficientes para estatísticas por ativo.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="level" className="mt-4">
            <div className="space-y-4">
              {Object.entries(stats.byLevel).map(([level, levelStats]) => (
                <StatRow 
                  key={level} 
                  label={`Nível ${level}`} 
                  signals={levelStats.signals} 
                  winRate={levelStats.winRate} 
                  isLevel={true}
                  level={level as 'A' | 'B' | 'C'}
                />
              ))}
              {Object.keys(stats.byLevel).length === 0 && (
                <div className="text-center py-4 text-trading-neutral">
                  Sem dados suficientes para estatísticas por nível.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  iconClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, iconClass }) => {
  return (
    <div className="bg-trading-card rounded-lg p-4 flex flex-col">
      <div className="text-trading-neutral text-sm mb-2">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

interface StatRowProps {
  label: string;
  signals: number;
  winRate: number;
  isLevel?: boolean;
  level?: 'A' | 'B' | 'C';
}

const StatRow: React.FC<StatRowProps> = ({ label, signals, winRate, isLevel = false, level }) => {
  let labelClass = "";
  
  if (isLevel && level) {
    switch (level) {
      case 'A':
        labelClass = "text-trading-win";
        break;
      case 'B':
        labelClass = "text-trading-highlight";
        break;
      case 'C':
        labelClass = "text-trading-neutral";
        break;
    }
  }
  
  let progressColor = "bg-trading-neutral";
  if (winRate >= 60) progressColor = "bg-trading-win";
  else if (winRate >= 50) progressColor = "bg-trading-highlight";
  else if (winRate > 0) progressColor = "bg-trading-loss";
  
  return (
    <div className="bg-trading-card rounded-lg p-3">
      <div className="flex justify-between mb-2">
        <span className={`font-medium ${labelClass}`}>{label}</span>
        <span className="text-sm text-trading-neutral">{signals} sinais</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress 
          value={winRate} 
          className="h-2 bg-trading-background"
        >
          <div className={`h-full ${progressColor} transition-all`} 
               style={{ transform: `translateX(-${100 - winRate}%)` }} />
        </Progress>
        <span className="text-sm font-medium">{winRate.toFixed(1)}%</span>
      </div>
    </div>
  );
};

interface HourStatRowProps {
  hour: number;
  signals: number;
  winRate: number;
}

const HourStatRow: React.FC<HourStatRowProps> = ({ hour, signals, winRate }) => {
  // Format the hour as a time range (e.g., "07:00 - 08:00")
  const formattedHour = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
  
  let progressColor = "bg-trading-neutral";
  if (winRate >= 60) progressColor = "bg-trading-win";
  else if (winRate >= 50) progressColor = "bg-trading-highlight";
  else if (winRate > 0) progressColor = "bg-trading-loss";
  
  return (
    <div className="bg-trading-card rounded-lg p-3">
      <div className="flex justify-between mb-2">
        <span className="font-medium">{formattedHour}</span>
        <span className="text-sm text-trading-neutral">{signals} sinais</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress 
          value={winRate} 
          className="h-2 bg-trading-background"
        >
          <div className={`h-full ${progressColor} transition-all`} 
               style={{ transform: `translateX(-${100 - winRate}%)` }} />
        </Progress>
        <span className="text-sm font-medium">{winRate.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default Statistics;

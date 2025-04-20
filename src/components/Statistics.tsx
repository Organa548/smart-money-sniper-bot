
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradingStats } from "@/types/trading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import StatCard from "./statistics/StatCard";
import StatRow from "./statistics/StatRow";
import HourStatRow from "./statistics/HourStatRow";

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
            <ScrollArea className="h-[500px] w-full">
              <div className="space-y-4 p-4">
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
            </ScrollArea>
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

export default Statistics;

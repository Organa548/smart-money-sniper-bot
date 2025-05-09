
import React from "react";
import { TradeSignal, SignalFilter } from "@/types/trading";
import { SignalCard } from "@/components/SignalCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SignalsListProps {
  signals: TradeSignal[];
  filter?: SignalFilter;
  title?: string;
  onUpdateResult?: (signalId: string, result: 'WIN' | 'LOSS') => void;
}

const SignalsList: React.FC<SignalsListProps> = ({ 
  signals, 
  filter, 
  title = "Últimos Sinais",
  onUpdateResult 
}) => {
  // Apply filters
  const filteredSignals = React.useMemo(() => {
    if (!filter) return signals;
    
    return signals.filter(signal => {
      // Filter by asset
      if (filter.asset && signal.asset.id !== filter.asset) {
        return false;
      }
      
      // Filter by level
      if (filter.level && signal.level !== filter.level) {
        return false;
      }
      
      // Filter by result
      if (filter.result && signal.result !== filter.result) {
        return false;
      }
      
      // Filter by date range
      if (filter.startDate) {
        const signalDate = new Date(signal.timestamp);
        const startOfDay = new Date(filter.startDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        if (signalDate < startOfDay) {
          return false;
        }
      }
      
      if (filter.endDate) {
        const signalDate = new Date(signal.timestamp);
        const endOfDay = new Date(filter.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (signalDate > endOfDay) {
          return false;
        }
      }
      
      return true;
    });
  }, [signals, filter]);

  return (
    <Card className="w-full h-full bg-trading-background border-trading-card">
      <CardHeader className="px-4 py-3 border-b border-trading-card">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] w-full">
          <div className="p-4">
            {filteredSignals.length > 0 ? (
              filteredSignals.map(signal => (
                <div key={signal.id} className="mb-4">
                  <SignalCard signal={signal} />
                  
                  {/* Botões de resultado se o callback onUpdateResult foi fornecido e o sinal ainda não tem resultado */}
                  {onUpdateResult && signal.result === null && (
                    <div className="flex justify-end mt-2 space-x-2">
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="bg-trading-win hover:bg-trading-win/80 text-white"
                        onClick={() => onUpdateResult(signal.id, 'WIN')}
                      >
                        Marcar como WIN
                      </Button>
                      
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="bg-trading-loss hover:bg-trading-loss/80 text-white"
                        onClick={() => onUpdateResult(signal.id, 'LOSS')}
                      >
                        Marcar como LOSS
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-trading-neutral">
                Nenhum sinal encontrado com os filtros atuais.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SignalsList;

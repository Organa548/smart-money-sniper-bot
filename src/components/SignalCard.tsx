
import React from "react";
import { TradeSignal } from "@/types/trading";
import { formatTime, formatDate } from "@/utils/tradingUtils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SignalCardProps {
  signal: TradeSignal;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  return (
    <Card className="w-full mb-4 overflow-hidden border border-trading-card bg-trading-card hover:shadow-md transition-shadow">
      <CardHeader className={`p-3 ${signal.direction === 'CALL' ? 'bg-trading-win/10' : 'bg-trading-loss/10'} flex flex-row justify-between items-center`}>
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-lg">{signal.asset.symbol}</span>
          <Badge 
            variant={signal.direction === 'CALL' ? 'default' : 'destructive'}
            className={signal.direction === 'CALL' ? 'bg-trading-win' : 'bg-trading-loss'}
          >
            {signal.direction}
          </Badge>
        </div>
        <div className="text-sm text-trading-neutral">
          {formatDate(signal.timestamp)} {signal.entryTime}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <span>Score:</span>
            <Badge className={`
              ${signal.level === 'A' ? 'score-a' : ''}
              ${signal.level === 'B' ? 'score-b' : ''}
              ${signal.level === 'C' ? 'score-c' : ''}
            `}>
              {signal.score}/6 (Nível {signal.level})
            </Badge>
          </div>
          <div>
            {signal.result && (
              <Badge 
                variant={signal.result === 'WIN' ? 'default' : 'destructive'}
                className={`
                  ${signal.result === 'WIN' ? 'bg-trading-win' : 'bg-trading-loss'}
                  font-bold
                `}
              >
                {signal.result}
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm text-trading-neutral mb-1">Motivos:</p>
          <div className="flex flex-wrap gap-1">
            {signal.reasons.map((reason, index) => (
              <Badge key={index} variant="outline" className="bg-trading-card/50">
                {reason}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

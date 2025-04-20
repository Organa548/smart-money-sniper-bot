
import React from "react";
import { Progress } from "@/components/ui/progress";

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

export default StatRow;

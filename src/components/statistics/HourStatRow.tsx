
import React from "react";
import { Progress } from "@/components/ui/progress";

interface HourStatRowProps {
  hour: number;
  signals: number;
  winRate: number;
}

const HourStatRow: React.FC<HourStatRowProps> = ({ hour, signals, winRate }) => {
  const formattedHour = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
  
  let progressColor = "bg-trading-neutral";
  if (winRate >= 60) progressColor = "bg-trading-win";
  else if (winRate >= 50) progressColor = "bg-trading-highlight";
  else if (winRate > 0) progressColor = "bg-trading-loss";
  
  return (
    <div className="bg-trading-card rounded-lg p-3">
      <div className="flex justify-between mb-2">
        <span className="text-non-applicable font-medium">{formattedHour}</span>
        <span className="text-sm text-non-applicable">{signals} sinais</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress 
          value={winRate} 
          className="h-2 bg-trading-background"
        >
          <div className={`h-full ${progressColor} transition-all`} 
               style={{ transform: `translateX(-${100 - winRate}%)` }} />
        </Progress>
        <span className="text-sm text-white font-medium">{winRate.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default HourStatRow;

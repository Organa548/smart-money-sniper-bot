
import React from "react";
import { Button } from "@/components/ui/button";
import SignalsList from "@/components/SignalsList";
import SignalFilter from "@/components/SignalFilter";
import { TradeSignal, SignalFilter as SignalFilterType } from "@/types/trading";
import { downloadCSV } from "@/utils/tradingUtils";

interface SignalsSectionProps {
  signals: TradeSignal[];
  filter: SignalFilterType;
  onFilterChange: (filter: SignalFilterType) => void;
}

const SignalsSection: React.FC<SignalsSectionProps> = ({
  signals,
  filter,
  onFilterChange
}) => {
  const handleExportCSV = () => {
    downloadCSV(signals);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <h2 className="text-xl font-bold">Sinais</h2>
        <Button 
          variant="outline" 
          onClick={handleExportCSV}
          className="bg-trading-card hover:bg-trading-card/80 border-trading-neutral"
          disabled={signals.length === 0}
        >
          Exportar CSV
        </Button>
      </div>
      
      <SignalFilter onFilterChange={onFilterChange} currentFilter={filter} />
      
      <SignalsList 
        signals={signals} 
        filter={filter} 
        title={`Sinais ${filter.level ? `Nível ${filter.level}` : ''} ${filter.asset ? `- ${filter.asset}` : ''}`} 
      />
    </div>
  );
};

export default SignalsSection;

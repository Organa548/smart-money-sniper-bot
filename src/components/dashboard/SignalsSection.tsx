
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SignalsList from "@/components/SignalsList";
import SignalFilter from "@/components/SignalFilter";
import { SignalFilter as SignalFilterType, TradeSignal } from "@/types/trading";

interface SignalsSectionProps {
  signals: TradeSignal[];
  filter: SignalFilterType;
  onFilterChange: (filter: SignalFilterType) => void;
  isConnected: boolean;
  connectionError: string | null;
  onExportCsv: () => void;
  onUpdateSignalResult: (signalId: string, result: 'WIN' | 'LOSS') => void;
}

const SignalsSection: React.FC<SignalsSectionProps> = ({ 
  signals, 
  filter, 
  onFilterChange,
  isConnected,
  connectionError,
  onExportCsv,
  onUpdateSignalResult
}) => {
  const handleFilterReset = () => {
    onFilterChange({});
  };

  return (
    <div className="space-y-6">
      <Card className="bg-trading-background border-trading-card">
        <CardHeader className="px-4 py-3 border-b border-trading-card flex flex-row justify-between items-center">
          <CardTitle className="text-lg">Filtrar Sinais</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={handleFilterReset} variant="outline" size="sm">
              Limpar Filtros
            </Button>
            <Button onClick={onExportCsv} variant="default" size="sm">
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <SignalFilter currentFilter={filter} onFilterChange={onFilterChange} />
        </CardContent>
      </Card>
      
      <SignalsList 
        signals={signals} 
        filter={filter} 
        title="Últimos Sinais"
        onUpdateResult={onUpdateSignalResult}
      />
    </div>
  );
};

export default SignalsSection;

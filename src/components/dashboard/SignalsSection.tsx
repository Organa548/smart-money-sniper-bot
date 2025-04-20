
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SignalsList from "@/components/SignalsList";
import SignalFilter from "@/components/SignalFilter";
import { SignalFilter as SignalFilterType, TradeSignal } from "@/types/trading";
import { toast } from "@/components/ui/use-toast";

interface SignalsSectionProps {
  signals: TradeSignal[];
  filter: SignalFilterType;
  onFilterChange: (filter: SignalFilterType) => void;
  apiToken: string;
  setApiToken: (token: string) => void;
  apiId: string;
  setApiId: (id: string) => void;
  useRealSignals: boolean;
  setUseRealSignals: (use: boolean) => void;
  isConnected: boolean;
  connectionError: string | null;
  onExportCsv: () => void;
  onUpdateSignalResult: (signalId: string, result: 'WIN' | 'LOSS') => void;
}

const SignalsSection: React.FC<SignalsSectionProps> = ({ 
  signals, 
  filter, 
  onFilterChange,
  apiToken,
  setApiToken,
  apiId,
  setApiId,
  useRealSignals,
  setUseRealSignals,
  isConnected,
  connectionError,
  onExportCsv,
  onUpdateSignalResult
}) => {
  const handleFilterReset = () => {
    onFilterChange({});
  };

  const handleApiSettingsSave = () => {
    if (!apiToken || !apiId) {
      toast({
        title: "Erro de Configuração",
        description: "Token API e API ID são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Configurações API Salvas",
      description: "As configurações da API Deriv foram salvas",
      variant: "default",
    });
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
          <SignalFilter value={filter} onChange={onFilterChange} />
        </CardContent>
      </Card>
      
      <Card className="bg-trading-background border-trading-card">
        <CardHeader className="px-4 py-3 border-b border-trading-card">
          <CardTitle className="text-lg">Configuração da API</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <label className="text-sm font-medium">API Token</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Seu Token da API Deriv"
              />
            </div>
            
            <div className="space-y-2 col-span-1">
              <label className="text-sm font-medium">API ID</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={apiId}
                onChange={(e) => setApiId(e.target.value)}
                placeholder="ID da Aplicação"
              />
            </div>
            
            <div className="space-y-2 col-span-1 flex items-end">
              <div className="flex items-center space-x-4 w-full">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use-real-signals"
                    checked={useRealSignals}
                    onChange={(e) => setUseRealSignals(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="use-real-signals" className="text-sm">Sinais Reais</label>
                </div>
                
                <Button 
                  onClick={handleApiSettingsSave}
                  className="ml-auto"
                  disabled={!apiToken || !apiId}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
          
          {connectionError && (
            <div className="mt-4 p-3 bg-trading-loss/20 border border-trading-loss rounded-md text-sm">
              <strong>Erro de Conexão:</strong> {connectionError}
            </div>
          )}
          
          {isConnected && (
            <div className="mt-4">
              <Badge className="bg-trading-win">API Conectada</Badge>
            </div>
          )}
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

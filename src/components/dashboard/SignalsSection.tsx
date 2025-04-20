
import React from "react";
import { Button } from "@/components/ui/button";
import SignalsList from "@/components/SignalsList";
import SignalFilter from "@/components/SignalFilter";
import { TradeSignal, SignalFilter as SignalFilterType } from "@/types/trading";
import { downloadCSV } from "@/utils/tradingUtils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface SignalsSectionProps {
  signals: TradeSignal[];
  filter: SignalFilterType;
  onFilterChange: (filter: SignalFilterType) => void;
  apiToken?: string;
  setApiToken?: (token: string) => void;
  apiId?: string;
  setApiId?: (id: string) => void;
  useRealSignals?: boolean;
  setUseRealSignals?: (use: boolean) => void;
  isConnected?: boolean;
  connectionError?: string | null;
}

const SignalsSection: React.FC<SignalsSectionProps> = ({
  signals,
  filter,
  onFilterChange,
  apiToken = "",
  setApiToken,
  apiId = "",
  setApiId,
  useRealSignals = false,
  setUseRealSignals,
  isConnected = false,
  connectionError = null
}) => {
  const handleExportCSV = () => {
    downloadCSV(signals);
  };

  const handleApiTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setApiToken) {
      setApiToken(e.target.value);
    }
  };

  const handleApiIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setApiId) {
      setApiId(e.target.value);
    }
  };

  const handleUseRealSignalsChange = (checked: boolean) => {
    if (setUseRealSignals) {
      setUseRealSignals(checked);
    }
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
      
      {/* API Controls */}
      <div className="p-4 bg-trading-card rounded-lg border border-trading-neutral/20 space-y-4">
        <h3 className="font-bold">Configurações da API Deriv</h3>
        
        {useRealSignals && connectionError && (
          <Alert variant="destructive" className="mb-4 bg-trading-loss/10 text-trading-loss border-trading-loss/30">
            <AlertTitle>Erro de Conexão</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <Label htmlFor="api-id">API ID Deriv</Label>
            <Input
              id="api-id"
              type="text"
              value={apiId}
              onChange={handleApiIdChange}
              placeholder="Digite o App ID da Deriv"
              className="bg-trading-background border-trading-neutral"
            />
            <p className="text-xs text-trading-neutral mt-1">
              Obtenha seu App ID em app.deriv.com &gt; Sinta-se livre para criar
            </p>
          </div>
          
          <div>
            <Label htmlFor="api-token">Token API Deriv</Label>
            <Input
              id="api-token"
              type="password"
              value={apiToken}
              onChange={handleApiTokenChange}
              placeholder="Cole seu token API aqui"
              className="bg-trading-background border-trading-neutral"
            />
            <p className="text-xs text-trading-neutral mt-1">
              Obtenha seu token em app.deriv.com &gt; Configurações &gt; API Token
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Switch 
                id="use-real-signals" 
                checked={useRealSignals}
                onCheckedChange={handleUseRealSignalsChange}
              />
              <Label htmlFor="use-real-signals">Usar API Real</Label>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-trading-win' : 'bg-trading-loss'}`}></div>
            <span className="ml-2 text-sm">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
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


import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SignalFilter as SignalFilterType } from "@/types/trading";
import { tradingAssets } from "@/utils/tradingUtils";

interface SignalFilterProps {
  currentFilter: SignalFilterType;
  onFilterChange: (filter: SignalFilterType) => void;
}

const SignalFilter: React.FC<SignalFilterProps> = ({ onFilterChange, currentFilter }) => {
  // Initialize currentFilter with default empty object if it's undefined
  const filter = currentFilter || {};
  
  const handleAssetChange = (value: string) => {
    onFilterChange({
      ...filter,
      asset: value === "all" ? undefined : value
    });
  };

  const handleLevelChange = (value: string) => {
    onFilterChange({
      ...filter,
      level: (value === "all" ? undefined : value as 'A' | 'B' | 'C')
    });
  };

  const handleResultChange = (value: string) => {
    onFilterChange({
      ...filter,
      result: (value === "all" ? undefined : value as 'WIN' | 'LOSS' | null)
    });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  return (
    <Card className="w-full bg-trading-background border-trading-card">
      <CardHeader className="px-4 py-3 border-b border-trading-card">
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="asset-filter">Ativo</Label>
          <Select 
            value={filter.asset || "all"} 
            onValueChange={handleAssetChange}
          >
            <SelectTrigger id="asset-filter">
              <SelectValue placeholder="Todos os ativos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os ativos</SelectItem>
              {tradingAssets.map(asset => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="level-filter">Nível</Label>
          <Select 
            value={filter.level || "all"} 
            onValueChange={handleLevelChange}
          >
            <SelectTrigger id="level-filter">
              <SelectValue placeholder="Todos os níveis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="A">Nível A (Sniper)</SelectItem>
              <SelectItem value="B">Nível B (Forte)</SelectItem>
              <SelectItem value="C">Nível C (Moderado)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="result-filter">Resultado</Label>
          <Select 
            value={filter.result || "all"} 
            onValueChange={handleResultChange}
          >
            <SelectTrigger id="result-filter">
              <SelectValue placeholder="Todos os resultados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os resultados</SelectItem>
              <SelectItem value="WIN">WIN</SelectItem>
              <SelectItem value="LOSS">LOSS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            className="w-full bg-trading-card hover:bg-trading-card/80 border-trading-neutral"
            onClick={handleClearFilters}
          >
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignalFilter;

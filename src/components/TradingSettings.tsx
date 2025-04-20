
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { tradingAssets } from "@/utils/tradingUtils";

interface TradingSettingsProps {
  onSave: (settings: TradingSettingsType) => void;
  currentSettings: TradingSettingsType;
}

export interface TradingSettingsType {
  operatingHours: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  }[];
  minScoreForSignal: number;
  selectedAssets: string[];
  autoTrade: boolean;
}

const TradingSettings: React.FC<TradingSettingsProps> = ({ onSave, currentSettings }) => {
  const [settings, setSettings] = useState<TradingSettingsType>(currentSettings);
  
  const handleOperatingHoursChange = (index: number, field: keyof typeof settings.operatingHours[0], value: any) => {
    const updatedHours = [...settings.operatingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value
    };
    
    setSettings({
      ...settings,
      operatingHours: updatedHours
    });
  };

  const handleMinScoreChange = (value: string) => {
    setSettings({
      ...settings,
      minScoreForSignal: parseInt(value)
    });
  };

  const handleAssetToggle = (assetId: string) => {
    const updatedAssets = settings.selectedAssets.includes(assetId)
      ? settings.selectedAssets.filter(id => id !== assetId)
      : [...settings.selectedAssets, assetId];
    
    setSettings({
      ...settings,
      selectedAssets: updatedAssets
    });
  };

  const handleAutoTradeToggle = (checked: boolean) => {
    setSettings({
      ...settings,
      autoTrade: checked
    });
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <Card className="w-full bg-trading-background border-trading-card">
      <CardHeader className="px-4 py-3 border-b border-trading-card">
        <CardTitle className="text-lg">Configurações de Operação</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">Horários de Operação (Brasília)</h3>
          <div className="space-y-4">
            {settings.operatingHours.map((period, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-trading-card rounded-lg">
                <Switch 
                  checked={period.enabled}
                  onCheckedChange={(checked) => handleOperatingHoursChange(index, 'enabled', checked)}
                />
                <div className="grid grid-cols-2 gap-2 flex-1">
                  <div className="space-y-1">
                    <Label htmlFor={`start-hour-${index}`} className="text-xs">Início</Label>
                    <Select 
                      value={period.startHour.toString()} 
                      onValueChange={(value) => handleOperatingHoursChange(index, 'startHour', parseInt(value))}
                    >
                      <SelectTrigger id={`start-hour-${index}`} disabled={!period.enabled}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(24)].map((_, hour) => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`end-hour-${index}`} className="text-xs">Fim</Label>
                    <Select 
                      value={period.endHour.toString()} 
                      onValueChange={(value) => handleOperatingHoursChange(index, 'endHour', parseInt(value))}
                    >
                      <SelectTrigger id={`end-hour-${index}`} disabled={!period.enabled}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(24)].map((_, hour) => (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-3">Configurações de Sinal</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="min-score">Score Mínimo para Sinal</Label>
              <Select 
                value={settings.minScoreForSignal.toString()} 
                onValueChange={handleMinScoreChange}
              >
                <SelectTrigger id="min-score">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 - Nível C (Moderado)</SelectItem>
                  <SelectItem value="5">5 - Nível B (Forte)</SelectItem>
                  <SelectItem value="6">6 - Nível A (Sniper)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium mb-3">Ativos para Operar</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {tradingAssets.map(asset => (
              <div key={asset.id} className="flex items-center space-x-2">
                <Switch 
                  id={`asset-${asset.id}`}
                  checked={settings.selectedAssets.includes(asset.id)}
                  onCheckedChange={() => handleAssetToggle(asset.id)}
                />
                <Label htmlFor={`asset-${asset.id}`} className="cursor-pointer">
                  {asset.symbol}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-trade" className="text-sm font-medium">Operar Automaticamente</Label>
            <p className="text-xs text-trading-neutral">Enviar ordens automáticas para plataforma</p>
          </div>
          <Switch 
            id="auto-trade"
            checked={settings.autoTrade}
            onCheckedChange={handleAutoTradeToggle}
          />
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 flex justify-end border-t border-trading-card">
        <Button 
          onClick={handleSave}
          className="bg-trading-highlight hover:bg-trading-highlight/80"
        >
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TradingSettings;

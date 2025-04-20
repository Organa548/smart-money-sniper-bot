
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AutoTradeToggleProps {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
}

const AutoTradeToggle: React.FC<AutoTradeToggleProps> = ({ enabled, onToggle }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="auto-trade" className="text-sm font-medium">Operar Automaticamente</Label>
        <p className="text-xs text-trading-neutral">Enviar ordens automáticas para plataforma</p>
      </div>
      <Switch 
        id="auto-trade"
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
};

export default AutoTradeToggle;

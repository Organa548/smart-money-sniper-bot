
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SignalSettingsProps {
  minScore: number;
  onMinScoreChange: (value: string) => void;
}

const SignalSettings: React.FC<SignalSettingsProps> = ({ minScore, onMinScoreChange }) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Configurações de Sinal</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="min-score">Score Mínimo para Sinal</Label>
          <Select 
            value={minScore.toString()} 
            onValueChange={onMinScoreChange}
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
  );
};

export default SignalSettings;

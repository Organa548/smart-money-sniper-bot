
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OperatingHoursProps {
  operatingHours: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  }[];
  onOperatingHoursChange: (index: number, field: string, value: any) => void;
}

const OperatingHours: React.FC<OperatingHoursProps> = ({ operatingHours, onOperatingHoursChange }) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Horários de Operação (Brasília)</h3>
      <div className="space-y-4">
        {operatingHours.map((period, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 bg-trading-card rounded-lg">
            <Switch 
              checked={period.enabled}
              onCheckedChange={(checked) => onOperatingHoursChange(index, 'enabled', checked)}
            />
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div className="space-y-1">
                <Label htmlFor={`start-hour-${index}`} className="text-xs">Início</Label>
                <Select 
                  value={period.startHour.toString()} 
                  onValueChange={(value) => onOperatingHoursChange(index, 'startHour', parseInt(value))}
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
                  onValueChange={(value) => onOperatingHoursChange(index, 'endHour', parseInt(value))}
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
  );
};

export default OperatingHours;

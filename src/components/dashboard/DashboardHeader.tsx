
import React from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

interface DashboardHeaderProps {
  isActive: boolean;
  operatingNow: boolean;
  currentTime: Date;
  onToggleActive: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isActive,
  operatingNow,
  currentTime,
  onToggleActive
}) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="space-y-2">
        <Logo />
        <p className="text-neutral-contrast">
          {operatingNow 
            ? "Horário operacional - Sistema pronto para gerar sinais" 
            : "Fora do horário operacional - Sistema em espera"}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <div className="text-sm text-neutral-contrast">Horário Atual (Brasília)</div>
          <div className="text-xl font-mono">
            {currentTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </div>
        </div>
        
        <Button
          onClick={onToggleActive}
          className={isActive ? "bg-trading-loss hover:bg-trading-loss/80" : "bg-trading-win hover:bg-trading-win/80"}
        >
          {isActive ? "Parar Bot" : "Iniciar Bot"}
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;

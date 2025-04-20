
import React from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  isActive: boolean;
  operatingNow: boolean;
  currentTime: Date;
  onToggleActive: () => void;
  connectedToAPI: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isActive,
  operatingNow,
  currentTime,
  onToggleActive,
  connectedToAPI
}) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="space-y-2">
        <Logo />
        <div className="flex flex-col gap-1">
          <p className="text-neutral-contrast">
            {operatingNow 
              ? "Horário operacional - Sistema pronto para gerar sinais" 
              : "Fora do horário operacional - Sistema em espera"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className={isActive ? "bg-trading-win" : "bg-trading-neutral"}>
              Bot {isActive ? "Ativo" : "Inativo"}
            </Badge>
            
            <Badge className={connectedToAPI ? "bg-trading-highlight" : "bg-trading-loss"}>
              API {connectedToAPI ? "Conectada" : "Desconectada"}
            </Badge>
          </div>
        </div>
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

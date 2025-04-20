
import React from "react";

interface StatusPanelProps {
  isActive: boolean;
  operatingNow: boolean;
  telegramEnabled: boolean;
  todaySignalsCount: number;
  isConnected?: boolean;
  useRealSignals?: boolean;
  is24HoursMode?: boolean;
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  isActive,
  operatingNow,
  telegramEnabled,
  todaySignalsCount,
  isConnected = false,
  useRealSignals = false,
  is24HoursMode = false
}) => {
  return (
    <div className="bg-trading-card p-4 rounded-lg border border-trading-neutral/20">
      <h3 className="font-bold mb-2">Status do Bot</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-trading-neutral">Status:</span>
          <span className={isActive ? 'text-trading-win' : 'text-trading-loss'}>
            {isActive ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-trading-neutral">Horário operacional:</span>
          <span className={is24HoursMode ? 'text-trading-win' : operatingNow ? 'text-trading-win' : 'text-trading-loss'}>
            {is24HoursMode ? '24 Horas' : (operatingNow ? 'Sim' : 'Não')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-trading-neutral">Sinais hoje:</span>
          <span>{todaySignalsCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-trading-neutral">API Deriv:</span>
          <span className={useRealSignals ? (isConnected ? 'text-trading-win' : 'text-trading-loss') : 'text-trading-neutral'}>
            {useRealSignals 
              ? (isConnected ? 'Conectado' : 'Falha na Conexão') 
              : 'Desativada'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-trading-neutral">Telegram:</span>
          <span className={telegramEnabled ? 'text-trading-win' : 'text-trading-loss'}>
            {telegramEnabled ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;

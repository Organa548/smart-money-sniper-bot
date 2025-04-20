
import React from "react";

interface StatusPanelProps {
  isActive: boolean;
  operatingNow: boolean;
  telegramEnabled: boolean;
  todaySignalsCount: number;
  isConnected?: boolean;
  useRealSignals?: boolean;
  is24HoursMode?: boolean;
  connectionError?: string | null;
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  isActive,
  operatingNow,
  telegramEnabled,
  todaySignalsCount,
  isConnected = false,
  useRealSignals = false,
  is24HoursMode = false,
  connectionError = null
}) => {
  return (
    <div className="bg-trading-card p-4 rounded-lg border border-trading-neutral/20">
      <h3 className="font-bold mb-2 text-non-applicable">Status do Bot</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-non-applicable">Status:</span>
          <span className={isActive ? 'text-trading-win' : 'text-trading-loss'}>
            {isActive ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-non-applicable">Horário operacional:</span>
          <span className={is24HoursMode ? 'text-trading-win' : operatingNow ? 'text-trading-win' : 'text-trading-loss'}>
            {is24HoursMode ? '24 Horas' : (operatingNow ? 'Sim' : 'Não')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-non-applicable">Sinais hoje:</span>
          <span className="text-non-applicable">{todaySignalsCount}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-non-applicable">API Deriv:</span>
          <div className="text-right">
            <div className={useRealSignals ? (isConnected ? 'text-trading-win' : 'text-trading-loss') : 'text-non-applicable'}>
              {useRealSignals 
                ? (isConnected ? 'Conectado' : 'Falha na Conexão') 
                : 'Desativada'}
            </div>
            {useRealSignals && connectionError && !isConnected && (
              <div className="text-trading-loss text-xs mt-1">
                {connectionError}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-non-applicable">Telegram:</span>
          <span className={telegramEnabled ? 'text-trading-win' : 'text-trading-loss'}>
            {telegramEnabled ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;

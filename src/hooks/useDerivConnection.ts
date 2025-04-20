
import { useState, useEffect } from "react";
import { derivAPI } from "@/utils/deriv";
import { toast } from "@/components/ui/use-toast";
import { TradeSignal } from "@/types/trading";
import { TradingSettingsType } from "@/components/TradingSettings";

export const useDerivConnection = (
  apiToken: string,
  isActive: boolean,
  useRealSignals: boolean,
  tradingSettings: TradingSettingsType,
  onNewSignal: (signal: TradeSignal) => void,
  operatingNow: boolean
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Connect/disconnect from Deriv API based on token and active state
  useEffect(() => {
    const connect = async () => {
      setConnectionError(null);
      
      if (apiToken && isActive && useRealSignals) {
        try {
          console.log("Tentando conectar à API Deriv...");
          setConnectionAttempts(prev => prev + 1);
          
          derivAPI.disconnect();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          derivAPI.authenticate(apiToken);
          const connected = await derivAPI.connect();
          
          if (connected) {
            console.log("Conexão bem-sucedida com a API Deriv");
            setIsConnected(true);
            setConnectionAttempts(0);
            derivAPI.updateSubscriptions(tradingSettings.selectedAssets);
            
            toast({
              title: "API Deriv",
              description: "Conectado com sucesso à API Deriv",
              variant: "default",
            });
          } else {
            console.error("Falha ao conectar à API Deriv");
            setIsConnected(false);
            setConnectionError("Falha ao estabelecer conexão com a API. Verifique seu token e conexão com a internet.");
            
            toast({
              title: "Erro de Conexão",
              description: "Não foi possível conectar à API Deriv. Verifique o token e sua conexão com a internet.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Erro ao conectar à API Deriv:", error);
          setIsConnected(false);
          setConnectionError(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
          
          toast({
            title: "Erro de Conexão",
            description: "Ocorreu um erro ao conectar à API Deriv",
            variant: "destructive",
          });
        }
      } else if (!apiToken && useRealSignals) {
        setConnectionError("Token API não fornecido");
        setIsConnected(false);
      } else if (!isActive || !useRealSignals) {
        derivAPI.disconnect();
        setIsConnected(false);
        setConnectionError(null);
      }
    };
    
    connect();
    
    return () => {
      derivAPI.disconnect();
    };
  }, [apiToken, isActive, useRealSignals, tradingSettings.selectedAssets, connectionAttempts]);

  // Auto-reconnect logic
  useEffect(() => {
    let reconnectTimer: number | null = null;
    
    if (useRealSignals && isActive && !isConnected && apiToken && connectionAttempts < 3) {
      reconnectTimer = window.setTimeout(() => {
        console.log(`Tentativa de reconexão ${connectionAttempts + 1}/3`);
        setConnectionAttempts(prev => prev + 1);
      }, 5000);
    }
    
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [useRealSignals, isActive, isConnected, apiToken, connectionAttempts]);

  // Set up Deriv signal callback
  useEffect(() => {
    derivAPI.setSignalCallback((newSignal: TradeSignal) => {
      if (isActive && (operatingNow || tradingSettings.is24HoursMode)) {
        onNewSignal(newSignal);
        
        toast({
          title: "Novo Sinal",
          description: `${newSignal.asset.symbol} ${newSignal.direction} - Score: ${newSignal.score}`,
          variant: "default",
        });
      }
    });
    
    return () => {
      derivAPI.setSignalCallback(() => {});
    };
  }, [isActive, operatingNow, tradingSettings.is24HoursMode, onNewSignal]);

  return {
    isConnected,
    connectionError,
    connectionAttempts
  };
};

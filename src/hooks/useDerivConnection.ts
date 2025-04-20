
import { useState, useEffect } from "react";
import { derivAPI } from "@/utils/deriv";
import { toast } from "@/components/ui/use-toast";
import { TradeSignal } from "@/types/trading";
import { TradingSettingsType } from "@/components/TradingSettings";
import { wsManager } from "@/utils/deriv/websocketManager";

export const useDerivConnection = (
  apiToken: string,
  apiId: string,
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
      
      if (isActive && useRealSignals) {
        try {
          console.log("Tentando conectar à API Deriv...");
          console.log("API Token:", apiToken ? "Definido" : "Não definido");
          console.log("API ID:", apiId ? "Definido" : "Não definido");
          
          setConnectionAttempts(prev => prev + 1);
          
          // Certifique-se de que desconectamos antes de tentar uma nova conexão
          derivAPI.disconnect();
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Autenticar com os tokens obtidos dos secrets do Supabase
          const token = import.meta.env.VITE_DERIV_API_TOKEN || apiToken;
          const id = import.meta.env.VITE_DERIV_API_ID || apiId;
          
          console.log("Usando token:", token ? "Definido" : "Não definido");
          console.log("Usando ID:", id ? "Definido" : "Não definido");
          
          if (token && id) {
            derivAPI.authenticate(token, id);
          } else {
            const errorMsg = "API Token ou API ID não configurados";
            console.error("Falha:", errorMsg);
            setConnectionError(errorMsg);
            setIsConnected(false);
            
            toast({
              title: "Erro de Conexão",
              description: errorMsg,
              variant: "destructive",
            });
            return;
          }
          
          const connected = await derivAPI.connect();
          
          if (connected) {
            console.log("Conexão bem-sucedida com a API Deriv");
            setIsConnected(true);
            setConnectionAttempts(0);
            setConnectionError(null);
            
            // Atualizando assinaturas
            console.log("Atualizando assinaturas para ativos selecionados:", tradingSettings.selectedAssets);
            derivAPI.updateSubscriptions(tradingSettings.selectedAssets);
            
            toast({
              title: "API Deriv",
              description: "Conectado com sucesso à API Deriv",
              variant: "default",
            });
          } else {
            console.error("Falha ao conectar à API Deriv");
            setIsConnected(false);
            
            const wsError = wsManager.getLastError();
            const errorMsg = wsError 
              ? `Erro de conexão: ${wsError}`
              : "Falha ao estabelecer conexão com a API. Verifique sua conexão com a internet.";
            
            setConnectionError(errorMsg);
            
            toast({
              title: "Erro de Conexão",
              description: errorMsg,
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
      } else if (!isActive || !useRealSignals) {
        derivAPI.disconnect();
        setIsConnected(false);
        setConnectionError(null);
      }
    };
    
    connect();
    
    // Verificação de conexão periódica
    const connectionCheckInterval = setInterval(() => {
      if (isActive && useRealSignals && !isConnected && connectionAttempts < 3) {
        console.log("Verificando reconexão automática...");
        connect();
      }
    }, 30000); // Verificar a cada 30 segundos
    
    return () => {
      derivAPI.disconnect();
      clearInterval(connectionCheckInterval);
    };
  }, [apiToken, apiId, isActive, useRealSignals, tradingSettings.selectedAssets, connectionAttempts]);

  // Auto-reconnect logic
  useEffect(() => {
    let reconnectTimer: number | null = null;
    
    if (useRealSignals && isActive && !isConnected && connectionAttempts < 3) {
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
  }, [useRealSignals, isActive, isConnected, connectionAttempts]);

  // Set up Deriv signal callback
  useEffect(() => {
    derivAPI.setSignalCallback((newSignal: TradeSignal) => {
      console.log("Sinal recebido da Deriv API:", newSignal);
      
      if (isActive && (operatingNow || tradingSettings.is24HoursMode)) {
        console.log("Processando sinal recebido...");
        onNewSignal(newSignal);
        
        toast({
          title: "Novo Sinal",
          description: `${newSignal.asset.symbol} ${newSignal.direction} - Score: ${newSignal.score}`,
          variant: "default",
        });
      } else {
        console.log("Sinal ignorado: Bot inativo ou fora do horário operacional");
      }
    });
    
    return () => {
      derivAPI.setSignalCallback(() => {});
    };
  }, [isActive, operatingNow, tradingSettings.is24HoursMode, onNewSignal]);

  // Mostrar mensagem de ajuda quando houver erro de conexão por bloqueio
  useEffect(() => {
    if (connectionError && connectionError.includes("Bloqueio de conexão pelo navegador")) {
      toast({
        title: "Conexão Bloqueada",
        description: "Seu navegador pode estar bloqueando conexões WebSocket. Tente verificar as configurações de segurança ou use outro navegador.",
        variant: "destructive",
      });
    }
  }, [connectionError]);

  return {
    isConnected,
    connectionError,
    connectionAttempts
  };
};

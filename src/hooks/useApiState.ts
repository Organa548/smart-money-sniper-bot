
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export const useApiState = () => {
  const [apiToken, setApiToken] = useState<string>('');
  const [apiId, setApiId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return {
    apiToken,
    setApiToken,
    apiId,
    setApiId,
    currentTime
  };
};

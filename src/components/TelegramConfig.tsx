
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TelegramSettings } from "@/utils/telegramService";

interface TelegramConfigProps {
  onSave: (config: TelegramSettings) => void;
  currentSettings: TelegramSettings;
  onTest: () => Promise<void>;
}

const TelegramConfig: React.FC<TelegramConfigProps> = ({ onSave, currentSettings, onTest }) => {
  const [settings, setSettings] = useState<TelegramSettings>({
    ...currentSettings,
    sendResultsAutomatically: currentSettings.sendResultsAutomatically ?? true,
    sendSignalAdvance: currentSettings.sendSignalAdvance ?? true
  });
  const [isTesting, setIsTesting] = useState(false);
  
  const handleInputChange = (field: keyof TelegramSettings, value: string | boolean) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  const handleSave = () => {
    onSave(settings);
  };

  const handleTest = async () => {
    setIsTesting(true);
    
    try {
      await onTest();
    } catch (error) {
      console.error("Erro ao testar conexão Telegram:", error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full bg-trading-background border-trading-card">
      <CardHeader className="px-4 py-3 border-b border-trading-card">
        <CardTitle className="text-lg">Configuração do Telegram</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="telegram-enabled" className="cursor-pointer">Integração com Telegram</Label>
          <Switch 
            id="telegram-enabled" 
            checked={settings.enabled}
            onCheckedChange={(checked) => handleInputChange('enabled', checked)}
          />
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bot-token">Token do Bot</Label>
            <Input 
              id="bot-token" 
              placeholder="1234567890:ABCDefGhIJKlmNoPQRsTUVwxyZ" 
              value={settings.botToken}
              onChange={(e) => handleInputChange('botToken', e.target.value)}
              disabled={!settings.enabled}
              type="password"
            />
            <p className="text-sm text-trading-neutral">Obtenha o token do BotFather (@BotFather no Telegram)</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chat-id">ID do Chat ou Canal</Label>
            <Input 
              id="chat-id" 
              placeholder="-1001234567890" 
              value={settings.chatId}
              onChange={(e) => handleInputChange('chatId', e.target.value)}
              disabled={!settings.enabled}
            />
            <p className="text-sm text-trading-neutral">ID do chat, grupo ou canal onde os sinais serão enviados</p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Opções de Envio</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="send-advance" className="cursor-pointer">Enviar sinais com até 15s de antecedência</Label>
              <Switch 
                id="send-advance" 
                checked={settings.sendSignalAdvance}
                onCheckedChange={(checked) => handleInputChange('sendSignalAdvance', checked)}
                disabled={!settings.enabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="send-auto-results" className="cursor-pointer">Enviar resultados automaticamente</Label>
              <Switch 
                id="send-auto-results" 
                checked={settings.sendResultsAutomatically}
                onCheckedChange={(checked) => handleInputChange('sendResultsAutomatically', checked)}
                disabled={!settings.enabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="send-wins" className="cursor-pointer">Enviar resultados WIN</Label>
              <Switch 
                id="send-wins" 
                checked={settings.sendWins}
                onCheckedChange={(checked) => handleInputChange('sendWins', checked)}
                disabled={!settings.enabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="send-losses" className="cursor-pointer">Enviar resultados LOSS</Label>
              <Switch 
                id="send-losses" 
                checked={settings.sendLosses}
                onCheckedChange={(checked) => handleInputChange('sendLosses', checked)}
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-4 py-3 flex justify-between border-t border-trading-card">
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={!settings.enabled || !settings.botToken || !settings.chatId || isTesting}
          className="bg-trading-card hover:bg-trading-card/80 border-trading-neutral"
        >
          {isTesting ? "Enviando..." : "Enviar Mensagem de Teste"}
        </Button>
        <Button 
          onClick={handleSave}
          className="bg-trading-highlight hover:bg-trading-highlight/80"
        >
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TelegramConfig;

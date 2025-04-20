
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        toast({
          title: "Login Bem-sucedido",
          description: "Bem-vindo de volta!",
          variant: "default"
        });
        
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        toast({
          title: "Cadastro Realizado",
          description: "Por favor, verifique seu e-mail para confirmar a conta.",
          variant: "default"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro de Autenticação",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-trading-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-trading-card rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">
          {isLogin ? 'Login' : 'Cadastro'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full bg-trading-highlight">
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>
        <div className="text-center">
          <Button 
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-trading-neutral"
          >
            {isLogin 
              ? 'Não tem uma conta? Cadastre-se' 
              : 'Já tem uma conta? Faça login'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

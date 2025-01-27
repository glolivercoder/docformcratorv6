import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink } from "lucide-react";

export const ApiKeyManager = () => {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const storedKey = localStorage.getItem("geminiApiKey");
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira uma chave API válida.",
      });
      return;
    }

    // Basic validation for Gemini API key format
    if (!apiKey.startsWith('AI') || apiKey.length < 10) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A chave API parece inválida. Verifique o formato da chave do Gemini.",
      });
      return;
    }

    localStorage.setItem("geminiApiKey", apiKey);
    toast({
      title: "Sucesso",
      description: "Chave API salva com sucesso!",
    });
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Configurar Chave API do Gemini</h3>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 mb-2">
          <p>Para obter sua chave API do Gemini:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Acesse o <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
              Google AI Studio <ExternalLink className="w-4 h-4 ml-1" />
            </a></li>
            <li>Faça login com sua conta Google</li>
            <li>Clique em "Create API Key"</li>
            <li>Copie a chave gerada e cole abaixo</li>
          </ol>
        </div>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Digite sua chave API do Gemini (começa com 'AI')"
        />
        <Button onClick={handleSaveKey}>Salvar Chave API</Button>
      </div>
    </Card>
  );
};
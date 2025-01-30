import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AIProvider = {
  id: string;
  name: string;
  keyPrefix: string;
  storageKey: string;
  docsUrl: string;
};

const AI_PROVIDERS: AIProvider[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    keyPrefix: "AI",
    storageKey: "geminiApiKey",
    docsUrl: "https://makersuite.google.com/app/apikey",
  },
  {
    id: "openai",
    name: "OpenAI",
    keyPrefix: "sk-",
    storageKey: "openaiApiKey",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    keyPrefix: "sk-ant-",
    storageKey: "claudeApiKey",
    docsUrl: "https://console.anthropic.com/account/keys",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    keyPrefix: "sk-or-",
    storageKey: "openrouterApiKey",
    docsUrl: "https://openrouter.ai/keys",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    keyPrefix: "sk-",
    storageKey: "deepseekApiKey",
    docsUrl: "https://platform.deepseek.com/api-keys",
  },
];

export const ApiKeyManager = () => {
  const [selectedProvider, setSelectedProvider] = useState<string>("gemini");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();

  const currentProvider = AI_PROVIDERS.find((p) => p.id === selectedProvider)!;

  useEffect(() => {
    const storedKey = localStorage.getItem(currentProvider.storageKey);
    setApiKey(storedKey || "");
  }, [selectedProvider]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira uma chave API válida.",
      });
      return;
    }

    if (!apiKey.startsWith(currentProvider.keyPrefix)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: `A chave API do ${currentProvider.name} deve começar com '${currentProvider.keyPrefix}'. Verifique se você copiou a chave corretamente.`,
      });
      return;
    }

    localStorage.setItem(currentProvider.storageKey, apiKey);
    toast({
      title: "Sucesso",
      description: `Chave API do ${currentProvider.name} salva com sucesso!`,
    });
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Configurar Chaves API</h3>
      <div className="space-y-4">
        <Select
          value={selectedProvider}
          onValueChange={setSelectedProvider}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o provedor" />
          </SelectTrigger>
          <SelectContent>
            {AI_PROVIDERS.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-600 mb-2">
          <p>Para obter sua chave API do {currentProvider.name}:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>
              Acesse o{" "}
              <a
                href={currentProvider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                Portal do {currentProvider.name}{" "}
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </li>
            <li>Faça login com sua conta</li>
            <li>Crie uma nova chave API</li>
            <li>Copie a chave gerada (deve começar com '{currentProvider.keyPrefix}')</li>
          </ol>
        </div>

        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={`Digite sua chave API do ${currentProvider.name} (começa com '${currentProvider.keyPrefix}')`}
        />

        <Button onClick={handleSaveKey} className="w-full">
          Salvar Chave API
        </Button>

        <div className="text-sm text-gray-500">
          Status: {localStorage.getItem(currentProvider.storageKey) ? "Configurado ✓" : "Não configurado"}
        </div>
      </div>
    </Card>
  );
};
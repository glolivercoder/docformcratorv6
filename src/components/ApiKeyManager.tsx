import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_PROVIDERS = {
  gemini: {
    name: "Google Gemini",
    models: ["gemini-pro", "gemini-pro-vision"],
    keyPrefix: "AI",
    configUrl: "https://makersuite.google.com/app/apikey",
  },
  openai: {
    name: "OpenAI",
    models: ["gpt-3.5-turbo", "gpt-4", "gpt-4-vision"],
    keyPrefix: "sk-",
    configUrl: "https://platform.openai.com/api-keys",
  },
  claude: {
    name: "Anthropic Claude",
    models: ["claude-2", "claude-instant"],
    keyPrefix: "sk-ant-",
    configUrl: "https://console.anthropic.com/account/keys",
  },
  openrouter: {
    name: "OpenRouter",
    models: ["openrouter/auto", "anthropic/claude-2", "google/gemini-pro"],
    keyPrefix: "sk-or-",
    configUrl: "https://openrouter.ai/keys",
  },
  deepseek: {
    name: "DeepSeek",
    models: ["deepseek-coder", "deepseek-chat"],
    keyPrefix: "sk-",
    configUrl: "https://platform.deepseek.com/api-keys",
  },
};

export const ApiKeyManager = () => {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [selectedModel, setSelectedModel] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const provider = API_PROVIDERS[selectedProvider as keyof typeof API_PROVIDERS];
    if (provider && provider.models.length > 0) {
      setSelectedModel(provider.models[0]);
    }
  }, [selectedProvider]);

  const handleSaveKey = () => {
    const provider = API_PROVIDERS[selectedProvider as keyof typeof API_PROVIDERS];
    
    if (!apiKey.startsWith(provider.keyPrefix)) {
      toast({
        variant: "destructive",
        title: "Chave API inválida",
        description: `A chave deve começar com ${provider.keyPrefix}`,
      });
      return;
    }

    localStorage.setItem(`${selectedProvider}ApiKey`, apiKey);
    localStorage.setItem(`${selectedProvider}Model`, selectedModel);
    
    toast({
      title: "Sucesso",
      description: "Chave API salva com sucesso!",
    });
    
    setApiKey("");
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Select
          value={selectedProvider}
          onValueChange={setSelectedProvider}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o provedor" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {Object.entries(API_PROVIDERS).map(([key, provider]) => (
                <SelectItem key={key} value={key}>
                  {provider.name}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {API_PROVIDERS[selectedProvider as keyof typeof API_PROVIDERS]?.models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        <Input
          type="password"
          placeholder="Digite sua chave API"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        <Button onClick={handleSaveKey} className="w-full">
          Configurar chave API
        </Button>

        <div className="text-sm text-gray-500">
          <p>
            Obtenha sua chave API em:{" "}
            <a
              href={API_PROVIDERS[selectedProvider as keyof typeof API_PROVIDERS]?.configUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {API_PROVIDERS[selectedProvider as keyof typeof API_PROVIDERS]?.configUrl}
            </a>
          </p>
        </div>
      </div>
    </Card>
  );
};
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { availableModels } from '@/types/ai';

interface ModelSelectorProps {
  onModelSelect: (modelId: string) => void;
}

export function ModelSelector({ onModelSelect }: ModelSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  const providers = [...new Set(availableModels.map(m => m.provider))];
  const modelsByProvider = availableModels.filter(m => m.provider === selectedProvider);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    setSelectedModel('');
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    onModelSelect(modelId);
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Selecione o Modelo de IA</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Provedor</label>
          <Select onValueChange={handleProviderChange} value={selectedProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o provedor" />
            </SelectTrigger>
            <SelectContent>
              {providers.map(provider => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProvider && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Modelo</label>
            <Select onValueChange={handleModelChange} value={selectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modelo" />
              </SelectTrigger>
              <SelectContent>
                {modelsByProvider.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      <span className="text-xs text-gray-500">
                        {model.capabilities.join(', ')} - {model.maxTokens.toLocaleString()} tokens
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedModel && (
          <div className="text-sm text-gray-500">
            <p>Preço por token: ${availableModels.find(m => m.id === selectedModel)?.pricePerToken.toFixed(5)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

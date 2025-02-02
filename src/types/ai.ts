export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  maxTokens: number;
  pricePerToken: number;
  apiKeyEnvVar: string;
  endpoint?: string;
}

export interface AIServiceConfig {
  model: AIModel;
  apiKey: string;
  endpoint?: string;
}

export interface AIAnalysisResult {
  text: string;
  fields: Array<{
    name: string;
    value: string;
    confidence: number;
  }>;
  documentType?: string;
  suggestedTemplate?: string;
  metadata?: Record<string, any>;
}

export const availableModels: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    capabilities: ['text', 'analysis', 'extraction'],
    maxTokens: 8192,
    pricePerToken: 0.00003,
    apiKeyEnvVar: 'OPENAI_API_KEY'
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    provider: 'Anthropic',
    capabilities: ['text', 'analysis', 'extraction'],
    maxTokens: 100000,
    pricePerToken: 0.00001,
    apiKeyEnvVar: 'ANTHROPIC_API_KEY'
  },
  {
    id: 'command',
    name: 'Command',
    provider: 'Cohere',
    capabilities: ['text', 'analysis'],
    maxTokens: 4096,
    pricePerToken: 0.00002,
    apiKeyEnvVar: 'COHERE_API_KEY'
  },
  {
    id: 'j2-ultra',
    name: 'Jurassic-2 Ultra',
    provider: 'AI21',
    capabilities: ['text', 'analysis'],
    maxTokens: 8192,
    pricePerToken: 0.00002,
    apiKeyEnvVar: 'AI21_API_KEY'
  }
];

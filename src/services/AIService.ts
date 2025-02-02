import { AIModel, AIAnalysisResult, availableModels } from '@/types/ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { CohereClient } from 'cohere-ai';
import axios from 'axios';

export class AIService {
  private static instance: AIService;
  private activeModel: AIModel | null = null;
  private apiKeys: Map<string, string> = new Map();
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private cohere: CohereClient | null = null;

  private constructor() {
    this.loadAPIKeys();
    this.initializeClients();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private loadAPIKeys() {
    const envKeys = {
      'gpt-4': import.meta.env.VITE_OPENAI_API_KEY,
      'claude-3': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'command': import.meta.env.VITE_COHERE_API_KEY,
      'j2-ultra': import.meta.env.VITE_AI21_API_KEY,
    };

    Object.entries(envKeys).forEach(([modelId, apiKey]) => {
      if (apiKey) {
        this.apiKeys.set(modelId, apiKey);
      }
    });
  }

  private initializeClients() {
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }

    const cohereKey = import.meta.env.VITE_COHERE_API_KEY;
    if (cohereKey) {
      this.cohere = new CohereClient({ token: cohereKey });
    }
  }

  public setActiveModel(modelId: string) {
    const model = availableModels.find(m => m.id === modelId);
    if (!model) throw new Error('Modelo não encontrado');
    if (!this.apiKeys.has(model.id)) {
      throw new Error('API key não configurada. Por favor, configure a chave de API nas configurações.');
    }
    this.activeModel = model;
  }

  public async analyze(text: string): Promise<AIAnalysisResult> {
    if (!this.activeModel) throw new Error('Nenhum modelo selecionado');

    try {
      switch (this.activeModel.provider) {
        case 'OpenAI':
          return this.analyzeWithOpenAI(text);
        case 'Anthropic':
          return this.analyzeWithAnthropic(text);
        case 'Cohere':
          return this.analyzeWithCohere(text);
        case 'AI21':
          return this.analyzeWithAI21(text);
        default:
          throw new Error('Provedor não suportado');
      }
    } catch (error) {
      console.error('Erro na análise:', error);
      throw new Error('Erro ao analisar o documento. Por favor, tente novamente.');
    }
  }

  private async analyzeWithOpenAI(text: string): Promise<AIAnalysisResult> {
    if (!this.openai) throw new Error('Cliente OpenAI não inicializado');

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de documentos. Analise o texto fornecido e extraia informações relevantes."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    return {
      text,
      fields: [],
      documentType: 'contract',
      metadata: response.choices[0].message
    };
  }

  private async analyzeWithAnthropic(text: string): Promise<AIAnalysisResult> {
    if (!this.anthropic) throw new Error('Cliente Anthropic não inicializado');

    const response = await this.anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Analise este documento e extraia informações relevantes: ${text}`
      }]
    });

    return {
      text,
      fields: [],
      documentType: 'contract',
      metadata: response
    };
  }

  private async analyzeWithCohere(text: string): Promise<AIAnalysisResult> {
    if (!this.cohere) throw new Error('Cliente Cohere não inicializado');

    const response = await this.cohere.generate({
      prompt: `Analise este documento e extraia informações relevantes: ${text}`,
      model: 'command',
      maxTokens: 1024
    });

    return {
      text,
      fields: [],
      documentType: 'contract',
      metadata: response
    };
  }

  private async analyzeWithAI21(text: string): Promise<AIAnalysisResult> {
    const apiKey = this.apiKeys.get('j2-ultra');
    if (!apiKey) throw new Error('API key AI21 não encontrada');

    const response = await axios.post(
      'https://api.ai21.com/studio/v1/j2-ultra/complete',
      {
        prompt: `Analise este documento e extraia informações relevantes: ${text}`,
        maxTokens: 1024,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      text,
      fields: [],
      documentType: 'contract',
      metadata: response.data
    };
  }
}

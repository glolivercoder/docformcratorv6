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
    availableModels.forEach(model => {
      const apiKey = process.env[model.apiKeyEnvVar];
      if (apiKey) {
        this.apiKeys.set(model.id, apiKey);
      }
    });
  }

  private initializeClients() {
    const openaiKey = this.apiKeys.get('gpt-4');
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }

    const anthropicKey = this.apiKeys.get('claude-3');
    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }

    const cohereKey = this.apiKeys.get('command');
    if (cohereKey) {
      this.cohere = new CohereClient({ token: cohereKey });
    }
  }

  public setActiveModel(modelId: string) {
    const model = availableModels.find(m => m.id === modelId);
    if (!model) throw new Error('Modelo não encontrado');
    if (!this.apiKeys.has(model.id)) throw new Error('API key não configurada');
    this.activeModel = model;
  }

  public async analyze(text: string): Promise<AIAnalysisResult> {
    if (!this.activeModel) throw new Error('Nenhum modelo selecionado');

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

    // Processar resposta
    return {
      text,
      fields: [],
      documentType: 'contract'
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

    // Processar resposta
    return {
      text,
      fields: [],
      documentType: 'contract'
    };
  }

  private async analyzeWithCohere(text: string): Promise<AIAnalysisResult> {
    if (!this.cohere) throw new Error('Cliente Cohere não inicializado');

    const response = await this.cohere.generate({
      prompt: `Analise este documento e extraia informações relevantes: ${text}`,
      model: 'command',
      maxTokens: 1024
    });

    // Processar resposta
    return {
      text,
      fields: [],
      documentType: 'contract'
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

    // Processar resposta
    return {
      text,
      fields: [],
      documentType: 'contract'
    };
  }
}

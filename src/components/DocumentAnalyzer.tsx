import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ModelSelector } from './ai/ModelSelector';
import { AIService } from '@/services/AIService';
import { AIAnalysisResult } from '@/types/ai';
import { Loader2, FileText } from 'lucide-react';

function DocumentAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const { toast } = useToast();
  const aiService = AIService.getInstance();

  const handleModelSelect = (modelId: string) => {
    try {
      aiService.setActiveModel(modelId);
      toast({
        title: 'Modelo selecionado',
        description: 'O modelo de IA foi configurado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao configurar modelo',
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // Primeiro, extrair o texto do arquivo
      const text = await extractTextFromFile(file);
      
      // Analisar com o modelo de IA selecionado
      const analysisResult = await aiService.analyze(text);
      setResult(analysisResult);
      
      toast({
        title: 'Análise concluída',
        description: 'O documento foi analisado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao analisar documento',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Implementar extração de texto baseada no tipo de arquivo
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModelSelector onModelSelect={handleModelSelect} />

        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Upload de Documento</h3>
          
          <div className="space-y-4">
            <Input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
              disabled={isAnalyzing}
            />

            {isAnalyzing && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Analisando documento...</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {result && (
        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Resultado da Análise</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Tipo de Documento</h4>
              <p>{result.documentType}</p>
            </div>

            <div>
              <h4 className="font-medium">Campos Detectados</h4>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {result.fields.map((field, index) => (
                  <div key={index} className="p-2 bg-secondary rounded">
                    <p className="font-medium">{field.name}</p>
                    <p className="text-sm">{field.value}</p>
                    <p className="text-xs text-gray-500">
                      Confiança: {(field.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default DocumentAnalyzer;

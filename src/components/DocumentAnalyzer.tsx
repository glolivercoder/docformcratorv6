import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ModelSelector } from './ai/ModelSelector';
import { AIService } from '@/services/AIService';
import { AIAnalysisResult } from '@/types/ai';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useDropzone } from 'react-dropzone';

interface ExtractedData {
  nome?: string;
  cpf?: string;
  rg?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  [key: string]: string | undefined;
}

const fieldOptions = [
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'comprador', label: 'Comprador' },
  { value: 'conjuge_vendedor', label: 'Cônjuge do Vendedor' },
  { value: 'conjuge_comprador', label: 'Cônjuge do Comprador' },
];

function DocumentAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const { toast } = useToast();

  const handleModelSelect = (modelId: string) => {
    try {
      const aiService = AIService.getInstance();
      aiService.setActiveModel(modelId);
      setError(null);
      toast({
        title: 'Modelo selecionado',
        description: 'O modelo de IA foi configurado com sucesso.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao configurar modelo';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const text = await extractTextFromFile(file);
      const aiService = AIService.getInstance();
      const analysisResult = await aiService.analyze(text);
      
      setResult(analysisResult);
      toast({
        title: 'Análise concluída',
        description: 'O documento foi analisado com sucesso.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao analisar documento';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };
      reader.readAsText(file);
    });
  };

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Simular extração de dados do OCR
        simulateOcrExtraction();
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

  const simulateOcrExtraction = () => {
    // Simulação de dados extraídos do OCR
    const mockData: ExtractedData = {
      nome: 'João da Silva',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      endereco: 'Rua Exemplo, 123',
      telefone: '(11) 98765-4321',
      email: 'joao@exemplo.com'
    };
    setExtractedData(mockData);
    setIsDialogOpen(true);
  };

  const handleFieldSelect = () => {
    if (selectedField) {
      toast({
        title: 'Campo selecionado',
        description: `Os dados serão preenchidos no campo: ${selectedField}`,
      });
      setIsDialogOpen(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    try {
      const { field, value } = JSON.parse(data);
      // Aqui você pode implementar a lógica para preencher o campo específico
      toast({
        title: 'Campo preenchido',
        description: `${field}: ${value}`,
      });
    } catch (error) {
      console.error('Erro ao processar dados arrastados:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModelSelector onModelSelect={handleModelSelect} />

        <Card className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Upload de Documento</h3>
          
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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

        <Card>
          <CardHeader>
            <CardTitle>Análise de Imagem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer">
                <input {...getInputProps()} />
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p>Arraste uma imagem ou clique para selecionar</p>
                  <p className="text-sm text-gray-500">Suporta JPG, JPEG, PNG</p>
                </div>
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <img src={imagePreview} alt="Preview" className="max-w-full h-auto rounded-lg" />
                </div>
              )}

              <div 
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="grid gap-4 p-4 border rounded-lg"
              >
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input id="rg" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input id="endereco" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" />
                </div>
              </div>
            </div>
          </CardContent>
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

            {result.metadata && (
              <div>
                <h4 className="font-medium">Análise Detalhada</h4>
                <pre className="mt-2 p-4 bg-secondary rounded overflow-auto max-h-96">
                  {JSON.stringify(result.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Campo para Preenchimento</DialogTitle>
            <DialogDescription>
              Escolha qual parte do formulário você deseja preencher com os dados extraídos.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Select onValueChange={setSelectedField} value={selectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o campo" />
              </SelectTrigger>
              <SelectContent>
                {fieldOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-between">
              <Button onClick={handleFieldSelect} disabled={!selectedField}>
                Confirmar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Ver Dados Extraídos
              </Button>
            </div>
          </div>

          <div className="mt-4 border rounded-lg p-4">
            <h4 className="font-medium mb-2">Dados Extraídos</h4>
            <div className="space-y-2">
              {Object.entries(extractedData).map(([field, value]) => (
                <div
                  key={field}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ field, value }));
                  }}
                  className="p-2 border rounded cursor-move hover:bg-secondary"
                >
                  <span className="font-medium">{field}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DocumentAnalyzer;

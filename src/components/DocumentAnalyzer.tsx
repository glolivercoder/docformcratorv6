import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { OcrService } from '@/services/OcrService';

interface ExtractedFields {
  [key: string]: {
    value: string;
    confidence: number;
  };
}

interface FormData {
  [key: string]: string;
}

const fieldOptions = [
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'comprador', label: 'Comprador' },
  { value: 'conjuge_vendedor', label: 'Cônjuge do Vendedor' },
  { value: 'conjuge_comprador', label: 'Cônjuge do Comprador' },
];

export default function DocumentAnalyzer() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedFields>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({});
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Limpar worker do Tesseract ao desmontar
      OcrService.getInstance().terminate();
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setError(null);
        setIsProcessing(true);
        
        // Mostrar preview da imagem
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Processar OCR
        await processOcrData(file);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao processar a imagem';
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: 'Erro no processamento',
          description: errorMessage,
        });
        setShowConfirmation(true); // Mostrar diálogo mesmo com erro
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const processOcrData = async (file: File) => {
    try {
      const ocrService = OcrService.getInstance();
      const result = await ocrService.extractText(file);
      
      if (!result.fields || Object.keys(result.fields).length === 0) {
        throw new Error('Não foi possível extrair dados da imagem');
      }

      setExtractedData(result.fields);
      
      // Tentar preencher campos automaticamente
      const success = await fillFormFields(result.fields);
      
      if (!success) {
        // Se não conseguiu preencher todos os campos, mostra confirmação
        setShowConfirmation(true);
      } else {
        toast({
          title: 'Processamento concluído',
          description: 'Os campos foram preenchidos automaticamente.',
        });
      }
    } catch (err) {
      console.error('Erro no OCR:', err);
      setError('Erro ao processar OCR. Verifique a qualidade da imagem.');
      setShowConfirmation(true);
    }
  };

  const fillFormFields = async (fields: ExtractedFields): Promise<boolean> => {
    try {
      const newFormData = { ...formData };
      let allFieldsFilled = true;

      Object.entries(fields).forEach(([field, data]) => {
        if (data.value && data.value.trim().length > 0 && data.confidence > 0.7) {
          newFormData[field] = data.value;
        } else {
          allFieldsFilled = false;
        }
      });

      setFormData(newFormData);
      return allFieldsFilled;
    } catch (err) {
      console.error('Erro ao preencher campos:', err);
      return false;
    }
  };

  const handleFieldSelect = () => {
    if (selectedField && extractedData) {
      const newFormData = { ...formData };
      
      // Mapear campos do OCR para campos do formulário
      const fieldMapping: { [key: string]: string[] } = {
        vendedor: ['nome', 'cpf', 'rg', 'endereco'],
        comprador: ['nome', 'cpf', 'rg', 'endereco'],
        conjuge_vendedor: ['nome', 'cpf', 'rg'],
        conjuge_comprador: ['nome', 'cpf', 'rg']
      };

      const fieldsToMap = fieldMapping[selectedField] || [];
      let fieldsUpdated = false;

      fieldsToMap.forEach(field => {
        if (extractedData[field]?.value) {
          newFormData[`${selectedField}_${field}`] = extractedData[field].value;
          fieldsUpdated = true;
        }
      });

      if (fieldsUpdated) {
        setFormData(newFormData);
        toast({
          title: 'Campos preenchidos',
          description: `Os dados foram preenchidos para: ${fieldOptions.find(f => f.value === selectedField)?.label}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Dados insuficientes',
          description: 'Não foram encontrados dados suficientes para preencher os campos.',
        });
      }
      setIsDialogOpen(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, fieldId: string) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      setFormData(prev => ({
        ...prev,
        [fieldId]: data.value
      }));
      toast({
        title: 'Campo atualizado',
        description: `${fieldId}: ${data.value}`,
      });
    } catch (error) {
      console.error('Erro ao processar dados arrastados:', error);
    }
  };

  const renderField = (id: string, label: string) => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={formData[id] || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, [id]: e.target.value }))}
        onDrop={(e) => handleDrop(e, id)}
        onDragOver={(e) => e.preventDefault()}
        className="border-dashed border-2 hover:border-primary"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análise de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                Selecionar Imagem
              </Button>
            </div>

            {isProcessing ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
                <p className="mt-2">Processando imagem...</p>
              </div>
            ) : (
              <>
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p>Arraste uma imagem ou clique para selecionar</p>
                  <p className="text-sm text-gray-500">Suporta JPG, JPEG, PNG</p>
                </div>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="max-w-full h-auto rounded-lg" />
              </div>
            )}

            <div className="grid gap-4 p-4 border rounded-lg">
              {renderField('nome', 'Nome')}
              {renderField('cpf', 'CPF')}
              {renderField('rg', 'RG')}
              {renderField('endereco', 'Endereço')}
              {renderField('telefone', 'Telefone')}
              {renderField('email', 'Email')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmação de Dados</DialogTitle>
            <DialogDescription>
              {error 
                ? 'Houve um problema ao processar a imagem. Deseja ver os dados que conseguimos extrair para preenchimento manual?' 
                : 'Alguns campos não puderam ser preenchidos automaticamente. Deseja ver os dados extraídos para preenchimento manual?'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Não
            </Button>
            <Button 
              onClick={() => {
                setShowConfirmation(false);
                setIsDialogOpen(true);
              }}
            >
              Ver Dados Extraídos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dados Extraídos do Documento</DialogTitle>
            <DialogDescription>
              Arraste os dados para os campos correspondentes ou selecione um tipo de pessoa para preenchimento automático.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Select onValueChange={setSelectedField} value={selectedField}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de pessoa" />
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
                Preencher Campos
              </Button>
            </div>

            <div className="mt-4 border rounded-lg p-4">
              <h4 className="font-medium mb-2">Dados Extraídos (arraste para os campos)</h4>
              <div className="grid gap-2">
                {Object.entries(extractedData).map(([field, data]) => (
                  <div
                    key={field}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify({ field, value: data.value }));
                    }}
                    className="p-2 border rounded cursor-move hover:bg-secondary"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{field}:</span>
                      <span className="text-sm text-gray-500">
                        Confiança: {Math.round(data.confidence * 100)}%
                      </span>
                    </div>
                    <div>{data.value || 'Não detectado'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

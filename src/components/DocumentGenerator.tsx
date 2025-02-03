import React, { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, FileUp, Plus, Search } from "lucide-react";
import DocumentForm from "./DocumentForm";
import { ApiKeyManager } from "./ApiKeyManager";
import { DocumentCategory, DocumentType } from "@/types/documents";
import { useToast } from "@/components/ui/use-toast";
import { OCRFieldSelectDialog } from "./dialogs/OCRFieldSelectDialog";
import { OCRSelectionArea } from "./OCRSelectionArea";
import { OcrService } from "@/services/OcrService";

function DocumentGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>();
  const [selectedType, setSelectedType] = useState<DocumentType>();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [showFieldSelect, setShowFieldSelect] = useState(false);
  const [showOCRSelection, setShowOCRSelection] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [selectedField, setSelectedField] = useState('');
  const [currentFormData, setCurrentFormData] = useState<Record<string, any>>({});

  const categories = [
    { value: DocumentCategory.CONTRACT, label: "Contratos" },
    { value: DocumentCategory.AUTHORIZATION, label: "Autorizações" },
    { value: DocumentCategory.LETTER, label: "Cartas" },
    { value: DocumentCategory.DECLARATION, label: "Declarações" },
  ];

  const getDocumentTypes = (category: DocumentCategory) => {
    switch (category) {
      case DocumentCategory.CONTRACT:
        return [
          { value: DocumentType.LEASE_CONTRACT, label: "Contrato de Locação" },
          { value: DocumentType.SALE_CONTRACT, label: "Contrato de Venda" },
          { value: DocumentType.MANAGEMENT_CONTRACT, label: "Contrato de Administração" },
        ];
      case DocumentCategory.LETTER:
        return [
          { value: DocumentType.GUARANTEE_LETTER, label: "Carta de Recomendação" },
          { value: DocumentType.RESIGNATION_LETTER, label: "Carta de Demissão" },
        ];
      default:
        return [];
    }
  };

  const handleCaptureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      
      const imageUrl = canvas.toDataURL('image/jpeg');
      stream.getTracks().forEach(track => track.stop());
      
      setShowFieldSelect(true);
      setCapturedImage(imageUrl);
    } catch (error) {
      console.error('Error capturing image:', error);
      toast({
        variant: "destructive",
        title: "Erro ao capturar imagem",
        description: "Verifique se sua câmera está disponível.",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setCapturedImage(imageUrl);
        setShowFieldSelect(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error loading image:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar imagem",
        description: "Não foi possível carregar a imagem selecionada.",
      });
    }
  };

  const handleFieldSelect = async (field: string) => {
    setSelectedField(field);
    setShowFieldSelect(false);
    setShowOCRSelection(true); // Mostrar seleção OCR imediatamente

    toast({
      title: "Processando documento...",
      description: "Aguarde enquanto fazemos o OCR automático",
    });

    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'captured_image.png', { type: 'image/png' });
      
      const ocrService = OcrService.getInstance();
      const result = await ocrService.extractText(file);
      
      if (result.text) {
        toast({
          title: "OCR Automático",
          description: "Texto extraído! Selecione a área para confirmar.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "OCR falhou",
          description: "Não foi possível extrair texto automaticamente. Use a seleção manual.",
        });
      }
    } catch (error) {
      console.error('Erro no OCR:', error);
      toast({
        variant: "destructive",
        title: "Erro no OCR",
        description: "Ocorreu um erro no processamento. Use a seleção manual.",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setSelectedType(undefined)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Modelo de Documento
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCaptureImage}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" /> Capturar
          </Button>

          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <FileUp className="w-4 h-4" /> Carregar Imagem
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button variant="outline">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          value={selectedCategory?.toString()}
          onValueChange={(value) => setSelectedCategory(value as DocumentCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedType?.toString()}
          onValueChange={(value) => setSelectedType(value as DocumentType)}
          disabled={!selectedCategory}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Documento" />
          </SelectTrigger>
          <SelectContent>
            {selectedCategory &&
              getDocumentTypes(selectedCategory).map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {selectedType && (
        <Card className="p-6">
          <DocumentForm
            documentType={selectedType}
            onFormDataChange={setCurrentFormData}
          />
        </Card>
      )}

      <OCRFieldSelectDialog
        open={showFieldSelect}
        onOpenChange={setShowFieldSelect}
        documentType={selectedType || DocumentType.LEASE_CONTRACT}
        onFieldSelect={handleFieldSelect}
      />

      {showOCRSelection && (
        <OCRSelectionArea
          imageUrl={capturedImage}
          open={showOCRSelection}
          onOpenChange={setShowOCRSelection}
          onSelect={(text, field) => {
            const formRef = document.querySelector('form');
            if (formRef) {
              const input = formRef.querySelector(`input[name="${field}"]`) as HTMLInputElement;
              if (input) {
                input.value = text;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
            setShowOCRSelection(false);
          }}
          availableFields={[
            { label: 'Nome Completo', value: `${selectedField}.nomeCompleto` },
            { label: 'CPF', value: `${selectedField}.cpf` },
            { label: 'RG/Documento', value: `${selectedField}.numeroDocumento` },
            { label: 'Órgão Expedidor', value: `${selectedField}.orgaoExpedidor` },
            { label: 'Data de Expedição', value: `${selectedField}.dataExpedicao` },
            { label: 'Data de Nascimento', value: `${selectedField}.dataNascimento` },
            { label: 'Naturalidade', value: `${selectedField}.naturalidade` },
            { label: 'Filiação', value: `${selectedField}.filiacao` },
          ]}
        />
      )}
    </div>
  );
}

export default DocumentGenerator;

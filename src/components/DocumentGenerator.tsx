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
import { DocumentForm } from "./DocumentForm";
import { ApiKeyManager } from "./ApiKeyManager";
import { DocumentCategory, DocumentType } from "@/types/documents";
import { useToast } from "@/components/ui/use-toast";
import { processImageWithGemini } from "@/utils/geminiVision";
import { OCRSelectionDialog } from "./OCRSelectionDialog";

const categories = [
  { value: DocumentCategory.REAL_ESTATE, label: "Documentos Imobiliários" },
  { value: DocumentCategory.CONTRACT, label: "Contratos" },
  { value: DocumentCategory.AUTHORIZATION, label: "Autorizações" },
  { value: DocumentCategory.LETTER, label: "Cartas" },
  { value: DocumentCategory.DECLARATION, label: "Declarações" },
];

const getDocumentTypes = (category: DocumentCategory) => {
  switch (category) {
    case DocumentCategory.REAL_ESTATE:
      return [
        { value: DocumentType.LEASE_CONTRACT, label: "Contrato de Locação" },
        { value: DocumentType.SALE_CONTRACT, label: "Contrato de Venda" },
        { value: DocumentType.MANAGEMENT_CONTRACT, label: "Contrato de Administração" },
      ];
    case DocumentCategory.LETTER:
      return [
        { value: DocumentType.GUARANTEE_LETTER, label: "Carta de Fiança" },
        { value: DocumentType.RENT_ADJUSTMENT_LETTER, label: "Carta de Reajuste" },
      ];
    case DocumentCategory.AUTHORIZATION:
      return [
        { value: DocumentType.PROPERTY_SHOWING_AUTH, label: "Autorização de Visita" },
        { value: DocumentType.SALE_AUTH, label: "Autorização de Venda" },
      ];
    case DocumentCategory.DECLARATION:
      return [
        { value: DocumentType.RESIDENCE_DECLARATION, label: "Declaração de Residência" },
        { value: DocumentType.PAYMENT_DECLARATION, label: "Declaração de Pagamento" },
      ];
    default:
      return [];
  }
};

export const DocumentGenerator = () => {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>();
  const [selectedType, setSelectedType] = useState<DocumentType>();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [showOCRDialog, setShowOCRDialog] = useState(false);
  const [ocrData, setOCRData] = useState<Record<string, any>>({});
  const [currentFormData, setCurrentFormData] = useState<Record<string, any>>({});

  const handleNewCategory = () => {
    console.log("New category button clicked");
    toast({
      title: "Em desenvolvimento",
      description: "A criação de novas categorias estará disponível em breve.",
    });
  };

  const handleImageCapture = async (file: File) => {
    try {
      console.log("Starting document analysis with Gemini Vision");
      toast({
        title: "Processando documento",
        description: "Aguarde enquanto extraímos as informações...",
      });

      const extractedData = await processImageWithGemini(file);
      console.log("Extracted data from Gemini:", extractedData);

      if (!extractedData || Object.keys(extractedData).length === 0) {
        console.error("No data could be extracted from the image");
        toast({
          variant: "destructive",
          title: "Erro na extração",
          description: "Não foi possível extrair dados da imagem. Tente uma foto com melhor qualidade.",
        });
        return;
      }

      setOCRData(extractedData);
      setShowOCRDialog(true);
      
      toast({
        title: "Dados extraídos com sucesso!",
        description: "Por favor, confirme se os dados estão corretos.",
      });
    } catch (error) {
      console.error("Document analysis error:", error);
      toast({
        variant: "destructive",
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar o documento. Tente novamente.",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageCapture(file);
    }
  };

  const captureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("Camera access granted:", stream);
      
      // Aqui você implementaria a lógica de captura da imagem
      toast({
        title: "Câmera ativada",
        description: "Posicione o documento no centro da tela.",
      });
    } catch (error) {
      console.error("Camera access error:", error);
      toast({
        variant: "destructive",
        title: "Erro de acesso",
        description: "Não foi possível acessar a câmera.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <ApiKeyManager />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button onClick={captureImage} variant="outline" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Capturar Imagem
          </Button>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <FileUp className="w-4 h-4" />
              Carregar Imagem
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleNewCategory} variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <Select onValueChange={(value) => setSelectedCategory(value as DocumentCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {selectedCategory && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <Select onValueChange={(value) => setSelectedType(value as DocumentType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {getDocumentTypes(selectedCategory).map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedType && (
        <DocumentForm
          documentType={selectedType}
          onFormDataChange={setCurrentFormData}
        />
      )}

      <OCRSelectionDialog
        open={showOCRDialog}
        onOpenChange={setShowOCRDialog}
        ocrData={ocrData}
        formData={currentFormData}
        onSelection={(field, value) => {
          console.log("Selected OCR data:", { field, value });
          // Implementar a lógica de seleção
        }}
      />
    </div>
  );
};

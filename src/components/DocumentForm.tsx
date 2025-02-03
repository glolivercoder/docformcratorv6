import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/types/documents";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FileDown, Image, Printer, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { documentTypes, formatarDataPorExtenso } from "@/utils/documentTypes";
import { DocumentSection } from "./form/DocumentSection";
import { OCRFieldSelectDialog } from "./dialogs/OCRFieldSelectDialog";
import { OCRSelectionArea } from "./OCRSelectionArea";
import { databaseService } from "@/utils/database";
import cep from 'cep-promise';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DocumentFormProps {
  documentType: DocumentType;
  onFormDataChange?: (data: Record<string, any>) => void;
}

const DocumentForm = ({ documentType, onFormDataChange }: DocumentFormProps) => {
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();
  const [useSystemDate, setUseSystemDate] = useState(false);
  const [showFieldSelect, setShowFieldSelect] = useState(false);
  const [showOCRSelection, setShowOCRSelection] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [selectedField, setSelectedField] = useState('');
  const [incluirConjugeLocador, setIncluirConjugeLocador] = useState(true);
  const [incluirConjugeLocatario, setIncluirConjugeLocatario] = useState(false);

  useEffect(() => {
    const docType = documentType === DocumentType.LEASE_CONTRACT ? 'contratoLocacao' 
                  : documentType === DocumentType.SALE_CONTRACT ? 'contratoVenda'
                  : 'recibo';
    const initialData = documentTypes[docType].fields;
    setFormData(initialData);
    onFormDataChange?.(initialData);
  }, [documentType]);

  useEffect(() => {
    if (useSystemDate) {
      const currentDate = formatarDataPorExtenso(new Date());
      handleInputChange('dataPorExtenso', currentDate);
    }
  }, [useSystemDate]);

  const handleInputChange = async (field: string, value: any, parent: string | null = null) => {
    // Se o campo for CEP, buscar endereço
    if (field === 'cep' && value.length === 8) {
      try {
        const address = await cep(value);
        const newValue = {
          cep: value,
          endereco: `${address.street}, ${address.neighborhood}`,
          cidade: address.city,
          estado: address.state,
        };
        
        setFormData(prev => {
          const newData = parent ? {
            ...prev,
            [parent]: {
              ...prev[parent],
              ...newValue
            }
          } : {
            ...prev,
            ...newValue
          };
          
          onFormDataChange?.(newData);
          return newData;
        });

        toast({
          title: "Endereço encontrado",
          description: "Os campos foram preenchidos automaticamente.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao buscar CEP",
          description: "Verifique se o CEP está correto.",
        });
      }
      return;
    }

    setFormData(prev => {
      const newData = parent ? {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      } : {
        ...prev,
        [field]: value
      };
      
      onFormDataChange?.(newData);
      return newData;
    });
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
      
      setCapturedImage(imageUrl);
      setShowFieldSelect(true);
    } catch (error) {
      console.error('Error capturing image:', error);
      toast({
        variant: "destructive",
        title: "Erro ao capturar imagem",
        description: "Verifique se sua câmera está disponível.",
      });
    }
  };

  const handleFieldSelect = async (field: string) => {
    setSelectedField(field);
    setShowFieldSelect(false);
    setShowOCRSelection(true);
  };

  const handleOCRResult = async (text: string, field: string) => {
    const fieldParts = field.split('.');
    const parent = fieldParts.length > 1 ? fieldParts[0] : null;
    const actualField = fieldParts.length > 1 ? fieldParts[1] : field;

    handleInputChange(actualField, text, parent);

    // Salvar no banco de dados
    try {
      const userDocument = {
        userId: 1, // Você precisará implementar um sistema de gestão de usuários
        documentType: formData[parent]?.tipoDocumento || '',
        documentNumber: formData[parent]?.numeroDocumento || '',
        documentFields: {
          [actualField]: text
        },
        issuingBody: formData[parent]?.orgaoExpedidor || '',
        issueDate: formData[parent]?.dataExpedicao || '',
        birthDate: formData[parent]?.dataNascimento || '',
        birthPlace: formData[parent]?.naturalidade || '',
        filiation: formData[parent]?.filiacao || '',
        fullName: formData[parent]?.nomeCompleto || '',
        cpf: formData[parent]?.cpf || '',
        profession: formData[parent]?.profissao || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await databaseService.saveUserDocument(userDocument);
      
      toast({
        title: "Documento salvo",
        description: "As informações foram salvas no banco de dados.",
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar documento",
        description: "Não foi possível salvar as informações no banco de dados.",
      });
    }
  };

  const generatePDF = async () => {
    const element = document.getElementById("document-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, 190, 277);
      pdf.save(`documento-${Date.now()}.pdf`);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: "O documento foi salvo no seu computador.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o documento.",
      });
    }
  };

  const generateImage = async () => {
    const element = document.getElementById("document-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement("a");
      link.download = `documento-${Date.now()}.jpeg`;
      link.href = canvas.toDataURL("image/jpeg");
      link.click();
      
      toast({
        title: "Imagem gerada com sucesso!",
        description: "A imagem foi salva no seu computador.",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar imagem",
        description: "Ocorreu um erro ao gerar a imagem.",
      });
    }
  };

  const renderConjugeSection = (parentField: string, isOptional: boolean = false, includeConjuge: boolean = true, setIncludeConjuge?: (value: boolean) => void) => {
    const conjugeField = `conjuge${parentField.charAt(0).toUpperCase() + parentField.slice(1)}`;
    
    if (!formData[parentField]?.[conjugeField]) return null;

    return (
      <AccordionItem value={`conjuge-${parentField}`}>
        <AccordionTrigger className="text-left">
          Informações do Cônjuge
          {isOptional && (
            <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id={`incluir-conjuge-${parentField}`}
                checked={includeConjuge}
                onCheckedChange={(checked) => setIncludeConjuge?.(checked as boolean)}
              />
              <label
                htmlFor={`incluir-conjuge-${parentField}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Incluir Cônjuge
              </label>
            </div>
          )}
        </AccordionTrigger>
        <AccordionContent>
          {(!isOptional || includeConjuge) && (
            <DocumentSection
              fields={formData[parentField][conjugeField]}
              parent={`${parentField}.${conjugeField}`}
              onInputChange={handleInputChange}
              useSystemDate={useSystemDate}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="useSystemDate"
            checked={useSystemDate}
            onCheckedChange={(checked) => setUseSystemDate(checked as boolean)}
          />
          <Label htmlFor="useSystemDate">Usar data do sistema</Label>
        </div>

        <Accordion type="multiple" className="w-full space-y-4">
          {documentType === DocumentType.LEASE_CONTRACT && (
            <>
              <AccordionItem value="locador">
                <AccordionTrigger>Informações do Locador</AccordionTrigger>
                <AccordionContent>
                  <DocumentSection
                    fields={formData.locador}
                    parent="locador"
                    onInputChange={handleInputChange}
                    useSystemDate={useSystemDate}
                  />
                  {renderConjugeSection('locador', true, incluirConjugeLocador, setIncluirConjugeLocador)}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="locatario">
                <AccordionTrigger>Informações do Locatário</AccordionTrigger>
                <AccordionContent>
                  <DocumentSection
                    fields={formData.locatario}
                    parent="locatario"
                    onInputChange={handleInputChange}
                    useSystemDate={useSystemDate}
                  />
                  {renderConjugeSection('locatario', true, incluirConjugeLocatario, setIncluirConjugeLocatario)}
                </AccordionContent>
              </AccordionItem>
            </>
          )}

          {documentType === DocumentType.SALE_CONTRACT && (
            <>
              <AccordionItem value="vendedor">
                <AccordionTrigger>Informações do Vendedor</AccordionTrigger>
                <AccordionContent>
                  <DocumentSection
                    fields={formData.vendedor}
                    parent="vendedor"
                    onInputChange={handleInputChange}
                    useSystemDate={useSystemDate}
                  />
                  {renderConjugeSection('vendedor')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="comprador">
                <AccordionTrigger>Informações do Comprador</AccordionTrigger>
                <AccordionContent>
                  <DocumentSection
                    fields={formData.comprador}
                    parent="comprador"
                    onInputChange={handleInputChange}
                    useSystemDate={useSystemDate}
                  />
                  {renderConjugeSection('comprador')}
                </AccordionContent>
              </AccordionItem>
            </>
          )}
        </Accordion>

        <div className="flex gap-2">
          <Button onClick={generatePDF} className="flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
          <Button onClick={generateImage} className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Exportar Imagem
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>

        <Card className="p-6" id="document-content">
          <div className="prose max-w-none">
            <h1 className="text-2xl font-bold text-center mb-6">
              {documentType === DocumentType.LEASE_CONTRACT
                ? "Contrato de Locação"
                : documentType === DocumentType.SALE_CONTRACT
                ? "Contrato de Venda"
                : "Documento"}
            </h1>
            
            <div className="space-y-4">
              {Object.entries(formData).map(([section, data]: [string, any]) => (
                <div key={section}>
                  <h2 className="text-xl font-semibold">
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </h2>
                  {Object.entries(data).map(([field, value]: [string, any]) => (
                    typeof value !== 'object' && (
                      <p key={field} className="mb-2">
                        <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {value}
                      </p>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <OCRFieldSelectDialog
          open={showFieldSelect}
          onOpenChange={setShowFieldSelect}
          documentType={documentType}
          onFieldSelect={handleFieldSelect}
        />

        {showOCRSelection && (
          <OCRSelectionArea
            imageUrl={capturedImage}
            open={showOCRSelection}
            onOpenChange={setShowOCRSelection}
            onSelect={handleOCRResult}
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
    </div>
  );
};

export default DocumentForm;

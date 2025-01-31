import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/types/documents";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FileDown, Image, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { documentTypes, formatarDataPorExtenso } from "@/utils/documentTypes";
import { DocumentSection } from "./form/DocumentSection";
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

export const DocumentForm = ({ documentType, onFormDataChange }: DocumentFormProps) => {
  const [formData, setFormData] = useState<any>({});
  const { toast } = useToast();
  const [useSystemDate, setUseSystemDate] = useState(false);

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

  const handleInputChange = (field: string, value: any, parent: string | null = null) => {
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
    console.log("Form data updated:", { field, value, parent });
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
      
      console.log("PDF generated successfully");
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
      
      console.log("Image generated successfully");
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar imagem",
        description: "Ocorreu um erro ao gerar a imagem.",
      });
    }
  };

  const renderAccordionSections = () => {
    return Object.entries(formData).map(([section, data]: [string, any]) => {
      if (typeof data !== 'object' || Array.isArray(data)) return null;

      return (
        <AccordionItem value={section} key={section}>
          <AccordionTrigger className="text-lg font-semibold">
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </AccordionTrigger>
          <AccordionContent>
            <DocumentSection
              fields={data}
              parent={section}
              onInputChange={handleInputChange}
              useSystemDate={useSystemDate}
            />
          </AccordionContent>
        </AccordionItem>
      );
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Formulário do Documento</h2>
        
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="useSystemDate"
            checked={useSystemDate}
            onCheckedChange={(checked: boolean) => {
              setUseSystemDate(checked);
              handleInputChange('usarDataSistema', checked, null);
            }}
          />
          <Label htmlFor="useSystemDate">
            Usar data atual do sistema
          </Label>
        </div>

        <Accordion type="single" collapsible className="mb-4">
          {renderAccordionSections()}
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
      </Card>

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
    </div>
  );
};

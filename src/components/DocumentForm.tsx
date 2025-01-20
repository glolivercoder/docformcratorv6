import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentType } from "@/types/documents";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FileDown, Image, Printer } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DocumentFormProps {
  documentType: DocumentType;
}

export const DocumentForm = ({ documentType }: DocumentFormProps) => {
  const [formData, setFormData] = useState({
    clientName: "",
    cpf: "",
    address: "",
    propertyAddress: "",
    propertyValue: "",
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data updated:", { name, value });
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

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Formulário do Documento</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cliente
            </label>
            <Input
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <Input
              name="cpf"
              value={formData.cpf}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <Input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço do Imóvel
            </label>
            <Input
              name="propertyAddress"
              value={formData.propertyAddress}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor
            </label>
            <Input
              name="propertyValue"
              value={formData.propertyValue}
              onChange={handleInputChange}
              type="number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início
            </label>
            <Input
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              type="date"
            />
          </div>
        </div>

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
          
          <p className="mb-4">
            Pelo presente instrumento particular, de um lado{" "}
            <strong>{formData.clientName}</strong>, portador do CPF{" "}
            <strong>{formData.cpf}</strong>, residente e domiciliado à{" "}
            <strong>{formData.address}</strong>, doravante denominado CONTRATANTE,
            e de outro lado...
          </p>
          
          <p className="mb-4">
            Referente ao imóvel situado à{" "}
            <strong>{formData.propertyAddress}</strong>, pelo valor de R${" "}
            <strong>{formData.propertyValue}</strong>...
          </p>
          
          {/* Add more document content based on the type */}
        </div>
      </Card>
    </div>
  );
};
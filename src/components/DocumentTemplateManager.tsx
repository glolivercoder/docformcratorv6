import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FileUp, Trash2, Edit2, Plus, Download } from "lucide-react";
import mammoth from "mammoth";
import * as pdfjsLib from 'pdfjs-dist';
import { analyzeDocument, processImage } from "@/utils/documentAnalysis";
import { processDocumentWithGemini } from "@/utils/documentGeminiAnalysis";
import { databaseService, Template } from "@/utils/database";

const mockTemplates: Template[] = [
  {
    id: 1,
    name: "Contrato de Locação",
    type: "pdf",
    fields: ["[nome_cliente]", "[cpf]", "[endereco]"],
    content: "",
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Procuração",
    type: "docx",
    fields: ["[outorgante]", "[outorgado]", "[finalidade]"],
    content: "",
    createdAt: new Date(),
  },
];

export const DocumentTemplateManager = () => {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let text = "";
      
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        text = textContent.items.map((item: any) => item.str).join(' ');
      } else if (file.type.includes("word")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (file.type.includes("image")) {
        const imageText = await processImage(file);
        text = imageText.standardizedContent; // Use standardizedContent from ExtractedFields
      } else {
        text = await file.text();
      }

      // Analyze with Gemini
      const analysis = await processDocumentWithGemini(text);
      console.log("Gemini Analysis:", analysis);

      // Save to database
      const templateId = await databaseService.saveTemplate({
        name: file.name,
        type: file.type,
        fields: analysis.fields,
        content: analysis.standardizedContent,
        createdAt: new Date()
      });

      const newTemplate: Template = {
        id: templateId,
        name: file.name,
        type: file.type,
        fields: analysis.fields,
        content: analysis.standardizedContent,
        createdAt: new Date(),
      };

      setTemplates((prev) => [...prev, newTemplate]);
      
      toast({
        title: "Modelo processado com sucesso!",
        description: "Os campos foram extraídos e padronizados automaticamente.",
      });
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        variant: "destructive",
        title: "Erro ao processar documento",
        description: "Não foi possível processar o documento.",
      });
    }
  };

  const handleExport = async (template: Template) => {
    try {
      const blob = new Blob([template.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name}-template.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Modelo exportado com sucesso!",
        description: "O arquivo foi baixado para seu computador.",
      });
    } catch (error) {
      console.error("Error exporting template:", error);
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não foi possível exportar o modelo.",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await databaseService.deleteTemplate(id.toString());
      setTemplates((prev) => prev.filter((template) => template.id !== id));
      toast({
        title: "Modelo excluído",
        description: "O modelo foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o modelo.",
      });
    }
  };

  const handleEdit = (id: number) => {
    console.log("Editing template:", id);
    toast({
      title: "Edição de modelo",
      description: "Em desenvolvimento...",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Modelos de Documento</h2>
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.rtf,.txt,.odt"
            className="hidden"
            id="template-upload"
          />
          <Button
            onClick={() => document.getElementById("template-upload")?.click()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Modelo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-gray-500">
                  {template.type} - {template.fields.length} campos
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleExport(template)}
                  title="Exportar modelo"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(template.id)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {template.fields.map((field, index) => (
                <div
                  key={index}
                  className="text-sm px-2 py-1 bg-gray-100 rounded"
                >
                  {field}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

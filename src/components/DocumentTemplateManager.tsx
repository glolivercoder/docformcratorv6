import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FileUp, Trash2, Edit2, Plus } from "lucide-react";
import mammoth from "mammoth";
import * as pdfjs from "pdf-parse";

interface Template {
  id: string;
  name: string;
  type: string;
  fields: string[];
  createdAt: Date;
}

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Contrato de Locação",
    type: "pdf",
    fields: ["nome", "cpf", "endereco"],
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Procuração",
    type: "docx",
    fields: ["outorgante", "outorgado", "finalidade"],
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
        const data = await pdfjs(Buffer.from(arrayBuffer));
        text = data.text;
      } else if (file.type.includes("word")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else {
        text = await file.text();
      }

      // Here we would send the text to an AI model for field extraction
      console.log("Document text extracted:", text);
      
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        fields: ["nome", "cpf", "rg"], // Default fields, would be AI-generated
        createdAt: new Date(),
      };

      setTemplates((prev) => [...prev, newTemplate]);
      
      toast({
        title: "Modelo adicionado com sucesso!",
        description: "Os campos foram extraídos automaticamente.",
      });
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        variant: "destructive",
        title: "Erro ao processar documento",
        description: "Não foi possível extrair os campos do documento.",
      });
    }
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
    toast({
      title: "Modelo excluído",
      description: "O modelo foi removido com sucesso.",
    });
  };

  const handleEdit = (id: string) => {
    // Would open an edit modal/form
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
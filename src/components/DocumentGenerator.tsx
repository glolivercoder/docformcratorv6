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
import { Search } from "lucide-react";
import { DocumentForm } from "./DocumentForm";
import { DocumentCategory, DocumentType } from "@/types/documents";

export const DocumentGenerator = () => {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>();
  const [selectedType, setSelectedType] = useState<DocumentType>();
  const [searchQuery, setSearchQuery] = useState("");

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
          {
            value: DocumentType.MANAGEMENT_CONTRACT,
            label: "Contrato de Administração",
          },
        ];
      case DocumentCategory.LETTER:
        return [
          {
            value: DocumentType.GUARANTEE_LETTER,
            label: "Carta de Fiança",
          },
          {
            value: DocumentType.RENT_ADJUSTMENT_LETTER,
            label: "Carta de Reajuste",
          },
        ];
      // Add other categories as needed
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
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
      </Card>

      {selectedType && <DocumentForm documentType={selectedType} />}
    </div>
  );
};
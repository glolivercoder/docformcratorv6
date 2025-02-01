import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/types/documents";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentFormProps {
  documentType: DocumentType;
  onFormDataChange?: (data: Record<string, any>) => void;
}

export const DocumentForm = ({ documentType, onFormDataChange }: DocumentFormProps) => {
  const [formData, setFormData] = useState({
    nome: "",
    nacionalidade: "",
    estadoCivil: "",
    endereco: "",
    tipoDocumento: "RG",
    rg: "",
    orgaoExpedidor: "",
    cidade: "",
    filiacao: "",
    dataEmissao: "",
    incluirConjuge: false,
    profissao: "",
    telefone: "",
    whatsapp: "",
  });

  const handleInputChange = (field: string, value: any) => {
    const newData = {
      ...formData,
      [field]: value,
    };
    setFormData(newData);
    onFormDataChange?.(newData);
    console.log(`Campo ${field} atualizado:`, value);
  };

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nacionalidade">Nacionalidade</Label>
            <Input
              id="nacionalidade"
              value={formData.nacionalidade}
              onChange={(e) => handleInputChange("nacionalidade", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="estadoCivil">Estado Civil</Label>
            <Input
              id="estadoCivil"
              value={formData.estadoCivil}
              onChange={(e) => handleInputChange("estadoCivil", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleInputChange("endereco", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
          <Select
            value={formData.tipoDocumento}
            onValueChange={(value) => handleInputChange("tipoDocumento", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RG">RG</SelectItem>
              <SelectItem value="CNH">CNH</SelectItem>
              <SelectItem value="PASSAPORTE">Passaporte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input
            id="rg"
            value={formData.rg}
            onChange={(e) => handleInputChange("rg", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orgaoExpedidor">Órgão Expedidor</Label>
          <Input
            id="orgaoExpedidor"
            value={formData.orgaoExpedidor}
            onChange={(e) => handleInputChange("orgaoExpedidor", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) => handleInputChange("cidade", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filiacao">Filiação</Label>
          <Input
            id="filiacao"
            value={formData.filiacao}
            onChange={(e) => handleInputChange("filiacao", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataEmissao">Data de Emissão</Label>
          <Input
            id="dataEmissao"
            type="date"
            value={formData.dataEmissao}
            onChange={(e) => handleInputChange("dataEmissao", e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="incluirConjuge"
            checked={formData.incluirConjuge}
            onCheckedChange={(checked) => handleInputChange("incluirConjuge", checked)}
          />
          <Label htmlFor="incluirConjuge">Incluir Cônjuge</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profissao">Profissão</Label>
          <Input
            id="profissao"
            value={formData.profissao}
            onChange={(e) => handleInputChange("profissao", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange("telefone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange("whatsapp", e.target.value)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
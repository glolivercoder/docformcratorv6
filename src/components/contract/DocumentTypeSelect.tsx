import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export enum DocumentType {
  RG = "RG",
  OAB = "OAB",
  CRECI = "CRECI",
  CNH = "CNH"
}

interface DocumentTypeSelectProps {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
  onFieldChange: (field: string, value: string) => void;
  fields: Record<string, string>;
}

export const DocumentTypeSelect = ({ value, onChange, onFieldChange, fields }: DocumentTypeSelectProps) => {
  const renderFields = () => {
    switch (value) {
      case DocumentType.RG:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={fields.rg || ""}
                onChange={(e) => onFieldChange("rg", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuingAgency">Órgão Expedidor</Label>
              <Input
                id="issuingAgency"
                value={fields.issuingAgency || ""}
                onChange={(e) => onFieldChange("issuingAgency", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={fields.city || ""}
                onChange={(e) => onFieldChange("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filiation">Filiação</Label>
              <Input
                id="filiation"
                value={fields.filiation || ""}
                onChange={(e) => onFieldChange("filiation", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Data de Emissão</Label>
              <Input
                id="issueDate"
                value={fields.issueDate || ""}
                onChange={(e) => onFieldChange("issueDate", e.target.value)}
              />
            </div>
          </>
        );
      case DocumentType.CRECI:
        return (
          <div className="space-y-2">
            <Label htmlFor="creciNumber">Número do CRECI</Label>
            <Input
              id="creciNumber"
              value={fields.creciNumber || ""}
              onChange={(e) => onFieldChange("creciNumber", e.target.value)}
            />
          </div>
        );
      case DocumentType.OAB:
        return (
          <div className="space-y-2">
            <Label htmlFor="oabNumber">Número da OAB</Label>
            <Input
              id="oabNumber"
              value={fields.oabNumber || ""}
              onChange={(e) => onFieldChange("oabNumber", e.target.value)}
            />
          </div>
        );
      case DocumentType.CNH:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="cnhNumber">Número da CNH</Label>
              <Input
                id="cnhNumber"
                value={fields.cnhNumber || ""}
                onChange={(e) => onFieldChange("cnhNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={fields.category || ""}
                onChange={(e) => onFieldChange("category", e.target.value)}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Documento</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-32">
              <SelectItem value={DocumentType.RG}>RG</SelectItem>
              <SelectItem value={DocumentType.OAB}>OAB</SelectItem>
              <SelectItem value={DocumentType.CRECI}>CRECI</SelectItem>
              <SelectItem value={DocumentType.CNH}>CNH</SelectItem>
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
      {renderFields()}
    </div>
  );
};
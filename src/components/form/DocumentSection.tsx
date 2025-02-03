import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentSectionProps {
  fields: Record<string, any>;
  parent: string | null;
  onInputChange: (field: string, value: any, parent: string | null) => void;
  useSystemDate?: boolean;
}

const tiposDocumento = [
  { value: 'RG', label: 'RG' },
  { value: 'CNH', label: 'CNH' },
  { value: 'CRECI', label: 'CRECI', profissao: 'Corretor Imobiliário' },
  { value: 'OAB', label: 'OAB', profissao: 'Advogado' },
  { value: 'CREA', label: 'CREA', profissao: 'Engenheiro' },
  { value: 'CREF', label: 'CREF', profissao: 'Educador Físico' }
];

export const DocumentSection = ({ fields, parent, onInputChange, useSystemDate }: DocumentSectionProps) => {
  const handleTipoDocumentoChange = (value: string) => {
    onInputChange('tipoDocumento', value, parent);
    const tipoDoc = tiposDocumento.find(tipo => tipo.value === value);
    if (tipoDoc?.profissao) {
      onInputChange('profissao', tipoDoc.profissao, parent);
    }
  };

  const renderField = (fieldName: string, value: any) => {
    if (fieldName === 'usarDataSistema') return null;

    if (fieldName === 'tipoDocumento') {
      return (
        <div key={fieldName} className="mb-4">
          <Label htmlFor={`${parent}-${fieldName}`}>
            Tipo de Documento
          </Label>
          <Select
            value={value}
            onValueChange={handleTipoDocumentoChange}
          >
            <SelectTrigger id={`${parent}-${fieldName}`}>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposDocumento.map(tipo => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    const isDate = fieldName === 'dataExpedicao' || fieldName === 'dataNascimento';
    
    return (
      <div key={fieldName} className="mb-4">
        <Label htmlFor={`${parent}-${fieldName}`}>
          {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
        </Label>
        <Input
          id={`${parent}-${fieldName}`}
          type={isDate ? 'date' : 'text'}
          value={value}
          onChange={(e) => onInputChange(fieldName, e.target.value, parent)}
          disabled={fieldName === 'dataPorExtenso' && useSystemDate || fieldName === 'profissao'}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {Object.entries(fields).map(([fieldName, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          return null;
        }
        return renderField(fieldName, value);
      })}
    </div>
  );
};
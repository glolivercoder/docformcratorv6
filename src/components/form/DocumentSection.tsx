import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DocumentSectionProps {
  fields: Record<string, any>;
  parent: string | null;
  onInputChange: (field: string, value: any, parent: string | null) => void;
  useSystemDate?: boolean;
}

export const DocumentSection = ({ fields, parent, onInputChange, useSystemDate }: DocumentSectionProps) => {
  const renderField = (fieldName: string, value: any) => {
    if (fieldName === 'usarDataSistema') return null;
    
    return (
      <div key={fieldName} className="mb-4">
        <Label htmlFor={`${parent}-${fieldName}`}>
          {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
        </Label>
        <Input
          id={`${parent}-${fieldName}`}
          value={value}
          onChange={(e) => onInputChange(fieldName, e.target.value, parent)}
          disabled={fieldName === 'dataPorExtenso' && useSystemDate}
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
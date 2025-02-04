import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentType, DocumentCategory, documentTypes, documentCategories } from '@/utils/documentTypes';

interface DocumentTypeSelectorProps {
  selectedType?: DocumentType;
  onTypeSelect: (type: DocumentType) => void;
}

export default function DocumentTypeSelector({ selectedType, onTypeSelect }: DocumentTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <Select value={selectedType} onValueChange={onTypeSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de documento" />
        </SelectTrigger>
        <SelectContent>
          {documentCategories.map(category => (
            <React.Fragment key={category}>
              <SelectItem value={category} disabled className="font-semibold">
                {category}
              </SelectItem>
              {documentTypes
                .filter(type => type.category === category)
                .map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

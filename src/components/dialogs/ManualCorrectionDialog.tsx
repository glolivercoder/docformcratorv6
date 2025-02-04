import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PersonRole, PersonRoleType } from '@/types/person';

interface Field {
  id: string;
  label: string;
  value: string;
}

interface ManualCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentImage: string;
  extractedData: Record<string, { value: string; confidence: number }>;
  role: PersonRoleType;
  isSpouse: boolean;
  onSave: (data: Record<string, string>) => void;
}

export function ManualCorrectionDialog({
  open,
  onOpenChange,
  documentImage,
  extractedData,
  role,
  isSpouse,
  onSave,
}: ManualCorrectionDialogProps) {
  const [fields, setFields] = useState<Record<string, string>>(() => {
    return Object.entries(extractedData).reduce((acc, [key, { value }]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  });

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSave = () => {
    onSave(fields);
    onOpenChange(false);
  };

  const getPersonTypeLabel = () => {
    const baseLabel = {
      [PersonRole.VENDEDOR]: 'Vendedor',
      [PersonRole.COMPRADOR]: 'Comprador',
      [PersonRole.LOCADOR]: 'Locador',
      [PersonRole.LOCATARIO]: 'Locatário',
    }[role];

    return isSpouse ? `Cônjuge do ${baseLabel}` : baseLabel;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Correção Manual - {getPersonTypeLabel()}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative h-[600px] border rounded overflow-hidden">
            <img
              src={documentImage}
              alt="Documento"
              className="w-full h-full object-contain"
            />
          </div>
          <ScrollArea className="h-[600px] p-4">
            <div className="grid gap-4">
              {Object.entries(extractedData).map(([fieldId, { value, confidence }]) => (
                <div key={fieldId} className="space-y-2">
                  <Label htmlFor={fieldId} className="flex items-center gap-2">
                    {fieldId}
                    <span className="text-xs text-muted-foreground">
                      (Confiança: {Math.round(confidence * 100)}%)
                    </span>
                  </Label>
                  <Input
                    id={fieldId}
                    value={fields[fieldId]}
                    onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

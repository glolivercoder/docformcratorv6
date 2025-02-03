import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentType } from '@/types/documents';

interface OCRFieldSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType;
  onFieldSelect: (field: string) => void;
}

export function OCRFieldSelectDialog({
  open,
  onOpenChange,
  documentType,
  onFieldSelect,
}: OCRFieldSelectDialogProps) {
  const getFieldOptions = () => {
    switch (documentType) {
      case DocumentType.LEASE_CONTRACT:
        return [
          { label: 'Locador', value: 'locador' },
          { label: 'Cônjuge do Locador', value: 'conjugeLocador' },
          { label: 'Locatário', value: 'locatario' },
          { label: 'Cônjuge do Locatário', value: 'conjugeLocatario' },
        ];
      case DocumentType.SALE_CONTRACT:
        return [
          { label: 'Vendedor', value: 'vendedor' },
          { label: 'Cônjuge do Vendedor', value: 'conjugeVendedor' },
          { label: 'Comprador', value: 'comprador' },
          { label: 'Cônjuge do Comprador', value: 'conjugeComprador' },
        ];
      default:
        return [
          { label: 'Emitente', value: 'emitente' },
          { label: 'Pagador', value: 'pagador' },
        ];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecione o campo para preencher</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {getFieldOptions().map((option) => (
            <Button
              key={option.value}
              variant="outline"
              onClick={() => {
                onFieldSelect(option.value);
                onOpenChange(false);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

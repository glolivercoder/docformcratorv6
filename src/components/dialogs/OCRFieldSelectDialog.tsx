import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentType } from "@/types/documents";

interface OCRFieldSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType;
  onFieldSelect: (field: string) => void;
  onExportData?: () => void;
  showExportButton?: boolean;
}

export const OCRFieldSelectDialog = ({
  open,
  onOpenChange,
  documentType,
  onFieldSelect,
  onExportData,
  showExportButton = false,
}: OCRFieldSelectDialogProps) => {
  const fields = [
    { label: 'Nome Completo', value: 'nomeCompleto' },
    { label: 'CPF', value: 'cpf' },
    { label: 'RG', value: 'numeroDocumento' },
    { label: 'Data de Expedição', value: 'dataExpedicao' },
    { label: 'Data de Nascimento', value: 'dataNascimento' },
    { label: 'Naturalidade', value: 'naturalidade' },
    { label: 'Filiação', value: 'filiacao' },
    { label: 'Órgão Expedidor', value: 'orgaoExpedidor' },
    { label: 'Profissão', value: 'profissao' },
  ];

  const handleFieldClick = (field: string) => {
    onFieldSelect(field);
  };

  const handleExportClick = () => {
    if (onExportData) {
      onExportData();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecione os campos para extrair</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          {fields.map((field) => (
            <Button
              key={field.value}
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => handleFieldClick(field.value)}
            >
              {field.label}
            </Button>
          ))}
          
          {showExportButton && (
            <Button
              variant="default"
              className="w-full mt-4"
              onClick={handleExportClick}
            >
              Exportar Dados para Usuário
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

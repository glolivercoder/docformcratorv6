import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface OcrConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: {
    [key: string]: {
      value: string;
      confidence: number;
    };
  };
  onConfirm: () => void;
  onManualSelect: () => void;
}

const fieldLabels: { [key: string]: string } = {
  nome: 'Nome Completo',
  cpf: 'CPF',
  rg: 'RG',
  endereco: 'Endereço',
  telefone: 'Telefone',
  email: 'E-mail',
  data: 'Data de Nascimento',
  orgaoExpedidor: 'Órgão Expedidor',
  profissao: 'Profissão',
  nacionalidade: 'Nacionalidade',
  estadoCivil: 'Estado Civil'
};

export function OcrConfirmationDialog({
  open,
  onOpenChange,
  fields,
  onConfirm,
  onManualSelect
}: OcrConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirmar Dados Extraídos</DialogTitle>
          <DialogDescription>
            Verifique se os dados foram extraídos corretamente. Se houver erros, você pode fazer a seleção manual.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] mt-4">
          <div className="space-y-4">
            {Object.entries(fields).map(([field, data]) => (
              <div key={field} className="grid grid-cols-2 gap-4 items-center">
                <div className="font-medium">{fieldLabels[field] || field}:</div>
                <div className="flex items-center gap-2">
                  <span>{data.value}</span>
                  <span className={`text-xs ${
                    data.confidence > 0.8 ? 'text-green-500' :
                    data.confidence > 0.6 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    ({Math.round(data.confidence * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onManualSelect}>
            Seleção Manual
          </Button>
          <Button onClick={onConfirm}>
            Confirmar Dados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
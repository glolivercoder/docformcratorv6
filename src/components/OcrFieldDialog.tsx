import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from './ui/button';

interface OcrFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFieldSelect: (field: string) => void;
  extractedData: Record<string, string>;
}

const fieldOptions = [
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'comprador', label: 'Comprador' },
  { value: 'conjuge_vendedor', label: 'Cônjuge do Vendedor' },
  { value: 'conjuge_comprador', label: 'Cônjuge do Comprador' },
];

export function OcrFieldDialog({ open, onOpenChange, onFieldSelect, extractedData }: OcrFieldDialogProps) {
  const [selectedField, setSelectedField] = React.useState<string>('');
  const [showExtractedData, setShowExtractedData] = React.useState(false);

  const handleConfirm = () => {
    if (selectedField) {
      onFieldSelect(selectedField);
      onOpenChange(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, field: string, value: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ field, value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Selecionar Campo para Preenchimento</DialogTitle>
          <DialogDescription>
            Escolha qual parte do formulário você deseja preencher com os dados extraídos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Select onValueChange={setSelectedField} value={selectedField}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o campo" />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-between">
            <Button onClick={handleConfirm} disabled={!selectedField}>
              Confirmar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowExtractedData(true)}
            >
              Ver Dados Extraídos
            </Button>
          </div>
        </div>

        {showExtractedData && (
          <div className="mt-4 border rounded-lg p-4">
            <h4 className="font-medium mb-2">Dados Extraídos</h4>
            <div className="space-y-2">
              {Object.entries(extractedData).map(([field, value]) => (
                <div
                  key={field}
                  draggable
                  onDragStart={(e) => handleDragStart(e, field, value)}
                  className="p-2 border rounded cursor-move hover:bg-secondary"
                >
                  <span className="font-medium">{field}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OCRSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ocrData: Record<string, any>;
  formData: Record<string, any>;
  onSelection: (field: string, value: string) => void;
}

export const OCRSelectionDialog = ({
  open,
  onOpenChange,
  ocrData,
  formData,
  onSelection,
}: OCRSelectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Seleção Interativa de Dados</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Dados do OCR</h3>
            <ScrollArea className="h-[400px]">
              {Object.entries(ocrData).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <p className="font-medium">{key}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">{value}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelection(key, String(value))}
                    >
                      Usar
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Campos do Formulário</h3>
            <ScrollArea className="h-[400px]">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="mb-4">
                  <p className="font-medium">{key}</p>
                  <p className="text-sm text-gray-600">{String(value)}</p>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
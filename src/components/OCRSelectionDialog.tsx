import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSideBySide, setShowSideBySide] = useState(false);

  const expectedFields = [
    "nomeCompleto",
    "rg",
    "cpf",
    "orgaoExpedidor",
    "filiacao",
    "dataEmissao"
  ];

  const checkFieldsCompletion = () => {
    const hasAllFields = expectedFields.every(field => ocrData[field]);
    setShowConfirmation(true);
    if (!hasAllFields) {
      setShowSideBySide(true);
    }
  };

  const handleConfirm = (useFields: boolean) => {
    setShowConfirmation(false);
    if (useFields) {
      expectedFields.forEach(field => {
        if (ocrData[field]) {
          onSelection(field, ocrData[field]);
        }
      });
      onOpenChange(false);
    } else {
      setShowSideBySide(true);
    }
  };

  if (showConfirmation) {
    return (
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação dos Dados</AlertDialogTitle>
            <AlertDialogDescription>
              Os dados extraídos estão corretos e completos?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleConfirm(false)}>
              Não, preciso revisar
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirm(true)}>
              Sim, usar dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Menu Interativo - Seleção de Dados</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Dados Extraídos</h3>
            <ScrollArea className="h-[400px]">
              {expectedFields.map((field) => (
                <div key={field} className="mb-4">
                  <p className="font-medium">
                    {field === "nomeCompleto" ? "Nome Completo" :
                     field === "orgaoExpedidor" ? "Órgão Expedidor" :
                     field === "filiacao" ? "Filiação" :
                     field === "dataEmissao" ? "Data de Emissão" :
                     field.toUpperCase()}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">
                      {ocrData[field] || "Não encontrado"}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelection(field, String(ocrData[field] || ""))}
                      disabled={!ocrData[field]}
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
              <Accordion type="single" collapsible>
                {Object.entries(formData).map(([section, data]) => (
                  <AccordionItem key={section} value={section}>
                    <AccordionTrigger className="text-left">
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </AccordionTrigger>
                    <AccordionContent>
                      {Object.entries(data as Record<string, any>).map(([field, value]) => (
                        <div key={`${section}-${field}`} className="mb-4 pl-4">
                          <p className="font-medium">{field}</p>
                          <p className="text-sm text-gray-600">{String(value)}</p>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={checkFieldsCompletion}>
            Confirmar Seleção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
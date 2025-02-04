import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { OcrService } from '@/services/OcrService';
import { toast } from "@/components/ui/use-toast";
import { ToggleLeft, ToggleRight, Square } from 'lucide-react';

interface OCRSelectionAreaProps {
  imageUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (text: string, field: string) => void;
  availableFields: Array<{ label: string; value: string }>;
  onExportClick: () => void;
}

export function OCRSelectionArea({
  imageUrl,
  open,
  onOpenChange,
  onSelect,
  availableFields,
  onExportClick,
}: OCRSelectionAreaProps) {
  const [selection, setSelection] = useState<{startX: number; startY: number; currentX: number; currentY: number} | null>(null);
  const [selectedField, setSelectedField] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [extractedTexts, setExtractedTexts] = useState<Record<string, string>>({});

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelection({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y
    });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selection) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelection(prev => ({
      ...prev!,
      currentX: x,
      currentY: y
    }));
  };

  const handleMouseUp = async () => {
    if (!isSelecting || !selection || !selectedField) return;
    setIsSelecting(false);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = imageUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const left = Math.min(selection.startX, selection.currentX);
      const top = Math.min(selection.startY, selection.currentY);
      const width = Math.abs(selection.currentX - selection.startX);
      const height = Math.abs(selection.currentY - selection.startY);

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(
        img,
        left,
        top,
        width,
        height,
        0,
        0,
        width,
        height
      );

      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob(blob => resolve(blob!), 'image/png')
      );
      
      const file = new File([blob], 'selection.png', { type: 'image/png' });
      
      const ocrService = OcrService.getInstance();
      const result = await ocrService.extractText(file);
      
      if (result.text) {
        const text = result.text.trim();
        
        // Formatar o texto baseado no tipo de campo
        let formattedText = text;
        if (selectedField === 'dataExpedicao' || selectedField === 'dataNascimento') {
          // Tentar converter para formato de data brasileiro
          const dateMatch = text.match(/(\d{2})[/-](\d{2})[/-](\d{4})|(\d{4})[/-](\d{2})[/-](\d{2})/);
          if (dateMatch) {
            const [_, d1, m1, y1, y2, m2, d2] = dateMatch;
            if (d1) {
              formattedText = `${d1}/${m1}/${y1}`;
            } else {
              formattedText = `${d2}/${m2}/${y2}`;
            }
          }
        } else if (selectedField === 'cpf') {
          // Formatar CPF
          const numbers = text.replace(/\D/g, '');
          if (numbers.length === 11) {
            formattedText = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
          }
        }

        setPreviewText(formattedText);
        setExtractedTexts(prev => ({
          ...prev,
          [selectedField]: formattedText
        }));
        onSelect(formattedText, selectedField);
        
        toast({
          title: "Texto Extraído",
          description: `Campo "${availableFields.find(f => f.value === selectedField)?.label}" preenchido com: ${formattedText}`,
        });
      }
    } catch (error) {
      console.error('Erro ao processar área:', error);
      toast({
        variant: "destructive",
        title: "Erro no OCR",
        description: "Não foi possível processar o texto da área selecionada",
      });
    }

    setSelection(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleção Manual de Campos</DialogTitle>
          <DialogDescription>
            Selecione um campo na lista à direita e depois arraste na imagem para selecionar a área do texto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 min-h-[70vh]">
            <div 
              className="absolute inset-0"
              style={{
                cursor: selectedField ? 'crosshair' : 'default',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                width: '100%',
                height: '100%'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {selection && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(selection.startX, selection.currentX)}px`,
                    top: `${Math.min(selection.startY, selection.currentY)}px`,
                    width: `${Math.abs(selection.currentX - selection.startX)}px`,
                    height: `${Math.abs(selection.currentY - selection.startY)}px`,
                    border: '2px solid #0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.2)',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>
          </div>

          <Card className="w-96 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Campos do Documento</h3>
              <Button
                variant="default"
                onClick={onExportClick}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Exportar Dados
              </Button>
            </div>

            <ScrollArea className="flex-1">
              {availableFields.map((field) => (
                <div key={field.value} className="mb-2">
                  <Button
                    variant={selectedField === field.value ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedField(field.value)}
                  >
                    <div className="flex flex-col items-start">
                      <span>{field.label}</span>
                      {extractedTexts[field.value] && (
                        <span className="text-xs text-muted-foreground">
                          {extractedTexts[field.value]}
                        </span>
                      )}
                    </div>
                  </Button>
                </div>
              ))}
            </ScrollArea>

            {!selectedField && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Selecione um campo para começar a extrair o texto.
                </p>
              </div>
            )}

            {selectedField && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Agora arraste na imagem para selecionar a área do texto para o campo "{availableFields.find(f => f.value === selectedField)?.label}".
                </p>
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

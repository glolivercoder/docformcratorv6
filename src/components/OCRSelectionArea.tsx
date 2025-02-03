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
}

export function OCRSelectionArea({
  imageUrl,
  open,
  onOpenChange,
  onSelect,
  availableFields,
}: OCRSelectionAreaProps) {
  const [selection, setSelection] = useState<{startX: number; startY: number; currentX: number; currentY: number} | null>(null);
  const [selectedField, setSelectedField] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [lastCopiedText, setLastCopiedText] = useState('');
  const [selectionEnabled, setSelectionEnabled] = useState(true);
  const [previewText, setPreviewText] = useState('');
  const [selections, setSelections] = useState<Array<{text?: string}>>([]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectionEnabled) return;

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
    if (!isSelecting || !selection) return;
    setIsSelecting(false);

    try {
      // Criar um canvas temporário com a área selecionada
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = imageUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calcular coordenadas
      const left = Math.min(selection.startX, selection.currentX);
      const top = Math.min(selection.startY, selection.currentY);
      const width = Math.abs(selection.currentX - selection.startX);
      const height = Math.abs(selection.currentY - selection.startY);

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Desenhar área selecionada
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

      // Converter para blob
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob(blob => resolve(blob!), 'image/png')
      );
      
      const file = new File([blob], 'selection.png', { type: 'image/png' });
      
      // Processar OCR
      const ocrService = OcrService.getInstance();
      const result = await ocrService.extractText(file);
      
      if (result.text) {
        const text = result.text.trim();
        setSelections(prev => [...prev, { text }]);
        setLastCopiedText(text);
        setPreviewText(text);
        
        toast({
          title: "Texto Extraído",
          description: text,
        });
      } else {
        toast({
          variant: "destructive",
          title: "OCR falhou",
          description: "Não foi possível extrair texto desta área",
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

  const handleFieldClick = (field: string) => {
    setSelectedField(field);
    if (lastCopiedText) {
      onSelect(lastCopiedText, field);
      toast({
        title: "Campo preenchido!",
        description: `O campo foi preenchido com o texto copiado`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Selecione a Área do Texto</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectionEnabled(!selectionEnabled)}
              className="flex items-center gap-2"
            >
              {selectionEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {selectionEnabled ? 'Desativar Seleção' : 'Ativar Seleção'}
            </Button>
          </DialogTitle>
          <DialogDescription>
            Selecione a área que contém o texto desejado
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 min-h-[70vh] overflow-auto">
          <div 
            className="absolute inset-0"
            style={{
              cursor: selectionEnabled ? 'crosshair' : 'default',
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

        <Card className="w-96 p-4 flex flex-col gap-2 overflow-auto">
          {previewText && (
            <div className="p-2 bg-muted rounded-lg mb-4">
              <h4 className="font-semibold mb-1">Texto Extraído:</h4>
              <p className="text-sm">{previewText}</p>
            </div>
          )}

          <h3 className="font-semibold mb-2">Áreas Selecionadas</h3>
          <ScrollArea className="flex-1 mb-4">
            {selections.map((sel, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full mb-2 justify-start"
                onClick={() => {
                  if (sel.text) {
                    setLastCopiedText(sel.text);
                    setPreviewText(sel.text);
                  }
                }}
              >
                <Square className="w-4 h-4 mr-2" />
                Área {index + 1}
                {sel.text && (
                  <span className="ml-2 text-xs text-muted-foreground truncate">
                    ({sel.text.substring(0, 20)}...)
                  </span>
                )}
              </Button>
            ))}
          </ScrollArea>

          <h3 className="font-semibold mb-2">Campos Disponíveis</h3>
          <ScrollArea className="flex-1">
            {availableFields.map((field) => (
              <Button
                key={field.value}
                variant={selectedField === field.value ? "default" : "outline"}
                className="w-full mb-2 justify-start"
                onClick={() => handleFieldClick(field.value)}
              >
                {field.label}
              </Button>
            ))}
          </ScrollArea>

          <div className="text-sm text-muted-foreground mt-4">
            <p className="mb-2">Instruções:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>A seleção está ativada por padrão</li>
              <li>Clique e arraste para selecionar uma área</li>
              <li>O texto será extraído automaticamente</li>
              <li>Clique em uma área para copiar o texto</li>
              <li>Clique no campo para preencher</li>
            </ol>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

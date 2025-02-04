import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OcrService } from '@/services/OcrService';
import { processImage } from '@/utils/imageProcessing';
import { Loader2 } from 'lucide-react';

interface OcrManualSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File;
  onFieldSelect: (field: string, value: string) => void;
}

const fieldLabels: { [key: string]: string } = {
  nomeCompleto: 'Nome Completo',
  cpf: 'CPF',
  rg: 'RG',
  dataExpedicao: 'Data de Expedição',
  dataNascimento: 'Data de Nascimento',
  naturalidade: 'Naturalidade',
  filiacao: 'Filiação'
};

export function OcrManualSelectionDialog({
  open,
  onOpenChange,
  imageFile,
  onFieldSelect
}: OcrManualSelectionDialogProps) {
  const [selection, setSelection] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<{
    rectangles: Array<{ x: number; y: number; width: number; height: number; field: string; text: string }>;
  }>({ rectangles: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (open && imageFile) {
      const processImageFile = async () => {
        try {
          setIsProcessing(true);
          setError(null);

          // Criar URL para a imagem
          const imageUrl = URL.createObjectURL(imageFile);
          
          // Carregar a imagem primeiro
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
          });

          // Processar a imagem
          const canvas = await processImage(imageFile, {
            grayscale: true,
            contrast: 30,
            brightness: 15
          });

          setProcessedCanvas(canvas);
          setImageSize({
            width: canvas.width,
            height: canvas.height
          });

          // Carregar histórico de seleções
          const ocrService = OcrService.getInstance();
          const savedHistory = ocrService.getSelectionHistory(imageFile.name);
          setSelectionHistory(savedHistory);

          // Limpar URL criada
          URL.revokeObjectURL(imageUrl);
        } catch (error) {
          console.error('Erro ao processar imagem:', error);
          setError('Erro ao processar imagem. Por favor, tente novamente.');
        } finally {
          setIsProcessing(false);
        }
      };

      processImageFile();
    } else {
      setSelection(null);
      setSelectedField(null);
      setIsSelecting(false);
    }
  }, [open, imageFile]);

  const getScaledCoordinates = (clientX: number, clientY: number) => {
    if (!imageRef.current || !containerRef.current) return null;

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedField || isProcessing) return;

    const coords = getScaledCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    setSelection({
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0
    });
    setIsSelecting(true);
    setError(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !selection || isProcessing) return;

    const coords = getScaledCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    setSelection(prev => ({
      ...prev!,
      width: coords.x - prev!.x,
      height: coords.y - prev!.y
    }));
  };

  const handleMouseUp = async () => {
    if (!selection || !processedCanvas || !selectedField || isProcessing) return;
    setIsSelecting(false);

    try {
      setIsProcessing(true);
      setError(null);

      // Normalizar coordenadas
      const normalizedSelection = {
        x: Math.min(selection.x, selection.x + selection.width),
        y: Math.min(selection.y, selection.y + selection.height),
        width: Math.abs(selection.width),
        height: Math.abs(selection.height)
      };

      // Verificar se a seleção é válida
      if (normalizedSelection.width < 10 || normalizedSelection.height < 10) {
        setError('Área selecionada muito pequena. Por favor, selecione uma área maior.');
        return;
      }

      // Extrair texto
      const ocrService = OcrService.getInstance();
      const text = await ocrService.extractTextFromSelection(
        imageFile,
        normalizedSelection,
        selectedField
      );

      if (!text || text.trim().length === 0) {
        setError('Não foi possível extrair texto desta área. Por favor, tente novamente.');
        return;
      }

      onFieldSelect(selectedField, text);
      setSelectionHistory(prev => ({
        rectangles: [...prev.rectangles.filter(r => r.field !== selectedField), 
          { ...normalizedSelection, field: selectedField, text }]
      }));

      setSelectedField(null);
    } catch (error) {
      console.error('Erro ao extrair texto:', error);
      setError('Erro ao extrair texto. Por favor, tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSelectionOverlay = (rect: { x: number; y: number; width: number; height: number }, isActive: boolean = false) => {
    if (!imageRef.current) return null;

    const imgRect = imageRef.current.getBoundingClientRect();
    const scaleX = imgRect.width / imageSize.width;
    const scaleY = imgRect.height / imageSize.height;

    return {
      left: rect.x * scaleX,
      top: rect.y * scaleY,
      width: rect.width * scaleX,
      height: rect.height * scaleY,
      backgroundColor: isActive ? 'rgba(0, 120, 212, 0.2)' : 'rgba(0, 180, 0, 0.1)',
      border: `2px solid ${isActive ? 'rgb(0, 120, 212)' : 'rgb(0, 180, 0)'}`,
      position: 'absolute' as const,
      pointerEvents: 'none' as const
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Seleção Manual de Campos</DialogTitle>
          <DialogDescription>
            Selecione um campo na lista à direita e depois arraste na imagem para selecionar a área do texto.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 flex-1">
          <div
            ref={containerRef}
            className="relative border rounded overflow-hidden bg-gray-100"
            style={{ cursor: selectedField && !isProcessing ? 'crosshair' : 'default' }}
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {processedCanvas && (
              <div className="relative w-full h-full">
                <img
                  ref={imageRef}
                  src={processedCanvas.toDataURL()}
                  alt="Documento"
                  className="max-w-full h-auto"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => {
                    setIsSelecting(false);
                    if (!selectedField) setSelection(null);
                  }}
                  draggable={false}
                />
                {selection && (
                  <div style={renderSelectionOverlay(selection, true)} />
                )}
                {selectionHistory.rectangles.map((rect, index) => (
                  <div key={index} style={renderSelectionOverlay(rect)}>
                    <span className="absolute -top-6 left-0 text-xs bg-white px-1 rounded shadow">
                      {fieldLabels[rect.field]}: {rect.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-medium mb-4">Campos do Documento</h3>
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-3">
                {Object.entries(fieldLabels).map(([field, label]) => {
                  const selection = selectionHistory.rectangles.find(r => r.field === field);
                  return (
                    <div
                      key={field}
                      className={`p-3 rounded-lg transition-colors ${
                        selection 
                          ? 'bg-green-50 border border-green-200' 
                          : field === selectedField
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                      }`}
                      onClick={() => {
                        if (!selection && !isProcessing) {
                          setSelectedField(field === selectedField ? null : field);
                          setSelection(null);
                          setError(null);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-gray-700">{label}</div>
                        {selection && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            disabled={isProcessing}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectionHistory(prev => ({
                                rectangles: prev.rectangles.filter(r => r.field !== field)
                              }));
                              setSelectedField(field);
                            }}
                          >
                            Refazer
                          </Button>
                        )}
                      </div>
                      {selection ? (
                        <div className="mt-1 text-sm">{selection.text}</div>
                      ) : field === selectedField ? (
                        <div className="mt-1 text-sm text-blue-600">
                          Arraste na imagem para selecionar a área do texto
                        </div>
                      ) : (
                        <div className="mt-1 text-sm text-gray-400 italic">
                          Clique para selecionar
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
} 
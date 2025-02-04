import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PersonSelectDialog } from './dialogs/PersonSelectDialog';
import { ManualCorrectionDialog } from './dialogs/ManualCorrectionDialog';
import { OcrService } from '@/services/OcrService';
import { PersonService } from '@/services/PersonService';
import { PersonRoleType } from '@/types/person';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { OcrFieldViewer } from './OcrFieldViewer';

interface DocumentScannerProps {
  contractType: 'sale' | 'lease';
  onPersonAdded: (personId: string) => void;
}

export default function DocumentScanner({ contractType, onPersonAdded }: DocumentScannerProps) {
  const [isPersonSelectOpen, setIsPersonSelectOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Record<string, { value: string; confidence: number }>>({});
  const [selectedRole, setSelectedRole] = useState<PersonRoleType | null>(null);
  const [isSpouse, setIsSpouse] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [scale, setScale] = useState(1);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (imageRef.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const imageWidth = imageRef.current.naturalWidth;
      setScale(containerWidth / imageWidth);
    }
  }, [documentImage]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string;
      setDocumentImage(base64Image);
      setIsPersonSelectOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setSelectionStart({ x, y });
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;
    
    setCurrentSelection({
      x: Math.min(selectionStart.x, currentX),
      y: Math.min(selectionStart.y, currentY),
      width: Math.abs(currentX - selectionStart.x),
      height: Math.abs(currentY - selectionStart.y)
    });
  };

  const handleMouseUp = async () => {
    setIsSelecting(false);
    if (!currentSelection || !documentImage) return;
    
    try {
      const ocrService = new OcrService();
      const text = await ocrService.recognizeText(documentImage, currentSelection);
      
      setExtractedData(prev => ({
        ...prev,
        [Object.keys(prev).length]: {
          value: text,
          confidence: 0.8 // TODO: Usar confiança real do OCR
        }
      }));
      
      await ocrService.terminate();
    } catch (error) {
      console.error('Erro ao processar OCR:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o texto da área selecionada.',
        variant: 'destructive'
      });
    }
  };

  const handlePersonSelect = async (role: PersonRoleType, spouse: boolean) => {
    setSelectedRole(role);
    setIsSpouse(spouse);
    setIsPersonSelectOpen(false);
    
    if (documentImage) {
      try {
        const ocrService = new OcrService();
        const text = await ocrService.recognizeText(documentImage);
        setExtractedData({
          nome: { value: text, confidence: 0.8 }
        });
        await ocrService.terminate();
        setIsCorrectionOpen(true);
      } catch (error) {
        console.error('Erro ao processar OCR:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível processar o texto do documento.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleSave = async (data: Record<string, string>) => {
    if (!selectedRole) return;
    
    try {
      const personService = new PersonService();
      const person = await personService.createOrUpdate({
        ...data,
        role: selectedRole,
        isSpouse
      });
      
      onPersonAdded(person.id);
      toast({
        title: 'Sucesso',
        description: 'Pessoa cadastrada com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados da pessoa.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="document-upload"
      />
      <label htmlFor="document-upload">
        <Button variant="outline" asChild>
          <span>Capturar e Carregar Imagem</span>
        </Button>
      </label>

      <PersonSelectDialog
        open={isPersonSelectOpen}
        onOpenChange={setIsPersonSelectOpen}
        contractType={contractType}
        onPersonSelect={handlePersonSelect}
      />

      <ManualCorrectionDialog
        open={isCorrectionOpen}
        onOpenChange={setIsCorrectionOpen}
        documentImage={documentImage || ''}
        extractedData={extractedData}
        role={selectedRole || 'VENDEDOR'}
        isSpouse={isSpouse}
        onSave={handleSave}
      />

      {documentImage && (
        <Dialog open={true} onOpenChange={() => setDocumentImage(null)}>
          <DialogContent className="max-w-4xl">
            <div className="grid grid-cols-2 gap-4">
              <div 
                ref={containerRef}
                className="relative border rounded overflow-hidden"
                style={{ height: '600px' }}
              >
                <img
                  ref={imageRef}
                  src={documentImage}
                  alt="Documento"
                  className="w-full h-full object-contain"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => setIsSelecting(false)}
                />
                {currentSelection && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20"
                    style={{
                      left: currentSelection.x * scale,
                      top: currentSelection.y * scale,
                      width: currentSelection.width * scale,
                      height: currentSelection.height * scale
                    }}
                  />
                )}
              </div>
              
              <div className="space-y-4">
                <OcrFieldViewer
                  fields={extractedData}
                  onFieldSelect={(fieldId, value) => {
                    // TODO: Implementar a transcrição do campo para o formulário ativo
                    console.log('Campo selecionado:', fieldId, value);
                  }}
                  role={selectedRole || 'VENDEDOR'}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

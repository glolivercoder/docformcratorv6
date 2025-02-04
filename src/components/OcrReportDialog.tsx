import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { OcrLogService } from '@/services/OcrLogService';
import { useToast } from '@/components/ui/use-toast';

interface OcrReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OcrReportDialog({ open, onOpenChange }: OcrReportDialogProps) {
  const [reportHtml, setReportHtml] = useState<string>('');
  const [successRate, setSuccessRate] = useState<number>(0);
  const [topFields, setTopFields] = useState<{ fieldName: string; successRate: number }[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const logger = OcrLogService.getInstance();
      setReportHtml(logger.generateHtmlReport());
      setSuccessRate(logger.getSuccessRate());
      setTopFields(logger.getMostSuccessfulFields().filter(field => 
        !['orgaoExpedidor', 'profissao', 'nacionalidade', 'estadoCivil'].includes(field.fieldName)
      ));
    }
  }, [open]);

  const handleCopyToClipboard = async () => {
    try {
      const logger = OcrLogService.getInstance();
      const jsonData = logger.exportLogsAsJson();
      await navigator.clipboard.writeText(jsonData);
      setCopied(true);
      toast({
        title: "Dados copiados!",
        description: "Os logs foram copiados para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar os dados para a área de transferência.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Relatório de OCR</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleCopyToClipboard}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Logs'}
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Taxa de Sucesso Geral</h3>
              <div className="text-2xl font-bold text-blue-600">
                {successRate.toFixed(1)}%
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Campos mais Bem Sucedidos</h3>
              <div className="space-y-2">
                {topFields.slice(0, 3).map((field, index) => (
                  <div key={field.fieldName} className="flex justify-between items-center">
                    <span>{field.fieldName}</span>
                    <span className="font-medium text-green-600">
                      {field.successRate.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Histórico Detalhado</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: reportHtml }} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
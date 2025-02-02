import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
  fields: {
    [key: string]: {
      value: string;
      confidence: number;
    };
  };
}

export class OcrService {
  private static instance: OcrService;
  private worker: Tesseract.Worker | null = null;

  private constructor() {}

  public static getInstance(): OcrService {
    if (!OcrService.instance) {
      OcrService.instance = new OcrService();
    }
    return OcrService.instance;
  }

  private async initWorker() {
    if (!this.worker) {
      this.worker = await createWorker('por');
      await this.worker.loadLanguage('por');
      await this.worker.initialize('por');
      await this.worker.setParameters({
        tessedit_pageseg_mode: '6', // Assume texto uniforme
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,- ', // Caracteres permitidos
        tessjs_create_pdf: '1',
        tessjs_pdf_name: 'ocr_result',
        tessjs_pdf_title: 'OCR Result',
        tessjs_pdf_auto_download: '0',
      });
    }
    return this.worker;
  }

  public async extractText(imageFile: File): Promise<OcrResult> {
    try {
      const worker = await this.initWorker();
      
      // Converter File para imagem base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // Realizar OCR com configurações otimizadas
      const { data } = await worker.recognize(base64Image);
      
      // Processar e extrair campos
      const fields = this.extractFields(data.text);
      
      return {
        text: data.text,
        confidence: data.confidence,
        fields
      };
    } catch (error) {
      console.error('Erro no OCR:', error);
      throw new Error('Falha ao processar a imagem. Verifique a qualidade e tente novamente.');
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private extractFields(text: string) {
    const fields: { [key: string]: { value: string; confidence: number } } = {};
    
    // Expressões regulares para cada campo
    const patterns = {
      nome: /nome:?\s*([A-Za-z\s]{2,})/i,
      cpf: /cpf:?\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i,
      rg: /rg:?\s*([0-9.-]{5,})/i,
      endereco: /endere[çc]o:?\s*([A-Za-z0-9\s,.-]{5,})/i,
      telefone: /(?:telefone|tel|fone):?\s*((?:\+?55\s?)?(?:\(?\d{2}\)?[\s-]?)?\d{4,5}[-\s]?\d{4})/i,
      email: /(?:e-?mail):?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
    };

    // Extrair campos usando regex
    Object.entries(patterns).forEach(([field, pattern]) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        fields[field] = {
          value: match[1].trim(),
          confidence: 0.8 // Valor padrão de confiança para matches de regex
        };
      }
    });

    return fields;
  }

  public async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

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
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ0123456789.,- ', // Incluindo acentos
        tessjs_create_pdf: '0',
        tessjs_pdf_name: 'ocr_result',
        tessjs_pdf_title: 'OCR Result',
        tessjs_pdf_auto_download: '0',
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
        tessjs_create_box: '0',
        tessjs_create_unlv: '0',
        tessjs_create_osd: '0',
        tessjs_image_preprocessing: 'true',
        tessjs_image_preprocessing_method: '2', // Otimização para documentos
      });
    }
    return this.worker;
  }

  public async extractText(imageFile: File): Promise<OcrResult> {
    try {
      const worker = await this.initWorker();
      
      // Converter File para imagem base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // Pré-processamento da imagem
      const processedImage = await this.preprocessImage(base64Image);
      
      // Realizar OCR com configurações otimizadas
      const { data } = await worker.recognize(processedImage);
      
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

  private async preprocessImage(base64Image: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Image);
          return;
        }

        // Configurar tamanho do canvas
        canvas.width = img.width;
        canvas.height = img.height;

        // Desenhar imagem original
        ctx.drawImage(img, 0, 0);

        // Aumentar contraste
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Converter para escala de cinza
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          // Aumentar contraste
          const contrast = 1.5; // Ajuste este valor para mais ou menos contraste
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          
          // Aplicar contraste
          data[i] = factor * (avg - 128) + 128;     // R
          data[i + 1] = factor * (avg - 128) + 128; // G
          data[i + 2] = factor * (avg - 128) + 128; // B
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
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
    
    // Expressões regulares melhoradas para cada campo
    const patterns = {
      nome: /nome:?\s*([A-Za-zÀ-ÿ\s]{2,})/i,
      cpf: /cpf:?\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i,
      rg: /(?:rg|registro\s+geral):?\s*([0-9X-]{5,})/i,
      endereco: /(?:endere[çc]o|residencia):?\s*([A-Za-zÀ-ÿ0-9\s,.-]{5,})/i,
      telefone: /(?:telefone|tel|fone|celular):?\s*((?:\+?55\s?)?(?:\(?\d{2}\)?[\s-]?)?\d{4,5}[-\s]?\d{4})/i,
      email: /(?:e-?mail):?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      data: /(?:data|dt)(?:\s+de)?(?:\s+nascimento)?:?\s*(\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4}|\d{2}-\d{2}-\d{4})/i,
      orgaoExpedidor: /(?:orgao\s+expedidor|ssp|detran):?\s*([A-Z]{2,}(?:\/[A-Z]{2})?)/i
    };

    // Extrair campos usando regex
    Object.entries(patterns).forEach(([field, pattern]) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        fields[field] = {
          value: match[1].trim(),
          confidence: this.calculateConfidence(match[1])
        };
      }
    });

    return fields;
  }

  private calculateConfidence(text: string): number {
    // Calcula confiança baseado em heurísticas
    let confidence = 0.8; // Base confidence

    // Reduz confiança se texto muito curto ou muito longo
    if (text.length < 3) confidence -= 0.3;
    if (text.length > 100) confidence -= 0.2;

    // Reduz confiança se contém caracteres suspeitos
    if (/[^A-Za-zÀ-ÿ0-9@.,\-\s\/]/.test(text)) confidence -= 0.2;

    return Math.max(0, Math.min(1, confidence));
  }

  public async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

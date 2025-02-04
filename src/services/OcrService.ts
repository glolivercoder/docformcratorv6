import { createWorker } from 'tesseract.js';
import { processImage, cropImage, canvasToBlob } from '@/utils/imageProcessing';
import { OcrLogService } from './OcrLogService';

export type DocumentType = 'RG' | 'CNH' | 'CRECI';

export interface DocumentField {
  key: string;
  label: string;
  pattern: RegExp;
  required: boolean;
}

export const DOCUMENT_FIELDS: Record<DocumentType, DocumentField[]> = {
  RG: [
    {
      key: 'nomeCompleto',
      label: 'Nome Completo',
      pattern: /nome:?\s*([A-Za-zÀ-ÿ\s]{2,})/i,
      required: true
    },
    {
      key: 'rg',
      label: 'RG',
      pattern: /(?:rg|registro\s+geral):?\s*([0-9X-]{5,})/i,
      required: true
    },
    {
      key: 'orgaoExpedidor',
      label: 'Órgão Expedidor',
      pattern: /(?:orgao\s+expedidor|ssp|detran):?\s*([A-Z]{2,}(?:\/[A-Z]{2})?)/i,
      required: true
    },
    {
      key: 'dataExpedicao',
      label: 'Data de Expedição',
      pattern: /(?:data\s+de?\s*expedi[çc][ãa]o|emiss[ãa]o):?\s*(\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4}|\d{2}-\d{2}-\d{4})/i,
      required: true
    },
    {
      key: 'cpf',
      label: 'CPF',
      pattern: /(?:cpf|cnpj):?\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i,
      required: false
    },
    {
      key: 'dataNascimento',
      label: 'Data de Nascimento',
      pattern: /(?:data\s+de?\s*nascimento|nasc):?\s*(\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4}|\d{2}-\d{2}-\d{4})/i,
      required: true
    },
    {
      key: 'filiacao',
      label: 'Filiação',
      pattern: /(?:filia[çc][ãa]o|pai|m[ãa]e):?\s*([A-Za-zÀ-ÿ\s]{3,})/i,
      required: true
    },
    {
      key: 'naturalidade',
      label: 'Naturalidade',
      pattern: /(?:naturalidade|local\s+de\s+nascimento):?\s*([A-Za-zÀ-ÿ\s\/\-]{3,})/i,
      required: true
    }
  ],
  CNH: [
    {
      key: 'nomeCompleto',
      label: 'Nome Completo',
      pattern: /nome:?\s*([A-Za-zÀ-ÿ\s]{2,})/i,
      required: true
    },
    {
      key: 'cpf',
      label: 'CPF',
      pattern: /(?:cpf|cnpj):?\s*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/i,
      required: true
    },
    {
      key: 'dataNascimento',
      label: 'Data de Nascimento',
      pattern: /(?:data\s+de?\s*nascimento|nasc):?\s*(\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4}|\d{2}-\d{2}-\d{4})/i,
      required: true
    },
    {
      key: 'registroCnh',
      label: 'Registro CNH',
      pattern: /(?:registro|n[úu]mero\s+do\s+registro):?\s*(\d{11})/i,
      required: true
    }
  ],
  CRECI: [
    {
      key: 'nomeCompleto',
      label: 'Nome Completo',
      pattern: /nome:?\s*([A-Za-zÀ-ÿ\s]{2,})/i,
      required: true
    },
    {
      key: 'numeroCRECI',
      label: 'Número CRECI',
      pattern: /(?:creci|inscri[çc][ãa]o):?\s*(\d{5,}(?:-[A-Z])?)/i,
      required: true
    }
  ]
};

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

export interface SelectionHistory {
  rectangles: {
    x: number;
    y: number;
    width: number;
    height: number;
    field: string;
    text: string;
  }[];
}

export class OcrService {
  private static instance: OcrService;
  private worker: Tesseract.Worker | null = null;
  private selectionHistory: Map<string, SelectionHistory> = new Map();
  private currentDocumentType: DocumentType = 'RG';

  private constructor() {}

  public static getInstance(): OcrService {
    if (!OcrService.instance) {
      OcrService.instance = new OcrService();
    }
    return OcrService.instance;
  }

  public setDocumentType(type: DocumentType) {
    this.currentDocumentType = type;
  }

  private async initWorker() {
    if (!this.worker) {
      this.worker = await createWorker('por');
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzáàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ0123456789.,- ',
        preserve_interword_spaces: '1',
        tessedit_enable_dict_correction: '1',
        tessedit_enable_bigram_correction: '1',
        tessedit_pageseg_mode: '6',
        textord_heavy_nr: '1',
        edges_max_children_per_outline: '40',
        edges_min_nonhole: '12',
        edges_patharea_ratio: '2.0',
        tessedit_class_miss_scale: '0.002',
        textord_initialx_ile: '0.75',
        textord_initialasc_ile: '0.75'
      });
    }
    return this.worker;
  }

  public async extractText(imageFile: File): Promise<OcrResult> {
    try {
      const worker = await this.initWorker();
      const logger = OcrLogService.getInstance();
      
      console.log('Iniciando reconhecimento de texto...');
      
      // Pré-processar imagem
      const processedCanvas = await processImage(imageFile, {
        grayscale: true,
        contrast: 30,
        brightness: 15
      });
      
      const blob = await canvasToBlob(processedCanvas);
      const { data } = await worker.recognize(blob);
      
      console.log('Texto reconhecido, extraindo campos...');
      
      const fields = await this.extractFieldsFromText(data.text);
      
      // Log do resultado
      const fieldMappings = Object.entries(fields).map(([fieldName, data]) => ({
        fieldName,
        value: data.value,
        confidence: data.confidence
      }));

      logger.logOcrAttempt(
        this.currentDocumentType,
        fieldMappings,
        fieldMappings.length > 0
      );
      
      console.log('Campos extraídos:', fields);
      
      return {
        text: data.text,
        confidence: data.confidence,
        fields
      };
    } catch (error) {
      console.error('Erro no OCR:', error);
      const logger = OcrLogService.getInstance();
      logger.logOcrAttempt(this.currentDocumentType, [], false);
      throw new Error('Falha ao processar a imagem. Verifique a qualidade e tente novamente.');
    }
  }

  public async extractTextFromSelection(
    imageFile: File,
    rectangle: { x: number; y: number; width: number; height: number },
    field: string
  ): Promise<string> {
    try {
      const worker = await this.initWorker();
      const logger = OcrLogService.getInstance();
      
      // Processar imagem inteira primeiro
      const processedCanvas = await processImage(imageFile, {
        grayscale: true,
        contrast: 30,
        brightness: 15
      });
      
      // Recortar área selecionada
      const croppedCanvas = await cropImage(
        processedCanvas,
        rectangle.x,
        rectangle.y,
        rectangle.width,
        rectangle.height
      );
      
      // Processar área recortada para melhorar OCR
      const enhancedCanvas = await processImage(croppedCanvas.toDataURL(), {
        grayscale: true,
        contrast: 40,
        brightness: 20
      });
      
      // Converter para blob
      const blob = await canvasToBlob(enhancedCanvas);
      
      // Realizar OCR apenas na área selecionada
      const { data } = await worker.recognize(blob);
      
      // Limpar e formatar o texto extraído
      let text = data.text.trim();
      
      // Tentar encontrar o padrão específico do campo
      const documentFields = DOCUMENT_FIELDS[this.currentDocumentType];
      const fieldConfig = documentFields.find(f => f.key === field);
      
      if (fieldConfig) {
        const match = text.match(fieldConfig.pattern);
        if (match && match[1]) {
          text = match[1].trim();
        }
      }
      
      // Aplicar formatação específica baseada no tipo de campo
      text = this.formatFieldValue(text, field);

      // Log do campo extraído
      logger.logFieldMapping(field, text, data.confidence);
      
      // Salvar no histórico
      this.saveSelectionHistory(imageFile.name, rectangle, field, text);
      
      return text;
    } catch (error) {
      console.error('Erro ao extrair texto da seleção:', error);
      const logger = OcrLogService.getInstance();
      logger.logFieldMapping(field, '', 0);
      throw error;
    }
  }

  private formatFieldValue(text: string, field: string): string {
    // Remover espaços extras e quebras de linha
    text = text.replace(/\s+/g, ' ').trim();

    switch (field) {
      case 'cpf':
        // Manter apenas números
        text = text.replace(/\D/g, '');
        // Formatar CPF
        if (text.length === 11) {
          text = text.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        break;

      case 'rg':
        // Manter números e X
        text = text.replace(/[^\dX]/g, '');
        break;

      case 'dataExpedicao':
      case 'dataNascimento':
        // Tentar extrair data no formato dd/mm/aaaa
        const dateMatch = text.match(/(\d{2})[\/\.\-](\d{2})[\/\.\-](\d{4})/);
        if (dateMatch) {
          text = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
        }
        break;

      case 'nomeCompleto':
      case 'profissao':
      case 'nacionalidade':
      case 'estadoCivil':
      case 'naturalidade':
      case 'filiacao':
        // Capitalizar primeira letra de cada palavra
        text = text.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
        break;

      case 'orgaoExpedidor':
        // Converter para maiúsculas e remover espaços
        text = text.toUpperCase().replace(/\s+/g, '');
        // Adicionar barra se não houver
        if (text.length >= 4 && !text.includes('/')) {
          text = text.slice(0, -2) + '/' + text.slice(-2);
        }
        break;

      case 'numeroCRECI':
        // Manter apenas números e traço
        text = text.replace(/[^\d-]/g, '');
        break;

      case 'registroCnh':
        // Manter apenas números
        text = text.replace(/\D/g, '');
        break;
    }

    return text;
  }

  private saveSelectionHistory(
    imageId: string,
    rectangle: { x: number; y: number; width: number; height: number },
    field: string,
    text: string
  ) {
    const history = this.selectionHistory.get(imageId) || { rectangles: [] };
    
    // Remover seleção anterior do mesmo campo, se existir
    history.rectangles = history.rectangles.filter(r => r.field !== field);
    
    // Adicionar nova seleção
    history.rectangles.push({ ...rectangle, field, text });
    this.selectionHistory.set(imageId, history);
    
    try {
      localStorage.setItem('ocr_selection_history', JSON.stringify(Object.fromEntries(this.selectionHistory)));
    } catch (error) {
      console.warn('Não foi possível salvar histórico no localStorage:', error);
    }
  }

  public getSelectionHistory(imageId: string): SelectionHistory {
    return this.selectionHistory.get(imageId) || { rectangles: [] };
  }

  private async extractFieldsFromText(text: string): Promise<{ [key: string]: { value: string; confidence: number } }> {
    const fields: { [key: string]: { value: string; confidence: number } } = {};
    
    try {
      const documentFields = DOCUMENT_FIELDS[this.currentDocumentType];
      
      documentFields.forEach(field => {
        const match = text.match(field.pattern);
        if (match && match[1]) {
          const value = this.formatFieldValue(match[1], field.key);
          fields[field.key] = {
            value,
            confidence: this.calculateConfidence(value, field.key)
          };
        }
      });
    } catch (error) {
      console.error('Erro ao extrair campos:', error);
    }

    return fields;
  }

  private calculateConfidence(text: string, field: string): number {
    let confidence = 0.8;

    if (text.length < 3) confidence -= 0.3;
    if (text.length > 100) confidence -= 0.2;
    if (/[^A-Za-zÀ-ÿ0-9@.,\-\s\/]/.test(text)) confidence -= 0.2;

    const documentFields = DOCUMENT_FIELDS[this.currentDocumentType];
    const fieldConfig = documentFields.find(f => f.key === field);

    if (fieldConfig && fieldConfig.pattern.test(text)) {
      confidence += 0.2;
    }

    switch (field) {
      case 'cpf':
        if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(text)) confidence += 0.2;
        break;
      case 'orgaoExpedidor':
        if (/^[A-Z]{2,}\/[A-Z]{2}$/.test(text)) confidence += 0.2;
        break;
      case 'dataExpedicao':
      case 'dataNascimento':
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) confidence += 0.2;
        break;
      case 'nomeCompleto':
        if (/^[A-ZÀ-Ÿ][a-zà-ÿ]+(\s+[A-ZÀ-Ÿ][a-zà-ÿ]+){1,}$/.test(text)) confidence += 0.2;
        break;
      case 'numeroCRECI':
        if (/^\d{5,}(-[A-Z])?$/.test(text)) confidence += 0.2;
        break;
      case 'registroCnh':
        if (/^\d{11}$/.test(text)) confidence += 0.2;
        break;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  public async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

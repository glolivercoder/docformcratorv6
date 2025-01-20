import { pipeline } from "@huggingface/transformers";
import Tesseract from 'tesseract.js';

interface ExtractedFields {
  nome?: string;
  cpf?: string;
  rg?: string;
  creci?: string;
  oab?: string;
  estado?: string;
  cidade?: string;
  orgaoEmissor?: string;
}

export const analyzeDocument = async (text: string): Promise<ExtractedFields> => {
  console.log("Starting document analysis with text:", text);
  
  try {
    // Initialize the zero-shot classification pipeline
    const classifier = await pipeline(
      "zero-shot-classification",
      "facebook/bart-large-mnli",
      { device: "cpu" }
    );

    // Define possible field categories
    const labels = [
      "nome completo",
      "número de CPF",
      "número de RG",
      "número CRECI",
      "número OAB",
      "estado",
      "cidade",
      "órgão emissor"
    ];

    // Analyze each line of the document
    const lines = text.split('\n');
    const extractedFields: ExtractedFields = {};

    for (const line of lines) {
      if (!line.trim()) continue;

      const result = await classifier(line, labels);
      const bestMatch = result.labels[0];
      const confidence = result.scores[0];

      if (confidence > 0.7) {
        console.log(`Found match for ${bestMatch} with confidence ${confidence}`);
        
        switch (bestMatch) {
          case "nome completo":
            extractedFields.nome = line.replace(/nome:?\s*/i, '').trim();
            break;
          case "número de CPF":
            const cpfMatch = line.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/);
            if (cpfMatch) extractedFields.cpf = cpfMatch[0];
            break;
          case "número de RG":
            const rgMatch = line.match(/\d{1,2}\.?\d{3}\.?\d{3}-?\d{1}/);
            if (rgMatch) extractedFields.rg = rgMatch[0];
            break;
          case "número CRECI":
            const creciMatch = line.match(/CRECI.*?(\d+)/i);
            if (creciMatch) extractedFields.creci = creciMatch[1];
            break;
          case "número OAB":
            const oabMatch = line.match(/OAB.*?(\d+)/i);
            if (oabMatch) extractedFields.oab = oabMatch[1];
            break;
          case "estado":
            extractedFields.estado = line.replace(/estado:?\s*/i, '').trim();
            break;
          case "cidade":
            extractedFields.cidade = line.replace(/cidade:?\s*/i, '').trim();
            break;
          case "órgão emissor":
            extractedFields.orgaoEmissor = line.replace(/emissor:?\s*/i, '').trim();
            break;
        }
      }
    }

    console.log("Extracted fields:", extractedFields);
    return extractedFields;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};

export const processImage = async (file: File): Promise<ExtractedFields> => {
  console.log("Starting image processing");
  
  try {
    const result = await Tesseract.recognize(file, 'por', {
      logger: m => console.log('Tesseract progress:', m)
    });

    console.log("OCR completed, analyzing extracted text");
    return analyzeDocument(result.data.text);
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};
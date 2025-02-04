declare const cv: any;

export interface ProcessingOptions {
  denoise?: boolean;
  threshold?: boolean;
  deskew?: boolean;
  enhance?: boolean;
  removeBackground?: boolean;
}

export async function enhanceImage(input: File | Blob, options: ProcessingOptions = {}): Promise<ImageData> {
  try {
    // Converter entrada para ImageData
    const initialImageData = await fileOrBlobToImageData(input);
    
    // Aguardar OpenCV estar pronto
    if (typeof cv === 'undefined') {
      await new Promise(resolve => {
        const checkCV = () => {
          if (typeof cv !== 'undefined') {
            resolve(true);
          } else {
            setTimeout(checkCV, 100);
          }
        };
        checkCV();
      });
    }
    
    // Processamento com Canvas
    const enhancedImageData = await enhanceWithCanvas(initialImageData, options);
    
    // Processamento OpenCV
    return applyOpenCVProcessing(enhancedImageData, options);
  } catch (error) {
    console.error('Erro no processamento da imagem:', error);
    throw error;
  }
}

async function fileOrBlobToImageData(input: File | Blob): Promise<ImageData> {
  const url = URL.createObjectURL(input);
  
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Não foi possível criar contexto 2D');
    }
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous'; // Permitir carregamento de imagens cross-origin
    img.src = url;
  });
}

async function enhanceWithCanvas(imageData: ImageData, options: ProcessingOptions): Promise<ImageData> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Não foi possível criar contexto 2D');
  }
  
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);
  
  if (options.enhance) {
    // Aumentar contraste
    ctx.filter = 'contrast(120%) brightness(105%) saturate(110%)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
  }
  
  if (options.removeBackground) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (brightness > 240) {
        data[i] = data[i + 1] = data[i + 2] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function applyOpenCVProcessing(imageData: ImageData, options: ProcessingOptions): Promise<ImageData> {
  try {
    const src = cv.matFromImageData(imageData);
    let processed = new cv.Mat();
    
    // Converter para escala de cinza
    cv.cvtColor(src, processed, cv.COLOR_RGBA2GRAY);
    
    if (options.denoise) {
      // Redução de ruído avançada
      cv.fastNlMeansDenoising(processed, processed, 10, 7, 21);
    }
    
    if (options.threshold) {
      // Binarização adaptativa com parâmetros otimizados
      cv.adaptiveThreshold(
        processed,
        processed,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        15,
        5
      );
    }
    
    if (options.deskew) {
      try {
        // Detecção de linhas mais precisa
        const edges = new cv.Mat();
        cv.Canny(processed, edges, 50, 150, 3);
        
        const lines = new cv.Mat();
        cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 100, 100, 10);
        
        if (lines.rows > 0) {
          let angle = 0;
          for (let i = 0; i < lines.rows; i++) {
            const [x1, y1, x2, y2] = lines.data32S.slice(i * 4);
            angle += Math.atan2(y2 - y1, x2 - x1);
          }
          angle /= lines.rows;
          
          // Rotação com interpolação melhorada
          const center = new cv.Point(processed.cols / 2, processed.rows / 2);
          const rotMat = cv.getRotationMatrix2D(center, (angle * 180) / Math.PI, 1.0);
          cv.warpAffine(
            processed,
            processed,
            rotMat,
            new cv.Size(processed.cols, processed.rows),
            cv.INTER_CUBIC
          );
          
          rotMat.delete();
        }
        
        lines.delete();
        edges.delete();
      } catch (error) {
        console.warn('Erro ao corrigir rotação:', error);
      }
    }
    
    // Converter Mat de volta para ImageData
    const result = new ImageData(
      new Uint8ClampedArray(processed.data),
      processed.cols,
      processed.rows
    );
    
    // Limpar memória
    src.delete();
    processed.delete();
    
    return result;
  } catch (error) {
    console.error('Erro no processamento OpenCV:', error);
    return imageData; // Retorna imagem original em caso de erro
  }
} 
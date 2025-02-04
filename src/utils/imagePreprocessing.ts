declare const cv: any;

export interface PreprocessingOptions {
  denoise?: boolean;
  threshold?: boolean;
  deskew?: boolean;
}

export async function preprocessImage(imageData: ImageData, options: PreprocessingOptions = {}): Promise<ImageData> {
  const { denoise = true, threshold = true, deskew = true } = options;
  
  // Converter ImageData para Mat do OpenCV
  const src = cv.matFromImageData(imageData);
  let processed = new cv.Mat();
  
  try {
    // Converter para escala de cinza
    cv.cvtColor(src, processed, cv.COLOR_RGBA2GRAY);
    
    if (denoise) {
      // Redução de ruído
      cv.fastNlMeansDenoising(processed, processed);
    }
    
    if (threshold) {
      // Binarização adaptativa
      cv.adaptiveThreshold(
        processed,
        processed,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        11,
        2
      );
    }
    
    if (deskew) {
      // Detectar e corrigir rotação
      const minLineLength = processed.cols * 0.5;
      const lines = new cv.Mat();
      cv.HoughLinesP(
        processed,
        lines,
        1,
        Math.PI / 180,
        100,
        minLineLength,
        10
      );
      
      if (lines.rows > 0) {
        let angle = 0;
        for (let i = 0; i < lines.rows; i++) {
          const [x1, y1, x2, y2] = lines.data32S.slice(i * 4);
          angle += Math.atan2(y2 - y1, x2 - x1);
        }
        angle /= lines.rows;
        
        // Rotacionar imagem
        const center = new cv.Point(processed.cols / 2, processed.rows / 2);
        const rotMat = cv.getRotationMatrix2D(
          center,
          (angle * 180) / Math.PI,
          1.0
        );
        cv.warpAffine(
          processed,
          processed,
          rotMat,
          new cv.Size(processed.cols, processed.rows)
        );
        rotMat.delete();
      }
      lines.delete();
    }
    
    // Converter Mat de volta para ImageData
    const result = new ImageData(
      new Uint8ClampedArray(processed.data),
      processed.cols,
      processed.rows
    );
    
    return result;
  } finally {
    src.delete();
    processed.delete();
  }
} 
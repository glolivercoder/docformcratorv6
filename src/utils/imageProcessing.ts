export interface ImageProcessingOptions {
  grayscale?: boolean;
  contrast?: number;
  brightness?: number;
}

export async function processImage(
  imageSource: File | Blob | string,
  options: ImageProcessingOptions = {}
): Promise<HTMLCanvasElement> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Não foi possível criar contexto 2D');
  }

  canvas.width = img.width;
  canvas.height = img.height;

  // Desenhar imagem original
  ctx.drawImage(img, 0, 0);

  // Aplicar processamentos
  if (options.grayscale) {
    applyGrayscale(ctx, canvas.width, canvas.height);
  }

  if (options.contrast) {
    applyContrast(ctx, canvas.width, canvas.height, options.contrast);
  }

  if (options.brightness) {
    applyBrightness(ctx, canvas.width, canvas.height, options.brightness);
  }

  return canvas;
}

export async function loadImage(source: File | Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (source instanceof File || source instanceof Blob) {
      img.src = URL.createObjectURL(source);
    } else {
      img.src = source;
    }
  });
}

function applyGrayscale(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;     // R
    data[i + 1] = avg; // G
    data[i + 2] = avg; // B
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyContrast(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  contrast: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128;
    data[i + 1] = factor * (data[i + 1] - 128) + 128;
    data[i + 2] = factor * (data[i + 2] - 128) + 128;
  }

  ctx.putImageData(imageData, 0, 0);
}

function applyBrightness(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  brightness: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] += brightness;
    data[i + 1] += brightness;
    data[i + 2] += brightness;
  }

  ctx.putImageData(imageData, 0, 0);
}

export async function cropImage(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<HTMLCanvasElement> {
  const croppedCanvas = document.createElement('canvas');
  const ctx = croppedCanvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Não foi possível criar contexto 2D');
  }

  croppedCanvas.width = width;
  croppedCanvas.height = height;

  ctx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  return croppedCanvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Falha ao converter canvas para blob'));
          }
        },
        'image/png',
        1.0
      );
    } catch (error) {
      reject(error);
    }
  });
} 
import type { PixelCrop } from 'react-image-crop';

/**
 * Creates an HTMLImageElement from a URL or base64 string.
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export interface CroppedImageResult {
  blob: Blob;
  url: string;
  dataUrl: string;
  file: File;
  canvas: HTMLCanvasElement;
}

/**
 * Takes an image source and pixel crop coordinates, draws it to an invisible
 * HTML5 canvas, and exports a compressed JPEG Blob, File object, and permanent Data URL.
 *
 * @param imageSrc - URL or ObjectURL/base64 of the source image
 * @param pixelCrop - The pixel crop coordinates from react-image-crop
 * @param fileName - Optional custom filename for the generated File object
 * @param quality - JPEG compression quality (0.0 to 1.0, default: 0.84)
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  fileName: string = `cropped-${Date.now()}.jpg`,
  quality: number = 0.84
): Promise<CroppedImageResult> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D canvas context for image cropping');
  }

  // Constrain dimensions to prevent massive 4K canvas memory dumps
  // 16:9 banner: max 1280x720 is pristine sharp and ~60-90KB
  const rawW = Math.max(1, Math.round(pixelCrop.width));
  const rawH = Math.max(1, Math.round(pixelCrop.height));
  const maxDim = 1280;
  let finalW = rawW;
  let finalH = rawH;

  if (finalW > maxDim || finalH > maxDim) {
    const scale = Math.min(maxDim / finalW, maxDim / finalH);
    finalW = Math.round(finalW * scale);
    finalH = Math.round(finalH * scale);
  }

  canvas.width = finalW;
  canvas.height = finalH;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw the specified crop rectangle from the original image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const dataUrl = canvas.toDataURL('image/jpeg', quality);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty or failed to generate Blob'));
          return;
        }

        const file = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        // Use the persistent dataUrl as the primary URL so it never revokes or 404s upon refresh
        resolve({ blob, url: dataUrl, dataUrl, file, canvas });
      },
      'image/jpeg',
      quality
    );
  });
}

export default getCroppedImg;

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
  file: File;
}

/**
 * Takes an image source and pixel crop coordinates, draws it to an invisible
 * HTML5 canvas, and exports a compressed JPEG Blob and File object.
 *
 * @param imageSrc - URL or ObjectURL/base64 of the source image
 * @param pixelCrop - The pixel crop coordinates from react-image-crop
 * @param fileName - Optional custom filename for the generated File object
 * @param quality - JPEG compression quality (0.0 to 1.0, default: 0.88)
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  fileName: string = `cropped-${Date.now()}.jpg`,
  quality: number = 0.88
): Promise<CroppedImageResult> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D canvas context for image cropping');
  }

  // Set canvas dimensions to the cropped size
  canvas.width = Math.max(1, Math.round(pixelCrop.width));
  canvas.height = Math.max(1, Math.round(pixelCrop.height));

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

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty or failed to generate Blob'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const file = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        resolve({ blob, url, file });
      },
      'image/jpeg',
      quality
    );
  });
}

export default getCroppedImg;

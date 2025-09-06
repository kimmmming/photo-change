/**
 * Represents the result of a file-to-base64 conversion.
 */
export type FileConversionResult = {
  base64: string;
  mimeType: string;
};

/**
 * Converts a File object to a base64 encoded string, resizing it if necessary
 * to keep the payload size reasonable for API calls. A smaller payload is less
 * likely to cause network-related errors.
 * @param file The File object to convert.
 * @returns A promise that resolves with an object containing the base64 string and its correct MIME type.
 */
export const fileToBase64 = (file: File): Promise<FileConversionResult> => {
  const MAX_DIMENSION = 1024; // Max width or height of 1024px, a good balance for quality and size

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      const imgUrl = event.target?.result as string;
      if (!imgUrl) {
          return reject(new Error("Could not read file data."));
      }
      img.src = imgUrl;

      img.onload = () => {
        let { width, height } = img;

        // If the image is already small enough, no need to re-render on canvas
        if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
          const base64String = imgUrl.split(',')[1];
          resolve({ base64: base64String, mimeType: file.type });
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas 2D context.'));
        }

        // Calculate new dimensions while preserving aspect ratio
        if (width > height) {
            if (width > MAX_DIMENSION) {
                height *= MAX_DIMENSION / width;
                width = MAX_DIMENSION;
            }
        } else {
            if (height > MAX_DIMENSION) {
                width *= MAX_DIMENSION / height;
                height = MAX_DIMENSION;
            }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Output as JPEG for better compression, unless it's a PNG where transparency might be important.
        const outputMimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = outputMimeType === 'image/jpeg' ? 0.9 : 1.0;
        const dataUrl = canvas.toDataURL(outputMimeType, quality);

        const base64String = dataUrl.split(',')[1];
        resolve({ base64: base64String, mimeType: outputMimeType });
      };

      img.onerror = (error) => reject(new Error(`Image failed to load for processing: ${error}`));
    };
    reader.onerror = (error) => reject(new Error(`File reader error: ${error}`));
  });
};

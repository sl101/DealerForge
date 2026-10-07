/** Resize & compress image in browser before upload */
export async function resizeImageFile(
  file: File,
  options?: {
    maxSize?: number; // longest side px
    quality?: number; // 0..1 JPEG
    mime?: string;
  }
): Promise<File> {
  const maxSize = options?.maxSize ?? 512;
  const quality = options?.quality ?? 0.82;
  const mime = options?.mime ?? 'image/jpeg';

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let w = width;
  let h = height;

  if (w > maxSize || h > maxSize) {
    if (w >= h) {
      h = Math.round((h * maxSize) / w);
      w = maxSize;
    } else {
      w = Math.round((w * maxSize) / h);
      h = maxSize;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas not supported');
  }

  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Compress failed'))),
      mime,
      quality
    );
  });

  const base = file.name.replace(/\.[^.]+$/, '') || 'avatar';
  return new File([blob], `${base}.jpg`, { type: mime });
}
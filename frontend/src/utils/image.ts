export const getOptimizedImage = (url: string | null | undefined, width: number = 600) => {
  if (!url) return null;
  if (url.includes('cloudinary.com') && !url.includes('upload/w_')) {
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }
  return url;
};

// Local menu images were converted to WebP. The database may still hold the old .png/.jpg/.jfif
// path, so map local paths to their .webp file when displaying.
export const toWebpPath = (path: string) =>
  path.startsWith('/images/') ? path.replace(/\.(png|jpe?g|jfif)$/i, '.webp') : path;

export function normalizeMenuImage<T extends { image?: unknown }>(item: T): T {
  if (item && typeof item.image === 'string') return { ...item, image: toWebpPath(item.image) };
  return item;
}

export const normalizeMenuImages = <T extends { image?: unknown }>(items: T[]): T[] => items.map(normalizeMenuImage);

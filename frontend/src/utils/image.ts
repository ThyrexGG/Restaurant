export const getOptimizedImage = (url: string | null | undefined, width: number = 600) => {
  if (!url) return null;
  if (url.includes('cloudinary.com') && !url.includes('upload/w_')) {
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }
  return url;
};

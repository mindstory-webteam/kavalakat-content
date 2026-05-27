/**
 * Helper function to get the correct asset path for images and other assets
 * Automatically adds the basePath in production (GitHub Pages)
 */
export const getAssetPath = (path: string): string => {
  // In production (GitHub Pages), we need the /kavalakat prefix
  // In development (localhost), we don't need it
  const basePath = process.env.NODE_ENV === 'production' ? '/kavalakat' : '';
  
  // Ensure the path starts with a forward slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${normalizedPath}`;
};
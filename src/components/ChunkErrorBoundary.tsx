'use client';

import { useEffect, ReactNode } from 'react';

interface ChunkErrorBoundaryProps {
  children: ReactNode;
}

export default function ChunkErrorBoundary({ children }: ChunkErrorBoundaryProps) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      const isChunkError = 
        errorMessage.includes('ChunkLoadError') || 
        errorMessage.includes('Failed to load chunk') ||
        errorMessage.includes('Loading chunk') ||
        event.filename?.includes('_next/static/chunks/');

      if (isChunkError) {
        console.warn('Chunk load error detected, reloading page...');
        event.preventDefault();
        
        // Reload the page once
        if (!sessionStorage.getItem('chunk-error-reload')) {
          sessionStorage.setItem('chunk-error-reload', 'true');
          window.location.reload();
        } else {
          // If already reloaded once, clear storage and show error
          sessionStorage.removeItem('chunk-error-reload');
          alert('Unable to load the application. Please clear your browser cache and try again.');
        }
      }
    };

    // Handle Promise rejections (for dynamic imports)
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason || '';
      const isChunkError = 
        typeof reason === 'string' && 
        (reason.includes('ChunkLoadError') || 
         reason.includes('Failed to load chunk'));

      if (isChunkError) {
        console.warn('Chunk load error in promise, reloading page...');
        event.preventDefault();
        
        if (!sessionStorage.getItem('chunk-error-reload')) {
          sessionStorage.setItem('chunk-error-reload', 'true');
          window.location.reload();
        }
      }
    };

    // Clear reload flag on successful load
    sessionStorage.removeItem('chunk-error-reload');

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return <>{children}</>;
}
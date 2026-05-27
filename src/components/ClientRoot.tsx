"use client";
import ScrollCircleProgress from "@/utils/ScrollCircleProgess";
import useButtonHoverEffect from "@/customHooks/useButtonHoverEffect";
import useMagneticHover from "@/customHooks/useMagneticHover";
import { useMagicCursor } from "@/customHooks/useMagicCursor";
import { useEffect } from "react";
import handleAnimation from "@/utils/handleAnimation";
import { usePathname } from "next/navigation";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useButtonHoverEffect();
  useMagneticHover();
  useMagicCursor();

  // Chunk error handler - Add this useEffect
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
        
        if (!sessionStorage.getItem('chunk-error-reload')) {
          sessionStorage.setItem('chunk-error-reload', 'true');
          window.location.reload();
        } else {
          sessionStorage.removeItem('chunk-error-reload');
          alert('Unable to load the application. Please clear your browser cache and try again.');
        }
      }
    };

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

  useEffect(() => {
    // Wait for GSAP scripts to load before running animations
    const checkGSAPLoaded = setInterval(() => {
      if (window.gsap && window.SplitText && window.ScrollTrigger) {
        clearInterval(checkGSAPLoaded);
        handleAnimation(); // Call animation when GSAP is loaded
      }
    }, 100); // Check every 100ms

    return () => clearInterval(checkGSAPLoaded);
  }, [pathname]);

  useEffect(() => {
    require("../../public/assets/js/confetti.browser.min");
  }, []);

  useEffect(() => {
    if (pathname === "/textile") {
      document.body.classList.add("textile-home");
    } 
  }, [pathname]);

  return (
    <>
      {children}
      <ScrollCircleProgress />
    </>
  );
}
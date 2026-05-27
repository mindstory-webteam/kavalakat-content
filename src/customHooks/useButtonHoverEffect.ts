'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const useButtonHoverEffect = (): void => {
  const pathname = usePathname();

  useEffect(() => {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.btn-hover');

    const handleMouseMove = (e: MouseEvent, btn: HTMLButtonElement) => {
      const span = btn.querySelector<HTMLSpanElement>('span');
      if (!span) return;

      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;
      span.style.top = `${relY}px`;
      span.style.left = `${relX}px`;
    };

    const cleanups: (() => void)[] = [];

    buttons.forEach((btn) => {
      const span = btn.querySelector<HTMLSpanElement>('span');
      if (!span) return;

      const onEnter = (e: MouseEvent) => handleMouseMove(e, btn);
      const onLeave = (e: MouseEvent) => handleMouseMove(e, btn);

      btn.addEventListener('mouseenter', onEnter);
      btn.addEventListener('mouseout', onLeave);

      // Push cleanup function
      cleanups.push(() => {
        btn.removeEventListener('mouseenter', onEnter);
        btn.removeEventListener('mouseout', onLeave);
      });
    });

    // Cleanup all listeners
    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [pathname]);
};

export default useButtonHoverEffect;

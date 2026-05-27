import { useEffect } from "react";

const useHoverEffect = (selector: string): void => {
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.matches(selector)) {
        const span = target.querySelector<HTMLSpanElement>("span");
        if (!span) return;

        const rect = target.getBoundingClientRect();
        const relX = e.pageX - rect.left;
        const relY = e.pageY - rect.top;

        span.style.top = `${relY}px`;
        span.style.left = `${relX}px`;
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.matches(selector)) {
        const span = target.querySelector<HTMLSpanElement>("span");
        if (!span) return;

        const rect = target.getBoundingClientRect();
        const relX = e.pageX - rect.left;
        const relY = e.pageY - rect.top;

        span.style.top = `${relY}px`;
        span.style.left = `${relX}px`;
      }
    };

    const elements = document.querySelectorAll<HTMLElement>(selector);
    elements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseout", handleMouseOut);
    });

    return () => {
      elements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseout", handleMouseOut);
      });
    };
  }, [selector]);
};

export default useHoverEffect;

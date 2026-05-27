// customHooks/useGsapAnimations.ts
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Declare SplitText on the window
declare global {
  interface Window {
    SplitText?: any;
  }
}
const SplitText = window.SplitText;

export default function useGsapAnimations(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    if (!SplitText) {
      console.error("SplitText is not available. Please include GSAP SplitText plugin.");
      return;
    }

    // Title Animation
    const splitTitleLines = gsap.utils.toArray<HTMLElement>(".text-animation");

    splitTitleLines.forEach((splitTextLine) => {
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: splitTextLine,
          start: "top 90%",
          end: "bottom 60%",
          scrub: false,
          toggleActions: "play none none none",
        },
      });

      const itemSplitted = new SplitText(splitTextLine, { type: "words, lines" });
      gsap.set(splitTextLine, { perspective: 400 });
      itemSplitted.split({ type: "lines" });

      tl2.from(itemSplitted.lines, {
        duration: 1,
        delay: 0.3,
        opacity: 0,
        rotationX: -80,
        force3D: true,
        transformOrigin: "top center -50",
        stagger: 0.1,
      });
    });

    // Text Animation
    const splitTextLines = gsap.utils.toArray<HTMLElement>(".text-animation p");

    splitTextLines.forEach((splitTextLine) => {
      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: splitTextLine,
          start: "top 90%",
          end: "bottom 60%",
          scrub: false,
          toggleActions: "play none none none",
        },
      });

      const itemSplitted = new SplitText(splitTextLine, { type: "lines" });
      gsap.set(splitTextLine, { perspective: 400 });
      itemSplitted.split({ type: "lines" });

      tl3.from(itemSplitted.lines, {
        duration: 1,
        delay: 0.5,
        opacity: 0,
        rotationX: -80,
        force3D: true,
        transformOrigin: "top center -50",
        stagger: 0.1,
      });
    });
  }, []);
}

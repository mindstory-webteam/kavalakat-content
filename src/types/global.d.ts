export {};

declare global {
  interface Window {
    gsap?: typeof import("gsap");
    SplitText?: any; // যদি GSAP plugin টাইপ না থাকে, any দাও
    ScrollTrigger?: any;
  }
}

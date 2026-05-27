
"use client"
import { useEffect } from "react";

export function useCircularTextByClass(className: string, degreeStep: number = 13) {
  useEffect(() => {
    const container = document.querySelector(`.${className} .text`);
    if (container) {
      const text = container.textContent || "";
      container.innerHTML = text
        .split("")
        .map(
          (char, i) =>
            `<span style="transform:rotate(${i * degreeStep}deg)">${char}</span>`
        )
        .join("");
    }
  }, [className, degreeStep]);
}

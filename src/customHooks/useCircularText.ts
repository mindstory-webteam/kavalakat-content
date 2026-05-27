import { useEffect, useRef } from "react";

export function useCircularText(degreeStep: number = 13) {
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (textRef.current) {
      const originalText = textRef.current.textContent || "";
      textRef.current.innerHTML = originalText
        .split("")
        .map(
          (char, i) =>
            `<span style="transform:rotate(${i * degreeStep}deg)">${char}</span>`
        )
        .join("");
    }
  }, [degreeStep]);

  return textRef;
}

import { useEffect } from "react";
import gsap from "gsap";

export const useMagicCursor = (): void => {
  useEffect(() => {
    // Create the magic cursor container
    let cursor: HTMLDivElement | null = document.getElementById(
      "magic-cursor"
    ) as HTMLDivElement;
    if (!cursor) {
      cursor = document.createElement("div");
      cursor.id = "magic-cursor";
      document.body.appendChild(cursor);
    }

    // Create the ball inside the cursor container
    let ball: HTMLDivElement | null = document.getElementById("ball") as HTMLDivElement;
    if (!ball) {
      ball = document.createElement("div");
      ball.id = "ball";
      cursor.appendChild(ball);
    }

    const $mouse = { x: 0, y: 0 };
    const $pos = { x: 0, y: 0 };
    const $ratio = 0.2; // Adjust speed

    const updateMousePosition = (e: MouseEvent) => {
      $mouse.x = e.clientX;
      $mouse.y = e.clientY;
    };

    document.addEventListener("mousemove", updateMousePosition);

    const updatePosition = () => {
      $pos.x += ($mouse.x - $pos.x) * $ratio;
      $pos.y += ($mouse.y - $pos.y) * $ratio;
      if (ball) gsap.set(ball, { x: $pos.x, y: $pos.y });
    };

    gsap.ticker.add(updatePosition);

    return () => {
      document.removeEventListener("mousemove", updateMousePosition);
      gsap.ticker.remove(updatePosition);
      cursor?.remove(); // Cleanup on unmount
    };
  }, []);
};

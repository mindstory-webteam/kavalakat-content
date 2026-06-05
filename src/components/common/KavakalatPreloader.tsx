"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "enter" | "typing" | "hold" | "exit" | "done";

const SUFFIX = "AVALAKAT";

export default function KavakalatPreloader() {
  const [phase, setPhase] = useState<Phase>("enter");
  const [typedChars, setTypedChars] = useState(0);
  const [showRings, setShowRings] = useState(false);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t0 = setTimeout(() => setShowRings(true), 850);
    const t1 = setTimeout(() => setPhase("typing"), 1050);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;
    let i = 0;
    typingRef.current = setInterval(() => {
      i += 1;
      setTypedChars(i);
      if (i >= SUFFIX.length) {
        clearInterval(typingRef.current!);
        typingRef.current = null;
        setTimeout(() => setPhase("hold"), 250);
      }
    }, 88);
    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "hold") return;
    const t1 = setTimeout(() => setPhase("exit"), 850);
    const t2 = setTimeout(() => setPhase("done"), 1750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <>
      <style>{CSS}</style>
      <div className={`kvpl${phase === "exit" ? " kvpl--exit" : ""}`}>
        <div className="kvpl-inner">

          {/* K logo mark */}
          <div className="kvpl-mark">
            {showRings && (
              <>
                <span className="kvpl-ring kvpl-ring--1" aria-hidden="true" />
                <span className="kvpl-ring kvpl-ring--2" aria-hidden="true" />
              </>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 114.6 105.68"
              className="kvpl-svg"
              aria-label="Kavalakat logo mark"
            >
              <path
                fill="white"
                style={{ opacity: 0, animation: "kvpl-fadein 0.4s 0.08s ease forwards" }}
                d="M0,0h114.6s0,105.68,0,105.68H0S0,0,0,0ZM104.38,10.42H10.56s0,84.77,0,84.77h93.82s0-84.77,0-84.77Z"
              />
              <path
                fill="white"
                style={{ opacity: 0, animation: "kvpl-fadein 0.38s 0.38s ease forwards" }}
                d="M17.48,88.58c-.35.24-.8.37-.91.26-.3-.29-.27-.42.14-.83l33.44-34.08,25.51,27.71c1.9.22,3.62.41,5.84-.16l-27.25-31.34,31.09-30.46,13.83-.17-32.13,31.17,33.65,37.92h-31.43s-19.32-21.2-19.32-21.2l-20.2,21.15-12.28.04Z"
              />
              <polygon
                fill="white"
                style={{ opacity: 0, animation: "kvpl-fadein 0.32s 0.62s ease forwards" }}
                points="66.63 19.6 79.1 19.58 22.63 76.1 22.57 19.61 31.89 19.54 32.06 52.66 66.63 19.6"
              />
              <polygon
                fill="white"
                style={{ opacity: 0, animation: "kvpl-fadein 0.28s 0.80s ease forwards" }}
                points="46.07 34.47 36.48 43.96 36.44 19.59 46.03 19.54 46.07 34.47"
              />
            </svg>
          </div>

          {/* Brand name */}
          <div className="kvpl-name" aria-label="Kavalakat">
            <span
              className="kvpl-name-k"
              aria-hidden="true"
              style={{ opacity: 0, animation: "kvpl-slidein 0.35s 0.90s cubic-bezier(0.22,1,0.36,1) forwards" }}
            >
              K
            </span>
            <span className="kvpl-name-rest" aria-hidden="true">
              {SUFFIX.slice(0, typedChars).split("").map((char, i) => (
                <span key={i} className="kvpl-char">{char}</span>
              ))}
            </span>
            {(phase === "typing" || phase === "hold") && (
              <span
                className={`kvpl-cursor${phase === "hold" ? " kvpl-cursor--fade" : ""}`}
                aria-hidden="true"
              />
            )}
          </div>

        </div>
      </div>
    </>
  );
}

const CSS = `
  /* ── Full-screen overlay ── */
  .kvpl {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #1a56c4;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.88s cubic-bezier(0.76, 0, 0.24, 1);
    will-change: transform;
    /* prevent content overflow on tiny screens */
    overflow: hidden;
  }
  .kvpl--exit {
    transform: translateY(-100%);
  }

  /* ── Row: logo + name ── */
  .kvpl-inner {
    display: flex;
    align-items: center;
    /* clamp gap: 12px on 320px, scales to 28px at 1440px */
    gap: clamp(12px, 2vw, 28px);
    /* never overflow the viewport */
    max-width: 92vw;
  }

  /* ── Logo mark wrapper ──
     Size = clamp(52px, 10vw, 108px)
     ratio is 114.6 : 105.68 ≈ 1.085 : 1
     so height = width / 1.085
  */
  .kvpl-mark {
    position: relative;
    /* fluid width */
    width:  clamp(52px, 10vw, 108px);
    /* maintain aspect ratio via padding trick */
    height: clamp(48px, 9.22vw, 99px);
    flex-shrink: 0;
    animation: kvpl-popin 0.55s cubic-bezier(0.34, 1.45, 0.64, 1) both;
  }

  /* SVG fills its wrapper */
  .kvpl-svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  /* ── Pulse rings ── */
  .kvpl-ring {
    position: absolute;
    border-style: solid;
    border-color: rgba(255,255,255,0.22);
    border-radius: clamp(10px, 1.5vw, 16px);
    pointer-events: none;
    animation: kvpl-ringout 1.6s ease-out infinite;
  }
  .kvpl-ring--1 {
    inset: clamp(-6px, -1vw, -12px);
    border-width: 1.5px;
    animation-delay: 0s;
  }
  .kvpl-ring--2 {
    inset: clamp(-12px, -2vw, -26px);
    border-width: 1px;
    border-color: rgba(255,255,255,0.1);
    border-radius: clamp(14px, 2vw, 22px);
    animation-delay: 0.3s;
  }

  /* ── Brand name ── */
  .kvpl-name {
    display: flex;
    align-items: center;
    font-family: 'Trebuchet MS', 'Gill Sans', 'Arial Narrow', sans-serif;
    /* fluid font: 22px on 320px → 52px on 1440px */
    font-size: clamp(22px, 5vw, 52px);
    font-weight: 700;
    letter-spacing: 0.05em;
    color: white;
    line-height: 1;
    /* don't let the name wrap or overflow */
    white-space: nowrap;
  }

  .kvpl-name-k {
    display: inline-block;
  }

  .kvpl-name-rest {
    display: inline-flex;
  }

  .kvpl-char {
    display: inline-block;
    animation: kvpl-charin 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* ── Cursor ── */
  .kvpl-cursor {
    display: inline-block;
    /* fluid cursor height matches text */
    width: clamp(1.5px, 0.22vw, 3px);
    height: 1.1em;
    background: rgba(255,255,255,0.75);
    border-radius: 2px;
    margin-left: clamp(2px, 0.3vw, 5px);
    vertical-align: middle;
    animation: kvpl-blink 0.65s step-end infinite;
  }
  .kvpl-cursor--fade {
    animation: kvpl-cursorfade 0.35s 0.2s ease forwards;
  }

  /* ── Keyframes ── */
  @keyframes kvpl-popin {
    from { opacity: 0; transform: scale(0.62); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes kvpl-ringout {
    0%   { transform: scale(0.88); opacity: 0.65; }
    100% { transform: scale(1.75); opacity: 0; }
  }

  @keyframes kvpl-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes kvpl-slidein {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes kvpl-charin {
    from { opacity: 0; transform: translateY(0.2em); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes kvpl-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  @keyframes kvpl-cursorfade {
    to { opacity: 0; width: 0; margin: 0; }
  }

  /* ── Explicit breakpoints as safety net ──────────────────────

     clamp() handles everything in between, but these breakpoints
     lock in sane values at each major device class.
  ── */

  /* Tiny phones  (≤ 360px) */
  @media (max-width: 360px) {
    .kvpl-mark  { width: 48px; height: 44px; }
    .kvpl-name  { font-size: 20px; letter-spacing: 0.03em; }
    .kvpl-inner { gap: 10px; }
  }

  /* Small phones  (361px – 480px) */
  @media (min-width: 361px) and (max-width: 480px) {
    .kvpl-mark  { width: 56px; height: 52px; }
    .kvpl-name  { font-size: 24px; }
    .kvpl-inner { gap: 14px; }
  }

  /* Large phones / small tablets  (481px – 768px) */
  @media (min-width: 481px) and (max-width: 768px) {
    .kvpl-mark  { width: 72px; height: 66px; }
    .kvpl-name  { font-size: 32px; }
    .kvpl-inner { gap: 18px; }
  }

  /* Tablets  (769px – 1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    .kvpl-mark  { width: 84px; height: 78px; }
    .kvpl-name  { font-size: 40px; }
    .kvpl-inner { gap: 22px; }
  }

  /* Desktops  (1025px – 1440px) */
  @media (min-width: 1025px) and (max-width: 1440px) {
    .kvpl-mark  { width: 96px; height: 89px; }
    .kvpl-name  { font-size: 48px; }
    .kvpl-inner { gap: 26px; }
  }

  /* Large / 2K screens  (1441px – 2560px) */
  @media (min-width: 1441px) and (max-width: 2560px) {
    .kvpl-mark  { width: 108px; height: 100px; }
    .kvpl-name  { font-size: 56px; }
    .kvpl-inner { gap: 30px; }
  }

  /* 4K / ultra-wide  (> 2560px) */
  @media (min-width: 2561px) {
    .kvpl-mark  { width: 160px; height: 148px; }
    .kvpl-name  { font-size: 80px; }
    .kvpl-inner { gap: 40px; }
    .kvpl-cursor { width: 4px; }
  }

  /* Landscape phones — constrain height so nothing clips */
  @media (max-height: 420px) and (orientation: landscape) {
    .kvpl-mark  { width: 48px; height: 44px; }
    .kvpl-name  { font-size: 22px; }
    .kvpl-inner { gap: 12px; }
    .kvpl-ring--1 { inset: -6px; }
    .kvpl-ring--2 { inset: -12px; }
  }
`;
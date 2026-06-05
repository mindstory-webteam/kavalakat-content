"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "enter" | "typing" | "hold" | "exit" | "done";

const SUFFIX = "AVALAKAT";

export default function KavakalatPreloader() {
  const [phase, setPhase] = useState<Phase>("enter");
  const [typedChars, setTypedChars] = useState(0);
  const [showRings, setShowRings] = useState(false);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Phase timeline ──────────────────────────────────────────
  useEffect(() => {
    // Show rings slightly before typing starts (smoother feel)
    const t0 = setTimeout(() => setShowRings(true), 850);
    const t1 = setTimeout(() => setPhase("typing"), 1050);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, []);

  useEffect(() => {
    if (phase === "typing") {
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
    }
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

          {/* ── K logo mark ── */}
          <div className="kvpl-mark">

            {showRings && (
              <>
                <span className="kvpl-ring kvpl-ring--1" aria-hidden="true" />
                <span className="kvpl-ring kvpl-ring--2" aria-hidden="true" />
              </>
            )}

            {/*
              Exact paths from k.svg — all white.
              Stagger via animationDelay on each element,
              using opacity-only animation (no transform) so
              SVG rendering is bug-free cross-browser.
            */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 114.6 105.68"
              width="88"
              height="81"
              aria-label="Kavalakat logo mark"
              style={{ display: "block", overflow: "visible" }}
            >
              {/* 1 — outer border frame */}
              <path
                fill="white"
                style={{ opacity: 0, animation: "kvpl-fadein 0.4s 0.08s ease forwards" }}
                d="M0,0h114.6s0,105.68,0,105.68H0S0,0,0,0ZM104.38,10.42H10.56s0,84.77,0,84.77h93.82s0-84.77,0-84.77Z"
              />
              {/* 2 — main K body */}
              <path
                fill="white"
                style={{ opacity: 0, animation: "kvpl-fadein 0.38s 0.38s ease forwards" }}
                d="M17.48,88.58c-.35.24-.8.37-.91.26-.3-.29-.27-.42.14-.83l33.44-34.08,25.51,27.71c1.9.22,3.62.41,5.84-.16l-27.25-31.34,31.09-30.46,13.83-.17-32.13,31.17,33.65,37.92h-31.43s-19.32-21.2-19.32-21.2l-20.2,21.15-12.28.04Z"
              />
              {/* 3 — upper-left diagonal arm */}
              <polygon
                fill="white"
                style={{ opacity: 0, animation: "kvpl-fadein 0.32s 0.62s ease forwards" }}
                points="66.63 19.6 79.1 19.58 22.63 76.1 22.57 19.61 31.89 19.54 32.06 52.66 66.63 19.6"
              />
              {/* 4 — inner detail block */}
              <polygon
                fill="white"
                style={{ opacity: 0, animation: "kvpl-fadein 0.28s 0.80s ease forwards" }}
                points="46.07 34.47 36.48 43.96 36.44 19.59 46.03 19.54 46.07 34.47"
              />
            </svg>
          </div>

          {/* ── Brand name ── */}
          <div className="kvpl-name" aria-label="Kavalakat">
            {/* K — slides in just before typing begins */}
            <span
              className="kvpl-name-k"
              aria-hidden="true"
              style={{ opacity: 0, animation: "kvpl-slidein 0.35s 0.90s cubic-bezier(0.22,1,0.36,1) forwards" }}
            >
              K
            </span>

            {/* AVALAKAT — each char mounts at the right time; no delay offset needed */}
            <span className="kvpl-name-rest" aria-hidden="true">
              {SUFFIX.slice(0, typedChars).split("").map((char, i) => (
                <span key={i} className="kvpl-char">
                  {char}
                </span>
              ))}
            </span>

            {/* Blinking cursor */}
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

// ── All CSS in one place — easier to audit ──────────────────────
const CSS = `
  .kvpl {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #1a56c4;
    display: flex;
    align-items: center;
    justify-content: center;
    /* exit slide-up */
    transition: transform 0.88s cubic-bezier(0.76, 0, 0.24, 1);
    will-change: transform;
  }
  .kvpl--exit {
    transform: translateY(-100%);
  }

  /* centred row */
  .kvpl-inner {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  /* ── logo mark wrapper ── */
  .kvpl-mark {
    position: relative;
    width: 88px;
    height: 81px;
    flex-shrink: 0;
    animation: kvpl-popin 0.55s cubic-bezier(0.34, 1.45, 0.64, 1) both;
  }

  /* pulse rings — absolutely positioned, pointer-events none */
  .kvpl-ring {
    position: absolute;
    border-style: solid;
    border-color: rgba(255,255,255,0.22);
    border-radius: 14px;
    pointer-events: none;
    animation: kvpl-ringout 1.6s ease-out infinite;
  }
  .kvpl-ring--1 {
    inset: -10px;
    border-width: 1.5px;
    animation-delay: 0s;
  }
  .kvpl-ring--2 {
    inset: -22px;
    border-width: 1px;
    border-color: rgba(255,255,255,0.1);
    border-radius: 20px;
    animation-delay: 0.3s;
  }

  /* ── name ── */
  .kvpl-name {
    display: flex;
    align-items: center;
    font-family: 'Trebuchet MS', 'Gill Sans', 'Arial Narrow', sans-serif;
    font-size: 44px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: white;
    line-height: 1;
  }

  .kvpl-name-k {
    display: inline-block;
  }

  .kvpl-name-rest {
    display: inline-flex;
  }

  /* each typed char appears from below — no delay needed because
     the span only mounts when typedChars increments */
  .kvpl-char {
    display: inline-block;
    animation: kvpl-charin 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* blinking cursor */
  .kvpl-cursor {
    display: inline-block;
    width: 2.5px;
    height: 38px;
    background: rgba(255,255,255,0.75);
    border-radius: 2px;
    margin-left: 3px;
    vertical-align: middle;
    animation: kvpl-blink 0.65s step-end infinite;
  }
  .kvpl-cursor--fade {
    animation: kvpl-cursorfade 0.35s 0.2s ease forwards;
  }

  /* ── keyframes ── */
  @keyframes kvpl-popin {
    from { opacity: 0; transform: scale(0.62); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes kvpl-ringout {
    0%   { transform: scale(0.88); opacity: 0.65; }
    100% { transform: scale(1.7);  opacity: 0; }
  }

  /* opacity-only — safe on all SVG elements */
  @keyframes kvpl-fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes kvpl-slidein {
    from { opacity: 0; transform: translateX(-6px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes kvpl-charin {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes kvpl-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  @keyframes kvpl-cursorfade {
    to { opacity: 0; width: 0; margin: 0; }
  }
`;
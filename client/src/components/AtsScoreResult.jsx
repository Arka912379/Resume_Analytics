import React, { useEffect, useRef, useState } from "react";

// =====================================================================
// ATS score popup
//
//  - the page behind is blurred
//  - the green "ATS SCORE" card pops in and counts up to the score
//  - after `holdMs` a green wipe fills the screen and onFinish() is called
//    (use it to go to the dashboard). Click / Enter / Esc skips the wait.
//
// Props:
//   score     number 1-100
//   onFinish  called once, after the leave transition
//   holdMs    how long the card stays before leaving (default 4200)
// =====================================================================

const GREEN = "#5fdc98";
const INK = "#111111";
const ARC = "#7c5cff";
const TRACK = "#f6f6f6";

const CARD_W = 815;
const CARD_H = 280;
const SHADOW = 8;

const RING_R = 90;
const RING_C = 2 * Math.PI * RING_R;

const FONT = '"Archivo Black", "Arial Black", Arial, Helvetica, sans-serif';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function tierFor(score) {
  if (score >= 80) return { label: "EXCELLENT", color: "#b290ff" };
  if (score >= 65) return { label: "GOOD", color: "#fed824" };
  if (score >= 50) return { label: "FAIR", color: "#ffb86b" };
  return { label: "NEEDS WORK", color: "#fc687f" };
}

function AtsScoreResult({ score, onFinish, holdMs = 4200 }) {
  const safeScore = clamp(Math.round(Number(score) || 1), 1, 100);
  const tier = tierFor(safeScore);

  const [phase, setPhase] = useState("enter"); // enter | leave
  const [shown, setShown] = useState(0);
  const [zoom, setZoom] = useState(1);

  const finishRef = useRef(onFinish);
  const finishedRef = useRef(false);

  finishRef.current = onFinish;

  // fit the card to the window
  useEffect(() => {
    const fit = () =>
      setZoom(
        clamp(
          Math.min(
            (window.innerWidth * 0.9) / (CARD_W + SHADOW),
            (window.innerHeight * 0.7) / (CARD_H + SHADOW)
          ),
          0.4,
          1.3
        )
      );

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // count up 0 -> score
  useEffect(() => {
    let raf = 0;
    const begin = performance.now() + 450;
    const duration = 1500;

    const tick = (now) => {
      const t = clamp((now - begin) / duration, 0, 1);
      setShown(safeScore * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [safeScore]);

  // leave automatically
  useEffect(() => {
    const timer = setTimeout(() => setPhase("leave"), holdMs);
    return () => clearTimeout(timer);
  }, [holdMs]);

  // hand over once the green wipe has covered the screen
  useEffect(() => {
    if (phase !== "leave") return undefined;

    const timer = setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true;
        finishRef.current?.();
      }
    }, 750);

    return () => clearTimeout(timer);
  }, [phase]);

  // skip with click / Enter / Space / Esc
  const skip = () => setPhase("leave");

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
        event.preventDefault();
        setPhase("leave");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = Math.round(shown);
  const arcLength = RING_C * (shown / 100);
  const arcStart = -90 + (1 - safeScore / 100) * 360;

  const labelWidth = tier.label.length * 21.6;
  const pillWidth = Math.round(labelWidth + 67);

  return (
    <div
      className={`ats-overlay ats-${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label={`ATS score ${safeScore} percent. Opening your dashboard.`}
      onClick={skip}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap');

        .ats-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          background: rgba(24, 14, 48, 0.3);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          font-family: ${FONT};
          cursor: pointer;
          animation: atsBlurIn 0.45s ease-out both;
        }

        .ats-card-wrap {
          animation: atsPop 0.6s cubic-bezier(0.2, 1.1, 0.3, 1) both;
          transition: transform 0.65s cubic-bezier(0.5, 0, 0.9, 0.4), opacity 0.45s ease 0.2s;
        }

        .ats-leave .ats-card-wrap { transform: scale(1.12); opacity: 0; }

        .ats-wipe {
          position: absolute;
          inset: 0;
          background: ${GREEN};
          clip-path: circle(0% at 50% 50%);
          pointer-events: none;
        }
        .ats-leave .ats-wipe {
          animation: atsWipe 0.75s cubic-bezier(0.6, 0, 0.3, 1) both;
        }

        @keyframes atsBlurIn {
          from { opacity: 0; -webkit-backdrop-filter: blur(0px); backdrop-filter: blur(0px); }
          to { opacity: 1; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
        }
        @keyframes atsPop {
          0% { opacity: 0; transform: translateY(40px) scale(0.82); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes atsWipe {
          from { clip-path: circle(0% at 50% 50%); }
          to { clip-path: circle(150% at 50% 50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ats-overlay, .ats-card-wrap { animation: none; }
          .ats-leave .ats-wipe { animation-duration: 0.01s; }
        }
      `}</style>

      <div className="ats-card-wrap">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
          <svg
            width={CARD_W + SHADOW}
            height={CARD_H + SHADOW}
            viewBox={`0 0 ${CARD_W + SHADOW} ${CARD_H + SHADOW}`}
            style={{ display: "block", overflow: "visible" }}
          >
            {/* card + hard shadow */}
            <rect x={SHADOW} y={SHADOW} width={CARD_W} height={CARD_H} fill={INK} />
            <rect x="1" y="1" width={CARD_W - 2} height={CARD_H - 2} fill={GREEN} stroke={INK} strokeWidth="2" />

            {/* title + score */}
            <text
              x="34"
              y="72"
              fontSize="34"
              fontWeight="900"
              fill={INK}
              stroke={INK}
              strokeWidth="1.2"
              fontFamily={FONT}
              textLength="206"
              lengthAdjust="spacingAndGlyphs"
            >
              ATS SCORE
            </text>

            <text x="34" y="171" fill={INK} stroke={INK} strokeWidth="1.6" fontFamily={FONT} fontWeight="900">
              <tspan fontSize="91">{value}</tspan>
              <tspan fontSize="46" dx="5" dy="-11">
                %
              </tspan>
            </text>

            {/* verdict pill */}
            <rect x="34" y="192" width={pillWidth} height="46" rx="23" fill={tier.color} />
            <text
              x="67.5"
              y="226"
              fontSize="30"
              fontWeight="900"
              fill={INK}
              stroke={INK}
              strokeWidth="1"
              fontFamily={FONT}
              textLength={labelWidth}
              lengthAdjust="spacingAndGlyphs"
            >
              {tier.label}
            </text>

            {/* menu dots */}
            <circle cx="762.5" cy="29.5" r="3.5" fill={INK} />
            <circle cx="772.5" cy="29.5" r="3.5" fill={INK} />
            <circle cx="782.5" cy="29.5" r="3.5" fill={INK} />

            {/* donut */}
            <circle cx="654.5" cy="139.5" r={RING_R} fill="none" stroke={TRACK} strokeWidth="20" />
            <g transform={`rotate(${arcStart} 654.5 139.5)`}>
              <circle
                cx="654.5"
                cy="139.5"
                r={RING_R}
                fill="none"
                stroke={ARC}
                strokeWidth="20"
                strokeDasharray={`${arcLength} ${RING_C}`}
              />
            </g>

            <text
              x="654.5"
              y="162"
              textAnchor="middle"
              fill={INK}
              stroke={INK}
              strokeWidth="1.1"
              fontFamily={FONT}
              fontWeight="900"
            >
              <tspan fontSize="58">{value}</tspan>
              <tspan fontSize="27" dx="2" dy="-5">
                %
              </tspan>
            </text>
          </svg>
        </div>
      </div>

      <div className="ats-wipe" />
    </div>
  );
}

export default AtsScoreResult;
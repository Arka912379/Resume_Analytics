import React, { useCallback, useEffect, useRef, useState } from "react";
import { useInRouterContext, useNavigate } from "react-router-dom";
import AtsScoreResult from "../components/AtsScoreResult";

// =====================================================================
// Resume upload page - ONE file, no Tailwind / CSS / API files needed.
//
// The whole design is drawn on a fixed 1670 x 942 stage that scales to
// fit the window, so it always matches the reference image.
//
// The page opens as an overlay: everything behind the white window card
// is blurred (the dashboard underneath, plus the decorative shapes).
//
// Closing the page (back to the dashboard):
//   - click anywhere on the blurred area outside the card
//   - click the cross button in the top-right corner of the card
//   - press Escape
//
// Flow:
//   drop a file anywhere on the page (or click the dotted box and pick one)
//   -> the file is thrown like a basketball into the hoop
//   -> it drops through the net and lands INSIDE the dotted box
//   -> resume analysis starts automatically (no button to press)
//   -> the green ATS SCORE popup opens over a blurred page, then the app
//      moves to the dashboard by itself (AtsScoreResult.jsx)
//
//
// Optional props:
//   onAnalyze(file, { signal }) -> Promise   (plug in your real analysis;
//                                             a 5 second simulation is used
//                                             when it is not provided)
//   onAnalysisComplete(file, result)
//   onGoToDashboard(result)                  (default: navigate(DASHBOARD_PATH))
//   onClose()                                (blurred area / cross / Escape;
//                                             default: navigate(DASHBOARD_PATH))
//
// The analysis result should contain { score: 1-100 }.
// =====================================================================

const STAGE_W = 1670;
const STAGE_H = 942;

// route of the dashboard (used by the close actions and after the ATS popup)
const DASHBOARD_PATH = "/";

const PURPLE = "#936efc";
const YELLOW = "#fed824";
const PINK = "#fc687f";
const MINT = "#59e6ad";
const LAVENDER = "#efecfd";
const GRAY_TEXT = "#4e4e4f";
const ERROR_RED = "#c0143c";
const OK_GREEN = "#0e7a50";

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPT_ATTR =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// dotted upload box (stage coordinates)
const BOX = { x: 584, y: 505, w: 504, h: 210 };

// white window card incl. its drop shadow (stage coordinates).
// clicks outside this rectangle count as "click on the blurred area".
const CARD = { x: 315, y: 145, w: 1062, h: 698 };

// cross button in the card's top-right corner (stage coordinates)
const CLOSE_BTN = { x: 1303, y: 157, size: 34 };

// hoop geometry
const HOOP_X = 837;
const RIM_Y = 566;

// net geometry (slightly bigger than before: wider and a little longer)
const NET_TOP = 572;
const NET_BOTTOM = 688;
const NET_STEPS = 28;
const NET_STRANDS = 4;
const NET_SPAN = 1.35;
const NET_HALF_TOP = 80;
const NET_HALF_BOTTOM = 48;
const NET_DROP = NET_BOTTOM - RIM_Y - 2; // how far a file falls inside the net

// where a thrown file comes to rest (inside the dotted box)
const LAND_Y = 696.5;
const LAND_SCALE = 0.62;

// size of the thrown file icon in flight (1 = original size). It shrinks
// back to LAND_SCALE while it drops out of the net, so it still fits the box.
const FILE_SCALE = 1.6;

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------
function getExtension(name) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

function validateFile(file) {
  if (!ALLOWED_EXTENSIONS.includes(getExtension(file.name))) {
    return "Only PDF, DOC and DOCX files are supported.";
  }
  if (file.type && !ALLOWED_MIME.includes(file.type)) {
    return "Only PDF, DOC and DOCX files are supported.";
  }
  return "";
}

function fileSignature(file) {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

function shortenName(name, max = 30) {
  if (name.length <= max) return name;
  const ext = getExtension(name);
  const tail = ext ? `.${ext}` : "";
  return `${name.slice(0, max - tail.length - 1)}…${tail}`;
}

function pillWidthFor(name) {
  return Math.min(430, Math.max(190, Math.round(shortenName(name).length * 9 + 100)));
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// demo score for the simulated analysis (same file -> same score)
function simulatedScore(file) {
  let hash = 2166136261;
  const text = fileSignature(file);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return 48 + ((hash >>> 0) % 49); // 48 - 96
}

function normalizeScore(value, file) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0
    ? clamp(Math.round(number), 1, 100)
    : simulatedScore(file);
}

// default analysis (replace through the onAnalyze prop)
function simulateAnalysis(file, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException("Analysis cancelled", "AbortError"));

    if (signal?.aborted) {
      abort();
      return;
    }

    const timer = setTimeout(() => resolve({ fileName: file.name, size: file.size, score: simulatedScore(file) }), 5200);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        abort();
      },
      { once: true }
    );
  });
}

// triangle wave that folds a value back into [-1, 1]
function fold(u) {
  let v = (u + 1) % 4;
  if (v < 0) v += 4;
  if (v > 2) v = 4 - v;
  return v - 1;
}

function netPoint(step, u, t, amp) {
  const f = step / NET_STEPS;
  const y = NET_TOP + (NET_BOTTOM - NET_TOP) * f;
  const halfWidth = NET_HALF_TOP - (NET_HALF_TOP - NET_HALF_BOTTOM) * f;
  const weight = Math.pow(f, 1.35);

  // travelling wave + slow pendulum = cloth-like motion
  const sway =
    weight *
    amp *
    (2.2 * Math.sin(1.7 * t - 2.2 * f) + 1.0 * Math.sin(2.9 * t - 3.8 * f + 1.3));
  const give = weight * amp * 0.9 * Math.sin(2.3 * t + 0.8);
  const breathe = 1 + 0.012 * amp * Math.sin(2.1 * t);

  return [HOOP_X - 1 + halfWidth * breathe * u + sway, y + give];
}

function buildNetPath(t, amp) {
  const strands = [() => -1, () => 1];

  // two families of crossing strands (they fold at the edges = diamonds)
  for (let k = 0; k < NET_STRANDS; k += 1) {
    const start = -1 + (2 * k) / (NET_STRANDS - 1);
    strands.push((f) => fold(start + NET_SPAN * f));
    strands.push((f) => fold(start - NET_SPAN * f));
  }

  let d = "";

  strands.forEach((uAt) => {
    for (let s = 0; s <= NET_STEPS; s += 1) {
      const [x, y] = netPoint(s, uAt(s / NET_STEPS), t, amp);
      d += `${s === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
  });

  return d;
}

// small document used for the ghost / flying file
function MiniDoc() {
  return (
    <g>
      <path
        d="M-14 -17 H4 L16 -5 V21 H-14 Z"
        transform="translate(4 4)"
        fill="#000"
        stroke="#000"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M-15 -19 H3 L15 -7 V19 H-15 Z"
        fill={PURPLE}
        stroke="#000"
        strokeWidth="3.4"
        strokeLinejoin="round"
      />
      <path d="M3 -19 V-7 H15" fill="#b79dff" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
      <path
        d="M-8 1 H7 M-8 8 H7 M-8 14 H0"
        stroke="#000"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </g>
  );
}

// =====================================================================
// PAGE
// =====================================================================
function ResumeUploadPage({ onAnalyze = simulateAnalysis, onAnalysisComplete, onGoToDashboard, onClose }) {
  const inRouter = useInRouterContext();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = inRouter ? useNavigate() : null; // stable for the life of the component

  const [viewport, setViewport] = useState({ w: STAGE_W, h: STAGE_H });
  const [scoreInfo, setScoreInfo] = useState(null);
  const [showScore, setShowScore] = useState(false);
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | throwing | analyzing | done | failed
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null); // { text, kind: "error" | "note" }
  const [dragging, setDragging] = useState(false);
  const [overBox, setOverBox] = useState(false);
  const [invalidDrag, setInvalidDrag] = useState(false);
  const [ghost, setGhost] = useState(null);
  const [pillKey, setPillKey] = useState(0);

  const stageRef = useRef(null);
  const inputRef = useRef(null);
  const netOutlineRef = useRef(null);
  const netFillRef = useRef(null);
  const flyBackRef = useRef(null);
  const flyFrontRef = useRef(null);
  const rippleRef = useRef(null);
  const ghostRef = useRef(null);

  const messageTimer = useRef(null);
  const pickerOrigin = useRef({ x: 700, y: 640 });

  // mutable animation state (no re-render needed)
  const anim = useRef({ boost: 0, drag: 0, dragTarget: false, flight: null, ripple: null });

  // duplicate protection + async control
  const activeSig = useRef(null); // file currently being thrown / analysed
  const completedSig = useRef(null); // last file whose analysis finished
  const runRef = useRef(0);
  const abortRef = useRef(null);
  const phaseRef = useRef(phase);

  // always-fresh copies for the long-lived listeners
  const handleFileRef = useRef(null);
  const onAnalyzeRef = useRef(onAnalyze);
  const onCompleteRef = useRef(onAnalysisComplete);
  const landedRef = useRef(null);

  phaseRef.current = phase;
  onAnalyzeRef.current = onAnalyze;
  onCompleteRef.current = onAnalysisComplete;

  // ---------- layout: the stage always fills the window ----------
  // the reference picture (1670 x 942) is centred and scaled to fit; the
  // decorative shapes stay glued to the real window edges.
  const scale = Math.min(viewport.w / STAGE_W, viewport.h / STAGE_H);
  const stageW = viewport.w / scale;
  const stageH = viewport.h / scale;
  const offX = (stageW - STAGE_W) / 2;
  const offY = (stageH - STAGE_H) / 2;

  const layoutRef = useRef(null);
  layoutRef.current = { scale, stageW, stageH, offX, offY };

  // ---------- fit the stage to the window ----------
  useEffect(() => {
    const fit = () => setViewport({ w: window.innerWidth, h: window.innerHeight });

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // ---------- close: back to the dashboard ----------
  // cancels whatever is running, then lets the parent decide (onClose) or
  // navigates to the dashboard route.
  const handleClose = useCallback(() => {
    runRef.current += 1;
    abortRef.current?.abort();
    activeSig.current = null;
    anim.current.flight = null;

    if (onClose) {
      onClose();
    } else if (navigate) {
      navigate(DASHBOARD_PATH);
    }
  }, [navigate, onClose]);

  // Escape closes the page too (not while the ATS popup is showing)
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && !showScore) handleClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose, showScore]);

  // ---------- messages ----------
  const showMessage = useCallback((text, kind = "error") => {
    clearTimeout(messageTimer.current);
    setMessage({ text, kind });
    messageTimer.current = setTimeout(() => setMessage(null), 3800);
  }, []);

  // ---------- automatic analysis (starts the moment the file has landed) ----------
  const startAnalysis = useCallback(
    (target) => {
      runRef.current += 1;
      const runId = runRef.current;
      const signature = fileSignature(target);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setProgress(0);
      setPhase("analyzing");

      (async () => {
        try {
          const result = await onAnalyzeRef.current(target, { signal: controller.signal });
          if (runRef.current !== runId) return;

          setProgress(100);
          await new Promise((resolve) => setTimeout(resolve, 550));
          if (runRef.current !== runId) return;

          completedSig.current = signature;
          activeSig.current = null;
          setPhase("done");
          onCompleteRef.current?.(target, result);
          setScoreInfo({ score: normalizeScore(result?.score, target), fileName: target.name, result });
          setShowScore(true);
        } catch (problem) {
          if (runRef.current !== runId || problem?.name === "AbortError") return;

          activeSig.current = null;
          setPhase("failed");
          showMessage("Analysis failed. Please try again.");
        }
      })();
    },
    [showMessage]
  );

  // the file touched down inside the box -> select it and analyse it
  landedRef.current = (landedFile) => {
    setFile(landedFile);
    setPillKey((key) => key + 1);
    startAnalysis(landedFile);
  };

  // progress bar creeps towards 92% while we wait
  useEffect(() => {
    if (phase !== "analyzing") return undefined;

    const timer = setInterval(() => {
      setProgress((current) =>
        current >= 92 ? current : current + Math.max(0.35, (92 - current) * 0.045)
      );
    }, 120);

    return () => clearInterval(timer);
  }, [phase]);

  // ---------- coordinates ----------
  const toStage = (clientX, clientY, restrictToBox = false) => {
    // coordinates of the reference picture (0..1670 x 0..942); points in the
    // side margins of a wide / tall window are allowed (negative or larger)
    const rect = stageRef.current.getBoundingClientRect();
    const L = layoutRef.current;
    let x = clamp((clientX - rect.left) / L.scale - L.offX, -L.offX, STAGE_W + L.offX);
    let y = clamp((clientY - rect.top) / L.scale - L.offY, -L.offY, STAGE_H + L.offY);

    if (restrictToBox) {
      x = clamp(x, BOX.x + 30, BOX.x + BOX.w - 30);
      y = clamp(y, BOX.y + 30, BOX.y + BOX.h - 40);
    }

    return { x, y };
  };

  // click on the blurred area (anything outside the card) -> dashboard
  const handleBackdropClick = (event) => {
    if (showScore || !stageRef.current) return; // the ATS popup lives inside this root

    const p = toStage(event.clientX, event.clientY);
    const insideCard =
      p.x >= CARD.x && p.x <= CARD.x + CARD.w && p.y >= CARD.y && p.y <= CARD.y + CARD.h;

    if (!insideCard) handleClose();
  };

  // ---------- receiving a file (drop anywhere or picker) ----------
  // from = where the throw starts (stage coordinates)
  const handleFile = (selected, from) => {
    if (!selected) return;

    const problem = validateFile(selected);

    if (problem) {
      showMessage(problem);
      return;
    }

    const signature = fileSignature(selected);

    // never trigger the same file twice
    if (activeSig.current === signature) return;

    if (completedSig.current === signature && phaseRef.current === "done") {
      anim.current.boost = 0.6;
      showMessage("This resume was already analyzed.", "note");
      return;
    }

    // a different file replaces whatever is running
    runRef.current += 1;
    abortRef.current?.abort();

    clearTimeout(messageTimer.current);
    setMessage(null);
    setFile(null);
    setProgress(0);
    setPhase("throwing");
    activeSig.current = signature;

    const start = {
      x: clamp(from?.x ?? 700, -layoutRef.current.offX, STAGE_W + layoutRef.current.offX),
      y: clamp(from?.y ?? 640, -layoutRef.current.offY, STAGE_H + layoutRef.current.offY),
    };

    const distance = Math.hypot(start.x - HOOP_X, start.y - RIM_Y);
    const midY = (start.y + RIM_Y) / 2;
    const rawLift = 130 + distance * 0.12 + Math.max(0, (start.y - RIM_Y) * 0.25);

    anim.current.flight = {
      x0: start.x,
      y0: start.y,
      start: performance.now(),
      file: selected,
      t1: clamp(700 + distance * 0.55, 850, 1500),
      lift: clamp(rawLift, 60, Math.max(60, midY - 24)),
      lx: HOOP_X - pillWidthFor(selected.name) / 2 + 17.5,
      hit: false,
      impact: false,
      landed: false,
    };
  };

  handleFileRef.current = handleFile;

  // ---------- file picker ----------
  const openPicker = () => inputRef.current?.click();

  const handleBoxClick = (event) => {
    pickerOrigin.current = toStage(event.clientX, event.clientY, true);
    openPicker();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pickerOrigin.current = { x: 700, y: 640 };
      openPicker();
    }
  };

  const handleInputChange = (event) => {
    handleFile(event.target.files?.[0], pickerOrigin.current);
    event.target.value = ""; // lets the same file be picked again
  };

  const removeFile = (event) => {
    event.stopPropagation();

    runRef.current += 1;
    abortRef.current?.abort();
    activeSig.current = null;
    completedSig.current = null;
    anim.current.flight = null;

    setFile(null);
    setProgress(0);
    setPhase("idle");
  };

  // ---------- drag and drop: works anywhere on the page ----------
  useEffect(() => {
    let depth = 0;

    const hasFiles = (event) =>
      Array.from(event.dataTransfer?.types || []).includes("Files");

    const endDrag = () => {
      depth = 0;
      anim.current.dragTarget = false;
      setDragging(false);
      setOverBox(false);
      setInvalidDrag(false);
      setGhost(null);
    };

    const inspect = (event) => {
      const first = Array.from(event.dataTransfer?.items || [])[0];
      const bad = Boolean(
        first && first.kind === "file" && first.type && !ALLOWED_MIME.includes(first.type)
      );
      setInvalidDrag(bad);
      return bad;
    };

    const onEnter = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth += 1;
      anim.current.dragTarget = true;
      setDragging(true);
      inspect(event);
    };

    const onOver = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();

      const bad = inspect(event);
      event.dataTransfer.dropEffect = bad ? "none" : "copy";

      const p = toStage(event.clientX, event.clientY);

      setOverBox(
        p.x >= BOX.x && p.x <= BOX.x + BOX.w && p.y >= BOX.y && p.y <= BOX.y + BOX.h
      );

      setGhost((previous) =>
        previous && Math.abs(previous.x - p.x) < 2 && Math.abs(previous.y - p.y) < 2
          ? previous
          : p
      );
    };

    const onLeave = (event) => {
      if (!hasFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) endDrag();
    };

    const onDrop = (event) => {
      if (!hasFiles(event)) return;
      event.preventDefault();

      const p = toStage(event.clientX, event.clientY);
      const dropped = event.dataTransfer.files?.[0];

      endDrag();

      if (!dropped) {
        showMessage("Please drop a PDF, DOC or DOCX file.");
        return;
      }

      handleFileRef.current?.(dropped, p);
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
      clearTimeout(messageTimer.current);
      abortRef.current?.abort();
    };
  }, [showMessage]);

  // ---------- animation loop: net, ghost file, thrown file ----------
  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const startedAt = performance.now();
    let last = startedAt;
    let flightHidden = true;

    const place = (el, x, y, rot, sc, opacity) => {
      el.setAttribute(
        "transform",
        `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(3)})`
      );
      el.setAttribute("opacity", opacity.toFixed(2));
    };

    const loop = (now) => {
      const a = anim.current;
      const t = (now - startedAt) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      a.boost *= Math.exp(-dt * 2.4);
      a.drag += ((a.dragTarget ? 1 : 0) - a.drag) * Math.min(1, dt * 6);

      const amp = (reduceMotion ? 0.45 : 1) * (1 + 3.6 * a.boost + 1.1 * a.drag);
      const d = buildNetPath(t, amp);

      netOutlineRef.current?.setAttribute("d", d);
      netFillRef.current?.setAttribute("d", d);

      // file hovering above the page while it is being dragged
      if (ghostRef.current) {
        ghostRef.current.setAttribute(
          "transform",
          `translate(0 ${(Math.sin(now / 160) * 4).toFixed(1)}) rotate(${(
            Math.sin(now / 260) * 5
          ).toFixed(1)}) scale(${(FILE_SCALE * 1.15).toFixed(3)})`
        );
      }

      // landing ripple
      const ripple = a.ripple;
      if (rippleRef.current) {
        if (ripple) {
          const q = (now - ripple.start) / 450;
          if (q >= 1) {
            a.ripple = null;
            rippleRef.current.setAttribute("opacity", "0");
          } else {
            rippleRef.current.setAttribute("cx", ripple.x.toFixed(1));
            rippleRef.current.setAttribute("cy", (LAND_Y + 9).toFixed(1));
            rippleRef.current.setAttribute("rx", (8 + 26 * q).toFixed(1));
            rippleRef.current.setAttribute("ry", (2 + 5 * q).toFixed(1));
            rippleRef.current.setAttribute("opacity", (0.55 * (1 - q)).toFixed(2));
          }
        } else {
          rippleRef.current.setAttribute("opacity", "0");
        }
      }

      // thrown file: arc -> hoop -> through the net -> lands in the box
      const f = a.flight;
      const back = flyBackRef.current;
      const front = flyFrontRef.current;

      if (f && back && front) {
        const t2 = 300;
        const t3 = 700;
        const t4 = 260;
        const e = now - f.start;

        let x;
        let y;
        let rot;
        let sc;
        let opacity = 1;
        let inFront = false;

        if (e < f.t1) {
          // 1) the throw
          const p = e / f.t1;
          x = f.x0 + (HOOP_X - f.x0) * p;
          y = f.y0 + (RIM_Y - f.y0) * p - f.lift * 4 * p * (1 - p);
          rot = -20 + 360 * p;
          sc = FILE_SCALE * (1.15 - 0.15 * p);
        } else if (e < f.t1 + t2) {
          // 2) falling through the net
          const q = (e - f.t1) / t2;
          if (!f.hit) {
            f.hit = true;
            a.boost = 1;
          }
          x = HOOP_X + Math.sin(q * 6) * 4 * (1 - q);
          y = RIM_Y + NET_DROP * (0.55 * q * q + 0.45 * q);
          rot = 340 + 20 * q;
          sc = FILE_SCALE * (1 - 0.2 * q);
        } else if (e < f.t1 + t2 + t3) {
          // 3) out of the net, landing inside the dotted box
          inFront = true;
          const r = (e - f.t1 - t2) / t3;
          const FALL = 0.5;
          const startY = RIM_Y + NET_DROP;

          if (r < FALL) {
            const s = r / FALL;
            const dx = f.lx - HOOP_X;
            x = HOOP_X + dx * easeOutCubic(s);
            y =
              startY +
              (LAND_Y - startY) * s * s -
              16 * 4 * s * (1 - s) * Math.min(1, Math.abs(dx) / 60);
            sc = FILE_SCALE * 0.8 + (LAND_SCALE - FILE_SCALE * 0.8) * s;
          } else if (r < 0.8) {
            const u = (r - FALL) / 0.3;
            x = f.lx;
            y = LAND_Y - 11 * 4 * u * (1 - u);
            sc = LAND_SCALE;
            if (!f.impact) {
              f.impact = true;
              a.ripple = { x: f.lx, start: now };
              a.boost = Math.max(a.boost, 0.3);
            }
          } else {
            const u = (r - 0.8) / 0.2;
            x = f.lx;
            y = LAND_Y - 3 * 4 * u * (1 - u);
            sc = LAND_SCALE;
          }

          rot = 7 * Math.sin(r * 16) * (1 - r);
        } else if (e < f.t1 + t2 + t3 + t4) {
          // 4) landed: analysis starts right now, the file hands over to its label
          inFront = true;
          if (!f.landed) {
            f.landed = true;
            landedRef.current?.(f.file);
          }
          const q = (e - f.t1 - t2 - t3) / t4;
          x = f.lx;
          y = LAND_Y;
          rot = 0;
          sc = LAND_SCALE;
          opacity = 1 - q;
        } else {
          a.flight = null;
        }

        if (a.flight) {
          const active = inFront ? front : back;
          const idle = inFront ? back : front;
          active.setAttribute("visibility", "visible");
          idle.setAttribute("visibility", "hidden");
          place(active, x, y, rot, sc, opacity);
          flightHidden = false;
        }
      }

      if (!a.flight && !flightHidden) {
        back?.setAttribute("visibility", "hidden");
        front?.setAttribute("visibility", "hidden");
        flightHidden = true;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---------- after the ATS popup: go to the dashboard ----------
  const handleScoreFinish = useCallback(() => {
    if (onGoToDashboard) {
      onGoToDashboard(scoreInfo);
    } else if (navigate) {
      navigate(DASHBOARD_PATH);
    }
    setShowScore(false);
  }, [navigate, onGoToDashboard, scoreInfo]);

  // ---------- static shapes ----------
  const leftDots = [];
  for (let col = 0; col < 5; col += 1) {
    for (let row = 0; row < 7; row += 1) {
      leftDots.push([58 + col * 24, 378.5 + row * 25.4]);
    }
  }

  const rightDots = [];
  for (let col = 0; col < 5; col += 1) {
    for (let row = 0; row < 11; row += 1) {
      rightDots.push([1511.5 + col * 24, 610 + row * 25.15]);
    }
  }

  const initialNet = buildNetPath(0, 1);

  // decorative groups are glued to the window corners, the card is centred
  const shiftRight = stageW - STAGE_W;
  const shiftDown = stageH - STAGE_H;
  const topRight = `translate(${shiftRight} 0)`;
  const bottomLeft = `translate(0 ${shiftDown})`;
  const bottomRight = `translate(${shiftRight} ${shiftDown})`;
  const centre = `translate(${offX} ${offY})`;

  const analyzing = phase === "analyzing";
  const active = dragging || analyzing;

  const dashStroke = invalidDrag ? ERROR_RED : "#000";
  const boxFill = invalidDrag
    ? "#fde4ea"
    : dragging
    ? overBox
      ? "#d9cffd"
      : "#e6defe"
    : LAVENDER;

  // text under the box
  let bottomText = "Supported format: PDF, DOC, DOCX";
  let bottomFill = GRAY_TEXT;
  let bottomWeight = 500;

  if (message) {
    bottomText = message.text;
    bottomFill = message.kind === "error" ? ERROR_RED : GRAY_TEXT;
    bottomWeight = message.kind === "error" ? 600 : 500;
  } else if (analyzing) {
    bottomText = `Analyzing your resume… ${Math.round(progress)}%`;
  } else if (phase === "done") {
    bottomText = "Analysis complete ✓";
    bottomFill = OK_GREEN;
    bottomWeight = 700;
  }

  const pillName = file ? shortenName(file.name) : "";
  const pillWidth = file ? pillWidthFor(file.name) : 0;

  return (
    <div className="rup-root" onClick={handleBackdropClick}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap');

        /* the page is an overlay: whatever is behind it gets blurred */
        .rup-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
          background: rgba(255, 254, 254, 0.55);
          -webkit-backdrop-filter: blur(14px);
          backdrop-filter: blur(14px);
          font-family: Inter, "Helvetica Neue", Arial, sans-serif;
          animation: rupBackdropIn 0.35s ease-out both;
        }

        .rup-stage {
          position: absolute;
          left: 0;
          top: 0;
          transform-origin: 0 0;
          overflow: hidden;
        }

        /* dotted paper texture (blurred together with the other background shapes) */
        .rup-dots {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(circle at center, #dedede 0, #dedede 1.1px, transparent 1.5px);
          background-size: 25.4px 25.4px;
          background-position: -9.4px 3.4px;
          filter: blur(1.5px);
        }

        .rup-svg { position: absolute; left: 0; top: 0; display: block; }
        .rup-svg text { text-rendering: geometricPrecision; }

        /* decorative layer behind the card: blurred, never clickable */
        .rup-bg-svg {
          overflow: visible;
          pointer-events: none;
          filter: blur(6px);
          animation: rupSoften 0.35s ease-out both;
        }

        .rup-box-fill { transition: fill 0.25s ease; }
        .rup-dash { transition: stroke 0.25s ease; }
        .rup-dash-active { animation: rupDash 0.7s linear infinite; }
        .rup-shimmer { animation: rupShimmer 1.5s ease-in-out infinite; }

        @keyframes rupBackdropIn {
          from {
            background: rgba(255, 254, 254, 0);
            -webkit-backdrop-filter: blur(0);
            backdrop-filter: blur(0);
          }
        }
        @keyframes rupSoften { from { filter: blur(0); } }
        @keyframes rupDash { to { stroke-dashoffset: -28.5; } }
        @keyframes rupShimmer {
          from { transform: translateX(-180px); }
          to { transform: translateX(560px); }
        }

        .rup-hit {
          position: absolute;
          left: ${BOX.x}px;
          top: ${BOX.y}px;
          width: ${BOX.w}px;
          height: ${BOX.h}px;
          border-radius: 14px;
          cursor: pointer;
          outline: none;
          pointer-events: auto;
        }
        .rup-hit:focus-visible { box-shadow: 0 0 0 4px rgba(147, 110, 252, 0.55); }

        /* cross button in the card's top-right corner */
        .rup-close {
          position: absolute;
          left: ${CLOSE_BTN.x}px;
          top: ${CLOSE_BTN.y}px;
          width: ${CLOSE_BTN.size}px;
          height: ${CLOSE_BTN.size}px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: ${PINK};
          border: 3px solid #000;
          border-radius: 50%;
          box-shadow: 2px 2px 0 #000;
          cursor: pointer;
          pointer-events: auto;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }
        .rup-close:hover {
          background: #ff8a9b;
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0 #000;
        }
        .rup-close:active {
          transform: translate(2px, 2px);
          box-shadow: 0 0 0 #000;
        }
        .rup-close:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px #fff, 0 0 0 6px #000;
        }

        .rup-pill {
          position: absolute;
          top: 684px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 8px;
          height: 25px;
          padding: 0 8px;
          background: #fff;
          border: 2.5px solid #000;
          border-radius: 13px;
          box-shadow: 3px 3px 0 #000;
          font-size: 14.5px;
          font-weight: 700;
          color: #000;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          animation: rupPop 0.4s ease-out both;
          cursor: pointer;
        }

        .rup-pill-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }

        .rup-pill-bar {
          position: absolute;
          left: 0;
          bottom: 0;
          height: 4px;
          background: ${MINT};
          border-top: 1.5px solid #000;
          transition: width 0.15s linear;
        }

        .rup-spinner {
          flex: none;
          width: 12px;
          height: 12px;
          border: 2.5px solid #000;
          border-right-color: transparent;
          border-radius: 50%;
          animation: rupSpin 0.7s linear infinite;
        }

        .rup-badge {
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 15px;
          height: 15px;
          border: 2px solid #000;
          border-radius: 50%;
          font-size: 9px;
          font-weight: 900;
          line-height: 1;
        }

        .rup-pill-x {
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          padding: 0;
          border: 2px solid #000;
          border-radius: 50%;
          background: ${PINK};
          font-size: 10px;
          font-weight: 900;
          color: #000;
          line-height: 1;
          cursor: pointer;
        }

        @keyframes rupSpin { to { transform: rotate(360deg); } }
        @keyframes rupPop {
          0% { opacity: 0; transform: scale(0.6); }
          65% { opacity: 1; transform: scale(1.07); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .rup-root, .rup-bg-svg, .rup-dash-active, .rup-pill, .rup-shimmer, .rup-spinner { animation: none; }
          .rup-close { transition: none; }
        }
      `}</style>

      <div
        ref={stageRef}
        className="rup-stage"
        style={{ width: stageW, height: stageH, transform: `scale(${scale})` }}
      >
        <div className="rup-dots" />

        {/* ================= background layer (blurred) ================= */}
        <svg
          className="rup-svg rup-bg-svg"
          width={stageW}
          height={stageH}
          viewBox={`0 0 ${stageW} ${stageH}`}
          aria-hidden="true"
        >
          {/* ------------ corner staircases (glued to the window corners) ------------ */}
          {/* they run past the window edge so the blur never fades them out at the border */}
          <g transform={topRight}>
            <polygon
              points="1414,-60 1414,42 1422,42 1422,51 1442,51 1442,78 1452,78 1452,87 1486,87 1486,122 1496,122 1496,131 1531,131 1531,173 1730,173 1730,-60"
              fill="#000"
            />
            <polygon
              points="1420,-60 1420,37 1448,37 1448,74 1492,74 1492,116 1537,116 1537,157 1730,157 1730,-60"
              fill={PURPLE}
            />
          </g>

          <g transform={bottomLeft}>
            <polygon
              points="-60,701 70,701 70,711 76,711 76,735 111,735 111,749 116,749 116,780 163,780 163,790 169,790 169,815 211,815 211,852 217,852 217,1002 -60,1002"
              fill="#000"
            />
            <polygon
              points="-60,707 65,707 65,741 105,741 105,785 158,785 158,841 206,841 206,1002 -60,1002"
              fill={PURPLE}
            />
          </g>

          {/* ------------ decorative shapes ------------ */}
          {/* left side: top-left corner */}
          <rect x="182" y="254" width="59" height="59" fill="#000" />
          <rect x="178.5" y="250.5" width="54" height="54" fill={PURPLE} stroke="#000" strokeWidth="5" />
          {leftDots.map(([x, y]) => (
            <circle key={`l${x}-${y}`} cx={x} cy={y} r="2.8" fill="#000" />
          ))}

          {/* right side, top */}
          <g transform={topRight}>
            <circle cx="1526.5" cy="266.5" r="35.5" fill="#000" />
            <circle cx="1524.5" cy="264.5" r="35.5" fill={YELLOW} stroke="#000" strokeWidth="6" />
          </g>

          {/* left side, bottom */}
          <g transform={bottomLeft}>
            <circle cx="271" cy="848" r="30" fill="#000" />
            <circle cx="269" cy="846" r="30" fill={YELLOW} stroke="#000" strokeWidth="6" />
          </g>

          {/* right side, bottom */}
          <g transform={bottomRight}>
            <rect x="1410" y="791" width="50" height="50" fill="#000" />
            <rect x="1407.5" y="788.5" width="45" height="45" fill={PINK} stroke="#000" strokeWidth="5" />
            {rightDots.map(([x, y]) => (
              <circle key={`r${x}-${y}`} cx={x} cy={y} r="2.8" fill="#000" />
            ))}
          </g>

          {/* ------------ header ------------ */}
          <rect x="46.5" y="30.5" width="76" height="77.5" rx="2" fill={YELLOW} stroke="#000" strokeWidth="5" />
          <text
            transform="translate(82.5 86.2) scale(0.67 1)"
            textAnchor="middle"
            fontSize="49.5"
            fontWeight="900"
            fill="#000"
          >
            AI
          </text>

          <text
            transform="translate(141.4 65.6) scale(0.753 1)"
            fontSize="34.4"
            fontWeight="900"
            fill="#000"
          >
            AI INTERVIEW
          </text>
          <text
            transform="translate(141.4 93.4) scale(0.855 1)"
            fontSize="17.9"
            fontWeight="700"
            fill="#000"
          >
            PRACTICE. IMPROVE. SUCCEED.
          </text>
        </svg>

        {/* ================= card layer (sharp) ================= */}
        <svg
          className="rup-svg"
          width={stageW}
          height={stageH}
          viewBox={`0 0 ${stageW} ${stageH}`}
        >
          <defs>
            <linearGradient id="rupRim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f80000" />
              <stop offset="1" stopColor="#c80000" />
            </linearGradient>
            <linearGradient id="rupPole" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#c9c8c8" />
              <stop offset="1" stopColor="#a9a8a8" />
            </linearGradient>
            <linearGradient id="rupShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <clipPath id="rupCardClip">
              <rect x="315" y="145" width="1041" height="676" rx="9" />
            </clipPath>
            <clipPath id="rupBoxClip">
              <rect x="588" y="509" width="496" height="202" rx="11" />
            </clipPath>
          </defs>

          <g transform={centre}>
          {/* ------------ window card ------------ */}
          <rect x="344" y="180" width="1033" height="663" rx="10" fill="#000" />
          <rect x="315" y="145" width="1041" height="676" rx="9" fill="#000" />
          <rect x="320" y="150" width="1031" height="666" rx="5" fill="#fff" />
          <g clipPath="url(#rupCardClip)">
            <rect x="320" y="150" width="1031" height="48" fill={PURPLE} />
            <rect x="315" y="198" width="1041" height="5.5" fill="#000" />
          </g>

          {/* ------------ document icon ------------ */}
          <circle cx="838.3" cy="292.7" r="81" fill="#ece6fd" />

          <g stroke="#000" strokeWidth="4.7" strokeLinecap="round" fill="none">
            <path d="M707.7 256.7 L726 270" />
            <path d="M689.3 297.7 L719.3 292.3" />
            <path d="M708.7 327.7 L726 316" />
            <path d="M947.3 266.7 L962.3 252.3" />
            <path d="M955.7 290.7 L984.3 285" />
            <path d="M949.3 314.3 L966 326" />
          </g>

          <path
            d="M797.5 236.5 H855 L878.5 260 V340.5 H797.5 Z"
            transform="translate(7 8)"
            fill="#000"
            stroke="#000"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M797.5 236.5 H855 L878.5 260 V340.5 H797.5 Z"
            fill={PURPLE}
            stroke="#000"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M855 236.5 V260 H878.5"
            fill="#b79dff"
            stroke="#000"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M816 278 H861 M816 293.4 H861 M816 309 H847.3"
            stroke="#000"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* ------------ headings ------------ */}
          <text
            x="842"
            y="418.8"
            textAnchor="middle"
            fontSize="67"
            fontWeight="800"
            letterSpacing="0.8"
            fill="#000"
          >
            DRAG &amp; DROP
          </text>
          <text x="840" y="467" textAnchor="middle" fontSize="39" fontWeight="700" fill="#000">
            your resume here
          </text>

          {/* ------------ dotted upload area ------------ */}
          <rect
            className="rup-box-fill"
            x={BOX.x}
            y={BOX.y}
            width={BOX.w}
            height={BOX.h}
            rx="14"
            fill={boxFill}
          />

          {/* analysis shimmer sweeping across the box */}
          {analyzing && (
            <g clipPath="url(#rupBoxClip)">
              <rect
                className="rup-shimmer"
                x={BOX.x}
                y={BOX.y}
                width="160"
                height={BOX.h}
                fill="url(#rupShine)"
              />
            </g>
          )}

          <rect
            className={`rup-dash${active ? " rup-dash-active" : ""}`}
            x="586"
            y="507"
            width="500"
            height="206"
            rx="13"
            fill="none"
            stroke={dashStroke}
            strokeWidth="4"
            strokeDasharray="18 10.5"
          />

          {/* ------------ basketball hoop ------------ */}
          <path d="M722 550 A114 95 0 0 0 950 550 Z" fill="#cfbffe" />

          <rect x="826" y="506" width="24" height="46" fill="#000" />
          <rect x="830" y="506" width="16" height="46" fill="url(#rupPole)" />

          {/* the thrown file while it is above / inside the net (behind the net) */}
          <g ref={flyBackRef} visibility="hidden">
            <MiniDoc />
          </g>

          {/* net */}
          <path
            ref={netOutlineRef}
            d={initialNet}
            fill="none"
            stroke="#000"
            strokeWidth="11.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={netFillRef}
            d={initialNet}
            fill="none"
            stroke="#fff"
            strokeWidth="6.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* rim */}
          <ellipse
            cx={HOOP_X}
            cy="564"
            rx="89"
            ry="14.5"
            fill="url(#rupRim)"
            stroke="#000"
            strokeWidth="5.5"
          />
          <path d="M757 566.5 Q837 573.5 917 566.5 Q837 584 757 566.5 Z" fill="#9c0000" />
          <path
            d="M757 566.5 Q837 573.5 917 566.5"
            fill="none"
            stroke="#000"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <rect x="826" y="568" width="24" height="10" fill="#000" />
          <rect x="829" y="568" width="18" height="9" fill="#b4b3b3" />

          {/* the file after it left the net: always clipped to the dotted box */}
          <g clipPath="url(#rupBoxClip)">
            <ellipse
              ref={rippleRef}
              cx={HOOP_X}
              cy={LAND_Y + 9}
              rx="8"
              ry="2"
              fill="none"
              stroke="#000"
              strokeWidth="2.5"
              opacity="0"
            />
            <g ref={flyFrontRef} visibility="hidden">
              <MiniDoc />
            </g>
          </g>

          {/* file hovering above the page while it is being dragged */}
          {ghost && (
            <g transform={`translate(${ghost.x} ${ghost.y})`}>
              <g ref={ghostRef} opacity={invalidDrag ? 0.35 : 1}>
                <MiniDoc />
              </g>
            </g>
          )}

          {/* ------------ supported formats / status ------------ */}
          <text
            x="835"
            y="768.5"
            textAnchor="middle"
            fontSize="30.1"
            fontWeight={bottomWeight}
            fill={bottomFill}
          >
            {bottomText}
          </text>
          </g>
        </svg>

        {/* click target, picker, close button and file label use the centred picture coordinates */}
        <div
          style={{
            position: "absolute",
            left: offX,
            top: offY,
            width: STAGE_W,
            height: STAGE_H,
            pointerEvents: "none",
          }}
        >
        {/* cross button: back to the dashboard */}
        <button
          type="button"
          className="rup-close"
          aria-label="Close and go back to the dashboard"
          title="Close"
          onClick={(event) => {
            event.stopPropagation();
            handleClose();
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M2 2 L12 12 M12 2 L2 12" fill="none" stroke="#000" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* click target = the dotted upload area (drops are handled page-wide) */}
        <div
          className="rup-hit"
          role="button"
          tabIndex={0}
          aria-label="Upload your resume. Click to choose a PDF, DOC or DOCX file, or drop one anywhere on the page."
          onClick={handleBoxClick}
          onKeyDown={handleKeyDown}
        />

        {/* the programmatic click on this input must not bubble up to the blurred-area handler */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          onChange={handleInputChange}
          onClick={(event) => event.stopPropagation()}
          style={{ display: "none" }}
        />

        {/* selected file + analysis status, inside the dotted box */}
        {file && (
          <div
            key={pillKey}
            className="rup-pill"
            style={{
              left: HOOP_X - pillWidth / 2,
              width: pillWidth,
              pointerEvents: dragging ? "none" : "auto",
              borderColor: phase === "failed" ? ERROR_RED : "#000",
            }}
            onClick={openPicker}
            title={file.name}
          >
            <svg width="14" height="17" viewBox="-15 -19 30 38" aria-hidden="true" style={{ flex: "none" }}>
              <path
                d="M-13 -17 H3 L13 -7 V17 H-13 Z"
                fill={PURPLE}
                stroke="#000"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>

            <span className="rup-pill-name">{pillName}</span>

            {phase === "analyzing" && <span className="rup-spinner" aria-label="Analyzing" />}
            {phase === "done" && (
              <span className="rup-badge" style={{ background: MINT }} aria-label="Analysis complete">
                ✓
              </span>
            )}
            {phase === "failed" && (
              <span className="rup-badge" style={{ background: PINK }} aria-label="Analysis failed">
                !
              </span>
            )}

            <button
              type="button"
              className="rup-pill-x"
              aria-label="Remove selected file"
              onClick={removeFile}
            >
              ✕
            </button>

            {phase === "analyzing" && (
              <div className="rup-pill-bar" style={{ width: `${Math.min(100, progress)}%` }} />
            )}
          </div>
        )}
        </div>
      </div>

      {/* ATS score popup (blurred page) -> dashboard */}
      {showScore && scoreInfo && (
        <AtsScoreResult score={scoreInfo.score} onFinish={handleScoreFinish} />
      )}
    </div>
  );
}

export default ResumeUploadPage;
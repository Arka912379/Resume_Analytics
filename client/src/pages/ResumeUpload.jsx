import React, { useEffect, useRef, useState } from "react";

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];
const MAX_SIZE_MB = 5;

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Only PDF, DOC or DOCX files are supported.";
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File is too large. Maximum size is ${MAX_SIZE_MB} MB.`;
  }

  return "";
}

// onUpload(file) is called when the user presses "ANALYZE RESUME"
function ResumeUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [sent, setSent] = useState(false);

  const inputRef = useRef(null);
  const dragDepth = useRef(0);

  // stop the browser from opening a file that is dropped outside the box
  useEffect(() => {
    const prevent = (event) => event.preventDefault();

    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);

    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  const acceptFile = (selected) => {
    if (!selected) return;

    const problem = validateFile(selected);

    setSent(false);

    if (problem) {
      setFile(null);
      setError(problem);
      return;
    }

    setError("");
    setFile(selected);
  };

  const openPicker = () => inputRef.current?.click();

  const handleInputChange = (event) => {
    acceptFile(event.target.files?.[0]);
    event.target.value = ""; // allows choosing the same file again
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);

    if (dragDepth.current === 0) {
      setDragging(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  const handleRemove = (event) => {
    event.stopPropagation();
    setFile(null);
    setError("");
    setSent(false);
  };

  const handleAnalyze = (event) => {
    event.stopPropagation();

    if (!file) return;

    onUpload?.(file);
    setSent(true);
  };

  // shapes: clip-path would clip box-shadow, so shadows use drop-shadow on a wrapper
  const stepsTopRight =
    "polygon(0 0,100% 0,100% 100%,50% 100%,50% 85%,31% 85%,31% 57%,16% 57%,16% 33%,0 33%)";

  const stepsBottomLeft =
    "polygon(0 0,29% 0,29% 15%,49% 15%,49% 34%,72% 34%,72% 58%,100% 58%,100% 100%,0 100%)";

  const smallButton =
    "border-[2.5px] border-black px-[18px] py-[9px] text-[15px] font-black text-black shadow-[4px_4px_0_#000] transition duration-150 hover:-translate-y-[2px] active:translate-y-[1px] active:shadow-[2px_2px_0_#000]";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fdfdfb] font-[Roboto,Arial,Helvetica,sans-serif]">
      {/* DOT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(#bcbcbc_1.2px,transparent_1.2px)] [background-size:20px_20px]" />

      {/* TOP RIGHT PURPLE STAIRCASE */}
      <div className="pointer-events-none absolute right-0 top-0 [filter:drop-shadow(-7px_11px_0_#000)]">
        <div
          className="h-[147px] w-[240px] bg-[#8665f4]"
          style={{ clipPath: stepsTopRight }}
        />
      </div>

      {/* BOTTOM LEFT PURPLE STAIRCASE */}
      <div className="pointer-events-none absolute bottom-0 left-0 [filter:drop-shadow(9px_0_0_#000)]">
        <div
          className="h-[218px] w-[204px] bg-[#8665f4]"
          style={{ clipPath: stepsBottomLeft }}
        />
      </div>

      {/* HEADER */}
      <header className="absolute left-[41px] top-[28px] z-20 flex items-start gap-[14px]">
        <div className="flex h-[74px] w-[74px] items-center justify-center border-[3px] border-black bg-[#ffdd2f] text-[36px] font-black leading-none text-black shadow-[3px_3px_0_#000]">
          AI
        </div>

        <div className="pt-[8px]">
          <h1 className="text-[29px] font-black leading-none tracking-[-0.3px] text-black">
            AI INTERVIEW
          </h1>
          <p className="mt-[8px] text-[15px] font-bold leading-none text-black">
            PRACTICE. IMPROVE. SUCCEED.
          </p>
        </div>
      </header>

      {/* DECORATIONS */}
      <div className="pointer-events-none absolute left-[10.6%] top-[26.5%] h-[52px] w-[52px] border-[3px] border-black bg-[#8665f4] shadow-[7px_7px_0_#000]" />

      <div className="pointer-events-none absolute left-[3.5%] top-[39.6%] grid grid-cols-5 gap-x-[18px] gap-y-[20px]">
        {Array.from({ length: 35 }).map((_, index) => (
          <span key={index} className="h-[4px] w-[4px] rounded-full bg-black" />
        ))}
      </div>

      <div className="pointer-events-none absolute right-[6.4%] top-[24.5%] h-[66px] w-[66px] rounded-full border-[3px] border-black bg-[#ffdc2e] shadow-[4px_5px_0_#000]" />

      <div className="pointer-events-none absolute left-[17.3%] top-[84.5%] h-[70px] w-[70px] rounded-full border-[3px] border-black bg-[#ffdc2e] shadow-[4px_5px_0_#000]" />

      <div className="pointer-events-none absolute left-[83.2%] top-[78.7%] h-[46px] w-[46px] border-[3px] border-black bg-[#f05b79] shadow-[6px_6px_0_#000]" />

      <div className="pointer-events-none absolute right-[3.7%] top-[64.4%] grid grid-cols-5 gap-x-[18px] gap-y-[20px]">
        {Array.from({ length: 55 }).map((_, index) => (
          <span key={index} className="h-[4px] w-[4px] rounded-full bg-black" />
        ))}
      </div>

      {/* WINDOW CARD */}
      <section className="relative z-10 w-[790px] max-w-[92vw] overflow-hidden rounded-[8px] border-[3px] border-black bg-[#fdfdfb] shadow-[18px_20px_0_#000]">
        {/* purple title bar */}
        <div className="h-[44px] border-b-[3px] border-black bg-[#8665f4]" />

        <div className="px-[49px] pb-[52px] pt-[30px]">
          {/* ICON */}
          <div className="relative mx-auto flex h-[115px] w-[115px] items-center justify-center rounded-full bg-[#ebe7fd]">
            <svg
              className="icon-float"
              width="62"
              height="72"
              viewBox="0 0 62 72"
              fill="none"
              aria-hidden="true"
            >
              {/* shadow copy */}
              <path
                d="M13 12h28l15 15v39a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V15a3 3 0 0 1 3-3Z"
                fill="#000"
              />
              {/* page */}
              <path
                d="M8 5h28l15 15v39a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z"
                fill="#8665f4"
                stroke="#000"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* folded corner */}
              <path
                d="M36 5v12a3 3 0 0 0 3 3h12"
                stroke="#000"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* text lines */}
              <path
                d="M15 31h22M15 39h22M15 47h22"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* sparkle ticks */}
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
              width="280"
              height="110"
              viewBox="-140 -55 280 110"
              fill="none"
              aria-hidden="true"
            >
              <g stroke="#000" strokeWidth="3.4" strokeLinecap="round">
                <path className="tick tick-1" d="M-104 -22L-92 -12" />
                <path className="tick tick-2" d="M-105 21L-91 15" />
                <path className="tick tick-3" d="M86 -23L96 -32" />
                <path className="tick tick-4" d="M93 5L112 3" />
              </g>
            </svg>
          </div>

          {/* DROP ZONE */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload your resume. Drag and drop a file here or press Enter to browse."
            onClick={openPicker}
            onKeyDown={handleKeyDown}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative mt-[13px] flex h-[205px] cursor-pointer flex-col items-center justify-center px-[24px] text-center outline-none transition-all duration-200 ${
              dragging
                ? "scale-[1.015] bg-[#d8cffd]"
                : "bg-[#ebe7fd] hover:bg-[#e3ddfc]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleInputChange}
              className="hidden"
            />

            {/* ANIMATED DASHED BORDER (marching dashes) */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <rect
                x="1.5"
                y="1.5"
                rx="4"
                ry="4"
                fill="none"
                stroke="#000"
                strokeWidth="3"
                strokeDasharray="10 8"
                className={dragging ? "dash dash-fast" : "dash"}
                style={{ width: "calc(100% - 3px)", height: "calc(100% - 3px)" }}
              />
            </svg>

            {file ? (
              <>
                <h2 className="text-[30px] font-black leading-none text-black">
                  FILE READY
                </h2>

                <p className="mt-[12px] max-w-full truncate text-[22px] font-extrabold leading-none text-black">
                  {file.name}
                </p>

                <p className="mt-[8px] text-[16px] font-medium leading-none text-[#555]">
                  {formatSize(file.size)}
                  {sent ? " · sent for analysis ✓" : ""}
                </p>

                <div className="mt-[18px] flex gap-[14px]">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className={`${smallButton} bg-[#59e6ad]`}
                  >
                    ANALYZE RESUME
                  </button>

                  <button
                    type="button"
                    onClick={handleRemove}
                    className={`${smallButton} bg-white`}
                  >
                    REMOVE
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[44px] font-black leading-none tracking-[-0.5px] text-black">
                  {dragging ? "DROP IT" : "DRAG & DROP"}
                </h2>

                <p className="mt-[10px] text-[27px] font-extrabold leading-none text-black">
                  {dragging ? "to upload your resume" : "your resume here"}
                </p>

                <p
                  className={`mt-[20px] text-[18px] font-medium leading-none ${
                    error ? "font-bold text-[#c0143c]" : "text-[#555]"
                  }`}
                >
                  {error || "Supported format: PDF, DOC, DOCX"}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');

        /* marching dashes: one dash period = 10 + 8 = 18 */
        @keyframes dashMarch {
          to { stroke-dashoffset: -18; }
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes tickTwinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(0.8); }
        }

        .dash { animation: dashMarch 1s linear infinite; }
        .dash-fast { animation-duration: 0.35s; }

        .icon-float { animation: iconFloat 2.6s ease-in-out infinite; }

        .tick { transform-box: fill-box; transform-origin: center; animation: tickTwinkle 1.6s ease-in-out infinite; }
        .tick-2 { animation-delay: 0.4s; }
        .tick-3 { animation-delay: 0.8s; }
        .tick-4 { animation-delay: 1.2s; }

        @media (prefers-reduced-motion: reduce) {
          .dash, .icon-float, .tick { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default ResumeUpload;
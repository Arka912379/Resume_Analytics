import { Maximize, Video } from 'lucide-react'
import AiInterviewerCard from './AiInterviewerCard.jsx'

// Big camera frame of the interview session.
// frameRef / videoRef come from the page (fullscreen target + srcObject attach).
// Props: stage, stream, cameraActive, previewLoading, cameraError, onRetry, onToggleFullscreen

export default function VideoStage({
  frameRef,
  videoRef,
  stage,
  stream,
  cameraActive,
  previewLoading,
  cameraError,
  onRetry,
  onToggleFullscreen,
}) {
  return (
    <div className="mx-auto w-full md:min-h-0 md:flex-1 md:w-[89%]">
      <div
        ref={frameRef}
        className="relative aspect-video w-full overflow-hidden border-4 border-[#111] bg-[#242533] shadow-[6px_6px_0_#111] md:aspect-auto md:h-full"
      >
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            aria-label="Your live camera preview"
            className="h-full w-full -scale-x-100 object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[#252536] text-center text-white">
            <div className="max-w-sm px-4">
              <Video aria-hidden="true" className="mx-auto h-10 w-10" />
              <p className="mt-2 font-bold">
                {stage === 'guidelines'
                  ? 'Camera preview will start after you acknowledge the guidelines.'
                  : previewLoading
                    ? 'Starting your camera preview...'
                    : 'Camera preview is not available yet.'}
              </p>
              {cameraError && (
                <p className="mt-2 text-sm font-semibold text-[#ffe1e4]" role="alert">
                  {cameraError}
                </p>
              )}
              {stage === 'ready' && (
                <button
                  type="button"
                  disabled={previewLoading}
                  onClick={onRetry}
                  className="mt-4 border-2 border-[#111] bg-[#b290ff] px-4 py-2 font-black text-[#111] shadow-[3px_3px_0_#111] disabled:opacity-60"
                >
                  {previewLoading ? 'Starting Camera...' : 'Retry Camera Preview'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* "You" tag */}
        <div className="absolute left-3 top-3 inline-flex items-center gap-2.5 border-2 border-[#111] bg-[#ffd93b] px-3 py-1 text-base font-bold leading-tight text-[#111] sm:left-5 sm:top-5 md:left-8 md:top-7 md:px-4 md:py-1.5 md:text-xl">
          You
          {cameraActive && (
            <span aria-label="Camera active" className="h-3.5 w-3.5 rounded-full bg-[#22c55e] md:h-[18px] md:w-[18px]" />
          )}
        </div>

        {/* fullscreen */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label="Enter or exit fullscreen"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-lg border-2 border-[#2b2b33] bg-[#3a3a42] text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:right-5 sm:top-5 md:right-8 md:top-7 md:h-[54px] md:w-[54px]"
        >
          <Maximize aria-hidden="true" className="h-5 w-5 md:h-7 md:w-7" />
        </button>

        {stage === 'live' && <AiInterviewerCard stream={stream} className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 md:bottom-7 md:right-8" />}
      </div>
    </div>
  )
}
import { Play } from 'lucide-react'
import BrutalistButton from './BrutalistButton.jsx'

// "Ready to Start Your Interview?" panel (stages: guidelines, ready).
// Props: stage, previewLoading, sessionError, onStart

export default function ReadyPanel({ stage, previewLoading, sessionError, onStart }) {
  return (
    <section
      aria-label="Start the interview"
      className="relative z-10 mx-auto w-full border-2 border-[#111] bg-[#f4f2ec] p-3 shadow-[8px_8px_0_#111] sm:p-4 md:w-[94%] md:shrink-0"
    >
      <div className="flex flex-col items-center gap-2.5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="inline-block border-2 border-[#111] bg-[#8f6cf5] px-2.5 py-0.5 text-base font-black shadow-[3px_3px_0_#111] sm:text-lg">
            Ready to Start Your Interview?
          </h2>
          <p className="mt-1.5 text-[0.82rem] font-medium">Begin the AI interview when you're ready.</p>
        </div>
        <BrutalistButton
          disabled={stage !== 'ready' || previewLoading}
          onClick={onStart}
          className="!min-h-9 !w-full !max-w-[16rem] !px-4 !text-[0.82rem] sm:!w-auto"
          icon={<Play aria-hidden="true" className="h-3.5 w-3.5 fill-current" />}
        >
          Start Interview
        </BrutalistButton>
      </div>
      {stage === 'ready' && sessionError && (
        <p role="alert" className="mt-2 border-2 border-[#111] bg-[#ffe1e4] p-2.5 text-[0.82rem] font-bold">
          {sessionError}
        </p>
      )}
    </section>
  )
}

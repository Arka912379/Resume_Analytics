import { ArrowRight, X } from 'lucide-react'

// Panel under the camera frame while the interview is live.
// Props: questionNumber, totalQuestions, difficulty, question,
//        onEnd (opens the confirm dialog), onSubmit, sessionError, sessionNotice

function BarsIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="3" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="5" width="4" height="15" rx="1" />
      <rect x="17" y="9" width="4" height="11" rx="1" />
    </svg>
  )
}

const BUTTON =
  'inline-flex min-h-12 items-center justify-center gap-2.5 border-2 border-[#111] px-5 py-2.5 text-base font-bold text-[#111] shadow-[4px_4px_0_#111] transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:min-h-[3.75rem] sm:px-7 lg:text-[clamp(1rem,1.2vw,1.25rem)]'

export default function QuestionPanel({
  questionNumber = 1,
  totalQuestions = 10,
  difficulty = 'Medium',
  question,
  onEnd,
  onSubmit,
  sessionError,
  sessionNotice,
}) {
  return (
    <section
      aria-label="Current question"
      className="relative z-10 mx-auto w-full border-2 border-[#111] bg-[#f4f2ec] p-3 shadow-[8px_8px_0_#111] sm:p-4 md:w-[94%] md:shrink-0"
    >
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <span className="border-2 border-[#111] bg-[#8f6cf5] px-3 py-1 text-sm font-semibold leading-tight shadow-[3px_3px_0_#111] sm:text-lg">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="inline-flex items-center gap-2 border-2 border-[#111] bg-[#ffd93b] px-3 py-1 text-sm font-bold leading-tight shadow-[3px_3px_0_#111] sm:text-lg">
              <BarsIcon />
              {difficulty}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-bold leading-snug sm:mt-4 lg:text-[clamp(1.15rem,1.65vw,1.65rem)]">
            {question}
          </h2>
        </div>

        <div className="flex items-center justify-end gap-3 border-t-2 border-[#111] pt-3 sm:gap-4 lg:border-l-2 lg:border-t-0 lg:pl-6 lg:pt-0">
          <button type="button" onClick={onEnd} className={`${BUTTON} bg-[#ff5a5f]`}>
            <X aria-hidden="true" className="h-6 w-6 stroke-[3]" />
            End Interview
          </button>
          <button type="button" onClick={onSubmit} className={`${BUTTON} bg-[#3dd68c]`}>
            Submit
            <ArrowRight aria-hidden="true" className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {sessionError && (
        <p role="alert" className="mt-3 border-2 border-[#111] bg-[#ffe1e4] p-2.5 text-[0.82rem] font-bold">
          {sessionError}
        </p>
      )}
      {sessionNotice && (
        <p role="status" className="mt-3 border-2 border-[#111] bg-[#fff4c2] p-2.5 text-[0.82rem] font-bold">
          {sessionNotice}
        </p>
      )}
    </section>
  )
}
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// ===========================================================================
// JobDescription.jsx - the first page ("JOB DESCRIPTION"), one file,
// React + Tailwind, front end only.
//
// Flow:  paste text -> ANALYZE -> the button fills up ("Analyzing...") ->
//        the page fades out -> the analysis page opens and fades in.
//
// Routes - the sidebar item "Job Description Analysis" must link to the FIRST page
// (path: '/job-description'), so clicking it always opens this page first:
//   <Route path="/job-description" element={<JobDescription />} />
//   <Route path="/job-description/analysis" element={<JobDescriptionAnalysis />} />
// The pasted text is passed to the analysis page in router state as
// `location.state.jobDescription`. Change RESULT_ROUTE (or pass `resultRoute`)
// if your second page lives at another path.
//
// The "JOB DESCRIPTION" heading, bell and user chip come from the existing
// fixed <Navbar />, so this file only draws the content below them.
// ===========================================================================

const RESULT_ROUTE = '/JDAnalysis'
const ANALYZE_MS = 2200 // how long the Analyze button "works"
const LEAVE_MS = 350 // fade-out before the next page opens

// squares, circle, dot grids and lavender staircase from the reference (wide screens only)
function Decorations() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[52px] left-[124px] hidden h-[58px] w-[58px] rounded-full border-2 border-[#111] bg-[#f7c51e] shadow-[6px_6px_0_#111] xl:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[14px] left-[15px] hidden h-[85px] w-[85px] bg-[radial-gradient(circle,#111_1.6px,transparent_2px)] [background-size:20px_20px] xl:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[127px] right-[122px] hidden h-[80px] w-[100px] bg-[radial-gradient(circle,#111_1.6px,transparent_2px)] [background-size:20px_20px] xl:block"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 214 177"
        className="pointer-events-none absolute bottom-0 right-0 hidden h-[177px] w-[214px] xl:block"
      >
        <path d="M0 177 V140 H51 V105 H92 V67 H134 V30 H169 V0 H214 V177 Z" fill="#9d7bfa" />
        <path d="M0 177 V140 H51 V105 H92 V67 H134 V30 H169 V0 H214" fill="none" stroke="#111" strokeWidth="3" />
      </svg>
    </>
  )
}

export default function JobDescription({ resultRoute = RESULT_ROUTE }) {
  const navigate = useNavigate()
  const textareaRef = useRef(null)
  const timers = useRef([])

  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('idle') // idle -> analyzing -> leaving
  const [filling, setFilling] = useState(false)

  const busy = phase !== 'idle'

  useEffect(() => {
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (busy) return

    if (!text.trim()) {
      setError('Paste a job description to analyze.')
      textareaRef.current?.focus()
      return
    }

    setError('')
    setPhase('analyzing')
    timers.current.push(setTimeout(() => setFilling(true), 30))
    timers.current.push(setTimeout(() => setPhase('leaving'), ANALYZE_MS))
    timers.current.push(
      setTimeout(() => navigate(resultRoute, { state: { jobDescription: text.trim() } }), ANALYZE_MS + LEAVE_MS)
    )
  }

  return (
    <div className="relative isolate min-h-screen w-full min-w-0 flex-1 overflow-hidden bg-[#f7f7f7] text-[#111] lg:h-screen lg:min-h-[640px]">
      <div
        className={`relative flex min-h-screen flex-col px-4 pb-8 pt-36 transition-[opacity,transform] duration-300 ease-in motion-reduce:transition-none sm:px-6 lg:h-full lg:min-h-0 lg:px-[clamp(2rem,6vw,6.5rem)] lg:pb-[clamp(2rem,24vh,15rem)] lg:pt-[176px] ${
          phase === 'leaving' ? '-translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <Decorations />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-9 lg:min-h-0 lg:flex-1"
        >
          {/* paste box */}
          <div
            className={`relative flex min-h-[16rem] flex-1 border-[3px] bg-white shadow-[12px_12px_0_#111] focus-within:ring-4 focus-within:ring-[#b290ff]/60 ${
              error ? 'border-red-600' : 'border-[#111]'
            }`}
          >
            <label htmlFor="job-description" className="sr-only">
              Job description
            </label>
            <textarea
              id="job-description"
              ref={textareaRef}
              value={text}
              readOnly={busy}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'job-description-error' : undefined}
              placeholder="Paste the job description here..."
              onChange={(event) => {
                setText(event.target.value)
                if (error) setError('')
              }}
              className="h-full w-full resize-none bg-transparent px-5 py-4 text-lg leading-relaxed text-[#111] outline-none placeholder:text-[#8c88aa] read-only:opacity-70 lg:text-[clamp(1.1rem,1.4vw,1.4rem)]"
            />

            {/* decorative resize mark from the reference */}
            <svg
              aria-hidden="true"
              viewBox="0 0 28 28"
              fill="none"
              stroke="#111"
              strokeWidth="2.6"
              strokeLinecap="round"
              className="pointer-events-none absolute bottom-3 right-4 h-7 w-7"
            >
              <path d="M5 25 L25 5" />
              <path d="M14 25 L25 14" />
            </svg>

            {error && (
              <p
                id="job-description-error"
                role="alert"
                className="absolute bottom-3 left-5 text-sm font-bold text-red-600"
              >
                {error}
              </p>
            )}

            {/* small squares beside the box (wide screens) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-[60px] top-[150px] hidden h-[42px] w-[42px] border-2 border-[#111] bg-[#f7c51e] shadow-[8px_8px_0_#111] xl:block"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-[76px] top-[57px] hidden h-[42px] w-[42px] border-2 border-[#111] bg-[#ff5a5f] shadow-[8px_8px_0_#111] xl:block"
            />
          </div>

          {/* analyze button */}
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="relative flex w-full shrink-0 items-center justify-center overflow-hidden border-[3px] border-[#111] bg-[#5fdc98] py-5 text-2xl font-extrabold uppercase leading-none tracking-tight text-[#111] shadow-[12px_12px_0_#111] transition-[transform,box-shadow] duration-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40 enabled:hover:-translate-x-0.5 enabled:hover:-translate-y-0.5 enabled:hover:shadow-[14px_14px_0_#111] enabled:active:translate-x-[3px] enabled:active:translate-y-[3px] enabled:active:shadow-[6px_6px_0_#111] disabled:cursor-wait sm:py-6 lg:text-[clamp(1.5rem,2vw,2rem)]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 bg-[#3fbf7c] transition-[width] duration-[2200ms] ease-in-out motion-reduce:transition-none"
              style={{ width: filling ? '100%' : '0%' }}
            />
            <span className="relative text-2xl font-black uppercase leading-none tracking-tight lg:text-[clamp(1.5rem,2vw,2rem)]">
              {busy ? 'Analyzing...' : 'Analyze'}
            </span>
            {busy ? (
              <svg
                className="absolute right-[4%] h-8 w-8 animate-spin motion-reduce:animate-none"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <ArrowRight aria-hidden="true" className="absolute right-[4%] h-8 w-8 stroke-[2.5]" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
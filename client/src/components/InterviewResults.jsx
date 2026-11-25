import { useEffect, useRef, useState } from 'react'
import Navbar, { useHideLayoutNavbar } from './Navbar.jsx'
import InterviewMetaCard from './InterviewMetaCard.jsx'
import OverallScoreCard from './OverallScoreCard.jsx'
import RecommendationsCard from './RecommendationsCard.jsx'
import ResultsDecorations from './ResultsDecorations.jsx'
import SkillBreakdownCard from './SkillBreakdownCard.jsx'
import StrengthsCard from './StrengthsCard.jsx'
import WeaknessesCard from './WeaknessesCard.jsx'

// ===========================================================================
// InterviewResults.jsx - the "Interview Results" page.
//
// Route:  <Route path="/interview-results" element={<InterviewResults />} />
//         (any address works, e.g. results shown at /interview: the page sets its
//          own heading and hides the layout's navbar while it is on screen)
//
// RESPONSIVE, ONE SCREEN:
//   - wide screens ("fit" mode): the page is exactly one screen high and never
//     scrolls. The boxes stretch to the full width (left edge = heading, right
//     edge = the margin with the decorations) and the whole stage is scaled so
//     every box, including Recommendations, is visible.
//   - narrow / very small windows ("flow" mode): the boxes stack in one or two
//     columns and the page scrolls normally, so text never gets unreadably small.
//
// The heading bar ("INTERVIEW RESULTS", subtitle, bell, user) is drawn here with
// <Navbar inline title=... />.
//
// Each box is its own component in components/interview-results/:
//   InterviewMetaCard, OverallScoreCard, SkillBreakdownCard,
//   StrengthsCard, WeaknessesCard, RecommendationsCard (+ ResultsDecorations)
//
// Pass real data with <InterviewResults results={...} /> (same shape as below).
// ===========================================================================
const MIN_STAGE_W = 860 // narrowest stage drawn in "fit" mode
const WIDE_FROM = 820 // from this width on the boxes use the desktop arrangement
const MIN_SCALE = 0.62 // below this the page switches to normal scrolling
const MAX_SCALE = 1.25
const BOTTOM_GAP = 24 // free space kept under the last box

const interviewResultsData = {
  interviewDate: 'Oct 06, 2026',
  duration: '18:42 mins',
  overallScore: 50,
  skills: [
    { id: 'technical', label: 'Technical Knowledge', score: 48 },
    { id: 'communication', label: 'Communication', score: 68 },
    { id: 'problem-solving', label: 'Problem Solving', score: 45 },
    { id: 'resume', label: 'Resume Knowledge', score: 50 },
  ],
  strengths: [
    'Clear, structured verbal presentation and polite communication style throughout the interview.',
    'Good high-level conceptual understanding of technology selection trade-offs (e.g., Java/Spring Boot vs. Node.js/Express.js).',
    'Solid breadth of modern project exposure including WebSockets, AI integrations (Gemini), and basic full-stack tools.',
    'Demonstrates active enthusiasm for hands-on project building and competitive programming (200+ LeetCode problems solved).',
  ],
  weaknesses: [
    'Tendency to restate surface-level resume bullet points rather than providing low-level technical execution details when prompted.',
    'Lacks depth on critical backend topics such as custom rate-limiting algorithms, concurrency control mechanisms, and secure payment integration workflows.',
    'Skipped the hard technical question regarding RAG architecture and multi-source data ingestion.',
    'Vague responses on soft skills and leadership achievements without providing concrete scenarios or data-driven examples.',
  ],
  recommendations: [
    'Deep-dive into the technical implementation details of projects listed on the resume, prepared to explain specific algorithms, data structures, and design patterns used.',
    'Practice explaining core backend engineering topics mathematically and architectural-wise, such as distributed locks, token bucket rate limiters, and cryptographically secure token/key exchanges.',
    'Adapt the STAR (Situation, Task, Action, Result) method for behavioral and experience-based questions to provide concrete evidence of leadership and problem-solving.',
    'Work on technical deep dives into AI/RAG patterns (e.g., chunking strategies, vector embeddings, dynamic tool routing) before listing them prominently on the resume.',
  ],
}

export default function InterviewResults({ results = interviewResultsData }) {
  const { interviewDate, duration, overallScore, skills, strengths, weaknesses, recommendations } = results

  useHideLayoutNavbar() // this page draws its own heading bar

  const rootRef = useRef(null)
  const areaRef = useRef(null)
  const stageRef = useRef(null)
  const [layout, setLayout] = useState({ ready: false, mode: 'fit', scale: 1, wide: true, rootH: 0 })

  // Work out how to show the stage: stretch it to the full width, then scale it
  // (height decides the scale) until every box fits under the heading bar.
  useEffect(() => {
    const root = rootRef.current
    const area = areaRef.current
    const stage = stageRef.current
    if (!root || !area || !stage) return undefined

    const update = () => {
      // real, measured space: from the top of the free area to the bottom of the
      // visible window (so anything above the page, e.g. a layout border, is respected)
      const viewportH = document.documentElement.clientHeight || window.innerHeight
      const rootH = Math.max(0, viewportH - Math.max(0, root.getBoundingClientRect().top))
      const areaW = area.clientWidth
      const areaH = viewportH - area.getBoundingClientRect().top - BOTTOM_GAP
      if (areaW <= 0 || areaH <= 0) return

      let next
      if (areaW < MIN_STAGE_W) {
        stage.style.width = ''
        next = { ready: true, mode: 'flow', scale: 1, wide: areaW >= WIDE_FROM, rootH }
      } else {
        const maxByWidth = areaW / MIN_STAGE_W
        // the stage is (areaW / scale) px wide, so its height depends on the scale
        const measure = (scale) => {
          stage.style.width = `${Math.max(MIN_STAGE_W, areaW / scale)}px`
          return stage.offsetHeight
        }

        let scale = Math.min(MAX_SCALE, maxByWidth, 1)
        let height = measure(scale)
        for (let i = 0; i < 8; i += 1) {
          const target = Math.min(MAX_SCALE, maxByWidth, areaH / height)
          if (Math.abs(target - scale) < 0.003) break
          scale = target
          height = measure(scale)
        }
        if (scale * height > areaH + 0.5) {
          scale = areaH / height
          height = measure(scale)
        }

        if (scale < MIN_SCALE) {
          stage.style.width = ''
          next = { ready: true, mode: 'flow', scale: 1, wide: true, rootH }
        } else {
          next = { ready: true, mode: 'fit', scale, wide: true, rootH }
        }
      }

      setLayout((prev) =>
        prev.ready &&
        prev.mode === next.mode &&
        prev.wide === next.wide &&
        Math.abs(prev.scale - next.scale) < 0.001 &&
        prev.rootH === next.rootH
          ? prev
          : next
      )
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(area)
    observer.observe(stage) // text re-wrapping (fonts loading) changes the stage height
    window.addEventListener('resize', update)
    document.fonts?.ready.then(update)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [results])

  const fit = layout.mode === 'fit'
  const { wide } = layout

  return (
    <div
      ref={rootRef}
      className={`relative isolate flex w-full min-w-0 flex-col bg-white text-[#111] ${
        fit ? 'h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden'
      }`}
      style={fit && layout.rootH ? { height: layout.rootH } : undefined}
    >
      <ResultsDecorations />

      {/* heading bar, drawn by the page: its left edge lines up with the boxes */}
      <div className="relative z-20 shrink-0 pl-3 max-[720px]:pl-2">
        <Navbar
          inline
          title="Interview Results"
          subtitle="Here is your detailed performance analysis and personalized feedback."
        />
      </div>

      {/* free area under the heading bar; the right margin is kept for the decorations */}
      <div className={`relative z-10 pl-5 pr-5 xl:pr-[76px] ${fit ? 'min-h-0 flex-1' : 'pb-8'}`}>
        <div ref={areaRef} className="relative h-full w-full">
          <div
            ref={stageRef}
            className={`flex flex-col gap-5 pb-2 pr-2 ${fit ? 'absolute left-0 top-0' : 'relative w-full'}`}
            style={
              fit
                ? {
                    transformOrigin: '0 0',
                    transform: `scale(${layout.scale})`,
                    opacity: layout.ready ? 1 : 0,
                  }
                : undefined
            }
          >
            {/* date + duration (with the dot grid beside it) */}
            <div className={`flex items-center gap-4 ${wide ? 'justify-end' : 'justify-start'}`}>
              {wide && (
                <span
                  aria-hidden="true"
                  className="h-[76px] w-[86px] shrink-0 bg-[radial-gradient(circle,#111_2px,transparent_2.6px)] [background-size:19px_19px]"
                />
              )}
              <InterviewMetaCard date={interviewDate} duration={duration} />
            </div>

            {/* overall score + skill breakdown */}
            <div
              className={`grid gap-[18px] ${
                wide ? 'grid-cols-[minmax(240px,22.5%)_minmax(0,1fr)]' : 'grid-cols-1'
              }`}
            >
              <OverallScoreCard score={overallScore} />
              <SkillBreakdownCard skills={skills} compact={!wide} />
            </div>

            {/* strengths + weaknesses */}
            <div className={`grid gap-5 ${wide ? 'grid-cols-[minmax(0,49fr)_minmax(0,51fr)]' : 'grid-cols-1'}`}>
              <StrengthsCard items={strengths} />
              <WeaknessesCard items={weaknesses} />
            </div>

            <RecommendationsCard items={recommendations} />
          </div>
        </div>
      </div>
    </div>
  )
}
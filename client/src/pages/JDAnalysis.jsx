import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AnalysisSummaryCard from '../components/AnalysisSummaryCard.jsx'
import AreasToImprove from '../components/AreasToImprove.jsx'
import Suggestions from '../components/Suggestions.jsx'
import WhatsWorkingWell from '../components/WorkingWell.jsx'

// ===========================================================================
// JobDescriptionAnalysis.jsx - the second page ("JOB DESCRIPTION ANALYSIS").
// It only composes the boxes; each box is its own component:
//   AnalysisSummaryCard  - score ring, company + role, message
//   AreasToImprove       - pink box
//   WhatsWorkingWell     - mint box
//   Suggestions          - yellow box
// (AreasToImprove / WhatsWorkingWell / Suggestions share InsightPanel.jsx)
//
// It opens only after the first page's Analyze button (router state
// `jobDescription`). If someone lands here directly (typed address, old link),
// they are sent to the first page instead, so the order is always
// Job Description -> Analyze -> Job Description Analysis.
//
// Data: pass an `analysis` prop, or navigate here with router state
//   navigate('/job-description/analysis', { state: { analysis } })
// With neither, the sample below is shown after Analyze.
//
// The "JOB DESCRIPTION ANALYSIS" heading, bell and user chip come from the
// existing fixed <Navbar />, so this file only draws the content below them.
// ===========================================================================

const FIRST_PAGE_ROUTE = '/jobDescription'

// ---------------------------------------------------------------------------
// Page content (sample data, edit freely).
// Each item may have an optional `detail`: when present the row opens to show
// it on click. Without `detail` the row is plain.
// ---------------------------------------------------------------------------
const sampleAnalysis = {
  matchScore: 72,
  company: 'Amazon',
  role: 'Programmer Analyst Intern',
  summary:
    'Your resume shows relevant skills and experience. Address the suggested improvements to further increase your chances of landing interviews.',
  improvements: [
    {
      title: 'Missing Quantifiable Results',
      description: 'Add measurable achievements (e.g., \u201cImproved performance by 30%\u201d).',
      detail:
        'Recruiters scan for numbers. Rewrite bullet points so each one shows what you did and the result, such as users reached, time saved or percentage improved.',
    },
    {
      title: 'Lack of Relevant Keywords',
      description: 'Include industry-relevant keywords (e.g., React, Node.js, AWS).',
      detail:
        'Compare the job description with your resume and add the exact skills and tools it names, as long as you really have them.',
    },
    {
      title: 'Inconsistent Formatting',
      description: 'Use a consistent font, spacing, and date format throughout.',
      detail:
        'Use one font, one date format (for example Jan 2024 - Mar 2025) and equal spacing between sections so the resume looks consistent.',
    },
  ],
  strengths: [
    {
      title: 'Clear Work Experience',
      description: 'Your roles and responsibilities are well-described.',
      detail: 'Keep describing each role with clear actions and outcomes.',
    },
    {
      title: 'Relevant Technical Skills',
      description: 'Good mix of technical skills aligned with your target roles.',
      detail: 'Keep your skills section grouped by area and up to date.',
    },
    {
      title: 'Education Details',
      description: 'Your educational background is clearly presented.',
      detail: 'Keep school, degree and dates easy to find.',
    },
    {
      title: 'Clean and Professional Layout',
      description: 'Overall structure is easy to read.',
      detail: 'Keep the current structure and spacing; it reads well.',
    },
  ],
  suggestions: [
    {
      title: 'Add a Strong Summary',
      description: 'Include a brief professional summary highlighting your key strengths.',
      detail: 'Add 2-3 lines at the top covering your role, your strongest skills and what you are aiming for.',
    },
    {
      title: 'Showcase Projects',
      description: 'Add relevant personal or academic projects with links (e.g., GitHub).',
      detail: 'List 2-3 projects with what you built, the tools used and a link to the code or demo.',
    },
    {
      title: 'Tailor for Each Job',
      description: 'Customize your resume for each job application using relevant keywords.',
      detail: 'Change the summary and top skills to echo the wording of each job description.',
    },
    {
      title: 'Include Certifications',
      description: 'Add relevant certifications to boost credibility (e.g., AWS, Google, Microsoft).',
      detail: 'List certifications with the issuer and year, and put the most relevant ones first.',
    },
  ],
}

// fade + slide-up used when the page opens, staggered with `delay` (ms)
function Reveal({ delay = 0, className = '', children }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// dot grid + lavender block from the reference (wide screens only)
function Decorations() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[230px] top-[84px] hidden h-[57px] w-[133px] bg-[radial-gradient(circle,#111_1.6px,transparent_2px)] [background-size:19px_19px] xl:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-[163px] hidden h-[129px] w-[52px] bg-[#b290ff] xl:block"
      />
    </>
  )
}

export default function JobDescriptionAnalysis({ analysis, firstPageRoute = FIRST_PAGE_ROUTE }) {
  const location = useLocation()
  const incoming = analysis || location.state?.analysis
  const cameFromAnalyze = Boolean(incoming || location.state?.jobDescription)

  if (!cameFromAnalyze) return <Navigate to={firstPageRoute} replace />

  const data = { ...sampleAnalysis, ...(incoming || {}) }

  return (
    <div className="relative isolate flex min-h-screen w-full min-w-0 flex-1 flex-col overflow-hidden bg-[#f7f7f7] px-4 pb-8 pt-36 text-[#111] sm:px-6 lg:h-screen lg:min-h-[720px] lg:pb-8 lg:pr-8 lg:pt-[160px]">
      <Decorations />

      <div className="relative z-10 flex flex-col gap-6 lg:min-h-0 lg:flex-1">
        <Reveal className="shrink-0">
          <AnalysisSummaryCard
            matchScore={data.matchScore}
            company={data.company}
            role={data.role}
            summary={data.summary}
          />
        </Reveal>

        <Reveal
          delay={120}
          className="grid gap-6 lg:min-h-0 lg:flex-[313_1_0%] lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]"
        >
          <AreasToImprove items={data.improvements} />
          <WhatsWorkingWell items={data.strengths} />
        </Reveal>

        <Reveal delay={240} className="flex min-h-0 flex-col lg:flex-[220_1_0%]">
          <Suggestions items={data.suggestions} className="flex-1" />
        </Reveal>
      </div>
    </div>
  )
}

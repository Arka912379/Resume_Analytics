import { useEffect, useState } from 'react'

// Top white box of the analysis page:
//   match score ring | company + role | message
// Props: matchScore (0-100), company, role, summary

// circular score, starts at 12 o'clock and fills counter-clockwise like the reference
function ScoreRing({ score }) {
  const value = Math.min(100, Math.max(0, Math.round(Number(score) || 0)))
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(value))
    return () => cancelAnimationFrame(frame)
  }, [value])

  const radius = 64
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative h-36 w-36 lg:h-[clamp(8.5rem,8.7vw,9.5rem)] lg:w-[clamp(8.5rem,8.7vw,9.5rem)]">
      <svg viewBox="0 0 150 150" className="h-full w-full" role="img" aria-label={`Match score ${value} percent`}>
        <circle cx="75" cy="75" r={radius} fill="none" stroke="#d3cbea" strokeWidth="22" />
        <g transform="translate(75 75) scale(-1 1) rotate(-90)">
          <circle
            r={radius}
            fill="none"
            stroke="#6d3df2"
            strokeWidth="22"
            strokeDasharray={`${(circumference * shown) / 100} ${circumference}`}
            className="transition-[stroke-dasharray] duration-[900ms] ease-out motion-reduce:transition-none"
          />
        </g>
      </svg>
      <p
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center text-3xl font-extrabold leading-none tracking-tight lg:text-[clamp(1.75rem,2.4vw,2.5rem)]"
      >
        {value}%
      </p>
    </div>
  )
}

const Divider = () => (
  <span aria-hidden="true" className="my-7 hidden w-0.5 shrink-0 self-stretch bg-[#111] sm:block" />
)

export default function AnalysisSummaryCard({ matchScore, company, role, summary }) {
  return (
    <section aria-label="Analysis summary" className="relative">
      <div className="flex flex-col border-2 border-[#111] bg-white shadow-[8px_8px_0_#111] sm:flex-row sm:items-stretch">
        <div className="grid shrink-0 place-items-center bg-[#e6deff] px-5 py-4 sm:w-[clamp(11rem,14.8vw,15.5rem)] lg:py-3">
          <ScoreRing score={matchScore} />
        </div>

        <Divider />

        <div className="flex shrink-0 flex-col justify-center border-t-2 border-[#111] px-6 py-5 sm:min-w-[14rem] sm:border-t-0 sm:px-8 lg:max-w-[26rem]">
          <p className="w-fit max-w-full break-words border-2 border-[#111] bg-[#b290ff] px-3 py-0.5 text-3xl font-extrabold leading-tight shadow-[3px_3px_0_#111] lg:text-[clamp(1.6rem,2.1vw,2.2rem)]">
            {company}
          </p>
          <p className="mt-3 flex items-start gap-2 text-lg font-bold leading-snug lg:text-[clamp(1rem,1.25vw,1.3rem)]">
            <span aria-hidden="true">&bull;</span>
            {role}
          </p>
        </div>

        <Divider />

        <p className="flex min-w-0 flex-1 items-center border-t-2 border-[#111] px-6 py-5 text-base leading-snug sm:border-t-0 lg:text-[clamp(0.95rem,1.1vw,1.15rem)] xl:pr-28">
          {summary}
        </p>
      </div>

      {/* black staircase on the card's right end (wide screens) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 108 121"
        className="pointer-events-none absolute -bottom-2 -right-2 hidden h-[121px] w-[108px] xl:block"
      >
        <rect x="0" y="91" width="27" height="30" fill="#111" />
        <rect x="27" y="61" width="27" height="60" fill="#111" />
        <rect x="54" y="31" width="27" height="90" fill="#111" />
        <rect x="81" y="0" width="27" height="121" fill="#111" />
      </svg>
    </section>
  )
}
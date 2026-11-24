import { CalendarDays, CheckCircle2, Lightbulb, ShieldAlert, Timer } from 'lucide-react'

// Results summary shown after "Interview Ended".
// Props: endedAt (Date | null), duration ('18:42')
// Optional: scores = { overall, technical, communication, problemSolving, resume } (0-100)
//           -> when a score is given its ring fills; otherwise the ring shows "not evaluated".

// brand colours (same as the upload page / ATS score card)
const INK = '#111111'
const PURPLE = '#8e6cfd'
const LILAC = '#b290ff'
const MINT = '#5fdc98'
const YELLOW = '#fed62a'
const PINK = '#fd6c82'
const ARC = '#7c5cff'

const SKILLS = [
  { key: 'technical', label: 'Technical Knowledge', color: ARC, tint: '#d9ceff' },
  { key: 'communication', label: 'Communication', color: '#2fc97f', tint: '#c3f2d9' },
  { key: 'problemSolving', label: 'Problem Solving', color: '#f5c400', tint: '#ffefa0' },
  { key: 'resume', label: 'Resume Knowledge', color: PINK, tint: '#ffcfd7' },
]

function verdictFor(score) {
  if (score >= 80) return { label: 'Excellent', color: LILAC }
  if (score >= 65) return { label: 'Good', color: YELLOW }
  if (score >= 50) return { label: 'Fair', color: '#ffb86b' }
  return { label: 'Needs work', color: PINK }
}

// round score ring: black frame, coloured track, coloured arc, value in the middle
function Ring({ value, size, stroke, color, track, children }) {
  const hasValue = typeof value === 'number' && Number.isFinite(value)
  const percent = hasValue ? Math.min(100, Math.max(0, value)) : 0
  const radius = (size - stroke) / 2 - 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="block">
        <circle cx={center} cy={center} r={radius} fill="#fff" stroke={INK} strokeWidth={stroke + 4} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        {hasValue && percent > 0 && (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${(circumference * percent) / 100} ${circumference}`}
            transform={`rotate(-90 ${center} ${center})`}
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export default function InterviewResults({ endedAt, duration, scores = {} }) {
  const overall = typeof scores.overall === 'number' ? Math.round(scores.overall) : null
  const verdict = overall === null ? null : verdictFor(overall)

  return (
    <section className="mx-auto w-full max-w-[1400px] flex-1 pb-4 text-[#111]">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-black pb-3">
        <div>
          <h1 className="inline-block border-[3px] border-black bg-[#8e6cfd] px-3 py-1 text-2xl font-black uppercase leading-none shadow-[4px_4px_0_#111] sm:text-3xl">Interview Results</h1>
          <p className="mt-2 text-sm font-semibold">Session summary. Performance analysis is not connected yet.</p>
        </div>
        <div className="flex items-center gap-3 border-[3px] border-black bg-[#fed62a] px-3 py-2 text-xs font-black shadow-[4px_4px_0_#111]">
          <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" size={16} strokeWidth={2.5} />{endedAt ? endedAt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date unavailable'}</span>
          <span aria-hidden="true" className="h-6 w-0.5 bg-black" />
          <span className="inline-flex items-center gap-1.5"><Timer aria-hidden="true" size={16} strokeWidth={2.5} />{duration}</span>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(190px,0.28fr)_minmax(0,1fr)]">
        <article className="border-[3px] border-black bg-[#5fdc98] p-3 shadow-[6px_6px_0_#111] sm:p-4">
          <h2 className="text-center text-lg font-black uppercase tracking-wide">Overall Score</h2>
          <div className="mt-3 flex justify-center">
            <Ring value={overall} size={136} stroke={16} color={ARC} track={overall === null ? '#cdbdff' : '#f6f6f6'}>
              <div className="text-center">
                <span className="block text-4xl font-black leading-none">{overall === null ? '—' : overall}</span>
                <span className="text-xs font-black">/ 100</span>
              </div>
            </Ring>
          </div>
          <p
            className="mt-3 border-[3px] border-black px-2 py-1 text-center text-xs font-black uppercase shadow-[3px_3px_0_#111]"
            style={{ backgroundColor: verdict ? verdict.color : LILAC }}
          >
            {verdict ? verdict.label : 'Score not available'}
          </p>
        </article>

        <article className="border-[3px] border-black bg-white p-3 shadow-[6px_6px_0_#111] sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-black uppercase tracking-wide">Skill Breakdown</h2>
            <span className="border-2 border-black bg-[#fed62a] px-2 py-0.5 text-[0.68rem] font-black">Score out of 100</span>
          </div>
          <div className="mt-3 grid grid-cols-2 divide-y-[3px] divide-black sm:grid-cols-4 sm:divide-x-[3px] sm:divide-y-0">
            {SKILLS.map((skill) => {
              const value = typeof scores[skill.key] === 'number' ? Math.round(scores[skill.key]) : null

              return (
                <div key={skill.key} className="flex flex-col items-center justify-center px-2 py-2 text-center">
                  <h3 className="min-h-9 text-xs font-black leading-tight">{skill.label}</h3>
                  <div className="my-1">
                    <Ring value={value} size={64} stroke={8} color={skill.color} track={skill.tint}>
                      <span className="text-lg font-black">{value === null ? '—' : value}</span>
                    </Ring>
                  </div>
                  <span
                    className="border-2 border-black px-2 py-0.5 text-[0.62rem] font-black shadow-[2px_2px_0_#111]"
                    style={{ backgroundColor: skill.tint }}
                  >
                    {value === null ? 'Not evaluated' : `${value} / 100`}
                  </span>
                </div>
              )
            })}
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <article className="border-[3px] border-black bg-[#5fdc98] p-3 shadow-[6px_6px_0_#111] sm:p-4">
          <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-wide"><CheckCircle2 aria-hidden="true" strokeWidth={2.75} />Strengths</h2>
          <div className="mt-2 border-t-2 border-black pt-2 text-sm font-semibold">No strengths were assessed. An interview evaluation service is not connected.</div>
        </article>
        <article className="border-[3px] border-black bg-[#fd6c82] p-3 shadow-[6px_6px_0_#111] sm:p-4">
          <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-wide"><ShieldAlert aria-hidden="true" strokeWidth={2.75} />Areas to Review</h2>
          <div className="mt-2 border-t-2 border-black pt-2 text-sm font-semibold">No areas for improvement were assessed. No performance feedback has been generated.</div>
        </article>
      </div>

      <article className="mt-4 border-[3px] border-black bg-[#fed62a] p-3 shadow-[6px_6px_0_#111] sm:p-4">
        <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-wide"><Lightbulb aria-hidden="true" strokeWidth={2.75} />Recommendations</h2>
        <ul className="mt-2 space-y-1.5 border-t-2 border-black pt-2 text-sm font-semibold">
          <li className="flex gap-2"><span className="font-black">•</span><span>Review your responses and note any topics you would like to practice further.</span></li>
          <li className="flex gap-2"><span className="font-black">•</span><span>Practice explaining your approach with clear examples and a concise structure.</span></li>
          <li className="flex gap-2"><span className="font-black">•</span><span>Personalized recommendations will appear here when interview evaluation is connected.</span></li>
        </ul>
      </article>
    </section>
  )
}
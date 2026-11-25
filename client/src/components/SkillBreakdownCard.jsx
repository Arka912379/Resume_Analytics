import ResultCard from './ResultCard.jsx'
import ScoreDonut, { getScoreTone } from './ScoreDonut.jsx'

// "Skill Breakdown" box: one ring + label pill per skill, thin dividers between them.
// skills: [{ id, label, score }]   (fixed px sizes, see InterviewResults.jsx)
// compact: narrow screens -> two rings per row, no dividers
export default function SkillBreakdownCard({ skills = [], compact = false, className = '' }) {
  return (
    <ResultCard aria-label="Skill breakdown" className={`flex flex-col bg-[#fdfcff] ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-[#111]/15 bg-[#e3dafc] px-4 py-2">
        <h2 className="text-[24px] font-extrabold leading-none tracking-tight">Skill Breakdown</h2>
        <p className="text-[16px] font-medium leading-none">Score out of 100</p>
      </header>

      <ul className={`grid flex-1 px-2 py-3 ${compact ? 'grid-cols-2 gap-y-5' : 'grid-cols-4'}`}>
        {skills.map((skill, index) => {
          const tone = getScoreTone(skill.score)

          return (
            <li
              key={skill.id || skill.label}
              className={`relative flex flex-col items-center px-3 ${
                index > 0 && !compact
                  ? 'before:absolute before:bottom-[2%] before:left-0 before:top-[4%] before:w-[1.5px] before:bg-[#111]'
                  : ''
              }`}
            >
              <h3 className="flex min-h-[2.3em] items-end justify-center text-center text-[17px] font-extrabold leading-[1.1] tracking-tight">
                {skill.label}
              </h3>

              <ScoreDonut score={skill.score} color={tone.color} stroke={12} className="mt-2 w-[110px]">
                <span className="text-[38px] font-black leading-none tracking-tight">{skill.score}</span>
              </ScoreDonut>

              <span
                className="mt-3 w-full rounded-[3px] px-2 py-1 text-center text-[15px] leading-tight"
                style={{ backgroundColor: tone.pill }}
              >
                {tone.label}
              </span>
            </li>
          )
        })}
      </ul>
    </ResultCard>
  )
}
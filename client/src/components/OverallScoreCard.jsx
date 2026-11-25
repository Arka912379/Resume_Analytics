import ResultCard from './ResultCard.jsx'
import ScoreDonut, { getOverallLabel, getScoreTone } from './ScoreDonut.jsx'

// little ascending bars shown in the verdict pill
function BarsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0">
      <rect x="3" y="13" width="4.5" height="8" rx="1" fill="#6b2bf0" />
      <rect x="9.75" y="8" width="4.5" height="13" rx="1" fill="#936efc" />
      <rect x="16.5" y="3" width="4.5" height="18" rx="1" fill="#b290ff" />
    </svg>
  )
}

// "Overall Score" box: big ring + verdict pill.
// Sizes are fixed px: the whole page is drawn on a stage that is scaled to fit the screen.
export default function OverallScoreCard({ score, className = '' }) {
  const tone = getScoreTone(score)

  return (
    <ResultCard
      aria-label="Overall score"
      className={`flex flex-col items-center bg-[#e6defd] px-4 py-4 ${className}`}
    >
      <h2 className="text-[24px] font-extrabold leading-none tracking-tight">Overall Score</h2>

      <div className="my-auto py-3">
        <ScoreDonut score={score} color={tone.color} stroke={14} direction="ccw" className="w-[156px]">
          <span className="text-[50px] font-black leading-none tracking-tight">{score}</span>
          <span className="mt-1 text-[17px] font-medium leading-none">/ 100</span>
        </ScoreDonut>
      </div>

      <p className="flex w-full items-center justify-center gap-2 rounded-[3px] bg-[#d3c5fb] px-3 py-1.5 text-[15px] leading-tight">
        <BarsIcon />
        {getOverallLabel(score)}
      </p>
    </ResultCard>
  )
}
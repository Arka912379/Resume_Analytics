import { CalendarDays, Clock3 } from 'lucide-react'
import ResultCard from './ResultCard.jsx'

// Small box at the top right: interview date + duration (fixed px sizes).
export default function InterviewMetaCard({ date, duration, className = '' }) {
  return (
    <ResultCard
      aria-label="Interview details"
      className={`flex max-w-full flex-wrap items-center gap-x-5 gap-y-2 bg-[#ebe6fc] px-5 py-3 ${className}`}
    >
      <div className="flex items-center gap-3">
        <CalendarDays aria-hidden="true" className="h-9 w-9 shrink-0 stroke-[1.8]" />
        <div className="leading-tight">
          <p className="text-[14.5px] font-medium">Interview Date</p>
          <p className="text-[18px] font-extrabold tracking-tight">{date}</p>
        </div>
      </div>

      <span aria-hidden="true" className="h-10 w-0.5 shrink-0 bg-[#111]" />

      <div className="flex items-center gap-3">
        <Clock3 aria-hidden="true" className="h-9 w-9 shrink-0 stroke-[1.8]" />
        <div className="leading-tight">
          <p className="text-[14.5px] font-medium">Duration</p>
          <p className="text-[18px] font-extrabold tracking-tight">{duration}</p>
        </div>
      </div>
    </ResultCard>
  )
}
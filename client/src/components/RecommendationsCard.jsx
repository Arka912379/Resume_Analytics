import { Lightbulb } from 'lucide-react'
import FeedbackCard from './FeedbackCard.jsx'

// "Recommendations" box (yellow, full width, slightly smaller text like the design).
export default function RecommendationsCard({ items, className = '' }) {
  return (
    <FeedbackCard
      title="Recommendations"
      items={items}
      className={className}
      cardClass="bg-[#fffcee]"
      headerClass="bg-[#f9edb0]"
      dotClass="bg-[#f5c518]"
      textClass="text-[14px] leading-[1.12] tracking-[-0.02em]"
      icon={
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#111] bg-[#fde047]"
        >
          <Lightbulb className="h-5 w-5 stroke-[2.2]" />
        </span>
      }
    />
  )
}
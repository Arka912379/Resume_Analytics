import { Check } from 'lucide-react'
import FeedbackCard from './FeedbackCard.jsx'

// Mint "Strengths" box. Props: items (string[])
export default function StrengthsCard({ items, className = '' }) {
  return (
    <FeedbackCard
      title="Strengths"
      items={items}
      className={className}
      cardClass="bg-[#effcf4]"
      headerClass="bg-[#cdf5df]"
      dotClass="bg-[#22c55e]"
      icon={
        <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#22c55e]">
          <Check className="h-5 w-5 stroke-[4] text-white" />
        </span>
      }
    />
  )
}

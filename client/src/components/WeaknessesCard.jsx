import FeedbackCard from './FeedbackCard.jsx'

// Pink "Weaknesses" box. Props: items (string[])

function ExclamationIcon({ className = 'h-6 w-6' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M12 5v9" />
      <circle cx="12" cy="19.2" r="0.6" fill="currentColor" />
    </svg>
  )
}

export default function WeaknessesCard({ items, className = '' }) {
  return (
    <FeedbackCard
      title="Weaknesses"
      items={items}
      className={className}
      cardClass="bg-[#fdeef0]"
      headerClass="bg-[#fbd3d8]"
      dotClass="bg-[#ef1c1c]"
      icon={
        <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e11d2e] text-xl font-black leading-none text-white">
          <ExclamationIcon />
        </span>
      }
    />
  )
}

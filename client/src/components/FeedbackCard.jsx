import ResultCard from './ResultCard.jsx'

// Shared layout for the three list boxes (Strengths / Weaknesses / Recommendations):
// coloured header band with an icon + title, then bullet rows with thin separators.
// The colours come from the wrapper component that uses it (fixed px sizes).
export default function FeedbackCard({
  title,
  icon,
  items = [],
  cardClass = '',
  headerClass = '',
  dotClass = '',
  textClass = 'text-[15.5px] leading-[1.12] tracking-[-0.01em]',
  className = '',
}) {
  return (
    <ResultCard aria-label={title} className={`flex flex-col ${cardClass} ${className}`}>
      <header className={`flex items-center gap-3 px-4 py-2 ${headerClass}`}>
        {icon}
        <h2 className="text-[24px] font-extrabold leading-none tracking-tight">{title}</h2>
      </header>

      <ul className="flex-1 px-4 py-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-4 border-b border-black/10 py-[5px] last:border-b-0">
            <span aria-hidden="true" className={`mt-[2px] h-3.5 w-3.5 shrink-0 rounded-full ${dotClass}`} />
            <span className={textClass}>{item}</span>
          </li>
        ))}
      </ul>
    </ResultCard>
  )
}
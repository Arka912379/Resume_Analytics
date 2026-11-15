import InsightPanel from './InsidhtPanel.jsx'

// Pink "Areas to Improve" box. items: [{ title, description, detail? }]

function ExclamationIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M12 5v9" />
      <circle cx="12" cy="19.2" r="0.6" fill="currentColor" />
    </svg>
  )
}

export default function AreasToImprove({ items, className = '' }) {
  return (
    <InsightPanel
      tone="improve"
      title="Areas to Improve"
      items={items}
      className={className}
      icon={
        <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#f4284f] text-white">
          <ExclamationIcon />
        </span>
      }
    />
  )
}

import { Lightbulb } from 'lucide-react'
import InsightPanel from './InsidhtPanel.jsx'

// Yellow wide "Suggestions" box. items: [{ title, description, detail? }]

export default function Suggestions({ items, className = '' }) {
  return (
    <InsightPanel
      tone="suggestions"
      title="Suggestions"
      layout="columns"
      items={items}
      className={className}
      icon={
        <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#ffd42e] text-[#111]">
          <Lightbulb aria-hidden="true" className="h-7 w-7 stroke-[2]" />
        </span>
      }
    />
  )
}

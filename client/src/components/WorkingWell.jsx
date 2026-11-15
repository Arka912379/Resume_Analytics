import { Check } from 'lucide-react'
import InsightPanel from './InsidhtPanel.jsx'

// Mint "What's Working Well" box. items: [{ title, description, detail? }]

export default function WhatsWorkingWell({ items, className = '' }) {
  return (
    <InsightPanel
      tone="strengths"
      title="What's Working Well"
      items={items}
      className={className}
      icon={
        <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#12b955] text-white">
          <Check aria-hidden="true" className="h-8 w-8 stroke-[3.5]" />
        </span>
      }
    />
  )
}

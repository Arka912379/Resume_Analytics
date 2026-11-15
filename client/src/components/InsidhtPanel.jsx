import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

// Shared box used by "Areas to Improve", "What's Working Well" and "Suggestions".
//   tone   : 'improve' | 'strengths' | 'suggestions'  (colours)
//   layout : 'stacked' (title above description) | 'columns' (title | description)
//   items  : [{ title, description, detail? }]  - when `detail` exists the row opens on click

const TONES = {
  improve: {
    band: 'bg-[#ffb7c7]',
    body: 'bg-[#ffe6ec]',
    badge: 'bg-[#ffd2dc]',
    dot: 'bg-[#f4284f]',
    line: 'border-[#f0b6c3]',
  },
  strengths: {
    band: 'bg-[#a9f2d3]',
    body: 'bg-[#e4faf1]',
    badge: 'bg-[#cdf6e5]',
    dot: 'bg-[#12b955]',
    line: 'border-[#bfe5d3]',
  },
  suggestions: {
    band: 'bg-[#ffe58c]',
    body: 'bg-[#fff6d6]',
    badge: 'bg-[#fff0b0]',
    dot: 'bg-[#ffd21f]',
    line: 'border-[#e6dcb2]',
  },
}

function InsightRow({ item, tone, layout }) {
  const [open, setOpen] = useState(false)
  const expandable = Boolean(item.detail)
  const Wrapper = expandable ? 'button' : 'div'
  const wrapperProps = expandable
    ? { type: 'button', onClick: () => setOpen((o) => !o), 'aria-expanded': open }
    : {}

  const title = (
    <span className="block text-base font-bold leading-tight lg:text-[clamp(0.9rem,1.08vw,1.15rem)]">{item.title}</span>
  )
  const description = (
    <span className="block text-sm leading-snug lg:text-[clamp(0.8rem,0.98vw,1rem)]">{item.description}</span>
  )

  return (
    <li className={`border-b last:border-b-0 ${tone.line}`}>
      <Wrapper
        {...wrapperProps}
        className={`flex w-full items-center gap-4 py-2 text-left text-[#111] ${
          expandable ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30' : ''
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 shrink-0 self-start rounded-full ${tone.dot} ${
            layout === 'columns' ? 'mt-2.5 sm:mt-[0.6rem]' : 'mt-2'
          }`}
        />
        {layout === 'columns' ? (
          <span className="grid min-w-0 flex-1 gap-x-4 gap-y-0.5 sm:grid-cols-[clamp(10rem,17vw,16.5rem)_1fr] sm:items-center">
            {title}
            {description}
          </span>
        ) : (
          <span className="min-w-0 flex-1">
            {title}
            {description}
          </span>
        )}
        <ChevronRight
          aria-hidden="true"
          className={`h-6 w-6 shrink-0 stroke-[2.5] transition-transform duration-150 motion-reduce:transition-none ${
            open ? 'rotate-90' : ''
          }`}
        />
      </Wrapper>
      {open && (
        <p className="pb-3 pl-[1.65rem] pr-10 text-sm leading-snug lg:text-[clamp(0.8rem,0.98vw,1rem)]">
          {item.detail}
        </p>
      )}
    </li>
  )
}

export default function InsightPanel({ tone: toneName, title, icon, items = [], layout = 'stacked', className = '' }) {
  const tone = TONES[toneName]
  const headingId = `panel-${toneName}`

  return (
    <section
      aria-labelledby={headingId}
      className={`flex min-h-0 flex-col border-2 border-[#111] shadow-[8px_8px_0_#111] ${tone.body} ${className}`}
    >
      <header className={`flex shrink-0 items-center gap-4 px-5 py-2.5 sm:px-6 ${tone.band}`}>
        {icon}
        <h2 id={headingId} className="flex-1 text-xl font-bold leading-tight lg:text-[clamp(1.25rem,1.5vw,1.6rem)]">
          {title}
        </h2>
        <span
          aria-label={`${items.length} items`}
          className={`grid h-9 min-w-[3.25rem] place-items-center rounded-full px-3 text-xl font-bold leading-none ${tone.badge}`}
        >
          {items.length}
        </span>
      </header>

      <ul className="min-h-0 flex-1 overflow-y-auto px-5 sm:px-6 [scrollbar-color:#111_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[#111]">
        {items.map((item) => (
          <InsightRow key={item.title} item={item} tone={tone} layout={layout} />
        ))}
      </ul>
    </section>
  )
}
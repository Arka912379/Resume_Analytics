import { ArrowRight, Check, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import BarsIcon from './BarsIcon.jsx'

// type -> circle color + icon
const activityTypes = {
  interview: { icon: Check, bg: 'bg-[#5fdc98]' },
  resume: { icon: FileText, bg: 'bg-[#ffe74a]' },
  score: { icon: BarsIcon, bg: 'bg-[#b290ff]' },
}

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

// "Today, 10:30 AM" / "Yesterday, 04:15 PM" / "Oct 28, 09:05 AM"
export function formatActivityTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000)
  if (diffDays === 0) return `Today, ${time}`
  if (diffDays === 1) return `Yesterday, ${time}`
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`
}

export default function RecentActivity({ items = [], viewAllTo = '/history', className = '' }) {
  return (
    <section
      aria-labelledby="recent-activity-title"
      className={`border-2 border-[#111] bg-white shadow-[8px_8px_0_#111] ${className}`}
    >
      <header className="flex items-stretch justify-between bg-[#111] text-white">
        <h2
          id="recent-activity-title"
          className="flex items-center px-4 py-2 text-lg font-black uppercase leading-none tracking-tight sm:text-xl"
        >
          Recent Activity
        </h2>
        <Link
          to={viewAllTo}
          className="flex items-center gap-2 border-2 border-[#111] bg-[#5fdc98] px-4 text-sm font-black uppercase leading-none text-[#111] transition-colors hover:bg-[#7ae8ac] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:px-5"
        >
          View All
          <ArrowRight aria-hidden="true" className="h-5 w-5 stroke-[2.5]" />
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-base font-bold text-[#111]/60">
          No recent activity yet. Start an interview or upload your resume.
        </p>
      ) : (
        <div
          role="region"
          aria-label="Recent activity list, scroll for more"
          tabIndex={0}
          className="max-h-[216px] overflow-y-auto overscroll-contain [scrollbar-color:#111_#efefef] [scrollbar-width:thin] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-black/30 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:bg-[#111] [&::-webkit-scrollbar-track]:bg-[#efefef]"
        >
        <ul className="px-4 py-1 sm:px-5">
          {items.map(({ id, type, title, subtitle, timestamp }) => {
            const { icon: Icon, bg } = activityTypes[type] || activityTypes.interview
            return (
              <li
                key={id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#111]/40 py-2.5 last:border-b-0"
              >
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[#111] text-[#111] ${bg}`}
                >
                  <Icon aria-hidden="true" className="h-6 w-6 stroke-[2.5]" />
                </span>
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-base font-extrabold leading-tight">{title}</p>
                  <p className="text-sm leading-snug sm:text-[15px]">{subtitle}</p>
                </div>
                <time
                  dateTime={timestamp}
                  className="w-full pl-16 text-sm sm:w-auto sm:pl-0 sm:text-right sm:text-base"
                >
                  {formatActivityTime(timestamp)}
                </time>
              </li>
            )
          })}
        </ul>
        </div>
      )}
    </section>
  )
}
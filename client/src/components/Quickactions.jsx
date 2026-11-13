import { ArrowRight, Calendar, FileUp, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

const defaultActions = [
  {
    title: 'Start AI Interview',
    description: 'Start a new interview',
    to: '/interview',
    icon: MessageSquare,
  },
  {
    title: 'Upload Resume',
    description: 'Analyze your resume',
    to: '/resume-analysis',
    icon: FileUp,
  },
  {
    title: 'Job Finding',
    description: 'Find jobs matching your profile',
    to: '/jobFinder',
    icon: Calendar,
  },
]

export default function QuickActions({ actions = defaultActions, className = '' }) {
  return (
    <section
      aria-labelledby="quick-actions-title"
      className={`flex flex-col border-2 border-[#111] bg-gradient-to-b from-[#c4b1ff] to-[#a98fff] p-5 pt-4 shadow-[8px_8px_0_#111] lg:px-5 lg:pb-4 lg:pt-3 ${className}`}
    >
      <h2
        id="quick-actions-title"
        className="mb-3 text-2xl font-black uppercase leading-none tracking-tight sm:text-[26px] lg:mb-2 lg:text-[clamp(1.25rem,3vh,1.625rem)]"
      >
        Quick Actions
      </h2>

      <ul className="grid flex-1 auto-rows-fr gap-2 lg:min-h-0">
        {actions.map(({ title, description, to, icon: Icon }) => (
          <li key={to} className="flex">
            <Link
              to={to}
              className="group flex min-h-[64px] w-full lg:min-h-0 items-stretch border-2 border-[#111] bg-white transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <span className="grid w-[68px] shrink-0 place-items-center bg-[#111] text-white sm:w-[84px]">
                <Icon aria-hidden="true" className="h-8 w-8 stroke-[2]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col justify-center px-4 py-2 lg:py-1">
                <span className="text-base font-black uppercase leading-tight sm:text-lg lg:text-[clamp(0.9rem,2vh,1.125rem)]">{title}</span>
                <span className="text-sm leading-snug sm:text-base lg:text-[clamp(0.75rem,1.7vh,1rem)]">{description}</span>
              </span>
              <span className="grid w-[56px] shrink-0 place-items-center border-l-2 border-[#111] sm:w-[82px]">
                <ArrowRight
                  aria-hidden="true"
                  className="h-7 w-7 stroke-[2.5] transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
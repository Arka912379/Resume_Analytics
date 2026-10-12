import {
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  FileText,
  LayoutDashboard,
  MessageSquare,
  UserRound,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import BrandLogo from './BrandLogo.jsx'

const defaultNavigationItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { label: 'AI Interview', path: '/interview', icon: MessageSquare },
  { label: 'Old Activities', path: '/history', icon: Clock3 },
  { label: 'Job Description Analysis', path: '/jdAnalysis', icon: FileText },
  { label: 'Job Finder', path: '/job-finder', icon: BriefcaseBusiness },
  { label: 'My Profile', path: '/profile', icon: UserRound },
]

const defaultMotivation = {
  title: 'KEEP IMPROVING!',
  description: 'Practice more to increase your chances of success.',
}

export default function Sidebar({
  navigationItems = defaultNavigationItems,
  motivation = defaultMotivation,
  className = '',
}) {
  return (
    <aside
      aria-label="Application sidebar"
      className={`mr-auto flex h-screen min-h-screen w-[clamp(240px,18vw,310px)] shrink-0 flex-col overflow-y-auto border-r-2 border-black bg-[#5fdc98] p-5 text-[#111] max-[1100px]:w-[clamp(220px,25vw,280px)] max-[1100px]:p-4 max-[720px]:w-[clamp(72px,20%,140px)] max-[720px]:p-2 ${className}`}
    >
      <BrandLogo
        density="compact"
        className="max-[720px]:mb-0 max-[720px]:justify-center max-[720px]:[&>div:last-child]:hidden"
      />

      <nav aria-label="Main navigation" className="mt-7 max-[1100px]:mt-6 max-[720px]:mt-8">
        <ul className="flex flex-col gap-3">
          {navigationItems.map(({ label, path, icon: Icon, end }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={end}
                aria-label={label}
                className={({ isActive }) =>
                  `group flex min-h-11 w-full items-center gap-2.5 border-2 px-3 py-2 text-left text-base font-extrabold transition-[transform,box-shadow,background-color] duration-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40 max-[1100px]:gap-2 max-[1100px]:px-2 max-[1100px]:text-sm max-[720px]:justify-center max-[720px]:px-1 ${
                    isActive
                      ? 'border-black bg-[#111] !text-white shadow-[3px_3px_0_#111]'
                      : 'border-transparent text-[#111] hover:translate-x-0.5 hover:-translate-y-0.5 hover:border-black hover:bg-[#5fdc98] hover:shadow-[3px_3px_0_#111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                  }`
                }
              >
                <Icon
                  aria-hidden="true"
                  className="h-[22px] w-[22px] shrink-0 stroke-[2.5]"
                />
                <span className="max-[720px]:sr-only">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1 min-h-8" />

      <div
        aria-hidden="true"
        className="mb-4 h-12 w-28 bg-[radial-gradient(circle,#111_1.4px,transparent_1.7px)] [background-size:12px_12px] max-[720px]:hidden"
      />

      <section
        aria-labelledby="sidebar-motivation-title"
        className="relative border-2 border-black bg-[#b290ff] p-3 shadow-[4px_4px_0_#111] max-[1100px]:p-2.5 max-[720px]:hidden"
      >
        <h2
          id="sidebar-motivation-title"
          className="mb-2 max-w-[9ch] text-base font-black leading-tight"
        >
          {motivation.title}
        </h2>
        <p className="mb-3 text-sm font-semibold leading-snug">
          {motivation.description}
        </p>
        {motivation.to ? (
          <Link
            to={motivation.to}
            aria-label="Continue practicing"
            className="ml-auto grid h-8 w-8 place-items-center border-2 border-black bg-black text-white transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40"
          >
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : (
          <span
            aria-hidden="true"
            className="ml-auto grid h-8 w-8 place-items-center border-2 border-black bg-black text-white"
          >
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </section>
    </aside>
  )
}

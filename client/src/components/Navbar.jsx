import { Bell, ChevronDown, Clock3, Code2, UserRound } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const nameSizeClasses = {
  small: 'text-[clamp(1.4rem,2.2vw,1.8rem)]',
  medium: 'text-[clamp(1.6rem,2.8vw,2.4rem)]',
  large: 'text-[clamp(2rem,3.6vw,3.4rem)]',
}

const defaultSubtitle = 'Track your progress and get interview ready.'

// The heading is chosen from the page address (URL path), ignoring case, dashes,
// underscores and a trailing slash, so '/job-finder', '/jobFinder', '/job_finder/'
// and '/jobs' all show "Job Finder". To support another address, add it to `paths`
// in lowercase letters and numbers only (example: '/my-page' -> 'mypage').
// greeting: true -> shows "WELCOME BACK," above the page title (like the dashboard)
// subtitle: ''   -> no line under the title
const pageHeadings = [
  {
    paths: ['history', 'oldactivities'],
    title: 'Old Activities',
    subtitle: 'View your past interviews, resume analysis, and score updates.',
  },
  {
    paths: ['interview'],
    title: 'AI Interview',
    subtitle: 'Practice your interview skills and improve your confidence.',
  },
  {
    paths: ['resumeanalysis'],
    title: 'Resume Analysis',
    subtitle: 'Review your resume and find ways to improve it.',
  },
  {
    paths: ['jobdescriptionanalysis', 'jdanalysis', 'analysisresult', 'jobdescriptionresult'],
    title: 'Job Description Analysis',
    subtitle: 'Get detailed insights on your resume and make it stronger.',
  },
  {
    paths: ['jobdescription', 'jd'],
    title: 'Job Description',
    subtitle: 'Get detailed insights on your resume and make it stronger.',
  },
  {
    paths: ['jobfinder', 'jobs'],
    title: 'Job Finder',
    subtitle: '',
    greeting: true,
  },
  {
    paths: ['profile', 'myprofile'],
    title: 'My Profile',
    subtitle: 'Manage your profile and account details.',
  },
]

const compactPath = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

// '/' (dashboard) returns undefined -> "Welcome Back, NAME!"
const getPageHeading = (pathname) => {
  const current = compactPath(pathname)
  if (!current) return undefined
  return pageHeadings.find(({ paths }) => paths.some((path) => current.endsWith(path)))
}

const Navbar = ({
  variant = 'default',
  eyebrow,
  title,
  subtitle,
  rightContent,
  status = 'ready',
  elapsedSeconds = 0,
  interviewTitle = 'Software Developer Interview',
  showStatus = true,
  showDuration = true,
  className = '',
}) => {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const pageHeading = getPageHeading(pathname)
  const displayName = (user?.displayName || 'NILAYESH').toUpperCase()
  const profileName = user?.displayName || 'Nilayesh Adhikari'
  const selectedNameSize = nameSizeClasses.large
  const subtitle = pageHeading ? pageHeading.subtitle : defaultSubtitle

  if (variant === 'interview') {
    const hours = Math.floor(elapsedSeconds / 3600)
    const minutes = Math.floor((elapsedSeconds % 3600) / 60)
    const seconds = elapsedSeconds % 60
    const duration = hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    const statusLabel = status === 'live' ? 'Live' : status === 'ended' ? 'Ended' : 'Not Started'

    return (
      <div className={`flex w-full min-w-0 flex-wrap items-center justify-between gap-3 border-b-2 border-black/20 pb-3 text-[#111] ${className}`}>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center border-2 border-black bg-[#b290ff] shadow-[2px_2px_0_#111]"><Code2 aria-hidden="true" className="h-5 w-5" /></span>
            <h1 className="text-base font-black leading-tight sm:text-lg">{interviewTitle}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {showStatus && <span className={`inline-flex items-center gap-2 border-2 border-black px-2.5 py-1.5 text-xs font-black shadow-[2px_2px_0_#111] ${status === 'live' ? 'bg-[#d7f8e5]' : 'bg-[#efefef]'}`}>
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full border border-black ${status === 'live' ? 'bg-[#5fdc98]' : 'bg-[#a6a6a6]'}`} />{statusLabel}
          </span>}
          {showDuration && <div className="flex items-center gap-2 border-2 border-black bg-white px-2.5 py-1 shadow-[2px_2px_0_#111]">
            <Clock3 aria-hidden="true" className="h-4 w-4" />
            <span><strong className="block font-mono text-sm leading-none">{duration}</strong><span className="block text-[0.62rem] font-bold leading-tight">Interview Duration</span></span>
          </div>}
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden border-2 border-black bg-[#b290ff]">
              {user?.photoURL ? <img src={user.photoURL} alt={`${user.displayName || 'User'} avatar`} className="h-full w-full object-cover" /> : <UserRound aria-hidden="true" className="h-5 w-5" />}
            </div>
            <span className="max-w-40 truncate text-xs font-bold sm:text-sm">{user?.displayName || 'Candidate'}</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'page') {
    const pageTitle = title || pageHeading?.title || 'Page'
    const pageSubtitle = subtitle || pageHeading?.subtitle

    return (
      <header className={`relative z-20 flex w-full min-w-0 flex-col gap-3 border-b-2 border-black/20 pb-3 text-[#111] sm:flex-row sm:items-center sm:justify-between ${className}`}>
        <div className="min-w-0 flex-1">
          {eyebrow && <p className="mb-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#111]">{eyebrow}</p>}
          <h1 className="text-[clamp(1.55rem,2.35vw,2.1rem)] font-black leading-tight tracking-tight">{pageTitle}</h1>
          {pageSubtitle && <p className="mt-1 max-w-3xl text-sm font-medium leading-snug">{pageSubtitle}</p>}
        </div>
        {rightContent && <div className="w-full shrink-0 sm:w-56 lg:w-60">{rightContent}</div>}
      </header>
    )
  }

  return (
    <div className='fixed top-0 right-0 z-20 h-28 w-[80%] text-black flex justify-between items-start'>
      <div className="heading flex mt-8 h-full min-w-0 flex-1 items-center pl-2 max-[720px]:pl-3">
        <div className="flex min-w-0 flex-col items-start gap-1">
            {pageHeading ? (
              <>
                {pageHeading.greeting && (
                  <p className="text-[clamp(1.15rem,2vw,1.7rem)] font-black uppercase leading-none tracking-tight">
                    Welcome Back,
                  </p>
                )}
                <p className={`mb-2 w-fit max-w-full border-[3px] border-[#111] bg-[#b290ff] px-3 py-1 ${selectedNameSize} font-black uppercase leading-none tracking-tight text-[#111] shadow-[5px_5px_0_#111]`}>
                  {pageHeading.title}
                </p>
              </>
            ) : (
              <>
                <p className="text-[clamp(1.15rem,2vw,1.7rem)] font-black uppercase leading-none tracking-tight">
                  Welcome Back,
                </p>
                <p className={`mb-2 w-fit max-w-full border-[3px] border-[#111] bg-[#b290ff] px-3 py-1 ${selectedNameSize} font-black leading-none tracking-tight text-[#111] shadow-[5px_5px_0_#111] whitespace-nowrap`}>
                  {displayName}!
                </p>
              </>
            )}
          {subtitle && (
            <p className="text-[clamp(0.8rem,1vw,1rem)] font-medium leading-snug">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="profile ml-auto flex h-[80%] w-fit shrink-0 items-center justify-end gap-4 whitespace-nowrap pr-6 pt-2 max-[1100px]:gap-3 max-[1100px]:pr-4 max-[720px]:gap-1 max-[720px]:pr-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-10 w-10 shrink-0 place-items-center text-[#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30 max-[720px]:h-8 max-[720px]:w-8"
        >
          <Bell aria-hidden="true" className="h-7 w-7 stroke-[2.2] max-[720px]:h-6 max-[720px]:w-6" />
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 grid h-5 min-w-5 -translate-y-1/4 translate-x-1/4 place-items-center rounded-full border border-[#111] bg-[#b290ff] px-1 text-xs font-black leading-none text-[#111]"
          >
            2
          </span>
        </button>

        <span aria-hidden="true" className="h-7 w-px shrink-0 bg-[#111] max-[720px]:hidden" />

        <div className="flex items-center gap-2.5 max-[1100px]:gap-2 max-[720px]:gap-1">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#111] bg-[#b290ff] max-[1100px]:h-10 max-[1100px]:w-10 max-[720px]:h-8 max-[720px]:w-8">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={`${profileName} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound aria-hidden="true" className="h-6 w-6 text-[#111]" />
            )}
          </div>
          <span className="text-base font-bold text-[#111] max-[1100px]:text-sm max-[720px]:sr-only">
            {profileName}
          </span>
          <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-[#111] max-[720px]:h-4 max-[720px]:w-4" />
        </div>
      </div>
    </div>
  )
}

export default Navbar
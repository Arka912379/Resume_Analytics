import { Timer, UserRound } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'

// Top bar of the interview session (ready / live / results screens).
// Props: status ('guidelines' | 'ready' | 'live' | 'ended'), durationLabel ('00:18:42'),
//        interviewTitle, showStatus, showDuration

const STATUS = {
  live: { label: 'Live', dot: 'bg-[#22c55e]' },
  ready: { label: 'Ready', dot: 'bg-[#ffd93b]' },
  guidelines: { label: 'Getting ready', dot: 'bg-[#b290ff]' },
  ended: { label: 'Ended', dot: 'bg-[#ff5a5f]' },
}

// "</>" icon drawn inline so it works on any lucide-react version
function CodeSlashIcon({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  )
}

export default function InterviewTopBar({
  status = 'ready',
  durationLabel = '00:00',
  interviewTitle = 'Software Developer Interview',
  showStatus = true,
  showDuration = true,
}) {
  const auth = useAuth()
  const user = auth?.user
  const profileName = user?.displayName || 'Nilayesh Adhikari'
  const state = STATUS[status] || STATUS.ready

  return (
    <header className="relative z-10 mx-auto flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-3 md:w-[79%]">
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        {/* brand */}
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center border-[3px] border-[#111] bg-[#ffd93b] text-2xl font-black leading-none shadow-[3px_3px_0_#111] sm:h-[62px] sm:w-[62px] sm:text-4xl">
            AI
          </span>
          <span className="leading-none">
            <span className="block text-lg font-black tracking-tight sm:text-2xl">AI INTERVIEW</span>
            <span className="mt-1 block text-[0.6rem] font-extrabold uppercase tracking-wide sm:text-xs">
              Practice. Improve. Succeed.
            </span>
          </span>
        </div>

        <span aria-hidden="true" className="hidden h-12 w-0.5 bg-[#111] md:block" />

        {/* interview title */}
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center border-2 border-[#111] bg-[#8f6cf5] text-[#111] sm:h-14 sm:w-14">
            <CodeSlashIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </span>
          <p className="text-sm font-semibold leading-tight sm:text-lg">{interviewTitle}</p>
        </div>

        {showStatus && (
          <p className="ml-2 flex items-center gap-2 text-base font-bold sm:text-xl" aria-live="polite">
            <span aria-hidden="true" className={`h-3.5 w-3.5 rounded-full sm:h-4 sm:w-4 ${state.dot}`} />
            {state.label}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {showDuration && (
          <div
            role="timer"
            aria-label={`Interview duration ${durationLabel}`}
            className="flex items-center gap-3 border-[3px] border-[#111] bg-[#8f6cf5] px-3 py-1.5 text-[#111] shadow-[4px_4px_0_#111]"
          >
            <Timer aria-hidden="true" className="h-7 w-7 shrink-0 stroke-[2.2] sm:h-8 sm:w-8" />
            <span className="leading-none">
              <span className="block text-lg font-extrabold tabular-nums sm:text-[1.4rem]">{durationLabel}</span>
              <span className="mt-1 block text-[0.6rem] font-bold sm:text-[0.65rem]">Interview Duration</span>
            </span>
          </div>
        )}

        {/* user */}
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#111] bg-[#b290ff] sm:h-12 sm:w-12">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={`${profileName} avatar`} className="h-full w-full object-cover" />
            ) : (
              <UserRound aria-hidden="true" className="h-6 w-6" />
            )}
          </span>
          <span className="hidden text-sm font-bold sm:block">{profileName}</span>
          <svg viewBox="0 0 12 8" aria-hidden="true" className="hidden h-2 w-3 sm:block">
            <path d="M0 0h12L6 8z" fill="#111" />
          </svg>
        </div>
      </div>
    </header>
  )
}

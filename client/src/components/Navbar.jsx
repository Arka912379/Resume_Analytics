import { Bell, ChevronDown, UserRound } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'

const nameSizeClasses = {
  small: 'text-[clamp(1.4rem,2.2vw,1.8rem)]',
  medium: 'text-[clamp(1.6rem,2.8vw,2.4rem)]',
  large: 'text-[clamp(2rem,3.6vw,3.4rem)]',
}

const Navbar = ({
  greeting = 'WELCOME BACK,',
  subtitle = 'Track your progress and get interview ready.',
  nameSize = 'large',
}) => {
  const { user } = useAuth()
  const displayName = (user?.displayName || 'NILAYESH').toUpperCase()
  const profileName = user?.displayName || 'Nilayesh Adhikari'
  const selectedNameSize = nameSizeClasses[nameSize] || nameSizeClasses.large

  return (
    <div className='fixed top-0 w-[80%] h-28 text-black right-0 flex justify-between items-start'>
      <div className="heading flex mt-8 h-full min-w-0 flex-1 items-center pl-2 max-[720px]:pl-3">
        <div className="flex min-w-0 flex-col items-start gap-1">
          <p className="text-[clamp(1.15rem,2vw,1.7rem)] font-black uppercase leading-none tracking-tight">
            {greeting}
          </p>
          <p className={`w-fit mb-2 border-[3px] border-[#111] bg-[#b290ff] px-3 py-1 ${selectedNameSize} font-black leading-none tracking-tight text-[#111] shadow-[5px_5px_0_#111] max-w-full whitespace-nowrap`}>
            {displayName}!
          </p>
          <p className="text-[clamp(0.8rem,1vw,1rem)] font-medium leading-snug">
            {subtitle}
          </p>
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
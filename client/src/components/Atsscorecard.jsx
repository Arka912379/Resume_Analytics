import { useEffect, useRef, useState } from 'react'

// Reusable ATS Score card (independent of the Dashboard).
//
// Props
//   score      – number 0-100
//   status     – optional label override (defaults to getAtsStatus(score))
//   title      – card heading
//   menuItems  – optional [{ label, onSelect }] shown in the "..." menu (menu hidden if empty)
//   className  – extra classes for the outer card

const RING_RADIUS = 90
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function getAtsStatus(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Work'
}

export default function ATSScoreCard({
  score,
  status,
  title = 'ATS Score',
  menuItems = [],
  className = '',
}) {
  const hasScore = Number.isFinite(score)
  const clamped = hasScore ? Math.min(100, Math.max(0, Math.round(score))) : 0
  const statusLabel = status ?? (hasScore ? getAtsStatus(clamped) : 'No score yet')

  // animate the ring from its previous value to the new one
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(clamped))
    return () => cancelAnimationFrame(frame)
  }, [clamped])

  // "..." menu
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
    }
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <section
      aria-label={title}
      className={`relative flex flex-col gap-6 border-2 border-[#111] bg-[#5fdc98] p-6 shadow-[8px_8px_0_#111] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-7 ${className}`}
    >
      {menuItems.length > 0 && (
        <div ref={menuRef} className="absolute right-4 top-3 z-20">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`${title} options`}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-8 w-12 place-items-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30"
          >
            <svg viewBox="0 0 30 8" className="h-2 w-7" aria-hidden="true">
              <circle cx="4" cy="4" r="4" fill="#111" />
              <circle cx="15" cy="4" r="4" fill="#111" />
              <circle cx="26" cy="4" r="4" fill="#111" />
            </svg>
          </button>
          {menuOpen && (
            <ul
              role="menu"
              className="absolute right-0 top-9 w-44 border-2 border-[#111] bg-white shadow-[4px_4px_0_#111]"
            >
              {menuItems.map(({ label, onSelect }) => (
                <li key={label} role="none" className="border-b-2 border-[#111] last:border-b-0">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false)
                      onSelect?.()
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm font-extrabold hover:bg-[#ffe74a] focus-visible:bg-[#ffe74a] focus-visible:outline-none"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* left: title, big number, status pill */}
      <div className="min-w-0">
        <h2 className="text-3xl font-black uppercase leading-none tracking-tight sm:text-[34px]">
          {title}
        </h2>
        <p className="mt-4 flex items-end font-black leading-none tracking-tight">
          <span className="text-7xl sm:text-[88px]">{hasScore ? clamped : '--'}</span>
          {hasScore && <span className="mb-2 text-4xl sm:mb-3 sm:text-[44px]">%</span>}
        </p>
        <p className="mt-3 inline-block rounded-full bg-[#b290ff] px-8 py-2 text-2xl font-black uppercase leading-none sm:text-[30px]">
          {statusLabel}
        </p>
      </div>

      {/* right: circular progress */}
      <div className="relative mx-auto h-44 w-44 shrink-0 sm:mx-0 sm:mr-4 sm:h-[220px] sm:w-[220px]">
        <svg
          viewBox="0 0 220 220"
          className="h-full w-full"
          role="img"
          aria-label={hasScore ? `${title}: ${clamped} percent, ${statusLabel}` : `${title}: not available`}
        >
          <circle cx="110" cy="110" r={RING_RADIUS} fill="none" stroke="#f6f6f6" strokeWidth="20" />
          {/* starts at 12 o'clock and fills counter-clockwise, like the reference */}
          <g transform="translate(110 110) scale(-1 1) rotate(-90)">
            <circle
              r={RING_RADIUS}
              fill="none"
              stroke="#7c5cff"
              strokeWidth="20"
              strokeDasharray={`${(RING_CIRCUMFERENCE * shown) / 100} ${RING_CIRCUMFERENCE}`}
              className="transition-[stroke-dasharray] duration-[900ms] ease-out motion-reduce:transition-none"
            />
          </g>
        </svg>
        <p
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-black leading-none tracking-tight"
        >
          <span className="text-5xl sm:text-[56px]">{hasScore ? clamped : '--'}</span>
          {hasScore && <span className="mt-2 text-2xl sm:text-[28px]">%</span>}
        </p>
      </div>
    </section>
  )
}
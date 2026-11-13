import { useMemo, useRef, useState } from 'react'

// Data-driven mini line chart.
//   points: [{ label: string, value: number }]  (oldest first)
// The line is computed ONLY from `points`: the highest value is drawn at the top,
// the lowest at the bottom, so rising data trends upward and falling data downward.
// Fewer than 2 valid points -> an honest empty state (nothing is invented).

const WIDTH = 120
const HEIGHT = 48
const PAD_X = 4
const PAD_Y = 8

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

// Smooth monotone cubic path (never overshoots the data, so peaks stay real).
function monotonePath(pts) {
  const n = pts.length
  const dx = []
  const slope = []
  for (let i = 0; i < n - 1; i += 1) {
    dx[i] = pts[i + 1].x - pts[i].x
    slope[i] = (pts[i + 1].y - pts[i].y) / dx[i]
  }

  const tangent = new Array(n)
  tangent[0] = slope[0]
  tangent[n - 1] = slope[n - 2]
  for (let i = 1; i < n - 1; i += 1) {
    tangent[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2
  }
  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) {
      tangent[i] = 0
      tangent[i + 1] = 0
      continue
    }
    const a = tangent[i] / slope[i]
    const b = tangent[i + 1] / slope[i]
    const s = a * a + b * b
    if (s > 9) {
      const tau = 3 / Math.sqrt(s)
      tangent[i] = tau * a * slope[i]
      tangent[i + 1] = tau * b * slope[i]
    }
  }

  let d = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`
  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i] / 3
    d += ` C${(pts[i].x + h).toFixed(2)},${(pts[i].y + tangent[i] * h).toFixed(2)}`
    d += ` ${(pts[i + 1].x - h).toFixed(2)},${(pts[i + 1].y - tangent[i + 1] * h).toFixed(2)}`
    d += ` ${pts[i + 1].x.toFixed(2)},${pts[i + 1].y.toFixed(2)}`
  }
  return d
}

export default function Sparkline({
  points = [],
  color = '#7c5cff',
  formatTooltip = (value) => String(value),
  label = 'Trend',
  className = '',
}) {
  const wrapRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(null)

  const chart = useMemo(() => {
    const items = points.filter((p) => p && Number.isFinite(p.value))
    if (items.length < 2) return null

    const values = items.map((p) => p.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min

    const coords = items.map((p, i) => ({
      x: PAD_X + (i / (items.length - 1)) * (WIDTH - PAD_X * 2),
      // flat data -> flat line in the middle; otherwise scaled between min and max
      y: range === 0 ? HEIGHT / 2 : PAD_Y + (1 - (p.value - min) / range) * (HEIGHT - PAD_Y * 2),
    }))

    return { items, coords, path: monotonePath(coords) }
  }, [points])

  /* ---------- empty state: no history, no invented trend ---------- */
  if (!chart) {
    return (
      <div
        role="img"
        aria-label={`${label}: no history yet`}
        title="No history yet"
        className={`relative h-12 w-[7.5rem] shrink-0 ${className}`}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="h-full w-full">
          <line
            x1={PAD_X}
            y1={HEIGHT / 2}
            x2={WIDTH - PAD_X}
            y2={HEIGHT / 2}
            stroke="#111"
            strokeOpacity="0.3"
            strokeWidth="2"
            strokeDasharray="4 5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="absolute inset-x-0 top-1/2 mt-1.5 text-center text-[10px] font-bold uppercase leading-none text-[#111]/50">
          No data yet
        </span>
      </div>
    )
  }

  const lastIndex = chart.coords.length - 1
  const safeIndex = activeIndex === null ? null : Math.min(activeIndex, lastIndex)
  const activePoint = safeIndex === null ? null : chart.items[safeIndex]
  const activeCoord = safeIndex === null ? null : chart.coords[safeIndex]

  const handlePointer = (event) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect || !rect.width) return
    const x = ((event.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    chart.coords.forEach((c, i) => {
      if (Math.abs(c.x - x) < Math.abs(chart.coords[nearest].x - x)) nearest = i
    })
    setActiveIndex(nearest)
  }

  const handleKeyDown = (event) => {
    const current = safeIndex ?? lastIndex
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setActiveIndex(Math.max(0, current - 1))
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      setActiveIndex(Math.min(lastIndex, current + 1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(lastIndex)
    } else if (event.key === 'Escape') {
      setActiveIndex(null)
    }
  }

  const first = chart.items[0]
  const last = chart.items[lastIndex]
  const summary = `${label}: ${formatTooltip(first.value)} on ${first.label} to ${formatTooltip(last.value)} on ${last.label}. Use arrow keys to inspect points.`

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role="group"
      aria-label={summary}
      onPointerMove={handlePointer}
      onPointerDown={handlePointer}
      onPointerLeave={() => setActiveIndex(null)}
      onKeyDown={handleKeyDown}
      onFocus={() => setActiveIndex((i) => i ?? lastIndex)}
      onBlur={() => setActiveIndex(null)}
      className={`relative h-12 w-[7.5rem] shrink-0 cursor-crosshair touch-pan-y focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111] ${className}`}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <path
          d={chart.path}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {activePoint && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#111]"
            style={{
              left: `${(activeCoord.x / WIDTH) * 100}%`,
              top: `${(activeCoord.y / HEIGHT) * 100}%`,
              backgroundColor: color,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full z-30 mb-2 -translate-x-1/2 whitespace-nowrap border-2 border-[#111] bg-white px-2 py-1 text-center shadow-[3px_3px_0_#111]"
            style={{ left: `${clamp((activeCoord.x / WIDTH) * 100, 22, 78)}%` }}
          >
            <p className="text-[10px] font-bold uppercase leading-none text-[#111]/60">
              {activePoint.label}
            </p>
            <p className="mt-0.5 text-sm font-black leading-none text-[#111]">
              {formatTooltip(activePoint.value)}
            </p>
          </div>
        </>
      )}

      <span className="sr-only" aria-live="polite">
        {activePoint ? `${activePoint.label}: ${formatTooltip(activePoint.value)}` : ''}
      </span>
    </div>
  )
}
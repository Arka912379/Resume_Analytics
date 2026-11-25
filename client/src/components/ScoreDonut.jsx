// ===========================================================================
// ScoreDonut - the ring used by the Overall Score and Skill Breakdown boxes,
// plus the helpers that pick its colour / wording from a score.
//
//   direction "cw"  : arc starts at 12 o'clock and runs clockwise (skill rings)
//   direction "ccw" : arc runs the other way and ends at 12 o'clock (overall ring)
//   children        : text drawn in the middle of the ring
// ===========================================================================
const R = 40
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function getScoreTone(score) {
  if (score >= 80) return { label: 'Excellent', color: '#59e6ad', pill: '#c9f6e2' }
  if (score >= 65) return { label: 'Good', color: '#fed824', pill: '#fdf1b9' }
  if (score >= 50) return { label: 'Average', color: '#936efc', pill: '#e6defd' }
  return { label: 'Needs Improvement', color: '#fc687f', pill: '#ffd9df' }
}

export function getOverallLabel(score) {
  if (score >= 80) return 'Excellent work'
  if (score >= 65) return 'Good progress'
  return 'Room for improvement'
}

export default function ScoreDonut({
  score,
  color,
  stroke = 12,
  direction = 'cw',
  track = '#e9e9e9',
  className = '',
  children,
}) {
  const value = clamp(Number(score) || 0, 0, 100)
  const circumference = 2 * Math.PI * R
  const rotation = direction === 'ccw' ? -90 + (1 - value / 100) * 360 : -90

  return (
    <div className={`relative aspect-square ${className}`} role="img" aria-label={`${value} out of 100`}>
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <circle cx="50" cy="50" r={R} fill="none" stroke={track} strokeWidth={stroke} />
        {value > 0 && (
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${(circumference * value) / 100} ${circumference}`}
            transform={`rotate(${rotation} 50 50)`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
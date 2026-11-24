// Decorative corner stairs and dot grids from the reference screenshot.
// Pure decoration: hidden on small screens, never blocks clicks.

// Stair triangle that starts as "top-left" and is flipped for the other corners.
function Stairs({ width, height, steps, color, flipX = false, flipY = false, className = '' }) {
  const stepW = width / steps
  const stepH = height / steps
  let d = `M0 0 H${width}`
  for (let i = 1; i <= steps; i += 1) d += ` V${i * stepH} H${width - i * stepW}`
  d += ' Z'

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width + 8} ${height + 8}`}
      width={width + 8}
      height={height + 8}
      className={`pointer-events-none absolute hidden xl:block ${className}`}
      style={{ transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }}
    >
      <path d={d} transform="translate(8 8)" fill="#111" />
      <path d={d} fill={color} />
    </svg>
  )
}

const dots =
  'pointer-events-none absolute hidden bg-[radial-gradient(circle,#111_1.8px,transparent_2.2px)] xl:block'

export default function InterviewDecorations() {
  return (
    <>
      <Stairs width={125} height={125} steps={4} color="#8f6cf5" className="left-0 top-0" />
      <Stairs width={77} height={180} steps={4} color="#ffd93b" flipX flipY className="right-0 top-0" />
      <Stairs width={90} height={300} steps={4} color="#ffd93b" flipY className="bottom-0 left-0" />
      <Stairs width={175} height={228} steps={5} color="#8f6cf5" flipX flipY className="bottom-0 right-0" />

      <div aria-hidden="true" className={`${dots} left-[15px] top-[275px] h-[105px] w-[55px] [background-size:25px_25px]`} />
      <div aria-hidden="true" className={`${dots} right-[10px] top-[562px] h-[85px] w-[52px] [background-size:24px_24px]`} />
      <div aria-hidden="true" className={`${dots} right-[52px] top-[20px] h-[50px] w-[50px] [background-size:24px_24px]`} />
    </>
  )
}
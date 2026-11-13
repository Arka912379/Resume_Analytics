import Sparkline from './Sparkline.jsx'

// One statistics card: icon box + label + big value + live sparkline.
//   value   – number shown big. Falls back to the latest history point if omitted.
//   points  – [{ label, value }] history that drives the sparkline.
export default function StatCard({
  label,
  value,
  icon: Icon,
  iconBg = 'bg-[#8f72f7]',
  color = '#7c5cff',
  points = [],
  formatValue = (v) => String(v),
  formatTooltip,
  className = '',
}) {
  const latest = points.length ? points[points.length - 1]?.value : undefined
  const current = value ?? latest
  const display = Number.isFinite(current) ? formatValue(current) : '--'

  return (
    <article
      className={`relative flex min-h-[100px] items-center gap-4 border-2 border-[#111] bg-white p-3 shadow-[8px_8px_0_#111] ${className}`}
    >
      <div
        className={`grid h-[76px] w-[76px] shrink-0 place-items-center border-2 border-[#111] text-[#111] ${iconBg}`}
      >
        <Icon aria-hidden="true" className="h-9 w-9 stroke-[2]" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-extrabold uppercase leading-none tracking-tight sm:text-base">
          {label}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-4xl font-black leading-none tracking-tight sm:text-[42px]">{display}</p>
          <Sparkline
            points={points}
            color={color}
            label={label}
            formatTooltip={formatTooltip || formatValue}
          />
        </div>
      </div>
    </article>
  )
}
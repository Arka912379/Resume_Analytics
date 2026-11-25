// Purely decorative shapes in the right margin (desktop only): purple staircase,
// yellow circle and a dot grid. Put it inside the page's `relative` wrapper.
export default function ResultsDecorations() {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 72 136"
        className="pointer-events-none absolute right-0 top-[92px] hidden h-[136px] w-[72px] xl:block"
      >
        <polygon
          points="0,-4 80,-4 80,134 50,134 50,94 26,94 26,58 0,58"
          fill="#b290ff"
          stroke="#111"
          strokeWidth="4"
        />
      </svg>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[22px] top-[222px] hidden h-[50px] w-[50px] rounded-full border-[3px] border-[#111] bg-[#fed824] shadow-[3px_3px_0_#111] xl:block"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[8px] top-[655px] hidden h-[108px] w-[78px] bg-[radial-gradient(circle,#111_2px,transparent_2.6px)] [background-size:19px_19px] xl:block"
      />
    </>
  )
}
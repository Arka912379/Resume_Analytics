import { FileText } from 'lucide-react'

export default function ScoreCard({ analysis = {} }) {
  const score = Number(analysis.matchScore) || 0

  return (
    <section className="grid max-h-[8rem] mt-[2rem] overflow-hidden border-[2px] border-black bg-white shadow-[7px_7px_0_#111] md:grid-cols-[minmax(100px,16%)_1fr] max-md:max-h-none max-md:grid-cols-1">
      <div className="grid place-items-center bg-[#ddd6ff] p-3">
        <div className="relative grid h-[clamp(95px,11vh,128px)] w-[clamp(95px,11vh,128px)] place-items-center rounded-full" style={{ background: `conic-gradient(#bdbec6 0deg ${(100 - score) * 3.6}deg, #7650ea ${(100 - score) * 3.6}deg 360deg)` }}>
          <div className="grid h-[74%] w-[74%] text-[1.4rem] font-extrabold place-items-center rounded-full bg-[#ddd6ff] font-bold">{score}%</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5 px-5 py-3 max-md:min-w-0 max-md:flex-col max-md:items-stretch max-md:gap-4 max-md:p-4">
        <div className="border-r border-black/40 pr-8 max-md:min-w-0 max-md:border-r-0 max-md:pr-0">
          <div className="mt-2 text-[2rem] font-boldmb-2 w-fit max-w-full border-[3px] border-[#111] bg-[#b290ff] px-3 py-1 text-[clamp(1.4rem,2.2vw,1.8rem)] tracking-tight font-black leading-none text-[#111]"> {analysis.company}</div>
          <div className="mt-2 text-[1.15rem] font-bold">{analysis.title ? ` · ${analysis.title}` : ''}</div>
        </div>
        <div className="flex min-w-[250px] flex-1 items-center gap-4 max-md:min-w-0 max-md:items-start">
          <div className="grid h-14 w-14 shrink-0 place-items-center bg-[#d8d0ff]"><FileText size={30} /></div>
          <p className="min-w-0 text-sm leading-relaxed text-[#303030]">{analysis.summary || 'Your analysis summary will appear here.'}</p>
        </div>
      </div>
    </section>
  )
}

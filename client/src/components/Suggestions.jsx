import { Lightbulb } from 'lucide-react'

export default function Suggestions({ suggestions = [] }) {
  return (
    <section className="overflow-hidden border-[2px] border-black bg-[#fffef0] shadow-[7px_7px_0_#111] max-lg:flex max-lg:min-h-[15.8rem] max-lg:flex-col">
      <div className="flex items-center justify-between border-b-[2px] border-black bg-[#ffe889] px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 rounded-full place-items-center bg-[#ffe03f]"><Lightbulb size={23} /></div>
          <h2 className="text-xl font-black">Suggestions</h2>
        </div>
        <span className="bg-[#fff1ad] px-3 py-1 text-sm font-black">{suggestions.length}</span>
      </div>
      <div className="max-h-[12rem] overflow-y-auto px-5 max-lg:min-h-0 max-lg:flex-1">
        {suggestions.map((item, index) => (
          <div key={item._id || item.title || index} className="flex items-center gap-4 border-b border-black/20 py-1.5 last:border-0 max-lg:items-start max-lg:gap-3 max-lg:py-2">
            <span className="text-[#e7c100]">•</span>
            <div className="contents max-lg:block max-lg:min-w-0 max-lg:flex-1">
              <h3 className="w-[220px] shrink-0 font-black max-lg:w-auto">{item.title}</h3>
              <p className="flex-1 text-sm text-[#353535] max-lg:mt-1 max-lg:leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
        {!suggestions.length && <p className="py-4 text-sm">No suggestions provided.</p>}
      </div>
    </section>
  )
}

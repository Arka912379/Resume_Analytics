import { AlertCircle } from 'lucide-react'

export default function AreasToImprove({ items = [] }) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden border-[2px] border-black bg-[#fff3f4] shadow-[7px_7px_0_#111] max-lg:min-h-[15.8rem]">
      <div className="flex shrink-0 items-center justify-between border-b-[2px] border-black bg-[#ffb6c0] px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="grid h-10 w-10 rounded-full place-items-center bg-[#f23d56] text-white"><AlertCircle size={24} strokeWidth={3} /></div>
          <h2 className="text-xl font-black">Areas to Improve</h2>
        </div>
        <span className="bg-[#ffcdd4] px-3 py-1 text-sm font-black">{items.length}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        {items.map((item, index) => (
          <div key={item._id || item.title || index} className="flex gap-3 border-b border-black/20 py-1.5 last:border-0">
            <span className="mt-1 text-[#f23d56]">•</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-black">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#353535]">{item.description}</p>
            </div>
          </div>
        ))}
        {!items.length && <p className="py-4 text-sm">No improvement areas provided.</p>}
      </div>
    </section>
  )
}

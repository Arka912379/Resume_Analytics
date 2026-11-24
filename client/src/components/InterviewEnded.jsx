import { CheckCircle2 } from 'lucide-react'

// Shown for a few seconds after the interview ends. Props: duration ('18:42')
export default function InterviewEnded({ duration }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-2rem)] w-full flex-1 place-items-center md:min-h-0">
      <section className="w-full max-w-3xl border-[3px] border-black bg-white p-8 text-center shadow-[8px_8px_0_#111] sm:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center border-2 border-black bg-[#ffd93b]"><CheckCircle2 aria-hidden="true" className="h-9 w-9" /></div>
        <h1 className="mt-5 text-3xl font-black sm:text-4xl">Interview Ended</h1>
        <p className="mt-3 text-base font-medium sm:text-lg">Your interview session has ended. Duration: {duration}.</p>
      </section>
    </div>
  )
}
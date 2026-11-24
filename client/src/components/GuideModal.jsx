import {
  ArrowRight, Ban, Bot, ClipboardCheck, Headphones, House, Laptop, MessageSquare,
  ShieldCheck, Smartphone, Timer, UserRound, Video, Wifi, X,
} from 'lucide-react'
import BrutalistButton from './BrutalistButton.jsx'

const interviewGuidelines = [
  { Icon: Bot, title: 'No AI or any cheat.', description: 'Do not use AI tools (e.g., ChatGPT, Gemini), search engines, or any external help.' },
  { Icon: House, title: 'Isolate yourself for the interview.', description: 'Sit in a quiet, private space without any distractions or other people.' },
  { Icon: Timer, title: 'Try to complete within the time limit.', description: 'Manage your time well and answer all questions within the allotted duration.' },
  { Icon: Video, title: 'Keep your camera and mic on throughout.', description: 'Ensure a stable camera view and clear audio for the entire interview.' },
  { Icon: Wifi, title: 'Use a stable internet connection.', description: 'A reliable and uninterrupted network helps avoid any technical issues.' },
  { Icon: UserRound, title: 'Maintain a professional setup and appearance.', description: 'Sit properly, keep your face visible, and use neutral lighting.' },
  { Icon: MessageSquare, title: 'Be honest and original in your answers.', description: 'Share your own knowledge, experience, and approach.' },
  { Icon: Smartphone, title: 'Avoid using your phone or any secondary device.', description: 'Do not browse, message, or look up answers during the interview.', prohibited: true },
  { Icon: Headphones, title: 'Listen carefully and answer clearly.', description: 'Understand the question fully, think for a moment, and give a concise, structured response.' },
  { Icon: ShieldCheck, title: 'Follow the code of conduct.', description: 'Be respectful, maintain professionalism, and avoid any form of misconduct.' },
]

const guideItems = [
  { Icon: Video, title: 'Allow Required Permissions', body: 'Grant access to your camera and microphone.' },
  { Icon: Wifi, title: 'Ensure a Stable Internet Connection', body: 'Use a reliable and uninterrupted network.' },
  { Icon: Headphones, title: 'Use a Quiet & Distraction-Free Space', body: 'Avoid background noise and interruptions.' },
  { Icon: Laptop, title: 'Keep Your Device Ready', body: 'Use a working camera, mic, and a charged device (or plug in).' },
]

// Props: guideMode ('quick' | 'guidelines'), closeRef (focus target used by the page's
// keyboard handling), onClose, onAcknowledge (the "I Understand & Continue" action)
export default function GuideModal({ guideMode, closeRef, onClose, onAcknowledge }) {
  const isGuidelinesModal = guideMode === 'guidelines'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) event.preventDefault() }}>
      <div role="dialog" aria-modal="true" aria-labelledby="guide-title" aria-describedby="guide-subtitle" className={`relative my-auto w-full overflow-y-auto border-black bg-[#fffeFB] ${isGuidelinesModal ? 'flex min-h-[min(90dvh,calc(100dvh-24px))] max-h-[calc(100dvh-24px)] max-w-[min(94vw,52rem)] flex-col border-[3px] p-3 shadow-[8px_8px_0_#111] sm:p-5' : 'max-h-[calc(100dvh-2rem)] max-w-3xl border-[4px] p-4 shadow-[10px_10px_0_#111] sm:p-6'}`}>
        <div aria-hidden="true" className={`absolute left-0 top-0 border-[#b290ff] ${isGuidelinesModal ? 'h-8 w-8 border-b-[8px] border-r-[8px]' : 'h-10 w-10 border-b-[10px] border-r-[10px]'}`} />
        <div aria-hidden="true" className="absolute bottom-0 right-0 flex items-end gap-1"><i className={`${isGuidelinesModal ? 'h-4 w-2' : 'h-5 w-3'} bg-[#ffd93b]`}/><i className={`${isGuidelinesModal ? 'h-6 w-2' : 'h-8 w-3'} bg-[#ffd93b]`}/><i className={`${isGuidelinesModal ? 'h-9 w-2' : 'h-11 w-3'} bg-[#ffd93b]`}/></div>
        <button ref={closeRef} type="button" aria-label="Close setup guide" onClick={onClose} className={`absolute z-10 grid place-items-center border-2 border-black bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30 ${isGuidelinesModal ? 'right-2.5 top-2.5 h-8 w-8' : 'right-3 top-3 h-9 w-9'}`}><X aria-hidden="true" className={isGuidelinesModal ? 'h-4 w-4' : ''} /></button>
        <div className="flex flex-col items-center text-center">
          <div className={`grid place-items-center border-[3px] border-black bg-[#b290ff] ${isGuidelinesModal ? 'mb-1.5 h-10 w-10 shadow-[2px_2px_0_#111]' : 'mb-2 h-12 w-12 shadow-[3px_3px_0_#111]'}`}><ClipboardCheck aria-hidden="true" className={isGuidelinesModal ? 'h-6 w-6' : 'h-7 w-7'} /></div>
          <h2 id="guide-title" className={`border-2 border-black bg-[#b290ff] font-black tracking-tight ${isGuidelinesModal ? 'px-2.5 py-0.5 text-lg shadow-[2px_2px_0_#111] sm:text-xl' : 'px-3 py-1 text-xl shadow-[3px_3px_0_#111] sm:text-2xl'}`}>{guideMode === 'guidelines' ? 'Interview Guidelines' : 'QUICK SETUP GUIDE'}</h2>
          <p id="guide-subtitle" className={`${isGuidelinesModal ? 'mt-1.5 text-[0.82rem]' : 'mt-2 text-sm'} max-w-lg font-medium`}>{guideMode === 'guidelines' ? 'Please read and follow these rules before starting the interview.' : 'Before you begin, check these key points for a smooth interview.'}</p>
        </div>
        {guideMode === 'guidelines' ? (
          <ol className="my-3 flex flex-1 flex-col border-2 border-black bg-[#eee7ff] px-2.5 sm:px-3">
            {interviewGuidelines.map(({ Icon, title, description, prohibited }, index) => (
              <li key={title} className={`flex flex-1 items-center gap-2.5 py-1 text-left ${index < interviewGuidelines.length - 1 ? 'border-b border-black/35' : ''}`}>
                <span className={`relative grid h-9 w-9 shrink-0 place-items-center border-2 border-black ${index % 2 === 0 ? 'bg-[#d6c4ff]' : 'bg-[#ffe895]'}`}>
                  <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                  {prohibited && <Ban aria-hidden="true" className="absolute inset-0 h-full w-full text-[#a52535]" strokeWidth={2.5} />}
                </span>
                <span className="mr-2 hidden h-6 w-px shrink-0 bg-black/40 sm:block" />
                <span><strong className="block text-[0.78rem] font-black leading-tight sm:mr-2 sm:inline sm:text-[0.82rem]">{title}</strong><span className="mt-0.5 block text-[0.7rem] leading-snug sm:mt-0 sm:inline sm:text-[0.72rem]">{description}</span></span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="my-4 border-[3px] border-black bg-white p-4 sm:p-5">
            <ul className="space-y-4">{guideItems.map(({ Icon, title, body }) => <li key={title} className="flex items-start gap-3 text-left"><span className="grid h-10 w-10 shrink-0 place-items-center border-2 border-black bg-[#eee7ff]"><Icon aria-hidden="true" size={21} /></span><span><strong className="block text-sm font-black">{title}</strong><span className="mt-0.5 block text-sm leading-snug">{body}</span></span></li>)}</ul>
          </div>
        )}
        <BrutalistButton onClick={guideMode === 'guidelines' ? onAcknowledge : onClose} icon={<ArrowRight aria-hidden="true" size={isGuidelinesModal ? 16 : 19} />} className={`relative z-10 !mx-auto ${isGuidelinesModal ? '!min-h-10 !max-w-sm !border-2 !px-4 !text-[0.8rem] !shadow-[3px_3px_0_#111]' : '!max-w-md'}`}>
          {guideMode === 'guidelines' ? 'I Understand & Continue' : 'Got It, Set Up Permissions'}
        </BrutalistButton>
      </div>
    </div>
  )
}

import {
  ArrowRight, CheckCircle2, ChevronDown, ChevronUp, LoaderCircle, Mic, Monitor,
  ShieldAlert, Video, Volume2, Wifi,
} from 'lucide-react'
import BrutalistButton from './BrutalistButton.jsx'
import Navbar from './Navbar.jsx'

// The five device checks (the page uses this list for its progress count).
export const steps = [
  { id: 'microphone', title: 'Microphone Access', description: 'Allow access to your microphone so we can hear your responses.', action: 'Allow Mic Access', Icon: Mic },
  { id: 'camera', title: 'Camera Access', description: 'Allow access to your camera for the interview session.', action: 'Allow Camera Access', Icon: Video },
  { id: 'speaker', title: 'Speaker Check', description: 'Ensure your speakers are working so you can hear the interview.', action: 'Check Speaker', Icon: Volume2 },
  { id: 'network', title: 'Network Speed', description: 'Check your internet connection for a stable interview experience.', action: 'Test Network', Icon: Wifi },
  { id: 'screenShare', title: 'Screen Share', description: 'Share your screen during the interview (e.g., for coding or tasks).', action: 'Share Screen', Icon: Monitor },
]

// Props come from InterviewPage (state + handlers live there).
export default function SetupSteps({
  completed,
  checks,
  expanded,
  onToggleExpand,
  running,
  runAction,
  speakerPrompt,
  micTestActive,
  micLevel,
  onToggleMicTest,
  onSpeakerConfirm,
  onSpeakerRetry,
  onContinue,
}) {
  return (
    <>
      <Navbar
        variant="page"
        eyebrow="Pre-interview setup"
        title="Set Up Permissions for Your AI Interview"
        subtitle="To ensure a smooth and fair interview experience, please complete the following setup."
        rightContent={(
          <div className="border-2 border-black bg-white p-2.5 shadow-[3px_3px_0_#111]">
            <div className="mb-2 flex items-center justify-between text-xs font-black"><span>Setup Progress</span><span aria-live="polite">{completed}/5</span></div>
            <div role="progressbar" aria-label="Setup progress" aria-valuemin="0" aria-valuemax="5" aria-valuenow={completed} className="grid grid-cols-5 gap-1">
              {steps.map((step, index) => <span key={step.id} className={`h-2.5 border border-black ${index < completed ? 'bg-[#5fdc98]' : 'bg-[#eee9df]'}`} />)}
            </div>
            <p className="mt-1 text-right text-[0.65rem] font-bold">{Math.round(completed / 5 * 100)}% complete</p>
          </div>
        )}
      />

      <div className="mt-3 space-y-2.5">
        {steps.map(({ id, title, description, action, Icon }, index) => {
          const item = checks[id]
          const isExpanded = expanded === id
          const success = item.status === 'success'
          const error = item.status === 'error' || item.status === 'warning'
          const panelId = `permission-panel-${id}`
          return (
            <article key={id} className={`border-2 border-black p-2.5 shadow-[3px_3px_0_#111] transition-colors sm:p-3 ${success ? 'bg-[#5fdc98]' : error ? 'bg-[#ffe1e4]' : 'bg-[#fffefb]'}`}>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className={`grid h-11 w-11 shrink-0 place-items-center border-2 border-black ${success ? 'bg-white/70' : error ? 'bg-[#ffb6bf]' : 'bg-[#b290ff]'}`}><Icon aria-hidden="true" className="h-5 w-5" strokeWidth={2.5} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-[0.68rem] font-black uppercase tracking-wider">Step {index + 1}</span>{success && <span className="inline-flex items-center gap-1 text-[0.68rem] font-black uppercase"><CheckCircle2 size={14} /> Verified</span>}{item.status === 'checking' && <span className="inline-flex items-center gap-1 text-[0.68rem] font-black"><LoaderCircle className="animate-spin" size={14} /> Checking</span>}</div>
                  <h2 className="mt-0.5 text-base font-black sm:text-lg">{title}</h2><p className="text-[0.8rem] font-medium leading-snug sm:text-[0.84rem]">{description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                  {!success && <button type="button" disabled={Boolean(running)} onClick={runAction[id]} className="min-h-9 border-2 border-black bg-[#b290ff] px-3 py-1.5 text-[0.78rem] font-black shadow-[2px_2px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30 disabled:cursor-wait disabled:opacity-60">{running === id ? 'Checking...' : action}</button>}
                  <button type="button" aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`} aria-expanded={isExpanded} aria-controls={panelId} onClick={() => onToggleExpand(id)} className="grid h-9 w-9 shrink-0 place-items-center border-2 border-black bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30">{isExpanded ? <ChevronUp size={19} aria-hidden="true" /> : <ChevronDown size={19} aria-hidden="true" />}</button>
                </div>
              </div>
              {isExpanded && <div id={panelId} className="mt-4 border-t-2 border-black/40 pt-4" aria-live="polite">
                {item.detail && <p className={`flex items-start gap-2 text-sm font-bold ${error ? 'text-[#8b1423]' : ''}`}>{error ? <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /> : success ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : null}<span>{item.detail}</span></p>}
                {success && id === 'microphone' && <><p className="mt-1 text-sm font-medium">We can now hear your responses during the interview.</p><div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={onToggleMicTest} className="border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30">{micTestActive ? 'Stop Mic Test' : 'Test Mic'}</button>{micTestActive && <div className="flex min-w-36 items-center gap-2" aria-label={`Microphone input level ${micLevel}%`}><span className="text-xs font-bold">Input level</span><span className="h-3 w-24 border border-black bg-white"><span className="block h-full bg-[#5fdc98]" style={{ width: `${micLevel}%` }} /></span></div>}</div></>}
                {success && id === 'camera' && <p className="mt-1 text-sm font-medium">Your camera is available for the interview session. The temporary camera stream has been stopped.</p>}
                {success && id === 'speaker' && <p className="mt-1 text-sm font-medium">You confirmed that the test sound is audible.</p>}
                {success && id === 'network' && <><p className="mt-1 text-sm font-medium">{item.detail}</p><p className="mt-2 text-sm font-bold">{item.info}</p></>}
                {success && id === 'screenShare' && <p className="mt-1 text-sm font-medium">Your browser will ask you again when screen sharing begins in the actual interview.</p>}
                {item.status === 'checking' && id === 'speaker' && speakerPrompt && <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={onSpeakerConfirm} className="border-2 border-black bg-[#5fdc98] px-4 py-2 text-sm font-black shadow-[3px_3px_0_#111]">Yes, I can hear it.</button><button type="button" onClick={onSpeakerRetry} className="border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_#111]">Try Again</button></div>}
                {item.info && !success && <p className="mt-2 text-sm font-medium">{item.info}</p>}
              </div>}
            </article>
          )
        })}
      </div>

      <footer className="mt-4 flex flex-col items-center gap-2 border-t-2 border-black/20 pt-3 text-center">
        <div className="w-full sm:w-auto">
          <BrutalistButton disabled={completed !== 5} onClick={onContinue} className={`!min-h-10 !w-full !border-2 !px-5 !text-[0.82rem] !shadow-[3px_3px_0_#111] sm:!w-auto ${completed !== 5 ? '!cursor-not-allowed !border-[#777] !bg-[#d7d1df] !text-[#555] !shadow-none hover:!translate-x-0 hover:!translate-y-0 hover:!shadow-none' : ''}`} icon={<ArrowRight className="h-4 w-4" />}>Continue to Interview</BrutalistButton>
        </div>
        <p aria-live="polite" className="text-xs font-bold">{completed === 5 ? "All checks completed. You're ready to start your interview." : 'Please complete all 5 steps to continue.'}</p>
      </footer>
    </>
  )
}

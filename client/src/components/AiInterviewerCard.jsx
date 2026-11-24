import VoiceOrb from './VoiceOrb.jsx'

// White card with the AI orb and label, shown in the corner of the camera frame
// while the interview is live. The orb reacts to the user's voice (see VoiceOrb.jsx).
// Props: stream - the live MediaStream with the microphone track
export default function AiInterviewerCard({ stream, className = '' }) {
  return (
    <div
      aria-label="AI Interviewer"
      className={`flex w-[clamp(6.5rem,13vw,13.2rem)] flex-col items-center gap-2 rounded-xl border-2 border-[#2b2b33] bg-[#f5f3ee]/95 px-2 pb-2 pt-3 sm:gap-3 sm:px-3 sm:pb-3 sm:pt-5 ${className}`}
    >
      <VoiceOrb stream={stream} />
      <p className="text-xs font-bold leading-none sm:text-base lg:text-[clamp(0.9rem,1.15vw,1.15rem)]">AI Interviewer</p>
    </div>
  )
}
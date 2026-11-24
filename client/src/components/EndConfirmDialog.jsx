// "End this interview?" confirmation. Props: onKeep, onEnd
export default function EndConfirmDialog({ onKeep, onEnd }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <section role="alertdialog" aria-modal="true" aria-labelledby="end-title" aria-describedby="end-description" className="w-full max-w-md border-[3px] border-black bg-[#fffeFB] p-5 shadow-[7px_7px_0_#111]">
        <h2 id="end-title" className="text-xl font-black">End this interview?</h2>
        <p id="end-description" className="mt-2 text-sm font-medium">Ending the session stops the interview and disconnects your camera and microphone.</p>
        <div className="mt-5 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button type="button" onClick={onKeep} className="min-h-10 border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[2px_2px_0_#111]">Keep Interviewing</button>
          <button type="button" autoFocus onClick={onEnd} className="min-h-10 border-2 border-black bg-[#ff9aa6] px-4 py-2 text-sm font-black shadow-[2px_2px_0_#111]">End Interview</button>
        </div>
      </section>
    </div>
  )
}
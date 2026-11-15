import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  ArrowRight, Ban, Bot, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, ClipboardCheck,
  Headphones, House, Laptop, Lightbulb, LoaderCircle, Maximize, Mic, MessageSquare,
  Monitor, Play, ShieldAlert, ShieldCheck, Smartphone, Timer, UserRound, Video,
  Volume2, Wifi, X,
} from 'lucide-react'
import BrutalistButton from '../components/BrutalistButton.jsx'
import Navbar from '../components/Navbar.jsx'

const steps = [
  { id: 'microphone', title: 'Microphone Access', description: 'Allow access to your microphone so we can hear your responses.', action: 'Allow Mic Access', Icon: Mic },
  { id: 'camera', title: 'Camera Access', description: 'Allow access to your camera for the interview session.', action: 'Allow Camera Access', Icon: Video },
  { id: 'speaker', title: 'Speaker Check', description: 'Ensure your speakers are working so you can hear the interview.', action: 'Check Speaker', Icon: Volume2 },
  { id: 'network', title: 'Network Speed', description: 'Check your internet connection for a stable interview experience.', action: 'Test Network', Icon: Wifi },
  { id: 'screenShare', title: 'Screen Share', description: 'Share your screen during the interview (e.g., for coding or tasks).', action: 'Share Screen', Icon: Monitor },
]

const initialChecks = Object.fromEntries(steps.map(({ id }) => [id, { status: 'pending', detail: '', info: '' }]))

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

function errorMessage(error, kind) {
  if (kind === 'screenShare' && (error?.name === 'AbortError' || error?.name === 'NotAllowedError')) return 'Screen sharing was cancelled. Select a screen or window to complete this check.'
  if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') return 'Permission was denied. Please allow access in your browser settings and try again.'
  if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') return 'No compatible device was detected. Connect a microphone or camera and retry.'
  if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') return 'This device may be in use by another application. Close other applications using it and try again.'
  if (!window.isSecureContext) return 'Device access requires HTTPS. Localhost is supported for development.'
  if (error?.name === 'NotSupportedError' || !navigator.mediaDevices) return 'Your browser does not support this feature. Try an updated version of Chrome, Edge, or another supported browser.'
  return error?.message || 'The check could not be completed. Check your device and browser settings, then retry.'
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function InterviewPage() {
  const { setInterviewLocked } = useOutletContext()
  const [stage, setStage] = useState('setup')
  const [showGuide, setShowGuide] = useState(true)
  const [guideMode, setGuideMode] = useState('quick')
  const [checks, setChecks] = useState(initialChecks)
  const [expanded, setExpanded] = useState(null)
  const [running, setRunning] = useState(null)
  const [speakerPrompt, setSpeakerPrompt] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [micTestActive, setMicTestActive] = useState(false)
  const [previewStream, setPreviewStream] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [sessionError, setSessionError] = useState('')
  const [sessionNotice, setSessionNotice] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [endedAt, setEndedAt] = useState(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false)
  const closeRef = useRef(null)
  const restoreFocus = useRef(null)
  const micAudioRef = useRef(null)
  const levelTimer = useRef(null)
  const videoRef = useRef(null)
  const videoFrameRef = useRef(null)
  const previewStreamRef = useRef(null)
  const sessionStreamRef = useRef(null)
  const startInProgressRef = useRef(false)
  const speakerRequestRef = useRef(false)
  const previewRequestRef = useRef(false)
  const liveStartedAtRef = useRef(null)
  const completed = steps.filter(({ id }) => checks[id].status === 'success').length

  useEffect(() => {
    setInterviewLocked(stage === 'live' || stage === 'ended')
  }, [stage, setInterviewLocked])

  useEffect(() => () => setInterviewLocked(false), [setInterviewLocked])

  const closeGuide = useCallback(() => {
    setShowGuide(false)
    if (guideMode === 'guidelines') setStage('setup')
  }, [guideMode])

  useEffect(() => {
    if (!showGuide) return undefined
    restoreFocus.current = document.activeElement
    closeRef.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') closeGuide()
      if (event.key === 'Tab') {
        const dialog = closeRef.current?.closest('[role="dialog"]')
        const focusable = dialog?.querySelectorAll('button:not([disabled])')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      restoreFocus.current?.focus?.()
    }
  }, [showGuide, closeGuide])

  const setResult = useCallback((id, status, detail = '', info = '') => {
    setChecks((current) => ({ ...current, [id]: { status, detail, info } }))
  }, [])

  const finishCheck = useCallback((id, detail, info = '') => setResult(id, 'success', detail, info), [setResult])

  const openInterviewGuidelines = () => {
    if (completed !== 5) return
    stopMicTest()
    setGuidelinesAccepted(false)
    setGuideMode('guidelines')
    setStage('guidelines')
    setShowGuide(true)
  }

  const beginCameraPreview = async () => {
    if (previewRequestRef.current) return
    previewRequestRef.current = true
    setPreviewLoading(true)
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new DOMException('Camera access requires a supported browser on HTTPS or localhost.', 'NotSupportedError')
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      const videoTrack = stream.getVideoTracks().find((track) => track.readyState === 'live')
      if (!videoTrack) {
        stream.getTracks().forEach((track) => track.stop())
        throw new Error('No active camera was found. Check your camera and try again.')
      }
      previewStreamRef.current?.getTracks().forEach((track) => track.stop())
      previewStreamRef.current = stream
      setPreviewStream(stream)
      setCameraError('')
    } catch (error) {
      setCameraError(errorMessage(error, 'camera'))
    } finally {
      previewRequestRef.current = false
      setPreviewLoading(false)
    }
  }

  const acknowledgeGuidelines = async () => {
    if (completed !== 5) {
      closeGuide()
      setSessionError('Complete all five device checks before continuing.')
      return
    }
    setGuidelinesAccepted(true)
    setShowGuide(false)
    setStage('ready')
    await beginCameraPreview()
  }

  const startInterview = async () => {
    if (startInProgressRef.current || stage !== 'ready') return
    if (previewRequestRef.current) return
    stopMicTest()
    startInProgressRef.current = true
    setSessionError('')
    setSessionNotice('')
    let newlyAcquiredVideo = null
    let microphoneStream = null
    try {
      if (!guidelinesAccepted || completed !== 5) throw new Error('Please complete the setup and acknowledge the interview guidelines before starting.')
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new DOMException('Device access requires a supported browser on HTTPS or localhost.', 'NotSupportedError')
      let cameraTrack = previewStreamRef.current?.getVideoTracks().find((track) => track.readyState === 'live')
      if (!cameraTrack) {
        newlyAcquiredVideo = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        cameraTrack = newlyAcquiredVideo.getVideoTracks().find((track) => track.readyState === 'live')
        if (!cameraTrack) throw new Error('The camera is no longer available. Reconnect it and retry.')
        previewStreamRef.current = newlyAcquiredVideo
        setPreviewStream(newlyAcquiredVideo)
        setCameraError('')
      }
      microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const audioTracks = microphoneStream.getAudioTracks().filter((track) => track.readyState === 'live')
      if (!audioTracks.length) throw new Error('No active microphone was returned. Check your microphone and retry.')
      if (cameraTrack.readyState !== 'live') throw new Error('The camera disconnected during setup. Reconnect it and retry.')
      const sessionStream = new MediaStream([cameraTrack, ...audioTracks])
      sessionStreamRef.current = sessionStream
      previewStreamRef.current = sessionStream
      setPreviewStream(sessionStream)
      setElapsedSeconds(0)
      setStage('live')
    } catch (error) {
      microphoneStream?.getTracks().forEach((track) => track.stop())
      if (newlyAcquiredVideo && !previewStreamRef.current?.getVideoTracks().includes(newlyAcquiredVideo.getVideoTracks()[0])) {
        newlyAcquiredVideo.getTracks().forEach((track) => track.stop())
      }
      setSessionError(errorMessage(error, 'microphone'))
    } finally {
      startInProgressRef.current = false
    }
  }

  const endInterview = () => {
    const sessionStream = sessionStreamRef.current
    sessionStream?.getTracks().forEach((track) => track.stop())
    sessionStreamRef.current = null
    if (previewStreamRef.current && previewStreamRef.current !== sessionStream) {
      previewStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    previewStreamRef.current = null
    liveStartedAtRef.current = null
    setPreviewStream(null)
    setEndedAt(new Date())
    setShowEndConfirm(false)
    setStage('ended')
  }

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return undefined
    videoElement.srcObject = previewStream
    if (previewStream) videoElement.play().catch(() => {})
    return () => {
      videoElement.srcObject = null
    }
  }, [previewStream, stage])

  useEffect(() => {
    if (stage !== 'live') return undefined
    liveStartedAtRef.current = Date.now()
    const timerId = window.setInterval(() => {
      if (liveStartedAtRef.current) setElapsedSeconds(Math.floor((Date.now() - liveStartedAtRef.current) / 1000))
    }, 1000)
    return () => window.clearInterval(timerId)
  }, [stage])

  useEffect(() => {
    if (stage !== 'ended') return undefined
    const resultsTimer = window.setTimeout(() => setStage('results'), 5000)
    return () => window.clearTimeout(resultsTimer)
  }, [stage])

  useEffect(() => {
    if (!previewStream) return undefined
    const onEnded = (event) => {
      if (event.currentTarget.kind === 'video') setCameraError('Your camera disconnected. Reconnect it and retry the preview.')
      if (stage === 'live') setSessionError(`Your ${event.currentTarget.kind === 'video' ? 'camera' : 'microphone'} disconnected. End the session or reconnect your device.`)
    }
    const tracks = previewStream.getTracks()
    tracks.forEach((track) => track.addEventListener('ended', onEnded))
    return () => tracks.forEach((track) => track.removeEventListener('ended', onEnded))
  }, [previewStream, stage])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (!videoFrameRef.current?.requestFullscreen) {
          setSessionError('Fullscreen is not supported by this browser.')
          return
        }
        await videoFrameRef.current.requestFullscreen()
      }
      else await document.exitFullscreen?.()
    } catch {
      setSessionError('Fullscreen is unavailable in this browser or was blocked.')
    }
  }

  const withRequest = async (id, action) => {
    if (running) return
    setRunning(id)
    setResult(id, 'checking')
    try { await action() }
    catch (error) { setResult(id, 'error', errorMessage(error, id)) }
    finally { setRunning(null) }
  }

  const requestMicrophone = () => withRequest('microphone', async () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new DOMException('Unsupported', 'NotSupportedError')
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const valid = stream.getAudioTracks().some((track) => track.readyState === 'live')
    stream.getTracks().forEach((track) => track.stop())
    if (!valid) throw new Error('No active microphone track was returned. Check your microphone and retry.')
    finishCheck('microphone', 'Microphone permission granted.', 'Microphone is ready! We can now hear your responses during the interview.')
  })

  const requestCamera = () => withRequest('camera', async () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new DOMException('Unsupported', 'NotSupportedError')
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    const valid = stream.getVideoTracks().some((track) => track.readyState === 'live')
    stream.getTracks().forEach((track) => track.stop())
    if (!valid) throw new Error('No active camera track was returned. Check your camera and retry.')
    finishCheck('camera', 'Camera permission granted.', 'Camera is ready! Your camera is available for the interview session.')
  })

  const checkSpeaker = () => {
    if (running || speakerRequestRef.current) return
    setExpanded('speaker')
    speakerRequestRef.current = true
    return withRequest('speaker', async () => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) throw new DOMException('Web Audio API is not supported by this browser.', 'NotSupportedError')
      const context = new AudioContextClass()
      try {
        await context.resume()
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.frequency.value = 660
        gain.gain.value = 0.12
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start()
        oscillator.stop(context.currentTime + 0.45)
        await new Promise((resolve) => { oscillator.onended = resolve })
        setSpeakerPrompt(true)
        setResult('speaker', 'checking', 'Did you hear the test sound?')
      } finally { await context.close() }
    }).finally(() => { speakerRequestRef.current = false })
  }

  const testNetwork = () => withRequest('network', async () => {
    if (!navigator.onLine) throw new Error('Your browser is offline. Reconnect to the internet and retry.')
    const info = []
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection?.effectiveType) info.push(`Connection type: ${connection.effectiveType}.`)
    if (typeof connection?.downlink === 'number') info.push(`Browser-estimated downlink: ${connection.downlink} Mbps.`)
    const started = performance.now()
    const response = await fetch(`${window.location.origin}/favicon.ico?setup-check=${Date.now()}`, { method: 'HEAD', cache: 'no-store', signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error(`The application connectivity probe returned ${response.status}. Retry when the service is available.`)
    const elapsed = Math.round(performance.now() - started)
    info.push(`Application server responded in ${elapsed} ms.`)
    if (!connection) info.push('This browser could not provide an accurate speed estimate; the probe confirms connectivity only.')
    // Browser downlink estimates can be stale or overly conservative. A successful
    // application probe on a 4g-class connection should not block interview setup.
    if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
      setResult('network', 'warning', 'Your connection is available but may be slow. Consider changing networks, then retry.', info.join(' '))
      return
    }
    finishCheck('network', 'Network connection is available! This confirms a connection to the application, not guaranteed bandwidth or stability.', info.join(' '))
  })

  const testScreen = () => withRequest('screenShare', async () => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getDisplayMedia) throw new DOMException('Unsupported', 'NotSupportedError')
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'monitor' },
      audio: false,
      monitorTypeSurfaces: 'include',
    })
    const videoTrack = stream.getVideoTracks()[0]
    const selectedSurface = videoTrack?.getSettings?.().displaySurface
    if (selectedSurface !== 'monitor') {
      stream.getTracks().forEach((track) => track.stop())
      setResult('screenShare', 'error', 'Entire screen sharing is required. Please select Entire Screen / Entire Monitor instead of an application window or browser tab.')
      return
    }
    const valid = stream.getVideoTracks().some((track) => track.readyState === 'live')
    stream.getTracks().forEach((track) => track.stop())
    if (!valid) throw new Error('No active screen capture track was returned. Select a screen or window and retry.')
    finishCheck('screenShare', 'Screen sharing is available!', 'Your browser allowed a screen-sharing test. You will be asked again when screen sharing begins in the actual interview.')
  })

  const stopMicTest = () => {
    if (levelTimer.current) window.clearInterval(levelTimer.current)
    levelTimer.current = null
    if (micAudioRef.current) {
      micAudioRef.current.stream.getTracks().forEach((track) => track.stop())
      micAudioRef.current.context.close().catch(() => {})
      micAudioRef.current = null
    }
    setMicLevel(0)
    setMicTestActive(false)
  }

  useEffect(() => () => {
    if (levelTimer.current) window.clearInterval(levelTimer.current)
    micAudioRef.current?.stream.getTracks().forEach((track) => track.stop())
    micAudioRef.current?.context.close().catch(() => {})
    sessionStreamRef.current?.getTracks().forEach((track) => track.stop())
    previewStreamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  const toggleMicTest = async () => {
    if (micAudioRef.current) { stopMicTest(); return }
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new DOMException('Unsupported', 'NotSupportedError')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) { stream.getTracks().forEach((track) => track.stop()); throw new Error('Microphone access works, but this browser does not support a live input meter.') }
      const context = new AudioContextClass()
      await context.resume()
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      context.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      micAudioRef.current = { stream, context }
      setMicTestActive(true)
      levelTimer.current = window.setInterval(() => {
        analyser.getByteTimeDomainData(data)
        const amplitude = Math.max(...data.map((value) => Math.abs(value - 128)))
        setMicLevel(Math.min(100, Math.round((amplitude / 64) * 100)))
      }, 100)
    } catch (error) { setResult('microphone', 'success', `${errorMessage(error, 'microphone')} Microphone access remains verified.`, checks.microphone.info) }
  }

  const handleSubmit = () => setSessionNotice('Response submission is not connected yet. No answer was submitted or evaluated.')

  const runAction = { microphone: requestMicrophone, camera: requestCamera, speaker: checkSpeaker, network: testNetwork, screenShare: testScreen }
  const guideItems = [
    { Icon: Video, title: 'Allow Required Permissions', body: 'Grant access to your camera and microphone.' },
    { Icon: Wifi, title: 'Ensure a Stable Internet Connection', body: 'Use a reliable and uninterrupted network.' },
    { Icon: Headphones, title: 'Use a Quiet & Distraction-Free Space', body: 'Avoid background noise and interruptions.' },
    { Icon: Laptop, title: 'Keep Your Device Ready', body: 'Use a working camera, mic, and a charged device (or plug in).' },
  ]
  const isGuidelinesModal = guideMode === 'guidelines'
  // Manual video sizing: adjust each vw value independently; the viewport-height
  // term keeps the full 16:9 frame and its controls within the available screen.
  const readyVideoFrameSize = 'md:w-[min(72vw,calc((100dvh-18rem)*2.1))]' 
  const liveVideoFrameSize = 'md:w-[min(90vw,calc((100dvh-15rem)*1.7778))]'
  const videoFrameSize = stage === 'live' ? liveVideoFrameSize : readyVideoFrameSize

  return (
    <section className="relative min-h-full bg-[#fffeFB] px-3 pb-4 pt-3 text-[#111] sm:px-4 md:px-5 lg:px-6">
      <div className={showGuide ? 'pointer-events-none select-none blur-[3px]' : ''} aria-hidden={showGuide}>
        {stage === 'setup' && <>
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
                    <button type="button" aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`} aria-expanded={isExpanded} aria-controls={panelId} onClick={() => setExpanded(isExpanded ? null : id)} className="grid h-9 w-9 shrink-0 place-items-center border-2 border-black bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30">{isExpanded ? <ChevronUp size={19} aria-hidden="true" /> : <ChevronDown size={19} aria-hidden="true" />}</button>
                  </div>
                </div>
                {isExpanded && <div id={panelId} className="mt-4 border-t-2 border-black/40 pt-4" aria-live="polite">
                  {item.detail && <p className={`flex items-start gap-2 text-sm font-bold ${error ? 'text-[#8b1423]' : ''}`}>{error ? <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /> : success ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : null}<span>{item.detail}</span></p>}
                  {success && id === 'microphone' && <><p className="mt-1 text-sm font-medium">We can now hear your responses during the interview.</p><div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={toggleMicTest} className="border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30">{micTestActive ? 'Stop Mic Test' : 'Test Mic'}</button>{micTestActive && <div className="flex min-w-36 items-center gap-2" aria-label={`Microphone input level ${micLevel}%`}><span className="text-xs font-bold">Input level</span><span className="h-3 w-24 border border-black bg-white"><span className="block h-full bg-[#5fdc98]" style={{ width: `${micLevel}%` }} /></span></div>}</div></>}
                  {success && id === 'camera' && <p className="mt-1 text-sm font-medium">Your camera is available for the interview session. The temporary camera stream has been stopped.</p>}
                  {success && id === 'speaker' && <p className="mt-1 text-sm font-medium">You confirmed that the test sound is audible.</p>}
                  {success && id === 'network' && <><p className="mt-1 text-sm font-medium">{item.detail}</p><p className="mt-2 text-sm font-bold">{item.info}</p></>}
                  {success && id === 'screenShare' && <p className="mt-1 text-sm font-medium">Your browser will ask you again when screen sharing begins in the actual interview.</p>}
                  {item.status === 'checking' && id === 'speaker' && speakerPrompt && <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={() => { setSpeakerPrompt(false); finishCheck('speaker', 'Speaker is working!', 'You confirmed that the test sound is audible.'); setExpanded(null) }} className="border-2 border-black bg-[#5fdc98] px-4 py-2 text-sm font-black shadow-[3px_3px_0_#111]">Yes, I can hear it.</button><button type="button" onClick={checkSpeaker} className="border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[3px_3px_0_#111]">Try Again</button></div>}
                  {item.info && !success && <p className="mt-2 text-sm font-medium">{item.info}</p>}
                </div>}
              </article>
            )
          })}
        </div>

        <footer className="mt-4 flex flex-col items-center gap-2 border-t-2 border-black/20 pt-3 text-center">
          <div className="w-full sm:w-auto">
            <BrutalistButton disabled={completed !== 5} onClick={openInterviewGuidelines} className={`!min-h-10 !w-full !border-2 !px-5 !text-[0.82rem] !shadow-[3px_3px_0_#111] sm:!w-auto ${completed !== 5 ? '!cursor-not-allowed !border-[#777] !bg-[#d7d1df] !text-[#555] !shadow-none hover:!translate-x-0 hover:!translate-y-0 hover:!shadow-none' : ''}`} icon={<ArrowRight className="h-4 w-4" />}>Continue to Interview</BrutalistButton>
          </div>
          <p aria-live="polite" className="text-xs font-bold">{completed === 5 ? "All checks completed. You're ready to start your interview." : 'Please complete all 5 steps to continue.'}</p>
        </footer>
        </>}

        {stage !== 'setup' && <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 md:h-[calc(100dvh-1.75rem)] md:justify-between md:overflow-hidden">
          {stage !== 'ended' && <Navbar variant="interview" status={stage === 'results' ? 'ended' : stage} elapsedSeconds={elapsedSeconds} interviewTitle="Software Developer Interview" showStatus={stage !== 'results'} showDuration={stage !== 'results'} />}

          {stage === 'ended' ? (
            <div className="mx-auto grid min-h-[calc(100dvh-2rem)] w-full flex-1 place-items-center md:min-h-0">
              <section className="w-full max-w-3xl border-[3px] border-black bg-white p-8 text-center shadow-[8px_8px_0_#111] sm:p-12">
                <div className="mx-auto grid h-16 w-16 place-items-center border-2 border-black bg-[#ffd93b]"><CheckCircle2 aria-hidden="true" className="h-9 w-9" /></div>
                <h1 className="mt-5 text-3xl font-black sm:text-4xl">Interview Ended</h1>
                <p className="mt-3 text-base font-medium sm:text-lg">Your interview session has ended. Duration: {formatDuration(elapsedSeconds)}.</p>
              </section>
            </div>
          ) : stage === 'results' ? (
            <section className="mx-auto w-full max-w-[1400px] flex-1 pb-4 text-[#111]">
              <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-black/20 pb-3">
                <div>
                  <h1 className="inline-block border-[3px] border-black bg-[#b290ff] px-3 py-1 text-2xl font-black uppercase leading-none shadow-[4px_4px_0_#111] sm:text-3xl">Interview Results</h1>
                  <p className="mt-2 text-sm font-medium">Session summary. Performance analysis is not connected yet.</p>
                </div>
                <div className="flex items-center gap-3 border-2 border-black bg-white px-3 py-2 text-xs font-bold shadow-[3px_3px_0_#111]">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays aria-hidden="true" size={16} />{endedAt ? endedAt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date unavailable'}</span>
                  <span aria-hidden="true" className="h-6 w-px bg-black/40" />
                  <span className="inline-flex items-center gap-1.5"><Timer aria-hidden="true" size={16} />{formatDuration(elapsedSeconds)}</span>
                </div>
              </header>

              <div className="grid gap-3 lg:grid-cols-[minmax(190px,0.28fr)_minmax(0,1fr)]">
                <article className="border-[3px] border-black bg-[#eee7ff] p-3 shadow-[4px_4px_0_#111] sm:p-4">
                  <h2 className="text-center text-lg font-black">Overall Score</h2>
                  <div className="mx-auto mt-3 grid h-28 w-28 place-items-center rounded-full border-[10px] border-[#d6d6d6] bg-white sm:h-32 sm:w-32">
                    <div className="text-center"><span className="block text-3xl font-black">—</span><span className="text-xs font-bold">/ 100</span></div>
                  </div>
                  <p className="mt-3 border-2 border-black bg-white px-2 py-1 text-center text-xs font-black">Score not available</p>
                </article>

                <article className="border-[3px] border-black bg-white p-3 shadow-[4px_4px_0_#111] sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-black">Skill Breakdown</h2>
                    <span className="text-[0.68rem] font-bold">Score out of 100</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 divide-y-2 divide-black/20 sm:grid-cols-4 sm:divide-x-2 sm:divide-y-0">
                    {['Technical Knowledge', 'Communication', 'Problem Solving', 'Resume Knowledge'].map((skill) => (
                      <div key={skill} className="flex flex-col items-center justify-center px-2 py-2 text-center">
                        <h3 className="min-h-9 text-xs font-black leading-tight">{skill}</h3>
                        <div className="my-1 grid h-14 w-14 place-items-center rounded-full border-[6px] border-[#dedede] bg-white text-lg font-black">—</div>
                        <span className="border-2 border-black bg-[#eee7ff] px-2 py-0.5 text-[0.62rem] font-black">Not evaluated</span>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <article className="border-[3px] border-black bg-[#dff8ec] p-3 shadow-[4px_4px_0_#111] sm:p-4">
                  <h2 className="flex items-center gap-2 text-base font-black"><CheckCircle2 aria-hidden="true" className="text-[#15945b]" />Strengths</h2>
                  <div className="mt-2 border-t border-black/25 pt-2 text-sm font-medium">No strengths were assessed. An interview evaluation service is not connected.</div>
                </article>
                <article className="border-[3px] border-black bg-[#ffe1e4] p-3 shadow-[4px_4px_0_#111] sm:p-4">
                  <h2 className="flex items-center gap-2 text-base font-black"><ShieldAlert aria-hidden="true" className="text-[#c72132]" />Areas to Review</h2>
                  <div className="mt-2 border-t border-black/25 pt-2 text-sm font-medium">No areas for improvement were assessed. No performance feedback has been generated.</div>
                </article>
              </div>

              <article className="mt-3 border-[3px] border-black bg-[#fff4c2] p-3 shadow-[4px_4px_0_#111] sm:p-4">
                <h2 className="flex items-center gap-2 text-base font-black"><Lightbulb aria-hidden="true" />Recommendations</h2>
                <ul className="mt-2 space-y-1.5 border-t border-black/25 pt-2 text-sm font-medium">
                  <li className="flex gap-2"><span className="font-black text-[#d39b00]">•</span><span>Review your responses and note any topics you would like to practice further.</span></li>
                  <li className="flex gap-2"><span className="font-black text-[#d39b00]">•</span><span>Practice explaining your approach with clear examples and a concise structure.</span></li>
                  <li className="flex gap-2"><span className="font-black text-[#d39b00]">•</span><span>Personalized recommendations will appear here when interview evaluation is connected.</span></li>
                </ul>
              </article>
            </section>
          ) : (
            <>
              <div ref={videoFrameRef} className={`relative mx-auto aspect-video w-full max-w-[1200px] shrink-0 overflow-hidden border-[3px] border-black bg-[#242533] shadow-[5px_5px_0_#111] ${videoFrameSize}`}>
                {previewStream?.getVideoTracks().some((track) => track.readyState === 'live') ? (
                  <video ref={videoRef} autoPlay playsInline muted aria-label="Your live camera preview" className="h-full w-full -scale-x-100 object-contain" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-[#252536] text-center text-white">
                    <div className="max-w-sm px-4">
                      <Video aria-hidden="true" className="mx-auto h-10 w-10" />
                      <p className="mt-2 font-bold">{stage === 'guidelines' ? 'Camera preview will start after you acknowledge the guidelines.' : previewLoading ? 'Starting your camera preview...' : 'Camera preview is not available yet.'}</p>
                      {cameraError && <p className="mt-2 text-sm font-semibold text-[#ffe1e4]" role="alert">{cameraError}</p>}
                      {stage === 'ready' && <button type="button" disabled={previewLoading} onClick={beginCameraPreview} className="mt-4 border-2 border-black bg-[#b290ff] px-4 py-2 font-black text-[#111] shadow-[3px_3px_0_#111] disabled:opacity-60">{previewLoading ? 'Starting Camera...' : 'Retry Camera Preview'}</button>}
                    </div>
                  </div>
                )}
                <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 border-2 border-black bg-[#ffd93b] px-2.5 py-1 text-xs font-black text-[#111] shadow-[2px_2px_0_#111]">
                  You
                  {previewStream?.getVideoTracks().some((track) => track.readyState === 'live') && <span aria-label="Camera active" className="h-2 w-2 rounded-full border border-black bg-[#5fdc98]" />}
                </div>
                <button type="button" onClick={toggleFullscreen} aria-label="Enter or exit fullscreen" className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center border-2 border-black bg-white text-[#111] shadow-[2px_2px_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40"><Maximize aria-hidden="true" className="h-4 w-4" /></button>

                {stage === 'live' && <div className="absolute bottom-3 right-3 flex items-center gap-2 border-2 border-black bg-[#fffeFB] p-2 shadow-[3px_3px_0_#111] sm:bottom-4 sm:right-4 sm:p-3">
                  <div aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full border-2 border-black bg-[radial-gradient(circle_at_35%_30%,#c9f0ff,#6cc4f0_45%,#3988d2_75%,#204e9b)] shadow-[2px_2px_0_#111] sm:h-[52px] sm:w-[52px]" />
                </div>}
              </div>

              {(stage === 'ready' || stage === 'guidelines') && <section className={`relative mx-auto w-full border-2 border-black bg-white p-3 shadow-[4px_4px_0_#111] sm:p-4 ${videoFrameSize}`}>
                <div aria-hidden="true" className="absolute right-0 top-0 h-6 w-6 border-b-[6px] border-l-[6px] border-[#b290ff]" />
                <div className="flex flex-col items-center gap-2.5 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <h2 className="inline-block border-2 border-black bg-[#b290ff] px-2.5 py-0.5 text-base font-black shadow-[2px_2px_0_#111] sm:text-lg">Ready to Start Your Interview?</h2>
                    <p className="mt-1.5 text-[0.82rem] font-medium">Begin the AI interview when you're ready.</p>
                  </div>
                  <BrutalistButton disabled={stage !== 'ready' || previewLoading} onClick={startInterview} className="!min-h-9 !w-full !max-w-[16rem] !px-4 !text-[0.82rem] sm:!w-auto" icon={<Play aria-hidden="true" className="h-3.5 w-3.5 fill-current" />}>Start Interview</BrutalistButton>
                </div>
                {stage === 'ready' && sessionError && <p role="alert" className="mt-2 border-2 border-black bg-[#ffe1e4] p-2.5 text-[0.82rem] font-bold">{sessionError}</p>}
              </section>}

              {stage === 'live' && <section className="mx-auto w-full border-2 border-black bg-white p-3 shadow-[4px_4px_0_#111] sm:p-4 md:w-[min(94vw,1400px)]">
                <div className="flex items-center justify-between gap-3">
                  <span className="border-2 border-black bg-[#b290ff] px-2.5 py-0.5 text-xs font-black shadow-[2px_2px_0_#111]">Question 1 of 10</span>
                  <span className="border-2 border-black bg-[#ffd93b] px-2.5 py-0.5 text-xs font-black shadow-[2px_2px_0_#111]">Medium</span>
                </div>
                <div className="mt-2 grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <h2 className="text-base font-black leading-tight sm:text-lg">Can you explain the difference between synchronous and asynchronous programming with an example?</h2>
                  </div>
                  <div className="flex items-center justify-end gap-2.5 border-t-2 border-black/40 pt-3 lg:border-l-2 lg:border-t-0 lg:pl-4 lg:pt-0">
                    <button type="button" onClick={() => setShowEndConfirm(true)} className="inline-flex min-h-9 items-center justify-center gap-1.5 border-2 border-black bg-[#ff9aa6] px-3 py-1.5 text-xs font-black shadow-[2px_2px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111] active:translate-y-0.5 active:shadow-none"><X aria-hidden="true" size={15} />End Interview</button>
                    <button type="button" onClick={handleSubmit} className="inline-flex min-h-9 items-center justify-center gap-1.5 border-2 border-black bg-[#5fdc98] px-4 py-1.5 text-xs font-black shadow-[2px_2px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111] active:translate-y-0.5 active:shadow-none">Submit<ArrowRight aria-hidden="true" size={15} /></button>
                  </div>
                </div>
                {sessionError && <p role="alert" className="mt-2 border-2 border-black bg-[#ffe1e4] p-2.5 text-[0.82rem] font-bold">{sessionError}</p>}
                {sessionNotice && <p role="status" className="mt-2 border-2 border-black bg-[#fff4c2] p-2.5 text-[0.82rem] font-bold">{sessionNotice}</p>}
              </section>}
            </>
          )}
        </div>}
      </div>

      {showGuide && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) event.preventDefault() }}>
        <div role="dialog" aria-modal="true" aria-labelledby="guide-title" aria-describedby="guide-subtitle" className={`relative my-auto w-full overflow-y-auto border-black bg-[#fffeFB] ${isGuidelinesModal ? 'flex min-h-[min(90dvh,calc(100dvh-24px))] max-h-[calc(100dvh-24px)] max-w-[min(94vw,52rem)] flex-col border-[3px] p-3 shadow-[8px_8px_0_#111] sm:p-5' : 'max-h-[calc(100dvh-2rem)] max-w-3xl border-[4px] p-4 shadow-[10px_10px_0_#111] sm:p-6'}`}>
          <div aria-hidden="true" className={`absolute left-0 top-0 border-[#b290ff] ${isGuidelinesModal ? 'h-8 w-8 border-b-[8px] border-r-[8px]' : 'h-10 w-10 border-b-[10px] border-r-[10px]'}`} />
          <div aria-hidden="true" className="absolute bottom-0 right-0 flex items-end gap-1"><i className={`${isGuidelinesModal ? 'h-4 w-2' : 'h-5 w-3'} bg-[#ffd93b]`}/><i className={`${isGuidelinesModal ? 'h-6 w-2' : 'h-8 w-3'} bg-[#ffd93b]`}/><i className={`${isGuidelinesModal ? 'h-9 w-2' : 'h-11 w-3'} bg-[#ffd93b]`}/></div>
          <button ref={closeRef} type="button" aria-label="Close setup guide" onClick={closeGuide} className={`absolute z-10 grid place-items-center border-2 border-black bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/30 ${isGuidelinesModal ? 'right-2.5 top-2.5 h-8 w-8' : 'right-3 top-3 h-9 w-9'}`}><X aria-hidden="true" className={isGuidelinesModal ? 'h-4 w-4' : ''} /></button>
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
          <BrutalistButton onClick={guideMode === 'guidelines' ? acknowledgeGuidelines : closeGuide} icon={<ArrowRight aria-hidden="true" size={isGuidelinesModal ? 16 : 19} />} className={`relative z-10 !mx-auto ${isGuidelinesModal ? '!min-h-10 !max-w-sm !border-2 !px-4 !text-[0.8rem] !shadow-[3px_3px_0_#111]' : '!max-w-md'}`}>
            {guideMode === 'guidelines' ? 'I Understand & Continue' : 'Got It, Set Up Permissions'}
          </BrutalistButton>
        </div>
      </div>}

      {showEndConfirm && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
        <section role="alertdialog" aria-modal="true" aria-labelledby="end-title" aria-describedby="end-description" className="w-full max-w-md border-[3px] border-black bg-[#fffeFB] p-5 shadow-[7px_7px_0_#111]">
          <h2 id="end-title" className="text-xl font-black">End this interview?</h2>
          <p id="end-description" className="mt-2 text-sm font-medium">Ending the session stops the interview and disconnects your camera and microphone.</p>
          <div className="mt-5 flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button type="button" onClick={() => setShowEndConfirm(false)} className="min-h-10 border-2 border-black bg-white px-4 py-2 text-sm font-black shadow-[2px_2px_0_#111]">Keep Interviewing</button>
            <button type="button" autoFocus onClick={endInterview} className="min-h-10 border-2 border-black bg-[#ff9aa6] px-4 py-2 text-sm font-black shadow-[2px_2px_0_#111]">End Interview</button>
          </div>
        </section>
      </div>}
    </section>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import EndConfirmDialog from '../components/EndConfirmDialog.jsx'
import GuideModal from '../components/GuideModal.jsx'
import InterviewDecorations from '../components/InterviewDecorations.jsx'
import InterviewEnded from '../components/InterviewEnded.jsx'
import InterviewResults from '../components/InterviewResults.jsx'
import InterviewTopBar from '../components/InterviewTopBar.jsx'
import QuestionPanel from '../components/QuestionPanel.jsx'
import ReadyPanel from '../components/ReadyPanel.jsx'
import SetupSteps, { steps } from '../components/SetupSteps.jsx'
import VideoStage from '../components/VideoStage.jsx'

// ===========================================================================
// InterviewPage.jsx - state and logic of the whole interview flow:
//   setup (5 device checks) -> guidelines -> ready -> live -> ended -> results
// UI lives in reusable components. This page owns interview state and flow.
// ===========================================================================

const initialChecks = Object.fromEntries(steps.map(({ id }) => [id, { status: 'pending', detail: '', info: '' }]))

const INTERVIEW_TITLE = 'Software Developer Interview'
const currentQuestion = {
  questionNumber: 1,
  totalQuestions: 10,
  difficulty: 'Medium',
  question: 'Can you explain the difference between synchronous and asynchronous programming with an example?',
}

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

  const confirmSpeaker = () => {
    setSpeakerPrompt(false)
    finishCheck('speaker', 'Speaker is working!', 'You confirmed that the test sound is audible.')
    setExpanded(null)
  }

  const runAction = { microphone: requestMicrophone, camera: requestCamera, speaker: checkSpeaker, network: testNetwork, screenShare: testScreen }

  const cameraActive = Boolean(previewStream?.getVideoTracks().some((track) => track.readyState === 'live'))
  const duration = formatDuration(elapsedSeconds)
  const inSession = stage === 'guidelines' || stage === 'ready' || stage === 'live'

  return (
    <section className={`relative min-h-full px-3 pb-4 pt-3 text-[#111] sm:px-4 md:px-5 lg:px-6 ${stage === 'setup' ? 'bg-[#fffeFB]' : 'bg-[#f5f3ed]'} ${inSession ? 'overflow-hidden' : ''}`}>
      {inSession && <InterviewDecorations />}

      <div className={`relative ${showGuide ? 'pointer-events-none select-none blur-[3px]' : ''}`} aria-hidden={showGuide}>
        {stage === 'setup' && (
          <SetupSteps
            completed={completed}
            checks={checks}
            expanded={expanded}
            onToggleExpand={(id) => setExpanded(expanded === id ? null : id)}
            running={running}
            runAction={runAction}
            speakerPrompt={speakerPrompt}
            micTestActive={micTestActive}
            micLevel={micLevel}
            onToggleMicTest={toggleMicTest}
            onSpeakerConfirm={confirmSpeaker}
            onSpeakerRetry={checkSpeaker}
            onContinue={openInterviewGuidelines}
          />
        )}

        {stage !== 'setup' && (
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 md:h-[calc(100dvh-1.75rem)] md:overflow-hidden">
            {stage === 'ended' ? (
              <InterviewEnded duration={duration} />
            ) : stage === 'results' ? (
              <>
                <InterviewTopBar status="ended" interviewTitle={INTERVIEW_TITLE} showStatus={false} showDuration={false} durationLabel={duration} />
                <InterviewResults endedAt={endedAt} duration={duration} />
              </>
            ) : (
              <>
                <InterviewTopBar status={stage} interviewTitle={INTERVIEW_TITLE} durationLabel={duration} />
                <div className="flex min-h-0 flex-col gap-3 md:flex-1 md:gap-0">
                  <VideoStage
                    frameRef={videoFrameRef}
                    videoRef={videoRef}
                    stage={stage}
                    stream={previewStream}
                    cameraActive={cameraActive}
                    previewLoading={previewLoading}
                    cameraError={cameraError}
                    onRetry={beginCameraPreview}
                    onToggleFullscreen={toggleFullscreen}
                  />
                  {stage === 'live' ? (
                    <QuestionPanel
                      {...currentQuestion}
                      onEnd={() => setShowEndConfirm(true)}
                      onSubmit={handleSubmit}
                      sessionError={sessionError}
                      sessionNotice={sessionNotice}
                    />
                  ) : (
                    <ReadyPanel stage={stage} previewLoading={previewLoading} sessionError={sessionError} onStart={startInterview} />
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {showGuide && (
        <GuideModal
          guideMode={guideMode}
          closeRef={closeRef}
          onClose={closeGuide}
          onAcknowledge={acknowledgeGuidelines}
        />
      )}

      {showEndConfirm && <EndConfirmDialog onKeep={() => setShowEndConfirm(false)} onEnd={endInterview} />}
    </section>
  )
}

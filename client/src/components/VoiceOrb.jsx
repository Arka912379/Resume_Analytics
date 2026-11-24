import { useEffect, useRef } from 'react'

// The AI orb, drawn like the reference video: a round "cloud sky" with a blue top,
// soft white cloud below it and a wavy, drifting edge between them.
// It reacts to the user's voice:
//   - the orb swells a little while they speak and settles when they stop,
//   - the cloud edge rises and its waves get bigger and faster with the voice,
//   - when it is quiet the clouds keep drifting slowly (and the orb "breathes").
//
// Props: stream - the live MediaStream that contains the microphone track.
//
// The microphone level is measured with a Web Audio AnalyserNode (never played
// back, so no echo) and the orb is painted on a small canvas, so nothing in React
// re-renders while it animates. Closing the analyser never stops the microphone.

// Paints one frame. voice = 0..1 (fast, follows words), halo = 0..1 (slow, overall loudness)
function drawOrb(ctx, size, time, voice, halo) {
  const r = size / 2
  const t = time / 1000

  ctx.clearRect(0, 0, size, size)
  ctx.save()
  ctx.beginPath()
  ctx.arc(r, r, r, 0, Math.PI * 2)
  ctx.clip()

  // cloud body (the lower, white part)
  const cloud = ctx.createLinearGradient(0, 0, 0, size)
  cloud.addColorStop(0, '#f6f7ff')
  cloud.addColorStop(0.5, '#e4eaff')
  cloud.addColorStop(1, '#b0c1f7')
  ctx.fillStyle = cloud
  ctx.fillRect(0, 0, size, size)

  // wavy edge between the blue sky and the cloud
  const level = 0.44 - halo * 0.12 // louder -> the cloud rises, the blue shrinks
  const amp = size * (0.022 + voice * 0.04 + halo * 0.012)
  const speed = 0.7 + voice * 1.6
  const tilt = Math.sin(t * 0.45) * 0.14
  const edgeY = (x) => {
    const u = x / size
    return (
      size * level +
      (u - 0.5) * size * tilt +
      amp * Math.sin(u * 5.2 + t * speed * 1.1) +
      amp * 0.6 * Math.sin(u * 9.6 - t * speed * 1.7 + 1.3) +
      amp * 0.8 * Math.sin(u * 2.4 + t * speed * 0.6 + 2.1)
    )
  }

  const edge = new Path2D()
  const sky = new Path2D()
  sky.moveTo(0, 0)
  sky.lineTo(size, 0)
  const step = Math.max(2, size / 60)
  for (let x = size; x >= -step; x -= step) {
    const px = Math.max(0, x)
    const py = edgeY(px)
    if (x === size) {
      edge.moveTo(px, py)
      sky.lineTo(px, py)
    } else {
      edge.lineTo(px, py)
      sky.lineTo(px, py)
    }
  }
  sky.closePath()

  const blue = ctx.createLinearGradient(0, 0, 0, size * (level + 0.1))
  blue.addColorStop(0, '#2b5bdc')
  blue.addColorStop(1, '#5a89f0')
  ctx.fillStyle = blue
  ctx.fill(sky)

  // feather the edge so blue melts into the cloud
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const feather = [18, 12, 7, 3]
  for (let i = 0; i < feather.length; i += 1) {
    ctx.lineWidth = (feather[i] * size) / 150
    ctx.strokeStyle = 'rgba(214, 224, 252, 0.16)'
    ctx.stroke(edge)
  }

  // drifting cloud wisps along and above the edge
  for (let k = 0; k < 8; k += 1) {
    const drift = (k * 0.37 + t * (0.025 + voice * 0.08)) % 1
    const cx = size * (-0.1 + 1.2 * drift)
    const above = k % 3 === 0 // some wisps float up into the blue
    const cy = edgeY(Math.min(size, Math.max(0, cx))) + size * (above ? -0.05 : 0.04 + 0.03 * Math.sin(t * 0.9 + k))
    const rx = size * (0.2 + 0.07 * Math.sin(k * 1.7 + t * 0.6))
    const ry = size * (0.035 + 0.018 * voice + 0.012 * Math.sin(t * 1.1 + k))
    ctx.save()
    ctx.translate(cx, cy)
    ctx.scale(1, ry / rx)
    const wisp = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
    wisp.addColorStop(0, `rgba(255, 255, 255, ${above ? 0.3 : 0.5})`)
    wisp.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = wisp
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2)
    ctx.restore()
  }

  ctx.restore()
}

export default function VoiceOrb({ stream, className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!wrap || !canvas || !ctx) return undefined

    let size = 0
    let voice = 0 // fast: follows each word
    let halo = 0 // slow: follows the overall loudness
    let frame = 0
    let audioContext
    let source
    let analyser
    let data

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const next = Math.max(1, Math.round(rect.width))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = next
      canvas.width = Math.round(next * dpr)
      canvas.height = Math.round(next * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (reduceMotion) drawOrb(ctx, size, 0, 0, 0)
    }
    resize()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
    observer?.observe(wrap)

    if (reduceMotion) {
      return () => observer?.disconnect() // one still picture, no animation
    }

    // microphone level (optional: without it the clouds simply drift)
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const audioTracks = stream?.getAudioTracks().filter((track) => track.readyState === 'live') ?? []
    if (AudioContextClass && audioTracks.length) {
      try {
        audioContext = new AudioContextClass()
        audioContext.resume?.()
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 512
        analyser.smoothingTimeConstant = 0.6
        source = audioContext.createMediaStreamSource(new MediaStream(audioTracks))
        source.connect(analyser) // not connected to the speakers, so no echo
        data = new Uint8Array(analyser.fftSize)
      } catch {
        analyser = undefined
      }
    }

    const tick = (time) => {
      let target = 0
      if (analyser) {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (let i = 0; i < data.length; i += 1) {
          const sample = (data[i] - 128) / 128
          sum += sample * sample
        }
        const rms = Math.sqrt(sum / data.length)
        target = Math.min(1, Math.max(0, (rms - 0.015) * 7)) // ignore room noise, boost speech
      }
      voice = target > voice ? voice + (target - voice) * 0.5 : voice * 0.9
      halo = target > halo ? halo + (target - halo) * 0.15 : halo * 0.96

      drawOrb(ctx, size, time, voice, halo)
      canvas.style.transform = `scale(${(1 + Math.sin(time / 700) * 0.012 + voice * 0.14).toFixed(4)})`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      source?.disconnect()
      audioContext?.close().catch(() => {})
      canvas.style.transform = ''
    }
  }, [stream])

  return (
    <div ref={wrapRef} aria-hidden="true" className={`relative aspect-square w-[78%] ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full rounded-full" />
    </div>
  )
}
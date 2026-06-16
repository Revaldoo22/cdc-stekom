'use client'

import { useEffect, useRef } from 'react'

type P = [number, number]

function bez(t: number, p0: P, p1: P, p2: P, p3: P): P {
  const u = 1 - t
  return [
    u**3*p0[0] + 3*u**2*t*p1[0] + 3*u*t**2*p2[0] + t**3*p3[0],
    u**3*p0[1] + 3*u**2*t*p1[1] + 3*u*t**2*p2[1] + t**3*p3[1],
  ]
}

// 7-segment closed loop — canvas 280×165
// outer sweep left + inner spiral + return
const SEGS: [P,P,P,P][] = [
  [[238,26],  [178,4],   [108,42],  [122,88]],
  [[122,88],  [130,122], [156,144], [176,130]],
  [[176,130], [196,116], [192,92],  [174,88]],
  [[174,88],  [156,84],  [146,97],  [150,116]],
  [[150,116], [156,136], [188,150], [220,135]],
  [[220,135], [252,120], [270,84],  [266,50]],
  [[266,50],  [262,26],  [254,20],  [238,26]],
]
const N = SEGS.length
const DUR  = 6200   // ms per loop
const TRAIL  = 56   // samples kept
const PERIOD = 12   // samples per dash+gap
const ON     =  6   // samples "on" per period → 4–5 visible dashes with fade

function sample(t: number): { pos: P; angle: number } {
  const raw = t * N
  const i = Math.min(Math.floor(raw), N - 1)
  const [p0, p1, p2, p3] = SEGS[i]
  const pos = bez(raw - i, p0, p1, p2, p3)

  const raw2 = Math.min(t * N + 0.018, N)
  const i2 = Math.min(Math.floor(raw2), N - 1)
  const [q0, q1, q2, q3] = SEGS[i2]
  const pos2 = bez(raw2 - i2, q0, q1, q2, q3)

  return { pos, angle: Math.atan2(pos2[1] - pos[1], pos2[0] - pos[0]) }
}

function drawPlane(ctx: CanvasRenderingContext2D, x: number, y: number, a: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(a)
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'
  ctx.lineWidth = 1.4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // outer triangle
  ctx.beginPath()
  ctx.moveTo(13, 0)
  ctx.lineTo(-8, -6.5)
  ctx.lineTo(-4.5, 0)
  ctx.lineTo(-8, 6.5)
  ctx.closePath()
  ctx.stroke()

  // fold line (center)
  ctx.beginPath()
  ctx.moveTo(-4.5, 0)
  ctx.lineTo(13, 0)
  ctx.stroke()

  ctx.restore()
}

export function PaperPlane() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    // 2D context always available in modern browsers; non-null assertion is safe
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = c.getContext('2d')!

    const W = 280, H = 165
    const DPR = Math.min(window.devicePixelRatio ?? 1, 2)
    c.width  = W * DPR
    c.height = H * DPR
    c.style.width  = `${W}px`
    c.style.height = `${H}px`
    ctx.scale(DPR, DPR)

    const trail: P[] = []
    let t0: number | null = null
    let id: number

    function tick(ts: number) {
      if (!t0) t0 = ts
      const t = ((ts - t0) % DUR) / DUR

      ctx.clearRect(0, 0, W, H)

      const { pos, angle } = sample(t)
      trail.push([...pos] as P)
      if (trail.length > TRAIL) trail.shift()

      // fading dashed trail — newest = near plane, oldest = transparent
      for (let i = trail.length - 2; i >= 0; i--) {
        const age = trail.length - 1 - i   // 0 = closest to plane
        if (age % PERIOD >= ON) continue   // gap — skip

        const op = Math.max(0, 1 - age / TRAIL) * 0.78
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255,255,255,${op.toFixed(3)})`
        ctx.lineWidth = 1.5
        ctx.lineCap = 'round'
        ctx.moveTo(trail[i][0], trail[i][1])
        ctx.lineTo(trail[i + 1][0], trail[i + 1][1])
        ctx.stroke()
      }

      drawPlane(ctx, pos[0], pos[1], angle)
      id = requestAnimationFrame(tick)
    }

    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  return <canvas ref={ref} />
}

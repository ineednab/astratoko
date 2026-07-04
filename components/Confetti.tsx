'use client'
import { useEffect, useRef } from 'react'

const COLORS = ['#1A3CC4', '#5C82E8', '#F5A623', '#E31837', '#2F9E44', '#F08C00', '#7048E8']

export default function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const cw = canvas.width
    const ch = canvas.height

    type Particle = {
      x: number; y: number; vx: number; vy: number
      color: string; w: number; h: number; rotation: number; rotSpeed: number
    }

    const particles: Particle[] = Array.from({ length: 130 }, () => ({
      x: Math.random() * cw,
      y: -(Math.random() * ch * 0.4 + 20),
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: Math.random() * 10 + 4,
      h: Math.random() * 5 + 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
    }))

    let animId: number
    let stopped = false

    function draw() {
      if (stopped || !ctx) return
      ctx.clearRect(0, 0, cw, ch)
      let alive = 0
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.rotation += p.rotSpeed
        if (p.y < ch + 40) {
          alive++
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
          ctx.restore()
        }
      }
      if (alive === 0) { stopped = true; return }
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => { stopped = true; cancelAnimationFrame(animId) }
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[200]" />
}

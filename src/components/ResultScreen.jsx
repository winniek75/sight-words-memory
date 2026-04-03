import { useEffect, useRef } from 'react'
import { PLAYER_COLORS, PLAYER_EMOJIS } from '../data/sightWords'
import './ResultScreen.css'

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣']
const CONFETTI_COLORS = ['#FF3CAC','#FFE600','#00C2FF','#00FF87','#FF6B35','#7C3AED','#FF4757','#FFC312']

export default function ResultScreen({ players, scores, onRestart }) {
  const canvasRef = useRef(null)

  const rankings = players
    .map((name, i) => ({ name, score: scores[i], idx: i }))
    .sort((a, b) => b.score - a.score)

  const maxScore  = Math.max(...scores)
  const winners   = rankings.filter(p => p.score === maxScore)
  const isTie     = winners.length > 1

  /* ── Canvas confetti ────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')

    const pieces = Array.from({ length: 130 }, () => ({
      x:        Math.random() * canvas.width,
      y:        -Math.random() * canvas.height * 0.5,
      w:        Math.random() * 10 + 5,
      h:        Math.random() * 6  + 4,
      color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speed:    Math.random() * 2.8 + 0.8,
      rot:      Math.random() * 360,
      rotSpd:   (Math.random() - 0.5) * 7,
      swing:    (Math.random() - 0.5) * 1.8,
      swingOff: Math.random() * Math.PI * 2,
    }))

    let frame = 0
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      pieces.forEach(p => {
        ctx.save()
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2)
        ctx.rotate((p.rot * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.fill()
        ctx.restore()

        p.y   += p.speed
        p.x   += Math.sin(frame * 0.03 + p.swingOff) * p.swing
        p.rot += p.rotSpd

        if (p.y > canvas.height + 10) {
          p.y = -p.h
          p.x = Math.random() * canvas.width
        }
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="result-screen">
      <canvas ref={canvasRef} className="confetti-canvas" />

      <div className="result-card">
        <div className="result-trophy">
          {isTie ? '🤝' : '🏆'}
        </div>

        <h1 className="result-heading">
          {isTie
            ? `${winners.map(w => w.name).join(' & ')} ひきわけ！`
            : `${winners[0].name} の かち！`}
        </h1>

        <div className="result-ranking">
          {rankings.map((p, rank) => (
            <div
              key={p.idx}
              className={`rank-row ${rank === 0 ? 'gold' : ''}`}
              style={{
                '--pc': PLAYER_COLORS[p.idx],
                animationDelay: `${rank * 0.08 + 0.2}s`,
              }}
            >
              <span className="rank-medal">{MEDALS[rank]}</span>
              <span className="rank-emoji">{PLAYER_EMOJIS[p.idx]}</span>
              <span className="rank-name">{p.name}</span>
              <span className="rank-score">{p.score} ペア</span>
            </div>
          ))}
        </div>

        <button className="restart-btn" onClick={onRestart}>
          🔄 もう一かい！
        </button>
      </div>
    </div>
  )
}

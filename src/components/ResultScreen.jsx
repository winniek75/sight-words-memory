import { useEffect, useRef, useState } from 'react'
import { PLAYER_COLORS, PLAYER_EMOJIS } from '../data/sightWords'
import './ResultScreen.css'

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣']
const CONFETTI_COLORS = ['#FF3CAC','#FFE600','#00C2FF','#00FF87','#FF6B35','#7C3AED','#FF4757','#FFC312']

const STORAGE_KEY = 'sight-words-memory-best'

function loadBest() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

function saveBest(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (_) {}
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

export default function ResultScreen({ players, scores, elapsedTime, onRestart }) {
  const canvasRef = useRef(null)
  const [isNewBestScore, setIsNewBestScore] = useState(false)
  const [isNewBestTime, setIsNewBestTime] = useState(false)
  const [best, setBest] = useState(() => loadBest())

  const rankings = players
    .map((name, i) => ({ name, score: scores[i], idx: i }))
    .sort((a, b) => b.score - a.score)

  const maxScore  = Math.max(...scores)
  const totalPairs = scores.reduce((a, b) => a + b, 0)
  const winners   = rankings.filter(p => p.score === maxScore)
  const isTie     = winners.length > 1

  // Save best score/time on mount
  useEffect(() => {
    const prev = loadBest()
    let newBestScore = false
    let newBestTime = false

    if (!prev) {
      newBestScore = true
      newBestTime = true
    } else {
      if (maxScore > (prev.bestScore || 0)) {
        newBestScore = true
      }
      if (elapsedTime > 0 && (prev.bestTime === 0 || !prev.bestTime || elapsedTime < prev.bestTime)) {
        newBestTime = true
      }
    }

    const updated = {
      bestScore: newBestScore ? maxScore : (prev?.bestScore || 0),
      bestScorePlayer: newBestScore ? winners[0].name : (prev?.bestScorePlayer || ''),
      bestTime: newBestTime ? elapsedTime : (prev?.bestTime || 0),
      bestTimePlayer: newBestTime ? winners[0].name : (prev?.bestTimePlayer || ''),
      gamesPlayed: (prev?.gamesPlayed || 0) + 1,
    }

    saveBest(updated)
    setBest(updated)
    setIsNewBestScore(newBestScore)
    setIsNewBestTime(newBestTime && elapsedTime > 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* -- Canvas confetti ---------------------------------------- */
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

        {elapsedTime > 0 && (
          <p className="result-time">
            {formatTime(elapsedTime)}
            {isNewBestTime && <span className="new-record-badge">NEW BEST!</span>}
          </p>
        )}

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
              <span className="rank-score">
                {p.score} ペア
                {rank === 0 && isNewBestScore && <span className="new-record-badge">NEW BEST!</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Near-miss / Perfect feedback */}
        {(() => {
          // In memory game, "perfect" = fewest misses. We approximate with single-player score ratio.
          const totalCards = totalPairs
          const bestPlayerScore = maxScore
          const pct = totalCards > 0 ? Math.round((bestPlayerScore / totalCards) * 100) : 0
          if (pct === 100) {
            return <div className="near-miss-feedback perfect-glow">PERFECT! 💎</div>
          } else if (pct >= 80) {
            const remaining = totalCards - bestPlayerScore
            return <div className="near-miss-feedback near-miss-text">あと{remaining}ペアでパーフェクト！もう一回？</div>
          }
          return null
        })()}

        {best && (
          <div className="best-records">
            <h3 className="best-title">Best Records</h3>
            <div className="best-grid">
              <div className="best-item">
                <span className="best-label">Best Score</span>
                <span className="best-value">{best.bestScore} ペア</span>
                <span className="best-who">{best.bestScorePlayer}</span>
              </div>
              {best.bestTime > 0 && (
                <div className="best-item">
                  <span className="best-label">Best Time</span>
                  <span className="best-value">{formatTime(best.bestTime)}</span>
                  <span className="best-who">{best.bestTimePlayer}</span>
                </div>
              )}
              <div className="best-item">
                <span className="best-label">Games Played</span>
                <span className="best-value">{best.gamesPlayed}</span>
              </div>
            </div>
          </div>
        )}

        <button className="restart-btn" onClick={onRestart}>
          🔄 もう一かい！
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { PLAYER_COLORS, PLAYER_EMOJIS } from '../data/sightWords'
import './PlayerSetup.css'

const DEFAULTS = ['プレイヤー1', 'プレイヤー2', 'プレイヤー3', 'プレイヤー4']

export default function PlayerSetup({ onStart }) {
  const [count, setCount]   = useState(2)
  const [names, setNames]   = useState([...DEFAULTS])

  const update = (i, v) => {
    const n = [...names]; n[i] = v; setNames(n)
  }

  const handleStart = () => {
    const ps = names.slice(0, count).map((n, i) => n.trim() || DEFAULTS[i])
    onStart(ps)
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">

        <h1 className="setup-title">
          <span className="st-top">👀 SIGHT WORDS</span>
          <span className="st-bot">MEMORY 🎴</span>
        </h1>
        <p className="setup-sub">えいごの かるた ゲーム！</p>

        {/* Player count */}
        <section className="setup-section">
          <h2 className="setup-label">👥 なんにんで あそぶ？</h2>
          <div className="count-row">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                className={`count-btn ${count === n ? 'active' : ''}`}
                onClick={() => setCount(n)}
              >
                {n} にん
              </button>
            ))}
          </div>
        </section>

        {/* Player names */}
        <section className="setup-section">
          <h2 className="setup-label">✏️ なまえを いれてね</h2>
          <div className="name-list">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="name-row">
                <span className="name-icon" style={{ background: PLAYER_COLORS[i] }}>
                  {PLAYER_EMOJIS[i]}
                </span>
                <input
                  className="name-input"
                  type="text"
                  placeholder={DEFAULTS[i]}
                  value={names[i]}
                  maxLength={10}
                  onChange={e => update(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        <button className="start-btn" onClick={handleStart}>
          🎮 スタート！
        </button>
      </div>
    </div>
  )
}

import { PLAYER_COLORS, PLAYER_EMOJIS } from '../data/sightWords'
import './ScoreBar.css'

export default function ScoreBar({ players, scores, currentPlayer, pairsLeft }) {
  return (
    <header className="score-bar">
      <span className="sb-title">🎴 Sight Words Memory</span>

      <div className="sb-players">
        {players.map((name, i) => (
          <div
            key={i}
            className={`player-chip ${currentPlayer === i ? 'active' : ''}`}
            style={{ '--pc': PLAYER_COLORS[i] }}
          >
            <span className="pc-emoji">{PLAYER_EMOJIS[i]}</span>
            <div className="pc-info">
              <span className="pc-name">{name}</span>
              <span className="pc-score">{scores[i]} ペア</span>
            </div>
            {currentPlayer === i && <span className="pc-turn">▼</span>}
          </div>
        ))}
      </div>

      <span className="sb-left">のこり {pairsLeft}</span>
    </header>
  )
}

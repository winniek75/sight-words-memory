import { useState, useEffect, useCallback, useRef } from 'react'
import Card from './Card'
import ScoreBar from './ScoreBar'
import { SIGHT_WORDS, CARD_COLORS } from '../data/sightWords'
import './GameBoard.css'

const DIFFICULTY = {
  easy:   { pairs: 8,  label: 'かんたん',     emoji: '🌟', cls: 'diff-easy' },
  normal: { pairs: 12, label: 'ふつう',       emoji: '🎯', cls: 'diff-normal' },
  hard:   { pairs: 16, label: 'むずかしい',   emoji: '🔥', cls: 'diff-hard' },
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildCards(pairs) {
  const words = shuffle(SIGHT_WORDS).slice(0, pairs)
  const raw = words.flatMap((word, i) => [
    { id: i * 2,     wordId: i, word, color: CARD_COLORS[i] },
    { id: i * 2 + 1, wordId: i, word, color: CARD_COLORS[i] },
  ])
  return shuffle(raw).map(c => ({
    ...c,
    // Scatter: random rotation ±12° and small random translation ±9px
    rotate: (Math.random() - 0.5) * 24,
    tx:     (Math.random() - 0.5) * 10,
    ty:     (Math.random() - 0.5) * 10,
  }))
}

export default function GameBoard({ players, onEnd }) {
  const [difficulty, setDifficulty] = useState(null)
  const [cards,          setCards]          = useState([])
  const [flipped,        setFlipped]        = useState([])     // card IDs face-up but unresolved
  const [matched,        setMatched]        = useState(new Set()) // wordIds matched
  const [scores,         setScores]         = useState(() => players.map(() => 0))
  const [currentPlayer,  setCurrentPlayer]  = useState(0)
  const [disabled,       setDisabled]       = useState(false)
  const [shaking,        setShaking]        = useState([])
  const [celebrating,    setCelebrating]    = useState([])

  // Keep a ref to latest scores to avoid stale closure in game-over timeout
  const scoresRef = useRef(scores)
  useEffect(() => { scoresRef.current = scores }, [scores])

  // Game-over detection
  useEffect(() => {
    if (cards.length > 0 && matched.size === cards.length / 2) {
      setTimeout(() => onEnd(scoresRef.current), 1300)
    }
  }, [matched.size, cards.length, onEnd])

  const startGame = (diff) => {
    const newCards = buildCards(DIFFICULTY[diff].pairs)
    setDifficulty(diff)
    setCards(newCards)
    setFlipped([])
    setMatched(new Set())
    setScores(players.map(() => 0))
    setCurrentPlayer(0)
    setDisabled(false)
    setShaking([])
    setCelebrating([])
  }

  const handleCardClick = useCallback((cardId) => {
    if (disabled) return
    if (flipped.includes(cardId)) return
    const card = cards.find(c => c.id === cardId)
    if (!card || matched.has(card.wordId)) return

    const newFlipped = [...flipped, cardId]
    setFlipped(newFlipped)
    if (newFlipped.length < 2) return

    // Two cards are now face-up — evaluate
    setDisabled(true)
    const [id1, id2] = newFlipped
    const c1 = cards.find(c => c.id === id1)
    const c2 = cards.find(c => c.id === id2)

    if (c1.wordId === c2.wordId) {
      // ✅ Match
      setTimeout(() => {
        setCelebrating([c1.wordId])
        setMatched(prev => new Set([...prev, c1.wordId]))
        setScores(prev => {
          const s = [...prev]; s[currentPlayer]++; return s
        })
        setTimeout(() => {
          setCelebrating([])
          setFlipped([])
          setDisabled(false)
          // currentPlayer stays the same (same turn on match)
        }, 750)
      }, 350)
    } else {
      // ❌ No match — shake then flip back
      setTimeout(() => {
        setShaking([id1, id2])
        setTimeout(() => {
          setShaking([])
          setFlipped([])
          setCurrentPlayer(p => (p + 1) % players.length)
          setDisabled(false)
        }, 500)
      }, 900)
    }
  }, [disabled, flipped, cards, matched, currentPlayer, players.length])

  /* ── Difficulty picker ──────────────────────────────── */
  if (!difficulty) {
    return (
      <div className="diff-screen">
        <div className="diff-heading-wrap">
          <h2 className="diff-heading">むずかしさを えらんでね！</h2>
        </div>
        <div className="diff-options">
          {Object.entries(DIFFICULTY).map(([key, val]) => (
            <button
              key={key}
              className={`diff-btn ${val.cls}`}
              onClick={() => startGame(key)}
            >
              <span className="diff-emoji">{val.emoji}</span>
              <span className="diff-label">{val.label}</span>
              <span className="diff-count">{val.pairs}ペア / {val.pairs * 2}まい</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const cols = difficulty === 'easy' ? 4 : 6
  const pairsLeft = (cards.length / 2) - matched.size

  return (
    <div className="game-layout">
      <ScoreBar
        players={players}
        scores={scores}
        currentPlayer={currentPlayer}
        pairsLeft={pairsLeft}
      />

      <div className={`cards-grid cols-${cols}`}>
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            isFlipped={flipped.includes(card.id) || matched.has(card.wordId)}
            isMatched={matched.has(card.wordId)}
            isShaking={shaking.includes(card.id)}
            isCelebrating={celebrating.includes(card.wordId)}
            onClick={handleCardClick}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  )
}

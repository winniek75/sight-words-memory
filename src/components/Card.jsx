import { speak } from '../utils/speech'
import './Card.css'

export default function Card({
  card,
  isFlipped,
  isMatched,
  isShaking,
  isCelebrating,
  onClick,
  disabled,
}) {
  const { id, word, color, rotate, tx, ty } = card

  const handleClick = () => {
    if (disabled || isFlipped || isMatched) return
    speak(word.en)
    onClick(id)
  }

  const classes = [
    'card',
    isFlipped || isMatched ? 'flipped'     : '',
    isMatched              ? 'matched'      : '',
    isShaking              ? 'shaking'      : '',
    isCelebrating          ? 'celebrating'  : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className="card-wrap"
      style={{
        '--rot': `${rotate}deg`,
        '--tx':  `${tx}px`,
        '--ty':  `${ty}px`,
      }}
    >
      <div
        className={classes}
        onClick={handleClick}
        style={{ cursor: disabled || isFlipped || isMatched ? 'default' : 'pointer' }}
      >
        <div className="card-inner">

          {/* Face-down side */}
          <div className="c-face c-facedown">
            <span className="fd-qmark">?</span>
            <span className="fd-label">SIGHT WORDS</span>
          </div>

          {/* Face-up side */}
          <div className="c-face c-faceup" style={{ background: color }}>
            <span className="fu-en">{word.en}</span>
            <span className="fu-sep">✦</span>
            <span className="fu-ja">{word.ja}</span>
          </div>

        </div>
      </div>
    </div>
  )
}

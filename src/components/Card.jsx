import './Card.css'

// Cache the native English voice once found
let nativeVoice = null
let voiceLoaded = false

function findNativeVoice() {
  if (voiceLoaded) return nativeVoice
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return null
  voiceLoaded = true
  // Prefer high-quality en-US voices
  const preferred = ['Samantha', 'Alex', 'Karen', 'Daniel', 'Moira', 'Google US English', 'Google UK English']
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'))
    if (v) { nativeVoice = v; return v }
  }
  // Fallback: any en-US or en-GB voice
  nativeVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en')) || null
  return nativeVoice
}

// Pre-load voices
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { voiceLoaded = false; findNativeVoice() }
  findNativeVoice()
}

function speak(word) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(word)
    u.lang   = 'en-US'
    u.rate   = 0.85
    u.pitch  = 1.0
    u.volume = 1
    const voice = findNativeVoice()
    if (voice) u.voice = voice
    window.speechSynthesis.speak(u)
  } catch (_) { /* silent fail */ }
}

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

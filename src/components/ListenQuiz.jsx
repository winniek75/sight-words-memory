import { useState, useEffect, useCallback, useRef } from 'react'
import { speak, canSpeak } from '../utils/speech'
import { playCorrect, playWrong } from '../utils/sounds'
import './ListenQuiz.css'

const QUESTION_COUNT = 3

// 音だけでは区別できない組み合わせ。同じグループの語は選択肢に並べない。
const HOMOPHONES = [
  ['to', 'too', 'two'], ['for', 'four'], ['no', 'know'], ['there', 'their'],
  ['here', 'hear'], ['right', 'write'], ['by', 'buy', 'bye'], ['see', 'sea'],
  ['son', 'sun'], ['our', 'hour'], ['I', 'eye'], ['one', 'won'], ['new', 'knew'],
  ['week', 'weak'], ['meet', 'meat'], ['eight', 'ate'], ['wear', 'where'],
  ['a', 'an'],
]

function soundsSame(a, b) {
  const x = a.toLowerCase(), y = b.toLowerCase()
  if (x === y) return true
  return HOMOPHONES.some(g => {
    const l = g.map(w => w.toLowerCase())
    return l.includes(x) && l.includes(y)
  })
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions(words, choiceCount) {
  const targets = shuffle(words).slice(0, Math.min(QUESTION_COUNT, words.length))
  return targets.map(target => {
    const distractors = shuffle(words.filter(w => !soundsSame(w.en, target.en)))
      .filter((w, i, arr) => arr.findIndex(o => soundsSame(o.en, w.en)) === i)
      .slice(0, choiceCount - 1)
    return { target, choices: shuffle([target, ...distractors]) }
  })
}

/**
 * ゲーム終了後のミニ確認：音を聞いて単語を選ぶ（3問）。
 * この正誤だけが学習記録（correct / total / wrongAnswers）になる。
 */
export default function ListenQuiz({ words, playerCount, onDone }) {
  const [questions] = useState(() => buildQuestions(words, words.length <= 4 ? 3 : 4))
  const [index, setIndex]     = useState(0)
  const [chosen, setChosen]   = useState(null)   // 選んだ単語（en）
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong]     = useState([])     // [{ word, chosen }]
  const hasVoice = canSpeak()
  const replayTimer = useRef(null)

  const q = questions[index]

  // 問題が出たら自動で読み上げる
  useEffect(() => {
    if (!q) return
    const t = setTimeout(() => speak(q.target.en), 450)
    return () => clearTimeout(t)
  }, [q])

  // 出題できる単語が無い場合はそのまま結果へ
  useEffect(() => {
    if (questions.length === 0) onDone({ correct: 0, total: 0, wrong: [] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChoose = useCallback((word) => {
    if (chosen !== null) return
    setChosen(word.en)
    if (word.en === q.target.en) {
      playCorrect()
      setCorrect(c => c + 1)
    } else {
      playWrong()
      setWrong(w => [...w, { word: q.target, chosen: word.en }])
      // 正しい音をもう一度聞かせる
      replayTimer.current = setTimeout(() => speak(q.target.en), 500)
    }
  }, [chosen, q])

  const handleNext = () => {
    clearTimeout(replayTimer.current)
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setChosen(null)
    } else {
      onDone({ correct, total: questions.length, wrong })
    }
  }

  if (!q) return null

  const answered = chosen !== null
  const isRight  = answered && chosen === q.target.en

  return (
    <div className="quiz-screen">
      <div className="quiz-card">
        <h2 className="quiz-heading">🎧 さいごに ミニかくにん</h2>
        <p className="quiz-sub">
          {hasVoice
            ? 'おとを きいて、きこえた ことばを えらんでね'
            : 'いみに あう えいごを えらんでね'}
          {playerCount > 1 && <><br />みんなで いっしょに こたえよう</>}
        </p>
        <p className="quiz-progress">{index + 1} / {questions.length} もんめ</p>

        {hasVoice ? (
          <button className="quiz-listen-btn" onClick={() => speak(q.target.en)}>
            <span className="quiz-listen-icon">🔊</span>
            <span>もういちど きく</span>
          </button>
        ) : (
          <div className="quiz-meaning">「{q.target.ja}」</div>
        )}

        <div className="quiz-choices">
          {q.choices.map(w => {
            const cls = !answered ? ''
              : w.en === q.target.en ? 'right'
              : w.en === chosen ? 'wrong' : 'dim'
            return (
              <button
                key={w.en}
                className={`quiz-choice ${cls}`}
                onClick={() => handleChoose(w)}
                disabled={answered}
              >
                {w.en}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className={`quiz-feedback ${isRight ? 'ok' : 'ng'}`}>
            <span className="quiz-feedback-mark">
              {isRight ? '⭕ せいかい！' : '💡 こたえは これ！'}
            </span>
            <span className="quiz-feedback-word">
              {q.target.en} ＝ {q.target.ja}
            </span>
          </div>
        )}

        {answered && (
          <button className="quiz-next-btn" onClick={handleNext}>
            {index + 1 < questions.length ? 'つぎへ ▶' : 'けっかを みる 🏆'}
          </button>
        )}
      </div>
    </div>
  )
}

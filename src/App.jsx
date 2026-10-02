import { useState, useEffect, useCallback } from 'react'
import PlayerSetup from './components/PlayerSetup'
import CategorySelect from './components/CategorySelect'
import GameBoard, { difficultyForPairs } from './components/GameBoard'
import ListenQuiz from './components/ListenQuiz'
import ResultScreen from './components/ResultScreen'
import { WORD_CATEGORIES, SIGHT_WORDS } from './data/sightWords'

const DEFAULT_NAMES = ['プレイヤー1', 'プレイヤー2', 'プレイヤー3', 'プレイヤー4']

/**
 * ディープリンク（ポータルの「今日の10分コース」などから直接起動）
 *   ?players=1        … 人数 1〜4（指定すると名前入力をとばす）
 *   ?pairs=4          … ペア数 4 / 8 / 12 / 16（指定するとむずかしさ選択をとばす）
 *   ?set=pronouns     … 単語セット（カテゴリID。カンマ区切りで複数、all で全部。指定するとカテゴリ選択をとばす）
 * 不正な値は無視して、従来どおりの画面を出す。
 */
function readDeepLink() {
  try {
    const q = new URLSearchParams(window.location.search)

    const n = parseInt(q.get('players'), 10)
    const players = n >= 1 && n <= 4 ? DEFAULT_NAMES.slice(0, n) : null

    const difficulty = difficultyForPairs(parseInt(q.get('pairs'), 10))

    let words = null
    const set = (q.get('set') || '').trim().toLowerCase()
    if (set === 'all') {
      words = SIGHT_WORDS
    } else if (set) {
      const valid = new Set(WORD_CATEGORIES.map(c => c.id))
      const ids = new Set(set.split(',').map(s => s.trim()).filter(id => valid.has(id)))
      if (ids.size > 0) words = SIGHT_WORDS.filter(w => ids.has(w.category))
    }

    return { players, difficulty, words }
  } catch (_) {
    return { players: null, difficulty: null, words: null }
  }
}

function initialPhase(link) {
  if (!link.players) return 'setup'
  if (!link.words) return 'category'
  return 'game'
}

export default function App() {
  useEffect(() => {
    if (window.WiseXP) window.WiseXP.init('sight-words-memory');
  }, []);

  const [link] = useState(readDeepLink)

  const [phase, setPhase] = useState(() => initialPhase(link))
  const [players, setPlayers] = useState(link.players || [])
  const [selectedWords, setSelectedWords] = useState(link.words || [])
  const [finalScores, setFinalScores] = useState([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [gameWords, setGameWords] = useState([])
  const [misses, setMisses] = useState(0)
  const [quiz, setQuiz] = useState({ correct: 0, total: 0, wrong: [] })
  const [round, setRound] = useState(0)

  const resetRound = () => {
    setFinalScores([])
    setElapsedTime(0)
    setGameWords([])
    setMisses(0)
    setQuiz({ correct: 0, total: 0, wrong: [] })
    setRound(r => r + 1)
  }

  const handleStart = (playerNames) => {
    setPlayers(playerNames)
    setPhase(link.words ? 'game' : 'category')
    if (link.words) setSelectedWords(link.words)
  }

  const handleCategorySelect = (words) => {
    setSelectedWords(words)
    setPhase('game')
  }

  const handleBackToSetup = () => {
    setPhase('setup')
    setPlayers([])
    setSelectedWords([])
    resetRound()
  }

  const handleBackToCategory = () => {
    setPhase('category')
    setSelectedWords([])
    resetRound()
  }

  // カードが全部そろった → 学習記録はまだ送らず、「きいて えらぶ」ミニ確認へ
  const handleEnd = useCallback((scores, elapsed, words, missCount) => {
    setFinalScores(scores)
    setElapsedTime(elapsed || 0)
    setGameWords(words || [])
    setMisses(missCount || 0)
    setPhase('quiz')
  }, [])

  // ミニ確認の正誤だけを学習記録にする（神経衰弱のめくり間違いは入れない）
  const handleQuizDone = (result) => {
    setQuiz(result)
    setPhase('result')
    if (window.WiseXP) {
      try {
        result.wrong.forEach(w => {
          window.WiseXP.reportWrong({ question: `🔊 ${w.word.en}（${w.word.ja}）`, correct: w.word.en, playerAnswer: w.chosen });
        })
        const totalScore = finalScores.reduce((a, b) => a + b, 0);
        window.WiseXP.reportGame({ score: totalScore, correct: result.correct, total: result.total, maxCombo: 0, grade: 'memory' });
      } catch (_) {}
    }
  }

  // もう一かい：ディープリンクで指定された設定はそのまま使う
  const handleRestart = () => {
    setPlayers(link.players || [])
    setSelectedWords(link.words || [])
    resetRound()
    setPhase(initialPhase(link))
  }

  return (
    <div className="app">
      {phase === 'setup'    && <PlayerSetup onStart={handleStart} />}
      {phase === 'category' && (
        <CategorySelect onSelect={handleCategorySelect} onBack={handleBackToSetup} />
      )}
      {phase === 'game'     && (
        <GameBoard
          key={round}
          players={players}
          wordPool={selectedWords}
          initialDifficulty={link.difficulty}
          onEnd={handleEnd}
          onBack={handleBackToCategory}
        />
      )}
      {phase === 'quiz'     && (
        <ListenQuiz
          words={gameWords}
          playerCount={players.length}
          onDone={handleQuizDone}
        />
      )}
      {phase === 'result'   && (
        <ResultScreen
          players={players}
          scores={finalScores}
          elapsedTime={elapsedTime}
          misses={misses}
          quiz={quiz}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}

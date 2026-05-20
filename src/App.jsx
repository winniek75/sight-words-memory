import { useState } from 'react'
import PlayerSetup from './components/PlayerSetup'
import CategorySelect from './components/CategorySelect'
import GameBoard from './components/GameBoard'
import ResultScreen from './components/ResultScreen'

export default function App() {
  const [phase, setPhase] = useState('setup')
  const [players, setPlayers] = useState([])
  const [selectedWords, setSelectedWords] = useState([])
  const [finalScores, setFinalScores] = useState([])
  const [elapsedTime, setElapsedTime] = useState(0)

  const handleStart = (playerNames) => {
    setPlayers(playerNames)
    setPhase('category')
  }

  const handleCategorySelect = (words) => {
    setSelectedWords(words)
    setPhase('game')
  }

  const handleBackToSetup = () => {
    setPhase('setup')
    setPlayers([])
    setSelectedWords([])
    setFinalScores([])
    setElapsedTime(0)
  }

  const handleBackToCategory = () => {
    setPhase('category')
    setSelectedWords([])
  }

  const handleEnd = (scores, elapsed) => {
    setFinalScores(scores)
    setElapsedTime(elapsed || 0)
    setPhase('result')
  }

  const handleRestart = () => {
    setPhase('setup')
    setPlayers([])
    setSelectedWords([])
    setFinalScores([])
    setElapsedTime(0)
  }

  return (
    <div className="app">
      {phase === 'setup'    && <PlayerSetup onStart={handleStart} />}
      {phase === 'category' && (
        <CategorySelect onSelect={handleCategorySelect} onBack={handleBackToSetup} />
      )}
      {phase === 'game'     && (
        <GameBoard
          players={players}
          wordPool={selectedWords}
          onEnd={handleEnd}
          onBack={handleBackToCategory}
        />
      )}
      {phase === 'result'   && (
        <ResultScreen players={players} scores={finalScores} elapsedTime={elapsedTime} onRestart={handleRestart} />
      )}
    </div>
  )
}

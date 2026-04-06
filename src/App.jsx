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
  }

  const handleBackToCategory = () => {
    setPhase('category')
    setSelectedWords([])
  }

  const handleEnd = (scores) => {
    setFinalScores(scores)
    setPhase('result')
  }

  const handleRestart = () => {
    setPhase('setup')
    setPlayers([])
    setSelectedWords([])
    setFinalScores([])
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
        <ResultScreen players={players} scores={finalScores} onRestart={handleRestart} />
      )}
    </div>
  )
}

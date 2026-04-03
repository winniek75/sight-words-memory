import { useState } from 'react'
import PlayerSetup from './components/PlayerSetup'
import GameBoard from './components/GameBoard'
import ResultScreen from './components/ResultScreen'

export default function App() {
  const [phase, setPhase] = useState('setup')
  const [players, setPlayers] = useState([])
  const [finalScores, setFinalScores] = useState([])

  const handleStart = (playerNames) => {
    setPlayers(playerNames)
    setPhase('game')
  }

  const handleBack = () => {
    setPhase('setup')
    setPlayers([])
    setFinalScores([])
  }

  const handleEnd = (scores) => {
    setFinalScores(scores)
    setPhase('result')
  }

  const handleRestart = () => {
    setPhase('setup')
    setPlayers([])
    setFinalScores([])
  }

  return (
    <div className="app">
      {phase === 'setup'  && <PlayerSetup onStart={handleStart} />}
      {phase === 'game'   && <GameBoard players={players} onEnd={handleEnd} onBack={handleBack} />}
      {phase === 'result' && (
        <ResultScreen players={players} scores={finalScores} onRestart={handleRestart} />
      )}
    </div>
  )
}

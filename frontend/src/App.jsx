import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Quiz from "./components/Quiz";
import Results from './components/Results'
import AuthModal from './components/AuthModal'
import StreakModal from './components/StreakModal'
import { useQuiz } from "./context/QuizContext";
import { useState, useEffect } from 'react'
import { useAuth } from "./context/AuthContext"

const App = () => {
  const { gameState, setGameState } = useQuiz();
  const { isLoggedIn } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [showStreak, setShowStreak] = useState(false)
  const [fading, setFading] = useState(false)

  // show/hide streak based on login state
  useEffect(() => {
    if (isLoggedIn) {
      setShowStreak(true)
    } else {
      setShowStreak(false)
    }
  }, [isLoggedIn])

  // restore streak when returning to landing
  useEffect(() => {
    if (gameState === 'landing' && isLoggedIn) {
      setShowStreak(true)
    }
  }, [gameState])

  const handlePlay = () => {
    setFading(true)
    setTimeout(() => {
      setGameState('playing')
      setShowStreak(false)
      setFading(false)
    }, 400)
  }

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuth(true)} />

      <div className={`page-content ${fading ? 'page-fading' : ''}`}>
        {gameState === 'landing' && isLoggedIn && showStreak && (
          <div className="streak-sidebar">
            <StreakModal />
          </div>
        )}
        {gameState === 'landing' && (
          <Hero onLoginClick={() => setShowAuth(true)} onPlay={handlePlay} />
        )}
        {gameState === 'playing' && <Quiz />}
        {gameState === 'finished' && <Results />}
      </div>

      {/* auth modal sits above everything */}
     {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default App;
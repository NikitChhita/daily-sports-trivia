import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Quiz from "./components/Quiz";
import Results from './components/Results'
import AuthModal from './components/AuthModal'
import StreakModal from './components/StreakModal'
import StatsModal from './components/StatsModal'
import { useQuiz } from "./context/QuizContext";
import { useState, useEffect } from 'react'
import { useAuth } from "./context/AuthContext"

const App = () => {
  const { gameState, setGameState } = useQuiz();
  const { isLoggedIn, login } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [showStreak, setShowStreak] = useState(isLoggedIn)
  const [fadingStreak, setFadingStreak] = useState(false)
  const [fading, setFading] = useState(false)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const user = params.get('user')
    if (token && user) {
      login(JSON.parse(user), token)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  useEffect(() => {
    setShowStreak(isLoggedIn)
  }, [isLoggedIn])

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

  // fades out streak then hides it
  const handleCloseStreak = () => {
    setFadingStreak(true)
    setTimeout(() => {
      setShowStreak(false)
      setFadingStreak(false)
    }, 400)
  }

  // toglges the streak calender and fades it the same way
  const handleToggleStreak = () => {
    if (showStreak) {
      handleCloseStreak()
    } else {
      setShowStreak(true)
    }
  }

  return (
    <div className="app">
      <Navbar
        onLoginClick={() => setShowAuth(true)}
        onShowStreak={handleToggleStreak}
        onShowStats={() => setShowStats(true)}
        showStreak={showStreak}
      />

      <div className={`page-content ${fading ? 'page-fading' : ''}`}>
        {gameState === 'landing' && (
          <div className="landing-layout">
            <Hero 
            onLoginClick={() => setShowAuth(true)} 
            onPlay={handlePlay}
            showStreak={showStreak}
            onShowStats={() => setShowStats(true)}
             />
            {isLoggedIn && showStreak && (
              <div className={`streak-sidebar ${fadingStreak ? 'streak-fading' : ''}`}>
                <StreakModal onClose={handleCloseStreak} />
              </div>
            )}
          </div>
        )}
        {gameState === 'playing' && <Quiz />}
        {gameState === 'finished' && <Results onShowStats={() => setShowStats(true)} 
                                              onLoginClick={() => setShowAuth(true)}
          />}
      </div>

        { /* conditionally render the modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
    </div>
  );
};

export default App;
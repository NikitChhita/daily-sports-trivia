import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Quiz from "./components/Quiz";
import Results from './components/Results'
import AuthModal from './components/AuthModal'
import { useQuiz } from "./context/QuizContext";

const App = () => {
  const { gameState } = useQuiz();
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="app">
      <Navbar onLoginClick={() => setShowAuth(true)} />
      {gameState === 'landing' && <Hero onLoginClick={() => setShowAuth(true) }  />}
      {gameState === 'playing'  && <Quiz /> }
      {gameState === 'finished' && <Results />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default App;

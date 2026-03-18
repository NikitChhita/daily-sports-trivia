import "../CSS/Hero.css";
import { useQuiz } from "../context/QuizContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { TypingAnimation } from '../components/ui/typing-animation'

const Hero = ({ onLoginClick }) => {
  const { gameState, setGameState } = useQuiz();
  const { isLoggedIn, token } = useAuth();
  const [playedToday, setPlayedToday] = useState(false);

  const hasProgress = localStorage.getItem("quiz_progress");
  const hasFinished = localStorage.getItem("quiz_finished");

  // too much is currently determined on localstorage (might need to refactor)
  // check if logged in user has already played today
  useEffect(() => {
    const checkStatus = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await fetch("http://localhost:8080/quiz/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.played) {
          setPlayedToday(true);
        }
      } catch (err) {
        console.error("Error checking quiz status", err);
      }
    };
    checkStatus();
  }, [isLoggedIn]);


  const getButtonLabel = () => {
    if (isLoggedIn && playedToday) return "View Results";
    if (!isLoggedIn && hasFinished) return "View Results";
    if (hasProgress) return "Resume";
    return "Play";
  };

  
  const handlePlay = () => {
    if (isLoggedIn && playedToday) {
      setGameState("finished");
    } else if (!isLoggedIn && hasFinished) {
      setGameState("finished");
    } else {
      setGameState("playing");
    }
  };

  return (
    <div className="hero">
      <div
        className={`hero-content ${gameState !== "landing" ? "hero-hidden" : ""}`}
      >
        <img src="/ai_img.png" alt="Sports Quiz Logo" className="hero-logo" />

        <h1 className="hero-title">
          <TypingAnimation duration={80}>
          Sports Trivia
          </TypingAnimation>
          </h1>
        <p className="hero-subtitle">
          <TypingAnimation duration={50} delay={1200}>
          Test your sports knowledge daily!
          </TypingAnimation>
          </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={handlePlay}>
            {getButtonLabel()}
          </button>
          <button className="btn-secondary" onClick={onLoginClick}>
            Log in
          </button>
        </div>

        <div className="hero-meta">
          <p className="hero-date">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p>By Nikit Chhita</p>
        </div>
      </div>

      <div className="hero-info">
        <p>Questions sourced from the Open Trivia Database</p>
        <p>10 questions daily containing mixed difficulty levels</p>
        <p>A new quiz resets every day at midnight</p>
      </div>
    </div>
  );
};

export default Hero;

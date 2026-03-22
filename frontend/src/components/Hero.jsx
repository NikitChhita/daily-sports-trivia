import "../CSS/Hero.css";
import { useQuiz } from "../context/QuizContext";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { TypingAnimation } from "../components/ui/typing-animation";
import myLogo from '../assets/myLogo.png'
import {  Accordion,  AccordionContent, AccordionItem,AccordionTrigger,} from "@/components/ui/accordion"

const Hero = ({ onLoginClick, onPlay, onShowStats }) => {
  const { gameState, setGameState } = useQuiz();
  const { isLoggedIn, token } = useAuth();
  const [playedToday, setPlayedToday] = useState(false);
  const [hasFinished, setHasFinished] = useState(() => localStorage.getItem("quiz_finished"))
  const hasProgress = localStorage.getItem("quiz_progress");


  // too much is currently determined on localstorage (might need to refactor)
  // check if logged in user has already played today
  useEffect(() => {
    const checkStatus = async () => {
      
      try {
        // only send the token if logged in otherwise dont send the header (no point)
        const res = await fetch("http://18.222.147.45:8080/quiz/status", {
          ...(isLoggedIn && { headers: { Authorization: `Bearer ${token}` } })
        });
        const data = await res.json();

        if (isLoggedIn && data.played) {
          setPlayedToday(true);
        }

        // for the guests if quiz_finished matches todays dq_id or needs to reset
        if (!isLoggedIn) {
          const finished = localStorage.getItem("quiz_finished");
          if (finished && finished !== data.dq_id.toString()) {
            //clear the day since the dq_id doesnt match
            localStorage.removeItem("quiz_finished");
            localStorage.removeItem("quiz_answers");
            localStorage.removeItem("quiz_progress");
            setHasFinished(null)
          }
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
      onPlay()
    }
  };

  return (
    <div className="hero">
      <div
        className={`hero-content ${gameState !== "landing" ? "hero-hidden" : ""}`}
      >
        <img src={myLogo} alt="Sports Quiz Logo" className="hero-logo" />

        <p className="hero-subtitle">
          <TypingAnimation duration={50}>
            Test your sports knowledge daily!
          </TypingAnimation>
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={handlePlay}>
            {getButtonLabel()}
          </button>
          <button className="btn-secondary" onClick={isLoggedIn ? onShowStats : onLoginClick}>
            {isLoggedIn ? "View Stats" : "Login In" }
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
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
           <AccordionTrigger>Where do questions from?</AccordionTrigger>
              <AccordionContent>
              Questions are sourced from the Open Trivia Database
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
           <AccordionTrigger>What is the quiz difficulty level?</AccordionTrigger>
              <AccordionContent>
              10 questions daily containing mixed difficulty levels
              </AccordionContent>
            </AccordionItem>


          <AccordionItem value="item-3">
           <AccordionTrigger>When does the quiz reset?</AccordionTrigger>
              <AccordionContent>
               A new quiz resets every day at midnight
              </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Hero;

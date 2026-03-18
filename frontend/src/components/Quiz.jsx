import { useEffect, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { useAuth } from "../context/AuthContext";
import BackgroundBeams from "./ui/beams";
import "../CSS/Quiz.css";

const Quiz = () => {
  //import out context states
  const {
    quiz,
    setQuiz,
    currentQuestion,
    setCurrentQuestion,
    answers,
    setAnswers,
    score,
    setScore,
    setGameState,
  } = useQuiz();

  const { token } = useAuth();

  // quiz states needed
  const [answerResult, setAnswerResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  // fetch the current quiz on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch("http://localhost:8080/quiz/today");
        const data = await res.json();
        setQuiz(data);

        //check localStorage to see if a player wants to resume
        const saved = localStorage.getItem("quiz_progress");
        if (saved) {
          const progress = JSON.parse(saved);
          if (progress.date === today && progress.dq_id === data.dq_id) {
            setCurrentQuestion(progress.currentQuestion);
            setAnswers(progress.answers);
            setScore(progress.score);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz", err);
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  // want to add loading animation
  if (loading || !quiz)
    return <div className="quiz-loading">Loading Quiz...</div>;

  const questions = quiz.Questions;
  const question = questions[currentQuestion];
  const options = ["option_a", "option_b", "option_c", "option_d"];
  const labels = ["A", "B", "C", "D"];
  const progress = (currentQuestion / questions.length) * 100;

  const handleOptionClick = async (option) => {
    if (submitted) return;
    try {
      const res = await fetch("http://localhost:8080/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: question.question_id,
          selected_answer: option,
        }),
      });
      const data = await res.json();

      setAnswerResult(data);
      setSubmitted(true);

      const newScore = data.is_correct ? score + 1 : score;
      const newAnswers = [
        ...answers,
        {
          question_id: question.question_id,
          selected_answer: option,
          is_correct: data.is_correct,
        },
      ];

      if (data.is_correct) setScore(newScore);
      setAnswers(newAnswers);

      // save the progress to localStorage after each question
      localStorage.setItem(
        "quiz_progress",
        JSON.stringify({
          date: today,
          dq_id: quiz.dq_id,
          currentQuestion: currentQuestion + 1,
          answers: newAnswers,
          score: newScore,
        }),
      );
      // if this is the last question, save answers for results display
      if (currentQuestion + 1 >= questions.length) {
        localStorage.setItem(
          "quiz_answers",
          JSON.stringify({
            answers: newAnswers,
            score: newScore,
            dq_id: quiz.dq_id,
          }),
        );
      }
    } catch (err) {
      console.error("Error submitting answer", err);
    }
  };

  const handleNext = async () => {
    const isLastQuestion = currentQuestion + 1 >= questions.length;

    // if its the last question we have to submit to our db
    if (isLastQuestion) {
      try {
        await fetch("http://localhost:8080/quiz/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            dq_id: quiz.dq_id,
            score: score,
            total: questions.length,
            time_taken: 0,
            answers: answers,
          }),
        });
      } catch (err) {
        console.error("Error submitting quiz", err);
      }

      // clear progress and move to results
      localStorage.removeItem("quiz_progress");
      localStorage.setItem(
        "quiz_answers",
        JSON.stringify({
          answers: answers,
          score: score,
          dq_id: quiz.dq_id,
        }),
      );

      localStorage.setItem("quiz_finished", quiz.dq_id.toString());
      setGameState("finished");
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setAnswerResult(null);
      setSubmitted(false);
    }
  };

  // highlight correct answer green, wrong answer red
  const getOptionClass = (option) => {
    if (!submitted) return "option";
    if (option === answerResult.correct_answer) return "option correct";
    if (option === answers[answers.length - 1]?.selected_answer)
      return "option wrong";
    return "option";
  };

  return (

     <div className="relative h-screen w-screen overflow-hidden ">
      
      {/* 🔥 Background */}
      <div className="absolute inset-0 -z-0 pointer-events-none opacity-100 ">
        <div className="w-full h-full blur-[4px]">
        <BackgroundBeams />
        </div>
      </div>

    <div className="relative z-10 quiz">
      <button className="btn-back" onClick={() => setGameState("landing")}>
        ‹
      </button>
      <div className="quiz-left">
        <p className="quiz-counter">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <h2 className="quiz-question">{question.question_text}</h2>
        <div className="quiz-progress-wrapper">
          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="quiz-right">
        <div className="quiz-options">
          {options.map((opt, i) => (
            <button
              key={opt}
              className={getOptionClass(question[opt])}
              onClick={() => handleOptionClick(question[opt])}
            >
              <span className="option-label">{labels[i]}</span>
              <span className="option-text">{question[opt]}</span>
            </button>
          ))}
        </div>

        {submitted && (
          <button className="btn-next" onClick={handleNext}>
            {currentQuestion + 1 >= questions.length ? (
              <>See Results ✦</>
            ) : (
              <>Next Question →</>
            )}
          </button>
        )}
      </div>
     </div>
    </div>
  );
};

export default Quiz;

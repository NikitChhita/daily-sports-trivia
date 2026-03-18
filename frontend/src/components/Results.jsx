import { useEffect, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { useAuth } from "../context/AuthContext";
import "../CSS/Results.css";

const Results = () => {
  const { quiz, setQuiz, answers, score, resetQuiz } = useQuiz();
  const { isLoggedIn, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // always fetch today's quiz for the question breakdown
        const quizRes = await fetch("http://localhost:8080/quiz/today");
        const quizData = await quizRes.json();
        setQuiz(quizData);

        // fetch correct answers now that quiz is finished
        const answersRes = await fetch(
          `http://localhost:8080/quiz/answers/${quizData.dq_id}`,
        );
        const correctData = await answersRes.json();
        setCorrectAnswers(correctData);

        if (isLoggedIn) {
          const statsRes = await fetch("http://localhost:8080/stats/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            const lastResult =
              statsData.score_history?.[statsData.score_history.length - 1];

            if (lastResult) {
              // fetch user's actual answers from DB
              const myAnswersRes = await fetch(
                `http://localhost:8080/quiz/my-answers/${quizData.dq_id}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              const myAnswersData = await myAnswersRes.json();

              // format to match our answers structure
              const formattedAnswers = myAnswersData.map((a) => ({
                question_id: a.question_id,
                selected_answer: a.selected_answer,
                is_correct: a.is_correct === 1 || a.is_correct === true,
              }));

              setResultData({
                score: lastResult.score || 0,
                answers: formattedAnswers,
              });
            } else {
              // logged in but never played today — use localStorage
              const saved = localStorage.getItem("quiz_answers");
              const progress = saved ? JSON.parse(saved) : null;
              setResultData({
                score: progress?.score || score,
                answers: progress?.answers || answers,
              });
            }
          } else {
            // token expired — fall back to localStorage
            const saved = localStorage.getItem("quiz_answers");
            const progress = saved ? JSON.parse(saved) : null;
            setResultData({
              score: progress?.score || score,
              answers: progress?.answers || answers,
            });
          }
        } else {
          // guest — pull from localStorage
          const saved = localStorage.getItem("quiz_answers");
          const progress = saved ? JSON.parse(saved) : null;
          setResultData({
            score: progress?.score || score,
            answers: progress?.answers || answers,
          });
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching results", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="quiz-loading">Loading results...</div>;

  const total = quiz?.Questions?.length || 10;
  const finalScore = resultData?.score || score;
  const finalAnswers = resultData?.answers || answers;

  const getCorrectAnswer = (question_id) => {
    const found = correctAnswers.find((a) => a.question_id === question_id);
    return found?.correct_answer || "—";
  };

  const getScoreMessage = () => {
    const pct = (finalScore / total) * 100;
    if (pct === 100) return "Perfect score! 🏆";
    if (pct >= 80) return "Outstanding! 🔥";
    if (pct >= 60) return "Great job! ⚡";
    if (pct >= 40) return "Not bad! Keep it up 💪";
    return "Better luck tomorrow! 📚";
  };

  // Used to make the modal fade out instead of instant
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      handleHome();
    }, 300);
  };

  const handleHome = () => {
    resetQuiz();
    // keep quiz_finished in localStorage so button shows "View Results"
  };

  return (
    <div
      className={`results-overlay ${closing ? "results-closing" : ""}`}
      onClick={handleClose}
    >
      <div className="results-modal" onClick={(e) => e.stopPropagation()}>
        <div className="results-header">
          <h2 className="results-title">Today's Results</h2>
          <p className="results-date">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="results-score">
          <span className="score-number">{finalScore}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{total}</span>
        </div>

        <p className="results-message">{getScoreMessage()}</p>

        {!isLoggedIn && (
          <p className="results-login-prompt">
            Login to track your stats and streaks
          </p>
        )}

        <div className="results-share">
          <p className="share-label">Share your score</p>
          <div className="share-buttons">
            <button className="share-btn twitter">𝕏 Twitter</button>
            <button className="share-btn facebook">
                <img src="/facebook-svgrepo-com.svg" width="18" height="18" alt="Facebook" />
                Facebook
                </button>
            <button className="share-btn snapchat">
                <img src="/snapchat-svgrepo-com.svg" width="18" height="18" alt="Snapchat" />
                Snapchat
                </button>
            <button className="share-btn message">Message</button>
          </div>
        </div>

        <div className="results-breakdown">
          <p className="breakdown-label">Question Breakdown</p>
          <div className="results-breakdown-grid">
            {quiz?.Questions?.map((q, i) => {
              const answer = finalAnswers[i];
              return (
                <div
                  key={q.question_id}
                  className={`breakdown-item ${answer?.is_correct ? "correct" : "wrong"}`}
                >
                  <span className="breakdown-icon">
                    {answer?.is_correct ? "✓" : "✗"}
                  </span>
                  <div className="breakdown-content">
                    <p className="breakdown-question">{q.question_text}</p>
                    <p className="breakdown-answer">
                      Your answer:{" "}
                      <span>{answer?.selected_answer || "Not answered"}</span>
                    </p>
                    {!answer?.is_correct && (
                      <p className="breakdown-correct">
                        Correct answer:{" "}
                        <span>{getCorrectAnswer(q.question_id)}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="btn-home" onClick={handleClose}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Results;

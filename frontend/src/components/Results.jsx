import { useEffect, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { useAuth } from "../context/AuthContext";
import "../CSS/Results.css";

const Results = ({ onShowStats, onLoginClick }) => {
  const { quiz, setQuiz, answers, score, resetQuiz } = useQuiz();
  const { isLoggedIn, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false)
  const [statsData, setStatsData] = useState(null)


  useEffect(() => {
    const fetchData = async () => {
      try {
        // always fetch today's quiz for the question breakdown
        const quizRes = await fetch("http://18.222.147.45:8080/quiz/today");
        const quizData = await quizRes.json();
        setQuiz(quizData);

        // fetch correct answers now that quiz is finished
        const answersRes = await fetch(
          `http://18.222.147.45:8080/quiz/answers/${quizData.dq_id}`,
        );
        const correctData = await answersRes.json();
        setCorrectAnswers(correctData);

        if (isLoggedIn) {
          const statsRes = await fetch("http://18.222.147.45:8080/stats/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStatsData(statsData)
            const lastResult =
              statsData.score_history?.[statsData.score_history.length - 1];

            if (lastResult) {
              // fetch user's actual answers from DB
              const myAnswersRes = await fetch(
                `http://18.222.147.45:8080/quiz/my-answers/${quizData.dq_id}`,
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

  // all functions for sharing to social media
  const getShareText = () => {
    const emojiGrid = finalAnswers
      .map((a) => (a?.is_correct ? "🟩" : "⬜"))
      .join("");
    const url = "https://daily-sports-trivia.com";
    const text = `${finalScore}/10 on today's Daily Sports Trivia! 🏆\n \n${emojiGrid}\n \nCan you beat me?\n \nPlay at: ${url}\n#DailySportsTrivia`;
    return {
      plain: text,
      encoded: encodeURIComponent(text),
    };
  };

  // twitter makes it seemless, other social medias are difficult
  const shareToTwitter = () => {
    const { encoded } = getShareText();
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
  };

  // opting for just copying to clipboard since other apps like facebook are tricky
  // Fixed issue of trying to copy a object instead of just the plain value with the text 

  const copyToClipboard = async () => {
      const { plain } = getShareText(); 
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const emojiGrid = finalAnswers
    .map((a) => (a?.is_correct ? "🟩" : "⬜"))
    .join("");

    

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

       {isLoggedIn && statsData ? (
            <div className="results-stats-row">
                <div className="results-stat-item">
                    <span className="results-stat-value">{statsData.total_played}</span>
                    <span className="results-stat-label">Quizzes</span>
                </div>
                <div className="results-stat-item">
                    <span className="results-stat-value">{statsData.accuracy}%</span>
                    <span className="results-stat-label">Accuracy</span>
                </div>
                <div className="results-stat-item">
                    <span className="results-stat-value">🔥 {statsData.current_streak}</span>
                    <span className="results-stat-label">Streak</span>
                </div>
                <div className="results-stat-item">
                    <span className="results-stat-value">🏆 {statsData.longest_streak}</span>
                    <span className="results-stat-label">Best Streak</span>
                </div>
                <button className="results-view-stats-btn" onClick={onShowStats}>
                    View Stats
                </button>
            </div>
        ) : !isLoggedIn ? (
            <p className="results-login-prompt" onClick={onLoginClick}>
                Login to track your stats and streaks
            </p>
        ) : null}

        <div className="results-share">
          <p className="share-label">Share your score: {emojiGrid}</p>
          <div className="share-buttons" style={{ position: 'relative'}}>
            <button className="share-btn twitter" onClick={shareToTwitter}>
              𝕏 Twitter
            </button>
            <button className="share-btn copy" onClick={copyToClipboard}>
              <img src="/share-svgrepo-com.svg" alt="share" className="w-4.5 h-4.5"/>
              Share Score
            </button>

              { /* notification modal to show its been copied  */ }
              {copied && <div className="copied-toast">✓ Copied to clipboard! </div>}
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
                  { /* i is the question index + 1 since its 0 based indexed */ }
                  <span className="breakdown-icon">
                    {i + 1 + "). "}
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

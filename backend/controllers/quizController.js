const {
  DailyQuiz,
  Question,
  QuizResult,
  UserAnswer,
  Streak,
} = require("../models/index");

// GET /quiz/today — returns today's questions without correct answers
const getTodayQuiz = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const quiz = await DailyQuiz.findOne({
      where: { quiz_date: today },
      include: [
        {
          model: Question,
          attributes: [
            "question_id",
            "question_text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "difficulty",
          ],
        },
      ],
    });

    if (!quiz) {
      return res.status(404).json({ message: "No quiz found for today" });
    }

    res.json(quiz);
  } catch (err) {
    console.error("Error getting today quiz", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /quiz/answer — checks one answer and returns correct/wrong instantly
const submitAnswer = async (req, res) => {
  try {
    const { question_id, selected_answer } = req.body;

    const question = await Question.findOne({
      where: { question_id },
      attributes: ["question_id", "correct_answer"],
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const is_correct = selected_answer === question.correct_answer;

    res.json({
      is_correct,
      correct_answer: question.correct_answer,
    });
  } catch (err) {
    console.error("Error submitting answer", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /quiz/submit — saves final quiz result to DB
// We save all guest data in QuizResults but only userAnswers data if a user is logged in
const submitQuiz = async (req, res) => {
  try {
    const { dq_id, score, total, time_taken, answers } = req.body;
    const user_id = req.user?.user_id; // checks if user is logged basically or just null


    // save quiz result
    const quizResult = await QuizResult.create({
      user_id: user_id || null,
      dq_id,
      score,
      total,
      time_taken,
    });

    // save each individual answer
    if(user_id) {
    const userAnswers = answers.map((a) => ({
      qr_id: quizResult.qr_id,
      question_id: a.question_id,
      user_id: user_id || null,
      selected_answer: a.selected_answer,
      is_correct: a.is_correct,
    }));
    await UserAnswer.bulkCreate(userAnswers);
  }

    res.json({
      message: "Quiz submitted successfully",
      score,
      total,
    });
  } catch (err) {
    console.error("Error submitting quiz", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTodayQuiz, submitAnswer, submitQuiz };

const {
  DailyQuiz,
  Question,
  QuizResult,
  UserAnswer,
  Streak,
} = require("../models/index");

const updateStreak = async (user_id) => {
  const streak = await Streak.findOne({ where: { user_id } });
  if (!streak) {
    return;
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
  const lastPlayed = streak.last_played_date;

  // dont update streak again
  if (lastPlayed === today) {
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // let since newStreaks value will be changing
  let newStreak;
  // if you played yesyerday and day then update streak
  if (lastPlayed === yesterdayStr) {
    newStreak = streak.current_streak + 1;
  } else {
    // you didnt play yesterday so streak resets
    newStreak = 1;
  }

  await streak.update({
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, streak.longest_streak),
    last_played_date: today,
  });
};

// GET /quiz/today — returns today's questions without correct answers
const getTodayQuiz = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });

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

    if (user_id) {
      const alreadySubmitted = await QuizResult.findOne({
        where: { user_id, dq_id },
      });
      if (alreadySubmitted) {
        return res
          .status(400)
          .json({ message: "You have already submitted this quiz" });
      }
    }

    // save quiz result
    const quizResult = await QuizResult.create({
      user_id: user_id || null,
      dq_id,
      score,
      total,
      time_taken,
    });

    // save each individual answer
    const userAnswers = answers.map((a) => ({
      qr_id: quizResult.qr_id,
      question_id: a.question_id,
      user_id: user_id || null,
      selected_answer: a.selected_answer,
      is_correct: a.is_correct,
    }));
    await UserAnswer.bulkCreate(userAnswers);

    if (user_id) {
      await updateStreak(user_id);
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

const getQuizStatus = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });

    const quiz = await DailyQuiz.findOne({ where: { quiz_date: today } });
    if (!quiz) {
      return res.status(404).json({ message: "No quiz today" });
    }

    if (!user_id) {
      return res.json({ played: false, dq_id: quiz.dq_id });
    }

    const result = await QuizResult.findOne({
      where: { user_id, dq_id: quiz.dq_id },
    });

    res.json({
      played: !!result,
      dq_id: quiz.dq_id,
      result: result || null,
    });
  } catch (err) {
    console.error("Error getting quiz status", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getQuizAnswers = async (req, res) => {
  try {
    const { dq_id } = req.params;
    const questions = await Question.findAll({
      where: { dq_id },
      attributes: ["question_id", "correct_answer"],
    });
    res.json(questions);
  } catch (err) {
    console.error("Error getting answers", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getMyAnswers = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { dq_id } = req.params;

    const userAnswers = await UserAnswer.findAll({
      where: { user_id },
      include: [
        {
          model: Question,
          where: { dq_id },
          attributes: ["question_id", "question_text"],
        },
      ],
      attributes: ["question_id", "selected_answer", "is_correct"],
    });

    res.json(userAnswers);
  } catch (err) {
    console.error("Error getting user answers", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTodayQuiz,
  submitAnswer,
  submitQuiz,
  getQuizStatus,
  getQuizAnswers,
  getMyAnswers,
};

const { QuizResult, Streak, User, DailyQuiz } = require("../models/index");
// SQL helper functions for creating our get methods
const { Op, fn, col, literal } = require("sequelize");

const getMyStats = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    //get all quiz results for this user from id
    const results = await QuizResult.findAll({
      where: { user_id },
      include: [{ model: DailyQuiz, attributes: ["quiz_date"] }],
      order: [["completed_at", "ASC"]],
    });

    // get streak info
    const streak = await Streak.findOne({ where: { user_id } });

    const total_played = results.length;
    const scores = results.map((r) => r.score);

    // getting the average else 0 if 0 quizzes played
    const average_score =
      total_played > 0
        ? (scores.reduce((a, b) => a + b, 0) / total_played).toFixed(1)
        : 0;
    const best_score = total_played > 0 ? Math.max(...scores) : 0;

    // score history for graph
    const score_history = results.map((r) => ({
      date: r.DailyQuiz.quiz_date,
      score: r.score,
      total: r.total,
    }));

    // played_dates: all dates played per user, used for our calender streak view
    const played_dates = results.map(r => r.DailyQuiz.quiz_date)

    // percentile  (how many users have a lower average score than this user)
    const allAverages = await QuizResult.findAll({
      attributes: ["user_id", [fn("AVG", col("score")), "average_score"]],
      where: { user_id: { [Op.ne]: null } },
      group: ["user_id"],
    });

    const totalUsers = allAverages.length;
    const usersBelow = allAverages.filter(
      (u) => parseFloat(u.dataValues.average_score) < parseFloat(average_score),
    ).length;

    // calculate percentile used for our percentile bar graph
    const percentile =
      totalUsers > 1 ? Math.round((usersBelow / (totalUsers - 1)) * 100) : 100;

    // our returning data of the user
    res.json({
      total_played,
      average_score,
      best_score,
      current_streak: streak?.current_streak || 0,
      longest_streak: streak?.longest_streak || 0,
      score_history,
      played_dates,
      percentile,
    });
  } catch (err) {
    console.error("Error getting stats", err);
    res.status(500).json({ message: "Server error " });
  }
};


// top 10 leaderboard for all time average_score
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await QuizResult.findAll({
      attributes: [
        "user_id",
        [fn("AVG", col("score")), "average_score"],
        [fn("COUNT", col("qr_id")), "total_played"],
        [fn("MAX", col("score")), "best_score"],
      ],
      where: {
        user_id: { [Op.ne]: null }, // exclude guests 
      },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
      group: ["user_id", "User.user_id"],
      order: [[literal("average_score"), "DESC"]],
      limit: 10,
    });

    res.json(leaderboard);
  } catch (err) {
    console.error("Error getting leaderboard", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMyStats, getLeaderboard };

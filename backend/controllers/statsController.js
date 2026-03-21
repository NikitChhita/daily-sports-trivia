const { QuizResult, Streak, User, DailyQuiz, UserAnswer } = require("../models/index");
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

        // logged in users excluding myself
        const loggedInAverages = await QuizResult.findAll({
            attributes: ["user_id", [fn("AVG", col("score")), "avg"]],
            where: {
                user_id: {
                    [Op.and]: [
                        { [Op.ne]: null },
                        { [Op.ne]: user_id }
                    ]
                }
            },
            group: ["user_id"],
        })

        // guests, each qr_id is a separate session since theres no guest_id
        const guestAverages = await QuizResult.findAll({
            attributes: ["qr_id", [fn("AVG", col("score")), "avg"]],
            where: { user_id: null },
            group: ["qr_id"],
        })

        const allOtherAverages = [
            ...loggedInAverages.map(u => parseFloat(u.dataValues.avg)),
            ...guestAverages.map(u => parseFloat(u.dataValues.avg))
        ]

        const totalOthers = allOtherAverages.length
        const othersBelow = allOtherAverages.filter(avg => avg < parseFloat(average_score)).length

        const percentile = totalOthers > 0
            ? Math.round((othersBelow / totalOthers) * 100)
            : 100

            // Get the average over all correct and all answered questions
            const accuracyData = await UserAnswer.findAll({
            where: { user_id },
            attributes: [
                [fn('COUNT', col('ua_id')), 'total'],
                [fn('SUM', literal('is_correct')), 'correct']
            ]
        })

    const totalAnswers = parseInt(accuracyData[0].dataValues.total) || 0
    const correctAnswers = parseInt(accuracyData[0].dataValues.correct) || 0
    // Success Rate 
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

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
      accuracy
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

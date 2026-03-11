const User = require("./User");
const DailyQuiz = require("./DailyQuiz");
const Question = require("./Question");
const QuizResult = require("./QuizResult");
const UserAnswer = require("./UserAnswer");
const Streak = require("./Streak");

//Creating relationships between entities

// User relations
User.hasOne(Streak, { foreignKey: "user_id" });
User.hasMany(QuizResult, { foreignKey: "user_id" });
User.hasMany(UserAnswer, { foreignKey: "user_id" });

// DailyQuiz relations
DailyQuiz.hasMany(Question, { foreignKey: "dq_id" });
DailyQuiz.hasMany(QuizResult, { foreignKey: "dq_id" });

// Question relations
Question.hasMany(UserAnswer, { foreignKey: "question_id" });

// QuizResult
QuizResult.hasMany(UserAnswer, { foreignKey: "qr_id" });

// Reverse relations
Streak.belongsTo(User, { foreignKey: "user_id" });
QuizResult.belongsTo(User, { foreignKey: "user_id" });
QuizResult.belongsTo(DailyQuiz, { foreignKey: "dq_id" });
UserAnswer.belongsTo(User, { foreignKey: "user_id" });
UserAnswer.belongsTo(QuizResult, { foreignKey: "qr_id" });
UserAnswer.belongsTo(Question, { foreignKey: "question_id" });
Question.belongsTo(DailyQuiz, { foreignKey: "dq_id" });

module.exports = { User, DailyQuiz, Question, QuizResult, UserAnswer, Streak };

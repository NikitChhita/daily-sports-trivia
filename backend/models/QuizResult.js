const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const QuizResult = sequelize.define(
  "QuizResult",
  {
    qr_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dq_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    time_taken: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "quiz_results",
    timestamps: true,
    createdAt: "completed_at",
    updatedAt: false,
  },
);

module.exports = QuizResult;

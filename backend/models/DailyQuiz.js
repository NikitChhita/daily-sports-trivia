const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DailyQuiz = sequelize.define(
  "DailyQuiz",
  {
    dq_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    quiz_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Sports",
    },
  },
  {
    tableName: "daily_quiz",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = DailyQuiz;

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const UserAnswer = sequelize.define(
  "UserAnswer",
  {
    ua_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "user_id",
      },
    },
    qr_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    selected_answer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "user_answers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = UserAnswer;

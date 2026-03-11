const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Streak = sequelize.define(
  "Streak",
  {
    streak_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    current_streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    longest_streak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_played_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "streak",
    timestamps: true,
    createdAt: false,
    updatedAt: "updated_at",
  },
);

module.exports = Streak;

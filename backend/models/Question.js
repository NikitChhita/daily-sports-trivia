const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Question = sequelize.define('Question', {
    question_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    dq_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    correct_answer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_a: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_b: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_c: {
        type: DataTypes.STRING,
        allowNull: false
    },
    option_d: {
        type: DataTypes.STRING,
        allowNull: false
    },
    difficulty: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'questions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
})

module.exports = Question
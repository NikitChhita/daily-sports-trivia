const express = require('express')
const router = express.Router()
const { getTodayQuiz, submitAnswer, submitQuiz } = require('../controllers/quizController')

router.get('/today', getTodayQuiz)
router.post('/answer', submitAnswer)
router.post('/submit', submitQuiz)

module.exports = router
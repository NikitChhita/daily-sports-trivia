const express = require('express')
const router = express.Router()
const { getTodayQuiz, submitAnswer, submitQuiz } = require('../controllers/quizController')
const { optionalAuth } = require('../middleware/authMiddleware')

router.get('/today', getTodayQuiz)
router.post('/answer', submitAnswer)
router.post('/submit', optionalAuth, submitQuiz)

module.exports = router

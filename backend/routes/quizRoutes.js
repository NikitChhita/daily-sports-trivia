const express = require('express')
const router = express.Router()
const { getTodayQuiz, submitAnswer, submitQuiz, getQuizStatus } = require('../controllers/quizController')
const { optionalAuth } = require('../middleware/authMiddleware')

router.get('/today', getTodayQuiz)
router.post('/answer', submitAnswer)
router.post('/submit', optionalAuth, submitQuiz)
router.get('/status', optionalAuth, getQuizStatus)

module.exports = router

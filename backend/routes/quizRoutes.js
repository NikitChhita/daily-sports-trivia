const express = require('express')
const router = express.Router()
const { getTodayQuiz, submitAnswer, submitQuiz, getQuizStatus, getQuizAnswers, getMyAnswers } = require('../controllers/quizController')
const { optionalAuth } = require('../middleware/authMiddleware')
const { authMiddleware } = require('../middleware/authMiddleware')

router.get('/today', getTodayQuiz)
router.post('/answer', submitAnswer)
router.post('/submit', optionalAuth, submitQuiz)
router.get('/status', optionalAuth, getQuizStatus)
router.get('/answers/:dq_id', getQuizAnswers)
router.get('/my-answers/:dq_id', authMiddleware, getMyAnswers)


module.exports = router

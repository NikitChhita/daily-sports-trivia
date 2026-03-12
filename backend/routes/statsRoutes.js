const express = require('express')
const router = express.Router()
const { getMyStats, getLeaderboard } = require('../controllers/statsController')
const { authMiddleware } = require('../middleware/authMiddleware')

router.get('/me', authMiddleware, getMyStats)
router.get('/leaderboard', getLeaderboard)

module.exports = router
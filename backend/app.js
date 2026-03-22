const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./config/db')
const { fetchDailyQuiz } = require('./jobs/fetchDailyQuiz')
const quizRoutes = require('./routes/quizRoutes')
const authRoutes = require('./routes/authRoutes')
const statsRoutes = require('./routes/statsRoutes')
const passport = require('./config/passport')
const googleAuthRoutes = require('./routes/googleAuthRoutes')



// Node will read .env file and process variables
dotenv.config();

const { User, DailyQuiz, Question, QuizResult, UserAnswer, Streak } = require('./models/index')
const app = express();
const helmet = require('helmet')
app.use(helmet())

app.use(cors());
app.use(express.json())

// Tell express where to mount
app.use('/quiz', quizRoutes)
app.use('/auth', authRoutes)
app.use('/stats', statsRoutes)
app.use(passport.initialize())
app.use('/auth', googleAuthRoutes)

const startServer = async () => {
    await connectDB()
    // Experimenting to trouble shoot errors
    // Syncing in a certain order to avoid errors with relationships
    await sequelize.sync({ force: false, alter: false })
    await User.sync({ force: false })
    await DailyQuiz.sync({ force: false })
    await Question.sync({ force: false })
    await QuizResult.sync({ force: false })
    await UserAnswer.sync({ force: false })
    await Streak.sync({ force: false })

    console.log('Tables synced successfully')

    await fetchDailyQuiz()
    
    app.get('/', (req, res) => {
        res.json({ message: 'Sports Quiz API is running' })
    })

    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

startServer()


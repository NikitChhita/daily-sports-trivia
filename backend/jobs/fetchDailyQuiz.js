const cron = require('node-cron')
const fetch = require('node-fetch')
const he = require('he')
const { DailyQuiz, Question } = require('../models/index')

// Fuction to shuffle the array of questions randomly
// array.sort and Math.random was not randomizing it correctly, Switching to 'Fisher-Yates'

const shuffleArray = (array) => {
    for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
    return array
}

// Fetches questions from OptenTDB API for a given  difficult and amount (10)
const fetchQuestions = async (amount, difficulty, retries = 3) => {
    const url = `https://opentdb.com/api.php?amount=${amount}&category=21&difficulty=${difficulty}&type=multiple`
    const res = await fetch(url)
    const data = await res.json()

    if (data.response_code === 5 && retries > 0) {
        console.log(`Rate limited on ${difficulty}, retrying in 10 seconds... (${retries} retries left)`)
        await new Promise(resolve => setTimeout(resolve, 10000))
        return fetchQuestions(amount, difficulty, retries - 1)
    }

    if (!data.results || data.results.length === 0) {
        throw new Error(`Failed to fetch ${difficulty} questions. Response code: ${data.response_code}`)
    }

    console.log(`Fetched ${difficulty}:`, data)
    return data.results
    }

// Encode from the default encoding from the API
const formatQuestion = (q, dq_id, difficulty) => {
    const correct = he.decode(q.correct_answer)
    const incorrect = q.incorrect_answers.map(a => he.decode(a))

    // creating a new array with all 4 options then shuffle to fix shuffle issue
    const allOptions = [correct, incorrect[0], incorrect[1], incorrect[2]]
    const options = shuffleArray([...allOptions]) // spread to force new array in random order

    return {
        dq_id,
        question_text: he.decode(q.question),
        correct_answer: correct,
        option_a: options[0],
        option_b: options[1],
        option_c: options[2],
        option_d: options[3],
        difficulty
    }
}

// Creating the daily quiz with a combination of Easy, Medium, and Hard Questions
const fetchDailyQuiz = async () => {
    try {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

        //checking if the todays quiz already exists
        const existing = await DailyQuiz.findOne({ where: {quiz_date: today} })
        if(existing) {
            console.log('Daily quiz already exists for today')
            return
        }
        
        // deciding the split of easy medium hard we want in the quiz
        
         const easy = await fetchQuestions(3, 'easy')
         const medium = await fetchQuestions(5, 'medium')
         const hard = await fetchQuestions(2, 'hard')
        

        // create todays quiz entry with date
        const dailyQuiz = await DailyQuiz.create({  quiz_date: today })

        // format and combine all questions and then shuffle them 
        const allQuestions = shuffleArray([
            ...easy.map(q => formatQuestion(q, dailyQuiz.dq_id, 'easy')),
            ...medium.map(q => formatQuestion(q, dailyQuiz.dq_id, 'medium')),
            ...hard.map(q => formatQuestion(q, dailyQuiz.dq_id, 'hard'))
        ])
        // save all of our questions to the DB
        await Question.bulkCreate(allQuestions)

        console.log(`Daily quiz created for ${today} with ${allQuestions.length} questions`)

    }  catch(err) {
        console.error('Error fetching daily quiz', err)
    }
}


// Cron schedular to fetch new daily quiz at midnight EST not UTC
cron.schedule( '0 0 * * *', async () => {
    console.log('Cron fired - running daily quiz fetch...')
    try {
        await fetchDailyQuiz()
        console.log('Cron completed successfully')
    } catch (err) {
        console.error('Cron job failed:', err)
    }
}, {
    timezone: 'America/New_York'
})

// Incase we want to run this manually
module.exports = { fetchDailyQuiz }
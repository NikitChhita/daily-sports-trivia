import { createContext, useContext, useState } from 'react'

// creates an empty context object for quiz state
const QuizContext = createContext()

export const QuizProvider = ({ children }) => {

    // holds the quiz data fetched from backend — questions, options, dq_id etc
    // starts as null until we fetch it
    const [quiz, setQuiz] = useState(null)

    // controls what's showing on screen
    // 'landing' → hero page, 'playing' → quiz, 'finished' → results
    const [gameState, setGameState] = useState('landing')

    // builds up as the user answers questions
    // by the end its an array of 10 answer objects sent to backend on submit
    const [answers, setAnswers] = useState([])

    // tracks how many questions the user got correct
    const [score, setScore] = useState(0)

    // tracks which of the 10 questions the user is currently on
    const [currentQuestion, setCurrentQuestion] = useState(0)

    // resets everything back to the start
    const resetQuiz = () => {
        setAnswers([])
        setScore(0)
        setCurrentQuestion(0)
        setGameState('landing')
    }

    // makes all quiz state available to every component
    return (
        <QuizContext.Provider value={{
            quiz,
            setQuiz,
            gameState,
            setGameState,
            answers,
            setAnswers,
            score,
            setScore,
            currentQuestion,
            setCurrentQuestion,
            resetQuiz
        }}>
            {children}
        </QuizContext.Provider>
    )
}

// custom hook so any component can just do const { quiz } = useQuiz()
export const useQuiz = () => useContext(QuizContext)
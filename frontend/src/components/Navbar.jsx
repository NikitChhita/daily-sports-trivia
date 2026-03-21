import '../CSS/Navbar.css'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import Leaderboard from '../components/Leaderboard'
import { ChevronDown, LogOutIcon, UserIcon, SettingsIcon, CalendarIcon, BarChartIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const Navbar = ({ onLoginClick, onShowStreak, onShowStats, showStreak }) => {
    const { isLoggedIn, user, logout } = useAuth()
    const [quizNumber, setQuizNumber] = useState(null)
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
    const intervalRef = useRef(null)

    const getTimeUntilMidnight = () => {
        const now = new Date()
        const midnight = new Date()
        midnight.setHours(24, 0, 0, 0)
        const diff = midnight - now
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
        }
    }

    const pad = (n) => String(n).padStart(2, '0')

    useEffect(() => {
        setTimeLeft(getTimeUntilMidnight())
        intervalRef.current = setInterval(() => {
            setTimeLeft(getTimeUntilMidnight())
        }, 1000)
        return () => clearInterval(intervalRef.current)
    }, [])

    useEffect(() => {
        const fetchQuizNumber = async () => {
            try {
                const res = await fetch('http://localhost:8080/quiz/status')
                const data = await res.json()
                setQuizNumber(data.dq_id)
            } catch (err) {
                console.error('Error fetching quiz number', err)
            }
        }
        fetchQuizNumber()
    }, [])

    return (
       <nav className="navbar">
            <div className="navbar-left">
                <span className="navbar-title">Daily Sports Trivia {quizNumber && `#${quizNumber}`}</span>
            </div>

            <div className="navbar-timer">
                <div className="timer-display">
                    <div className="timer-unit">
                        <span className="timer-number">{pad(timeLeft.hours)}</span>
                        <span className="timer-unit-label">hrs</span>
                    </div>
                    <div className="timer-sep" />
                    <div className="timer-unit">
                        <span className="timer-number">{pad(timeLeft.minutes)}</span>
                        <span className="timer-unit-label">min</span>
                    </div>
                    <div className="timer-sep" />
                    <div className="timer-unit">
                        <span className="timer-number">{pad(timeLeft.seconds)}</span>
                        <span className="timer-unit-label">sec</span>
                    </div>
                </div>
            </div>
        
            <div className="navbar-actions">
                <Leaderboard />
                <a href="https://github.com/NikitChhita/daily-sports-trivia" target="_blank" rel="noreferrer" className="btn-github">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '11px', verticalAlign: 'middle' }}>
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                </a>

                {isLoggedIn ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="navbar-user">
                                <img src="/user-circle-svgrepo-com.svg" width="24" height="24" alt="user" className="user-icon" />
                                <span className="user-name">{user?.username}</span>
                                <ChevronDown size={14} color="#9ca3af" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <UserIcon />
                                Profile (N/A)
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <SettingsIcon />
                                Settings  (N/A)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onShowStreak}>
                                <CalendarIcon />
                                Toggle Streak
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onShowStats}>
                                <BarChartIcon />
                                View Stats
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={logout}>
                                <LogOutIcon />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <button className="btn-login" onClick={onLoginClick}>
                        Login
                    </button>
                )}
            </div>
        </nav>
    )
}

export default Navbar
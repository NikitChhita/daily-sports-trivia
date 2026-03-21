import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import '../CSS/StreakModal.css'

const StreakModal = ({ onClose }) => {
    const { token, user } = useAuth()
    const [stats, setStats] = useState(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [closing, setClosing] = useState(false)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:8080/stats/me', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json()
                setStats(data)
                setLoading(false)
            } catch (err) {
                console.error('Error fetching stats', err)
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const handleClose = () => {
        setClosing(true)
        setTimeout(() => onClose(), 400)
    }

    if (loading) return null

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()

    const createdAt = user?.created_at ? new Date(user.created_at) : new Date()
    const createdMonth = new Date(createdAt.getFullYear(), createdAt.getMonth(), 1)
    const currentMonthStart = new Date(year, month, 1)
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const canGoPrev = currentMonthStart > createdMonth
    const canGoNext = currentMonthStart < todayMonthStart

    const prevMonth = () => { if (canGoPrev) setCurrentMonth(new Date(year, month - 1, 1)) }
    const nextMonth = () => { if (canGoNext) setCurrentMonth(new Date(year, month + 1, 1)) }

    const getDayStatus = (day) => {
        const date = new Date(year, month, day)
        const dateStr = date.toLocaleDateString('en-CA')
        const isToday = date.toDateString() === today.toDateString()
        const isFuture = date > today
        const isBeforeAccount = date < new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate())
        const isPlayed = stats?.played_dates?.includes(dateStr)

        if (isBeforeAccount) return 'future'
        if (isToday && isPlayed) return 'played'
        if(isToday) return 'today'
        if (isFuture) return 'future'
        if (isPlayed) return 'played'
        return 'missed'
    }

    return (
        <div className={`streak-panel ${closing ? 'streak-closing' : ''}` }>
            <button className="streak-close-btn" onClick={handleClose}>✕</button>
            <div className="streak-panel-header">
                <button className="streak-nav-btn" onClick={prevMonth} disabled={!canGoPrev}>‹</button>
                <span className="streak-month">{monthName}</span>
                <button className="streak-nav-btn" onClick={nextMonth} disabled={!canGoNext}>›</button>
            </div>

            <div className="streak-calendar">
                <div className="streak-weekdays">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                        <span key={i} className="streak-weekday">{d}</span>
                    ))}
                </div>
                <div className="streak-grid">
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="streak-day empty" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const status = getDayStatus(day)
                        return (
                            <div key={day} className={`streak-day ${status}`}>
                                <span className="streak-day-number">{day}</span>
                                {status === 'played' && <span className="streak-day-icon">✓</span>}
                                {status === 'missed' && <span className="streak-day-icon">x</span>}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="streak-footer">
                <div className="streak-stat">
                    <span className="streak-stat-label">Current Streak</span>
                    <div className="streak-stat-value">
                        <span>🔥</span>
                        <span>{stats?.current_streak || 0} {stats?.current_streak === 1 ? 'day' : 'days'}</span>
                    </div>
                </div>
                <div className="streak-stat">
                    <span className="streak-stat-label">Best Streak</span>
                    <div className="streak-stat-value">
                        <span>🏆</span>
                        <span>{stats?.longest_streak || 0} {stats?.longest_streak === 1 ? 'day' : 'days'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StreakModal
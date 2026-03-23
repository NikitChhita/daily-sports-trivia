import { useState, useEffect, useRef } from 'react'
import '../CSS/Leaderboard.css'
import { Skeleton } from '@/components/ui/skeleton'

const Leaderboard = () => {
    const [open, setOpen] = useState(false)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const containerRef = useRef(null)

    const fetchLeaderboard = async () => {
        if (data.length > 0) return // don't refetch if already loaded
        setLoading(true)
        try {
            const res = await fetch('https://api.daily-sports-trivia.com/stats/leaderboard')
            const json = await res.json()
            setData(json)
        } catch (err) {
            console.error('Error fetching leaderboard', err)
        }
        setLoading(false)
    }

    const handleMouseEnter = () => {
        setOpen(true)
        fetchLeaderboard()
    }

    const handleMouseLeave = () => {
        setOpen(false)
    }

    const getRankDisplay = (index) => {
        if (index === 0) return '🥇'
        if (index === 1) return '🥈'
        if (index === 2) return '🥉'
        return `${index + 1}.`
    }

    return (
        <div
            className="leaderboard-wrapper"
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button className="btn-leaderboard">
                🏆 Leaderboard
            </button>

            {open && (
                <div className="leaderboard-dropdown">
                    <p className="leaderboard-title">Top Players</p>
                    <div className="leaderboard-divider" />

                    {loading ? (
                        <p className="leaderboard-loading">Loading...</p>
                    ) : data.length === 0 ? (
                        <p className="leaderboard-loading">No players yet</p>
                    ) : (
                        <>
                            {data.slice(0, 5).map((player, i) => (
                                <div key={i} className="leaderboard-row">
                                    <span className="leaderboard-rank">{getRankDisplay(i)}</span>
                                    <span className="leaderboard-username">{player.User?.username}</span>
                                    <span className="leaderboard-score">
                                        {parseFloat(player.average_score).toFixed(1) * 10}% avg 
                                    </span>
                                </div>
                            ))}

                            {/* fill remaining spots with placeholders */}
                            {Array.from({ length: Math.max(0, 5 - data.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="leaderboard-row">
                                    <span className="leaderboard-rank">{getRankDisplay(data.length + i)}</span>
                                    <Skeleton className="h-3 w-24 bg-gray-700" />
                                    <Skeleton className="h-3 w-10 bg-gray-700" />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Leaderboard
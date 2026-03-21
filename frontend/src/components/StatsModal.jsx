import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import '../CSS/StatsModal.css'

const chartConfig = {
    score: {
        label: 'Score',
        color: '#22c55e',
    },
}

const StatsModal = ({ onClose }) => {
    const { token, user } = useAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [closing, setClosing] = useState(false)
    const [timeRange, setTimeRange] = useState('week')

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = 'unset' }
    }, [])

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
        setTimeout(() => onClose(), 300)
    }

    const getChartData = () => {
        const history = stats?.score_history || []
        const now = new Date()

        // for week only want 5 recent data points 
        if (timeRange === 'week') {
            const cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000)
            return history
                .filter(e => new Date(e.date) >= cutoff)
                .map(e => ({
                    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    score: e.score
                }))
        }

        //all month data points but no text below to avoid cramping
        if (timeRange === 'month') {
            const cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000)
            return history
                .filter(e => new Date(e.date) >= cutoff)
                .map(e => ({
                    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    score: e.score
                }))
        }

        // show the average of each month
        if (timeRange === 'year') {
            const cutoff = new Date(now - 365 * 24 * 60 * 60 * 1000)
            const filtered = history.filter(e => new Date(e.date) >= cutoff)

            const grouped = {}
            filtered.forEach(e => {
                const key = new Date(e.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                if (!grouped[key]) grouped[key] = []
                grouped[key].push(e.score)
            })

            return Object.entries(grouped).map(([month, scores]) => ({
                date: month,
                score: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
            }))
        }
    }

    const chartData = getChartData()

    const getOrdinal = (n) => {
        const s = ['th', 'st', 'nd', 'rd']
        const v = n % 100
        return n + (s[(v - 20) % 10] || s[v] || s[0])
    }

    return (
        <div className={`stats-overlay ${closing ? 'stats-closing' : ''}`} onClick={handleClose}>
            <div className="stats-modal" onClick={e => e.stopPropagation()}>

                <div className="stats-header">
                    <h2 className="stats-title"> Your Stats</h2>
                    <button className="stats-close-btn" onClick={handleClose}>✕</button>
                </div>

                {loading ? (
                    <div className="stats-loading">Loading...</div>
                ) : (
                    <>
                        <div className="stats-row">
                            <div className="stat-item">
                                <span className="stat-value">{stats?.total_played || 0}</span>
                                <span className="stat-label">Quizzes Taken</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{stats?.accuracy || 0}%</span>
                                <span className="stat-label">Accuracy</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">🔥 {stats?.current_streak || 0}</span>
                                <span className="stat-label">Current Streak</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">🏆 {stats?.longest_streak || 0}</span>
                                <span className="stat-label">Best Streak</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{stats?.best_score || 0}/10</span>
                                <span className="stat-label">Best Score</span>
                            </div>
                        </div>

                        <div className="stats-panels">

                            {/* percentile ring */}
                            <div className="stats-panel">
                                <p className="panel-label">Percentile</p>
                                <div className="percentile-ring-container">
                                    <svg className="percentile-ring" viewBox="0 0 120 120">
                                        <circle
                                            cx="60" cy="60" r="50"
                                            fill="none"
                                            stroke="#1f2937"
                                            strokeWidth="10"
                                        />
                                        <circle
                                            cx="60" cy="60" r="50"
                                            fill="none"
                                            stroke="#22c55e"
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 50}`}
                                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - (stats?.percentile || 0) / 100)}`}
                                            transform="rotate(-90 60 60)"
                                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                                        />
                                        {/* percentile number */}
                                        <text x="60" y="66" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">
                                            {getOrdinal(stats?.percentile || 0)}
                                        </text>
                                        <text x="60" y="78" textAnchor="middle" fill="#6b7280" fontSize="7">
                                            PERCENTILE
                                        </text>
                                    </svg>
                                    <p className="percentile-sub">
                                        Better than {stats?.percentile || 0}% of all players
                                    </p>
                                </div>
                            </div>

                            {/* the score over time */}
                            <div className="stats-panel">
                                <div className="panel-header">
                                    <p className="panel-label">Score Over Time</p>
                                    <div className="chart-selector">
                                        <button
                                            className={`chart-btn ${timeRange === 'week' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('week')}
                                        >W</button>
                                        <button
                                            className={`chart-btn ${timeRange === 'month' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('month')}
                                        >M</button>
                                        <button
                                            className={`chart-btn ${timeRange === 'year' ? 'active' : ''}`}
                                            onClick={() => setTimeRange('year')}
                                        >Y</button>
                                    </div>
                                </div>
                                {chartData && chartData.length > 0 ? (
                                    <ChartContainer config={chartConfig} className="stats-chart">
                                        <LineChart data={chartData} margin={{ top: 10, left: 0, right: 20, bottom: 0 }}>
                                            <CartesianGrid vertical={false} stroke="#1f2937" />
                                            <XAxis
                                                dataKey="date"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                fontSize={10}
                                                tick={{ fill: '#6b7280' }}
                                                interval={timeRange === 'month' ? 4 : 0}
                                            />
                                            <YAxis
                                                domain={[0, 10]}
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                fontSize={10}
                                                tick={{ fill: '#6b7280' }}
                                            />
                                            <ChartTooltip
                                                cursor={false}
                                                content={({ active, payload, label }) => {
                                                    if (active && payload && payload.length) {
                                                        return (
                                                            <div style={{
                                                                background: '#1f2937',
                                                                border: '1px solid #374151',
                                                                borderRadius: '6px',
                                                                padding: '2px 12px',
                                                                textAlign: 'center'
                                                            }}>
                                                                <p style={{ fontSize: '0.65rem', color: '#9ca3af', marginBottom: '2px' }}>{label}</p>
                                                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#22c55e' }}>
                                                                    {payload[0].value}<span style={{ fontSize: '0.7rem', color: '#6b7280' }}>/10</span>
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Line
                                                dataKey="score"
                                                type="natural"
                                                stroke="#22c55e"
                                                strokeWidth={2}
                                                dot={{ fill: '#22c55e', r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ChartContainer>
                                ) : (
                                    <p className="no-data">No data for this period!</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default StatsModal
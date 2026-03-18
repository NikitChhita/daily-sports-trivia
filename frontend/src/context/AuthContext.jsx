import { createContext, useContext, useState } from 'react'

// creates an empty context object — the box that holds all auth data
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

    // on page load, check localStorage for a previously logged in user
    // if found, restore them so session persists on refresh
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user')
        return stored ? JSON.parse(stored) : null
    })

    // same idea for the JWT token — restore from localStorage or start as null
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null
    })

    // called after successful register or login
    // saves user and token to both state and localStorage
    // clears any guest quiz data so user starts fresh
    const login = (userData, tokenData) => {
        setUser(userData)
        setToken(tokenData)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', tokenData)
        // clear guest quiz data — user starts fresh as logged in
        localStorage.removeItem('quiz_progress')
        localStorage.removeItem('quiz_finished')
        localStorage.removeItem('quiz_answers')
    }

    // clears everything from state and localStorage
    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    // wraps the app and makes everything available to every component
    // !!user converts the user object to true or false
    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

// custom hook so any component can just do const { user } = useAuth()
// instead of importing useContext and AuthContext every time
export const useAuth = () => useContext(AuthContext)
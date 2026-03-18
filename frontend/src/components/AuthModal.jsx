import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../CSS/AuthModal.css";

const AuthModal = ({ onClose }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [closing, setClosing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose(), 300);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');

    // make sure the form has data 
    if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        return
    }
    if (!isLogin && !formData.username) {
        setError('Please enter a username')
        return
    }
    if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
    }




    setLoading(true);

    const endpoint = isLogin
      ? "http://localhost:8080/auth/login"
      : "http://localhost:8080/auth/register";

    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      handleClose();
    } catch (err) {
      setError("Something went wrong, please try again");
      setLoading(false);
    }
  };

  return (
    <div
      className={`auth-overlay ${closing ? "auth-closing" : ""}`}
      onClick={handleClose}
    >
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-logo">
          <img src="/ai_img.png" alt="logo" />
        </div>

        <h2 className="auth-title">
          {isLogin ? "Log in to your account" : "Create your account"}
        </h2>
        <p className="auth-subtitle">
          {isLogin
            ? "Welcome back! Please enter your details."
            : "Start tracking your stats and streaks."}
        </p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => { setIsLogin(true); setError('')}}
          >
            Log in
          </button>
          <button
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => { setIsLogin(false); setError('')}}
          >
            Sign up
          </button>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {!isLogin && (
          <div className="auth-field">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button
          className="auth-submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Loading..." : isLogin ? "Sign in" : "Sign up"}
        </button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button className="auth-google">
          <img src="/google-color-svgrepo-com.svg" width="30" height="30" alt="Google" />
          {isLogin ? 'Sign in with Google' : 'Sign Up with Google'}
        </button>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setError('') }}>
            {isLogin ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;

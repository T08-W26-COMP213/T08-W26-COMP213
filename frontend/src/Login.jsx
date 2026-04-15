import { useState } from "react";
import "./Login.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.username.trim()) {
          setError("Full name is required");
          setLoading(false);
          return;
        }
        if (!formData.role) {
          setError("Please select a role");
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username.trim(),
            email: formData.email.trim(),
            password: formData.password,
            role: formData.role
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Registration failed");
          setLoading(false);
          return;
        }

        onLogin(data.user);
      } else {
        if (!formData.email.trim()) {
          setError("Email is required");
          setLoading(false);
          return;
        }
        if (!formData.password) {
          setError("Password is required");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Login failed");
          setLoading(false);
          return;
        }

        onLogin(data.user);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setFormData({ username: "", email: "", password: "", role: "" });
  };

  return (
    <div className="login-page">
      <div className="login-split">
        <aside className="login-hero" aria-hidden="true">
          <div className="login-hero-pattern" />
          <div className="login-hero-content">
            <div className="login-hero-brand">
              <div className="login-hero-logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="login-hero-name">StockGuard</span>
            </div>
            <h2 className="login-hero-headline">
              {isSignUp ? "Join your team on StockGuard." : "Sign in with confidence."}
            </h2>
            <p className="login-hero-lead">
              {isSignUp
                ? "Create an account to log usage, review risk alerts, and keep inventory under control."
                : "Hospital inventory and risk tracking — log usage, watch stock health, and catch shortages early."}
            </p>
            <ul className="login-hero-list">
              <li>Role-based access for staff, admins, and leadership</li>
              <li>Real-time alerts and usage history</li>
              <li>Built for clarity, not clutter</li>
            </ul>
          </div>
        </aside>

        <main className="login-form-panel">
          <div className="login-card">
            <div className="login-card-header">
              <p className="login-card-kicker">{isSignUp ? "Get started" : "Welcome back"}</p>
              <h1 className="login-title">{isSignUp ? "Create your account" : "Sign in"}</h1>
              <p className="login-subtitle">
                {isSignUp
                  ? "Enter your details below. You will choose your role for access to the right tools."
                  : "Use the email and password provided by your administrator."}
              </p>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {isSignUp && (
                <div className="login-field">
                  <label htmlFor="username">Full name</label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="e.g. Jordan Lee"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="login-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@hospital.org"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={isSignUp ? "At least 6 characters" : "Your password"}
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="login-field">
                  <label htmlFor="role">Your role</label>
                  <select id="role" name="role" value={formData.role} onChange={handleChange}>
                    <option value="">Select a role</option>
                    <optgroup label="Technical">
                      <option value="System Administrator">System Administrator</option>
                    </optgroup>
                    <optgroup label="Operational">
                      <option value="Operational Staff">Operational Staff</option>
                    </optgroup>
                    <optgroup label="Strategic">
                      <option value="Business Owner">Business Owner</option>
                      <option value="Stock Analyst">Stock Analyst</option>
                    </optgroup>
                  </select>
                </div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (isSignUp ? "Creating account…" : "Signing in…") : isSignUp ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="login-toggle-text">
              {isSignUp ? "Already have an account? " : "New to StockGuard? "}
              <button type="button" className="login-toggle-link" onClick={switchMode}>
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Login;

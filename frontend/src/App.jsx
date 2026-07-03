import React, { useState, useEffect } from 'react';
import {
  Clipboard,
  Lock,
  User as UserIcon,
  LogOut,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon
} from 'lucide-react';
import Dashboard from './components/Dashboard';

const API_BASE = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth Form State
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Toast System
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'success' });
    }, 2500);
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    }
  }, [token, username]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formUsername.trim() || !formPassword.trim()) {
      setErrorMsg('Username and Password are required.');
      return;
    }

    setIsLoading(true);
    const endpoint = isLoginTab ? "/auth/login" : "/auth/register";

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formUsername,
          password: formPassword
        })
      });

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || 'Something went wrong');
      }

      if (isLoginTab) {
        // Parse token and username
        const json = JSON.parse(data);
        setToken(json.token);
        setUsername(json.username);
        showToast(`Welcome back, ${json.username}!`);
        // Reset form
        setFormUsername('');
        setFormPassword('');
      } else {
        setSuccessMsg('Registration successful! Please login.');
        setIsLoginTab(true);
        setFormPassword('');
        showToast('Account created successfully!');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUsername('');
    showToast('Logged out successfully.');
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast.visible && (
        <div className="toast-container">
          <div className="toast">
            <Check size={16} className="toast-icon" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="logo" onClick={() => window.location.reload()}>
            <Clipboard className="logo-icon" size={26} fill="var(--logo-fill)" />
            <span>ShareClip</span>
          </div>

          <div className="nav-actions">
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-icon"
              title="Toggle theme"
              style={{ padding: '0.5rem', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {token && (
              <>
                <div className="user-tag">
                  <UserIcon size={14} />
                  <span>{username}</span>
                </div>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {token ? (
          <Dashboard token={token} apiBase={API_BASE} showToast={showToast} />
        ) : (
          <div className="auth-wrapper">
            <div className="auth-card">

              <div className="auth-tabs">
                <button
                  className={`auth-tab ${isLoginTab ? 'active' : ''}`}
                  onClick={() => { setIsLoginTab(true); setErrorMsg(''); setSuccessMsg(''); }}
                >
                  Login
                </button>
                <button
                  className={`auth-tab ${!isLoginTab ? 'active' : ''}`}
                  onClick={() => { setIsLoginTab(false); setErrorMsg(''); setSuccessMsg(''); }}
                >
                  Sign Up
                </button>
              </div>

              <div className="auth-body">
                {errorMsg && (
                  <div className="error-banner">
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="success-banner">
                    <Check size={16} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit}>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <div className="form-input-wrapper">
                      <UserIcon className="form-icon" size={16} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter username"
                        value={formUsername}
                        onChange={(e) => setFormUsername(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="form-input-wrapper">
                      <Lock className="form-icon" size={16} />
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-input"
                        placeholder="Enter password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.8rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-light)',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isLoading}>
                    {isLoading ? 'Processing...' : isLoginTab ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="auth-footer-message">
                  {isLoginTab ? (
                    <p>Don't have an account? <span onClick={() => { setIsLoginTab(false); setErrorMsg(''); setSuccessMsg(''); }}>Sign Up now</span></p>
                  ) : (
                    <p>Already have an account? <span onClick={() => { setIsLoginTab(true); setErrorMsg(''); setSuccessMsg(''); }}>Sign In here</span></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

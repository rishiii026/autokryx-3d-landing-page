import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import api from './services/api'
import './App.css'
import Dashboard from './pages/dashboard/Dashboard'
import Documents from './pages/documents/Documents'
import Layout from './components/layout/Layout'
import AIWorkspace from './pages/AIWorkspace/AIWorkspace'

function App() {
  const [mode, setMode] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      if (mode === 'login') {
        const response = await api.post('/auth/login', {
          email,
          password,
        })

        setMessage(response.data.message || 'Login successful')
        setMessageType('success')
        setIsAuthenticated(true)
      } else {
        const response = await api.post('/auth/register', {
          name,
          email,
          password,
        })

        setMessage(
          response.data.message || 'Account created successfully'
        )
        setMessageType('success')
        setIsAuthenticated(true)
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Unable to connect to MindVault. Please try again.'
      )
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setName('')
    setEmail('')
    setPassword('')
    setMessage('')
    setMessageType('')
  }

  return (
      <>
   {isAuthenticated ? (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="documents" element={<Documents />} />
      <Route path="ai" element={<AIWorkspace />} />
    </Route>
  </Routes>
) : (
    <main className="app-shell">
      {/* =========================
          PRODUCT INTRODUCTION
      ========================== */}
      <section className="auth-panel">
        <div className="brand">
          <div className="brand-mark">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div>
            <h1>MindVault</h1>
            <p>AI-powered knowledge workspace</p>
          </div>
        </div>

        <div className="auth-content">
          <div className="eyebrow">
            <span className="status-dot"></span>
            Your private knowledge, intelligently connected
          </div>

          <h2>
            Think better.
            <br />
            <span>Find anything.</span>
          </h2>

          <p className="intro">
            Upload your study materials, documents and notes. MindVault
            transforms them into a searchable knowledge space you can
            interact with using AI.
          </p>

          <div className="feature-list">
            <div className="feature">
              <div className="feature-icon">↑</div>

              <div>
                <strong>Bring your knowledge</strong>
                <p>Upload PDFs and study materials in seconds.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">⌕</div>

              <div>
                <strong>Ask your documents</strong>
                <p>Get contextual answers from your own content.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">✦</div>

              <div>
                <strong>Learn with AI</strong>
                <p>Turn scattered information into useful insights.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <span>MindVault AI</span>
          <span>Built for focused learning</span>
        </div>
      </section>

      {/* =========================
          AUTHENTICATION
      ========================== */}
      <section className="form-panel">
        <div className="form-wrapper">

          <div className="mobile-brand">
            <div className="brand-mark">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <h1>MindVault</h1>
          </div>

          <div className="form-heading">
            <span className="form-label">
              {mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
            </span>

            <h2>
              {mode === 'login'
                ? 'Sign in to your workspace'
                : 'Create your workspace'}
            </h2>

            <p>
              {mode === 'login'
                ? 'Continue where you left off.'
                : 'Start building your personal AI knowledge space.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {mode === 'register' && (
              <div className="field">
                <label htmlFor="name">
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <div className="password-label">
                <label htmlFor="password">
                  Password
                </label>

                {mode === 'login' && (
                  <button
                    type="button"
                    className="text-button"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                required
                minLength="6"
              />
            </div>

            {message && (
              <div
                className={`auth-message ${messageType}`}
                role="alert"
              >
                {message}
              </div>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : mode === 'login'
                ? 'Sign in'
                : 'Create account'}

              <span>→</span>
            </button>
          </form>

          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <button
            className="secondary-button"
            type="button"
          >
            Continue with email
          </button>

          <p className="switch-text">
            {mode === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}{' '}

            <button
              type="button"
              onClick={switchMode}
            >
              {mode === 'login'
                ? 'Create one'
                : 'Sign in'}
            </button>
          </p>

          <p className="legal">
            By continuing, you agree to our Terms of Service
            and Privacy Policy.
          </p>
        </div>
      </section>
    </main>
        )}
  </>
)
  
}

export default App
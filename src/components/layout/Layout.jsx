import './Layout.css'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'

function Layout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [user, setUser] = useState(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [accountMenuOpen, setAccountMenuOpen] = useState(false)

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await api.get('/auth/me')
                setUser(response.data)
            } catch (error) {
                console.error('Unable to load current user:', error)
            } finally {
                setLoadingUser(false)
            }
        }

        fetchCurrentUser()
    }, [])

    const handleSignOut = async () => {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('Sign out failed:', error)
        } finally {
            navigate('/login')
        }
    }

    const isActivePath = (path) => location.pathname.startsWith(path)

    return (
        <div className="app-shell">
            <header className="app-topbar">
                <div className="topbar-brand">
                    <div className="brand-mark" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span className="topbar-brand-name">MindVault</span>
                </div>

                <nav className="app-navigation">
                    <Link to="/dashboard" className={`topnav-item${isActivePath('/dashboard') ? ' active' : ''}`}>
                        <span className="nav-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                                <path d="M4 12.5 12 5l8 7.5" />
                                <path d="M6.5 10.5V20h11v-9.5" />
                                <path d="M9.5 20v-5h5v5" />
                            </svg>
                        </span>
                        <span>Overview</span>
                    </Link>

                    <Link to="/documents" className={`topnav-item${isActivePath('/documents') ? ' active' : ''}`}>
                        <span className="nav-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                                <path d="M5 4.5h9l5 5V20H5z" />
                                <path d="M14 4.5V10h5" />
                                <path d="M8 13h8" />
                                <path d="M8 16.5h6" />
                            </svg>
                        </span>
                        <span>Documents</span>
                    </Link>

                    <Link to="/ai" className={`topnav-item${isActivePath('/ai') ? ' active' : ''}`}>
                        <span className="nav-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                                <path d="M5 6.5h14" />
                                <path d="M5 12h14" />
                                <path d="M5 17.5h9" />
                                <circle cx="18" cy="17.5" r="2" />
                            </svg>
                        </span>
                        <span>AI Workspace</span>
                    </Link>
                </nav>

                <div className="account-menu-wrapper">
                    <button
                        type="button"
                        className="topbar-account"
                        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    >
                        <div className="account-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className={`account-chevron ${accountMenuOpen ? 'open' : ''}`}>▾</span>
                    </button>

                    {accountMenuOpen && (
                        <div className="account-dropdown">
                            <div className="account-dropdown-header">
                                <strong>{loadingUser ? 'Loading…' : (user?.name || 'User')}</strong>
                                <span>{user?.email || ''}</span>
                            </div>
                            <div className="account-dropdown-divider"></div>
                            <button type="button" className="account-dropdown-item"><span>My Profile</span></button>
                            <button type="button" className="account-dropdown-item"><span>Settings</span></button>
                            <button type="button" className="account-dropdown-item"><span>Notifications</span></button>
                            <div className="account-dropdown-divider"></div>
                            <button
                                type="button"
                                className="account-dropdown-item account-dropdown-signout"
                                onClick={handleSignOut}
                            >
                                <span>Sign out</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className="app-main">
                <Outlet context={{ user, loadingUser }} />
            </main>
        </div>
    )
}

export default Layout

import './Dashboard.css'
import { useEffect, useState, useRef } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import api from '../../services/api'

function Dashboard() {
    const navigate = useNavigate()
    const { user } = useOutletContext()

    const [documents, setDocuments] = useState([])
    const [loadingDocuments, setLoadingDocuments] = useState(true)
    const [uploading, setUploading] = useState(false)

    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            const response = await api.get('/files')
            setDocuments(response.data)
        } catch (error) {
            console.error('Unable to load documents:', error)
        } finally {
            setLoadingDocuments(false)
        }
    }

    const handleUpload = async (event) => {
        const file = event.target.files?.[0]

        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            setUploading(true)

            await api.post('/files', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            await fetchDocuments()

            event.target.value = ''
        } catch (error) {
            console.error('Document upload failed:', error)

            alert(
                error.response?.data?.message ||
                    'Unable to upload document. Please try again.'
            )
        } finally {
            setUploading(false)
        }
    }

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={handleUpload}
                hidden
            />

            <header className="page-header">
                <div className="page-header-copy">
                    <span className="page-kicker">Personal ledger</span>
                    <h2>Overview</h2>
                </div>

                <div className="page-header-actions">
                    <button type="button" className="header-icon-button" aria-label="Notifications">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M18 9.5a6 6 0 0 0-12 0c0 7-2.5 7-2.5 8.5h17C20.5 16.5 18 16.5 18 9.5Z" />
                            <path d="M10 21h4" />
                        </svg>
                    </button>

                    <div className="header-profile">
                        <div className="header-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                        <div>
                            <strong>Welcome back, {user?.name?.split(' ')[0] || 'there'}</strong>
                        </div>
                    </div>
                </div>
            </header>

            <div className="page-content">

                {/* ---------------------------------------------------
                    HERO
                --------------------------------------------------- */}

                <section className="dashboard-hero">
                    <div>
                        <span className="eyebrow">Your learning record</span>

                        <h3>
                            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.
                            <br />
                            <span>Every note, filed and findable.</span>
                        </h3>

                        <p>
                            MindVault keeps every PDF, screenshot, and certificate in one
                            running record — search it, summarize it, and see how your
                            learning connects over time.
                        </p>
                    </div>

                    <div className="hero-timeline" aria-hidden="true">
                        <div className="hero-thread"></div>
                        <div className="hero-node"></div>
                        <div className="hero-node"></div>
                        <div className="hero-node hero-node-active"></div>
                    </div>
                </section>

                {/* ---------------------------------------------------
                    KNOWLEDGE OVERVIEW
                --------------------------------------------------- */}

                <section>
                    <div className="section-heading">
                        <div>
                            <span>Ledger status</span>
                            <h3>Your record at a glance</h3>
                        </div>
                    </div>

                    <div className="overview-metrics">
                        <article className="overview-metric">
                            <div className="metric-topline">
                                <span>Documents</span>
                                <div className="metric-symbol">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                        <path d="M5 4.5h9l5 5V20H5z" />
                                        <path d="M14 4.5V10h5" />
                                    </svg>
                                </div>
                            </div>
                            <strong>{loadingDocuments ? '···' : documents.length}</strong>
                            <p>Documents logged to your record</p>
                        </article>

                        <article className="overview-metric">
                            <div className="metric-topline">
                                <span>Knowledge status</span>
                                <div className="metric-symbol status-symbol">
                                    <span></span>
                                </div>
                            </div>
                            <strong className="status-value">Ready</strong>
                            <p>Your ledger is available</p>
                        </article>

                        <article className="overview-metric">
                            <div className="metric-topline">
                                <span>AI workspace</span>
                                <div className="metric-symbol">
                                    <span className="sparkle-symbol">✦</span>
                                </div>
                            </div>
                            <strong className="status-value">Available</strong>
                            <p>Ask questions across your documents</p>
                        </article>
                    </div>
                </section>

                {/* ---------------------------------------------------
                    PRIMARY ACTIONS
                --------------------------------------------------- */}

                <section>
                    <div className="section-heading">
                        <div>
                            <span>Get started</span>
                            <h3>Add to your ledger</h3>
                        </div>
                    </div>

                    <div className="action-grid">
                        <button
                            type="button"
                            className="action-card"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <div className="action-leading">
                                <div className="action-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                        <path d="M12 16V4" />
                                        <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
                                        <path d="M5 14v5h14v-5" />
                                    </svg>
                                </div>
                                <div className="action-copy">
                                    <strong>{uploading ? 'Filing document…' : 'File a document'}</strong>
                                    <p>Upload a PDF and MindVault logs it to your timeline.</p>
                                </div>
                            </div>
                            <span className="action-arrow">→</span>
                        </button>

                        <button type="button" className="action-card" onClick={() => navigate('/ai')}>
                            <div className="action-leading">
                                <div className="action-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                        <circle cx="10.5" cy="10.5" r="5.5" />
                                        <path d="m15 15 4.5 4.5" />
                                    </svg>
                                </div>
                                <div className="action-copy">
                                    <strong>Ask your notes</strong>
                                    <p>Search everything you've uploaded in plain language.</p>
                                </div>
                            </div>
                            <span className="action-arrow">→</span>
                        </button>

                        <button type="button" className="action-card" 
                            onClick={() => navigate('/ai')}>
                            <div className="action-leading">
                                <div className="action-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                        <path d="M12 3.5 13.5 9l5.5 1.5-5.5 1.5L12 17.5l-1.5-5.5L5 10.5 10.5 9z" />
                                        <path d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" />
                                    </svg>
                                </div>
                                <div className="action-copy">
                                    <strong>Trace a topic</strong>
                                    <p>See how your notes, projects, and certificates connect.</p>
                                </div>
                            </div>
                            <span className="action-badge">Explore →</span>
                        </button>
                    </div>
                </section>

                {/* ---------------------------------------------------
                    RECENT KNOWLEDGE
                --------------------------------------------------- */}

                <section>
                    <div className="section-heading">
                        <div>
                            <span>Recent entries</span>
                            <h3>Latest additions to your ledger</h3>
                        </div>
                        <button type="button" className="text-button" onClick={() => navigate('/documents')}>
                            View full ledger <span>→</span>
                        </button>
                    </div>

                    {loadingDocuments ? (
                        <div className="document-empty-state">
                            <div className="empty-document-copy">
                                <h4>Retrieving your ledger</h4>
                                <p>Loading documents from your personal record.</p>
                            </div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="document-empty-state">
                            <div className="empty-document-visual">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                                    <path d="M5 4h10l4 4v12H5z" />
                                    <path d="M15 4v4h4" />
                                </svg>
                                <div className="document-plus">+</div>
                            </div>

                            <div className="empty-document-copy">
                                <h4>Your ledger is empty</h4>
                                <p>
                                    Upload your first document and MindVault will log it
                                    here, dated and tagged automatically.
                                </p>
                                <button
                                    type="button"
                                    className="text-button"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    File your first document <span>→</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="document-list">
                            {documents.slice(0, 5).map((document) => (
                                <article className="document-row" key={document.id}>
                                    <div className="document-row-node" aria-hidden="true"></div>

                                    <div className="document-row-card">
                                        <div className="document-row-icon">
                                            {document.fileType?.toUpperCase() || 'FILE'}
                                        </div>

                                        <div className="document-row-content">
                                            <strong>{document.fileName}</strong>
                                            <span>{document.topicTags || 'General'}</span>
                                            <small>{new Date(document.uploadedAt).toLocaleDateString()}</small>
                                        </div>

                                        <div className={`status-chip ${document.aiSummary ? 'is-processed' : 'is-processing'}`}>
                                            {document.aiSummary ? 'Processed' : 'Processing'}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* ---------------------------------------------------
                    AI ENTRY POINT (teaser -> full AI Workspace page)
                --------------------------------------------------- */}

                <section className="ai-teaser">
                    <div className="ai-teaser-content">
                        <span className="eyebrow ai-teaser-eyebrow">Ask MindVault</span>
                        <h3>Have a question for your notes?</h3>
                        <p>
                            MindVault answers using only what you've uploaded —
                            no guessing, no outside sources.
                        </p>
                        <button type="button" className="ai-teaser-button" onClick={() => navigate('/ai')}>
                            Open AI workspace <span>→</span>
                        </button>
                    </div>

                    <div className="ai-teaser-decoration" aria-hidden="true">
                        <div className="ai-teaser-line"></div>
                        <div className="ai-teaser-node"></div>
                        <div className="ai-teaser-node"></div>
                        <div className="ai-teaser-node"></div>
                    </div>
                </section>

            </div>
        </>
    )
}

export default Dashboard

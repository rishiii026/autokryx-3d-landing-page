import './Documents.css'
import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../../services/api'

function Documents() {
    const { user } = useOutletContext()

    const [documents, setDocuments] = useState([])
    const [loadingDocuments, setLoadingDocuments] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [expandedId, setExpandedId] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

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

    const handleDelete = async (documentId, fileName) => {
        const confirmed = window.confirm(`Remove "${fileName}" from your ledger? This cannot be undone.`)
        if (!confirmed) return

        try {
            setDeletingId(documentId)
            await api.delete(`/files/${documentId}`)
            setDocuments((current) => current.filter((doc) => doc.id !== documentId))
        } catch (error) {
            console.error('Delete failed:', error)
            alert(error.response?.data?.message || 'Unable to delete this document. Please try again.')
        } finally {
            setDeletingId(null)
        }
    }

    const filteredDocuments = documents.filter((document) => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) return true

        const nameMatch = document.fileName?.toLowerCase().includes(term)
        const tagMatch = document.topicTags?.toLowerCase().includes(term)
        return nameMatch || tagMatch
    })

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
                    <span className="page-kicker">Full record</span>
                    <h2>Documents</h2>
                </div>

                <div className="page-header-actions">
                    <button
                        type="button"
                        className="header-upload-button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        {uploading ? 'Filing…' : 'File a document'}
                    </button>

                    <div className="header-profile">
                        <div className="header-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                    </div>
                </div>
            </header>

            <div className="page-content">

                <section>
                    <div className="section-heading">
                        <div>
                            <span>Every entry</span>
                            <h3>Your complete ledger</h3>
                        </div>
                    </div>

                    <div className="documents-toolbar">
                        <div className="search-field">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                                <circle cx="10.5" cy="10.5" r="5.5" />
                                <path d="m15 15 4.5 4.5" />
                            </svg>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by file name or topic"
                            />
                        </div>

                        <span className="documents-count">
                            {loadingDocuments ? '···' : `${filteredDocuments.length} of ${documents.length}`}
                        </span>
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
                                <p>Upload your first document and MindVault will log it here, dated and tagged automatically.</p>
                                <button type="button" className="text-button" onClick={() => fileInputRef.current?.click()}>
                                    File your first document <span>→</span>
                                </button>
                            </div>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="document-empty-state">
                            <div className="empty-document-copy">
                                <h4>No matches</h4>
                                <p>Nothing in your ledger matches "{searchTerm}".</p>
                            </div>
                        </div>
                    ) : (
                        <div className="document-list">
                            {filteredDocuments.map((document) => {
                                const isExpanded = expandedId === document.id

                                return (
                                    <article className="document-row" key={document.id}>
                                        <div className="document-row-node" aria-hidden="true"></div>

                                        <div className="document-row-card document-row-card-expandable">
                                            <button
                                                type="button"
                                                className="document-row-main"
                                                onClick={() => setExpandedId(isExpanded ? null : document.id)}
                                                aria-expanded={isExpanded}
                                            >
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

                                                <span className={`expand-chevron ${isExpanded ? 'open' : ''}`}>▾</span>
                                            </button>

                                            {isExpanded && (
                                                <div className="document-row-detail">
                                                    <p>{document.aiSummary || 'MindVault is still processing this document — the summary will appear here once it\'s ready.'}</p>

                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={() => handleDelete(document.id, document.fileName)}
                                                        disabled={deletingId === document.id}
                                                    >
                                                        {deletingId === document.id ? 'Removing…' : 'Remove from ledger'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </section>

            </div>
        </>
    )
}

export default Documents

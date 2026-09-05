import './AIWorkspace.css'
import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../../services/api'

const SUGGESTED_PROMPTS = [
    'Summarize my most recent notes',
    'What topics have I been studying?',
    'What was I studying most recently?',
]

function AIWorkspace() {
    const { user } = useOutletContext()

    const [messages, setMessages] = useState([])
    const [query, setQuery] = useState('')
    const [asking, setAsking] = useState(false)

    const scrollRef = useRef(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [messages])

    const submitQuery = async (text) => {
        const trimmed = text.trim()
        if (!trimmed || asking) return

        const userMessage = { id: Date.now(), role: 'user', text: trimmed }
        setMessages((current) => [...current, userMessage])
        setQuery('')
        setAsking(true)

        try {
            const response = await api.post('/chat/query', { query: trimmed })
            setMessages((current) => [
                ...current,
                {
                    id: Date.now() + 1,
                    role: 'ai',
                    text: response.data.answer,
                    sources: response.data.sources || [],
                },
            ])
        } catch (error) {
            console.error('AI query failed:', error)
            setMessages((current) => [
                ...current,
                {
                    id: Date.now() + 1,
                    role: 'ai',
                    text: error.response?.data?.message || 'Unable to reach MindVault AI. Please try again.',
                    isError: true,
                },
            ])
        } finally {
            setAsking(false)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        submitQuery(query)
    }

    return (
        <>
            <header className="page-header">
                <div className="page-header-copy">
                    <span className="page-kicker">Ask MindVault</span>
                    <h2>AI Workspace</h2>
                </div>

                <div className="page-header-actions">
                    <div className="header-profile">
                        <div className="header-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                    </div>
                </div>
            </header>

            <div className="ai-workspace-body">
                <div className="ai-conversation" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="ai-empty-state">
                            <span className="eyebrow">Your notes, on demand</span>
                            <h3>Ask anything about what you've uploaded</h3>
                            <p>
                                MindVault answers using only the content in your ledger —
                                specifically, your three most recently uploaded documents.
                                If the answer isn't in there, it will say so.
                            </p>

                            <div className="suggested-prompts">
                                {SUGGESTED_PROMPTS.map((prompt) => (
                                    <button
                                        type="button"
                                        key={prompt}
                                        className="suggested-prompt"
                                        onClick={() => submitQuery(prompt)}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="message-list">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`message-row message-row-${message.role}`}
                                >
                                    <div className={`message-bubble ${message.isError ? 'is-error' : ''}`}>
                                        <p>{message.text}</p>

                                        {message.sources && message.sources.length > 0 && (
                                            <div className="message-sources">
                                                <span>Sourced from</span>
                                                {message.sources.map((source, index) => (
                                                    <span className="source-tag" key={index}>{source}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {asking && (
                                <div className="message-row message-row-ai">
                                    <div className="message-bubble is-thinking">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <form className="ai-input-bar" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Ask about your uploaded notes…"
                        disabled={asking}
                    />
                    <button type="submit" disabled={asking || !query.trim()}>
                        {asking ? 'Thinking…' : 'Ask'}
                    </button>
                </form>
            </div>
        </>
    )
}

export default AIWorkspace

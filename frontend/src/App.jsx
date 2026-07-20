import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkWikiLink from 'remark-wiki-link';
import fm from 'front-matter';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

import { CommandMenu } from './components/CommandMenu';
import { SidebarTree } from './components/SidebarTree';
import './App.css';

function getTagStyles(tag) {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return {
        backgroundColor: `hsl(${hue}, 70%, 90%)`,
        color: `hsl(${hue}, 80%, 30%)`,
    };
}

function SafeCodeBlock({ className, children, ...props }) {
    const [copied, setCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {}
    };

    if (match) {
        return (
            <div
                style={{ position: 'relative', marginTop: 'var(--spacing-sm)' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <button
                    onClick={handleCopy}
                    style={{
                        position: 'absolute',
                        top: 'var(--spacing-sm)',
                        right: 'var(--spacing-sm)',
                        zIndex: 10,
                        padding: '4px var(--spacing-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-inverse)',
                        backgroundColor: copied ? '#10b981' : 'var(--zinc-700)',
                        border: 'none',
                        cursor: 'pointer',
                        opacity: isHovered || copied ? 1 : 0,
                        transition: 'opacity 0.2s, background-color 0.2s'
                    }}
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-md)',
                        margin: 0,
                        fontFamily: 'var(--font-mono)'
                    }}
                    {...props}
                >
                    {codeString}
                </SyntaxHighlighter>
            </div>
        );
    }

    return (
        <code
            style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                color: '#e11d48',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875em'
            }}
            {...props}
        >
            {children}
        </code>
    );
}

function App() {
    const [notes, setNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const vaultRootName = 'API Vault';

    const fetchNotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/notes');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setNotes(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <p style={{ fontWeight: 500 }}>Loading knowledge base...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-md)', backgroundColor: 'var(--bg-secondary)' }}>
                <p style={{ color: '#e11d48', fontWeight: 500 }}>Error loading notes: {error}</p>
                <button
                    onClick={fetchNotes}
                    style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        backgroundColor: 'var(--interactive-active)',
                        color: 'var(--text-inverse)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        border: 'none',
                        fontWeight: 500
                    }}
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: 'var(--sidebar-width)', borderRight: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
                <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 'var(--spacing-sm)' }}>
                            📁 {vaultRootName}
                        </span>
                        <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--border-subtle)', padding: '2px 10px', borderRadius: '12px', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {notes.length} notes
                        </span>
                    </div>

                    <button
                        onClick={fetchNotes}
                        style={{
                            width: '100%',
                            padding: '6px 0',
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-strong)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontWeight: 500,
                            color: 'var(--text-secondary)'
                        }}
                    >
                        🔄 Refresh API
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <SidebarTree notes={notes} onSelectNote={setActiveNote} />
                </div>
            </div>

            <div style={{ flex: 1, padding: 'var(--spacing-xl)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeNote ? `${vaultRootName}/${activeNote.path}` : 'Vault Overview'}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', marginLeft: 'var(--spacing-md)' }}>
                        Press <kbd style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0 4px' }}>Cmd + K</kbd> to search
                    </span>
                </header>

                <CommandMenu notes={notes} onSelectNote={setActiveNote} />

                <main style={{ flex: 1 }}>
                    {!activeNote ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '15%' }}>
                            <h3 style={{ fontWeight: 500, fontSize: '1.125rem', color: 'var(--text-secondary)', margin: 0 }}>No note selected</h3>
                            <p style={{ fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>Click a snippet on the sidebar or press Cmd+K to query everything.</p>
                        </div>
                    ) : (
                        <article className="markdown-body" style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto', width: '100%' }}>
                            <h1 style={{ fontSize: '2.25rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 'var(--spacing-sm)', borderBottom: 'none', paddingBottom: 0 }}>
                                {activeNote.title}
                            </h1>

                            {activeNote.tags?.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                                    {activeNote.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            style={{
                                                ...getTagStyles(tag),
                                                padding: '4px 10px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath, [remarkWikiLink, { pageResolver: (name) => [name] }]]}
                                rehypePlugins={[rehypeKatex]}
                                components={{ code: SafeCodeBlock }}
                            >
                                {activeNote.content}
                            </ReactMarkdown>
                        </article>
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;
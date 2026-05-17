import { useMemo, useState } from 'react';

function buildTree(notes) {
    const root = { name: 'Vault', children: {}, files: [] };

    notes.forEach((note) => {
        const parts = note.path.split('/').filter(Boolean);
        let current = root;

        parts.forEach((part) => {
            if (!current.children[part]) {
                current.children[part] = { name: part, children: {}, files: [] };
            }
            current = current.children[part];
        });

        current.files.push(note);
    });

    return root;
}

function FolderNode({ node, onSelectNote, level }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <details
            style={{ marginTop: '2px' }}
            open={isOpen}
            onToggle={(e) => setIsOpen(e.currentTarget.open)}
        >
            <summary
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    cursor: 'pointer',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    userSelect: 'none',
                    padding: '6px 4px',
                    fontSize: '0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isHovered ? 'var(--interactive-hover)' : 'transparent',
                    transition: 'background-color 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    outline: 'none',
                    marginLeft: '-4px'
                }}
            >
                <span
                    style={{
                        fontSize: '10px',
                        color: 'var(--text-tertiary)',
                        transition: 'transform 0.2s',
                        width: '12px',
                        textAlign: 'center',
                        display: 'inline-block',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}
                >
                    ▶
                </span>
                📁 <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</span>
            </summary>
            <TreeNode node={node} onSelectNote={onSelectNote} level={level + 1} />
        </details>
    );
}

function FileNode({ file, onSelectNote }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onClick={() => onSelectNote(file)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                cursor: 'pointer',
                padding: '6px 8px 6px 24px',
                fontSize: '0.875rem',
                color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isHovered ? 'var(--interactive-hover)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                transition: 'background-color 0.15s, color 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '2px 0'
            }}
        >
            📄 <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.title}</span>
        </div>
    );
}

function TreeNode({ node, onSelectNote, level = 0 }) {
    return (
        <div style={{
            paddingLeft: level > 0 ? '12px' : '0',
            marginLeft: level > 0 ? '6px' : '0',
            borderLeft: level > 0 ? '1px solid var(--border-subtle)' : 'none'
        }}>

            {Object.values(node.children).map((childNode) => (
                <FolderNode
                    key={childNode.name}
                    node={childNode}
                    onSelectNote={onSelectNote}
                    level={level}
                />
            ))}

            {node.files.map((file) => (
                <FileNode key={file.id} file={file} onSelectNote={onSelectNote} />
            ))}
        </div>
    );
}

export function SidebarTree({ notes, onSelectNote }) {
    const tree = useMemo(() => buildTree(notes), [notes]);

    return (
        <nav style={{ padding: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-md)', padding: '0 4px', margin: '0 0 16px 0' }}>
                Knowledge Base
            </h3>
            <TreeNode node={tree} onSelectNote={onSelectNote} />
        </nav>
    );
}
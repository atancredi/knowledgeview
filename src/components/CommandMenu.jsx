import { useState, useEffect, useMemo } from 'react';
import { Command } from 'cmdk';

function getTagStyles(tag) {
	let hash = 0;
	for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
	const hue = Math.abs(hash) % 360;
	return {
		backgroundColor: `hsl(${hue}, 70%, 90%)`,
		color: `hsl(${hue}, 80%, 30%)`,
	};
}

export function CommandMenu({ notes, onSelectNote }) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, []);

	const results = useMemo(() => {
		const cleanQuery = searchQuery.trim().toLowerCase().replace(/\s+/g, ' ');
		if (!cleanQuery) return notes.slice(0, 10);

		const searchTerms = cleanQuery.split(' ');

		const matchedNotes = notes.filter((note) => {
			const tagString = note.tags ? note.tags.join(' ') : '';
			const searchableString = `${note.path} ${note.title} ${tagString} ${note.content}`.toLowerCase();
			return searchTerms.every((term) => searchableString.includes(term));
		});

		const scoredNotes = matchedNotes.map((note) => {
			let score = 0;
			const titleLower = note.title.toLowerCase();
			const pathLower = note.path.toLowerCase();
			const tagsLower = note.tags ? note.tags.map(t => t.toLowerCase()) : [];

			searchTerms.forEach((term) => {
				if (titleLower.includes(term)) {
					score += 10;
				} else if (tagsLower.some(t => t.includes(term))) {
					score += 8;
				} else if (pathLower.includes(term)) {
					score += 5;
				} else {
					score += 1;
				}
			});

			return { ...note, score };
		});

		return scoredNotes.sort((a, b) => b.score - a.score);
	}, [searchQuery, notes]);

	return (
		<>
			{/* Scoped CSS for pseudo-elements and data-attributes to honor the NO CSS CLASSES rule */}
			<style>{`
        [cmdk-input]::placeholder { color: var(--text-tertiary); }
        [cmdk-item][data-selected="true"] { background-color: var(--interactive-hover); }
        [cmdk-group-heading] {
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }
      `}</style>

			{open && (
				<div
					style={{
						position: 'fixed',
						top: 0, left: 0, right: 0, bottom: 0,
						backgroundColor: 'rgba(24, 24, 27, 0.4)',
						backdropFilter: 'blur(3px)',
						zIndex: 9998
					}}
					aria-hidden="true"
				/>
			)}

			<Command.Dialog
				open={open}
				onOpenChange={setOpen}
				label="Global Command Menu"
				shouldFilter={false}
				style={{
					position: 'fixed',
					top: '20%',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '100%',
					maxWidth: 'var(--cmdk-max-width)',
					backgroundColor: 'var(--bg-primary)',
					borderRadius: 'var(--radius-md)',
					boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
					border: '1px solid var(--border-subtle)',
					zIndex: 9999,
					fontFamily: 'var(--font-sans)',
					overflow: 'hidden',
					outline: 'none'
				}}
			>
				<Command.Input
					value={searchQuery}
					onValueChange={setSearchQuery}
					placeholder="Search path, title, tags, or content..."
					autoFocus
					style={{
						width: '100%',
						padding: 'var(--spacing-md)',
						fontSize: '1.1rem',
						border: 'none',
						borderBottom: '1px solid var(--border-subtle)',
						outline: 'none',
						backgroundColor: 'transparent',
						boxSizing: 'border-box',
						color: 'var(--text-primary)',
						fontFamily: 'var(--font-sans)'
					}}
				/>

				<Command.List style={{ maxHeight: '400px', overflowY: 'auto', padding: 'var(--spacing-sm)' }}>
					<Command.Empty style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
						No notes found matching your query.
					</Command.Empty>

					<Command.Group heading="Results">
						{results.map((result) => (
							<Command.Item
								key={result.id}
								onSelect={() => {
									onSelectNote(result);
									setOpen(false);
									setSearchQuery('');
								}}
								style={{
									padding: '10px var(--spacing-md)',
									cursor: 'pointer',
									borderRadius: 'var(--radius-sm)',
									color: 'var(--text-primary)',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									transition: 'background-color 0.1s ease',
									outline: 'none'
								}}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', marginRight: 'var(--spacing-md)' }}>
									<span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
										{result.title}
									</span>

									{result.tags?.slice(0, 3).map(tag => (
										<span
											key={tag}
											style={{
												...getTagStyles(tag),
												padding: '2px 6px',
												borderRadius: 'var(--radius-sm)',
												fontSize: '0.65rem',
												fontWeight: 600,
												whiteSpace: 'nowrap'
											}}
										>
											#{tag}
										</span>
									))}
								</div>

								<span style={{
									fontSize: '0.75rem',
									color: 'var(--text-secondary)',
									backgroundColor: 'var(--bg-tertiary)',
									padding: '2px 6px',
									borderRadius: 'var(--radius-sm)',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									maxWidth: '40%',
									border: '1px solid var(--border-subtle)',
									flexShrink: 0
								}}>
									{result.path}
								</span>
							</Command.Item>
						))}
					</Command.Group>
				</Command.List>
			</Command.Dialog>
		</>
	);
}
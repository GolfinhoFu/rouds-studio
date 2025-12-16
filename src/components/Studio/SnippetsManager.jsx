import React, { useContext, useState, useRef } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// --- Components ---

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (isOpen && e.key === 'Escape') {
                onCancel();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
        >
            <div style={{
                backgroundColor: '#2a2a2a',
                padding: '20px',
                borderRadius: '8px',
                width: '300px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                border: '1px solid #444'
            }} onClick={e => e.stopPropagation()}>
                <h3 id="modal-title" style={{ marginTop: 0, color: '#fff' }}>Confirm Action</h3>
                <p style={{ color: '#ccc' }}>{message}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                        type="button"
                        className="toolbox-btn"
                        onClick={onCancel}
                        style={{ padding: '8px 16px' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="action-btn"
                        style={{ background: '#e53935', padding: '8px 16px' }}
                        onClick={onConfirm}
                        autoFocus
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const FolderIcon = ({ expanded }) => (
    <span style={{ marginRight: 5, display: 'inline-block', width: 12 }}>
        {expanded ? '📂' : '📁'}
    </span>
);

const DraggableSnippetItem = ({ snippet, onInject, onRequestDelete, onMove, folders }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `snippet-${snippet.id}`,
        data: { type: 'snippet', id: snippet.id, folderId: snippet.folderId }
    });

    // We keep the internal move logic (dropdown) as fallback/alternative
    const [isMoving, setIsMoving] = useState(false);

    const code = snippet.code || '';

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
        opacity: isDragging ? 0.8 : 1,
        touchAction: 'none' // Required for pointer sensors
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={{ ...style, background: '#222', padding: 8, marginBottom: 8, borderRadius: 4, border: isDragging ? '1px solid #4CAF50' : 'none' }}
            className="snippet-item"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                    {...listeners}
                    {...attributes}
                    style={{ cursor: 'grab', display: 'flex', alignItems: 'center', flex: 1 }}
                >
                    <span style={{ marginRight: 5, color: '#666' }}>⣿</span>
                    <strong style={{ color: '#d4d4d4' }}>{snippet.name}</strong>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                    <button type="button" onClick={() => setIsMoving(!isMoving)} title="Move to folder" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1em' }}>📂</button>
                    <button type="button" onClick={() => onRequestDelete(snippet.id)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2em' }}>&times;</button>
                </div>
            </div>

            {isMoving && (
                <div style={{ margin: '5px 0', padding: 5, background: '#111', borderRadius: 4 }}>
                    <select
                        style={{ width: '100%', marginBottom: 5 }}
                        onChange={(e) => {
                            const val = e.target.value;
                            onMove(snippet.id, val === 'ROOT' ? null : Number(val));
                            setIsMoving(false);
                        }}
                        defaultValue={snippet.folderId || 'ROOT'}
                    >
                        <option value="ROOT">Uncategorized (Root)</option>
                        {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div style={{ fontSize: '0.7rem', color: '#888', maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace', margin: '5px 0' }}>
                {code.substring(0, 50)}{code.length > 50 ? '...' : ''}
            </div>            <button type="button" className="toolbox-btn" style={{ marginTop: 5, width: '100%' }} onClick={() => onInject(snippet.code)}>+ Inject (Cursor)</button>
        </div>
    );
};

const DroppableFolderItem = ({ folder, snippets, onRequestDelete, onInject, onRequestDeleteSnippet, onMoveSnippet, allFolders }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `folder-${folder.id}`,
        data: { type: 'folder', id: folder.id }
    });

    const [expanded, setExpanded] = useState(false);

    const style = {
        marginBottom: 5,
        border: isOver ? '2px dashed #4CAF50' : '2px solid transparent',
        borderRadius: 4,
        background: isOver ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
    };

    return (
        <div ref={setNodeRef} style={style} className="snippet-folder">
            <div
                className="folder-header"
                style={{
                    background: '#333',
                    padding: '8px 10px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    userSelect: 'none'
                }}
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(!expanded)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FolderIcon expanded={expanded} />
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>{folder.name}</span>
                    <span style={{ marginLeft: 8, fontSize: '0.8em', color: '#888' }}>({snippets.length})</span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onRequestDelete(folder.id); }}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1.2em' }}
                    title="Delete Folder"
                    type="button"
                >
                    &times;
                </button>
            </div>

            {expanded && (
                <div className="folder-content" style={{ paddingLeft: 10, marginTop: 5, borderLeft: '2px solid #333' }}>
                    {snippets.length === 0 && <div style={{ color: '#666', fontSize: '0.8em', padding: 5 }}>Empty folder</div>}
                    {snippets.map(s => (
                        <DraggableSnippetItem
                            key={s.id}
                            snippet={s}
                            onInject={onInject}
                            onRequestDelete={onRequestDeleteSnippet}
                            onMove={onMoveSnippet}
                            folders={allFolders}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DroppableRootZone = ({ children }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'folder-ROOT',
        data: { type: 'folder', id: null } // Root has null ID
    });

    return (
        <div ref={setNodeRef} style={{ marginTop: 10, minHeight: 50, border: isOver ? '2px dashed #4CAF50' : 'none', borderRadius: 4 }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 5 }}>Uncategorized</div>
            {children}
        </div>
    );
};


const SnippetsManager = ({ onInject }) => {
    const {
        appData,
        currentProject,
        saveSnippet,
        deleteSnippet,
        createSnippetFolder,
        deleteSnippetFolder,
        moveSnippet
    } = useContext(ProjectContext);

    // Form State
    const [newSnippetName, setNewSnippetName] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [draftCode, setDraftCode] = useState("");
    const [isCreatingSnippet, setIsCreatingSnippet] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    // Refs for focus management
    const snippetCodeRef = useRef(null);

    // Modal State
    const [modalState, setModalState] = useState({ isOpen: false, type: null, id: null });

    if (!currentProject) return null;

    const strategy = currentProject.data.strategy || 'Vanilla';
    const snippets = (appData.snippets && appData.snippets[strategy]) ? appData.snippets[strategy] : [];
    const folders = (appData.snippetFolders && appData.snippetFolders[strategy]) ? appData.snippetFolders[strategy] : [];

    // DnD Handler
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        if (activeIdStr.startsWith('snippet-') && overIdStr.startsWith('folder-')) {
            const snippetId = Number(activeIdStr.replace('snippet-', ''));
            const folderIdPart = overIdStr.replace('folder-', '');
            const targetFolderId = folderIdPart === 'ROOT' ? null : Number(folderIdPart);

            // Access snippet directly from context data to verify current state if needed, 
            // but we can trust the event usually.
            // Move snippet!
            moveSnippet(snippetId, targetFolderId, strategy);
        }
    };


    // Helper to filter
    const getSnippetsInFolder = (folderId) => snippets.filter(s => s.folderId === folderId);
    const rootSnippets = snippets.filter(s => !s.folderId || !folders.find(f => f.id === s.folderId));

    const onSaveSnippet = () => {
        const name = newSnippetName.trim();
        const code = draftCode.trim();

        if (name && code) {
            saveSnippet(name, code, strategy);
            setNewSnippetName("");
            setDraftCode("");
            setIsCreatingSnippet(false);
        }
    };

    const onSaveFolder = () => {
        const name = newFolderName.trim();
        if (name) {
            createSnippetFolder(name, strategy);
            setNewFolderName("");
            setIsCreatingFolder(false);
        }
    };

    const handleInjectClick = (code) => {
        if (onInject) {
            onInject(code);
        } else {
            console.warn("Legacy append fallback not triggered (Editor Mode Active)");
        }
    };

    // Modal Handlers
    const requestDeleteFolder = (id) => setModalState({ isOpen: true, type: 'FOLDER', id });
    const requestDeleteSnippet = (id) => setModalState({ isOpen: true, type: 'SNIPPET', id });

    const handleConfirmDelete = () => {
        if (modalState.type === 'FOLDER') {
            deleteSnippetFolder(modalState.id, strategy);
        } else if (modalState.type === 'SNIPPET') {
            deleteSnippet(modalState.id, strategy);
        }
        setModalState({ isOpen: false, type: null, id: null });
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="sidebar" style={{ borderLeft: '1px solid #333', marginLeft: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h2 style={{ padding: '0 10px', paddingTop: 10 }}>Global Presets ({strategy})</h2>

                <div className="snippet-list-container" style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                    {/* Folders */}
                    {folders.map(f => (
                        <DroppableFolderItem
                            key={f.id}
                            folder={f}
                            snippets={getSnippetsInFolder(f.id)}
                            onRequestDelete={requestDeleteFolder}
                            onInject={handleInjectClick}
                            onRequestDeleteSnippet={requestDeleteSnippet}
                            onMoveSnippet={(sid, fid) => moveSnippet(sid, fid, strategy)}
                            allFolders={folders}
                        />
                    ))}

                    {/* Root Snippets */}
                    <DroppableRootZone>
                        {rootSnippets.map(s => (
                            <DraggableSnippetItem
                                key={s.id}
                                snippet={s}
                                onInject={handleInjectClick}
                                onRequestDelete={requestDeleteSnippet}
                                onMove={(sid, fid) => moveSnippet(sid, fid, strategy)}
                                folders={folders}
                            />
                        ))}
                    </DroppableRootZone>

                    {snippets.length === 0 && folders.length === 0 && (
                        <div style={{ color: '#666', fontStyle: 'italic', padding: 10, textAlign: 'center' }}>
                            No presets or folders.
                        </div>
                    )}
                </div>

                {/* Action Bar */}
                <div className="actions-bar" style={{ padding: 10, borderTop: '1px solid #333' }}>
                    {!isCreatingSnippet && !isCreatingFolder && (
                        <div style={{ display: 'flex', gap: 5 }}>
                            <button className="action-btn" style={{ flex: 1 }} onClick={() => setIsCreatingSnippet(true)}>+ Snippet</button>
                            <button className="toolbox-btn" style={{ flex: 1 }} onClick={() => setIsCreatingFolder(true)}>+ Folder</button>
                        </div>
                    )}

                    {isCreatingFolder && (
                        <div className="creation-form" style={{ background: '#2a2a2a', padding: 10, borderRadius: 6 }}>
                            <input
                                placeholder="Folder Name"
                                autoFocus
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') onSaveFolder(); }}
                                style={{ width: '100%', marginBottom: 5, padding: 5 }}
                            />
                            <div style={{ display: 'flex', gap: 5 }}>
                                <button
                                    className="action-btn"
                                    style={{ flex: 1, background: '#4CAF50', opacity: !newFolderName.trim() ? 0.5 : 1 }}
                                    onClick={onSaveFolder}
                                    disabled={!newFolderName.trim()}
                                    type="button"
                                >
                                    Create
                                </button>
                                <button type="button" className="toolbox-btn" style={{ flex: 1 }} onClick={() => setIsCreatingFolder(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {isCreatingSnippet && (
                        <div className="creation-form" style={{ background: '#2a2a2a', padding: 10, borderRadius: 6 }}>
                            <input
                                placeholder="Snippet Name"
                                autoFocus
                                value={newSnippetName}
                                onChange={e => setNewSnippetName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') snippetCodeRef.current?.focus(); }}
                                style={{ width: '100%', marginBottom: 5, padding: 5 }}
                            />
                            <textarea
                                ref={snippetCodeRef}
                                placeholder="Paste code here..."
                                value={draftCode}
                                onChange={e => setDraftCode(e.target.value)}
                                style={{ width: '100%', height: 60, marginBottom: 5, background: '#1e1e1e', color: '#fff', border: '1px solid #444', fontFamily: 'monospace', fontSize: '0.8rem' }}
                            />
                            <div style={{ display: 'flex', gap: 5 }}>
                                <button
                                    className="action-btn"
                                    style={{ flex: 1, background: '#4CAF50', opacity: (!newSnippetName.trim() || !draftCode.trim()) ? 0.5 : 1 }}
                                    onClick={onSaveSnippet}
                                    disabled={!newSnippetName.trim() || !draftCode.trim()}
                                >
                                    Save
                                </button>
                                <button className="toolbox-btn" style={{ flex: 1 }} onClick={() => setIsCreatingSnippet(false)}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={modalState.isOpen}
                    message={modalState.type === 'FOLDER' ? "Delete this folder? Snippets inside will be moved to Uncategorized." : "Delete this snippet?"}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setModalState({ isOpen: false, type: null, id: null })}
                />
            </div>
        </DndContext>
    );
};

export default SnippetsManager;

import React, { useContext, useState } from 'react';
import { ProjectContext } from '../../context/ProjectContext';

const SnippetsManager = ({ onInject }) => {
    const { appData, currentProject, saveSnippet, deleteSnippet } = useContext(ProjectContext);
    const [newSnippetName, setNewSnippetName] = useState("");

    if (!currentProject) return null;

    const strategy = currentProject.data.strategy || 'Vanilla';
    const snippets = (appData.snippets && appData.snippets[strategy]) ? appData.snippets[strategy] : [];

    // Local draft state
    const [draftCode, setDraftCode] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const onSave = () => {
        if (newSnippetName && draftCode) {
            saveSnippet(newSnippetName, draftCode, strategy);
            setNewSnippetName("");
            setDraftCode("");
            setIsCreating(false);
        }
    };

    const handleInjectClick = (code) => {
        if (onInject) {
            onInject(code);
        } else {
            console.warn("Legacy append fallback not triggered (Editor Mode Active)");
        }
    };

    return (
        <div className="sidebar" style={{ borderLeft: '1px solid #333', marginLeft: 0 }}>
            <h2>Global Presets ({strategy})</h2>

            <div className="snippet-list">
                {snippets.length === 0 && <div style={{ color: '#666', fontStyle: 'italic', padding: 10 }}>No presets for {strategy}</div>}

                {snippets.map(s => (
                    <div key={s.id} className="snippet-item" style={{ background: '#222', padding: 8, marginBottom: 8, borderRadius: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: '#d4d4d4' }}>{s.name}</strong>
                            <button onClick={() => deleteSnippet(s.id, strategy)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#888', maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'monospace', margin: '5px 0' }}>
                            {s.code.substring(0, 50)}...
                        </div>
                        <button className="toolbox-btn" style={{ marginTop: 5 }} onClick={() => handleInjectClick(s.code)}>+ Inject (Cursor)</button>
                    </div>
                ))}
            </div>

            <hr style={{ borderColor: '#444', margin: '10px 0' }} />

            {!isCreating ? (
                <button className="action-btn" onClick={() => setIsCreating(true)}>+ New Preset</button>
            ) : (
                <div className="creation-form" style={{ background: '#2a2a2a', padding: 10, borderRadius: 6 }}>
                    <input
                        placeholder="Preset Name"
                        value={newSnippetName}
                        onChange={e => setNewSnippetName(e.target.value)}
                        style={{ width: '100%', marginBottom: 5, padding: 5 }}
                    />
                    <textarea
                        placeholder="Paste code here..."
                        value={draftCode}
                        onChange={e => setDraftCode(e.target.value)}
                        style={{ width: '100%', height: 60, marginBottom: 5, background: '#1e1e1e', color: '#fff', border: '1px solid #444', fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                    <div style={{ display: 'flex', gap: 5 }}>
                        <button className="action-btn" style={{ flex: 1, background: '#4CAF50' }} onClick={onSave}>Save</button>
                        <button className="action-btn" style={{ flex: 1, background: '#555' }} onClick={() => setIsCreating(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SnippetsManager;

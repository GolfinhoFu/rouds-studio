import React, { useState, useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';

const Launcher = () => {
    const { appData, createProject, openProject, deleteProject, exportData, importData } = useContext(ProjectContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [newProjName, setNewProjName] = useState("");
    const [newProjStrategy, setNewProjStrategy] = useState("Vanilla");
    const [searchTerm, setSearchTerm] = useState("");

    const handleCreate = () => {
        if (!newProjName) return;
        createProject(newProjName, newProjStrategy);
        setModalOpen(false);
        setNewProjName("");
    };

    const filteredProjects = React.useMemo(() => {
        const projects = appData?.projects || [];
        return projects
            .filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => (b.lastEdited || 0) - (a.lastEdited || 0));
    }, [appData?.projects, searchTerm]);

    return (
        <div className="launcher-screen">
            <div className="launcher-content">
                <div className="launcher-header">
                    <h1>Rounds <span>Studio</span></h1>
                    <p>Select a Deck to start modding</p>

                    <div className="search-bar-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="🔍 Search projects..."
                            aria-label="Search projects"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ marginTop: 15, display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <button className="toolbox-btn" style={{ width: 'auto', display: 'inline-block' }} onClick={exportData}>💾 Backup Data</button>
                        <button className="toolbox-btn" style={{ width: 'auto', display: 'inline-block' }} onClick={() => document.getElementById('restore-input').click()}>📂 Restore Data</button>
                        <input
                            id="restore-input"
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => importData(ev.target.result);
                                reader.readAsText(file);
                                e.target.value = null; // reset
                            }}
                        />
                    </div>
                </div>

                <div className="project-grid">
                    <div className="project-card new-project-card" role="button" tabIndex={0} onClick={() => setModalOpen(true)}>
                        <span>+ Create New Deck</span>
                    </div>

                    {filteredProjects.map(p => (
                        <div key={p.id} className="project-card" role="button" tabIndex={0} onClick={() => openProject(p.id)}>
                            <div>
                                <h3>{p.name}</h3>
                                <span>{p.data.cards ? p.data.cards.length : 0} Cards • {p.data.strategy}</span>
                            </div>
                            <span>{new Date(p.lastEdited).toLocaleDateString()}</span>
                            <button
                                className="delete-project-btn"
                                onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) deleteProject(p.id); }}
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Deck</h2>
                        <div className="input-group">
                            <label>Deck Name</label>
                            <input
                                autoFocus
                                value={newProjName}
                                onChange={e => setNewProjName(e.target.value)}
                                placeholder="My Awesome Mod"
                            />
                        </div>
                        <div className="input-group">
                            <label>Strategy</label>
                            <select value={newProjStrategy} onChange={e => setNewProjStrategy(e.target.value)}>
                                <option value="Vanilla">Vanilla (UnboundLib)</option>
                                <option value="ModsPlus">ModsPlus</option>
                                <option value="Custom">Custom Template</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button className="action-btn" onClick={handleCreate}>Create</button>
                            <button className="toolbox-btn" style={{ textAlign: 'center' }} onClick={() => setModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Launcher;

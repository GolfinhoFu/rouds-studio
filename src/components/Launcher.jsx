import React, { useState, useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableProjectCard = ({ project, onClick, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="project-card"
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            <div>
                <h3>{project.name}</h3>
                <span>{project.data.cards ? project.data.cards.length : 0} Cards • {project.data.strategy}</span>
            </div>
            <span>{new Date(project.lastEdited).toLocaleDateString()}</span>
            <button
                type="button"
                className="delete-project-btn"
                onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project.id);
                }}
            >
                &times;
            </button>
        </div>
    );
};

const Launcher = () => {
    const { appData, createProject, openProject, deleteProject, exportData, importData, reorderProjects } = useContext(ProjectContext);
    const [isModalOpen, setModalOpen] = useState(false);
    const [newProjName, setNewProjName] = useState("");
    const [newProjStrategy, setNewProjStrategy] = useState("Vanilla");
    const [searchTerm, setSearchTerm] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags on click
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleCreate = () => {
        if (!newProjName) return;
        createProject(newProjName, newProjStrategy);
        setModalOpen(false);
        setNewProjName("");
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        // Defensive check for null targets (CodeRabbit suggestion)
        if (!over || !active) return;

        if (active.id !== over.id) {
            const oldIndex = appData.projects.findIndex((p) => p.id === active.id);
            const newIndex = appData.projects.findIndex((p) => p.id === over.id);

            // Guard against invalid indices
            if (oldIndex === -1 || newIndex === -1) return;

            const newOrder = arrayMove(appData.projects, oldIndex, newIndex);
            reorderProjects(newOrder);
        }
    };

    const displayedProjects = React.useMemo(() => {
        const projects = appData?.projects || [];

        if (searchTerm.length > 0) {
            return projects
                .filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
                .sort((a, b) => (b.lastEdited || 0) - (a.lastEdited || 0));
        }

        // If not searching, we show them in the order defined in the context (user defined order)
        return projects;
    }, [appData?.projects, searchTerm]);

    const isSearching = searchTerm.length > 0;

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

                    {!isSearching ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={displayedProjects.map(p => p.id)}
                                strategy={rectSortingStrategy}
                            >
                                {displayedProjects.map(p => (
                                    <SortableProjectCard
                                        key={p.id}
                                        project={p}
                                        onClick={() => openProject(p.id)}
                                        onDelete={(id) => { if (confirm('Delete?')) deleteProject(id); }}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    ) : (
                        // Render without DnD when searching
                        displayedProjects.map(p => (
                            <div
                                key={p.id}
                                className="project-card"
                                role="button"
                                tabIndex={0}
                                onClick={() => openProject(p.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        openProject(p.id);
                                    }
                                }}
                            >
                                <div>
                                    <h3>{p.name}</h3>
                                    <span>{p.data.cards ? p.data.cards.length : 0} Cards • {p.data.strategy}</span>
                                </div>
                                <span>{new Date(p.lastEdited).toLocaleDateString()}</span>
                                <button
                                    type="button"
                                    className="delete-project-btn"
                                    onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) deleteProject(p.id); }}
                                >
                                    &times;
                                </button>
                            </div>
                        ))
                    )}
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

import React, { useContext } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import PropertiesPanel from './PropertiesPanel';
import VisualPreview from './VisualPreview';
import CodeEditor from './CodeEditor';

const StudioLayout = () => {
    const { closeProject, currentProject, currentCardIndex, setCurrentCardIndex, createCard, deleteCard } = useContext(ProjectContext);

    // Ref to access Editor methods (insertText)
    const editorRef = React.useRef(null);

    const handleInject = (text) => {
        if (editorRef.current) {
            editorRef.current.insertText(text);
        }
    };

    if (!currentProject) return null;

    return (
        <div className="studio-container active">
            {/* 1. PROJECT PANEL */}
            <div className="project-panel">
                <div className="project-title">{currentProject.name}</div>
                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                    {currentProject.data.cards.map((c, i) => (
                        <button
                            key={i}
                            className={`card-list-item ${i === currentCardIndex ? 'active' : ''}`}
                            onClick={() => setCurrentCardIndex(i)}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>
                <div className="project-actions">
                    <button className="toolbox-btn" onClick={createCard}>+ New Card</button>
                    <button className="toolbox-btn" style={{ color: '#ff4444' }} onClick={() => { if (confirm('Delete Card?')) deleteCard(currentCardIndex); }}>Delete Current</button>
                    <button className="action-btn" onClick={closeProject}>Back to Home</button>
                </div>
            </div>

            {/* 2. CONFIG SIDEBAR (Includes Stats) */}
            <PropertiesPanel onInject={handleInject} />

            {/* 3. EDITOR */}
            <CodeEditor ref={editorRef} />

            {/* 4. PREVIEW */}
            <VisualPreview />
        </div>
    );
};

export default StudioLayout;

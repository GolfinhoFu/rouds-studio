import React, { createContext, useState, useEffect } from 'react';
import { generateCardCode, TemplateStrategies, getDefaultVanillaTemplate } from '../utils/templates';
import { DEFAULT_PRESETS, DEFAULT_FOLDERS } from '../utils/defaultPresets';

export const ProjectContext = createContext();

const STORAGE_KEY = 'roundsStudioDataV2';

export const ProjectProvider = ({ children }) => {
    const [appData, setAppData] = useState({
        projects: [],
        snippets: { ModsPlus: [], Vanilla: [], Custom: [] },
        snippetFolders: { ModsPlus: [], Vanilla: [], Custom: [] }
    });
    const [currentProject, setCurrentProject] = useState(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(-1);

    // LOAD
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);

            // Migration: Ensure snippets object exists
            if (!parsed.snippets) {
                parsed.snippets = {
                    ModsPlus: [],
                    Vanilla: [...(DEFAULT_PRESETS.Vanilla || [])],
                    Custom: []
                };
            }

            // Migration: Ensure snippetFolders object exists
            if (!parsed.snippetFolders) {
                parsed.snippetFolders = {
                    ModsPlus: [],
                    Vanilla: [...(DEFAULT_FOLDERS.Vanilla || [])],
                    Custom: []
                };
            }

            setAppData(parsed);
        } else {
            // First time load: Inject Defaults
            if (!DEFAULT_PRESETS?.Vanilla || !DEFAULT_FOLDERS?.Vanilla) {
                console.error('Default presets structure is invalid');
                return;
            }
            setAppData(prev => ({
                ...prev,
                snippets: { ...prev.snippets, Vanilla: [...DEFAULT_PRESETS.Vanilla] },
                snippetFolders: { ...prev.snippetFolders, Vanilla: [...DEFAULT_FOLDERS.Vanilla] }
            }));
        }
             snippetFolders: { ...prev.snippetFolders, Vanilla: [...DEFAULT_FOLDERS.Vanilla] }
         }));
}, []);

// SAVE
useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}, [appData]);
const createProject = (name, strategy) => {
    const newProj = {
        id: Date.now().toString(),
        name: name,
        lastEdited: Date.now(),
        data: {
            name: name,
            strategy: strategy || 'Vanilla',
            customTemplate: strategy === 'Custom' ? getDefaultVanillaTemplate() : '',
            cards: [],
            customSnippets: [] // Legacy per-project snippets, keeping for compatibility
        }
    };
    setAppData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
    setCurrentProject(JSON.parse(JSON.stringify(newProj)));
    setCurrentCardIndex(-1);
};
const deleteProject = (id) => {
    setAppData(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id)
    }));
    if (currentProject && currentProject.id === id) {
        closeProject();
    }
};

const reorderProjects = (newProjectsList) => {
    // Validate input
    if (!Array.isArray(newProjectsList)) {
        console.error('reorderProjects: newProjectsList must be an array');
        return;
    }

    // Validate project structure
    const isValid = newProjectsList.every(p => p && p.id && p.name && p.data);
    if (!isValid) {
        console.error('reorderProjects: Invalid project structure in newProjectsList');
        return;
    }

    // Validate same set of projects (prevent accidental data loss)
    const currentIds = new Set(appData.projects.map(p => p.id));
    const newIds = new Set(newProjectsList.map(p => p.id));
    if (currentIds.size !== newIds.size || ![...currentIds].every(id => newIds.has(id))) {
        console.error('reorderProjects: Project IDs mismatch - refusing to update');
        return;
    }

    // Check if currentProject is still in the new list
    if (currentProject) {
        const stillExists = newProjectsList.some(p => p.id === currentProject.id);
        if (!stillExists) {
            closeProject();
        }
    }

    setAppData(prev => ({
        ...prev,
        projects: newProjectsList
    }));
};
// SNIPPET ACTIONS
const createSnippetFolder = (name, strategy) => {
    const trimmedName = name ? name.trim() : "";
    if (!trimmedName) {
        console.error("createSnippetFolder: name is required");
        return;
    }

    setAppData(prev => {
        const targetStrat = strategy || 'Vanilla';
        const list = prev.snippetFolders[targetStrat] || [];
        const newFolder = { id: Date.now().toString(), name: trimmedName };
        return {
            ...prev,
            snippetFolders: {
                ...prev.snippetFolders,
                [targetStrat]: [...list, newFolder]
            }
        };
    });
};
const deleteSnippetFolder = (folderId, strategy) => {
    setAppData(prev => {
        const targetStrat = strategy || 'Vanilla';
        // Move snippets in this folder back to root (null folderId)
        const updatedSnippets = prev.snippets[targetStrat].map(s =>
            s.folderId === folderId ? { ...s, folderId: null } : s
        );

        return {
            ...prev,
            snippets: {
                ...prev.snippets,
                [targetStrat]: updatedSnippets
            },
            snippetFolders: {
                ...prev.snippetFolders,
                [targetStrat]: (prev.snippetFolders[targetStrat] || []).filter(f => f.id !== folderId)
            }
        };
    });
};

const saveSnippet = (name, code, strategy, folderId = null) => {
    const trimmedName = name ? name.trim() : "";

    if (!trimmedName) {
        console.error('saveSnippet: name is required');
        return;
    }
    if (code === undefined || code === null) {
        console.error('saveSnippet: code is required');
        return;
    }
    setAppData(prev => {
        const targetStrat = strategy || 'Vanilla';
        const list = prev.snippets[targetStrat] || [];

        const newSnippet = { id: Date.now().toString(), name: trimmedName, code, folderId };

        return {
            ...prev,
            snippets: {
                ...prev.snippets,
                [targetStrat]: [...list, newSnippet]
            }
        };
    });
};
const moveSnippet = (snippetId, folderId, strategy) => {
    setAppData(prev => {
        const targetStrat = strategy || 'Vanilla';

        // Defensive check (CodeRabbit)
        if (!prev.snippets || !Array.isArray(prev.snippets[targetStrat])) {
            return prev;
        }

        return {
            ...prev,
            snippets: {
                ...prev.snippets,
                [targetStrat]: prev.snippets[targetStrat].map(s =>
                    s.id === snippetId ? { ...s, folderId } : s
                )
            }
        };
    });
};

const deleteSnippet = (id, strategy) => {
    setAppData(prev => {
        const targetStrat = strategy || 'Vanilla';
        const existing = Array.isArray(prev.snippets?.[targetStrat]) ? prev.snippets[targetStrat] : [];

        return {
            ...prev,
            snippets: {
                ...prev.snippets,
                [targetStrat]: existing.filter(s => s.id !== id)
            }
        };
    });
};

const openProject = (id) => {
    const proj = appData.projects.find(p => p.id === id);
    if (proj) {
        setCurrentProject(JSON.parse(JSON.stringify(proj)));
        setAppData(prev => ({
            ...prev,
            projects: prev.projects.map(p =>
                p.id === id ? { ...p, lastEdited: Date.now() } : p
            )
        }));

        if (proj.data.cards.length > 0) {
            setCurrentCardIndex(0);
        } else {
            setCurrentCardIndex(-1);
        }
    }
};

const closeProject = () => {
    if (currentProject) {
        saveProject(currentProject);
    }
    setCurrentProject(null);
    setCurrentCardIndex(-1);
};

const saveProject = (projState) => {
    if (!projState) return;
    setAppData(prev => ({
        ...prev,
        projects: prev.projects.map(p =>
            p.id === projState.id ? { ...p, data: projState.data, lastEdited: Date.now() } : p
        )
    }));
};

// CARD ACTIONS

const updateCurrentProjectData = (updater) => {
    setCurrentProject(prev => {
        if (!prev) return null;
        // DEEP COPY IS CRITICAL HERE
        const clone = JSON.parse(JSON.stringify(prev));
        const updated = updater(clone);
        saveProject(updated); // Sync to global appData
        return updated;
    });
};

const createCard = () => {
    if (!currentProject) return;

    const newIdx = currentProject.data.cards.length;

    const newCard = {
        name: "New Card " + (newIdx + 1),
        desc: "Description",
        rarity: "Common",
        theme: "DestructiveRed",
        code: generateCardCode(currentProject.data.strategy, currentProject.data.customTemplate, currentProject.data, { name: "NewCard" + (newIdx + 1) })
    };

    updateCurrentProjectData(proj => {
        if (!proj.data.cards) proj.data.cards = [];
        proj.data.cards.push(newCard);
        return proj;
    });

    setCurrentCardIndex(newIdx);
};

const deleteCard = (index) => {
    if (!currentProject) return;
    const newLength = currentProject.data.cards.length - 1;
    updateCurrentProjectData(proj => {
        proj.data.cards.splice(index, 1);
        return proj;
    });
    setCurrentCardIndex(newLength === 0 ? -1 : Math.max(0, index - 1));
};
const updateCard = (index, field, value) => {
    if (!currentProject || index < 0) return;
    updateCurrentProjectData(proj => {
        if (proj.data.cards[index]) {
            proj.data.cards[index][field] = value;
        }
        return proj;
    });
};

return (
    <ProjectContext.Provider value={{
        appData,
        currentProject,
        currentCardIndex,
        setCurrentCardIndex,
        createProject,
        deleteProject,
        reorderProjects,
        openProject,
        closeProject,
        createCard,
        deleteCard,
        updateCard,
        saveSnippet,
        deleteSnippet,
        createSnippetFolder,
        deleteSnippetFolder,
        moveSnippet,
        // Data Persistence
        exportData: () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "rounds-studio-backup_" + Date.now() + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        },
        importData: (jsonString) => {
            try {
                const parsed = JSON.parse(jsonString);
                if (parsed.projects && parsed.snippets && parsed.snippetFolders) {
                    setAppData(parsed);
                    alert("Data imported successfully!");
                } else {
                    alert("Invalid backup file format. Missing required properties: projects, snippets, or snippetFolders.");
                }
            } catch (e) {
                console.error(e);
                alert("Failed to parse backup file.");
            }
        }
    }}>
        {children}
    </ProjectContext.Provider>
);
};

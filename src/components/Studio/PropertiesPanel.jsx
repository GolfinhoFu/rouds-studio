import React, { useContext, useState, useEffect } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import SnippetsManager from './SnippetsManager';
import StatGroup from './StatGroup';
import { STAT_GROUPS, applyStatsToCode } from '../../utils/codeModifiers';

const PropertiesPanel = ({ onInject }) => {
    const { currentProject, currentCardIndex, updateCard } = useContext(ProjectContext);

    // Internal state for stats
    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('config'); // 'config' or 'presets'

    // Reset stats when card changes
    useEffect(() => {
        const defaults = {};
        Object.values(STAT_GROUPS).flat().forEach(s => {
            defaults[s.key] = s.type === 'mult' ? 1 : 0;
        });
        setStats(defaults);
    }, [currentProject?.id, currentCardIndex]);

    if (!currentProject || currentCardIndex === -1) return <div className="sidebar">Select a card</div>;

    const card = currentProject.data.cards[currentCardIndex];
    if (!card) return null;

    const handleChange = (field, val) => {
        updateCard(currentCardIndex, field, val);
    };

    const handleStatChange = (key, val) => {
        setStats(prev => ({ ...prev, [key]: val }));
    };

    const handleApply = () => {
        const newCode = applyStatsToCode(card.code, stats, card);
        updateCard(currentCardIndex, 'code', newCode);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-tabs" style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                <button
                    style={{ flex: 1, padding: 8, cursor: 'pointer', border: 'none', background: activeTab === 'config' ? '#4CAF50' : '#333', color: '#fff' }}
                    onClick={() => setActiveTab('config')}
                >
                    Config
                </button>
                <button
                    style={{ flex: 1, padding: 8, cursor: 'pointer', border: 'none', background: activeTab === 'presets' ? '#2196F3' : '#333', color: '#fff' }}
                    onClick={() => setActiveTab('presets')}
                >
                    Presets
                </button>
            </div>

            {activeTab === 'presets' ? (
                <SnippetsManager onInject={onInject} />
            ) : (
                <>
                    {/* CONFIG CONTENT */}
                    <h2>Config & Rules</h2>

                    <div className="input-group">
                        <label>Card Name</label>
                        <input value={card.name} onChange={e => handleChange('name', e.target.value)} />
                    </div>

                    <div className="input-group">
                        <label>Rarity</label>
                        <select value={card.rarity || 'Common'} onChange={e => handleChange('rarity', e.target.value)}>
                            <option value="Common">Common</option>
                            <option value="Uncommon">Uncommon</option>
                            <option value="Rare">Rare</option>
                            <option value="Legendary">Legendary</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Theme</label>
                        <select value={card.theme || 'DestructiveRed'} onChange={e => handleChange('theme', e.target.value)}>
                            <option value="DestructiveRed">Destructive Red</option>
                            <option value="DefensiveBlue">Defensive Blue</option>
                            <option value="TechWhite">Tech White</option>
                            <option value="NatureGreen">Nature Green</option>
                            <option value="Custom">Custom Color</option>
                        </select>
                    </div>

                    {card.theme === 'Custom' && (
                        <div className="input-group">
                            <label>Custom Color</label>
                            <input type="color" value={card.customColor || '#ff00ff'} onChange={e => handleChange('customColor', e.target.value)} style={{ height: 40, cursor: 'pointer' }} />
                        </div>
                    )}

                    {/* Meta Stats */}
                    <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label>Allow Multiple?</label>
                        <input type="checkbox" checked={card.allowMultiple || false} onChange={e => handleChange('allowMultiple', e.target.checked)} style={{ width: 'auto' }} />
                    </div>

                    <div className="input-group">
                        <label>Image URL</label>
                        <input value={card.image || ''} onChange={e => handleChange('image', e.target.value)} placeholder="http://... or DataURI" />
                    </div>

                    <hr style={{ borderColor: '#444', margin: '15px 0' }} />

                    {/* DYNAMIC STAT SECTIONS - Refactored */}
                    {Object.entries(STAT_GROUPS).map(([groupName, groupStats]) => (
                        <StatGroup
                            key={groupName}
                            groupName={groupName}
                            stats={groupStats}
                            values={stats}
                            onChange={handleStatChange}
                        />
                    ))}

                    <button className="action-btn" style={{ marginTop: 20, width: '100%', background: '#4CAF50' }} onClick={handleApply}>
                        Apply Configuration
                    </button>
                    <div style={{ fontSize: '0.7rem', color: '#777', marginTop: 5, textAlign: 'center' }}>
                        Valid for both Vanilla and ModsPlus
                    </div>
                </>
            )}
        </div>
    );
};

export default PropertiesPanel;

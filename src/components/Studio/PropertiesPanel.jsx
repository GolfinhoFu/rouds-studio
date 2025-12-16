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
{ key: "damage", label: "Damage", type: "mult", path: "gun.damage" },
{ key: "ammo", label: "Ammo", type: "add", path: "gun.ammo", step: 1 },
{ key: "reload", label: "Reload Time", type: "mult", path: "gun.reloadTime" },
{ key: "attackSpeed", label: "Attack Speed", type: "mult", path: "gun.attackSpeed" },
{ key: "projectiles", label: "Projectiles", type: "add", path: "gun.numberOfProjectiles", step: 1 },
{ key: "bursts", label: "Bursts", type: "add", path: "gun.bursts", step: 1 },
{ key: "reflects", label: "Bounces", type: "add", path: "gun.reflects", step: 1 },
{ key: "projSpeed", label: "Proj. Speed", type: "mult", path: "gun.projectileSpeed" },
{ key: "knockback", label: "Knockback", type: "mult", path: "gun.knockback" },
{ key: "spread", label: "Spread", type: "mult", path: "gun.spread" },
{ key: "recoil", label: "Recoil", type: "mult", path: "gun.recoil" },
    ],
"Character Stats": [
    { key: "health", label: "Health", type: "mult", path: "statModifiers.health" },
    { key: "speed", label: "Move Speed", type: "mult", path: "statModifiers.movementSpeed" },
    { key: "jump", label: "Jump Height", type: "mult", path: "statModifiers.jump" },
    { key: "gravity", label: "Gravity", type: "mult", path: "statModifiers.gravity" },
    { key: "size", label: "Size", type: "mult", path: "statModifiers.sizeMultiplier" },
    { key: "regen", label: "Regeneration", type: "add", path: "statModifiers.regen", step: 1 },
    { key: "lifesteal", label: "Life Steal", type: "mult", path: "statModifiers.lifeSteal" },
],
    "Block Stats": [
        { key: "blockCD", label: "Cooldown", type: "mult", path: "block.cdMultiplier" },
        { key: "blockHealing", label: "Healing", type: "add", path: "block.healing", step: 1 },
        { key: "blockForce", label: "Force", type: "mult", path: "block.forceToAdd" },
    ]
};

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

    // Helper for non-cursor based injection (stats)
    // We keep this using the old append logic for Stats application, or change it?
    // Let's keep it robust for stats to be "smart append".
    const applyStatsToCode = () => {
        let codeBlock = "            // [Stats Applied Start]\n";

        // 1. STATS
        Object.values(STAT_GROUPS).flat().forEach(s => {
            const val = stats[s.key];
            const isModified = s.type === 'mult' ? val !== 1 : val !== 0;

            if (isModified) {
                let line = `            ${s.path} = ${val}`;
                if (s.type === 'mult' || s.key.includes('speed') || s.key.includes('Speed')) line += "f";
                if (!line.endsWith('f') && !Number.isInteger(Number(val))) line += "f";
                line += ";";
                codeBlock += line + "\n";
            }
        });
        codeBlock += "            // [Stats Applied End]";

        // 2. METHOD OVERRIDES
        let newCode = card.code;
        const updateOverride = (methodName, val) => {
            const regex = new RegExp(`public override bool ${methodName}\\(\\)\\s*\\{ return (true|false); \\}`);
            const implementation = `public override bool ${methodName}() { return ${val}; }`;

            if (newCode.match(regex)) {
                newCode = newCode.replace(regex, implementation);
            } else {
                const lastBrace = newCode.lastIndexOf('}');
                if (lastBrace !== -1) {
                    newCode = newCode.substring(0, lastBrace) + `    ${implementation}\n` + newCode.substring(lastBrace);
                }
            }
        };

        if (card.allowMultiple !== undefined) updateOverride("GetAllowMultiple", card.allowMultiple);

        // Inject Stats Block
        const blockStart = "// [Stats Applied Start]";
        const blockEnd = "// [Stats Applied End]";
        if (newCode.includes(blockStart) && newCode.includes(blockEnd)) {
            const pattern = new RegExp(`// \\[Stats Applied Start\\][\\s\\S]*?// \\[Stats Applied End\\]`);
            newCode = newCode.replace(pattern, codeBlock);
        } else {
            const setupIdx = newCode.indexOf("SetupCard");
            if (setupIdx !== -1) {
                const openBrace = newCode.indexOf("{", setupIdx);
                if (openBrace !== -1) {
                    newCode = newCode.slice(0, openBrace + 1) + "\n" + codeBlock + newCode.slice(openBrace + 1);
                } else {
                    newCode += "\n" + codeBlock;
                }
            }
        }

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

                    {/* DYNAMIC STAT SECTIONS */}
                    {Object.entries(STAT_GROUPS).map(([groupName, groupStats]) => (
                        <div key={groupName} className="stat-group">
                            <h3 style={{ marginBottom: 10, color: '#88dbff' }}>{groupName}</h3>
                            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {groupStats.map(stat => (
                                    <div key={stat.key} className="stat-item">
                                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: 2 }}>{stat.label}</label>
                                        <input
                                            type="number"
                                            step={stat.step || 0.1}
                                            value={stats[stat.key] || (stat.type === 'mult' ? 1 : 0)}
                                            onChange={e => handleStatChange(stat.key, e.target.value)}
                                            style={{ width: '100%', padding: '4px', background: '#222', border: '1px solid #444', color: '#eee', borderRadius: 4 }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button className="action-btn" style={{ marginTop: 20, width: '100%', background: '#4CAF50' }} onClick={applyStatsToCode}>
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

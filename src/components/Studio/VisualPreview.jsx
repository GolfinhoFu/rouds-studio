import React, { useContext, useEffect, useState } from 'react';
import { ProjectContext } from '../../context/ProjectContext';
import { parseStatsFromCode } from '../../utils/parsers';

const VisualPreview = () => {
    const { currentProject, currentCardIndex } = useContext(ProjectContext);
    const [stats, setStats] = useState([]);

    const card = (currentProject && currentCardIndex !== -1 && currentProject.data.cards[currentCardIndex])
        ? currentProject.data.cards[currentCardIndex]
        : null;

    // Reactively parse stats when code changes
    // Moved hook to top level to avoid React Error #310
    useEffect(() => {
        if (card && card.code) {
            setStats(parseStatsFromCode(card.code));
        } else {
            setStats([]);
        }
    }, [card?.code]); // Safe access

    if (!card) return <div className="preview-panel"><div className="preview-title">Visual Preview</div></div>;

    const getThemeStyle = () => {
        if (card.theme === 'Custom') {
            return { borderColor: card.customColor, boxShadow: `0 0 15px ${card.customColor}40` };
        }
        return {};
    };

    const getThemeClass = () => {
        if (card.theme === 'Custom') return 'rounds-card';
        if (card.theme === 'DestructiveRed') return 'rounds-card theme-destructive';
        if (card.theme === 'DefensiveBlue') return 'rounds-card theme-defense';
        if (card.theme === 'TechWhite') return 'rounds-card theme-tech';
        if (card.theme === 'NatureGreen') return 'rounds-card theme-nature';
        return 'rounds-card';
    };

    return (
        <div className="preview-panel">
            <div className="preview-title">Visual Preview</div>

            <div className={getThemeClass()} style={getThemeStyle()}>
                <div className="card-header">
                    <div className="card-name">{card.name}</div>
                    <div className="card-rarity">{card.rarity || "COMMON"}</div>
                </div>

                <div className="card-image-placeholder">
                    {card.image ? (
                        <img src={card.image} alt="Art" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span>[Art Goes Here]</span>
                    )}
                </div>

                <div className="card-description">
                    {card.desc}
                </div>

                <div className="card-stats">
                    {stats.map((s, i) => (
                        <div key={i} className={`stat-row ${s.value >= (s.isMult ? 1 : 0) ? 'positive' : 'negative'}`}>
                            <span>{s.key}</span>
                            <span>{s.isMult ? (s.value > 1 ? '+' : '') + Math.round((s.value - 1) * 100) + '%' : '+' + s.value}</span>
                        </div>
                    ))}
                    {stats.length === 0 && <div style={{ textAlign: 'center', color: '#555', fontSize: '0.8rem' }}>No Stats Detected</div>}
                </div>
            </div>
        </div>
    );
};

export default VisualPreview;

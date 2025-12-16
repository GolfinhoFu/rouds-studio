import React from 'react';

const StatGroup = ({ groupName, stats, values, onChange }) => {
    return (
        <div className="stat-group">
            <h3 style={{ marginBottom: 10, color: '#88dbff' }}>{groupName}</h3>
            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {stats.map(stat => (
                    <div key={stat.key} className="stat-item">
                        <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: 2 }}>{stat.label}</label>
                        <input
                            type="number"
                            step={stat.step || 0.1}
                            value={values[stat.key] || (stat.type === 'mult' ? 1 : 0)}
                            onChange={e => onChange(stat.key, e.target.value)}
                            style={{
                                width: '100%',
                                padding: '4px',
                                background: '#222',
                                border: '1px solid #444',
                                color: '#eee',
                                borderRadius: 4
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatGroup;

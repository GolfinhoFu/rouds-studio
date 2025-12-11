export const STAT_PATTERNS = [
    { key: "Damage", regex: /gun\.damage\s*=\s*([\d\.]+)f?/i, isMult: true },
    { key: "Health", regex: /statModifiers\.health\s*=\s*([\d\.]+)f?/i, isMult: true },
    { key: "Ammo", regex: /gun\.ammo\s*=\s*(\d+)/i, isMult: false },
    { key: "Reload", regex: /gun\.reloadTime\s*=\s*([\d\.]+)f?/i, isMult: true },
    { key: "Projectiles", regex: /gun\.numberOfProjectiles\s*=\s*(\d+)/i, isMult: false },
    { key: "Bursts", regex: /gun\.bursts\s*=\s*(\d+)/i, isMult: false },
    { key: "Bounces", regex: /gun\.reflects\s*=\s*(\d+)/i, isMult: false },
    { key: "Knockback", regex: /gun\.knockback\s*=\s*([\d\.]+)f?/i, isMult: true },
    { key: "Speed", regex: /statModifiers\.movementSpeed\s*=\s*([\d\.]+)f?/i, isMult: true },
    { key: "Jump", regex: /statModifiers\.jump\s*=\s*([\d\.]+)f?/i, isMult: true },
    { key: "BlockCD", regex: /block\.cdMultiplier\s*=\s*([\d\.]+)f?/i, isMult: true },
];

export function parseStatsFromCode(code) {
    const stats = [];
    STAT_PATTERNS.forEach(p => {
        const match = code.match(p.regex);
        if (match) {
            const val = parseFloat(match[1]);
            stats.push({
                key: p.key,
                value: val,
                isMult: p.isMult
            });
        }
    });
    return stats;
}

export const STAT_GROUPS = {
    "Gun Stats": [
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

export const applyStatsToCode = (currentCode, stats, cardData) => {
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
    let newCode = currentCode;

    // Explicit overrides based on card data checkboxes
    if (cardData.allowMultiple !== undefined) {
        newCode = updateMethodOverride(newCode, "GetAllowMultiple", cardData.allowMultiple);
    }

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

    return newCode;
};

const updateMethodOverride = (code, methodName, val) => {
    const regex = new RegExp(`public override bool ${methodName}\\(\\)\\s*\\{ return (true|false); \\}`);
    const implementation = `public override bool ${methodName}() { return ${val}; }`;

    if (code.match(regex)) {
        return code.replace(regex, implementation);
    } else {
        const lastBrace = code.lastIndexOf('}');
        if (lastBrace !== -1) {
            return code.substring(0, lastBrace) + `    ${implementation}\n` + code.substring(lastBrace);
        }
    }
    return code;
};

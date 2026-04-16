// equipment.js
// Ausrüstungsdaten für Helden: Waffen (4 Stufen) + Rüstung (4 Stufen)
// Stufe 0 = Basis, Stufe 1-4 = Upgrades (kosten Orbs)

export const equipment = {
    zarewitsch: {
        weapons: [
            { name: 'Reichszepter', atkBonus: 0, orbCost: 0 },
            { name: 'Goldener Zepter', atkBonus: 1, orbCost: 1 },
            { name: 'Königszepter', atkBonus: 2, orbCost: 2 },
            { name: ' Imperialzepter', atkBonus: 3, orbCost: 3 },
            { name: 'Weltenzepter', atkBonus: 4, orbCost: 5 }
        ],
        armors: [
            { name: 'Uniform', defBonus: 0, hpBonus: 0, orbCost: 0 },
            { name: 'Garde-Uniform', defBonus: 1, hpBonus: 3, orbCost: 1 },
            { name: 'Kavallerie-Uniform', defBonus: 2, hpBonus: 7, orbCost: 2 },
            { name: 'Kaiser-Uniform', defBonus: 3, hpBonus: 12, orbCost: 3 },
            { name: 'Welten-Herrscher-Gewand', defBonus: 4, hpBonus: 20, orbCost: 5 }
        ]
    },
    carl_the_great: {
        weapons: [
            { name: 'Die heilige Kelle', atkBonus: 0, orbCost: 0 },
            { name: 'Holz-Kelle', atkBonus: 1, orbCost: 1 },
            { name: 'Eisen-Kelle', atkBonus: 2, orbCost: 2 },
            { name: 'Stahl-Kelle', atkBonus: 3, orbCost: 3 },
            { name: 'Göttliche Kelle', atkBonus: 4, orbCost: 5 }
        ],
        armors: [
            { name: 'Ritterrüstung', defBonus: 0, hpBonus: 0, orbCost: 0 },
            { name: 'Verstärkte Rüstung', defBonus: 1, hpBonus: 5, orbCost: 1 },
            { name: 'Paladin-Rüstung', defBonus: 2, hpBonus: 10, orbCost: 2 },
            { name: 'Heilige Rüstung', defBonus: 3, hpBonus: 18, orbCost: 3 },
            { name: 'Göttliche Rüstung', defBonus: 4, hpBonus: 28, orbCost: 5 }
        ]
    }
};

export function getLevelUpCost(level) {
    return 100 * Math.pow(2, level - 2);
}

export function getStatsAtLevel(characterId, level, heroData) {
    const hero = heroData || {};
    const baseHp = hero.hp || 10;
    const baseAtk = hero.atk || 3;
    const baseDef = hero.def || 1;
    const growthHp = hero.growthHp || 2;
    const growthAtk = hero.growthAtk || 1;
    const growthDef = hero.growthDef || 1;

    return {
        hp: baseHp + (level - 1) * growthHp,
        atk: baseAtk + (level - 1) * growthAtk,
        def: baseDef + (level - 1) * growthDef
    };
}
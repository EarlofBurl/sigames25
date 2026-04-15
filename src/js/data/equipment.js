// equipment.js
// Ausrüstungsdaten für Helden: Waffen (4 Stufen) + Rüstung (4 Stufen)
// Stufe 0 = Basis, Stufe 1-4 = Upgrades (kosten Orbs)

export const equipment = {
    montesquieu: {
        weapons: [
            { name: 'Zauberstab', atkBonus: 0, orbCost: 0 },
            { name: 'Holz-Stab', atkBonus: 1, orbCost: 1 },
            { name: 'Eisen-Stab', atkBonus: 2, orbCost: 2 },
            { name: 'Stahl-Stab', atkBonus: 3, orbCost: 3 },
            { name: 'Bann-Stab', atkBonus: 4, orbCost: 5 }
        ],
        armors: [
            { name: 'Roben', defBonus: 0, hpBonus: 0, orbCost: 0 },
            { name: 'Leichte Roben', defBonus: 1, hpBonus: 2, orbCost: 1 },
            { name: 'Schwere Roben', defBonus: 2, hpBonus: 5, orbCost: 2 },
            { name: 'Magier-Roben', defBonus: 3, hpBonus: 10, orbCost: 3 },
            { name: 'Heilige Roben', defBonus: 4, hpBonus: 15, orbCost: 5 }
        ]
    },
    ritter: {
        weapons: [
            { name: 'Lanze', atkBonus: 0, orbCost: 0 },
            { name: 'Kurzschwert', atkBonus: 1, orbCost: 1 },
            { name: 'Schwert', atkBonus: 2, orbCost: 2 },
            { name: 'Langschwert', atkBonus: 3, orbCost: 3 },
            { name: 'Bann-Lanze', atkBonus: 4, orbCost: 5 }
        ],
        armors: [
            { name: 'Leder', defBonus: 0, hpBonus: 0, orbCost: 0 },
            { name: 'Verstärkt', defBonus: 1, hpBonus: 5, orbCost: 1 },
            { name: 'Kettenrüstung', defBonus: 2, hpBonus: 10, orbCost: 2 },
            { name: 'Plattenrüstung', defBonus: 3, hpBonus: 15, orbCost: 3 },
            { name: 'Heilige Rüstung', defBonus: 4, hpBonus: 25, orbCost: 5 }
        ]
    },
    bogenschuetze: {
        weapons: [
            { name: 'Bogen', atkBonus: 0, orbCost: 0 },
            { name: 'Langbogen', atkBonus: 1, orbCost: 1 },
            { name: 'Stahlbogen', atkBonus: 2, orbCost: 2 },
            { name: 'Verstärkter Bogen', atkBonus: 3, orbCost: 3 },
            { name: 'Bann-Bogen', atkBonus: 4, orbCost: 5 }
        ],
        armors: [
            { name: 'Leder', defBonus: 0, hpBonus: 0, orbCost: 0 },
            { name: 'Jagd-Leder', defBonus: 1, hpBonus: 3, orbCost: 1 },
            { name: 'Armbrust-Leder', defBonus: 2, hpBonus: 6, orbCost: 2 },
            { name: 'Schützen-Rüstung', defBonus: 3, hpBonus: 10, orbCost: 3 },
            { name: 'Wind-Robe', defBonus: 4, hpBonus: 15, orbCost: 5 }
        ]
    },
    artillerie: {
        weapons: [
            { name: 'Armbrust', atkBonus: 0, orbCost: 0 },
            { name: 'Starke Armbrust', atkBonus: 1, orbCost: 1 },
            { name: 'Blide', atkBonus: 2, orbCost: 2 },
            { name: 'Katapult', atkBonus: 3, orbCost: 3 },
            { name: 'Bann-Katapult', atkBonus: 4, orbCost: 5 }
        ],
        armors: [
            { name: 'Stoff', defBonus: 0, hpBonus: 0, orbCost: 0 },
            { name: 'Leichte Weste', defBonus: 1, hpBonus: 2, orbCost: 1 },
            { name: 'Schwere Weste', defBonus: 2, hpBonus: 5, orbCost: 2 },
            { name: 'Kampf-Weste', defBonus: 3, hpBonus: 8, orbCost: 3 },
            { name: 'Sturmbock-Weste', defBonus: 4, hpBonus: 12, orbCost: 5 }
        ]
    },
    berserker: {
        weapons: [
            { name: 'Axt', atkBonus: 0, orbCost: 0 },
            { name: 'Streitaxt', atkBonus: 1, orbCost: 1 },
            { name: 'Doppelaxt', atkBonus: 2, orbCost: 2 },
            { name: 'Kriegsaxt', atkBonus: 3, orbCost: 3 },
            { name: 'Bann-Axt', atkBonus: 4, orbCost: 5 }
        ],
        armors: [
            { name: 'Stoff', defBonus: 0, hpBonus: 0, orbCost: 0 },
            { name: 'Fell', defBonus: 1, hpBonus: 3, orbCost: 1 },
            { name: 'Ring', defBonus: 2, hpBonus: 6, orbCost: 2 },
            { name: 'Stachelrüstung', defBonus: 3, hpBonus: 10, orbCost: 3 },
            { name: 'Berserker-Rüstung', defBonus: 4, hpBonus: 15, orbCost: 5 }
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

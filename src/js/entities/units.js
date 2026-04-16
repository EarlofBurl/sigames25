// units.js
// Verwaltung aller Einheiten (Spieler und Gegner) sowie deren Status
// Nutzt die Charakter-Datenbank (characters.js) als Vorlage

import { heroes, enemies } from '../data/characters.js';
import { equipment as equipmentData, getStatsAtLevel } from '../data/equipment.js';
import { loadHubData } from '../engine/storage.js';

const state = {
    playerUnits: [],
    enemyUnits: [],
    currentUnitIndex: 0
};

// Factory-Funktion: Erstellt eine Einheit aus der Charakter-Datenbank
// characterId: Key aus heroes oder enemies
// row, col: Startposition
// team: 'player' oder 'enemy'
// overrides: optionale Überschreibungen (z.B. { mana: 10 } für Spezialfälle)
export function createUnit(characterId, row, col, team, overrides = {}) {
    const db = team === 'player' ? heroes : enemies;
    const char = db[characterId];
    if (!char) {
        console.warn(`createUnit: Charakter '${characterId}' nicht gefunden!`);
        return null;
    }

    return {
        id: overrides.id || `${team}_${state.playerUnits.length + state.enemyUnits.length}_${Date.now()}`,
        characterId,
        name: overrides.name || char.name,
        portrait: overrides.portrait || char.portrait || '👤',
        row,
        col,
        team,
        color: overrides.color || char.color,
        hp: overrides.hp !== undefined ? overrides.hp : char.hp,
        maxHp: overrides.maxHp || char.hp,
        mp: overrides.mp !== undefined ? overrides.mp : char.mp,
        maxMp: overrides.maxMp || char.mp,
        mana: overrides.mana !== undefined ? overrides.mana : (char.mana || 0),
        maxMana: overrides.maxMana || (char.mana || 0),
        attack: overrides.atk !== undefined ? overrides.atk : char.atk,
        defense: overrides.def !== undefined ? overrides.def : char.def,
        speed: overrides.spd !== undefined ? overrides.spd : char.spd,
        range: overrides.rng !== undefined ? overrides.rng : char.rng,
        baseSight: overrides.baseSight || char.baseSight || 3,
        type: (overrides.rng || char.rng) > 1 ? 'Fernkampf' : 'Nahkampf',
        weapon: overrides.weapon || char.weapon || null,
        spells: overrides.spells !== undefined ? overrides.spells : (char.spells || []),
        traits: overrides.traits || char.traits || [],
        isHero: overrides.isHero || false,
        activeEffects: [],
        hasAttacked: false,
        hasMoved: false,
        hasCast: false,
        turnState: 'idle' // 'idle' | 'moved' | 'acted'
    };
}

// Player-Einheiten initialisieren (mit characterId oder inline-Daten)
export function initPlayerUnits(unitsData) {
    const hubData = loadHubData();

    state.playerUnits = unitsData.map((data, index) => {
        let unit;
        if (data.characterId) {
            const char = heroes[data.characterId];
            const level = hubData.heroLevels[data.characterId] || 1;
            const eq = hubData.heroEquipment[data.characterId] || { weaponStage: 0, armorStage: 0 };
            const weaponStage = eq.weaponStage || 0;
            const armorStage = eq.armorStage || 0;
            const weapon = equipmentData[data.characterId]?.weapons[weaponStage];
            const armor = equipmentData[data.characterId]?.armors[armorStage];

            const leveledStats = getStatsAtLevel(data.characterId, level, char);

            const hubOverrides = {
                hp: leveledStats.hp + (armor?.hpBonus || 0),
                maxHp: leveledStats.hp + (armor?.hpBonus || 0),
                atk: leveledStats.atk + (weapon?.atkBonus || 0),
                def: leveledStats.def + (armor?.defBonus || 0)
            };

            unit = createUnit(data.characterId, data.row, data.col, 'player', {
                ...data,
                ...hubOverrides,
                id: data.id || `player_${index}`,
                isHero: data.isHero !== undefined ? data.isHero : true
            });
        } else {
            // Inline-Daten (Rückwärtskompatibilität)
            unit = {
                id: data.id || `player_${index}`,
                characterId: null,
                name: data.name,
                portrait: data.portrait || '👤',
                row: data.row,
                col: data.col,
                team: 'player',
                color: data.color || '#0000FF',
                hp: data.hp || 20,
                maxHp: data.maxHp || data.hp || 20,
                mp: data.mp || 5,
                maxMp: data.maxMp || data.mp || 5,
                mana: data.mana || 0,
                maxMana: data.maxMana || data.mana || 0,
                attack: data.attack || 5,
                defense: data.defense || 2,
                speed: data.speed || 3,
                range: data.range || 1,
                baseSight: data.baseSight || 3,
                type: data.type || ((data.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf'),
                weapon: data.weapon || null,
                spells: data.spells || [],
                traits: data.traits || [],
                isHero: data.isHero || false,
                activeEffects: [],
                hasAttacked: false,
                hasMoved: false,
                hasCast: false,
                turnState: 'idle'
            };
        }
        return unit;
    });
    state.currentUnitIndex = 0;
}

// Feind-Einheiten initialisieren (mit characterId oder inline-Daten)
export function initEnemyUnits(enemiesData) {
    state.enemyUnits = enemiesData.map((data, index) => {
        let unit;
        if (data.characterId) {
            unit = createUnit(data.characterId, data.row, data.col, 'enemy', {
                ...data,
                id: data.id || `enemy_${index}`
            });
        } else {
            unit = {
                id: data.id || `enemy_${index}`,
                characterId: null,
                name: data.name,
                portrait: data.portrait || '👤',
                row: data.row,
                col: data.col,
                team: 'enemy',
                color: data.color || '#FF0000',
                hp: data.hp || 10,
                maxHp: data.maxHp || data.hp || 10,
                mp: data.mp || 3,
                maxMp: data.maxMp || data.mp || 3,
                mana: data.mana || 0,
                maxMana: data.maxMana || data.mana || 0,
                attack: data.attack || 4,
                defense: data.defense || 1,
                speed: data.speed || 3,
                range: data.range || 1,
                baseSight: data.baseSight || 3,
                type: data.type || ((data.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf'),
                weapon: data.weapon || null,
                spells: data.spells || [],
                traits: data.traits || [],
                isHero: false,
                activeEffects: [],
                hasAttacked: false,
                hasMoved: false,
                hasCast: false,
                turnState: 'idle'
            };
        }
        return unit;
    });
}

// Getter
export function getPlayerUnits() { return state.playerUnits; }
export function getEnemyUnits() { return state.enemyUnits; }
export function getCurrentUnit() { return state.playerUnits[state.currentUnitIndex]; }

export function getCurrentUnitPosition() {
    const unit = getCurrentUnit();
    if (!unit) return { row: 0, col: 0 };
    return { row: unit.row, col: unit.col };
}

export function getCurrentUnitAttributes() {
    const unit = state.playerUnits[state.currentUnitIndex];
    if (!unit) return null;

    let attack = unit.attack || 5;
    let defense = unit.defense || 2;

    if (unit.activeEffects) {
        unit.activeEffects.forEach(effect => {
            if (effect.effect === 'buff_attack') attack += effect.value;
            if (effect.effect === 'debuff_attack') attack -= effect.value;
            if (effect.effect === 'buff_defense') defense += effect.value;
            if (effect.effect === 'debuff_defense') defense -= effect.value;
        });
    }

    return {
        ...unit,
        range: unit.range || 1,
        type: unit.type || ((unit.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf'),
        spells: unit.spells || [],
        activeEffects: unit.activeEffects || [],
        attack,
        defense
    };
}

export function getCurrentUnitColor() {
    const unit = getCurrentUnit();
    return unit ? unit.color : '#0000FF';
}

// Setter
export function setCurrentUnitIndex(index) {
    if (index >= 0 && index < state.playerUnits.length) {
        state.currentUnitIndex = index;
    }
}

export function setCurrentUnitPosition(row, col) {
    const unit = state.playerUnits[state.currentUnitIndex];
    if (unit) {
        unit.row = row;
        unit.col = col;
        unit.hasMoved = true;
        if (unit.turnState === 'idle') unit.turnState = 'moved';
    }
}

export function setCurrentUnitMp(mp) {
    const unit = state.playerUnits[state.currentUnitIndex];
    if (unit) unit.mp = Math.max(0, mp);
}

export function setCurrentUnitHp(hp) {
    const unit = state.playerUnits[state.currentUnitIndex];
    if (unit) unit.hp = hp;
}

export function setCurrentUnitHasAttacked(value) {
    const unit = state.playerUnits[state.currentUnitIndex];
    if (unit) unit.hasAttacked = value;
}

// Turn-State: 'idle' | 'moved' | 'acted'
export function setUnitTurnState(unitId, stateValue) {
    const unit = state.playerUnits.find(u => u.id === unitId);
    if (unit) unit.turnState = stateValue;
}

export function getUnitTurnState(unitId) {
    const unit = state.playerUnits.find(u => u.id === unitId);
    return unit ? unit.turnState : 'acted';
}

export function getUnitHasCast(unitId) {
    const unit = state.playerUnits.find(u => u.id === unitId);
    return unit ? unit.hasCast : false;
}

export function setCurrentUnitMana(delta) {
    const unit = state.playerUnits[state.currentUnitIndex];
    if (unit) {
        unit.mana = Math.max(0, Math.min(unit.maxMana, unit.mana + delta));
    }
}

export function unitCastSpell(unitId, manaCost) {
    const unit = state.playerUnits.find(u => u.id === unitId);
    if (unit) {
        unit.mana = Math.max(0, unit.mana - manaCost);
        unit.hasCast = true;
        unit.hasAttacked = true;
    }
}

export function unitAttack(unitId) {
    const unit = state.playerUnits.find(u => u.id === unitId);
    if (unit) {
        unit.hasAttacked = true;
        unit.turnState = 'acted';
    }
}

// Rundenwechsel: Alle Einheiten zurücksetzen (MP, Mana, Status)
export function refillCurrentUnitMp() {
    state.playerUnits.forEach(unit => {
        unit.mp = unit.maxMp;
        const regen = Math.max(1, Math.floor(unit.maxMana * 0.3));
        unit.mana = Math.min(unit.maxMana, unit.mana + regen);
        unit.hasAttacked = false;
        unit.hasMoved = false;
        unit.hasCast = false;
        unit.turnState = 'idle';

        if (unit.activeEffects && unit.activeEffects.length > 0) {
            unit.activeEffects = unit.activeEffects
                .map(e => ({ ...e, duration: e.duration - 1 }))
                .filter(e => e.duration > 0);
        }
    });
}

export function nextUnit() {
    if (state.playerUnits.length > 0) {
        state.currentUnitIndex = (state.currentUnitIndex + 1) % state.playerUnits.length;
    }
}

// Effekte
export function applyEffectToUnit(unitId, effect) {
    const unit = state.playerUnits.find(u => u.id === unitId);
    if (unit) {
        if (!unit.activeEffects) unit.activeEffects = [];

        if (effect.effect === 'cleanse') {
            if (unit.activeEffects) {
                unit.activeEffects = unit.activeEffects.filter(e => {
                    const isNegative = e.effect === 'debuff_attack' || e.effect === 'debuff_defense';
                    return !isNegative;
                });
            }
            return;
        }

        unit.activeEffects.push({ ...effect });
    }
}

export function applyEffectToEnemy(enemyId, effect) {
    const enemy = state.enemyUnits.find(u => u.id === enemyId);
    if (enemy) {
        if (effect.effect === 'heal') {
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + effect.value);
            return;
        }
        if (effect.effect === 'cleanse') {
            if (enemy.activeEffects) {
                enemy.activeEffects = enemy.activeEffects.filter(e => {
                    const isNegative = e.effect === 'debuff_attack' || e.effect === 'debuff_defense';
                    return !isNegative;
                });
            }
            return;
        }
        if (!enemy.activeEffects) enemy.activeEffects = [];
        enemy.activeEffects.push({ ...effect });
    }
}

// Feind-Manipulation
export function setEnemyUnitPosition(id, row, col) {
    const enemy = state.enemyUnits.find(u => u.id === id);
    if (enemy) { enemy.row = row; enemy.col = col; enemy.hasMoved = true; }
}

export function setEnemyUnitMp(id, mp) {
    const enemy = state.enemyUnits.find(u => u.id === id);
    if (enemy) enemy.mp = Math.max(0, mp);
}

export function setEnemyUnitMana(id, mana) {
    const enemy = state.enemyUnits.find(u => u.id === id);
    if (enemy) enemy.mana = Math.max(0, Math.min(enemy.maxMana, mana));
}

export function setEnemyHasCast(id, value) {
    const enemy = state.enemyUnits.find(u => u.id === id);
    if (enemy) enemy.hasCast = value;
}

export function removeEnemyUnit(index) {
    state.enemyUnits.splice(index, 1);
}

export function setEnemyUnitHp(index, hp) {
    if (state.enemyUnits[index]) {
        state.enemyUnits[index].hp = Math.min(Math.max(0, hp), state.enemyUnits[index].maxHp);
    }
}

export function getEnemyUnitPosition(index) {
    if (state.enemyUnits[index]) {
        return { row: state.enemyUnits[index].row, col: state.enemyUnits[index].col };
    }
    return null;
}

export function getEnemyUnitAttributes(index) {
    if (state.enemyUnits[index]) {
        return { ...state.enemyUnits[index] };
    }
    return null;
}

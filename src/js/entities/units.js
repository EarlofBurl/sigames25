// units.js
// Verwaltung aller Einheiten (Spieler und Gegner) sowie deren Status

const state = {
    playerUnits: [],
    enemyUnits: [],
    currentUnitIndex: 0
};

export function initPlayerUnits(unitsData) {
    state.playerUnits = unitsData.map((unit, index) => ({
        ...unit,
        id: unit.id || `player_${index}`,
        hp: unit.hp || 20,
        maxHp: unit.maxHp || 20,
        mp: unit.mp || 5,
        maxMp: unit.maxMp || 5,
        attack: unit.attack || 5,
        defense: unit.defense || 2,
        color: unit.color || '#0000FF',
        baseSight: unit.baseSight || 3,
        range: unit.range || 1,
        type: unit.type || ((unit.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf'),
        spells: unit.spells || [],
        activeEffects: [],
        hasAttacked: false
    }));
    state.currentUnitIndex = 0;
}

export function initEnemyUnits(enemiesData) {
    state.enemyUnits = enemiesData.map((enemy, index) => ({
        ...enemy,
        id: enemy.id || `enemy_${index}`,
        hp: enemy.hp || 10,
        maxHp: enemy.maxHp || 10,
        mp: enemy.mp || 3,
        maxMp: enemy.maxMp || 3,
        attack: enemy.attack || 4,
        defense: enemy.defense || 1,
        color: enemy.color || '#FF0000',
        baseSight: enemy.baseSight || 3,
        range: enemy.range || 1,
        type: enemy.type || ((enemy.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf'),
        spells: enemy.spells || [],
        activeEffects: []
    }));
}

export function getPlayerUnits() { return state.playerUnits; }
export function getEnemyUnits() { return state.enemyUnits; }

export function getCurrentUnit() { return state.playerUnits[state.currentUnitIndex]; }

export function setCurrentUnitIndex(index) {
    if (index >= 0 && index < state.playerUnits.length) {
        state.currentUnitIndex = index;
    }
}

export function getCurrentUnitPosition() {
    const unit = getCurrentUnit();
    if (!unit) return { row: 0, col: 0 };
    return { row: unit.row, col: unit.col };
}

export function setCurrentUnitPosition(row, col) {
    const unit = state.playerUnits[state.currentUnitIndex];
    if (unit) { unit.row = row; unit.col = col; }
}

export function getCurrentUnitColor() {
    const unit = getCurrentUnit();
    return unit ? unit.color : '#0000FF';
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

export function refillCurrentUnitMp() {
    state.playerUnits.forEach(unit => {
        unit.mp = unit.maxMp;
        unit.hasAttacked = false;

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

export function applyEffectToUnit(unitId, effect) {
    const unit = state.playerUnits.find(u => u.id === unitId);
    if (unit) {
        if (!unit.activeEffects) unit.activeEffects = [];
        unit.activeEffects.push({ ...effect });
    }
}

export function applyEffectToEnemy(enemyId, effect) {
    const enemy = state.enemyUnits.find(u => u.id === enemyId);
    if (enemy) {
        if (!enemy.activeEffects) enemy.activeEffects = [];
        enemy.activeEffects.push({ ...effect });
    }
}

export function setEnemyUnitPosition(id, row, col) {
    const enemy = state.enemyUnits.find(u => u.id === id);
    if (enemy) { enemy.row = row; enemy.col = col; }
}

export function setEnemyUnitMp(id, mp) {
    const enemy = state.enemyUnits.find(u => u.id === id);
    if (enemy) enemy.mp = Math.max(0, mp);
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

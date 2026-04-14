// units.js
// Verwaltung aller Einheiten (Spieler und Gegner) sowie deren Status

export let playerUnits = [];
export let enemyUnits = [];
export let currentUnitIndex = 0;

/**
 * Initialisiert die Spielereinheiten (z.B. beim Missionsstart)
 */
export function initPlayerUnits(unitsData) {
    playerUnits = unitsData.map((unit, index) => ({
        ...unit,
        id: unit.id || `player_${index}`,
        hp: unit.hp || 20,
        maxHp: unit.maxHp || 20,
        mp: unit.mp || 5,
        maxMp: unit.maxMp || 5,
        attack: unit.attack || 5,
        defense: unit.defense || 2,
        color: unit.color || '#0000FF', // Standardfarbe Blau, falls keine angegeben
        baseSight: unit.baseSight || 3,
        range: unit.range || 1,
        type: unit.type || ((unit.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf'),
        spells: unit.spells || [],
        activeEffects: [],
        hasAttacked: false
    }));
    currentUnitIndex = 0;
}

/**
 * Initialisiert die gegnerischen Einheiten
 */
export function initEnemyUnits(enemiesData) {
    enemyUnits = enemiesData.map((enemy, index) => ({
        ...enemy,
        id: enemy.id || `enemy_${index}`,
        hp: enemy.hp || 10,
        maxHp: enemy.maxHp || 10,
        mp: enemy.mp || 3,
        maxMp: enemy.maxMp || 3,
        attack: enemy.attack || 4,
        defense: enemy.defense || 1,
        color: enemy.color || '#FF0000', // Standardfarbe Rot
        baseSight: enemy.baseSight || 3,
        range: enemy.range || 1,
        type: enemy.type || ((enemy.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf'),
        spells: enemy.spells || [],
        activeEffects: []
    }));
}

/**
 * Gibt die aktuell ausgewählte Einheit zurück
 */
export function getCurrentUnit() {
    return playerUnits[currentUnitIndex];
}

/**
 * Setzt den Index der aktuellen Einheit (wichtig für Mausklick-Auswahl)
 */
export function setCurrentUnitIndex(index) {
    if (index >= 0 && index < playerUnits.length) {
        currentUnitIndex = index;
    }
}

/**
 * Gibt die Position der aktuellen Einheit zurück
 */
export function getCurrentUnitPosition() {
    const unit = getCurrentUnit();
    if (!unit) return { row: 0, col: 0 };
    return { row: unit.row, col: unit.col };
}

/**
 * Setzt eine neue Position für die aktuelle Einheit
 */
export function setCurrentUnitPosition(row, col) {
    if (playerUnits[currentUnitIndex]) {
        playerUnits[currentUnitIndex].row = row;
        playerUnits[currentUnitIndex].col = col;
    }
}

/**
 * GIBT DIE FARBE ZURÜCK (Fix für den Renderer)
 */
export function getCurrentUnitColor() {
    const unit = getCurrentUnit();
    if (!unit) return '#0000FF';
    return unit.color;
}

/**
 * Gibt alle Attribute der aktuellen Einheit zurück (inkl. Effekte)
 */
export function getCurrentUnitAttributes() {
    const unit = playerUnits[currentUnitIndex];
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

/**
 * Aktualisiert die Bewegungspunkte (MP) der aktuellen Einheit
 */
export function setCurrentUnitMp(mp) {
    if (playerUnits[currentUnitIndex]) {
        playerUnits[currentUnitIndex].mp = Math.max(0, mp);
    }
}

export function setCurrentUnitHasAttacked(value) {
    if (playerUnits[currentUnitIndex]) {
        playerUnits[currentUnitIndex].hasAttacked = value;
    }
}

/**
 * Füllt die MP aller Spielereinheiten auf (für Rundenwechsel) und baut Effekte ab
 */
export function refillCurrentUnitMp() {
    playerUnits.forEach(unit => {
        unit.mp = unit.maxMp;
        unit.hasAttacked = false;
        
        if (unit.activeEffects && unit.activeEffects.length > 0) {
            const remainingEffects = [];
            unit.activeEffects.forEach(effect => {
                effect.duration -= 1;
                if (effect.duration > 0) {
                    remainingEffects.push(effect);
                }
            });
            unit.activeEffects = remainingEffects;
        }
    });
}

/**
 * Aktualisiert die Lebenspunkte (HP) der aktuellen Einheit
 */
export function setCurrentUnitHp(hp) {
    if (playerUnits[currentUnitIndex]) {
        playerUnits[currentUnitIndex].hp = hp;
    }
}

/**
 * Schaltet zur nächsten verfügbaren Einheit um (Tab-Logik)
 */
export function nextUnit() {
    if (playerUnits.length > 0) {
        currentUnitIndex = (currentUnitIndex + 1) % playerUnits.length;
    }
}

/**
 * Exportiert die Listen für den Renderer/KI
 */
export function getPlayerUnits() {
    return playerUnits;
}

export function getEnemyUnits() {
    return enemyUnits;
}

/**
 * Wendet einen Effekt auf eine spezifische Spieler-Einheit an
 */
export function applyEffectToUnit(unitId, effect) {
    const unit = playerUnits.find(u => u.id === unitId);
    if (unit) {
        if (!unit.activeEffects) unit.activeEffects = [];
        unit.activeEffects.push({ ...effect });
    }
}

/**
 * Wendet einen Effekt auf eine feindliche Einheit an
 */
export function applyEffectToEnemy(enemyId, effect) {
    const enemy = enemyUnits.find(u => u.id === enemyId);
    if (enemy) {
        if (!enemy.activeEffects) enemy.activeEffects = [];
        enemy.activeEffects.push({ ...effect });
    }
}

/**
 * Setzt eine neue Position für eine feindliche Einheit
 */
export function setEnemyUnitPosition(id, row, col) {
    const enemy = enemyUnits.find(u => u.id === id);
    if (enemy) {
        enemy.row = row;
        enemy.col = col;
    }
}

/**
 * Aktualisiert die Bewegungspunkte (MP) einer feindlichen Einheit
 */
export function setEnemyUnitMp(id, mp) {
    const enemy = enemyUnits.find(u => u.id === id);
    if (enemy) {
        enemy.mp = Math.max(0, mp);
    }
}

/**
 * Entfernt einen besiegten Gegner aus dem Spiel
 */
export function removeEnemyUnit(index) {
    enemyUnits.splice(index, 1);
}

/**
 * Aktualisiert die HP eines Gegners
 */
export function setEnemyUnitHp(index, hp) {
    if (enemyUnits[index]) {
        enemyUnits[index].hp = Math.min(Math.max(0, hp), enemyUnits[index].maxHp);
    }
}

/**
 * Gibt die Position einer Feind-Einheit zurück
 */
export function getEnemyUnitPosition(index) {
    if (enemyUnits[index]) {
        return { row: enemyUnits[index].row, col: enemyUnits[index].col };
    }
    return null;
}

/**
 * Gibt die Attribute einer Feind-Einheit zurück
 */
export function getEnemyUnitAttributes(index) {
    if (enemyUnits[index]) {
        return { ...enemyUnits[index] };
    }
    return null;
}
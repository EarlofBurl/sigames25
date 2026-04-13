// units.js
// Verwaltung aller Einheiten (Spieler und Gegner) sowie deren Status

export let playerUnits = [];
export let enemyUnits = [];
export let currentUnitIndex = 0;

/**
 * Initialisiert die Spielereinheiten (z.B. beim Missionsstart)
 */
export function initPlayerUnits(unitsData) {
    playerUnits = unitsData.map(unit => ({
        ...unit,
        hp: unit.hp || 20,
        maxHp: unit.maxHp || 20,
        mp: unit.mp || 5,
        maxMp: unit.maxMp || 5,
        attack: unit.attack || 5,
        defense: unit.defense || 2,
        color: unit.color || '#0000FF' // Standardfarbe Blau, falls keine angegeben
    }));
    currentUnitIndex = 0;
}

/**
 * Initialisiert die gegnerischen Einheiten
 */
export function initEnemyUnits(enemiesData) {
    enemyUnits = enemiesData.map(enemy => ({
        ...enemy,
        hp: enemy.hp || 10,
        maxHp: enemy.maxHp || 10,
        mp: enemy.mp || 3,
        maxMp: enemy.maxMp || 3,
        attack: enemy.attack || 4,
        defense: enemy.defense || 1,
        color: enemy.color || '#FF0000' // Standardfarbe Rot
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
 * Gibt alle Attribute der aktuellen Einheit zurück
 */
export function getCurrentUnitAttributes() {
    return { ...playerUnits[currentUnitIndex] };
}

/**
 * Aktualisiert die Bewegungspunkte (MP) der aktuellen Einheit
 */
export function setCurrentUnitMp(mp) {
    if (playerUnits[currentUnitIndex]) {
        playerUnits[currentUnitIndex].mp = Math.max(0, mp);
    }
}

/**
 * Füllt die MP aller Spielereinheiten auf (für Rundenwechsel)
 */
export function refillCurrentUnitMp() {
    playerUnits.forEach(unit => {
        unit.mp = unit.maxMp;
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
        enemyUnits[index].hp = hp;
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
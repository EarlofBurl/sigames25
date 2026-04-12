// enemy.js
// Verwaltet die Feind-Daten

let enemies = [];

// Fügt einen Feind hinzu
function addEnemy(enemy) {
    enemies.push(enemy);
}

// Gibt alle Feinde zurück
export function getEnemies() {
    return enemies;
}

// Setzt die Position eines Feindes
function setEnemyPosition(enemyIndex, row, col) {
    if (enemies[enemyIndex]) {
        enemies[enemyIndex].row = row;
        enemies[enemyIndex].col = col;
    }
}

// Gibt die Position eines Feindes zurück
function getEnemyPosition(enemyIndex) {
    if (enemies[enemyIndex]) {
        return { row: enemies[enemyIndex].row, col: enemies[enemyIndex].col };
    }
    return null;
}

// Gibt die Attribute eines Feindes zurück
function getEnemyAttributes(enemyIndex) {
    if (enemies[enemyIndex]) {
        return {
            hp: enemies[enemyIndex].hp,
            maxHp: enemies[enemyIndex].maxHp,
            attack: enemies[enemyIndex].attack,
            defense: enemies[enemyIndex].defense
        };
    }
    return null;
}

// Setzt die HP eines Feindes
function setEnemyHp(enemyIndex, hp) {
    if (enemies[enemyIndex]) {
        enemies[enemyIndex].hp = hp;
    }
}

// Entfernt einen Feind
function removeEnemy(enemyIndex) {
    enemies.splice(enemyIndex, 1);
}

// Initialisiert die Feinde
export function initEnemies(enemyData) {
    enemies = [];
    enemyData.forEach(enemy => {
        addEnemy(enemy);
    });
}

// Exportiere die Funktionen für den internen Gebrauch
export const _internal = {
    setEnemyPosition,
    getEnemyPosition,
    getEnemyAttributes,
    setEnemyHp,
    removeEnemy
};
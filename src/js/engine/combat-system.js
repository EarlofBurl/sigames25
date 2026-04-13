import { log } from './console.js';
import { setEnemyUnitHp, removeEnemyUnit, setCurrentUnitHp } from '../entities/units.js';
import { drawGrid } from './renderer.js';

// Wird aufgerufen, wenn der SPIELER angreift
export function executeCombat(attackerAttr, enemy, enemyIndex, onAttackerDeathCallback, distance) {
    // 1. Erstschlag (Spieler -> Feind)
    const damage = Math.max(1, attackerAttr.attack - enemy.defense);
    const newEnemyHp = enemy.hp - damage;
    setEnemyUnitHp(enemyIndex, newEnemyHp);
    log(`${attackerAttr.name} greift an und fügt ${enemy.name} ${damage} Schaden zu!`, 'attack');

    if (newEnemyHp <= 0) {
        removeEnemyUnit(enemyIndex);
        log(`${enemy.name} wurde besiegt!`, 'attack');
        drawGrid();
    } else {
        // 2. Gegenangriff (Feind -> Spieler) nur, wenn der Feind in Reichweite ist
        const counterDistance = distance || 1;
        if (counterDistance <= (enemy.range || 1)) {
            const counterDamage = Math.max(1, enemy.attack - attackerAttr.defense);
            const newUnitHp = attackerAttr.hp - counterDamage;
            setCurrentUnitHp(newUnitHp);
            log(`${enemy.name} schlägt zurück für ${counterDamage} Schaden!`, 'enemy');

            if (newUnitHp <= 0) {
                log(`${attackerAttr.name} wurde besiegt!`, 'enemy');
                setCurrentUnitHp(attackerAttr.maxHp); // Fallback Reset
                drawGrid();
                if (onAttackerDeathCallback) onAttackerDeathCallback();
            }
        } else {
            log(`${enemy.name} kann nicht zurückschlagen - außerhalb der Reichweite!`, 'enemy');
        }
    }
}

// NEU: Wird aufgerufen, wenn der FEIND angreift
export function executeEnemyCombat(enemyAttr, enemyIndex, playerAttr, distance) {
    // 1. Erstschlag (Feind -> Spieler)
    const damage = Math.max(1, enemyAttr.attack - playerAttr.defense);
    playerAttr.hp -= damage; // Wir ziehen die HP direkt beim Spieler ab
    log(`${enemyAttr.name} greift an und fügt ${playerAttr.name} ${damage} Schaden zu!`, 'enemy');

    if (playerAttr.hp <= 0) {
        log(`${playerAttr.name} wurde besiegt!`, 'enemy');
        playerAttr.hp = playerAttr.maxHp; // Fallback Reset
        drawGrid();
    } else {
        // 2. Gegenangriff (Spieler -> Feind) nur, wenn der Spieler in Reichweite ist
        const counterDistance = distance || 1;
        if (counterDistance <= (playerAttr.range || 1)) {
            const counterDamage = Math.max(1, playerAttr.attack - enemyAttr.defense);
            const newEnemyHp = enemyAttr.hp - counterDamage;
            setEnemyUnitHp(enemyIndex, newEnemyHp);
            log(`${playerAttr.name} schlägt zurück für ${counterDamage} Schaden!`, 'attack');

            if (newEnemyHp <= 0) {
                removeEnemyUnit(enemyIndex);
                log(`${enemyAttr.name} wurde im Gegenangriff besiegt!`, 'attack');
                drawGrid();
            }
        } else {
            log(`${playerAttr.name} kann nicht zurückschlagen - außerhalb der Reichweite!`, 'attack');
        }
    }
}
import { log } from './console.js';
import { setEnemyUnitHp, removeEnemyUnit, setCurrentUnitHp, setCurrentUnitPosition } from '../entities/units.js';
import { drawGrid } from './renderer.js';

export function executeCombat(attackerAttr, enemy, enemyIndex, onAttackerDeathCallback) {
    // 1. Erstschlag
    const damage = Math.max(1, attackerAttr.attack - enemy.defense);
    const newEnemyHp = enemy.hp - damage;
    setEnemyUnitHp(enemyIndex, newEnemyHp);
    log(`${attackerAttr.name} fügt ${enemy.name} ${damage} Schaden zu!`, 'attack');

    if (newEnemyHp <= 0) {
        // Feind stirbt
        removeEnemyUnit(enemyIndex);
        log(`${enemy.name} wurde besiegt!`, 'attack');
        drawGrid();
    } else {
        // 2. Gegenangriff
        const counterDamage = Math.max(1, enemy.attack - attackerAttr.defense);
        const newUnitHp = attackerAttr.hp - counterDamage;
        setCurrentUnitHp(newUnitHp);
        log(`${enemy.name} schlägt zurück für ${counterDamage} Schaden!`, 'enemy');

        if (newUnitHp <= 0) {
            // Held stirbt
            log(`${attackerAttr.name} wurde besiegt!`, 'enemy');
            setCurrentUnitPosition(0, 0); // Vorerst als Fallback-Reset
            setCurrentUnitHp(attackerAttr.maxHp);
            drawGrid();
            
            // Callback aufrufen, damit die Szene die UI aufräumen kann
            if (onAttackerDeathCallback) {
                onAttackerDeathCallback();
            }
        }
    }
}
import { log } from './console.js';
import { setEnemyUnitHp, removeEnemyUnit, setCurrentUnitHp, getPlayerUnits, getEnemyUnits, setCurrentUnitIndex, setEnemyUnitPosition } from '../entities/units.js';
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
    const players = getPlayerUnits();
    const enemies = getEnemyUnits();
    
    // Finde das tatsächliche Spieler-Objekt im Array
    const targetPlayerIndex = players.findIndex(p => p.id === playerAttr.id);
    
    // Nahkampf-Penalty für Fernkämpfer: halber Schaden bei Distanz 1
    const isMeleeAttack = distance === 1 && (enemyAttr.range || 1) > 1;
    const damageMultiplier = isMeleeAttack ? 0.5 : 1;
    
    // 1. Erstschlag (Feind -> Spieler)
    const baseDamage = Math.max(1, enemyAttr.attack - playerAttr.defense);
    const damage = Math.floor(baseDamage * damageMultiplier);
    
    // Direkt HP auf dem Spieler-Objekt im Array reduzieren
    if (targetPlayerIndex !== -1) {
        players[targetPlayerIndex].hp = Math.max(0, players[targetPlayerIndex].hp - damage);
    }
    
    if (isMeleeAttack) {
        log(`${enemyAttr.name} greift im Nahkampf an (geschwächt) und fügt ${playerAttr.name} ${damage} Schaden zu!`, 'enemy');
    } else {
        log(`${enemyAttr.name} greift an und fügt ${playerAttr.name} ${damage} Schaden zu!`, 'enemy');
    }

    if (players[targetPlayerIndex] && players[targetPlayerIndex].hp <= 0) {
        log(`${playerAttr.name} wurde besiegt!`, 'enemy');
        players[targetPlayerIndex].hp = players[targetPlayerIndex].maxHp; // Fallback Reset
        drawGrid();
    } else {
        // 2. Gegenangriff (Spieler -> Feind) nur, wenn der Spieler in Reichweite ist
        const counterDistance = distance || 1;
        if (counterDistance <= (playerAttr.range || 1)) {
            // Finde das Spieler-Objekt mit aktuellen Werten (inkl. Buffs)
            const actualPlayer = players[targetPlayerIndex];
            const counterDamage = Math.max(1, (actualPlayer?.attack || playerAttr.attack) - enemyAttr.defense);
            
            // Direkt auf Feind-HP anwenden
            const enemy = enemies[enemyIndex];
            if (enemy) {
                enemy.hp = Math.max(0, enemy.hp - counterDamage);
                setEnemyUnitHp(enemyIndex, enemy.hp);
                log(`${playerAttr.name} schlägt zurück für ${counterDamage} Schaden!`, 'attack');

                if (enemy.hp <= 0) {
                    removeEnemyUnit(enemyIndex);
                    log(`${enemyAttr.name} wurde im Gegenangriff besiegt!`, 'attack');
                    drawGrid();
                }
            }
        } else {
            log(`${playerAttr.name} kann nicht zurückschlagen - außerhalb der Reichweite!`, 'attack');
        }
    }
}
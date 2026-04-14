import { log } from './console.js';
import { setEnemyUnitHp, removeEnemyUnit, setCurrentUnitHp, getPlayerUnits, getEnemyUnits, setCurrentUnitIndex, setEnemyUnitPosition } from '../entities/units.js';

export function executeCombat(attackerAttr, enemy, enemyIndex, onAttackerDeathCallback, distance) {
    const damage = Math.max(1, attackerAttr.attack - enemy.defense);
    const newEnemyHp = enemy.hp - damage;
    setEnemyUnitHp(enemyIndex, newEnemyHp);
    log(`${attackerAttr.name} greift an und fügt ${enemy.name} ${damage} Schaden zu!`, 'attack');

    if (newEnemyHp <= 0) {
        removeEnemyUnit(enemyIndex);
        log(`${enemy.name} wurde besiegt!`, 'attack');
    } else {
        const counterDistance = distance || 1;
        if (counterDistance <= (enemy.range || 1)) {
            const counterDamage = Math.max(1, enemy.attack - attackerAttr.defense);
            const newUnitHp = attackerAttr.hp - counterDamage;
            setCurrentUnitHp(newUnitHp);
            log(`${enemy.name} schlägt zurück für ${counterDamage} Schaden!`, 'enemy');

            if (newUnitHp <= 0) {
                log(`${attackerAttr.name} wurde besiegt!`, 'enemy');
                setCurrentUnitHp(attackerAttr.maxHp);
                if (onAttackerDeathCallback) onAttackerDeathCallback();
            }
        } else {
            log(`${enemy.name} kann nicht zurückschlagen - außerhalb der Reichweite!`, 'enemy');
        }
    }
}

export function executeEnemyCombat(enemyAttr, enemyIndex, playerAttr, distance) {
    const players = getPlayerUnits();
    const enemies = getEnemyUnits();
    
    const targetPlayerIndex = players.findIndex(p => p.id === playerAttr.id);
    
    const isMeleeAttack = distance === 1 && (enemyAttr.range || 1) > 1;
    const damageMultiplier = isMeleeAttack ? 0.5 : 1;
    
    const baseDamage = Math.max(1, enemyAttr.attack - playerAttr.defense);
    const damage = Math.floor(baseDamage * damageMultiplier);
    
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
        players[targetPlayerIndex].hp = players[targetPlayerIndex].maxHp;
    } else {
        const counterDistance = distance || 1;
        if (counterDistance <= (playerAttr.range || 1)) {
            const actualPlayer = players[targetPlayerIndex];
            const counterDamage = Math.max(1, (actualPlayer?.attack || playerAttr.attack) - enemyAttr.defense);
            
            const enemy = enemies[enemyIndex];
            if (enemy) {
                enemy.hp = Math.max(0, enemy.hp - counterDamage);
                setEnemyUnitHp(enemyIndex, enemy.hp);
                log(`${playerAttr.name} schlägt zurück für ${counterDamage} Schaden!`, 'attack');

                if (enemy.hp <= 0) {
                    removeEnemyUnit(enemyIndex);
                    log(`${enemyAttr.name} wurde im Gegenangriff besiegt!`, 'attack');
                }
            }
        } else {
            log(`${playerAttr.name} kann nicht zurückschlagen - außerhalb der Reichweite!`, 'attack');
        }
    }
}

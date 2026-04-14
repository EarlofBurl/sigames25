import { log } from './console.js';
import { setEnemyUnitHp, removeEnemyUnit, setCurrentUnitHp, getPlayerUnits, getEnemyUnits, setCurrentUnitIndex, setEnemyUnitPosition } from '../entities/units.js';
import { terrainTypes } from './terrain.js';

const WEAPON_TRIANGLE = {
    sword: 'axe',
    axe: 'lance',
    lance: 'sword'
};

function getWeaponBonus(attackerWeapon, defenderWeapon) {
    if (!attackerWeapon || !defenderWeapon) return 0;
    if (WEAPON_TRIANGLE[attackerWeapon] === defenderWeapon) return 2;
    if (WEAPON_TRIANGLE[defenderWeapon] === attackerWeapon) return -2;
    return 0;
}

function getWeaponLogText(attackerWeapon, defenderWeapon) {
    if (!attackerWeapon || !defenderWeapon) return '';
    if (WEAPON_TRIANGLE[attackerWeapon] === defenderWeapon) return ' (Waffenvorteil!)';
    if (WEAPON_TRIANGLE[defenderWeapon] === attackerWeapon) return ' (Waffennachteil!)';
    return '';
}

function isFlanking(attackerRow, attackerCol, targetRow, targetCol, allies) {
    const dRow = targetRow - attackerRow;
    const dCol = targetCol - attackerCol;
    const oppositeRow = targetRow + dRow;
    const oppositeCol = targetCol + dCol;
    return allies.some(u => u.row === oppositeRow && u.col === oppositeCol);
}

export function executeCombat(attackerAttr, enemy, enemyIndex, onAttackerDeathCallback, distance) {
    const flankBonus = isFlanking(attackerAttr.row, attackerAttr.col, enemy.row, enemy.col, getPlayerUnits()) ? 2 : 0;
    const weaponBonus = getWeaponBonus(attackerAttr.weapon, enemy.weapon);
    const totalBonus = weaponBonus + flankBonus;

    const damage = Math.max(1, attackerAttr.attack + totalBonus - enemy.defense);
    const newEnemyHp = enemy.hp - damage;
    setEnemyUnitHp(enemyIndex, newEnemyHp);

    const flankText = flankBonus > 0 ? ' (Flanke!)' : '';
    const weaponText = getWeaponLogText(attackerAttr.weapon, enemy.weapon);
    log(`${attackerAttr.name} greift an und fügt ${enemy.name} ${damage} Schaden zu!${weaponText}${flankText}`, 'attack');

    if (newEnemyHp <= 0) {
        removeEnemyUnit(enemyIndex);
        log(`${enemy.name} wurde besiegt!`, 'attack');
    } else if (flankBonus > 0) {
        log(`${enemy.name} kann nicht zurückschlagen - eingekesselt!`, 'enemy');
    } else {
        const counterDistance = distance || 1;
        if (counterDistance <= (enemy.range || 1)) {
            const counterWeaponBonus = getWeaponBonus(enemy.weapon, attackerAttr.weapon);
            const counterDamage = Math.max(1, enemy.attack + counterWeaponBonus - attackerAttr.defense);
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

    const flankBonus = isFlanking(enemyAttr.row, enemyAttr.col, playerAttr.row, playerAttr.col, enemies) ? 2 : 0;
    const weaponBonus = getWeaponBonus(enemyAttr.weapon, playerAttr.weapon);
    const totalBonus = weaponBonus + flankBonus;

    const baseDamage = Math.max(1, enemyAttr.attack + totalBonus - playerAttr.defense);
    const damage = Math.floor(baseDamage * damageMultiplier);

    if (targetPlayerIndex !== -1) {
        players[targetPlayerIndex].hp = Math.max(0, players[targetPlayerIndex].hp - damage);
    }

    const flankText = flankBonus > 0 ? ' (Flanke!)' : '';
    const weaponText = getWeaponLogText(enemyAttr.weapon, playerAttr.weapon);
    if (isMeleeAttack) {
        log(`${enemyAttr.name} greift im Nahkampf an (geschwächt) und fügt ${playerAttr.name} ${damage} Schaden zu!${weaponText}${flankText}`, 'enemy');
    } else {
        log(`${enemyAttr.name} greift an und fügt ${playerAttr.name} ${damage} Schaden zu!${weaponText}${flankText}`, 'enemy');
    }

    if (players[targetPlayerIndex] && players[targetPlayerIndex].hp <= 0) {
        log(`${playerAttr.name} wurde besiegt!`, 'enemy');
        players[targetPlayerIndex].hp = players[targetPlayerIndex].maxHp;
    } else if (flankBonus > 0) {
        log(`${playerAttr.name} kann nicht zurückschlagen - eingekesselt!`, 'attack');
    } else {
        const counterDistance = distance || 1;
        if (counterDistance <= (playerAttr.range || 1)) {
            const actualPlayer = players[targetPlayerIndex];
            const counterWeaponBonus = getWeaponBonus(actualPlayer?.weapon || playerAttr.weapon, enemyAttr.weapon);
            const counterDamage = Math.max(1, (actualPlayer?.attack || playerAttr.attack) + counterWeaponBonus - enemyAttr.defense);

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

export function predictCombat(attacker, defender, distance, grid, attackerAllies) {
    const flankBonus = isFlanking(attacker.row, attacker.col, defender.row, defender.col, attackerAllies) ? 2 : 0;
    const weaponBonus = getWeaponBonus(attacker.weapon, defender.weapon);
    const terrainCell = grid[defender.row] && grid[defender.row][defender.col];
    const terrain = terrainCell ? terrainTypes[terrainCell.type] : null;
    const terrainDef = terrain ? terrain.defenseBonus : 0;
    const totalBonus = weaponBonus + flankBonus;

    const attackDmg = Math.max(1, attacker.attack + totalBonus - (defender.defense + terrainDef));
    const canCounter = distance <= (defender.range || 1) && flankBonus === 0;

    let counterDmg = 0;
    if (canCounter) {
        const counterWeaponBonus = getWeaponBonus(defender.weapon, attacker.weapon);
        counterDmg = Math.max(1, defender.attack + counterWeaponBonus - attacker.defense);
    }

    return {
        attackDmg,
        counterDmg,
        weaponBonus,
        flankBonus,
        terrainDef,
        canCounter,
        attackerHpAfter: Math.max(0, attacker.hp - counterDmg),
        defenderHpAfter: Math.max(0, defender.hp - attackDmg)
    };
}

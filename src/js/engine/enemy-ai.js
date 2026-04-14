import { getEnemyUnits, getPlayerUnits, setEnemyUnitPosition, setEnemyUnitMp } from '../entities/units.js';
import { log } from '../engine/console.js';
import { findPathAndCost } from '../engine/movement-system.js';
import { executeEnemyCombat, predictCombat } from '../engine/combat-system.js';
import { isPassable } from '../engine/terrain.js';

function isOccupiedByAnyUnit(row, col, excludeEnemyIndex = -1) {
    const players = getPlayerUnits();
    const enemies = getEnemyUnits();
    return players.some(p => p.row === row && p.col === col) || 
           enemies.some((e, idx) => e.row === row && e.col === col && idx !== excludeEnemyIndex);
}

function createWeiterButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Weiter ▶';
    btn.style.cssText = 'position:fixed;bottom:180px;right:20px;padding:10px 20px;font-size:16px;background:#e53935;color:#fff;border:none;border-radius:5px;cursor:pointer;z-index:100;';
    document.body.appendChild(btn);
    return btn;
}

function removeWeiterButton(btn) {
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
}

function waitOrSkip(btn, ms) {
    return new Promise(resolve => {
        let resolved = false;
        const timeout = setTimeout(() => {
            if (!resolved) { resolved = true; resolve(); }
        }, ms);
        if (btn) {
            btn.onclick = () => {
                if (!resolved) {
                    clearTimeout(timeout);
                    resolved = true;
                    resolve();
                }
            };
        }
    });
}

export async function executeEnemyTurn(grid, onAction = null, onEnemyAction = null) {
    const enemies = getEnemyUnits();
    const players = getPlayerUnits();
    const weiterBtn = createWeiterButton();

    log('Feindliche Phase startet...', 'enemy');
    await waitOrSkip(weiterBtn, 800);

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyRange = enemy.range || 1;
        
        let closestPlayer = null;
        let shortestDist = Infinity;

        for (let p of players) {
            const dist = Math.abs(enemy.row - p.row) + Math.abs(enemy.col - p.col);
            if (dist < shortestDist) {
                shortestDist = dist;
                closestPlayer = p;
            }
        }

        if (closestPlayer && shortestDist <= 3) {
            
            if (enemyRange > 1) {
                if (shortestDist <= enemyRange) {
                    const pred = predictCombat(enemy, closestPlayer, shortestDist, grid, enemies);
                    executeEnemyCombat(enemy, i, closestPlayer, shortestDist);
                    if (onAction) onAction();
                    if (onEnemyAction) await onEnemyAction('attack', enemy, closestPlayer, pred);
                    else await waitOrSkip(weiterBtn, 2000);
                    continue;
                }
                
                let bestPos = null;
                let bestCost = Infinity;
                
                for (let r = closestPlayer.row - enemyRange; r <= closestPlayer.row + enemyRange; r++) {
                    for (let c = closestPlayer.col - enemyRange; c <= closestPlayer.col + enemyRange; c++) {
                        const distToTarget = Math.abs(r - closestPlayer.row) + Math.abs(c - closestPlayer.col);
                        if (distToTarget <= enemyRange && isPassable(r, c, grid, enemy) && !isOccupiedByAnyUnit(r, c, i)) {
                            const res = findPathAndCost({row: enemy.row, col: enemy.col}, {row: r, col: c}, grid, enemy.maxMp, enemy);
                            if (res.path && res.cost < bestCost) {
                                bestCost = res.cost;
                                bestPos = { row: r, col: c };
                            }
                        }
                    }
                }
                
                if (bestPos && bestCost <= enemy.maxMp) {
                    const fromPos = { row: enemy.row, col: enemy.col };
                    setEnemyUnitPosition(enemy.id, bestPos.row, bestPos.col);
                    setEnemyUnitMp(enemy.id, enemy.mp - bestCost);
                    if (onAction) onAction();
                    if (onEnemyAction) await onEnemyAction('move', enemy, null, { from: fromPos, to: bestPos });
                    else await waitOrSkip(weiterBtn, 2000);
                    log(`${enemy.name} positioniert sich für Fernkampf.`, 'enemy');
                    
                    const newDist = Math.abs(enemy.row - closestPlayer.row) + Math.abs(enemy.col - closestPlayer.col);
                    if (newDist <= enemyRange) {
                        const pred = predictCombat(enemy, closestPlayer, newDist, grid, enemies);
                        executeEnemyCombat(enemy, i, closestPlayer, newDist);
                        if (onAction) onAction();
                        if (onEnemyAction) await onEnemyAction('attack', enemy, closestPlayer, pred);
                        else await waitOrSkip(weiterBtn, 2000);
                    }
                    continue;
                }
            }
            
            if (shortestDist === 1) {
                const pred = predictCombat(enemy, closestPlayer, 1, grid, enemies);
                executeEnemyCombat(enemy, i, closestPlayer, shortestDist);
                if (onAction) onAction();
                if (onEnemyAction) await onEnemyAction('attack', enemy, closestPlayer, pred);
                else await waitOrSkip(weiterBtn, 2000);
                continue;
            }

            const adjacents = [
                { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
            ];
            
            let bestTargetPos = null;
            let lowestCost = Infinity;

            for (let adj of adjacents) {
                const targetRow = closestPlayer.row + adj.r;
                const targetCol = closestPlayer.col + adj.c;
                
                if (isPassable(targetRow, targetCol, grid, enemy) && (!isOccupiedByAnyUnit(targetRow, targetCol, i) || (targetRow === enemy.row && targetCol === enemy.col))) {
                    const res = findPathAndCost({row: enemy.row, col: enemy.col}, {row: targetRow, col: targetCol}, grid, enemy.maxMp, enemy);
                    
                    if (res.path && res.cost < lowestCost) {
                        lowestCost = res.cost;
                        bestTargetPos = { row: targetRow, col: targetCol };
                    }
                }
            }

            if (bestTargetPos && lowestCost <= enemy.maxMp) {
                const fromPos = { row: enemy.row, col: enemy.col };
                setEnemyUnitPosition(enemy.id, bestTargetPos.row, bestTargetPos.col);
                setEnemyUnitMp(enemy.id, enemy.mp - lowestCost);
                if (onAction) onAction();
                if (onEnemyAction) await onEnemyAction('move', enemy, null, { from: fromPos, to: bestTargetPos });
                else await waitOrSkip(weiterBtn, 2000);
                log(`${enemy.name} rückt vor.`, 'enemy');

                const newDist = Math.abs(enemy.row - closestPlayer.row) + Math.abs(enemy.col - closestPlayer.col);
                if (newDist === 1) {
                    const pred = predictCombat(enemy, closestPlayer, 1, grid, enemies);
                    executeEnemyCombat(enemy, i, closestPlayer, newDist);
                    if (onAction) onAction();
                    if (onEnemyAction) await onEnemyAction('attack', enemy, closestPlayer, pred);
                    else await waitOrSkip(weiterBtn, 2000);
                }
            } else {
                log(`${enemy.name} starrt angriffslustig, findet aber keinen Weg.`, 'default');
            }
        }
        
        await waitOrSkip(weiterBtn, 500);
    }
    
    removeWeiterButton(weiterBtn);
    log('Feindliche Phase beendet.');
}

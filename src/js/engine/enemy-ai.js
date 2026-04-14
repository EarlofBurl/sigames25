import { getEnemyUnits, getPlayerUnits, setEnemyUnitPosition, setEnemyUnitMp } from '../entities/units.js';
import { log } from '../engine/console.js';
import { findPathAndCost } from '../engine/movement-system.js';
import { executeEnemyCombat } from '../engine/combat-system.js';
import { isPassable } from '../engine/input.js';
import { drawGrid } from '../engine/renderer.js';

// Hilfsfunktion: Ist ein Feld von einer anderen Einheit besetzt?
// Wichtig: Dieser Check prüft nur, ob IRGENDEINE Einheit auf dem Feld steht (inkl. Spieler + andere Feinde)
// Da isPassable bereits alle Einheiten checkt, nutzen wir das hier für die Feind-KI
function isOccupiedByAnyUnit(row, col, excludeEnemyIndex = -1) {
    const players = getPlayerUnits();
    const enemies = getEnemyUnits();
    return players.some(p => p.row === row && p.col === col) || 
           enemies.some((e, idx) => e.row === row && e.col === col && idx !== excludeEnemyIndex);
}

export async function executeEnemyTurn(grid) {
    const enemies = getEnemyUnits();
    const players = getPlayerUnits();

    log('Feindliche Phase startet...', 'enemy');
    await new Promise(resolve => setTimeout(resolve, 800));

    // WICHTIG: Rückwärts iterieren!
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyRange = enemy.range || 1;
        
        let closestPlayer = null;
        let shortestDist = Infinity;

        // 1. Nächsten Spieler finden
        for (let p of players) {
            const dist = Math.abs(enemy.row - p.row) + Math.abs(enemy.col - p.col);
            if (dist < shortestDist) {
                shortestDist = dist;
                closestPlayer = p;
            }
        }

        // 2. Handeln, wenn ein Spieler im Aggro-Radius (z.B. 3 Felder) ist
        if (closestPlayer && shortestDist <= 3) {
            
            // === FERNKAMPF-LOGIK FÜR GEGNER ===
            if (enemyRange > 1) {
                // Prüfen, ob Fernangriff möglich ist (direkt aus der Distanz)
                if (shortestDist <= enemyRange) {
                    executeEnemyCombat(enemy, i, closestPlayer, shortestDist);
                    await new Promise(resolve => setTimeout(resolve, 800));
                    continue;
                }
                
                // Position zwischen Feind und Spieler finden (ideal für Fernkampf)
                const idealRow = enemy.row + Math.sign(closestPlayer.row - enemy.row);
                const idealCol = enemy.col + Math.sign(closestPlayer.col - enemy.col);
                
                // Versuche, mich in Schussreichweite zu positionieren
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
                    setEnemyUnitPosition(enemy.id, bestPos.row, bestPos.col);
                    setEnemyUnitMp(enemy.id, enemy.mp - bestCost);
                    drawGrid();
                    log(`${enemy.name} positioniert sich für Fernkampf.`, 'enemy');
                    await new Promise(resolve => setTimeout(resolve, 600));
                    
                    // Nach der Bewegung: Fernangriff versuchen
                    const newDist = Math.abs(enemy.row - closestPlayer.row) + Math.abs(enemy.col - closestPlayer.col);
                    if (newDist <= enemyRange) {
                        executeEnemyCombat(enemy, i, closestPlayer, newDist);
                    }
                    continue;
                }
            }
            
            // === NAHKAMPF-LOGIK (auch für Gegner mit range > 1 wenn sie nicht in Reichweite kommen) ===
            if (shortestDist === 1) {
                executeEnemyCombat(enemy, i, closestPlayer, shortestDist);
                await new Promise(resolve => setTimeout(resolve, 800));
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
                setEnemyUnitPosition(enemy.id, bestTargetPos.row, bestTargetPos.col);
                setEnemyUnitMp(enemy.id, enemy.mp - lowestCost);
                drawGrid();
                log(`${enemy.name} rückt vor.`, 'enemy');
                
                await new Promise(resolve => setTimeout(resolve, 600));

                const newDist = Math.abs(enemy.row - closestPlayer.row) + Math.abs(enemy.col - closestPlayer.col);
                if (newDist === 1) {
                    executeEnemyCombat(enemy, i, closestPlayer, newDist);
                }
            } else {
                log(`${enemy.name} starrt angriffslustig, findet aber keinen Weg.`, 'default');
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    log('Feindliche Phase beendet.');
}
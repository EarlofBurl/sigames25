import { getEnemyUnits, getPlayerUnits } from '../entities/units.js';
import { log } from '../engine/console.js';
import { findPathAndCost } from '../engine/movement-system.js';
import { executeEnemyCombat } from '../engine/combat-system.js';
import { isPassable } from '../engine/input.js';
import { drawGrid } from '../engine/renderer.js';

// Hilfsfunktion: Ist ein Feld von irgendeiner Einheit besetzt?
function isOccupied(row, col) {
    const players = getPlayerUnits();
    const enemies = getEnemyUnits();
    return players.some(p => p.row === row && p.col === col) || 
           enemies.some(e => e.row === row && e.col === col);
}

export async function executeEnemyTurn(grid) {
    const enemies = getEnemyUnits();
    const players = getPlayerUnits();

    log('Feindliche Phase startet...', 'enemy');
    await new Promise(resolve => setTimeout(resolve, 800));

    // WICHTIG: Rückwärts iterieren! Wenn ein Feind durch einen Gegenangriff stirbt 
    // und aus dem Array gelöscht wird, zerschießt es uns so nicht den Index für den nächsten Goblin.
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        let closestPlayer = null;
        let shortestDist = Infinity;

        // 1. Nächsten Spieler finden (Luftlinie berechnen)
        for (let p of players) {
            const dist = Math.abs(enemy.row - p.row) + Math.abs(enemy.col - p.col);
            if (dist < shortestDist) {
                shortestDist = dist;
                closestPlayer = p;
            }
        }

        // 2. Handeln, wenn ein Spieler im Aggro-Radius (z.B. 3 Felder) ist
        if (closestPlayer && shortestDist <= 3) {
            
            // Stehen wir schon direkt daneben? Dann sofort angreifen!
            if (shortestDist === 1) {
                executeEnemyCombat(enemy, i, closestPlayer);
                await new Promise(resolve => setTimeout(resolve, 800));
                continue; // Zug für diesen Goblin beendet
            }

            // Ansonsten: Weg zum Spieler berechnen
            const adjacents = [
                { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
            ];
            
            let bestTargetPos = null;
            let lowestCost = Infinity;

            // Wir suchen das günstigste erreichbare Feld direkt NEBEN dem Spieler
            for (let adj of adjacents) {
                const targetRow = closestPlayer.row + adj.r;
                const targetCol = closestPlayer.col + adj.c;
                
                // Feld muss frei sein (oder das Feld, auf dem der Goblin eh schon steht)
                if (isPassable(targetRow, targetCol, grid) && (!isOccupied(targetRow, targetCol) || (targetRow === enemy.row && targetCol === enemy.col))) {
                    const res = findPathAndCost({row: enemy.row, col: enemy.col}, {row: targetRow, col: targetCol}, grid, enemy.maxMp);
                    
                    if (res.path && res.cost < lowestCost) {
                        lowestCost = res.cost;
                        bestTargetPos = { row: targetRow, col: targetCol };
                    }
                }
            }

            // 3. Bewegen und ggf. angreifen
            if (bestTargetPos && lowestCost <= enemy.maxMp) {
                enemy.row = bestTargetPos.row;
                enemy.col = bestTargetPos.col;
                enemy.mp -= lowestCost;
                drawGrid();
                log(`${enemy.name} rückt vor.`, 'enemy');
                
                await new Promise(resolve => setTimeout(resolve, 600));

                // Nach der Bewegung prüfen, ob wir jetzt direkt neben dem Spieler stehen
                const newDist = Math.abs(enemy.row - closestPlayer.row) + Math.abs(enemy.col - closestPlayer.col);
                if (newDist === 1) {
                    executeEnemyCombat(enemy, i, closestPlayer);
                }
            } else {
                log(`${enemy.name} starrt angriffslustig, findet aber keinen Weg.`, 'default');
            }
        }
        
        // Kurze Denkpause vor dem nächsten Goblin
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    log('Feindliche Phase beendet.');
}
// movement-system.js
// Dijkstra-Pfadfindung mit Zone of Control (ZoC)

import { isPassable, getMovementCost, isAdjacentToEnemy } from './terrain.js';

/**
 * Findet den Pfad und die Kosten.
 * Wenn maxMp nicht angegeben wird, sucht er den Pfad ohne Rücksicht auf die Reichweite.
 * excludeUnit erlaubt der Einheit, ihr eigenes Startfeld zu passieren.
 * Zone of Control: Betritt eine Einheit ein Feld orthogonal neben einem Feind,
 * stoppt die Bewegung dort und verbraucht alle restlichen MP.
 */
export function findPathAndCost(startPos, targetPos, grid, maxMp = 999, excludeUnit = null) {
    const queue = [{ row: startPos.row, col: startPos.col, cost: 0, path: [] }];
    const visited = new Set();
    visited.add(`${startPos.row},${startPos.col}`);

    let bestAdjacent = null;

    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost);
        const current = queue.shift();

        if (current.row === targetPos.row && current.col === targetPos.col) {
            return { path: current.path, cost: current.cost };
        }

        // Prüfe ob angrenzend zum Ziel
        const dist = Math.abs(current.row - targetPos.row) + Math.abs(current.col - targetPos.col);
        if (dist === 1) {
            if (!bestAdjacent || current.cost < bestAdjacent.cost) {
                bestAdjacent = { path: current.path, cost: current.cost };
            }
        }

        const neighbors = [
            { r: -1, c: 0 },
            { r: 1, c: 0 },
            { r: 0, c: -1 },
            { r: 0, c: 1 }
        ];

        for (let n of neighbors) {
            const nextRow = current.row + n.r;
            const nextCol = current.col + n.c;
            const key = `${nextRow},${nextCol}`;

            if (nextRow >= 0 && nextRow < grid.length && nextCol >= 0 && nextCol < grid[0].length) {
                if (!visited.has(key) && isPassable(nextRow, nextCol, grid, excludeUnit)) {
                    const stepCost = getMovementCost(nextRow, nextCol, grid);

                    if (current.cost + stepCost <= maxMp) {
                        visited.add(key);
                        queue.push({
                            row: nextRow,
                            col: nextCol,
                            cost: current.cost + stepCost,
                            path: [...current.path, { row: nextRow, col: nextCol }]
                        });
                    }
                }
            }
        }
    }

    // Wenn kein Pfad zum Ziel gefunden, gib die beste angrenzende Position zurück
    if (bestAdjacent) {
        return bestAdjacent;
    }

    return { path: null, cost: Infinity };
}

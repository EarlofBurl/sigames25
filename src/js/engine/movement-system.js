import { isPassable, getMovementCost } from './input.js';

/**
 * Findet den Pfad und die Kosten. 
 * Wenn maxMp nicht angegeben wird, sucht er den Pfad ohne Rücksicht auf die Reichweite.
 */
export function findPathAndCost(startPos, targetPos, grid, maxMp = 999) {
    const queue = [{ row: startPos.row, col: startPos.col, cost: 0, path: [] }];
    const visited = new Set();
    visited.add(`${startPos.row},${startPos.col}`);

    while (queue.length > 0) {
        queue.sort((a, b) => a.cost - b.cost);
        const current = queue.shift();

        if (current.row === targetPos.row && current.col === targetPos.col) {
            return { path: current.path, cost: current.cost };
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
                if (!visited.has(key) && isPassable(nextRow, nextCol, grid)) {
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
    return { path: null, cost: Infinity };
}
// input.js
// Utility-Funktionen für Terrain-Logik (rein, keine DOM-Abhängigkeit)

import { terrainTypes } from '../data/terrain.js';
import { getPlayerUnits, getEnemyUnits } from '../entities/units.js';

export function isPassable(row, col, grid, excludeUnit = null) {
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
        return false;
    }
    
    const cell = grid[row][col];
    const terrainType = terrainTypes[cell.type];
    if (!terrainType.isPassable) return false;
    
    const players = getPlayerUnits();
    const enemies = getEnemyUnits();
    
    const isOccupied = players.some(u => u.row === row && u.col === col && (!excludeUnit || excludeUnit.id !== u.id)) ||
                       enemies.some(u => u.row === row && u.col === col && (!excludeUnit || excludeUnit.id !== u.id));
    
    return !isOccupied;
}

export function getMovementCost(row, col, grid) {
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
        return Infinity;
    }
    
    const cell = grid[row][col];
    const terrainType = terrainTypes[cell.type];
    return terrainType.movementCost;
}

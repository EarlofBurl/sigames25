// terrain.js
// Zentrale Terrain-Datenbank + Utility-Funktionen (isPassable, getMovementCost, isAdjacentToEnemy)

import { getPlayerUnits, getEnemyUnits } from '../entities/units.js';

export const terrainTypes = {
    plains: {
        name: 'Ebene',
        movementCost: 1,
        defenseBonus: 0,
        isPassable: true,
        sightMod: 0
    },
    hill: {
        name: 'Hügel',
        movementCost: 2,
        defenseBonus: 1,
        isPassable: true,
        sightMod: 1
    },
    road: {
        name: 'Straße',
        movementCost: 0.5,
        defenseBonus: 0,
        isPassable: true,
        sightMod: 0
    },
    river: {
        name: 'Wasser',
        movementCost: Infinity,
        defenseBonus: 0,
        isPassable: false,
        sightMod: 0
    },
    bridge: {
        name: 'Brücke',
        movementCost: 1,
        defenseBonus: 0,
        isPassable: true,
        sightMod: 0
    },
    mountain: {
        name: 'Berg',
        movementCost: Infinity,
        defenseBonus: 0,
        isPassable: false,
        sightMod: 0
    },
    city: {
        name: 'Stadt',
        movementCost: 1,
        defenseBonus: 2,
        isPassable: true,
        heals: true,
        sightMod: 0
    },
    swamp: {
        name: 'Sumpf',
        movementCost: 2,
        defenseBonus: -1,
        isPassable: true,
        sightMod: 0
    },
    forest: {
        name: 'Wald',
        movementCost: 2,
        defenseBonus: 1,
        isPassable: true,
        sightMod: 0
    },
    fortress: {
        name: 'Festung',
        movementCost: 2,
        defenseBonus: 3,
        isPassable: true,
        sightMod: 0
    },
    walls: {
        name: 'Mauer',
        movementCost: Infinity,
        defenseBonus: 0,
        isPassable: false,
        sightMod: 0
    },
    gate: {
        name: 'Tor',
        movementCost: 1,
        defenseBonus: 2,
        isPassable: true,
        sightMod: 0
    }
};

export function isPassable(row, col, grid, excludeUnit = null) {
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
        return false;
    }

    const cell = grid[row][col];
    const terrain = terrainTypes[cell.type];
    if (!terrain || !terrain.isPassable) return false;

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
    const terrain = terrainTypes[cell.type];
    return terrain ? terrain.movementCost : Infinity;
}

export function isAdjacentToEnemy(row, col, currentUnit) {
    const dirs = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];
    const players = getPlayerUnits();
    const enemies = getEnemyUnits();
    const isPlayerUnit = players.some(u => u.id === currentUnit.id);
    const hostiles = isPlayerUnit ? enemies : players;

    for (const d of dirs) {
        const nr = row + d.r;
        const nc = col + d.c;
        if (hostiles.some(h => h.row === nr && h.col === nc)) {
            return true;
        }
    }
    return false;
}

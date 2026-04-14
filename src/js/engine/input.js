// input.js
// Verwaltet die Eingaben (Tastatur und Maus)

import { terrainTypes } from '../data/terrain.js';
import { getPlayerUnits, getEnemyUnits } from '../entities/units.js';

let movePlayerCallback;

// Richtet die Tastatursteuerung ein
export function setupKeyboardControls(callback) {
    movePlayerCallback = callback;

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp':
                movePlayerCallback(-1, 0);
                break;
            case 'ArrowDown':
                movePlayerCallback(1, 0);
                break;
            case 'ArrowLeft':
                movePlayerCallback(0, -1);
                break;
            case 'ArrowRight':
                movePlayerCallback(0, 1);
                break;
        }
    });
}

// Richtet die Maussteuerung ein
export function setupMouseControls(canvas, callback) {
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.floor(x / 50);
        const row = Math.floor(y / 50);

        callback(row, col);
    });
}

// Überprüft, ob ein Feld passierbar ist
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

// Berechnet die Bewegungskosten für ein Feld
export function getMovementCost(row, col, grid) {
    if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
        return Infinity;
    }
    
    const cell = grid[row][col];
    const terrainType = terrainTypes[cell.type];
    return terrainType.movementCost;
}
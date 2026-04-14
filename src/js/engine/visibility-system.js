import { terrainTypes } from './terrain.js';

const VISIBILITY_STATUS = {
    UNEXPLORED: 'unexplored',
    FOG: 'fog',
    VISIBLE: 'visible'
};

// Speichert den Status aller Felder
let visibilityGrid = {};

function calculateEffectiveSight(baseSight, terrainType) {
    const terrain = terrainTypes[terrainType];
    if (!terrain) return baseSight;
    return baseSight + (terrain.sightMod || 0);
}

function manhattanDistance(row1, col1, row2, col2) {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
}

export function updateVisibility(grid, playerUnits) {
    // 1. WICHTIGER FIX: Zuerst alle aktuell sichtbaren Felder zurück in den Nebel schicken!
    for (const key in visibilityGrid) {
        if (visibilityGrid[key] === VISIBILITY_STATUS.VISIBLE) {
            visibilityGrid[key] = VISIBILITY_STATUS.FOG;
        }
    }

    // 2. Neue Sichtfelder für jede Spielereinheit berechnen
    playerUnits.forEach(unit => {
        const baseSight = unit.baseSight || 3; // Standard-Sichtweite, falls nicht definiert
        
        // Herausfinden, auf welchem Terrain die Einheit steht
        const unitTerrainType = grid[unit.row] && grid[unit.row][unit.col] ? grid[unit.row][unit.col].type : 'plains';
        const effectiveSight = calculateEffectiveSight(baseSight, unitTerrainType);

        for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                const dist = manhattanDistance(unit.row, unit.col, r, c);
                // Alles im Radius wird (wieder) sichtbar
                if (dist <= effectiveSight) {
                    visibilityGrid[`${r},${c}`] = VISIBILITY_STATUS.VISIBLE;
                }
            }
        }
    });

    return visibilityGrid;
}

export function getVisibilityStatus(gridRef, row, col) {
    // Wir nutzen die interne visibilityGrid (gridRef als Fallback für Kompatibilität)
    const gridToUse = gridRef && Object.keys(gridRef).length > 0 ? gridRef : visibilityGrid;
    return gridToUse[`${row},${col}`] || VISIBILITY_STATUS.UNEXPLORED;
}

export function getVisibilityStatuses() {
    return VISIBILITY_STATUS;
}

export function getVisibilityGrid() {
    return visibilityGrid;
}
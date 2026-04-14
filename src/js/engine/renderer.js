import { getPlayerUnits, getEnemyUnits } from '../entities/units.js';
import { terrainTypes } from './terrain.js';
import { getVisibilityStatus, getVisibilityStatuses } from './visibility-system.js';

const GRID_SIZE = 10;
const CELL_SIZE = 50;
const TILE_SIZE = 16;
const SCALE = CELL_SIZE / TILE_SIZE;

// Tile-ID zu Terrain-Name Mapping (firstgid=1, 0-basiert)
// Reihenfolge muss zum Tileset (tileset.png, 10 Tiles) passen:
// 1:plains 2:hills 3:road 4:water 5:bridge 6:mountain 7:city 8:swamp 9:forest 10:fortress
const TILE_TO_TERRAIN = {
    1: 'plains', 2: 'hills', 3: 'road', 4: 'water',
    5: 'bridge', 6: 'mountain', 7: 'city', 8: 'swamp',
    9: 'forest', 10: 'fortress'
};

let gfx = null;
let scene = null;
let grid = [];
let tilemapLayer = null;
let selectedTarget = null;
let selectedUnit = null;
let visibilityGrid = {};
let costLabels = [];
let VISIBILITY_STATUS;

export function initGrid() {
    grid = Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({ type: 'plains' }))
    );
    VISIBILITY_STATUS = getVisibilityStatuses();
}

export function initRenderer(phaserScene, mission) {
    scene = phaserScene;
    initGrid();

    // --- TILEMAP AUS TILED-JSON ---
    const tilemap = scene.make.tilemap({ key: 'mission_map' });

    let tileset = tilemap.addTilesetImage('terrain', 'terrain_tileset');

    // Fallback: falls Tileset-Key nicht passt
    if (!tileset) {
        console.warn('[renderer] Tileset nicht gefunden, versuche Fallback...');
        tileset = tilemap.addTilesetImage('terrain');
    }

    tilemapLayer = tilemap.createLayer('terrain', tileset);
    tilemapLayer.setScale(SCALE);
    tilemapLayer.setDepth(0);

    // Grid-Daten aus Tilemap lesen
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const tile = tilemap.getTileAt(c, r);
            if (tile) {
                const terrainName = TILE_TO_TERRAIN[tile.index] || 'plains';
                grid[r][c] = { type: terrainName };
            }
        }
    }

    // --- GRAPHICS OVERLAY für dynamische Elemente ---
    gfx = scene.add.graphics();
    gfx.setDepth(1);

    drawGrid();
}

function clearCostLabels() {
    costLabels.forEach(t => t.destroy());
    costLabels = [];
}

function addCostLabel(col, row, cost, isRed, isZoC) {
    if (!scene) return;
    const text = isZoC ? 'ZoC' : `${cost} MP`;
    const label = scene.add.text(col * CELL_SIZE + 5, row * CELL_SIZE + 42, text, {
        fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold',
        color: isRed ? '#ff4444' : '#ffffff'
    });
    label.setDepth(10);
    costLabels.push(label);
}

export function setVisibilityGrid(newVisibilityGrid) {
    visibilityGrid = newVisibilityGrid;
}

export function getVisibilityData() {
    return visibilityGrid;
}

export function drawGrid() {
    if (!gfx) return;

    gfx.clear();
    clearCostLabels();

    // Fog of War Overlay
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const status = getVisibilityStatus(visibilityGrid, r, c);
            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;

            if (status === VISIBILITY_STATUS.UNEXPLORED) {
                gfx.fillStyle(0x000000);
                gfx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            } else if (status === VISIBILITY_STATUS.FOG) {
                gfx.fillStyle(0x000000, 0.5);
                gfx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }

            gfx.lineStyle(1, 0xffffff, 0.1);
            gfx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
    }

    // Spieler-Einheiten
    getPlayerUnits().forEach(u => {
        gfx.fillStyle(parseInt(u.color.replace('#', ''), 16));
        gfx.fillRect(u.col * CELL_SIZE + 10, u.row * CELL_SIZE + 10, 30, 30);
    });

    // Feind-Einheiten (nur sichtbare)
    getEnemyUnits().forEach(enemy => {
        const status = getVisibilityStatus(visibilityGrid, enemy.row, enemy.col);
        if (status === VISIBILITY_STATUS.VISIBLE) {
            gfx.fillStyle(parseInt(enemy.color.replace('#', ''), 16));
            gfx.fillRect(enemy.col * CELL_SIZE + 10, enemy.row * CELL_SIZE + 10, 30, 30);
        }
    });

    drawSelectionHighlight();
}

function drawSelectionHighlight() {
    if (!gfx) return;

    if (selectedUnit && selectedTarget && selectedTarget.path && selectedTarget.path.length > 0) {
        const strokeColor = selectedTarget.type === 'unreachable' ? 0xff0000 : 0xffffff;
        gfx.lineStyle(3, strokeColor, 0.5);
        gfx.beginPath();
        gfx.moveTo(selectedUnit.col * CELL_SIZE + 25, selectedUnit.row * CELL_SIZE + 25);
        selectedTarget.path.forEach(n => {
            gfx.lineTo(n.col * CELL_SIZE + 25, n.row * CELL_SIZE + 25);
        });
        gfx.strokePath();
    }

    if (selectedUnit) {
        gfx.lineStyle(3, 0xffff00);
        gfx.strokeRect(selectedUnit.col * CELL_SIZE + 2, selectedUnit.row * CELL_SIZE + 2, 46, 46);
    }

    if (selectedTarget) {
        const x = selectedTarget.col * CELL_SIZE + 25;
        const y = selectedTarget.row * CELL_SIZE + 25;

        if (selectedTarget.type === 'attack') {
            drawCrosshair(x, y);
            addCostLabel(selectedTarget.col, selectedTarget.row, selectedTarget.cost, true, false);
        } else if (selectedTarget.type === 'reachable' || selectedTarget.type === 'unreachable') {
            drawBoot(x, y, selectedTarget.type === 'reachable');
            addCostLabel(selectedTarget.col, selectedTarget.row, selectedTarget.cost, selectedTarget.type === 'unreachable', selectedTarget.isZoC);
        } else if (selectedTarget.type === 'info') {
            gfx.lineStyle(3, 0x808080);
            gfx.strokeRect(selectedTarget.col * CELL_SIZE + 5, selectedTarget.row * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
        }
    }
}

function drawBoot(x, y, filled) {
    gfx.beginPath();
    gfx.moveTo(x - 5, y - 10);
    gfx.lineTo(x - 5, y + 5);
    gfx.lineTo(x + 10, y + 5);
    gfx.lineTo(x + 10, y + 12);
    gfx.lineTo(x - 12, y + 12);
    gfx.lineTo(x - 12, y - 10);
    gfx.closePath();

    if (filled) {
        gfx.fillStyle(0xffd700);
        gfx.fillPath();
    }

    gfx.lineStyle(2, filled ? 0x000000 : 0xff0000);
    gfx.strokePath();
}

function drawCrosshair(x, y) {
    gfx.lineStyle(3, 0xff0000);
    gfx.strokeCircle(x, y, 12);
    gfx.beginPath();
    gfx.moveTo(x - 18, y); gfx.lineTo(x - 6, y);
    gfx.moveTo(x + 6, y); gfx.lineTo(x + 18, y);
    gfx.moveTo(x, y - 18); gfx.lineTo(x, y - 6);
    gfx.moveTo(x, y + 6); gfx.lineTo(x, y + 18);
    gfx.strokePath();
}

export function setSelectedUnit(u) {
    selectedUnit = u;
    drawGrid();
}

export function clearSelectedUnit() {
    selectedUnit = null;
    drawGrid();
}

export function setSelectedTarget(t) {
    selectedTarget = t;
    drawGrid();
}

export function clearSelectedTarget() {
    selectedTarget = null;
    drawGrid();
}

export function getGridData() {
    return { grid, visibilityGrid };
}

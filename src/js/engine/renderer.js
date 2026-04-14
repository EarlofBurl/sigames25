import { getPlayerUnits, getEnemyUnits } from '../entities/units.js';
import { terrainThemes } from '../data/terrain.js';
import { getVisibilityStatus, getVisibilityStatuses } from './visibility-system.js';

const GRID_SIZE = 10;
const CELL_SIZE = 50;

let gfx = null;
let scene = null;
let grid = [];
let currentTheme = 'classic';
let selectedTarget = null;
let selectedUnit = null;
let visibilityGrid = {};
let costLabels = [];
let VISIBILITY_STATUS;

function cssToHex(color) {
    if (typeof color === 'number') return color;
    if (typeof color === 'string' && color.startsWith('#')) {
        return parseInt(color.slice(1), 16);
    }
    return 0x000000;
}

export function initGrid(mission) {
    currentTheme = mission.theme || 'classic';
    grid = mission.mapData.terrain.map(row =>
        row.map(type => ({ type, color: terrainThemes[currentTheme][type] }))
    );
    VISIBILITY_STATUS = getVisibilityStatuses();
}

export function initRenderer(graphicsObj, phaserScene, mission) {
    gfx = graphicsObj;
    scene = phaserScene;
    initGrid(mission);
    drawGrid();
}

function clearCostLabels() {
    costLabels.forEach(t => t.destroy());
    costLabels = [];
}

function addCostLabel(col, row, cost, isRed) {
    if (!scene) return;
    const label = scene.add.text(col * CELL_SIZE + 5, row * CELL_SIZE + 42, `${cost} MP`, {
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

    // Terrain + Grid + Fog
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const status = getVisibilityStatus(visibilityGrid, r, c);
            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;

            if (status !== VISIBILITY_STATUS.UNEXPLORED) {
                gfx.fillStyle(cssToHex(grid[r][c].color));
            } else {
                gfx.fillStyle(0x000000);
            }
            gfx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

            gfx.lineStyle(1, 0xffffff, 0.1);
            gfx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

            if (status === VISIBILITY_STATUS.FOG) {
                gfx.fillStyle(0x000000, 0.5);
                gfx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    // Spieler-Einheiten
    getPlayerUnits().forEach(u => {
        gfx.fillStyle(cssToHex(u.color || '#0000ff'));
        gfx.fillRect(u.col * CELL_SIZE + 10, u.row * CELL_SIZE + 10, 30, 30);
    });

    // Feind-Einheiten (nur wenn sichtbar)
    getEnemyUnits().forEach(enemy => {
        const status = getVisibilityStatus(visibilityGrid, enemy.row, enemy.col);
        if (status === VISIBILITY_STATUS.VISIBLE) {
            gfx.fillStyle(cssToHex(enemy.color || '#ff0000'));
            gfx.fillRect(enemy.col * CELL_SIZE + 10, enemy.row * CELL_SIZE + 10, 30, 30);
        }
    });

    drawSelectionHighlight();
}

function drawSelectionHighlight() {
    if (!gfx) return;

    // Pfadlinie
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

    // Auswahl-Highlight
    if (selectedUnit) {
        gfx.lineStyle(3, 0xffff00);
        gfx.strokeRect(selectedUnit.col * CELL_SIZE + 2, selectedUnit.row * CELL_SIZE + 2, 46, 46);
    }

    // Ziel-Indikatoren
    if (selectedTarget) {
        const x = selectedTarget.col * CELL_SIZE + 25;
        const y = selectedTarget.row * CELL_SIZE + 25;

        if (selectedTarget.type === 'attack') {
            drawCrosshair(x, y);
            addCostLabel(selectedTarget.col, selectedTarget.row, selectedTarget.cost, true);
        } else if (selectedTarget.type === 'reachable' || selectedTarget.type === 'unreachable') {
            drawBoot(x, y, selectedTarget.type === 'reachable');
            addCostLabel(selectedTarget.col, selectedTarget.row, selectedTarget.cost, selectedTarget.type === 'unreachable');
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

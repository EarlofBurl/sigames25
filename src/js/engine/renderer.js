// renderer.js
// Zeichnet das Grid und die Spielfigur auf das Canvas

import { getHeroPosition, getHeroColor } from '../entities/hero.js';
import { terrainThemes } from '../data/terrain.js';

const GRID_SIZE = 10;
const CELL_SIZE = 50;

let grid = [];
let canvas;
let ctx;
let currentTheme = 'classic';

// Initialisiert das Grid
export function initGrid(mission) {
    currentTheme = mission.theme || 'classic';
    
    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            // Verwende das Terrain aus der Mission
            const terrainType = mission.mapData.terrain[row][col];
            const color = terrainThemes[currentTheme][terrainType];
            
            grid[row][col] = { type: terrainType, color };
        }
    }
}

// Zeichnet das Grid
export function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = grid[row][col];
            ctx.fillStyle = cell.color;
            ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    drawPlayer();
}

// Zeichnet die Spielfigur
function drawPlayer() {
    const heroPos = getHeroPosition();
    const heroColor = getHeroColor();
    ctx.fillStyle = heroColor;
    ctx.fillRect(heroPos.col * CELL_SIZE, heroPos.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

// Initialisiert den Renderer
export function initRenderer(canvasElement, mission) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    initGrid(mission);
    drawGrid();
}

// Gibt die aktuelle Grid-Daten zurück
export function getGridData() {
    return { grid };
}

// Setzt die Grid-Daten
export function setGridData(data) {
    grid = data.grid;
    drawGrid();
}
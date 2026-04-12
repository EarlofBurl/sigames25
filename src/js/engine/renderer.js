// renderer.js
// Zeichnet das Grid und die Spielfigur auf das Canvas

import { getHeroPosition, getHeroColor } from '../entities/hero.js';
import { getEnemies } from '../entities/enemy.js';
import { terrainThemes } from '../data/terrain.js';
import { getMovementCost } from '../engine/input.js';

const GRID_SIZE = 10;
const CELL_SIZE = 50;

let grid = [];
let canvas;
let ctx;
let currentTheme = 'classic';
let selectedTarget = null;

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
    drawEnemies();

    // Zeichne die Pathlinie, falls ein Ziel ausgewählt ist
    if (selectedTarget) {
        drawPathLine(selectedTarget);
    }
}

// Zeichnet die Spielfigur
function drawPlayer() {
    const heroPos = getHeroPosition();
    const heroColor = getHeroColor();
    ctx.fillStyle = heroColor;
    ctx.fillRect(heroPos.col * CELL_SIZE, heroPos.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

// Zeichnet die Feinde
function drawEnemies() {
    const enemies = getEnemies();
    enemies.forEach(enemy => {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.col * CELL_SIZE, enemy.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

// Zeichnet die Pathlinie
function drawPathLine(target) {
    const heroPos = getHeroPosition();
    
    // Berechne die Manhattan-Distanz
    const dRow = Math.abs(target.row - heroPos.row);
    const dCol = Math.abs(target.col - heroPos.col);
    const manhattanDistance = dRow + dCol;
    
    // Berechne die Bewegungskosten für jeden Schritt
    let totalMovementCost = 0;
    for (let i = 1; i <= manhattanDistance; i++) {
        const stepRow = heroPos.row + Math.sign(target.row - heroPos.row) * Math.min(i, dRow);
        const stepCol = heroPos.col + Math.sign(target.col - heroPos.col) * Math.min(i, dCol);
        totalMovementCost += getMovementCost(stepRow, stepCol, grid);
    }
    
    // Zeichne die Pathlinie schrittweise
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    
    // Zeichne den orthogonalen Pfad
    let currentRow = heroPos.row;
    let currentCol = heroPos.col;
    
    // Zeichne die horizontale Bewegung
    if (dCol > 0) {
        const direction = Math.sign(target.col - heroPos.col);
        ctx.beginPath();
        ctx.moveTo(currentCol * CELL_SIZE + CELL_SIZE / 2, currentRow * CELL_SIZE + CELL_SIZE / 2);
        currentCol += direction * dCol;
        ctx.lineTo(currentCol * CELL_SIZE + CELL_SIZE / 2, currentRow * CELL_SIZE + CELL_SIZE / 2);
        ctx.stroke();
    }
    
    // Zeichne die vertikale Bewegung
    if (dRow > 0) {
        const direction = Math.sign(target.row - heroPos.row);
        ctx.beginPath();
        ctx.moveTo(currentCol * CELL_SIZE + CELL_SIZE / 2, currentRow * CELL_SIZE + CELL_SIZE / 2);
        currentRow += direction * dRow;
        ctx.lineTo(currentCol * CELL_SIZE + CELL_SIZE / 2, currentRow * CELL_SIZE + CELL_SIZE / 2);
        ctx.stroke();
    }
    
    // Zeichne die Bewegungskosten
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.font = '16px Arial';
    ctx.fillText(`MP: ${totalMovementCost}`, target.col * CELL_SIZE + 10, target.row * CELL_SIZE + 30);
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

// Setzt das ausgewählte Ziel
export function setSelectedTarget(target) {
    selectedTarget = target;
    drawGrid();
}

// Löscht das ausgewählte Ziel
export function clearSelectedTarget() {
    selectedTarget = null;
    drawGrid();
}
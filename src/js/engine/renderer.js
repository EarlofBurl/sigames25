// renderer.js
// Zeichnet das Grid und die Spielfigur auf das Canvas

import { getHeroPosition, getHeroColor } from '../entities/hero.js';
import { getEnemies } from '../entities/enemy.js';
import { terrainThemes } from '../data/terrain.js';
import { getMovementCost, isPassable } from '../engine/input.js';

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
    
    // Berechne die Bewegungskosten für den kürzesten Weg
    let totalMovementCost = 0;
    let path = [];
    
    // Finde den kürzesten Weg mit A*
    const openSet = [];
    const closedSet = new Set();
    const gScore = {};
    const fScore = {};
    const cameFrom = {};
    
    // Initialisiere die Scores
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            gScore[`${row},${col}`] = Infinity;
            fScore[`${row},${col}`] = Infinity;
        }
    }
    
    gScore[`${heroPos.row},${heroPos.col}`] = 0;
    fScore[`${heroPos.row},${heroPos.col}`] = manhattanDistance;
    openSet.push({ row: heroPos.row, col: heroPos.col });
    
    while (openSet.length > 0) {
        // Finde den Knoten mit dem niedrigsten fScore
        let current = openSet[0];
        for (const node of openSet) {
            if (fScore[`${node.row},${node.col}`] < fScore[`${current.row},${current.col}`]) {
                current = node;
            }
        }
        
        if (current.row === target.row && current.col === target.col) {
            // Ziel erreicht, rekonstruiere den Pfad
            let currentNode = current;
            while (currentNode.row !== heroPos.row || currentNode.col !== heroPos.col) {
                path.unshift(currentNode);
                currentNode = cameFrom[`${currentNode.row},${currentNode.col}`];
            }
            break;
        }
        
        openSet.splice(openSet.indexOf(current), 1);
        closedSet.add(`${current.row},${current.col}`);
        
        // Überprüfe die Nachbarn
        const neighbors = [
            { row: current.row - 1, col: current.col },
            { row: current.row + 1, col: current.col },
            { row: current.row, col: current.col - 1 },
            { row: current.row, col: current.col + 1 }
        ];
        
        for (const neighbor of neighbors) {
            if (closedSet.has(`${neighbor.row},${neighbor.col}`)) {
                continue;
            }
            
            if (neighbor.row < 0 || neighbor.row >= GRID_SIZE || neighbor.col < 0 || neighbor.col >= GRID_SIZE) {
                continue;
            }
            
             if (!isPassable(neighbor.row, neighbor.col, grid)) {
                 continue;
             }
             
             // Überprüfe, ob ein Feind auf dem Feld steht
             const enemies = getEnemies();
             const enemyOnField = enemies.some(enemy => enemy.row === neighbor.row && enemy.col === neighbor.col);
             if (enemyOnField) {
                 continue;
             }
            
            const tentativeGScore = gScore[`${current.row},${current.col}`] + getMovementCost(neighbor.row, neighbor.col, grid);
            
            if (!openSet.some(node => node.row === neighbor.row && node.col === neighbor.col)) {
                openSet.push(neighbor);
            }
            
            if (tentativeGScore < gScore[`${neighbor.row},${neighbor.col}`]) {
                cameFrom[`${neighbor.row},${neighbor.col}`] = current;
                gScore[`${neighbor.row},${neighbor.col}`] = tentativeGScore;
                fScore[`${neighbor.row},${neighbor.col}`] = tentativeGScore + (Math.abs(neighbor.row - target.row) + Math.abs(neighbor.col - target.col));
            }
        }
    }
    
    // Berechne die Bewegungskosten für den kürzesten Weg
    totalMovementCost = gScore[`${target.row},${target.col}`];
    
    // Zeichne die Pathlinie basierend auf dem kürzesten Weg
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 3;
    
    // Zeichne den kürzesten Pfad
    let currentRow = heroPos.row;
    let currentCol = heroPos.col;
    
    ctx.beginPath();
    ctx.moveTo(currentCol * CELL_SIZE + CELL_SIZE / 2, currentRow * CELL_SIZE + CELL_SIZE / 2);
    
    for (const node of path) {
        currentRow = node.row;
        currentCol = node.col;
        ctx.lineTo(currentCol * CELL_SIZE + CELL_SIZE / 2, currentRow * CELL_SIZE + CELL_SIZE / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(currentCol * CELL_SIZE + CELL_SIZE / 2, currentRow * CELL_SIZE + CELL_SIZE / 2);
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
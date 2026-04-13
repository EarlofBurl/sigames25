import { getPlayerUnits, getEnemyUnits } from '../entities/units.js';
import { terrainThemes, terrainTypes } from '../data/terrain.js';

const GRID_SIZE = 10;
const CELL_SIZE = 50;

let grid = [];
let canvas;
let ctx;
let currentTheme = 'classic';
let selectedTarget = null;
let selectedUnit = null;

export function initGrid(mission) {
    currentTheme = mission.theme || 'classic';
    grid = mission.mapData.terrain.map(row => 
        row.map(type => ({ type, color: terrainThemes[currentTheme][type] }))
    );
}

export function drawGrid() {
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            ctx.fillStyle = grid[r][c].color;
            ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.strokeRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
    
    const allUnits = [...getEnemyUnits(), ...getPlayerUnits()];
    allUnits.forEach(u => {
        ctx.fillStyle = u.color;
        ctx.fillRect(u.col * CELL_SIZE + 10, u.row * CELL_SIZE + 10, 30, 30);
    });
    
    drawSelectionHighlight();
}

function drawSelectionHighlight() {
    // 1. Pfad-Linie zeichnen
    if (selectedUnit && selectedTarget && selectedTarget.path && selectedTarget.path.length > 0) {
        ctx.beginPath();
        ctx.moveTo(selectedUnit.col * CELL_SIZE + 25, selectedUnit.row * CELL_SIZE + 25);
        
        if (selectedTarget.type === 'unreachable') {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        }
        
        ctx.lineWidth = 3; 
        ctx.setLineDash([5, 5]);
        
        selectedTarget.path.forEach(n => {
            ctx.lineTo(n.col * CELL_SIZE + 25, n.row * CELL_SIZE + 25);
        });
        
        ctx.stroke(); 
        ctx.setLineDash([]);
    }
    
    // 2. Aktive Einheit (Gelber Rahmen)
    if (selectedUnit) {
        ctx.strokeStyle = 'yellow'; 
        ctx.lineWidth = 3;
        ctx.strokeRect(selectedUnit.col * CELL_SIZE + 2, selectedUnit.row * CELL_SIZE + 2, 46, 46);
    }
    
    // 3. Ziel-Icons und Kosten
    if (selectedTarget) {
        const x = selectedTarget.col * CELL_SIZE + 25;
        const y = selectedTarget.row * CELL_SIZE + 25;
        
        if (selectedTarget.type === 'attack') {
            drawCrosshair(x, y);
            drawCostText(selectedTarget.col, selectedTarget.row, selectedTarget.cost, true);
        } else if (selectedTarget.type === 'reachable' || selectedTarget.type === 'unreachable') {
            drawBoot(x, y, selectedTarget.type === 'reachable');
            drawCostText(selectedTarget.col, selectedTarget.row, selectedTarget.cost, selectedTarget.type === 'unreachable');
        } else if (selectedTarget.type === 'info') {
            // Nur Info (grauer Rahmen)
            ctx.strokeStyle = 'gray'; 
            ctx.lineWidth = 3;
            ctx.strokeRect(selectedTarget.col * CELL_SIZE + 5, selectedTarget.row * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
        }
    }
}

function drawBoot(x, y, filled) {
    ctx.beginPath(); 
    ctx.moveTo(x - 5, y - 10); 
    ctx.lineTo(x - 5, y + 5); 
    ctx.lineTo(x + 10, y + 5); 
    ctx.lineTo(x + 10, y + 12); 
    ctx.lineTo(x - 12, y + 12); 
    ctx.lineTo(x - 12, y - 10); 
    ctx.closePath();
    
    if (filled) { 
        ctx.fillStyle = 'gold'; 
        ctx.fill(); 
    }
    
    ctx.strokeStyle = filled ? 'black' : 'red'; 
    ctx.lineWidth = 2; 
    ctx.stroke();
}

function drawCrosshair(x, y) {
    ctx.strokeStyle = 'red'; 
    ctx.lineWidth = 3; 
    
    ctx.beginPath(); 
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.moveTo(x - 18, y); 
    ctx.lineTo(x - 6, y); 
    ctx.moveTo(x + 6, y); 
    ctx.lineTo(x + 18, y); 
    ctx.moveTo(x, y - 18); 
    ctx.lineTo(x, y - 6); 
    ctx.moveTo(x, y + 6); 
    ctx.lineTo(x, y + 18); 
    
    ctx.stroke();
}

function drawCostText(col, row, cost, isRed) {
    if (cost === Infinity || cost === undefined) return;
    
    ctx.fillStyle = isRed ? '#ff4444' : 'white'; 
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${cost} MP`, col * CELL_SIZE + 5, row * CELL_SIZE + 45);
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

export function initRenderer(canvasElement, mission) { 
    canvas = canvasElement; 
    ctx = canvas.getContext('2d'); 
    initGrid(mission); 
    drawGrid(); 
}

export function getGridData() { 
    return { grid }; 
}
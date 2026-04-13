import { initRenderer, drawGrid, getGridData, setSelectedTarget, clearSelectedTarget, setSelectedUnit, clearSelectedUnit } from '../engine/renderer.js';
import { setupKeyboardControls, isPassable } from '../engine/input.js';
import {
    initPlayerUnits, initEnemyUnits, getCurrentUnit, getCurrentUnitPosition, setCurrentUnitPosition,
    getCurrentUnitAttributes, setCurrentUnitMp, refillCurrentUnitMp, nextUnit, getPlayerUnits, getEnemyUnits, setCurrentUnitIndex
} from '../entities/units.js';
import { log, initConsole } from '../engine/console.js';
import { initDialog, playDialog } from '../engine/dialog.js';
import { terrainTypes } from '../data/terrain.js';
import { clearUnitPanel, fillUnitPanel, checkAllUnitsExhausted } from './combat-ui.js';
import { executeCombat } from '../engine/combat-system.js';
import { findPathAndCost } from '../engine/movement-system.js';

let grid;
let selectedUnit = null;
let selectedTarget = null;

export class CombatScene {
    constructor(sceneManager, mission) { 
        this.sceneManager = sceneManager; 
        this.mission = mission; 
    }

    onEnter() {
        const appElement = document.getElementById('app');
        
        const canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas'; 
        canvas.width = 500; 
        canvas.height = 500;
        
        initRenderer(canvas, this.mission);
        grid = getGridData().grid;
        
        if (this.mission.playerUnits) initPlayerUnits(this.mission.playerUnits);
        if (this.mission.enemies) initEnemyUnits(this.mission.enemies);
        
        drawGrid();

        const topBar = document.getElementById('top-bar');
        const infoPanel = document.getElementById('info-panel');
        const actionConsole = document.getElementById('action-console');

        if (topBar) topBar.style.display = 'flex';
        if (infoPanel) infoPanel.style.display = 'flex';
        if (actionConsole) actionConsole.style.display = 'block';

        initConsole();
        initDialog();

        if (this.mission.dialogues && this.mission.dialogues.length > 0) {
            playDialog(this.mission.dialogues);
        }

        const uiContainer = document.createElement('div');
        uiContainer.className = 'ui-container';

        const resetSelection = () => { 
            selectedUnit = null; 
            selectedTarget = null; 
            clearSelectedUnit(); 
            clearSelectedTarget(); 
            clearUnitPanel(); 
        };

        // --- ZUG BEENDEN LOGIK ZENTRALISIERT ---
        let turnCounter = 1;
        const turnCounterElement = document.getElementById('turn-number');

        const endTurnLogic = () => {
            refillCurrentUnitMp(); 
            turnCounter++;
            if (turnCounterElement) turnCounterElement.textContent = turnCounter;
            log(`Runde ${turnCounter} gestartet. Alle MP aufgefüllt.`);
            resetSelection();
            drawGrid(); // Zur Sicherheit UI neu zeichnen
        };

        const endTurnButton = document.getElementById('end-turn-button');
        if (endTurnButton) {
            endTurnButton.addEventListener('click', endTurnLogic);
        }

        const nextUnitButton = document.createElement('button');
        nextUnitButton.id = 'next-unit-button';
        nextUnitButton.className = 'command-button';
        nextUnitButton.textContent = 'Nächste Einheit';
        uiContainer.appendChild(nextUnitButton);
        
        nextUnitButton.addEventListener('click', () => {
            nextUnit(); 
            const unit = getCurrentUnit(); 
            fillUnitPanel(unit);
            
            selectedUnit = unit; 
            setSelectedUnit(selectedUnit); 
            clearSelectedTarget();
            
            log(`${unit.name} ausgewählt.`, 'default');
        });

        appElement.appendChild(canvas);
        appElement.appendChild(uiContainer);

        // --- TASTATURSTEUERUNG REPARIERT ---
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                event.preventDefault();
                nextUnitButton.click();
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                endTurnLogic(); // <--- Ruft jetzt garantiert die Spiellogik auf!
            }
        });

        canvas.addEventListener('click', (event) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const col = Math.floor(((event.clientX - rect.left) * scaleX) / 50);
            const row = Math.floor(((event.clientY - rect.top) * scaleY) / 50);

            const playerUnits = getPlayerUnits();
            const unitIdx = playerUnits.findIndex(u => u.row === row && u.col === col);

            if (unitIdx !== -1) {
                // Eigene Einheit auswählen
                setCurrentUnitIndex(unitIdx); 
                selectedUnit = playerUnits[unitIdx];
                
                setSelectedUnit(selectedUnit); 
                clearSelectedTarget(); 
                fillUnitPanel(selectedUnit);
            } else if (selectedUnit) {
                // Wenn wir schon ein Ziel haben und erneut draufklicken: Aktion ausführen!
                if (selectedTarget && selectedTarget.row === row && selectedTarget.col === col) {
                    if (selectedTarget.type === 'reachable') {
                        setCurrentUnitPosition(row, col);
                        setCurrentUnitMp(getCurrentUnitAttributes().mp - selectedTarget.cost);
                        resetSelection(); 
                        checkAllUnitsExhausted(); 
                        drawGrid();
                    } else if (selectedTarget.type === 'attack') {
                        if (selectedTarget.cost > 0) {
                            setCurrentUnitPosition(selectedTarget.attackFrom.row, selectedTarget.attackFrom.col);
                            setCurrentUnitMp(getCurrentUnitAttributes().mp - selectedTarget.cost);
                        }
                        
                        executeCombat(getCurrentUnitAttributes(), getEnemyUnits()[selectedTarget.enemyIdx], selectedTarget.enemyIdx, () => resetSelection());
                        setCurrentUnitMp(0); 
                        resetSelection(); 
                        checkAllUnitsExhausted(); 
                        drawGrid();
                    } else {
                        resetSelection();
                    }
                    return;
                }

                // Ziel anvisieren (Pfad für Vorschau berechnen)
                const enemies = getEnemyUnits();
                const eIdx = enemies.findIndex(e => e.row === row && e.col === col);
                const curPos = getCurrentUnitPosition();
                const curAttr = getCurrentUnitAttributes();

                if (eIdx !== -1) {
                    // MOVE & ATTACK VORSCHAU
                    const adjacents = [
                        { r: -1, c: 0 },
                        { r: 1, c: 0 },
                        { r: 0, c: -1 },
                        { r: 0, c: 1 }
                    ];
                    let best = { cost: Infinity, path: [], pos: null };
                    
                    adjacents.forEach(adj => {
                        const r = row + adj.r;
                        const c = col + adj.c;
                        
                        if (isPassable(r, c, grid)) {
                            const res = findPathAndCost(curPos, { row: r, col: c }, grid);
                            if (res.cost < best.cost) {
                                best = { cost: res.cost, path: res.path, pos: { row: r, col: c } };
                            }
                        }
                    });

                    selectedTarget = { 
                        row, 
                        col, 
                        enemyIdx: eIdx, 
                        cost: best.cost, 
                        path: best.path, 
                        attackFrom: best.pos,
                        type: (best.cost <= curAttr.mp) ? 'attack' : 'unreachable' 
                    };
                } else {
                    // BEWEGUNG VORSCHAU
                    const res = findPathAndCost(curPos, { row, col }, grid);
                    selectedTarget = { 
                        row, 
                        col, 
                        cost: res.cost, 
                        path: res.path, 
                        type: (res.path && res.cost <= curAttr.mp) ? 'reachable' : 'unreachable' 
                    };
                }
                
                setSelectedTarget(selectedTarget);
            } else {
                // KEIN Held ausgewählt -> Prüfen, ob wir einen Feind anklicken, um Stats zu sehen
                const enemies = getEnemyUnits();
                const eIdx = enemies.findIndex(e => e.row === row && e.col === col);
                
                if (eIdx !== -1) {
                    fillUnitPanel(enemies[eIdx]);
                    selectedTarget = { row, col, type: 'info' }; 
                    setSelectedTarget(selectedTarget);
                } else {
                    resetSelection();
                }
            }

            // Terrain-Info aktualisieren
            const cell = grid[row][col];
            if (cell) {
                const terrainInfo = document.getElementById('terrain-info-text');
                const terrainStats = document.getElementById('terrain-stats');

                if (terrainInfo) {
                    terrainInfo.textContent = `Terrain: ${cell.type}`;
                }
                
                if (terrainStats && terrainTypes[cell.type]) {
                    const t = terrainTypes[cell.type];
                    const defSign = t.defenseBonus >= 0 ? '+' : '';
                    terrainStats.innerHTML = `<span>MP: ${t.movementCost}</span> <span>Ang.: ${defSign}${t.defenseBonus}</span> <span>Def.: ${defSign}${t.defenseBonus}</span>`;
                }
            }
        });
    }

    onExit() {
        const uiPanel = document.getElementById('ui-panel');
        if (uiPanel) uiPanel.style.display = 'none';
    }
}
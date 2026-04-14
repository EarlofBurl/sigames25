import { initRenderer, drawGrid, getGridData, setSelectedTarget, clearSelectedTarget, setSelectedUnit, clearSelectedUnit, setVisibilityGrid, getVisibilityData } from '../engine/renderer.js';
import { setupKeyboardControls, isPassable } from '../engine/input.js';
import {
    initPlayerUnits, initEnemyUnits, getCurrentUnit, getCurrentUnitPosition, setCurrentUnitPosition,
    getCurrentUnitAttributes, setCurrentUnitMp, setCurrentUnitHasAttacked, refillCurrentUnitMp, nextUnit, getPlayerUnits, getEnemyUnits, setCurrentUnitIndex, applyEffectToUnit, applyEffectToEnemy
} from '../entities/units.js';
import { log, initConsole } from '../engine/console.js';
import { initDialog, playDialog } from '../engine/dialog.js';
import { terrainTypes } from '../data/terrain.js';
import { clearUnitPanel, fillUnitPanel, checkAllUnitsExhausted, setSpellCastCallback, setSpellSelectCallback } from './combat-ui.js';
import { executeCombat } from '../engine/combat-system.js';
import { findPathAndCost } from '../engine/movement-system.js';
import { executeEnemyTurn } from '../engine/enemy-ai.js';
import { updateVisibility, getVisibilityStatus, getVisibilityStatuses } from '../engine/visibility-system.js';

let grid;
let selectedUnit = null;
let selectedTarget = null;
let isPlayerTurn = true;
let currentSpell = null;

// Spell-Cast Callback für die UI
let onSpellCast = (caster, targetUnit, spell) => {
    console.log('onSpellCast called with:', caster?.name, targetUnit?.name, spell?.name);
    
    if (!spell) spell = currentSpell;
    if (!caster) caster = selectedUnit;
    
    if (!caster || !spell || !targetUnit) {
        log('Fehler: Fehlende Daten für Zauber!', 'error');
        return;
    }
    
    log(`${caster.name} wirkt ${spell.name} auf ${targetUnit.name}!`, 'default');
    
    // Finde die tatsächliche Einheit im Array und reduziere MP
    const playerUnits = getPlayerUnits();
    const casterUnit = playerUnits.find(u => u.id === caster.id);
    if (casterUnit) {
        casterUnit.mp = Math.max(0, casterUnit.mp - spell.mpCost);
        casterUnit.hasAttacked = true;
    }
    
    // Effekt auf Ziel anwenden (Spieler oder Feind)
    if (currentSpell.target === 'ally') {
        applyEffectToUnit(targetUnit.id, { 
            effect: spell.effect, 
            value: spell.value, 
            duration: spell.duration,
            caster: caster.name
        });
    } else {
        applyEffectToEnemy(targetUnit.id, { 
            effect: spell.effect, 
            value: spell.value, 
            duration: spell.duration,
            caster: caster.name
        });
    }
    
    log(`${spell.name} wurde auf ${targetUnit.name} gewirkt!`, 'attack');
    
    currentSpell = null;
    drawGrid();
    fillUnitPanel(casterUnit || caster);
    checkAllUnitsExhausted();
};

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
        
        // --- SICHTBARKEIT INITIALISIEREN ---
        setVisibilityGrid(updateVisibility(grid, getPlayerUnits()));
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

        // --- SPELL-SELECT CALLBACK ---
        setSpellSelectCallback((caster, spell) => {
            console.log('========================================');
            console.log('SPELL SELECTED!');
            console.log('caster:', caster?.name);
            console.log('caster id:', caster?.id);
            console.log('caster position (row,col):', caster?.row, caster?.col);
            console.log('spell:', spell?.name);
            console.log('spell range:', spell?.range);
            console.log('spell target type:', spell?.target);
            console.log('caster.mp:', caster?.mp, 'spell.mpCost:', spell?.mpCost);
            
            if (caster.mp < spell.mpCost) {
                log(`${caster.name} hat nicht genug MP für ${spell.name}!`, 'error');
                return;
            }
            
            // WICHTIG: Hole die EINHEIT aus dem Array, nicht vom UI
            const players = getPlayerUnits();
            const actualUnit = players.find(u => u.id === caster.id);
            
            console.log('actualUnit from array:', actualUnit?.name, actualUnit?.row, actualUnit?.col);
            
            selectedUnit = actualUnit || caster;
            currentSpell = spell;
            
            log(`${spell.name}: Wähle ein Ziel in Reichweite!`, 'default');
            
            fillUnitPanel(actualUnit || caster);
        });

        // --- SPELL-CAST CALLBACK (wird von der Klick-Logik aufgerufen) ---
        setSpellCastCallback((caster, targetUnit, spell) => {
            if (!spell) spell = currentSpell;
            if (!caster) caster = selectedUnit;
            
            if (!caster || !spell || !targetUnit) {
                log('Fehler: Fehlende Daten für Zauber!', 'error');
                return;
            }
            
            log(`${caster.name} wirkt ${spell.name} auf ${targetUnit.name}!`, 'default');
            
            // Finde die tatsächliche Einheit im Array und reduziere MP
            const playerUnits = getPlayerUnits();
            const casterUnit = playerUnits.find(u => u.id === caster.id);
            if (casterUnit) {
                casterUnit.mp = Math.max(0, casterUnit.mp - spell.mpCost);
                casterUnit.hasAttacked = true;
            }
            
            // Effekt auf Ziel anwenden (Spieler oder Feind)
            if (currentSpell.target === 'ally') {
                applyEffectToUnit(targetUnit.id, { 
                    effect: spell.effect, 
                    value: spell.value, 
                    duration: spell.duration,
                    caster: caster.name
                });
            } else {
                applyEffectToEnemy(targetUnit.id, { 
                    effect: spell.effect, 
                    value: spell.value, 
                    duration: spell.duration,
                    caster: caster.name
                });
            }
            
            log(`${spell.name} wurde auf ${targetUnit.name} gewirkt!`, 'attack');
            
            currentSpell = null;
            drawGrid();
            fillUnitPanel(casterUnit || caster);
            checkAllUnitsExhausted();
        });

        // --- ZUG BEENDEN LOGIK (INKL. ENEMY PHASE) ---
        let turnCounter = 1;
        const turnCounterElement = document.getElementById('turn-number');

        const endTurnLogic = async () => {
            if (!isPlayerTurn) return; // Verhindert Spamming
            
            isPlayerTurn = false;
            resetSelection();
            
            // Feinde sind dran (Meilenstein 12)
            await executeEnemyTurn(grid);
            
            // Spieler ist wieder dran
            refillCurrentUnitMp(); 
            turnCounter++;
            if (turnCounterElement) turnCounterElement.textContent = turnCounter;
            log(`Runde ${turnCounter} gestartet. Alle MP aufgefüllt.`);
            
            // Sicht nach Feindbewegungen updaten (Meilenstein 13)
            setVisibilityGrid(updateVisibility(grid, getPlayerUnits()));
            drawGrid(); 
            
            isPlayerTurn = true;
        };

        const endTurnButton = document.getElementById('end-turn-button');
        if (endTurnButton) {
            endTurnButton.addEventListener('click', endTurnLogic);
        }

        // --- NÄCHSTE EINHEIT BUTTON ---
        const nextUnitButton = document.createElement('button');
        nextUnitButton.id = 'next-unit-button';
        nextUnitButton.className = 'command-button';
        nextUnitButton.textContent = 'Nächste Einheit';
        
        if (infoPanel) infoPanel.appendChild(nextUnitButton);
        else uiContainer.appendChild(nextUnitButton); 
        
        nextUnitButton.addEventListener('click', () => {
            if (!isPlayerTurn) return;
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

        // --- TASTATURSTEUERUNG ---
        document.addEventListener('keydown', (event) => {
            if (!isPlayerTurn) return;
            if (event.key === 'Tab') {
                event.preventDefault();
                nextUnitButton.click();
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                endTurnLogic(); 
            }
        });

        // --- KLICK LOGIK ---
        canvas.addEventListener('click', (event) => {
            if (!isPlayerTurn) return;

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const col = Math.floor(((event.clientX - rect.left) * scaleX) / 50);
            const row = Math.floor(((event.clientY - rect.top) * scaleY) / 50);

            // === SPELL-TARGET MODUS ===
            if (currentSpell && selectedUnit) {
                console.log('=== SPELL TARGET MODE ACTIVE ===');
                console.log('currentSpell:', currentSpell?.name);
                console.log('selectedUnit:', selectedUnit?.name, selectedUnit?.row, selectedUnit?.col);
                
                const players = getPlayerUnits();
                const enemies = getEnemyUnits();
                
                // Finde die aktuelle Position des Casters aus dem Array
                const actualCaster = players.find(u => u.id === selectedUnit.id);
                const casterPos = actualCaster || selectedUnit;
                
                console.log('casterPos used for distance:', casterPos.row, casterPos.col);
                console.log('click position:', row, col);
                
                // Prüfe zuerst: ist auf dem geklickten Feld eine Einheit?
                const playerAtPos = players.find(u => u.row === row && u.col === col);
                const enemyAtPos = enemies.find(u => u.row === row && u.col === col);
                
                console.log('playerAtPos:', playerAtPos?.name, playerAtPos?.row, playerAtPos?.col);
                console.log('enemyAtPos:', enemyAtPos?.name);
                
                let targetUnit = null;
                
                if (currentSpell.target === 'ally') {
                    targetUnit = playerAtPos;
                    console.log('Looking for ally, targetUnit:', targetUnit?.name);
                } else if (currentSpell.target === 'enemy') {
                    targetUnit = enemyAtPos;
                }
                
                // Wenn keine gültige Zieleinheit gefunden wurde
                if (!targetUnit) {
                    // Hier NICHT abbrechen -可能是点击了其他东西
                    // Stattdessen: prüfen ob wir auf eine eigene Einheit geklickt haben und die auswählen wollen
                    // ABER nur wenn wir NICHT im spell mode sind... 
                    // Für jetzt: abbrechen
                    currentSpell = null;
                    log('Kein gültiges Ziel. Zauber abgebrochen.', 'default');
                    drawGrid();
                    return;
                }
                
                // Jetzt prüfen wir die Distanz - BENUTZE ACTUAL CASTER POSITION
                const distance = Math.abs(casterPos.row - row) + Math.abs(casterPos.col - col);
                console.log('FINAL distance:', distance, 'spell range:', currentSpell.range);
                
                if (distance <= currentSpell.range) {
                    console.log('CASTING SPELL NOW!');
                    onSpellCast(selectedUnit, targetUnit, currentSpell);
                    currentSpell = null;
                    drawGrid();
                    return;
                } else {
                    log(`${currentSpell.name}: Ziel ist zu weit entfernt! (Distanz: ${distance})`, 'error');
                    return;
                }
            }

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
                // Aktion ausführen
                if (selectedTarget && selectedTarget.row === row && selectedTarget.col === col) {
                    if (selectedTarget.type === 'reachable') {
                        setCurrentUnitPosition(row, col);
                        setCurrentUnitMp(getCurrentUnitAttributes().mp - selectedTarget.cost);
                        
                        // SICHTBARKEIT NACH BEWEGUNG UPDATEN
                        setVisibilityGrid(updateVisibility(grid, getPlayerUnits()));
                        
                        resetSelection(); 
                        checkAllUnitsExhausted(); 
                        drawGrid();
                    } else if (selectedTarget.type === 'attack') {
                        if (selectedTarget.cost > 0) {
                            setCurrentUnitPosition(selectedTarget.attackFrom.row, selectedTarget.attackFrom.col);
                            setCurrentUnitMp(getCurrentUnitAttributes().mp - selectedTarget.cost);
                        }
                        
                        const attackerPos = getCurrentUnitPosition();
                        const enemyPos = getEnemyUnits()[selectedTarget.enemyIdx];
                        const distance = Math.abs(attackerPos.row - enemyPos.row) + Math.abs(attackerPos.col - enemyPos.col);
                        executeCombat(getCurrentUnitAttributes(), enemyPos, selectedTarget.enemyIdx, () => resetSelection(), distance);
                        setCurrentUnitMp(0); 
                        setCurrentUnitHasAttacked(true);
                        
                        // SICHTBARKEIT NACH ANGRIFFS-BEWEGUNG UPDATEN
                        setVisibilityGrid(updateVisibility(grid, getPlayerUnits()));
                        
                        resetSelection(); 
                        checkAllUnitsExhausted(); 
                        drawGrid();
                    } else {
                        resetSelection();
                    }
                    return;
                }

                // Ziel anvisieren
                const enemies = getEnemyUnits();
                const eIdx = enemies.findIndex(e => e.row === row && e.col === col);
                const curPos = getCurrentUnitPosition();
                const curAttr = getCurrentUnitAttributes();

                 if (eIdx !== -1) {
                    const enemy = enemies[eIdx];
                    const distance = Math.abs(curPos.row - row) + Math.abs(curPos.col - col);
                    const visibilityGrid = getVisibilityData();
                    const VISIBILITY_STATUS = getVisibilityStatuses();
                    const enemyVisible = visibilityGrid[`${row},${col}`] === VISIBILITY_STATUS.VISIBLE;
                    const hasAttacked = selectedUnit && selectedUnit.hasAttacked;
                    
                    if (hasAttacked) {
                        selectedTarget = { row, col, type: 'unreachable' };
                    } else if (enemyVisible && distance <= curAttr.range) {
                        selectedTarget = { 
                            row, col, enemyIdx: eIdx, cost: 0, path: [], attackFrom: { row: curPos.row, col: curPos.col },
                            type: 'attack' 
                        };
                    } else if (enemyVisible) {
                        let best = { cost: Infinity, path: [], pos: null };
                        
                        for (let r = row - curAttr.range; r <= row + curAttr.range; r++) {
                            for (let c = col - curAttr.range; c <= col + curAttr.range; c++) {
                                const dist = Math.abs(r - row) + Math.abs(c - col);
                                if (dist <= curAttr.range && isPassable(r, c, grid)) {
                                    const res = findPathAndCost(curPos, { row: r, col: c }, grid, curAttr.mp, selectedUnit);
                                    if (res.cost < best.cost) best = { cost: res.cost, path: res.path, pos: { row: r, col: c } };
                                }
                            }
                        }
                        
                        selectedTarget = { 
                            row, col, enemyIdx: eIdx, cost: best.cost, path: best.path, attackFrom: best.pos,
                            type: (best.cost <= curAttr.mp) ? 'attack' : 'unreachable' 
                        };
                    } else {
                        selectedTarget = { row, col, type: 'unreachable' };
                    }
                } else {
                    const visibilityGrid = getVisibilityData();
                    const VISIBILITY_STATUS = getVisibilityStatuses();
                    const fieldVisible = visibilityGrid[`${row},${col}`] === VISIBILITY_STATUS.VISIBLE;
                    
                    const res = findPathAndCost(curPos, { row, col }, grid, curAttr.mp, selectedUnit);
                    selectedTarget = { 
                        row, col, cost: res.cost, path: res.path, 
                        type: (res.path && res.cost <= curAttr.mp && fieldVisible) ? 'reachable' : 'unreachable' 
                    };
                }
                
                setSelectedTarget(selectedTarget);
            } else {
                // Info-Ansicht für Feinde
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
                if (terrainInfo) terrainInfo.textContent = `Terrain: ${cell.type}`;
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
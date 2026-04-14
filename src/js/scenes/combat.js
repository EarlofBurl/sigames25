import Phaser from 'phaser';
import { initRenderer, drawGrid, getGridData, setSelectedTarget, clearSelectedTarget, setSelectedUnit, clearSelectedUnit, setVisibilityGrid, getVisibilityData } from '../engine/renderer.js';
import { isPassable } from '../engine/input.js';
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
import { updateVisibility, getVisibilityStatuses } from '../engine/visibility-system.js';

const CELL_SIZE = 50;

let grid;
let selectedUnit = null;
let selectedTarget = null;
let isPlayerTurn = true;
let currentSpell = null;

let onSpellCast = (caster, targetUnit, spell) => {
    if (!spell) spell = currentSpell;
    if (!caster) caster = selectedUnit;

    if (!caster || !spell || !targetUnit) {
        log('Fehler: Fehlende Daten für Zauber!', 'error');
        return;
    }

    log(`${caster.name} wirkt ${spell.name} auf ${targetUnit.name}!`, 'default');

    const playerUnits = getPlayerUnits();
    const casterUnit = playerUnits.find(u => u.id === caster.id);
    if (casterUnit) {
        casterUnit.mp = Math.max(0, casterUnit.mp - spell.mpCost);
        casterUnit.hasAttacked = true;
    }

    if (spell.target === 'ally') {
        applyEffectToUnit(targetUnit.id, {
            effect: spell.effect, value: spell.value,
            duration: spell.duration, caster: caster.name
        });
    } else {
        applyEffectToEnemy(targetUnit.id, {
            effect: spell.effect, value: spell.value,
            duration: spell.duration, caster: caster.name
        });
    }

    log(`${spell.name} wurde auf ${targetUnit.name} gewirkt!`, 'attack');

    currentSpell = null;
    drawGrid();
    fillUnitPanel(casterUnit || caster);
    checkAllUnitsExhausted();
};

export class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CombatScene' });
    }

    init(data) {
        this.mission = (data && data.mission) || this.registry.get('mission');
    }

    create() {
        if (!this.mission) {
            console.error('CombatScene: Keine Missionsdaten übergeben!');
            return;
        }

        // --- PHASER GRAPHICS INITIALISIEREN ---
        const gfx = this.add.graphics();
        gfx.setDepth(0);
        initRenderer(gfx, this, this.mission);
        grid = getGridData().grid;

        if (this.mission.playerUnits) initPlayerUnits(this.mission.playerUnits);
        if (this.mission.enemies) initEnemyUnits(this.mission.enemies);

        setVisibilityGrid(updateVisibility(grid, getPlayerUnits()));
        drawGrid();

        // --- DOM-UI EINBLENDEN ---
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

        const resetSelection = () => {
            selectedUnit = null;
            selectedTarget = null;
            clearSelectedUnit();
            clearSelectedTarget();
            clearUnitPanel();
        };

        // --- SPELL-SELECT CALLBACK ---
        setSpellSelectCallback((caster, spell) => {
            if (caster.mp < spell.mpCost) {
                log(`${caster.name} hat nicht genug MP für ${spell.name}!`, 'error');
                return;
            }

            const players = getPlayerUnits();
            const actualUnit = players.find(u => u.id === caster.id);

            selectedUnit = actualUnit || caster;
            currentSpell = spell;

            log(`${spell.name}: Wähle ein Ziel in Reichweite!`, 'default');
            fillUnitPanel(actualUnit || caster);
        });

        // --- SPELL-CAST CALLBACK ---
        setSpellCastCallback((caster, targetUnit, spell) => {
            onSpellCast(caster, targetUnit, spell);
        });

        // --- ZUG BEENDEN LOGIK ---
        let turnCounter = 1;
        const turnCounterElement = document.getElementById('turn-number');

        const endTurnLogic = async () => {
            if (!isPlayerTurn) return;

            isPlayerTurn = false;
            resetSelection();

            await executeEnemyTurn(grid);

            refillCurrentUnitMp();
            turnCounter++;
            if (turnCounterElement) turnCounterElement.textContent = turnCounter;
            log(`Runde ${turnCounter} gestartet. Alle MP aufgefüllt.`);

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

        // --- PHASER TASTATURSTEUERUNG ---
        this.input.keyboard.on('keydown-TAB', (event) => {
            event.preventDefault();
            nextUnitButton.click();
        });

        this.input.keyboard.on('keydown-ENTER', (event) => {
            event.preventDefault();
            endTurnLogic();
        });

        // --- PHASER KLICK LOGIK ---
        this.input.on('pointerdown', (pointer) => {
            if (!isPlayerTurn) return;

            const col = Math.floor(pointer.x / CELL_SIZE);
            const row = Math.floor(pointer.y / CELL_SIZE);

            if (row < 0 || row >= 10 || col < 0 || col >= 10) return;

            // === SPELL-TARGET MODUS ===
            if (currentSpell && selectedUnit) {
                const players = getPlayerUnits();
                const enemies = getEnemyUnits();

                const actualCaster = players.find(u => u.id === selectedUnit.id);
                const casterPos = actualCaster || selectedUnit;

                const playerAtPos = players.find(u => u.row === row && u.col === col);
                const enemyAtPos = enemies.find(u => u.row === row && u.col === col);

                let targetUnit = null;

                if (currentSpell.target === 'ally') {
                    targetUnit = playerAtPos;
                } else if (currentSpell.target === 'enemy') {
                    targetUnit = enemyAtPos;
                }

                if (!targetUnit) {
                    currentSpell = null;
                    log('Kein gültiges Ziel. Zauber abgebrochen.', 'default');
                    drawGrid();
                    return;
                }

                const distance = Math.abs(casterPos.row - row) + Math.abs(casterPos.col - col);

                if (distance <= currentSpell.range) {
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
                setCurrentUnitIndex(unitIdx);
                selectedUnit = playerUnits[unitIdx];
                setSelectedUnit(selectedUnit);
                clearSelectedTarget();
                fillUnitPanel(selectedUnit);
            } else if (selectedUnit) {
                if (selectedTarget && selectedTarget.row === row && selectedTarget.col === col) {
                    if (selectedTarget.type === 'reachable') {
                        setCurrentUnitPosition(row, col);
                        setCurrentUnitMp(getCurrentUnitAttributes().mp - selectedTarget.cost);

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

                        setVisibilityGrid(updateVisibility(grid, getPlayerUnits()));

                        resetSelection();
                        checkAllUnitsExhausted();
                        drawGrid();
                    } else {
                        resetSelection();
                    }
                    return;
                }

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
                            row, col, enemyIdx: eIdx, cost: 0, path: [],
                            attackFrom: { row: curPos.row, col: curPos.col },
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

    shutdown() {
        // DOM-UI verstecken
        const uiPanel = document.getElementById('ui-panel');
        if (uiPanel) uiPanel.style.display = 'none';

        // Nächste-Einheit-Button entfernen
        const nextBtn = document.getElementById('next-unit-button');
        if (nextBtn) nextBtn.remove();

        // State zurücksetzen
        selectedUnit = null;
        selectedTarget = null;
        isPlayerTurn = true;
        currentSpell = null;
        grid = null;
    }
}

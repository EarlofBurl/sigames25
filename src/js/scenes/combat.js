import Phaser from 'phaser';
import { initRenderer, drawGrid, getGridData, setSelectedTarget, clearSelectedTarget, setSelectedUnit, clearSelectedUnit, setVisibilityGrid, getVisibilityData } from '../engine/renderer.js';
import { terrainTypes, isPassable, isAdjacentToEnemy } from '../engine/terrain.js';
import {
    initPlayerUnits, initEnemyUnits, getCurrentUnit, getCurrentUnitPosition, setCurrentUnitPosition,
    getCurrentUnitAttributes, setCurrentUnitMp, setCurrentUnitHasAttacked, refillCurrentUnitMp, nextUnit, getPlayerUnits, getEnemyUnits, setCurrentUnitIndex, applyEffectToUnit, applyEffectToEnemy
} from '../entities/units.js';
import { log, initConsole, destroyConsole } from '../engine/console.js';
import { initDialog, playDialog, destroyDialog } from '../engine/dialog.js';
import { initCombatUI, clearUnitPanel, fillUnitPanel, checkAllUnitsExhausted, setSpellCastCallback, setSpellSelectCallback, getNextUnitButton, updateTerrainInfo, destroyCombatUI, showCombatPreview, animateCombatResult, showSpellPreview, animateSpellResult, hidePreview } from './combat-ui.js';
import { executeCombat, predictCombat } from '../engine/combat-system.js';
import { findPathAndCost } from '../engine/movement-system.js';
import { executeEnemyTurn } from '../engine/enemy-ai.js';
import { updateVisibility, getVisibilityStatuses } from '../engine/visibility-system.js';
import { showEnemyAction } from './combat-ui.js';

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

    animateSpellResult(casterUnit || caster, targetUnit, spell);
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

    preload() {
        const mapFile = (this.mission && this.mission.mapFile) || 'assets/maps/mission_01.tmj';
        this.load.image('terrain_tileset', 'assets/tileset.png');
        this.load.tilemapTiledJSON('mission_map', mapFile);
    }

    create() {
        if (!this.mission) {
            console.error('CombatScene: Keine Missionsdaten übergeben!');
            return;
        }

        // --- UI-MODULE INITIALISIEREN ---
        const mainArea = document.getElementById('main-area');

        // Bottom-Bar erstellen
        const bottomBar = document.createElement('div');
        bottomBar.id = 'bottom-bar';
        const logSection = document.createElement('div');
        logSection.id = 'log-section';
        bottomBar.appendChild(logSection);
        const previewSection = document.createElement('div');
        previewSection.id = 'preview-section';
        bottomBar.appendChild(previewSection);
        document.body.appendChild(bottomBar);

        initCombatUI(mainArea, previewSection);
        initConsole(logSection);
        initDialog();

        // Top-Bar einblenden
        const topBar = document.getElementById('top-bar');
        if (topBar) topBar.style.display = 'flex';

        // --- RENDERER INITIALISIEREN (Tilemap + Graphics-Overlay) ---
        initRenderer(this, this.mission);
        grid = getGridData().grid;

        if (this.mission.playerUnits) initPlayerUnits(this.mission.playerUnits);
        if (this.mission.enemies) initEnemyUnits(this.mission.enemies);

        setVisibilityGrid(updateVisibility(grid, getPlayerUnits()));
        drawGrid();

        if (this.mission.dialogues && this.mission.dialogues.length > 0) {
            playDialog(this.mission.dialogues);
        }

        const resetSelection = () => {
            selectedUnit = null;
            selectedTarget = null;
            currentSpell = null;
            clearSelectedUnit();
            clearSelectedTarget();
            clearUnitPanel();
            hidePreview();
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

            await executeEnemyTurn(grid, drawGrid, async (actionType, enemy, target, data) => {
                if (actionType === 'attack') await showEnemyAction(enemy, target, 'attack', data);
                else if (actionType === 'move') await showEnemyAction(enemy, null, 'move', data);
            });

            // Heilung in Städten: Einheiten auf 'city', die sich nicht bewegt haben, heilen 20% Max-HP
            const allUnits = getPlayerUnits();
            allUnits.forEach(unit => {
                if (!unit.hasMoved && grid[unit.row] && grid[unit.row][unit.col]) {
                    if (grid[unit.row][unit.col].type === 'city' && unit.hp < unit.maxHp) {
                        const heal = Math.ceil(unit.maxHp * 0.2);
                        unit.hp = Math.min(unit.maxHp, unit.hp + heal);
                        log(`${unit.name} heilt ${heal} HP in der Stadt.`, 'default');
                    }
                }
            });

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

        // --- NÄCHSTE EINHEIT BUTTON (von combat-ui.js erstellt) ---
        const nextUnitButton = getNextUnitButton();
        if (nextUnitButton) {
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
        }

        // --- PHASER TASTATURSTEUERUNG ---
        this.input.keyboard.on('keydown-TAB', (event) => {
            event.preventDefault();
            if (nextUnitButton) nextUnitButton.click();
        });

        this.input.keyboard.on('keydown-ENTER', (event) => {
            event.preventDefault();
            endTurnLogic();
        });

        // --- HOVER: Kampf-/Zauber-Vorschau ---
        this.input.on('pointermove', (pointer) => {
            if (!isPlayerTurn || !selectedUnit) {
                hidePreview();
                return;
            }

            const col = Math.floor(pointer.x / CELL_SIZE);
            const row = Math.floor(pointer.y / CELL_SIZE);

            if (row < 0 || row >= 10 || col < 0 || col >= 10) {
                hidePreview();
                return;
            }

            const players = getPlayerUnits();
            const enemies = getEnemyUnits();
            const curAttr = getCurrentUnitAttributes();

            // Zauber-Vorschau
            if (currentSpell && selectedUnit) {
                const actualCaster = players.find(u => u.id === selectedUnit.id) || selectedUnit;
                let targetUnit = null;
                if (currentSpell.target === 'ally') targetUnit = players.find(u => u.row === row && u.col === col);
                else if (currentSpell.target === 'enemy') targetUnit = enemies.find(u => u.row === row && u.col === col);

                if (targetUnit) {
                    const dist = Math.abs(actualCaster.row - row) + Math.abs(actualCaster.col - col);
                    if (dist <= currentSpell.range) {
                        showSpellPreview(actualCaster, targetUnit, currentSpell);
                        return;
                    }
                }
                hidePreview();
                return;
            }

            // Kampf-Vorschau
            const eIdx = enemies.findIndex(e => e.row === row && e.col === col);
            if (eIdx !== -1 && !curAttr.hasAttacked) {
                const enemy = enemies[eIdx];
                const distance = Math.abs(curAttr.row - row) + Math.abs(curAttr.col - col);
                if (distance <= curAttr.range) {
                    const pred = predictCombat(curAttr, enemy, distance, grid, players);
                    showCombatPreview(curAttr, enemy, pred);
                } else {
                    hidePreview();
                }
            } else {
                hidePreview();
            }
        });

        // --- PHASER KLICK LOGIK ---
        this.input.on('pointerdown', async (pointer) => {
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
                        const curAttr = getCurrentUnitAttributes();
                        const pred = predictCombat(curAttr, enemyPos, distance, grid, getPlayerUnits());

                        // HP VOR Kampf merken
                        const attackerHpBefore = curAttr.hp;
                        const defenderHpBefore = enemyPos.hp;

                        // Kampf ausführen (State ändert sich)
                        executeCombat(curAttr, enemyPos, selectedTarget.enemyIdx, () => resetSelection(), distance);
                        setCurrentUnitMp(0);
                        setCurrentUnitHasAttacked(true);
                        drawGrid();

                        // Animation mit gemerkten HP-Werten
                        curAttr._label = 'Angreifer';
                        enemyPos._label = 'Verteidiger';
                        await animateCombatResult(curAttr, enemyPos, {
                            leftHpBefore: attackerHpBefore,
                            leftHpAfter: pred.attackerHpAfter,
                            rightHpBefore: defenderHpBefore,
                            rightHpAfter: pred.defenderHpAfter,
                            leftDmg: pred.canCounter ? pred.counterDmg : 0,
                            rightDmg: pred.attackDmg,
                            title: '⚔ Kampf'
                        });

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
                    const zoc = isAdjacentToEnemy(row, col, selectedUnit);
                    selectedTarget = {
                        row, col, cost: res.cost, path: res.path, isZoC: zoc,
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
                updateTerrainInfo(cell, terrainTypes);
            }
        });
    }

    shutdown() {
        // Top-Bar verstecken
        const topBar = document.getElementById('top-bar');
        if (topBar) topBar.style.display = 'none';

        // UI-Module zerstören
        destroyCombatUI();
        destroyConsole();
        destroyDialog();

        // Bottom-Bar entfernen
        const bottomBar = document.getElementById('bottom-bar');
        if (bottomBar) bottomBar.remove();

        // State zurücksetzen
        selectedUnit = null;
        selectedTarget = null;
        isPlayerTurn = true;
        currentSpell = null;
        grid = null;
    }
}

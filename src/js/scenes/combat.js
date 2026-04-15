import Phaser from 'phaser';
import { initRenderer, drawGrid, getGridData, setSelectedTarget, clearSelectedTarget, setSelectedUnit, clearSelectedUnit, setVisibilityGrid, getVisibilityData, setLocationOwner, getLocationOwner, collectOrb } from '../engine/renderer.js';
import { GRID_SIZE } from '../config.js';
import { terrainTypes, isPassable, isAdjacentToEnemy } from '../engine/terrain.js';
import {
    initPlayerUnits, initEnemyUnits, getCurrentUnit, getCurrentUnitPosition, setCurrentUnitPosition,
    getCurrentUnitAttributes, setCurrentUnitMp, setCurrentUnitHasAttacked, refillCurrentUnitMp, nextUnit,
    getPlayerUnits, getEnemyUnits, setCurrentUnitIndex, applyEffectToUnit, applyEffectToEnemy,
    setUnitTurnState, getUnitTurnState, unitAttack, unitCastSpell
} from '../entities/units.js';
import { log, initConsole, destroyConsole } from '../engine/console.js';
import { initDialog, playDialog, destroyDialog } from '../engine/dialog.js';
import { initCombatUI, clearUnitPanel, fillUnitPanel, checkAllUnitsExhausted, setSpellCastCallback, setSpellSelectCallback, getNextUnitButton, updateTerrainInfo, destroyCombatUI, showCombatPreview, animateCombatResult, showSpellPreview, animateSpellResult, hidePreview, showEnemyAction, setActionCallbacks, showCursorSymbol, hideCursorSymbol } from './combat-ui.js';
import { executeCombat, predictCombat } from '../engine/combat-system.js';
import { findPathAndCost } from '../engine/movement-system.js';
import { executeEnemyTurn } from '../engine/enemy-ai.js';
import { updateVisibility, getVisibilityStatuses } from '../engine/visibility-system.js';
import { checkVictoryCondition, calculateReputation } from '../engine/scoring-system.js';
import { saveMissionRewards } from '../engine/storage.js';

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
        // Zauber kostet Mana, nicht MP
        const manaCost = spell.manaCost !== undefined ? spell.manaCost : 0;
        unitCastSpell(casterUnit.id, manaCost);
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

        // --- LAYOUT ERSTELLEN ---
        const app = document.getElementById('app');
        app.innerHTML = '';

        const combatLayout = document.createElement('div');
        combatLayout.id = 'combat-layout';

        // Top row (unit panel + map)
        const topRow = document.createElement('div');
        topRow.className = 'combat-top-row';

        // Unit Panel (links, oben)
        const unitPanel = document.createElement('div');
        unitPanel.id = 'unit-panel';
        topRow.appendChild(unitPanel);

        // Map Area (mitte)
        const mapArea = document.createElement('div');
        mapArea.id = 'map-area';
        topRow.appendChild(mapArea);

        combatLayout.appendChild(topRow);

        // Bottom row (action log + combat preview)
        const bottomRow = document.createElement('div');
        bottomRow.className = 'combat-bottom-row';

        const actionLog = document.createElement('div');
        actionLog.id = 'action-log';
        bottomRow.appendChild(actionLog);

        const combatPreview = document.createElement('div');
        combatPreview.id = 'combat-preview';
        combatPreview.innerHTML = '<span style="color:#ffd700;font-size:16px;">⚔ Kampf-Vorschau</span>';
        bottomRow.appendChild(combatPreview);

        combatLayout.appendChild(bottomRow);

        app.appendChild(combatLayout);

        // --- UI MODULE INITIALISIEREN ---
        initCombatUI(unitPanel);
        initConsole(actionLog);
        initDialog();

        this.missionState = {
            collectedOrbs: [],
            turnCount: 1,
            capturedLocations: {},
            defeatedEnemies: [],
            missionEnded: false
        };

        // Top-Bar einblenden
        const hubTopBar = document.getElementById('hub-top-bar');
        if (hubTopBar) hubTopBar.remove();

        const combatTopBar = document.getElementById('top-bar');
        if (combatTopBar) combatTopBar.style.display = 'flex';

        // --- PHASER CANVAS IN MAP-AREA INITIALISIEREN ---
        initRenderer(this, this.mission);
        grid = getGridData().grid;

        // Phaser canvas in map-area positionieren
        const canvas = this.game.canvas;
        canvas.style.position = 'absolute';
        canvas.style.top = '50%';
        canvas.style.left = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.zIndex = '1';
        mapArea.appendChild(canvas);

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
            hideCursorSymbol();
        };

        // --- AKTIONS-CALLBACKS ---
        setActionCallbacks(
            // onAttack: Zeigt Gegner in Reichweite an
            (unit) => {
                log('Ziel für Angriff wählen.', 'default');
            },
            // onWait: Beendet Zug für diese Einheit
            (unit) => {
                unit.turnState = 'acted';
                unit.hasAttacked = true;
                resetSelection();
                checkAllUnitsExhausted();
                drawGrid();
                log(`${unit.name} wartet.`, 'default');
            },
            // onMove: Zeigt erreichbare Zellen an
            (unit) => {
                log('Ziel-Feld zum Bewegen wählen.', 'default');
            }
        );

        // --- SPELL-SELECT CALLBACK ---
        setSpellSelectCallback((caster, spell) => {
            const manaCost = spell.manaCost !== undefined ? spell.manaCost : spell.mpCost;
            if (caster.mana < manaCost) {
                log(`${caster.name} hat nicht genug Mana für ${spell.name}!`, 'error');
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

        const updateLocationOwnership = () => {
            const players = getPlayerUnits();
            const enemies = getEnemyUnits();
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (grid[r] && grid[r][c] && grid[r][c].locationType) {
                        const key = `${r},${c}`;
                        const playerOnTile = players.some(u => u.row === r && u.col === c);
                        const enemyOnTile = enemies.some(e => e.row === r && e.col === c);

                        if (playerOnTile) {
                            setLocationOwner(r, c, 'player');
                            this.missionState.capturedLocations[key] = 'player';
                        } else if (enemyOnTile) {
                            setLocationOwner(r, c, 'enemy');
                            this.missionState.capturedLocations[key] = 'enemy';
                        } else if (!this.missionState.capturedLocations.hasOwnProperty(key)) {
                            setLocationOwner(r, c, 'neutral');
                        }
                    }
                }
            }
        };

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
            log(`Runde ${turnCounter} gestartet. Alle MP und Mana aufgefüllt.`);

            updateLocationOwnership();
            setVisibilityGrid(updateVisibility(grid, getPlayerUnits()));
            drawGrid();

            isPlayerTurn = true;
            checkMissionEnd();
        };

        const checkMissionEnd = () => {
            if (this.missionState.missionEnded) return;
            const result = checkVictoryCondition(
                this.mission,
                this.missionState,
                getPlayerUnits(),
                getEnemyUnits(),
                turnCounter
            );
            if (result) {
                this.missionState.missionEnded = true;
                showResultScreen(result);
            }
        };

        const showResultScreen = (result) => {
            const overlay = document.createElement('div');
            overlay.id = 'result-overlay';
            overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:2000;';

            const isVictory = result === 'victory';
            const title = document.createElement('div');
            title.textContent = isVictory ? `${this.mission.title} erfolgreich abgeschlossen!` : 'Niederlage!';
            title.style.cssText = `font-size:36px;font-weight:bold;color:${isVictory ? '#44ff44' : '#ff4444'};margin-bottom:30px;text-align:center;`;

            const breakdown = calculateReputation(
                this.mission,
                this.missionState,
                turnCounter,
                this.missionState.defeatedEnemies
            );

            const lines = [
                `Basis: ${breakdown.base}`,
                `Kriegsbeute: +${breakdown.warTrophy}`,
                `Strategiepunkte: +${breakdown.strategicPoints}`,
                `Runden-Bonus: +${breakdown.golfBonus}`,
                '',
                `Gesamt: ${breakdown.total} Reputation`
            ];

            const text = document.createElement('div');
            text.style.cssText = 'color:white;font-size:20px;text-align:center;line-height:1.8;';
            text.innerHTML = lines.join('<br>');

            const orbText = document.createElement('div');
            orbText.style.cssText = 'color:#ffd700;font-size:24px;margin-top:20px;';
            orbText.textContent = `Orbs eingesammelt: ${this.missionState.collectedOrbs.length}`;

            const button = document.createElement('button');
            button.textContent = 'Weiter';
            button.style.cssText = 'margin-top:30px;padding:15px 40px;font-size:20px;cursor:pointer;';
            button.addEventListener('click', () => {
                saveMissionRewards(breakdown.total, this.missionState.collectedOrbs.length, this.mission.id);
                overlay.remove();
                this.scene.stop();
                this.scene.start('HubScene');
            });

            overlay.appendChild(title);
            overlay.appendChild(text);
            overlay.appendChild(orbText);
            overlay.appendChild(button);
            document.body.appendChild(overlay);
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
                hideCursorSymbol();
                return;
            }

            const col = Math.floor(pointer.x / CELL_SIZE);
            const row = Math.floor(pointer.y / CELL_SIZE);

            if (row < 0 || row >= 10 || col < 0 || col >= 10) {
                hidePreview();
                hideCursorSymbol();
                return;
            }

            const players = getPlayerUnits();
            const enemies = getEnemyUnits();
            const curAttr = getCurrentUnitAttributes();

            // Zauber-Vorschau (immer wenn Zauber aktiv)
            if (currentSpell && selectedUnit) {
                const actualCaster = players.find(u => u.id === selectedUnit.id) || selectedUnit;
                let targetUnit = null;
                if (currentSpell.target === 'ally') targetUnit = players.find(u => u.row === row && u.col === col);
                else if (currentSpell.target === 'enemy') targetUnit = enemies.find(u => u.row === row && u.col === col);

                if (targetUnit) {
                    const dist = Math.abs(actualCaster.row - row) + Math.abs(actualCaster.col - col);
                    if (dist <= currentSpell.range) {
                        showSpellPreview(actualCaster, targetUnit, currentSpell);
                        showCursorSymbol(pointer, { weapon: 'magic', range: 1 });
                        return;
                    }
                }
                hidePreview();
                hideCursorSymbol();
                return;
            }

            // Kampf-Vorschau: vor Angriff (auch ohne Bewegung)
            const eIdx = enemies.findIndex(e => e.row === row && e.col === col);
            if (eIdx !== -1 && !curAttr.hasAttacked) {
                const enemy = enemies[eIdx];
                const distance = Math.abs(curAttr.row - row) + Math.abs(curAttr.col - col);
                if (distance <= curAttr.range) {
                    const pred = predictCombat(curAttr, enemy, distance, grid, players);
                    showCombatPreview(curAttr, enemy, pred);
                    showCursorSymbol(pointer, curAttr);
                } else {
                    hidePreview();
                    hideCursorSymbol();
                }
            } else {
                hidePreview();
                hideCursorSymbol();
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
                // Spieler-Einheit auswählen
                setCurrentUnitIndex(unitIdx);
                selectedUnit = playerUnits[unitIdx];
                setSelectedUnit(selectedUnit);
                clearSelectedTarget();
                fillUnitPanel(selectedUnit);
            } else if (selectedUnit) {
                // === BESTÄTIGUNG: Zweiter Klick auf ausgewähltes Ziel ===
                if (selectedTarget && selectedTarget.row === row && selectedTarget.col === col) {

                    if (selectedTarget.type === 'reachable') {
                        // Bewegung zu erreichbarem Feld
                        setCurrentUnitPosition(row, col);
                        setCurrentUnitMp(getCurrentUnitAttributes().mp - selectedTarget.cost);

                        // Orb einsammeln
                        const orbCollected = collectOrb(row, col);
                        if (orbCollected) {
                            this.missionState.collectedOrbs.push({ row, col });
                            playDialog([{ character: 'System', text: 'Ausrüstungs-Orb gefunden!' }]);
                        }

                        updateLocationOwnership();
                        setVisibilityGrid(updateVisibility(grid, getPlayerUnits()));

                        // Einheit neu laden nach Bewegung (State ist jetzt 'moved')
                        const movedUnit = getPlayerUnits().find(u => u.id === selectedUnit.id);
                        if (movedUnit) {
                            selectedUnit = movedUnit;
                            setSelectedUnit(selectedUnit);
                            selectedTarget = null;
                            clearSelectedTarget();
                            fillUnitPanel(selectedUnit);
                        }
                        drawGrid();
                        return;

                    } else if (selectedTarget.type === 'attack') {
                        // === ANGRIFF AUSFÜHREN ===
                        if (selectedTarget.cost > 0) {
                            setCurrentUnitPosition(selectedTarget.attackFrom.row, selectedTarget.attackFrom.col);
                            setCurrentUnitMp(getCurrentUnitAttributes().mp - selectedTarget.cost);
                        }

                        const attackerPos = getCurrentUnitPosition();
                        const enemyPos = getEnemyUnits()[selectedTarget.enemyIdx];
                        if (!enemyPos) { resetSelection(); return; }

                        const distance = Math.abs(attackerPos.row - enemyPos.row) + Math.abs(attackerPos.col - enemyPos.col);
                        const curAttr = getCurrentUnitAttributes();
                        const pred = predictCombat(curAttr, enemyPos, distance, grid, getPlayerUnits());

                        // HP VOR Kampf merken
                        const attackerHpBefore = curAttr.hp;
                        const defenderHpBefore = enemyPos.hp;

                        // Kampf ausführen (State ändert sich)
                        executeCombat(curAttr, enemyPos, selectedTarget.enemyIdx, () => resetSelection(), distance);

                        // Einheit auf 'acted' setzen
                        unitAttack(curAttr.id);

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

                        // Feind besiegt?
                        if (enemyPos.hp <= 0) {
                            this.missionState.defeatedEnemies.push({ maxHp: enemyPos.maxHp || enemyPos.hp });
                            log(`${enemyPos.name} wurde besiegt!`, 'attack');
                        }

                        resetSelection();
                        checkAllUnitsExhausted();
                        drawGrid();
                        checkMissionEnd();

                    } else {
                        resetSelection();
                    }
                    return;
                }

                // === FEIND-ODER-FELD-ANALYSE ===
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

                    if (hasAttacked || curAttr.turnState === 'acted') {
                        selectedTarget = { row, col, type: 'unreachable' };
                    } else if (enemyVisible && distance <= curAttr.range) {
                        // Feind in Reichweite → Angriffsziel setzen (Kosten 0, Position unverändert)
                        selectedTarget = {
                            row, col, enemyIdx: eIdx, cost: 0, path: [],
                            attackFrom: { row: curPos.row, col: curPos.col },
                            type: 'attack'
                        };
                    } else if (enemyVisible) {
                        // Feind sichtbar aber nicht in Reichweite → beste Annäherungsposition finden
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
                    // Leeres Feld → Bewegungspfad berechnen
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
                // Keine Einheit ausgewählt → Info anzeigen oder abwählen
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

        // Combat Layout entfernen
        const combatLayout = document.getElementById('combat-layout');
        if (combatLayout) combatLayout.remove();

        // State zurücksetzen
        selectedUnit = null;
        selectedTarget = null;
        isPlayerTurn = true;
        currentSpell = null;
        grid = null;
    }
}

// combat.js
// Kampf-Szene mit Grid und Spielfigur

import { initRenderer, drawGrid, getGridData } from '../engine/renderer.js';
import { setupKeyboardControls, setupMouseControls, isPassable } from '../engine/input.js';
import { getHeroPosition, setHeroPosition } from '../entities/hero.js';
import { saveGame, loadGame, resetGame } from '../engine/storage.js';
import { mission01 } from '../data/missions/mission_01.js';
import { initConsole, log, setUnitDetails } from '../engine/console.js';
import { initDialog, playDialog } from '../engine/dialog.js';

let grid;

export class CombatScene {
    constructor(sceneManager, mission) {
        this.sceneManager = sceneManager;
        this.mission = mission;
    }

    // Wird aufgerufen, wenn die Szene betreten wird
    onEnter() {
        const appElement = document.getElementById('app');
        
        // Canvas erstellen
        const canvas = document.createElement('canvas');
        canvas.id = 'gameCanvas';
        canvas.width = 500;
        canvas.height = 500;
        
        // Lade den Spielstand, falls vorhanden
        const savedData = loadGame();
        if (savedData) {
            setHeroPosition(savedData.player.row, savedData.player.col);
        } else {
            // Setze die Position des Helden auf den Startpunkt, falls kein Spielstand vorhanden ist
            setHeroPosition(0, 0);
        }
        
        // Initialisiere den Renderer mit der Mission
        initRenderer(canvas, this.mission);
        
        // Lade das Grid für die Bewegungsprüfung
        const gridData = getGridData();
        grid = gridData.grid;
        
        // Zeige die Top-Bar, Info-Panel und Action-Console an
        const topBar = document.getElementById('top-bar');
        const infoPanel = document.getElementById('info-panel');
        const actionConsole = document.getElementById('action-console');
        
        if (topBar) topBar.style.display = 'flex';
        if (infoPanel) infoPanel.style.display = 'flex';
        if (actionConsole) actionConsole.style.display = 'block';
        
        // Initialisiere die Konsole
        initConsole();
        log('Willkommen beim SI-Games Jubiläum!');
        
        // Initialisiere das Dialog-Overlay
        initDialog();
        
        // Starte den Dialog, falls vorhanden
        if (this.mission.dialogues && this.mission.dialogues.length > 0) {
            playDialog(this.mission.dialogues);
        }
        
        // UI-Container erstellen
        const uiContainer = document.createElement('div');
        uiContainer.className = 'ui-container';
        
        // Die Buttons in der Top-Bar werden jetzt verwendet
        const saveButton = document.getElementById('save-button');
        const resetButton = document.getElementById('reset-button');
        
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                const heroPos = getHeroPosition();
                saveGame({ player: heroPos });
                log('Spielstand gespeichert!');
            });
        }
        
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                resetGame();
                // Setze die Position des Helden zurück
                setHeroPosition(0, 0);
                drawGrid();
                log('Spielstand zurückgesetzt!');
            });
        }
        
        appElement.appendChild(canvas);
        appElement.appendChild(uiContainer);
        
        // Eingaben einrichten
        setupKeyboardControls((rowOffset, colOffset) => {
            const heroPos = getHeroPosition();
            const newRow = heroPos.row + rowOffset;
            const newCol = heroPos.col + colOffset;
            
            // Überprüfe, ob das neue Feld passierbar ist
            if (isPassable(newRow, newCol, grid)) {
                setHeroPosition(newRow, newCol);
                drawGrid();
            }
        });
        
        setupMouseControls(canvas, (row, col) => {
            // Logge den Klick auf das Feld
            log(`Feld geklickt: ${col}, ${row}`);
            
            // Zeige Terrain-Infos an
            const cell = grid[row][col];
            const terrainInfo = document.getElementById('terrain-info-text');
            if (terrainInfo) {
                terrainInfo.textContent = `Terrain: ${cell.type}`;
            }
            
            // Überprüfe, ob das neue Feld passierbar ist
            if (isPassable(row, col, grid)) {
                setHeroPosition(row, col);
                drawGrid();
                
                // Zeige die Einheiten-Details an
                const heroPos = getHeroPosition();
                setUnitDetails(`Held positioniert bei: (${heroPos.col}, ${heroPos.row})`);
            } else {
                log('Dieses Feld ist nicht passierbar!');
            }
        });
    }

    // Wird aufgerufen, wenn die Szene verlassen wird
    onExit() {
        // Verstecke die UI-Panel
        const uiPanel = document.getElementById('ui-panel');
        if (uiPanel) {
            uiPanel.style.display = 'none';
        }
    }
}
// combat.js
// Kampf-Szene mit Grid und Spielfigur

import { initRenderer, drawGrid, getGridData } from '../engine/renderer.js';
import { setupKeyboardControls, setupMouseControls, isPassable } from '../engine/input.js';
import { getHeroPosition, setHeroPosition } from '../entities/hero.js';
import { saveGame, loadGame, resetGame } from '../engine/storage.js';
import { mission01 } from '../data/missions/mission_01.js';

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
        
        // UI-Container erstellen
        const uiContainer = document.createElement('div');
        uiContainer.className = 'ui-container';
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Speichern';
        saveButton.addEventListener('click', () => {
            const heroPos = getHeroPosition();
            saveGame({ player: heroPos });
        });
        
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Zurücksetzen';
        resetButton.addEventListener('click', () => {
            resetGame();
            // Setze die Position des Helden zurück
            setHeroPosition(0, 0);
            drawGrid();
        });
        
        uiContainer.appendChild(saveButton);
        uiContainer.appendChild(resetButton);
        
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
            // Überprüfe, ob das neue Feld passierbar ist
            if (isPassable(row, col, grid)) {
                setHeroPosition(row, col);
                drawGrid();
            }
        });
    }

    // Wird aufgerufen, wenn die Szene verlassen wird
    onExit() {
        // Aufräumen, falls nötig
    }
}
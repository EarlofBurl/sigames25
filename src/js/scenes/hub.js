// hub.js
// Hub-Szene mit Start-Button für Missionen

import { missions } from '../data/missions/index.js';

export class HubScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
    }

    // Wird aufgerufen, wenn die Szene betreten wird
    onEnter() {
        const appElement = document.getElementById('app');
        
        // Hub-UI erstellen
        const hubContainer = document.createElement('div');
        hubContainer.className = 'hub-container';
        
        const title = document.createElement('h1');
        title.textContent = 'SI-Games Runden-Taktik';
        
        const startButton = document.createElement('button');
        startButton.className = 'hub-button';
        startButton.textContent = 'Mission 1 starten';
        startButton.addEventListener('click', () => {
            // Wechsle zur Kampf-Szene
            this.sceneManager.switchTo('COMBAT');
        });
        
        const loadButton = document.createElement('button');
        loadButton.className = 'hub-button';
        loadButton.textContent = 'Spielstand laden';
        loadButton.addEventListener('click', () => {
            // Wechsle zur Kampf-Szene und lade den Spielstand
            this.sceneManager.switchTo('COMBAT');
        });
        
        hubContainer.appendChild(title);
        hubContainer.appendChild(startButton);
        hubContainer.appendChild(loadButton);
        
        // Verstecke die Top-Bar, Info-Panel und Action-Console im Hub
        const topBar = document.getElementById('top-bar');
        const infoPanel = document.getElementById('info-panel');
        const actionConsole = document.getElementById('action-console');
        
        if (topBar) topBar.style.display = 'none';
        if (infoPanel) infoPanel.style.display = 'none';
        if (actionConsole) actionConsole.style.display = 'none';
        
        // Verstecke die UI-Panel im Hub
        const uiPanel = document.getElementById('ui-panel');
        if (uiPanel) {
            uiPanel.style.display = 'none';
        }
        appElement.appendChild(hubContainer);
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
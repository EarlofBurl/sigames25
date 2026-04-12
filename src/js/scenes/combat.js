// combat.js
// Kampf-Szene mit Grid und Spielfigur

import { initRenderer, drawGrid, getGridData, setSelectedTarget, clearSelectedTarget } from '../engine/renderer.js';
import { setupKeyboardControls, setupMouseControls, isPassable, getMovementCost } from '../engine/input.js';
import { getHeroPosition, setHeroPosition, setHeroMp, refillHeroMp, getHeroAttributes } from '../entities/hero.js';
import { getEnemies, initEnemies, _internal as enemyInternal } from '../entities/enemy.js';
import { saveGame, loadGame, resetGame } from '../engine/storage.js';
import { mission01 } from '../data/missions/mission_01.js';
import { initConsole, log, setUnitDetails } from '../engine/console.js';
import { initDialog, playDialog } from '../engine/dialog.js';

let grid;
let selectedUnit = null;
let selectedTarget = null;

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
            setHeroMp(savedData.player.mp);
        } else {
            // Setze die Position des Helden auf den Startpunkt, falls kein Spielstand vorhanden ist
            setHeroPosition(0, 0);
            refillHeroMp();
        }
        
        // Initialisiere den Renderer mit der Mission
        initRenderer(canvas, this.mission);
        
        // Lade das Grid für die Bewegungsprüfung
        const gridData = getGridData();
        grid = gridData.grid;
        
        // Initialisiere die Feinde
        if (this.mission.enemies) {
            initEnemies(this.mission.enemies);
        }
        
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
                const heroAttr = getHeroAttributes();
                saveGame({ player: { ...heroPos, ...heroAttr } });
                log('Spielstand gespeichert!');
            });
        }
        
         if (resetButton) {
             resetButton.addEventListener('click', () => {
                 resetGame();
                 // Setze die Position des Helden zurück
                 setHeroPosition(0, 0);
                 refillHeroMp();
                 drawGrid();
                 log('Spielstand zurückgesetzt!');
             });
         }

         const restartMissionButton = document.getElementById('restart-mission-button');
         if (restartMissionButton) {
              restartMissionButton.addEventListener('click', () => {
                  // Setze die Position des Helden zurück
                  setHeroPosition(0, 0);
                  refillHeroMp();
                  
                  // Initialisiere die Feinde neu
                  if (this.mission.enemies) {
                      initEnemies(this.mission.enemies);
                  }
                  
                  // Setze den Runden-Counter zurück
                  turnCounter = 1;
                  const turnCounterElement = document.getElementById('turn-number');
                  if (turnCounterElement) {
                      turnCounterElement.textContent = turnCounter;
                  }
                  
                  drawGrid();
                  log('Mission neu gestartet!');
              });
         }
        
         // Der "Zug beenden"-Button ist jetzt in der Top-Bar
        const endTurnButton = document.getElementById('end-turn-button');
        let turnCounter = 1;
        const turnCounterElement = document.getElementById('turn-number');
        
        if (endTurnButton) {
            endTurnButton.addEventListener('click', () => {
                refillHeroMp();
                const heroAttr = getHeroAttributes();
                turnCounter++;
                if (turnCounterElement) {
                    turnCounterElement.textContent = turnCounter;
                }
                log(`Runde ${turnCounter} gestartet. Bewegungspunkte wieder aufgefüllt: ${heroAttr.mp}/${heroAttr.maxMp}`);
            });
        }
        
        // Event-Listener für den "Einheit abwählen"-Button
        const deselectButton = document.getElementById('deselect-button');
        if (deselectButton) {
            deselectButton.addEventListener('click', () => {
                selectedUnit = null;
                document.getElementById('unit-name').textContent = '';
                document.getElementById('unit-hp').textContent = '';
                document.getElementById('unit-max-hp').textContent = '';
                document.getElementById('unit-mp').textContent = '';
                document.getElementById('unit-max-mp').textContent = '';
                document.getElementById('unit-attack').textContent = '';
                document.getElementById('unit-defense').textContent = '';
                
                setUnitDetails('Keine Einheit ausgewählt.');
                log('Einheit abgewählt.');
            });
        }
        
        appElement.appendChild(canvas);
        appElement.appendChild(uiContainer);
        
        // Eingaben einrichten
         // Event-Listener für Tastatursteuerung
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case ' ': // Leertaste: Warten
                    event.preventDefault();
                    const heroAttr = getHeroAttributes();
                    log(`Montesquieu wartet. Bewegungspunkte: ${heroAttr.mp}/${heroAttr.maxMp}`);
                    break;
                case 'Enter': // Enter: Runde beenden
                    event.preventDefault();
                    refillHeroMp();
                    const updatedHeroAttr = getHeroAttributes();
                    turnCounter++;
                    if (turnCounterElement) {
                        turnCounterElement.textContent = turnCounter;
                    }
                    log(`Runde ${turnCounter} gestartet. Bewegungspunkte wieder aufgefüllt: ${updatedHeroAttr.mp}/${updatedHeroAttr.maxMp}`);
                    break;
            }
        });
        
        setupKeyboardControls((rowOffset, colOffset) => {
            const heroPos = getHeroPosition();
            const heroAttr = getHeroAttributes();
            const newRow = heroPos.row + rowOffset;
            const newCol = heroPos.col + colOffset;
            
            // Berechne die Bewegungskosten
            const movementCost = getMovementCost(newRow, newCol, grid);
            
            // Überprüfe, ob das neue Feld passierbar ist und genug MP vorhanden sind
            if (isPassable(newRow, newCol, grid) && heroAttr.mp >= movementCost) {
                setHeroPosition(newRow, newCol);
                setHeroMp(heroAttr.mp - movementCost);
                drawGrid();
                
                // Zeige die Einheiten-Details an
                const updatedHeroPos = getHeroPosition();
                const updatedHeroAttr = getHeroAttributes();
                
                // Aktualisiere die Stats in der UI
                document.getElementById('unit-name').textContent = 'Montesquieu';
                document.getElementById('unit-hp').textContent = updatedHeroAttr.hp;
                document.getElementById('unit-max-hp').textContent = updatedHeroAttr.maxHp;
                document.getElementById('unit-mp').textContent = updatedHeroAttr.mp;
                document.getElementById('unit-max-mp').textContent = updatedHeroAttr.maxMp;
                document.getElementById('unit-attack').textContent = updatedHeroAttr.attack;
                document.getElementById('unit-defense').textContent = updatedHeroAttr.defense;
                
                 setUnitDetails(`Held positioniert bei: (${updatedHeroPos.col}, ${updatedHeroPos.row})`);
                 
                 log(`Bewegung kostete ${movementCost} MP. Verbleibende MP: ${updatedHeroAttr.mp}`);
                 
                 // Überprüfe, ob keine MPs mehr übrig sind
                 if (updatedHeroAttr.mp === 0) {
                     log('Keine Einheit mehr zu bewegen. Neue Runde mit (Enter).');
                 }
             } else if (!isPassable(newRow, newCol, grid)) {
                log('Dieses Feld ist nicht passierbar!');
            } else {
                log('Nicht genug Bewegungspunkte!');
            }
        });
        
        // Event-Listener für Doppelklick (als Ersatz für Rechtsklick)
        canvas.addEventListener('dblclick', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            const col = Math.floor(x / 50);
            const row = Math.floor(y / 50);
            
            // Überprüfe, ob die Einheit ausgewählt ist
            const unitName = document.getElementById('unit-name').textContent;
            if (unitName !== 'Montesquieu') {
                log('Wähle zuerst Montesquieu aus!');
                return;
            }
            
            // Überprüfe, ob das neue Feld passierbar ist
            const heroAttr = getHeroAttributes();
            const movementCost = getMovementCost(row, col, grid);
            
            if (isPassable(row, col, grid) && heroAttr.mp >= movementCost) {
                setHeroPosition(row, col);
                setHeroMp(heroAttr.mp - movementCost);
                drawGrid();
                
                // Zeige die Einheiten-Details an
                const heroPos = getHeroPosition();
                const updatedHeroAttr = getHeroAttributes();
                
                // Aktualisiere die Stats in der UI
                document.getElementById('unit-name').textContent = 'Montesquieu';
                document.getElementById('unit-hp').textContent = updatedHeroAttr.hp;
                document.getElementById('unit-max-hp').textContent = updatedHeroAttr.maxHp;
                document.getElementById('unit-mp').textContent = updatedHeroAttr.mp;
                document.getElementById('unit-max-mp').textContent = updatedHeroAttr.maxMp;
                document.getElementById('unit-attack').textContent = updatedHeroAttr.attack;
                document.getElementById('unit-defense').textContent = updatedHeroAttr.defense;
                
                 setUnitDetails(`Held positioniert bei: (${heroPos.col}, ${heroPos.row})`);
                 
                 log(`Bewegung kostete ${movementCost} MP. Verbleibende MP: ${updatedHeroAttr.mp}`);
                 
                 // Überprüfe, ob keine MPs mehr übrig sind
                 if (updatedHeroAttr.mp === 0) {
                     log('Keine Einheit mehr zu bewegen. Neue Runde mit (Enter).');
                 }
            } else if (!isPassable(row, col, grid)) {
                log('Dieses Feld ist nicht passierbar!');
            } else {
                log('Nicht genug Bewegungspunkte!');
            }
        });
        
         // Event-Listener für Links-Klick
         canvas.addEventListener('click', (event) => {
             const rect = canvas.getBoundingClientRect();
             const x = event.clientX - rect.left;
             const y = event.clientY - rect.top;
             
             const col = Math.floor(x / 50);
             const row = Math.floor(y / 50);
             
             // Überprüfe, ob auf die Einheit geklickt wurde
             const heroPos = getHeroPosition();
             if (row === heroPos.row && col === heroPos.col) {
                 // Einheit ausgewählt
                 selectedUnit = 'Montesquieu';
                 selectedTarget = null;
                 const heroAttr = getHeroAttributes();
                 
                 // Aktualisiere die Stats in der UI
                 document.getElementById('unit-name').textContent = 'Montesquieu';
                 document.getElementById('unit-hp').textContent = heroAttr.hp;
                 document.getElementById('unit-max-hp').textContent = heroAttr.maxHp;
                 document.getElementById('unit-mp').textContent = heroAttr.mp;
                 document.getElementById('unit-max-mp').textContent = heroAttr.maxMp;
                 document.getElementById('unit-attack').textContent = heroAttr.attack;
                 document.getElementById('unit-defense').textContent = heroAttr.defense;
                 
                 setUnitDetails('Held ausgewählt: Montesquieu');
                 log('Montesquieu ausgewählt.');
             } else if (selectedUnit && !selectedTarget && (row !== heroPos.row || col !== heroPos.col)) {
                 // Überprüfe, ob auf einen Feind geklickt wurde
                 const enemies = getEnemies();
                 const enemyIndex = enemies.findIndex(enemy => enemy.row === row && enemy.col === col);
                 
                  if (enemyIndex !== -1) {
                      // Überprüfe, ob der Feind orthogonal benachbart ist
                      const heroPos = getHeroPosition();
                      const isAdjacent = Math.abs(row - heroPos.row) + Math.abs(col - heroPos.col) === 1;
                      
                      if (isAdjacent) {
                          // Angriff auslösen
                          const enemy = enemies[enemyIndex];
                          const heroAttr = getHeroAttributes();
                          
                          // Berechne den Schaden
                          const damage = Math.max(1, heroAttr.attack - enemy.defense);
                          
                          // Wende den Schaden an
                          const newHp = enemy.hp - damage;
                          enemyInternal.setEnemyHp(enemyIndex, newHp);
                          
                          // Logge das Kampfergebnis
                          log(`Montesquieu fügt ${enemy.name} ${damage} Schaden zu!`);
                          
                          // Überprüfe, ob der Feind besiegt wurde
                          if (newHp <= 0) {
                              enemyInternal.removeEnemy(enemyIndex);
                              log(`${enemy.name} wurde besiegt!`);
                              drawGrid();
                          }
                          
                            // Beende die Aktion der Einheit
                            setHeroMp(0);
                            document.getElementById('unit-mp').textContent = '0';
                            
                            setUnitDetails(`Angriff auf ${enemy.name} bei: (${col}, ${row})`);
                            
                            // Beende die Runde für die Einheit
                            selectedUnit = null;
                            document.getElementById('unit-name').textContent = '';
                            document.getElementById('unit-hp').textContent = '';
                            document.getElementById('unit-max-hp').textContent = '';
                            document.getElementById('unit-mp').textContent = '';
                            document.getElementById('unit-max-mp').textContent = '';
                            document.getElementById('unit-attack').textContent = '';
                            document.getElementById('unit-defense').textContent = '';
                            
                            // Zurücksetzen
                            selectedTarget = null;
                            clearSelectedTarget();
                            
                            // Überprüfe, ob alle Einheiten keine MPs mehr haben
                            const updatedHeroAttr = getHeroAttributes();
                            if (updatedHeroAttr.mp === 0) {
                                log('Keine Einheit mehr zu bewegen. Neue Runde mit (Enter).');
                            }
                      } else {
                          log('Angriff nur auf orthogonale Felder möglich!');
                      }
                  } else {
                     // Leeres Feld ausgewählt, zeige Pathlinie
                     const heroAttr = getHeroAttributes();
                     const movementCost = getMovementCost(row, col, grid);
                     
                     if (isPassable(row, col, grid) && heroAttr.mp >= movementCost) {
                         selectedTarget = { row, col };
                         setSelectedTarget(selectedTarget);
                         log(`Ziel ausgewählt: (${col}, ${row}). Klicke erneut, um zu bewegen.`);
                     } else if (!isPassable(row, col, grid)) {
                         log('Dieses Feld ist nicht passierbar!');
                     } else {
                         log('Nicht genug Bewegungspunkte!');
                     }
                 }
             } else if (selectedUnit && selectedTarget && selectedTarget.row === row && selectedTarget.col === col) {
                 // Bewegung auslösen
                 const heroPos = getHeroPosition();
                 const heroAttr = getHeroAttributes();
                 
                 // Berechne die Manhattan-Distanz
                 const dRow = Math.abs(selectedTarget.row - heroPos.row);
                 const dCol = Math.abs(selectedTarget.col - heroPos.col);
                 const manhattanDistance = dRow + dCol;
                 
                 // Berechne die Bewegungskosten
                 let totalMovementCost = 0;
                 for (let i = 1; i <= manhattanDistance; i++) {
                     const stepRow = heroPos.row + Math.sign(selectedTarget.row - heroPos.row) * Math.min(i, dRow);
                     const stepCol = heroPos.col + Math.sign(selectedTarget.col - heroPos.col) * Math.min(i, dCol);
                     totalMovementCost += getMovementCost(stepRow, stepCol, grid);
                 }
                 
                 // Überprüfe, ob genug MP vorhanden sind
                 if (heroAttr.mp >= totalMovementCost) {
                     setHeroPosition(selectedTarget.row, selectedTarget.col);
                     setHeroMp(heroAttr.mp - totalMovementCost);
                     drawGrid();
                     
                     // Aktualisiere die Stats in der UI
                     const updatedHeroAttr = getHeroAttributes();
                     document.getElementById('unit-mp').textContent = updatedHeroAttr.mp;
                     
                      setUnitDetails(`Held positioniert bei: (${selectedTarget.col}, ${selectedTarget.row})`);
                      log(`Bewegung kostete ${totalMovementCost} MP. Verbleibende MP: ${updatedHeroAttr.mp}`);
                      
                      // Überprüfe, ob keine MPs mehr übrig sind
                      if (updatedHeroAttr.mp === 0) {
                          log('Keine Einheit mehr zu bewegen. Neue Runde mit (Enter).');
                      }
                  } else {
                     log('Nicht genug Bewegungspunkte für die gesamte Strecke!');
                 }
                 
                 // Zurücksetzen
                 selectedTarget = null;
                 clearSelectedTarget();
             } else if (selectedUnit) {
                 // Bewegung abbrechen
                 selectedTarget = null;
                 clearSelectedTarget();
                 log('Bewegung abgebrochen.');
             } else {
                 // Einheit abgewählt
                 selectedUnit = null;
                 document.getElementById('unit-name').textContent = '';
                 document.getElementById('unit-hp').textContent = '';
                 document.getElementById('unit-max-hp').textContent = '';
                 document.getElementById('unit-mp').textContent = '';
                 document.getElementById('unit-max-mp').textContent = '';
                 document.getElementById('unit-attack').textContent = '';
                 document.getElementById('unit-defense').textContent = '';
                 
                 setUnitDetails('Keine Einheit ausgewählt.');
                 log('Einheit abgewählt.');
             }
             
             // Zeige Terrain-Infos an
             const cell = grid[row][col];
             const terrainInfo = document.getElementById('terrain-info-text');
             if (terrainInfo) {
                 terrainInfo.textContent = `Terrain: ${cell.type}`;
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
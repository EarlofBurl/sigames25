// main.js
// Einstiegspunkt des Spiels

import { SceneManager } from './engine/scene-manager.js';
import { HubScene } from './scenes/hub.js';

// Initialisiere den SceneManager
const sceneManager = new SceneManager();

// Füge die Hub-Szene hinzu
sceneManager.addScene('HUB', new HubScene(sceneManager));

// Füge die Combat-Szene hinzu
import { CombatScene } from './scenes/combat.js';
import { mission01 } from './data/missions/mission_01.js';
sceneManager.addScene('COMBAT', new CombatScene(sceneManager, mission01));

// Starte mit der Hub-Szene
sceneManager.switchTo('HUB');
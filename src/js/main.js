// main.js
// Einstiegspunkt des Spiels – Phaser 3

import Phaser from 'phaser';
import { gameConfig } from './config.js';
import { HubScene } from './scenes/hub.js';
import { CombatScene } from './scenes/combat.js';
import { mission01 } from './data/missions/mission_01.js';

// Szenen registrieren
gameConfig.scene = [HubScene, CombatScene];

// Mission-Daten global verfügbar machen
const game = new Phaser.Game(gameConfig);
game.registry.set('mission', mission01);

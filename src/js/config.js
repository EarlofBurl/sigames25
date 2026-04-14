// config.js
// Phaser-Spielkonfiguration

import Phaser from 'phaser';

// Grid-Konstanten (aus renderer.js übernommen)
export const GRID_SIZE = 10;
export const CELL_SIZE = 50;
export const GAME_WIDTH = GRID_SIZE * CELL_SIZE;  // 500
export const GAME_HEIGHT = GRID_SIZE * CELL_SIZE; // 500

// Phaser-Konfiguration
export const gameConfig = {
    type: Phaser.CANVAS,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'app',
    pixelArt: true,
    backgroundColor: '#000000',
    roundPixels: true,
    antialias: false,
    scene: [] // Szenen werden in main.js hinzugefügt
};

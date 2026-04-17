// config.js
// Phaser-Spielkonfiguration

import Phaser from 'phaser';

export const CELL_SIZE = 50;
export const GAME_WIDTH = 30 * CELL_SIZE;  // 1500
export const GAME_HEIGHT = 20 * CELL_SIZE; // 1000
export const GRID_COLS = 30;
export const GRID_ROWS = 20;

// Phaser-Konfiguration
export const gameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'app',
    pixelArt: true,
    backgroundColor: '#000000',
    roundPixels: true,
    antialias: false,
    scene: [] // Szenen werden in main.js hinzugefügt
};

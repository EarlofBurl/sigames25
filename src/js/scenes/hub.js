// hub.js
// Hub-Szene mit Start-Button für Missionen

import Phaser from 'phaser';

export class HubScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HubScene' });
    }

    create() {
        // Verstecke die DOM-UI-Elemente (Top-Bar, Info-Panel, Console)
        document.getElementById('top-bar').style.display = 'none';
        document.getElementById('info-panel').style.display = 'none';
        document.getElementById('action-console').style.display = 'none';

        // Entferne eventuell verbliebenen Vanilla-Canvas
        const oldCanvas = document.getElementById('gameCanvas');
        if (oldCanvas) oldCanvas.remove();

        const cx = this.cameras.main.width / 2;

        // Titel
        this.add.text(cx, 120, 'SI-Games\nRunden-Taktik', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // "Mission 1 starten"-Button
        this.createButton(cx, 280, 'Mission 1 starten', () => {
            this.scene.start('CombatScene');
        });

        // "Spielstand laden"-Button
        this.createButton(cx, 340, 'Spielstand laden', () => {
            this.scene.start('CombatScene');
        });
    }

    createButton(x, y, label, callback) {
        const btn = this.add.text(x, y, label, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setBackgroundColor('#45a049'));
        btn.on('pointerout', () => btn.setBackgroundColor('#4CAF50'));
        btn.on('pointerdown', callback);

        return btn;
    }
}

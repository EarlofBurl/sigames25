// title.js
// Titel-Screen

export class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = '';

        const screen = document.createElement('div');
        screen.id = 'title-screen';

        const title = document.createElement('h1');
        title.textContent = 'SI-Games 25';
        screen.appendChild(title);

        const subtitle = document.createElement('h2');
        subtitle.textContent = 'Runden-Taktik';
        screen.appendChild(subtitle);

        const desc = document.createElement('div');
        desc.className = 'subtitle';
        desc.innerHTML = 'Ein Fire Emblem / Advance Wars Style Spiel<br>zur Feier des 25-jährigen Jubiläums<br>des si-games.com Forums';
        screen.appendChild(desc);

        const startBtn = document.createElement('button');
        startBtn.className = 'hub-btn';
        startBtn.style.cssText = 'padding: 15px 50px; font-size: 20px;';
        startBtn.textContent = 'Start';
        startBtn.onclick = () => this.scene.start('HubScene');
        screen.appendChild(startBtn);

        app.appendChild(screen);
    }
}

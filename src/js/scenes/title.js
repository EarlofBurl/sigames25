// title.js
// Titel-Screen

import { loadSaveSlots, loadFromSlot, formatPlayTime, formatTimestamp, getMissionDisplayName } from '../engine/storage.js';

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

        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'display:flex;flex-direction:column;gap:15px;align-items:center;';

        const startBtn = document.createElement('button');
        startBtn.className = 'hub-btn';
        startBtn.style.cssText = 'padding: 15px 50px; font-size: 20px;';
        startBtn.textContent = '🎮 Neues Spiel';
        startBtn.onclick = () => this.startNewGame();
        btnContainer.appendChild(startBtn);

        const loadBtn = document.createElement('button');
        loadBtn.className = 'hub-btn hub-btn-secondary';
        loadBtn.style.cssText = 'padding: 12px 40px; font-size: 16px;';
        loadBtn.textContent = '💾 Spielstand laden';
        loadBtn.onclick = () => this.showLoadMenu();
        btnContainer.appendChild(loadBtn);

        screen.appendChild(btnContainer);
        app.appendChild(screen);
    }

    startNewGame() {
        // Startet ein neues Spiel (resetet Global State)
        this.scene.start('HubScene');
    }

    showLoadMenu() {
        const slots = loadSaveSlots();

        const overlay = document.createElement('div');
        overlay.id = 'load-menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        const panel = document.createElement('div');
        panel.style.cssText = `
            background: #1a1a1a;
            border: 2px solid #555;
            border-radius: 10px;
            padding: 30px;
            min-width: 450px;
            max-width: 600px;
        `;

        const header = document.createElement('h3');
        header.textContent = '💾 Spielstand laden';
        header.style.cssText = 'color: #ffd700; margin: 0 0 20px 0; text-align: center;';
        panel.appendChild(header);

        const slotsContainer = document.createElement('div');
        slotsContainer.style.cssText = 'display:flex;flex-direction:column;gap:10px;margin-bottom:20px;';

        slots.forEach(slot => {
            const slotCard = document.createElement('div');
            slotCard.style.cssText = `
                background: ${slot.empty ? '#252525' : '#2a2a2a'};
                border: 2px solid ${slot.empty ? '#444' : '#666'};
                border-radius: 8px;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.2s;
                cursor: ${slot.empty ? 'default' : 'pointer'};
            `;

            if (!slot.empty) {
                slotCard.onmouseover = () => {
                    slotCard.style.borderColor = '#ffd700';
                    slotCard.style.background = '#333';
                };
                slotCard.onmouseout = () => {
                    slotCard.style.borderColor = '#666';
                    slotCard.style.background = '#2a2a2a';
                };
                slotCard.onclick = () => {
                    loadFromSlot(slot.slot);
                    overlay.remove();
                    this.scene.start('HubScene');
                };
            }

            // Slot-Info links
            const infoDiv = document.createElement('div');
            if (slot.empty) {
                infoDiv.innerHTML = `
                    <div style="color: #666; font-size: 16px; font-weight: bold;">Slot ${slot.slot}</div>
                    <div style="color: #444; font-size: 12px;">Leer</div>
                `;
            } else {
                infoDiv.innerHTML = `
                    <div style="color: #ffd700; font-size: 16px; font-weight: bold;">Slot ${slot.slot}</div>
                    <div style="color: #aaa; font-size: 12px; margin-top: 4px;">
                        📅 ${formatTimestamp(slot.timestamp)} | ⏱️ ${formatPlayTime(slot.playTime || 0)}
                    </div>
                    <div style="color: #888; font-size: 11px; margin-top: 2px;">
                        ${getMissionDisplayName(slot.currentMission)} | ⭐ ${slot.reputation || 0} | 💎 ${slot.orbs || 0}
                    </div>
                `;
            }
            slotCard.appendChild(infoDiv);

            // Status-Indicator rechts
            const statusDiv = document.createElement('div');
            statusDiv.style.cssText = 'font-size: 24px;';
            statusDiv.textContent = slot.empty ? '⚪' : '💾';
            slotCard.appendChild(statusDiv);

            slotsContainer.appendChild(slotCard);
        });

        panel.appendChild(slotsContainer);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'hub-btn hub-btn-secondary';
        closeBtn.style.cssText = 'width: 100%;';
        closeBtn.textContent = 'Schließen';
        closeBtn.onclick = () => overlay.remove();
        panel.appendChild(closeBtn);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Schließen bei Klick auf Overlay-Hintergrund
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
    }
}

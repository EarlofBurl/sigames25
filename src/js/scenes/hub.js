// hub.js
// Hub-Szene mit Menü-Hub

import { heroes } from '../data/characters.js';
import { equipment, getLevelUpCost, getStatsAtLevel } from '../data/equipment.js';
import { loadGlobalState, loadHubData, saveHubData } from '../engine/storage.js';

export class HubScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HubScene' });
        this.hubData = null;
        this.orbDisplay = null;
        this.repDisplay = null;
        this.currentView = 'default';
    }

    create() {
        this.hubData = loadHubData();
        const globalState = loadGlobalState();

        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = '';

        const screen = document.createElement('div');
        screen.id = 'hub-screen';

        const header = document.createElement('div');
        header.id = 'hub-header';
        header.innerHTML = `
            <span>Augsburg</span>
            <span class="orbs">💎 <span id="hub-orbs">${globalState.orbs || 0}</span> Orbs</span>
            <span class="rep">⭐ <span id="hub-rep">${globalState.reputation || 0}</span> Reputation</span>
        `;
        screen.appendChild(header);
        this.orbDisplay = header.querySelector('#hub-orbs');
        this.repDisplay = header.querySelector('#hub-rep');

        const main = document.createElement('div');
        main.id = 'hub-main';

        const buttons = document.createElement('div');
        buttons.id = 'hub-buttons';

        const btn1 = document.createElement('button');
        btn1.className = 'hub-btn';
        btn1.textContent = '🎯 Mission starten';
        btn1.onclick = () => this.showMissionMenu();
        buttons.appendChild(btn1);

        const btn2 = document.createElement('button');
        btn2.className = 'hub-btn hub-btn-secondary';
        btn2.textContent = '⚔️ Konventsküche';
        btn2.onclick = () => this.showEquipmentView();
        buttons.appendChild(btn2);

        const btn3 = document.createElement('button');
        btn3.className = 'hub-btn hub-btn-secondary';
        btn3.textContent = '🏅 Ordenverleihung';
        btn3.onclick = () => this.showLevelUpView();
        buttons.appendChild(btn3);

        const backBtn = document.createElement('button');
        backBtn.className = 'hub-btn hub-btn-secondary';
        backBtn.id = 'hub-back-btn';
        backBtn.textContent = '← Zurück';
        backBtn.style.display = 'none';
        backBtn.onclick = () => this.showDefaultView();
        buttons.appendChild(backBtn);

        main.appendChild(buttons);

        this.contentArea = document.createElement('div');
        this.contentArea.id = 'hub-content-area';
        this.contentArea.style.cssText = 'flex:1;display:flex;justify-content:center;align-items:center;';
        this.contentArea.innerHTML = '<div class="placeholder">👑<br>Helden-Portrait<br>coming soon</div>';
        main.appendChild(this.contentArea);

        this.btnMission = btn1;
        this.btnEquipment = btn2;
        this.btnLevelUp = btn3;

        screen.appendChild(main);
        app.appendChild(screen);
    }

    refreshHeader() {
        const state = loadGlobalState();
        if (this.orbDisplay) this.orbDisplay.textContent = state.orbs;
        if (this.repDisplay) this.repDisplay.textContent = state.reputation;
    }

    highlightButton(activeBtn) {
        [this.btnMission, this.btnEquipment, this.btnLevelUp].forEach(b => {
            if (b) b.classList.remove('hub-btn-active');
        });
        if (activeBtn) activeBtn.classList.add('hub-btn-active');
    }

    showDefaultView() {
        this.currentView = 'default';
        this.contentArea.style.cssText = 'flex:1;display:flex;justify-content:center;align-items:center;';
        this.contentArea.innerHTML = '<div class="placeholder">👑<br>Helden-Portrait<br>coming soon</div>';
        const backBtn = document.getElementById('hub-back-btn');
        if (backBtn) backBtn.style.display = 'none';
        this.highlightButton(null);
    }

    showMissionMenu() {
        const panel = document.createElement('div');
        panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#222;border:2px solid #555;border-radius:10px;padding:30px;text-align:center;z-index:1000;min-width:300px;';
        panel.innerHTML = `
            <h3 style="color:#ffd700;margin:0 0 15px 0;">Mission 1</h3>
            <p style="color:#ccc;margin:0 0 20px 0;">Das 25-jährige Jubiläum</p>
            <div style="display:flex;gap:10px;justify-content:center;">
                <button id="start-mission-btn" class="hub-btn">Starten</button>
                <button id="close-panel-btn" class="hub-btn hub-btn-secondary">Schließen</button>
            </div>
        `;
        document.body.appendChild(panel);

        panel.querySelector('#start-mission-btn').onclick = () => {
            panel.remove();
            this.scene.start('CombatScene');
        };
        panel.querySelector('#close-panel-btn').onclick = () => panel.remove();
    }

    showEquipmentView() {
        this.currentView = 'equipment';
        const backBtn = document.getElementById('hub-back-btn');
        if (backBtn) backBtn.style.display = 'block';
        this.highlightButton(this.btnEquipment);

        this.hubData = loadHubData();
        const globalState = loadGlobalState();

        this.contentArea.style.cssText = 'flex:1;display:flex;';
        this.contentArea.innerHTML = `
            <div style="width:280px;overflow-y:auto;padding-right:15px;">
                <h3 style="color:#ffd700;margin:0 0 10px 0;">⚔️ Ausrüstung</h3>
                <div id="equipment-list"></div>
            </div>
            <div style="flex:1;background:#333;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#555;font-size:48px;">
                🍖
            </div>
        `;

        const list = this.contentArea.querySelector('#equipment-list');

        Object.keys(heroes).forEach(charId => {
            const hero = heroes[charId];
            const heroEquip = this.hubData.heroEquipment[charId] || { weaponStage: 0, armorStage: 0 };
            const weaponStage = heroEquip.weaponStage || 0;
            const armorStage = heroEquip.armorStage || 0;
            const weapon = equipment[charId].weapons[weaponStage];
            const armor = equipment[charId].armors[armorStage];

            const card = document.createElement('div');
            card.style.cssText = 'background:#2a2a2a;border:1px solid #444;padding:10px;margin-bottom:8px;border-radius:5px;';
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                    <span style="font-size:14px;display:flex;align-items:center;gap:8px;">
                        ${hero.portrait && hero.portrait.includes('/') ? `<img src="${hero.portrait}" style="width:24px;height:24px;object-fit:cover;border-radius:3px;" />` : hero.portrait}
                        ${hero.name}
                    </span>
                </div>
                <div style="color:#888;font-size:11px;margin-bottom:5px;">
                    Waffe: ${weapon.name} (+${weapon.atkBonus} Atk)<br>
                    Rüstung: ${armor.name} (+${armor.defBonus} Def, +${armor.hpBonus} HP)
                </div>
                <div style="display:flex;gap:5px;">
                    ${this.renderWeaponButton(charId, weaponStage, globalState.orbs)}
                    ${this.renderArmorButton(charId, armorStage, globalState.orbs)}
                </div>
            `;
            list.appendChild(card);
        });
    }

    renderWeaponButton(charId, currentStage, orbs) {
        const next = equipment[charId].weapons[currentStage + 1];
        if (!next || next.orbCost === 0) return '<span style="color:#666;font-size:12px;">Waffe: max</span>';
        const disabled = orbs < next.orbCost ? 'disabled style="opacity:0.5"' : '';
        return `<button class="spell-btn" ${disabled} onclick="window.hubUpgradeWeapon('${charId}')">Waffe: ${next.name} (💎${next.orbCost})</button>`;
    }

    renderArmorButton(charId, currentStage, orbs) {
        const next = equipment[charId].armors[currentStage + 1];
        if (!next || next.orbCost === 0) return '<span style="color:#666;font-size:12px;">Rüstung: max</span>';
        const disabled = orbs < next.orbCost ? 'disabled style="opacity:0.5"' : '';
        return `<button class="spell-btn" ${disabled} onclick="window.hubUpgradeArmor('${charId}')">Rüstung: ${next.name} (💎${next.orbCost})</button>`;
    }

    showLevelUpView() {
        this.currentView = 'levelup';
        const backBtn = document.getElementById('hub-back-btn');
        if (backBtn) backBtn.style.display = 'block';
        this.highlightButton(this.btnLevelUp);

        this.hubData = loadHubData();
        const globalState = loadGlobalState();

        this.contentArea.style.cssText = 'flex:1;display:flex;';
        this.contentArea.innerHTML = `
            <div style="width:280px;overflow-y:auto;padding-right:15px;">
                <h3 style="color:#ffd700;margin:0 0 10px 0;">🏅 Level-Up</h3>
                <div id="levelup-list"></div>
            </div>
            <div style="flex:1;background:#333;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#555;font-size:48px;">
                🎖️
            </div>
        `;

        const list = this.contentArea.querySelector('#levelup-list');

        Object.keys(heroes).forEach(charId => {
            const hero = heroes[charId];
            const heroLevel = this.hubData.heroLevels[charId] || 1;
            const levelUpCost = getLevelUpCost(heroLevel + 1);
            const statsNow = getStatsAtLevel(charId, heroLevel, hero);
            const statsNext = getStatsAtLevel(charId, heroLevel + 1, hero);

            const card = document.createElement('div');
            card.style.cssText = 'background:#2a2a2a;border:1px solid #444;padding:10px;margin-bottom:8px;border-radius:5px;';
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
                    <span style="font-size:14px;display:flex;align-items:center;gap:8px;">
                        ${hero.portrait && hero.portrait.includes('/') ? `<img src="${hero.portrait}" style="width:24px;height:24px;object-fit:cover;border-radius:3px;" />` : hero.portrait}
                        ${hero.name}
                    </span>
                </div>
                <div style="color:#888;font-size:11px;margin-bottom:5px;">
                    Lv ${heroLevel} → ${heroLevel + 1} | HP: ${statsNow.hp}→${statsNext.hp} ATK: ${statsNow.atk}→${statsNext.atk} DEF: ${statsNow.def}→${statsNext.def}
                </div>
                <button class="cmd-btn" onclick="window.hubLevelUp('${charId}')" ${globalState.reputation < levelUpCost ? 'disabled style="opacity:0.5"' : ''}>
                    ⭐ Level ${heroLevel + 1} (${levelUpCost})
                </button>
            `;
            list.appendChild(card);
        });

        window.hubLevelUp = (charId) => {
            const heroLevel = this.hubData.heroLevels[charId] || 1;
            const levelUpCost = getLevelUpCost(heroLevel + 1);
            const state = loadGlobalState();
            if (state.reputation >= levelUpCost) {
                state.reputation -= levelUpCost;
                localStorage.setItem('siGamesGlobal', JSON.stringify(state));
                this.hubData.heroLevels[charId] = heroLevel + 1;
                saveHubData(this.hubData);
                this.refreshHeader();
                this.showLevelUpView();
            }
        };

        window.hubUpgradeWeapon = (charId) => {
            const heroEquip = this.hubData.heroEquipment[charId] || { weaponStage: 0, armorStage: 0 };
            const weaponStage = heroEquip.weaponStage || 0;
            const next = equipment[charId].weapons[weaponStage + 1];
            if (!next || next.orbCost === 0) return;
            const state = loadGlobalState();
            if (state.orbs >= next.orbCost) {
                state.orbs -= next.orbCost;
                localStorage.setItem('siGamesGlobal', JSON.stringify(state));
                this.hubData.heroEquipment[charId] = this.hubData.heroEquipment[charId] || {};
                this.hubData.heroEquipment[charId].weaponStage = weaponStage + 1;
                saveHubData(this.hubData);
                this.refreshHeader();
                this.showEquipmentView();
            }
        };

        window.hubUpgradeArmor = (charId) => {
            const heroEquip = this.hubData.heroEquipment[charId] || { weaponStage: 0, armorStage: 0 };
            const armorStage = heroEquip.armorStage || 0;
            const next = equipment[charId].armors[armorStage + 1];
            if (!next || next.orbCost === 0) return;
            const state = loadGlobalState();
            if (state.orbs >= next.orbCost) {
                state.orbs -= next.orbCost;
                localStorage.setItem('siGamesGlobal', JSON.stringify(state));
                this.hubData.heroEquipment[charId] = this.hubData.heroEquipment[charId] || {};
                this.hubData.heroEquipment[charId].armorStage = armorStage + 1;
                saveHubData(this.hubData);
                this.refreshHeader();
                this.showEquipmentView();
            }
        };
    }

    shutdown() {
        const screen = document.getElementById('hub-screen');
        if (screen) screen.remove();
        window.hubLevelUp = null;
        window.hubUpgradeWeapon = null;
        window.hubUpgradeArmor = null;
    }
}

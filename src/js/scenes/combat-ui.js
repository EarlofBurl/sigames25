import { getPlayerUnits, getEnemyUnits } from '../entities/units.js';
import { log } from '../engine/console.js';

let onSpellCast = null;
let onSpellSelect = null;
let container = null;

// DOM-Referenzen (intern)
let titleEl, typeEl, hpEl, maxHpEl, mpEl, maxMpEl, attackEl, defenseEl, spellsEl;
let terrainInfoText, terrainStatsEl;

export function setSpellCastCallback(callback) { onSpellCast = callback; }
export function setSpellSelectCallback(callback) { onSpellSelect = callback; }

export function initCombatUI(parent) {
    container = document.createElement('div');
    container.id = 'info-panel';
    container.style.cssText = 'width:250px;background:#eee;padding:10px;display:flex;flex-direction:column;gap:10px;';

    // Einheiten-Details
    const unitDetails = document.createElement('div');
    unitDetails.id = 'unit-details';
    unitDetails.style.cssText = 'background:#fff;border:1px solid #ccc;padding:10px;border-radius:5px;';

    const unitTitle = document.createElement('h3');
    unitTitle.id = 'unit-title';
    unitTitle.textContent = 'Einheiten-Details';
    unitDetails.appendChild(unitTitle);

    const portrait = document.createElement('div');
    portrait.id = 'unit-portrait';
    portrait.style.cssText = 'width:100px;height:100px;border:1px solid #ccc;margin:0 auto 10px;background:#eee;';
    unitDetails.appendChild(portrait);

    const statsDiv = document.createElement('div');
    statsDiv.id = 'unit-stats';
    statsDiv.style.cssText = 'margin-top:10px;font-size:14px;';

    function addStat(label, id) {
        const p = document.createElement('p');
        p.innerHTML = `${label}: <span id="${id}"></span>`;
        return p;
    }

    statsDiv.appendChild(addStat('Typ', 'ui-unit-type'));
    const hpP = document.createElement('p');
    hpP.innerHTML = 'HP: <span id="ui-unit-hp"></span>/<span id="ui-unit-max-hp"></span>';
    statsDiv.appendChild(hpP);
    const mpP = document.createElement('p');
    mpP.innerHTML = 'MP: <span id="ui-unit-mp"></span>/<span id="ui-unit-max-mp"></span>';
    statsDiv.appendChild(mpP);
    statsDiv.appendChild(addStat('Angriff', 'ui-unit-attack'));
    statsDiv.appendChild(addStat('Verteidigung', 'ui-unit-defense'));
    unitDetails.appendChild(statsDiv);

    spellsEl = document.createElement('div');
    spellsEl.id = 'ui-unit-spells';
    unitDetails.appendChild(spellsEl);

    const commandsDiv = document.createElement('div');
    commandsDiv.id = 'unit-commands';
    commandsDiv.style.cssText = 'display:flex;flex-direction:column;gap:5px;margin-top:10px;';

    const deselectBtn = document.createElement('button');
    deselectBtn.className = 'command-button';
    deselectBtn.textContent = 'Einheit abwählen';
    commandsDiv.appendChild(deselectBtn);

    const waitBtn = document.createElement('button');
    waitBtn.className = 'command-button';
    waitBtn.textContent = 'Warten';
    commandsDiv.appendChild(waitBtn);

    unitDetails.appendChild(commandsDiv);
    container.appendChild(unitDetails);

    // Terrain-Infos
    const terrainInfo = document.createElement('div');
    terrainInfo.id = 'terrain-info';
    terrainInfo.style.cssText = 'background:#fff;border:1px solid #ccc;padding:10px;border-radius:5px;';

    const terrainTitle = document.createElement('h3');
    terrainTitle.textContent = 'Terrain-Infos';
    terrainInfo.appendChild(terrainTitle);

    const terrainImage = document.createElement('div');
    terrainImage.id = 'terrain-image';
    terrainImage.style.cssText = 'width:50px;height:50px;border:1px solid #ccc;margin:0 auto 10px;background:#eee;';
    terrainInfo.appendChild(terrainImage);

    terrainStatsEl = document.createElement('div');
    terrainStatsEl.id = 'terrain-stats';
    terrainStatsEl.style.cssText = 'display:flex;flex-direction:column;gap:2px;font-size:14px;margin-top:5px;';

    terrainInfoText = document.createElement('p');
    terrainInfoText.id = 'terrain-info-text';
    terrainInfoText.textContent = 'Klicke auf ein Feld, um Terrain-Infos anzuzeigen.';
    terrainStatsEl.appendChild(terrainInfoText);
    terrainInfo.appendChild(terrainStatsEl);
    container.appendChild(terrainInfo);

    // Nächste Einheit Button
    const nextBtn = document.createElement('button');
    nextBtn.id = 'next-unit-button';
    nextBtn.className = 'command-button';
    nextBtn.textContent = 'Nächste Einheit';
    container.appendChild(nextBtn);

    if (parent) parent.appendChild(container);
    else document.body.appendChild(container);

    // Referenzen holen
    titleEl = document.getElementById('unit-title');
    typeEl = document.getElementById('ui-unit-type');
    hpEl = document.getElementById('ui-unit-hp');
    maxHpEl = document.getElementById('ui-unit-max-hp');
    mpEl = document.getElementById('ui-unit-mp');
    maxMpEl = document.getElementById('ui-unit-max-mp');
    attackEl = document.getElementById('ui-unit-attack');
    defenseEl = document.getElementById('ui-unit-defense');
}

function calculateEffectiveStats(unit) {
    let attack = unit.attack || 5;
    let defense = unit.defense || 2;

    if (unit.activeEffects) {
        unit.activeEffects.forEach(effect => {
            if (effect.effect === 'buff_attack') attack += effect.value;
            if (effect.effect === 'debuff_attack') attack -= effect.value;
            if (effect.effect === 'buff_defense') defense += effect.value;
            if (effect.effect === 'debuff_defense') defense -= effect.value;
        });
    }

    return { attack, defense };
}

export function clearUnitPanel() {
    if (titleEl) titleEl.textContent = 'Einheiten-Details';
    if (typeEl) typeEl.textContent = '';
    if (hpEl) hpEl.textContent = '';
    if (maxHpEl) maxHpEl.textContent = '';
    if (mpEl) mpEl.textContent = '';
    if (maxMpEl) maxMpEl.textContent = '';
    if (attackEl) attackEl.textContent = '';
    if (defenseEl) defenseEl.textContent = '';
    if (spellsEl) spellsEl.innerHTML = '';
}

export function fillUnitPanel(unit) {
    const { attack, defense } = calculateEffectiveStats(unit);

    if (titleEl) titleEl.textContent = unit.name;
    if (typeEl) typeEl.textContent = unit.type || ((unit.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf');
    if (hpEl) hpEl.textContent = unit.hp;
    if (maxHpEl) maxHpEl.textContent = unit.maxHp;
    if (mpEl) mpEl.textContent = unit.mp;
    if (maxMpEl) maxMpEl.textContent = unit.maxMp;
    if (attackEl) attackEl.textContent = attack;
    if (defenseEl) defenseEl.textContent = defense;

    if (spellsEl) {
        spellsEl.innerHTML = '';

        if (unit.spells && unit.spells.length > 0) {
            const spellsTitle = document.createElement('h4');
            spellsTitle.textContent = 'Zauber';
            spellsTitle.style.margin = '10px 0 5px 0';
            spellsEl.appendChild(spellsTitle);

            unit.spells.forEach((spell, index) => {
                const spellButton = document.createElement('button');
                spellButton.className = 'spell-button';
                spellButton.textContent = `${spell.name} (${spell.mpCost} MP)`;
                spellButton.title = spell.target === 'ally' ? 'Verbündeter stärken' : 'Feind schwächen';

                if (unit.mp < spell.mpCost) {
                    spellButton.disabled = true;
                    spellButton.style.opacity = '0.5';
                }

                spellButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (onSpellSelect) onSpellSelect(unit, spell);
                });

                spellsEl.appendChild(spellButton);
            });
        }
    }
}

export function checkAllUnitsExhausted() {
    const playerUnits = getPlayerUnits();
    const allExhausted = playerUnits.every(unit => unit.mp === 0);
    if (allExhausted) {
        log('Keine Einheit mehr zu bewegen. Neue Runde mit (Enter).', 'error');
    }
}

export function getNextUnitButton() {
    return document.getElementById('next-unit-button');
}

export function updateTerrainInfo(cell, terrainTypes) {
    if (!terrainInfoText) return;
    terrainInfoText.textContent = `Terrain: ${cell.type}`;
    if (terrainStatsEl && terrainTypes[cell.type]) {
        const t = terrainTypes[cell.type];
        const defSign = t.defenseBonus >= 0 ? '+' : '';
        terrainStatsEl.innerHTML = `<span>MP: ${t.movementCost}</span> <span>Ang.: ${defSign}${t.defenseBonus}</span> <span>Def.: ${defSign}${t.defenseBonus}</span>`;
    }
}

export function destroyCombatUI() {
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
    container = null;
    titleEl = typeEl = hpEl = maxHpEl = mpEl = maxMpEl = attackEl = defenseEl = spellsEl = null;
    terrainInfoText = terrainStatsEl = null;
}

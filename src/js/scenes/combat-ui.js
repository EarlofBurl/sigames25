// combat-ui.js
// Combat UI Module - Kompakte Einheitendetails

import { getPlayerUnits, getEnemyUnits, getUnitTurnState, getUnitHasCast } from '../entities/units.js';
import { log } from '../engine/console.js';

const WEAPON_NAMES = { sword: 'Schwert', axe: 'Axt', lance: 'Lanze', bow: 'Bogen', magic: 'Magie' };

const PORTRAIT_KEYS = {
    'assets/portraits/zarewitsch/portrait_zarewitsch_neutral.png': 'portrait_zarewitsch',
    'assets/portraits/carl_the_great/portrait_carl_the_great_neutral.png': 'portrait_carl',
    'assets/portraits/enemies/portrait_enemy_TikTok.png': 'portrait_tiktok',
    'assets/portraits/enemies/portrait_enemy_Insta.png': 'portrait_insta',
    'assets/portraits/enemies/portrait_enemy_facebook.png': 'portrait_facebook'
};

function getPortraitKey(portraitPath) {
    return PORTRAIT_KEYS[portraitPath] || null;
}

function portraitHtml(portraitPath, size = 42, extraStyle = '') {
    if (portraitPath && portraitPath.includes('/')) {
        return `<img src="${portraitPath}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:4px;${extraStyle}" />`;
    }
    return `<div style="font-size:${size}px;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;">${portraitPath || '?'}</div>`;
}

let onSpellCast = null;
let onSpellSelect = null;

// DOM refs
let container = null;
let terrainContainer = null;
let previewContainer = null;

let titleEl, portraitEl, typeEl, hpEl, maxHpEl, mpEl, maxMpEl, attackEl, defenseEl, weaponEl, manaEl, maxManaEl, spellsEl;
let terrainNameEl, terrainStatsEl;
let previewTitleEl, previewBodyEl, previewResultEl, previewVsEl;
let previewLeftEl, previewRightEl;
let actionPanelEl;

export function setSpellCastCallback(callback) { onSpellCast = callback; }
export function setSpellSelectCallback(callback) { onSpellSelect = callback; }

// ─── Unit Panel ───

export function initCombatUI(unitPanelParent) {
    container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

    // Unit Card
    const unitCard = document.createElement('div');
    unitCard.className = 'unit-card';

    const header = document.createElement('div');
    header.className = 'unit-card-header';

    portraitEl = document.createElement('div');
    portraitEl.className = 'unit-portrait';
    portraitEl.textContent = '?';
    header.appendChild(portraitEl);

    const headerText = document.createElement('div');
    titleEl = document.createElement('div');
    titleEl.className = 'unit-name';
    titleEl.textContent = 'Keine Einheit';
    typeEl = document.createElement('div');
    typeEl.className = 'unit-type';
    headerText.appendChild(titleEl);
    headerText.appendChild(typeEl);
    header.appendChild(headerText);
    unitCard.appendChild(header);

    const stats = document.createElement('div');
    stats.className = 'unit-stats';

    const hpRow = document.createElement('div');
    hpRow.innerHTML = 'HP: <span id="ui-hp">-</span>/<span id="ui-max-hp">-</span>';
    hpEl = hpRow.querySelector('#ui-hp');
    maxHpEl = hpRow.querySelector('#ui-max-hp');
    stats.appendChild(hpRow);

    const mpRow = document.createElement('div');
    mpRow.innerHTML = 'MP: <span id="ui-mp">-</span>/<span id="ui-max-mp">-</span>';
    mpEl = mpRow.querySelector('#ui-mp');
    maxMpEl = mpRow.querySelector('#ui-max-mp');
    stats.appendChild(mpRow);

    manaEl = document.createElement('div');
    manaEl.innerHTML = 'Mana: <span id="ui-mana">-</span>/<span id="ui-max-mana">-</span>';
    stats.appendChild(manaEl);

    attackEl = document.createElement('div');
    attackEl.innerHTML = 'Atk: <span id="ui-atk">-</span>';
    stats.appendChild(attackEl);

    defenseEl = document.createElement('div');
    defenseEl.innerHTML = 'Def: <span id="ui-def">-</span>';
    stats.appendChild(defenseEl);

    weaponEl = document.createElement('div');
    weaponEl.innerHTML = 'Waffe: <span id="ui-weapon">-</span>';
    stats.appendChild(weaponEl);

    unitCard.appendChild(stats);

    spellsEl = document.createElement('div');
    spellsEl.className = 'unit-spells';
    unitCard.appendChild(spellsEl);

    container.appendChild(unitCard);

    // Action Buttons (between unit info and terrain)
    actionPanelEl = document.createElement('div');
    actionPanelEl.className = 'unit-commands';
    container.appendChild(actionPanelEl);

    // Terrain Card
    const terrainCard = document.createElement('div');
    terrainCard.className = 'terrain-card';
    terrainNameEl = document.createElement('div');
    terrainNameEl.style.cssText = 'font-weight:bold;font-size:12px;margin-bottom:4px;';
    terrainNameEl.textContent = 'Terrain';
    terrainCard.appendChild(terrainNameEl);
    const terrainImg = document.createElement('div');
    terrainImg.style.cssText = 'width:100%;height:50px;background:#bbb;border-radius:4px;margin-bottom:6px;display:flex;align-items:center;justify-content:center;color:#666;font-size:20px;';
    terrainImg.textContent = '🗺️';
    terrainCard.appendChild(terrainImg);
    terrainStatsEl = document.createElement('div');
    terrainStatsEl.style.cssText = 'font-size:11px;line-height:1.3;';
    terrainStatsEl.innerHTML = '—';
    terrainCard.appendChild(terrainStatsEl);
    container.appendChild(terrainCard);

    // Next Unit Button
    const nextBtn = document.createElement('button');
    nextBtn.id = 'next-unit-button';
    nextBtn.className = 'cmd-btn';
    nextBtn.style.cssText = 'width:100%;padding:6px;';
    nextBtn.textContent = 'Nächste Einheit →';
    container.appendChild(nextBtn);

    if (unitPanelParent) unitPanelParent.appendChild(container);
}

// ─── Preview ───

function hpBarColor(hp, maxHp) {
    const pct = hp / maxHp;
    if (pct > 0.6) return '#44cc44';
    if (pct > 0.3) return '#ccaa00';
    return '#cc3333';
}

function weaponAdvantage(attackerWeapon, defenderWeapon) {
    const adv = { sword: 'axe', axe: 'lance', lance: 'sword', bow: 'magic', magic: 'bow' };
    const dis = { sword: 'lance', axe: 'sword', lance: 'axe', bow: 'melee', magic: 'resist' };
    if (adv[attackerWeapon] === defenderWeapon) return { color: '#44ff44', text: '▲ Vorteil' };
    if (dis[attackerWeapon] === defenderWeapon) return { color: '#ff4444', text: '▼ Nachteil' };
    return { color: '#888', text: '■ Neutral' };
}

function infoCol(unit, isAttacker, hpAfter, hpBefore, wpnAdv) {
    const maxHp = unit.maxHp || 10;
    const hpPct = Math.max(0, hpAfter / maxHp * 100);
    const barColor = hpBarColor(hpAfter, maxHp);
    const wpnName = WEAPON_NAMES[unit.weapon] || unit.weapon || '—';
    const stat = isAttacker ? (unit.attack || 5) : (unit.defense || 2);
    const statLabel = isAttacker ? 'Atk' : 'Def';

    // attacker: HP bar left, number right; defender: number left, HP bar right
    const hpRow = isAttacker
        ? `<div style="display:flex;align-items:center;gap:4px;width:100%;">
             <div style="flex:1;background:#444;border-radius:3px;height:8px;overflow:hidden;">
               <div class="hp-bar-fill" style="height:100%;width:${hpPct}%;background:${barColor};border-radius:3px;transition:width 0.8s ease-in-out;" data-target="${hpPct}"></div>
             </div>
             <div style="font-size:10px;color:#ccc;white-space:nowrap;">${hpAfter}/${maxHp}</div>
           </div>`
        : `<div style="display:flex;align-items:center;gap:4px;width:100%;">
             <div style="font-size:10px;color:#ccc;white-space:nowrap;">${hpAfter}/${maxHp}</div>
             <div style="flex:1;background:#444;border-radius:3px;height:8px;overflow:hidden;">
               <div class="hp-bar-fill" style="height:100%;width:${hpPct}%;background:${barColor};border-radius:3px;transition:width 0.8s ease-in-out;" data-target="${hpPct}"></div>
             </div>
           </div>`;

    return `
        <div style="flex:2;display:flex;flex-direction:column;justify-content:stretch;gap:0;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${wpnAdv.color};font-weight:bold;">${wpnAdv.text}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:14px;color:#fff;font-weight:bold;">${statLabel} ${stat}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                ${hpRow}
            </div>
        </div>
    `;
}

function animateInfoCol(unit, isAttacker, hpBefore, hpAfter, wpnAdv, dmgText) {
    const maxHp = unit.maxHp || 10;
    const hpPctBefore = Math.max(0, hpBefore / maxHp * 100);
    const hpPctAfter = Math.max(0, hpAfter / maxHp * 100);
    const barColor = hpBarColor(hpAfter, maxHp);
    const stat = isAttacker ? (unit.attack || 5) : (unit.defense || 2);
    const statLabel = isAttacker ? 'Atk' : 'Def';

    const hpRow = isAttacker
        ? `<div style="display:flex;align-items:center;gap:4px;width:100%;">
             <div style="flex:1;background:#444;border-radius:3px;height:8px;overflow:hidden;">
               <div class="hp-bar-fill" style="height:100%;width:${hpPctBefore}%;background:${barColor};border-radius:3px;transition:width 0.8s ease-in-out;" data-target="${hpPctAfter}"></div>
             </div>
             <div style="font-size:10px;color:#ccc;white-space:nowrap;">${hpAfter}/${maxHp}</div>
           </div>`
        : `<div style="display:flex;align-items:center;gap:4px;width:100%;">
             <div style="font-size:10px;color:#ccc;white-space:nowrap;">${hpAfter}/${maxHp}</div>
             <div style="flex:1;background:#444;border-radius:3px;height:8px;overflow:hidden;">
               <div class="hp-bar-fill" style="height:100%;width:${hpPctBefore}%;background:${barColor};border-radius:3px;transition:width 0.8s ease-in-out;" data-target="${hpPctAfter}"></div>
             </div>
           </div>`;

    return `
        <div style="flex:2;display:flex;flex-direction:column;justify-content:stretch;gap:0;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${wpnAdv.color};font-weight:bold;">${wpnAdv.text}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:14px;color:#fff;font-weight:bold;">${statLabel} ${stat}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                ${hpRow}
            </div>
            ${dmgText ? `<div style="display:flex;align-items:center;justify-content:center;padding:2px 4px;">
                <div style="font-size:16px;color:#ff4444;font-weight:bold;opacity:0;" class="dmg-show">${dmgText}</div>
            </div>` : ''}
        </div>
    `;
}

export function showCombatPreview(leftUnit, rightUnit, pred) {
    const previewEl = document.getElementById('combat-preview');
    if (!previewEl) return;

    const leftHpAfter = pred.attackerHpAfter;
    const rightHpAfter = pred.defenderHpAfter;
    const leftAdv = weaponAdvantage(leftUnit.weapon, rightUnit.weapon);
    const rightAdv = weaponAdvantage(rightUnit.weapon, leftUnit.weapon);

    previewEl.style.backgroundColor = '#111';
    previewEl.style.borderColor = '#ffd700';
    previewEl.style.display = 'flex';
    previewEl.style.alignItems = 'stretch';

    previewEl.innerHTML = `
        <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;">${portraitHtml(leftUnit.portrait, 42)}</div>
            ${infoCol(leftUnit, true, leftHpAfter, leftHpAfter, leftAdv)}
        </div>
        <div style="display:flex;align-items:center;justify-content:center;width:40px;flex-shrink:0;">
            <div style="font-size:18px;color:#ffd700;font-weight:bold;">VS</div>
        </div>
        <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
            ${infoCol(rightUnit, false, rightHpAfter, rightHpAfter, rightAdv)}
            <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;">${portraitHtml(rightUnit.portrait, 42)}</div>
        </div>
    `;
}

export function hidePreview() {
    const previewEl = document.getElementById('combat-preview');
    if (previewEl) {
        previewEl.innerHTML = '<span style="color:#ffd700;font-size:16px;">⚔ Kampf-Vorschau</span>';
        previewEl.style.backgroundColor = '#1a1a1a';
        previewEl.style.borderColor = '#ffd700';
        previewEl.style.display = 'flex';
        previewEl.style.alignItems = 'center';
        previewEl.style.justifyContent = 'center';
    }
}

function calculateEffectiveStats(unit) {
    let attack = unit.attack || 5;
    let defense = unit.defense || 2;
    let attackDelta = 0;
    let defenseDelta = 0;
    if (unit.activeEffects) {
        unit.activeEffects.forEach(e => {
            if (e.effect === 'buff_attack') { attack += e.value; attackDelta += e.value; }
            if (e.effect === 'debuff_attack') { attack -= e.value; attackDelta -= e.value; }
            if (e.effect === 'buff_defense') { defense += e.value; defenseDelta += e.value; }
            if (e.effect === 'debuff_defense') { defense -= e.value; defenseDelta -= e.value; }
        });
    }
    return { attack, defense, attackDelta, defenseDelta };
}

// ─── Fill Unit Panel ───

export function fillUnitPanel(unit) {
    if (!unit) {
        titleEl.textContent = 'Keine Einheit';
        portraitEl.textContent = '?';
        typeEl.textContent = '';
        hpEl.textContent = '-';
        maxHpEl.textContent = '-';
        mpEl.textContent = '-';
        maxMpEl.textContent = '-';
        manaEl.innerHTML = 'Mana: -/<span id="ui-max-mana">-</span>';
        attackEl.innerHTML = 'Atk: <span id="ui-atk">-</span>';
        defenseEl.innerHTML = 'Def: <span id="ui-def">-</span>';
        weaponEl.innerHTML = 'Waffe: <span id="ui-weapon">-</span>';
        spellsEl.innerHTML = '';
        actionPanelEl.innerHTML = '';
        return;
    }

    const { attack, defense, attackDelta, defenseDelta } = calculateEffectiveStats(unit);
    const wName = WEAPON_NAMES[unit.weapon] || unit.weapon || '—';

    const atkColor = attackDelta > 0 ? '#44ff44' : attackDelta < 0 ? '#ff4444' : '#ccc';
    const defColor = defenseDelta > 0 ? '#44ff44' : defenseDelta < 0 ? '#ff4444' : '#ccc';
    const atkDeltaStr = attackDelta > 0 ? `+${attackDelta}` : attackDelta < 0 ? `${attackDelta}` : '';
    const defDeltaStr = defenseDelta > 0 ? `+${defenseDelta}` : defenseDelta < 0 ? `${defenseDelta}` : '';

    titleEl.textContent = unit.name;
    if (unit.portrait && unit.portrait.includes('/')) {
        portraitEl.innerHTML = `<img src="${unit.portrait}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;" />`;
    } else {
        portraitEl.textContent = unit.portrait || '?';
    }
    typeEl.textContent = unit.isHero ? (unit.range > 1 ? 'Fernkampf' : 'Nahkampf') : 'Feind';
    hpEl.textContent = unit.hp;
    maxHpEl.textContent = unit.maxHp;
    mpEl.textContent = unit.mp;
    maxMpEl.textContent = unit.maxMp;
    manaEl.innerHTML = `Mana: <span id="ui-mana-val">${unit.mana}</span>/<span id="ui-max-mana-val">${unit.maxMana}</span>`;
    attackEl.innerHTML = `Atk: <span id="ui-atk-val" style="color:${atkColor}">${attack}${atkDeltaStr}</span>`;
    defenseEl.innerHTML = `Def: <span id="ui-def-val" style="color:${defColor}">${defense}${defDeltaStr}</span>`;
    weaponEl.innerHTML = `Waffe: <span id="ui-weapon-val">${wName}</span>`;

    // Active traits
    let traitsHtml = '';
    if (unit.activeEffects && unit.activeEffects.length > 0) {
        traitsHtml = '<div style="margin-top:6px;padding-top:6px;border-top:1px solid #333;font-size:10px;">';
        unit.activeEffects.forEach(effect => {
            if (effect.effect === 'heal') return;
            const isPositive = effect.effect === 'buff_attack' || effect.effect === 'buff_defense';
            const isNegative = effect.effect === 'debuff_attack' || effect.effect === 'debuff_defense';
            const color = isPositive ? '#44ff44' : isNegative ? '#ff4444' : '#888';
            const sign = isPositive ? '+' : isNegative ? '' : '';
            const value = effect.value !== undefined ? `${sign}${effect.value} ${effect.traitStat || effect.effect.replace('buff_', '').replace('debuff_', '')}` : '';
            const name = effect.traitName || effect.effect;
            const dur = effect.duration > 0 ? ` (${effect.duration})` : '';
            traitsHtml += `<div style="color:${color};margin-bottom:2px;">◆ ${name} ${value}${dur}</div>`;
        });
        traitsHtml += '</div>';
    }

    // Spells
    spellsEl.innerHTML = '';
    if (unit.spells && unit.spells.length > 0) {
        unit.spells.forEach(spell => {
            const btn = document.createElement('button');
            btn.className = 'spell-btn';
            btn.textContent = `${spell.name}`;
            btn.title = `Mana: ${spell.manaCost || 0}`;
            btn.onclick = () => {
                if (onSpellSelect) onSpellSelect(unit, spell);
            };
            spellsEl.appendChild(btn);
        });
    }
    spellsEl.innerHTML += traitsHtml;

    // Action buttons
    actionPanelEl.innerHTML = '';
    const turnState = unit.turnState || 'idle';

    if (turnState !== 'acted') {
        const moveBtn = document.createElement('button');
        moveBtn.className = 'cmd-btn';
        moveBtn.textContent = turnState === 'idle' ? 'Bewegen' : 'Noch bewegen';
        moveBtn.onclick = () => {
            if (window.onMoveCallback) window.onMoveCallback(unit);
        };
        actionPanelEl.appendChild(moveBtn);

        if (!unit.hasAttacked) {
            const atkBtn = document.createElement('button');
            atkBtn.className = 'cmd-btn';
            atkBtn.textContent = 'Angreifen';
            atkBtn.onclick = () => {
                if (window.onAttackCallback) window.onAttackCallback(unit);
            };
            actionPanelEl.appendChild(atkBtn);
        }
    }

    if (turnState !== 'acted') {
        const waitBtn = document.createElement('button');
        waitBtn.className = 'cmd-btn';
        waitBtn.textContent = 'Warten';
        waitBtn.onclick = () => {
            if (window.onWaitCallback) window.onWaitCallback(unit);
        };
        actionPanelEl.appendChild(waitBtn);
    }
}

// ─── Terrain Info ───

export function updateTerrainInfo(cell, terrainTypes) {
    if (!terrainNameEl || !terrainStatsEl) return;
    if (!cell || !terrainTypes) {
        terrainNameEl.textContent = 'Unbekannt';
        terrainStatsEl.innerHTML = 'Keine Daten';
        return;
    }
    const terrain = terrainTypes[cell.type] || terrainTypes.plains;
    terrainNameEl.textContent = terrain.name || cell.type;
    terrainStatsEl.innerHTML = `Typ: ${cell.type}<br>MP-Kosten: ${terrain.movementCost || 1}<br>Verteidigung: +${terrain.defenseBonus || 0}`;
}

export function clearUnitPanel() {
    fillUnitPanel(null);
}

// ─── Spell Preview / Cast ───

export function showSpellPreview(caster, target, spell) {
    const previewEl = document.getElementById('combat-preview');
    if (!previewEl) return;

    const sym = spell.element === 'fire' ? '🔥' : spell.element === 'ice' ? '❄️' : spell.element === 'heal' ? '💚' : spell.element === 'dark' ? '💜' : spell.effect === 'cleanse' ? '✨' : spell.effect === 'social_ban' ? '🚫' : '✦';
    const effectColor = spell.element === 'fire' ? '#ff6633' : spell.element === 'ice' ? '#66ccff' : spell.element === 'heal' ? '#44ff44' : spell.element === 'dark' ? '#cc66ff' : spell.effect === 'cleanse' ? '#ffff44' : spell.effect === 'social_ban' ? '#ff4444' : '#cc88ff';
    let spellEffect = '';
    if (spell.effect === 'cleanse') {
        spellEffect = 'Entfernt Traits';
    } else if (spell.effect === 'heal') {
        spellEffect = `+${spell.value || 0} HP`;
    } else if (spell.effect === 'buff_attack' || spell.effect === 'buff_defense') {
        spellEffect = `+${spell.value || 0} ${spell.effect.replace('buff_', '')}`;
    } else if (spell.effect === 'debuff_attack' || spell.effect === 'debuff_defense') {
        spellEffect = `-${spell.value || 0} ${spell.effect.replace('debuff_', '')}`;
    } else if (spell.effect === 'social_ban') {
        spellEffect = '🚫 Bannt SocialMedia!';
    } else {
        spellEffect = spell.target === 'ally'
            ? `+${spell.value || 0} ${spell.effect}`
            : `-${spell.value || 0} ${spell.effect}`;
    }

    const casterInfo = `
        <div style="flex:2;display:flex;flex-direction:column;justify-content:stretch;gap:0;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${effectColor};font-weight:bold;">${sym} ${spell.name}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:#888;">${spell.manaCost || 0} Mana</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${spell.target === 'ally' ? '#44ff44' : '#ff6666'};">${spellEffect}</div>
            </div>
        </div>
    `;

    const targetInfo = `
        <div style="flex:2;display:flex;flex-direction:column;justify-content:stretch;gap:0;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${effectColor};font-weight:bold;">${sym} ${spell.name}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:#888;">${spell.manaCost || 0} Mana</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${spell.target === 'ally' ? '#44ff44' : '#ff6666'};">${spellEffect}</div>
            </div>
        </div>
    `;

    previewEl.style.backgroundColor = '#111';
    previewEl.style.borderColor = effectColor;
    previewEl.style.display = 'flex';
    previewEl.style.alignItems = 'stretch';

    previewEl.innerHTML = `
        <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;">${portraitHtml(caster.portrait, 42)}</div>
            ${casterInfo}
        </div>
        <div style="display:flex;align-items:center;justify-content:center;width:40px;flex-shrink:0;">
            <div style="font-size:22px;color:${effectColor};font-weight:bold;">${sym}</div>
        </div>
        <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
            ${targetInfo}
            <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;">${portraitHtml(target.portrait, 42)}</div>
        </div>
    `;
}

export async function animateCombatResult(leftUnit, rightUnit, opts) {
    const previewEl = document.getElementById('combat-preview');
    if (!previewEl) return Promise.resolve();

    const leftMaxHp = leftUnit.maxHp || 10;
    const rightMaxHp = rightUnit.maxHp || 10;

    const leftHpBefore = opts.leftHpBefore !== undefined ? opts.leftHpBefore : leftUnit.hp;
    const leftHpAfter = opts.leftHpAfter !== undefined ? opts.leftHpAfter : leftUnit.hp;
    const rightHpBefore = opts.rightHpBefore !== undefined ? opts.rightHpBefore : rightUnit.hp;
    const rightHpAfter = opts.rightHpAfter !== undefined ? opts.rightHpAfter : rightUnit.hp;

    const leftDmg = opts.leftDmg || 0;
    const rightDmg = opts.rightDmg || 0;

    const leftAdv = weaponAdvantage(leftUnit.weapon, rightUnit.weapon);
    const rightAdv = weaponAdvantage(rightUnit.weapon, leftUnit.weapon);

    previewEl.style.backgroundColor = '#111';
    previewEl.style.borderColor = '#ffd700';
    previewEl.style.display = 'flex';
    previewEl.style.alignItems = 'stretch';

    previewEl.innerHTML = `
        <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;opacity:0;animation:slideIn 0.3s ease-out forwards;">${portraitHtml(leftUnit.portrait, 42)}</div>
            ${animateInfoCol(leftUnit, true, leftHpBefore, leftHpAfter, leftAdv, rightDmg)}
        </div>
        <div style="display:flex;align-items:center;justify-content:center;width:40px;flex-shrink:0;">
            <div style="font-size:18px;color:#ffd700;font-weight:bold;">VS</div>
        </div>
        <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
            ${animateInfoCol(rightUnit, false, rightHpBefore, rightHpAfter, rightAdv, leftDmg)}
            <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;opacity:0;animation:slideIn 0.3s ease-out forwards;">${portraitHtml(rightUnit.portrait, 42)}</div>
        </div>
    `;

    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    previewEl.querySelectorAll('.hp-bar-fill').forEach(bar => {
        const target = bar.dataset.target;
        if (target !== undefined) bar.style.width = target + '%';
    });
    previewEl.querySelectorAll('.portrait').forEach(el => { el.style.opacity = '1'; });
    previewEl.querySelectorAll('.dmg-show').forEach(el => { el.style.opacity = '1'; });

    return new Promise(resolve => setTimeout(resolve, 3000));
}

// ─── Spell Animation ───

export async function animateSpellResult(caster, target, spell) {
    const previewEl = document.getElementById('combat-preview');
    if (!previewEl) return Promise.resolve();

    const sym = spell.element === 'fire' ? '🔥' : spell.element === 'ice' ? '❄️' : spell.element === 'heal' ? '💚' : spell.element === 'dark' ? '💜' : spell.effect === 'cleanse' ? '✨' : spell.effect === 'social_ban' ? '🚫' : '✦';
    const effectColor = spell.element === 'fire' ? '#ff6633' : spell.element === 'ice' ? '#66ccff' : spell.element === 'heal' ? '#44ff44' : spell.element === 'dark' ? '#cc66ff' : spell.effect === 'cleanse' ? '#ffff44' : spell.effect === 'social_ban' ? '#ff4444' : '#cc88ff';
    let spellEffect = '';
    if (spell.effect === 'cleanse') {
        spellEffect = 'Entfernt Traits';
    } else if (spell.effect === 'heal') {
        spellEffect = `+${spell.value || 0} HP`;
    } else if (spell.effect === 'buff_attack' || spell.effect === 'buff_defense') {
        spellEffect = `+${spell.value || 0} ${spell.effect.replace('buff_', '')}`;
    } else if (spell.effect === 'debuff_attack' || spell.effect === 'debuff_defense') {
        spellEffect = `-${spell.value || 0} ${spell.effect.replace('debuff_', '')}`;
    } else if (spell.effect === 'social_ban') {
        spellEffect = '🚫 Bannt SocialMedia!';
    } else {
        spellEffect = spell.target === 'ally'
            ? `+${spell.value || 0} ${spell.effect}`
            : `-${spell.value || 0} ${spell.effect}`;
    }

    const casterInfo = `
        <div style="flex:2;display:flex;flex-direction:column;justify-content:stretch;gap:0;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${effectColor};font-weight:bold;">${sym} ${spell.name}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:#888;">${spell.manaCost || 0} Mana</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${spell.target === 'ally' ? '#44ff44' : '#ff6666'};">${spellEffect}</div>
            </div>
        </div>
    `;

    const targetInfo = `
        <div style="flex:2;display:flex;flex-direction:column;justify-content:stretch;gap:0;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${effectColor};font-weight:bold;">${sym} ${spell.name}</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:#888;">${spell.manaCost || 0} Mana</div>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;flex:1;padding:2px 4px;">
                <div style="font-size:10px;color:${spell.target === 'ally' ? '#44ff44' : '#ff6666'};">${spellEffect}</div>
            </div>
        </div>
    `;

    previewEl.style.backgroundColor = '#111';
    previewEl.style.borderColor = effectColor;
    previewEl.style.display = 'flex';
    previewEl.style.alignItems = 'stretch';

    previewEl.innerHTML = `
        <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;opacity:0;animation:slideIn 0.3s ease-out forwards;">${portraitHtml(caster.portrait, 42)}</div>
            ${casterInfo}
        </div>
        <div style="display:flex;align-items:center;justify-content:center;width:40px;flex-shrink:0;">
            <div style="font-size:22px;color:${effectColor};font-weight:bold;">${sym}</div>
        </div>
        <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
            ${targetInfo}
            <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;opacity:0;animation:slideIn 0.3s ease-out forwards;">${portraitHtml(target.portrait, 42)}</div>
        </div>
    `;

    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    previewEl.querySelectorAll('.portrait').forEach(el => { el.style.opacity = '1'; });

    return new Promise(resolve => setTimeout(resolve, 3000));
}

export async function showEnemyAction(enemy, target, type, data) {
    const previewEl = document.getElementById('combat-preview');
    if (!previewEl) return Promise.resolve();

    if (type === 'attack' && target && data) {
        const pred = data;
        const enemyMaxHp = enemy.maxHp || 10;
        const targetMaxHp = target.maxHp || 10;

        const targetHpBefore = data.targetHpBefore !== undefined ? data.targetHpBefore : target.hp + pred.attackDmg;
        const targetHpAfter = target.hp;
        const enemyHpBefore = data.enemyHpBefore !== undefined ? data.enemyHpBefore : (pred.canCounter ? enemy.hp + pred.counterDmg : enemy.hp);
        const enemyHpAfter = enemy.hp;

        const counterDmg = pred.canCounter ? (pred.counterDmg || 0) : 0;

        const enemyAdv = weaponAdvantage(enemy.weapon, target.weapon);
        const targetAdv = weaponAdvantage(target.weapon, enemy.weapon);

        previewEl.style.backgroundColor = '#111';
        previewEl.style.borderColor = '#ff4444';
        previewEl.style.display = 'flex';
        previewEl.style.alignItems = 'stretch';

        previewEl.innerHTML = `
            <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
                <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;opacity:0;animation:slideIn 0.3s ease-out forwards;">${portraitHtml(enemy.portrait, 42)}</div>
                ${animateInfoCol(enemy, true, enemyHpBefore, enemyHpAfter, enemyAdv, counterDmg)}
            </div>
            <div style="display:flex;align-items:center;justify-content:center;width:40px;flex-shrink:0;">
                <div style="font-size:18px;color:#ff4444;font-weight:bold;">VS</div>
            </div>
            <div style="flex:1;display:flex;align-items:stretch;min-width:0;">
                ${animateInfoCol(target, false, targetHpBefore, targetHpAfter, targetAdv, pred.attackDmg)}
                <div style="display:flex;align-items:center;justify-content:center;flex:1;font-size:42px;opacity:0;animation:slideIn 0.3s ease-out forwards;">${portraitHtml(target.portrait, 42)}</div>
            </div>
        `;

        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        previewEl.querySelectorAll('.hp-bar-fill').forEach(bar => {
            const target2 = bar.dataset.target;
            if (target2 !== undefined) bar.style.width = target2 + '%';
        });
        previewEl.querySelectorAll('.portrait').forEach(el => { el.style.opacity = '1'; });
        previewEl.querySelectorAll('.dmg-show').forEach(el => { el.style.opacity = '1'; });

        return new Promise(resolve => setTimeout(resolve, 3000));

    } else if (type === 'move') {
        previewEl.style.backgroundColor = '#111';
        previewEl.style.borderColor = '#888';
        previewEl.style.display = 'flex';
        previewEl.style.alignItems = 'center';
        previewEl.style.justifyContent = 'center';
        previewEl.innerHTML = `
            <div style="text-align:center;">
                <div style="font-size:28px;margin-bottom:4px;">${portraitHtml(enemy.portrait, 28)}</div>
                <div style="font-size:12px;color:#fff;font-weight:bold;">${enemy.name}</div>
                <div style="font-size:11px;color:#aaa;">bewegt sich...</div>
            </div>
        `;
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    return Promise.resolve();
}

// ─── Action Callbacks ───

export function setActionCallbacks(onAttack, onWait, onMove) {
    window.onAttackCallback = onAttack;
    window.onWaitCallback = onWait;
    window.onMoveCallback = onMove;
}

// ─── Cursor Symbol ───

let cursorSymbolEl = null;

export function showCursorSymbol(pointer, unit) {
    if (!cursorSymbolEl) {
        cursorSymbolEl = document.createElement('div');
        cursorSymbolEl.style.cssText = 'position:fixed;pointer-events:none;font-size:24px;z-index:200;transform:translate(-50%,-50%);';
        document.body.appendChild(cursorSymbolEl);
    }
    cursorSymbolEl.style.display = 'block';
    const canvas = document.querySelector('canvas');
    if (canvas) {
        const rect = canvas.getBoundingClientRect();
        cursorSymbolEl.style.left = (rect.left + pointer.x) + 'px';
        cursorSymbolEl.style.top = (rect.top + pointer.y) + 'px';
    } else {
        cursorSymbolEl.style.left = pointer.x + 'px';
        cursorSymbolEl.style.top = pointer.y + 'px';
    }
    cursorSymbolEl.textContent = unit && unit.range > 1 ? (unit.weapon === 'magic' ? '✦' : '⊕') : '⚔';
}

export function hideCursorSymbol() {
    if (cursorSymbolEl) cursorSymbolEl.style.display = 'none';
}

// ─── Check Units ───

export function checkAllUnitsExhausted() {
    const units = getPlayerUnits();
    const allExhausted = units.every(u => u.turnState === 'acted');
    if (allExhausted && units.length > 0) {
        log('Alle Einheiten haben gehandelt.', 'default');
        const endBtn = document.getElementById('end-turn-button');
        if (endBtn) endBtn.click();
    }
}

export function getNextUnitButton() {
    return document.getElementById('next-unit-button');
}

// ─── Cleanup ───

export function destroyCombatUI() {
    if (container && container.parentNode) container.parentNode.removeChild(container);
    if (previewOverlay && previewOverlay.parentNode) previewOverlay.parentNode.removeChild(previewOverlay);
    if (cursorSymbolEl && cursorSymbolEl.parentNode) cursorSymbolEl.parentNode.removeChild(cursorSymbolEl);
    container = null;
    previewOverlay = null;
    cursorSymbolEl = null;
}

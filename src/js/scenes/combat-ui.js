import { getPlayerUnits, getEnemyUnits, getUnitTurnState, getUnitHasCast } from '../entities/units.js';
import { log } from '../engine/console.js';

const WEAPON_NAMES = { sword: 'Schwert', axe: 'Axt', lance: 'Lanze', bow: 'Bogen', magic: 'Magie' };

let onSpellCast = null;
let onSpellSelect = null;
let container = null;
let previewContainer = null;

// DOM-Referenzen
let titleEl, portraitEl, typeEl, hpEl, maxHpEl, mpEl, maxMpEl, attackEl, defenseEl, weaponEl, manaEl, maxManaEl, spellsEl;
let terrainInfoText, terrainStatsEl;
let previewTitleEl, previewBodyEl, previewResultEl, previewVsEl;
let previewLeftEl, previewRightEl;
let actionPanelEl;

export function setSpellCastCallback(callback) { onSpellCast = callback; }
export function setSpellSelectCallback(callback) { onSpellSelect = callback; }

// ─── Einheiten-Panel (rechte Seitenleiste) ───

export function initCombatUI(parent, previewParent) {
    container = document.createElement('div');
    container.id = 'info-panel';
    container.style.cssText = 'width:250px;background:#eee;padding:10px;display:flex;flex-direction:column;gap:10px;';

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
    const manaP = document.createElement('p');
    manaP.innerHTML = 'Mana: <span id="ui-unit-mana"></span>/<span id="ui-unit-max-mana"></span>';
    statsDiv.appendChild(manaP);
    statsDiv.appendChild(addStat('Angriff', 'ui-unit-attack'));
    statsDiv.appendChild(addStat('Verteidigung', 'ui-unit-defense'));
    statsDiv.appendChild(addStat('Waffe', 'ui-unit-weapon'));
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

    actionPanelEl = document.createElement('div');
    actionPanelEl.id = 'action-panel';
    actionPanelEl.style.cssText = 'display:flex;flex-direction:column;gap:5px;margin-top:5px;';
    commandsDiv.appendChild(actionPanelEl);

    unitDetails.appendChild(commandsDiv);
    container.appendChild(unitDetails);

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

    const nextBtn = document.createElement('button');
    nextBtn.id = 'next-unit-button';
    nextBtn.className = 'command-button';
    nextBtn.textContent = 'Nächste Einheit';
    container.appendChild(nextBtn);

    if (parent) parent.appendChild(container);
    else document.body.appendChild(container);

    // ─── Kampf-Vorschau (Bottom-Right) ───
    previewContainer = document.createElement('div');
    previewContainer.id = 'combat-preview';
    previewContainer.style.cssText = 'background:#fff;padding:8px;height:100%;box-sizing:border-box;display:none;';

    previewTitleEl = document.createElement('h3');
    previewTitleEl.style.margin = '0 0 6px 0';
    previewTitleEl.textContent = 'Kampf';
    previewContainer.appendChild(previewTitleEl);

    previewBodyEl = document.createElement('div');
    previewBodyEl.style.cssText = 'display:flex;gap:8px;align-items:stretch;';

    previewLeftEl = createUnitCard();
    previewBodyEl.appendChild(previewLeftEl.container);

    previewVsEl = document.createElement('div');
    previewVsEl.style.cssText = 'font-size:20px;align-self:center;min-width:30px;text-align:center;';
    previewBodyEl.appendChild(previewVsEl);

    previewRightEl = createUnitCard();
    previewBodyEl.appendChild(previewRightEl.container);

    previewContainer.appendChild(previewBodyEl);

    previewResultEl = document.createElement('div');
    previewResultEl.style.cssText = 'margin-top:6px;font-size:13px;padding-top:4px;';
    previewContainer.appendChild(previewResultEl);

    if (previewParent) previewParent.appendChild(previewContainer);
    else document.body.appendChild(previewContainer);

    // Referenzen
    titleEl = document.getElementById('unit-title');
    portraitEl = document.getElementById('unit-portrait');
    typeEl = document.getElementById('ui-unit-type');
    hpEl = document.getElementById('ui-unit-hp');
    maxHpEl = document.getElementById('ui-unit-max-hp');
    mpEl = document.getElementById('ui-unit-mp');
    maxMpEl = document.getElementById('ui-unit-max-mp');
    manaEl = document.getElementById('ui-unit-mana');
    maxManaEl = document.getElementById('ui-unit-max-mana');
    attackEl = document.getElementById('ui-unit-attack');
    defenseEl = document.getElementById('ui-unit-defense');
    weaponEl = document.getElementById('ui-unit-weapon');
}

// ─── Unit-Card Builder ───

function createUnitCard() {
    const container = document.createElement('div');
    container.style.cssText = 'flex:1;text-align:center;font-size:12px;';

    const portrait = document.createElement('div');
    portrait.style.cssText = 'width:36px;height:36px;border-radius:4px;margin:0 auto 4px;';
    container.appendChild(portrait);

    const name = document.createElement('div');
    name.style.cssText = 'font-weight:bold;font-size:13px;margin-bottom:2px;';
    container.appendChild(name);

    const hpBarOuter = document.createElement('div');
    hpBarOuter.style.cssText = 'width:100%;height:12px;background:#ddd;border-radius:3px;overflow:hidden;margin:2px 0;';
    const hpBarInner = document.createElement('div');
    hpBarInner.style.cssText = 'height:100%;background:#4caf50;border-radius:3px;transition:width 0.8s ease;';
    hpBarOuter.appendChild(hpBarInner);
    container.appendChild(hpBarOuter);

    const hpText = document.createElement('div');
    hpText.style.cssText = 'font-size:11px;margin-bottom:2px;';
    container.appendChild(hpText);

    const stats = document.createElement('div');
    stats.style.cssText = 'font-size:11px;';
    container.appendChild(stats);

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:relative;display:inline-block;';
    container.appendChild(overlay);

    return {
        container,
        portrait,
        name,
        hpBar: hpBarInner,
        hpText,
        stats,
        overlay
    };
}

function weaponHtml(unit, otherWeapon) {
    if (!unit.weapon) return 'Waffe: —';
    const wName = WEAPON_NAMES[unit.weapon] || unit.weapon;
    let color = '';
    if (otherWeapon) {
        const WEAPON_TRIANGLE = { sword: 'axe', axe: 'lance', lance: 'sword' };
        if (WEAPON_TRIANGLE[unit.weapon] === otherWeapon) color = 'color:green;font-weight:bold;';
        else if (WEAPON_TRIANGLE[otherWeapon] === unit.weapon) color = 'color:red;font-weight:bold;';
    }
    return `Waffe: <span style="${color}">${wName}</span>`;
}

function fillUnitCard(card, unit, label, opts) {
    opts = opts || {};
    const color = unit.color || '#888';
    const { attack, defense } = calculateEffectiveStats(unit);

    card.portrait.style.background = color;
    card.portrait.textContent = unit.portrait || '';
    card.portrait.style.cssText += 'display:flex;align-items:center;justify-content:center;font-size:20px;';
    card.name.textContent = `${label}: ${unit.name}`;

    // HP
    const displayHp = opts.hp !== undefined ? opts.hp : unit.hp;
    const hpPct = Math.max(0, Math.round((displayHp / unit.maxHp) * 100));
    card.hpBar.style.transition = 'none';
    card.hpBar.style.width = hpPct + '%';
    card.hpBar.style.background = hpPct > 50 ? '#4caf50' : hpPct > 25 ? '#ff9800' : '#f44336';

    if (opts.showChange && opts.hpAfter !== undefined && opts.hp !== undefined) {
        const changeColor = opts.hpAfter < opts.hp ? 'red' : 'green';
        card.hpText.innerHTML = `<span style="color:${changeColor};font-weight:bold">HP ${opts.hp} → ${opts.hpAfter}</span>`;
    } else {
        card.hpText.textContent = `${displayHp} / ${unit.maxHp} HP`;
    }

    // Stats + Waffe mit Farbe + Mana
    let manaStr = '';
    if (unit.maxMana > 0) {
        manaStr = ` | Mana: ${unit.mana}/${unit.maxMana}`;
    }

    if (opts.showChange && opts.atkAfter !== undefined) {
        const atkColor = opts.atkAfter > attack ? 'green' : opts.atkAfter < attack ? 'red' : '';
        card.stats.innerHTML = `Atk: <span style="color:${atkColor};font-weight:bold">${attack} → ${opts.atkAfter}</span> | Def: ${defense}${manaStr}<br>${weaponHtml(unit, opts.otherWeapon)}`;
    } else {
        card.stats.innerHTML = `Atk: ${attack} | Def: ${defense}${manaStr}<br>${weaponHtml(unit, opts.otherWeapon)}`;
    }
}

function animateHpBar(card, fromHp, toHp, maxHp) {
    const fromPct = Math.max(0, Math.round((fromHp / maxHp) * 100));
    const toPct = Math.max(0, Math.round((toHp / maxHp) * 100));

    card.hpBar.style.transition = 'none';
    card.hpBar.style.width = fromPct + '%';
    card.hpBar.style.background = fromPct > 50 ? '#4caf50' : fromPct > 25 ? '#ff9800' : '#f44336';

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            card.hpBar.style.transition = 'width 0.8s ease';
            card.hpBar.style.width = toPct + '%';
            card.hpBar.style.background = toPct > 50 ? '#4caf50' : toPct > 25 ? '#ff9800' : '#f44336';
        });
    });

    card.hpText.textContent = `${toHp} / ${maxHp} HP`;
}

function showDamagePopup(card, amount, color) {
    const popup = document.createElement('div');
    popup.textContent = amount > 0 ? `-${amount}` : `+${Math.abs(amount)}`;
    popup.style.cssText = `position:absolute;top:0;left:50%;transform:translateX(-50%);font-size:18px;font-weight:bold;color:${color};pointer-events:none;z-index:10;`;
    popup.className = 'damage-popup';
    card.container.style.position = 'relative';
    card.container.appendChild(popup);

    let opacity = 1;
    let y = 0;
    const animate = () => {
        opacity -= 0.03;
        y -= 1.5;
        popup.style.opacity = opacity;
        popup.style.transform = `translateX(-50%) translateY(${y}px)`;
        if (opacity > 0) requestAnimationFrame(animate);
        else popup.remove();
    };
    requestAnimationFrame(animate);
}

// ─── Aktions-Panel (Buttons nach Zustand) ───

let _onActionAttack = null;
let _onActionWait = null;
let _onActionMove = null;

export function setActionCallbacks(onAttack, onWait, onMove) {
    _onActionAttack = onAttack;
    _onActionWait = onWait;
    _onActionMove = onMove;
}

export function showActionPanel(unit) {
    if (!actionPanelEl) return;
    actionPanelEl.innerHTML = '';

    if (!unit) return;

    const turnState = getUnitTurnState(unit.id);
    const hasAttacked = unit.hasAttacked;
    const hasCast = getUnitHasCast(unit.id);

    if (turnState === 'idle') {
        if (!hasAttacked) {
            const atkBtn = document.createElement('button');
            atkBtn.className = 'command-button';
            atkBtn.textContent = 'Angreifen';
            atkBtn.addEventListener('click', () => {
                if (_onActionAttack) _onActionAttack(unit);
            });
            actionPanelEl.appendChild(atkBtn);
        }

        if (unit.spells && unit.spells.length > 0 && !hasCast) {
            unit.spells.forEach(spell => {
                const btn = document.createElement('button');
                btn.className = 'spell-button';
                const costLabel = spell.manaCost ? `${spell.manaCost} Mana` : (spell.mpCost ? `${spell.mpCost} MP` : '');
                btn.textContent = `${spell.name} (${costLabel})`;
                btn.title = spell.target === 'ally' ? 'Verbündeter stärken' : 'Feind schwächen';

                const effectiveCost = spell.manaCost !== undefined ? spell.manaCost : spell.mpCost;
                if (unit.mana < effectiveCost) {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (onSpellSelect) onSpellSelect(unit, spell);
                });
                actionPanelEl.appendChild(btn);
            });
        }

        const waitBtn = document.createElement('button');
        waitBtn.className = 'command-button';
        waitBtn.textContent = 'Warten';
        waitBtn.addEventListener('click', () => {
            if (_onActionWait) _onActionWait(unit);
        });
        actionPanelEl.appendChild(waitBtn);

    } else if (turnState === 'moved') {
        // Angriff, Zauber (falls verfügbar), Warten
        if (!hasAttacked) {
            const atkBtn = document.createElement('button');
            atkBtn.className = 'command-button';
            atkBtn.textContent = 'Angreifen';
            atkBtn.addEventListener('click', () => {
                if (_onActionAttack) _onActionAttack(unit);
            });
            actionPanelEl.appendChild(atkBtn);
        }

        if (unit.spells && unit.spells.length > 0 && !hasCast) {
            unit.spells.forEach(spell => {
                const btn = document.createElement('button');
                btn.className = 'spell-button';
                const costLabel = spell.manaCost ? `${spell.manaCost} Mana` : (spell.mpCost ? `${spell.mpCost} MP` : '');
                btn.textContent = `${spell.name} (${costLabel})`;
                btn.title = spell.target === 'ally' ? 'Verbündeter stärken' : 'Feind schwächen';

                const effectiveCost = spell.manaCost !== undefined ? spell.manaCost : spell.mpCost;
                if (unit.mana < effectiveCost) {
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                }

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (onSpellSelect) onSpellSelect(unit, spell);
                });
                actionPanelEl.appendChild(btn);
            });
        }

        const waitBtn2 = document.createElement('button');
        waitBtn2.className = 'command-button';
        waitBtn2.textContent = 'Warten';
        waitBtn2.addEventListener('click', () => {
            if (_onActionWait) _onActionWait(unit);
        });
        actionPanelEl.appendChild(waitBtn2);
    }
    // 'acted' → keine Buttons anzeigen
}

function combatSymbol(unit) {
    if (unit.weapon === 'magic') return '✦';
    return (unit.range || 1) > 1 ? '⊕' : '⚔';
}

function combatTitle(unit) {
    if (unit.weapon === 'magic') return '✦ Magie';
    return (unit.range || 1) > 1 ? '⊕ Fernkampf' : '⚔ Nahkampf';
}

// ─── Cursor-Symbol (unter dem Mauszeiger) ───

let cursorSymbolEl = null;

function ensureCursorSymbol() {
    if (!cursorSymbolEl) {
        cursorSymbolEl = document.createElement('div');
        cursorSymbolEl.style.cssText = 'position:fixed;pointer-events:none;font-size:22px;z-index:999;transform:translate(-50%,-150%);text-shadow:0 0 4px rgba(0,0,0,0.8);transition:opacity 0.1s;opacity:0;';
        document.body.appendChild(cursorSymbolEl);
    }
    return cursorSymbolEl;
}

export function showCursorSymbol(pointer, unit) {
    const el = ensureCursorSymbol();
    el.textContent = combatSymbol(unit);
    el.style.left = pointer.event.clientX + 'px';
    el.style.top = pointer.event.clientY + 'px';
    el.style.opacity = '1';
}

export function hideCursorSymbol() {
    if (cursorSymbolEl) cursorSymbolEl.style.opacity = '0';
}

// ─── Öffentliche Preview-Funktionen ───

export function showCombatPreview(attacker, defender, prediction) {
    if (!previewContainer) return;
    previewLeftEl.container.style.display = '';
    previewRightEl.container.style.display = '';
    previewContainer.style.display = 'block';
    const sym = combatSymbol(attacker);
    previewTitleEl.textContent = combatTitle(attacker);

    fillUnitCard(previewLeftEl, attacker, 'Angreifer', {
        showChange: true, hp: attacker.hp, hpAfter: prediction.attackerHpAfter,
        otherWeapon: defender.weapon
    });
    fillUnitCard(previewRightEl, defender, 'Verteidiger', {
        showChange: true, hp: defender.hp, hpAfter: prediction.defenderHpAfter,
        otherWeapon: attacker.weapon
    });
    previewVsEl.textContent = sym;

    let lines = [];
    if (prediction.weaponBonus > 0) lines.push('<span style="color:green">▲ Waffenvorteil (+2)</span>');
    else if (prediction.weaponBonus < 0) lines.push('<span style="color:red">▼ Waffennachteil (-2)</span>');
    if (prediction.flankBonus > 0) lines.push('<span style="color:green">▲ Flanke (+2)</span>');
    if (prediction.terrainDef !== 0) {
        const sign = prediction.terrainDef > 0 ? '+' : '';
        lines.push(`<span style="color:blue">◆ Terrain (${sign}${prediction.terrainDef})</span>`);
    }

    lines.push(`<b style="color:red">${attacker.name} → ${prediction.attackDmg} Schaden</b>`);
    if (prediction.canCounter) {
        lines.push(`<span style="color:red">${defender.name} schlägt zurück → ${prediction.counterDmg}</span>`);
    } else {
        lines.push('<span style="color:gray">Kein Gegenangriff</span>');
    }

    previewResultEl.innerHTML = lines.join('<br>');
}

export function animateCombatResult(leftUnit, rightUnit, opts) {
    return new Promise(resolve => {
        if (!previewContainer) { resolve(); return; }

        // Container IMMER zurücksetzen
        previewLeftEl.container.style.display = '';
        previewRightEl.container.style.display = '';
        previewContainer.style.display = 'block';
        const sym = combatSymbol(leftUnit);
        previewTitleEl.textContent = opts.title || combatTitle(leftUnit);

        // Karten mit HP VOR der Animation
        fillUnitCard(previewLeftEl, leftUnit, leftUnit._label || 'Angreifer', { hp: opts.leftHpBefore, otherWeapon: rightUnit.weapon });
        fillUnitCard(previewRightEl, rightUnit, rightUnit._label || 'Verteidiger', { hp: opts.rightHpBefore, otherWeapon: leftUnit.weapon });
        previewVsEl.textContent = sym;
        previewResultEl.innerHTML = '';

        // Animation nach kurzer Verzögerung
        setTimeout(() => {
            if (opts.rightDmg > 0) {
                animateHpBar(previewRightEl, opts.rightHpBefore, opts.rightHpAfter, rightUnit.maxHp);
                showDamagePopup(previewRightEl, opts.rightDmg, '#ff4444');
            }
            if (opts.leftDmg > 0) {
                setTimeout(() => {
                    animateHpBar(previewLeftEl, opts.leftHpBefore, opts.leftHpAfter, leftUnit.maxHp);
                    showDamagePopup(previewLeftEl, opts.leftDmg, '#ff8800');
                }, 500);
            }
        }, 100);

        // Ergebnis + Promise auflösen
        setTimeout(() => {
            let lines = [];
            lines.push(`<b>${leftUnit.name}: ${opts.leftHpAfter}/${leftUnit.maxHp} HP</b>`);
            lines.push(`<b>${rightUnit.name}: ${opts.rightHpAfter}/${rightUnit.maxHp} HP</b>`);
            if (opts.rightHpAfter <= 0) lines.push(`<b style="color:red">☠ ${rightUnit.name} besiegt!</b>`);
            if (opts.leftHpAfter <= 0) lines.push(`<b style="color:red">☠ ${leftUnit.name} besiegt!</b>`);
            previewResultEl.innerHTML = lines.join('<br>');
            resolve();
        }, 2000);
    });
}

export function showSpellPreview(caster, target, spell) {
    if (!previewContainer) return;
    previewContainer.style.display = 'block';
    previewTitleEl.textContent = '✨ Zauber';

    const { attack: targetAtk } = calculateEffectiveStats(target);
    const isBuff = spell.effect.startsWith('buff');
    const isAtk = spell.effect.includes('attack');

    let targetOpts = { otherWeapon: null };
    if (isAtk) {
        const newVal = Math.max(0, isBuff ? targetAtk + spell.value : targetAtk - spell.value);
        targetOpts.showChange = true;
        targetOpts.atkAfter = newVal;
    }

    fillUnitCard(previewLeftEl, caster, 'Caster', { otherWeapon: null });
    fillUnitCard(previewRightEl, target, isBuff ? 'Verbündeter' : 'Ziel', targetOpts);
    previewVsEl.textContent = '✦';

    const isPositive = spell.effect.startsWith('buff');
    const sign = isPositive ? '+' : '-';
    const color = isPositive ? 'green' : 'red';
    const statName = isAtk ? 'Angriff' : 'Verteidigung';
    const fromVal = isAtk ? targetAtk : calculateEffectiveStats(target).defense;
    const toVal = Math.max(0, isBuff ? fromVal + spell.value : fromVal - spell.value);

    previewResultEl.innerHTML = `<b>${spell.name}</b> auf ${target.name}<br>` +
        `<span style="color:${color};font-weight:bold">${statName}: ${fromVal} → ${toVal}</span><br>` +
        `<span style="color:gray">${spell.duration} Runde(n)</span>`;
}

export function animateSpellResult(caster, target, spell) {
    if (!previewContainer) return;
    previewContainer.style.display = 'block';
    previewTitleEl.textContent = '✨ Zauberwirkung';

    fillUnitCard(previewLeftEl, caster, 'Caster', { otherWeapon: null });
    fillUnitCard(previewRightEl, target, spell.target === 'ally' ? 'Verbündeter' : 'Ziel', { otherWeapon: null });
    previewVsEl.textContent = '✦';

    const isPositive = spell.effect.startsWith('buff');
    const color = isPositive ? '#4caf50' : '#f44336';
    showDamagePopup(previewRightEl, isPositive ? spell.value : -spell.value, color);

    setTimeout(() => {
        const statName = spell.effect.includes('attack') ? 'Angriff' : 'Verteidigung';
        const sign = isPositive ? '+' : '-';
        previewResultEl.innerHTML = `<b>${spell.name}</b> wirkt!<br>` +
            `<span style="color:${isPositive ? 'green' : 'red'};font-weight:bold">${statName} ${sign}${spell.value}</span> auf ${target.name}`;
    }, 800);
}

export async function showEnemyAction(enemy, target, actionType, data) {
    if (!previewContainer) return;

    // Container IMMER zurücksetzen
    previewLeftEl.container.style.display = '';
    previewRightEl.container.style.display = '';

    if (actionType === 'attack') {
        const pred = data;
        enemy._label = 'Angreifer';
        target._label = 'Verteidiger';
        await animateCombatResult(enemy, target, {
            leftHpBefore: enemy.hp,
            leftHpAfter: pred.attackerHpAfter,
            rightHpBefore: target.hp,
            rightHpAfter: pred.defenderHpAfter,
            leftDmg: pred.attackDmg,
            rightDmg: pred.canCounter ? pred.counterDmg : 0,
            title: combatTitle(enemy)
        });

    } else if (actionType === 'move') {
        previewContainer.style.display = 'block';
        previewTitleEl.textContent = '🔄 Feindbewegung';
        fillUnitCard(previewLeftEl, enemy, 'Einheit', { otherWeapon: null });
        previewRightEl.container.style.display = 'none';
        previewVsEl.textContent = '→';
        previewResultEl.innerHTML = `<b>${enemy.name}</b> rückt vor<br><span style="color:gray">(${data.from.row},${data.from.col}) → (${data.to.row},${data.to.col})</span>`;
        await new Promise(r => setTimeout(r, 1500));
    }
}

export function hidePreview() {
    if (previewContainer) previewContainer.style.display = 'none';
    if (previewLeftEl) { previewLeftEl.container.style.display = ''; }
    if (previewRightEl) { previewRightEl.container.style.display = ''; }
    if (previewResultEl) previewResultEl.innerHTML = '';
}

// ─── Unit Panel ───

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
    if (portraitEl) { portraitEl.textContent = ''; portraitEl.style.background = '#eee'; }
    if (typeEl) typeEl.textContent = '';
    if (hpEl) hpEl.textContent = '';
    if (maxHpEl) maxHpEl.textContent = '';
    if (mpEl) mpEl.textContent = '';
    if (maxMpEl) maxMpEl.textContent = '';
    if (manaEl) manaEl.textContent = '';
    if (maxManaEl) maxManaEl.textContent = '';
    if (attackEl) attackEl.textContent = '';
    if (defenseEl) defenseEl.textContent = '';
    if (weaponEl) weaponEl.textContent = '';
    if (spellsEl) spellsEl.innerHTML = '';
    if (actionPanelEl) actionPanelEl.innerHTML = '';
}

export function fillUnitPanel(unit) {
    const { attack, defense } = calculateEffectiveStats(unit);

    if (titleEl) titleEl.textContent = unit.name;
    if (portraitEl) {
        portraitEl.textContent = unit.portrait || '👤';
        portraitEl.style.background = unit.color || '#eee';
    }
    if (typeEl) typeEl.textContent = unit.type || ((unit.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf');
    if (hpEl) hpEl.textContent = unit.hp;
    if (maxHpEl) maxHpEl.textContent = unit.maxHp;
    if (mpEl) mpEl.textContent = unit.mp;
    if (maxMpEl) maxMpEl.textContent = unit.maxMp;
    if (manaEl) manaEl.textContent = unit.mana !== undefined ? unit.mana : '—';
    if (maxManaEl) maxManaEl.textContent = unit.maxMana !== undefined ? unit.maxMana : '—';
    if (attackEl) attackEl.textContent = attack;
    if (defenseEl) defenseEl.textContent = defense;
    if (weaponEl) weaponEl.textContent = unit.weapon ? WEAPON_NAMES[unit.weapon] || unit.weapon : '—';

    // Spell-Buttons im Detail-Panel (nur für angezeigte Einheit, nicht Aktion)
    if (spellsEl) {
        spellsEl.innerHTML = '';
        if (unit.spells && unit.spells.length > 0 && unit.team === 'player') {
            const spellsTitle = document.createElement('h4');
            spellsTitle.textContent = 'Zauber';
            spellsTitle.style.margin = '10px 0 5px 0';
            spellsEl.appendChild(spellsTitle);

            unit.spells.forEach((spell) => {
                const spellInfo = document.createElement('div');
                spellInfo.style.cssText = 'font-size:12px;margin:2px 0;padding:2px 4px;background:#f5f5f5;border-radius:3px;';
                const costLabel = spell.manaCost ? `${spell.manaCost} Mana` : (spell.mpCost ? `${spell.mpCost} MP` : '');
                spellInfo.textContent = `${spell.name} (${costLabel})`;
                spellsEl.appendChild(spellInfo);
            });
        }
    }

    // Aktions-Panel aktualisieren
    showActionPanel(unit);
}

export function checkAllUnitsExhausted() {
    const playerUnits = getPlayerUnits();
    const allExhausted = playerUnits.every(unit => unit.hasMoved || unit.turnState === 'acted');
    if (allExhausted) {
        log('Keine Einheit mehr zu bewegen. Neue Runde mit (Enter).', 'error');
    }
}

export function getNextUnitButton() {
    return document.getElementById('next-unit-button');
}

export function updateTerrainInfo(cell, terrainTypes) {
    if (!terrainInfoText) return;
    const terrain = terrainTypes[cell.type];
    terrainInfoText.textContent = terrain ? terrain.name : cell.type;
    if (terrainStatsEl && terrain) {
        const defSign = terrain.defenseBonus >= 0 ? '+' : '';
        const costText = terrain.movementCost === Infinity ? '—' : terrain.movementCost;
        terrainStatsEl.innerHTML = `<span>MP: ${costText}</span> <span>Verteidigung: ${defSign}${terrain.defenseBonus}</span>`;
    }
}

export function destroyCombatUI() {
    if (container && container.parentNode) container.parentNode.removeChild(container);
    if (previewContainer && previewContainer.parentNode) previewContainer.parentNode.removeChild(previewContainer);
    if (cursorSymbolEl && cursorSymbolEl.parentNode) cursorSymbolEl.parentNode.removeChild(cursorSymbolEl);
    container = null;
    previewContainer = null;
    cursorSymbolEl = null;
    titleEl = portraitEl = typeEl = hpEl = maxHpEl = mpEl = maxMpEl = manaEl = maxManaEl = attackEl = defenseEl = weaponEl = spellsEl = null;
    terrainInfoText = terrainStatsEl = null;
    previewLeftEl = previewRightEl = previewTitleEl = previewBodyEl = previewResultEl = previewVsEl = null;
    actionPanelEl = null;
    _onActionAttack = _onActionWait = _onActionMove = null;
}

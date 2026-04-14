import { getPlayerUnits, getEnemyUnits, applyEffectToUnit } from '../entities/units.js';
import { log } from '../engine/console.js';

export let onSpellCast = null;
export let onSpellSelect = null;

export function setSpellCastCallback(callback) {
    onSpellCast = callback;
}

export function setSpellSelectCallback(callback) {
    onSpellSelect = callback;
}

export function clearUnitPanel() {
    document.getElementById('unit-title').textContent = 'Einheiten-Details';
    document.getElementById('unit-type').textContent = '';
    document.getElementById('unit-hp').textContent = '';
    document.getElementById('unit-max-hp').textContent = '';
    document.getElementById('unit-mp').textContent = '';
    document.getElementById('unit-max-mp').textContent = '';
    document.getElementById('unit-attack').textContent = '';
    document.getElementById('unit-defense').textContent = '';
    
    const spellsContainer = document.getElementById('unit-spells');
    if (spellsContainer) spellsContainer.innerHTML = '';
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

export function fillUnitPanel(unit) {
    const { attack, defense } = calculateEffectiveStats(unit);
    
    document.getElementById('unit-title').textContent = unit.name;
    document.getElementById('unit-type').textContent = unit.type || ((unit.range || 1) > 1 ? 'Fernkampf' : 'Nahkampf');
    document.getElementById('unit-hp').textContent = unit.hp;
    document.getElementById('unit-max-hp').textContent = unit.maxHp;
    document.getElementById('unit-mp').textContent = unit.mp;
    document.getElementById('unit-max-mp').textContent = unit.maxMp;
    document.getElementById('unit-attack').textContent = attack;
    document.getElementById('unit-defense').textContent = defense;
    
    const spellsContainer = document.getElementById('unit-spells');
    if (spellsContainer) {
        spellsContainer.innerHTML = '';
        
        if (unit.spells && unit.spells.length > 0) {
            const spellsTitle = document.createElement('h4');
            spellsTitle.textContent = 'Zauber';
            spellsTitle.style.margin = '10px 0 5px 0';
            spellsContainer.appendChild(spellsTitle);
            
            unit.spells.forEach((spell, index) => {
                const spellButton = document.createElement('button');
                spellButton.className = 'spell-button';
                spellButton.textContent = `${spell.name} (${spell.mpCost} MP)`;
                spellButton.title = spell.target === 'ally' ? 'Verbündeter stärken' : 'Feind schwächen';
                spellButton.id = `spell-btn-${index}`;
                
                if (unit.mp < spell.mpCost) {
                    spellButton.disabled = true;
                    spellButton.style.opacity = '0.5';
                }
                
                spellButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('Spell button clicked:', spell.name, 'on unit:', unit.name);
                    if (onSpellSelect) {
                        onSpellSelect(unit, spell);
                    }
                });
                
                spellsContainer.appendChild(spellButton);
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
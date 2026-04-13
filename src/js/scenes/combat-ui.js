import { getPlayerUnits } from '../entities/units.js';
import { log } from '../engine/console.js';

export function clearUnitPanel() {
    document.getElementById('unit-title').textContent = 'Einheiten-Details';
    document.getElementById('unit-type').textContent = '';
    document.getElementById('unit-hp').textContent = '';
    document.getElementById('unit-max-hp').textContent = '';
    document.getElementById('unit-mp').textContent = '';
    document.getElementById('unit-max-mp').textContent = '';
    document.getElementById('unit-attack').textContent = '';
    document.getElementById('unit-defense').textContent = '';
}

export function fillUnitPanel(unit) {
    document.getElementById('unit-title').textContent = unit.name;
    document.getElementById('unit-type').textContent = 'Nahkampf';
    document.getElementById('unit-hp').textContent = unit.hp;
    document.getElementById('unit-max-hp').textContent = unit.maxHp;
    document.getElementById('unit-mp').textContent = unit.mp;
    document.getElementById('unit-max-mp').textContent = unit.maxMp;
    document.getElementById('unit-attack').textContent = unit.attack;
    document.getElementById('unit-defense').textContent = unit.defense;
}

export function checkAllUnitsExhausted() {
    const playerUnits = getPlayerUnits();
    const allExhausted = playerUnits.every(unit => unit.mp === 0);
    if (allExhausted) {
        log('Keine Einheit mehr zu bewegen. Neue Runde mit (Enter).', 'error');
    }
}
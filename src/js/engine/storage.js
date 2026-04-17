// storage.js
// Verwaltet das Speichern und Laden des Spielstands im LocalStorage

const SAVE_KEY = 'siGamesSave';
const GLOBAL_KEY = 'siGamesGlobal';
const SLOTS_KEY = 'siGamesSaveSlots';
const MAX_SLOTS = 3;

// Aktiver Slot (wird beim Laden/Speichern gesetzt)
let currentSlot = null;

// Speichert den aktuellen Spielstand im LocalStorage (Legacy, für aktiven Slot)
export function saveGame(playerData) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(playerData));
    console.log('Spielstand gespeichert!');
}

// Lädt den Spielstand aus dem LocalStorage (Legacy)
export function loadGame() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        console.log('Spielstand geladen!');
        return JSON.parse(savedData);
    }
    console.log('Kein Spielstand gefunden.');
    return null;
}

// Setzt den Spielstand zurück
export function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    console.log('Spielstand zurückgesetzt!');
}

// Lädt globalen State (Reputation, Orbs, freigeschaltete Missionen)
export function loadGlobalState() {
    const data = localStorage.getItem(GLOBAL_KEY);
    if (data) return JSON.parse(data);
    return {
        reputation: 0,
        orbs: 0,
        unlockedMissions: ['mission_01'],
        hubData: {
            heroLevels: {},
            heroEquipment: {}
        },
        currentMission: 'mission_01',
        playTime: 0
    };
}

// Speichert globale Rewards nach Missionsende
export function saveMissionRewards(reputation, orbCount, missionId) {
    const state = loadGlobalState();
    state.reputation += reputation;
    state.orbs += orbCount;
    if (!state.unlockedMissions) state.unlockedMissions = [];
    state.currentMission = missionId;
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(state));
    console.log(`Reputation: +${reputation}, Orbs: +${orbCount} — Gesamt: ${state.reputation} Rep, ${state.orbs} Orbs`);
}

// Lädt Hub-Daten (Helden-Level, Ausrüstung)
export function loadHubData() {
    const state = loadGlobalState();
    return state.hubData || { heroLevels: {}, heroEquipment: {} };
}

// Speichert Hub-Daten (Helden-Level, Ausrüstung)
export function saveHubData(hubData) {
    const state = loadGlobalState();
    state.hubData = hubData;
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(state));
}

// Setzt den globalen State zurück
export function resetGlobalState() {
    localStorage.removeItem(GLOBAL_KEY);
    console.log('Globaler State zurückgesetzt!');
}

// ===== SPIELSTAND-SLOTS SYSTEM =====

// Lädt alle 3 Spielstand-Slots
export function loadSaveSlots() {
    const data = localStorage.getItem(SLOTS_KEY);
    if (data) {
        return JSON.parse(data);
    }
    // Initialisiere leere Slots
    return [
        { slot: 1, empty: true },
        { slot: 2, empty: true },
        { slot: 3, empty: true }
    ];
}

// Speichert einen Slot
export function saveToSlot(slotNumber, saveData) {
    if (slotNumber < 1 || slotNumber > MAX_SLOTS) {
        console.error(`Ungültige Slot-Nummer: ${slotNumber}`);
        return false;
    }

    const slots = loadSaveSlots();
    const slotIndex = slotNumber - 1;

    const state = loadGlobalState();
    const timestamp = new Date().toISOString();

    slots[slotIndex] = {
        slot: slotNumber,
        empty: false,
        timestamp: timestamp,
        playTime: state.playTime || 0,
        currentMission: state.currentMission || 'mission_01',
        reputation: state.reputation || 0,
        orbs: state.orbs || 0,
        hubData: state.hubData || { heroLevels: {}, heroEquipment: {} },
        unlockedMissions: state.unlockedMissions || ['mission_01']
    };

    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
    currentSlot = slotNumber;
    console.log(`Spielstand in Slot ${slotNumber} gespeichert!`);
    return true;
}

// Lädt einen Slot
export function loadFromSlot(slotNumber) {
    if (slotNumber < 1 || slotNumber > MAX_SLOTS) {
        console.error(`Ungültige Slot-Nummer: ${slotNumber}`);
        return false;
    }

    const slots = loadSaveSlots();
    const slot = slots[slotNumber - 1];

    if (slot.empty) {
        console.log(`Slot ${slotNumber} ist leer.`);
        return false;
    }

    // Lade den Slot in den aktiven Global-State
    const state = {
        reputation: slot.reputation || 0,
        orbs: slot.orbs || 0,
        unlockedMissions: slot.unlockedMissions || ['mission_01'],
        hubData: slot.hubData || { heroLevels: {}, heroEquipment: {} },
        currentMission: slot.currentMission || 'mission_01',
        playTime: slot.playTime || 0
    };

    localStorage.setItem(GLOBAL_KEY, JSON.stringify(state));
    currentSlot = slotNumber;
    console.log(`Spielstand aus Slot ${slotNumber} geladen!`);
    return true;
}

// Löscht einen Slot
export function deleteSlot(slotNumber) {
    if (slotNumber < 1 || slotNumber > MAX_SLOTS) {
        console.error(`Ungültige Slot-Nummer: ${slotNumber}`);
        return false;
    }

    const slots = loadSaveSlots();
    slots[slotNumber - 1] = { slot: slotNumber, empty: true };
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));

    if (currentSlot === slotNumber) {
        currentSlot = null;
    }

    console.log(`Slot ${slotNumber} gelöscht!`);
    return true;
}

// Gibt den aktuell aktiven Slot zurück
export function getCurrentSlot() {
    return currentSlot;
}

// Setzt den aktiven Slot
export function setCurrentSlot(slotNumber) {
    currentSlot = slotNumber;
}

// Formatiert Spielzeit für Anzeige (Sekunden → HH:MM:SS)
export function formatPlayTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Formatiert Zeitstempel für Anzeige
export function formatTimestamp(isoString) {
    if (!isoString) return 'Unbekannt';
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Mission-Name mapping für Anzeige
const missionNames = {
    'mission_01': 'Mission 1: Das Jubiläum'
};

export function getMissionDisplayName(missionId) {
    return missionNames[missionId] || missionId || 'Unbekannte Mission';
}

// storage.js
// Verwaltet das Speichern und Laden des Spielstands im LocalStorage

const SAVE_KEY = 'siGamesSave';
const GLOBAL_KEY = 'siGamesGlobal';

// Speichert den aktuellen Spielstand im LocalStorage
export function saveGame(playerData) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(playerData));
    console.log('Spielstand gespeichert!');
}

// Lädt den Spielstand aus dem LocalStorage
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
        }
    };
}

// Speichert globale Rewards nach Missionsende
export function saveMissionRewards(reputation, orbCount, missionId) {
    const state = loadGlobalState();
    state.reputation += reputation;
    state.orbs += orbCount;
    if (!state.unlockedMissions) state.unlockedMissions = [];
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
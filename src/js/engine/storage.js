// storage.js
// Verwaltet das Speichern und Laden des Spielstands im LocalStorage

const SAVE_KEY = 'siGamesSave';

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
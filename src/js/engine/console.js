// console.js
// Verwaltet die Info-Konsole für Aktions-Logs

let consoleOutput;

// Initialisiert die Konsole
export function initConsole() {
    consoleOutput = document.getElementById('console-output');
    if (!consoleOutput) {
        console.error('Konsole konnte nicht initialisiert werden: Element #console-output nicht gefunden.');
    }
}

// Fügt eine Nachricht zur Konsole hinzu
export function log(message) {
    if (!consoleOutput) {
        console.error('Konsole nicht initialisiert.');
        return;
    }

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    consoleOutput.appendChild(messageElement);

    // Automatisch nach unten scrollen
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// Setzt die Einheiten-Details
export function setUnitDetails(details) {
    const unitInfo = document.getElementById('unit-info');
    if (unitInfo) {
        unitInfo.textContent = details;
    }
}
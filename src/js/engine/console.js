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
export function log(message, type = 'default') {
    if (!consoleOutput) {
        console.error('Konsole nicht initialisiert.');
        return;
    }

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    
    // Farbcodierung basierend auf dem Typ
    switch (type) {
        case 'movement':
            messageElement.style.color = 'blue';
            break;
        case 'attack':
            messageElement.style.color = 'green';
            messageElement.style.fontWeight = 'bold';
            break;
        case 'enemy':
            messageElement.style.color = 'red';
            messageElement.style.fontWeight = 'bold';
            break;
        case 'error':
            messageElement.style.color = '#ff6b6b';
            break;
        default:
            messageElement.style.color = 'black';
            break;
    }
    
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
// dialog.js
// Verwaltet das Dialog-Overlay

let dialogOverlay;
let dialogText;
let currentDialogIndex = 0;
let dialogData = [];

// Initialisiert das Dialog-Overlay
export function initDialog() {
    dialogOverlay = document.getElementById('dialog-overlay');
    dialogText = document.getElementById('dialog-text');
    
    if (!dialogOverlay || !dialogText) {
        console.error('Dialog-Overlay oder Dialog-Text nicht gefunden.');
        return;
    }
    
    // Event-Listener für Klicks auf das Overlay
    dialogOverlay.addEventListener('click', () => {
        currentDialogIndex++;
        if (currentDialogIndex < dialogData.length) {
            showDialog(dialogData[currentDialogIndex]);
        } else {
            dialogOverlay.style.display = 'none';
        }
    });
}

// Zeigt einen Dialog an
export function playDialog(data) {
    if (!dialogOverlay || !dialogText) {
        console.error('Dialog-Overlay oder Dialog-Text nicht initialisiert.');
        return;
    }
    
    dialogData = data;
    currentDialogIndex = 0;
    dialogOverlay.style.display = 'flex';
    showDialog(dialogData[currentDialogIndex]);
}

// Zeigt eine einzelne Dialogzeile an
function showDialog(dialog) {
    if (!dialogText) {
        console.error('Dialog-Text nicht initialisiert.');
        return;
    }
    
    dialogText.textContent = dialog.text;
}
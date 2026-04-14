// dialog.js
// Verwaltet das Dialog-Overlay

let overlay = null;
let dialogTextEl = null;
let currentDialogIndex = 0;
let dialogData = [];

export function initDialog() {
    overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:none;flex-direction:column;justify-content:center;align-items:center;z-index:1000;';

    const box = document.createElement('div');
    box.id = 'dialog-box';
    box.style.cssText = 'display:flex;align-items:center;background:#fff;border:2px solid #333;padding:20px;border-radius:10px;width:80%;max-width:600px;';

    const left = document.createElement('div');
    left.id = 'left-portrait';
    left.style.cssText = 'width:100px;height:100px;border:1px solid #ccc;margin:0 20px;';

    dialogTextEl = document.createElement('div');
    dialogTextEl.id = 'dialog-text';
    dialogTextEl.style.cssText = 'flex:1;font-size:18px;text-align:center;';

    const right = document.createElement('div');
    right.id = 'right-portrait';
    right.style.cssText = 'width:100px;height:100px;border:1px solid #ccc;margin:0 20px;';

    box.appendChild(left);
    box.appendChild(dialogTextEl);
    box.appendChild(right);
    overlay.appendChild(box);

    const hint = document.createElement('div');
    hint.id = 'dialog-hint';
    hint.textContent = 'Klicken zum Fortfahren';
    hint.style.cssText = 'color:white;margin-top:20px;font-size:16px;';
    overlay.appendChild(hint);

    overlay.addEventListener('click', () => {
        currentDialogIndex++;
        if (currentDialogIndex < dialogData.length) {
            showDialog(dialogData[currentDialogIndex]);
        } else {
            overlay.style.display = 'none';
        }
    });

    document.body.appendChild(overlay);
}

export function playDialog(data) {
    if (!overlay || !dialogTextEl) return;

    dialogData = data;
    currentDialogIndex = 0;
    overlay.style.display = 'flex';
    showDialog(dialogData[currentDialogIndex]);
}

function showDialog(dialog) {
    if (!dialogTextEl) return;
    dialogTextEl.textContent = dialog.text;
}

export function destroyDialog() {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
    overlay = null;
    dialogTextEl = null;
}

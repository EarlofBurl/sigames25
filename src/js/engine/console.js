// console.js
// Verwaltet die Info-Konsole für Aktions-Logs

let consoleOutput = null;
let container = null;

export function initConsole(parent) {
    container = document.createElement('div');
    container.id = 'action-console';
    container.style.cssText = 'background:#fff;padding:8px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;';

    const title = document.createElement('h3');
    title.textContent = 'Aktions-Log';
    title.style.margin = '0 0 4px 0';
    container.appendChild(title);

    consoleOutput = document.createElement('div');
    consoleOutput.id = 'console-output';
    consoleOutput.style.cssText = 'flex:1;overflow-y:auto;font-size:13px;';
    container.appendChild(consoleOutput);

    if (parent) parent.appendChild(container);
    else document.body.appendChild(container);
}

export function log(message, type = 'default') {
    if (!consoleOutput) return;

    const el = document.createElement('div');
    el.textContent = message;

    switch (type) {
        case 'movement': el.style.color = 'blue'; break;
        case 'attack': el.style.color = 'green'; el.style.fontWeight = 'bold'; break;
        case 'enemy': el.style.color = 'red'; el.style.fontWeight = 'bold'; break;
        case 'error': el.style.color = '#ff6b6b'; break;
        default: el.style.color = 'black'; break;
    }

    consoleOutput.appendChild(el);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

export function destroyConsole() {
    if (container && container.parentNode) {
        container.parentNode.removeChild(container);
    }
    container = null;
    consoleOutput = null;
}

// dialog.js
// Verwaltet das Dialog-Overlay mit InkJS-Support

import { Story } from 'inkjs/engine/Story';
import { heroes, enemies } from '../data/characters.js';

let overlay = null;
let dialogTextEl = null;
let leftPortraitEl = null;
let rightPortraitEl = null;
let choicesEl = null;
let hint = null;
let currentDialogIndex = 0;
let dialogData = [];
let triggerQueue = [];
let currentStory = null;
let storyResolve = null;

function getPortraitHtml(portraitPath, size = 360) {
    if (portraitPath && portraitPath.includes('/')) {
        return `<img src="${portraitPath}" style="width:${size}px;height:${size}px;object-fit:cover;" />`;
    }
    return `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:#333;color:#fff;font-size:${size/2}px;">?</div>`;
}

export function initDialog() {
    overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:none;flex-direction:column;justify-content:center;align-items:center;z-index:1000;cursor:pointer;';

    const box = document.createElement('div');
    box.id = 'dialog-box';
    box.style.cssText = 'display:flex;align-items:flex-start;background:#2a2a3a;border:4px solid #666;padding:30px;border-radius:16px;width:90%;max-width:1400px;min-height:280px;box-shadow:0 12px 48px rgba(0,0,0,0.6);';

    leftPortraitEl = document.createElement('div');
    leftPortraitEl.id = 'left-portrait';
    leftPortraitEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:360px;flex-shrink:0;';

    const leftPortraitImg = document.createElement('div');
    leftPortraitImg.id = 'left-portrait-img';
    leftPortraitImg.style.cssText = 'width:360px;height:360px;border:3px solid #888;border-radius:12px;overflow:hidden;';

    const leftNameEl = document.createElement('div');
    leftNameEl.id = 'left-name';
    leftNameEl.style.cssText = 'margin-top:10px;font-size:18px;font-weight:bold;color:#f0f0f0;text-align:center;';

    leftPortraitEl.appendChild(leftPortraitImg);
    leftPortraitEl.appendChild(leftNameEl);

    const textContainer = document.createElement('div');
    textContainer.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:360px;padding:0 20px;';

    dialogTextEl = document.createElement('div');
    dialogTextEl.id = 'dialog-text';
    dialogTextEl.style.cssText = 'flex:1;font-size:26px;text-align:left;color:#f0f0f0;line-height:1.6;padding:15px 20px;width:100%;';

    choicesEl = document.createElement('div');
    choicesEl.id = 'dialog-choices';
    choicesEl.style.cssText = 'display:flex;flex-direction:column;gap:10px;margin-top:20px;width:100%;';

    textContainer.appendChild(dialogTextEl);
    textContainer.appendChild(choicesEl);

    rightPortraitEl = document.createElement('div');
    rightPortraitEl.id = 'right-portrait';
    rightPortraitEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:360px;flex-shrink:0;';

    const rightPortraitImg = document.createElement('div');
    rightPortraitImg.id = 'right-portrait-img';
    rightPortraitImg.style.cssText = 'width:360px;height:360px;border:3px solid #888;border-radius:12px;overflow:hidden;';

    const rightNameEl = document.createElement('div');
    rightNameEl.id = 'right-name';
    rightNameEl.style.cssText = 'margin-top:10px;font-size:18px;font-weight:bold;color:#f0f0f0;text-align:center;';

    rightPortraitEl.appendChild(rightPortraitImg);
    rightPortraitEl.appendChild(rightNameEl);

    box.appendChild(leftPortraitEl);
    box.appendChild(textContainer);
    box.appendChild(rightPortraitEl);
    overlay.appendChild(box);

    hint = document.createElement('div');
    hint.id = 'dialog-hint';
    hint.textContent = 'Klicken zum Fortfahren';
    hint.style.cssText = 'color:#aaa;margin-top:25px;font-size:16px;';
    overlay.appendChild(hint);

    overlay.addEventListener('click', (e) => {
        if (e.target.closest('#dialog-choices button')) return;
        advanceStory();
    });

    document.body.appendChild(overlay);
}

export function playDialog(data) {
    if (!overlay || !dialogTextEl) return;

    if (currentStory) {
        triggerQueue.push(...data);
        return;
    }

    if (dialogData.length > 0 && overlay.style.display === 'flex') {
        triggerQueue.push(...data);
        return;
    }

    dialogData = data;
    currentDialogIndex = 0;
    currentStory = null;
    overlay.style.display = 'flex';
    leftPortraitEl.style.display = 'none';
    rightPortraitEl.style.display = 'none';
    choicesEl.innerHTML = '';
    hint.style.display = 'block';
    showDialog(dialogData[currentDialogIndex]);
}

export async function playKnot(storyFile, knotName, variables = {}) {
    if (!overlay || !dialogTextEl) return;

    return new Promise((resolve) => {
        storyResolve = resolve;
        currentStory = null;
        choicesEl.innerHTML = '';
        hint.style.display = 'none';

        try {
            fetch(storyFile)
                .then(response => response.json())
                .then(json => {
                    currentStory = new Story(json);

                    for (const [key, value] of Object.entries(variables)) {
                        currentStory.variablesState.$set(key, value);
                    }

                    if (knotName && currentStory.knots[knotName]) {
                        currentStory.ChoosePathString(knotName);
                    }

                    overlay.style.display = 'flex';
                    continueStory();
                })
                .catch(err => {
                    console.error('Fehler beim Laden der Ink-Story:', err);
                    overlay.style.display = 'none';
                    if (storyResolve) storyResolve();
                });
        } catch (err) {
            console.error('Fehler beim Initialisieren der Ink-Story:', err);
            overlay.style.display = 'none';
            if (storyResolve) storyResolve();
        }
    });
}

function continueStory() {
    if (!currentStory) return;

    let text = '';
    while (currentStory.canContinue) {
        text += currentStory.Continue();
    }

    text = text.trim();
    dialogTextEl.textContent = text;

    let leftKey = null, rightKey = null;
    let textAlign = 'left';

    currentStory.currentTags.forEach(tag => {
        if (tag.startsWith('speaker:')) {
            leftKey = tag.split(':')[1].trim();
        } else if (tag.startsWith('responder:')) {
            rightKey = tag.split(':')[1].trim();
        }
    });

    if (leftKey || rightKey) {
        if (leftKey) {
            const leftChar = heroes[leftKey] || enemies[leftKey];
            if (leftChar) {
                leftPortraitEl.style.display = 'flex';
                leftPortraitEl.querySelector('#left-portrait-img').innerHTML = getPortraitHtml(leftChar.portrait, 360);
                leftPortraitEl.querySelector('#left-name').textContent = leftChar.name;
            }
            textAlign = 'left';
        } else {
            leftPortraitEl.style.display = 'none';
        }

        if (rightKey) {
            const rightChar = heroes[rightKey] || enemies[rightKey];
            if (rightChar) {
                rightPortraitEl.style.display = 'flex';
                rightPortraitEl.querySelector('#right-portrait-img').innerHTML = getPortraitHtml(rightChar.portrait, 360);
                rightPortraitEl.querySelector('#right-name').textContent = rightChar.name;
            }
            textAlign = 'right';
        } else {
            rightPortraitEl.style.display = 'none';
        }
    } else {
        leftPortraitEl.style.display = 'none';
        rightPortraitEl.style.display = 'none';
    }

    dialogTextEl.style.textAlign = textAlign;
    showChoices();
}

function showChoices() {
    if (!currentStory) return;

    choicesEl.innerHTML = '';

    if (currentStory.currentChoices.length > 0) {
        hint.style.display = 'none';
        currentStory.currentChoices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.textContent = choice.text;
            btn.style.cssText = 'padding:12px 20px;background:#3a3a5a;border:2px solid #666;color:#f0f0f0;border-radius:8px;cursor:pointer;font-size:16px;transition:all 0.2s;';
            btn.onmouseover = () => { btn.style.background = '#4a4a7a'; };
            btn.onmouseout = () => { btn.style.background = '#3a3a5a'; };
            btn.onclick = (e) => {
                e.stopPropagation();
                currentStory.ChooseChoiceIndex(choice.index);
                choicesEl.innerHTML = '';
                continueStory();
            };
            choicesEl.appendChild(btn);
        });
    } else {
        hint.style.display = 'block';
    }
}

function advanceStory() {
    if (currentStory) {
        if (currentStory.currentChoices.length > 0) return;

        currentStory.Continue();
        if (currentStory.canContinue || currentStory.currentChoices.length > 0) {
            continueStory();
        } else {
            overlay.style.display = 'none';
            if (storyResolve) storyResolve();
            storyResolve = null;
            processTriggerQueue();
        }
    } else {
        currentDialogIndex++;
        if (currentDialogIndex < dialogData.length) {
            showDialog(dialogData[currentDialogIndex]);
        } else {
            overlay.style.display = 'none';
            processTriggerQueue();
        }
    }
}

function processTriggerQueue() {
    if (triggerQueue.length > 0 && !currentStory) {
        const next = triggerQueue.shift();
        playDialog([next]);
    }
}

function showDialog(dialog) {
    if (!dialogTextEl) return;

    let leftSrc = null, leftName = '';
    let rightSrc = null, rightName = '';
    let textAlign = 'left';

    if (dialog.character) {
        const allHeroes = Object.values(heroes);
        const allEnemies = Object.values(enemies);
        const char = allHeroes.find(c => c.name === dialog.character) ||
                     allEnemies.find(c => c.name === dialog.character);
        if (char) {
            leftSrc = char.portrait;
            leftName = char.name;
            textAlign = 'left';
        }
    } else if (dialog.portrait) {
        leftSrc = dialog.portrait;
    }

    if (leftSrc) {
        leftPortraitEl.style.display = 'flex';
        leftPortraitEl.querySelector('#left-portrait-img').innerHTML = getPortraitHtml(leftSrc, 360);
        leftPortraitEl.querySelector('#left-name').textContent = leftName;
        rightPortraitEl.style.display = 'none';
    } else {
        leftPortraitEl.style.display = 'none';
        rightPortraitEl.style.display = 'none';
    }

    dialogTextEl.style.textAlign = textAlign;
    dialogTextEl.textContent = dialog.text || dialog;
}

export function destroyDialog() {
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
    overlay = null;
    dialogTextEl = null;
    leftPortraitEl = null;
    rightPortraitEl = null;
    choicesEl = null;
    hint = null;
    currentStory = null;
    storyResolve = null;
}

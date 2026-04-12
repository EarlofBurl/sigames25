// scene-manager.js
// Verwaltet den Wechsel zwischen verschiedenen Szenen

export class SceneManager {
    constructor() {
        this.scenes = {};
        this.currentScene = null;
        this.appElement = document.getElementById('app');
    }

    // Fügt eine neue Szene hinzu
    addScene(name, scene) {
        this.scenes[name] = scene;
    }

    // Wechselt zu einer bestimmten Szene
    switchTo(name) {
        if (this.scenes[name]) {
            if (this.currentScene && this.currentScene.onExit) {
                this.currentScene.onExit();
            }

            this.appElement.innerHTML = '';
            this.currentScene = this.scenes[name];

            if (this.currentScene.onEnter) {
                this.currentScene.onEnter();
            }
        } else {
            console.error(`Szene ${name} nicht gefunden!`);
        }
    }
}
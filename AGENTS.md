# AGENTS.md — SI-Games 25

## Dev Commands

```sh
npm run dev       # dev server on port 8080
npm run build     # production build → dist/
```

No test, lint, or typecheck commands exist.

## Architecture Quick Reference

- **Entry**: `src/index.html` loads `src/js/main.js` → creates Phaser Game, registers scenes
- **Scene flow**: `main.js` → Phaser Game → `HubScene` / `CombatScene` (Phaser.Scene)
- **Rendering**: `CombatScene` uses Phaser Graphics (`this.add.graphics()`) for grid, units, fog. Text-Kosten-Labels via `this.add.text()` mit depth 10.
- **Input**: Phaser Input System (`this.input.on('pointerdown')`, `this.input.keyboard`). Keine DOM-Events.
- **UI**: DOM-Elemente (Console, Dialog, Info-Panel) werden dynamisch von den UI-Modulen erstellt und in `shutdown()` entfernt. NICHT in `index.html` hardkodiert.
- **Data/logic split**: `src/js/data/` holds pure data (terrain, missions); `src/js/engine/` and `src/js/entities/` hold logic
- **Missions**: each mission in `src/js/data/missions/`, collected by `missions/index.js`. Mission data is passed via `game.registry.set('mission', ...)`.
- **State**: modules use exported `let` variables for shared mutable state (e.g. `playerUnits`, `grid`). This is intentional.

## Key Gotchas

- **Phaser-Renderer: `Phaser.AUTO` (WebGL), NICHT `Phaser.CANVAS`.** Der Canvas-Renderer in Phaser 3.90.0 hat einen Bug mit Graphics-Objekten – `fillRect()` zeichnet nichts.
- **CSS-Farben zu Hex**: `renderer.js` enthält `cssToHex()` zum Konvertieren von CSS-Strings (`'#8bc34a'`) zu Integer-Hex (`0x8bc34a`) für `fillStyle()`.
- **Renderer-Modul**: `renderer.js` nutzt ein Phaser Graphics-Objekt (`gfx`) als Modulvariable. `initRenderer(gfx, scene, mission)` wird einmal aufgerufen, danach arbeiten alle Zeichenfunktionen über das gespeicherte Graphics-Objekt.
- **Kosten-Labels**: `addCostLabel()` erzeugt `this.add.text()`-Objekte mit depth 10, die bei jedem `drawGrid()`-Aufruf neu erstellt werden.
- **Phaser Canvas-Größe**: 500×500 (10×10 Grid × 50px). Weltkoordinaten = Pixelkoordinaten. `pointer.x / 50 = col`, `pointer.y / 50 = row`.
- **Kein SceneManager mehr**: `engine/scene-manager.js` gelöscht. Scene-Wechsel über `this.scene.start('HubScene')` / `this.scene.start('CombatScene')`.
- **Missions-Daten via Registry**: `main.js` → `game.registry.set('mission', mission01)`. `CombatScene.init()` → `this.mission = (data && data.mission) || this.registry.get('mission')`.
- **Phaser shutdown()**: Beim Verlassen der CombatScene wird `shutdown()` aufgerufen (NICHT `onExit`). Alle UI-Module (console, dialog, combat-ui) werden dort zerstört.
- **TypeScript is installed but all source is `.js`**. No `.ts` files exist. Do not write `.ts` unless requested.
- **All comments and UI text are in German.**
- **No placeholder code**: never write `// TODO` or `// implement later`. Always generate complete, runnable code.
- **`docs/AGENT.md`** is the opencode instruction file (referenced by `.opencode/opencode.json`). Defines role, workflow, conventions.
- **`docs/plan.md`** tracks milestones. Always read it at session start. Mark completed tasks with `[x]`.
- **`docs/architecture.md`** may be slightly stale — trust actual source code over it.
- **`entities/hero.js`** und **`entities/enemy.js`** sind Legacy-Module — werden von `units.js` abgedeckt und sollen entfernt werden.

## Module Map

```
src/js/
├── main.js                    # Phaser Game-Boot, registriert HubScene + CombatScene
├── config.js                  # Phaser Game-Config (WebGL, pixelArt, 500x500)
├── engine/
│   ├── renderer.js            # Phaser Graphics-Zeichnung (grid, units, fog, highlights)
│   ├── input.js               # reine Utility: isPassable(), getMovementCost()
│   ├── combat-system.js       # damage calculation, counter-attacks (reine Logik)
│   ├── movement-system.js     # Dijkstra pathfinding, movement cost (reine Logik)
│   ├── visibility-system.js   # fog of war, sight calculation (reine Logik)
│   ├── enemy-ai.js            # aggro radius, pathfinding, auto-attack
│   ├── storage.js             # LocalStorage save/load (reine Logik)
│   ├── console.js             # action log UI (dynamisch erstellt/entfernt)
│   └── dialog.js              # dialog overlay (dynamisch erstellt/entfernt)
├── entities/
│   ├── hero.js                 # LEGACY — wird gelöscht
│   ├── enemy.js                # LEGACY — wird gelöscht
│   └── units.js                # player/enemy unit arrays, status, turn tracking
├── scenes/
│   ├── hub.js                  # HubScene (Phaser.Scene) — Titel + Buttons via this.add.text()
│   ├── combat.js               # CombatScene (Phaser.Scene) — Phaser Graphics + Input + Spiellogik
│   └── combat-ui.js            # unit panel, terrain info, spell UI (dynamisch erstellt/entfernt)
└── data/
    ├── terrain.js              # terrain types, costs, defense, sight mods, themes
    └── missions/
        ├── mission_01.js
        └── index.js
```

## Migrationsstatus (Vanilla → Phaser 3)

**Phase 0 (abgeschlossen):** Phaser 3 installiert, Game-Config, Vite, Assets-Ordner

**Phase 1 (abgeschlossen):** `main.js` → Phaser Game-Boot. HubScene + CombatScene → Phaser.Scene. SceneManager gelöscht.

**Phase 2 (abgeschlossen):**
- `renderer.js` → Phaser Graphics (`this.add.graphics()`). Canvas 2D API komplett ersetzt. WebGL-Renderer (Canvas-Renderer hat Bug).
- `combat.js` → Phaser Input (`this.input.on('pointerdown')`, `this.input.keyboard`). DOM-Events komplett entfernt.
- `input.js` → reine Utility-Funktionen (Keyboard/Maus-Handler entfernt).

**Phase 3 (abgeschlossen):**
- `console.js`, `dialog.js`, `combat-ui.js` → erzeugen eigene DOM-Elemente dynamisch, akzeptieren Parent-Element als Parameter
- `index.html` → nur noch `#top-bar` und `#app` als statische Elemente
- `combat.js` → init() erzeugt UI, shutdown() zerstört UI
- CSS bereinigt — Styles für entfernte Elemente gelöscht

**Nächster Schritt:** Phase 4 (KI-Entkopplung) oder Legacy-Dateien löschen (hero.js, enemy.js).

## Current Progress

Milestones 1–14 complete. M15 planned. Phaser-Migration Phase 0 + 1 + 2 + 3 abgeschlossen.

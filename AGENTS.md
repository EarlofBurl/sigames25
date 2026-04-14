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
- **Rendering**: `CombatScene` uses Phaser Tilemap (`make.tilemap()`) for terrain + Graphics overlay (`add.graphics()`) for fog, units, highlights. Text-Kosten-Labels via `add.text()` mit depth 10.
- **Input**: Phaser Input System (`this.input.on('pointerdown')`, `this.input.keyboard`). Keine DOM-Events.
- **UI**: DOM-Elemente (Console, Dialog, Info-Panel) werden dynamisch von den UI-Modulen erstellt und in `shutdown()` entfernt. NICHT in `index.html` hardkodiert.
- **Maps**: Tiled JSON (`public/assets/maps/*.tmj`) + Tileset-PNG (`public/assets/tileset.png`). Tile-IDs → Terrain-Namen via `TILE_TO_TERRAIN` in renderer.js.
- **Data/logic split**: `src/js/data/` holds pure data (terrain properties, missions); `src/js/engine/` and `src/js/entities/` hold logic
- **Missions**: each mission in `src/js/data/missions/`, collected by `missions/index.js`. Mission data is passed via `game.registry.set('mission', ...)`.
- **State**: units.js uses a single `state` object (nicht mehr `export let`). Funktionen arbeiten über das State-Objekt.

## Key Gotchas

- **Phaser-Renderer: `Phaser.AUTO` (WebGL), NICHT `Phaser.CANVAS`.** Der Canvas-Renderer in Phaser 3.90.0 hat einen Bug mit Graphics-Objekten.
- **Tilemap-Scale**: Tiled-Tiles sind 16×16, Spiel-Tiles 50×50. `tilemapLayer.setScale(50/16)`. Tile-Index +1 (firstgid=1) → Terrain-Name.
- **Renderer-Modul**: `renderer.js` erzeugt intern Tilemap + Graphics. `initRenderer(scene, mission)` wird einmal aufgerufen.
- **Kosten-Labels**: `addCostLabel()` erzeugt `scene.add.text()`-Objekte mit depth 10, die bei jedem `drawGrid()`-Aufruf neu erstellt werden.
- **Phaser Canvas-Größe**: 500×500 (10×10 Grid × 50px). Weltkoordinaten = Pixelkoordinaten. `pointer.x / 50 = col`, `pointer.y / 50 = row`.
- **Kein SceneManager mehr**: `engine/scene-manager.js` gelöscht. Scene-Wechsel über `this.scene.start('HubScene')` / `this.scene.start('CombatScene')`.
- **Missions-Daten via Registry**: `main.js` → `game.registry.set('mission', mission01)`. `CombatScene.init()` → `this.mission = (data && data.mission) || this.registry.get('mission')`.
- **Phaser shutdown()**: Beim Verlassen der CombatScene wird `shutdown()` aufgerufen (NICHT `onExit`). Alle UI-Module werden dort zerstört.
- **Kein `mapData.terrain` mehr**: Terrain-Daten kommen aus Tiled-JSON. Mission-JS enthält nur `mapFile`-Pfad.
- **TypeScript is installed but all source is `.js`**. No `.ts` files exist. Do not write `.ts` unless requested.
- **All comments and UI text are in German.**
- **No placeholder code**: never write `// TODO` or `// implement later`. Always generate complete, runnable code.
- **`docs/AGENT.md`** is the opencode instruction file (referenced by `.opencode/opencode.json`). Defines role, workflow, conventions.
- **`docs/plan.md`** tracks milestones. Always read it at session start. Mark completed tasks with `[x]`.
- **`docs/architecture.md`** may be slightly stale — trust actual source code over it.

## Module Map

```
src/js/
├── main.js                    # Phaser Game-Boot, registriert HubScene + CombatScene
├── config.js                  # Phaser Game-Config (WebGL, pixelArt, 500x500)
├── engine/
│   ├── renderer.js            # Tilemap (Terrain) + Graphics (Fog/Units/Highlights)
│   ├── input.js               # reine Utility: isPassable(), getMovementCost()
│   ├── combat-system.js       # damage calculation, counter-attacks (reine Logik)
│   ├── movement-system.js     # Dijkstra pathfinding, movement cost (reine Logik)
│   ├── visibility-system.js   # fog of war, sight calculation (reine Logik)
│   ├── enemy-ai.js            # aggro radius, pathfinding, auto-attack (Callback onAction)
│   ├── storage.js             # LocalStorage save/load (reine Logik)
│   ├── console.js             # action log UI (dynamisch erstellt/entfernt)
│   └── dialog.js              # dialog overlay (dynamisch erstellt/entfernt)
├── entities/
│   └── units.js               # State-Objekt + Funktionen (player/enemy units, turn tracking)
├── scenes/
│   ├── hub.js                  # HubScene (Phaser.Scene) — Titel + Buttons via add.text()
│   ├── combat.js               # CombatScene (Phaser.Scene) — preload Tilemap, create Spiellogik
│   └── combat-ui.js            # unit panel, terrain info, spell UI (dynamisch erstellt/entfernt)
└── data/
    ├── terrain.js              # terrain types, defense, sight mods, themes (keine Farben mehr)
    └── missions/
        ├── mission_01.js       # Mission-Daten (playerUnits, enemies, mapFile)
        └── index.js            # Mission-Index

public/assets/
├── tileset.png                 # Terrain-Tileset (16×16, 7 Tiles)
├── maps/
│   └── mission_01.tmj          # Tiled-JSON-Karte (10×10)
├── dialogs/                    # Ink-JSON (geplant)
└── sprites/                    # Pixel-Art-Sprites (geplant)
```

## Migrationsstatus (Vanilla → Phaser 3)

**Phase 0 (abgeschlossen):** Phaser 3 installiert, Game-Config, Vite, Assets-Ordner

**Phase 1 (abgeschlossen):** `main.js` → Phaser Game-Boot. HubScene + CombatScene → Phaser.Scene. SceneManager gelöscht.

**Phase 2 (abgeschlossen):**
- `renderer.js` → Phaser Graphics (`this.add.graphics()`). Canvas 2D API komplett ersetzt. WebGL-Renderer (Canvas-Renderer hat Bug).
- `combat.js` → Phaser Input (`this.input.on('pointerdown')`, `this.input.keyboard`). DOM-Events komplett entfernt.
- `input.js` → reine Utility-Funktionen.

**Phase 3 (abgeschlossen):**
- `console.js`, `dialog.js`, `combat-ui.js` → erzeugen eigene DOM-Elemente dynamisch
- `index.html` → nur noch `#top-bar` und `#app`

**Phase 4 (abgeschlossen):**
- `combat-system.js` + `enemy-ai.js` von `renderer.js` entkoppelt (Callback `onAction`)

**Phase 5 (abgeschlossen):**
- `units.js` → State-Objekt (`const state = {...}`), keine `export let` mehr
- `renderer.js` → Phaser Tilemap (`make.tilemap()`) statt Graphics für Terrain
- Mission-Daten → Tiled-JSON (`public/assets/maps/mission_01.tmj`)
- Tileset-PNG generiert (`public/assets/tileset.png`, 16×16, 7 Tiles)
- Legacy-Dateien gelöscht (`hero.js`, `enemy.js`)

**Nächster Schritt:** Meilenstein 15 (Siegbedingungen, XP/Leveling). Oder Pixel-Art-Tileset/Sprites erstellen.

## Current Progress

Milestones 1–14 complete. M15 planned. Phaser-Migration komplett abgeschlossen (Phasen 0–5).

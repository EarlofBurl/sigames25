# AGENTS.md — SI-Games 25

## Dev Commands

```sh
npm run build     # production build → dist/
```

**Der dev server (`npm run dev`) läuft immer. Starte ihn NICHT — prüfe nur den Build.**

No test, lint, or typecheck commands exist.

## Architecture Quick Reference

- **Entry**: `src/index.html` loads `src/js/main.js` → creates Phaser Game, registers scenes
- **Scene flow**: `main.js` → Phaser Game → `HubScene` / `CombatScene` / `TitleScene` (Phaser.Scene)
- **Rendering**: `CombatScene` uses Phaser Tilemap (`make.tilemap()`) for terrain + Graphics overlay (`add.graphics()`) for fog, units, highlights. Text-Kosten-Labels via `add.text()` mit depth 10.
- **Input**: Phaser Input System (`this.input.on('pointerdown')`, `this.input.keyboard`). Keine DOM-Events.
- **UI**: DOM-Elemente (Console, Dialog, Info-Panel, Combat-Preview) werden dynamisch von den UI-Modulen erstellt und in `shutdown()` entfernt. NICHT in `index.html` hardkodiert.
- **Maps**: Tiled JSON (`public/assets/maps/*.tmj`) + Tileset-PNG (`public/assets/BaseSet.png`). Tile-IDs → Terrain-Namen via `terrain`-Property in Tileset JSON.
- **Data/logic split**: `src/js/data/` holds pure data (terrain properties, missions, characters, equipment); `src/js/engine/` and `src/js/entities/` hold logic
- **Missions**: each mission in `src/js/data/missions/`, collected by `missions/index.js`. Mission data is passed via `game.registry.set('mission', ...)`.
- **State**: units.js uses a single `state` object (nicht mehr `export let`). Funktionen arbeiten über das State-Objekt.
- **Enemy KI** (enemy-ai.js): Target-Scoring, Terrain-Bewertung, Kiting, Rückzug, Healer/Boss-Verhalten

## Key Gotchas

- **DOM-Overlays blockieren Phaser-Input NICHT automatisch.** Wenn DOM-Overlays (z.B. Hub-Menüs, Dialoge) über dem Phaser-Canvas liegen, muss `this.input.enabled = false` beim Öffnen und `this.input.enabled = true` beim Schließen gesetzt werden, um Click-Through zu verhindern.
- **Phaser-Renderer: `Phaser.AUTO` (WebGL), NICHT `Phaser.CANVAS`.** Der Canvas-Renderer in Phaser 3.90.0 hat einen Bug mit Graphics-Objekten.
- **Tilemap-Scale**: Tiled-Tiles sind 16×16, Spiel-Tiles 50×50. `tilemapLayer.setScale(50/16)`. Tile-Index +1 (firstgid=1) → Terrain-Name.
- **Renderer-Modul**: `renderer.js` erzeugt intern Tilemap + Graphics. `initRenderer(scene, mission)` wird einmal aufgerufen.
- **Kosten-Labels**: `addCostLabel()` erzeugt `scene.add.text()`-Objekte mit depth 10, die bei jedem `drawGrid()`-Aufruf neu erstellt werden.
- **Phaser Canvas-Größe**: 1500×1000 (30×20 Grid × 50px). Weltkoordinaten = Pixelkoordinaten. `pointer.x / 50 = col`, `pointer.y / 50 = row`.
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
├── main.js                    # Phaser Game-Boot, registriert TitleScene + HubScene + CombatScene
├── config.js                  # Phaser Game-Config (WebGL, pixelArt, 1500x1000)
├── engine/
│   ├── renderer.js            # Tilemap (Terrain) + Graphics (Fog/Units/Highlights)
│   ├── input.js               # reine Utility: isPassable(), getMovementCost()
│   ├── terrain.js             # Terrain-Datenbank (isPassable, getMovementCost, isAdjacentToEnemy)
│   ├── combat-system.js       # Schadensberechnung, Gegenangriffe, predictCombat (reine Logik)
│   ├── movement-system.js      # Dijkstra-Pfadfindung (findPathAndCost), movement cost
│   ├── visibility-system.js    # Nebel des Krieges, Sichtberechnung
│   ├── enemy-ai.js            # Target-Scoring, Terrain-Bewertung, Kiting, Rückzug, Healer/Boss
│   ├── scoring-system.js      # Siegbedingungen, Reputation-Berechnung
│   ├── storage.js             # LocalStorage Speichern/Laden (hubData, missionRewards)
│   ├── console.js             # Aktions-Log (dynamisch erstellt/entfernt)
│   └── dialog.js              # Dialog-Overlay (dynamisch erstellt/entfernt)
├── entities/
│   └── units.js               # State-Objekt + Funktionen (playerUnits, enemyUnits, currentUnitIndex)
├── scenes/
│   ├── title.js               # TitleScene (Phaser.Scene) — Startbildschirm
│   ├── hub.js                  # HubScene (Phaser.Scene) — Orden, Ausrüstung, Level-Up
│   ├── combat.js               # CombatScene (Phaser.Scene) — Spiellogik, Runden, Input
│   └── combat-ui.js            # Unit-Panel, Terrain-Info, Zauber-UI, Combat-Preview (dynamisch)
└── data/
    ├── characters.js           # Helden (heroes) + Gegner (enemies) inkl. Level-Up-Growths
    ├── equipment.js            # Waffen + Rüstungen je 4 Stufen pro Held
    └── missions/
        ├── mission_01.js      # Mission-Daten (playerUnits, enemies, mapFile, defeatCondition)
        └── index.js           # Missions-Index

public/assets/
├── BaseSet.png                 # Terrain-Tileset (16×16, 40 Spalten)
├── maps/
│   └── mission_01.tmj         # Tiled-JSON-Karte (30×20, Custom Properties für Cities/Festungen)
├── dialogs/                    # Ink-JSON (geplant)
└── sprites/                    # Pixel-Art-Sprites (geplant)
```

## Enemy-KI (enemy-ai.js)

Die KI nutzt ein Scoring-System statt einfacher Distanz:

- **Target-Scoring**: `scoreTarget()` — wertet Ziele nach Waffenvorteil, HP-Zustand, Flankierung, Schadenspotenzial
- **Terrain-Bewertung**: `getTerrainScoreAt()` — Fortress +5, City +4, Hills/Forest +3, Sumpf -5
- **Aggro-Radius**: `baseSight + ceil(maxMp)` statt hart kodiertes `3`
- **Kiting**: `findKitingPosition()` — Fernkämpfer weichen zurück wenn Spieler direkt daneben
- **Rückzug**: `findRetreatPosition()` — unter 25% HP → Flucht auf defensives Terrain
- **Heiler**: `findHealTarget()` — sucht verwundete Verbündete in Reichweite
- **Boss**: `trait: 'boss'` — hält Stellung, nutzt Debuff-Zauber, greift aus Reichweite an

## Current Progress

Milestones 1–21 complete. M22a complete (Tiled-Map-Pipeline & Terrain-Integration).
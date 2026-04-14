# Architektur-Dokumentation

Dieses Dokument beschreibt die technische Architektur des SI-Games Runden-Taktik-Spiels.

## Projektstruktur

```
src/
├── index.html                # Minimal-HTML (Top-Bar + #app für Phaser)
├── css/
│   └── style.css             # Grundlegende Styles
└── js/
    ├── main.js               # Phaser Game-Boot, registriert Szenen
    ├── config.js             # Phaser-Konfiguration (WebGL, 500×500)
    ├── engine/
    │   ├── renderer.js       # Tilemap (Terrain) + Graphics (Fog/Units/Highlights)
    │   ├── input.js          # Reine Utility: isPassable(), getMovementCost()
    │   ├── combat-system.js  # Schadensberechnung, Gegenangriffe (rein)
    │   ├── movement-system.js# Dijkstra-Pfadfindung, Bewegungskosten (rein)
    │   ├── visibility-system.js # Nebel des Krieges, Sichtberechnung (rein)
    │   ├── enemy-ai.js       # Aggro-Radius, Pfadfindung, Auto-Angriff
    │   ├── storage.js        # LocalStorage Speichern/Laden
    │   ├── console.js        # Aktions-Log (dynamisch erstellt/entfernt)
    │   └── dialog.js         # Dialog-Overlay (dynamisch erstellt/entfernt)
    ├── entities/
    │   └── units.js          # State-Objekt + Funktionen (Spieler/Gegner)
    ├── scenes/
    │   ├── hub.js            # HubScene (Phaser.Scene) — Titel + Buttons
    │   ├── combat.js         # CombatScene (Phaser.Scene) — Spiellogik
    │   └── combat-ui.js      # Unit-Panel, Terrain-Info, Zauber-UI
    └── data/
        ├── terrain.js        # Terrain-Properties, Themes (keine Farben)
        └── missions/
            ├── mission_01.js # Missions-Daten (Units, Gegner, mapFile)
            └── index.js      # Missions-Index

public/assets/
├── tileset.png               # Terrain-Tileset (16×16, 7 Tiles)
├── maps/
│   └── mission_01.tmj        # Tiled-JSON-Karte (10×10)
├── dialogs/                  # Dialog-Daten (geplant)
└── sprites/                  # Pixel-Art-Sprites (geplant)
```

## Technologien

- **Phaser 3.90.0**: Game Engine (Rendering, Input, Scene Management, Tilemaps)
- **WebGL**: Renderer (Canvas-Renderer hat Bug in Phaser 3.90.0)
- **Tiled**: Map-Editor → exportiert `.tmj` (JSON) + `.png` (Tileset)
- **Vite**: Dev-Server und Build
- **LocalStorage**: Speichern/Laden des Spielstands

## Kernmodule

### `src/js/main.js`
- Erstellt `Phaser.Game` mit Konfiguration aus `config.js`
- Registriert `HubScene` und `CombatScene`
- Setzt Missionsdaten via `game.registry.set('mission', ...)`

### `src/js/engine/renderer.js`
- Erzeugt Phaser Tilemap aus Tiled-JSON (`make.tilemap()`)
- Erzeugt Graphics-Overlay für Fog, Units, Selection-Highlights
- `addCostLabel()` erzeugt `scene.add.text()` mit depth 10
- **Tile-Index → Terrain-Name** via `TILE_TO_TERRAIN` (firstgid=1, +1 Offset)
- **Scale**: Tiled 16×16 → Spiel 50×50 (`setScale(50/16)`)

### `src/js/entities/units.js`
- Ein `state`-Objekt hält `playerUnits`, `enemyUnits`, `currentUnitIndex`
- Alle Funktionen arbeiten über `state.xxx` (keine `export let`)
- Externe API: `getPlayerUnits()`, `getCurrentUnit()`, `setCurrentUnitPosition()`, etc.

### `src/js/engine/enemy-ai.js`
- `executeEnemyTurn(grid, onAction)` — async, mit Callback für Render-Updates
- `onAction` wird nach jeder KI-Aktion aufgerufen (→ `drawGrid` aus `combat.js`)
- `setTimeout` für visuelle Pausen zwischen KI-Aktionen

### `src/js/engine/combat-system.js`
- Reine Logik ohne Phaser-Abhängigkeit
- `executeCombat()` und `executeEnemyCombat()` — ändern nur Unit-State
- Keine `drawGrid()`-Aufrufe (Entkopplung)

## Szenen-Flow

```
main.js → new Phaser.Game(config)
         → HubScene.create()         [Titel, Buttons]
         → scene.start('CombatScene')
         → CombatScene.preload()      [Tileset + Tiled-JSON laden]
         → CombatScene.create()       [Renderer, Units, UI, Input]
         → CombatScene.update()       [Gameloop]
         → CombatScene.shutdown()     [UI zerstören, State reset]
         → scene.start('HubScene')
```

## Tiled-Integration

- Maps werden in **Tiled** als `.tmj` (JSON) exportiert
- Tileset ist `public/assets/tileset.png` (16×16 pro Tile, 7 Tiles)
- Tile-IDs (1–7) mappt `TILE_TO_TERRAIN` zu Terrain-Namen
- Mission-JS enthält nur `mapFile`-Pfad (kein `mapData.terrain` mehr)
- Neue Karten: Tiled öffnen → bearbeiten → als `.tmj` speichern → Mission-Daten anpassen

## Zustandsverwaltung

- **units.js** (`state`-Objekt): `playerUnits`, `enemyUnits`, `currentUnitIndex`
- **renderer.js** (Modulvariablen): `grid`, `visibilityGrid`, `selectedTarget`, `selectedUnit`
- **combat.js** (lokale Variablen): `isPlayerTurn`, `currentSpell`, `turnCounter`
- **Phaser-Registry**: `mission` (via `game.registry.set/get`)

## Input-Handling

- **Phaser Input**: `this.input.on('pointerdown')` für Mausklicks
- **Phaser Keyboard**: `this.input.keyboard.on('keydown-TAB')` / `keydown-ENTER`
- `pointer.x / 50 = col`, `pointer.y / 50 = row` (Weltkoordinaten = Pixelkoordinaten)

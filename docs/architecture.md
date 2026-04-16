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
    │   ├── terrain.js        # Terrain-Datenbank (isPassable, getMovementCost, isAdjacentToEnemy)
    │   ├── combat-system.js  # Schadensberechnung, Gegenangriffe, predictCombat (rein)
    │   ├── movement-system.js# Dijkstra-Pfadfindung, findPathAndCost (rein)
    │   ├── visibility-system.js # Nebel des Krieges, Sichtberechnung (rein)
    │   ├── enemy-ai.js       # Target-Scoring, Terrain-Bewertung, Kiting, Rückzug, Healer/Boss
    │   ├── scoring-system.js # Siegbedingungen, Reputation-Berechnung
    │   ├── storage.js        # LocalStorage Speichern/Laden
    │   ├── console.js        # Aktions-Log (dynamisch erstellt/entfernt)
    │   └── dialog.js         # Dialog-Overlay (dynamisch erstellt/entfernt)
    ├── entities/
    │   └── units.js          # State-Objekt + Funktionen (playerUnits, enemyUnits, currentUnitIndex)
    ├── scenes/
    │   ├── title.js          # TitleScene (Phaser.Scene) — Startbildschirm
    │   ├── hub.js            # HubScene (Phaser.Scene) — Orden, Ausrüstung, Level-Up
    │   ├── combat.js         # CombatScene (Phaser.Scene) — Spiellogik, Runden, Input
    │   └── combat-ui.js      # Unit-Panel, Terrain-Info, Zauber-UI, Combat-Preview (dynamisch)
    └── data/
        ├── characters.js     # Helden + Gegner (mit level/growth, spells, traits)
        ├── equipment.js      # Waffen + Rüstungen je 4 Stufen pro Held
        └── missions/
            ├── mission_01.js # Missions-Daten (Units, mapFile, defeatCondition)
            └── index.js      # Missions-Index

public/assets/
├── tileset.png               # Terrain-Tileset (16×16, 7 Tiles)
├── maps/
│   └── mission_01.tmj       # Tiled-JSON-Karte (10×10, Custom Properties)
├── dialogs/                  # Ink-JSON (geplant)
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
- Registriert `TitleScene`, `HubScene` und `CombatScene`
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
- Effekt-System: `applyEffectToUnit()`, `applyEffectToEnemy()` — Buffs/Debuffs/Heal
- Feind-Zauber: `setEnemyUnitMana()`, `setEnemyHasCast()`

### `src/js/engine/enemy-ai.js`
- `executeEnemyTurn(grid, onAction, onEnemyAction)` — async, mit Callback für Render-Updates
- **Target-Scoring**: `scoreTarget()` bewertet Ziele nach Waffenvorteil, HP, Flankierung, Schaden
- **Terrain-Bewertung**: `getTerrainScoreAt()` — Fortress +5, City +4, Hills/Forest +3, Swamp -5
- **Aggro-Radius**: `baseSight + ceil(maxMp)` — nicht mehr hart kodiert
- **Kiting**: `findKitingPosition()` — Fernkämpfer weichen zurück auf sichere Distanz
- **Rückzug**: `findRetreatPosition()` — unter 25% HP → Flucht auf defensives Terrain
- **Heiler**: `findHealTarget()` + `findDebuffTarget()` — unterstützende KI-Einheiten
- **Boss**: `trait: 'boss'` — hält Stellung, nutzt Debuff-Zauber, greift aus Reichweite

### `src/js/engine/combat-system.js`
- Reine Logik ohne Phaser-Abhängigkeit
- `executeCombat()` und `executeEnemyCombat()` — ändern nur Unit-State
- `predictCombat()` — Vorschau für Angriffe (Schaden, Gegenangriff, Waffenvorteil)
- Keine `drawGrid()`-Aufrufe (Entkopplung)

### `src/js/engine/terrain.js`
- Zentrale Terrain-Datenbank: `terrainTypes` (Plains, Hills, Road, Water, Bridge, Mountain, City, Swamp, Forest, Fortress)
- `isPassable()`, `getMovementCost()`, `isAdjacentToEnemy()`

### `src/js/engine/scoring-system.js`
- `checkVictoryCondition()` — prüft 5 Siegbedingungs-Typen
- `calculateReputation()` — Reputation nach Missionsende

### `src/js/data/characters.js`
- `heroes` — Spieler-Einheiten mit `level`, `growthHp/growthAtk/growthDef`, `spells`, `traits`
- `enemies` — Feinde inkl. Bosse (`trait: 'boss'`) und Heiler (`effect: 'heal'`)
- Traits: `light` (Unsichtbar im Wald), `boss`, `flying` (geplant)

### `src/js/data/equipment.js`
- Waffen und Rüstungen je 4 Stufen pro Held
- `getStatsAtLevel()` — berechnet gesteigerte Stats durch Level-Up

## Szenen-Flow

```
main.js → new Phaser.Game(config)
         → TitleScene.create()       [Start-Bildschirm]
         → scene.start('HubScene')
         → HubScene.create()          [Team, Ausrüstung, Level-Up]
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
- Custom Properties in Tiled: `name` (Stadtname), `hasOrb` (Orb vorhanden)
- Mission-JS enthält nur `mapFile`-Pfad (kein `mapData.terrain` mehr)
- Neue Karten: Tiled öffnen → bearbeiten → als `.tmj` speichern → Mission-Daten anpassen

## Zustandsverwaltung

- **units.js** (`state`-Objekt): `playerUnits`, `enemyUnits`, `currentUnitIndex`
- **renderer.js** (Modulvariablen): `grid`, `visibilityGrid`, `selectedTarget`, `selectedUnit`
- **combat.js** (lokale Variablen): `isPlayerTurn`, `currentSpell`, `turnCounter`
- **Phaser-Registry**: `mission` (via `game.registry.set/get`)
- **LocalStorage** (`storage.js`): `hubData` (Level, Equipment), `missionRewards`

## Input-Handling

- **Phaser Input**: `this.input.on('pointerdown')` für Mausklicks
- **Phaser Keyboard**: `this.input.keyboard.on('keydown-TAB')` / `keydown-ENTER`
- `pointer.x / 50 = col`, `pointer.y / 50 = row` (Weltkoordinaten = Pixelkoordinaten)

## DOM-Overlays (combat-ui.js)

Alle UI-Module werden dynamisch erstellt und in `CombatScene.shutdown()` zerstört:
- **Console**: Aktions-Log rechts unten
- **Dialog**: Dialog-Overlay (Kampf-Intro, Missions-Dialoge)
- **Unit-Panel**: Helden-Info links (HP/MP, Stats, Waffe, Zauber)
- **Terrain-Info**: Feld-Info rechts unten
- **Combat-Preview**: Animierte Kampfvorschau unten rechts (5-Spalten-Layout: Porträt | Info | VS | Info | Porträt)
- **Spell-Buttons**: Zauber-Aktionen mit Mana-Kosten

## Waffendreieck

Schwert > Axt > Lanze > Schwert (Bogen und Magie neutral)
- Vorteil: +2 Angriff
- Flankierung: +2 Angriff, verhindert Gegenangriff

## Terrain-Übersicht

| Typ | Bewegungskosten | Verteidigungsbonus | Sonstiges |
|-----|-----------------|-------------------|-----------|
| Plains | 1 | 0 | — |
| Hills | 2 | +1 | +1 Sicht |
| Road | 0.5 | 0 | — |
| Water | ∞ | 0 | Unpassierbar |
| Bridge | 1 | 0 | — |
| Mountain | ∞ | 0 | Unpassierbar |
| City | 1 | +2 | Heilt 20% HP/Runde |
| Swamp | 2 | -1 | — |
| Forest | 2 | +1 | Leichte Einheiten unsichtbar |
| Fortress | 2 | +3 | — |

## Milestones (Fortschritt)

| Meilenstein | Status |
|-------------|--------|
| M1–M14 | ✅ Abgeschlossen |
| M15: Terrain & ZoC | ✅ Abgeschlossen |
| M16: Waffen & Flankieren | ✅ Abgeschlossen |
| M17: Charakter-Management & Magie | ✅ Abgeschlossen |
| M18: Map-Immersion | ✅ Abgeschlossen |
| M19: Dynamische Missionsziele | ✅ Abgeschlossen |
| M20: Hub-System | ✅ Abgeschlossen |
| M21: KI-Evolution | ✅ Abgeschlossen |
| M22: Tooling, Tileset & Assets | 🔲 Geplant |
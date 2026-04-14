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
- **Combat rendering**: `CombatScene` creates a separate vanilla Canvas (`#gameCanvas`) on top of Phaser's canvas. This is a transitional state — renderer.js will migrate in Phase 2.
- **Data/logic split**: `src/js/data/` holds pure data (terrain, missions); `src/js/engine/` and `src/js/entities/` hold logic
- **Missions**: each mission in `src/js/data/missions/`, collected by `missions/index.js`. Mission data is passed via `game.registry.set('mission', ...)`.
- **State**: modules use exported `let` variables for shared mutable state (e.g. `playerUnits`, `grid`). This is intentional.

## Key Gotchas

- **Dual-Canvas-Layout**: Phaser erzeugt ein Canvas in `#app`. CombatScene hängt ein zweites Vanilla-Canvas (`#gameCanvas`) obendrauf (z-index: 1). Das Phaser-Canvas liegt dahinter (z-index: 0, schwarz). In Phase 2 wird CombatScene direkt auf Phaser rendern.
- **Kein SceneManager mehr**: `engine/scene-manager.js` wurde gelöscht. Scene-Wechsel laufen über `this.scene.start('HubScene')` / `this.scene.start('CombatScene')`.
- **Missions-Daten via Registry**: `main.js` setzt die Mission via `game.registry.set('mission', mission01)`. `CombatScene.init()` liest sie mit `this.mission = data.mission`.
- **Phaser shutdown()**: Beim Verlassen der CombatScene wird `shutdown()` aufgerufen (NICHT `onExit`). Dort wird der Vanilla-Canvas entfernt und State zurückgesetzt.
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
├── config.js                  # Phaser Game-Config (Canvas, pixelArt, 500x500)
├── engine/
│   ├── renderer.js            # Vanilla Canvas-Zeichnung → wird in Phase 2 zu Phaser Tilemap
│   ├── input.js               # Utility: isPassable(), getMovementCost() (rein). Keyboard/Maus wird in Phase 2 zu Phaser Input
│   ├── combat-system.js       # damage calculation, counter-attacks (reine Logik)
│   ├── movement-system.js     # Dijkstra pathfinding, movement cost (reine Logik)
│   ├── visibility-system.js   # fog of war, sight calculation (reine Logik)
│   ├── enemy-ai.js            # aggro radius, pathfinding, auto-attack
│   ├── storage.js             # LocalStorage save/load (reine Logik)
│   ├── console.js             # action log UI (DOM) → wird zu Phaser DOM-Element
│   └── dialog.js              # dialog overlay (DOM) → wird zu Phaser DOM-Element
├── entities/
│   ├── hero.js                 # LEGACY — wird gelöscht
│   ├── enemy.js                # LEGACY — wird gelöscht
│   └── units.js                # player/enemy unit arrays, status, turn tracking
├── scenes/
│   ├── hub.js                  # HubScene (Phaser.Scene) — Titel + Buttons
│   ├── combat.js               # CombatScene (Phaser.Scene) — Vanilla-Canvas + volle Spiellogik (~460 Zeilen)
│   └── combat-ui.js            # unit panel, spell UI (DOM)
└── data/
    ├── terrain.js              # terrain types, costs, defense, sight mods, themes (unverändert)
    └── missions/
        ├── mission_01.js       # Mission-Daten (unverändert)
        └── index.js            # Mission-Index (unverändert)
```

## Migrationsstatus (Vanilla → Phaser 3)

**Phase 0 (abgeschlossen):** Phaser 3 installiert, Game-Config, Vite, Assets-Ordner

**Phase 1 (abgeschlossen):**
- `main.js` → Phaser Game-Boot (`new Phaser.Game(config)`)
- `HubScene extends Phaser.Scene` — DOM-Buttons durch `this.add.text()` ersetzt, Scene-Wechsel über `this.scene.start()`
- `CombatScene extends Phaser.Scene` — `onEnter()` → `create()`, `onExit()` → `shutdown()`, Mission via `init(data)`
- `scene-manager.js` gelöscht — Phaser übernimmt das Scene-Management
- CSS: Dual-Canvas-Support (Phaser: z-index 0, Vanilla: z-index 1)

**Nächster Schritt:**
- Phase 2: CombatScene-Renderer-Migration (renderer.js → Phaser Tilemap/Graphics, CombatScene nutzt Phaser-Canvas statt Vanilla-Canvas)

## Current Progress

Milestones 1–14 complete. M15 planned. Phaser-Migration Phase 0 + 1 abgeschlossen.

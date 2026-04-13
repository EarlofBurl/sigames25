# Architektur-Dokumentation

Dieses Dokument beschreibt die technische Architektur des SI-Games Runden-Taktik-Spiels.

## Projektstruktur

```
src/
├── index.html                # Einstiegspunkt der Anwendung
├── css/
│   └── style.css             # Styles für die Anwendung
└── js/
    ├── main.js               # Hauptmodul, das die Anwendung startet
    ├── engine/
    │   ├── renderer.js        # Zeichnet das Grid und die Spielfigur
    │   ├── input.js           # Verwaltet die Eingaben
    │   ├── combat-system.js   # NEU: Mathematische Kampflogik
    │   ├── movement-system.js # NEU: Wegkosten-Berechnung
    │   ├── storage.js         # Speichern/Laden
    │   ├── scene-manager.js   # Szenenwechsel
    │   ├── console.js         # Aktions-Log
    │   └── dialog.js          # Dialog-System
    ├── entities/
    │   └── hero.js            # Verwaltet die Spielfigur (Held)
    ├── scenes/
    │   ├── hub.js             # Hub-Szene
    │   ├── combat.js          # Kampf-Szene (Regie)
    │   └── combat-ui.js       # NEU: UI-Update-Logik für den Kampf
    └── data/
        ├── terrain.js         # Definiert die Terrain-Typen und ihre Eigenschaften
        └── missions/
            ├── mission_01.js   # Daten für Mission 1
            └── index.js          # Sammelt alle Missionen und exportiert sie
```

## Technologien

- **HTML5**: Struktur der Anwendung.
- **CSS3**: Styling der Anwendung.
- **JavaScript (ES6)**: Logik der Anwendung.
- **Canvas API**: Zeichnen des Grids und der Spielfigur.
- **LocalStorage**: Speichern und Laden des Spielstands.

## Module

### `src/js/main.js`
- **Zweck**: Einstiegspunkt der Anwendung.
- **Funktionen**:
  - Initialisiert den `SceneManager`.
  - Fügt die Hub-Szene hinzu.
  - Startet mit der Hub-Szene.

### `src/js/engine/scene-manager.js`
- **Zweck**: Verwaltet den Wechsel zwischen verschiedenen Szenen.
- **Funktionen**:
  - `addScene(name, scene)`: Fügt eine neue Szene hinzu.
  - `switchTo(name)`: Wechselt zu einer bestimmten Szene.

### `src/js/engine/renderer.js`
- **Zweck**: Zeichnet das Grid und die Spielfigur auf das Canvas.
- **Funktionen**:
  - `initGrid(mission)`: Initialisiert das Grid basierend auf der Mission.
  - `drawGrid()`: Zeichnet das Grid.
  - `drawPlayer()`: Zeichnet die Spielfigur.
  - `drawPathLine(target)`: Zeichnet die Pathlinie zum ausgewählten Ziel.
  - `initRenderer(canvasElement, mission)`: Initialisiert den Renderer.
  - `getGridData()`: Gibt die aktuellen Grid-Daten zurück.
  - `setGridData(data)`: Setzt die Grid-Daten.
  - `setSelectedTarget(target)`: Setzt das ausgewählte Ziel.
  - `clearSelectedTarget()`: Löscht das ausgewählte Ziel.

### `src/js/engine/input.js`
- **Zweck**: Verwaltet die Eingaben (Tastatur und Maus).
- **Funktionen**:
  - `setupKeyboardControls(callback)`: Richtet die Tastatursteuerung ein.
  - `setupMouseControls(canvas, callback)`: Richtet die Maussteuerung ein.
  - `isPassable(row, col, grid)`: Überprüft, ob ein Feld passierbar ist.
  - `getMovementCost(row, col, grid)`: Berechnet die Bewegungskosten für ein Feld.

### `src/js/engine/storage.js`
- **Zweck**: Verwaltet das Speichern und Laden des Spielstands im LocalStorage.
- **Funktionen**:
  - `saveGame(playerData)`: Speichert den aktuellen Spielstand.
  - `loadGame()`: Lädt den Spielstand.
  - `resetGame()`: Setzt den Spielstand zurück.

### `src/js/engine/console.js`
- **Zweck**: Verwaltet die Info-Konsole für Aktions-Logs.
- **Funktionen**:
  - `initConsole()`: Initialisiert die Konsole.
  - `log(message)`: Fügt eine Nachricht zur Konsole hinzu.
  - `setUnitDetails(details)`: Setzt die Einheiten-Details.

### `src/js/engine/dialog.js`
- **Zweck**: Verwaltet das Dialog-Overlay.
- **Funktionen**:
  - `initDialog()`: Initialisiert das Dialog-Overlay.
  - `playDialog(data)`: Zeigt einen Dialog an.

### `src/js/entities/hero.js`
- **Zweck**: Verwaltet die Spielfigur (Held).
- **Funktionen**:
  - `getHeroPosition()`: Gibt die aktuelle Position des Helden zurück.
  - `setHeroPosition(row, col)`: Setzt die Position des Helden.
  - `getHeroColor()`: Gibt die Farbe des Helden zurück.
  - `getHeroAttributes()`: Gibt die Attribute des Helden zurück.
  - `setHeroMp(mp)`: Setzt die Bewegungspunkte des Helden.
  - `refillHeroMp()`: Füllt die Bewegungspunkte des Helden auf.

### `src/js/scenes/hub.js`
- **Zweck**: Hub-Szene mit Start-Button für Missionen.
- **Funktionen**:
  - `onEnter()`: Wird aufgerufen, wenn die Szene betreten wird.
  - `onExit()`: Wird aufgerufen, wenn die Szene verlassen wird.

### `src/js/scenes/combat.js`
- **Zweck**: Kampf-Szene mit Grid und Spielfigur.
- **Funktionen**:
  - `onEnter()`: Wird aufgerufen, wenn die Szene betreten wird.
  - `onExit()`: Wird aufgerufen, wenn die Szene verlassen wird.

### `src/js/data/terrain.js`
- **Zweck**: Definiert die Terrain-Typen und ihre Eigenschaften.
- **Daten**:
  - `terrainTypes`: Definiert die Terrain-Typen mit Bewegungskosten und Verteidigungsboni.
  - `terrainThemes`: Definiert die Farben für jedes Terrain basierend auf dem Theme.

### `src/js/data/missions/mission_01.js`
- **Zweck**: Daten für Mission 1.
- **Daten**:
  - `id`: ID der Mission.
  - `title`: Titel der Mission.
  - `description`: Beschreibung der Mission.
  - `theme`: Theme der Mission.
  - `mapData`: Daten der Karte.
  - `objectives`: Ziele der Mission.
  - `dialogues`: Dialoge der Mission.

### `src/js/data/missions/index.js`
- **Zweck**: Sammelt alle Missionen und exportiert sie.
- **Daten**:
  - `missions`: Array aller Missionen.

## Datenfluss

1. **Initialisierung**:
   - `main.js` initialisiert den `SceneManager` und fügt die Hub-Szene hinzu.
   - Der `SceneManager` wechselt zur Hub-Szene.

2. **Hub-Szene**:
   - Der Benutzer klickt auf den "Mission 1 starten"-Button.
   - Der `SceneManager` wechselt zur Kampf-Szene.

3. **Kampf-Szene**:
   - Der `renderer.js` initialisiert das Grid und zeichnet es.
   - Der `input.js` richtet die Eingaben ein.
   - Der Benutzer interagiert mit der Szene (Bewegung, Speichern, Laden, etc.).

4. **Speichern/Laden**:
   - Der `storage.js` speichert oder lädt den Spielstand im LocalStorage.

## Zustandsverwaltung

- **selectedUnit**: Gibt an, ob eine Einheit ausgewählt ist.
- **selectedTarget**: Gibt an, ob ein Ziel ausgewählt ist.
- **grid**: Enthält die Daten des Grids.
- **player**: Enthält die Daten der Spielfigur.

## Event-Handling

- **Klicks**:
  - Links-Klick: Wählt eine Einheit aus oder ein Ziel.
  - Rechts-Klick: Bewegt die Einheit (deaktiviert, da durch Doppelklick ersetzt).
  - Doppelklick: Bewegt die Einheit zum ausgewählten Ziel.

- **Tastatur**:
  - Pfeiltasten: Bewegen die Einheit.
  - Leertaste: Überspringt den Zug.
  - Enter: Beendet die Runde.

## Styling

- **CSS**:
  - `style.css`: Enthält die Styles für die Anwendung.
  - Flexbox: Wird für das Layout verwendet.
  - Grid: Wird für das Spielfeld verwendet.

## Browser-Kompatibilität

- **Chrome**: Voll unterstützt.
- **Firefox**: Voll unterstützt.
- **Safari**: Voll unterstützt.
- **Edge**: Voll unterstützt.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe die [LICENSE](LICENSE) Datei für weitere Informationen.
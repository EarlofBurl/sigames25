# SI-Games Runden-Taktik

Ein rundenbasiertes Taktikspiel (Fire Emblem / Advance Wars Style) im 16-Bit-Look zur Feier des 25-jährigen Jubiläums des si-games.com Forums. Gespielt wird direkt im Browser.

## Tech-Stack

- **[Phaser 3.90.0](https://phaser.io)** — Game Engine (WebGL-Renderer, Tilemaps, Input)
- **[Tiled](https://www.mapeditor.org)** — Map-Editor für Karten (.tmj JSON + .png Tileset)
- **[Vite](https://vitejs.dev)** — Dev-Server und Build

## Installation

```bash
npm install
npm run dev       # Dev-Server auf Port 8080
npm run build     # Production-Build → dist/
```

## Projektstand

### Meilensteine 1–14 (abgeschlossen)

- Phaser 3 Rendering (Tilemap + WebGL)
- Rundenbasiertes Kampfsystem mit Angriff/Gegenangriff
- Terrain-System (Ebene, Wald, Hügel, Fluss, Berg, Wasser, Stadt)
- Dijkstra-Pfadfindung mit MP-basierter Bewegung
- Nebel des Krieges (Fog of War)
- Feindliche KI (Aggro-Radius, Pfadfindung, Auto-Angriff)
- Einheiten-Attribute (HP, MP, Angriff, Verteidigung, Reichweite)
- Zauber-System (Buffs/Debuffs auf Verbündete und Feinde)
- Hub-Szene mit Missions-Auswahl
- Dialog-Overlay-System
- Aktions-Log mit farbcodierten Nachrichten
- Speichern/Laden via LocalStorage
- Tiled-Integration (Karten als .tmj editierbar)

### Geplant (Meilenstein 15)

- Sieg-/Niederlagebedingungen
- Rückkehr zum Hub nach Missionsende
- XP-System und Leveling
- Weitere Missionen
- Pixel-Art-Tileset und Sprites

## Bedienung

| Aktion | Steuerung |
|---|---|
| Einheit auswählen | Klicke auf eine eigene Einheit |
| Ziel auswählen | Klicke auf ein Feld (Bewegung/Angriff) |
| Bewegung ausführen | Klicke erneut auf das ausgewählte Ziel |
| Nächste Einheit | Tab oder "Nächste Einheit"-Button |
| Zug beenden | Enter oder "Zug beenden"-Button |
| Zauber wirken | Klicke auf einen Zauber-Button im Einheiten-Panel, dann auf ein Ziel |

## Karten bearbeiten

Karten werden mit [Tiled](https://www.mapeditor.org) als `.tmj` (JSON) exportiert:

1. Tiled öffnen → neue Karte erstellen (10×10, 16×16 Tiles)
2. Tileset laden (`public/assets/tileset.png`)
3. Karte zeichnen und als `.tmj` speichern
4. Mission-Daten anpassen: `mapFile`-Pfad in `src/js/data/missions/` setzen

Tile-IDs (1–7) mappt `TILE_TO_TERRAIN` in `renderer.js`:
`1=PLAIN, 2=FOREST, 3=HILL, 4=RIVER, 5=MOUNTAIN, 6=WATER, 7=CITY`

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe die [LICENSE](LICENSE) Datei für weitere Informationen.

# Projekt-Roadmap: SI-Games Runden-Taktik

**Vision:** Ein rundenbasiertes Taktikspiel (Fire Emblem / Advance Wars Style) im 16-Bit-Look zur Feier des 25-jährigen Jubiläums des si-games.com Forums. Gespielt wird direkt im Browser.

## Meilenstein 1: Projekt-Fundament & Rendering (MVP)
- [x] Erstelle eine `src/index.html` als Einstiegspunkt.
- [x] Erstelle ein grundlegendes Layout mit CSS (Zentriertes Spielfeld, Platz für UI rechts/unten).
- [x] Implementiere eine `src/game.js`, die ein einfaches Raster (Grid) auf einem HTML5-Canvas zeichnet (z.B. 10x10 Felder).

## Meilenstein 2: Spielfigur & Bewegung
- [x] Erstelle eine Datenstruktur für eine Spielfigur (Held).
- [x] Zeichne die Figur (vorerst als farbiges Quadrat oder simplen Platzhalter) auf das Grid.
- [x] Implementiere Steuerung (Mausklick oder Pfeiltasten), um die Figur innerhalb des Grids von Feld zu Feld zu bewegen.

## Meilenstein 3: Speichersystem (LocalStorage)
- [x] Baue einen "Speichern"-Button in die UI ein.
- [x] Speichere die aktuelle Position der Figur im LocalStorage des Browsers.
- [x] Lade die Position automatisch aus dem LocalStorage, wenn die Seite neu geladen wird (inklusive "Spielstand zurücksetzen"-Button).

## Meilenstein 4: Terrain & 16-Bit Look (Vorbereitung)
- [x] Erweitere das Grid um Terrain-Typen (Gras, Wasser, Berg) mit unterschiedlichen Farben.
- [x] Passe die Bewegungslogik an: Berge sind unpassierbar, Wasser kostet mehr Bewegungspunkte.

## Meilenstein 5: Scene-Manager & Hub-System
- [x] Implementiere den `SceneManager` in `src/js/engine/scene-manager.js`.
- [x] Erstelle eine Basis-Struktur für den Hub (`src/js/scenes/hub.js`) mit Platzhaltern für "Team-Gespräche" und "Shop/Upgrade".
- [x] Baue die Möglichkeit ein, vom Hub in die erste Mission zu starten.

## Meilenstein 6: Dynamisches Missions-Loading
- [x] Erstelle den Ordner `src/js/data/missions/`.
- [x] Implementiere `mission_01.js` mit Beispiel-Daten (Titel, Start-Dialog, Map-Layout).
- [x] Sorge dafür, dass die Kampf-Szene (`combat.js`) ihre Daten dynamisch aus der gewählten Missions-Datei bezieht.

## Meilenstein 7: Erweitertes Terrain & Theming (Civ 2 Style)
- [x] Erstelle eine zentrale Terrain-Datenbank (`src/js/data/terrain.js`), die Bewegungskosten und Verteidigungsboni definiert.
- [x] Erweitere das Grid-System, sodass jedes Feld einen logischen Terrain-Typ (z.B. PLAIN, FOREST, MOUNTAIN) hat.
- [x] Implementiere das "Theming": Die Missionsdatei bestimmt das Aussehen (z.B. `theme: 'fantasy'` oder `theme: 'space'`).
- [x] Der Renderer wählt die Farben/Darstellung basierend auf Terrain-Typ UND aktuellem Theme.
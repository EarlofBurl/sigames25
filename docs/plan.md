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

## Meilenstein 8: UI-Erweiterung & Info-Konsole
- [x] Erweitere das HTML/CSS Layout um zwei neue Bereiche neben/unter dem Spielfeld: "Einheiten-Details" und "Aktions-Log".
- [x] Erstelle ein Modul `src/js/engine/console.js`, das Nachrichten an das Aktions-Log sendet (z.B. "Du kannst nicht in Gebirge vorstoßen!").
- [x] Verbinde die Klick-Logik so, dass beim Klick auf ein Feld oder eine Figur deren Name und Stats in den "Einheiten-Details" angezeigt werden.
- [x] Implementiere ein Dialog-Overlay-System für Missionseinführungen und Gespräche.

## Meilenstein 9: Einheiten-Attribute & Runden-Logik
- [x] Erweitere die Spielfigur (`hero.js`) um Attribute: `hp` (Lebenspunkte), `maxHp`, `mp` (Bewegungspunkte), `attack`, `defense`.
- [x] Implementiere den Runden-Ablauf: Ein "Zug beenden"-Button, der die MP der Figur wieder auffüllt.
- [x] Verbinde die Bewegung mit dem Terrain: Ein Schritt kostet MP abhängig vom Terrain. Wenn MP < Kosten, wird die Bewegung blockiert und eine Nachricht an die Konsole geschickt.
- [x] Steuerung: Links-Klick wählt Einheit aus oder gibt Terrain-Infos, Rechtsklick bewegt Einheit. Sichtbar, wieviele Züge eine Bewegung kosten würde durch eine Bewegungslinie. Ziel-Feld-Cursor ein Symbol.
- [x] Leertaste: Zug für Einheit überspringen (wie  bei Civ)
- [x] Alle Einheiten Bewegung beendet: Enter beendet runde. Klick auf Button Runde beenden, beendet immer Zug.

## Meilenstein 10: Kampfsystem & Feinde
- [x] Erstelle eine Feind-Einheit (z.B. `entities/enemy.js`) und platziere einen Test-Gegner (z.B. "Goblin") auf der Karte.
- [x] Implementiere die Angriffslogik: Zieht man auf ein Feld mit einem Feind, wird angegriffen statt bewegt.
- [x] Berechne den Schaden (z.B. `Angreifer Attack - Verteidiger Defense + Terrain-Bonus`) und gib das Ergebnis über die Info-Konsole aus ("Montesquieu greift Goblin für 5 Schaden an!").
- [x] Entferne Einheiten mit 0 HP vom Spielfeld.

## Meilenstein 11: Armee-Verwaltung & Mehrere Einheiten
- [x] Refactoring: Ersetze das einzelne `player`-Objekt durch ein Array `playerUnits[]` und `enemyUnits[]`.
- [x] Ermögliche das Durchschalten eigener Einheiten (z.B. per `TAB`-Taste oder durch Klick auf "Nächste Einheit"-Button).
- [x] Platziere neben der Montesquieu Helden Einheit eine weitere Spieler Einheit "Ritter" auf dem Feld und zwei Feind-Goblin-Einheiten.

## Meilenstein 12: Feindliche KI (Enemy Phase)
- [ ] Implementiere den Rundenwechsel: Wenn der Spieler die Runde beendet, startet die `Enemy Phase`.
- [ ] Baue eine einfache KI für Feinde:
  1. Finde die nächste Spielereinheit. Feindeinheiten haben Sichtradius um sich herum: 1 wäre nur oben unten links rechts. zwei wären zwei nach oben, aber auch eins nach oben und nach rechts oder links. Die goblins haben sicht von 2.
  2. Berechne den Pfad dorthin (unter Berücksichtigung der eigenen MP).
  3. Bewege die Feind-Einheit.
  4. Greife an, falls der Spieler in Reichweite (orthogonale Nachbarschaft) ist.
- [ ] Wenn alle Feinde gehandelt haben, wechsle zurück zur `Player Phase`.

## Meilenstein 13: Siegbedingungen & Fortschritt (Hub)
- [ ] Definiere Sieg- und Niederlage-Bedingungen in `mission_01.js` (z.B. `winCondition: 'defeat_all'`).
- [ ] Implementiere einen "Victory"- und "Defeat"-Screen über das `dialog.js` Overlay.
- [ ] Kehre nach der Mission zum Hub (`hub.js`) zurück.
- [ ] Füge Erfahrungspunkte (XP) und Level-Ups für überlebende Einheiten hinzu (können im Hub eingesehen werden).

## Meilenstein 14: Das SI-Games Jubiläums-Szenario
- [ ] Erstelle `mission_02.js` und richte den Fortschritt so ein, dass man nach Mission 1 im Hub die nächste Mission wählen kann.
- [ ] Baue Terrain-Besonderheiten aus Civ 2 vollständig ein (z.B. Städte heilen am Rundenanfang).
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
- [x] Implementiere den Rundenwechsel: Wenn der Spieler die Runde beendet, startet die `Enemy Phase`.
- [x] Baue eine einfache KI für Feinde:
  1. Setze einen "Aggro-Radius" um Feinde (z. B. Goblins haben Radius 2).
  2. Prüfe: Ist eine Spielereinheit in diesem Radius? Wenn ja, werde aktiv.
  3. Berechne den Pfad zum Spieler (Dijkstra/A* unter Berücksichtigung der Feind-MP).
  4. Bewege die Feind-Einheit.
  5. Greife an, falls der Spieler am Ende der Bewegung in Reichweite (orthogonale Nachbarschaft) ist.
- [x] Wenn alle Feinde gehandelt haben, wechsle zurück zur `Player Phase`.

## Meilenstein 13: Sichtweiten & Fog of War (NEU)
- [x] Erweitere `terrain.js` um Sichtlinien-Modifikatoren (z.B. Wald: `sightMod: -1`, Hügel: `sightMod: 1`).
- [x] Erweitere Helden-Einheiten um das Attribut `baseSight` (z.B. 3).
- [x] Implementiere eine Logik zur Sichtweiten-Berechnung: Ausgehend von der Heldenposition wird die Sichtweite berechnet (Manhattan-Distanz + Terrain-Modifikatoren der Felder auf der Route).
- [x] Passe den Renderer (`renderer.js`) an:
  - Verdeckte Felder schwarz zeichnen (unexplored).
  - Entdeckte, aber aktuell nicht sichtbare Felder dunkelgrau überlagern (Fog).
  - Feinde nur zeichnen, wenn sie auf einem `visible` Feld stehen.
- [x] Verhindere, dass der Spieler Einheiten auf "unexplored" Felder bewegt, ohne sie vorher aufzuklären.

## Meilenstein 14: Fernkampf, Magie & Status-Effekte (NEU)
- [x] **Datenstruktur:** Erweitere Einheiten um `range` (Reichweite, Standard 1, Bogenschützen 2) und ein Array `spells` für Magier/Barden. Füge ein Array `activeEffects` hinzu, um Buffs/Debuffs zu tracken.
- [x] **Fernkampf-Logik:** - Erlaube Angriffe auf Distanz (`distance <= range`).
  - Gegenangriffe in `combat-system.js` dürfen nur ausgeführt werden, wenn die Reichweite des Verteidigers bis zum Angreifer reicht (ein Nahkampf-Goblin kann sich nicht gegen einen Pfeil aus 2 Feldern Entfernung wehren).
- [x] **Aktions-Menü (UI):** Implementiere Knöpfe im Info-Panel. Magische Spieler können aus zwei Zaubern auswählen.
- [x] **Das Barden-System:**
  - Implementiere den Zauber "Anfeuern" (+1 Angriff für 1 Runde, Ziel: Verbündeter).
  - Implementiere den Zauber "Dissen" (-1 Angriff für 1 Runde, Ziel: Feind).
  - Erweitere die Rundenwechsel-Logik (`endTurnLogic`), damit Status-Effekte nach einer Runde wieder abklingen.
- [x] **Einheiten-Update:** Ersetze einen Goblin durch einen "Goblinbogenschützen", füge den Spieler "Ritter" (Nahkampf) und "Bogenschütze" hinzu und mache Montesquieu zum Barden.
 

## Meilenstein 15: Siegbedingungen & Fortschritt (Hub)
- [ ] Definiere Sieg- und Niederlage-Bedingungen in `mission_01.js` (z.B. `winCondition: 'defeat_all'`).
- [ ] Implementiere einen "Victory"- und "Defeat"-Screen über das `dialog.js` Overlay.
- [ ] Kehre nach der Mission zum Hub (`hub.js`) zurück.
- [ ] Füge Erfahrungspunkte (XP) und Level-Ups für überlebende Einheiten hinzu (können im Hub eingesehen werden).

## Meilenstein 16: Das SI-Games Jubiläums-Szenario
- [ ] Erstelle `mission_02.js` und richte den Fortschritt so ein, dass man nach Mission 1 im Hub die nächste Mission wählen kann.
- [ ] Baue Terrain-Besonderheiten aus Civ 2 vollständig ein (z.B. Städte heilen am Rundenanfang).
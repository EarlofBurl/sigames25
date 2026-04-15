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
 

## Meilenstein 15: Die Welt & Bewegung (Terrain & ZoC)
*Fokus: Die taktischen Grundregeln für die Bewegung auf der Karte etablieren.*

- [x] **Erweitertes Terrain-System (`terrain.js` & `movement-system.js`):**
  - [x] **Ebene (Plains):** 1 MP, keine Boni.
  - [x] **Hügel (Hills):** 2 MP. +1 Verteidigung, +1 Sichtweite (Fog of War).
  - [x] **Straße (Road):** 0.5 MP (oder halbe Kosten).
  - [x] **Wasser (Water):** Unpassierbar. Ersetzt das alte Fluss-System.
  - [x] **Brücke (Bridge):** 1 MP, passierbar über Wasser.
  - [x] **Berg (Mountain):** Unpassierbar.
  - [x] **Stadt (City):** 1 MP. +2 Verteidigung. Heilt die Einheit am Rundenanfang um 20% HP (wenn sie sich nicht bewegt hat).
  - [x] **Sumpf (Swamp):** 2 MP. -1 Verteidigung (Verteidigungs-Malus).
  - [x] **Wald (Forest):** 2 MP. +1 Verteidigung. Einheiten mit dem Trait `light` (leichte Einheiten) sind hier für Feinde unsichtbar, bis sie angreifen oder der Feind direkt daneben steht.
  - [x] **Festung (Fortress):** 2 MP. +3 Verteidigung.
- [x] **Zone of Control (ZoC):**
  - [x] Erweiterung in `movement-system.js`: Einheiten müssen ihre Bewegung sofort beenden, wenn sie ein Feld direkt neben einem Feind betreten.

## Meilenstein 16: Taktischer Kampf (Waffen & Positionierung)
*Fokus: Entscheidungen im Kampf belohnen.*

- [x] **Das klassische Waffendreieck (`combat-system.js`):**
  - [x] Einführung der Waffentypen: `sword`, `axe`, `lance`, `bow`, `magic`.
  - [x] Logik: Schwert schlägt Axt, Axt schlägt Lanze, Lanze schlägt Schwert. (Bögen und Magie sind neutral).
  - [x] Bonus/Malus: Bei Vorteil +2 Angriff und +15% Trefferchance (falls Hit-Rates später aktiv sind).
- [x] **Flankieren & "In den Rücken fallen":**
  - [x] **Einkesseln (Flanking):** Wenn eine Einheit angreift und sich auf der genau gegenüberliegenden Seite des Ziels eine weitere verbündete Einheit befindet, gibt es +2 Angriff.
  - [x] **Rückschlag-Verhinderung:** Angriffe aus dem "Einkessel"-Bonus heraus verhindern den Gegenangriff des Verteidigers (oder senken dessen Schaden massiv).

## Meilenstein 17: Charakter-Management & Magie-System
*Fokus: Eine saubere Datenstruktur für Helden, Feinde und Bosse schaffen.*

- [x] **Charakter-Datenbank (`data/characters.js`):**
  - [x] Trennung von "Klasse" und "Charakter". 
  - [x] Aufbau einer JSON-Struktur für Helden (z.B. Name, Portrait-ID, Basis-Werte).
  - [x] Aufbau einer Struktur für generische Feinde (z.B. "Goblin A") und Boss-Gegner (einzigartige Namen und leicht erhöhte Werte).
- [x] **Erweiterung der Einheiten-Stats (`units.js`):**
  - [x] **HP** (Lebenspunkte), **MP** (Bewegungspunkte / Movement), **Mana / SP** (Für Zauber und Fähigkeiten).
  - [x] **Atk** (Angriff), **Def** (Verteidigung), **Spd** (Geschwindigkeit - für Ausweichen oder Doppelschlag), **Rng** (Reichweite).
  - [x] **Traits** (Array für Spezialfähigkeiten, z.B. `['light', 'boss', 'flying']`).
- [x] **Überarbeitung des Magie-Systems:**
  - [x] Zauber kosten nun **Mana**, nicht mehr Bewegungspunkte.
  - [x] Aktions-Menü anpassen: Einheiten können sich bewegen und *danach* zaubern, solange sie genug Mana haben.

## Meilenstein 18: Map-Immersion & Map-Interaktion
*Fokus: Die Karte lebt! Städte bekommen Namen, können besetzt werden und enthalten Loot.*

- [x] **Stadt- & Festungs-Labels (`renderer.js`):**
  - [x] Auslesen von Custom Properties aus dem Tiled-JSON (z.B. `name: "Baesweiler"` auf einem Stadt-Tile).
  - [x] Rendern des Textes zentriert direkt unter dem jeweiligen Tile (mit kleiner, gut lesbarer Bitmap-Font oder Standard-Font mit Stroke).
- [x] **Besetzungs-System (Eroberungen):**
  - [x] Wenn eine Spieler-Einheit ihren Zug auf einer unbesetzten (oder feindlichen) Stadt/Festung beendet, wechselt der Besitz zum Spieler.
  - [x] Visuelles Feedback: blauer Rand (Spieler) / roter Rand (Feind) / grauer Rand (neutral).
- [x] **Map-Loot (Der Ausrüstungs-Orb):**
  - [x] Map-Tiles können die Custom Property `hasOrb: true` haben.
  - [x] Betritt der Spieler dieses Feld zum ersten Mal, ploppt eine Meldung auf ("Ausrüstungs-Orb gefunden!") und der Orb wandert in den temporären Missions-Speicher.
- [x] **Umbau der Mission 01 (`mission_01.tmj` & `mission_01.js`):**
  - [x] Angepasste Tiled-Map: 1 Stadt ("Baesweiler" mit Orb) und 1 Festung ("Altenburg").
  - [x] Vergabe von Namen via Custom Properties.
  - [x] `defeatCondition: 'defeat_all'` in mission_01.js.

## Meilenstein 19: Dynamische Missionsziele & Abrechnung
*Fokus: Die neuen Siegbedingungen und der Reputations-Rechner.*

- [x] **Die 5 Siegbedingungen (`CombatScene.js` & `mission_*.js`):**
  - [x] Implementierung der Logik-Prüfung am Ende jedes Zuges basierend auf der JSON-Config:
    1. `defeat_all`: Alle feindlichen Einheiten sind besiegt. (Ziel für Mission 01).
    2. `defeat_boss`: Die feindliche Einheit mit dem Trait `boss` ist besiegt.
    3. `survive_turns`: Der Spieler hat noch Einheiten, wenn Runde X erreicht ist.
    4. `occupy_location`: Ein bestimmtes Feld (X,Y) wurde vom Spieler besetzt.
    5. `victory_points`: Der Spieler hält gleichzeitig X Städte/Festungen.
- [x] **Der Reputations-Rechner (`scoring-system.js`):**
  - [x] Berechnung nach Missionsende:
    - **Base:** Basis-Reputation der Mission.
    - **War-Trophy:** Summe der Max-HP aller besiegten Gegner.
    - **Strategic Points:** Bonus für jede am Ende gehaltene Stadt/Festung.
    - **Golf-Bonus:** `max(0, (Zielrunden - BenötigteRunden) * Multiplikator)`.
- [x] **State-Transfer:** - [x] Übergabe der berechneten Reputation und gefundenen Orbs an den globalen `storage.js` beim Verlassen der Szene.

## Meilenstein 20: Der Hub - Ordenverleihung & Die Küche
*Fokus: Strategische Upgrades zwischen den Missionen. Screen-Flow: Titel → Hub → Mission → Hub.*

- [x] **Screen-Flow**: Titel → Hub → Mission → Hub
- [x] **Title-Screen** (`title.js`): "SI-Games 25" + "Start" Button
- [x] **Hub-UI**: Top-Leiste `Augsburg | 💎 X Orbs | ⭐ X Reputation` + 3 Buttons
- [x] **Konventsküche**: Ausrüstungs-Submenu mit 4 Stufen (Waffe + Rüstung, Orb-Kosten)
- [x] **Ordensverleihung**: Level-Up-Submenu (exponentielle Reputations-Kosten)
- [x] **Ausrüstungs-System** (`data/equipment.js`): Waffen + Rüstung je 4 Stufen pro Held
- [x] **Level-Up-System** (`characters.js` erweitert): growthHp, growthAtk, growthDef
- [x] **Speicher-Logik** (`storage.js`): hubData für Levels + Equipment

## Meilenstein 21: KI-Evolution (Die Taktik-Feinde)
*Fokus: Die Gegner nutzen die neuen Mechaniken.*

- [ ] **Waffendreieck-Awareness:** KI priorisiert Ziele, gegen die sie einen Waffen-Vorteil hat.
- [ ] **Terrain-Nutzung:** KI versucht, Fernkämpfer auf Hügel oder in Wälder zu stellen und meidet Sümpfe.
- [ ] **Heiler- & Boss-Verhalten:** Gegnerische Heiler suchen verletzte Verbündete. Bosse (Trait `boss`) bleiben auf ihrer Festung stehen und warten, bis der Spieler in Reichweite kommt.

## Meilenstein 22: Tooling, Tiled & Assets (Polishing)
*Fokus: Der finale 16-Bit Japano-RPG Look.*

- [ ] **Erweitertes Tiled-Mapping:** Einbindung des finalen Tilesets. Nutzung von "Custom Properties" in Tiled für Feldeigenschaften.
- [ ] **Charakter-Portraits & InkJS-Dialoge:** Einbinden von Anime-Portraits für die Dialog-Boxen (`dialog.js`). Migration zu echten InkJS-Story-Files für Verzweigungen und Insider-Jokes.
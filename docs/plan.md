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

## Meilenstein 20: Der Hub - Ordenverleihung, Die Küche & Spielstand-Verwaltung
*Fokus: Strategische Upgrades zwischen den Missionen. Screen-Flow: Titel → Hub → Mission → Hub.*

- [x] **Screen-Flow**: Titel → Hub → Mission → Hub
- [x] **Title-Screen** (`title.js`): "SI-Games 25" + "Start" Button
- [x] **Hub-UI**: Top-Leiste `Augsburg | 💎 X Orbs | ⭐ X Reputation` + 3 Buttons
- [x] **Konventsküche**: Ausrüstungs-Submenu mit 4 Stufen (Waffe + Rüstung, Orb-Kosten)
- [x] **Ordensverleihung**: Level-Up-Submenu (exponentielle Reputations-Kosten)
- [x] **Ausrüstungs-System** (`data/equipment.js`): Waffen + Rüstung je 4 Stufen pro Held
- [x] **Level-Up-System** (`characters.js` erweitert): growthHp, growthAtk, growthDef
- [x] **Speicher-Logik** (`storage.js`): hubData für Levels + Equipment
- [x] **Spielstand-Verwaltung (3 Slots):**
  - [x] **Titel-Screen "Spielstand laden"-Button**: Im Title-Screen ein Menü mit 3 Spielständen (Slot 1, Slot 2, Slot 3). Jeder Slot zeigt Info: aktuelle Mission, Spielzeit, letzter Speicherpunkt.
  - [x] **Hub "Speichern & Laden"-Button**: Im Hub ein zusätzlicher Button, der ein Overlay öffnet mit "Speichern" und "Laden"-Optionen für die 3 Slots.
  - [x] **Speicherstruktur erweitern**: `storage.js` speichert Array `saveSlots: [{ slot: 1, hubData, timestamp, playTime }, ...]` zusätzlich zum aktiven Slot.

## Meilenstein 21: KI-Evolution (Die Taktik-Feinde)
*Fokus: Die Gegner handeln strategisch, nutzen Terrain und werten Ziele aus.*

- [x] **Target-Scoring (Intelligente Zielauswahl):**
  - KI wählt nicht mehr stur den nächsten Gegner, sondern berechnet einen "Attraktivitäts-Wert" für jedes Ziel in Reichweite.
  - *Faktoren:* Waffenvorteil (z.B. Axt greift Lanze an), Schwächster zuerst (Gegner mit < 30% HP werden priorisiert), Flankierungs-Bonus möglich.
- [x] **Terrain-Bewusstsein & Defensive:**
  - Bei der Bewegung auf ein Angriffsfeld bevorzugt die KI defensive Felder (Wald `+1 Def`, Hügel `+1 Def`).
  - Vermeidung von negativen Feldern (Sumpf `-1 Def`) als Angriffsposition.
- [x] **Fernkämpfer- & Kiting-Logik:**
  - Bogenschützen und Magier halten maximalen Abstand (`range`) zum Ziel.
  - Wenn ein Spieler direkt neben einem Bogenschützen steht, bewegt sich die KI (falls möglich) erst weg, bevor sie schießt.
- [x] **Rückzug & Flucht:**
  - Stark verletzte KI-Einheiten (z.B. unter 25% HP) priorisieren die Flucht auf ein defensives Feld (Wald/Hügel/Stadt) statt sinnlos anzugreifen.
- [x] **Verbesserte Pfadfindung (Aggro-Handling):**
  - Nutze `findPathAndCost` um zu prüfen, wen die KI wirklich erreichen kann, statt nur die Luftlinien-Distanz zu berechnen.
  - Einheitenspezifischer Aggro-Radius basierend auf `baseSight` + `mp`.
- [x] **Heiler- & Boss-Verhalten:**
  - Gegnerische Heiler (`effect: 'heal'`) suchen verletzte Verbündete und heilen sie.
  - Bosse (`trait: 'boss'`) halten ihre Festung und greifen nur aus der Nähe an oder wirken Debuff-Zauber.


## Meilenstein 22: Tooling, Tiled & Assets (Polishing)
*Fokus: Der finale 16-Bit Japano-RPG Look. Echte Tiled-Maps, Charakter-Sprites und InkJS-Dialoge ersetzen alle Platzhalter.*

***

### 22a: Tiled-Map-Pipeline & Terrain-Integration

- [x] **Neues Terrain `wall` und `gate` ergänzen:** In `terrain.js` zwei neue Einträge hinzufügen: `wall` (unpassierbar, kein Verteidigungsbonus) und `gate` (passierbar, +2 Verteidigung). Entsprechende Tileset-Tiles in Tiled mit `terrain = wall` bzw. `terrain = gate` taggen.
- [x] **Decor-Layer-Priorisierung in `renderer.js`:** Beim Auslesen des Terrain-Typs prüft der Renderer zuerst den `Terrain_Decor`-Layer. Hat das Decor-Tile ein `terrain`-Property (z.B. Brücke über Fluss), gewinnt das Decor. Ansonsten gilt das Tile im `Terrain_Base`-Layer.

***

### 22b: Stadt- und Trigger-Objekte in Tiled

- [x] **Städte als Rechteck-Objekte im Triggers-Layer:** Jede Stadt (z.B. Augsburg) wird als benanntes Rechteck-Objekt angelegt, das alle zugehörigen Tiles umschließt. Das `name`-Feld in Tiled trägt den Stadtnamen (kein extra `label`-Property nötig — Phaser liest `obj.name` direkt aus).
- [x] **Trigger-Objekte (Punkt-Objekte):** Für positionsbasierte Events (z.B. „Spieler betritt Feld X") werden Punkt-Objekte im `Triggers`-Layer gesetzt mit den Properties `type = trigger` und `inkKnot = <knot_name>`.
- [x] **Renderer liest Triggers-Layer aus:** `renderer.js` iteriert beim Laden der Map über alle Objekte im `Triggers`-Layer. Städte werden als Zonen gespeichert (col/row aus `obj.x / tileSize`), Stadtname wird als Text über dem Objekt-Rechteck gerendert (Depth 20, kleiner weißer Font mit Stroke).
- [x] **`CombatScene` prüft Trigger bei Bewegung:** Nach jeder Einheitenbewegung wird geprüft, ob die neue Position innerhalb eines Stadt-Rechtecks oder auf einem Trigger-Punkt liegt. Treffer lösen den hinterlegten `inkKnot` in `dialog.js` aus.
- [ ] **City-Template anlegen (optional):** Ein Tiled-Template `city_template.tx` mit den Standard-Properties wird einmalig gespeichert: `heals = true`, `hasOrb = false`, `inkKnot = ""`. Pro Instanz werden nur `name` und `inkKnot` überschrieben.

***

### 22c: Charakter-Sprite-System

- [x] **Sprite-Ordnerstruktur etabliert:**
  - Helden-Sprites: `public/assets/sprites/heroes/<character_key>/spritesheet.png` + `spritesheet.json`
  - Gegner-Sprites: `public/assets/sprites/enemies/<character_key>/spritesheet.png` + `spritesheet.json`
  - `<character_key>` entspricht exakt dem Key in `characters.js` (z.B. `carl_the_great`, `zarewitsch`, `tiktok`)
- [ ] **Spritesheet-Build-Workflow (PixelLab → Phaser):** Neue Charakter-Sprites werden mit `build_spritesheet.py` aus dem PixelLab-Export gebaut: `python3 build_spritesheet.py --meta <export>/metadata.json --out public/assets/sprites/heroes/<key> --name <key>`. Das Skript erzeugt `spritesheet.png`, `spritesheet.json` und `phaser_snippet.js`.
- [x] **Atlas-Format:** Alle Spritesheets nutzen das Phaser-3-Atlas-Format (multi-pack, `textures[]`-Array). Geladen wird mit `this.load.atlas(charKey, '...spritesheet.png', '...spritesheet.json')` in `CombatScene.preload()`.
- [x] **Animations-Key-Konvention:** `<char_key>_<animation_name>_<direction>` (z.B. `carl_the_great_fight_stance_idle_south`). Richtungen: `south`, `west`, `east`, `north`. Standbilder (Rotations): `<char_key>_rotation_<direction>` mit `repeat: 0`.
- [x] **`renderer.js` auf Sprites umstellen:** Die bisherige Graphics-basierte Unit-Darstellung (farbige Quadrate/Kreise) wird durch echte `this.add.sprite()`-Instanzen ersetzt. Beim Erstellen einer Unit wird der passende Atlas geladen und die Idle-Animation der aktuellen Blickrichtung abgespielt.
- [x] **Richtungswechsel bei Bewegung:** Nach jeder Bewegung wird die Blickrichtung der Einheit (south/west/east/north) anhand der Bewegungsrichtung aktualisiert und die entsprechende Idle-Animation abgespielt.

***

### 22d: Portrait-System

- [ ] **Portrait-Ordnerstruktur:** Portraits liegen unter `public/assets/portraits/<character_key>/portrait_<character_key>_neutral.png` (Helden) bzw. `public/assets/portraits/enemies/portrait_enemy_<key>.png` (Gegner). Die Pfade entsprechen exakt den `portrait`-Feldern in `characters.js`.
- [ ] **Portraits in `combat-ui.js` einbinden:** Das Unit-Panel (links) zeigt das Portrait der ausgewählten Einheit. Die Combat-Preview (5-Spalten-Layout: Porträt | Info | VS | Info | Porträt) nutzt die Portrait-Pfade aus `characters.js` direkt als `<img src="...">`.
- [ ] **Fallback:** Wenn kein Portrait vorhanden, wird ein neutrales Platzhalter-Icon gezeigt (kein JS-Fehler).

### 22e: InkJS-Dialoge & Story-Integration
*Vorbereitung für Meilenstein 23: Narrative.*

- [ ] **InkJS einbinden:** `inkjs` als npm-Paket installieren (`npm install inkjs`). Import in `dialog.js`.
- [ ] **Ink-Story-Dateien:** Dialoge werden als `.ink`-Dateien unter `src/data/dialogs/` verfasst und mit dem Ink-Compiler (`inklecate`) zu `.json` kompiliert. Die kompilierten JSONs landen unter `public/assets/dialogs/`.
- [ ] **`dialog.js` auf InkJS umstellen:** Statt statischer Dialog-Arrays liest `dialog.js` die Ink-JSON-Story, spielt sie ab und rendert Text + Auswahloptionen im bestehenden Dialog-Overlay. Verzweigungen und Variablen (z.B. Reputation, besiegte Gegner) werden über `story.variablesState` übergeben.
- [ ] **Knot-basierter Einstieg:** `dialog.js` erhält eine Funktion `playKnot(storyFile, knotName)` — `CombatScene` und `HubScene` rufen diese mit dem `inkKnot`-Wert aus den Triggern auf.
- [ ] **Portrait im Dialog:** Sprechende Charaktere zeigen ihr Portrait links im Dialog-Overlay. Der sprechende Charakter wird per Ink-Tag (`# speaker: carl_the_great`) übergeben und `dialog.js` lädt das passende Portrait aus `characters.js`.
- [ ] **Hub-Dialoge:** Team-Gespräche im Hub (zwischen Missionen) werden ebenfalls als Ink-Knots verfasst. Der Hub kann `playKnot('hub_dialogs.json', 'after_mission_01')` aufrufen.

***

### 22f: Mission-Datei-Workflow (Manuel-Sprech → JS)

- [ ] **`mission_XX.md` als Arbeitsformat:** Jede neue Mission wird zunächst als Markdown-Datei beschrieben (Karte, Einheiten, Startpositionen, Gegner mit Verhalten, Trigger, Belohnungen, Siegbedingung, Niederlagebedingung). Keine direkte JS-Bearbeitung nötig.
- [ ] **Opencode generiert `mission_XX.js`:** Die `.md` wird opencode übergeben zusammen mit `architecture.md` und `characters.js`. Opencode erstellt daraus eine vollständige `mission_XX.js` passend zur bestehenden Missionsstruktur (`mapFile`, `playerUnits`, `enemyUnits`, `triggers`, `victoryCondition`, `defeatCondition`, `rewards`).
- [ ] **Trigger-Struktur in `mission_XX.js`:**
  ```js
  triggers: [
    { col: 5, row: 3, inkKnot: 'ambush_dialog' },
    { col: 8, row: 8, inkKnot: 'boss_encounter' },
    { type: 'onStart', inkKnot: 'mission_01_intro' },
    { type: 'onUnitDeath', unitId: 'tiktok', inkKnot: 'boss_warning' }
  ]
  ```
  oder 
  triggers: [
  // Einzelfeld
  { col: 3, row: 7, inkKnot: 'ufo_crash', oneShot: true },
  
  // Kleiner Bereich (Felder 1-5, Reihe 4)
  { cols: [1,2,3,4,5], row: 4, inkKnot: 'ambush_revealed', oneShot: true },

  // Story-Events ohne Ort
  { type: 'onStart',     inkKnot: 'mission_intro' },
  { type: 'onRound',     round: 3, inkKnot: 'reinforcements_arrive' },
  { type: 'onUnitDeath', unitId: 'tiktok', inkKnot: 'boss_enraged' },
  { type: 'onCityTaken', cityName: 'Augsburg', inkKnot: 'augsburg_falls' }
]
- [ ] **Neue Maps folgen derselben Konvention:** Tiled-Map als `public/assets/maps/mission_XX.tmj`, relativer Tileset-Pfad `assets/BaseSet.png`, Layer `Terrain_Base`, `Terrain_Decor`, `Triggers` (ohne `Units`-Layer).

***



## Meilenstein 23: Reisekarte & MapScene (Indiana Jones Style)
*Fokus: Atmosphärischer Übergang zwischen Hub und Mission — eine animierte Übersichtskarte zeigt die Reiseroute.*

### 23a: MapScene Grundstruktur

- [ ] **Neue Szene `src/js/scenes/map.js`** anlegen und in `main.js` registrieren.
- [ ] **Szenen-Flow erweitern:** `HubScene` startet nicht mehr direkt `CombatScene`, sondern `MapScene`. `MapScene` startet nach der Animation automatisch `CombatScene`.
- [ ] **Hintergrund-Asset:** Eine stilisierte, leicht vergilbte Pergament-Karte von Mitteleuropa/Deutschland als PNG (`public/assets/ui/world_map.png`). Generierbar mit Flux/Midjourney: *„aged parchment map of medieval germany, illustrated top-down rpg style, no text, no labels, warm sepia tones"*.
- [ ] **Missions-Punkte:** Jede Mission hat in `mission_XX.js` eine `mapPosition: { x: 310, y: 220 }` — Pixelkoordinaten auf der Weltkarte. `MapScene` liest die aktuelle und die nächste Mission aus dem Registry und platziert Marker-Sprites (`map_pin`) an den entsprechenden Positionen.
- [ ] **Abgeschlossene Missionen** werden mit einem anderen Marker dargestellt (z.B. ausgefüllter Kreis oder Häkchen-Sprite).

### 23b: Animierter Reisepfad

- [ ] **Roter Strich-Tween:** Mit `Phaser.GameObjects.Graphics` und `this.tweens.addCounter()` wird ein roter Linienpfad animiert, der sich von der letzten Mission zur nächsten zieht (Dauer ca. 2 Sekunden).
- [ ] **Kurvenführung (optional):** Statt einer geraden Linie kann ein Bezier-Kurven-Pfad via `Phaser.Curves.CubicBezier` genutzt werden für einen natürlicheren Routenverlauf.
- [ ] **Reise-Sprite:** Ein kleines Figur- oder Fahrzeug-Sprite (Pferd, Kutsche — je nach Mission-Theme) bewegt sich entlang des Pfades mit `this.tweens.add({ targets: sprite, ... })`.
- [ ] **Nach der Animation:** Kurze Pause (500ms), dann automatischer Start von `CombatScene`.

### 23c: Missions-Titel & Kontext-Dialog

- [ ] **Missions-Titel einblenden:** Nachdem der Pfad fertig gezeichnet ist, erscheint der Missionsname (`mission.title`) als Text-Overlay mit Fade-In-Animation — mittig unten, großer Font, leicht vintage.
- [ ] **Optionaler Ink-Knot:** Wenn `mission.mapKnot` gesetzt ist, spielt `dialog.js` einen kurzen Intro-Dialog auf der Karte ab (z.B. Carl erklärt das Ziel) bevor die Szene wechselt. Ohne `mapKnot` startet die Mission direkt.
- [ ] **Skip-Option:** Klick oder Leertaste überspringt die Animation und startet die Mission sofort — für Wiederholungsspieler.

### 23d: `mission_XX.js` Erweiterung

- [ ] **Neue Felder in jeder Mission:**
  ```js
  mapPosition: { x: 310, y: 220 },  // Position auf der Weltkarte
  mapKnot: 'mission_02_travel',       // optional: Ink-Dialog auf der Karte
  theme: 'medieval'                   // beeinflusst Reise-Sprite-Auswahl
  ```
- [ ] **`missions/index.js`** exportiert die Missions-Reihenfolge als Array — `MapScene` liest daraus ab welche Mission die vorherige war und wo der Pfad startet.

***

## Meilenstein 24: Audio — Musik & Soundeffekte
*Fokus: Der Sound vervollständigt die 16-Bit JRPG Atmosphäre.*

### 24a: Audio-Infrastruktur

- [ ] **Phaser Audio-System aktivieren:** In `config.js` den `audio`-Block ergänzen: `{ disableWebAudio: false }`. Phaser 3 nutzt Web Audio API automatisch mit Fallback auf HTML5 Audio.
- [ ] **Asset-Ordnerstruktur:**
  ```
  public/assets/audio/
  ├── music/
  │   ├── title.ogg         ← Titelbildschirm
  │   ├── hub.ogg           ← Hub zwischen Missionen
  │   ├── map.ogg           ← Reisekarte
  │   ├── combat.ogg        ← Kampf (normal)
  │   ├── combat_boss.ogg   ← Kampf gegen Boss
  │   └── victory.ogg       ← Siegmelodie
  └── sfx/
      ├── sword_hit.ogg
      ├── axe_hit.ogg
      ├── magic_cast.ogg
      ├── unit_move.ogg
      ├── unit_select.ogg
      ├── city_capture.ogg
      ├── unit_death.ogg
      └── dialog_blip.ogg   ← Text-Typewriter-Sound
  ```
- [ ] **Immer `.ogg` als primäres Format** (beste Browser-Kompatibilität + kleinste Dateigröße). Optional `.mp3` als Fallback für Safari: `this.load.audio('combat', ['audio/music/combat.ogg', 'audio/music/combat.mp3'])`.

### 24b: Musik-Manager (`engine/audio.js`)

- [ ] **Neues Modul `src/js/engine/audio.js`** — zentrales Musik- und SFX-Management, damit keine Szene direkt `this.sound` aufruft.
- [ ] **Funktionen:**
  - `playMusic(key, fadeIn = 500)` — startet Musik mit Fade-In, stoppt vorherige mit Fade-Out
  - `stopMusic(fadeOut = 500)` — sanftes Ausblenden
  - `playSfx(key, volume = 1)` — einmaliger Soundeffekt
  - `setMusicVolume(vol)` / `setSfxVolume(vol)` — für spätere Einstellungen
- [ ] **Musik-Loop:** Alle Musikstücke laufen mit `loop: true`. Kampfmusik wechselt bei Boss-Encounter auf `combat_boss` (mit Crossfade).
- [ ] **Szenen-Übergänge:** Jede Szene ruft `audio.playMusic('hub')` etc. in `create()` auf. Der Audio-Manager verhindert Neustart wenn dieselbe Musik schon läuft.

### 24c: Soundeffekte im Kampf

- [ ] **Waffenspezifische Treffer-Sounds:** `combat-system.js` gibt beim Angriff den Waffentyp zurück → `audio.playSfx('sword_hit')` / `axe_hit` / `magic_cast` etc.
- [ ] **Bewegungs-Sound:** `unit_move` wird einmalig beim Start einer Bewegung abgespielt (nicht pro Schritt).
- [ ] **Auswahl-Sound:** `unit_select` beim Anklicken einer eigenen Einheit.
- [ ] **Stadt-Eroberung:** `city_capture` + kurzer Fanfare-Jingle wenn eine Stadt den Besitzer wechselt.
- [ ] **Tod einer Einheit:** `unit_death` mit leichtem Pitch-Down-Effekt (`rate: 0.8`).
- [ ] **Dialog-Typewriter:** `dialog_blip` spielt bei jedem angezeigten Zeichen — mit `detune`-Variation pro Charakter (Carl: tief, Zarewitsch: hoch) für Charakter-Gefühl ohne echte Sprachausgabe.

### 24d: Audio-Quellen & Tools

- [ ] **Musik:** [OpenGameArt.org](https://opengameart.org) (CC0/CC-BY Lizenzen) — Suchbegriffe: *„JRPG battle theme"*, *„medieval fantasy loop"*, *„8bit tactical"*. Alternativ: [Pixabay Music](https://pixabay.com/music/) (kostenlos, keine Attribution nötig).
- [ ] **SFX:** [Freesound.org](https://freesound.org) (CC0 Filter setzen) oder mit **sfxr/jsfxr** ([nutzen](https://sfxr.me)) selbst generieren — perfekt für 16-Bit Retro-Sounds in 30 Sekunden.
- [ ] **Musik selbst generieren:** [Suno.ai](https://suno.com) oder [Udio](https://udio.com) — Prompt-Beispiel: *„16-bit SNES tactical RPG battle theme, Fire Emblem style, loopable, 120 BPM"*.
- [ ] **Loop-Punkte setzen:** Musik-Dateien mit [Audacity](https://www.audacityteam.org/) auf saubere Loop-Punkte trimmen (Anfang = Ende ohne Knacksen).

### 24e: Einstellungen im Hub

- [ ] **Einfaches Audio-Menü im Hub:** Musik-Lautstärke (Slider oder +/- Buttons) und SFX-Lautstärke separat regelbar.
- [ ] **Werte in `storage.js` speichern:** `audioSettings: { musicVol: 0.7, sfxVol: 1.0 }` — werden beim Start aus dem Storage geladen und an `audio.js` übergeben.
- [ ] **Mute-Toggle:** Ein Lautsprecher-Icon im HubScene-Header schaltet alle Audio stumm/an.
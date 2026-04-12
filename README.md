# SI-Games Runden-Taktik

Ein rundenbasiertes Taktikspiel (Fire Emblem / Advance Wars Style) im 16-Bit-Look zur Feier des 25-jährigen Jubiläums des si-games.com Forums. Gespielt wird direkt im Browser.

## Projektstand

### Umgesetzte Meilensteine

1. **Meilenstein 1: Projekt-Fundament & Rendering (MVP)**
   - Erstellung einer `src/index.html` als Einstiegspunkt.
   - Grundlegendes Layout mit CSS (Zentriertes Spielfeld, Platz für UI rechts/unten).
   - Implementierung einer `src/game.js`, die ein einfaches Raster (Grid) auf einem HTML5-Canvas zeichnet (z.B. 10x10 Felder).

2. **Meilenstein 2: Spielfigur & Bewegung**
   - Erstellung einer Datenstruktur für eine Spielfigur (Held).
   - Zeichnen der Figur (vorerst als farbiges Quadrat oder simplen Platzhalter) auf das Grid.
   - Implementierung der Steuerung (Mausklick oder Pfeiltasten), um die Figur innerhalb des Grids von Feld zu Feld zu bewegen.

3. **Meilenstein 3: Speichersystem (LocalStorage)**
   - Einbau eines "Speichern"-Buttons in die UI.
   - Speichern der aktuellen Position der Figur im LocalStorage des Browsers.
   - Laden der Position automatisch aus dem LocalStorage, wenn die Seite neu geladen wird (inklusive "Spielstand zurücksetzen"-Button).

4. **Meilenstein 4: Terrain & 16-Bit Look (Vorbereitung)**
   - Erweiterung des Grids um Terrain-Typen (Gras, Wasser, Berg) mit unterschiedlichen Farben.
   - Anpassung der Bewegungslogik: Berge sind unpassierbar, Wasser kostet mehr Bewegungspunkte.

5. **Meilenstein 5: Scene-Manager & Hub-System**
   - Implementierung des `SceneManager` in `src/js/engine/scene-manager.js`.
   - Erstellung einer Basis-Struktur für den Hub (`src/js/scenes/hub.js`) mit Platzhaltern für "Team-Gespräche" und "Shop/Upgrade".
   - Möglichkeit, vom Hub in die erste Mission zu starten.

6. **Meilenstein 6: Dynamisches Missions-Loading**
   - Erstellung des Ordners `src/js/data/missions/`.
   - Implementierung von `mission_01.js` mit Beispiel-Daten (Titel, Start-Dialog, Map-Layout).
   - Sicherstellung, dass die Kampf-Szene (`combat.js`) ihre Daten dynamisch aus der gewählten Missions-Datei bezieht.

7. **Meilenstein 7: Erweitertes Terrain & Theming (Civ 2 Style)**
   - Erstellung einer zentralen Terrain-Datenbank (`src/js/data/terrain.js`), die Bewegungskosten und Verteidigungsboni definiert.
   - Erweiterung des Grid-Systems, sodass jedes Feld einen logischen Terrain-Typ (z.B. PLAIN, FOREST, MOUNTAIN) hat.
   - Implementierung des "Theming": Die Missionsdatei bestimmt das Aussehen (z.B. `theme: 'fantasy'` oder `theme: 'space'`).
   - Der Renderer wählt die Farben/Darstellung basierend auf Terrain-Typ UND aktuellem Theme.

8. **Meilenstein 8: UI-Erweiterung & Info-Konsole**
   - Erweiterung des HTML/CSS Layouts um zwei neue Bereiche neben/unter dem Spielfeld: "Einheiten-Details" und "Aktions-Log".
   - Erstellung eines Moduls `src/js/engine/console.js`, das Nachrichten an das Aktions-Log sendet (z.B. "Du kannst nicht in Gebirge vorstoßen!").
   - Verbindung der Klick-Logik, sodass beim Klicken auf ein Feld oder eine Figur deren Name und Stats in den "Einheiten-Details" angezeigt werden.
   - Implementierung eines Dialog-Overlay-Systems für Missionseinführungen und Gespräche.

9. **Meilenstein 9: Einheiten-Attribute & Runden-Logik**
   - Erweiterung der Spielfigur (`hero.js`) um Attribute: `hp` (Lebenspunkte), `maxHp`, `mp` (Bewegungspunkte), `attack`, `defense`.
   - Implementierung des Runden-Ablaufs: Ein "Zug beenden"-Button, der die MP der Figur wieder auffüllt.
   - Verbindung der Bewegung mit dem Terrain: Ein Schritt kostet MP abhängig vom Terrain. Wenn MP < Kosten, wird die Bewegung blockiert und eine Nachricht an die Konsole geschickt.
   - Steuerung: Links-Klick wählt Einheit aus oder gibt Terrain-Infos, Rechtsklick bewegt Einheit. Sichtbar, wieviele Züge eine Bewegung kosten würde durch eine Bewegungslinie. Ziel-Feld-Cursor ein Symbol.
   - Leertaste: Zug für Einheit überspringen (wie bei Civ).
   - Alle Einheiten Bewegung beendet: Enter beendet Runde. Klick auf Button Runde beenden, beendet immer Zug.

### Offene Punkte

10. **Meilenstein 10: Kampfsystem & Feinde**
    - Erstellung einer Feind-Einheit (z.B. `entities/enemy.js`) und Platzierung eines Test-Gegners (z.B. "Goblin") auf der Karte.
    - Implementierung der Angriffslogik: Zieht man auf ein Feld mit einem Feind, wird angegriffen statt bewegt.
    - Berechnung des Schadens (z.B. `Angreifer Attack - Verteidiger Defense + Terrain-Bonus`) und Ausgabe des Ergebnisses über die Info-Konsole ("Montesquieu greift Goblin für 5 Schaden an!").
    - Entfernung von Einheiten mit 0 HP vom Spielfeld.

## Installation

1. Klone das Repository:
   ```bash
   git clone https://github.com/dein-benutzername/si-games-25.git
   ```

2. Öffne die `src/index.html` in deinem Browser.

## Bedienung

- **Einheit auswählen**: Klicke auf die Einheit "Montesquieu", um sie auszuwählen.
- **Bewegung**: Klicke auf ein leeres Feld, um es als Ziel auszuwählen. Klicke erneut auf das Feld, um die Bewegung auszulösen.
- **Zug beenden**: Klicke auf den "Zug beenden"-Button in der Top-Bar, um die Bewegungspunkte wieder aufzufüllen.
- **Speichern/Laden**: Nutze die Buttons in der Top-Bar, um den Spielstand zu speichern oder zu laden.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe die [LICENSE](LICENSE) Datei für weitere Informationen.
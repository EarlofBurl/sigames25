// hero.js
// Verwaltet die Spielfigur (Held)

let player = {
    row: 0,
    col: 0,
    color: '#ff0000'
};

// Gibt die aktuelle Position des Helden zurück
export function getHeroPosition() {
    return { row: player.row, col: player.col };
}

// Setzt die Position des Helden
export function setHeroPosition(row, col) {
    player.row = row;
    player.col = col;
}

// Gibt die Farbe des Helden zurück
export function getHeroColor() {
    return player.color;
}
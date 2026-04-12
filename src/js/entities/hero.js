// hero.js
// Verwaltet die Spielfigur (Held)

let player = {
    row: 0,
    col: 0,
    color: '#ff0000',
    hp: 10,
    maxHp: 10,
    mp: 5,
    maxMp: 5,
    attack: 3,
    defense: 2
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

// Gibt die Attribute des Helden zurück
export function getHeroAttributes() {
    return {
        hp: player.hp,
        maxHp: player.maxHp,
        mp: player.mp,
        maxMp: player.maxMp,
        attack: player.attack,
        defense: player.defense
    };
}

// Setzt die Bewegungspunkte des Helden
export function setHeroMp(mp) {
    player.mp = mp;
}

// Füllt die Bewegungspunkte des Helden auf
export function refillHeroMp() {
    player.mp = player.maxMp;
}

// Setzt die HP des Helden
export function setHeroHp(hp) {
    player.hp = hp;
}
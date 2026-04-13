// mission_01.js
// Daten für Mission 1

export const mission01 = {
    id: 'mission_01',
    title: 'Das 25-jährige Jubiläum',
    description: 'Feiere das 25-jährige Jubiläum des si-games.com Forums, indem du die erste Mission erfolgreich abschließt!',
    theme: 'classic',
    mapData: {
        size: { rows: 10, cols: 10 },
        terrain: [
            // Logische Karte mit allen Terrain-Typen
            ['PLAIN', 'PLAIN', 'FOREST', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'],
            ['PLAIN', 'PLAIN', 'FOREST', 'PLAIN', 'HILL', 'HILL', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'],
            ['PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'HILL', 'HILL', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'],
            ['PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'],
            ['PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'],
            ['PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'],
            ['PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'],
            ['PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'],
            ['PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN'],
            ['PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN', 'PLAIN']
        ]
    },
    objectives: [
        'Erreiche das Zielgebiet',
        'Besiege alle Gegner'
    ],
    playerUnits: [
        {
            name: 'Montesquieu',
            row: 0,
            col: 0,
            color: '#ff0000',
            hp: 10,
            maxHp: 10,
            mp: 5,
            maxMp: 5,
            attack: 3,
            defense: 2,
            isHero: true
        },
        {
            name: 'Ritter',
            row: 0,
            col: 1,
            color: '#0000ff',
            hp: 12,
            maxHp: 12,
            mp: 4,
            maxMp: 4,
            attack: 4,
            defense: 3,
            isHero: true
        }
    ],
    enemies: [
        {
            name: 'Goblin',
            row: 5,
            col: 5,
            hp: 8,
            maxHp: 8,
            attack: 2,
            defense: 1
        },
        {
            name: 'Goblin',
            row: 5,
            col: 6,
            hp: 8,
            maxHp: 8,
            attack: 2,
            defense: 1
        }
    ],
    dialogues: [
        {
            character: 'Spielleiter',
            text: 'Willkommen zur ersten Mission!'
        }
    ]
};
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
    enemies: [
        {
            name: 'Goblin',
            row: 5,
            col: 5,
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
// mission_01.js
// Daten für Mission 1

export const mission01 = {
    id: 'mission_01',
    title: 'Das 25-jährige Jubiläum',
    description: 'Feiere das 25-jährige Jubiläum des si-games.com Forums, indem du die erste Mission erfolgreich abschließt!',
    theme: 'classic',
    mapFile: 'assets/maps/mission_01.tmj',
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
            isHero: true,
            type: 'Barde',
            spells: [
                { name: 'Anfeuern', effect: 'buff_attack', value: 1, duration: 1, target: 'ally', range: 1, mpCost: 2 },
                { name: 'Dissen', effect: 'debuff_attack', value: 1, duration: 1, target: 'enemy', range: 1, mpCost: 2 }
            ]
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
        },
        {
            name: 'Bogenschütze',
            row: 0,
            col: 2,
            color: '#00ff00',
            hp: 8,
            maxHp: 8,
            mp: 5,
            maxMp: 5,
            attack: 3,
            defense: 1,
            range: 2,
            isHero: true
        },
        {
            name: 'Artillerie',
            row: 1,
            col: 0,
            color: '#ffaa00',
            hp: 6,
            maxHp: 6,
            mp: 3,
            maxMp: 3,
            attack: 4,
            defense: 0,
            range: 3,
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
        },
        {
            name: 'Goblinbogenschütze',
            row: 5,
            col: 7,
            hp: 6,
            maxHp: 6,
            attack: 2,
            defense: 0,
            range: 2
        }
    ],
    dialogues: [
        {
            character: 'Spielleiter',
            text: 'Willkommen zur ersten Mission!'
        }
    ]
};
// mission_01.js
// Daten für Mission 1
// Helden referenzieren characters.js per characterId, nur Position wird überschrieben.

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
        { characterId: 'montesquieu', row: 0, col: 0, isHero: true },
        { characterId: 'ritter',      row: 0, col: 1, isHero: true },
        { characterId: 'bogenschuetze', row: 0, col: 2, isHero: true },
        { characterId: 'artillerie',  row: 1, col: 0, isHero: true }
    ],
    enemies: [
        { characterId: 'goblin',        row: 5, col: 5 },
        { characterId: 'goblin',        row: 5, col: 6 },
        { characterId: 'goblin_archer', row: 5, col: 7 }
    ],
    dialogues: [
        {
            character: 'Spielleiter',
            text: 'Willkommen zur ersten Mission!'
        }
    ]
};

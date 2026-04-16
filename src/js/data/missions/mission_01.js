// mission_01.js
// Daten für Mission 1
// Helden referenzieren characters.js per characterId, nur Position wird überschrieben.

export const mission01 = {
    id: 'mission_01',
    title: 'Der Sturm auf die Kommentar-Schreiber',
    description: 'Die SocialMedia-Plage hat das Forum übernommen! Zarewitsch und Carl the Great rücken aus, um die Kommentar-Schreiber zu besiegen.',
    theme: 'classic',
    mapFile: 'assets/maps/mission_01.tmj',
    defeatCondition: 'defeat_all',
    targetRounds: 15,
    baseReputation: 100,
    objectives: [
        'Besiege alle SocialMedia-Trolle'
    ],
    playerUnits: [
        { characterId: 'zarewitsch',   row: 0, col: 0, isHero: true },
        { characterId: 'carl_the_great', row: 0, col: 1, isHero: true }
    ],
    enemies: [
        { characterId: 'tiktok',   row: 5, col: 5 },
        { characterId: 'insta',    row: 5, col: 6 },
        { characterId: 'facebook', row: 5, col: 7 }
    ],
    dialogues: [
        {
            character: 'Zarewitsch',
            text: 'Vorwärts! Die Kommentar-Schreiber werden fallen!'
        }
    ]
};

// characters.js
// Zentrale Charakter-Datenbank: Helden und Gegner

export const heroes = {
    zarewitsch: {
        name: 'Zarewitsch',
        portrait: 'assets/portraits/zarewitsch/portrait_zarewitsch_neutral.png',
        weapon: 'sword',
        hp: 12,
        mp: 4,
        mana: 0,
        atk: 4,
        def: 3,
        spd: 2,
        rng: 1,
        baseSight: 3,
        color: '#990000',
        traits: [],
        spells: [],
        level: 1,
        growthHp: 2,
        growthAtk: 2,
        growthDef: 2
    },
    carl_the_great: {
        name: 'Carl the Great',
        portrait: 'assets/portraits/carl_the_great/portrait_carl_the_great_neutral.png',
        weapon: 'sword',
        hp: 14,
        mp: 4,
        mana: 4,
        atk: 3,
        def: 5,
        spd: 3,
        rng: 1,
        baseSight: 3,
        color: '#ffd700',
        traits: ['light'],
        spells: [
            { name: 'Segnen', effect: 'cleanse', value: 0, duration: 0, target: 'ally', range: 1, manaCost: 2, traitName: null, traitStat: null },
            { name: 'Social Media Bannen', effect: 'social_ban', value: 0, duration: 0, target: 'enemy', range: 1, manaCost: 3, element: 'dark', traitName: 'gebannt', traitStat: 'atk' }
        ],
        level: 1,
        growthHp: 3,
        growthAtk: 1,
        growthDef: 2
    }
};

export const enemies = {
    tiktok: {
        name: 'TikTok Kid',
        portrait: 'assets/portraits/enemies/portrait_enemy_TikTok.png',
        weapon: 'axe',
        hp: 8,
        mp: 3,
        mana: 0,
        atk: 1,
        def: 2,
        spd: 3,
        rng: 1,
        baseSight: 3,
        color: '#ff0066',
        traits: ['SocialMedia'],
        spells: []
    },
    insta: {
        name: 'Instagram Influencer',
        portrait: 'assets/portraits/enemies/portrait_enemy_Insta.png',
        weapon: 'lance',
        hp: 10,
        mp: 3,
        mana: 0,
        atk: 3,
        def: 1,
        spd: 3,
        rng: 1,
        baseSight: 3,
        color: '#ff6600',
        traits: ['SocialMedia'],
        spells: []
    },
    facebook: {
        name: 'Facebook Karen',
        portrait: 'assets/portraits/enemies/portrait_enemy_facebook.png',
        weapon: 'bow',
        hp: 10,
        mp: 3,
        mana: 0,
        atk: 3,
        def: 1,
        spd: 3,
        rng: 2,
        baseSight: 3,
        color: '#0066ff',
        traits: ['SocialMedia'],
        spells: []
    }
};
Helden:

Zarewitsch
Typ: Nahkampf
Klasse (fluff): Zar
Waffe (Technisch, Symbol): Schwert
Waffe (fluff): Reichszepter
HP: 12
mp: 4
mana: -
atk: 4
def: 3
spd: 2
rng: 1
Traits: -
    level: 1,
        growthHp: 2,
        growthAtk: 2,
        growthDef: 2

Carl the Great
Typ: Nahkampf
Klasse (fluff): Paladin
Waffe (Technisch, Symbol): Schwert
Waffe (fluff): Die heilige Kelle
HP: 14
mp: 4
mana: 4
atk: 3
def: 5
spd: 3
rng: 1
Traits: -
spells: [
            { name: 'Segnen', effect: enferne eine schlechte eigenschaft, Kosten 1 Mana},
            { name: 'Verfluche Ketzer', effect: Kampfzauber gegen Feinde mit dem Trait "SocialMedia" Fügt 5 Schaden zu, Kosten 2 Mana }
        ],
        level: 1,
        growthHp: 3,
        growthAtk: 1,
        growthDef: 2

Feinde

tiktok: {
        name: 'TikTok Kid',
        portrait: '👺',
        weapon: 'axe',
        Weapon (fluff): Energy Drink
        hp: 8,
        mp: 3,
        mana: 0,
        atk: 1,
        def: 2,
        spd: 3,
        rng: 1,
        baseSight: 3,
        color: '#ff0000',
        traits: ["SocialMedia"],
        spells: []
    },

    insta: {
        name: 'Instagram Influencer',
        portrait: '👺',
        weapon: 'lance',
        weapon (fluff): Selfy
        hp: 10,
        mp: 3,
        mana: 0,
        atk: 3,
        def: 1,
        spd: 3,
        rng: 1,
        baseSight: 3,
        color: '#ff0000',
        traits: ["SocialMedia"],
        spells: []
    },

        facebook: {
        name: 'Facebook Karen',
        portrait: '👺',
        weapon: 'bow',
        Weapon (fluff): Geschrei
        hp: 10,
        mp: 3,
        mana: 0,
        atk: 3,
        def: 1,
        spd: 3,
        rng: 1,
        baseSight: 3,
        color: '#ff0000',
        traits: ["SocialMedia"],
        spells: []
    },
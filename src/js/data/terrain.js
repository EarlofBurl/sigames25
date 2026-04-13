// terrain.js
// Definiert die Terrain-Typen und ihre Eigenschaften

export const terrainTypes = {
    PLAIN: {
        name: 'Ebene',
        movementCost: 1,
        defenseBonus: 0,
        isPassable: true,
        sightMod: 0
    },
    FOREST: {
        name: 'Wald',
        movementCost: 2,
        defenseBonus: 2,
        isPassable: true,
        sightMod: -1
    },
    HILL: {
        name: 'Hügel',
        movementCost: 2,
        defenseBonus: 1,
        isPassable: true,
        sightMod: 1
    },
    RIVER: {
        name: 'Fluss',
        movementCost: 2,
        defenseBonus: 0,
        isPassable: true,
        sightMod: 0
    },
    MOUNTAIN: {
        name: 'Berg',
        movementCost: Infinity,
        defenseBonus: 3,
        isPassable: false,
        sightMod: 0
    },
    WATER: {
        name: 'Wasser',
        movementCost: 2,
        defenseBonus: 0,
        isPassable: true,
        sightMod: 0
    },
    CITY: {
        name: 'Stadt',
        movementCost: 1,
        defenseBonus: 3,
        isPassable: true,
        sightMod: 0
    }
};

// Definiert die Farben für jedes Terrain basierend auf dem Theme
export const terrainThemes = {
    classic: {
        PLAIN: '#8bc34a',
        FOREST: '#2e7d32',
        HILL: '#8d6e63',
        RIVER: '#42a5f5',
        MOUNTAIN: '#795548',
        WATER: '#1976d2',
        CITY: '#795548'
    },
    fantasy: {
        PLAIN: '#8bc34a',
        FOREST: '#388e3c',
        HILL: '#a1887f',
        RIVER: '#00acc1',
        MOUNTAIN: '#616161',
        WATER: '#00838f',
        CITY: '#795548'
    },
    space: {
        PLAIN: '#616161',
        FOREST: '#388e3c',
        HILL: '#795548',
        RIVER: '#00acc1',
        MOUNTAIN: '#455a64',
        WATER: '#00838f',
        CITY: '#5d4037'
    }
};
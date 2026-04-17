import { getPlayerUnits, getEnemyUnits } from '../entities/units.js';
import { terrainTypes } from './terrain.js';
import { getVisibilityStatus, getVisibilityStatuses } from './visibility-system.js';

const CELL_SIZE = 50;
const TILE_SIZE = 16;
const SCALE = CELL_SIZE / TILE_SIZE;

let gfx = null;
let scene = null;
let grid = [];
let baseLayer = null;
let decorLayer = null;
let selectedTarget = null;
let selectedUnit = null;
let visibilityGrid = {};
let costLabels = [];
let VISIBILITY_STATUS;
let locationLabels = [];
let locationOwners = {};
let triggers = [];
let mapWidth = 30;
let mapHeight = 20;
let unitSprites = new Map();
let registeredAtlases = new Set();

const SPRITE_CONFIG = {
    carl_the_great: {
        idlePrefix: 'carl_the_great_fight_stance_idle',
        idleFrames: 8
    },
    zarewitsch: {
        idlePrefix: 'zarewitsch_breathing_idle',
        idleFrames: 4
    },
    tiktok: {
        idlePrefix: 'tiktok_breathing_idle',
        idleFrames: 4
    },
    insta: {
        idlePrefix: 'insta_fight_stance_idle',
        idleFrames: 8
    },
    facebook: {
        idlePrefix: 'facebook_breathing_idle',
        idleFrames: 4
    }
};

function buildTileToTerrainMap(tileset) {
    const map = {};

    if (tileset.tileProperties) {
        console.log('[buildTileToTerrainMap] Using tileProperties, entries:', Object.keys(tileset.tileProperties).length);
        for (const localIdStr in tileset.tileProperties) {
            const localId = parseInt(localIdStr, 10);
            const tileProps = tileset.tileProperties[localIdStr];
            if (tileProps && tileProps.terrain !== undefined) {
                map[localId] = tileProps.terrain;
            }
        }
    } else if (tileset.tiles) {
        for (const tile of tileset.tiles) {
            const localId = tile.id;
            const props = tile.properties;
            if (props) {
                for (const p of props) {
                    if (p.name === 'terrain' && p.type === 'string') {
                        map[localId] = p.value;
                        break;
                    }
                }
            }
        }
    }

    console.log('[buildTileToTerrainMap] map[0]:', map[0], 'map[61]:', map[61], 'map[182]:', map[182], 'map[286]:', map[286]);
    return map;
}

function getTerrainName(localId, tileToTerrainMap, terrainTypes) {
    if (localId === null || localId === undefined) return 'plains';
    const terrain = tileToTerrainMap[localId];
    if (terrain && terrainTypes[terrain]) {
        return terrain;
    }
    return 'plains';
}

export function initGrid() {
    grid = Array.from({ length: mapHeight }, () =>
        Array.from({ length: mapWidth }, () => ({ type: 'plains' }))
    );
    VISIBILITY_STATUS = getVisibilityStatuses();
}

export function initRenderer(phaserScene, mission) {
    scene = phaserScene;
    initGrid();

    const tilemap = scene.make.tilemap({ key: 'mission_map' });
    const tilesetImage = tilemap.addTilesetImage('BaseSet', 'terrain_tileset');

    if (!tilesetImage) {
        console.error('[renderer] Tileset "BaseSet" nicht gefunden!');
        return;
    }

    mapWidth = tilemap.width;
    mapHeight = tilemap.height;

    const tileset = tilemap.tilesets.find(ts => ts.name === 'BaseSet');

    const tileToTerrain = buildTileToTerrainMap(tileset || tilesetImage);
    const firstgid = tilesetImage.firstgid;

    grid = Array.from({ length: mapHeight }, () =>
        Array.from({ length: mapWidth }, () => ({ type: 'plains' }))
    );

    baseLayer = tilemap.createLayer('Terrain_Base', tileset);
    baseLayer.setScale(SCALE);
    baseLayer.setDepth(0);

    decorLayer = tilemap.createLayer('Terrain_Decor', tileset);
    decorLayer.setScale(SCALE);
    decorLayer.setDepth(1);

    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            let terrainName = 'plains';

            const baseTile = baseLayer.getTileAt(c, r);
            if (baseTile) {
                terrainName = getTerrainName(baseTile.index - firstgid, tileToTerrain, terrainTypes);
            }

            const decorTile = decorLayer.getTileAt(c, r);
            if (decorTile) {
                const decorTerrain = getTerrainName(decorTile.index - firstgid, tileToTerrain, terrainTypes);
                if (decorTerrain !== 'plains' || terrainName === 'plains') {
                    terrainName = decorTerrain;
                }
            }

            grid[r][c] = { type: terrainName };
        }
    }

    const triggersLayerData = tilemap.getObjectLayer('Triggers');
    triggers = [];
    if (triggersLayerData && triggersLayerData.objects) {
        for (const obj of triggersLayerData.objects) {
            if (obj.x !== undefined && obj.y !== undefined) {
                const col = Math.floor((obj.x + (obj.width || 0) / 2) / TILE_SIZE);
                const row = Math.floor((obj.y + (obj.height || 0) / 2) / TILE_SIZE);
                const trigger = {
                    name: obj.name || '',
                    type: obj.type || '',
                    col,
                    row,
                    width: obj.width ? Math.floor(obj.width / TILE_SIZE) : 1,
                    height: obj.height ? Math.floor(obj.height / TILE_SIZE) : 1,
                    properties: obj.properties || {}
                };
                triggers.push(trigger);
                if (col >= 0 && col < mapWidth && row >= 0 && row < mapHeight) {
                    grid[row][col].name = obj.name || null;
                    grid[row][col].locationType = obj.type || null;
                    if (obj.properties) {
                        for (const prop of obj.properties) {
                            if (prop.name === 'hasOrb') grid[row][col].hasOrb = prop.value;
                            if (prop.name === 'heals') grid[row][col].heals = prop.value;
                        }
                    }
                }
            }
        }
    }

    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            if (grid[r][c].locationType) {
                locationOwners[`${r},${c}`] = 'neutral';
            }
        }
    }

    gfx = scene.add.graphics();
    gfx.setDepth(1);

    drawGrid();
}

function clearCostLabels() {
    costLabels.forEach(t => t.destroy());
    costLabels = [];
}

function setLocationOwner(row, col, owner) {
    const key = `${row},${col}`;
    locationOwners[key] = owner;
}

function getLocationOwner(row, col) {
    return locationOwners[`${row},${col}`] || 'neutral';
}

function collectOrb(row, col) {
    if (grid[row] && grid[row][col] && grid[row][col].hasOrb) {
        grid[row][col].hasOrb = false;
        return true;
    }
    return false;
}

function clearLocationLabels() {
    locationLabels.forEach(l => l.destroy());
    locationLabels = [];
}

function drawOwnershipBorders() {
    if (!gfx) return;
    const BORDER_WIDTH = 3;
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            const cell = grid[r][c];
            if (!cell.locationType) continue;
            const owner = locationOwners[`${r},${c}`] || 'neutral';
            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;
            let color;
            if (owner === 'player') color = 0x4444ff;
            else if (owner === 'enemy') color = 0xff4444;
            else color = 0x888888;
            gfx.lineStyle(BORDER_WIDTH, color, 1.0);
            gfx.strokeRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
    }
}

function drawLocationLabels() {
    if (!scene) return;
    clearLocationLabels();
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            const cell = grid[r][c];
            if (!cell.name) continue;
            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE + CELL_SIZE + 2;
            const label = scene.add.text(x + CELL_SIZE / 2, y, cell.name, {
                fontFamily: 'Arial', fontSize: '10px',
                color: '#ffffff',
                stroke: '#000000', strokeThickness: 2
            });
            label.setOrigin(0.5, 0);
            label.setDepth(5);
            locationLabels.push(label);
        }
    }
}

function addCostLabel(col, row, cost, isRed, isZoC) {
    if (!scene) return;
    const text = isZoC ? 'ZoC' : `${cost} MP`;
    const label = scene.add.text(col * CELL_SIZE + 5, row * CELL_SIZE + 42, text, {
        fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold',
        color: isRed ? '#ff4444' : '#ffffff'
    });
    label.setDepth(10);
    costLabels.push(label);
}

export function setVisibilityGrid(newVisibilityGrid) {
    visibilityGrid = newVisibilityGrid;
}

export function getVisibilityData() {
    return visibilityGrid;
}

export function drawGrid() {
    if (!gfx) return;

    gfx.clear();
    clearCostLabels();

    // 1. Grid-Linien zuerst zeichnen (als unterste Ebene)
    gfx.lineStyle(1, 0xffffff, 0.3);
    for (let c = 0; c <= mapWidth; c++) {
        gfx.strokeRect(c * CELL_SIZE - 0.5, 0, 1, mapHeight * CELL_SIZE);
    }
    for (let r = 0; r <= mapHeight; r++) {
        gfx.strokeRect(0, r * CELL_SIZE - 0.5, mapWidth * CELL_SIZE, 1);
    }

    // 2. Fog/UNEXPLORED Fills darüber zeichnen (außerhalb des Loops mit den Linien)
    for (let r = 0; r < mapHeight; r++) {
        for (let c = 0; c < mapWidth; c++) {
            const status = getVisibilityStatus(visibilityGrid, r, c);
            const x = c * CELL_SIZE;
            const y = r * CELL_SIZE;

            if (status === VISIBILITY_STATUS.UNEXPLORED) {
                gfx.fillStyle(0x000000);
                gfx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            } else if (status === VISIBILITY_STATUS.FOG) {
                gfx.fillStyle(0x000000, 0.5);
                gfx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    drawOwnershipBorders();
    updateUnitSprites();
    drawSelectionHighlight();
    drawLocationLabels();
}

function drawSelectionHighlight() {
    if (!gfx) return;

    if (selectedUnit && selectedTarget && selectedTarget.path && selectedTarget.path.length > 0) {
        const strokeColor = selectedTarget.type === 'unreachable' ? 0xff0000 : 0xffffff;
        gfx.lineStyle(3, strokeColor, 0.5);
        gfx.beginPath();
        gfx.moveTo(selectedUnit.col * CELL_SIZE + 25, selectedUnit.row * CELL_SIZE + 25);
        selectedTarget.path.forEach(n => {
            gfx.lineTo(n.col * CELL_SIZE + 25, n.row * CELL_SIZE + 25);
        });
        gfx.strokePath();
    }

    if (selectedUnit) {
        gfx.lineStyle(3, 0xffff00);
        gfx.strokeRect(selectedUnit.col * CELL_SIZE + 2, selectedUnit.row * CELL_SIZE + 2, 46, 46);
    }

    if (selectedTarget) {
        const x = selectedTarget.col * CELL_SIZE + 25;
        const y = selectedTarget.row * CELL_SIZE + 25;

        if (selectedTarget.type === 'attack') {
            drawCrosshair(x, y);
            addCostLabel(selectedTarget.col, selectedTarget.row, selectedTarget.cost, true, false);
        } else if (selectedTarget.type === 'reachable' || selectedTarget.type === 'unreachable') {
            drawBoot(x, y, selectedTarget.type === 'reachable');
            addCostLabel(selectedTarget.col, selectedTarget.row, selectedTarget.cost, selectedTarget.type === 'unreachable', selectedTarget.isZoC);
        } else if (selectedTarget.type === 'info') {
            gfx.lineStyle(3, 0x808080);
            gfx.strokeRect(selectedTarget.col * CELL_SIZE + 5, selectedTarget.row * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
        }
    }
}

function drawBoot(x, y, filled) {
    gfx.beginPath();
    gfx.moveTo(x - 5, y - 10);
    gfx.lineTo(x - 5, y + 5);
    gfx.lineTo(x + 10, y + 5);
    gfx.lineTo(x + 10, y + 12);
    gfx.lineTo(x - 12, y + 12);
    gfx.lineTo(x - 12, y - 10);
    gfx.closePath();

    if (filled) {
        gfx.fillStyle(0xffd700);
        gfx.fillPath();
    }

    gfx.lineStyle(2, filled ? 0x000000 : 0xff0000);
    gfx.strokePath();
}

function drawCrosshair(x, y) {
    gfx.lineStyle(3, 0xff0000);
    gfx.strokeCircle(x, y, 12);
    gfx.beginPath();
    gfx.moveTo(x - 18, y); gfx.lineTo(x - 6, y);
    gfx.moveTo(x + 6, y); gfx.lineTo(x + 18, y);
    gfx.moveTo(x, y - 18); gfx.lineTo(x, y - 6);
    gfx.moveTo(x, y + 6); gfx.lineTo(x, y + 18);
    gfx.strokePath();
}

export function setSelectedUnit(u) {
    selectedUnit = u;
    drawGrid();
}

export function clearSelectedUnit() {
    selectedUnit = null;
    drawGrid();
}

export function setSelectedTarget(t) {
    selectedTarget = t;
    drawGrid();
}

export function clearSelectedTarget() {
    selectedTarget = null;
    drawGrid();
}

export function getGridData() {
    return { grid, visibilityGrid };
}

export function getMapSize() {
    return { width: mapWidth, height: mapHeight };
}

export function getTriggers() {
    return triggers;
}

export function getTriggerAt(row, col) {
    for (const trigger of triggers) {
        const { col: tc, row: tr, width = 1, height = 1 } = trigger;
        if (col >= tc && col < tc + width && row >= tr && row < tr + height) {
            return trigger;
        }
    }
    return null;
}

export function getTriggerProperty(trigger, propName, defaultValue = null) {
    if (!trigger || !trigger.properties) return defaultValue;
    const prop = trigger.properties.find(p => p.name === propName);
    return prop ? prop.value : defaultValue;
}

export function registerSpriteAtlas(charKey, atlasKey) {
    registeredAtlases.add(charKey);
}

export function initUnitSprites(phaserScene) {
    if (!phaserScene) return;
    scene = phaserScene;
    unitSprites.clear();
}

export function registerAnimations(phaserScene, charKey) {
    if (!phaserScene || !charKey) return;

    const config = SPRITE_CONFIG[charKey];
    if (!config) {
        console.warn(`[renderer] Keine Sprite-Config für ${charKey}`);
        return;
    }

    const { idlePrefix, idleFrames: numFrames } = config;
    const directions = ['south', 'west', 'east', 'north'];

    directions.forEach(dir => {
        const frames = [];
        for (let i = 0; i < numFrames; i++) {
            frames.push(`${idlePrefix}_${dir}_${String(i).padStart(3, '0')}`);
        }
        phaserScene.anims.create({
            key: `${idlePrefix}_${dir}`,
            frames: phaserScene.anims.generateFrameNames(charKey, { frames }),
            frameRate: 8,
            repeat: -1
        });
    });

    directions.forEach(dir => {
        phaserScene.anims.create({
            key: `${charKey}_rotation_${dir}`,
            frames: phaserScene.anims.generateFrameNames(charKey, { frames: [`${charKey}_rotation_${dir}_000`] }),
            frameRate: 8,
            repeat: 0
        });
    });
}

export function registerAllAnimations(phaserScene) {
    registerAnimations(phaserScene, 'carl_the_great');
    registerAnimations(phaserScene, 'zarewitsch');
    registerAnimations(phaserScene, 'tiktok');
    registerAnimations(phaserScene, 'insta');
    registerAnimations(phaserScene, 'facebook');
}

function getSpriteKey(charKey, suffix) {
    return `${charKey}_${suffix}`;
}

function createOrUpdateSprite(unit, direction = 'south') {
    if (!scene) return;

    const charKey = unit.characterId;
    if (!charKey || !registeredAtlases.has(charKey) || !scene.textures.exists(charKey)) {
        return;
    }

    const config = SPRITE_CONFIG[charKey];
    if (!config) return;

    const animKey = `${config.idlePrefix}_${direction}`;
    const existingSprite = unitSprites.get(unit.id);

    if (existingSprite) {
        existingSprite.setPosition(unit.col * CELL_SIZE + CELL_SIZE / 2, unit.row * CELL_SIZE + CELL_SIZE / 2);
        if (existingSprite.anims.currentAnim?.key !== animKey) {
            existingSprite.anims.play(animKey, true);
        }
        existingSprite.setVisible(true);
        return existingSprite;
    }

    const sprite = scene.add.sprite(
        unit.col * CELL_SIZE + CELL_SIZE / 2,
        unit.row * CELL_SIZE + CELL_SIZE / 2,
        charKey,
        `${animKey}_000`
    );
    sprite.setScale(1.0);
    sprite.setDepth(5);
    sprite.anims.play(animKey, true);
    unitSprites.set(unit.id, sprite);
    return sprite;
}

function hideSprite(unitId) {
    const sprite = unitSprites.get(unitId);
    if (sprite) {
        sprite.setVisible(false);
    }
}

export function updateUnitSprites() {
    if (!scene) return;

    const playerUnits = getPlayerUnits();
    const enemyUnits = getEnemyUnits();
    const activeUnitIds = new Set([...playerUnits.map(u => u.id), ...enemyUnits.map(u => u.id)]);

    for (const [unitId, sprite] of unitSprites) {
        if (!activeUnitIds.has(unitId)) {
            sprite.destroy();
            unitSprites.delete(unitId);
        }
    }

    playerUnits.forEach(u => {
        const sprite = createOrUpdateSprite(u, u.facing || 'south');
        if (!sprite) {
            const color = parseInt(u.color.replace('#', ''), 16);
            gfx.fillStyle(color);
            gfx.fillRect(u.col * CELL_SIZE + 10, u.row * CELL_SIZE + 10, 30, 30);
        }
    });

    enemyUnits.forEach(enemy => {
        const status = getVisibilityStatus(visibilityGrid, enemy.row, enemy.col);
        if (status === VISIBILITY_STATUS.VISIBLE) {
            const sprite = createOrUpdateSprite(enemy, enemy.facing || 'south');
            if (!sprite) {
                const color = parseInt(enemy.color.replace('#', ''), 16);
                gfx.fillStyle(color);
                gfx.fillRect(enemy.col * CELL_SIZE + 10, enemy.row * CELL_SIZE + 10, 30, 30);
            }
        } else {
            hideSprite(enemy.id);
        }
    });
}

export function destroyUnitSprites() {
    for (const sprite of unitSprites.values()) {
        sprite.destroy();
    }
    unitSprites.clear();
}

export { setLocationOwner, getLocationOwner, collectOrb };
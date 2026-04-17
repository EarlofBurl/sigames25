// ── Phaser 3 Integration für 'insta' ─────────────────────────────────────────────
//
// Tipp: char_key = Atlas-Key = characters.js-Key → alles konsistent!
//
//   import { heroes } from './characters.js';
//   const charKey = 'insta';           // ← gleicher Key überall
//   const charData = heroes[charKey];

// ── preload() ────────────────────────────────────────────────────────────────
this.load.atlas(
  'insta',
  'assets/sprites/enemies/insta/spritesheet.png',
  'assets/sprites/insta/enemies/spritesheet.json'
);

// ── create(): Animationen registrieren ───────────────────────────────────────
  this.anims.create({
    key: 'insta_rotation_south',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_rotation_south_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'insta_rotation_west',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_rotation_west_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'insta_rotation_east',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_rotation_east_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'insta_rotation_north',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_rotation_north_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'insta_walking_south',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_walking_south_000", "insta_walking_south_001", "insta_walking_south_002", "insta_walking_south_003", "insta_walking_south_004", "insta_walking_south_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'insta_walking_west',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_walking_west_000", "insta_walking_west_001", "insta_walking_west_002", "insta_walking_west_003", "insta_walking_west_004", "insta_walking_west_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'insta_walking_east',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_walking_east_000", "insta_walking_east_001", "insta_walking_east_002", "insta_walking_east_003", "insta_walking_east_004", "insta_walking_east_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'insta_walking_north',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_walking_north_000", "insta_walking_north_001", "insta_walking_north_002", "insta_walking_north_003", "insta_walking_north_004", "insta_walking_north_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'insta_fight_stance_idle_south',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_fight_stance_idle_south_000", "insta_fight_stance_idle_south_001", "insta_fight_stance_idle_south_002", "insta_fight_stance_idle_south_003", "insta_fight_stance_idle_south_004", "insta_fight_stance_idle_south_005", "insta_fight_stance_idle_south_006", "insta_fight_stance_idle_south_007"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'insta_fight_stance_idle_west',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_fight_stance_idle_west_000", "insta_fight_stance_idle_west_001", "insta_fight_stance_idle_west_002", "insta_fight_stance_idle_west_003", "insta_fight_stance_idle_west_004", "insta_fight_stance_idle_west_005", "insta_fight_stance_idle_west_006", "insta_fight_stance_idle_west_007"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'insta_fight_stance_idle_east',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_fight_stance_idle_east_000", "insta_fight_stance_idle_east_001", "insta_fight_stance_idle_east_002", "insta_fight_stance_idle_east_003", "insta_fight_stance_idle_east_004", "insta_fight_stance_idle_east_005", "insta_fight_stance_idle_east_006", "insta_fight_stance_idle_east_007"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'insta_fight_stance_idle_north',
    frames: this.anims.generateFrameNames('insta', {
      frames: ["insta_fight_stance_idle_north_000", "insta_fight_stance_idle_north_001", "insta_fight_stance_idle_north_002", "insta_fight_stance_idle_north_003", "insta_fight_stance_idle_north_004", "insta_fight_stance_idle_north_005", "insta_fight_stance_idle_north_006", "insta_fight_stance_idle_north_007"]
    }),
    frameRate: 8,
    repeat: -1
  });

// ── Sprite erstellen & Animation abspielen ────────────────────────────────────
const insta = this.add.sprite(400, 300, 'insta', 'insta_walking_south_000');
insta.anims.play('insta_walking_south');

// ── Verfügbare Animations-Keys ────────────────────────────────────────────────
// 
insta_rotation_south// insta_rotation_west// insta_rotation_east// insta_rotation_north// insta_walking_south// insta_walking_west// insta_walking_east// insta_walking_north// insta_fight_stance_idle_south// insta_fight_stance_idle_west// insta_fight_stance_idle_east// insta_fight_stance_idle_north
// ─────────────────────────────────────────────────────────────────────────────

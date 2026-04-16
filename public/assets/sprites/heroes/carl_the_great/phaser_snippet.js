// ── Phaser 3 Integration für 'carl_the_great' ────────────────────────────────────
//
// Tipp: char_key = Atlas-Key = characters.js-Key → alles konsistent!
//
//   import { heroes } from './characters.js';
//   const charKey = 'carl_the_great';           // ← gleicher Key überall
//   const charData = heroes[charKey];

// ── preload() ────────────────────────────────────────────────────────────────
this.load.atlas(
  'carl_the_great',
  'assets/sprites/heroes/carl_the_great/spritesheet.png',
  'assets/sprites/heroes/carl_the_great/spritesheet.json'
);

// ── create(): Animationen registrieren ───────────────────────────────────────
  this.anims.create({
    key: 'carl_the_great_rotation_south',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_rotation_south_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'carl_the_great_rotation_west',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_rotation_west_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'carl_the_great_rotation_east',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_rotation_east_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'carl_the_great_rotation_north',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_rotation_north_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'carl_the_great_fight_stance_idle_south',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_fight_stance_idle_south_000", "carl_the_great_fight_stance_idle_south_001", "carl_the_great_fight_stance_idle_south_002", "carl_the_great_fight_stance_idle_south_003", "carl_the_great_fight_stance_idle_south_004", "carl_the_great_fight_stance_idle_south_005", "carl_the_great_fight_stance_idle_south_006", "carl_the_great_fight_stance_idle_south_007"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'carl_the_great_fight_stance_idle_west',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_fight_stance_idle_west_000", "carl_the_great_fight_stance_idle_west_001", "carl_the_great_fight_stance_idle_west_002", "carl_the_great_fight_stance_idle_west_003", "carl_the_great_fight_stance_idle_west_004", "carl_the_great_fight_stance_idle_west_005", "carl_the_great_fight_stance_idle_west_006", "carl_the_great_fight_stance_idle_west_007"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'carl_the_great_fight_stance_idle_east',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_fight_stance_idle_east_000", "carl_the_great_fight_stance_idle_east_001", "carl_the_great_fight_stance_idle_east_002", "carl_the_great_fight_stance_idle_east_003", "carl_the_great_fight_stance_idle_east_004", "carl_the_great_fight_stance_idle_east_005", "carl_the_great_fight_stance_idle_east_006", "carl_the_great_fight_stance_idle_east_007"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'carl_the_great_fight_stance_idle_north',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_fight_stance_idle_north_000", "carl_the_great_fight_stance_idle_north_001", "carl_the_great_fight_stance_idle_north_002", "carl_the_great_fight_stance_idle_north_003", "carl_the_great_fight_stance_idle_north_004", "carl_the_great_fight_stance_idle_north_005", "carl_the_great_fight_stance_idle_north_006", "carl_the_great_fight_stance_idle_north_007"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'carl_the_great_animation_4dc15b1d_south',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_animation_4dc15b1d_south_000", "carl_the_great_animation_4dc15b1d_south_001", "carl_the_great_animation_4dc15b1d_south_002", "carl_the_great_animation_4dc15b1d_south_003", "carl_the_great_animation_4dc15b1d_south_004", "carl_the_great_animation_4dc15b1d_south_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'carl_the_great_animation_4dc15b1d_west',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_animation_4dc15b1d_west_000", "carl_the_great_animation_4dc15b1d_west_001", "carl_the_great_animation_4dc15b1d_west_002", "carl_the_great_animation_4dc15b1d_west_003", "carl_the_great_animation_4dc15b1d_west_004", "carl_the_great_animation_4dc15b1d_west_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'carl_the_great_animation_4dc15b1d_east',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_animation_4dc15b1d_east_000", "carl_the_great_animation_4dc15b1d_east_001", "carl_the_great_animation_4dc15b1d_east_002", "carl_the_great_animation_4dc15b1d_east_003", "carl_the_great_animation_4dc15b1d_east_004", "carl_the_great_animation_4dc15b1d_east_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'carl_the_great_animation_4dc15b1d_north',
    frames: this.anims.generateFrameNames('carl_the_great', {
      frames: ["carl_the_great_animation_4dc15b1d_north_000", "carl_the_great_animation_4dc15b1d_north_001", "carl_the_great_animation_4dc15b1d_north_002", "carl_the_great_animation_4dc15b1d_north_003", "carl_the_great_animation_4dc15b1d_north_004", "carl_the_great_animation_4dc15b1d_north_005"]
    }),
    frameRate: 8,
    repeat: -1
  });

// ── Sprite erstellen & Animation abspielen ────────────────────────────────────
const carl_the_great = this.add.sprite(400, 300, 'carl_the_great', 'carl_the_great_fight_stance_idle_south_000');
carl_the_great.anims.play('carl_the_great_fight_stance_idle_south');

// ── Verfügbare Animations-Keys ────────────────────────────────────────────────
// 
carl_the_great_rotation_south// carl_the_great_rotation_west// carl_the_great_rotation_east// carl_the_great_rotation_north// carl_the_great_fight_stance_idle_south// carl_the_great_fight_stance_idle_west// carl_the_great_fight_stance_idle_east// carl_the_great_fight_stance_idle_north// carl_the_great_animation_4dc15b1d_south// carl_the_great_animation_4dc15b1d_west// carl_the_great_animation_4dc15b1d_east// carl_the_great_animation_4dc15b1d_north
// ─────────────────────────────────────────────────────────────────────────────

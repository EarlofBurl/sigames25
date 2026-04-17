// ── Phaser 3 Integration für 'tiktok' ────────────────────────────────────────────
//
// Tipp: char_key = Atlas-Key = characters.js-Key → alles konsistent!
//
//   import { heroes } from './characters.js';
//   const charKey = 'tiktok';           // ← gleicher Key überall
//   const charData = heroes[charKey];

// ── preload() ────────────────────────────────────────────────────────────────
this.load.atlas(
  'tiktok',
  'assets/sprites/enemies/tiktok/spritesheet.png',
  'assets/sprites/enemies/tiktok/spritesheet.json'
);

// ── create(): Animationen registrieren ───────────────────────────────────────
  this.anims.create({
    key: 'tiktok_rotation_south',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_rotation_south_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'tiktok_rotation_west',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_rotation_west_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'tiktok_rotation_east',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_rotation_east_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'tiktok_rotation_north',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_rotation_north_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'tiktok_breathing_idle_south',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_breathing_idle_south_000", "tiktok_breathing_idle_south_001", "tiktok_breathing_idle_south_002", "tiktok_breathing_idle_south_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'tiktok_breathing_idle_west',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_breathing_idle_west_000", "tiktok_breathing_idle_west_001", "tiktok_breathing_idle_west_002", "tiktok_breathing_idle_west_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'tiktok_breathing_idle_east',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_breathing_idle_east_000", "tiktok_breathing_idle_east_001", "tiktok_breathing_idle_east_002", "tiktok_breathing_idle_east_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'tiktok_breathing_idle_north',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_breathing_idle_north_000", "tiktok_breathing_idle_north_001", "tiktok_breathing_idle_north_002", "tiktok_breathing_idle_north_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'tiktok_animation_fb11154e_south',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_animation_fb11154e_south_000", "tiktok_animation_fb11154e_south_001", "tiktok_animation_fb11154e_south_002", "tiktok_animation_fb11154e_south_003", "tiktok_animation_fb11154e_south_004", "tiktok_animation_fb11154e_south_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'tiktok_animation_fb11154e_west',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_animation_fb11154e_west_000", "tiktok_animation_fb11154e_west_001", "tiktok_animation_fb11154e_west_002", "tiktok_animation_fb11154e_west_003", "tiktok_animation_fb11154e_west_004", "tiktok_animation_fb11154e_west_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'tiktok_animation_fb11154e_east',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_animation_fb11154e_east_000", "tiktok_animation_fb11154e_east_001", "tiktok_animation_fb11154e_east_002", "tiktok_animation_fb11154e_east_003", "tiktok_animation_fb11154e_east_004", "tiktok_animation_fb11154e_east_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'tiktok_animation_fb11154e_north',
    frames: this.anims.generateFrameNames('tiktok', {
      frames: ["tiktok_animation_fb11154e_north_000", "tiktok_animation_fb11154e_north_001", "tiktok_animation_fb11154e_north_002", "tiktok_animation_fb11154e_north_003", "tiktok_animation_fb11154e_north_004", "tiktok_animation_fb11154e_north_005"]
    }),
    frameRate: 8,
    repeat: -1
  });

// ── Sprite erstellen & Animation abspielen ────────────────────────────────────
const tiktok = this.add.sprite(400, 300, 'tiktok', 'tiktok_breathing_idle_south_000');
tiktok.anims.play('tiktok_breathing_idle_south');

// ── Verfügbare Animations-Keys ────────────────────────────────────────────────
// 
tiktok_rotation_south// tiktok_rotation_west// tiktok_rotation_east// tiktok_rotation_north// tiktok_breathing_idle_south// tiktok_breathing_idle_west// tiktok_breathing_idle_east// tiktok_breathing_idle_north// tiktok_animation_fb11154e_south// tiktok_animation_fb11154e_west// tiktok_animation_fb11154e_east// tiktok_animation_fb11154e_north
// ─────────────────────────────────────────────────────────────────────────────

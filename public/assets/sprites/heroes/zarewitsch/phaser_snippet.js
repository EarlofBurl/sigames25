// ── Phaser 3 Integration für 'zarewitsch' ────────────────────────────────────────
//
// Tipp: char_key = Atlas-Key = characters.js-Key → alles konsistent!
//
//   import { heroes } from './characters.js';
//   const charKey = 'zarewitsch';           // ← gleicher Key überall
//   const charData = heroes[charKey];

// ── preload() ────────────────────────────────────────────────────────────────
this.load.atlas(
  'zarewitsch',
  'assets/sprites/heroes/zarewitsch/spritesheet.png',
  'assets/sprites/heroes/zarewitsch/spritesheet.json'
);

// ── create(): Animationen registrieren ───────────────────────────────────────
  this.anims.create({
    key: 'zarewitsch_rotation_south',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_rotation_south_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'zarewitsch_rotation_west',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_rotation_west_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'zarewitsch_rotation_east',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_rotation_east_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'zarewitsch_rotation_north',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_rotation_north_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'zarewitsch_breathing_idle_south',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_breathing_idle_south_000", "zarewitsch_breathing_idle_south_001", "zarewitsch_breathing_idle_south_002", "zarewitsch_breathing_idle_south_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'zarewitsch_breathing_idle_west',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_breathing_idle_west_000", "zarewitsch_breathing_idle_west_001", "zarewitsch_breathing_idle_west_002", "zarewitsch_breathing_idle_west_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'zarewitsch_breathing_idle_east',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_breathing_idle_east_000", "zarewitsch_breathing_idle_east_001", "zarewitsch_breathing_idle_east_002", "zarewitsch_breathing_idle_east_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'zarewitsch_breathing_idle_north',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_breathing_idle_north_000", "zarewitsch_breathing_idle_north_001", "zarewitsch_breathing_idle_north_002", "zarewitsch_breathing_idle_north_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'zarewitsch_animation_ae1d2bf4_south',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_animation_ae1d2bf4_south_000", "zarewitsch_animation_ae1d2bf4_south_001", "zarewitsch_animation_ae1d2bf4_south_002", "zarewitsch_animation_ae1d2bf4_south_003", "zarewitsch_animation_ae1d2bf4_south_004", "zarewitsch_animation_ae1d2bf4_south_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'zarewitsch_animation_ae1d2bf4_west',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_animation_ae1d2bf4_west_000", "zarewitsch_animation_ae1d2bf4_west_001", "zarewitsch_animation_ae1d2bf4_west_002", "zarewitsch_animation_ae1d2bf4_west_003", "zarewitsch_animation_ae1d2bf4_west_004", "zarewitsch_animation_ae1d2bf4_west_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'zarewitsch_animation_ae1d2bf4_east',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_animation_ae1d2bf4_east_000", "zarewitsch_animation_ae1d2bf4_east_001", "zarewitsch_animation_ae1d2bf4_east_002", "zarewitsch_animation_ae1d2bf4_east_003", "zarewitsch_animation_ae1d2bf4_east_004", "zarewitsch_animation_ae1d2bf4_east_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'zarewitsch_animation_ae1d2bf4_north',
    frames: this.anims.generateFrameNames('zarewitsch', {
      frames: ["zarewitsch_animation_ae1d2bf4_north_000", "zarewitsch_animation_ae1d2bf4_north_001", "zarewitsch_animation_ae1d2bf4_north_002", "zarewitsch_animation_ae1d2bf4_north_003", "zarewitsch_animation_ae1d2bf4_north_004", "zarewitsch_animation_ae1d2bf4_north_005"]
    }),
    frameRate: 8,
    repeat: -1
  });

// ── Sprite erstellen & Animation abspielen ────────────────────────────────────
const zarewitsch = this.add.sprite(400, 300, 'zarewitsch', 'zarewitsch_breathing_idle_south_000');
zarewitsch.anims.play('zarewitsch_breathing_idle_south');

// ── Verfügbare Animations-Keys ────────────────────────────────────────────────
// 
zarewitsch_rotation_south// zarewitsch_rotation_west// zarewitsch_rotation_east// zarewitsch_rotation_north// zarewitsch_breathing_idle_south// zarewitsch_breathing_idle_west// zarewitsch_breathing_idle_east// zarewitsch_breathing_idle_north// zarewitsch_animation_ae1d2bf4_south// zarewitsch_animation_ae1d2bf4_west// zarewitsch_animation_ae1d2bf4_east// zarewitsch_animation_ae1d2bf4_north
// ─────────────────────────────────────────────────────────────────────────────

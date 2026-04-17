// ── Phaser 3 Integration für 'facebook' ──────────────────────────────────────────
//
// Tipp: char_key = Atlas-Key = characters.js-Key → alles konsistent!
//
//   import { heroes } from './characters.js';
//   const charKey = 'facebook';           // ← gleicher Key überall
//   const charData = heroes[charKey];

// ── preload() ────────────────────────────────────────────────────────────────
this.load.atlas(
  'facebook',
  'assets/sprites/enemies/facebook/spritesheet.png',
  'assets/sprites/enemies/facebook/spritesheet.json'
);

// ── create(): Animationen registrieren ───────────────────────────────────────
  this.anims.create({
    key: 'facebook_rotation_south',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_rotation_south_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'facebook_rotation_west',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_rotation_west_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'facebook_rotation_east',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_rotation_east_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'facebook_rotation_north',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_rotation_north_000"]
    }),
    frameRate: 8,
    repeat: 0
  });
  this.anims.create({
    key: 'facebook_animation_12fa5471_south',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_animation_12fa5471_south_000", "facebook_animation_12fa5471_south_001", "facebook_animation_12fa5471_south_002", "facebook_animation_12fa5471_south_003", "facebook_animation_12fa5471_south_004", "facebook_animation_12fa5471_south_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'facebook_animation_12fa5471_west',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_animation_12fa5471_west_000", "facebook_animation_12fa5471_west_001", "facebook_animation_12fa5471_west_002", "facebook_animation_12fa5471_west_003", "facebook_animation_12fa5471_west_004", "facebook_animation_12fa5471_west_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'facebook_animation_12fa5471_east',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_animation_12fa5471_east_000", "facebook_animation_12fa5471_east_001", "facebook_animation_12fa5471_east_002", "facebook_animation_12fa5471_east_003", "facebook_animation_12fa5471_east_004", "facebook_animation_12fa5471_east_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'facebook_animation_12fa5471_north',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_animation_12fa5471_north_000", "facebook_animation_12fa5471_north_001", "facebook_animation_12fa5471_north_002", "facebook_animation_12fa5471_north_003", "facebook_animation_12fa5471_north_004", "facebook_animation_12fa5471_north_005"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'facebook_breathing_idle_south',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_breathing_idle_south_000", "facebook_breathing_idle_south_001", "facebook_breathing_idle_south_002", "facebook_breathing_idle_south_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'facebook_breathing_idle_west',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_breathing_idle_west_000", "facebook_breathing_idle_west_001", "facebook_breathing_idle_west_002", "facebook_breathing_idle_west_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'facebook_breathing_idle_east',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_breathing_idle_east_000", "facebook_breathing_idle_east_001", "facebook_breathing_idle_east_002", "facebook_breathing_idle_east_003"]
    }),
    frameRate: 8,
    repeat: -1
  });
  this.anims.create({
    key: 'facebook_breathing_idle_north',
    frames: this.anims.generateFrameNames('facebook', {
      frames: ["facebook_breathing_idle_north_000", "facebook_breathing_idle_north_001", "facebook_breathing_idle_north_002", "facebook_breathing_idle_north_003"]
    }),
    frameRate: 8,
    repeat: -1
  });

// ── Sprite erstellen & Animation abspielen ────────────────────────────────────
const facebook = this.add.sprite(400, 300, 'facebook', 'facebook_animation_12fa5471_south_000');
facebook.anims.play('facebook_animation_12fa5471_south');

// ── Verfügbare Animations-Keys ────────────────────────────────────────────────
// 
facebook_rotation_south// facebook_rotation_west// facebook_rotation_east// facebook_rotation_north// facebook_animation_12fa5471_south// facebook_animation_12fa5471_west// facebook_animation_12fa5471_east// facebook_animation_12fa5471_north// facebook_breathing_idle_south// facebook_breathing_idle_west// facebook_breathing_idle_east// facebook_breathing_idle_north
// ─────────────────────────────────────────────────────────────────────────────

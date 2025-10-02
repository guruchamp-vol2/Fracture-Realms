// Advanced Stage System for Fracture Realms
// Unique stages with distinct themes, mechanics, and challenges

export class StageSystem {
  constructor(game) {
    this.game = game;
    this.currentStage = null;
    this.stageIndex = 0;
    this.stages = new Map();
    this.stageEffects = [];
    
    this.initializeStages();
  }

  initializeStages() {
    // === TIER 1: BASIC STAGES ===
    this.addStage('forest_clearing', {
      name: 'Forest Clearing',
      tier: 1,
      theme: 'nature',
      description: 'A peaceful forest clearing with ancient trees and wildlife',
      background: 'forest',
      music: 'forest_ambient',
      gravity: 1.0,
      timeScale: 1.0,
      hazards: ['falling_leaves', 'tree_roots'],
      mobs: ['goblin_warrior', 'skeleton_archer', 'orc_berserker'],
      specialMechanics: ['tree_climbing', 'leaf_camouflage'],
      weather: 'sunny',
      lighting: 'natural',
      spawnPoints: [
        { x: 100, y: 400, type: 'ground' },
        { x: 300, y: 350, type: 'platform' },
        { x: 500, y: 400, type: 'ground' },
        { x: 700, y: 300, type: 'tree' }
      ],
      platforms: [
        { x: 200, y: 300, w: 120, h: 20, type: 'wood' },
        { x: 400, y: 250, w: 100, h: 20, type: 'wood' },
        { x: 600, y: 200, w: 80, h: 20, type: 'wood' }
      ],
      collectibles: ['health_berries', 'mana_mushrooms', 'forest_gems'],
      boss: null,
      completionReward: { shards: 10, items: ['forest_blessing'] }
    });

    this.addStage('crystal_caves', {
      name: 'Crystal Caves',
      tier: 1,
      theme: 'crystal',
      description: 'Glowing crystal formations create a mystical underground world',
      background: 'crystal_cave',
      music: 'crystal_ambient',
      gravity: 1.0,
      timeScale: 1.0,
      hazards: ['crystal_spikes', 'falling_crystals'],
      mobs: ['crystal_golem', 'ice_elemental', 'dark_mage'],
      specialMechanics: ['crystal_resonance', 'light_reflection'],
      weather: 'none',
      lighting: 'crystal_glow',
      spawnPoints: [
        { x: 150, y: 450, type: 'crystal_platform' },
        { x: 350, y: 400, type: 'crystal_platform' },
        { x: 550, y: 350, type: 'crystal_platform' },
        { x: 750, y: 300, type: 'crystal_platform' }
      ],
      platforms: [
        { x: 250, y: 350, w: 100, h: 20, type: 'crystal' },
        { x: 450, y: 300, w: 120, h: 20, type: 'crystal' },
        { x: 650, y: 250, w: 80, h: 20, type: 'crystal' }
      ],
      collectibles: ['crystal_shards', 'mana_crystals', 'cave_gems'],
      boss: null,
      completionReward: { shards: 12, items: ['crystal_essence'] }
    });

    this.addStage('volcanic_chamber', {
      name: 'Volcanic Chamber',
      tier: 2,
      theme: 'fire',
      description: 'A scorching chamber filled with lava flows and fire elementals',
      background: 'volcano',
      music: 'volcanic_ambient',
      gravity: 1.0,
      timeScale: 1.0,
      hazards: ['lava_flows', 'fire_geysers', 'falling_rocks'],
      mobs: ['fire_salamander', 'lava_elemental', 'orc_berserker'],
      specialMechanics: ['heat_damage', 'fire_immunity'],
      weather: 'none',
      lighting: 'fire_glow',
      spawnPoints: [
        { x: 120, y: 420, type: 'rock_platform' },
        { x: 320, y: 380, type: 'rock_platform' },
        { x: 520, y: 340, type: 'rock_platform' },
        { x: 720, y: 300, type: 'rock_platform' }
      ],
      platforms: [
        { x: 220, y: 320, w: 100, h: 20, type: 'rock' },
        { x: 420, y: 280, w: 120, h: 20, type: 'rock' },
        { x: 620, y: 240, w: 80, h: 20, type: 'rock' }
      ],
      collectibles: ['fire_gems', 'lava_crystals', 'volcanic_essence'],
      boss: 'fire_dragon',
      completionReward: { shards: 20, items: ['fire_immunity'] }
    });

    // === TIER 2: ADVANCED STAGES ===
    this.addStage('sky_fortress', {
      name: 'Sky Fortress',
      tier: 2,
      theme: 'aerial',
      description: 'A floating fortress high above the clouds with wind currents',
      background: 'sky_fortress',
      music: 'sky_ambient',
      gravity: 0.7,
      timeScale: 1.0,
      hazards: ['wind_gusts', 'falling_through_clouds', 'lightning_strikes'],
      mobs: ['wyvern_rider', 'storm_elemental', 'angel_guardian'],
      specialMechanics: ['wind_riding', 'cloud_platforms', 'aerial_combat'],
      weather: 'windy',
      lighting: 'bright',
      spawnPoints: [
        { x: 100, y: 300, type: 'cloud' },
        { x: 300, y: 250, type: 'cloud' },
        { x: 500, y: 200, type: 'cloud' },
        { x: 700, y: 150, type: 'cloud' }
      ],
      platforms: [
        { x: 200, y: 250, w: 120, h: 20, type: 'cloud' },
        { x: 400, y: 200, w: 100, h: 20, type: 'cloud' },
        { x: 600, y: 150, w: 80, h: 20, type: 'cloud' }
      ],
      collectibles: ['sky_gems', 'wind_crystals', 'cloud_essence'],
      boss: 'storm_dragon',
      completionReward: { shards: 25, items: ['wind_blessing'] }
    });

    this.addStage('shadow_realm', {
      name: 'Shadow Realm',
      tier: 3,
      theme: 'shadow',
      description: 'A dark dimension where shadows come to life',
      background: 'shadow_realm',
      music: 'shadow_ambient',
      gravity: 1.2,
      timeScale: 0.8,
      hazards: ['shadow_traps', 'void_pits', 'darkness_damage'],
      mobs: ['shadow_assassin', 'void_wraith', 'dark_mage'],
      specialMechanics: ['shadow_walking', 'void_immunity', 'darkness_vision'],
      weather: 'none',
      lighting: 'dim',
      spawnPoints: [
        { x: 150, y: 450, type: 'shadow_platform' },
        { x: 350, y: 400, type: 'shadow_platform' },
        { x: 550, y: 350, type: 'shadow_platform' },
        { x: 750, y: 300, type: 'shadow_platform' }
      ],
      platforms: [
        { x: 250, y: 350, w: 100, h: 20, type: 'shadow' },
        { x: 450, y: 300, w: 120, h: 20, type: 'shadow' },
        { x: 650, y: 250, w: 80, h: 20, type: 'shadow' }
      ],
      collectibles: ['shadow_gems', 'void_crystals', 'darkness_essence'],
      boss: 'void_stalker',
      completionReward: { shards: 30, items: ['shadow_cloak'] }
    });

    // === TIER 3: ELITE STAGES ===
    this.addStage('dragon_lair', {
      name: 'Dragon Lair',
      tier: 3,
      theme: 'dragon',
      description: 'The ancient lair of a powerful dragon with hoards of treasure',
      background: 'dragon_lair',
      music: 'dragon_ambient',
      gravity: 1.0,
      timeScale: 1.0,
      hazards: ['dragon_fire', 'treasure_traps', 'collapsing_ceiling'],
      mobs: ['dragon_knight', 'fire_salamander', 'ancient_guardian'],
      specialMechanics: ['treasure_collection', 'dragon_fear', 'hoard_protection'],
      weather: 'none',
      lighting: 'fire_glow',
      spawnPoints: [
        { x: 100, y: 400, type: 'treasure_pile' },
        { x: 300, y: 350, type: 'treasure_pile' },
        { x: 500, y: 300, type: 'treasure_pile' },
        { x: 700, y: 250, type: 'treasure_pile' }
      ],
      platforms: [
        { x: 200, y: 300, w: 120, h: 20, type: 'gold' },
        { x: 400, y: 250, w: 100, h: 20, type: 'gold' },
        { x: 600, y: 200, w: 80, h: 20, type: 'gold' }
      ],
      collectibles: ['dragon_gems', 'treasure_coins', 'dragon_essence'],
      boss: 'ancient_dragon',
      completionReward: { shards: 40, items: ['dragon_scale'] }
    });

    this.addStage('cosmic_void', {
      name: 'Cosmic Void',
      tier: 4,
      theme: 'cosmic',
      description: 'A realm beyond reality where cosmic entities dwell',
      background: 'cosmic_void',
      music: 'cosmic_ambient',
      gravity: 0.5,
      timeScale: 1.5,
      hazards: ['reality_tears', 'cosmic_storms', 'dimensional_rifts'],
      mobs: ['cosmic_entity', 'reality_weaver', 'dimensional_horror'],
      specialMechanics: ['reality_manipulation', 'cosmic_immunity', 'dimensional_travel'],
      weather: 'cosmic_storm',
      lighting: 'cosmic_glow',
      spawnPoints: [
        { x: 150, y: 300, type: 'cosmic_platform' },
        { x: 350, y: 250, type: 'cosmic_platform' },
        { x: 550, y: 200, type: 'cosmic_platform' },
        { x: 750, y: 150, type: 'cosmic_platform' }
      ],
      platforms: [
        { x: 250, y: 250, w: 100, h: 20, type: 'cosmic' },
        { x: 450, y: 200, w: 120, h: 20, type: 'cosmic' },
        { x: 650, y: 150, w: 80, h: 20, type: 'cosmic' }
      ],
      collectibles: ['cosmic_gems', 'reality_crystals', 'cosmic_essence'],
      boss: 'cosmic_entity',
      completionReward: { shards: 50, items: ['cosmic_power'] }
    });

    // Add more unique stages
    this.addUniqueStages();
  }

  addUniqueStages() {
    const uniqueStages = [
      // === NATURE STAGES ===
      {
        id: 'enchanted_garden',
        name: 'Enchanted Garden',
        tier: 2,
        theme: 'nature',
        description: 'A magical garden where plants come to life',
        background: 'enchanted_garden',
        music: 'garden_ambient',
        gravity: 1.0,
        timeScale: 1.0,
        hazards: ['poison_plants', 'entangling_vines'],
        mobs: ['plant_guardian', 'thorn_beast', 'nature_spirit'],
        specialMechanics: ['plant_growth', 'nature_healing'],
        weather: 'magical_rain',
        lighting: 'natural',
        spawnPoints: [
          { x: 100, y: 400, type: 'flower_bed' },
          { x: 300, y: 350, type: 'flower_bed' },
          { x: 500, y: 300, type: 'flower_bed' },
          { x: 700, y: 250, type: 'flower_bed' }
        ],
        platforms: [
          { x: 200, y: 300, w: 120, h: 20, type: 'living_wood' },
          { x: 400, y: 250, w: 100, h: 20, type: 'living_wood' },
          { x: 600, y: 200, w: 80, h: 20, type: 'living_wood' }
        ],
        collectibles: ['magic_flowers', 'nature_gems', 'garden_essence'],
        boss: 'ancient_tree',
        completionReward: { shards: 22, items: ['nature_blessing'] }
      },

      // === ICE STAGES ===
      {
        id: 'frozen_tundra',
        name: 'Frozen Tundra',
        tier: 2,
        theme: 'ice',
        description: 'A frozen wasteland where ice and snow dominate',
        background: 'frozen_tundra',
        music: 'ice_ambient',
        gravity: 1.0,
        timeScale: 0.9,
        hazards: ['ice_slides', 'blizzards', 'freezing_wind'],
        mobs: ['ice_elemental', 'frost_giant', 'snow_wolf'],
        specialMechanics: ['ice_sliding', 'frost_immunity'],
        weather: 'blizzard',
        lighting: 'dim',
        spawnPoints: [
          { x: 120, y: 420, type: 'ice_block' },
          { x: 320, y: 380, type: 'ice_block' },
          { x: 520, y: 340, type: 'ice_block' },
          { x: 720, y: 300, type: 'ice_block' }
        ],
        platforms: [
          { x: 220, y: 320, w: 100, h: 20, type: 'ice' },
          { x: 420, y: 280, w: 120, h: 20, type: 'ice' },
          { x: 620, y: 240, w: 80, h: 20, type: 'ice' }
        ],
        collectibles: ['ice_crystals', 'frost_gems', 'tundra_essence'],
        boss: 'frost_dragon',
        completionReward: { shards: 24, items: ['frost_immunity'] }
      },

      // === UNDERWATER STAGES ===
      {
        id: 'abyssal_depths',
        name: 'Abyssal Depths',
        tier: 3,
        theme: 'water',
        description: 'The deepest part of the ocean where ancient creatures dwell',
        background: 'abyssal_depths',
        music: 'underwater_ambient',
        gravity: 0.3,
        timeScale: 0.7,
        hazards: ['water_currents', 'pressure_damage', 'drowning'],
        mobs: ['kraken_tentacle', 'water_serpent', 'abyssal_guardian'],
        specialMechanics: ['swimming', 'water_breathing', 'current_riding'],
        weather: 'none',
        lighting: 'bioluminescent',
        spawnPoints: [
          { x: 150, y: 300, type: 'coral_reef' },
          { x: 350, y: 250, type: 'coral_reef' },
          { x: 550, y: 200, type: 'coral_reef' },
          { x: 750, y: 150, type: 'coral_reef' }
        ],
        platforms: [
          { x: 250, y: 250, w: 100, h: 20, type: 'coral' },
          { x: 450, y: 200, w: 120, h: 20, type: 'coral' },
          { x: 650, y: 150, w: 80, h: 20, type: 'coral' }
        ],
        collectibles: ['pearls', 'sea_gems', 'abyssal_essence'],
        boss: 'kraken',
        completionReward: { shards: 35, items: ['water_breathing'] }
      },

      // === MECHANICAL STAGES ===
      {
        id: 'steampunk_factory',
        name: 'Steampunk Factory',
        tier: 3,
        theme: 'mechanical',
        description: 'A massive factory filled with gears, steam, and mechanical contraptions',
        background: 'steampunk_factory',
        music: 'factory_ambient',
        gravity: 1.0,
        timeScale: 1.0,
        hazards: ['steam_burns', 'gear_crushers', 'electrical_shocks'],
        mobs: ['steam_automaton', 'clockwork_spider', 'cyber_assassin'],
        specialMechanics: ['gear_riding', 'steam_power', 'mechanical_repair'],
        weather: 'none',
        lighting: 'industrial',
        spawnPoints: [
          { x: 100, y: 400, type: 'gear_platform' },
          { x: 300, y: 350, type: 'gear_platform' },
          { x: 500, y: 300, type: 'gear_platform' },
          { x: 700, y: 250, type: 'gear_platform' }
        ],
        platforms: [
          { x: 200, y: 300, w: 120, h: 20, type: 'metal' },
          { x: 400, y: 250, w: 100, h: 20, type: 'metal' },
          { x: 600, y: 200, w: 80, h: 20, type: 'metal' }
        ],
        collectibles: ['gear_parts', 'steam_crystals', 'factory_essence'],
        boss: 'steam_titan',
        completionReward: { shards: 38, items: ['mechanical_enhancement'] }
      },

      // === MAGICAL STAGES ===
      {
        id: 'arcane_library',
        name: 'Arcane Library',
        tier: 4,
        theme: 'magic',
        description: 'A vast library where books float and magic is everywhere',
        background: 'arcane_library',
        music: 'library_ambient',
        gravity: 0.8,
        timeScale: 1.2,
        hazards: ['flying_books', 'magic_missiles', 'spell_traps'],
        mobs: ['dark_mage', 'lich_necromancer', 'ancient_guardian'],
        specialMechanics: ['spell_learning', 'book_levitation', 'magic_immunity'],
        weather: 'none',
        lighting: 'magical',
        spawnPoints: [
          { x: 150, y: 350, type: 'floating_book' },
          { x: 350, y: 300, type: 'floating_book' },
          { x: 550, y: 250, type: 'floating_book' },
          { x: 750, y: 200, type: 'floating_book' }
        ],
        platforms: [
          { x: 250, y: 300, w: 100, h: 20, type: 'magical' },
          { x: 450, y: 250, w: 120, h: 20, type: 'magical' },
          { x: 650, y: 200, w: 80, h: 20, type: 'magical' }
        ],
        collectibles: ['spell_scrolls', 'magic_gems', 'library_essence'],
        boss: 'archmage',
        completionReward: { shards: 45, items: ['spell_mastery'] }
      }
    ];

    uniqueStages.forEach(stage => {
      this.addStage(stage.id, stage);
    });
  }

  addStage(id, config) {
    this.stages.set(id, {
      id,
      ...config,
      isCompleted: false,
      bestTime: null,
      bestScore: 0
    });
  }

  loadStage(stageId) {
    const stage = this.stages.get(stageId);
    if (!stage) return false;

    this.currentStage = stage;
    this.stageIndex = Array.from(this.stages.keys()).indexOf(stageId);
    
    // Apply stage effects
    this.applyStageEffects(stage);
    
    // Setup stage environment
    this.setupStageEnvironment(stage);
    
    return true;
  }

  applyStageEffects(stage) {
    // Apply gravity
    this.game.gravity = stage.gravity;
    
    // Apply time scale
    this.game.timeScale = stage.timeScale;
    
    // Apply weather effects
    this.applyWeatherEffects(stage.weather);
    
    // Apply lighting effects
    this.applyLightingEffects(stage.lighting);
  }

  applyWeatherEffects(weather) {
    switch (weather) {
      case 'sunny':
        this.addStageEffect('sunbeams', { duration: -1, intensity: 0.3 });
        break;
      case 'windy':
        this.addStageEffect('wind_particles', { duration: -1, intensity: 0.5 });
        break;
      case 'blizzard':
        this.addStageEffect('snow_particles', { duration: -1, intensity: 0.8 });
        break;
      case 'cosmic_storm':
        this.addStageEffect('cosmic_particles', { duration: -1, intensity: 0.6 });
        break;
      case 'magical_rain':
        this.addStageEffect('magic_particles', { duration: -1, intensity: 0.4 });
        break;
    }
  }

  applyLightingEffects(lighting) {
    switch (lighting) {
      case 'natural':
        this.game.lighting = { type: 'natural', intensity: 1.0, color: '#FFFFFF' };
        break;
      case 'fire_glow':
        this.game.lighting = { type: 'fire', intensity: 0.8, color: '#FF4500' };
        break;
      case 'crystal_glow':
        this.game.lighting = { type: 'crystal', intensity: 0.9, color: '#00BFFF' };
        break;
      case 'dim':
        this.game.lighting = { type: 'dim', intensity: 0.4, color: '#808080' };
        break;
      case 'cosmic_glow':
        this.game.lighting = { type: 'cosmic', intensity: 1.2, color: '#FF00FF' };
        break;
    }
  }

  addStageEffect(effectType, config) {
    this.stageEffects.push({
      type: effectType,
      ...config,
      time: 0
    });
  }

  setupStageEnvironment(stage) {
    // Clear existing platforms
    this.game.platforms = [];
    
    // Add stage platforms
    stage.platforms.forEach(platform => {
      this.game.platforms.push(new StagePlatform(platform));
    });
    
    // Setup spawn points
    this.game.stageSpawnPoints = stage.spawnPoints;
    
    // Setup collectibles
    this.game.stageCollectibles = stage.collectibles;
  }

  update(dt) {
    // Update stage effects
    this.updateStageEffects(dt);
    
    // Update stage mechanics
    this.updateStageMechanics(dt);
  }

  updateStageEffects(dt) {
    for (let i = this.stageEffects.length - 1; i >= 0; i--) {
      const effect = this.stageEffects[i];
      effect.time += dt * 1000;
      
      if (effect.duration > 0 && effect.time >= effect.duration) {
        this.stageEffects.splice(i, 1);
      }
    }
  }

  updateStageMechanics(dt) {
    if (!this.currentStage) return;
    
    // Update stage-specific mechanics
    switch (this.currentStage.theme) {
      case 'fire':
        this.updateFireMechanics(dt);
        break;
      case 'ice':
        this.updateIceMechanics(dt);
        break;
      case 'shadow':
        this.updateShadowMechanics(dt);
        break;
      case 'cosmic':
        this.updateCosmicMechanics(dt);
        break;
    }
  }

  updateFireMechanics(dt) {
    // Fire damage over time
    if (Math.random() < 0.01) {
      this.game.players.forEach(player => {
        if (!player.fireImmunity) {
          player.takeDamage(5, 'fire');
        }
      });
    }
  }

  updateIceMechanics(dt) {
    // Ice sliding mechanics
    this.game.players.forEach(player => {
      if (player.onIce) {
        player.vx *= 0.95; // Reduced friction on ice
      }
    });
  }

  updateShadowMechanics(dt) {
    // Shadow damage in darkness
    if (this.game.lighting.intensity < 0.5) {
      this.game.players.forEach(player => {
        if (!player.shadowImmunity) {
          player.takeDamage(2, 'shadow');
        }
      });
    }
  }

  updateCosmicMechanics(dt) {
    // Reality manipulation effects
    if (Math.random() < 0.005) {
      this.addStageEffect('reality_distortion', { duration: 2000, intensity: 0.5 });
    }
  }

  render(ctx) {
    // Render stage effects
    this.renderStageEffects(ctx);
    
    // Render stage-specific visuals
    this.renderStageVisuals(ctx);
  }

  renderStageEffects(ctx) {
    for (const effect of this.stageEffects) {
      switch (effect.type) {
        case 'sunbeams':
          this.renderSunbeams(ctx, effect);
          break;
        case 'wind_particles':
          this.renderWindParticles(ctx, effect);
          break;
        case 'snow_particles':
          this.renderSnowParticles(ctx, effect);
          break;
        case 'cosmic_particles':
          this.renderCosmicParticles(ctx, effect);
          break;
        case 'magic_particles':
          this.renderMagicParticles(ctx, effect);
          break;
      }
    }
  }

  renderSunbeams(ctx, effect) {
    ctx.save();
    ctx.globalAlpha = effect.intensity * 0.3;
    ctx.fillStyle = '#FFD700';
    
    for (let i = 0; i < 5; i++) {
      const x = (i * this.game.W / 5) + Math.sin(effect.time * 0.001) * 50;
      ctx.fillRect(x, 0, 20, this.game.H);
    }
    
    ctx.restore();
  }

  renderWindParticles(ctx, effect) {
    ctx.save();
    ctx.globalAlpha = effect.intensity * 0.5;
    ctx.fillStyle = '#87CEEB';
    
    for (let i = 0; i < 20; i++) {
      const x = (i * this.game.W / 20) + Math.sin(effect.time * 0.002 + i) * 100;
      const y = Math.sin(effect.time * 0.003 + i) * 50 + this.game.H / 2;
      ctx.fillRect(x, y, 2, 2);
    }
    
    ctx.restore();
  }

  renderSnowParticles(ctx, effect) {
    ctx.save();
    ctx.globalAlpha = effect.intensity * 0.6;
    ctx.fillStyle = '#FFFFFF';
    
    for (let i = 0; i < 50; i++) {
      const x = (i * this.game.W / 50) + Math.sin(effect.time * 0.001 + i) * 200;
      const y = (effect.time * 0.1 + i * 10) % this.game.H;
      ctx.fillRect(x, y, 1, 1);
    }
    
    ctx.restore();
  }

  renderCosmicParticles(ctx, effect) {
    ctx.save();
    ctx.globalAlpha = effect.intensity * 0.7;
    ctx.fillStyle = '#FF00FF';
    
    for (let i = 0; i < 30; i++) {
      const x = (i * this.game.W / 30) + Math.sin(effect.time * 0.002 + i) * 150;
      const y = Math.cos(effect.time * 0.001 + i) * 100 + this.game.H / 2;
      ctx.fillRect(x, y, 3, 3);
    }
    
    ctx.restore();
  }

  renderMagicParticles(ctx, effect) {
    ctx.save();
    ctx.globalAlpha = effect.intensity * 0.4;
    ctx.fillStyle = '#9370DB';
    
    for (let i = 0; i < 25; i++) {
      const x = (i * this.game.W / 25) + Math.sin(effect.time * 0.001 + i) * 120;
      const y = Math.sin(effect.time * 0.002 + i) * 80 + this.game.H / 2;
      ctx.fillRect(x, y, 2, 2);
    }
    
    ctx.restore();
  }

  renderStageVisuals(ctx) {
    if (!this.currentStage) return;
    
    // Render stage-specific background elements
    switch (this.currentStage.theme) {
      case 'fire':
        this.renderFireBackground(ctx);
        break;
      case 'ice':
        this.renderIceBackground(ctx);
        break;
      case 'shadow':
        this.renderShadowBackground(ctx);
        break;
      case 'cosmic':
        this.renderCosmicBackground(ctx);
        break;
    }
  }

  renderFireBackground(ctx) {
    // Render fire effects in background
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#FF4500';
    
    for (let i = 0; i < 10; i++) {
      const x = (i * this.game.W / 10) + Math.sin(Date.now() * 0.001 + i) * 50;
      const y = this.game.H - 50;
      ctx.fillRect(x, y, 20, 50);
    }
    
    ctx.restore();
  }

  renderIceBackground(ctx) {
    // Render ice crystals in background
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#00BFFF';
    
    for (let i = 0; i < 15; i++) {
      const x = (i * this.game.W / 15) + Math.sin(Date.now() * 0.0005 + i) * 30;
      const y = Math.sin(Date.now() * 0.001 + i) * 20 + this.game.H / 2;
      ctx.fillRect(x, y, 10, 30);
    }
    
    ctx.restore();
  }

  renderShadowBackground(ctx) {
    // Render shadow effects in background
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#2F2F2F';
    
    for (let i = 0; i < 20; i++) {
      const x = (i * this.game.W / 20) + Math.sin(Date.now() * 0.0008 + i) * 80;
      const y = Math.cos(Date.now() * 0.001 + i) * 60 + this.game.H / 2;
      ctx.fillRect(x, y, 15, 15);
    }
    
    ctx.restore();
  }

  renderCosmicBackground(ctx) {
    // Render cosmic effects in background
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#FF00FF';
    
    for (let i = 0; i < 25; i++) {
      const x = (i * this.game.W / 25) + Math.sin(Date.now() * 0.001 + i) * 100;
      const y = Math.sin(Date.now() * 0.0008 + i) * 70 + this.game.H / 2;
      ctx.fillRect(x, y, 5, 5);
    }
    
    ctx.restore();
  }

  getCurrentStage() {
    return this.currentStage;
  }

  getStageList() {
    return Array.from(this.stages.values());
  }

  getStagesByTier(tier) {
    return Array.from(this.stages.values()).filter(stage => stage.tier === tier);
  }

  completeStage() {
    if (!this.currentStage) return;
    
    this.currentStage.isCompleted = true;
    
    // Award completion rewards
    this.game.shardCount += this.currentStage.completionReward.shards;
    
    // Add items to inventory
    this.currentStage.completionReward.items.forEach(item => {
      this.game.inventory?.addItem?.(item);
    });
  }
}

class StagePlatform {
  constructor(config) {
    this.x = config.x;
    this.y = config.y;
    this.w = config.w;
    this.h = config.h;
    this.type = config.type;
    this.specialProperties = this.getSpecialProperties(config.type);
  }

  getSpecialProperties(type) {
    switch (type) {
      case 'ice':
        return { slippery: true, breakable: false };
      case 'crystal':
        return { reflective: true, breakable: true };
      case 'cloud':
        return { floating: true, breakable: true };
      case 'shadow':
        return { ethereal: true, breakable: false };
      case 'cosmic':
        return { unstable: true, breakable: true };
      default:
        return { breakable: false };
    }
  }

  render(ctx) {
    // Render platform based on type
    const colors = {
      wood: '#8B4513',
      crystal: '#00BFFF',
      rock: '#696969',
      cloud: '#FFFFFF',
      shadow: '#2F2F2F',
      cosmic: '#FF00FF',
      gold: '#FFD700',
      metal: '#C0C0C0',
      living_wood: '#228B22',
      coral: '#FF7F50',
      magical: '#9370DB'
    };

    ctx.fillStyle = colors[this.type] || '#666666';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    
    // Add special effects based on type
    if (this.type === 'crystal') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
  }
}

export { StagePlatform };

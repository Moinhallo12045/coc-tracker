const fs = require('fs');
const path = require('path');

// Home Village & Builder Base entities
const homeEntities = [
  // Town Hall & Infrastructure
  { id: 1000001, name: 'Town Hall', category: 'defense', resource: 'gold', slug: 'town_hall', maxLvl: 18 },
  { id: 1000000, name: 'Army Camp', category: 'offense', resource: 'elixir', slug: 'army_camp', maxLvl: 14 },
  { id: 1000006, name: 'Barracks', category: 'offense', resource: 'elixir', slug: 'barracks', maxLvl: 18 },
  { id: 1000007, name: 'Laboratory', category: 'offense', resource: 'elixir', slug: 'laboratory', maxLvl: 15 },
  { id: 1000014, name: 'Clan Castle', category: 'offense', resource: 'elixir', slug: 'clan_castle', maxLvl: 13 },
  { id: 1000015, name: 'Builders Hut', category: 'defense', resource: 'gold', slug: "builder's_hut", maxLvl: 7 },
  { id: 1000020, name: 'Spell Factory', category: 'offense', resource: 'elixir', slug: 'spell_factory', maxLvl: 10 },
  { id: 1000026, name: 'Dark Barracks', category: 'offense', resource: 'elixir', slug: 'dark_barracks', maxLvl: 11 },
  { id: 1000029, name: 'Dark Spell Factory', category: 'offense', resource: 'elixir', slug: 'dark_spell_factory', maxLvl: 7 },
  { id: 1000059, name: 'Workshop', category: 'offense', resource: 'elixir', slug: 'workshop', maxLvl: 8 },
  { id: 1000064, name: 'B.O.B Hut', category: 'defense', resource: 'gold', slug: 'bob_control', maxLvl: 5 },
  { id: 1000068, name: 'Pet House', category: 'offense', resource: 'elixir', slug: 'pet_house', maxLvl: 11 },
  { id: 1000070, name: 'Blacksmith', category: 'offense', resource: 'elixir', slug: 'blacksmith', maxLvl: 10 },
  { id: 1000071, name: 'Hero Hall', category: 'offense', resource: 'elixir', slug: 'hero_hall', maxLvl: 11 },
  { id: 1000093, name: 'Supercharge Station', category: 'defense', resource: 'gold', slug: 'blacksmith', maxLvl: 2 },

  // Resources
  { id: 1000002, name: 'Elixir Collector', category: 'resources', resource: 'gold', slug: 'elixir_collector', maxLvl: 17 },
  { id: 1000003, name: 'Elixir Storage', category: 'resources', resource: 'gold', slug: 'elixir_storage', maxLvl: 18 },
  { id: 1000004, name: 'Gold Mine', category: 'resources', resource: 'elixir', slug: 'gold_mine', maxLvl: 17 },
  { id: 1000005, name: 'Gold Storage', category: 'resources', resource: 'elixir', slug: 'gold_storage', maxLvl: 18 },
  { id: 1000023, name: 'Dark Elixir Drill', category: 'resources', resource: 'elixir', slug: 'dark_elixir_drill', maxLvl: 11 },
  { id: 1000024, name: 'Dark Elixir Storage', category: 'resources', resource: 'elixir', slug: 'dark_elixir_storage', maxLvl: 12 },

  // Defenses
  { id: 1000008, name: 'Cannon', category: 'defense', resource: 'gold', slug: 'cannon', maxLvl: 23 },
  { id: 1000009, name: 'Archer Tower', category: 'defense', resource: 'gold', slug: 'archer_tower', maxLvl: 23 },
  { id: 1000010, name: 'Walls', category: 'walls', resource: 'gold', slug: 'wall', maxLvl: 19 },
  { id: 1000011, name: 'Wizard Tower', category: 'defense', resource: 'gold', slug: 'wizard_tower', maxLvl: 17 },
  { id: 1000012, name: 'Air Defense', category: 'defense', resource: 'gold', slug: 'air_defense', maxLvl: 16 },
  { id: 1000013, name: 'Mortar', category: 'defense', resource: 'gold', slug: 'mortar', maxLvl: 17 },
  { id: 1000019, name: 'Hidden Tesla', category: 'defense', resource: 'gold', slug: 'hidden_tesla', maxLvl: 16 },
  { id: 1000021, name: 'X-Bow', category: 'defense', resource: 'gold', slug: 'x-bow', maxLvl: 13 },
  { id: 1000027, name: 'Inferno Tower', category: 'defense', resource: 'gold', slug: 'inferno_tower', maxLvl: 12 },
  { id: 1000028, name: 'Air Sweeper', category: 'defense', resource: 'gold', slug: 'air_sweeper', maxLvl: 8 },
  { id: 1000031, name: 'Eagle Artillery', category: 'defense', resource: 'gold', slug: 'eagle_artillery', maxLvl: 8 },
  { id: 1000032, name: 'Bomb Tower', category: 'defense', resource: 'gold', slug: 'bomb_tower', maxLvl: 12 },
  { id: 1000067, name: 'Scattershot', category: 'defense', resource: 'gold', slug: 'scattershot', maxLvl: 6 },
  { id: 1000072, name: 'Spell Tower', category: 'defense', resource: 'gold', slug: 'spell_tower', maxLvl: 5 },
  { id: 1000077, name: 'Monolith', category: 'defense', resource: 'dark_elixir', slug: 'monolith', maxLvl: 4 },
  { id: 1000084, name: 'Multi-Archer Tower', category: 'defense', resource: 'gold', slug: 'multi-archer_tower', maxLvl: 3 },
  { id: 1000085, name: 'Ricochet Cannon', category: 'defense', resource: 'gold', slug: 'ricochet_cannon', maxLvl: 3 },
  { id: 1000089, name: 'Firespitter', category: 'defense', resource: 'gold', slug: 'firespitter', maxLvl: 3 }, // TH17 New!
  { id: 1000097, name: 'Crafted Defense', category: 'defense', resource: 'gold', slug: 'town_hall', maxLvl: 5 },
  { id: 1000098, name: 'Revenge Tower', category: 'defense', resource: 'dark_elixir', slug: 'revenge_tower', maxLvl: 3 }, // TH18 New!

  // Traps
  { id: 12000000, name: 'Bomb', category: 'defense', resource: 'gold', slug: 'bomb', maxLvl: 13 },
  { id: 12000001, name: 'Spring Trap', category: 'defense', resource: 'gold', slug: 'spring_trap', maxLvl: 11 },
  { id: 12000002, name: 'Giant Bomb', category: 'defense', resource: 'gold', slug: 'giant_bomb', maxLvl: 11 },
  { id: 12000005, name: 'Air Bomb', category: 'defense', resource: 'gold', slug: 'air_bomb', maxLvl: 12 },
  { id: 12000006, name: 'Seeking Air Mine', category: 'defense', resource: 'gold', slug: 'seeking_air_mine', maxLvl: 7 },
  { id: 12000008, name: 'Skeleton Trap', category: 'defense', resource: 'gold', slug: 'skeleton_trap', maxLvl: 5 },
  { id: 12000016, name: 'Tornado Trap', category: 'defense', resource: 'gold', slug: 'tornado_trap', maxLvl: 4 },

  // Heroes
  { id: 28000000, name: 'Barbarian King', category: 'heroes', resource: 'dark_elixir', slug: 'barbarian_king', maxLvl: 105 },
  { id: 28000001, name: 'Archer Queen', category: 'heroes', resource: 'dark_elixir', slug: 'archer_queen', maxLvl: 105 },
  { id: 28000002, name: 'Grand Warden', category: 'heroes', resource: 'elixir', slug: 'grand_warden', maxLvl: 80 },
  { id: 28000004, name: 'Royal Champion', category: 'heroes', resource: 'dark_elixir', slug: 'royal_champion', maxLvl: 55 },
  { id: 28000006, name: 'Minion Prince', category: 'heroes', resource: 'dark_elixir', slug: 'minion_prince', maxLvl: 80 },
  { id: 28000007, name: 'Dragon Duke', category: 'heroes', resource: 'dark_elixir', slug: 'dragon_duke', maxLvl: 40 },

  // Lab
  { id: 4000000, name: 'Barbarian', category: 'lab', resource: 'elixir', slug: 'barbarian', maxLvl: 13 },
  { id: 4000001, name: 'Archer', category: 'lab', resource: 'elixir', slug: 'archer', maxLvl: 13 },
  { id: 4000002, name: 'Goblin', category: 'lab', resource: 'elixir', slug: 'goblin', maxLvl: 12 },
  { id: 4000003, name: 'Giant', category: 'lab', resource: 'elixir', slug: 'giant', maxLvl: 13 },
  { id: 4000004, name: 'Wall Breaker', category: 'lab', resource: 'elixir', slug: 'wall_breaker', maxLvl: 12 },
  { id: 4000005, name: 'Balloon', category: 'lab', resource: 'elixir', slug: 'balloon', maxLvl: 13 },
  { id: 4000006, name: 'Wizard', category: 'lab', resource: 'elixir', slug: 'wizard', maxLvl: 13 },
  { id: 4000007, name: 'Healer', category: 'lab', resource: 'elixir', slug: 'healer', maxLvl: 10 },
  { id: 4000008, name: 'Dragon', category: 'lab', resource: 'elixir', slug: 'dragon', maxLvl: 13 },
  { id: 4000009, name: 'P.E.K.K.A', category: 'lab', resource: 'elixir', slug: 'p.e.k.k.a', maxLvl: 12 },
  { id: 4000010, name: 'Minion', category: 'lab', resource: 'dark_elixir', slug: 'minion', maxLvl: 12 },
  { id: 4000011, name: 'Hog Rider', category: 'lab', resource: 'dark_elixir', slug: 'hog_rider', maxLvl: 13 },
  { id: 4000012, name: 'Valkyrie', category: 'lab', resource: 'dark_elixir', slug: 'valkyrie', maxLvl: 12 },
  { id: 4000013, name: 'Golem', category: 'lab', resource: 'dark_elixir', slug: 'golem', maxLvl: 13 },
  { id: 4000015, name: 'Witch', category: 'lab', resource: 'dark_elixir', slug: 'witch', maxLvl: 8 },
  { id: 4000017, name: 'Lava Hound', category: 'lab', resource: 'dark_elixir', slug: 'lava_hound', maxLvl: 8 },
  { id: 4000022, name: 'Bowler', category: 'lab', resource: 'dark_elixir', slug: 'bowler', maxLvl: 8 },
  { id: 4000023, name: 'Baby Dragon', category: 'lab', resource: 'elixir', slug: 'baby_dragon', maxLvl: 10 },
  { id: 4000024, name: 'Miner', category: 'lab', resource: 'elixir', slug: 'miner', maxLvl: 11 },
  { id: 4000053, name: 'Yeti', category: 'lab', resource: 'elixir', slug: 'yeti', maxLvl: 6 },
  { id: 4000058, name: 'Ice Golem', category: 'lab', resource: 'dark_elixir', slug: 'ice_golem', maxLvl: 8 },
  { id: 4000059, name: 'Electro Dragon', category: 'lab', resource: 'elixir', slug: 'electro_dragon', maxLvl: 8 },
  { id: 4000065, name: 'Dragon Rider', category: 'lab', resource: 'elixir', slug: 'dragon_rider', maxLvl: 5 },
  { id: 4000082, name: 'Headhunter', category: 'lab', resource: 'dark_elixir', slug: 'headhunter', maxLvl: 4 },
  { id: 4000095, name: 'Electro Titan', category: 'lab', resource: 'elixir', slug: 'electro_titan', maxLvl: 4 },
  { id: 4000097, name: 'Apprentice Warden', category: 'lab', resource: 'dark_elixir', slug: 'apprentice_warden', maxLvl: 5 },
  { id: 4000110, name: 'Root Rider', category: 'lab', resource: 'dark_elixir', slug: 'root_rider', maxLvl: 4 },

  // Pets
  { id: 73000000, name: 'L.A.S.S.I', category: 'pets', resource: 'dark_elixir', slug: 'lassi', maxLvl: 15 },
  { id: 73000001, name: 'Electro Owl', category: 'pets', resource: 'dark_elixir', slug: 'electro_owl', maxLvl: 15 },
  { id: 73000002, name: 'Mighty Yak', category: 'pets', resource: 'dark_elixir', slug: 'mighty_yak', maxLvl: 15 },
  { id: 73000003, name: 'Unicorn', category: 'pets', resource: 'dark_elixir', slug: 'unicorn', maxLvl: 15 },
  { id: 73000004, name: 'Phoenix', category: 'pets', resource: 'dark_elixir', slug: 'phoenix', maxLvl: 15 },
  { id: 73000007, name: 'Poison Lizard', category: 'pets', resource: 'dark_elixir', slug: 'poison_lizard', maxLvl: 15 },
  { id: 73000008, name: 'Diggy', category: 'pets', resource: 'dark_elixir', slug: 'diggy', maxLvl: 15 },
  { id: 73000009, name: 'Frosty', category: 'pets', resource: 'dark_elixir', slug: 'frosty', maxLvl: 15 },
  { id: 73000010, name: 'Spirit Fox', category: 'pets', resource: 'dark_elixir', slug: 'spirit_fox', maxLvl: 15 },
  { id: 73000011, name: 'Angry Jelly', category: 'pets', resource: 'dark_elixir', slug: 'angry_jelly', maxLvl: 15 }
];

// Builder Base entities (exact IDs from export buildings2)
const builderBaseEntities = [
  { id: 1000040, name: 'Builder Hall', category: 'defense', resource: 'builder_gold', slug: 'builder_hall', maxLvl: 10 },
  { id: 1000033, name: 'Walls (BB)', category: 'walls', resource: 'builder_gold', slug: 'wall', maxLvl: 10 },
  { id: 1000034, name: 'Cannon (BB)', category: 'defense', resource: 'builder_gold', slug: 'cannon', maxLvl: 10 },
  { id: 1000035, name: 'Archer Tower (BB)', category: 'defense', resource: 'builder_gold', slug: 'archer_tower', maxLvl: 10 },
  { id: 1000036, name: 'Double Cannon', category: 'defense', resource: 'builder_gold', slug: 'double_cannon', maxLvl: 10 },
  { id: 1000037, name: 'Hidden Tesla (BB)', category: 'defense', resource: 'builder_gold', slug: 'hidden_tesla', maxLvl: 10 },
  { id: 1000038, name: 'Firecrackers', category: 'defense', resource: 'builder_gold', slug: 'firecrackers', maxLvl: 10 },
  { id: 1000039, name: 'Crusher', category: 'defense', resource: 'builder_gold', slug: 'crusher', maxLvl: 10 },
  { id: 1000041, name: 'Guard Post', category: 'defense', resource: 'builder_gold', slug: 'guard_post', maxLvl: 10 },
  { id: 1000042, name: 'Army Camp (BB)', category: 'offense', resource: 'builder_elixir', slug: 'army_camp', maxLvl: 1 },
  { id: 1000043, name: 'Elixir Collector (BB)', category: 'resources', resource: 'builder_gold', slug: 'elixir_collector', maxLvl: 10 },
  { id: 1000044, name: 'Gold Mine (BB)', category: 'resources', resource: 'builder_elixir', slug: 'gold_mine', maxLvl: 10 },
  { id: 1000045, name: 'Elixir Storage (BB)', category: 'resources', resource: 'builder_gold', slug: 'elixir_storage', maxLvl: 10 },
  { id: 1000046, name: 'Gold Storage (BB)', category: 'resources', resource: 'builder_elixir', slug: 'gold_storage', maxLvl: 10 },
  { id: 1000048, name: 'Air Bombs (BB)', category: 'defense', resource: 'builder_gold', slug: 'air_bombs', maxLvl: 10 },
  { id: 1000049, name: 'Builder Barracks', category: 'offense', resource: 'builder_elixir', slug: 'builder_barracks', maxLvl: 12 },
  { id: 1000050, name: 'Push Trap', category: 'defense', resource: 'builder_gold', slug: 'push_trap', maxLvl: 10 },
  { id: 1000051, name: 'Multi Mortar', category: 'defense', resource: 'builder_gold', slug: 'multi_mortar', maxLvl: 10 },
  { id: 1000052, name: 'Star Laboratory', category: 'offense', resource: 'builder_elixir', slug: 'star_laboratory', maxLvl: 10 },
  { id: 1000053, name: 'Clock Tower', category: 'resources', resource: 'builder_gold', slug: 'clock_tower', maxLvl: 10 },
  { id: 1000054, name: 'Roaster', category: 'defense', resource: 'builder_gold', slug: 'roaster', maxLvl: 10 },
  { id: 1000055, name: 'Giant Cannon', category: 'defense', resource: 'builder_gold', slug: 'giant_cannon', maxLvl: 10 },
  { id: 1000056, name: 'Mega Tesla', category: 'defense', resource: 'builder_gold', slug: 'mega_tesla', maxLvl: 10 },
  { id: 1000057, name: 'Gem Mine', category: 'resources', resource: 'builder_elixir', slug: 'gem_mine', maxLvl: 10 },
  { id: 1000058, name: 'Lava Launcher', category: 'defense', resource: 'builder_gold', slug: 'lava_launcher', maxLvl: 10 },
  { id: 1000063, name: 'Healing Hut', category: 'defense', resource: 'builder_gold', slug: 'healing_hut', maxLvl: 6 },
  { id: 1000065, name: "O.T.T.O's Outpost", category: 'defense', resource: 'builder_gold', slug: "otto's_outpost", maxLvl: 10 },
  { id: 1000078, name: 'X-Bow (BB)', category: 'defense', resource: 'builder_gold', slug: 'x-bow', maxLvl: 6 },
  { id: 1000080, name: 'B.O.B Control', category: 'offense', resource: 'builder_elixir', slug: 'bob_control', maxLvl: 5 },
  { id: 1000082, name: 'Reinforcement Camp', category: 'offense', resource: 'builder_elixir', slug: 'army_camp', maxLvl: 6 },

  // BB Heroes
  { id: 28000003, name: 'Battle Machine', category: 'heroes', resource: 'builder_elixir', slug: 'battle_machine', maxLvl: 35 },
  { id: 28000005, name: 'Battle Copter', category: 'heroes', resource: 'builder_elixir', slug: 'battle_copter', maxLvl: 35 },

  // BB Troops (units2)
  { id: 4000031, name: 'Raged Barbarian', category: 'lab', resource: 'builder_elixir', slug: 'raged_barbarian', maxLvl: 20 },
  { id: 4000032, name: 'Sneaky Archer', category: 'lab', resource: 'builder_elixir', slug: 'sneaky_archer', maxLvl: 20 },
  { id: 4000033, name: 'Boxer Giant', category: 'lab', resource: 'builder_elixir', slug: 'boxer_giant', maxLvl: 20 },
  { id: 4000034, name: 'Beta Minion', category: 'lab', resource: 'builder_elixir', slug: 'beta_minion', maxLvl: 20 },
  { id: 4000035, name: 'Bomber', category: 'lab', resource: 'builder_elixir', slug: 'bomber', maxLvl: 20 },
  { id: 4000036, name: 'Baby Dragon (BB)', category: 'lab', resource: 'builder_elixir', slug: 'baby_dragon', maxLvl: 20 },
  { id: 4000037, name: 'Cannon Cart', category: 'lab', resource: 'builder_elixir', slug: 'cannon_cart', maxLvl: 20 },
  { id: 4000038, name: 'Night Witch', category: 'lab', resource: 'builder_elixir', slug: 'night_witch', maxLvl: 20 },
  { id: 4000041, name: 'Drop Ship', category: 'lab', resource: 'builder_elixir', slug: 'drop_ship', maxLvl: 20 },
  { id: 4000042, name: 'Power P.E.K.K.A', category: 'lab', resource: 'builder_elixir', slug: 'power_P.E.K.K.A', maxLvl: 20 },
  { id: 4000070, name: 'Hog Glider', category: 'lab', resource: 'builder_elixir', slug: 'hog_glider', maxLvl: 20 },

  // BB Traps (traps2)
  { id: 12000010, name: 'Mine (BB)', category: 'defense', resource: 'builder_gold', slug: 'mine', maxLvl: 11 },
  { id: 12000011, name: 'Mega Mine (BB)', category: 'defense', resource: 'builder_gold', slug: 'mega_mine', maxLvl: 11 },
  { id: 12000013, name: 'Push Trap', category: 'defense', resource: 'builder_gold', slug: 'push_trap', maxLvl: 11 },
  { id: 12000014, name: 'Spring Trap (BB)', category: 'defense', resource: 'builder_gold', slug: 'spring_trap', maxLvl: 11 }
];

const catalog = {
  townhalls: {},
  builderhalls: {},
  entities: {}
};

for (let th = 1; th <= 19; th++) {
  catalog.townhalls[th] = {
    max_walls: th >= 18 ? 350 : (th >= 13 ? 325 : (th * 25)),
    giga_weapon_levels: th >= 12 ? 5 : 0,
    max_builder_count: 6
  };
}

for (let bh = 1; bh <= 12; bh++) {
  catalog.builderhalls[bh] = {
    max_walls: bh * 25,
    giga_weapon_levels: 0,
    max_builder_count: 2
  };
}

function processList(list, villageType) {
  for (const ent of list) {
    const levels = {};
    const th_caps = {};

    for (let l = 1; l <= ent.maxLvl; l++) {
      const isDark = ent.resource === 'dark_elixir';
      const baseCost = isDark ? 20000 + l * 8000 : Math.min(22000000, 100000 * Math.pow(1.35, l));
      const duration = Math.min(15 * 86400, Math.round(1800 * Math.pow(1.32, l)));

      levels[l] = {
        cost: Math.round(baseCost),
        duration: Math.round(duration),
        resource: ent.resource
      };
    }

    const maxHalls = villageType === 'builderBase' ? 12 : 19;
    for (let h = 1; h <= maxHalls; h++) {
      if (h < 3 && ent.category === 'defense' && !ent.name.includes('Cannon') && !ent.name.includes('Archer Tower')) {
        th_caps[h] = 0;
      } else {
        th_caps[h] = Math.max(1, Math.min(ent.maxLvl, Math.round(ent.maxLvl * (h / maxHalls))));
      }
    }

    // TH17 specific
    if (ent.id === 1000089) {
      for (let th = 1; th <= 16; th++) th_caps[th] = 0;
      th_caps[17] = 2;
      th_caps[18] = 3;
      th_caps[19] = 3;
    }

    // TH18 specific
    if (ent.id === 1000098) {
      for (let th = 1; th <= 17; th++) th_caps[th] = 0;
      th_caps[18] = 2;
      th_caps[19] = 3;
    }

    catalog.entities[ent.id] = {
      id: ent.id,
      name: ent.name,
      villageType,
      category: ent.category,
      resource: ent.resource,
      th_caps,
      levels
    };
  }
}

processList(homeEntities, 'home');
processList(builderBaseEntities, 'builderBase');

const outPath = path.join(__dirname, '..', 'src', 'data', 'catalog.json');
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log('✓ Successfully generated catalog.json with Home Village AND Builder Base!');

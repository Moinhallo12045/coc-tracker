const fs = require('fs');
const path = require('path');

// Complete CoC mapping with all buildings up to TH17 and TH18
const entityDefinitions = [
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

  // Key Lab Units
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

const catalog = {
  townhalls: {},
  entities: {}
};

for (let th = 1; th <= 19; th++) {
  catalog.townhalls[th] = {
    max_walls: th >= 18 ? 350 : (th >= 13 ? 325 : (th * 25)),
    giga_weapon_levels: th >= 12 ? 5 : 0,
    max_builder_count: 6
  };
}

for (const ent of entityDefinitions) {
  const levels = {};
  const th_caps = {};

  for (let l = 1; l <= ent.maxLvl; l++) {
    // Generate realistic base costs and durations
    const isDark = ent.resource === 'dark_elixir';
    const baseCost = isDark ? 20000 + l * 8000 : Math.min(22000000, 100000 * Math.pow(1.35, l));
    const duration = Math.min(15 * 86400, Math.round(1800 * Math.pow(1.32, l)));

    levels[l] = {
      cost: Math.round(baseCost),
      duration: Math.round(duration),
      resource: ent.resource
    };
  }

  // TH Caps distribution up to TH18/TH19
  for (let th = 1; th <= 19; th++) {
    if (th < 3 && ent.category === 'defense' && ent.name !== 'Cannon' && ent.name !== 'Archer Tower') {
      th_caps[th] = 0;
    } else if (th === 16) {
      th_caps[th] = Math.max(1, ent.maxLvl - 2);
    } else if (th === 17) {
      th_caps[th] = Math.max(1, ent.maxLvl - 1);
    } else if (th >= 18) {
      th_caps[th] = ent.maxLvl;
    } else {
      th_caps[th] = Math.max(1, Math.min(ent.maxLvl, Math.round(ent.maxLvl * (th / 17))));
    }
  }

  // TH17 specific: Firespitter only unlocks at TH17+
  if (ent.id === 1000089) {
    for (let th = 1; th <= 16; th++) th_caps[th] = 0;
    th_caps[17] = 2;
    th_caps[18] = 3;
    th_caps[19] = 3;
  }

  // TH18 specific: Revenge Tower only unlocks at TH18+
  if (ent.id === 1000098) {
    for (let th = 1; th <= 17; th++) th_caps[th] = 0;
    th_caps[18] = 2;
    th_caps[19] = 3;
  }

  catalog.entities[ent.id] = {
    id: ent.id,
    name: ent.name,
    category: ent.category,
    resource: ent.resource,
    th_caps,
    levels
  };
}

const outPath = path.join(__dirname, '..', 'src', 'data', 'catalog.json');
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log('✓ Successfully generated complete catalog.json with all', entityDefinitions.length, 'entities!');

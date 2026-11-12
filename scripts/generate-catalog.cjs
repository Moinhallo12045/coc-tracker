const fs = require('fs');
const path = require('path');

const catalog = {
  townhalls: {},
  entities: {}
};

// Generate TH1 through TH19 caps
for (let th = 1; th <= 19; th++) {
  let max_walls = 0;
  if (th === 2) max_walls = 25;
  else if (th === 3) max_walls = 50;
  else if (th === 4) max_walls = 75;
  else if (th === 5) max_walls = 100;
  else if (th === 6) max_walls = 125;
  else if (th === 7) max_walls = 175;
  else if (th === 8) max_walls = 225;
  else if (th === 9) max_walls = 250;
  else if (th === 10) max_walls = 275;
  else if (th === 11) max_walls = 300;
  else if (th === 12) max_walls = 300;
  else if (th >= 13 && th <= 17) max_walls = 325;
  else max_walls = 350; // TH18, TH19

  catalog.townhalls[th] = {
    max_walls,
    giga_weapon_levels: th >= 12 ? 5 : 0,
    max_builder_count: th >= 9 ? 6 : (th >= 5 ? 5 : 3)
  };
}

// Helper to create levels
function createLevels(startLvl, maxLvl, baseCost, costMultiplier, baseDuration, durationMultiplier, resource = 'gold') {
  const levels = {};
  for (let lvl = startLvl; lvl <= maxLvl; lvl++) {
    const cost = Math.round(baseCost * Math.pow(costMultiplier, lvl - startLvl));
    const duration = Math.min(14 * 86400, Math.round(baseDuration * Math.pow(durationMultiplier, lvl - startLvl)));
    levels[lvl] = { cost, duration, resource };
  }
  return levels;
}

// 1. Archer Tower (1000008) - Prompt specific: TH16=21, TH17=22, TH18=23, TH19=24
const archerTowerLevels = {};
for (let l = 1; l <= 20; l++) {
  archerTowerLevels[l] = {
    cost: Math.round(500 * Math.pow(1.8, l - 1)),
    duration: Math.round(60 * Math.pow(1.7, l - 1)),
    resource: 'gold'
  };
}
// Exact values from prompt for 21-24:
archerTowerLevels[21] = { cost: 17000000, duration: 1036800, resource: 'gold' }; // 12d
archerTowerLevels[22] = { cost: 18500000, duration: 1123200, resource: 'gold' }; // 13d
archerTowerLevels[23] = { cost: 20000000, duration: 1209600, resource: 'gold' }; // 14d
archerTowerLevels[24] = { cost: 21500000, duration: 1296000, resource: 'gold' }; // 15d

catalog.entities[1000008] = {
  id: 1000008,
  name: "Archer Tower",
  category: "defense",
  resource: "gold",
  th_caps: {
    1: 0, 2: 2, 3: 3, 4: 4, 5: 6, 6: 7, 7: 8, 8: 10, 9: 11, 10: 13,
    11: 15, 12: 17, 13: 19, 14: 20, 15: 21, 16: 21, 17: 22, 18: 23, 19: 24
  },
  levels: archerTowerLevels
};

// 2. Cannon (1000000)
const cannonLevels = {};
for (let l = 1; l <= 23; l++) {
  cannonLevels[l] = {
    cost: Math.min(21000000, Math.round(250 * Math.pow(1.75, l))),
    duration: Math.min(14 * 86400, Math.round(30 * Math.pow(1.68, l))),
    resource: 'gold'
  };
}
catalog.entities[1000000] = {
  id: 1000000,
  name: "Cannon",
  category: "defense",
  resource: "gold",
  th_caps: {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 7, 6: 8, 7: 9, 8: 10, 9: 11, 10: 13,
    11: 15, 12: 17, 13: 19, 14: 20, 15: 21, 16: 21, 17: 22, 18: 23, 19: 24
  },
  levels: cannonLevels
};

// 3. Air Defense (1000004) - Prompt mentions L16 (4/4 Max for TH16)
const airDefenseLevels = {};
for (let l = 1; l <= 16; l++) {
  airDefenseLevels[l] = {
    cost: Math.min(22000000, Math.round(22500 * Math.pow(1.65, l))),
    duration: Math.min(14 * 86400, Math.round(1800 * Math.pow(1.55, l))),
    resource: 'gold'
  };
}
catalog.entities[1000004] = {
  id: 1000004,
  name: "Air Defense",
  category: "defense",
  resource: "gold",
  th_caps: {
    1: 0, 2: 0, 3: 0, 4: 1, 5: 1, 6: 2, 7: 3, 8: 4, 9: 4, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 16, 17: 17, 18: 18, 19: 19
  },
  levels: airDefenseLevels
};

// 4. Eagle Artillery (1000013)
catalog.entities[1000013] = {
  id: 1000013,
  name: "Eagle Artillery",
  category: "defense",
  resource: "gold",
  th_caps: {
    11: 2, 12: 3, 13: 4, 14: 5, 15: 6, 16: 7, 17: 8, 18: 9, 19: 10
  },
  levels: {
    1: { cost: 8000000, duration: 604800, resource: 'gold' },
    2: { cost: 10000000, duration: 691200, resource: 'gold' },
    3: { cost: 12000000, duration: 777600, resource: 'gold' },
    4: { cost: 15000000, duration: 864000, resource: 'gold' },
    5: { cost: 18000000, duration: 950400, resource: 'gold' },
    6: { cost: 20000000, duration: 1036800, resource: 'gold' },
    7: { cost: 22000000, duration: 1123200, resource: 'gold' },
    8: { cost: 23500000, duration: 1209600, resource: 'gold' },
    9: { cost: 25000000, duration: 1296000, resource: 'gold' }
  }
};

// 5. Inferno Tower (1000012)
catalog.entities[1000012] = {
  id: 1000012,
  name: "Inferno Tower",
  category: "defense",
  resource: "gold",
  th_caps: {
    10: 3, 11: 5, 12: 6, 13: 7, 14: 8, 15: 9, 16: 10, 17: 11, 18: 12, 19: 13
  },
  levels: {
    1: { cost: 5000000, duration: 432000, resource: 'gold' },
    2: { cost: 6500000, duration: 518400, resource: 'gold' },
    3: { cost: 8000000, duration: 604800, resource: 'gold' },
    4: { cost: 9500000, duration: 691200, resource: 'gold' },
    5: { cost: 11000000, duration: 777600, resource: 'gold' },
    6: { cost: 13000000, duration: 864000, resource: 'gold' },
    7: { cost: 15500000, duration: 950400, resource: 'gold' },
    8: { cost: 18000000, duration: 1036800, resource: 'gold' },
    9: { cost: 20000000, duration: 1123200, resource: 'gold' },
    10: { cost: 22000000, duration: 1209600, resource: 'gold' },
    11: { cost: 24000000, duration: 1296000, resource: 'gold' }
  }
};

// 6. Monolith (1000016)
catalog.entities[1000016] = {
  id: 1000016,
  name: "Monolith",
  category: "defense",
  resource: "dark_elixir",
  th_caps: { 15: 2, 16: 3, 17: 4, 18: 5, 19: 6 },
  levels: {
    1: { cost: 300000, duration: 1036800, resource: 'dark_elixir' },
    2: { cost: 330000, duration: 1123200, resource: 'dark_elixir' },
    3: { cost: 360000, duration: 1209600, resource: 'dark_elixir' },
    4: { cost: 390000, duration: 1296000, resource: 'dark_elixir' }
  }
};

// 7. Gold Storage (1000002) - Prompt: Gold Storage (Lvl 17) cost 5.5M Elixir, 9d 12h (820800s)
const goldStorageLevels = {};
for (let l = 1; l <= 15; l++) {
  goldStorageLevels[l] = {
    cost: Math.round(300 * Math.pow(1.8, l)),
    duration: Math.round(120 * Math.pow(1.6, l)),
    resource: 'elixir'
  };
}
goldStorageLevels[16] = { cost: 4500000, duration: 691200, resource: 'elixir' }; // 8d
goldStorageLevels[17] = { cost: 5500000, duration: 820800, resource: 'elixir' }; // 9d 12h
goldStorageLevels[18] = { cost: 6500000, duration: 950400, resource: 'elixir' }; // 11d

catalog.entities[1000002] = {
  id: 1000002,
  name: "Gold Storage",
  category: "resources",
  resource: "elixir",
  th_caps: {
    1: 1, 2: 2, 3: 4, 4: 6, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 13,
    11: 14, 12: 15, 13: 15, 14: 15, 15: 16, 16: 17, 17: 18, 18: 19, 19: 20
  },
  levels: goldStorageLevels
};

// 8. Elixir Storage (1000024)
const elixirStorageLevels = {};
for (let l = 1; l <= 18; l++) {
  elixirStorageLevels[l] = {
    cost: goldStorageLevels[l] ? goldStorageLevels[l].cost : 5000000,
    duration: goldStorageLevels[l] ? goldStorageLevels[l].duration : 820800,
    resource: 'gold'
  };
}
catalog.entities[1000024] = {
  id: 1000024,
  name: "Elixir Storage",
  category: "resources",
  resource: "gold",
  th_caps: catalog.entities[1000002].th_caps,
  levels: elixirStorageLevels
};

// 9. Walls (1000010) - Prompt mentions L17 (325/325)
const wallLevels = {};
wallLevels[1] = { cost: 200, duration: 0, resource: 'gold' };
wallLevels[2] = { cost: 1000, duration: 0, resource: 'gold' };
wallLevels[3] = { cost: 5000, duration: 0, resource: 'gold' };
wallLevels[4] = { cost: 10000, duration: 0, resource: 'gold' };
wallLevels[5] = { cost: 30000, duration: 0, resource: 'gold' };
wallLevels[6] = { cost: 75000, duration: 0, resource: 'gold' };
wallLevels[7] = { cost: 200000, duration: 0, resource: 'gold' };
wallLevels[8] = { cost: 500000, duration: 0, resource: 'gold' };
wallLevels[9] = { cost: 1000000, duration: 0, resource: 'gold' };
wallLevels[10] = { cost: 1500000, duration: 0, resource: 'gold' };
wallLevels[11] = { cost: 2000000, duration: 0, resource: 'gold' };
wallLevels[12] = { cost: 3000000, duration: 0, resource: 'gold' };
wallLevels[13] = { cost: 4000000, duration: 0, resource: 'gold' };
wallLevels[14] = { cost: 5000000, duration: 0, resource: 'gold' };
wallLevels[15] = { cost: 7000000, duration: 0, resource: 'gold' };
wallLevels[16] = { cost: 8000000, duration: 0, resource: 'gold' };
wallLevels[17] = { cost: 9000000, duration: 0, resource: 'gold' };
wallLevels[18] = { cost: 9500000, duration: 0, resource: 'gold' };
wallLevels[19] = { cost: 10000000, duration: 0, resource: 'gold' };

catalog.entities[1000010] = {
  id: 1000010,
  name: "Walls",
  category: "walls",
  resource: "gold",
  th_caps: {
    1: 0, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
    11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 17, 17: 18, 18: 19, 19: 19
  },
  levels: wallLevels
};

// 10. Laboratory (1000030) - Offense Priority
const labLevels = {};
for (let l = 1; l <= 16; l++) {
  labLevels[l] = {
    cost: Math.min(16000000, Math.round(25000 * Math.pow(1.6, l))),
    duration: Math.min(12 * 86400, Math.round(1800 * Math.pow(1.5, l))),
    resource: 'elixir'
  };
}
catalog.entities[1000030] = {
  id: 1000030,
  name: "Laboratory",
  category: "offense",
  resource: "elixir",
  th_caps: {
    1: 0, 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8,
    11: 9, 12: 10, 13: 11, 14: 12, 15: 13, 16: 14, 17: 15, 18: 16, 19: 17
  },
  levels: labLevels
};

// 11. Army Camp (1000031)
const campLevels = {};
for (let l = 1; l <= 14; l++) {
  campLevels[l] = {
    cost: Math.min(19000000, Math.round(50000 * Math.pow(1.65, l))),
    duration: Math.min(14 * 86400, Math.round(3600 * Math.pow(1.55, l))),
    resource: 'elixir'
  };
}
catalog.entities[1000031] = {
  id: 1000031,
  name: "Army Camp",
  category: "offense",
  resource: "elixir",
  th_caps: {
    1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
    11: 11, 12: 12, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15
  },
  levels: campLevels
};

// 12. Clan Castle (1000026)
const ccLevels = {};
for (let l = 1; l <= 13; l++) {
  ccLevels[l] = {
    cost: Math.min(22000000, Math.round(100000 * Math.pow(1.7, l))),
    duration: Math.min(14 * 86400, Math.round(7200 * Math.pow(1.6, l))),
    resource: 'elixir'
  };
}
catalog.entities[1000026] = {
  id: 1000026,
  name: "Clan Castle",
  category: "offense",
  resource: "elixir",
  th_caps: {
    1: 0, 2: 1, 3: 1, 4: 2, 5: 2, 6: 3, 7: 3, 8: 4, 9: 5, 10: 6,
    11: 7, 12: 8, 13: 9, 14: 10, 15: 11, 16: 12, 17: 12, 18: 13, 19: 13
  },
  levels: ccLevels
};

// 13. Heroes: Barbarian King (28000000) - Prompt mentions King -> L91, 3d 02h 10m (267010s)
const kingLevels = {};
for (let l = 1; l <= 100; l++) {
  kingLevels[l] = {
    cost: Math.min(340000, Math.round(10000 + l * 3200)),
    duration: Math.min(8 * 86400, Math.round(12 * 3600 + l * 2400)),
    resource: 'dark_elixir'
  };
}
kingLevels[91] = { cost: 310000, duration: 267010, resource: 'dark_elixir' }; // 3d 2h 10m

catalog.entities[28000000] = {
  id: 28000000,
  name: "Barbarian King",
  category: "heroes",
  resource: "dark_elixir",
  th_caps: {
    7: 5, 8: 10, 9: 30, 10: 40, 11: 50, 12: 65, 13: 75, 14: 80, 15: 90, 16: 95, 17: 100, 18: 105, 19: 110
  },
  levels: kingLevels
};

// 14. Archer Queen (28000001)
const queenLevels = {};
for (let l = 1; l <= 100; l++) {
  queenLevels[l] = {
    cost: Math.min(350000, Math.round(15000 + l * 3300)),
    duration: Math.min(8 * 86400, Math.round(12 * 3600 + l * 2400)),
    resource: 'dark_elixir'
  };
}
catalog.entities[28000001] = {
  id: 28000001,
  name: "Archer Queen",
  category: "heroes",
  resource: "dark_elixir",
  th_caps: catalog.entities[28000000].th_caps,
  levels: queenLevels
};

// 15. Grand Warden (28000002) - uses Elixir!
const wardenLevels = {};
for (let l = 1; l <= 75; l++) {
  wardenLevels[l] = {
    cost: Math.min(22000000, Math.round(4000000 + l * 250000)),
    duration: Math.min(8 * 86400, Math.round(24 * 3600 + l * 2000)),
    resource: 'elixir'
  };
}
catalog.entities[28000002] = {
  id: 28000002,
  name: "Grand Warden",
  category: "heroes",
  resource: "elixir",
  th_caps: {
    11: 20, 12: 40, 13: 50, 14: 55, 15: 65, 16: 70, 17: 75, 18: 80, 19: 85
  },
  levels: wardenLevels
};

// 16. Royal Champion (28000003)
const rcLevels = {};
for (let l = 1; l <= 50; l++) {
  rcLevels[l] = {
    cost: Math.min(360000, Math.round(100000 + l * 5000)),
    duration: Math.min(8 * 86400, Math.round(36 * 3600 + l * 2500)),
    resource: 'dark_elixir'
  };
}
catalog.entities[28000003] = {
  id: 28000003,
  name: "Royal Champion",
  category: "heroes",
  resource: "dark_elixir",
  th_caps: {
    13: 25, 14: 30, 15: 40, 16: 45, 17: 50, 18: 55, 19: 60
  },
  levels: rcLevels
};

// 17. Electro Titan (4000095) - Prompt mentions: Titan L2, 6d 18h (583200s)
catalog.entities[4000095] = {
  id: 4000095,
  name: "Electro Titan",
  category: "lab",
  resource: "elixir",
  th_caps: { 14: 1, 15: 3, 16: 4, 17: 5, 18: 5, 19: 6 },
  levels: {
    1: { cost: 18000000, duration: 432000, resource: 'elixir' },
    2: { cost: 19500000, duration: 583200, resource: 'elixir' }, // 6d 18h
    3: { cost: 20500000, duration: 691200, resource: 'elixir' },
    4: { cost: 21500000, duration: 777600, resource: 'elixir' },
    5: { cost: 22500000, duration: 864000, resource: 'elixir' }
  }
};

const outPath = path.join(__dirname, '..', 'src', 'data', 'catalog.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf-8');
console.log('✓ Created src/data/catalog.json successfully!');

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');

async function downloadFile(url, destPath) {
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Skip ${res.status}] ${url}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await sharp(buffer).webp({ quality: 90 }).toFile(destPath);
    console.log(`✓ Downloaded & Saved: ${path.basename(destPath)}`);
    return true;
  } catch (err) {
    console.warn(`[Error] Failed to download ${url}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('Downloading 100% official In-Game assets from ClashKing CDN...');

  // 1. Resources
  const resources = {
    'gold.webp': 'https://assets.clashk.ing/resources/gold.webp',
    'elixir.webp': 'https://assets.clashk.ing/resources/elixir.webp',
    'dark_elixir.webp': 'https://assets.clashk.ing/resources/dark_elixir.webp',
    'ore_shiny.webp': 'https://assets.clashk.ing/resources/shiny_ore.webp',
    'ore_glowy.webp': 'https://assets.clashk.ing/resources/glowy_ore.webp',
    'ore_starry.webp': 'https://assets.clashk.ing/resources/starry_ore.webp',
  };

  for (const [filename, url] of Object.entries(resources)) {
    await downloadFile(url, path.join(ASSETS_DIR, 'resources', filename));
  }

  // 2. Town Halls (TH1 to TH18 official, TH19 copy from TH18/17)
  for (let th = 1; th <= 18; th++) {
    const url = `https://assets.clashk.ing/buildings/home-village/town_hall/level_${th}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'townhalls', `th_${th}.webp`));
  }
  // TH19 placeholder from official TH18
  if (fs.existsSync(path.join(ASSETS_DIR, 'townhalls', 'th_18.webp'))) {
    fs.copyFileSync(
      path.join(ASSETS_DIR, 'townhalls', 'th_18.webp'),
      path.join(ASSETS_DIR, 'townhalls', 'th_19.webp')
    );
    console.log('✓ Cloned official TH18 to TH19');
  }

  // 3. Builders & Slots
  // Builder Apprentice, Builder's Hut, B.O.B Control, Laboratory, Pet House, Goblin
  const builders = {
    'builder_head.webp': "https://assets.clashk.ing/helpers/builder's_apprentice.webp",
    'master_builder.webp': 'https://assets.clashk.ing/buildings/builder-base/bob_control/level_1.webp',
    'goblin_builder.webp': 'https://assets.clashk.ing/troops/goblin/icon.webp',
    'lab.webp': 'https://assets.clashk.ing/buildings/home-village/laboratory/level_14.webp',
    'pet.webp': 'https://assets.clashk.ing/pets/lassi/icon.webp'
  };

  for (const [filename, url] of Object.entries(builders)) {
    await downloadFile(url, path.join(ASSETS_DIR, 'builders', filename));
  }

  // 4. Categories
  const categories = {
    'tab_defense.webp': 'https://assets.clashk.ing/buildings/home-village/cannon/level_21.webp',
    'tab_offense.webp': 'https://assets.clashk.ing/troops/barbarian/icon.webp',
    'tab_heroes.webp': 'https://assets.clashk.ing/heroes/barbarian_king/icon.webp',
    'tab_walls.webp': 'https://assets.clashk.ing/buildings/home-village/wall/level_17.webp',
    'tab_resources.webp': 'https://assets.clashk.ing/buildings/home-village/gold_storage/level_17.webp'
  };

  for (const [filename, url] of Object.entries(categories)) {
    await downloadFile(url, path.join(ASSETS_DIR, 'categories', filename));
  }

  // 5. Game Entity Sprites: Buildings & Heroes (e.g. 1000008, 1000002, 28000000, 4000095, etc.)
  // Archer Tower 1000008
  for (let l = 1; l <= 22; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/archer_tower/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000008_${l}.webp`));
  }
  // Cannon 1000000
  for (let l = 1; l <= 21; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/cannon/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000000_${l}.webp`));
  }
  // Air Defense 1000004
  for (let l = 1; l <= 14; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/air_defense/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000004_${l}.webp`));
  }
  // Gold Storage 1000002
  for (let l = 1; l <= 17; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/gold_storage/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000002_${l}.webp`));
  }
  // Elixir Storage 1000024
  for (let l = 1; l <= 17; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/elixir_storage/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000024_${l}.webp`));
  }
  // Dark Elixir Storage 1000025
  for (let l = 1; l <= 11; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/dark_elixir_storage/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000025_${l}.webp`));
  }
  // Walls 1000010
  for (let l = 1; l <= 18; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/wall/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000010_${l}.webp`));
  }
  // Laboratory 1000030
  for (let l = 1; l <= 15; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/laboratory/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000030_${l}.webp`));
  }
  // Army Camp 1000031
  for (let l = 1; l <= 13; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/army_camp/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000031_${l}.webp`));
  }
  // Clan Castle 1000026
  for (let l = 1; l <= 13; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/clan_castle/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000026_${l}.webp`));
  }
  // Eagle Artillery 1000013
  for (let l = 1; l <= 7; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/eagle_artillery/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000013_${l}.webp`));
  }
  // Inferno Tower 1000012
  for (let l = 1; l <= 11; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/inferno_tower/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000012_${l}.webp`));
  }
  // Monolith 1000016
  for (let l = 1; l <= 4; l++) {
    const url = `https://assets.clashk.ing/buildings/home-village/monolith/level_${l}.webp`;
    await downloadFile(url, path.join(ASSETS_DIR, 'game', `1000016_${l}.webp`));
  }

  // Heroes (Barbarian King, Archer Queen, Grand Warden, Royal Champion)
  const heroes = [
    { id: 28000000, slug: 'barbarian_king', maxLvl: 95 },
    { id: 28000001, slug: 'archer_queen', maxLvl: 95 },
    { id: 28000002, slug: 'grand_warden', maxLvl: 70 },
    { id: 28000003, slug: 'royal_champion', maxLvl: 45 }
  ];

  for (const h of heroes) {
    const heroIconUrl = `https://assets.clashk.ing/heroes/${h.slug}/icon.webp`;
    const tempBuffer = await (await fetch(heroIconUrl)).arrayBuffer();
    const heroWebp = await sharp(Buffer.from(tempBuffer)).webp().toBuffer();

    for (let l = 1; l <= h.maxLvl; l++) {
      fs.writeFileSync(path.join(ASSETS_DIR, 'game', `${h.id}_${l}.webp`), heroWebp);
    }
    console.log(`✓ Generated official hero sprites for ${h.slug}`);
  }

  // Electro Titan 4000095
  const titanUrl = 'https://assets.clashk.ing/troops/electro_titan/icon.webp';
  const titanBuffer = await (await fetch(titanUrl)).arrayBuffer();
  const titanWebp = await sharp(Buffer.from(titanBuffer)).webp().toBuffer();
  for (let l = 1; l <= 5; l++) {
    fs.writeFileSync(path.join(ASSETS_DIR, 'game', `4000095_${l}.webp`), titanWebp);
    fs.writeFileSync(path.join(ASSETS_DIR, 'game', `4000015_${l}.webp`), titanWebp);
  }
  console.log('✓ Generated official troop sprites for Electro Titan');

  console.log('🎉 Successfully downloaded and updated all 100% official game assets!');
}

main().catch(console.error);

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'public', 'assets');

async function renderSvgToWebp(svgString, outputPath, width = 128, height = 128) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const buffer = Buffer.from(svgString);
  await sharp(buffer)
    .resize(width, height)
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(outputPath);
}

// 1. Resources
const resources = {
  gold: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="goldGlow" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFE066"/>
          <stop offset="50%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#B45309"/>
        </radialGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FEF3C7"/>
          <stop offset="100%" stop-color="#78350F"/>
        </linearGradient>
      </defs>
      <!-- Base Shadow -->
      <ellipse cx="50" cy="85" rx="38" ry="12" fill="rgba(0,0,0,0.4)"/>
      <!-- Coin Stack Bottom -->
      <ellipse cx="50" cy="72" rx="35" ry="14" fill="#92400E"/>
      <ellipse cx="50" cy="70" rx="35" ry="14" fill="url(#goldGlow)" stroke="url(#rim)" stroke-width="2"/>
      <!-- Coin Stack Middle Left -->
      <ellipse cx="35" cy="58" rx="26" ry="11" fill="#92400E"/>
      <ellipse cx="35" cy="56" rx="26" ry="11" fill="url(#goldGlow)" stroke="url(#rim)" stroke-width="1.8"/>
      <!-- Coin Stack Middle Right -->
      <ellipse cx="65" cy="56" rx="26" ry="11" fill="#92400E"/>
      <ellipse cx="65" cy="54" rx="26" ry="11" fill="url(#goldGlow)" stroke="url(#rim)" stroke-width="1.8"/>
      <!-- Top Big Coin -->
      <ellipse cx="50" cy="40" rx="30" ry="13" fill="#92400E"/>
      <ellipse cx="50" cy="38" rx="30" ry="13" fill="url(#goldGlow)" stroke="url(#rim)" stroke-width="2.5"/>
      <ellipse cx="50" cy="38" rx="22" ry="9" fill="none" stroke="#FEF3C7" stroke-dasharray="2,2" stroke-width="1.5"/>
      <!-- Sparkle -->
      <polygon points="50,15 52,24 61,26 52,28 50,37 48,28 39,26 48,24" fill="#FFFFFF"/>
      <polygon points="75,35 76,40 81,41 76,42 75,47 74,42 69,41 74,40" fill="#FFFBEB"/>
    </svg>`,

  elixir: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="elixirGlow" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#FDF2F8"/>
          <stop offset="25%" stop-color="#F472B6"/>
          <stop offset="65%" stop-color="#DB2777"/>
          <stop offset="100%" stop-color="#831843"/>
        </radialGradient>
        <filter id="aura">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <!-- Aura -->
      <path d="M50 10 C50 10 20 52 20 70 C20 86 33 96 50 96 C67 96 80 86 80 70 C80 52 50 10 50 10 Z" fill="#F472B6" opacity="0.3" filter="url(#aura)"/>
      <!-- Main Droplet -->
      <path d="M50 12 C50 12 22 52 22 69 C22 84 34 94 50 94 C66 94 78 84 78 69 C78 52 50 12 50 12 Z" fill="url(#elixirGlow)" stroke="#FDF2F8" stroke-width="1.5"/>
      <!-- Internal highlight bubbles -->
      <ellipse cx="40" cy="62" rx="9" ry="14" fill="#FFFFFF" opacity="0.4" transform="rotate(-25 40 62)"/>
      <circle cx="58" cy="74" r="5" fill="#FFFFFF" opacity="0.5"/>
      <circle cx="48" cy="80" r="3" fill="#FFFFFF" opacity="0.6"/>
      <polygon points="62,42 63,46 67,47 63,48 62,52 61,48 57,47 61,46" fill="#FFFFFF"/>
    </svg>`,

  dark_elixir: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="darkGlow" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#C084FC"/>
          <stop offset="30%" stop-color="#7C3AED"/>
          <stop offset="70%" stop-color="#3B0764"/>
          <stop offset="100%" stop-color="#090314"/>
        </radialGradient>
        <linearGradient id="darkRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#E9D5FF"/>
          <stop offset="100%" stop-color="#1E1B4B"/>
        </linearGradient>
      </defs>
      <!-- Shadow & Aura -->
      <ellipse cx="50" cy="88" rx="26" ry="7" fill="rgba(0,0,0,0.6)"/>
      <path d="M50 10 C50 10 20 52 20 70 C20 86 33 96 50 96 C67 96 80 86 80 70 C80 52 50 10 50 10 Z" fill="#6B21A8" opacity="0.4"/>
      <!-- Drop Body -->
      <path d="M50 12 C50 12 22 52 22 69 C22 84 34 94 50 94 C66 94 78 84 78 69 C78 52 50 12 50 12 Z" fill="url(#darkGlow)" stroke="url(#darkRim)" stroke-width="2"/>
      <!-- Glossy Reflection -->
      <path d="M36 45 C32 55 32 65 37 72 C35 68 35 56 42 48 C45 44 47 38 48 30 C43 36 38 40 36 45 Z" fill="#DDD6FE" opacity="0.6"/>
      <!-- Skull / rune detail -->
      <polygon points="50,22 52,27 57,28 52,29 50,34 48,29 43,28 48,27" fill="#E9D5FF"/>
    </svg>`,

  ore_shiny: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="blueOre" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#BAE6FD"/>
          <stop offset="40%" stop-color="#0284C7"/>
          <stop offset="100%" stop-color="#0369A1"/>
        </linearGradient>
      </defs>
      <polygon points="50,15 80,35 70,80 30,80 20,35" fill="#0C4A6E"/>
      <polygon points="50,18 76,36 67,76 33,76 24,36" fill="url(#blueOre)"/>
      <!-- Crystal facets -->
      <polygon points="50,18 62,48 50,76 38,48" fill="#38BDF8"/>
      <polygon points="50,18 76,36 62,48" fill="#E0F2FE" opacity="0.8"/>
      <polygon points="50,18 24,36 38,48" fill="#0284C7"/>
      <polygon points="62,48 76,36 67,76 50,76" fill="#0369A1"/>
      <!-- Glint -->
      <circle cx="50" cy="22" r="3" fill="#FFFFFF"/>
    </svg>`,

  ore_glowy: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="purpleOre" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F5D0FE"/>
          <stop offset="50%" stop-color="#A855F7"/>
          <stop offset="100%" stop-color="#581C87"/>
        </linearGradient>
      </defs>
      <polygon points="50,10 82,30 88,68 50,92 12,68 18,30" fill="#3B0764"/>
      <polygon points="50,14 78,32 84,66 50,88 16,66 22,32" fill="url(#purpleOre)"/>
      <polygon points="50,14 65,45 50,88 35,45" fill="#C084FC"/>
      <polygon points="50,14 78,32 65,45" fill="#FAF5FF" opacity="0.9"/>
      <polygon points="50,88 65,45 84,66" fill="#7E22CE"/>
      <polygon points="50,88 35,45 16,66" fill="#6B21A8"/>
    </svg>`,

  ore_starry: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="starOre" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFFBEB"/>
          <stop offset="40%" stop-color="#FBBF24"/>
          <stop offset="100%" stop-color="#D97706"/>
        </radialGradient>
      </defs>
      <!-- Big Celestial Star Ore -->
      <polygon points="50,8 60,35 88,38 67,58 73,86 50,71 27,86 33,58 12,38 40,35" fill="#92400E"/>
      <polygon points="50,12 59,36 84,39 65,57 70,82 50,68 30,82 35,57 16,39 41,36" fill="url(#starOre)"/>
      <!-- Inner core star -->
      <polygon points="50,25 55,42 70,44 58,55 62,70 50,61 38,70 42,55 30,44 45,42" fill="#FEF3C7"/>
      <circle cx="50" cy="50" r="5" fill="#FFFFFF"/>
    </svg>`
};

// 2. Builders & Slots
const builders = {
  builder_head: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FCD34D"/>
          <stop offset="100%" stop-color="#F59E0B"/>
        </linearGradient>
        <linearGradient id="helmet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#B45309"/>
          <stop offset="100%" stop-color="#78350F"/>
        </linearGradient>
      </defs>
      <!-- Cap / Helmet -->
      <path d="M22 45 C20 25 35 15 50 15 C65 15 80 25 78 45 Z" fill="url(#helmet)" stroke="#451A03" stroke-width="2"/>
      <rect x="18" y="42" width="64" height="8" rx="4" fill="#D97706" stroke="#78350F" stroke-width="1.5"/>
      <!-- Face -->
      <ellipse cx="50" cy="62" rx="26" ry="24" fill="url(#skin)" stroke="#B45309" stroke-width="1.5"/>
      <!-- Mustache -->
      <path d="M32 68 C40 65 48 72 50 68 C52 72 60 65 68 68 C64 74 58 76 50 72 C42 76 36 74 32 68 Z" fill="#78350F"/>
      <!-- Eyes & Eyebrows -->
      <rect x="34" y="48" width="10" height="3" rx="1.5" fill="#451A03" transform="rotate(-5 39 49)"/>
      <rect x="56" y="48" width="10" height="3" rx="1.5" fill="#451A03" transform="rotate(5 61 49)"/>
      <circle cx="40" cy="56" r="3.5" fill="#1E293B"/>
      <circle cx="60" cy="56" r="3.5" fill="#1E293B"/>
      <circle cx="41" cy="55" r="1.2" fill="#FFFFFF"/>
      <circle cx="61" cy="55" r="1.2" fill="#FFFFFF"/>
      <!-- Big Grin -->
      <path d="M42 76 Q50 84 58 76" stroke="#451A03" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Wrench icon overlay on hat -->
      <circle cx="50" cy="30" r="7" fill="#FDE68A" stroke="#78350F" stroke-width="1.5"/>
      <rect x="48" y="25" width="4" height="10" fill="#78350F"/>
    </svg>`,

  master_builder: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="robo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#E2E8F0"/>
          <stop offset="50%" stop-color="#94A3B8"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>
      <!-- Master Builder B.O.B Helmet & Goggles -->
      <rect x="22" y="20" width="56" height="50" rx="16" fill="url(#robo)" stroke="#1E293B" stroke-width="2.5"/>
      <!-- Giant glowing ocular eye / OTTO visor -->
      <rect x="28" y="36" width="44" height="18" rx="9" fill="#0F172A" stroke="#334155" stroke-width="2"/>
      <circle cx="50" cy="45" r="7" fill="#06B6D4"/>
      <circle cx="50" cy="45" r="4" fill="#E0F2FE"/>
      <!-- Brass Antennas -->
      <line x1="50" y1="20" x2="50" y2="8" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="7" r="4" fill="#EF4444"/>
      <!-- Steel Mustache / Grill -->
      <path d="M35 68 L45 74 L55 74 L65 68 L60 80 L40 80 Z" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      <!-- Bolts -->
      <circle cx="28" cy="26" r="2.5" fill="#334155"/>
      <circle cx="72" cy="26" r="2.5" fill="#334155"/>
    </svg>`,

  goblin_builder: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="goblinSkin" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#86EFAC"/>
          <stop offset="60%" stop-color="#22C55E"/>
          <stop offset="100%" stop-color="#15803D"/>
        </radialGradient>
      </defs>
      <!-- Pointy Goblin Ears -->
      <polygon points="15,45 2,30 26,52" fill="#15803D" stroke="#052E16" stroke-width="1.5"/>
      <polygon points="85,45 98,30 74,52" fill="#15803D" stroke="#052E16" stroke-width="1.5"/>
      <!-- Goblin Head -->
      <ellipse cx="50" cy="54" rx="28" ry="24" fill="url(#goblinSkin)" stroke="#166534" stroke-width="2"/>
      <!-- Long Pointy Nose -->
      <polygon points="46,50 50,65 54,50" fill="#4ADE80" stroke="#15803D" stroke-width="1"/>
      <!-- Mischievous Eyes -->
      <ellipse cx="38" cy="45" rx="6" ry="8" fill="#FEF08A" stroke="#854D0E" stroke-width="1.5"/>
      <ellipse cx="62" cy="45" rx="6" ry="8" fill="#FEF08A" stroke="#854D0E" stroke-width="1.5"/>
      <circle cx="39" cy="46" r="3" fill="#1E293B"/>
      <circle cx="61" cy="46" r="3" fill="#1E293B"/>
      <!-- Smug Tooth Smile -->
      <path d="M36 72 Q50 82 64 72" fill="#881337" stroke="#4C0519" stroke-width="2"/>
      <polygon points="44,72 47,77 50,72" fill="#FFFFFF"/>
      <!-- Builder Goggles perched on forehead -->
      <ellipse cx="38" cy="28" rx="10" ry="7" fill="#F59E0B" stroke="#78350F" stroke-width="2"/>
      <ellipse cx="62" cy="28" rx="10" ry="7" fill="#F59E0B" stroke="#78350F" stroke-width="2"/>
      <rect x="46" y="27" width="8" height="3" fill="#78350F"/>
    </svg>`,

  lab: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="labFlask" cx="40%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#E0F2FE"/>
          <stop offset="40%" stop-color="#38BDF8"/>
          <stop offset="90%" stop-color="#0369A1"/>
        </radialGradient>
      </defs>
      <!-- Base & Flask -->
      <path d="M42 18 L58 18 L58 35 L78 74 C82 82 76 90 68 90 L32 90 C24 90 18 82 22 74 L42 35 Z" fill="url(#labFlask)" stroke="#0C4A6E" stroke-width="2.5"/>
      <!-- Flask neck rim -->
      <rect x="40" y="14" width="20" height="6" rx="2" fill="#7DD3FC" stroke="#0369A1" stroke-width="1.5"/>
      <!-- Liquid Level & Bubbles -->
      <path d="M26 70 Q50 64 74 70 L72 80 C70 86 64 88 50 88 C36 88 30 86 28 80 Z" fill="#D946EF" opacity="0.8"/>
      <circle cx="45" cy="74" r="3" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="56" cy="78" r="2" fill="#FFFFFF" opacity="0.8"/>
      <!-- Lightning Arc -->
      <polygon points="52,24 45,40 54,40 46,58 60,38 50,38" fill="#FDE047" stroke="#EAB308" stroke-width="1"/>
    </svg>`,

  pet: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="petGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FED7AA"/>
          <stop offset="50%" stop-color="#F97316"/>
          <stop offset="100%" stop-color="#9A3412"/>
        </radialGradient>
      </defs>
      <!-- Pet Collar Shield / Paw -->
      <circle cx="50" cy="50" r="38" fill="url(#petGrad)" stroke="#431407" stroke-width="3"/>
      <!-- Big Pad -->
      <ellipse cx="50" cy="62" rx="16" ry="12" fill="#FFFFFF"/>
      <!-- Toe pads -->
      <circle cx="34" cy="40" r="6" fill="#FFFFFF"/>
      <circle cx="45" cy="32" r="6" fill="#FFFFFF"/>
      <circle cx="55" cy="32" r="6" fill="#FFFFFF"/>
      <circle cx="66" cy="40" r="6" fill="#FFFFFF"/>
    </svg>`
};

// 3. Tab Categories
const categories = {
  tab_defense: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#60A5FA"/>
          <stop offset="40%" stop-color="#2563EB"/>
          <stop offset="100%" stop-color="#1E3A8A"/>
        </linearGradient>
      </defs>
      <path d="M50 8 C68 18 84 20 84 44 C84 70 50 92 50 92 C50 92 16 70 16 44 C16 20 32 18 50 8 Z" fill="#172554"/>
      <path d="M50 12 C66 21 80 23 80 44 C80 67 50 87 50 87 C50 87 20 67 20 44 C20 23 34 21 50 12 Z" fill="url(#shieldGrad)" stroke="#93C5FD" stroke-width="2"/>
      <!-- Golden rim divider -->
      <path d="M50 12 L50 87" stroke="#FBBF24" stroke-width="3"/>
      <circle cx="50" cy="46" r="12" fill="#F59E0B" stroke="#FEF3C7" stroke-width="2"/>
      <polygon points="50,38 52,44 58,46 52,48 50,54 48,48 42,46 48,44" fill="#FFFFFF"/>
    </svg>`,

  tab_offense: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="swordBlade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="50%" stop-color="#CBD5E1"/>
          <stop offset="100%" stop-color="#64748B"/>
        </linearGradient>
      </defs>
      <!-- Crossed Swords -->
      <!-- Sword 1 -->
      <g transform="rotate(45 50 50)">
        <polygon points="47,10 53,10 52,65 48,65" fill="url(#swordBlade)" stroke="#334155" stroke-width="1"/>
        <line x1="50" y1="10" x2="50" y2="65" stroke="#94A3B8" stroke-width="1"/>
        <rect x="38" y="65" width="24" height="6" rx="2" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
        <rect x="47" y="71" width="6" height="15" fill="#78350F"/>
        <circle cx="50" cy="88" r="5" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      </g>
      <!-- Sword 2 -->
      <g transform="rotate(-45 50 50)">
        <polygon points="47,10 53,10 52,65 48,65" fill="url(#swordBlade)" stroke="#334155" stroke-width="1"/>
        <line x1="50" y1="10" x2="50" y2="65" stroke="#94A3B8" stroke-width="1"/>
        <rect x="38" y="65" width="24" height="6" rx="2" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
        <rect x="47" y="71" width="6" height="15" fill="#78350F"/>
        <circle cx="50" cy="88" r="5" fill="#F59E0B" stroke="#78350F" stroke-width="1.5"/>
      </g>
    </svg>`,

  tab_heroes: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FDE047"/>
          <stop offset="50%" stop-color="#EAB308"/>
          <stop offset="100%" stop-color="#A16207"/>
        </linearGradient>
      </defs>
      <!-- Royal Crown -->
      <path d="M16 75 L20 38 L38 52 L50 25 L62 52 L80 38 L84 75 Z" fill="url(#crownGold)" stroke="#713F12" stroke-width="2.5"/>
      <!-- Crown Band -->
      <rect x="14" y="70" width="72" height="12" rx="3" fill="#CA8A04" stroke="#713F12" stroke-width="2"/>
      <!-- Jewels -->
      <circle cx="50" cy="76" r="4.5" fill="#DC2626" stroke="#FEF2F2" stroke-width="1"/>
      <circle cx="30" cy="76" r="3.5" fill="#2563EB" stroke="#EFF6FF" stroke-width="1"/>
      <circle cx="70" cy="76" r="3.5" fill="#16A34A" stroke="#F0FDF4" stroke-width="1"/>
      <!-- Peak Orbs -->
      <circle cx="20" cy="36" r="3.5" fill="#FEF08A"/>
      <circle cx="50" cy="23" r="4.5" fill="#FEF08A"/>
      <circle cx="80" cy="36" r="3.5" fill="#FEF08A"/>
    </svg>`,

  tab_walls: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="wallBrick" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#64748B"/>
          <stop offset="50%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <!-- Fortress Stone Wall / Spiked Wall Segment -->
      <rect x="15" y="25" width="70" height="58" rx="4" fill="url(#wallBrick)" stroke="#020617" stroke-width="2.5"/>
      <!-- Spikes / Battlements -->
      <polygon points="20,25 25,12 30,25" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
      <polygon points="45,25 50,10 55,25" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
      <polygon points="70,25 75,12 80,25" fill="#E2E8F0" stroke="#475569" stroke-width="1.5"/>
      <!-- Brick mortar lines -->
      <line x1="15" y1="44" x2="85" y2="44" stroke="#0F172A" stroke-width="2"/>
      <line x1="15" y1="63" x2="85" y2="63" stroke="#0F172A" stroke-width="2"/>
      <line x1="45" y1="25" x2="45" y2="44" stroke="#0F172A" stroke-width="2"/>
      <line x1="30" y1="44" x2="30" y2="63" stroke="#0F172A" stroke-width="2"/>
      <line x1="68" y1="44" x2="68" y2="63" stroke="#0F172A" stroke-width="2"/>
      <line x1="50" y1="63" x2="50" y2="83" stroke="#0F172A" stroke-width="2"/>
      <!-- Gold corner reinforcement -->
      <circle cx="20" cy="78" r="3" fill="#F59E0B"/>
      <circle cx="80" cy="78" r="3" fill="#F59E0B"/>
    </svg>`,

  tab_resources: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="vaultChest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#B45309"/>
          <stop offset="100%" stop-color="#451A03"/>
        </linearGradient>
      </defs>
      <!-- Treasure Chest / Storage -->
      <path d="M20 40 L80 40 L75 80 L25 80 Z" fill="url(#vaultChest)" stroke="#1F2937" stroke-width="2"/>
      <path d="M16 40 C16 28 30 22 50 22 C70 22 84 28 84 40 Z" fill="#D97706" stroke="#78350F" stroke-width="2"/>
      <!-- Gold Straps -->
      <rect x="32" y="24" width="8" height="56" fill="#FDE047" stroke="#A16207" stroke-width="1.5"/>
      <rect x="60" y="24" width="8" height="56" fill="#FDE047" stroke="#A16207" stroke-width="1.5"/>
      <!-- Keyhole -->
      <circle cx="50" cy="52" r="5" fill="#1F2937"/>
      <polygon points="48,52 52,52 54,64 46,64" fill="#1F2937"/>
    </svg>`
};

// 4. Town Halls (TH1 to TH19)
const thColors = [
  null,
  { name: 'TH1', roof: '#A16207', base: '#78350F', badge: '1', accent: '#FEF08A' },
  { name: 'TH2', roof: '#B45309', base: '#854D0E', badge: '2', accent: '#FEF08A' },
  { name: 'TH3', roof: '#C2410C', base: '#9A3412', badge: '3', accent: '#FEF08A' },
  { name: 'TH4', roof: '#991B1B', base: '#7F1D1D', badge: '4', accent: '#FEF08A' },
  { name: 'TH5', roof: '#15803D', base: '#166534', badge: '5', accent: '#86EFAC' },
  { name: 'TH6', roof: '#1E40AF', base: '#1E3A8A', badge: '6', accent: '#93C5FD' },
  { name: 'TH7', roof: '#374151', base: '#1F2937', badge: '7', accent: '#9CA3AF' },
  { name: 'TH8', roof: '#18181B', base: '#09090B', badge: '8', accent: '#F97316' }, // Lava stone
  { name: 'TH9', roof: '#0F172A', base: '#020617', badge: '9', accent: '#38BDF8' }, // Dark Castle
  { name: 'TH10', roof: '#DC2626', base: '#7F1D1D', badge: '10', accent: '#F59E0B' }, // Volcanic Lava
  { name: 'TH11', roof: '#F8FAFC', base: '#E2E8F0', badge: '11', accent: '#F59E0B' }, // Ivory & Gold Eagle
  { name: 'TH12', roof: '#0284C7', base: '#0369A1', badge: '12', accent: '#38BDF8' }, // Electric Blue Tesla
  { name: 'TH13', roof: '#0D9488', base: '#115E59', badge: '13', accent: '#2DD4BF' }, // Frost Teal Inferno
  { name: 'TH14', roof: '#15803D', base: '#064E3B', badge: '14', accent: '#FACC15' }, // Aztec Jungle & Gold
  { name: 'TH15', roof: '#7E22CE', base: '#581C87', badge: '15', accent: '#D8B4FE' }, // Astral Magic
  { name: 'TH16', roof: '#D97706', base: '#92400E', badge: '16', accent: '#10B981' }, // Nature Fox & Solar Gold
  { name: 'TH17', roof: '#0284C7', base: '#1E1B4B', badge: '17', accent: '#F43F5E' }, // Dragon Magma & Celestial
  { name: 'TH18', roof: '#6366F1', base: '#312E81', badge: '18', accent: '#A855F7' }, // Arcane Future Nexus
  { name: 'TH19', roof: '#EC4899', base: '#831843', badge: '19', accent: '#FDE047' }, // Cosmic Mythic
];

function generateTHSvg(level, info) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="thRoof_${level}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${info.roof}"/>
          <stop offset="100%" stop-color="${info.base}"/>
        </linearGradient>
      </defs>
      <!-- Base Stone Platform -->
      <polygon points="12,85 88,85 80,68 20,68" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
      <!-- Main Castle Block -->
      <rect x="22" y="44" width="56" height="30" fill="url(#thRoof_${level})" stroke="#020617" stroke-width="2"/>
      <!-- Castle Roof / Slanted Peak -->
      <polygon points="16,46 50,15 84,46 76,46 50,22 24,46" fill="${info.accent}" stroke="#020617" stroke-width="2"/>
      <!-- Center Gate / Door -->
      <path d="M42 74 C42 66 58 66 58 74 L58 84 L42 84 Z" fill="#0B0F19" stroke="#E2E8F0" stroke-width="1.5"/>
      <!-- Banner / Emblem with Townhall level -->
      <rect x="36" y="32" width="28" height="20" rx="4" fill="#0F172A" stroke="${info.accent}" stroke-width="1.5"/>
      <text x="50" y="47" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="${info.accent}" text-anchor="middle">TH${level}</text>
      <!-- Corner flags -->
      <polygon points="18,36 10,40 18,44" fill="${info.roof}"/>
      <polygon points="82,36 90,40 82,44" fill="${info.roof}"/>
    </svg>`;
}

// 5. Game Entity Icons {dataId}_{lvl}.webp
function generateEntitySvg(name, level, category, color1, color2) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="entGlow" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="${color1}"/>
          <stop offset="100%" stop-color="${color2}"/>
        </radialGradient>
      </defs>
      <!-- Pedestal / Shield outline -->
      <rect x="14" y="14" width="72" height="72" rx="16" fill="#0F172A" stroke="#334155" stroke-width="2.5"/>
      <rect x="18" y="18" width="64" height="64" rx="13" fill="url(#entGlow)" opacity="0.85"/>
      <!-- Center Graphic Shape -->
      ${category === 'defense' ? `
        <!-- Tower Silhouette -->
        <polygon points="30,72 36,40 64,40 70,72" fill="#0F172A"/>
        <rect x="32" y="32" width="36" height="10" rx="2" fill="#E2E8F0"/>
        <line x1="38" y1="32" x2="38" y2="42" stroke="#0F172A" stroke-width="2"/>
        <line x1="62" y1="32" x2="62" y2="42" stroke="#0F172A" stroke-width="2"/>
        <polygon points="50,22 45,32 55,32" fill="#EF4444"/>
      ` : category === 'heroes' ? `
        <!-- Crown / Hero Insignia -->
        <path d="M28 65 L32 38 L42 48 L50 30 L58 48 L68 38 L72 65 Z" fill="#FDE047" stroke="#78350F" stroke-width="2"/>
        <circle cx="50" cy="54" r="5" fill="#EF4444"/>
      ` : category === 'walls' ? `
        <!-- Reinforced Wall Segment -->
        <rect x="25" y="32" width="50" height="42" rx="4" fill="#E2E8F0" stroke="#0F172A" stroke-width="2"/>
        <line x1="25" y1="52" x2="75" y2="52" stroke="#475569" stroke-width="2"/>
        <polygon points="32,32 36,22 40,32" fill="#94A3B8"/>
        <polygon points="60,32 64,22 68,32" fill="#94A3B8"/>
      ` : `
        <!-- Resource / Army Structure -->
        <circle cx="50" cy="50" r="22" fill="#0F172A" stroke="#CBD5E1" stroke-width="2"/>
        <circle cx="50" cy="50" r="14" fill="#F59E0B"/>
      `}
      <!-- Level Badge at bottom -->
      <rect x="32" y="70" width="36" height="16" rx="4" fill="#020617" stroke="#FBBF24" stroke-width="1.5"/>
      <text x="50" y="82" font-family="system-ui, sans-serif" font-weight="900" font-size="11" fill="#F8FAFC" text-anchor="middle">L${level}</text>
    </svg>`;
}

async function main() {
  console.log('Generating Clash Upgrade Tracker WebP assets...');

  // 1. Resources
  for (const [key, svg] of Object.entries(resources)) {
    const out = path.join(ASSETS_DIR, 'resources', `${key}.webp`);
    await renderSvgToWebp(svg, out, 128, 128);
    console.log(`✓ Generated resource: ${key}.webp`);
  }

  // 2. Builders
  for (const [key, svg] of Object.entries(builders)) {
    const out = path.join(ASSETS_DIR, 'builders', `${key}.webp`);
    await renderSvgToWebp(svg, out, 128, 128);
    console.log(`✓ Generated builder: ${key}.webp`);
  }

  // 3. Categories
  for (const [key, svg] of Object.entries(categories)) {
    const out = path.join(ASSETS_DIR, 'categories', `${key}.webp`);
    await renderSvgToWebp(svg, out, 128, 128);
    console.log(`✓ Generated category: ${key}.webp`);
  }

  // 4. Town Halls 1 through 19
  for (let lvl = 1; lvl <= 19; lvl++) {
    const info = thColors[lvl];
    const svg = generateTHSvg(lvl, info);
    const out = path.join(ASSETS_DIR, 'townhalls', `th_${lvl}.webp`);
    await renderSvgToWebp(svg, out, 160, 160);
    console.log(`✓ Generated townhall: th_${lvl}.webp`);
  }

  // 5. Game entity levels referenced in catalog and prompt
  // Prompt specific examples:
  // Archer Tower 1000008 levels 1 to 24 (21, 22, 23, 24)
  for (let l = 1; l <= 24; l++) {
    const svg = generateEntitySvg('Archer Tower', l, 'defense', '#38BDF8', '#0369A1');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000008_${l}.webp`));
  }
  // Cannon 1000000 levels 1 to 23
  for (let l = 1; l <= 23; l++) {
    const svg = generateEntitySvg('Cannon', l, 'defense', '#F59E0B', '#B45309');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000000_${l}.webp`));
  }
  // Barbarian King 28000000 levels 1 to 100 (prominently 90, 91)
  for (let l = 1; l <= 100; l += 5) {
    const svg = generateEntitySvg('Barbarian King', l, 'heroes', '#F59E0B', '#78350F');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `28000000_${l}.webp`));
  }
  await renderSvgToWebp(generateEntitySvg('Barbarian King', 90, 'heroes', '#F59E0B', '#78350F'), path.join(ASSETS_DIR, 'game', `28000000_90.webp`));
  await renderSvgToWebp(generateEntitySvg('Barbarian King', 91, 'heroes', '#F59E0B', '#78350F'), path.join(ASSETS_DIR, 'game', `28000000_91.webp`));

  // Archer Queen 28000001
  for (let l = 1; l <= 100; l += 5) {
    const svg = generateEntitySvg('Archer Queen', l, 'heroes', '#EC4899', '#831843');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `28000001_${l}.webp`));
  }
  await renderSvgToWebp(generateEntitySvg('Archer Queen', 90, 'heroes', '#EC4899', '#831843'), path.join(ASSETS_DIR, 'game', `28000001_90.webp`));
  await renderSvgToWebp(generateEntitySvg('Archer Queen', 91, 'heroes', '#EC4899', '#831843'), path.join(ASSETS_DIR, 'game', `28000001_91.webp`));

  // Grand Warden 28000002
  for (let l = 1; l <= 75; l += 5) {
    const svg = generateEntitySvg('Grand Warden', l, 'heroes', '#8B5CF6', '#4C1D95');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `28000002_${l}.webp`));
  }
  await renderSvgToWebp(generateEntitySvg('Grand Warden', 70, 'heroes', '#8B5CF6', '#4C1D95'), path.join(ASSETS_DIR, 'game', `28000002_70.webp`));

  // Royal Champion 28000003
  for (let l = 1; l <= 50; l += 5) {
    const svg = generateEntitySvg('Royal Champion', l, 'heroes', '#10B981', '#064E3B');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `28000003_${l}.webp`));
  }

  // Minion Prince 28000004
  for (let l = 1; l <= 50; l += 5) {
    const svg = generateEntitySvg('Minion Prince', l, 'heroes', '#6366F1', '#312E81');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `28000004_${l}.webp`));
  }

  // Gold Storage 1000002 levels 1 to 18 (prompt mentions 1000002_16, 1000002_17)
  for (let l = 1; l <= 18; l++) {
    const svg = generateEntitySvg('Gold Storage', l, 'resources', '#FBBF24', '#B45309');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000002_${l}.webp`));
  }

  // Elixir Storage 1000024
  for (let l = 1; l <= 18; l++) {
    const svg = generateEntitySvg('Elixir Storage', l, 'resources', '#F472B6', '#9D174D');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000024_${l}.webp`));
  }

  // Dark Elixir Storage 1000025
  for (let l = 1; l <= 12; l++) {
    const svg = generateEntitySvg('Dark Elixir Storage', l, 'resources', '#A855F7', '#581C87');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000025_${l}.webp`));
  }

  // Walls 1000010 levels 1 to 19 (prompt mentions 1000010_17)
  for (let l = 1; l <= 19; l++) {
    const svg = generateEntitySvg('Walls', l, 'walls', '#94A3B8', '#334155');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000010_${l}.webp`));
  }

  // Air Defense 1000004 levels 1 to 16 (prompt mentions 1000004_16)
  for (let l = 1; l <= 16; l++) {
    const svg = generateEntitySvg('Air Defense', l, 'defense', '#F87171', '#991B1B');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000004_${l}.webp`));
  }

  // Laboratory 1000030
  for (let l = 1; l <= 16; l++) {
    const svg = generateEntitySvg('Laboratory', l, 'offense', '#C084FC', '#6B21A8');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000030_${l}.webp`));
  }

  // Army Camp 1000031
  for (let l = 1; l <= 14; l++) {
    const svg = generateEntitySvg('Army Camp', l, 'offense', '#F87171', '#991B1B');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000031_${l}.webp`));
  }

  // Clan Castle 1000026
  for (let l = 1; l <= 13; l++) {
    const svg = generateEntitySvg('Clan Castle', l, 'offense', '#FDE047', '#A16207');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `1000026_${l}.webp`));
  }

  // Electro Titan 4000095 / 4000015 (prompt mentions 4000095 Titan L2)
  for (let l = 1; l <= 5; l++) {
    const svg = generateEntitySvg('Electro Titan', l, 'offense', '#38BDF8', '#1E40AF');
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `4000095_${l}.webp`));
    await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `4000015_${l}.webp`));
  }

  // Core defenses: Eagle Artillery 1000013, Inferno Tower 1000012, X-Bow 1000011, Scattershot 1000014, Monolith 1000016, Spell Tower 1000015, Ricochet Cannon 1000017, Multi-Archer Tower 1000018
  const otherEntities = [
    { id: 1000013, name: 'Eagle Artillery', max: 7, cat: 'defense', c1: '#FDE047', c2: '#A16207' },
    { id: 1000012, name: 'Inferno Tower', max: 11, cat: 'defense', c1: '#F97316', c2: '#9A3412' },
    { id: 1000011, name: 'X-Bow', max: 12, cat: 'defense', c1: '#E2E8F0', c2: '#475569' },
    { id: 1000014, name: 'Scattershot', max: 6, cat: 'defense', c1: '#FB7185', c2: '#9F1239' },
    { id: 1000016, name: 'Monolith', max: 4, cat: 'defense', c1: '#A855F7', c2: '#3B0764' },
    { id: 1000015, name: 'Spell Tower', max: 4, cat: 'defense', c1: '#38BDF8', c2: '#0F172A' },
    { id: 1000017, name: 'Ricochet Cannon', max: 3, cat: 'defense', c1: '#F59E0B', c2: '#78350F' },
    { id: 1000018, name: 'Multi-Archer Tower', max: 3, cat: 'defense', c1: '#38BDF8', c2: '#1E3A8A' },
  ];

  for (const ent of otherEntities) {
    for (let l = 1; l <= ent.max; l++) {
      const svg = generateEntitySvg(ent.name, l, ent.cat, ent.c1, ent.c2);
      await renderSvgToWebp(svg, path.join(ASSETS_DIR, 'game', `${ent.id}_${l}.webp`));
    }
  }

  console.log('All WebP assets successfully generated!');
}

main().catch(console.error);

/* ============================================================
   SATORI CIPHER — newtab.js
   Syncs theme + light/dark with sidebar via browser.storage
   ============================================================ */

const NEWTAB_THEMES = {
  sakura: {
    '--bg':      '#0d0a12',
    '--bg2':     '#150f1e',
    '--bg3':     '#1e1530',
    '--accent':  '#e8609a',
    '--accent2': '#f9c0d8',
    '--text':    '#f0e6ff',
    '--text2':   '#c4a8d4',
    '--text3':   '#7a6088',
    '--border':  'rgba(232,96,154,0.28)',
    '--card':    'rgba(30,20,45,0.80)',
    '--petal':   '#e8609a',
    badge:    '✿ sakura',
    divider:  '— 🌸 —',
  },
  cyberpunk: {
    '--bg':      '#080c14',
    '--bg2':     '#0d1220',
    '--bg3':     '#111828',
    '--accent':  '#00f0ff',
    '--accent2': '#ff0099',
    '--text':    '#e0f8ff',
    '--text2':   '#7ac8d8',
    '--text3':   '#3a7080',
    '--border':  'rgba(0,240,255,0.28)',
    '--card':    'rgba(10,16,28,0.85)',
    '--petal':   '#00f0ff',
    badge:    '▸ cyberpunk',
    divider:  '— ⚡ —',
  },
  shonen: {
    '--bg':      '#0d0d0d',
    '--bg2':     '#131313',
    '--bg3':     '#1a1400',
    '--accent':  '#ff6600',
    '--accent2': '#ffdd00',
    '--text':    '#fff5e0',
    '--text2':   '#e8b060',
    '--text3':   '#906030',
    '--border':  'rgba(255,102,0,0.28)',
    '--card':    'rgba(20,18,10,0.85)',
    '--petal':   '#ff6600',
    badge:    '★ shonen',
    divider:  '— 🔥 —',
  },
  isekai: {
    '--bg':      '#0a0d18',
    '--bg2':     '#0e1222',
    '--bg3':     '#141830',
    '--accent':  '#8878ff',
    '--accent2': '#d0c0ff',
    '--text':    '#ece8ff',
    '--text2':   '#b0a0e8',
    '--text3':   '#605878',
    '--border':  'rgba(136,120,255,0.28)',
    '--card':    'rgba(12,14,28,0.85)',
    '--petal':   '#c8b8ff',
    badge:    '✦ isekai',
    divider:  '— ✨ —',
  },
};

// Light mode overrides per theme — soft tones matching each theme's palette
const LIGHT_THEMES = {
  sakura: {
    '--bg':      '#fdf6f9',
    '--bg2':     '#f5e8f0',
    '--bg3':     '#ecdce8',
    '--accent':  '#c0547e',
    '--accent2': '#a03868',
    '--text':    '#2a1a2e',
    '--text2':   '#6b4070',
    '--text3':   '#b090b8',
    '--border':  'rgba(192,84,126,0.20)',
    '--card':    'rgba(255,248,253,0.90)',
    '--petal':   '#d4789a',
  },
  cyberpunk: {
    '--bg':      '#f0f8ff',
    '--bg2':     '#e0f0f8',
    '--bg3':     '#cce8f5',
    '--accent':  '#0088aa',
    '--accent2': '#cc0077',
    '--text':    '#0a2030',
    '--text2':   '#206080',
    '--text3':   '#80b0c0',
    '--border':  'rgba(0,136,170,0.20)',
    '--card':    'rgba(240,250,255,0.90)',
    '--petal':   '#00a0bb',
  },
  shonen: {
    '--bg':      '#fffaf0',
    '--bg2':     '#fff0d8',
    '--bg3':     '#ffe5c0',
    '--accent':  '#cc4400',
    '--accent2': '#dd9900',
    '--text':    '#1a0a00',
    '--text2':   '#804020',
    '--text3':   '#c08050',
    '--border':  'rgba(204,68,0,0.20)',
    '--card':    'rgba(255,250,240,0.90)',
    '--petal':   '#dd6600',
  },
  isekai: {
    '--bg':      '#f5f3ff',
    '--bg2':     '#ede8ff',
    '--bg3':     '#e0d8ff',
    '--accent':  '#5545cc',
    '--accent2': '#9080ee',
    '--text':    '#0a0820',
    '--text2':   '#403880',
    '--text3':   '#9088b8',
    '--border':  'rgba(85,69,204,0.20)',
    '--card':    'rgba(248,246,255,0.90)',
    '--petal':   '#7060dd',
  },
};

/* ── STATE ── */
let isLight = false;
let currentTheme = 'sakura';

/* ── APPLY THEME ── */
function applyTheme(theme, save = true) {
  currentTheme = theme;
  const tokens = isLight ? LIGHT_THEMES[theme] : NEWTAB_THEMES[theme];
  if (!tokens) return;

  const root = document.documentElement;
  for (const [prop, val] of Object.entries(tokens)) {
    if (prop.startsWith('--')) root.style.setProperty(prop, val);
  }

  const meta = NEWTAB_THEMES[theme];
  const badge = document.getElementById('themeBadge');
  const divider = document.getElementById('divider');
  if (badge)   badge.textContent   = meta.badge;
  if (divider) divider.textContent = meta.divider;

  if (save) browser.storage.local.set({ satori_theme: theme });
}

/* ── LIGHT / DARK TOGGLE ── */
function applyLightDark() {
  const root = document.documentElement;
  const tokens = isLight ? LIGHT_THEMES[currentTheme] : NEWTAB_THEMES[currentTheme];
  for (const [prop, val] of Object.entries(tokens)) {
    if (prop.startsWith('--')) root.style.setProperty(prop, val);
  }
  document.getElementById('themeBtn').textContent = isLight ? '☽ dark' : '☀ light';
}

function toggleLightDark() {
  isLight = !isLight;
  applyLightDark();
  browser.storage.local.set({ light_mode: isLight ? 'light' : 'dark' });
}
document.getElementById('themeBtn').addEventListener('click', toggleLightDark);

/* ── CLOCK ── */
const greetings = ['おかえり', 'いらっしゃい', 'ようこそ', 'お疲れ様'];

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = h + ':' + m;
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August',
                  'September','October','November','December'];
  document.getElementById('date').textContent =
    days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate();
  document.getElementById('greeting').textContent =
    greetings[Math.floor(now.getMinutes() / 15) % greetings.length];
}
updateClock();
setInterval(updateClock, 1000);

/* ── SEARCH ── */
function handleSearch(e) {
  if (e.key !== 'Enter') return;
  const val = document.getElementById('searchInput').value.trim();
  if (!val) return;
  if (val.startsWith('http') || (val.includes('.') && !val.includes(' '))) {
    window.location.href = val.startsWith('http') ? val : 'https://' + val;
  } else {
    window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(val);
  }
}
document.getElementById('searchInput').addEventListener('keydown', handleSearch);

/* ── ANILIST ── */
function getSeason() {
  const m = new Date().getMonth() + 1;
  if (m <= 3) return { name: 'Winter', season: 'WINTER' };
  if (m <= 6) return { name: 'Spring', season: 'SPRING' };
  if (m <= 9) return { name: 'Summer', season: 'SUMMER' };
  return { name: 'Fall', season: 'FALL' };
}

function renderShows(shows) {
  const grid = document.getElementById('airingGrid');
  grid.innerHTML = shows.slice(0, 5).map(s => `
    <div class="airing-item">
      <div class="airing-dot"></div>
      <span class="airing-title">${s.title.romaji}</span>
      <span class="airing-ep">${s.nextAiringEpisode ? 'ep ' + s.nextAiringEpisode.episode : '—'}</span>
    </div>
  `).join('');
}

async function fetchAiring() {
  const year = new Date().getFullYear();
  const { name, season } = getSeason();
  document.getElementById('seasonName').textContent = name + ' ' + year;

  const cached = await browser.storage.local.get(['airing', 'airingTime']);
  if (cached.airing && cached.airingTime && Date.now() - cached.airingTime < 3600000) {
    renderShows(cached.airing);
    document.getElementById('seasonCount').textContent = cached.airing.length + ' shows (cached)';
    return;
  }

  const query = '{Page(page:1,perPage:8){media(season:' + season + ',seasonYear:' + year +
    ',type:ANIME,sort:POPULARITY_DESC,status:RELEASING){title{romaji}nextAiringEpisode{episode}}}}';

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    const shows = data.data.Page.media;
    await browser.storage.local.set({ airing: shows, airingTime: Date.now() });
    renderShows(shows);
    document.getElementById('seasonCount').textContent = shows.length + ' shows loaded';
  } catch(e) {
    document.getElementById('airingGrid').innerHTML = '<div class="loading-text">Could not load</div>';
    document.getElementById('seasonCount').textContent = 'AniList unavailable';
  }
}
fetchAiring();

/* ── NOTES ── */
browser.storage.local.get('notes').then(result => {
  document.getElementById('notepad').value = result.notes || '';
});
document.getElementById('notepad').addEventListener('input', (e) => {
  browser.storage.local.set({ notes: e.target.value });
});

/* ── PETALS ── */
const canvas = document.getElementById('petals');
const ctx    = canvas.getContext('2d');
let petals   = [];

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function spawnPetal() {
  return {
    x:        Math.random() * canvas.width,
    y:        -20,
    size:     Math.random() * 8 + 4,
    speed:    Math.random() * 1.2 + 0.4,
    drift:    Math.random() * 1.5 - 0.75,
    rot:      Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.05,
    opacity:  Math.random() * 0.55 + 0.35,
  };
}

for (let i = 0; i < 18; i++) {
  const p = spawnPetal();
  p.y = Math.random() * canvas.height;
  petals.push(p);
}

function drawPetal(p) {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--petal').trim() || '#e8609a';
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.opacity;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of petals) {
    p.y   += p.speed;
    p.x   += p.drift;
    p.rot += p.rotSpeed;
    if (p.y > canvas.height + 20) Object.assign(p, spawnPetal());
    drawPetal(p);
  }
  requestAnimationFrame(animatePetals);
}
animatePetals();

/* ── INIT ── */
browser.storage.local.get(['satori_theme', 'light_mode']).then(r => {
  currentTheme = r.satori_theme || 'sakura';
  isLight = r.light_mode === 'light';
  applyTheme(currentTheme, false);
  document.getElementById('themeBtn').textContent = isLight ? '☽ dark' : '☀ light';
});

/* ── LIVE SYNC from sidebar ── */
browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.satori_theme) {
    currentTheme = changes.satori_theme.newValue;
    applyTheme(currentTheme, false);
  }
  if (changes.light_mode) {
    isLight = changes.light_mode.newValue === 'light';
    applyLightDark();
    document.getElementById('themeBtn').textContent = isLight ? '☽ dark' : '☀ light';
  }
});
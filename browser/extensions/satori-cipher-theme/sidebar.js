/* ============================================================
   SATORI CIPHER — sidebar.js
   ============================================================ */

const THEMES = ['sakura', 'cyberpunk', 'shonen', 'isekai'];

const SPEECH = {
  sakura:    ["どうぞ — what are we watching?", "春の風 — sakura mode.", "petal drop incoming…", "all is soft tonight."],
  cyberpunk: ["SYSTEM ONLINE. browsing initiated.", "jacking in.", "the net is dark and full of streams.", "neon dreams only."],
  shonen:    ["PLUS ULTRA, let's go!", "training arc never ends.", "believe it.", "gotta watch 'em all."],
  isekai:    ["ようこそ — another world awaits.", "reincarnated as a browser.", "the great saga continues.", "your stats have increased."],
};

const MOODS = {
  idle:    "idle · watching with you",
  loading: "fetching from AniList…",
  focus:   "focus mode · do not disturb",
};

/* ── STATE ── */
let currentTheme = 'sakura';
let isLight = false;
let mascotName = 'Companion';

/* ── INIT ── */
(async function init() {
  const stored = await browser.storage.local.get([
    'satori_theme', 'light_mode', 'mascotName', 'mascotImg', 'anilistToken'
  ]);

  // Set light state FIRST so applyTheme can read it
  if (stored.light_mode === 'light') {
    isLight = true;
    document.documentElement.classList.add('light-mode');
  }

  if (stored.satori_theme) applyTheme(stored.satori_theme, false);
  if (stored.mascotName) setMascotName(stored.mascotName);
  if (stored.mascotImg)  loadMascotImg(stored.mascotImg);

  // Sync light toggle button label
  updateLightBtn();

  loadAniList(stored.anilistToken || null);
  bindEvents();
  rotateSpeech();
})();

/* ── THEME ── */
function applyTheme(theme, save = true) {
  if (!THEMES.includes(theme)) return;

  THEMES.forEach(t => document.documentElement.classList.remove('theme-' + t));
  document.documentElement.classList.add('theme-' + theme);
  currentTheme = theme;

  // Re-apply light-mode class — switching themes strips nothing, but
  // be explicit so the correct light-mode CSS vars always win
  if (isLight) {
    document.documentElement.classList.add('light-mode');
  } else {
    document.documentElement.classList.remove('light-mode');
  }

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });

  setSpeech(randomFrom(SPEECH[theme]));

  if (save) browser.storage.local.set({ satori_theme: theme });
}

/* ── LIGHT MODE ── */
function applyLightMode(light, save = true) {
  isLight = light;
  if (light) {
    document.documentElement.classList.add('light-mode');
  } else {
    document.documentElement.classList.remove('light-mode');
  }
  updateLightBtn();
  if (save) browser.storage.local.set({ light_mode: light ? 'light' : 'dark' });
}

function updateLightBtn() {
  const btn = document.getElementById('lightToggleBtn');
  if (btn) btn.textContent = isLight ? '☽ dark' : '☀ light';
}

/* ── MASCOT ── */
function setMascotName(name) {
  mascotName = name;
  document.getElementById('mascotName').textContent = name;
}

function loadMascotImg(dataUrl) {
  const img = document.getElementById('mascotImg');
  const ph  = document.querySelector('.mascot-placeholder');
  img.src = dataUrl;
  img.style.display = 'block';
  ph.style.display  = 'none';
}

function setSpeech(text) {
  document.getElementById('speechText').textContent = text;
}

function setMood(key) {
  document.getElementById('mascotMood').textContent = MOODS[key] || MOODS.idle;
}

function rotateSpeech() {
  setInterval(() => {
    if (Math.random() > 0.6) setSpeech(randomFrom(SPEECH[currentTheme]));
  }, 25000);
}

/* ── ANILIST ── */
const ANILIST_URL = 'https://graphql.anilist.co';

const AIRING_QUERY = `
query ($season: MediaSeason, $year: Int) {
  Page(perPage: 20) {
    media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC, status: RELEASING) {
      title { romaji english }
      nextAiringEpisode { episode airingAt }
      episodes
    }
  }
}`;

function getCurrentSeason() {
  const m = new Date().getMonth();
  const seasons = ['WINTER','WINTER','SPRING','SPRING','SPRING','SUMMER','SUMMER','SUMMER','FALL','FALL','FALL','WINTER'];
  return { season: seasons[m], year: new Date().getFullYear() };
}

async function loadAniList(token) {
  const loading = document.getElementById('trackerLoading');
  const list    = document.getElementById('trackerList');
  const err     = document.getElementById('trackerError');
  const label   = document.getElementById('trackerSeason');

  loading.style.display = 'flex';
  list.style.display    = 'none';
  err.style.display     = 'none';
  setMood('loading');

  const { season, year } = getCurrentSeason();
  label.textContent = season.charAt(0) + season.slice(1).toLowerCase() + ' ' + year;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(ANILIST_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: AIRING_QUERY, variables: { season, year } }),
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const shows = data?.data?.Page?.media || [];

    renderTrackerList(shows);
    setMood('idle');
  } catch (e) {
    loading.style.display = 'none';
    err.style.display     = 'block';
    err.textContent       = token ? 'AniList error — try refresh' : 'connect AniList in settings';
    setMood('idle');
  }
}

function renderTrackerList(shows) {
  const loading = document.getElementById('trackerLoading');
  const list    = document.getElementById('trackerList');

  loading.style.display = 'none';
  list.innerHTML = '';
  list.style.display = 'flex';

  const now = Math.floor(Date.now() / 1000);

  shows.slice(0, 12).forEach(show => {
    const title     = show.title.english || show.title.romaji || '—';
    const next      = show.nextAiringEpisode;
    const epNum     = next ? 'ep ' + next.episode : (show.episodes ? show.episodes + ' eps' : '?');
    const airsIn    = next ? next.airingAt - now : null;
    const airingNow = airsIn !== null && airsIn < 7200 && airsIn > -600;

    const li = document.createElement('li');
    li.className = 'tracker-item';
    li.title = title;

    const dot = document.createElement('span');
    dot.className = 'tracker-dot' + (airingNow ? ' airing' : '');

    const titleEl = document.createElement('span');
    titleEl.className = 'tracker-title';
    titleEl.textContent = title;

    const epEl = document.createElement('span');
    epEl.className = 'tracker-ep';
    epEl.textContent = airingNow ? 'AIRING' : epNum;
    if (airingNow) epEl.style.color = 'var(--sc-teal)';

    li.append(dot, titleEl, epEl);
    list.appendChild(li);
  });

  if (shows.length === 0) {
    list.innerHTML = '<li style="font-size:12px; color:var(--sc-text-faint); padding:8px 6px; font-style:italic;">no results for this season</li>';
  }
}

/* ── BIND EVENTS ── */
function bindEvents() {
  // Theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
  });

  // Light/dark toggle
  document.getElementById('lightToggleBtn').addEventListener('click', () => {
    applyLightMode(!isLight);
  });

  // Mascot upload
  const uploadBtn    = document.getElementById('uploadBtn');
  const mascotUpload = document.getElementById('mascotUpload');
  const mascotAvatar = document.getElementById('mascotAvatar');

  uploadBtn.addEventListener('click',    () => mascotUpload.click());
  mascotAvatar.addEventListener('click', () => mascotUpload.click());

  mascotUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      loadMascotImg(ev.target.result);
      browser.storage.local.set({ mascotImg: ev.target.result });
    };
    reader.readAsDataURL(file);
  });

  // Refresh AniList
  document.getElementById('refreshBtn').addEventListener('click', async () => {
    const stored = await browser.storage.local.get('anilistToken');
    loadAniList(stored.anilistToken || null);
  });

  // Sync changes from newtab (theme switches or light toggle there)
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.light_mode) {
      const light = changes.light_mode.newValue === 'light';
      if (light !== isLight) applyLightMode(light, false);
    }
    if (changes.satori_theme) {
      applyTheme(changes.satori_theme.newValue, false);
    }
  });
}

/* ── UTILS ── */
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Leonida Field Manual — checklist, roadmap, spoiler setting, export/import.
// Plain ES module, no libraries, no network: it fetches only data/trophies.json.
const EARNED_KEY = 'gta6-trophy-guide-earned';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler';

const listEl = document.getElementById('trophyList');
const listMetaEl = document.getElementById('listMeta');
const detailEl = document.getElementById('detailPanel');
const progressCountEl = document.getElementById('progressCount');
const progressFillEl = document.getElementById('progressFill');
const progressDetailEl = document.getElementById('progressDetail');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kindFilter');
const gradeEl = document.getElementById('gradeFilter');
const earnedEl = document.getElementById('earnedFilter');
const missableEl = document.getElementById('missableOnly');
const spoilerEl = document.getElementById('spoilerToggle');

let doc = null;
let earned = new Set(loadStoredIds(EARNED_KEY));
let spoiler = localStorage.getItem(SPOILER_KEY) === '1';
let selectedId = null;
let view = 'checklist';

function loadStoredIds(key) {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}

function saveProgress() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function trophyById(id) {
  return doc.trophies.find((t) => t.id === id);
}

function isHiddenFromReader(t) {
  return spoiler && t.hidden && !earned.has(t.id);
}

function displayName(t) {
  return isHiddenFromReader(t) ? 'Hidden trophy' : t.name;
}

function displayDescription(t) {
  return isHiddenFromReader(t) ? 'Hidden until earned — turn spoilers off to see it.' : t.description;
}

function gradeLabel(t) {
  return t.grade;
}

function kindLabel(t) {
  return { story: 'Story', activity: 'Activity', collectible: 'Collectible', exploration: 'Exploration', combat: 'Combat & heist', money: 'Money', completion: 'Completion' }[t.kind] ?? t.kind;
}

function applyFilters(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (earnedEl.value === 'earned' && !earned.has(t.id)) return false;
  if (earnedEl.value === 'unearned' && earned.has(t.id)) return false;
  if (missableEl.checked && !t.missable) return false;
  return true;
}

function renderProgress() {
  const total = doc.trophies.length;
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of doc.trophies) {
    totals[t.grade] += 1;
    if (earned.has(t.id)) counts[t.grade] += 1;
  }
  progressCountEl.textContent = `${earned.size} of ${total} earned`;
  progressFillEl.style.width = `${Math.round((earned.size / total) * 100)}%`;
  progressDetailEl.textContent = `Platinum ${counts.platinum}/${totals.platinum} · Gold ${counts.gold}/${totals.gold} · Silver ${counts.silver}/${totals.silver} · Bronze ${counts.bronze}/${totals.bronze}`;
}

function renderChecklist() {
  const shown = doc.trophies.filter(applyFilters);
  listMetaEl.textContent = `${shown.length} of ${doc.trophies.length} trophies`;
  listEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy-card' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '') + (isHiddenFromReader(t) ? ' hidden-trophy' : '');
    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'trophy-check';
    check.textContent = earned.has(t.id) ? '✓' : '';
    check.setAttribute('aria-pressed', String(earned.has(t.id)));
    check.setAttribute('aria-label', `Mark ${displayName(t)} as earned`);
    check.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEarned(t.id);
    });
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = displayName(t);
    const badge = document.createElement('span');
    badge.className = `grade-badge grade-${t.grade}`;
    badge.textContent = gradeLabel(t);
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(t);
    li.append(check, name, badge, desc);
    if (t.missable && !isHiddenFromReader(t)) {
      const flag = document.createElement('span');
      flag.className = 'missable-flag';
      flag.textContent = 'Missable';
      li.append(flag);
    }
    if (t.hidden && !earned.has(t.id)) {
      const hidden = document.createElement('span');
      hidden.className = 'hidden-label';
      hidden.textContent = spoiler ? 'Hidden — spoiler setting on' : 'Hidden on PlayStation';
      li.append(hidden);
    }
    li.addEventListener('click', () => selectTrophy(t.id));
    listEl.append(li);
  }
}

function renderDetail() {
  detailEl.replaceChildren();
  const t = selectedId == null ? null : trophyById(selectedId);
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Select a trophy on the left to open its guide and sources.';
    detailEl.append(p);
    return;
  }
  const hidden = isHiddenFromReader(t);
  const h = document.createElement('h2');
  h.textContent = hidden ? 'Hidden trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = hidden ? 'Hidden until earned — turn spoilers off to see it.' : t.description;
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  const grade = document.createElement('span');
  grade.className = `grade-badge grade-${t.grade}`;
  grade.textContent = gradeLabel(t);
  meta.append(grade);
  const kind = document.createElement('span');
  kind.textContent = kindLabel(t);
  meta.append(kind);
  const stage = document.createElement('span');
  stage.textContent = `Roadmap stage ${t.stage}`;
  meta.append(stage);
  if (t.missable && !hidden) {
    const flag = document.createElement('span');
    flag.className = 'missable-flag';
    flag.textContent = 'Missable';
    meta.append(flag);
  }
  detailEl.append(h, desc, meta);
  if (hidden) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'This is a hidden story trophy. Earn it to reveal its guide, or turn the spoiler setting off.';
    detailEl.append(p);
  } else {
    const guide = document.createElement('div');
    guide.className = 'detail-guide';
    for (const para of t.guide.split(/(?<=[.!?])\s+/)) {
      const p = document.createElement('p');
      p.textContent = para;
      guide.append(p);
    }
    detailEl.append(guide);
    const sources = document.createElement('div');
    sources.className = 'detail-sources';
    const sh = document.createElement('h3');
    sh.textContent = 'Sources';
    sources.append(sh);
    const ul = document.createElement('ul');
    for (const s of t.sources) {
      const li = document.createElement('li');
      if (s.url) {
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        li.append(a);
      } else {
        li.textContent = s.name;
      }
      ul.append(li);
    }
    sources.append(ul);
    detailEl.append(sources);
  }
  const earnBtn = document.createElement('button');
  earnBtn.type = 'button';
  earnBtn.className = 'detail-earn';
  earnBtn.textContent = earned.has(t.id) ? 'Mark as unearned' : 'Mark as earned';
  earnBtn.addEventListener('click', () => toggleEarned(t.id));
  detailEl.append(earnBtn);
}

function renderRoadmap() {
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  for (const stage of doc.roadmap) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const h = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = `Stage ${stage.stage} of ${doc.roadmap.length}`;
    h.append(num, document.createTextNode(stage.title));
    const blurb = document.createElement('p');
    blurb.className = 'stage-blurb';
    blurb.textContent = stage.blurb;
    const ul = document.createElement('ul');
    ul.className = 'stage-trophies';
    for (const id of stage.trophies) {
      const t = trophyById(id);
      const item = document.createElement('li');
      const mark = document.createElement('span');
      mark.className = earned.has(id) ? 'done' : '';
      mark.textContent = earned.has(id) ? '✓' : '○';
      item.append(mark);
      const name = document.createElement('span');
      name.textContent = displayName(t);
      item.append(name);
      if (t.missable && !isHiddenFromReader(t)) {
        const flag = document.createElement('span');
        flag.className = 'flag';
        flag.textContent = 'Missable';
        item.append(flag);
      }
      item.addEventListener('click', () => {
        selectTrophy(id);
        showView('checklist');
      });
      item.style.cursor = 'pointer';
      ul.append(item);
    }
    li.append(h, blurb, ul);
    list.append(li);
  }
}

function renderAll() {
  renderProgress();
  renderChecklist();
  renderDetail();
  renderRoadmap();
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveProgress();
  renderAll();
}

function selectTrophy(id) {
  selectedId = id;
  renderChecklist();
  renderDetail();
}

function showView(next) {
  view = next;
  document.getElementById('viewChecklist').classList.toggle('active', view === 'checklist');
  document.getElementById('viewRoadmap').classList.toggle('active', view === 'roadmap');
  document.getElementById('checklistView').hidden = view !== 'checklist';
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
}

function exportProgress() {
  const blob = new Blob([JSON.stringify([...earned].sort((a, b) => a - b))], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const ids = JSON.parse(await file.text());
    if (!Array.isArray(ids)) return;
    const valid = new Set(doc.trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    saveProgress();
    renderAll();
  } catch {
    // A file that is not a progress list is ignored.
  }
}

function applyDeepLinks() {
  const params = new URLSearchParams(location.search);
  const earnedParam = params.get('earned');
  if (earnedParam) {
    const valid = new Set(doc.trophies.map((t) => t.id));
    for (const raw of earnedParam.split(',')) {
      const id = Number(raw);
      if (valid.has(id)) earned.add(id);
    }
    saveProgress();
  }
  if (params.get('spoiler') === 'on') spoiler = true;
  if (params.get('spoiler') === 'off') spoiler = false;
  if (params.get('kind')) kindEl.value = params.get('kind');
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('missable') === '1') missableEl.checked = true;
  if (params.get('q')) searchEl.value = params.get('q');
  const trophyParam = Number(params.get('trophy'));
  if (doc.trophies.some((t) => t.id === trophyParam)) selectedId = trophyParam;
  if (params.get('view') === 'roadmap') showView('roadmap');
}

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  doc = await response.json();
  applyDeepLinks();
  spoilerEl.checked = spoiler;
  if (selectedId == null) selectedId = doc.trophies[0].id;
  renderAll();
}

document.getElementById('viewChecklist').addEventListener('click', () => showView('checklist'));
document.getElementById('viewRoadmap').addEventListener('click', () => showView('roadmap'));
searchEl.addEventListener('input', renderChecklist);
kindEl.addEventListener('change', renderChecklist);
gradeEl.addEventListener('change', renderChecklist);
earnedEl.addEventListener('change', renderChecklist);
missableEl.addEventListener('change', renderChecklist);
spoilerEl.addEventListener('change', () => {
  spoiler = spoilerEl.checked;
  saveSpoiler();
  renderAll();
});
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});

loadTrophies();

import { TRIP, WD, DAYS, LISTS, LETTER_PRESETS } from "./data.js";
import { CURIOSITIES } from "./content/curiosities.js";
import { MEALS as MEALS_RAW } from "./content/restaurants.js";
import { ART, ICON } from "./art.js";
import { S, onChange, put, saveLetter, deleteLetter, refreshBodies, directorLogin, directorLogout, start, laEpoch } from "./store.js";
import { wheelHTML, spinWheel } from "./wheel.js";

/* ============ helpers ============ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const mapsQ = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const mapsDir = q => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(q);
const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fmt = m => String(Math.floor(m / 60) % 24).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const MON = "nov";
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

/* DOM reconciliation: patch the live tree toward freshly rendered HTML so that
   unchanged nodes survive (no replayed animations, scroll, focus or open state lost). */
const TRANSIENT = ["flash", "clapped", "armed", "just"];
const nkey = n => n.nodeType === 1 ? (n.id || n.getAttribute("data-key") || null) : null;
function syncAttrs(a, b) {
  for (const { name, value } of [...b.attributes]) {
    let v = value;
    if (name === "class") { const keep = TRANSIENT.filter(c => a.classList.contains(c) && !b.classList.contains(c)); if (keep.length) v = (value + " " + keep.join(" ")).trim(); }
    if (a.getAttribute(name) !== v) a.setAttribute(name, v);
  }
  for (const { name } of [...a.attributes]) if (!b.hasAttribute(name) && !(name === "open" && a.tagName === "DETAILS") && !(name === "class" && TRANSIENT.some(c => a.classList.contains(c)))) a.removeAttribute(name);
}
function patchNode(a, b) {
  if (a.nodeType !== 1) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  syncAttrs(a, b);
  if (a.hasAttribute("data-own")) return; // children managed elsewhere (clock, bulbs)
  morphKids(a, b);
}
function morphKids(from, to) {
  const keyed = new Map();
  for (const n of from.childNodes) { const k = nkey(n); if (k) keyed.set(k, n); }
  let cur = from.firstChild;
  for (const nt of [...to.childNodes]) {
    const k = nkey(nt);
    let m = null;
    if (k) { m = keyed.get(k) || null; if (m && m.nodeName !== nt.nodeName) m = null; if (m) keyed.delete(k); }
    else if (cur && !nkey(cur) && cur.nodeType === nt.nodeType && cur.nodeName === nt.nodeName) m = cur;
    if (m) { if (m === cur) cur = cur.nextSibling; else from.insertBefore(m, cur); patchNode(m, nt); }
    else from.insertBefore(nt, cur);
  }
  while (cur) { const nx = cur.nextSibling; from.removeChild(cur); cur = nx; }
}
function morph(el, html) { const t = document.createElement("template"); t.innerHTML = html; morphKids(el, t.content); }

const ui = { view: "hoje", day: null, open: new Set(), list: "prep", sim: null, flipped: new Set() };
const opened = new Set(lsGet("la26-opened", []));

const now = () => ui.sim ?? Date.now();
function laParts(ms) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(ms));
  const g = t => p.find(x => x.type === t).value;
  return { date: `${g("year")}-${g("month")}-${g("day")}`, mins: Number(g("hour")) * 60 + Number(g("minute")) };
}
const nowLA = () => laParts(now());
const dObj = date => { const [y, m, d] = date.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };
const wd = date => WD[dObj(date).getUTCDay()];
const dnum = date => Number(date.slice(8));
function phase() { const { date } = nowLA(); return date < TRIP.start ? "before" : date > TRIP.end ? "after" : "during"; }
const todayIdx = () => DAYS.findIndex(d => d.date === nowLA().date);
function dur(ms) {
  const m = Math.max(0, Math.round(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mi = m % 60;
  return d ? `${d}d ${h}h` : h ? `${h}h${String(mi).padStart(2, "0")}` : `${mi} min`;
}

// Meals with an entry in MEALS (src/content/restaurants.js, owned by the Restaurantes session):
// the recommended option drives the itinerary unless swaps/{itemId} = {choice: optionId}.
const MEALS = MEALS_RAW && typeof MEALS_RAW === "object" ? MEALS_RAW : {};
function meal(id) {
  const M = MEALS[id]; if (!M || !Array.isArray(M.options) || !M.options.length) return null;
  return { M, rec: M.options.find(o => o.id === M.recommended) || M.options[0] };
}
function effective(it) {
  const m = meal(it.id), c = S.swaps[it.id] && S.swaps[it.id].choice;
  if (m) {
    const ch = c && m.M.options.find(o => o.id === c);
    const legacy = !ch && c && it.alts && it.alts.find(x => x.id === c); // swap saved before the comparator existed
    if (legacy) return { ...it, title: legacy.title, note: legacy.note, q: legacy.q, extra: null, _alt: legacy, _rec: m.rec };
    const o = ch || m.rec, isRec = o.id === m.rec.id;
    return { ...it, title: o.name, short: o.name, note: o.why, q: o.q || o.address || o.name, extra: isRec ? it.extra : null, _meal: o, _alt: isRec ? null : o, _rec: m.rec };
  }
  const a = c && it.alts && it.alts.find(x => x.id === c);
  return a ? { ...it, title: a.title, note: a.note, q: a.q, extra: null, _alt: a } : it;
}
const late = n => !!(S.flags["late-d" + n] && S.flags["late-d" + n].on);
const done = key => !!(S.checks[key] && S.checks[key].done);
function span(day, i) {
  const it = day.items[i], s = toMin(it.t);
  let e = it.e ? toMin(it.e) : null;
  if (e == null) { const nx = day.items[i + 1]; e = nx ? toMin(nx.t) : s + 45; }
  return [s, Math.max(e, s + 15)];
}
function nowNext(day) {
  const { date, mins } = nowLA(); if (date !== day.date) return null;
  let cur = null, nxt = null;
  day.items.forEach((it, i) => {
    if (late(day.n) && !it.core) return;
    const [s, e] = span(day, i);
    if (s <= mins && mins < e) cur = { it: effective(it), s, e };
    if (s > mins && !nxt) nxt = { it: effective(it), s, e };
  });
  return { cur, nxt, mins };
}

/* letters */
function letters() {
  return Object.entries(S.letterMeta).map(([id, m]) => ({ id, ...m, ...(S.letterBody[id] || {}), hasBody: !!S.letterBody[id] })).sort((a, b) => a.at - b.at);
}
const unlocked = l => now() >= l.at;
const visibleLetters = () => letters().filter(l => S.director || unlocked(l) || l.teaser);

/* ============ shell ============ */
const main = $("#main");
const overlay = $("#overlay");

function shell() {
  const unseen = !S.director && letters().some(l => unlocked(l) && l.hasBody && !opened.has(l.id));
  $("#mailBtn").classList.toggle("has", unseen);
  const sd = $("#syncDot");
  sd.dataset.s = S.mode === "local" ? "local" : S.sync;
  sd.setAttribute("aria-label", { ok: "Sincronizado", syncing: "Sincronizando", offline: "Offline: as mudanças sobem quando a conexão voltar", local: "Modo local" }[sd.dataset.s]);
  $$("#tabs a").forEach(a => a.setAttribute("aria-current", a.dataset.v === ui.view ? "page" : "false"));
  $("#installBtn").hidden = !canInstall();
  document.body.classList.toggle("director", S.director);
}

/* ============ HOJE ============ */
function heroHTML(day) {
  const ph = phase();
  if (ph === "before") {
    return `<section class="hero marquee" id="hero">
      <div class="bulbs" aria-hidden="true" data-own="1"></div>
      <div class="beam" aria-hidden="true"></div>
      <p class="kicker">Uma produção de Pedro</p>
      <h1 class="title gold">Pedro <span class="amp">&amp;</span> Lorena</h1>
      <p class="sub">em Los Angeles</p>
      <div class="flipclock" id="clock" aria-label="Contagem para a estreia" data-own="1"></div>
      <button class="play" type="button" data-act="titles">${ICON.play}<span>Abertura</span></button>
    </section>`;
  }
  if (ph === "after") {
    return `<section class="hero marquee end" id="hero"><div class="bulbs" aria-hidden="true" data-own="1"></div>
      <h1 class="title gold">The End</h1><p class="sub">Pedro &amp; Lorena em Los Angeles</p>
      <button class="play" type="button" data-act="titles">${ICON.play}<span>Rever a abertura</span></button></section>`;
  }
  const nn = nowNext(day);
  if (!nn) return "";
  const { cur, nxt, mins } = nn;
  if (!cur && !nxt) return `<section class="hero nowcard"><div class="now-k">Fim do rolo ${day.n}</div><h2 class="gold now-t">Bom descanso</h2></section>`;
  const main = cur || nxt;
  const pct = cur ? Math.round((mins - cur.s) / (cur.e - cur.s) * 100) : 0;
  return `<section class="hero nowcard">
    <div class="now-k">${cur ? `<i class="rec"></i>Agora · ${fmt(mins)}` : `A seguir · em ${dur((nxt.s - mins) * 60000)}`}</div>
    <h2 class="gold now-t">${esc(main.it.title)}</h2>
    ${cur ? `<div class="now-bar"><i style="width:${pct}%"></i></div><div class="now-meta"><span>${fmt(cur.s)}</span><span>${fmt(cur.e)}</span></div>` : ""}
    ${main.it.q ? `<a class="go" href="${mapsDir(main.it.q)}" target="_blank" rel="noopener" aria-label="Rota até ${esc(main.it.title)}">${ICON.nav}</a>` : ""}
    ${cur && nxt ? `<button class="next" type="button" data-jump="${nxt.it.id}"><span>Depois, às ${fmt(nxt.s)}</span>${esc(nxt.it.title)}</button>` : ""}
  </section>`;
}

function ticketsHTML() {
  const ti = todayIdx();
  return `<nav class="tickets" aria-label="Dias">${DAYS.map((d, i) => `<a class="ticket" href="#dia-${d.n}" aria-current="${i === ui.day}" ${i === ti ? 'data-today="1"' : ""}><span class="tk-wd">${wd(d.date).slice(0, 3)}</span><span class="tk-d">${dnum(d.date)}</span></a>`).join("")}</nav>`;
}

function stripHTML(day) {
  const S0 = 5 * 60, E = 24 * 60, W = E - S0;
  const segs = day.items.map((raw, i) => {
    const [s, e] = span(day, i), cut = late(day.n) && !raw.core;
    return `<button type="button" class="seg ${raw.k} ${cut ? "cut" : ""} ${done("item-" + raw.id) ? "ok" : ""}" style="left:${(s - S0) / W * 100}%;width:${Math.max(.8, (Math.min(e, E) - s) / W * 100 - .4)}%" data-jump="${raw.id}" aria-label="${esc((raw.lbl || raw.t) + ", " + effective(raw).title)}"></button>`;
  }).join("");
  const n = nowLA();
  const ph = n.date === day.date && n.mins >= S0 ? `<i class="playhead" style="left:${(n.mins - S0) / W * 100}%"></i>` : "";
  return `<div class="strip"><div class="film">${segs}${ph}</div><div class="hours">${[6, 9, 12, 15, 18, 21].map(h => `<span style="left:${(h * 60 - S0) / W * 100}%">${h}h</span>`).join("")}</div></div>`;
}

function itemHTML(day, raw, i, idx) {
  const it = effective(raw), [s] = span(day, i);
  const key = "item-" + raw.id, ok = done(key), cut = late(day.n) && !raw.core;
  const nn = nowNext(day), isNow = nn && nn.cur && nn.cur.it.id === raw.id;
  const open = ui.open.has(raw.id);
  const time = raw.lbl ? `<span class="lbl">${esc(raw.lbl)}</span>` : `<span>${esc(raw.t)}</span>`;
  const curs = cursFor(raw.id);
  const swappable = raw.alts || meal(raw.id);
  const flags = (swappable ? `<i class="fl ${it._alt ? "on" : ""}">${ICON.swap}</i>` : "") + (curs.length ? `<i class="fl ${curs.every(c => S.scenes[c.id]) ? "on" : ""}">${ICON.clap}</i>` : "");
  let more = "";
  if (it.note) more += `<p class="note">${esc(it.note)}</p>`;
  if (it._meal) {
    if (it._meal.allergy) more += `<p class="allergy">${ICON.warn}<span>${esc(it._meal.allergy)}</span></p>`;
    if (it._meal.hours) more += `<p class="note sm">${esc(it._meal.hours)}</p>`;
  }
  if (it._alt) more += `<p class="was">Trocado. ${it._rec ? "Recomendado" : "Original"}: ${esc(it._rec ? it._rec.name : raw.title)} <button type="button" data-unswap="${raw.id}">desfazer</button></p>`;
  if (raw.list) {
    const L = LISTS.find(x => x.id === raw.list);
    const rows = ordered(L).filter(x => !raw.area || x.area === raw.area);
    more += `<ul class="mini">${rows.map(({ key: k, t }) => `<li class="${done(k) ? "ok" : ""}" data-key="m-${k}"><button type="button" class="cb" data-check="${k}" aria-pressed="${done(k)}">${ICON.check}</button><span>${esc(t)}</span></li>`).join("")}</ul>`;
  }
  let chips = "";
  if (it.q) chips += `<a class="chip" href="${mapsQ(it.q)}" target="_blank" rel="noopener">${ICON.pin}Maps</a>`;
  (it.extra || []).forEach(x => chips += `<a class="chip" href="${mapsQ(x.q)}" target="_blank" rel="noopener">${ICON.pin}${esc(x.l)}</a>`);
  if (swappable) chips += `<button type="button" class="chip gold" data-swap="${raw.id}">${ICON.swap}Trocar</button>`;
  curs.forEach(c => { chips += `<a class="chip film ${S.scenes[c.id] ? "on" : ""}" href="#cenas" data-scene-link="${c.id}">${ICON.clap}${esc(c.title)}</a>`; });
  if (chips) more += `<div class="chips">${chips}</div>`;
  return `<li class="it k-${raw.k} ${ok ? "ok" : ""} ${isNow ? "now" : ""} ${cut ? "cut" : ""} ${open ? "open" : ""}" id="it-${raw.id}" style="--i:${idx}">
    <span class="tm">${time}</span>
    <button type="button" class="node" data-done="${raw.id}" aria-pressed="${ok}" aria-label="${ok ? "Desmarcar" : "Marcar como feito"}"><span class="ico">${ICON[raw.k]}</span><span class="tick">${ICON.check}</span></button>
    <div class="body">
      <button type="button" class="head" data-toggle="${raw.id}" aria-expanded="${open}"><span class="ttl">${esc(it.title)}</span>${flags}</button>
      <div class="more"><div>${more}</div></div>
    </div>
    ${it.q ? `<a class="pin" href="${mapsDir(it.q)}" target="_blank" rel="noopener" aria-label="Rota até ${esc(it.title)}">${ICON.nav}</a>` : `<span></span>`}
  </li>`;
}

function letterItemHTML(l, idx) {
  const open = unlocked(l) && l.hasBody;
  const ttl = S.director ? (l.title || "Carta") : open ? (l.title || "Uma carta para você") : "Uma carta chega aqui";
  return `<li class="it k-letter ${open ? "" : "sealed"}" id="lt-${l.id}" style="--i:${idx}">
    <span class="tm"><span>${esc(l.time)}</span></span>
    <span class="node wax">L</span>
    <div class="body"><button type="button" class="head" ${open || S.director ? `data-letter="${l.id}"` : "disabled"}><span class="ttl">${esc(ttl)}</span>${S.director && !open ? `<i class="fl">${l.teaser ? "visível" : "secreta"}</i>` : ""}</button></div><span></span>
  </li>`;
}

function dayRoute(day) {
  const pts = [];
  day.items.forEach(raw => { const it = effective(raw); if (it.q && !(late(day.n) && !raw.core) && pts[pts.length - 1] !== it.q) pts.push(it.q); });
  if (pts.length < 2) return null;
  const wp = pts.slice(1, -1).slice(0, 8);
  return "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(pts[0]) + "&destination=" + encodeURIComponent(pts[pts.length - 1]) + (wp.length ? "&waypoints=" + encodeURIComponent(wp.join("|")) : "");
}

function renderHoje() {
  const ti = todayIdx();
  if (ui.day == null) ui.day = ti >= 0 ? ti : phase() === "after" ? 6 : 0;
  const day = DAYS[ui.day];
  const rows = day.items.map((raw, i) => ({ m: toMin(raw.t), h: idx => itemHTML(day, raw, i, idx) }));
  visibleLetters().filter(l => l.date === day.date).forEach(l => rows.push({ m: toMin(l.time) + .1, h: idx => letterItemHTML(l, idx) }));
  const n = nowLA();
  if (n.date === day.date) rows.push({ m: n.mins + .05, h: () => `<li class="nowmark" id="nowmark" aria-label="Agora"><span>${fmt(n.mins)}</span></li>` });
  rows.sort((a, b) => a.m - b.m);
  const route = dayRoute(day), lt = late(day.n);
  return `${heroHTML(day)}
    ${ticketsHTML()}
    <section class="day tint-${day.tint}">
      <header class="dayhead">
        <div class="dh-art">${ART[day.art]()}</div>
        <div class="dh-txt"><p class="kicker">Rolo ${day.n} · ${wd(day.date).slice(0, 3)} ${dnum(day.date)}</p><h2 class="gold">${esc(day.title)}</h2></div>
        <div class="dh-act">
          ${route ? `<a class="ibtn" href="${route}" target="_blank" rel="noopener" aria-label="Rota do dia no Maps" title="Rota do dia">${ICON.route}</a>` : ""}
          <button type="button" class="ibtn ${lt ? "warn" : ""}" data-late="${day.n}" aria-pressed="${lt}" aria-label="Estamos atrasados" title="Estamos atrasados">${ICON.late}</button>
        </div>
      </header>
      ${lt ? `<div class="planb">${ICON.late}<p>${esc(day.planb)}</p></div>` : ""}
      ${stripHTML(day)}
      <ol class="tl">${rows.map((r, i) => r.h(i)).join("")}</ol>
      <details class="notes" id="notes-${day.n}"><summary>Notas</summary><ul>${day.notes.concat(lt ? [] : ["Plano B: " + day.planb]).map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>
    </section>`;
}
function centerTicket() {
  const tk = $(".tickets"), act = tk && tk.querySelector('[aria-current="true"]');
  if (tk && act) tk.scrollLeft = act.offsetLeft - tk.clientWidth / 2 + act.clientWidth / 2;
}

/* marquee bulbs */
function bulbs() {
  const host = $("#hero .bulbs"); if (!host || host.children.length) return;
  const top = 16, side = 6; let h = "", k = 0;
  const add = (x, y) => { h += `<i style="left:${x}%;top:${y}%;--i:${k++}"></i>`; };
  for (let i = 0; i < top; i++) add(i / (top - 1) * 100, 0);
  for (let i = 1; i < side; i++) add(100, i / side * 100);
  for (let i = top - 1; i >= 0; i--) add(i / (top - 1) * 100, 100);
  for (let i = side - 1; i >= 1; i--) add(0, i / side * 100);
  host.innerHTML = h;
}

/* flip clock */
let clockVals = {};
function clock(fresh) {
  const el = $("#clock"); if (!el) return;
  const ms = Math.max(0, laEpoch(TRIP.start, "08:00") - now());
  const s = Math.floor(ms / 1000);
  const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  const L = { d: "dias", h: "horas", m: "min", s: "seg" };
  if (fresh || !el.children.length) {
    el.innerHTML = Object.keys(v).map(k => `<div class="fu"><div class="card" data-u="${k}"><b>${String(v[k]).padStart(2, "0")}</b></div><small>${L[k]}</small></div>`).join("");
    clockVals = v; return;
  }
  for (const k of Object.keys(v)) {
    if (v[k] === clockVals[k]) continue;
    const c = el.querySelector(`[data-u="${k}"]`); if (!c) continue;
    const nv = String(v[k]).padStart(2, "0"), ov = String(clockVals[k]).padStart(2, "0");
    c.innerHTML = `<b>${nv}</b><b class="out">${ov}</b><b class="in">${nv}</b>`;
  }
  clockVals = v;
}

/* ============ ROTEIRO ============ */
function renderRoteiro() {
  const ti = todayIdx(), feat = ti >= 0 ? ti : phase() === "after" ? -1 : 0;
  const { date } = nowLA();
  return `<header class="pagehead"><p class="kicker">Programação</p><h1 class="gold">Sete rolos</h1></header>
  <div class="posters">${DAYS.map((d, i) => `<a class="poster tint-${d.tint} ${i === feat ? "feat" : ""}" href="#dia-${d.n}" style="--i:${i}">
      <span class="p-top"><span>Rolo ${d.n}</span><span>${wd(d.date).slice(0, 3)} ${dnum(d.date)}</span></span>
      <span class="p-art">${ART[d.art]()}</span>
      <span class="p-title">${esc(d.title)}</span>
      ${i === ti ? `<span class="ribbon">Em cartaz</span>` : d.date < date ? `<span class="stamp">Exibido</span>` : ""}
    </a>`).join("")}</div>`;
}

/* ============ CENAS ============ */
function ring(p, label, sub) {
  const r = 34, c = 2 * Math.PI * r;
  return `<div class="ring"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="${r}" class="r-bg"/><circle cx="40" cy="40" r="${r}" class="r-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}"/>
</svg><div class="r-txt"><b>${label}</b><small>${sub}</small></div></div>`;
}
// Curiosities come from src/content/curiosities.js (owned by the Curiosidades session).
const CUR = Array.isArray(CURIOSITIES) ? CURIOSITIES.filter(c => c && c.id) : [];
const cursFor = itemId => CUR.filter(c => (c.itemIds || []).includes(itemId));
const TAGS = { "Filme": "filme", "Série": "serie", "História": "historia", "Bizarro": "bizarro", "Música": "musica" };
const itemPos = id => { for (const d of DAYS) { const i = d.items.findIndex(x => x.id === id); if (i >= 0) return i; } return 999; };
function sceneCard(c) {
  const ok = !!S.scenes[c.id], fl = ui.flipped.has(c.id), tg = TAGS[c.tag] || "outro";
  return `<div class="sc ${ok ? "ok" : ""} ${fl ? "flip" : ""}" id="sc-${c.id}">
    <div class="sc-in">
      <button type="button" class="sc-face front" data-flip="${c.id}" aria-label="${esc(c.title)}">
        <span class="sc-top"><span class="tag t-${tg}">${esc(c.tag || "Curiosidade")}</span><span class="clap">${ICON.clap}</span></span>
        ${c.gen ? `<span class="gen">${ICON.star}Nossa geração</span>` : ""}
        ${c.year ? `<span class="yr">${esc(c.year)}</span>` : ""}
        <span class="fm">${esc(c.title)}</span>
        ${ok ? `<span class="take">Take ok</span>` : ""}
      </button>
      <div class="sc-face back">
        <p>${esc(c.text)}</p>
        <div class="sc-b"><button type="button" class="btn ${ok ? "ghost" : ""}" data-scene="${c.id}">${ok ? "Desfazer" : "Gravar"}</button><button type="button" class="ibtn sm" data-flip="${c.id}" aria-label="Virar">${ICON.swap}</button></div>
      </div>
    </div></div>`;
}
function renderCenas() {
  const got = CUR.filter(c => S.scenes[c.id]).length, ti = todayIdx();
  const days = DAYS.map(d => {
    const list = CUR.filter(c => Number(c.day) === d.n);
    const places = [];
    for (const c of list) { let p = places.find(x => x.name === c.place); if (!p) places.push(p = { name: c.place || "Outros", pos: Math.min(...(c.itemIds || []).map(itemPos), 999), items: [] }); p.items.push(c); p.pos = Math.min(p.pos, ...(c.itemIds || []).map(itemPos)); }
    places.sort((a, b) => a.pos - b.pos);
    return { d, places, n: list.length, got: list.filter(c => S.scenes[c.id]).length };
  }).filter(x => x.n);
  return `<header class="pagehead"><p class="kicker">Locações</p><h1 class="gold">Cenas na lata</h1></header>
  <div class="sc-head">
    ${ring(CUR.length ? got / CUR.length : 0, `${got}/${CUR.length}`, "gravadas")}
    <nav class="sc-jump" aria-label="Dias">${days.map(x => `<a href="#cenas" data-jump-day="${x.d.n}" class="${DAYS.indexOf(x.d) === ti ? "today" : ""}"><b>${x.d.n}</b><small>${x.got}/${x.n}</small></a>`).join("")}</nav>
  </div>
  ${days.map(x => `<section class="sc-day" id="scd-${x.d.n}">
    <h2 class="sc-dh"><span class="kicker">Rolo ${x.d.n} · ${wd(x.d.date).slice(0, 3)} ${dnum(x.d.date)}</span><span class="gold">${esc(x.d.title)}</span></h2>
    ${x.places.map(p => `<div class="sc-place" data-key="scp-${x.d.n}-${esc(p.name)}"><h3>${ICON.pin}${esc(p.name)}</h3><div class="scenes">${p.items.map(sceneCard).join("")}</div></div>`).join("")}
  </section>`).join("")}
  ${CUR.length ? "" : `<div class="empty">${ICON.clap}<p>As curiosidades chegam em breve.</p></div>`}`;
}

/* ============ LISTAS ============ */
// Fixed list items in the order saved at flags/order-<list> ({ids: [...keys]}).
// Keys never change (l-<list>-<n>), so checks survive any reorder.
function ordered(L) {
  const base = L.items.map((t, i) => ({ key: `l-${L.id}-${i}`, t, area: L.areas ? L.areas[i] : null }));
  const o = S.flags["order-" + L.id];
  if (!o || !Array.isArray(o.ids)) return base;
  const by = new Map(base.map(x => [x.key, x])), out = [];
  for (const k of o.ids) if (by.has(k)) { out.push(by.get(k)); by.delete(k); }
  return out.concat([...by.values()]);
}
const customOrder = L => { const o = S.flags["order-" + L.id]; return !!(o && Array.isArray(o.ids) && ordered(L).some((x, i) => x.key !== `l-${L.id}-${i}`)); };
function saveOrder(L, keys) { put("flags", "order-" + L.id, keys.every((k, i) => k === `l-${L.id}-${i}`) ? null : { ids: keys }); }
function listItems(L) {
  const base = ordered(L);
  const extra = Object.entries(S.listitems).filter(([id, v]) => v.list === L.id && !id.startsWith("exp-")).sort((a, b) => (a[1].at || 0) - (b[1].at || 0)).map(([id, v]) => ({ key: "x-" + id, t: v.text, cid: id }));
  return base.concat(extra);
}
function renderListas() {
  const L = LISTS.find(x => x.id === ui.list) || LISTS[0];
  const all = listItems(L), got = all.filter(x => done(x.key)).length;
  return `<header class="pagehead"><p class="kicker">Produção</p><h1 class="gold">Listas</h1></header>
  <div class="seg-ctl" role="tablist">${LISTS.map(x => { const a = listItems(x); const g = a.filter(y => done(y.key)).length; return `<button type="button" role="tab" aria-selected="${x.id === L.id}" data-list="${x.id}">${esc(x.title)}<small>${g}/${a.length}</small></button>`; }).join("")}</div>
  <section class="checklist">
    <div class="cl-head">${ring(all.length ? got / all.length : 0, `${got}/${all.length}`, "feitos")}<h2 class="gold">${esc(L.title)}</h2></div>
    <ul class="${L.reorder ? "sortable" : ""}" data-sort="${L.reorder ? L.id : ""}">${all.map((x, i) => `<li class="${done(x.key) ? "ok" : ""}" data-key="${x.key}" style="--i:${i}"><button type="button" class="cb" data-check="${x.key}" aria-pressed="${done(x.key)}" aria-label="${esc(x.t)}">${ICON.check}</button><span class="cl-t">${esc(x.t)}${x.area ? `<small class="area">${esc(x.area)}</small>` : ""}</span>${x.cid ? `<button type="button" class="rm" data-rm="${x.cid}" aria-label="Remover">${ICON.x}</button>` : ""}${L.reorder ? `<span class="mv"><button type="button" class="mvb" data-mv="-1" aria-label="Subir ${esc(x.t)}" ${i === 0 ? "disabled" : ""}>${ICON.up}</button><button type="button" class="mvb dn" data-mv="1" aria-label="Descer ${esc(x.t)}" ${i === all.length - 1 ? "disabled" : ""}>${ICON.up}</button></span><span class="grip" aria-hidden="true">${ICON.grip}</span>` : ""}</li>`).join("")}</ul>
    ${L.reorder && customOrder(L) ? `<button type="button" class="linkbtn" data-reset-order="${L.id}">Voltar à ordem original</button>` : ""}
    ${L.add ? `<form class="addf" data-add="${L.id}"><input id="add-${L.id}" placeholder="Novo item" maxlength="100" autocomplete="off"><button type="submit" class="ibtn" aria-label="Adicionar">${ICON.plus}</button></form>` : ""}
  </section>`;
}

/* ============ CONTAS ============ */
// Expenses live in listitems/exp-<id> (no rule change). type "expense" | "settle".
// Balance per person = paid - share. Negative balance = next to pay.
const WHO = { pedro: "Pedro", lorena: "Lorena" };
const TO = { pedro: "ao Pedro", lorena: "à Lorena" };
const other = w => w === "pedro" ? "lorena" : "pedro";
const CATS = [["comida", "Comida", "meal"], ["compras", "Compras", "bag"], ["transporte", "Transporte", "move"], ["ingressos", "Ingressos", "visit"], ["hospedagem", "Hospedagem", "bed"], ["outros", "Outros", "dots"]];
const nf = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const usd = v => "US$ " + nf.format(Math.abs(v) < .005 ? 0 : v);
const cents = v => Math.round(Number(v) * 100);
function parseMoney(str) {
  let t = String(str || "").trim().replace(/[^\d.,]/g, "");
  if (!t) return NaN;
  const lc = t.lastIndexOf(","), ld = t.lastIndexOf(".");
  const dec = Math.max(lc, ld);
  // the last separator is decimal only when followed by 1 or 2 digits
  if (dec >= 0 && t.length - dec - 1 <= 2) t = t.slice(0, dec).replace(/[.,]/g, "") + "." + t.slice(dec + 1);
  else t = t.replace(/[.,]/g, "");
  return Math.round(Number(t) * 100); // cents
}
const moneyIn = c => c ? (c / 100).toFixed(2).replace(".", ",") : "";
function expenses() {
  return Object.entries(S.listitems).filter(([id, v]) => id.startsWith("exp-") && v && (v.type === "expense" || v.type === "settle"))
    .map(([id, v]) => ({ id, ...v })).sort((a, b) => b.date.localeCompare(a.date) || (b.at || 0) - (a.at || 0));
}
function balances(list) {
  const b = { pedro: 0, lorena: 0 }, paid = { pedro: 0, lorena: 0 };
  let spent = 0;
  for (const x of list) {
    const sh = x.shares || {};
    b[x.payer] += cents(x.total);
    b.pedro -= cents(sh.pedro || 0); b.lorena -= cents(sh.lorena || 0);
    if (x.type === "expense") { paid[x.payer] += cents(x.total); spent += cents(x.total); }
  }
  return { b, paid, spent };
}
function todayTrip() { const d = nowLA().date; return d < TRIP.start ? TRIP.start : d; }
const catOf = id => CATS.find(c => c[0] === id);

function renderContas() {
  const list = expenses(), { b, paid, spent } = balances(list);
  const debtor = b.pedro < 0 ? "pedro" : b.lorena < 0 ? "lorena" : null;
  const owe = debtor ? -b[debtor] / 100 : 0;
  const groups = [];
  for (const x of list) { let g = groups[groups.length - 1]; if (!g || g.date !== x.date) groups.push(g = { date: x.date, items: [] }); g.items.push(x); }
  const row = x => {
    const sh = x.shares || {}, half = cents(sh.pedro || 0) === cents(sh.lorena || 0);
    if (x.type === "settle") {
      const to = other(x.payer);
      return `<li class="ex settle" data-key="${x.id}"><button type="button" class="ex-b" data-exp="${x.id}"><span class="ex-i">${ICON.swap}</span>
        <span class="ex-t"><b>Acerto</b><small>${WHO[x.payer]} pagou ${TO[to]}</small></span><span class="ex-v">${usd(x.total)}</span></button></li>`;
    }
    const c = catOf(x.cat);
    const split = half ? "50/50" : `Pedro ${usd(sh.pedro || 0)}, Lorena ${usd(sh.lorena || 0)}`;
    return `<li class="ex" data-key="${x.id}"><button type="button" class="ex-b" data-exp="${x.id}"><span class="ex-i">${c ? ICON[c[2]] : ICON.coin}</span>
      <span class="ex-t"><b>${esc(x.desc || (c ? c[1] : "Gasto"))}</b><small>${WHO[x.payer]} pagou · ${split}</small></span><span class="ex-v">${usd(x.total)}</span></button></li>`;
  };
  return `<section class="hero marquee bill" id="hero">
      <div class="bulbs" aria-hidden="true" data-own="1"></div>
      ${debtor ? `<p class="kicker">Próximo a pagar</p><h1 class="title gold bill-n">${WHO[debtor]}</h1>
        <p class="sub bill-s">${WHO[debtor]} deve ${usd(owe)} ${TO[other(debtor)]}</p>`
      : `<p class="kicker">Contas</p><h1 class="title gold bill-n">Tudo certo</h1><p class="sub bill-s">${list.length ? "Ninguém deve nada" : "Nenhum gasto lançado"}</p>`}
    </section>
    <div class="bill-act">
      <button type="button" class="btn" data-act="exp-new">${ICON.plus}Lançar gasto</button>
      <button type="button" class="btn ghost" data-act="settle"${debtor ? "" : " disabled"}>${ICON.swap}Registrar acerto</button>
    </div>
    <div class="bill-sum">
      <div><small>Total</small><b>${usd(spent / 100)}</b></div>
      <div><small>Pedro pagou</small><b>${usd(paid.pedro / 100)}</b></div>
      <div><small>Lorena pagou</small><b>${usd(paid.lorena / 100)}</b></div>
    </div>
    ${groups.length ? groups.map(g => {
      const tot = g.items.filter(x => x.type === "expense").reduce((a, x) => a + cents(x.total), 0);
      return `<section class="ex-day" data-key="exd-${g.date}"><header><span>${wd(g.date)}, ${dnum(g.date)} ${MON}</span><span>${usd(tot / 100)}</span></header><ul>${g.items.map(row).join("")}</ul></section>`;
    }).join("") : `<div class="empty">${ICON.coin}<p>Os gastos lançados aparecem aqui, agrupados por dia.</p></div>`}`;
}

function expenseForm(x) {
  const e = x || { type: "expense", desc: "", total: 0, payer: "pedro", shares: null, date: todayTrip(), cat: "" };
  const tc = cents(e.total);
  const sh = e.shares || {};
  const custom = !!x && cents(sh.pedro || 0) !== cents(sh.lorena || 0);
  sheet(`<div class="grab"></div><h3 class="gold sh-t">${x ? "Editar gasto" : "Lançar gasto"}</h3>
    <form id="expF" class="form" data-id="${x ? x.id : ""}" novalidate>
      <label class="fld"><span>Descrição</span><input id="ex-desc" maxlength="60" value="${esc(e.desc)}" placeholder="Almoço no Citadel" autocomplete="off"></label>
      <div class="row2">
        <label class="fld"><span>Valor total (US$)</span><input id="ex-total" inputmode="decimal" value="${moneyIn(tc)}" placeholder="0,00" autocomplete="off"></label>
        <label class="fld"><span>Data</span><input id="ex-date" type="date" min="${TRIP.start}" max="2026-11-30" value="${e.date}" required></label>
      </div>
      <div class="fld"><span>Quem pagou</span><div class="pills" data-group="payer">${["pedro", "lorena"].map(w => `<button type="button" class="pill" data-pv="${w}" aria-pressed="${e.payer === w}">${WHO[w]}</button>`).join("")}</div></div>
      <div class="fld"><span>Categoria</span><div class="pills wrap" data-group="cat">${CATS.map(c => `<button type="button" class="pill" data-pv="${c[0]}" aria-pressed="${e.cat === c[0]}">${ICON[c[2]]}${c[1]}</button>`).join("")}</div></div>
      <div class="fld"><span>Divisão</span><div class="pills" data-group="split"><button type="button" class="pill" data-pv="half" aria-pressed="${!custom}">50/50</button><button type="button" class="pill" data-pv="custom" aria-pressed="${custom}">Divisão diferente</button></div></div>
      <div class="split" id="ex-split" ${custom ? "" : "hidden"}>
        <div class="pills sm" data-group="who">${["pedro", "lorena"].map(w => `<button type="button" class="pill" data-pv="${w}" aria-pressed="${w === "pedro"}">Parte de ${WHO[w]}</button>`).join("")}</div>
        <div class="split-row"><input id="ex-part" inputmode="decimal" value="${custom ? moneyIn(cents(sh.pedro || 0)) : ""}" placeholder="0,00" autocomplete="off" aria-label="Valor da parte"><p class="split-o" id="ex-other" aria-live="polite"></p></div>
      </div>
      <p class="err" id="ex-err" hidden></p>
      <button class="btn wide" type="submit">${x ? "Salvar" : "Lançar"}</button>
      ${x ? `<button type="button" class="btn ghost wide danger" id="ex-del">Excluir gasto</button>` : ""}
    </form>`, "tall");
  splitPreview();
}
function pillVal(g) { const b = overlay.querySelector(`[data-group="${g}"] [aria-pressed="true"]`); return b ? b.dataset.pv : ""; }
function splitPreview() {
  const o = $("#ex-other", overlay); if (!o) return;
  const tot = parseMoney($("#ex-total", overlay).value), part = parseMoney($("#ex-part", overlay).value), who = pillVal("who");
  if (!(tot > 0) || isNaN(part)) { o.textContent = `${WHO[other(who)]}: digite o total e a parte`; o.classList.remove("bad"); return; }
  const rest = tot - part;
  o.textContent = rest < 0 ? "A parte passa do total" : `${WHO[other(who)]} fica com ${usd(rest / 100)}`;
  o.classList.toggle("bad", rest < 0);
}
function saveExpense(f) {
  const err = m => { const el = $("#ex-err", overlay); el.hidden = false; el.textContent = m; };
  const tot = parseMoney($("#ex-total", overlay).value);
  if (!(tot > 0)) return err("Informe um valor maior que zero.");
  const date = $("#ex-date", overlay).value || todayTrip();
  if (date < TRIP.start) return err("A data começa em 12/11.");
  const payer = pillVal("payer") || "pedro";
  let shares;
  if (pillVal("split") === "custom") {
    const part = parseMoney($("#ex-part", overlay).value), who = pillVal("who");
    if (isNaN(part) || part < 0) return err("Informe o valor da parte.");
    if (part > tot) return err("A parte não pode passar do total.");
    shares = { [who]: part / 100, [other(who)]: (tot - part) / 100 };
  } else {
    // odd cent goes to whoever paid
    const lo = Math.floor(tot / 2);
    shares = { [other(payer)]: lo / 100, [payer]: (tot - lo) / 100 };
  }
  const id = f.dataset.id || "exp-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const prev = S.listitems[id];
  put("listitems", id, { type: "expense", desc: $("#ex-desc", overlay).value.trim(), total: tot / 100, payer, shares: { pedro: shares.pedro, lorena: shares.lorena }, date, cat: pillVal("cat"), at: prev && prev.at || Date.now() });
  closeSheet(); toast(f.dataset.id ? "Gasto atualizado" : `Lançado: ${usd(tot / 100)}`);
}
function settleForm(x) {
  const { b } = balances(expenses());
  const debtor = x ? x.payer : b.pedro < 0 ? "pedro" : "lorena";
  const amt = x ? cents(x.total) : -b[debtor];
  sheet(`<div class="grab"></div><h3 class="gold sh-t">${x ? "Editar acerto" : "Registrar acerto"}</h3>
    <form id="setF" class="form" data-id="${x ? x.id : ""}" novalidate>
      <div class="fld"><span>Quem transferiu</span><div class="pills" data-group="payer">${["pedro", "lorena"].map(w => `<button type="button" class="pill" data-pv="${w}" aria-pressed="${debtor === w}">${WHO[w]} pagou ${TO[other(w)]}</button>`).join("")}</div></div>
      <div class="row2">
        <label class="fld"><span>Valor (US$)</span><input id="st-total" inputmode="decimal" value="${moneyIn(Math.max(0, amt))}" autocomplete="off"></label>
        <label class="fld"><span>Data</span><input id="st-date" type="date" min="${TRIP.start}" max="2026-11-30" value="${x ? x.date : todayTrip()}"></label>
      </div>
      <p class="err" id="st-err" hidden></p>
      <button class="btn wide" type="submit">${x ? "Salvar" : "Registrar"}</button>
      ${x ? `<button type="button" class="btn ghost wide danger" id="ex-del">Excluir acerto</button>` : ""}
    </form>`);
}
function saveSettle(f) {
  const tot = parseMoney($("#st-total", overlay).value);
  if (!(tot > 0)) { const el = $("#st-err", overlay); el.hidden = false; el.textContent = "Informe um valor maior que zero."; return; }
  const payer = pillVal("payer") || "pedro";
  const id = f.dataset.id || "exp-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const prev = S.listitems[id];
  put("listitems", id, { type: "settle", desc: "Acerto", total: tot / 100, payer, shares: { [payer]: 0, [other(payer)]: tot / 100 }, date: $("#st-date", overlay).value || todayTrip(), cat: "", at: prev && prev.at || Date.now() });
  closeSheet(); toast("Acerto registrado");
}
overlay.addEventListener("click", e => {
  const p = e.target.closest(".pill"); if (!p) return;
  const g = p.parentElement, grp = g.dataset.group;
  const wasOn = p.getAttribute("aria-pressed") === "true";
  g.querySelectorAll(".pill").forEach(x => x.setAttribute("aria-pressed", "false"));
  if (!(grp === "cat" && wasOn)) p.setAttribute("aria-pressed", "true"); // category can be cleared
  if (grp === "split") { $("#ex-split", overlay).hidden = p.dataset.pv !== "custom"; if (p.dataset.pv === "custom") setTimeout(() => $("#ex-part", overlay).focus(), 50); }
  if (grp === "who" || grp === "split") splitPreview();
  const del = $("#ex-del", overlay); if (del && del.dataset.armed) { del.dataset.armed = ""; del.classList.remove("armed"); }
});
overlay.addEventListener("input", e => { overlay.querySelectorAll(".err").forEach(x => x.hidden = true); if (e.target.id === "ex-total" || e.target.id === "ex-part") splitPreview(); });
overlay.addEventListener("click", e => {
  const del = e.target.closest("#ex-del"); if (!del) return;
  const f = del.closest("form");
  if (del.dataset.armed !== "1") { del.dataset.armed = "1"; del.classList.add("armed"); del.textContent = "Toque de novo para excluir"; return; }
  put("listitems", f.dataset.id, null); closeSheet(); toast("Excluído");
});

/* ============ render loop ============ */
// fresh: navigation (new view, day or list). Rebuilds the page and plays the entrance.
// Otherwise the page is patched in place, and only when the markup actually changed.
let lastHTML = "", enterT = 0;
function viewHTML() {
  if (ui.view === "roteiro") return renderRoteiro();
  if (ui.view === "cenas") return renderCenas();
  if (ui.view === "listas") return renderListas();
  if (ui.view === "contas") return renderContas();
  return renderHoje();
}
function render(fresh, vt = fresh) {
  const run = () => {
    shell();
    const html = viewHTML();
    if (fresh) {
      main.innerHTML = html;
      main.dataset.view = ui.view;
      clearTimeout(enterT);
      main.classList.remove("enter"); void main.offsetWidth; main.classList.add("enter");
      enterT = setTimeout(() => main.classList.remove("enter"), 2600);
      if (ui.view === "hoje") centerTicket();
    } else if (html !== lastHTML) {
      morph(main, html);
    }
    lastHTML = html;
    bulbs();
    clock(false);
  };
  if (fresh && vt && document.startViewTransition && !reduce() && document.visibilityState === "visible") {
    const tr = document.startViewTransition(run);
    tr.ready.catch(() => { }); tr.finished.catch(() => { });
  } else run();
}
let pend = 0;
function soft() { cancelAnimationFrame(pend); pend = requestAnimationFrame(() => { if (drag) { drag.pending = true; return; } render(false); }); }
onChange(() => { soft(); toastLetters(); });

function route() {
  const h = location.hash.slice(1), m = h.match(/^dia-(\d)$/);
  const prev = ui.view + ui.day;
  if (m) { ui.view = "hoje"; ui.day = Math.min(6, Math.max(0, Number(m[1]) - 1)); }
  else if (["roteiro", "cenas", "listas", "contas", "hoje"].includes(h)) ui.view = h;
  else ui.view = "hoje";
  const changed = prev !== ui.view + ui.day;
  const first = !main.firstChild;
  render(changed || first, changed && !first);
  if (changed) window.scrollTo(0, m ? Math.max(0, ($(".tickets") || main).offsetTop - 70) : 0);
}
window.addEventListener("hashchange", route);

/* ============ drag to reorder (pointer events) ============ */
let drag = null;
document.addEventListener("pointerdown", e => {
  const g = e.target.closest(".grip"); if (!g || drag) return;
  const li = g.closest("li"), ul = li.parentElement, items = [...ul.children];
  if (items.length < 2) return;
  e.preventDefault();
  const rects = items.map(x => x.getBoundingClientRect()), from = items.indexOf(li);
  drag = { li, ul, items, from, to: from, y0: e.clientY, s0: window.scrollY, y: e.clientY, h: rects[from].height, mids: rects.map(r => r.top + window.scrollY + r.height / 2), pending: false };
  try { g.setPointerCapture(e.pointerId); } catch (err) { }
  ul.classList.add("sorting"); li.classList.add("dragging");
  if (navigator.vibrate) try { navigator.vibrate(10); } catch (err) { }
  requestAnimationFrame(autoScroll);
});
function dragUpdate() {
  const { li, items, from, mids, h } = drag;
  const dy = drag.y - drag.y0 + (window.scrollY - drag.s0);
  li.style.transform = `translateY(${dy}px)`;
  const c = mids[from] + dy;
  let to = from;
  items.forEach((x, i) => { if (i < from && c < mids[i]) to = Math.min(to, i); if (i > from && c > mids[i]) to = Math.max(to, i); });
  drag.to = to;
  items.forEach((x, i) => {
    if (i === from) return;
    const sh = from < to && i > from && i <= to ? -h : to < from && i >= to && i < from ? h : 0;
    x.style.transform = sh ? `translateY(${sh}px)` : "";
  });
}
function autoScroll() {
  if (!drag) return;
  const top = 96, bot = window.innerHeight - 130, y = drag.y;
  const v = y < top ? -Math.min(16, (top - y) / 4) : y > bot ? Math.min(16, (y - bot) / 4) : 0;
  if (v) { window.scrollBy(0, v); dragUpdate(); }
  requestAnimationFrame(autoScroll);
}
document.addEventListener("pointermove", e => { if (!drag) return; drag.y = e.clientY; dragUpdate(); });
function dragEnd(cancel) {
  if (!drag) return;
  const { li, ul, items, from, to } = drag;
  ul.classList.remove("sorting");
  items.forEach(x => x.style.transform = "");
  li.classList.remove("dragging");
  const pending = drag.pending; drag = null;
  if (!cancel && to !== from) {
    const ref = to > from ? items[to].nextSibling : items[to];
    ul.insertBefore(li, ref); // move now so nothing jumps back while the write lands
    const L = LISTS.find(x => x.id === ul.dataset.sort);
    saveOrder(L, [...ul.children].map(x => x.dataset.key));
  } else if (pending) soft();
}
document.addEventListener("pointerup", () => dragEnd(false));
document.addEventListener("pointercancel", () => dragEnd(true));

/* ============ overlays ============ */
function sheet(html, cls = "") {
  overlay.innerHTML = `<div class="scrim" data-close></div><div class="sheet ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.classList.add("locked");
  requestAnimationFrame(() => overlay.classList.add("show"));
  const f = overlay.querySelector("input,textarea,button:not([data-close])"); if (f && !("ontouchstart" in window)) f.focus();
}
function closeSheet() {
  overlay.classList.remove("show"); document.body.classList.remove("locked");
  setTimeout(() => { if (!overlay.classList.contains("show")) overlay.innerHTML = ""; }, 260);
}
overlay.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeSheet(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && overlay.innerHTML) closeSheet(); });

function findItem(id) { for (const d of DAYS) for (const it of d.items) if (it.id === id) return it; return null; }

/* restaurant comparator */
const SORTS = [
  ["rec", "Recomendado"], ["near", "Mais perto"], ["cheap", "Mais barato"], ["health", "Mais saudável"], ["rating", "Melhor avaliado"], ["amb", "Melhor ambiente"]
];
const num = v => typeof v === "number" && isFinite(v) ? v : null;
function sortOpts(m, key) {
  const idx = new Map(m.M.options.map((o, i) => [o.id, i]));
  const by = (f, dir = 1) => (a, b) => { const x = f(a), y = f(b); if (x == null && y == null) return idx.get(a.id) - idx.get(b.id); if (x == null) return 1; if (y == null) return -1; return (x - y) * dir || idx.get(a.id) - idx.get(b.id); };
  const list = m.M.options.slice();
  if (key === "near") return list.sort(by(o => num(o.minutes)));
  if (key === "cheap") return list.sort(by(o => num(o.price)));
  if (key === "health") return list.sort(by(o => num(o.health), -1));
  if (key === "rating") return list.sort((a, b) => by(o => num(o.rating), -1)(a, b) || (num(b.reviews) || 0) - (num(a.reviews) || 0));
  if (key === "amb") return list.sort(by(o => num(o.ambiance), -1));
  return list.sort((a, b) => (b.id === m.rec.id) - (a.id === m.rec.id) || idx.get(a.id) - idx.get(b.id));
}
function starsHTML(r) {
  const w = Math.max(0, Math.min(5, r)) / 5 * 100;
  return `<span class="stars" aria-hidden="true"><span>★★★★★</span><span style="width:${w.toFixed(0)}%">★★★★★</span></span>`;
}
const kfmt = n => n >= 1000 ? (n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil" : String(n);
function dots(v, icon, label) { const n = num(v) || 0; return `<span class="lvl" aria-label="${label}: ${n} de 3" title="${label}">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}">${icon}</i>`).join("")}</span>`; }
function compareHTML(id, key) {
  const m = meal(id), raw = findItem(id);
  const c = S.swaps[id] && S.swaps[id].choice;
  const cur = (c && m.M.options.find(o => o.id === c)) ? c : m.rec.id;
  const hi = { near: "near", cheap: "price", health: "health", rating: "rating", amb: "amb" }[key] || "";
  const card = (o, i) => {
    const on = o.id === cur, r = num(o.rating), p = num(o.price) || 0, mi = num(o.minutes);
    return `<article class="rc ${on ? "on" : ""}" data-key="rc-${esc(o.id)}" style="--i:${i}">
      <header class="rc-h"><div class="rc-n"><b>${esc(o.name)}</b>${o.cuisine ? `<small>${esc(o.cuisine)}</small>` : ""}</div>
        ${o.id === m.rec.id ? `<span class="o-tag">Recomendado</span>` : ""}</header>
      <div class="rc-m">
        <span class="rc-r ${hi === "rating" ? "hi" : ""}">${r != null ? `${starsHTML(r)}<b>${r.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</b>` : `<span class="muted">Sem nota</span>`}${num(o.reviews) ? `<small>${kfmt(o.reviews)} avaliações</small>` : ""}${o.ratingSource ? `<small>${esc(o.ratingSource)}</small>` : ""}</span>
      </div>
      <div class="rc-g">
        <span class="${hi === "price" ? "hi" : ""}" title="Preço"><span class="price" aria-label="Preço ${p} de 4">${[1, 2, 3, 4].map(i => `<i class="${i <= p ? "on" : ""}">$</i>`).join("")}</span></span>
        <span class="${hi === "health" ? "hi" : ""}">${dots(o.health, ICON.leaf, "Saudável")}</span>
        <span class="${hi === "amb" ? "hi" : ""}">${dots(o.ambiance, ICON.spark, "Ambiente")}</span>
        <span class="rc-d ${hi === "near" ? "hi" : ""}">${o.mode === "a pé" ? ICON.walk : ICON.move}${mi != null ? `${mi} min` : ""}</span>
      </div>
      ${o.why ? `<p class="rc-w">${esc(o.why)}</p>` : ""}
      ${o.allergy ? `<p class="allergy">${ICON.warn}<span>${esc(o.allergy)}</span></p>` : ""}
      ${o.hours ? `<p class="rc-hr">${esc(o.hours)}</p>` : ""}
      <div class="rc-b">
        ${on ? `<span class="rc-on">${ICON.check}Em cartaz</span>` : `<button type="button" class="btn sm" data-pick-meal="${esc(o.id)}">Escolher</button>`}
        <a class="chip" href="${mapsQ(o.q || o.address || o.name)}" target="_blank" rel="noopener">${ICON.pin}Maps</a>
        <a class="chip" href="${mapsDir(o.q || o.address || o.name)}" target="_blank" rel="noopener">${ICON.nav}Rota</a>
      </div>
    </article>`;
  };
  return `<div class="cmp-top"><div class="grab"></div>
      <p class="kicker">${esc(raw ? effective(raw).t || raw.t : "")} · Rolo ${DAYS.find(d => d.items.includes(raw)).n}</p>
      <h3 class="gold sh-t cmp-t">${esc(m.M.label || "Trocar")}</h3>
      ${m.M.from ? `<p class="cmp-f">${ICON.pin}Distância a partir de ${esc(m.M.from)}</p>` : ""}
      <div class="sorts" role="tablist">${SORTS.map(([k, l]) => `<button type="button" role="tab" class="pill" data-sort-meal="${k}" aria-selected="${k === key}" aria-pressed="${k === key}">${l}</button>`).join("")}</div>
    </div>
    <div class="rcs">${sortOpts(m, key).map(card).join("")}</div>
    <button type="button" class="btn wide" id="toWheel">${ICON.dice}Deixar a roleta decidir</button>`;
}
function openCompare(id) {
  const m = meal(id); ui.mealSort = ui.mealSort || "rec";
  sheet(compareHTML(id, ui.mealSort), "tall cmp");
  const sh = overlay.querySelector(".sheet");
  sh.addEventListener("click", e => {
    const s = e.target.closest("[data-sort-meal]");
    if (s) { ui.mealSort = s.dataset.sortMeal; morph(sh, compareHTML(id, ui.mealSort)); bindWheel(); sh.scrollTo({ top: 0, behavior: reduce() ? "auto" : "smooth" });
      const sel = sh.querySelector(".sorts [aria-pressed=\"true\"]"), row = sh.querySelector(".sorts");
      if (sel && row) row.scrollTo({ left: sel.offsetLeft - row.clientWidth / 2 + sel.clientWidth / 2, behavior: reduce() ? "auto" : "smooth" });
      return; }
    const pk = e.target.closest("[data-pick-meal]");
    if (pk) { setSwap(id, pk.dataset.pickMeal); closeSheet(); toast(`Em cartaz: ${(m.M.options.find(o => o.id === pk.dataset.pickMeal) || {}).name || ""}`); }
  });
  const bindWheel = () => { const w = $("#toWheel", overlay); if (w) w.onclick = () => openWheel(id, m.M.options.map(o => ({ id: o.id, title: o.name, short: o.name.replace(/\s*\(.*\)/, "") }))); };
  bindWheel();
}
function openSwap(id) {
  if (meal(id)) return openCompare(id);
  const raw = findItem(id); if (!raw) return;
  const cur = (S.swaps[id] && S.swaps[id].choice) || null;
  const opts = [{ id: null, title: raw.title, short: raw.short, note: raw.note, q: raw.q }].concat(raw.alts);
  sheet(`<div class="grab"></div><h3 class="gold sh-t">Trocar</h3>
    <div class="opts">${opts.map((o, i) => `<button type="button" class="opt" data-pick="${o.id ?? ""}" aria-pressed="${(o.id || null) === cur}" style="--i:${i}">
      <span class="radio"></span><span class="o-tx"><b>${esc(o.title)}</b>${o.note ? `<small>${esc(o.note)}</small>` : ""}</span>${o.id === null ? `<span class="o-tag">Original</span>` : ""}</button>`).join("")}</div>
    <button type="button" class="btn wide" id="toWheel">${ICON.dice}Deixar a roleta decidir</button>`);
  $$("[data-pick]", overlay).forEach(b => b.onclick = () => { setSwap(id, b.dataset.pick || null); closeSheet(); });
  $("#toWheel", overlay).onclick = () => openWheel(id, opts);
}
function setSwap(id, alt) { const m = meal(id); if (m && alt === m.rec.id) alt = null; put("swaps", id, alt ? { choice: alt } : null); }

function openWheel(id, opts) {
  sheet(`<div class="grab"></div><div class="wheel-stage">${wheelHTML(opts)}<p class="w-res" id="wres" aria-live="polite">&nbsp;</p>
    <div class="w-btns"><button type="button" class="btn" id="wSpin">Girar</button><button type="button" class="btn ghost" id="wKeep" hidden>Fica esse</button></div></div>`, "wheel-sheet");
  let pick = null, busy = false;
  const go = () => {
    if (busy) return; busy = true;
    $("#wKeep", overlay).hidden = true; $("#wres", overlay).innerHTML = "&nbsp;"; $("#wSpin", overlay).disabled = true;
    spinWheel(overlay, opts, o => {
      busy = false; pick = o;
      $("#wres", overlay).innerHTML = `<span class="gold">${esc(o.title)}</span>`;
      $("#wSpin", overlay).disabled = false; $("#wSpin", overlay).textContent = "Girar de novo";
      $("#wKeep", overlay).hidden = false;
    });
  };
  $("#wSpin", overlay).onclick = go;
  $("#wKeep", overlay).onclick = () => { setSwap(id, pick.id); closeSheet(); toast(`Em cartaz: ${pick.title}`); };
  setTimeout(go, 350);
}

/* letters */
function openMail() {
  if (S.director) return openDirector();
  const vis = letters().filter(l => (unlocked(l) && l.hasBody) || l.teaser);
  sheet(`<div class="grab"></div><h3 class="gold sh-t">Correio</h3>
    ${vis.length ? `<div class="envs">${vis.map((l, i) => (unlocked(l) && l.hasBody)
      ? `<button type="button" class="env" data-letter="${l.id}" style="--i:${i}"><span class="flap"></span><span class="wax">L</span><span class="e-cap">${esc(l.title || "Para você")}${opened.has(l.id) ? "" : `<b>nova</b>`}</span></button>`
      : `<div class="env sealed" style="--i:${i}"><span class="flap"></span><span class="wax">L</span><span class="e-cap">abre em ${esc(dur(l.at - now()))}</span></div>`).join("")}</div>`
      : `<div class="empty">${ICON.mail}<p>Algumas cenas só acontecem na hora certa.</p></div>`}`);
}

function openLetter(id) {
  const l = letters().find(x => x.id === id); if (!l || (!S.director && !(unlocked(l) && l.hasBody))) return;
  if (!S.director) { opened.add(id); lsSet("la26-opened", [...opened]); }
  const paper = `<article class="paper"><button type="button" class="px" data-close aria-label="Fechar">${ICON.x}</button>
    <p class="p-k">${wd(l.date)}, ${dnum(l.date)} de novembro · ${esc(l.time)}</p><h3>${esc(l.title || "Para você")}</h3><div class="p-body">${esc(l.body || "")}</div><p class="p-sign">Pedro</p></article>`;
  overlay.innerHTML = `<div class="scrim dark" data-close></div><div class="letter-stage">${reduce() ? paper : `<div class="env-anim"><span class="ea-back"></span><span class="ea-paper"></span><span class="ea-front"></span><span class="ea-flap"></span><span class="wax">L</span></div>`}</div>`;
  document.body.classList.add("locked"); overlay.classList.add("show");
  if (!reduce()) setTimeout(() => { const st = $(".letter-stage", overlay); if (st) st.innerHTML = paper; }, 1500);
  shell();
}

let toasted = new Set();
function toastLetters() {
  if (S.director) return;
  const l = letters().find(x => unlocked(x) && x.hasBody && !opened.has(x.id) && !toasted.has(x.id));
  if (!l) return; toasted.add(l.id);
  toast("Chegou uma carta para você", "Abrir", () => openLetter(l.id), 20000);
}

/* director */
function openLogin() {
  sheet(`<div class="grab"></div><h3 class="gold sh-t">Modo diretor</h3>
    <form id="loginF" class="form">${S.mode === "cloud" ? `<label class="fld"><span>E-mail</span><input id="lg-e" type="email" autocomplete="username" required></label>
      <label class="fld"><span>Senha</span><input id="lg-p" type="password" autocomplete="current-password" required></label>` : `<p class="hint">Modo local, sem senha.</p>`}
      <p class="err" id="lg-err" hidden></p>
      <button class="btn wide" type="submit">Entrar</button></form>`);
}
function openDirector(edit) {
  const ls = letters();
  const e = edit || { date: "2026-11-14", time: "16:50", title: "", body: "", teaser: false };
  const dates = ["2026-11-10", "2026-11-11"].concat(DAYS.map(d => d.date));
  sheet(`<div class="grab"></div><h3 class="gold sh-t">${e.id ? "Editar carta" : "Cartas"}</h3>
    <form id="letterF" class="form" data-id="${e.id || ""}">
      <div class="presets">${LETTER_PRESETS.map((p, i) => `<button type="button" class="chip" data-preset="${i}">${esc(p.l)}</button>`).join("")}</div>
      <div class="row2"><label class="fld"><span>Dia</span><select id="lf-d">${dates.map(d => `<option value="${d}" ${d === e.date ? "selected" : ""}>${wd(d).slice(0, 3)}, ${dnum(d)} ${MON}</option>`).join("")}</select></label>
        <label class="fld"><span>Hora em LA</span><input id="lf-t" type="time" value="${esc(e.time)}" required></label></div>
      <label class="fld"><span>Título</span><input id="lf-ti" maxlength="70" value="${esc(e.title)}" placeholder="Para abrir no pôr do sol"></label>
      <label class="fld"><span>Carta</span><textarea id="lf-b" required placeholder="Lorena,">${esc(e.body)}</textarea></label>
      <label class="tgl"><input type="checkbox" id="lf-te" ${e.teaser ? "checked" : ""}><span class="sw"></span>Mostrar o envelope lacrado antes</label>
      <div class="btnrow"><button class="btn" type="submit">${e.id ? "Salvar" : "Lacrar"}</button><button class="btn ghost" type="button" id="lf-prev">Prévia</button></div>
    </form>
    ${ls.length ? `<ul class="lrows">${ls.map(l => `<li><span class="wax sm">L</span><div><b>${esc(l.title || "Sem título")}</b><small>${wd(l.date).slice(0, 3)} ${dnum(l.date)}, ${esc(l.time)} · ${unlocked(l) ? "aberta" : "em " + dur(l.at - now())}</small></div>
      <button type="button" class="ibtn sm" data-edit="${l.id}" aria-label="Editar">${ICON.more}</button><button type="button" class="ibtn sm" data-del="${l.id}" aria-label="Apagar">${ICON.x}</button></li>`).join("")}</ul>` : ""}
    <details class="rehearse"><summary>Ensaio geral</summary>
      <div class="row2"><label class="fld"><span>Dia</span><select id="sim-d">${DAYS.map(d => `<option value="${d.date}">${wd(d.date).slice(0, 3)}, ${dnum(d.date)} ${MON}</option>`).join("")}</select></label>
      <label class="fld"><span>Hora</span><input id="sim-t" type="time" value="16:55"></label></div>
      <div class="btnrow"><button type="button" class="btn ghost" id="sim-go">Simular</button>${ui.sim ? `<button type="button" class="btn" id="sim-off">Hora real</button>` : ""}</div>
    </details>
    <button type="button" class="linkbtn" id="logout">Sair do modo diretor</button>`, "tall");
}

/* install */
let deferred = null;
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const canInstall = () => !isStandalone() && (deferred || isIOS());
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; shell(); });
window.addEventListener("appinstalled", () => { deferred = null; shell(); });
function install() {
  if (deferred) { deferred.prompt(); deferred.userChoice.finally(() => { deferred = null; shell(); }); return; }
  sheet(`<div class="grab"></div><h3 class="gold sh-t">Instalar</h3>
    <ol class="steps"><li><span>1</span>No Safari, toque em <b>Compartilhar</b> <svg viewBox="0 0 24 24" class="inl" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8"/></svg></li>
    <li><span>2</span>Escolha <b>Adicionar à Tela de Início</b></li><li><span>3</span>Abra pelo ícone. Funciona sem internet.</li></ol>`);
}

/* titles */
function playTitles() {
  const cards = [["", "3", "n"], ["", "2", "n"], ["", "1", "n"], ["Uma produção de", "Pedro"], ["Estrelando", "Lorena"], ["Em", "Los Angeles"], ["e uma escapada a", "Las Vegas"], ["Estreia", "12 · 11 · 26"]];
  overlay.innerHTML = `<div class="titles" data-close><div class="leader"><span class="sweep"></span><span class="cross"></span></div>${cards.map(c => `<div class="tc ${c[2] ? "num" : ""}">${c[0] ? `<small>${c[0]}</small>` : ""}<b>${c[1]}</b></div>`).join("")}<div class="scratch"></div><p class="skip">toque para pular</p></div>`;
  overlay.classList.add("show"); document.body.classList.add("locked");
  const t = $(".titles", overlay), tc = $$(".tc", t); let i = 0, timer;
  const step = () => {
    tc.forEach((c, j) => c.classList.toggle("on", j === i));
    t.classList.toggle("leading", i < 3);
    if (i < 3) { const sw = $(".sweep", t); sw.style.animation = "none"; void sw.offsetWidth; sw.style.animation = ""; }
    timer = setTimeout(() => { i++; if (i >= tc.length) closeSheet(); else step(); }, i < 3 ? 900 : 2100);
  };
  t.addEventListener("click", () => clearTimeout(timer), { once: true });
  step();
}

/* toast */
function toast(msg, act, fn, ms = 3200) {
  const h = $("#toast");
  h.innerHTML = `<div class="toast"><span>${esc(msg)}</span>${act ? `<button type="button">${esc(act)}</button>` : ""}</div>`;
  requestAnimationFrame(() => h.firstChild && h.firstChild.classList.add("in"));
  if (act) h.querySelector("button").onclick = () => { h.innerHTML = ""; fn(); };
  clearTimeout(toast.t); toast.t = setTimeout(() => { h.innerHTML = ""; }, ms);
}

/* ============ events ============ */
document.addEventListener("click", e => {
  const t = e.target.closest("button,a"); if (!t) return;
  const d = t.dataset;
  if (d.act === "titles") return playTitles();
  if (d.act === "exp-new") return expenseForm(null);
  if (d.act === "settle") return settleForm(null);
  if (d.exp) { const x = S.listitems[d.exp]; if (!x) return; const v = { id: d.exp, ...x }; return x.type === "settle" ? settleForm(v) : expenseForm(v); }
  if (t.id === "mailBtn") return openMail();
  if (t.id === "installBtn") return install();
  if (t.id === "syncDot") return toast({ ok: "Tudo sincronizado", syncing: "Sincronizando", offline: "Sem sinal. As mudanças sobem quando a conexão voltar.", local: "Modo local: ainda sem banco de dados configurado." }[t.dataset.s] || "");
  if (d.toggle) { const id = d.toggle; ui.open.has(id) ? ui.open.delete(id) : ui.open.add(id); const li = t.closest(".it"); li.classList.toggle("open"); t.setAttribute("aria-expanded", li.classList.contains("open")); return; }
  if (d.done) { const k = "item-" + d.done, v = !done(k), li = t.closest(".it"); if (v && li) { li.classList.add("just"); setTimeout(() => li.classList.remove("just"), 800); } put("checks", k, v ? { done: true, at: Date.now() } : null); return; }
  if (d.check) { const k = d.check; put("checks", k, done(k) ? null : { done: true, at: Date.now() }); return; }
  if (d.late) { const k = "late-d" + d.late; put("flags", k, late(Number(d.late)) ? null : { on: true }); return; }
  if (d.swap) return openSwap(d.swap);
  if (d.unswap) return setSwap(d.unswap, null);
  if (d.jump) { const el = document.getElementById("it-" + d.jump); if (el) { el.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "center" }); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); } return; }
  if (d.jumpDay) { e.preventDefault(); const el = document.getElementById("scd-" + d.jumpDay); if (el) el.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" }); return; }
  if (d.sceneLink) { e.preventDefault(); ui.flipped.add(d.sceneLink); location.hash = "cenas"; setTimeout(() => { const el = document.getElementById("sc-" + d.sceneLink); if (el) el.scrollIntoView({ block: "center" }); }, 80); return; }
  if (d.flip) { const id = d.flip; ui.flipped.has(id) ? ui.flipped.delete(id) : ui.flipped.add(id); document.getElementById("sc-" + id).classList.toggle("flip"); return; }
  if (d.scene) { const id = d.scene; const v = !S.scenes[id]; if (v) { ui.flipped.delete(id); } put("scenes", id, v ? { seen: true, at: Date.now() } : null); if (v) setTimeout(() => { const el = document.getElementById("sc-" + id); if (el) el.classList.add("clapped"); }, 30); return; }
  if (d.list) { ui.list = d.list; render(true, false); return; }
  if (d.mv) {
    const ul = t.closest("[data-sort]"), L = LISTS.find(x => x.id === ul.dataset.sort), li = t.closest("li");
    const keys = [...ul.children].map(x => x.dataset.key), i = keys.indexOf(li.dataset.key), j = i + Number(d.mv);
    if (j < 0 || j >= keys.length) return;
    keys.splice(j, 0, keys.splice(i, 1)[0]);
    saveOrder(L, keys);
    requestAnimationFrame(() => requestAnimationFrame(() => { const b = document.querySelector(`[data-key="${li.dataset.key}"] [data-mv="${d.mv}"]`); const f = b && !b.disabled ? b : document.querySelector(`[data-key="${li.dataset.key}"] [data-mv="${-d.mv}"]`); if (f) f.focus(); }));
    return;
  }
  if (d.resetOrder) { put("flags", "order-" + d.resetOrder, null); toast("Ordem original de volta"); return; }
  if (d.rm) { put("listitems", d.rm, null); put("checks", "x-" + d.rm, null); return; }
  if (d.letter) return openLetter(d.letter);
  if (d.preset != null && t.closest("#letterF")) { const p = LETTER_PRESETS[Number(d.preset)]; $("#lf-d").value = p.d; $("#lf-t").value = p.t; if (!$("#lf-ti").value) $("#lf-ti").value = p.l; return; }
  if (t.id === "lf-prev") { const pv = { id: "pv", date: $("#lf-d").value, time: $("#lf-t").value, title: $("#lf-ti").value, body: $("#lf-b").value }; overlay.innerHTML = `<div class="scrim dark" data-close></div><div class="letter-stage"><article class="paper"><button type="button" class="px" data-close aria-label="Fechar">${ICON.x}</button><p class="p-k">Prévia · ${esc(pv.time)}</p><h3>${esc(pv.title || "Para você")}</h3><div class="p-body">${esc(pv.body)}</div><p class="p-sign">Pedro</p></article></div>`; return; }
  if (d.edit) { const l = letters().find(x => x.id === d.edit); return openDirector({ id: l.id, date: l.date, time: l.time, title: l.title || "", body: l.body || "", teaser: l.teaser }); }
  if (d.del) { if (d.armed !== "1") { d.armed = "1"; t.classList.add("armed"); setTimeout(() => { if (t.isConnected) { d.armed = ""; t.classList.remove("armed"); } }, 3000); toast("Toque de novo para apagar"); return; } deleteLetter(d.del); openDirector(); return; }
  if (t.id === "sim-go") { ui.sim = laEpoch($("#sim-d").value, $("#sim-t").value); ui.day = null; closeSheet(); location.hash = "hoje"; render(true); toast("Ensaio ativo"); return; }
  if (t.id === "sim-off") { ui.sim = null; ui.day = null; closeSheet(); render(true); return; }
  if (t.id === "logout") { directorLogout().then(() => { closeSheet(); toast("Até a próxima tomada"); }); return; }
});
document.addEventListener("submit", async e => {
  e.preventDefault(); const f = e.target;
  if (f.id === "expF") return saveExpense(f);
  if (f.id === "setF") return saveSettle(f);
  if (f.dataset.add) { const inp = f.querySelector("input"), txt = inp.value.trim(); if (!txt) return; put("listitems", "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), { list: f.dataset.add, text: txt, at: Date.now() }); inp.value = ""; setTimeout(() => { const i2 = document.getElementById("add-" + f.dataset.add); if (i2) i2.focus(); }, 30); return; }
  if (f.id === "loginF") {
    try { await directorLogin(S.mode === "cloud" ? $("#lg-e").value : "", S.mode === "cloud" ? $("#lg-p").value : ""); closeSheet(); toast("Ação! Modo diretor ativo"); }
    catch (err) { const el = $("#lg-err"); el.hidden = false; el.textContent = "E-mail ou senha não conferem."; }
    return;
  }
  if (f.id === "letterF") {
    const body = $("#lf-b").value; if (!body.trim()) return;
    const id = f.dataset.id || "l" + Date.now().toString(36);
    await saveLetter(id, { date: $("#lf-d").value, time: $("#lf-t").value, title: $("#lf-ti").value.trim(), body, teaser: $("#lf-te").checked });
    toast("Carta lacrada"); openDirector();
  }
});

/* secret door: long-press the logo */
(function () {
  const logo = $("#logo"); let t = null;
  const startP = () => { t = setTimeout(() => { t = null; if (navigator.vibrate) try { navigator.vibrate(20); } catch (e) { } S.director ? openDirector() : openLogin(); }, 1200); };
  const end = () => { if (t) { clearTimeout(t); t = null; } };
  logo.addEventListener("pointerdown", startP); logo.addEventListener("pointerup", end); logo.addEventListener("pointerleave", end); logo.addEventListener("contextmenu", e => e.preventDefault());
  logo.addEventListener("click", () => { if (location.hash !== "#hoje") location.hash = "hoje"; });
})();

/* ============ service worker ============ */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  navigator.serviceWorker.register("./sw.js").then(reg => {
    reg.addEventListener("updatefound", () => {
      const w = reg.installing; if (!w) return;
      w.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) toast("Nova versão do app", "Atualizar", () => { askedUpdate = true; w.postMessage("skip"); }, 30000); });
    });
  }).catch(() => { });
  // Reload only when this tab asked for the update. The first install (clients.claim)
  // and updates accepted in another tab must not reload the page by surprise.
  let askedUpdate = false, reloaded = false;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    if (askedUpdate) { reloaded = true; location.reload(); return; }
    if (hadController) toast("App atualizado", "Recarregar", () => { reloaded = true; location.reload(); }, 30000);
  });
}

/* ============ boot ============ */
route();
start().catch(err => console.warn(err));
setInterval(() => { clock(false); }, 1000);
setInterval(() => { refreshBodies(now()); if (!overlay.innerHTML) soft(); else shell(); toastLetters(); }, 30000);
refreshBodies(now());
setTimeout(toastLetters, 1500);

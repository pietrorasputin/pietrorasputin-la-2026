import { TRIP, WD, SCENES, DAYS, LISTS, LETTER_PRESETS } from "./data.js";
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

function effective(it) {
  const c = S.swaps[it.id] && S.swaps[it.id].choice;
  const a = c && it.alts && it.alts.find(x => x.id === c);
  return a ? { ...it, title: a.title, note: a.note, q: a.q, scene: a.scene || null, extra: null, _alt: a } : it;
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
  const flags = (raw.alts ? `<i class="fl ${it._alt ? "on" : ""}">${ICON.swap}</i>` : "") + ((it.scene || []).length ? `<i class="fl ${(it.scene || []).every(x => S.scenes[x]) ? "on" : ""}">${ICON.clap}</i>` : "");
  let more = "";
  if (it.note) more += `<p class="note">${esc(it.note)}</p>`;
  if (it._alt) more += `<p class="was">Trocado. Original: ${esc(raw.title)} <button type="button" data-unswap="${raw.id}">desfazer</button></p>`;
  if (raw.list) {
    const L = LISTS.find(x => x.id === raw.list), [a, b] = raw.range || [0, L.items.length];
    more += `<ul class="mini">${L.items.slice(a, b).map((t, j) => { const k = `l-${L.id}-${a + j}`; return `<li class="${done(k) ? "ok" : ""}"><button type="button" class="cb" data-check="${k}" aria-pressed="${done(k)}">${ICON.check}</button><span>${esc(t)}</span></li>`; }).join("")}</ul>`;
  }
  let chips = "";
  if (it.q) chips += `<a class="chip" href="${mapsQ(it.q)}" target="_blank" rel="noopener">${ICON.pin}Maps</a>`;
  (it.extra || []).forEach(x => chips += `<a class="chip" href="${mapsQ(x.q)}" target="_blank" rel="noopener">${ICON.pin}${esc(x.l)}</a>`);
  if (raw.alts) chips += `<button type="button" class="chip gold" data-swap="${raw.id}">${ICON.swap}Trocar</button>`;
  (it.scene || []).forEach(id => { const sc = SCENES[id]; if (sc) chips += `<a class="chip film ${S.scenes[id] ? "on" : ""}" href="#cenas" data-scene-link="${id}">${ICON.clap}${esc(sc.film)}</a>`; });
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
function renderCenas() {
  const ids = Object.keys(SCENES), got = ids.filter(id => S.scenes[id]).length;
  return `<header class="pagehead"><p class="kicker">Locações</p><h1 class="gold">Cenas na lata</h1></header>
  <div class="scenes">
    <div class="sc-count">${ring(got / ids.length, `${got}/${ids.length}`, "gravadas")}</div>
    ${ids.map((id, i) => { const s = SCENES[id], ok = !!S.scenes[id], fl = ui.flipped.has(id); return `<div class="sc ${ok ? "ok" : ""} ${fl ? "flip" : ""}" style="--i:${i}" id="sc-${id}">
      <div class="sc-in">
        <button type="button" class="sc-face front" data-flip="${id}" aria-label="${esc(s.film)}">
          <span class="sc-n">Cena ${String(i + 1).padStart(2, "0")}</span><span class="clap">${ICON.clap}</span>
          <span class="yr">${s.year}</span>
          <span class="fm">${esc(s.film)}</span>
          <span class="wh">Rolo ${s.day} · ${esc(s.where)}</span>
          ${ok ? `<span class="take">Take ok</span>` : ""}
        </button>
        <div class="sc-face back">
          <p>${esc(s.text)}</p>
          <div class="sc-b"><button type="button" class="btn ${ok ? "ghost" : ""}" data-scene="${id}">${ok ? "Desfazer" : "Gravar"}</button><button type="button" class="ibtn sm" data-flip="${id}" aria-label="Virar">${ICON.swap}</button></div>
        </div>
      </div></div>`; }).join("")}
  </div>`;
}

/* ============ LISTAS ============ */
function listItems(L) {
  const base = L.items.map((t, i) => ({ key: `l-${L.id}-${i}`, t }));
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
    <ul>${all.map((x, i) => `<li class="${done(x.key) ? "ok" : ""}" data-key="${x.key}" style="--i:${i}"><button type="button" class="cb" data-check="${x.key}" aria-pressed="${done(x.key)}" aria-label="${esc(x.t)}">${ICON.check}</button><span class="cl-t">${esc(x.t)}</span>${x.cid ? `<button type="button" class="rm" data-rm="${x.cid}" aria-label="Remover">${ICON.x}</button>` : ""}</li>`).join("")}</ul>
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
function soft() { cancelAnimationFrame(pend); pend = requestAnimationFrame(() => render(false)); }
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

function openSwap(id) {
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
function setSwap(id, alt) { put("swaps", id, alt ? { choice: alt } : null); }

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
  if (d.sceneLink) { e.preventDefault(); ui.flipped.add(d.sceneLink); location.hash = "cenas"; setTimeout(() => { const el = document.getElementById("sc-" + d.sceneLink); if (el) el.scrollIntoView({ block: "center" }); }, 80); return; }
  if (d.flip) { const id = d.flip; ui.flipped.has(id) ? ui.flipped.delete(id) : ui.flipped.add(id); document.getElementById("sc-" + id).classList.toggle("flip"); return; }
  if (d.scene) { const id = d.scene; const v = !S.scenes[id]; if (v) { ui.flipped.delete(id); } put("scenes", id, v ? { seen: true, at: Date.now() } : null); if (v) setTimeout(() => { const el = document.getElementById("sc-" + id); if (el) el.classList.add("clapped"); }, 30); return; }
  if (d.list) { ui.list = d.list; render(true, false); return; }
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

// Shared state. Works offline first: a local copy always renders, and
// Firestore (when configured) queues writes and syncs on reconnect.
import { firebaseConfig } from "./firebase-config.js";

const LS = "la26-state-v2";
const COLS = ["swaps", "flags", "checks", "scenes", "listitems", "letterMeta"];

function lsGet(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

const saved = lsGet(LS, {});
export const S = {
  swaps: saved.swaps || {}, flags: saved.flags || {}, checks: saved.checks || {}, scenes: saved.scenes || {},
  listitems: saved.listitems || {}, letterMeta: saved.letterMeta || {}, letterBody: saved.letterBody || {},
  mode: firebaseConfig ? "cloud" : "local",
  director: !!saved.localDirector && !firebaseConfig,
  sync: navigator.onLine ? "ok" : "offline",
  user: null,
  authReady: !firebaseConfig,
  // Private to the director. Shown only after a director login. A backup lives in this
  // device's localStorage (la26-mine) so nothing is lost if the cloud refuses or is offline.
  mine: {}, mineErr: null, mineSync: "ok", minePending: 0
};

let fb = null; // firebase handles once loaded
let listeners = [];
let changeCb = () => { };
const persist = () => lsSet(LS, { swaps: S.swaps, flags: S.flags, checks: S.checks, scenes: S.scenes, listitems: S.listitems, letterMeta: S.letterMeta, letterBody: S.letterBody, localDirector: S.mode === "local" && S.director });
const changed = () => { persist(); changeCb(); };

export function onChange(cb) { changeCb = cb; }

function setSync(v) { if (S.sync !== v) { S.sync = v; changeCb(); } }
window.addEventListener("online", () => setSync(S.mode === "cloud" ? "syncing" : "ok"));
window.addEventListener("offline", () => setSync("offline"));

/* ---------- private expenses (director) ---------- */
const MINE_LS = "la26-mine";
const mineBox = lsGet(MINE_LS, { docs: {}, pending: {} });
mineBox.docs = mineBox.docs || {}; mineBox.pending = mineBox.pending || {};
const saveBox = () => lsSet(MINE_LS, mineBox);
function mineView(server) {
  const out = { ...server };
  for (const [id, op] of Object.entries(mineBox.pending)) { if (op.del) delete out[id]; else out[id] = op.data; }
  return out;
}
function mineStatus() {
  S.minePending = Object.keys(mineBox.pending).length;
  if (S.mineErr) S.mineSync = "error";
  else S.mineSync = S.minePending ? "pending" : "ok";
}
function writeMine(id) {
  const op = mineBox.pending[id]; if (!op || !fb) return;
  const ref = fb.doc(fb.db, "mine", id);
  (op.del ? fb.deleteDoc(ref) : fb.setDoc(ref, op.data)).then(() => {
    if (mineBox.pending[id] === op) { delete mineBox.pending[id]; saveBox(); }
    S.mineErr = null; mineStatus(); changeCb();
  }).catch(e => {
    console.warn("mine write refused", id, e && e.code);
    S.mineErr = (e && e.code) || "erro"; mineStatus(); changeCb();
  });
}
function loadMine() { S.mine = mineView(mineBox.docs); mineStatus(); }
function putMine(id, data) {
  mineBox.pending[id] = data == null ? { del: true, at: Date.now() } : { data, at: Date.now() };
  if (data == null) delete mineBox.docs[id]; else mineBox.docs[id] = data;
  if (S.mode === "local") delete mineBox.pending[id];
  saveBox();
  S.mine = mineView(mineBox.docs); mineStatus(); changed();
  writeMine(id);
}
if (S.director) loadMine(); // local mode

/* ---------- writes ---------- */
export function put(col, id, data) {
  if (col === "mine") return putMine(id, data);
  if (data == null) delete S[col][id]; else S[col][id] = data;
  changed();
  if (!fb) return;
  const ref = fb.doc(fb.db, col, id);
  const p = data == null ? fb.deleteDoc(ref) : fb.setDoc(ref, data);
  if (!navigator.onLine) setSync("offline");
  p.catch(e => console.warn("write failed", col, id, e && e.code));
}

/* ---------- letters ---------- */
export function laEpoch(date, time) { const [y, m, d] = date.split("-").map(Number); const [h, mi] = time.split(":").map(Number); return Date.UTC(y, m - 1, d, h + 8, mi); }

export async function saveLetter(id, { date, time, title, body, teaser }) {
  const at = laEpoch(date, time);
  S.letterMeta[id] = { date, time, teaser: !!teaser, at };
  S.letterBody[id] = { title, body, at };
  changed();
  if (!fb) return;
  const ts = fb.Timestamp.fromMillis(at);
  fb.setDoc(fb.doc(fb.db, "letterBody", id), { title, body, unlockAt: ts }).catch(e => console.warn(e));
  fb.setDoc(fb.doc(fb.db, "letterMeta", id), { date, time, teaser: !!teaser, unlockAt: ts }).catch(e => console.warn(e));
}
export function deleteLetter(id) {
  delete S.letterMeta[id]; delete S.letterBody[id]; changed();
  if (!fb) return;
  fb.deleteDoc(fb.doc(fb.db, "letterMeta", id)).catch(() => { });
  fb.deleteDoc(fb.doc(fb.db, "letterBody", id)).catch(() => { });
}

const fetching = new Set();
// Fetch bodies whose unlock time has passed. The server refuses earlier reads.
export function refreshBodies(now) {
  if (!fb || S.director) return;
  for (const [id, m] of Object.entries(S.letterMeta)) {
    if (S.letterBody[id] || now < m.at || fetching.has(id)) continue;
    fetching.add(id);
    fb.getDoc(fb.doc(fb.db, "letterBody", id)).then(snap => {
      if (snap.exists()) { const d = snap.data(); S.letterBody[id] = { title: d.title, body: d.body, at: m.at }; changed(); }
    }).catch(() => { }).finally(() => fetching.delete(id));
  }
}

/* ---------- director ---------- */
export async function directorLogin(email, password) {
  if (S.mode === "local") { S.director = true; loadMine(); changed(); return; }
  await fb.signInWithEmailAndPassword(fb.auth, email, password);
}
export async function directorLogout() {
  if (S.mode === "local") { S.director = false; S.mine = {}; changed(); return; }
  await fb.signOut(fb.auth);
}

/* ---------- boot ---------- */
export async function start() {
  if (!firebaseConfig) return;
  const [{ initializeApp }, A, F] = await Promise.all([import("firebase/app"), import("firebase/auth"), import("firebase/firestore")]);
  const app = initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  const db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
  fb = { app, auth, db, ...F, signInWithEmailAndPassword: A.signInWithEmailAndPassword, signOut: A.signOut };

  A.onAuthStateChanged(auth, user => {
    S.user = user;
    if (!user) { A.signInAnonymously(auth).catch(() => setSync("offline")); return; }
    S.director = !user.isAnonymous;
    S.authReady = true;
    if (!S.director) { S.mine = {}; S.mineErr = null; S.mineSync = "ok"; }
    else { loadMine(); Object.keys(mineBox.pending).forEach(writeMine); }
    if (!S.director) { // keep only bodies already unlocked
      for (const id of Object.keys(S.letterBody)) if (!S.letterMeta[id] || Date.now() < S.letterMeta[id].at) delete S.letterBody[id];
    }
    subscribe();
    changed();
  });
}

function subscribe() {
  listeners.forEach(u => u()); listeners = [];
  const cols = S.director ? COLS.concat("letterBody", "mine") : COLS;
  let pendingAny = false;
  for (const col of cols) {
    const u = fb.onSnapshot(fb.collection(fb.db, col), { includeMetadataChanges: true }, snap => {
      const m = {};
      snap.forEach(d => {
        const x = d.data();
        if (col === "letterMeta") m[d.id] = { date: x.date, time: x.time, teaser: !!x.teaser, at: x.unlockAt.toMillis() };
        else if (col === "letterBody") m[d.id] = { title: x.title, body: x.body, at: x.unlockAt.toMillis() };
        else m[d.id] = x;
      });
      if (col === "mine") {
        if (!snap.metadata.fromCache) {
          // the server is the truth; local pending ops stay on top until confirmed
          mineBox.docs = { ...m }; saveBox(); S.mineErr = null;
        }
        S.mine = mineView(snap.metadata.fromCache ? { ...mineBox.docs, ...m } : m); mineStatus();
        changed(); return;
      }
      S[col] = m;
      pendingAny = snap.metadata.hasPendingWrites;
      setSync(!navigator.onLine ? "offline" : (snap.metadata.fromCache || pendingAny ? "syncing" : "ok"));
      changed();
    }, err => { console.warn(col, err && err.code); if (col === "mine") { S.mineErr = (err && err.code) || "erro"; mineStatus(); changed(); } });
    listeners.push(u);
  }
}

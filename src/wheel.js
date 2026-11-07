// Roleta de cinema: a real spinning wheel with bulbs, ticks and a pointer.
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let actx = null;
function tick() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "triangle"; o.frequency.value = 1400 + Math.random() * 200;
    g.gain.setValueAtTime(0.0001, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.08, actx.currentTime + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + 0.04);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + 0.05);
  } catch (e) { }
  if (navigator.vibrate) try { navigator.vibrate(4); } catch (e) { }
}

export function wheelHTML(opts) {
  const n = opts.length, M = n * Math.ceil(8 / n), seg = 360 / M, R = 140, C = 160;
  const pt = (r, deg) => { const a = (deg - 90) * Math.PI / 180; return [(C + r * Math.cos(a)).toFixed(2), (C + r * Math.sin(a)).toFixed(2)]; };
  let slices = "", labels = "", bulbs = "";
  for (let i = 0; i < M; i++) {
    const a0 = i * seg, a1 = (i + 1) * seg, [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1);
    const fill = i % 2 ? "var(--wheel-b)" : "var(--wheel-a)";
    slices += `<path d="M${C} ${C}L${x0} ${y0}A${R} ${R} 0 0 1 ${x1} ${y1}Z" fill="${fill}" stroke="var(--gold)" stroke-width="1.2"/>`;
    const mid = a0 + seg / 2;
    labels += `<text transform="rotate(${mid - 90} ${C} ${C})" x="${C + R - 14}" y="${C + 3.5}" text-anchor="end" class="wl">${esc((opts[i % n].short || opts[i % n].title).toUpperCase().slice(0, 14))}</text>`;
  }
  for (let i = 0; i < 32; i++) { const [x, y] = pt(R + 9, i * 11.25); bulbs += `<circle cx="${x}" cy="${y}" r="3.2" class="wb" style="--i:${i}"/>`; }
  return `<div class="wheel" data-m="${M}">
    <svg viewBox="0 0 320 320" class="wheel-svg" role="img" aria-label="Roleta">
      <defs><radialGradient id="hub" cx="40%" cy="35%"><stop offset="0" stop-color="#f6e3b4"/><stop offset=".6" stop-color="#d8b26c"/><stop offset="1" stop-color="#8a6a32"/></radialGradient></defs>
      <circle cx="160" cy="160" r="${R + 18}" fill="var(--wheel-rim)" stroke="var(--gold)" stroke-width="1.5"/>
      <g class="bulbs">${bulbs}</g>
      <g class="rot">${slices}${labels}<circle cx="160" cy="160" r="${R}" fill="none" stroke="var(--gold)" stroke-width="2"/></g>
      <circle cx="160" cy="160" r="22" fill="url(#hub)" stroke="#5c4320"/>
      <path d="M160 146l3.5 9.5h10l-8 6 3 9.6-8.5-6-8.5 6 3-9.6-8-6h10z" fill="#3a2a14"/>
    </svg>
    <svg viewBox="0 0 40 52" class="pointer" aria-hidden="true"><path d="M20 50L4 10a16 16 0 1 1 32 0z" fill="url(#pg)" stroke="#5c4320" stroke-width="1.5"/><defs><linearGradient id="pg" x1="0" x2="1"><stop offset="0" stop-color="#f6e3b4"/><stop offset="1" stop-color="#b58d47"/></linearGradient></defs><circle cx="20" cy="15" r="5" fill="#5c1a20"/></svg>
    <div class="confetti" aria-hidden="true"></div>
  </div>`;
}

export function spinWheel(root, opts, onDone) {
  const n = opts.length, M = Number(root.querySelector(".wheel").dataset.m), seg = 360 / M;
  const rot = root.querySelector(".rot"), ptr = root.querySelector(".pointer"), wheel = root.querySelector(".wheel");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const s = Math.floor(Math.random() * M);
  const jitter = (Math.random() - .5) * seg * .7;
  const cur = Number(rot.dataset.r || 0);
  const target = ((360 - (s * seg + seg / 2 + jitter)) % 360 + 360) % 360;
  const final = cur + (reduce ? 0 : 360 * 6) + ((target - (cur % 360) + 360) % 360);
  const T = reduce ? 1 : 5600, t0 = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 4);
  let lastIdx = Math.floor(cur / seg);
  wheel.classList.add("spinning"); wheel.classList.remove("won");
  function frame(now) {
    const p = Math.min(1, (now - t0) / T), r = cur + (final - cur) * ease(p);
    rot.setAttribute("transform", `rotate(${r.toFixed(2)} 160 160)`);
    const idx = Math.floor((r + seg / 2) / seg);
    if (idx !== lastIdx) { lastIdx = idx; tick(); ptr.classList.remove("kick"); void ptr.getBoundingClientRect(); ptr.classList.add("kick"); }
    if (p < 1) requestAnimationFrame(frame);
    else {
      rot.dataset.r = String(final % 360);
      rot.setAttribute("transform", `rotate(${(final % 360).toFixed(2)} 160 160)`);
      wheel.classList.remove("spinning"); wheel.classList.add("won");
      burst(root.querySelector(".confetti"));
      onDone(opts[s % n]);
    }
  }
  requestAnimationFrame(frame);
}

function burst(el) {
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let h = "";
  for (let i = 0; i < 36; i++) {
    const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 120;
    h += `<i style="--x:${(Math.cos(a) * d).toFixed(0)}px;--y:${(Math.sin(a) * d - 40).toFixed(0)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg;--d:${(.6 + Math.random() * .6).toFixed(2)}s;--c:${["#d8b26c", "#f1e6d0", "#a8333b"][i % 3]}"></i>`;
  }
  el.innerHTML = h;
  setTimeout(() => { el.innerHTML = ""; }, 1600);
}

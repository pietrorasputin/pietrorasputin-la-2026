// Line-art illustrations (gold on dark), drawn in a 160x100 box.
const wrap = (inner, extra = "") =>
  `<svg viewBox="0 0 160 100" class="art" aria-hidden="true" ${extra}><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;

const P = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)].map(v => v.toFixed(1));

function stars(list) {
  return list.map(([x, y, s]) => `<path d="M${x} ${y - s}v${2 * s}M${x - s} ${y}h${2 * s}" opacity=".7"/>`).join("");
}

function pier() {
  const cx = 104, cy = 42, r = 27;
  let spokes = "", cars = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const [x, y] = P(cx, cy, r, a);
    spokes += `<path d="M${cx} ${cy}L${x} ${y}" opacity=".55"/>`;
    const [gx, gy] = P(cx, cy, r + 4, a);
    cars += `<rect x="${(gx - 2).toFixed(1)}" y="${(gy - 1.5).toFixed(1)}" width="4" height="4" rx="1" class="fillc"/>`;
  }
  return wrap(`
    <path d="M44 82a14 14 0 0 1 28 0" class="sun"/>
    <path d="M58 64v-6M46 68l-4-4M70 68l4-4" opacity=".5"/>
    <circle cx="${cx}" cy="${cy}" r="${r}"/><circle cx="${cx}" cy="${cy}" r="${r - 6}" opacity=".35"/><circle cx="${cx}" cy="${cy}" r="2.5" class="fillc"/>
    <g class="spin" style="transform-origin:${cx}px ${cy}px">${spokes}${cars}</g>
    <path d="M${cx} ${cy}L92 82M${cx} ${cy}l12 40"/>
    <path d="M4 82h152"/>
    <path d="M70 82v8M88 82v8M120 82v8M138 82v8M154 82v8" opacity=".6"/>
    <path d="M8 92q5-3 10 0t10 0t10 0M44 95q5-3 10 0t10 0" opacity=".45"/>
    <path d="M28 82c2-14 4-30 1-46"/>
    <path d="M29 36c-8-6-18-3-22 3M29 36c-3-9-11-13-20-11M29 36c4-9 12-12 21-9M29 36c8-3 16 0 19 6M29 36c1-8-2-14-6-18"/>`);
}

function sign() {
  const letters = "HOLLYWOOD".split("").map((c, i) =>
    `<text x="${38 + i * 9.6}" y="${46 + Math.sin(i / 8 * Math.PI) * -3 + i * .6}" font-family="Jost,sans-serif" font-size="11" font-weight="600" class="fillc" stroke="none" text-anchor="middle">${c}</text>`).join("");
  return wrap(`
    ${stars([[18, 16, 2], [140, 14, 2.5], [120, 26, 1.5], [36, 26, 1.5]])}
    <circle cx="128" cy="30" r="9" opacity=".8"/><circle cx="132" cy="27" r="8" class="cut"/>
    <path d="M4 82C26 58 40 50 60 56s30-6 46-14 34 6 50 22"/>
    <path d="M4 92c30-12 60-14 90-6s44 4 62-2" opacity=".5"/>
    ${letters}
    <path d="M38 53v6M57 55v5M76 56v4M96 55v5M115 58v4" opacity=".5"/>`);
}

function observatory() {
  return wrap(`
    ${stars([[20, 16, 2.5], [44, 8, 1.5], [116, 12, 2], [146, 22, 1.5], [70, 14, 1.2]])}
    <path d="M24 30l14-6" opacity=".6"/><circle cx="42" cy="22" r="1.4" class="fillc"/>
    <path d="M58 58a22 22 0 0 1 44 0"/>
    <path d="M80 36v-6M77 30h6"/>
    <path d="M58 58h44v20H58z"/>
    <path d="M64 62v16M70 62v16M76 62v16M84 62v16M90 62v16M96 62v16" opacity=".5"/>
    <path d="M30 66a8 8 0 0 1 16 0M114 66a8 8 0 0 1 16 0"/>
    <path d="M28 66h20v12H28zM112 66h20v12h-20zM48 72h10M102 72h10"/>
    <path d="M4 84c20-6 40-6 60-4s60 4 92-2"/>
    <path d="M4 92c40-4 80-4 152 0" opacity=".45"/>`);
}

function vegas() {
  let bulbs = "";
  const pts = [[80, 18], [138, 46], [80, 74], [22, 46]];
  for (let s = 0; s < 4; s++) {
    const [x1, y1] = pts[s], [x2, y2] = pts[(s + 1) % 4];
    for (let i = 0; i < 7; i++) {
      const t = i / 7;
      bulbs += `<circle cx="${(x1 + (x2 - x1) * t).toFixed(1)}" cy="${(y1 + (y2 - y1) * t).toFixed(1)}" r="1.3" class="fillc bulb" style="--i:${s * 7 + i}"/>`;
    }
  }
  const star = Array.from({ length: 8 }, (_, i) => {
    const a = i / 8 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 4 : 9;
    return P(80, 8, r, a).join(" ");
  }).join(" L");
  return wrap(`
    <path d="M${star}Z"/>
    <path d="M80 14L134 46 80 78 26 46Z" opacity=".35"/>
    ${bulbs}
    <text x="80" y="41" font-family="Jost,sans-serif" font-size="7" letter-spacing="1.5" class="fillc" stroke="none" text-anchor="middle">WELCOME</text>
    <text x="80" y="54" font-family="Limelight,serif" font-size="12" class="fillc" stroke="none" text-anchor="middle">Las Vegas</text>
    <path d="M80 78v12M74 90h12"/>
    <path d="M4 90h152" opacity=".5"/>
    <path d="M18 70l-6-14M140 70l6-14" opacity=".5"/>`);
}

function coaster() {
  return wrap(`
    ${stars([[20, 14, 2], [138, 12, 2], [110, 24, 1.3]])}
    <path d="M4 82C20 82 26 40 46 40s22 42 40 42"/>
    <path d="M86 82c10 0 10-26 26-26a14 14 0 1 1 0 28c-8 0-10-2-16-2"/>
    <path d="M24 82l6-20M46 82V41M62 82l-4-28M108 84V70M124 84V72" opacity=".55"/>
    <path d="M40 40h12" stroke-width="3"/>
    <path d="M132 34h16v14h-16z"/><path d="M130 34h20M134 48l-4 34M146 48l4 34M136 62h8" opacity=".8"/>
    <text x="140" y="44" font-family="Limelight,serif" font-size="6" class="fillc" stroke="none" text-anchor="middle">LA</text>
    <path d="M4 86h152"/>`);
}

function funicular() {
  return wrap(`
    ${stars([[136, 12, 2], [112, 20, 1.3], [150, 30, 1.5]])}
    <path d="M10 22l6-10 6 10v14H10zM24 30l4-8 4 8v6h-8zM16 12v-4" opacity=".55"/>
    <path d="M14 86L120 34"/>
    <path d="M22 90L128 38" opacity=".5"/>
    <path d="M64 58l20-10 6 12-20 10z"/>
    <path d="M69 60l5-2.5M77 56l5-2.5" opacity=".7"/>
    <path d="M70 70l2 4M88 61l2 4"/>
    <path d="M110 40h30v46M118 40V30h22" opacity=".8"/>
    <path d="M118 50h6v6h-6zM130 50h6v6h-6zM118 64h6v6h-6zM130 64h6v6h-6z" opacity=".55"/>
    <path d="M4 90h152"/>`);
}

function donut() {
  return wrap(`
    <path d="M104 18l14-4 4 2-12 6-4 6-2-1 2-6-8 2-3-3z" class="fillc" stroke="none" opacity=".9"/>
    <path d="M60 28c14-4 28-8 40-10" stroke-dasharray="2 4" opacity=".6"/>
    <circle cx="80" cy="46" r="22"/><circle cx="80" cy="46" r="8"/>
    <path d="M66 36l3 2M90 32l2 3M96 48l3-1M68 56l2-3M84 62l3-1M62 46h3" stroke-width="2" opacity=".85"/>
    <path d="M70 68v4M90 68v4"/>
    <path d="M40 72h80v14H40z"/>
    <path d="M48 76h12v10M68 76h24M100 76h12v10" opacity=".6"/>
    <path d="M4 86h152"/>`);
}

// Stepped (Assyrian) crenellation along y, from x0 to x1.
function merlons(x0, x1, y) {
  let d = `M${x0} ${y}`;
  for (let x = x0 + 1; x + 6 <= x1; x += 8) d += `H${x}V${y - 2}H${x + 1}V${y - 4}H${x + 4}V${y - 2}H${x + 5}V${y}`;
  return d + `H${x1}`;
}

function citadel() {
  const side = `
    <path d="M9 86c1-12 3-25 1-38"/>
    <path d="M10 48c-6-4-12-2-9 2M10 48c-2-7-8-9-13-6M10 48c3-7 9-8 14-5M10 48c6-2 11 1 12 5M10 48c0-6-2-10-5-12"/>
    <rect x="30" y="58" width="24" height="23" rx="1" opacity=".45"/>
    <path d="M34 74q9-4 17 0M34 74v-9h4v9M36 65v-2h2v2M37 77v4M40 77v4M47 77v4M50 77v4M34 74l3 3h14l-1-3"/>
    <path d="M40 70l11-8M42 71l9-6M44 72l7-4" opacity=".75"/>`;
  return wrap(`
    ${stars([[24, 14, 2], [136, 12, 2], [116, 22, 1.3], [44, 24, 1.3]])}
    <path d="${merlons(20, 62, 46)}"/><path d="${merlons(98, 140, 46)}"/><path d="${merlons(62, 98, 34)}"/>
    <path d="M20 46v40M62 46V34M98 34v12M140 46v40"/>
    <path d="M62 86V46M98 86V46" opacity=".55"/>
    <path d="M24 52h34M102 52h34M66 40h28" opacity=".5"/>
    <path d="M28 50.5h1M34 50.5h1M40 50.5h1M46 50.5h1M52 50.5h1M106 50.5h1M112 50.5h1M118 50.5h1M124 50.5h1M130 50.5h1M70 38.5h1M76 38.5h1M83 38.5h1M89 38.5h1" stroke-width="2" opacity=".7"/>
    <path d="M71 86V61a9 9 0 0 1 18 0v25"/>
    <path d="M75 86V62a5 5 0 0 1 10 0v24" opacity=".45"/>
    <circle cx="80" cy="46" r="2.2" class="fillc"/>
    ${side}<g transform="translate(160 0) scale(-1 1)">${side}</g>
    <path d="M2 86h156"/>
    <path d="M8 92c30-4 60-4 90-2s40 2 54 0" opacity=".45"/>`);
}

export const ART = { pier, sign, observatory, vegas, coaster, funicular, donut, citadel };

const I = (d, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
export const ICON = {
  meal: I('<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 21V3c-2 1-3 4-3 7s1 4 3 4"/>'),
  visit: I('<path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" transform="translate(0 2)"/><path d="M15 6v2M15 11v2M15 16v2" opacity=".6"/>'),
  move: I('<path d="M5 16l1.5-5.5A2 2 0 0 1 8.4 9h7.2a2 2 0 0 1 1.9 1.5L19 16M4 16h16v3H4zM7 19v2M17 19v2"/><circle cx="7.5" cy="16.5" r=".6"/><circle cx="16.5" cy="16.5" r=".6"/>'),
  pin: I('<path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
  nav: I('<path d="M3 11l18-8-8 18-2-8z"/>'),
  swap: I('<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>'),
  clap: I('<path d="M4 10h16v10H4z"/><path d="M4 10l1.5-5 15 2.5L20 10M9 5.6l2 3.9M14 6.4l2 3.6"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7"/>', 2.6),
  route: I('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>'),
  late: I('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>'),
  mail: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  play: I('<path d="M8 5v14l11-7z"/>'),
  today: I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.6"/>'),
  reels: I('<rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/><path d="M3 8h7M3 16h7M14 8h7M14 16h7"/>'),
  film: I('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 12h4M3 16h4M17 8h4M17 12h4M17 16h4"/>'),
  list: I('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  x: I('<path d="M6 6l12 12M18 6L6 18"/>'),
  down: I('<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>'),
  more: I('<path d="M6 9l6 6 6-6"/>'),
  coin: I('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
  bag: I('<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  bed: I('<path d="M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="2"/>'),
  dots: I('<circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/>'),
  up: I('<path d="M6 15l6-6 6 6"/>'),
  grip: I('<circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/>'),
  dice: I('<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/>')
};

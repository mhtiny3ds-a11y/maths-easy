'use strict';
/* =========================================================
   Bộ sinh câu hỏi Toán. Mỗi dạng bài là một hàm GEN[ten](args) trả về:
   { title, q, fig, kind: 'mc'|'num'|'frac', opts, ans, unit, ex, say }
   - q: câu hỏi (HTML), fig: hình minh họa (HTML/SVG)
   - kind 'mc': chọn đáp án trong opts; 'num': nhập số; 'frac': nhập phân số a/b
   - ex: lời giải thích ngắn hiện sau khi trả lời
   ========================================================= */
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = a => a[Math.floor(Math.random() * a.length)];
const mix = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const lcm = (a, b) => a / gcd(a, b) * b;
const pow10 = n => Math.pow(10, n);
const round2 = (x, d = 6) => Math.round(x * pow10(d)) / pow10(d);

/* ---------- định dạng số kiểu Việt Nam ---------- */
function fmt(n) {
  if (typeof n === 'string') return n;
  const neg = n < 0; n = Math.abs(round2(n));
  let [i, d] = String(n).split('.');
  if (i.length >= 5) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '−' : '') + i + (d ? ',' + d : '');
}
const plain = n => String(round2(n)).replace('.', ',');
function fracStr(a, b) { return `${a}/${b}`; }
function fracHtml(a, b) { return `<span class="fr"><i>${a}</i><i>${b}</i></span>`; }
function simp(a, b) { const g = gcd(a, b); return [a / g, b / g]; }

/* ---------- đọc số bằng chữ ---------- */
const DIGW = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function read3(n, full) {
  const h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, u = n % 10; const out = [];
  if (full || h) out.push(DIGW[h] + ' trăm');
  if (t === 0) { if (u && (full || h)) out.push('linh'); }
  else if (t === 1) out.push('mười');
  else out.push(DIGW[t] + ' mươi');
  if (u) {
    if (u === 1 && t > 1) out.push('mốt');
    else if (u === 5 && t > 0) out.push('lăm');
    else if (u === 4 && t > 1) out.push('tư');
    else out.push(DIGW[u]);
  }
  return out.join(' ');
}
function docSo(n) {
  if (n === 0) return 'không';
  const units = ['', ' nghìn', ' triệu', ' tỉ']; const parts = []; let i = 0, first = true;
  const groups = []; while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); }
  for (let k = groups.length - 1; k >= 0; k--) {
    const g = groups[k]; if (g === 0) continue;
    parts.push(read3(g, !first) + units[k]); first = false; i++;
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/* ---------- đáp án nhiễu ---------- */
function nearNums(ans, n = 3, spread) {
  const s = new Set([ans]); const out = [];
  const steps = spread || (ans >= 1000 ? [1, 10, 100, 1000, 9, 90] : ans >= 100 ? [1, 10, 100, 2, 9, 11] : ans >= 20 ? [1, 2, 10, 3, 9, 11] : [1, 2, 3]);
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const st = pickOne(steps) * (Math.random() < .5 ? -1 : 1); const v = ans + st;
    if (v >= 0 && !s.has(v)) { s.add(v); out.push(v); }
  }
  let v = ans + 1; while (out.length < n) { if (!s.has(v)) { s.add(v); out.push(v); } v++; }
  return out;
}
function mcNum(ans, spread) { return mix([ans, ...nearNums(ans, 3, spread)]).map(fmt); }
function mcText(ans, pool, n = 4) { return mix([ans, ...mix(pool.filter(x => x !== ans)).slice(0, n - 1)]); }

/* ---------- đồ vật, tên ---------- */
const OBJS = [['🍎', 'quả táo'], ['⭐', 'ngôi sao'], ['🐟', 'con cá'], ['🌸', 'bông hoa'], ['🎈', 'quả bóng bay'], ['🐥', 'chú gà con'], ['🍓', 'quả dâu'], ['🚗', 'ô tô'], ['🦋', 'con bướm'], ['🍌', 'quả chuối'], ['🧁', 'cái bánh'], ['🐞', 'con bọ rùa']];
const NAMES = ['An', 'Bình', 'Mai', 'Nam', 'Lan', 'Minh', 'Hoa', 'Tú', 'Hà', 'Khôi', 'Ngọc', 'Phúc'];
const ITEMS = [['quả cam', '🍊'], ['cái kẹo', '🍬'], ['bông hoa', '🌸'], ['quyển vở', '📒'], ['viên bi', '🔵'], ['quả táo', '🍎'], ['cái bút chì', '✏️'], ['con tem', '🎫'], ['quả trứng', '🥚'], ['cái bánh', '🧁']];
const BOXES = ['hộp', 'túi', 'đĩa', 'giỏ', 'khay'];
function two(arr) { const a = mix(arr); return [a[0], a[1]]; }
function objRow(n, e, cls = '') { return `<div class="objs ${cls}">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</div>`; }

/* ---------- hình vẽ SVG ---------- */
const svg = (w, h, body, cls = '') => `<svg class="fig ${cls}" viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px" role="img" aria-hidden="true">${body}</svg>`;
function clockSvg(h, m) {
  let t = ''; for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6; t += `<text x="${100 + 70 * Math.sin(a)}" y="${100 - 70 * Math.cos(a) + 7}" text-anchor="middle" class="t-ink" font-size="20" font-weight="800">${i}</text>`; }
  let ticks = ''; for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, r1 = i % 5 ? 86 : 82; ticks += `<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + 90 * Math.sin(a)}" y2="${100 - 90 * Math.cos(a)}" class="s-ink3" stroke-width="${i % 5 ? 1.5 : 3}"/>`; }
  const ha = ((h % 12) + m / 60) * Math.PI / 6, ma = m * Math.PI / 30;
  return svg(200, 200, `<circle cx="100" cy="100" r="95" class="f-surface s-pri" stroke-width="6"/>${ticks}${t}
    <line x1="100" y1="100" x2="${100 + 45 * Math.sin(ha)}" y2="${100 - 45 * Math.cos(ha)}" class="s-ink" stroke-width="8" stroke-linecap="round"/>
    <line x1="100" y1="100" x2="${100 + 70 * Math.sin(ma)}" y2="${100 - 70 * Math.cos(ma)}" class="s-wrong" stroke-width="5" stroke-linecap="round"/>
    <circle cx="100" cy="100" r="7" class="f-ink"/>`, 'clock');
}
function rulerSvg(len, max = 15, start = 0) {
  const u = 300 / max; let b = `<rect x="10" y="60" width="${max * u + 20}" height="44" rx="6" class="f-gold-soft s-gold" stroke-width="2"/>`;
  for (let i = 0; i <= max * 2; i++) { const x = 20 + i * u / 2; b += `<line x1="${x}" y1="60" x2="${x}" y2="${i % 2 ? 70 : 78}" class="s-ink" stroke-width="1.5"/>`; if (!(i % 2)) b += `<text x="${x}" y="96" text-anchor="middle" font-size="12" font-weight="800" class="t-ink">${i / 2}</text>`; }
  b += `<rect x="${20 + start * u}" y="30" width="${len * u}" height="18" rx="9" class="f-pri"/>`;
  return svg(max * u + 40, 112, b);
}
function shapeSvg(kind, w = 110, h = 110, cls = 'f-sky') {
  const c = `class="${cls} s-ink" stroke-width="3"`;
  switch (kind) {
    case 'vuông': return svg(w, h, `<rect x="15" y="15" width="80" height="80" ${c}/>`);
    case 'chữ nhật': return svg(w + 40, h, `<rect x="10" y="25" width="130" height="62" ${c}/>`);
    case 'tròn': return svg(w, h, `<circle cx="55" cy="55" r="42" ${c}/>`);
    case 'tam giác': return svg(w, h, `<polygon points="55,12 100,96 10,96" ${c}/>`);
    case 'tứ giác': return svg(w + 20, h, `<polygon points="20,20 110,8 122,95 8,80" ${c}/>`);
    case 'bình hành': return svg(w + 40, h, `<polygon points="40,20 145,20 110,90 5,90" ${c}/>`);
    case 'thoi': return svg(w, h + 10, `<polygon points="55,5 100,60 55,115 10,60" ${c}/>`);
    case 'thang': return svg(w + 40, h, `<polygon points="40,20 110,20 145,90 5,90" ${c}/>`);
    case 'lục giác': return svg(w, h, `<polygon points="30,12 80,12 104,55 80,98 30,98 6,55" ${c}/>`);
  }
}
function solidSvg(kind) {
  const st = 'class="f-gold-soft s-ink" stroke-width="3"', st2 = 'class="f-gold s-ink" stroke-width="3"';
  switch (kind) {
    case 'khối lập phương': return svg(130, 130, `<polygon points="20,45 85,45 85,110 20,110" ${st}/><polygon points="20,45 45,20 110,20 85,45" ${st2}/><polygon points="85,45 110,20 110,85 85,110" ${st}/>`);
    case 'khối hộp chữ nhật': return svg(170, 120, `<polygon points="15,50 125,50 125,105 15,105" ${st}/><polygon points="15,50 45,22 155,22 125,50" ${st2}/><polygon points="125,50 155,22 155,77 125,105" ${st}/>`);
    case 'khối trụ': return svg(120, 140, `<path d="M20 30 v80 a40 14 0 0 0 80 0 v-80" ${st}/><ellipse cx="60" cy="30" rx="40" ry="14" ${st2}/>`);
    case 'khối cầu': return svg(120, 120, `<defs><radialGradient id="gb" cx=".35" cy=".35"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#F5A524"/></radialGradient></defs><circle cx="60" cy="60" r="48" fill="url(#gb)" class="s-ink" stroke-width="3"/><ellipse cx="60" cy="60" rx="48" ry="14" fill="none" class="s-ink3" stroke-width="2" stroke-dasharray="5 5"/>`);
  }
}
function angleSvg(deg, label = '') {
  const r = 90, cx = 110, cy = 120; const a = deg * Math.PI / 180;
  const x2 = cx + r * Math.cos(a), y2 = cy - r * Math.sin(a);
  const arc = deg >= 180 ? `M ${cx + 28} ${cy} A 28 28 0 0 0 ${cx - 28} ${cy}` : `M ${cx + 28} ${cy} A 28 28 0 0 0 ${cx + 28 * Math.cos(a)} ${cy - 28 * Math.sin(a)}`;
  const mark = deg === 90 ? `<path d="M ${cx + 18} ${cy} V ${cy - 18} H ${cx}" fill="none" class="s-pri" stroke-width="3"/>` : `<path d="${arc}" fill="none" class="s-pri" stroke-width="3"/>`;
  return svg(220, 140, `<line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" class="s-ink" stroke-width="5" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" class="s-ink" stroke-width="5" stroke-linecap="round"/>${mark}<circle cx="${cx}" cy="${cy}" r="5" class="f-ink"/>${label ? `<text x="${cx + 40}" y="${cy - 10}" font-size="16" font-weight="800" class="t-pri">${label}</text>` : ''}`);
}
function fracSvg(n, k, kind) {
  kind = kind || pickOne(['pie', 'bar']);
  if (kind === 'pie') {
    let b = ''; for (let i = 0; i < n; i++) {
      const a1 = i / n * 2 * Math.PI - Math.PI / 2, a2 = (i + 1) / n * 2 * Math.PI - Math.PI / 2;
      const p = n === 1 ? `<circle cx="70" cy="70" r="60"` : `<path d="M70 70 L ${70 + 60 * Math.cos(a1)} ${70 + 60 * Math.sin(a1)} A 60 60 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${70 + 60 * Math.cos(a2)} ${70 + 60 * Math.sin(a2)} Z"`;
      b += `${p} class="${i < k ? 'f-pri' : 'f-surface'} s-ink" stroke-width="2.5"/>`;
    }
    return svg(140, 140, b);
  }
  const w = Math.min(36, 240 / n); let b = '';
  for (let i = 0; i < n; i++) b += `<rect x="${6 + i * w}" y="10" width="${w}" height="50" class="${i < k ? 'f-pri' : 'f-surface'} s-ink" stroke-width="2.5"/>`;
  return svg(n * w + 12, 70, b);
}
function barChartSvg(labels, vals, unit = '') {
  const mx = Math.max(...vals), top = Math.ceil(mx / 5) * 5 || 5; const step = top <= 10 ? 1 : top <= 25 ? 5 : top <= 60 ? 10 : Math.ceil(top / 50) * 10;
  const H = 150, n = labels.length, bw = 36, gap = 22, W = 50 + n * (bw + gap); let b = '';
  for (let v = 0; v <= top; v += step) { const y = 170 - v / top * H; b += `<line x1="40" y1="${y}" x2="${W}" y2="${y}" class="s-line" stroke-width="1.5"/><text x="34" y="${y + 4}" text-anchor="end" font-size="11" font-weight="700" class="t-ink3">${v}</text>`; }
  labels.forEach((l, i) => { const h = vals[i] / top * H, x = 50 + i * (bw + gap); b += `<rect x="${x}" y="${170 - h}" width="${bw}" height="${h}" rx="4" class="f-sky"/><text x="${x + bw / 2}" y="188" text-anchor="middle" font-size="12" font-weight="800" class="t-ink">${l}</text>`; });
  return svg(W + 10, 196, b);
}
function pieSvg(parts) {
  let b = '', a = -Math.PI / 2; const cols = ['f-sky', 'f-gold', 'f-jade', 'f-pri', 'f-plum'];
  parts.forEach(([lbl, pct], i) => {
    const a2 = a + pct / 100 * 2 * Math.PI, mid = (a + a2) / 2;
    b += `<path d="M90 90 L ${90 + 80 * Math.cos(a)} ${90 + 80 * Math.sin(a)} A 80 80 0 ${a2 - a > Math.PI ? 1 : 0} 1 ${90 + 80 * Math.cos(a2)} ${90 + 80 * Math.sin(a2)} Z" class="${cols[i % 5]} s-surface" stroke-width="2"/>`;
    b += `<text x="${90 + 50 * Math.cos(mid)}" y="${90 + 50 * Math.sin(mid) + 4}" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">${pct}%</text>`;
    a = a2;
  });
  const legend = parts.map(([lbl], i) => `<rect x="190" y="${30 + i * 22}" width="14" height="14" rx="3" class="${cols[i % 5]}"/><text x="210" y="${42 + i * 22}" font-size="13" font-weight="700" class="t-ink">${lbl}</text>`).join('');
  return svg(320, 180, b + legend);
}
function gridArea(cells, cols, rows) {
  let b = ''; const s = 26;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) b += `<rect x="${4 + c * s}" y="${4 + r * s}" width="${s}" height="${s}" class="${cells.has(r * cols + c) ? 'f-jade' : 'f-surface'} s-line" stroke-width="1.5"/>`;
  return svg(cols * s + 8, rows * s + 8, b);
}
function tensOnesSvg(t, o) {
  let b = ''; for (let i = 0; i < t; i++) { for (let k = 0; k < 10; k++) b += `<rect x="${6 + i * 22}" y="${6 + k * 13}" width="16" height="12" rx="2" class="f-sky s-ink" stroke-width="1"/>`; }
  for (let k = 0; k < o; k++) b += `<rect x="${12 + t * 22 + (k % 2) * 18}" y="${6 + Math.floor(k / 2) * 18}" width="14" height="14" rx="2" class="f-gold s-ink" stroke-width="1"/>`;
  return svg(Math.max(60, t * 22 + 56), 140, b);
}
function numberLine(a, step, n, hole) {
  let b = `<line x1="10" y1="40" x2="${30 + n * 46}" y2="40" class="s-ink" stroke-width="3"/><polygon points="${30 + n * 46},34 ${42 + n * 46},40 ${30 + n * 46},46" class="f-ink"/>`;
  for (let i = 0; i < n; i++) { const x = 24 + i * 46, v = a + i * step; b += `<line x1="${x}" y1="32" x2="${x}" y2="48" class="s-ink" stroke-width="3"/>` + (i === hole ? `<rect x="${x - 16}" y="56" width="32" height="24" rx="6" class="f-gold-soft s-gold" stroke-width="2"/><text x="${x}" y="74" text-anchor="middle" font-size="15" font-weight="800" class="t-ink">?</text>` : `<text x="${x}" y="74" text-anchor="middle" font-size="14" font-weight="800" class="t-ink">${fmt(v)}</text>`); }
  return svg(52 + n * 46, 86, b);
}
function moneyNote(v) {
  const col = { 1000: '#B9A27D', 2000: '#9C7B5B', 5000: '#5E7FB8', 10000: '#B88A3B', 20000: '#3E7DB8', 50000: '#C0567A', 100000: '#4E9A62', 200000: '#B5673A', 500000: '#3D9BA8' }[v] || '#888';
  return `<span class="note" style="--nc:${col}">${v >= 1000 ? (v / 1000) + ' nghìn' : v}</span>`;
}

/* ---------- câu đố bài toán có lời văn ---------- */
function wp(type, max = 20) {
  const [A, B] = two(NAMES); const [it, ic] = pickOne(ITEMS); const box = pickOne(BOXES);
  let q, ans, ex, unit = it;
  switch (type) {
    case 'add': { const a = R(2, max - 2), b = R(1, max - a); ans = a + b; q = `${A} có ${a} ${it}, mẹ cho ${A} thêm ${b} ${it}. Hỏi ${A} có tất cả bao nhiêu ${it}?`; ex = `Thêm vào thì làm phép cộng: ${a} + ${b} = ${ans}.`; break; }
    case 'sub': { const a = R(3, max), b = R(1, a - 1); ans = a - b; q = `${A} có ${a} ${it}, ${A} cho ${B} ${b} ${it}. Hỏi ${A} còn lại bao nhiêu ${it}?`; ex = `Bớt đi thì làm phép trừ: ${a} − ${b} = ${ans}.`; break; }
    case 'more': { const a = R(2, max - 2), b = R(1, max - a); ans = a + b; q = `${A} có ${a} ${it}. ${B} có nhiều hơn ${A} ${b} ${it}. Hỏi ${B} có bao nhiêu ${it}?`; ex = `"Nhiều hơn" thì cộng: ${a} + ${b} = ${ans}.`; break; }
    case 'less': { const a = R(3, max), b = R(1, a - 1); ans = a - b; q = `${A} có ${a} ${it}. ${B} có ít hơn ${A} ${b} ${it}. Hỏi ${B} có bao nhiêu ${it}?`; ex = `"Ít hơn" thì trừ: ${a} − ${b} = ${ans}.`; break; }
    case 'addsub': return wp(pickOne(['add', 'sub', 'more', 'less']), max);
    case 'mul': { const a = R(2, max), b = R(2, 9); ans = a * b; q = `Mỗi ${box} có ${a} ${it}. Hỏi ${b} ${box} như thế có bao nhiêu ${it}?`; ex = `${a} được lấy ${b} lần: ${a} × ${b} = ${ans}.`; break; }
    case 'div': { const b = R(2, max), a = R(2, 9); ans = a; q = `Có ${a * b} ${it} chia đều vào ${b} ${box}. Hỏi mỗi ${box} có mấy ${it}?`; ex = `Chia đều thì làm phép chia: ${a * b} : ${b} = ${a}.`; break; }
    case 'two': {
      const k = R(0, 2);
      if (k === 0) { const a = R(20, 60), b = R(5, 30); ans = a + a + b; q = `Thùng thứ nhất có ${a} lít nước. Thùng thứ hai có nhiều hơn thùng thứ nhất ${b} lít. Hỏi cả hai thùng có bao nhiêu lít nước?`; unit = 'lít'; ex = `Thùng thứ hai: ${a} + ${b} = ${a + b} (lít). Cả hai thùng: ${a} + ${a + b} = ${ans} (lít).`; }
      else if (k === 1) { const a = R(3, 9), b = R(2, 6), c = R(5, 20); ans = a * b + c; q = `${A} có ${b} ${box} ${it}, mỗi ${box} có ${a} ${it}. ${A} có thêm ${c} ${it} nữa. Hỏi ${A} có tất cả bao nhiêu ${it}?`; ex = `${b} ${box}: ${a} × ${b} = ${a * b}. Tất cả: ${a * b} + ${c} = ${ans}.`; }
      else { const a = R(4, 9), b = R(3, 8); const tot = a * b + R(5, 20); ans = tot - a * b; q = `Cửa hàng có ${tot} ${it}. Đã bán ${b} ${box}, mỗi ${box} ${a} ${it}. Hỏi cửa hàng còn lại bao nhiêu ${it}?`; ex = `Đã bán: ${a} × ${b} = ${a * b}. Còn lại: ${tot} − ${a * b} = ${ans}.`; }
      break;
    }
    case 'three': {
      const a = R(2, 5), p = R(5, 9) * 1000, b = R(2, 4), qq = R(3, 6) * 1000; const spent = a * p + b * qq; const pay = Math.ceil((spent + 1000) / 10000) * 10000;
      ans = pay - spent; unit = 'đồng';
      q = `${A} mua ${a} quyển vở, mỗi quyển giá ${fmt(p)} đồng và ${b} cái bút, mỗi cái giá ${fmt(qq)} đồng. ${A} đưa cô bán hàng ${fmt(pay)} đồng. Hỏi cô trả lại ${A} bao nhiêu tiền?`;
      ex = `Tiền vở: ${a} × ${fmt(p)} = ${fmt(a * p)}. Tiền bút: ${b} × ${fmt(qq)} = ${fmt(b * qq)}. Tổng: ${fmt(spent)}. Trả lại: ${fmt(pay)} − ${fmt(spent)} = ${fmt(ans)} đồng.`; break;
    }
    case 'sumdiff': {
      const small = R(10, 200), d = R(2, 80) * 2 % 200 + 2; const big = small + d; const S = big + small; const askBig = Math.random() < .5; ans = askBig ? big : small; unit = '';
      q = `Tổng của hai số là ${S}, hiệu của hai số là ${d}. Tìm số ${askBig ? 'lớn' : 'bé'}.`;
      ex = askBig ? `Số lớn = (Tổng + Hiệu) : 2 = (${S} + ${d}) : 2 = ${big}.` : `Số bé = (Tổng − Hiệu) : 2 = (${S} − ${d}) : 2 = ${small}.`; break;
    }
    case 'sumratio': {
      const m = R(1, 5), n = R(m + 1, 9); const u = R(3, 40); const S = (m + n) * u; const askBig = Math.random() < .5; ans = askBig ? n * u : m * u; unit = '';
      q = `Tổng của hai số là ${S}. Số bé bằng ${fracHtml(m, n)} số lớn. Tìm số ${askBig ? 'lớn' : 'bé'}.`;
      ex = `Tổng số phần bằng nhau: ${m} + ${n} = ${m + n}. Một phần: ${S} : ${m + n} = ${u}. Số ${askBig ? 'lớn' : 'bé'}: ${u} × ${askBig ? n : m} = ${ans}.`; break;
    }
    case 'diffratio': {
      const m = R(1, 5), n = R(m + 1, 9); const u = R(3, 40); const D = (n - m) * u; const askBig = Math.random() < .5; ans = askBig ? n * u : m * u; unit = '';
      q = `Hiệu của hai số là ${D}. Số bé bằng ${fracHtml(m, n)} số lớn. Tìm số ${askBig ? 'lớn' : 'bé'}.`;
      ex = `Hiệu số phần bằng nhau: ${n} − ${m} = ${n - m}. Một phần: ${D} : ${n - m} = ${u}. Số ${askBig ? 'lớn' : 'bé'}: ${u} × ${askBig ? n : m} = ${ans}.`; break;
    }
  }
  return { title: 'Giải bài toán', q, fig: '', kind: 'num', ans: plain(ans), unit, ex };
}

/* ---------- đổi đơn vị ---------- */
const UNITS = {
  len1: [['dm', 'cm', 10]],
  len2: [['m', 'dm', 10], ['m', 'cm', 100], ['dm', 'cm', 10], ['km', 'm', 1000]],
  mm: [['cm', 'mm', 10], ['dm', 'mm', 100], ['m', 'mm', 1000]],
  mass: [['kg', 'g', 1000]],
  mass2: [['yến', 'kg', 10], ['tạ', 'kg', 100], ['tấn', 'kg', 1000], ['tạ', 'yến', 10], ['tấn', 'tạ', 10]],
  cap: [['l', 'ml', 1000]],
  area: [['dm²', 'cm²', 100], ['m²', 'dm²', 100], ['m²', 'cm²', 10000], ['cm²', 'mm²', 100]],
  area2: [['km²', 'ha', 100], ['ha', 'm²', 10000], ['km²', 'm²', 1000000]],
  vol: [['dm³', 'cm³', 1000], ['m³', 'dm³', 1000], ['m³', 'cm³', 1000000]],
  time: [['phút', 'giây', 60], ['giờ', 'phút', 60], ['thế kỉ', 'năm', 100]],
  time2: [['giờ', 'phút', 60], ['phút', 'giây', 60], ['ngày', 'giờ', 24], ['năm', 'tháng', 12], ['tuần', 'ngày', 7], ['thế kỉ', 'năm', 100]]
};
function unitConv(kind) {
  const [big, small, k] = pickOne(UNITS[kind]); const mode = R(0, 2);
  if (mode === 0) { const a = R(2, 9); return { title: 'Đổi đơn vị', q: `${a} ${big} = ? ${small}`, kind: 'num', ans: plain(a * k), unit: small, ex: `1 ${big} = ${fmt(k)} ${small}, nên ${a} ${big} = ${a} × ${fmt(k)} = ${fmt(a * k)} ${small}.` }; }
  if (mode === 1) { const a = R(2, 9); return { title: 'Đổi đơn vị', q: `${fmt(a * k)} ${small} = ? ${big}`, kind: 'num', ans: plain(a), unit: big, ex: `${fmt(k)} ${small} = 1 ${big}, nên ${fmt(a * k)} ${small} = ${fmt(a * k)} : ${fmt(k)} = ${a} ${big}.` }; }
  const a = R(1, 9), b = R(1, k - 1 > 9 ? Math.min(k - 1, 99) : k - 1);
  return { title: 'Đổi đơn vị', q: `${a} ${big} ${fmt(b)} ${small} = ? ${small}`, kind: 'num', ans: plain(a * k + b), unit: small, ex: `${a} ${big} = ${fmt(a * k)} ${small}; ${fmt(a * k)} + ${fmt(b)} = ${fmt(a * k + b)} ${small}.` };
}

/* ---------- các dạng bài ---------- */
const GEN = {
  count(a = 0, b = 10) {
    const n = R(a, b), [e, name] = pickOne(OBJS);
    return { title: 'Đếm và chọn số đúng', q: `Có bao nhiêu ${name}?`, fig: n ? objRow(n, e) : `<div class="objs empty">Không có ${name} nào</div>`, kind: 'mc', opts: mcNum(n, [1, 2]), ans: fmt(n), ex: n ? `Đếm lần lượt từng ${name}: có ${n} ${name}.` : 'Không có gì thì viết số 0.' };
  },
  seq(max = 10, step = 1) {
    step = +step; const n = 5; const start = R(0, Math.max(0, Math.floor(max / step) - n)) * step; const hole = R(0, n - 1); const v = start + hole * step;
    return { title: 'Điền số còn thiếu', q: `Số nào còn thiếu trên tia số?`, fig: numberLine(start, step, n, hole), kind: 'num', ans: plain(v), ex: `Mỗi vạch hơn nhau ${step} đơn vị, nên số cần điền là ${fmt(v)}.` };
  },
  numline(max = 100) { return GEN.seq(max, pickOne([1, 2, 5, 10])); },
  nextprev(max = 100) {
    const n = R(1, max - 1), next = Math.random() < .5;
    return { title: next ? 'Số liền sau' : 'Số liền trước', q: `Số liền ${next ? 'sau' : 'trước'} của ${fmt(n)} là số nào?`, kind: 'num', ans: plain(next ? n + 1 : n - 1), ex: next ? `Số liền sau thì thêm 1: ${fmt(n)} + 1 = ${fmt(n + 1)}.` : `Số liền trước thì bớt 1: ${fmt(n)} − 1 = ${fmt(n - 1)}.` };
  },
  morefewer(max = 10) {
    const [e1] = pickOne(OBJS), [e2] = pickOne(OBJS); const a = R(1, max), b = Math.random() < .25 ? a : R(1, max);
    const ans = a > b ? 'Hàng trên nhiều hơn' : a < b ? 'Hàng dưới nhiều hơn' : 'Hai hàng bằng nhau';
    return { title: 'Nhiều hơn, ít hơn, bằng nhau', q: 'Hàng nào nhiều hơn?', fig: objRow(a, e1) + objRow(b, e2), kind: 'mc', opts: ['Hàng trên nhiều hơn', 'Hàng dưới nhiều hơn', 'Hai hàng bằng nhau'], ans, ex: `Hàng trên có ${a}, hàng dưới có ${b}. ${ans}.` };
  },
  cmp(max = 10) {
    let a = R(0, max), b = Math.random() < .2 ? a : R(0, max);
    if (max >= 1000 && Math.random() < .5) { b = a + pickOne([1, -1, 10, -10, 100]); if (b < 0) b = a + 1; }
    const s = a > b ? '>' : a < b ? '<' : '=';
    return { title: 'So sánh hai số', q: `Chọn dấu thích hợp: <b class="num">${fmt(a)} … ${fmt(b)}</b>`, kind: 'mc', opts: ['>', '<', '='], ans: s, big: true, ex: `${fmt(a)} ${s} ${fmt(b)}. ${s === '=' ? 'Hai số bằng nhau.' : `Số ${fmt(Math.max(a, b))} lớn hơn.`}` };
  },
  order(max = 10) {
    const set = new Set(); while (set.size < 4) set.add(R(0, max)); const arr = [...set]; const big = Math.random() < .5;
    const ans = big ? Math.max(...arr) : Math.min(...arr);
    return { title: big ? 'Tìm số lớn nhất' : 'Tìm số bé nhất', q: `Trong các số <b class="num">${arr.map(fmt).join('; ')}</b>, số nào ${big ? 'lớn nhất' : 'bé nhất'}?`, kind: 'mc', opts: mix(arr.map(fmt)), ans: fmt(ans), ex: `So sánh từng cặp số: số ${big ? 'lớn nhất' : 'bé nhất'} là ${fmt(ans)}.` };
  },
  split(max = 10) {
    const n = R(2, max), a = R(1, n - 1); const [e] = pickOne(OBJS);
    return { title: 'Mấy và mấy', q: `${n} gồm ${a} và mấy?`, fig: `<div class="objs">${Array.from({ length: n }, (_, i) => `<span class="${i < a ? '' : 'dim'}">${e}</span>`).join('')}</div>`, kind: 'num', ans: plain(n - a), ex: `${n} gồm ${a} và ${n - a} (vì ${a} + ${n - a} = ${n}).` };
  },
  numword(a = 10, b = 99, step = 1) {
    const n = Math.floor(R(+a, +b) / step) * step; const toWord = Math.random() < .5;
    if (toWord) { const pool = nearNums(n, 3).map(docSo); return { title: 'Đọc số', q: `Số <b class="num">${fmt(n)}</b> đọc là:`, kind: 'mc', opts: mix([docSo(n), ...pool]), ans: docSo(n), one: true, ex: `${fmt(n)} đọc là "${docSo(n)}".` }; }
    return { title: 'Viết số', q: `Viết số: <b>${docSo(n)}</b>`, kind: 'num', ans: plain(n), ex: `"${docSo(n)}" viết là ${fmt(n)}.` };
  },
  tensones(max = 99) {
    const t = R(1, Math.floor(max / 10)), o = R(0, 9); const n = t * 10 + o; const pic = Math.random() < .6;
    if (pic) return { title: 'Số chục và đơn vị', q: 'Có tất cả bao nhiêu khối vuông? (mỗi thanh xanh là 1 chục)', fig: tensOnesSvg(t, o), kind: 'num', ans: plain(n), ex: `${t} chục và ${o} đơn vị là ${n}.` };
    return { title: 'Số chục và đơn vị', q: `Số gồm <b>${t} chục</b> và <b>${o} đơn vị</b> là số nào?`, kind: 'num', ans: plain(n), ex: `${t} chục là ${t * 10}, thêm ${o} đơn vị được ${n}.` };
  },
  place(d = 3) {
    d = +d; const n = R(pow10(d - 1), pow10(d) - 1); const s = String(n); const names = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn', 'trăm nghìn', 'triệu', 'chục triệu', 'trăm triệu'];
    const k = R(0, d - 1); const digit = +s[d - 1 - k];
    const pool = [...new Set([String(digit), ...mix(s.split('')), ...mix('0123456789'.split(''))])].slice(0, 4);
    return { title: 'Giá trị theo hàng', q: `Trong số <b class="num">${fmt(n)}</b>, chữ số hàng <b>${names[k]}</b> là chữ số nào?`, kind: 'mc', opts: mix(pool), ans: String(digit), ex: `Đếm từ phải sang trái: đơn vị, chục, trăm, … Chữ số hàng ${names[k]} của ${fmt(n)} là ${digit}.` };
  },
  placeclass() {
    const n = R(1e6, 999999999); const cls = pickOne([['đơn vị', n % 1000], ['nghìn', Math.floor(n / 1000) % 1000], ['triệu', Math.floor(n / 1e6)]]);
    return { title: 'Hàng và lớp', q: `Số <b class="num">${fmt(n)}</b>: lớp <b>${cls[0]}</b> gồm các chữ số tạo thành số nào?`, kind: 'num', ans: plain(cls[1]), ex: `Tách số thành từng nhóm 3 chữ số từ phải sang trái: lớp đơn vị, lớp nghìn, lớp triệu. Lớp ${cls[0]} là ${String(cls[1])}.` };
  },
  expand(d = 3) {
    d = +d; let n = R(pow10(d - 1), pow10(d) - 1); const s = String(n).split('').map(Number); const parts = s.map((x, i) => x * pow10(d - 1 - i)).filter(x => x);
    const hide = R(0, parts.length - 1); const shown = parts.map((p, i) => i === hide ? '?' : fmt(p));
    return { title: 'Viết số thành tổng', q: `<b class="num">${fmt(n)} = ${shown.join(' + ')}</b>`, kind: 'num', ans: plain(parts[hide]), ex: `${fmt(n)} = ${parts.map(fmt).join(' + ')}.` };
  },
  round(max = 10000, to = 10) {
    to = +to; const n = R(to + 1, max - 1); const r = Math.round(n / to) * to;
    return { title: 'Làm tròn số', q: `Làm tròn số <b class="num">${fmt(n)}</b> đến hàng ${{ 10: 'chục', 100: 'trăm', 1000: 'nghìn', 10000: 'chục nghìn', 100000: 'trăm nghìn' }[to]}.`, kind: 'num', ans: plain(r), ex: `Nhìn chữ số ngay bên phải hàng cần làm tròn: bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên. Kết quả: ${fmt(r)}.` };
  },
  roman(max = 20) {
    const R1 = n => { const m = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, c] of m) while (n >= v) { s += c; n -= v; } return s; };
    const n = R(1, max); if (Math.random() < .5) return { title: 'Chữ số La Mã', q: `Số La Mã <b>${R1(n)}</b> là số nào?`, kind: 'mc', opts: mcNum(n, [1, 2, 5]), ans: fmt(n), ex: `I = 1, V = 5, X = 10. ${R1(n)} = ${n}.` };
    const pool = nearNums(n, 3, [1, 2, 5]).filter(x => x >= 1).map(R1); return { title: 'Chữ số La Mã', q: `Số <b>${n}</b> viết bằng chữ số La Mã là:`, kind: 'mc', opts: mix([R1(n), ...pool.slice(0, 3)]), ans: R1(n), ex: `I = 1, V = 5, X = 10. ${n} = ${R1(n)}.` };
  },
  evenodd(max = 100) {
    const n = R(0, max); const ans = n % 2 ? 'Số lẻ' : 'Số chẵn';
    return { title: 'Số chẵn, số lẻ', q: `Số <b class="num">${fmt(n)}</b> là số chẵn hay số lẻ?`, kind: 'mc', opts: ['Số chẵn', 'Số lẻ'], ans, ex: `Chữ số tận cùng là ${n % 10}. Số có tận cùng 0, 2, 4, 6, 8 là số chẵn; 1, 3, 5, 7, 9 là số lẻ.` };
  },

  /* ----- cộng trừ ----- */
  addpic(max = 10) {
    const [e] = pickOne(OBJS); const a = R(1, max - 1), b = R(1, max - a);
    return { title: 'Gộp lại', q: `Gộp hai nhóm lại thì được bao nhiêu? <b class="num">${a} + ${b} = ?</b>`, fig: `<div class="row" style="justify-content:center;gap:6px;flex-wrap:wrap">${objRow(a, e, 'inline')}<b class="opsign">+</b>${objRow(b, e, 'inline')}</div>`, kind: 'num', ans: plain(a + b), ex: `${a} thêm ${b} là ${a + b}.` };
  },
  subpic(max = 10) {
    const [e] = pickOne(OBJS); const a = R(2, max), b = R(1, a - 1);
    return { title: 'Bớt đi', q: `Có ${a}, bớt đi ${b} (gạch chéo). Còn lại bao nhiêu? <b class="num">${a} − ${b} = ?</b>`, fig: `<div class="objs">${Array.from({ length: a }, (_, i) => `<span class="${i >= a - b ? 'cross' : ''}">${e}</span>`).join('')}</div>`, kind: 'num', ans: plain(a - b), ex: `${a} bớt ${b} còn ${a - b}.` };
  },
  add(max = 10, carry = 0) {
    let a, b;
    if (+carry === 1) { a = R(2, 9); b = R(11 - a, 9); } else { a = R(0, max); b = R(0, max - a); }
    return { title: 'Tính', q: `<b class="num big">${a} + ${b} = ?</b>`, kind: 'num', ans: plain(a + b), ex: +carry === 1 ? `Tách để làm tròn 10: ${a} + ${b} = ${Math.max(a, b)} + ${10 - Math.max(a, b) % 10} + ${Math.min(a, b) - (10 - Math.max(a, b) % 10)} = ${a + b}.` : `${a} + ${b} = ${a + b}.` };
  },
  sub(max = 10, borrow = 0) {
    let a, b;
    if (+borrow === 1) { b = R(2, 9); a = 10 + R(1, b - 1); } else { a = R(1, max); b = R(0, a); }
    return { title: 'Tính', q: `<b class="num big">${a} − ${b} = ?</b>`, kind: 'num', ans: plain(a - b), ex: +borrow === 1 ? `Trừ để về 10 trước: ${a} − ${a - 10} = 10, rồi 10 − ${b - (a - 10)} = ${a - b}.` : `${a} − ${b} = ${a - b}.` };
  },
  addx(d1 = 2, d2 = 1, carry = 2) {
    d1 = +d1; d2 = +d2; carry = +carry; let a, b, g = 0; const lim = d1 <= 2 ? 100 : pow10(d1 + (d1 >= 3 ? 0 : 0));
    const has = (x, y) => { while (x || y) { if (x % 10 + y % 10 >= 10) return true; x = Math.floor(x / 10); y = Math.floor(y / 10); } return false; };
    do { a = R(pow10(d1 - 1), pow10(d1) - 1); b = R(pow10(d2 - 1), pow10(d2) - 1); g++; }
    while (g < 300 && ((a + b >= lim && d1 <= 3) || (carry === 0 && has(a, b)) || (carry === 1 && !has(a, b))));
    return { title: 'Đặt tính rồi tính', q: `<b class="num big">${fmt(a)} + ${fmt(b)} = ?</b>`, fig: colOp(a, b, '+'), kind: 'num', ans: plain(a + b), ex: `Cộng từ phải sang trái (hàng đơn vị trước)${carry ? ', nhớ 1 sang hàng bên trái khi tổng từ 10 trở lên' : ''}: ${fmt(a)} + ${fmt(b)} = ${fmt(a + b)}.` };
  },
  subx(d1 = 2, d2 = 1, borrow = 2) {
    d1 = +d1; d2 = +d2; borrow = +borrow; let a, b, g = 0;
    const has = (x, y) => { while (y) { if (x % 10 < y % 10) return true; x = Math.floor(x / 10); y = Math.floor(y / 10); } return false; };
    do { a = R(pow10(d1 - 1), pow10(d1) - 1); b = R(pow10(d2 - 1), pow10(d2) - 1); g++; }
    while (g < 300 && (b > a || (borrow === 0 && has(a, b)) || (borrow === 1 && !has(a, b))));
    if (b > a) [a, b] = [b, a];
    return { title: 'Đặt tính rồi tính', q: `<b class="num big">${fmt(a)} − ${fmt(b)} = ?</b>`, fig: colOp(a, b, '−'), kind: 'num', ans: plain(a - b), ex: `Trừ từ phải sang trái${borrow ? '; chữ số trên bé hơn thì mượn 1 chục, rồi trả 1 vào hàng bên trái của số trừ' : ''}: ${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.` };
  },
  missing(max = 10) {
    max = +max; const op = Math.random() < .5 ? '+' : '−'; const a = R(1, Math.floor(max / 2)), b = R(1, Math.floor(max / 2)); const c = a + b; const pos = R(0, 1);
    if (op === '+') return { title: 'Tìm số còn thiếu', q: `<b class="num big">${pos ? fmt(a) + ' + ?' : '? + ' + fmt(b)} = ${fmt(c)}</b>`, kind: 'num', ans: plain(pos ? b : a), ex: `Muốn tìm số hạng chưa biết, lấy tổng trừ số hạng đã biết: ${fmt(c)} − ${fmt(pos ? a : b)} = ${fmt(pos ? b : a)}.` };
    return { title: 'Tìm số còn thiếu', q: `<b class="num big">${pos ? fmt(c) + ' − ?' : '? − ' + fmt(b)} = ${fmt(a)}</b>`, kind: 'num', ans: plain(pos ? b : c), ex: pos ? `Số trừ = Số bị trừ − Hiệu: ${fmt(c)} − ${fmt(a)} = ${fmt(b)}.` : `Số bị trừ = Hiệu + Số trừ: ${fmt(a)} + ${fmt(b)} = ${fmt(c)}.` };
  },
  diff(max = 100) {
    const a = R(5, max), b = R(1, a - 1); const [A, B] = two(NAMES); const [it] = pickOne(ITEMS);
    return { title: 'Hơn, kém nhau bao nhiêu', q: `${A} có ${a} ${it}, ${B} có ${b} ${it}. ${A} có nhiều hơn ${B} bao nhiêu ${it}?`, kind: 'num', ans: plain(a - b), ex: `Lấy số lớn trừ số bé: ${a} − ${b} = ${a - b}.` };
  },
  parts(k = 1) {
    k = +k;
    if (k === 1) { const a = R(10, 60), b = R(1, 30); const isAdd = Math.random() < .5; const role = pickOne(isAdd ? [['Số hạng', a], ['Tổng', a + b]] : [['Số bị trừ', a + b], ['Số trừ', b], ['Hiệu', a]]); const pool = isAdd ? ['Số hạng', 'Tổng', 'Hiệu', 'Số trừ'] : ['Số bị trừ', 'Số trừ', 'Hiệu', 'Tổng']; return { title: 'Thành phần của phép tính', q: `Trong phép tính <b class="num">${isAdd ? `${a} + ${b} = ${a + b}` : `${a + b} − ${b} = ${a}`}</b>, số <b>${role[1]}</b> được gọi là gì?`, kind: 'mc', opts: mix(pool), ans: role[0], ex: isAdd ? `Số hạng + Số hạng = Tổng.` : `Số bị trừ − Số trừ = Hiệu.` }; }
    if (k === 2) { const a = R(2, 5), b = R(2, 9); const role = pickOne([['Thừa số', a], ['Tích', a * b]]); return { title: 'Thừa số, tích', q: `Trong phép nhân <b class="num">${a} × ${b} = ${a * b}</b>, số <b>${role[1]}</b> được gọi là gì?`, kind: 'mc', opts: ['Thừa số', 'Tích', 'Thương', 'Số chia'], ans: role[0], ex: 'Thừa số × Thừa số = Tích.' }; }
    const b = R(2, 5), q = R(2, 9); const role = pickOne([['Số bị chia', b * q], ['Số chia', b], ['Thương', q]]); return { title: 'Số bị chia, số chia, thương', q: `Trong phép chia <b class="num">${b * q} : ${b} = ${q}</b>, số <b>${role[1]}</b> được gọi là gì?`, kind: 'mc', opts: ['Số bị chia', 'Số chia', 'Thương', 'Tích'], ans: role[0], ex: 'Số bị chia : Số chia = Thương.' };
  },

  /* ----- nhân chia ----- */
  repadd(max = 5) {
    const a = R(2, +max), b = R(2, 5); const [e] = pickOne(OBJS);
    return { title: 'Phép nhân', q: `<b class="num">${Array(b).fill(a).join(' + ')} = ${a} × ?</b>`, fig: `<div class="stack" style="gap:4px;align-items:center">${Array.from({ length: b }, () => objRow(a, e, 'inline')).join('')}</div>`, kind: 'num', ans: plain(b), ex: `${a} được lấy ${b} lần nên viết ${a} × ${b} = ${a * b}.` };
  },
  mul(...ts) {
    const list = expandTables(ts); const t = pickOne(list), b = R(1, 10); const sw = Math.random() < .3;
    return { title: `Bảng nhân ${t}`, q: `<b class="num big">${sw ? b : t} × ${sw ? t : b} = ?</b>`, kind: 'num', ans: plain(t * b), ex: `${t} × ${b} = ${t * b}${b > 1 ? ` (${t} được lấy ${b} lần)` : ''}.` };
  },
  div(...ts) {
    const list = expandTables(ts); const t = pickOne(list), b = R(1, 10);
    return { title: `Bảng chia ${t}`, q: `<b class="num big">${t * b} : ${t} = ?</b>`, kind: 'num', ans: plain(b), ex: `Vì ${t} × ${b} = ${t * b} nên ${t * b} : ${t} = ${b}.` };
  },
  divshare(max = 5) {
    const b = R(2, +max), a = R(2, 5); const [e, name] = pickOne(OBJS);
    return { title: 'Phép chia', q: `Chia đều ${a * b} ${name} vào ${b} nhóm. Mỗi nhóm có mấy ${name}? <b class="num">${a * b} : ${b} = ?</b>`, fig: objRow(a * b, e), kind: 'num', ans: plain(a), ex: `${a * b} : ${b} = ${a} vì ${b} × ${a} = ${a * b}.` };
  },
  missmul(maxT = 9) {
    const a = R(2, +maxT), b = R(2, 9); const k = R(0, 2);
    if (k === 0) return { title: 'Tìm thừa số', q: `<b class="num big">${a} × ? = ${a * b}</b>`, kind: 'num', ans: plain(b), ex: `Thừa số chưa biết = Tích : Thừa số đã biết = ${a * b} : ${a} = ${b}.` };
    if (k === 1) return { title: 'Tìm số bị chia', q: `<b class="num big">? : ${a} = ${b}</b>`, kind: 'num', ans: plain(a * b), ex: `Số bị chia = Thương × Số chia = ${b} × ${a} = ${a * b}.` };
    return { title: 'Tìm số chia', q: `<b class="num big">${a * b} : ? = ${b}</b>`, kind: 'num', ans: plain(a), ex: `Số chia = Số bị chia : Thương = ${a * b} : ${b} = ${a}.` };
  },
  mulx(d1 = 2, d2 = 1) {
    d1 = +d1; d2 = +d2; let a = R(pow10(d1 - 1), pow10(d1) - 1), b = d2 === 1 ? R(2, 9) : R(pow10(d2 - 1), pow10(d2) - 1);
    if (d1 === 2 && d2 === 1) { a = R(11, Math.floor(99 / 1)); if (a * b > 999) a = R(11, Math.floor(999 / b)); }
    if (d1 >= 4 && d2 === 1) { const lim = d1 === 4 ? 10000 : d1 === 5 ? 100000 : 1e7; while (a * b >= lim) a = R(pow10(d1 - 1), Math.floor((lim - 1) / b)); }
    return { title: 'Phép nhân', q: `<b class="num big">${fmt(a)} × ${fmt(b)} = ?</b>`, fig: colOp(a, b, '×'), kind: 'num', ans: plain(a * b), ex: `Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái: ${fmt(a)} × ${fmt(b)} = ${fmt(a * b)}.` };
  },
  divx(d1 = 2, d2 = 1) {
    d1 = +d1; d2 = +d2; let b, q, g = 0;
    do { b = d2 === 1 ? R(2, 9) : R(pow10(d2 - 1), pow10(d2) - 1); q = R(Math.ceil(pow10(d1 - 1) / b), Math.floor((pow10(d1) - 1) / b)); g++; } while (g < 50 && q < 2);
    return { title: 'Phép chia', q: `<b class="num big">${fmt(b * q)} : ${fmt(b)} = ?</b>`, kind: 'num', ans: plain(q), ex: `Chia lần lượt từ trái sang phải. Thử lại: ${fmt(q)} × ${fmt(b)} = ${fmt(b * q)}.` };
  },
  divrem(max = 50) {
    const b = R(2, 9), q = R(1, Math.floor(+max / b)), r = R(1, b - 1); const askR = Math.random() < .6;
    return { title: 'Phép chia có dư', q: `<b class="num big">${b * q + r} : ${b} = ${askR ? q + ' (dư ?)' : '? (dư ' + r + ')'}</b>`, kind: 'num', ans: plain(askR ? r : q), ex: `${b} × ${q} = ${b * q}; ${b * q + r} − ${b * q} = ${r}. Vậy ${b * q + r} : ${b} = ${q} (dư ${r}). Số dư luôn bé hơn số chia.` };
  },
  times(kind = 'up') {
    const [it] = pickOne(ITEMS); const [A, B] = two(NAMES);
    if (kind === 'up') { const a = R(2, 20), k = R(2, 6); return { title: 'Gấp một số lên nhiều lần', q: `${A} có ${a} ${it}. Số ${it} của ${B} gấp ${k} lần của ${A}. Hỏi ${B} có bao nhiêu ${it}?`, kind: 'num', ans: plain(a * k), ex: `Gấp ${k} lần thì nhân với ${k}: ${a} × ${k} = ${a * k}.` }; }
    if (kind === 'down') { const k = R(2, 6), a = R(2, 15) * k; return { title: 'Giảm một số đi nhiều lần', q: `${A} có ${a} ${it}. Số ${it} của ${B} bằng số ${it} của ${A} giảm đi ${k} lần. Hỏi ${B} có bao nhiêu ${it}?`, kind: 'num', ans: plain(a / k), ex: `Giảm ${k} lần thì chia cho ${k}: ${a} : ${k} = ${a / k}.` }; }
    const s = R(2, 12), k = R(2, 8); return { title: 'Số lớn gấp mấy lần số bé', q: `Số lớn là ${s * k}, số bé là ${s}. Số lớn gấp mấy lần số bé?`, kind: 'num', ans: plain(k), ex: `Lấy số lớn chia cho số bé: ${s * k} : ${s} = ${k} (lần).` };
  },
  expr(lv = 1) {
    const k = R(0, 3); let s, v;
    const a = R(2, 9), b = R(2, 9), c = R(10, 99);
    if (k === 0) { s = `${c} + ${a} × ${b}`; v = c + a * b; }
    else if (k === 1) { s = `${c + a * b} − ${a} × ${b}`; v = c; }
    else if (k === 2) { s = `(${c} + ${a}) × ${b}`; v = (c + a) * b; }
    else { const m = a * b; s = `${m * 3} : ${a} + ${c}`; v = m * 3 / a + c; }
    return { title: 'Tính giá trị biểu thức', q: `<b class="num big">${s} = ?</b>`, kind: 'num', ans: plain(v), ex: `Trong ngoặc làm trước; nhân, chia làm trước cộng, trừ. Kết quả: ${fmt(v)}.` };
  },
  exprvar() {
    const a = R(2, 50), b = R(2, 30), k = R(0, 2); let s, v;
    if (k === 0) { s = `a + ${b}`; v = a + b; } else if (k === 1) { s = `${b * 3 + a} − a`; v = b * 3; } else { s = `a × ${R(2, 9)}`; v = a * +s.split('× ')[1]; }
    return { title: 'Biểu thức chứa chữ', q: `Tính giá trị của biểu thức <b class="num">${s}</b> với <b>a = ${a}</b>.`, kind: 'num', ans: plain(v), ex: `Thay a = ${a} vào biểu thức rồi tính: ${s.replace('a', a)} = ${fmt(v)}.` };
  },
  mul10() {
    const k = pickOne([10, 100, 1000]); const isMul = Math.random() < .5; const a = R(2, 999);
    return isMul ? { title: 'Nhân với 10, 100, 1000', q: `<b class="num big">${fmt(a)} × ${fmt(k)} = ?</b>`, kind: 'num', ans: plain(a * k), ex: `Nhân với ${fmt(k)} thì viết thêm ${String(k).length - 1} chữ số 0 vào bên phải: ${fmt(a * k)}.` }
      : { title: 'Chia cho 10, 100, 1000', q: `<b class="num big">${fmt(a * k)} : ${fmt(k)} = ?</b>`, kind: 'num', ans: plain(a), ex: `Chia cho ${fmt(k)} thì bỏ bớt ${String(k).length - 1} chữ số 0 ở bên phải: ${fmt(a)}.` };
  },
  props(kind = 'add') {
    const a = R(12, 999), b = R(12, 999), c = R(2, 99);
    if (kind === 'add') { const k = R(0, 1); return k ? { title: 'Tính chất giao hoán', q: `<b class="num">${a} + ${b} = ${b} + ?</b>`, kind: 'num', ans: plain(a), ex: 'Đổi chỗ các số hạng trong một tổng thì tổng không thay đổi.' } : { title: 'Tính nhanh', q: `<b class="num">${a} + ${100 - a % 100} + ${b} = ?</b>`, kind: 'num', ans: plain(a + 100 - a % 100 + b), ex: `Nhóm ${a} + ${100 - a % 100} = ${a + 100 - a % 100} cho tròn trăm trước, rồi cộng ${b}.` }; }
    if (kind === 'mul') { const x = pickOne([[2, 5], [4, 25], [5, 20], [2, 50], [8, 125]]); const m = R(3, 99); return { title: 'Tính nhanh', q: `<b class="num">${x[0]} × ${m} × ${x[1]} = ?</b>`, kind: 'num', ans: plain(x[0] * x[1] * m), ex: `Đổi chỗ, nhóm ${x[0]} × ${x[1]} = ${x[0] * x[1]} trước rồi nhân với ${m}: ${fmt(x[0] * x[1] * m)}.` }; }
    const m = R(2, 9), p = R(11, 89), q = 100 - p; return { title: 'Nhân một số với một tổng', q: `<b class="num">${m} × ${p} + ${m} × ${q} = ?</b>`, kind: 'num', ans: plain(m * 100), ex: `a × b + a × c = a × (b + c) = ${m} × (${p} + ${q}) = ${m} × 100 = ${m * 100}.` };
  },
  estround() {
    const a = R(21, 98), b = R(21, 98); const ra = Math.round(a / 10) * 10, rb = Math.round(b / 10) * 10; const est = ra * rb;
    return { title: 'Ước lượng', q: `Kết quả của <b class="num">${a} × ${b}</b> gần với số nào nhất?`, kind: 'mc', opts: mix([est, est * 10, Math.max(10, est / 10), est + ra * 5].map(fmt)), ans: fmt(est), ex: `Làm tròn: ${a} ≈ ${ra}, ${b} ≈ ${rb}. ${ra} × ${rb} = ${fmt(est)}.` };
  },

  /* ----- hình học ----- */
  shape2(set = 1) {
    const sets = { 1: ['vuông', 'tròn', 'tam giác', 'chữ nhật'], 2: ['tứ giác', 'tam giác', 'tròn', 'vuông'], 3: ['tam giác', 'tứ giác', 'chữ nhật', 'vuông'], 4: ['bình hành', 'thoi', 'chữ nhật', 'vuông', 'thang'], 5: ['thang', 'bình hành', 'tam giác', 'tròn'] };
    const pool = sets[set] || sets[1]; const k = pickOne(pool); const name = x => 'Hình ' + x;
    return { title: 'Nhận biết hình', q: 'Đây là hình gì?', fig: `<div class="figbox">${shapeSvg(k)}</div>`, kind: 'mc', opts: mix([k, ...mix(pool.filter(x => x !== k)).slice(0, 3)]).map(name), ans: name(k), ex: SHAPE_TIP[k] || `Đây là hình ${k}.` };
  },
  shapecount(lv = 1) {
    const kinds = +lv === 1 ? ['tam giác', 'vuông', 'tròn', 'chữ nhật'] : ['tam giác', 'tứ giác', 'tròn', 'vuông'];
    const target = pickOne(kinds); const n = R(6, 9); const arr = []; for (let i = 0; i < n; i++) arr.push(pickOne(kinds)); if (!arr.includes(target)) arr[0] = target;
    const cnt = arr.filter(x => x === target || (target === 'tứ giác' && ['vuông', 'chữ nhật'].includes(x))).length;
    const cols = ['f-sky', 'f-gold', 'f-jade', 'f-pri', 'f-plum'];
    return { title: 'Đếm hình', q: `Có bao nhiêu <b>hình ${target}</b>?`, fig: `<div class="shapes">${arr.map(x => shapeSvg(x, undefined, undefined, pickOne(cols))).join('')}</div>`, kind: 'num', ans: plain(cnt), ex: `Đếm cẩn thận từng hình ${target}: có ${cnt} hình.${target === 'tứ giác' ? ' Hình vuông và hình chữ nhật cũng là hình tứ giác.' : ''}` };
  },
  shape3(set = 1) {
    const s = +set; const pool = s === 1 ? ['khối lập phương', 'khối hộp chữ nhật'] : ['khối lập phương', 'khối hộp chữ nhật', 'khối trụ', 'khối cầu'];
    if (s === 3 && Math.random() < .5) { const k = pickOne([['mặt', 6], ['đỉnh', 8], ['cạnh', 12]]); const solid = pickOne(['khối lập phương', 'khối hộp chữ nhật']); return { title: 'Khối hình', q: `${cap(solid)} có bao nhiêu ${k[0]}?`, fig: `<div class="figbox">${solidSvg(solid)}</div>`, kind: 'num', ans: plain(k[1]), ex: `Khối lập phương và khối hộp chữ nhật đều có 6 mặt, 8 đỉnh, 12 cạnh.` }; }
    const k = pickOne(pool);
    return { title: 'Nhận biết khối', q: 'Đây là khối gì?', fig: `<div class="figbox">${solidSvg(k)}</div>`, kind: 'mc', opts: mix(pool).map(cap), ans: cap(k), ex: SOLID_TIP[k] };
  },
  position() {
    const items = mix(OBJS).slice(0, 3); const k = R(0, 1);
    if (k === 0) { const mid = items[1]; const left = Math.random() < .5; const ans = left ? items[0] : items[2];
      return { title: 'Bên trái, bên phải', q: `Bạn nào ở bên <b>${left ? 'trái' : 'phải'}</b> ${mid[1]}?`, fig: `<div class="objs big3">${items.map(x => `<span>${x[0]}</span>`).join('')}</div><p class="tiny muted" style="text-align:center;font-weight:800">⬅️ Trái · Phải ➡️</p>`, kind: 'mc', opts: mix(items.filter(x => x !== mid).map(x => cap(x[1]))), ans: cap(ans[1]), ex: `Bên tay trái của con là bên trái. ${cap(ans[1])} ở bên ${left ? 'trái' : 'phải'} ${mid[1]}.` }; }
    const top = Math.random() < .5; const [a, b] = items;
    return { title: 'Trên, dưới', q: `Bạn nào ở <b>${top ? 'trên' : 'dưới'}</b>?`, fig: `<div class="stack" style="align-items:center;gap:0"><div class="objs big3"><span>${a[0]}</span></div><div class="shelf"></div><div class="objs big3"><span>${b[0]}</span></div></div>`, kind: 'mc', opts: mix([cap(a[1]), cap(b[1])]), ans: cap(top ? a[1] : b[1]), ex: `${cap(a[1])} ở trên, ${b[1]} ở dưới.` };
  },
  longer() {
    const a = R(3, 12), b = R(3, 12) === a ? a + 2 : R(3, 12); const bb = a === b ? b + 2 : b; const ask = Math.random() < .5;
    const ans = ask ? (a > bb ? 'Bút chì xanh' : 'Bút chì cam') : (a < bb ? 'Bút chì xanh' : 'Bút chì cam');
    return { title: 'Dài hơn, ngắn hơn', q: `Bút chì nào <b>${ask ? 'dài hơn' : 'ngắn hơn'}</b>?`, fig: svg(320, 90, `<rect x="10" y="12" width="${a * 24}" height="22" rx="4" class="f-sky"/><polygon points="${10 + a * 24},12 ${30 + a * 24},23 ${10 + a * 24},34" class="f-ink"/><rect x="10" y="54" width="${bb * 24}" height="22" rx="4" class="f-gold"/><polygon points="${10 + bb * 24},54 ${30 + bb * 24},65 ${10 + bb * 24},76" class="f-ink"/>`), kind: 'mc', opts: ['Bút chì xanh', 'Bút chì cam'], ans, ex: 'Đặt hai bút thẳng hàng ở một đầu, bút nào thò ra xa hơn thì dài hơn.' };
  },
  heavier() {
    const pairs = [['quả dưa hấu', 'quả cam'], ['con voi', 'con mèo'], ['cái bàn', 'quyển vở'], ['bao gạo', 'cái bút'], ['quả bí ngô', 'quả nho']];
    const [h, l] = pickOne(pairs); const ask = Math.random() < .5;
    return { title: 'Nặng hơn, nhẹ hơn', q: `Vật nào <b>${ask ? 'nặng hơn' : 'nhẹ hơn'}</b>?`, kind: 'mc', opts: mix([cap(h), cap(l)]), ans: cap(ask ? h : l), ex: `${cap(h)} nặng hơn ${l}. Đơn vị đo khối lượng là ki-lô-gam (kg).` };
  },
  ruler(max = 15) {
    max = +max; const len = R(2, max - 2), start = R(0, Math.min(3, max - len));
    return { title: 'Đo độ dài', q: 'Băng giấy màu dài bao nhiêu xăng-ti-mét?', fig: rulerSvg(len, max, start), kind: 'num', ans: plain(len), unit: 'cm', ex: start ? `Băng giấy bắt đầu ở vạch ${start} và kết thúc ở vạch ${start + len}: ${start + len} − ${start} = ${len} cm.` : `Đặt đầu băng giấy trùng vạch 0, đầu kia chỉ vạch ${len}: dài ${len} cm.` };
  },
  estimate() {
    const it = pickOne([['cái bút chì', 15, 'cm'], ['quyển sách', 25, 'cm'], ['cái bàn học', 1, 'm'], ['cục tẩy', 4, 'cm'], ['cái cửa ra vào', 2, 'm']]);
    const ans = `Khoảng ${it[1]} ${it[2]}`; const pool = it[2] === 'cm' ? [`Khoảng ${it[1] * 10} cm`, `Khoảng ${it[1] * 10} m`, `Khoảng ${Math.max(1, Math.round(it[1] / 5))} mm`] : [`Khoảng ${it[1]} cm`, `Khoảng ${it[1] * 10} m`, `Khoảng ${it[1] * 100} km`];
    return { title: 'Ước lượng độ dài', q: `${cap(it[0])} dài khoảng bao nhiêu?`, kind: 'mc', opts: mix([ans, ...pool]), ans, one: true, ex: `${cap(it[0])} dài khoảng ${it[1]} ${it[2]}. Hãy so với gang tay của con (khoảng 12–15 cm).` };
  },
  uarith(unit = 'cm', max = 100, nocarry = 0) {
    max = +max; const add = Math.random() < .5; let a = R(1, max), b = R(1, max);
    if (add) { while (a + b > max) { a = R(1, max - 1); b = R(1, max - a); } } else if (b > a) [a, b] = [b, a];
    if (+nocarry) { if (add) { while ((a % 10) + (b % 10) >= 10 || a + b > max) { a = R(1, max - 1); b = R(1, max - a); } } else { while (a % 10 < b % 10) { a = R(10, max); b = R(1, a); } } }
    return { title: 'Tính với đơn vị đo', q: `<b class="num big">${fmt(a)} ${unit} ${add ? '+' : '−'} ${fmt(b)} ${unit} = ?</b>`, kind: 'num', ans: plain(add ? a + b : a - b), unit, ex: `Tính như với số tự nhiên rồi viết đơn vị: ${fmt(add ? a + b : a - b)} ${unit}.` };
  },
  unit(kind = 'len2') { return unitConv(kind); },
  polyline(lv = 2) {
    const n = R(2, 4); const segs = Array.from({ length: n }, () => R(2, 9)); let x = 20, y = 75, pts = `${x},${y}`, labels = '';
    segs.forEach((s, i) => { const nx = x + 50 + R(0, 10), ny = i % 2 ? 75 : 22; labels += `<text x="${(x + nx) / 2 + (i % 2 ? 14 : -14)}" y="${(y + ny) / 2 - 4}" font-size="13" font-weight="800" class="t-pri t-halo" text-anchor="middle">${s} cm</text>`; x = nx; y = ny; pts += ` ${x},${y}`; });
    return { title: 'Độ dài đường gấp khúc', q: 'Đường gấp khúc dài bao nhiêu xăng-ti-mét?', fig: svg(x + 30, 95, `<polyline points="${pts}" fill="none" class="s-ink" stroke-width="4" stroke-linejoin="round"/>${pts.split(' ').map(p => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="5" class="f-pri"/>`).join('')}${labels}`), kind: 'num', ans: plain(segs.reduce((a, b) => a + b, 0)), unit: 'cm', ex: `Cộng độ dài các đoạn thẳng: ${segs.join(' + ')} = ${segs.reduce((a, b) => a + b, 0)} cm.` };
  },
  lines() {
    const k = pickOne([
      ['đoạn thẳng', `<line x1="30" y1="45" x2="190" y2="45" class="s-ink" stroke-width="4"/><circle cx="30" cy="45" r="5" class="f-pri"/><circle cx="190" cy="45" r="5" class="f-pri"/><text x="24" y="30" class="t-ink" font-weight="800">A</text><text x="186" y="30" class="t-ink" font-weight="800">B</text>`],
      ['đường thẳng', `<line x1="0" y1="45" x2="220" y2="45" class="s-ink" stroke-width="4"/><circle cx="70" cy="45" r="5" class="f-pri"/><circle cx="150" cy="45" r="5" class="f-pri"/><text x="64" y="30" class="t-ink" font-weight="800">A</text><text x="146" y="30" class="t-ink" font-weight="800">B</text>`],
      ['đường cong', `<path d="M10 60 C 60 0, 120 100, 210 30" fill="none" class="s-ink" stroke-width="4"/>`],
      ['ba điểm thẳng hàng', `<line x1="20" y1="70" x2="200" y2="20" class="s-line" stroke-width="2" stroke-dasharray="6 6"/><circle cx="30" cy="67" r="6" class="f-pri"/><circle cx="110" cy="45" r="6" class="f-pri"/><circle cx="190" cy="23" r="6" class="f-pri"/>`]]);
    return { title: 'Điểm, đoạn thẳng, đường thẳng', q: 'Hình vẽ dưới đây là gì?', fig: svg(220, 90, k[1]), kind: 'mc', opts: mix(['Đoạn thẳng', 'Đường thẳng', 'Đường cong', 'Ba điểm thẳng hàng']), ans: cap(k[0]), one: true, ex: { 'đoạn thẳng': 'Đoạn thẳng có hai đầu là hai điểm.', 'đường thẳng': 'Đường thẳng kéo dài mãi về hai phía.', 'đường cong': 'Đường cong không thẳng, uốn lượn.', 'ba điểm thẳng hàng': 'Ba điểm cùng nằm trên một đường thẳng là ba điểm thẳng hàng.' }[k[0]] };
  },
  midpoint() {
    const ab = R(2, 12) * 2; return { title: 'Trung điểm của đoạn thẳng', q: `M là trung điểm của đoạn thẳng AB dài ${ab} cm. Đoạn AM dài bao nhiêu xăng-ti-mét?`, fig: svg(240, 60, `<line x1="20" y1="30" x2="220" y2="30" class="s-ink" stroke-width="4"/><circle cx="20" cy="30" r="5" class="f-ink"/><circle cx="220" cy="30" r="5" class="f-ink"/><circle cx="120" cy="30" r="6" class="f-pri"/><text x="14" y="54" font-weight="800" class="t-ink">A</text><text x="214" y="54" font-weight="800" class="t-ink">B</text><text x="113" y="54" font-weight="800" class="t-pri">M</text>`), kind: 'num', ans: plain(ab / 2), unit: 'cm', ex: `Trung điểm chia đôi đoạn thẳng: ${ab} : 2 = ${ab / 2} cm.` };
  },
  circle() {
    const r = R(2, 15); const askD = Math.random() < .5;
    return { title: 'Bán kính, đường kính', q: askD ? `Hình tròn có bán kính ${r} cm. Đường kính dài bao nhiêu xăng-ti-mét?` : `Hình tròn có đường kính ${2 * r} cm. Bán kính dài bao nhiêu xăng-ti-mét?`, fig: svg(150, 150, `<circle cx="75" cy="75" r="62" class="f-sky-soft s-ink" stroke-width="3"/><line x1="13" y1="75" x2="137" y2="75" class="s-pri" stroke-width="3" stroke-dasharray="${askD ? '0' : '6 4'}"/><circle cx="75" cy="75" r="5" class="f-ink"/><text x="70" y="68" font-weight="800" class="t-ink">O</text>`), kind: 'num', ans: plain(askD ? 2 * r : r), unit: 'cm', ex: `Đường kính dài gấp 2 lần bán kính.` };
  },
  angle(set = 1) {
    if (+set === 1) { const right = Math.random() < .5; const d = right ? 90 : pickOne([40, 60, 120, 140]); return { title: 'Góc vuông, góc không vuông', q: 'Đây là góc vuông hay góc không vuông?', fig: `<div class="figbox">${angleSvg(d)}</div>`, kind: 'mc', opts: ['Góc vuông', 'Góc không vuông'], ans: right ? 'Góc vuông' : 'Góc không vuông', ex: 'Dùng ê-ke để kiểm tra: góc trùng với góc vuông của ê-ke là góc vuông.' }; }
    const k = pickOne([['Góc nhọn', R(25, 75)], ['Góc vuông', 90], ['Góc tù', R(110, 160)], ['Góc bẹt', 180]]);
    return { title: 'Góc nhọn, góc tù, góc bẹt', q: 'Đây là góc gì?', fig: `<div class="figbox">${angleSvg(k[1])}</div>`, kind: 'mc', opts: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'], ans: k[0], ex: 'Góc nhọn bé hơn góc vuông (90°); góc tù lớn hơn góc vuông và bé hơn góc bẹt (180°).' };
  },
  angledeg() {
    const d = pickOne([30, 45, 60, 90, 120, 135, 150, 180]);
    if (Math.random() < .5) return { title: 'Số đo góc', q: `Góc dưới đây có số đo bao nhiêu độ?`, fig: `<div class="figbox">${angleSvg(d, d + '°?')}</div>`.replace(`${d}°?`, '?'), kind: 'mc', opts: mix([d, ...mix([30, 45, 60, 90, 120, 135, 150, 180].filter(x => Math.abs(x - d) >= 30)).slice(0, 3)]).map(x => x + '°'), ans: d + '°', ex: `Đặt tâm thước đo góc trùng đỉnh góc, một cạnh trùng vạch 0°: cạnh kia chỉ ${d}°.` };
    const k = pickOne([['góc vuông', 90], ['góc bẹt', 180]]); return { title: 'Số đo góc', q: `Một ${k[0]} có số đo bằng bao nhiêu độ?`, kind: 'mc', opts: ['45°', '90°', '180°', '360°'], ans: k[1] + '°', ex: 'Góc vuông bằng 90°, góc bẹt bằng 180°.' };
  },
  perpar(k = 1) {
    const isPerp = Math.random() < (+k === 1 ? .7 : .3); const lines = isPerp ? `<line x1="20" y1="80" x2="200" y2="80" class="s-ink" stroke-width="4"/><line x1="110" y1="10" x2="110" y2="130" class="s-pri" stroke-width="4"/><path d="M110 64 H126 V80" fill="none" class="s-ink3" stroke-width="2"/>` : `<line x1="20" y1="40" x2="200" y2="40" class="s-ink" stroke-width="4"/><line x1="20" y1="100" x2="200" y2="100" class="s-pri" stroke-width="4"/>`;
    return { title: 'Vuông góc, song song', q: 'Hai đường thẳng dưới đây như thế nào với nhau?', fig: svg(220, 140, lines), kind: 'mc', opts: ['Vuông góc với nhau', 'Song song với nhau'], ans: isPerp ? 'Vuông góc với nhau' : 'Song song với nhau', ex: isPerp ? 'Hai đường thẳng cắt nhau tạo thành 4 góc vuông là hai đường thẳng vuông góc.' : 'Hai đường thẳng song song không bao giờ cắt nhau.' };
  },
  perim(kind) {
    const k = kind || pickOne(['rect', 'square', 'tri', 'quad']);
    if (k === 'rect') { const a = R(4, 20), b = R(2, a - 1); return { title: 'Chu vi hình chữ nhật', q: `Hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Tính chu vi.`, fig: `<div class="figbox">${shapeSvg('chữ nhật')}</div>`, kind: 'num', ans: plain(2 * (a + b)), unit: 'cm', ex: `Chu vi = (dài + rộng) × 2 = (${a} + ${b}) × 2 = ${2 * (a + b)} cm.` }; }
    if (k === 'square') { const a = R(2, 25); return { title: 'Chu vi hình vuông', q: `Hình vuông có cạnh ${a} cm. Tính chu vi.`, fig: `<div class="figbox">${shapeSvg('vuông')}</div>`, kind: 'num', ans: plain(4 * a), unit: 'cm', ex: `Chu vi = cạnh × 4 = ${a} × 4 = ${4 * a} cm.` }; }
    const n = k === 'tri' ? 3 : 4; const s = Array.from({ length: n }, () => R(3, 15));
    return { title: `Chu vi hình ${n === 3 ? 'tam giác' : 'tứ giác'}`, q: `Hình ${n === 3 ? 'tam giác' : 'tứ giác'} có các cạnh dài ${s.join(' cm, ')} cm. Tính chu vi.`, fig: `<div class="figbox">${shapeSvg(n === 3 ? 'tam giác' : 'tứ giác')}</div>`, kind: 'num', ans: plain(s.reduce((a, b) => a + b)), unit: 'cm', ex: `Chu vi là tổng độ dài các cạnh: ${s.join(' + ')} = ${s.reduce((a, b) => a + b)} cm.` };
  },
  areagrid() {
    const cols = R(4, 7), rows = R(3, 5); const cells = new Set(); const n = R(4, Math.min(14, cols * rows - 2)); while (cells.size < n) cells.add(R(0, cols * rows - 1));
    return { title: 'Diện tích theo ô vuông', q: 'Mỗi ô vuông là 1 cm². Phần tô màu có diện tích bao nhiêu xăng-ti-mét vuông?', fig: gridArea(cells, cols, rows), kind: 'num', ans: plain(n), unit: 'cm²', ex: `Đếm số ô vuông được tô: ${n} ô, nên diện tích là ${n} cm².` };
  },
  area(kind = 'rect') {
    if (kind === 'rect') { if (Math.random() < .5) { const a = R(2, 9); return { title: 'Diện tích hình vuông', q: `Hình vuông có cạnh ${a} cm. Tính diện tích.`, fig: `<div class="figbox">${shapeSvg('vuông')}</div>`, kind: 'num', ans: plain(a * a), unit: 'cm²', ex: `Diện tích = cạnh × cạnh = ${a} × ${a} = ${a * a} cm².` }; } const a = R(3, 12), b = R(2, a - 1); return { title: 'Diện tích hình chữ nhật', q: `Hình chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm. Tính diện tích.`, fig: `<div class="figbox">${shapeSvg('chữ nhật')}</div>`, kind: 'num', ans: plain(a * b), unit: 'cm²', ex: `Diện tích = dài × rộng = ${a} × ${b} = ${a * b} cm².` }; }
    if (kind === 'tri') { const a = R(3, 20), h = R(2, 16); const v = a * h / 2; return { title: 'Diện tích hình tam giác', q: `Hình tam giác có độ dài đáy ${a} cm, chiều cao ${h} cm. Tính diện tích.`, fig: svg(180, 120, `<polygon points="20,105 160,105 70,15" class="f-sky-soft s-ink" stroke-width="3"/><line x1="70" y1="15" x2="70" y2="105" class="s-pri" stroke-width="2" stroke-dasharray="5 4"/>`), kind: 'num', ans: plain(v), unit: 'cm²', ex: `S = đáy × chiều cao : 2 = ${a} × ${h} : 2 = ${fmt(v)} cm².` }; }
    if (kind === 'trap') { const a = R(6, 20), b = R(2, a - 2), h = R(2, 12); const v = (a + b) * h / 2; return { title: 'Diện tích hình thang', q: `Hình thang có hai đáy ${a} cm và ${b} cm, chiều cao ${h} cm. Tính diện tích.`, fig: `<div class="figbox">${shapeSvg('thang')}</div>`, kind: 'num', ans: plain(v), unit: 'cm²', ex: `S = (đáy lớn + đáy bé) × chiều cao : 2 = (${a} + ${b}) × ${h} : 2 = ${fmt(v)} cm².` }; }
  },
  circlecs() {
    const r = R(1, 10); const askC = Math.random() < .5; const v = askC ? round2(r * 2 * 3.14) : round2(r * r * 3.14);
    return { title: askC ? 'Chu vi hình tròn' : 'Diện tích hình tròn', q: `Hình tròn có bán kính ${r} cm. Tính ${askC ? 'chu vi' : 'diện tích'} (lấy π = 3,14).`, fig: svg(150, 150, `<circle cx="75" cy="75" r="62" class="f-sky-soft s-ink" stroke-width="3"/><line x1="75" y1="75" x2="137" y2="75" class="s-pri" stroke-width="3"/><circle cx="75" cy="75" r="4" class="f-ink"/><text x="96" y="68" font-weight="800" class="t-pri">r</text>`), kind: 'num', ans: plain(v), unit: askC ? 'cm' : 'cm²', ex: askC ? `C = r × 2 × 3,14 = ${r} × 2 × 3,14 = ${fmt(v)} cm.` : `S = r × r × 3,14 = ${r} × ${r} × 3,14 = ${fmt(v)} cm².` };
  },
  volcount() {
    const a = R(2, 4), b = R(2, 3), c = R(1, 3); let body = ''; const s = 20;
    for (let z = 0; z < c; z++) for (let y = b - 1; y >= 0; y--) for (let x = 0; x < a; x++) { const px = 20 + x * s + y * 10, py = 100 - z * s - y * 10; body += `<g><polygon points="${px},${py} ${px + s},${py} ${px + s},${py - s} ${px},${py - s}" class="f-gold-soft s-ink" stroke-width="1.5"/><polygon points="${px},${py - s} ${px + 10},${py - s - 10} ${px + s + 10},${py - s - 10} ${px + s},${py - s}" class="f-gold s-ink" stroke-width="1.5"/><polygon points="${px + s},${py} ${px + s + 10},${py - 10} ${px + s + 10},${py - s - 10} ${px + s},${py - s}" class="f-gold-soft s-ink" stroke-width="1.5"/></g>`; }
    return { title: 'Thể tích', q: `Hình dưới được xếp từ các hình lập phương nhỏ 1 cm³ (${a} × ${b} khối mỗi lớp, ${c} lớp). Thể tích của hình là bao nhiêu xăng-ti-mét khối?`, fig: svg(a * s + b * 10 + 50, 120 + 0, body), kind: 'num', ans: plain(a * b * c), unit: 'cm³', ex: `Mỗi lớp có ${a} × ${b} = ${a * b} hình, ${c} lớp: ${a * b} × ${c} = ${a * b * c} cm³.` };
  },
  surf(kind = 'box') {
    if (kind === 'cube') { const a = R(2, 12); const tp = Math.random() < .5; return { title: `Diện tích ${tp ? 'toàn phần' : 'xung quanh'} hình lập phương`, q: `Hình lập phương có cạnh ${a} cm. Tính diện tích ${tp ? 'toàn phần' : 'xung quanh'}.`, fig: `<div class="figbox">${solidSvg('khối lập phương')}</div>`, kind: 'num', ans: plain(a * a * (tp ? 6 : 4)), unit: 'cm²', ex: `Diện tích một mặt: ${a} × ${a} = ${a * a}. ${tp ? 'Toàn phần = 6 mặt' : 'Xung quanh = 4 mặt'}: ${a * a} × ${tp ? 6 : 4} = ${a * a * (tp ? 6 : 4)} cm².` }; }
    const a = R(4, 15), b = R(2, a - 1), c = R(2, 10); const xq = 2 * (a + b) * c, tp = xq + 2 * a * b; const askTp = Math.random() < .5;
    return { title: `Diện tích ${askTp ? 'toàn phần' : 'xung quanh'} hình hộp chữ nhật`, q: `Hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính diện tích ${askTp ? 'toàn phần' : 'xung quanh'}.`, fig: `<div class="figbox">${solidSvg('khối hộp chữ nhật')}</div>`, kind: 'num', ans: plain(askTp ? tp : xq), unit: 'cm²', ex: `Sxq = (dài + rộng) × 2 × cao = (${a} + ${b}) × 2 × ${c} = ${xq} cm².${askTp ? ` Stp = Sxq + 2 × dài × rộng = ${xq} + 2 × ${a} × ${b} = ${tp} cm².` : ''}` };
  },
  volume(kind = 'box') {
    if (kind === 'cube') { const a = R(2, 12); return { title: 'Thể tích hình lập phương', q: `Hình lập phương có cạnh ${a} cm. Tính thể tích.`, fig: `<div class="figbox">${solidSvg('khối lập phương')}</div>`, kind: 'num', ans: plain(a ** 3), unit: 'cm³', ex: `V = cạnh × cạnh × cạnh = ${a} × ${a} × ${a} = ${a ** 3} cm³.` }; }
    const a = R(3, 15), b = R(2, 10), c = R(2, 10);
    return { title: 'Thể tích hình hộp chữ nhật', q: `Hình hộp chữ nhật có chiều dài ${a} cm, chiều rộng ${b} cm, chiều cao ${c} cm. Tính thể tích.`, fig: `<div class="figbox">${solidSvg('khối hộp chữ nhật')}</div>`, kind: 'num', ans: plain(a * b * c), unit: 'cm³', ex: `V = dài × rộng × cao = ${a} × ${b} × ${c} = ${a * b * c} cm³.` };
  },
  net() {
    const k = pickOne([['hình lập phương', '6 hình vuông bằng nhau'], ['hình hộp chữ nhật', '6 hình chữ nhật (từng cặp đối diện bằng nhau)'], ['hình trụ', '2 hình tròn và 1 hình chữ nhật']]);
    return { title: 'Hình khai triển', q: `Hình khai triển của <b>${k[0]}</b> gồm những hình nào?`, kind: 'mc', opts: mix(['6 hình vuông bằng nhau', '6 hình chữ nhật (từng cặp đối diện bằng nhau)', '2 hình tròn và 1 hình chữ nhật', '4 hình tam giác']), ans: k[1], one: true, ex: `Cắt và trải phẳng ${k[0]} ta được ${k[1]}.` };
  },

  /* ----- thời gian, tiền ----- */
  clock(lv = 1) {
    lv = +lv; const h = R(1, 12); const m = lv === 1 ? 0 : lv === 2 ? pickOne([0, 15, 30, 45]) : lv === 3 ? R(0, 11) * 5 : R(0, 59);
    const t = (H, M) => M ? `${H} giờ ${M} phút` : `${H} giờ`;
    const pool = new Set([t(h, m)]); let g = 0; while (pool.size < 4 && g++ < 50) { const hh = ((h + pickOne([1, -1, 2, 6]) + 11) % 12) + 1; const mm = lv === 1 ? 0 : (m + pickOne([0, 15, 30, 5]) * (lv >= 3 ? 1 : 1)) % 60; pool.add(Math.random() < .5 ? t(hh, m) : t(h, mm)); }
    return { title: 'Xem đồng hồ', q: 'Đồng hồ chỉ mấy giờ?', fig: `<div class="figbox">${clockSvg(h, m)}</div>`, kind: 'mc', opts: mix([...pool]), ans: t(h, m), ex: `Kim ngắn chỉ giờ, kim dài (màu đỏ) chỉ phút. Đồng hồ chỉ ${t(h, m)}.` };
  },
  timeconv(lv = 1) {
    const k = R(0, 2);
    if (k === 0) { const d = R(1, 3); return { title: 'Ngày và giờ', q: `${d} ngày có bao nhiêu giờ?`, kind: 'num', ans: plain(24 * d), unit: 'giờ', ex: `1 ngày có 24 giờ, ${d} ngày có 24 × ${d} = ${24 * d} giờ.` }; }
    if (k === 1) { const h = R(13, 23); return { title: 'Giờ buổi chiều, tối', q: `${h} giờ còn gọi là mấy giờ chiều/tối?`, kind: 'num', ans: plain(h - 12), unit: 'giờ', ex: `${h} giờ = ${h - 12} giờ ${h < 18 ? 'chiều' : 'tối'} (${h} − 12 = ${h - 12}).` }; }
    return { title: 'Giờ và phút', q: `1 giờ bằng bao nhiêu phút?`, kind: 'num', ans: '60', unit: 'phút', ex: '1 giờ = 60 phút.' };
  },
  weekday() {
    const days = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']; const i = R(0, 6); const d = pickOne([1, -1, 2]);
    const ans = days[(i + d + 7) % 7]; const word = d === 1 ? 'Ngày mai' : d === -1 ? 'Hôm qua' : 'Ngày kia';
    return { title: 'Các ngày trong tuần', q: `Hôm nay là <b>${days[i]}</b>. ${word} là thứ mấy?`, kind: 'mc', opts: mcText(ans, days), ans, ex: `Một tuần có 7 ngày: Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu, Thứ Bảy, Chủ nhật. ${word} là ${ans}.` };
  },
  calendar(lv = 1) {
    const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; const k = R(0, 1);
    if (+lv === 2 && k === 0) { const m = R(1, 12); return { title: 'Tháng – năm', q: `Tháng ${m} (năm không nhuận) có bao nhiêu ngày?`, kind: 'mc', opts: ['28', '30', '31'], ans: String(months[m - 1]), ex: 'Tháng 4, 6, 9, 11 có 30 ngày; tháng 2 có 28 hoặc 29 ngày; các tháng còn lại có 31 ngày.' }; }
    if (+lv === 2) return { title: 'Tháng – năm', q: 'Một năm có bao nhiêu tháng?', kind: 'num', ans: '12', unit: 'tháng', ex: 'Một năm có 12 tháng.' };
    const d = R(1, 20), add = R(2, 7); return { title: 'Xem lịch', q: `Hôm nay là ngày ${d}. Sau ${add} ngày nữa là ngày bao nhiêu (cùng tháng)?`, kind: 'num', ans: plain(d + add), ex: `${d} + ${add} = ${d + add}.` };
  },
  century() {
    const y = R(1001, 2099); const c = Math.ceil(y / 100); const RN = n => { const m = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, ch] of m) while (n >= v) { s += ch; n -= v; } return s; };
    return { title: 'Thế kỉ', q: `Năm ${y} thuộc thế kỉ nào?`, kind: 'mc', opts: mix([c, c - 1, c + 1, c - 2].map(x => 'Thế kỉ ' + RN(x))), ans: 'Thế kỉ ' + RN(c), ex: `Từ năm ${(c - 1) * 100 + 1} đến năm ${c * 100} là thế kỉ ${RN(c)} (thế kỉ ${c}).` };
  },
  money(lv = 1) {
    const notes = +lv === 1 ? [1000, 2000, 5000, 10000] : [1000, 2000, 5000, 10000, 20000, 50000, 100000];
    const n = R(2, 3); const arr = Array.from({ length: n }, () => pickOne(notes)); const s = arr.reduce((a, b) => a + b, 0);
    return { title: 'Tiền Việt Nam', q: 'Có tất cả bao nhiêu tiền?', fig: `<div class="notes">${arr.map(moneyNote).join('')}</div>`, kind: 'mc', opts: mcNum(s, [1000, 2000, 5000]).map(x => x + ' đồng'), ans: fmt(s) + ' đồng', ex: `Cộng các tờ tiền: ${arr.map(fmt).join(' + ')} = ${fmt(s)} đồng.` };
  },
  thermo() {
    const t = R(15, 40); const pct = (t - 0) / 50;
    return { title: 'Nhiệt độ', q: 'Nhiệt kế chỉ bao nhiêu độ C?', fig: svg(120, 220, `<rect x="45" y="10" width="30" height="170" rx="15" class="f-surface s-ink" stroke-width="3"/><circle cx="60" cy="190" r="22" class="f-wrong s-ink" stroke-width="3"/><rect x="53" y="${180 - pct * 160}" width="14" height="${pct * 160 + 10}" class="f-wrong"/>${[0, 10, 20, 30, 40, 50].map(v => `<line x1="75" y1="${180 - v / 50 * 160}" x2="88" y2="${180 - v / 50 * 160}" class="s-ink" stroke-width="2"/><text x="92" y="${184 - v / 50 * 160}" font-size="12" font-weight="800" class="t-ink">${v}</text>`).join('')}${[5, 15, 25, 35, 45].map(v => `<line x1="75" y1="${180 - v / 50 * 160}" x2="82" y2="${180 - v / 50 * 160}" class="s-ink3" stroke-width="1.5"/>`).join('')}`), kind: 'mc', opts: mcNum(t, [1, 2, 5]).map(x => x + ' °C'), ans: t + ' °C', ex: `Đọc vạch ngang với đỉnh cột màu đỏ: ${t} °C. Mỗi vạch nhỏ là 1 °C.` };
  },
  tadd() {
    const h1 = R(1, 5), m1 = R(5, 55), h2 = R(1, 3), m2 = R(5, 55); const add = Math.random() < .5 || h1 * 60 + m1 <= h2 * 60 + m2;
    const tot = add ? (h1 + h2) * 60 + m1 + m2 : (h1 * 60 + m1) - (h2 * 60 + m2); const H = Math.floor(tot / 60), M = tot % 60; const t = (a, b) => `${a} giờ ${b} phút`;
    return { title: add ? 'Cộng số đo thời gian' : 'Trừ số đo thời gian', q: `<b class="num">${t(h1, m1)} ${add ? '+' : '−'} ${t(h2, m2)} = ?</b>`, kind: 'mc', opts: mix([t(H, M), t(H + 1, M), t(Math.max(0, H - 1), (M + 30) % 60), t(H, (M + 10) % 60)]).filter((v, i, a) => a.indexOf(v) === i), ans: t(H, M), one: true, ex: `Tính riêng giờ và phút; phút từ 60 trở lên thì đổi 60 phút = 1 giờ${add ? '' : '; phút bé hơn thì mượn 1 giờ = 60 phút'}. Kết quả: ${t(H, M)}.` };
  },
  tmul() {
    const h = R(1, 4), m = R(10, 50), k = R(2, 4); const isMul = Math.random() < .5;
    if (isMul) { const tot = (h * 60 + m) * k; return { title: 'Nhân số đo thời gian', q: `<b class="num">${h} giờ ${m} phút × ${k} = ?</b>`, kind: 'mc', opts: mix([`${Math.floor(tot / 60)} giờ ${tot % 60} phút`, `${h * k} giờ ${m * k} phút`.replace(/ (\d+) phút/, (s, x) => +x >= 60 ? ` ${+x - 10} phút` : s), `${Math.floor(tot / 60) + 1} giờ ${tot % 60} phút`, `${Math.floor(tot / 60)} giờ ${(tot % 60 + 20) % 60} phút`]).filter((v, i, a) => a.indexOf(v) === i), ans: `${Math.floor(tot / 60)} giờ ${tot % 60} phút`, one: true, ex: `Nhân giờ và phút với ${k} rồi đổi phút: ${h * k} giờ ${m * k} phút = ${Math.floor(tot / 60)} giờ ${tot % 60} phút.` }; }
    const tot = (h * 60 + m) * k; return { title: 'Chia số đo thời gian', q: `<b class="num">${Math.floor(tot / 60)} giờ ${tot % 60} phút : ${k} = ?</b>`, kind: 'mc', opts: mix([`${h} giờ ${m} phút`, `${h + 1} giờ ${m} phút`, `${h} giờ ${(m + 15) % 60} phút`, `${Math.max(0, h - 1)} giờ ${m} phút`]).filter((v, i, a) => a.indexOf(v) === i), ans: `${h} giờ ${m} phút`, one: true, ex: `Đổi ra phút: ${tot} phút : ${k} = ${h * 60 + m} phút = ${h} giờ ${m} phút.` };
  },
  motion(kind = 'v') {
    const v = R(4, 60), t = R(2, 5), s = v * t; const veh = v < 15 ? 'Một người đi xe đạp' : v < 45 ? 'Một xe máy' : 'Một ô tô';
    if (kind === 'v') return { title: 'Vận tốc', q: `${veh} đi quãng đường ${s} km trong ${t} giờ. Tính vận tốc.`, kind: 'num', ans: plain(v), unit: 'km/giờ', ex: `v = s : t = ${s} : ${t} = ${v} km/giờ.` };
    if (kind === 's') return { title: 'Quãng đường', q: `${veh} đi với vận tốc ${v} km/giờ trong ${t} giờ. Tính quãng đường.`, kind: 'num', ans: plain(s), unit: 'km', ex: `s = v × t = ${v} × ${t} = ${s} km.` };
    return { title: 'Thời gian', q: `${veh} đi quãng đường ${s} km với vận tốc ${v} km/giờ. Hỏi đi hết bao nhiêu giờ?`, kind: 'num', ans: plain(t), unit: 'giờ', ex: `t = s : v = ${s} : ${v} = ${t} giờ.` };
  },

  /* ----- phân số ----- */
  fracpart(lv = 1) {
    if (+lv === 1) { const n = R(2, 8); return { title: 'Một phần mấy', q: 'Phần tô màu là một phần mấy của hình?', fig: `<div class="figbox">${fracSvg(n, 1)}</div>`, kind: 'mc', opts: mix([n, ...nearNums(n, 3, [1, 2]).filter(x => x >= 2)]).slice(0, 4).map(x => '1/' + x), ans: '1/' + n, frac: true, ex: `Hình được chia thành ${n} phần bằng nhau, tô màu 1 phần: một phần ${n} (viết 1/${n}).` }; }
    const n = R(2, 10), k = R(1, n - 1);
    return { title: 'Phân số', q: 'Viết phân số chỉ phần đã tô màu.', fig: `<div class="figbox">${fracSvg(n, k)}</div>`, kind: 'frac', ans: fracStr(k, n), exact: true, ex: `Mẫu số ${n} là số phần bằng nhau; tử số ${k} là số phần được tô màu: ${k}/${n}.` };
  },
  fracdiv() {
    const a = R(1, 15), b = R(2, 12);
    return { title: 'Phân số và phép chia', q: `Viết thương của phép chia <b class="num">${a} : ${b}</b> dưới dạng phân số.`, kind: 'frac', ans: fracStr(a, b), exact: true, ex: `Thương của phép chia số tự nhiên cho số tự nhiên (khác 0) viết thành phân số: tử số là số bị chia, mẫu số là số chia: ${a}/${b}.` };
  },
  fraceq() {
    const a = R(1, 8), b = R(a + 1, 10), k = R(2, 6); const up = Math.random() < .5;
    return up ? { title: 'Phân số bằng nhau', q: `<span class="num big">${fracHtml(a, b)} = ${fracHtml('?', b * k)}</span>`, kind: 'num', ans: plain(a * k), ex: `Mẫu số nhân ${k} (${b} × ${k} = ${b * k}) thì tử số cũng nhân ${k}: ${a} × ${k} = ${a * k}.` }
      : { title: 'Phân số bằng nhau', q: `<span class="num big">${fracHtml(a * k, b * k)} = ${fracHtml(a, '?')}</span>`, kind: 'num', ans: plain(b), ex: `Tử số chia ${k} (${a * k} : ${k} = ${a}) thì mẫu số cũng chia ${k}: ${b * k} : ${k} = ${b}.` };
  },
  fracsimp() {
    let a, b, k; do { a = R(1, 9); b = R(a + 1, 12); } while (gcd(a, b) > 1); k = R(2, 9);
    return { title: 'Rút gọn phân số', q: `Rút gọn phân số <span class="num big">${fracHtml(a * k, b * k)}</span> thành phân số tối giản.`, kind: 'frac', ans: fracStr(a, b), exact: true, ex: `Chia cả tử số và mẫu số cho ${k}: ${a * k} : ${k} = ${a}, ${b * k} : ${k} = ${b}. Phân số tối giản: ${a}/${b}.` };
  },
  fraccommon() {
    let b1 = R(2, 6), b2 = R(2, 9); while (b2 === b1) b2 = R(2, 9); const a1 = R(1, b1 - 1), a2 = R(1, b2 - 1); const m = lcm(b1, b2);
    return { title: 'Quy đồng mẫu số', q: `Quy đồng mẫu số <span class="num">${fracHtml(a1, b1)} và ${fracHtml(a2, b2)}</span>. Mẫu số chung bé nhất là bao nhiêu?`, kind: 'num', ans: plain(m), ex: `${m} chia hết cho cả ${b1} và ${b2}: ${fracHtml(a1, b1)} = ${fracHtml(a1 * m / b1, m)}; ${fracHtml(a2, b2)} = ${fracHtml(a2 * m / b2, m)}.` };
  },
  fraccmp() {
    const same = Math.random() < .5; let a1, b1, a2, b2;
    if (same) { b1 = b2 = R(3, 12); a1 = R(1, b1 - 1); a2 = R(1, b1 - 1); } else { a1 = R(1, 8); b1 = R(a1 + 1, 10); a2 = R(1, 8); b2 = R(a2 + 1, 10); }
    const v = a1 * b2 - a2 * b1; const s = v > 0 ? '>' : v < 0 ? '<' : '=';
    return { title: 'So sánh phân số', q: `Chọn dấu thích hợp: <span class="num big">${fracHtml(a1, b1)} … ${fracHtml(a2, b2)}</span>`, kind: 'mc', opts: ['>', '<', '='], ans: s, big: true, ex: same ? `Cùng mẫu số: phân số nào có tử số lớn hơn thì lớn hơn.` : `Quy đồng: ${fracHtml(a1 * b2, b1 * b2)} và ${fracHtml(a2 * b1, b1 * b2)}, rồi so sánh tử số.` };
  },
  fracop(op = 'add') {
    let a1, b1, a2, b2, ra, rb, sym;
    const sameDen = Math.random() < .5;
    b1 = R(2, 9); b2 = sameDen && (op === 'add' || op === 'sub') ? b1 : R(2, 9); a1 = R(1, b1 - 1); a2 = R(1, b2 - 1);
    if (op === 'add') { ra = a1 * b2 + a2 * b1; rb = b1 * b2; sym = '+'; }
    if (op === 'sub') { if (a1 * b2 < a2 * b1) [a1, b1, a2, b2] = [a2, b2, a1, b1]; if (a1 * b2 === a2 * b1) a1++; ra = a1 * b2 - a2 * b1; rb = b1 * b2; sym = '−'; }
    if (op === 'mul') { ra = a1 * a2; rb = b1 * b2; sym = '×'; }
    if (op === 'div') { ra = a1 * b2; rb = b1 * a2; sym = ':'; }
    const [x, y] = simp(ra, rb);
    return { title: { add: 'Cộng phân số', sub: 'Trừ phân số', mul: 'Nhân phân số', div: 'Chia phân số' }[op], q: `<span class="num big">${fracHtml(a1, b1)} ${sym} ${fracHtml(a2, b2)} = ?</span>`, kind: 'frac', ans: fracStr(x, y), ex: { add: b1 === b2 ? 'Cùng mẫu số: cộng tử số, giữ nguyên mẫu số.' : 'Quy đồng mẫu số rồi cộng tử số.', sub: b1 === b2 ? 'Cùng mẫu số: trừ tử số, giữ nguyên mẫu số.' : 'Quy đồng mẫu số rồi trừ tử số.', mul: 'Tử nhân tử, mẫu nhân mẫu.', div: 'Nhân phân số thứ nhất với phân số thứ hai đảo ngược.' }[op] + ` Kết quả: ${x}/${y}${x !== ra ? ` (đã rút gọn từ ${ra}/${rb})` : ''}. Nhập phân số bằng nó cũng được tính đúng.` };
  },
  fracof() {
    const b = R(2, 9), a = R(1, b - 1), k = R(2, 12); const n = b * k;
    return { title: 'Tìm phân số của một số', q: `Tìm ${fracHtml(a, b)} của ${n}.`, kind: 'num', ans: plain(n * a / b), ex: `Lấy số đó nhân với phân số: ${n} × ${fracHtml(a, b)} = ${n} : ${b} × ${a} = ${n * a / b}.` };
  },
  mixed() {
    const w = R(1, 5), b = R(2, 9), a = R(1, b - 1); const toFrac = Math.random() < .5;
    return toFrac ? { title: 'Hỗn số', q: `Chuyển hỗn số <span class="num big">${w}${fracHtml(a, b)}</span> thành phân số.`, kind: 'frac', ans: fracStr(w * b + a, b), exact: true, ex: `Tử số = ${w} × ${b} + ${a} = ${w * b + a}, mẫu số giữ nguyên ${b}.` }
      : { title: 'Hỗn số', q: `Phân số <span class="num big">${fracHtml(w * b + a, b)}</span> viết thành hỗn số thì phần nguyên là bao nhiêu?`, kind: 'num', ans: plain(w), ex: `${w * b + a} : ${b} = ${w} (dư ${a}), nên ${fracHtml(w * b + a, b)} = ${w}${fracHtml(a, b)}.` };
  },
  fracdec10() {
    const k = pickOne([10, 100, 1000]); const a = R(1, k - 1);
    if (Math.random() < .5) { const b = pickOne([2, 4, 5, 20, 25]); const t = R(1, b - 1); return { title: 'Phân số thập phân', q: `Viết <span class="num big">${fracHtml(t, b)}</span> thành phân số có mẫu số ${100}.`, kind: 'num', ans: plain(t * 100 / b), ex: `Nhân cả tử và mẫu với ${100 / b}: ${fracHtml(t * 100 / b, 100)}.` }; }
    return { title: 'Phân số thập phân', q: `Viết phân số thập phân <span class="num big">${fracHtml(a, k)}</span> thành số thập phân.`, kind: 'num', ans: plain(a / k), ex: `Mẫu số ${k} có ${String(k).length - 1} chữ số 0, nên phần thập phân có ${String(k).length - 1} chữ số: ${fmt(a / k)}.` };
  },

  /* ----- số thập phân ----- */
  decread() {
    const n = round2(R(1, 9999) / pickOne([10, 100, 1000])); const k = pickOne([['phần mười', 1], ['phần trăm', 2]]);
    const s = plain(n); const dec = (s.split(',')[1] || '').padEnd(3, '0');
    if (Math.random() < .5) return { title: 'Số thập phân', q: `Trong số <b class="num">${fmt(n)}</b>, chữ số ở hàng <b>${k[0]}</b> là chữ số nào?`, kind: 'num', ans: dec[k[1] - 1], ex: `Sau dấu phẩy lần lượt là hàng phần mười, phần trăm, phần nghìn. Chữ số hàng ${k[0]} là ${dec[k[1] - 1]}.` };
    const w = R(0, 30), t = R(1, 99); const v = round2(w + t / 100); return { title: 'Viết số thập phân', q: `Viết số thập phân gồm <b>${w} đơn vị</b> và <b>${t} phần trăm</b>.`, kind: 'num', ans: plain(v), ex: `${t} phần trăm = 0,${String(t).padStart(2, '0')}. Số cần viết: ${fmt(v)}.` };
  },
  deccmp() {
    const a = round2(R(10, 9999) / 100); let b = Math.random() < .5 ? round2(a + pickOne([0.1, -0.1, 0.01, 1, -0.09])) : round2(R(10, 9999) / 100); if (b < 0) b = round2(a + 0.5);
    const s = a > b ? '>' : a < b ? '<' : '=';
    return { title: 'So sánh số thập phân', q: `Chọn dấu thích hợp: <b class="num big">${fmt(a)} … ${fmt(b)}</b>`, kind: 'mc', opts: ['>', '<', '='], ans: s, big: true, ex: 'So sánh phần nguyên trước; phần nguyên bằng nhau thì so sánh lần lượt hàng phần mười, phần trăm…' };
  },
  decunit() {
    const k = pickOne([['m', 'cm', 100], ['kg', 'g', 1000], ['km', 'm', 1000], ['tấn', 'kg', 1000], ['m', 'dm', 10]]); const a = R(1, 20), b = R(1, k[2] - 1); const v = round2(a + b / k[2]);
    return { title: 'Viết số đo dưới dạng số thập phân', q: `<b class="num">${a} ${k[0]} ${b} ${k[1]} = ? ${k[0]}</b>`, kind: 'num', ans: plain(v), unit: k[0], ex: `${b} ${k[1]} = ${fmt(b / k[2])} ${k[0]}, nên ${a} ${k[0]} ${b} ${k[1]} = ${fmt(v)} ${k[0]}.` };
  },
  decround() {
    const n = round2(R(100, 99999) / 1000); const to = pickOne([['số tự nhiên gần nhất', 0], ['hàng phần mười', 1], ['hàng phần trăm', 2]]); const r = round2(Math.round(n * pow10(to[1])) / pow10(to[1]));
    return { title: 'Làm tròn số thập phân', q: `Làm tròn số <b class="num">${fmt(n)}</b> đến ${to[0]}.`, kind: 'num', ans: plain(r), ex: `Xét chữ số ngay bên phải hàng làm tròn: từ 5 trở lên thì làm tròn lên. Kết quả: ${fmt(r)}.` };
  },
  decop(op = 'add') {
    const a = round2(R(10, 9999) / 100), b = round2(R(10, 999) / 100);
    if (op === 'add') return { title: 'Cộng số thập phân', q: `<b class="num big">${fmt(a)} + ${fmt(b)} = ?</b>`, kind: 'num', ans: plain(round2(a + b)), ex: `Đặt các dấu phẩy thẳng cột rồi cộng như số tự nhiên: ${fmt(round2(a + b))}.` };
    if (op === 'sub') { const [x, y] = a >= b ? [a, b] : [b, a]; return { title: 'Trừ số thập phân', q: `<b class="num big">${fmt(x)} − ${fmt(y)} = ?</b>`, kind: 'num', ans: plain(round2(x - y)), ex: `Đặt các dấu phẩy thẳng cột rồi trừ như số tự nhiên: ${fmt(round2(x - y))}.` }; }
    if (op === 'mul') { const x = round2(R(11, 999) / 10), k = Math.random() < .5 ? R(2, 9) : round2(R(11, 99) / 10); return { title: 'Nhân số thập phân', q: `<b class="num big">${fmt(x)} × ${fmt(k)} = ?</b>`, kind: 'num', ans: plain(round2(x * k)), ex: `Nhân như số tự nhiên, rồi đếm tổng số chữ số ở phần thập phân của các thừa số để đặt dấu phẩy: ${fmt(round2(x * k))}.` }; }
    const d = Math.random() < .5 ? R(2, 9) : round2(R(2, 9) / 10); const q = round2(R(11, 999) / 100); const dv = round2(q * d);
    return { title: 'Chia số thập phân', q: `<b class="num big">${fmt(dv)} : ${fmt(d)} = ?</b>`, kind: 'num', ans: plain(q), ex: `${Number.isInteger(d) ? 'Chia như số tự nhiên, khi hạ chữ số đầu tiên của phần thập phân thì đánh dấu phẩy ở thương.' : 'Dời dấu phẩy ở số chia và số bị chia sang phải cùng số chữ số cho số chia thành số tự nhiên rồi chia.'} Kết quả: ${fmt(q)}.` };
  },
  dec10() {
    const n = round2(R(1, 99999) / 1000); const k = pickOne([[10, '×'], [100, '×'], [1000, '×'], [10, ':'], [100, ':'], [0.1, '×'], [0.01, '×'], [0.1, ':']]);
    const v = round2(k[1] === '×' ? n * k[0] : n / k[0]); const moveRight = (k[1] === '×') === (k[0] >= 10); const steps = k[0] >= 10 ? String(k[0]).length - 1 : String(k[0]).length - 2;
    return { title: 'Nhân, chia nhẩm', q: `<b class="num big">${fmt(n)} ${k[1]} ${fmt(k[0])} = ?</b>`, kind: 'num', ans: plain(v), ex: `Chuyển dấu phẩy sang ${moveRight ? 'phải' : 'trái'} ${steps} chữ số: ${fmt(v)}.` };
  },
  ratio() {
    const a = R(1, 9), b = R(1, 9); const [A, B] = mix(pickOne([['bạn nam', 'bạn nữ'], ['bút chì', 'bút mực'], ['quả cam', 'quả táo'], ['con gà', 'con vịt']]));
    const [x, y] = simp(a, b);
    return { title: 'Tỉ số', q: `Có ${a} ${A} và ${b} ${B}. Tỉ số của số ${A} và số ${B} là bao nhiêu? (viết dạng phân số)`, kind: 'frac', ans: fracStr(a, b), ex: `Tỉ số của a và b là a : b hay a/b: ${a} : ${b} = ${a}/${b}${x !== a ? ` = ${x}/${y}` : ''}.` };
  },
  percent(kind = 1) {
    if (+kind === 1) { const b = pickOne([10, 20, 25, 50, 100, 200]); const a = R(1, b); const p = round2(a / b * 100, 2); if (!Number.isInteger(p * 10)) return GEN.percent(1);
      return { title: 'Tỉ số phần trăm', q: `Lớp có ${b} bạn, trong đó ${a} bạn thích môn Toán. Số bạn thích Toán chiếm bao nhiêu phần trăm?`, kind: 'num', ans: plain(p), unit: '%', ex: `${a} : ${b} = ${fmt(a / b)} = ${fmt(p)}%.` }; }
    const p = pickOne([5, 10, 15, 20, 25, 30, 40, 50, 75]); const n = R(2, 40) * 20; const v = round2(n * p / 100);
    return { title: 'Tìm giá trị phần trăm', q: `Tìm ${p}% của ${fmt(n)}.`, kind: 'num', ans: plain(v), ex: `${fmt(n)} × ${p} : 100 = ${fmt(v)}.` };
  },
  scale() {
    const sc = pickOne([1000, 10000, 100000, 500, 2000]); const cm = R(2, 15); const real = cm * sc; const toM = real >= 100000 ? ['km', 100000] : ['m', 100];
    return { title: 'Tỉ lệ bản đồ', q: `Trên bản đồ tỉ lệ 1 : ${fmt(sc)}, quãng đường dài ${cm} cm. Độ dài thật là bao nhiêu ${toM[0]}?`, kind: 'num', ans: plain(round2(real / toM[1])), unit: toM[0], ex: `Độ dài thật: ${cm} × ${fmt(sc)} = ${fmt(real)} cm = ${fmt(round2(real / toM[1]))} ${toM[0]}.` };
  },

  /* ----- thống kê, xác suất ----- */
  tally() {
    const kinds = mix([['🍎', 'táo'], ['🍌', 'chuối'], ['🍊', 'cam'], ['🍇', 'nho']]).slice(0, 3); const arr = []; kinds.forEach(k => { const n = R(2, 7); for (let i = 0; i < n; i++) arr.push(k); }); const sh = mix(arr); const t = pickOne(kinds);
    return { title: 'Kiểm đếm', q: `Có bao nhiêu quả <b>${t[1]}</b>?`, fig: `<div class="objs">${sh.map(x => `<span>${x[0]}</span>`).join('')}</div>`, kind: 'num', ans: plain(arr.filter(x => x === t).length), ex: 'Đếm và gạch từng quả để không bị sót hay đếm trùng.' };
  },
  picchart() {
    const rows = mix([['🐶', 'Chó'], ['🐱', 'Mèo'], ['🐰', 'Thỏ'], ['🐟', 'Cá']]).slice(0, 3).map(r => [...r, R(1, 7)]); const k = R(0, 2);
    const fig = `<div class="card picchart">${rows.map(r => `<div class="row"><b style="width:52px">${r[1]}</b><span>${r[0].repeat(r[2])}</span></div>`).join('')}<p class="tiny muted">Mỗi hình là 1 bạn</p></div>`;
    if (k === 2) { const s = rows.reduce((a, r) => a + r[2], 0); return { title: 'Biểu đồ tranh', q: 'Có tất cả bao nhiêu bạn được ghi trong biểu đồ?', fig, kind: 'num', ans: plain(s), ex: `Cộng các hàng: ${rows.map(r => r[2]).join(' + ')} = ${s}.` }; }
    const r = pickOne(rows); return { title: 'Biểu đồ tranh', q: `Có bao nhiêu bạn thích con <b>${r[1].toLowerCase()}</b>?`, fig, kind: 'num', ans: plain(r[2]), ex: `Đếm số hình ở hàng "${r[1]}": ${r[2]}.` };
  },
  datatable() {
    const cls = ['3A', '3B', '3C', '3D']; const v = cls.map(() => R(15, 45)); const k = R(0, 2);
    const fig = `<table class="table card"><thead><tr><th>Lớp</th>${cls.map(c => `<th class="r">${c}</th>`).join('')}</tr></thead><tbody><tr><td>Số cây trồng</td>${v.map(x => `<td class="r">${x}</td>`).join('')}</tr></tbody></table>`;
    if (k === 0) { const i = R(0, 3); return { title: 'Bảng số liệu', q: `Lớp ${cls[i]} trồng được bao nhiêu cây?`, fig, kind: 'num', ans: plain(v[i]), ex: `Nhìn cột ${cls[i]}: ${v[i]} cây.` }; }
    if (k === 1) { const s = v.reduce((a, b) => a + b); return { title: 'Bảng số liệu', q: 'Cả bốn lớp trồng được bao nhiêu cây?', fig, kind: 'num', ans: plain(s), ex: `${v.join(' + ')} = ${s}.` }; }
    const mx = Math.max(...v); return { title: 'Bảng số liệu', q: 'Lớp trồng được nhiều cây nhất trồng bao nhiêu cây?', fig, kind: 'num', ans: plain(mx), ex: `So sánh các số: lớn nhất là ${mx}.` };
  },
  barchart() {
    const labels = mix(['T2', 'T3', 'T4', 'T5', 'T6']).slice(0, 4).sort(); const vals = labels.map(() => R(1, 10) * 5); const k = R(0, 2);
    const fig = `<div class="figbox">${barChartSvg(labels, vals)}</div><p class="tiny muted" style="text-align:center;font-weight:700">Số quyển sách thư viện cho mượn</p>`;
    if (k === 0) { const i = R(0, 3); return { title: 'Biểu đồ cột', q: `Ngày ${labels[i]} thư viện cho mượn bao nhiêu quyển sách?`, fig, kind: 'num', ans: plain(vals[i]), ex: `Đỉnh cột ${labels[i]} ngang vạch ${vals[i]}.` }; }
    if (k === 1) { const s = vals.reduce((a, b) => a + b); return { title: 'Biểu đồ cột', q: 'Tổng số sách cho mượn trong các ngày trên là bao nhiêu?', fig, kind: 'num', ans: plain(s), ex: `${vals.join(' + ')} = ${s}.` }; }
    const mx = Math.max(...vals), mn = Math.min(...vals); return { title: 'Biểu đồ cột', q: 'Ngày nhiều nhất cho mượn nhiều hơn ngày ít nhất bao nhiêu quyển?', fig, kind: 'num', ans: plain(mx - mn), ex: `${mx} − ${mn} = ${mx - mn}.` };
  },
  dataseq(lv = 1) {
    const arr = Array.from({ length: R(5, 7) }, () => R(120, 160)); const k = R(0, 2);
    const fig = `<div class="card" style="text-align:center;font-weight:800" class="num">Chiều cao (cm): ${arr.join('; ')}</div>`;
    if (k === 0) return { title: 'Dãy số liệu', q: 'Dãy số liệu có bao nhiêu số?', fig, kind: 'num', ans: plain(arr.length), ex: `Đếm các số liệu: ${arr.length} số.` };
    if (k === 1) return { title: 'Dãy số liệu', q: 'Bạn cao nhất cao bao nhiêu xăng-ti-mét?', fig, kind: 'num', ans: plain(Math.max(...arr)), unit: 'cm', ex: `Sắp xếp dãy số rồi tìm số lớn nhất: ${Math.max(...arr)}.` };
    const i = R(2, arr.length); return { title: 'Dãy số liệu', q: `Số thứ ${i} trong dãy là số nào?`, fig, kind: 'num', ans: plain(arr[i - 1]), ex: `Đếm từ trái sang: số thứ ${i} là ${arr[i - 1]}.` };
  },
  chance(lv = 1) {
    const items = [
      ['Trong hộp chỉ có bi đỏ. Lấy ra một viên bi, viên bi đó là bi đỏ.', 'Chắc chắn'],
      ['Trong hộp chỉ có bi đỏ. Lấy ra một viên bi, viên bi đó là bi xanh.', 'Không thể'],
      ['Trong hộp có bi đỏ và bi xanh. Lấy ra một viên bi, viên bi đó là bi xanh.', 'Có thể'],
      ['Tung một con xúc xắc, mặt trên có 7 chấm.', 'Không thể'],
      ['Tung một con xúc xắc, mặt trên có 3 chấm.', 'Có thể'],
      ['Ngày mai mặt trời mọc ở đằng Đông.', 'Chắc chắn'],
      ['Tung đồng xu, đồng xu ngửa mặt sấp.', 'Có thể'],
      ['Một tuần có 8 ngày.', 'Không thể']];
    const [q, a] = pickOne(items);
    return { title: 'Chắc chắn, có thể, không thể', q: `Sự kiện: <b>${q}</b>`, kind: 'mc', opts: ['Chắc chắn', 'Có thể', 'Không thể'], ans: a, ex: { 'Chắc chắn': 'Sự kiện luôn xảy ra là chắc chắn.', 'Có thể': 'Sự kiện có lúc xảy ra, có lúc không là có thể.', 'Không thể': 'Sự kiện không bao giờ xảy ra là không thể.' }[a] };
  },
  events(lv = 1) {
    const n = R(10, 30), k = R(2, n - 2);
    if (+lv === 2) { const [x, y] = simp(k, n); return { title: 'Tỉ số số lần lặp lại', q: `Tung đồng xu ${n} lần thì có ${k} lần mặt sấp. Tỉ số của số lần mặt sấp và tổng số lần tung là bao nhiêu?`, kind: 'frac', ans: fracStr(k, n), ex: `Tỉ số là ${k} : ${n} = ${k}/${n}${x !== k ? ` = ${x}/${y}` : ''}.` }; }
    return { title: 'Số lần xuất hiện', q: `Tung đồng xu ${n} lần, có ${k} lần mặt sấp. Hỏi có bao nhiêu lần mặt ngửa?`, kind: 'num', ans: plain(n - k), ex: `${n} − ${k} = ${n - k} lần mặt ngửa.` };
  },
  pie() {
    const parts = pickOne([[['Bóng đá', 40], ['Cầu lông', 25], ['Bơi', 20], ['Cờ vua', 15]], [['Táo', 50], ['Cam', 30], ['Chuối', 20]], [['Đỏ', 35], ['Xanh', 30], ['Vàng', 25], ['Tím', 10]]]);
    const total = pickOne([20, 40, 60, 80, 100, 200]); const p = pickOne(parts);
    if (Math.random() < .5) return { title: 'Biểu đồ hình quạt tròn', q: `Phần "${p[0]}" chiếm bao nhiêu phần trăm?`, fig: `<div class="figbox">${pieSvg(parts)}</div>`, kind: 'num', ans: plain(p[1]), unit: '%', ex: `Đọc số ghi trên phần "${p[0]}": ${p[1]}%.` };
    return { title: 'Biểu đồ hình quạt tròn', q: `Có ${total} người được hỏi. Bao nhiêu người chọn "${p[0]}"?`, fig: `<div class="figbox">${pieSvg(parts)}</div>`, kind: 'num', ans: plain(round2(total * p[1] / 100)), ex: `${total} × ${p[1]} : 100 = ${fmt(round2(total * p[1] / 100))} người.` };
  },
  wp(type = 'add', max = 20) { return wp(type, +max || 20); }
};
const SHAPE_TIP = { 'vuông': 'Hình vuông có 4 cạnh bằng nhau và 4 góc vuông.', 'chữ nhật': 'Hình chữ nhật có 4 góc vuông, hai cạnh dài bằng nhau, hai cạnh ngắn bằng nhau.', 'tròn': 'Hình tròn không có cạnh, không có góc.', 'tam giác': 'Hình tam giác có 3 cạnh, 3 góc.', 'tứ giác': 'Hình tứ giác có 4 cạnh, 4 góc.', 'bình hành': 'Hình bình hành có hai cặp cạnh đối diện song song và bằng nhau.', 'thoi': 'Hình thoi có 4 cạnh bằng nhau, hai cặp cạnh đối diện song song.', 'thang': 'Hình thang có một cặp cạnh đối diện song song.' };
const SOLID_TIP = { 'khối lập phương': 'Khối lập phương có 6 mặt đều là hình vuông, giống con xúc xắc.', 'khối hộp chữ nhật': 'Khối hộp chữ nhật có 6 mặt là hình chữ nhật, giống hộp sữa.', 'khối trụ': 'Khối trụ có hai mặt đáy là hình tròn, giống lon nước.', 'khối cầu': 'Khối cầu tròn đều mọi phía, giống quả bóng.' };
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
function expandTables(ts) { const out = []; ts.forEach(t => { const m = String(t).match(/^(\d+)-(\d+)$/); if (m) for (let k = +m[1]; k <= +m[2]; k++) out.push(k); else if (t !== undefined && t !== '') out.push(+t); }); return out.length ? out : [2]; }
function colOp(a, b, op) {
  const A = String(a), B = String(b); const w = Math.max(A.length, B.length) + 1;
  return `<div class="colop num"><span>${A.padStart(w, ' ')}</span><span><i>${op}</i>${B.padStart(w - 1, ' ')}</span><span class="ln"></span><span>${'?'.padStart(w, ' ')}</span></div>`;
}

/* ---------- gọi một dạng bài từ chuỗi "ten:a,b" ---------- */
function makeQ(spec) {
  const [name, args] = spec.split(':'); const fn = GEN[name];
  if (!fn) throw new Error('Không có dạng bài ' + name);
  const q = fn(...(args ? args.split(',').map(x => /^-?\d+(\.\d+)?$/.test(x) ? +x : x) : []));
  q.spec = spec; return q;
}

/* ---------- chấm đáp án ---------- */
function normNum(s) {
  s = String(s).trim().replace(/[\s  ]/g, '').replace(/−/g, '-');
  return s;
}
function checkAnswer(q, input) {
  if (q.kind === 'mc') return input === q.ans;
  if (q.kind === 'frac') {
    const m = String(input).replace(/\s/g, '').match(/^(\d+)\/(\d+)$/); const t = q.ans.split('/').map(Number);
    if (!m) { if (/^\d+$/.test(String(input).trim()) && t[1] && t[0] % t[1] === 0 && +input === t[0] / t[1] && !q.exact) return true; return false; }
    const a = +m[1], b = +m[2]; if (!b) return false;
    if (q.exact) return a === t[0] && b === t[1];
    return a * t[1] === b * t[0];
  }
  let a = normNum(input), e = normNum(q.ans);
  const isDec = e.includes(',');
  if (isDec) a = a.replace(/\./g, ','); else a = a.replace(/[.,](?=\d{3}(\D|$))/g, '');
  const toN = s => Number(s.replace(',', '.'));
  if (a === '' || isNaN(toN(a))) return false;
  return Math.abs(toN(a) - toN(e)) < 1e-9;
}
if (typeof module !== 'undefined') module.exports = { GEN, makeQ, checkAnswer, fmt, docSo };

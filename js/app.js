'use strict';
/* =========================================================
   Toán Vui cùng Pi: học Toán tiểu học lớp 1–5, bám sát Chương trình GDPT 2018.
   Không cần máy chủ: dữ liệu lưu trong trình duyệt (localStorage).
   ========================================================= */

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = n => String(n).padStart(2, '0');
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const vnd = n => n.toLocaleString('vi-VN') + 'đ';
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
function weekKey(d = new Date()) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return dayKey(x); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
const stripTags = s => String(s || '').replace(/<span class="fr"><i>([^<]*)<\/i><i>([^<]*)<\/i><\/span>/g, '$1 phần $2').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const STAR = 1000, MAX_CAP = 50, MISSION_STARS = 2;
const APP_NAME = 'Toán Vui cùng Pi', APP_ID = 'toan-vui-cung-pi';

/* ---------- chương trình học ---------- */
const GRADES = {
  1: { world: 'Vườn Số Đếm', c: '#E8702F', friend: 'Đếm, so sánh, cộng trừ trong phạm vi 100' },
  2: { world: 'Làng Phép Tính', c: '#1C9670', friend: 'Cộng trừ có nhớ, làm quen phép nhân, phép chia' },
  3: { world: 'Phố Cửu Chương', c: '#3478BE', friend: 'Bảng nhân chia, chu vi, diện tích, số đến 100 000' },
  4: { world: 'Thành Phố Phân Số', c: '#7556C0', friend: 'Số lớn, góc, nhân chia nhiều chữ số, phân số' },
  5: { world: 'Đảo Thập Phân', c: '#C8223A', friend: 'Số thập phân, tỉ số phần trăm, thể tích, vận tốc' }
};
const CUR = {};
(function parse() {
  let g = 0;
  CURRICULUM_TEXT.trim().split('\n').forEach(line => {
    line = line.trim(); if (!line) return;
    if (line[0] === '#') { g = +line.slice(1); CUR[g] = []; return; }
    if (line[0] === '@') {
      const review = line[1] === '!'; const [title, icon, mission] = line.slice(review ? 2 : 1).split('|');
      CUR[g].push({ g, n: CUR[g].length + 1, title, icon, mission, review, lessons: [] }); return;
    }
    const T = CUR[g][CUR[g].length - 1]; const [title, icon, gens, tip] = line.split('|');
    T.lessons.push({ g, t: T.n, n: T.lessons.length + 1, title, icon, gens: gens.split(';').map(s => s.trim()), tip });
  });
})();
const topicKey = (g, t) => `g${g}t${t}`;
const lessonKey = (g, t, n) => `g${g}t${t}l${n}`;
function reviewPool(g, t) {
  const T = CUR[g][t - 1];
  if (!T.review) return T.lessons.flatMap(l => l.gens);
  const list = CUR[g].slice(0, t - 1); const lastRev = list.map(x => x.review).lastIndexOf(true);
  const scope = /cuối năm/i.test(T.title) ? list : list.slice(lastRev + 1);
  return scope.flatMap(x => x.lessons.flatMap(l => l.gens));
}
function nodesOf(g) {
  const out = [];
  CUR[g].forEach(T => {
    T.lessons.forEach(l => out.push({ type: 'lesson', g, T, l, key: lessonKey(g, T.n, l.n) }));
    out.push({ type: 'review', g, T, key: topicKey(g, T.n) + 'r' });
  });
  return out;
}

/* ---------- storage ---------- */
const LS = 'toanvui.store.v1', LSD = 'toanvui.device.v1';
let STORE = { families: {} };
let DEV = { familyId: null, session: null };
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
function loadLocal() {
  try { const r = lsGet(LS); if (r) STORE = JSON.parse(r) || STORE; } catch (e) {}
  try { const d = lsGet(LSD); if (d) DEV = Object.assign(DEV, JSON.parse(d)); } catch (e) {}
  if (!STORE.families) STORE.families = {};
}
function persist() { lsSet(LS, JSON.stringify(STORE)); }
function saveFam(fam) { fam.updatedAt = Date.now(); persist(); }
function saveDev() { lsSet(LSD, JSON.stringify(DEV)); }
const syncLabel = () => '💾 Dữ liệu lưu trong trình duyệt của máy này · ba mẹ nhớ sao lưu định kỳ';

async function hashPw(s) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('toanvui:' + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { let h = 2166136261; for (const c of 'toanvui:' + s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return 'f' + (h >>> 0).toString(16); }
}

/* ---------- domain ---------- */
const fam = () => STORE.families[DEV.session?.fid || DEV.familyId];
const childOf = (f, cid) => f?.children.find(c => c.id === cid);
function prog(f, cid) { f.progress[cid] ||= { lessons: {}, missions: {}, ledger: [], log: [], streak: { last: null, count: 0 }, secs: {}, solved: 0 }; return f.progress[cid]; }
const capOf = f => Math.min(MAX_CAP, Math.max(5, f.weeklyCap || MAX_CAP));
function weekStars(f, cid, wk = weekKey()) { return prog(f, cid).ledger.filter(e => e.wk === wk).reduce((a, e) => a + e.counted, 0); }
/* Mỗi sao = 1.000đ; hệ thống ngừng tính thưởng khi đủ mức tối đa của tuần (không quá 50 sao). */
function award(f, cid, n, reason) {
  const p = prog(f, cid), wk = weekKey(), have = weekStars(f, cid, wk);
  const counted = Math.max(0, Math.min(n, capOf(f) - have));
  p.ledger.push({ id: uid(), ts: Date.now(), wk, n, counted, reason, paid: false });
  return { n, counted, over: n - counted, total: have + counted };
}
const unpaid = (f, cid) => prog(f, cid).ledger.filter(e => !e.paid).reduce((a, e) => a + e.counted, 0);
function bumpStreak(p) {
  const t = dayKey(), y = dayKey(addDays(new Date(), -1));
  if (p.streak.last === t) return; p.streak.count = p.streak.last === y ? p.streak.count + 1 : 1; p.streak.last = t;
}
const streakNow = p => (p.streak.last === dayKey() || p.streak.last === dayKey(addDays(new Date(), -1))) ? p.streak.count : 0;
function nodeDone(p, node) { return node.type === 'lesson' ? (p.lessons[node.key + 'a'] > 0 && p.lessons[node.key + 'b'] > 0) : p.lessons[node.key] > 0; }
function nodeStars(p, node) { return node.type === 'lesson' ? (p.lessons[node.key + 'a'] || 0) + (p.lessons[node.key + 'b'] || 0) : (p.lessons[node.key] || 0); }
const learnGrade = (f, c) => prog(f, c.id).lastGrade || c.grade;
function nodeStates(f, child, g) {
  const p = prog(f, child.id), list = nodesOf(g); let currentSet = false;
  return list.map((n, i) => {
    const done = nodeDone(p, n);
    const open = f.unlockAll || i === 0 || nodeDone(p, list[i - 1]);
    let current = false; if (open && !done && !currentSet) { current = true; currentSet = true; }
    return { ...n, done, open, current, stars: nodeStars(p, n) };
  });
}
function lessonsDone(p) { return Object.values(p.lessons).filter(v => v > 0).length; }
function missionOpen(p, g, T) {
  if (p.missions[topicKey(g, T.n)]) return true;
  if (T.lessons.length) return Object.keys(p.lessons).some(k => k.startsWith(topicKey(g, T.n) + 'l') && p.lessons[k] > 0);
  return p.lessons[topicKey(g, T.n) + 'r'] > 0;
}
function badgesOf(f, cid) {
  const p = prog(f, cid), ld = lessonsDone(p), three = Object.values(p.lessons).filter(v => v === 3).length;
  const mApproved = Object.values(p.missions).filter(m => m.status === 'approved').length;
  const weeks = {}; p.ledger.forEach(e => weeks[e.wk] = (weeks[e.wk] || 0) + e.counted);
  const maxWeek = Math.max(0, ...Object.values(weeks));
  const gradeDone = g => nodesOf(g).every(n => nodeDone(p, n));
  const list = [
    ['🌱', 'Bước đầu tiên', ld >= 1], ['📚', 'Chăm học 10 bài', ld >= 10], ['🏅', 'Chăm học 40 bài', ld >= 40],
    ['🌟', '5 bài 3 sao', three >= 5], ['🧮', 'Giải 100 bài toán', (p.solved || 0) >= 100], ['🧠', 'Giải 500 bài toán', (p.solved || 0) >= 500],
    ['🔥', 'Học 3 ngày liền', p.streak.count >= 3], ['☄️', 'Học 7 ngày liền', p.streak.count >= 7], ['🎯', 'Nhiệm vụ đầu tiên', mApproved >= 1],
    ['🤝', '5 nhiệm vụ', mApproved >= 5], ['💰', `Đủ ${MAX_CAP} sao một tuần`, maxWeek >= MAX_CAP]
  ];
  for (let g = 1; g <= 5; g++) list.push(['🎓', 'Xong Lớp ' + g, gradeDone(g)]);
  return list.map(([b, t, on]) => ({ b, t, on }));
}

/* ---------- gia đình mẫu ---------- */
async function seedDemo() {
  if (STORE.families.demo) return;
  const now = Date.now(), wk = weekKey(), lastWk = weekKey(addDays(new Date(), -7));
  const f = { id: 'demo', demo: true, parentName: 'Ba mẹ Bông & Tí', login: 'demo', passHash: await hashPw('123456'), parentPin: '0000', weeklyCap: 50, unlockAll: false, createdAt: now, updatedAt: 0,
    children: [{ id: 'bong', name: 'Bông', grade: 1, avatar: '🐰', pin: '1111' }, { id: 'ti', name: 'Tí', grade: 3, avatar: '🐻', pin: '2222' }],
    progress: {}, payouts: [] };
  const today = dayKey(), d = k => dayKey(addDays(new Date(), -k));
  f.progress.bong = { lessons: { g1t1l1a: 3, g1t1l1b: 3, g1t1l2a: 2 }, missions: { g1t1: { status: 'pending', ts: now - 3600e3 } },
    ledger: [{ id: 'b1', ts: now - 864e5, wk, n: 3, counted: 3, reason: 'Các số 0, 1, 2, 3, 4, 5 · Bài học', paid: false }, { id: 'b2', ts: now - 80e6, wk, n: 3, counted: 3, reason: 'Các số 0, 1, 2, 3, 4, 5 · Luyện tập', paid: false }, { id: 'b3', ts: now - 2e6, wk, n: 2, counted: 2, reason: 'Các số 6, 7, 8, 9, 10 · Bài học', paid: false }],
    log: [{ ts: now - 864e5, key: 'g1t1l1a', stars: 3 }, { ts: now - 80e6, key: 'g1t1l1b', stars: 3 }, { ts: now - 2e6, key: 'g1t1l2a', stars: 2 }],
    streak: { last: today, count: 2 }, secs: { [d(1)]: 540, [today]: 420 }, solved: 31 };
  const tiL = {}; for (let n = 1; n <= 7; n++) { tiL[`g3t1l${n}a`] = n === 3 ? 2 : 3; tiL[`g3t1l${n}b`] = n === 6 ? 1 : 3; } tiL.g3t1r = 3; tiL.g3t2l1a = 3; tiL.g3t2l1b = 2;
  f.progress.ti = { lessons: tiL, missions: { g3t1: { status: 'approved', ts: now - 3 * 864e5 }, g3t2: { status: 'pending', ts: now - 1800e3 } },
    ledger: [
      { id: 't0', ts: now - 9 * 864e5, wk: lastWk, n: 38, counted: 38, reason: 'Ôn tập và bổ sung', paid: true },
      { id: 't1', ts: now - 3 * 864e5, wk, n: 2, counted: 2, reason: 'Nhiệm vụ: Ôn tập và bổ sung', paid: false },
      { id: 't2', ts: now - 2 * 864e5, wk, n: 3, counted: 3, reason: 'Ôn tập chủ đề · Lớp 3', paid: false },
      { id: 't3', ts: now - 864e5, wk, n: 5, counted: 5, reason: 'Bảng nhân 6, bảng chia 6', paid: false }],
    log: [{ ts: now - 2 * 864e5, key: 'g3t1r', stars: 3 }, { ts: now - 864e5, key: 'g3t2l1a', stars: 3 }, { ts: now - 864e5, key: 'g3t2l1b', stars: 2 }],
    streak: { last: d(1), count: 4 }, secs: { [d(4)]: 600, [d(3)]: 780, [d(2)]: 1260, [d(1)]: 900 }, solved: 214 };
  f.payouts = [{ id: 'p0', ts: now - 6 * 864e5, cid: 'ti', stars: 38, amount: 38000 }];
  STORE.families.demo = f; persist();
}

/* ---------- giọng đọc tiếng Việt + âm thanh ---------- */
let VOICE = null;
function pickVoice() { try { const vs = speechSynthesis.getVoices(); VOICE = vs.find(v => /^vi/i.test(v.lang)) || null; } catch (e) {} }
try { speechSynthesis.onvoiceschanged = () => { const had = !!VOICE; pickVoice(); if (had !== !!VOICE && UI.view === 'lesson') render(); }; pickVoice(); } catch (e) {}
const canSpeak = () => !!VOICE;
function say(t) { if (!VOICE) return; try { const u = new SpeechSynthesisUtterance(t); u.lang = 'vi-VN'; u.voice = VOICE; u.rate = 0.95; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }
let AC = null;
function beep(ok) {
  try { AC ||= new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime;
    const notes = ok ? [660, 880] : [300, 220];
    notes.forEach((fq, i) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = ok ? 'triangle' : 'sine'; o.frequency.value = fq; g.gain.setValueAtTime(0.0001, t + i * 0.11); g.gain.exponentialRampToValueAtTime(0.18, t + i * 0.11 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.11 + 0.2); o.connect(g).connect(AC.destination); o.start(t + i * 0.11); o.stop(t + i * 0.11 + 0.22); });
  } catch (e) {}
}

/* ---------- UI state ---------- */
const UI = { view: 'welcome', tab: 'learn', ptab: 'home', grade: null, sheet: null, toast: null, pin: '', pinFor: null, pinBad: false, err: '', reg: { step: 1 }, L: null, result: null, confirm: null, edit: null };
let toastTimer = null;
function toast(msg) { UI.toast = msg; render(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { UI.toast = null; render(); }, 2600); }
function go(view, extra = {}) { Object.assign(UI, { view, err: '', pin: '', pinBad: false, sheet: null, confirm: null }, extra); render(); window.scrollTo(0, 0); }

function render() {
  const app = $('#app'); let html = '';
  const v = UI.view;
  if (v === 'welcome') html = vWelcome();
  else if (v === 'parentLogin') html = vParentLogin();
  else if (v === 'forgot') html = vForgot();
  else if (v === 'register') html = vRegister();
  else if (v === 'family') html = vFamilyFind();
  else if (v === 'profiles') html = vProfiles();
  else if (v === 'pin') html = vPin();
  else if (v === 'child') html = vChild();
  else if (v === 'gradePick') html = vGradePick();
  else if (v === 'parent') html = vParent();
  else if (v === 'lesson') html = vLesson();
  else if (v === 'result') html = vResult();
  if (v !== 'lesson') document.body.classList.remove('still');
  app.className = (v === 'child' || v === 'parent') ? '' : 'bare';
  app.innerHTML = html + (UI.sheet ? `<div class="scrim" data-act="closeSheet"><div class="sheet" data-stop="1">${UI.sheet()}</div></div>` : '') + (UI.toast ? `<div class="toast" role="status">${esc(UI.toast)}</div>` : '');
  const af = app.querySelector('[autofocus]'); if (af && !('ontouchstart' in window)) af.focus();
  syncGuard();
}

/* ---------- màn chào / đăng nhập ---------- */
const DISCLAIMER = `<p><b>1. Về ứng dụng.</b> ${APP_NAME} là ứng dụng cá nhân, độc lập, <b>miễn phí hoàn toàn</b>, không quảng cáo, không bán hàng, không thu phí dưới bất kỳ hình thức nào. Ứng dụng không đại diện, không liên kết và không được bảo trợ bởi bất kỳ tổ chức, cơ quan hay đơn vị nào.</p>
<p><b>2. Về nội dung bài học.</b> Lộ trình được sắp xếp theo các mạch kiến thức của Chương trình môn Toán tiểu học (GDPT 2018) do Nhà nước ban hành công khai. Toàn bộ phần ghi nhớ, ví dụ, câu hỏi, nhiệm vụ và hình vẽ do ứng dụng <b>tự biên soạn và tự sinh ngẫu nhiên</b>, không sao chép từ bất kỳ tài liệu, sách hay sản phẩm nào khác. Nội dung chỉ mang tính <b>tham khảo, ôn luyện thêm</b>, có thể còn sai sót, không thay thế giáo viên, sách giáo khoa và giờ học trên lớp. Ứng dụng được cung cấp "nguyên trạng", không cam kết hay bảo đảm về kết quả học tập. Ba mẹ nên đồng hành và kiểm tra cùng con.</p>
<p><b>3. Về sao thưởng.</b> Quy đổi "1 sao = 1.000đ" chỉ là <b>gợi ý để ba mẹ tự thỏa thuận và tự thưởng cho con</b> trong gia đình. Ứng dụng không giữ tiền, không chuyển tiền, không phát sinh nghĩa vụ tài chính hay ràng buộc nào giữa ứng dụng với người dùng. Ba mẹ toàn quyền quyết định có thưởng hay không và mức thưởng.</p>
<p><b>4. Về ủng hộ (donate).</b> Việc ủng hộ là <b>hoàn toàn tự nguyện</b>, mang tính chất cho tặng, <b>không phải tiền mua sản phẩm hay dịch vụ</b>. Ủng hộ hay không đều dùng ứng dụng như nhau; người ủng hộ không nhận thêm quyền lợi, không có hợp đồng, không phát sinh nghĩa vụ hay trách nhiệm pháp lý nào giữa hai bên, và khoản ủng hộ không được hoàn lại. Vui lòng chỉ ủng hộ trong khả năng của mình và tự kiểm tra kỹ thông tin trước khi chuyển.</p>
<p><b>5. Về dữ liệu.</b> Tài khoản, tiến độ và sao chỉ lưu trong trình duyệt trên máy của người dùng. Ứng dụng không thu thập, không gửi đi và không lưu trữ dữ liệu cá nhân trên máy chủ nào. Người dùng tự chịu trách nhiệm sao lưu; dữ liệu có thể mất khi xóa dữ liệu trình duyệt.</p>
<p><b>6. Giới hạn trách nhiệm.</b> Người phát triển không chịu trách nhiệm đối với bất kỳ thiệt hại trực tiếp hay gián tiếp nào phát sinh từ việc sử dụng ứng dụng. Việc sử dụng ứng dụng đồng nghĩa với việc ba mẹ đã đọc và đồng ý với các lưu ý trên.</p>`;
/* ---------- ủng hộ: mã QR theo từng mức ---------- */
function emvCrc(str) { let c = 0xFFFF; for (const ch of str) { c ^= ch.charCodeAt(0) << 8; for (let i = 0; i < 8; i++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; } return c.toString(16).toUpperCase().padStart(4, '0'); }
function tlvParse(s) { const out = []; let i = 0; while (i + 4 <= s.length) { const tag = s.slice(i, i + 2), len = +s.slice(i + 2, i + 4); out.push([tag, s.slice(i + 4, i + 4 + len)]); i += 4 + len; } return out; }
const tlvBuild = arr => arr.map(([t, v]) => t + String(v.length).padStart(2, '0') + v).join('');
/* Thêm số tiền (tag 54) và nội dung chuyển khoản vào mã QR gốc, tính lại mã kiểm tra CRC. Tài khoản nhận giữ nguyên. */
function donatePayload(amount) {
  let f = tlvParse(DONATE_PAYLOAD).filter(([t]) => t !== '63' && t !== '54');
  f = f.map(([t, v]) => {
    if (t === '01') return [t, '12'];
    if (t === '62') { const sub = tlvParse(v).filter(([k]) => k !== '08'); sub.push(['08', DONATE_NOTE]); sub.sort((a, b) => a[0].localeCompare(b[0])); return [t, tlvBuild(sub)]; }
    return [t, v];
  });
  f.push(['54', String(amount)]); f.sort((a, b) => a[0].localeCompare(b[0]));
  const body = tlvBuild(f) + '6304'; return body + emvCrc(body);
}
const DQR_CACHE = {};
try { document.fonts.ready.then(() => { for (const k in DQR_CACHE) delete DQR_CACHE[k]; if (document.getElementById('donate-h')) render(); }); } catch (e) {}
/* Vẽ thẻ mã QR (có tên, số tiền) ra ảnh PNG để hiển thị và tải về */
function donateImage(amount) {
  if (!amount) return DONATE_QR;
  if (DQR_CACHE[amount]) return DQR_CACHE[amount];
  try {
    const q = qrcode(0, 'M'); q.addData(donatePayload(amount)); q.make();
    const n = q.getModuleCount(), cell = Math.floor(440 / (n + 8)), qs = cell * (n + 8);
    const W = 520, H = qs + 250, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
    x.fillStyle = '#FFF5E4'; x.fillRect(0, 0, W, H);
    x.fillStyle = '#fff'; x.beginPath(); x.roundRect ? x.roundRect(20, 20, W - 40, H - 40, 24) : x.rect(20, 20, W - 40, H - 40); x.fill();
    x.fillStyle = '#2F6FE4'; x.font = '800 30px "Baloo 2", sans-serif'; x.textAlign = 'center'; x.fillText('Toán Vui cùng Pi ☕', W / 2, 66);
    const ox = (W - qs) / 2, oy = 84; x.fillStyle = '#fff'; x.fillRect(ox, oy, qs, qs); x.fillStyle = '#111';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) x.fillRect(ox + (c + 4) * cell, oy + (r + 4) * cell, cell, cell);
    x.fillStyle = '#1F9E78'; x.font = '800 40px "Baloo 2", sans-serif'; x.fillText(amount.toLocaleString('vi-VN') + 'đ', W / 2, oy + qs + 46);
    x.fillStyle = '#2B1D14'; x.font = '800 22px Nunito, sans-serif'; x.fillText(DONATE.name, W / 2, oy + qs + 82);
    x.fillStyle = '#6E5848'; x.font = '700 18px Nunito, sans-serif'; x.fillText(`${DONATE.bank} · ${DONATE.acct}`, W / 2, oy + qs + 110);
    x.font = '700 15px Nunito, sans-serif'; x.fillText('Ủng hộ tự nguyện · cảm ơn ba mẹ!', W / 2, oy + qs + 136);
    return (DQR_CACHE[amount] = cv.toDataURL('image/png'));
  } catch (e) { return DONATE_QR; }
}
function donateBlock() {
  if (typeof DONATE_QR === 'undefined') return '';
  const lv = (typeof DONATE_LEVELS !== 'undefined' && typeof qrcode !== 'undefined') ? DONATE_LEVELS : [0];
  const amt = lv.includes(UI.donAmt) ? UI.donAmt : lv[0];
  const k = v => v ? (v / 1000) + 'k' : 'Tuỳ tâm';
  return `<section class="card stack" aria-labelledby="donate-h">
    <div class="row">${pi('cheer', 52)}<h2 class="h3" id="donate-h" style="flex:1;min-width:0">Tiếp lửa để Team Mèo Pi thêm động lực đồng hành và phát triển cùng con nha ba mẹ ☕</h2></div>
    ${lv.length > 1 ? `<div class="donlv" role="radiogroup" aria-label="Chọn mức ủng hộ">${lv.map(v => `<button type="button" class="chip ${v === amt ? 'on' : ''}" style="--c:var(--jade)" role="radio" aria-checked="${v === amt}" data-act="donAmt" data-v="${v}">${k(v)}</button>`).join('')}</div>` : ''}
    <img src="${donateImage(amt)}" alt="Mã QR ủng hộ ${amt ? amt.toLocaleString('vi-VN') + ' đồng' : 'tuỳ tâm'}: ${DONATE.name}, ${DONATE.bank}, số tài khoản ${DONATE.acct}" style="width:100%;max-width:260px;align-self:center;border-radius:16px;border:2px solid var(--line)">
    <p class="tiny muted" style="font-weight:700;text-align:center">${amt ? `Mã QR đã có sẵn số tiền <b>${amt.toLocaleString('vi-VN')}đ</b>.` : 'Mã QR không kèm số tiền, ba mẹ tự nhập số tiền tuỳ tâm.'}</p>
    <div class="row wrap" style="justify-content:center"><button type="button" class="btn sm jade" data-act="dlQR" data-v="${amt}">⬇️ Tải mã QR</button><button type="button" class="btn sm ghost" data-act="copyAcct">📋 Chép số tài khoản</button></div>
    <div style="min-width:0;text-align:center"><b>${DONATE.name}</b><div class="tiny muted" style="font-weight:700">${DONATE.bank} · <span class="num" id="donate-acct" style="user-select:all">${DONATE.acct}</span></div></div>
    <p class="tiny muted" style="font-weight:700">Quét mã bằng ứng dụng ngân hàng, hoặc bấm <b>Tải mã QR</b> rồi mở ứng dụng ngân hàng → chọn quét QR → <b>chọn ảnh từ thư viện</b>. Trên iPhone, nếu ảnh mở ra trang mới, nhấn giữ ảnh → <b>Lưu vào Ảnh</b>.</p>
    <p class="demo tiny"><b>Lưu ý:</b> ủng hộ là hoàn toàn tự nguyện, mang tính cho tặng, không phải tiền mua sản phẩm hay dịch vụ. Các mức chỉ là gợi ý. Ủng hộ hay không đều dùng ứng dụng như nhau, không kèm quyền lợi, không phát sinh hợp đồng, nghĩa vụ hay trách nhiệm pháp lý nào giữa hai bên và không hoàn lại. Ba mẹ vui lòng kiểm tra tên người nhận trước khi chuyển.</p>
  </section>`;
}
function spreadBlock() {
  return `<section class="card stack" style="background:var(--gold-soft);border-color:transparent">
    <div class="say">${tron(52)}<div style="flex:1;min-width:0"><b style="font-family:var(--f-display);font-size:17px;display:block;line-height:1.25">Lan tỏa ${APP_NAME} nha ba mẹ 💛</b><p style="font-weight:700;margin-top:4px">Ba mẹ hãy đồng hành cùng con 15 phút mỗi ngày nhé.</p></div></div>
    <button type="button" class="btn sm gold" data-act="share">🔗 Chia sẻ cho bạn bè</button>
  </section>`;
}
const hasRealFamily = () => Object.values(STORE.families).some(f => !f.demo);
function vWelcome() {
  const f = DEV.familyId && STORE.families[DEV.familyId];
  return `<div class="hero">
    <div class="cast">${tron(70)}${pi('cheer', 132, 'bob')}${bi(70)}</div>
    <div class="brand">Toán <b>Vui</b> <span>cùng Pi</span></div>
    <span class="pill jade">Miễn phí 100% · không quảng cáo</span>
    <p class="muted" style="max-width:36ch;font-weight:700">Học Toán lớp 1–5 <b>bám sát chương trình GDPT 2018</b>. Mỗi ngày một bài, làm nhiệm vụ thật, nhận sao thưởng.</p>
  </div>
  <div class="say">${pi('happy', 56)}<div class="bubble">Chào con! Mình là <b>mèo Pi</b>, đeo nơ dấu cộng nè. Bạn cánh cụt <b>Tròn</b> giữ nhiệm vụ, heo đất <b>Bi</b> giữ hũ sao.</div></div>
  <div class="stack">
    <button class="choice" data-act="toChild"><span class="ic" style="background:var(--gold-soft)">🎒</span><span><b>Con vào học</b><span class="muted tiny">${f ? 'Gia đình: ' + esc(f.parentName) : 'Chọn hồ sơ và nhập mã PIN 4 số'}</span></span></button>
    <button class="choice" data-act="go" data-v="parentLogin"><span class="ic" style="background:var(--jade-soft)">👨‍👩‍👧</span><span><b>Ba mẹ đăng nhập</b><span class="muted tiny">Theo dõi tiến độ, duyệt nhiệm vụ, trao thưởng</span></span></button>
    <button class="choice" data-act="startReg"><span class="ic" style="background:color-mix(in srgb,var(--pri) 14%,var(--surface))">✨</span><span><b>Tạo tài khoản gia đình</b><span class="muted tiny">Miễn phí · thêm nhiều con, mỗi con một mã PIN</span></span></button>
  </div>
  ${hasRealFamily() ? '' : `<div class="demo">Muốn xem thử? <button class="link" data-act="demo">Mở gia đình mẫu</button> · ba mẹ: <b>demo</b> / <b>123456</b> · Bông lớp 1: PIN <b>1111</b> · Tí lớp 3: PIN <b>2222</b></div>`}
  <div class="stack" style="gap:8px"><p class="tiny muted" style="text-align:center;font-weight:700">Dùng máy mới? Khôi phục tài khoản từ file sao lưu:</p>${restoreBlock(false)}</div>
  <p class="sync">${syncLabel()}</p>
  <p class="tiny muted" style="text-align:center;font-weight:600;max-width:52ch;margin:0 auto">Ứng dụng cá nhân, độc lập, miễn phí. Nội dung tự biên soạn, chỉ mang tính tham khảo và ôn luyện thêm.</p>
  <details class="card"><summary style="font-weight:800;cursor:pointer">📜 Lưu ý & miễn trừ trách nhiệm</summary><div class="stack tiny" style="margin-top:10px;font-weight:600">${DISCLAIMER}</div></details>`;
}
function restoreBlock(withExport) {
  return `<div class="row wrap" style="justify-content:${withExport ? 'flex-start' : 'center'}">${withExport ? '<button class="btn sm jade" data-act="exportData">⬇️ Tải file sao lưu</button>' : ''}<label class="btn sm ghost" for="importFile" style="cursor:pointer">⬆️ Khôi phục từ file sao lưu</label><input type="file" id="importFile" accept="application/json,.json" hidden>
  ${UI.confirm === 'import' ? `<div class="demo stack" style="gap:8px">File có tài khoản <b>${esc(UI.importData.names)}</b>. Khôi phục sẽ thay tiến độ, sao và hồ sơ của gia đình đó trên máy này bằng bản trong file.<div class="row"><button class="btn sm jade" data-act="doImport">Khôi phục</button><button class="btn sm ghost" data-act="cancelConfirm">Hủy</button></div></div>` : ''}</div>`;
}
function backBtn(v = 'welcome') { return `<div class="row"><button class="x" data-act="go" data-v="${v}" aria-label="Quay lại">←</button></div>`; }
function vParentLogin() {
  return `${backBtn()}
  <div class="say">${pi('happy', 64)}<div class="bubble">Chào ba mẹ! Đăng nhập để xem con học thế nào nhé.</div></div>
  <form class="card stack" data-form="parentLogin" autocomplete="on">
    <h1 class="h2">Ba mẹ đăng nhập</h1>
    <div class="field"><label for="pl-login">Số điện thoại hoặc email</label><input class="input" id="pl-login" name="login" autocomplete="username" autofocus></div>
    <div class="field"><label for="pl-pass">Mật khẩu</label><input class="input" id="pl-pass" name="pass" type="password" autocomplete="current-password"></div>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}
    <button class="btn block" type="submit">Đăng nhập</button>
    <div class="row between wrap"><button type="button" class="link tiny" data-act="go" data-v="forgot">Quên mật khẩu?</button><button type="button" class="link tiny" data-act="startReg">Tạo tài khoản mới</button></div>
  </form>
  <section class="card stack"><p class="tiny muted" style="font-weight:700">Tài khoản tạo trên máy khác? Dữ liệu nằm riêng trên từng máy. Trên máy cũ vào <b>Tài khoản → Tải file sao lưu</b>, rồi khôi phục ở đây.</p>${restoreBlock(false)}</section>
  ${donateBlock()}`;
}
function vForgot() {
  const locked = UI.forgotLock && Date.now() < UI.forgotLock;
  return `${backBtn('parentLogin')}
  <div class="say">${pi('think', 64)}<div class="bubble">Không sao! Dùng mã PIN ba mẹ (4 số) để đặt mật khẩu mới nhé.</div></div>
  <form class="card stack" data-form="forgot">
    <h1 class="h2">Đặt lại mật khẩu</h1>
    <div class="field"><label for="fg-login">Số điện thoại hoặc email</label><input class="input" id="fg-login" name="login" autocomplete="username" autofocus></div>
    <div class="field"><label for="fg-pin">Mã PIN ba mẹ</label><input class="input" id="fg-pin" name="ppin" inputmode="numeric" maxlength="4"></div>
    <div class="field"><label for="fg-pass">Mật khẩu mới (ít nhất 6 ký tự)</label><input class="input" id="fg-pass" name="pass" type="password" autocomplete="new-password"></div>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}
    <button class="btn block" type="submit" ${locked ? 'disabled' : ''}>${locked ? 'Thử lại sau 1 phút' : 'Đặt mật khẩu mới'}</button>
    <p class="tiny muted" style="font-weight:700">Quên cả mã PIN ba mẹ? Ứng dụng không có máy chủ nên không lấy lại được. Hãy tạo tài khoản mới hoặc khôi phục từ file sao lưu.</p>
  </form>`;
}
function vRegister() {
  const r = UI.reg;
  if (r.step === 1) return `${backBtn()}
  <div class="say">${pi('cheer', 64)}<div class="bubble">Mình cùng tạo tài khoản gia đình nhé! Chỉ mất 1 phút.</div></div>
  <form class="card stack" data-form="reg1">
    <div class="eyebrow">Bước 1/2 · Thông tin ba mẹ</div>
    <div class="field"><label for="r-name">Tên hiển thị</label><input class="input" id="r-name" name="name" placeholder="VD: Ba mẹ An" value="${esc(r.name || '')}" autofocus></div>
    <div class="field"><label for="r-login">Số điện thoại hoặc email</label><input class="input" id="r-login" name="login" autocomplete="username" value="${esc(r.login || '')}"></div>
    <div class="field"><label for="r-pass">Mật khẩu (ít nhất 6 ký tự)</label><input class="input" id="r-pass" name="pass" type="password" autocomplete="new-password"></div>
    <div class="field"><label for="r-ppin">Mã PIN ba mẹ (4 số)</label><input class="input" id="r-ppin" name="ppin" inputmode="numeric" maxlength="4" placeholder="Dùng để vào khu ba mẹ trên máy của con"></div>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}
    <button class="btn block" type="submit">Tiếp tục</button>
  </form>`;
  return `<div class="row"><button class="x" data-act="regBack" aria-label="Quay lại">←</button></div>
  <div class="say">${tron(60)}<div class="bubble">Giờ thêm hồ sơ cho con. Mỗi con có lộ trình, sao và mã PIN riêng.</div></div>
  ${childForm('reg2', { name: '', grade: 1, avatar: '🐰', pin: '' }, 'Bước 2/2 · Hồ sơ của con', 'Hoàn tất')}
  <p class="tiny muted" style="text-align:center;font-weight:700">Có nhiều con? Thêm hồ sơ tiếp trong mục Tài khoản sau khi hoàn tất.</p>`;
}
const AVATARS = ['🐰', '🐻', '🐱', '🐼', '🦊', '🐸', '🐥', '🐯', '🐨', '🐶', '🦄', '🐧'];
const AVA_BG = ['#FFE1E6', '#FCE6CF', '#FFEFC2', '#E4F1E1', '#FFE0CC', '#DDF3E4', '#FFF4C4', '#FFE6C9', '#E6E9F5', '#F3E5D8', '#F1E2FA', '#DDEBF7'];
const avaBg = a => AVA_BG[Math.max(0, AVATARS.indexOf(a))] || '#FCE6CF';
function ava(a, cls = '') { return `<span class="ava ${cls}" style="--ac:${avaBg(a)}">${a}</span>`; }
function childForm(form, c, title, btn) {
  const sel = UI.edit?.avatar || c.avatar, gsel = UI.edit?.grade || c.grade;
  return `<form class="card stack" data-form="${form}">
    <div class="eyebrow">${title}</div>
    <div class="field"><label for="c-name">Tên của con</label><input class="input" id="c-name" name="name" value="${esc(UI.edit?.name ?? c.name)}" placeholder="VD: Bông" autofocus></div>
    <div class="field"><label>Con học lớp mấy?</label><div class="chips">${[1, 2, 3, 4, 5].map(g => `<button type="button" class="chip ${gsel == g ? 'on' : ''}" style="--c:${GRADES[g].c}" data-act="editSet" data-k="grade" data-val="${g}">Lớp ${g}</button>`).join('')}</div></div>
    <div class="field"><label>Chọn bạn đồng hành</label><div class="avpick">${AVATARS.map(a => `<button type="button" class="${sel === a ? 'on' : ''}" data-act="editSet" data-k="avatar" data-val="${a}" aria-label="Ảnh đại diện ${a}">${a}</button>`).join('')}</div></div>
    <div class="field"><label for="c-pin">Mã PIN của con (4 số)</label><input class="input" id="c-pin" name="pin" inputmode="numeric" maxlength="4" value="${esc(UI.edit?.pin ?? c.pin)}"></div>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}
    <button class="btn block jade" type="submit">${btn}</button>
  </form>`;
}
function vFamilyFind() {
  return `${backBtn()}
  <div class="say">${pi('think', 64)}<div class="bubble">Máy này chưa biết gia đình con. Nhờ ba mẹ nhập số điện thoại hoặc email của tài khoản nhé.</div></div>
  <form class="card stack" data-form="family">
    <div class="field"><label for="f-login">Số điện thoại hoặc email của ba mẹ</label><input class="input" id="f-login" name="login" autofocus></div>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}
    <button class="btn block" type="submit">Tìm gia đình</button>
  </form>`;
}
function vProfiles() {
  const f = STORE.families[DEV.familyId]; if (!f) return vWelcome();
  return `${backBtn()}
  <div class="say">${pi('happy', 64)}<div class="bubble">Ai đang học đó? Chạm vào tên của con nha!</div></div>
  <div class="row between"><h1 class="h2">${esc(f.parentName)}</h1>${f.demo ? '<span class="pill gold">Gia đình mẫu</span>' : ''}</div>
  <div class="profiles">
    ${f.children.map(c => `<button class="prof" data-act="pinFor" data-cid="${c.id}">${ava(c.avatar)}<span>${esc(c.name)}</span><span class="pill" style="color:${GRADES[c.grade].c}">Lớp ${c.grade}</span></button>`).join('')}
    <button class="prof" data-act="pinFor" data-cid="__parent"><span class="ava" style="--ac:var(--jade-soft)">🔑</span><span>Ba mẹ</span><span class="pill">Mã PIN</span></button>
  </div>
  ${f.demo ? '<div class="demo">Mã PIN mẫu: Bông <b>1111</b> · Tí <b>2222</b> · Ba mẹ <b>0000</b></div>' : ''}
  ${spreadBlock()}
  <p class="tiny muted" style="text-align:center">Không phải gia đình này? <button class="link" data-act="forgetFamily">Đổi gia đình</button></p>`;
}
function vPin() {
  const f = STORE.families[DEV.familyId]; if (!f) return vWelcome(); const isP = UI.pinFor === '__parent'; const c = !isP && childOf(f, UI.pinFor);
  if (!isP && !c) return vProfiles();
  const dots = [0, 1, 2, 3].map(i => `<i class="${i < UI.pin.length ? 'on' : ''}"></i>`).join('');
  return `${backBtn('profiles')}
  <div class="hero" style="padding-top:0">${isP ? `<span class="ava" style="--ac:var(--jade-soft)">🔑</span>` : ava(c.avatar)}
    <h1 class="h2">${isP ? 'Mã PIN ba mẹ' : 'Chào ' + esc(c.name) + '!'}</h1>
    <p class="muted" style="font-weight:700">${UI.pinBad ? '<span class="err">Mã chưa đúng, thử lại nhé!</span>' : 'Nhập mã PIN 4 số'}</p>
    <div class="dots ${UI.pinBad ? 'bad' : ''}" aria-label="Đã nhập ${UI.pin.length} trên 4 số">${dots}</div>
  </div>
  <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-act="pinKey" data-k="${n}">${n}</button>`).join('')}<span></span><button data-act="pinKey" data-k="0">0</button><button data-act="pinKey" data-k="del" aria-label="Xóa">⌫</button></div>
  <p class="tiny muted" style="text-align:center">${isP ? 'Quên mã PIN? Đăng nhập bằng mật khẩu ở màn hình chính.' : 'Quên mã PIN? Nhờ ba mẹ đặt lại trong mục Tài khoản.'}</p>`;
}

/* ---------- khu vực của con ---------- */
function curChild() { const f = fam(); return f && childOf(f, DEV.session?.cid); }
function vChild() {
  const f = fam(), c = curChild(); if (!c) return vWelcome();
  const p = prog(f, c.id), ws = weekStars(f, c.id); const g = UI.grade || learnGrade(f, c);
  const top = `<div class="topbar">${ava(c.avatar, 'sm')}<div class="who"><b>${esc(c.name)}</b><span class="tiny muted" style="font-weight:800">Đang học Lớp ${g} · ${GRADES[g].world}</span></div>
    <span class="statpill" title="Chuỗi ngày học">🔥 ${streakNow(p)}</span><span class="statpill" title="Sao tuần này">⭐ ${ws}/${capOf(f)}</span></div>`;
  let body = '';
  if (UI.tab === 'learn') body = vLearn(f, c, p);
  else if (UI.tab === 'missions') body = vMissions(f, c, p);
  else if (UI.tab === 'rewards') body = vRewards(f, c, p);
  else body = vMe(f, c, p);
  const pending = Object.values(p.missions).filter(m => m.status === 'pending').length;
  const tabs = [['learn', '🗺️', 'Học'], ['missions', '🎯', 'Nhiệm vụ'], ['rewards', '⭐', 'Hũ sao'], ['me', ava(c.avatar, 'xs'), 'Của con']];
  return top + body + `<nav class="tabbar" aria-label="Điều hướng"><div class="in">${tabs.map(([k, i, t]) => `<button class="tab ${UI.tab === k ? 'on' : ''}" data-act="tab" data-t="${k}" aria-current="${UI.tab === k}"><span class="i">${i}</span>${t}${k === 'missions' && pending ? ` <span class="pill red" style="padding:0 6px;font-size:11px">${pending}</span>` : ''}</button>`).join('')}</div></nav>`;
}
function vGradePick() {
  const f = fam(), c = curChild(); if (!c) return vWelcome();
  const p = prog(f, c.id), last = p.lastGrade;
  return `<div class="row"><button class="x" data-act="switchUser" aria-label="Đổi người dùng">←</button></div>
  <div class="say">${pi('happy', 64, 'bob')}<div class="bubble">Chào ${esc(c.name)}! Hôm nay con muốn học Toán <b>lớp mấy</b>? Con chọn lớp nào cũng được, kể cả ôn lại lớp dưới.</div></div>
  <div class="stack">${[1, 2, 3, 4, 5].map(g => {
    const G = GRADES[g], st = nodeStates(f, c, g), done = st.filter(s => s.done).length, pct = Math.round(done / st.length * 100);
    const nLessons = CUR[g].reduce((a, T) => a + T.lessons.length, 0);
    const tags = [g === c.grade ? '<span class="pill gold">⭐ Lớp của con</span>' : '', g === last ? '<span class="pill jade">Học gần nhất</span>' : ''].join('');
    return `<button class="choice" data-act="pickGrade" data-g="${g}" style="border-color:${g === last ? G.c : 'var(--line)'}">
      <span class="ic" style="background:${G.c};color:#fff;font-family:var(--f-display);font-weight:800;font-size:26px">${g}</span>
      <span style="flex:1;min-width:0"><b>Lớp ${g} · ${G.world}</b><span class="tiny muted" style="font-weight:700;display:block">${CUR[g].length} chủ đề · ${nLessons} bài · ${esc(G.friend)}</span>
      ${tags ? `<span class="row wrap" style="gap:6px;margin-top:4px">${tags}</span>` : ''}
      <span class="meter" style="display:block;margin-top:6px;height:10px"><i style="width:${pct}%;background:${G.c}"></i></span>
      <span class="tiny muted" style="font-weight:800">${done}/${st.length} chặng</span></span></button>`;
  }).join('')}</div>`;
}
function vLearn(f, c, p) {
  const g = UI.grade || learnGrade(f, c); const G = GRADES[g];
  const states = nodeStates(f, c, g); const done = states.filter(s => s.done).length;
  const cur = states.find(s => s.current);
  const xs = [0, 46, 70, 46, 0, -46, -70, -46];
  let pathHtml = '', lastT = 0, k = 0;
  states.forEach((s, i) => {
    if (s.T.n !== lastT) { lastT = s.T.n; k = 0; pathHtml += `<div class="book"><span>${s.T.review ? s.T.icon + ' ' : `Chủ đề ${CUR[g].slice(0, s.T.n).filter(x => !x.review).length} · `}${esc(s.T.title)}</span></div>`; }
    const x = xs[k++ % xs.length];
    const cls = ['node', s.type === 'review' ? 'review' : '', !s.open ? 'locked' : '', s.current ? 'current' : ''].join(' ');
    const maxS = s.type === 'lesson' ? 6 : 3;
    const starTxt = s.stars ? '★'.repeat(Math.min(s.stars, maxS)) : '';
    const label = s.type === 'lesson' ? s.l.title : (s.T.review ? s.T.title : 'Ôn tập chủ đề');
    pathHtml += `<button class="${cls}" style="--x:${x};--c:${G.c}" data-act="openNode" data-g="${g}" data-i="${i}" aria-label="${esc(label)}${s.open ? '' : ' (đang khóa)'}">
      <span class="disc">${s.current ? '<span class="here">Học tiếp</span>' : ''}${s.open ? (s.type === 'lesson' ? s.l.icon : '🏆') : '🔒'}${s.type === 'lesson' ? `<span class="no">${s.l.n}</span>` : ''}</span>
      <span class="lbl">${esc(label)}</span>${starTxt ? `<span class="st">${starTxt}</span>` : ''}</button>`;
  });
  const hello = cur ? (cur.type === 'lesson' ? `Hôm nay mình học <b>${esc(cur.l.title)}</b> nhé!` : `Đến lúc <b>ôn tập</b> rồi! Làm tốt là được 3 sao.`) : `Con đã xong cả ${G.world}! Giỏi quá!`;
  return `<div class="gradebar" role="tablist">${[1, 2, 3, 4, 5].map(k => `<button class="chip ${k === g ? 'on' : ''}" style="--c:${GRADES[k].c}" data-act="grade" data-g="${k}" role="tab" aria-selected="${k === g}">Lớp ${k}${k === c.grade ? ' ⭐' : ''}</button>`).join('')}<button class="chip" data-act="toGradePick" aria-label="Chọn lớp">Đổi lớp</button></div>
  <section class="world" style="--c:${G.c}">${pi(cur ? 'happy' : 'cheer', 74, 'bob')}<div style="flex:1;min-width:0;position:relative;z-index:1"><div class="s">Toán lớp ${g} · Chương trình GDPT 2018</div><div class="t">${G.world}</div><div class="s">${done}/${states.length} chặng · ${CUR[g].length} chủ đề</div><div class="bar"><i style="width:${Math.round(done / states.length * 100)}%"></i></div></div></section>
  <div class="say">${pi('happy', 44)}<div class="bubble" style="font-weight:600">${hello}</div></div>
  <div class="path">${pathHtml}</div>`;
}
function missionCard(p, g, T, withBtn = true) {
  const k = topicKey(g, T.n), m = p.missions[k], open = missionOpen(p, g, T);
  const btn = !m ? (open ? `<button class="btn sm jade" data-act="missionDone" data-key="${k}">Con đã làm xong</button>` : `<span class="pill">Học bài đầu của chủ đề để mở</span>`)
    : m.status === 'pending' ? `<span class="pill gold">⏳ Chờ ba mẹ xác nhận</span>` : `<span class="pill jade">Đã nhận ${MISSION_STARS} sao ✓</span>`;
  return `<div class="mission"><div class="hd"><span class="ic">${tron(40)}</span><div class="tx"><b>Nhiệm vụ thực tế của Tròn</b><span class="tiny muted">${esc(T.title)} · làm ở nhà · ba mẹ xác nhận · +${MISSION_STARS} sao</span></div></div><p>${esc(T.mission)}</p>${withBtn ? `<div class="row">${btn}</div>` : ''}</div>`;
}
function nodeSheet(g, i) {
  return () => {
    const f = fam(), c = curChild(), p = prog(f, c.id); const s = nodeStates(f, c, g)[i]; const T = s.T;
    if (s.type === 'review') {
      const st = p.lessons[s.key] || 0; const n = T.review ? 15 : 12;
      return `<span class="grip"></span><div class="row">${bi(60)}<div><div class="eyebrow">Lớp ${g} · ${T.review ? 'Ôn tập' : 'Cuối chủ đề'}</div><h2 class="h2">${T.review ? esc(T.title) : 'Ôn tập: ' + esc(T.title)}</h2></div></div>
      <p class="muted" style="font-weight:600">${n} câu trộn các dạng bài ${T.review ? 'đã học trong ' + (/cuối năm/i.test(T.title) ? 'cả năm' : 'học kì') : 'của chủ đề'}. Đúng từ 90% được 3 sao.</p>
      <button class="lessonrow" data-act="startLesson" data-key="${s.key}" data-kind="review" data-g="${g}" data-i="${i}"><span class="ic">🏆</span><span class="tx"><b>Bài ôn tập</b><span class="tiny muted">Tối đa 3 sao</span></span><span class="pill gold">${'★'.repeat(st) || 'Chưa làm'}</span></button>
      ${missionCard(p, g, T)}`;
    }
    const l = s.l, k = s.key, s1 = p.lessons[k + 'a'] || 0, s2 = p.lessons[k + 'b'] || 0;
    return `<span class="grip"></span>
    <div class="row"><span class="ava" style="--ac:color-mix(in srgb,${GRADES[g].c} 18%,var(--surface));border-radius:18px">${l.icon}</span><div style="min-width:0"><div class="eyebrow">Lớp ${g} · ${esc(T.title)}</div><h2 class="h2">${esc(l.title)}</h2></div></div>
    <div class="tipcard"><b>📌 Ghi nhớ</b><p>${esc(l.tip)}</p></div>
    <button class="lessonrow" data-act="startLesson" data-key="${k}a" data-kind="a" data-g="${g}" data-i="${i}"><span class="ic">📖</span><span class="tx"><b>Bước 1 · Bài học</b><span class="tiny muted">Pi giảng bài, xem ví dụ, làm thử 4 câu · tối đa 3 sao</span></span><span class="pill gold">${s1 ? '★'.repeat(s1) : 'Bắt đầu'}</span></button>
    <button class="lessonrow" data-act="startLesson" data-key="${k}b" data-kind="b" data-g="${g}" data-i="${i}" ${s1 || f.unlockAll ? '' : 'disabled'}><span class="ic">✏️</span><span class="tx"><b>Bước 2 · Luyện tập</b><span class="tiny muted">${s1 || f.unlockAll ? '10 câu luyện tập · tối đa 3 sao' : 'Mở sau khi xong Bước 1'}</span></span><span class="pill gold">${s2 ? '★'.repeat(s2) : (s1 || f.unlockAll ? 'Bắt đầu' : '🔒')}</span></button>
    ${missionCard(p, g, T)}`;
  };
}
function vMissions(f, c, p) {
  const items = [];
  for (let g = 1; g <= 5; g++) CUR[g].forEach(T => { const k = topicKey(g, T.n); const m = p.missions[k]; if (m || missionOpen(p, g, T)) items.push({ g, T, k, m }); });
  const today = dayKey(); const todayLessons = p.log.filter(l => dayKey(new Date(l.ts)) === today).length;
  const pending = items.filter(x => x.m?.status === 'pending'), todo = items.filter(x => !x.m), done = items.filter(x => x.m?.status === 'approved');
  const card = x => `<div class="mission"><div class="hd"><span class="ic">${x.T.icon}</span><div class="tx"><b>${esc(x.T.title)}</b><span class="tiny muted">Lớp ${x.g}</span></div>${x.m?.status === 'approved' ? `<span class="pill jade">+${MISSION_STARS} ⭐</span>` : ''}</div><p>${esc(x.T.mission)}</p>
    ${!x.m ? `<div class="row"><button class="btn sm jade" data-act="missionDone" data-key="${x.k}">Con đã làm xong</button></div>` : x.m.status === 'pending' ? '<div class="row"><span class="pill gold">⏳ Chờ ba mẹ xác nhận</span></div>' : ''}</div>`;
  const goal = Math.min(todayLessons, 2);
  return `<div class="say">${tron(64, 'bob')}<div class="bubble">Mình là <b>Tròn</b>! Mỗi chủ đề có một nhiệm vụ làm ở nhà cùng ba mẹ. Làm xong, bấm nút, ba mẹ xác nhận là con được <b>${MISSION_STARS} sao</b>.</div></div>
  <section class="card stack"><div class="row between"><h2 class="h3">Mục tiêu hôm nay</h2><span class="pill ${goal >= 2 ? 'jade' : ''}">${goal}/2 bài</span></div>
    <div class="meter"><i style="width:${goal * 50}%;background:var(--jade)"></i></div>
    <p class="tiny muted" style="font-weight:700">${goal >= 2 ? 'Tuyệt vời! Con đã hoàn thành mục tiêu hôm nay.' : 'Học 2 bài mỗi ngày để giữ chuỗi 🔥 và nhớ bài lâu hơn.'}</p></section>
  ${pending.length ? `<h2 class="h3">Đang chờ ba mẹ (${pending.length})</h2>${pending.map(card).join('')}` : ''}
  <h2 class="h3">Nên làm ngay</h2>
  ${todo.length ? todo.slice(0, 6).map(card).join('') : `<div class="card muted" style="font-weight:700">Học bài đầu tiên của một chủ đề là nhiệm vụ của chủ đề đó hiện ra ở đây.</div>`}
  ${done.length ? `<h2 class="h3">Đã hoàn thành (${done.length})</h2>${done.slice(-6).reverse().map(card).join('')}` : ''}`;
}
function vRewards(f, c, p) {
  const ws = weekStars(f, c.id), cp = capOf(f), up = unpaid(f, c.id);
  const pct = Math.round(ws / cp * 100);
  const bs = badgesOf(f, c.id);
  const recent = p.ledger.slice(-8).reverse();
  return `<div class="say">${bi(64, 'bob')}<div class="bubble">Mình là heo đất <b>Bi</b>, giữ hũ sao cho con. Mỗi sao = <b>1.000đ</b>, tối đa <b>${cp} sao</b> mỗi tuần.</div></div>
  <section class="card jar"><div class="ring" style="--p:${pct}"><div><div><b>${ws}</b><div class="tiny muted" style="font-weight:800">/ ${cp} sao</div></div></div></div>
    <div class="stack" style="gap:4px;min-width:0"><span class="eyebrow">Tuần này</span><span class="money">${vnd(ws * STAR)}</span>
    <span class="tiny muted" style="font-weight:700">${ws >= cp ? 'Con đã đạt tối đa tuần này! Cứ học tiếp, sao luyện tập vẫn được ghi lại.' : `Còn ${cp - ws} sao nữa là đầy hũ tuần này.`}</span></div></section>
  <section class="card row between"><div><div class="eyebrow">Ba mẹ sẽ trao cho con</div><div class="money" style="font-size:24px">${vnd(up * STAR)}</div></div><span style="font-size:40px">🎁</span></section>
  <h2 class="h3">Huy hiệu</h2>
  <div class="badges">${bs.map(b => `<div class="badge ${b.on ? '' : 'off'}"><span class="b">${b.b}</span>${esc(b.t)}</div>`).join('')}</div>
  <h2 class="h3">Sao gần đây</h2>
  <section class="card ledger">${recent.length ? recent.map(e => `<div class="li"><span>⭐</span><span class="tx">${esc(e.reason)}<small>${new Date(e.ts).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}${e.counted < e.n ? ` · ${e.n - e.counted} sao luyện tập (vượt mức tuần)` : ''}</small></span><span class="n">+${e.counted}</span></div>`).join('') : '<p class="muted">Chưa có sao nào. Học bài đầu tiên để nhận sao nhé!</p>'}</section>`;
}
function vMe(f, c, p) {
  const secsWeek = Object.entries(p.secs).filter(([d]) => d >= weekKey()).reduce((a, [, s]) => a + s, 0);
  return `<section class="card stack" style="align-items:center;text-align:center">${ava(c.avatar)}<h2 class="h2">${esc(c.name)}</h2><span class="pill" style="color:${GRADES[c.grade].c}">Lớp ${c.grade} · ${GRADES[c.grade].world}</span>
    <div class="statgrid"><div class="stat"><b>${lessonsDone(p)}</b><span>bài đã học</span></div><div class="stat"><b>${p.solved || 0}</b><span>câu làm đúng</span></div><div class="stat"><b>${Math.round(secsWeek / 60)}</b><span>phút tuần này</span></div></div></section>
  <div class="say">${pi('happy', 56)}<div class="bubble" style="font-weight:600">Bí quyết của Pi: đọc kỹ đề, <b>gạch chân con số</b> và câu hỏi, làm xong thì <b>thử lại</b> kết quả nhé!</div></div>
  <div class="stack"><button class="btn ghost block" data-act="switchUser">🔁 Đổi người dùng</button><button class="btn ghost block" data-act="toParentPin">🔑 Khu vực ba mẹ</button></div>`;
}

/* ---------- tạo bài học ---------- */
function freshQ(spec, seen) { let q; for (let k = 0; k < 6; k++) { q = makeQ(spec); const sig = q.q + '|' + q.ans + '|' + (q.fig || '').length; if (!seen.has(sig)) { seen.add(sig); break; } } return q; }
function buildSet(specs, n) { const seen = new Set(); const order = []; while (order.length < n) order.push(...shuffle(specs)); return order.slice(0, n).map(s => ({ t: 'q', q: freshQ(s, seen), scored: true })); }
function startLesson(key, kind, g, i) {
  const s = nodeStates(fam(), curChild(), g)[i]; const T = s.T; let items, title, sub;
  if (kind === 'review') { items = buildSet(reviewPool(g, T.n), T.review ? 15 : 12); title = T.review ? T.title : 'Ôn tập chủ đề'; sub = T.review ? `Lớp ${g}` : T.title; }
  else {
    const l = s.l; title = l.title; sub = kind === 'a' ? 'Bước 1 · Bài học' : 'Bước 2 · Luyện tập';
    if (kind === 'a') { const seen = new Set(); items = [{ t: 'teach', l }, ...shuffle(l.gens).concat(l.gens).slice(0, 2).map(sp => ({ t: 'example', q: freshQ(sp, seen) })), ...buildSet(l.gens, 4)]; }
    else items = buildSet(l.gens, 10);
  }
  UI.L = { key, kind, g, i, items, idx: 0, state: null, picked: null, input: '', correct: 0, scored: items.filter(x => x.scored).length, retried: new Set(), title, sub, start: Date.now() };
  go('lesson'); autoSpeak();
}
function curItem() { return UI.L.items[UI.L.idx]; }
function autoSpeak() { /* Lớp 1–2: đọc to đề bài nếu máy có giọng tiếng Việt */ const it = curItem(); if (!it || !canSpeak()) return; if (UI.L.g <= 2 && it.t === 'q') setTimeout(() => say(stripTags(it.q.q)), 250); }

function numpad(q) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const extra = q.kind === 'frac' ? '/' : (q.ans.includes(',') || UI.L.g >= 5 ? ',' : '');
  return `<div class="numpad">${keys.map(k => `<button data-act="key" data-k="${k}">${k}</button>`).join('')}${extra ? `<button data-act="key" data-k="${extra}">${extra}</button>` : '<span></span>'}<button data-act="key" data-k="0">0</button><button data-act="key" data-k="del" aria-label="Xóa">⌫</button></div>`;
}
function vLesson() {
  const L = UI.L, it = curItem(); const pct = Math.round(L.idx / L.items.length * 100);
  const fresh = L.shown !== L.idx; L.shown = L.idx; document.body.classList.toggle('still', !fresh);
  const answered = L.state !== null;
  let body = '', title = '';
  const spk = t => canSpeak() ? `<button class="speak sm" data-act="say" data-t="${esc(stripTags(t))}" aria-label="Nghe đọc đề">🔊</button>` : '';
  if (it.t === 'teach') {
    title = 'Pi giảng bài';
    body = `<div class="card teach"><div class="row" style="align-items:flex-start">${pi('happy', 72, 'bob')}<div style="flex:1;min-width:0"><div class="eyebrow">${esc(L.title)}</div><p class="tipbig">${esc(it.l.tip)}</p></div></div>${spk(it.l.tip)}</div>
      <div class="say">${tron(48)}<div class="bubble" style="font-weight:600">Đọc to phần ghi nhớ 2 lần nhé. Tiếp theo Pi sẽ làm mẫu cho con xem!</div></div>`;
  } else if (it.t === 'example') {
    const q = it.q; title = 'Ví dụ mẫu';
    body = `<div class="card stack exq"><span class="pill gold" style="align-self:flex-start">👀 Xem Pi làm mẫu</span><div class="qtext">${q.q}</div>${q.fig ? `<div class="figwrap">${q.fig}</div>` : ''}
      <div class="answerline">Đáp án: <b>${q.kind === 'frac' ? fracView(q.ans) : esc(q.ans)}${q.unit ? ' ' + esc(q.unit) : ''}</b></div><div class="exbox">💡 ${q.ex}</div></div>`;
  } else {
    const q = it.q; title = q.title;
    const optCls = o => { if (!answered) return ''; if (o === q.ans) return 'ok'; if (L.picked === o) return 'no'; return ''; };
    let ansUI = '';
    if (q.kind === 'mc') {
      const one = q.one || q.opts.some(o => o.length > 16);
      ansUI = `<div class="opts ${one ? 'one' : ''} ${q.big ? 'signs' : ''}">${q.opts.map((o, k) => `<button class="opt ${optCls(o)}" data-act="choose" data-k="${k}" ${answered ? 'disabled' : ''}>${q.frac ? fracView(o) : esc(o)}</button>`).join('')}</div>`;
    } else {
      const shown = L.input ? (q.kind === 'frac' ? fracView(L.input, true) : esc(L.input)) : '<span class="ph">?</span>';
      ansUI = `<div class="ansbox ${answered ? (L.state ? 'ok' : 'no') : ''}" aria-live="polite"><span class="v num">${shown}</span>${q.unit ? `<span class="u">${esc(q.unit)}</span>` : ''}</div>
        ${q.kind === 'frac' && !answered ? '<p class="tiny muted" style="text-align:center;font-weight:700">Nhập tử số, bấm "/", rồi nhập mẫu số</p>' : ''}
        ${!answered ? numpad(q) + `<button class="btn block jade" data-act="checkNum" ${L.input ? '' : 'disabled'}>Kiểm tra</button>` : ''}`;
    }
    body = `<div class="card stack qcard"><div class="row" style="align-items:flex-start;gap:8px"><div class="qtext" style="flex:1">${q.q}</div>${spk(q.q)}</div>${q.fig ? `<div class="figwrap">${q.fig}</div>` : ''}</div>${ansUI}`;
  }
  let foot = '';
  if (!it.scored) foot = `<div class="feedback"><div class="in"><button class="btn block" data-act="next">${L.idx === L.items.length - 1 ? 'Hoàn thành' : it.t === 'teach' ? 'Xem ví dụ' : 'Tiếp tục'}</button></div></div>`;
  else if (answered) {
    const ok = L.state, q = it.q;
    const right = ok ? '' : `Đáp án đúng: <b>${q.kind === 'frac' ? esc(q.ans) : esc(q.ans)}${q.unit ? ' ' + esc(q.unit) : ''}</b>${L.retried.has(L.idx) ? '' : ' · câu này sẽ quay lại cuối bài'}<br>`;
    foot = `<div class="feedback ${ok ? 'ok' : 'no'}" role="status"><div class="in"><div class="msg">${pi(ok ? 'cheer' : 'oops', 54)}<div><b>${ok ? pick(PRAISE) : pick(COMFORT)}</b><span class="tiny" style="font-weight:700">${right}💡 ${q.ex}</span></div></div><button class="btn block ${ok ? 'jade' : ''}" data-act="next">Tiếp tục</button></div></div>`;
  }
  return `<div class="player"><div class="ptop"><button class="x" data-act="quitLesson" aria-label="Thoát bài học">✕</button><div class="prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><span class="tiny muted num" style="font-weight:800">${L.idx + 1}/${L.items.length}</span></div>
  <div class="eyebrow">${esc(L.sub)} · ${esc(L.title)}</div><h1 class="qtitle">${esc(title)}</h1>${body}</div>${foot}
  ${UI.confirm === 'quit' ? `<div class="scrim"><div class="sheet"><span class="grip"></span><div class="say">${pi('oops', 56)}<div class="bubble">Con muốn dừng bài này à? Bài chưa xong sẽ không được tính sao.</div></div><button class="btn block jade" data-act="cancelQuit">Học tiếp</button><button class="btn block ghost" data-act="doQuit">Dừng lại</button></div></div>` : ''}`;
}
function fracView(s, typing) { const [a, b] = String(s).split('/'); if (b === undefined) return esc(a); return `<span class="fr"><i>${esc(a || ' ')}</i><i>${esc(b || (typing ? ' ' : ''))}</i></span>`; }
const PRAISE = ['Giỏi quá!', 'Chính xác!', 'Tuyệt vời!', 'Đúng rồi!', 'Siêu ghê!', 'Quá đỉnh!'];
const COMFORT = ['Chưa đúng rồi!', 'Gần đúng rồi!', 'Không sao, thử lại nhé!', 'Cố lên con!'];
function answer(ok) {
  const L = UI.L; L.state = ok; beep(ok);
  const firstTime = !L.retried.has(L.idx);
  if (ok) { const f = fam(), c = curChild(); prog(f, c.id).solved = (prog(f, c.id).solved || 0) + 1; }
  if (firstTime && ok) L.correct++;
  if (!ok && firstTime) { const copy = Object.assign({}, curItem(), { retry: true }); copy.q = Object.assign({}, copy.q, copy.q.opts ? { opts: shuffle(copy.q.opts) } : {}); L.items.push(copy); L.retried.add(L.items.length - 1); }
  render();
}
function nextItem() {
  const L = UI.L;
  if (L.idx >= L.items.length - 1) return finishLesson();
  L.idx++; L.state = null; L.picked = null; L.input = '';
  render(); window.scrollTo(0, 0); autoSpeak();
}
function finishLesson() {
  const L = UI.L, f = fam(), c = curChild(), p = prog(f, c.id);
  const pct = L.scored ? L.correct / L.scored : 1;
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
  const prev = p.lessons[L.key] || 0; const gain = Math.max(0, stars - prev);
  if (stars > prev) p.lessons[L.key] = stars;
  const label = L.kind === 'review' ? `${L.title} · Lớp ${L.g}` : `${L.title} · ${L.kind === 'a' ? 'Bài học' : 'Luyện tập'}`;
  const aw = gain ? award(f, c.id, gain, label) : null;
  p.log.push({ ts: Date.now(), key: L.key, stars });
  if (p.log.length > 400) p.log = p.log.slice(-400);
  bumpStreak(p);
  const secs = Math.min(1500, Math.round((Date.now() - L.start) / 1000)); const dk = dayKey(); p.secs[dk] = (p.secs[dk] || 0) + secs;
  saveFam(f);
  UI.result = { stars, prev, gain, aw, pct, title: L.title, sub: L.sub, g: L.g, i: L.i, kind: L.kind, key: L.key, ws: weekStars(f, c.id), cap: capOf(f) };
  go('result');
}
function vResult() {
  const r = UI.result; const star = k => `<span class="${k < r.stars ? '' : 'off'}">⭐</span>`;
  let earned;
  if (!r.gain) earned = r.prev >= 3 ? 'Con đã giữ kỷ lục 3 sao bài này rồi. Luyện lại giúp nhớ lâu hơn!' : `Kỷ lục cũ là ${r.prev} sao. Làm lại để được nhiều sao hơn nhé!`;
  else if (r.aw.over > 0) earned = r.aw.counted ? `+${r.aw.counted} sao vào hũ. ${r.aw.over} sao còn lại là sao luyện tập vì tuần này đã đủ ${r.cap} sao.` : `Hũ sao tuần này đã đầy ${r.cap} sao! Sao lần này được ghi là sao luyện tập.`;
  else earned = `+${r.aw.counted} sao vào hũ = ${vnd(r.aw.counted * STAR)}`;
  return `<div class="result">${pi('cheer', 140, 'bob')}
    <h1 class="h1">${r.stars === 3 ? 'Xuất sắc!' : r.stars === 2 ? 'Làm tốt lắm!' : 'Hoàn thành rồi!'}</h1>
    <p class="muted" style="font-weight:700">${esc(r.sub)} · ${esc(r.title)}</p>
    <div class="stars3">${star(0)}${star(1)}${star(2)}</div>
    <div class="statgrid"><div class="stat"><b>${Math.round(r.pct * 100)}%</b><span>đúng lần đầu</span></div><div class="stat"><b>+${r.gain ? r.aw.counted : 0}</b><span>sao vào hũ</span></div><div class="stat"><b>${r.ws}/${r.cap}</b><span>sao tuần này</span></div></div>
    <div class="say" style="text-align:left;width:100%">${bi(52)}<div class="bubble" style="font-weight:600">${earned}</div></div>
    <div class="stack" style="width:100%">
      ${r.kind === 'a' ? `<button class="btn block jade" data-act="startLesson" data-key="${r.key.replace(/a$/, 'b')}" data-kind="b" data-g="${r.g}" data-i="${r.i}">Luyện tập ngay ✏️</button>` : `<button class="btn block jade" data-act="backMap">Về bản đồ</button>`}
      <button class="btn block ghost" data-act="backMap" data-sheet="1">Xem nhiệm vụ của chủ đề</button>
      <button class="btn block ghost" data-act="startLesson" data-key="${r.key}" data-kind="${r.kind}" data-g="${r.g}" data-i="${r.i}">Làm lại</button>
    </div></div>`;
}

/* ---------- khu vực ba mẹ ---------- */
function vParent() {
  const f = fam(); if (!f) return vWelcome();
  let body = '';
  if (UI.ptab === 'home') body = vPHome(f);
  else if (UI.ptab === 'approve') body = vPApprove(f);
  else if (UI.ptab === 'wallet') body = vPWallet(f);
  else body = vPAccount(f);
  const pend = f.children.reduce((a, c) => a + Object.values(prog(f, c.id).missions).filter(m => m.status === 'pending').length, 0);
  const tabs = [['home', '📊', 'Tổng quan'], ['approve', '✅', 'Duyệt'], ['wallet', '💰', 'Thưởng'], ['account', '⚙️', 'Tài khoản']];
  return `<div class="pheader">${pi('happy', 48)}<div style="flex:1;min-width:0"><div class="eyebrow">Khu vực ba mẹ</div><h1 class="h2" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.parentName)}</h1></div><button class="btn sm gold" data-act="toKids">🎒 Cho con học</button></div>`
    + body + `<nav class="tabbar" aria-label="Điều hướng ba mẹ"><div class="in">${tabs.map(([k, i, t]) => `<button class="tab ${UI.ptab === k ? 'on' : ''}" data-act="ptab" data-t="${k}"><span class="i">${i}</span>${t}${k === 'approve' && pend ? ` <span class="pill red" style="padding:0 6px;font-size:11px">${pend}</span>` : ''}</button>`).join('')}</div></nav>`;
}
function lessonByKey(k) { const m = k.match(/^g(\d)t(\d+)(?:l(\d+))?/); if (!m) return null; const T = CUR[+m[1]][+m[2] - 1]; return { g: +m[1], T, l: m[3] ? T.lessons[+m[3] - 1] : null }; }
function insightFor(f, c) {
  const p = prog(f, c.id), wk = weekKey(); const lw = p.log.filter(l => weekKey(new Date(l.ts)) === wk);
  const lg = learnGrade(f, c); const st = nodeStates(f, c, lg); const cur = st.find(s => s.current);
  const pend = Object.values(p.missions).filter(m => m.status === 'pending').length;
  const ws = weekStars(f, c.id); const bits = [];
  if (!lw.length) bits.push(`${c.name} chưa học bài nào tuần này. Ngồi cùng con 10 phút đầu sẽ giúp con vào nhịp.`);
  else bits.push(`${c.name} đã làm ${lw.length} bài tuần này${streakNow(p) >= 2 ? `, đang giữ chuỗi ${streakNow(p)} ngày` : ''}.`);
  const weak = Object.entries(p.lessons).filter(([, v]) => v === 1).map(([k]) => k);
  if (weak.length) { const x = lessonByKey(weak[0]); if (x) bits.push(`"${x.l ? x.l.title : x.T.title}" (lớp ${x.g}) mới được 1 sao, nên cho con luyện lại.`); }
  if (pend) bits.push(`Có ${pend} nhiệm vụ đang chờ ba mẹ xác nhận.`);
  if (ws >= capOf(f)) bits.push(`Con đã đủ ${capOf(f)} sao tuần này.`);
  else if (cur && cur.type === 'lesson') bits.push(`Bài tiếp theo: Lớp ${lg} – ${cur.l.title}.`);
  return bits.join(' ');
}
function vPHome(f) {
  const fresh = UI.fresh ? `<section class="card stack" style="border-color:var(--jade)"><div class="say">${pi('cheer', 56)}<div class="bubble">Tài khoản đã sẵn sàng! Đưa máy cho con, bấm <b>Cho con vào học</b>, con chọn tên mình và nhập mã PIN.</div></div><button class="btn block jade" data-act="toKids">🎒 Cho con vào học</button><button class="btn block ghost" data-act="addChild">+ Thêm hồ sơ con khác</button></section>` : '';
  return fresh + vPHomeInner(f) + donateBlock();
}
function vPHomeInner(f) {
  if (!f.children.length) return `<div class="card stack"><p style="font-weight:700">Chưa có hồ sơ con nào.</p><button class="btn jade" data-act="addChild">Thêm hồ sơ con</button></div>`;
  const days = [...Array(7)].map((_, k) => addDays(new Date(), k - 6));
  const wd = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return f.children.map(c => {
    const p = prog(f, c.id), ws = weekStars(f, c.id), cp = capOf(f);
    const wk = weekKey(); const lw = p.log.filter(l => weekKey(new Date(l.ts)) === wk).length;
    const mins = days.map(d => Math.round((p.secs[dayKey(d)] || 0) / 60)); const mx = Math.max(10, ...mins);
    const minsWeek = Object.entries(p.secs).filter(([d]) => d >= wk).reduce((a, [, s]) => a + s, 0);
    const lg = learnGrade(f, c); const st = nodeStates(f, c, lg); const doneN = st.filter(s => s.done).length;
    return `<section class="card kid">
      <div class="row">${ava(c.avatar, 'sm')}<div style="flex:1;min-width:0"><b class="h3" style="display:block">${esc(c.name)}</b><span class="tiny muted" style="font-weight:800">Lớp ${c.grade} · đang học Lớp ${lg} · ${doneN}/${st.length} chặng</span></div><span class="statpill">🔥 ${streakNow(p)}</span></div>
      <div><div class="row between tiny" style="font-weight:800"><span>Sao tuần này</span><span class="num">${ws}/${cp} · ${vnd(ws * STAR)}</span></div><div class="meter" style="margin-top:4px"><i style="width:${Math.round(ws / cp * 100)}%"></i></div></div>
      <div class="kv"><div><b>${lw}</b><span>bài tuần này</span></div><div><b>${Math.round(minsWeek / 60)}</b><span>phút học</span></div><div><b>${p.solved || 0}</b><span>câu làm đúng</span></div></div>
      <div><div class="tiny muted" style="font-weight:800;margin-bottom:6px">Số phút học 7 ngày qua</div><div class="bars">${days.map((d, k) => `<div class="b ${k === 6 ? 'today' : ''}" title="${mins[k]} phút"><i style="height:${Math.round(mins[k] / mx * 70)}px"></i><span>${k === 6 ? 'Nay' : wd[d.getDay()]}</span></div>`).join('')}</div></div>
      <div class="say">${pi('think', 40)}<div class="bubble tiny" style="font-weight:600">${esc(insightFor(f, c))}</div></div>
    </section>`;
  }).join('') + `<p class="sync">${syncLabel()}</p>`;
}
function vPApprove(f) {
  const list = [];
  f.children.forEach(c => { const p = prog(f, c.id); Object.entries(p.missions).forEach(([k, m]) => { if (m.status === 'pending') { const x = lessonByKey(k); if (x) list.push({ c, k, m, T: x.T, g: x.g }); } }); });
  list.sort((a, b) => a.m.ts - b.m.ts);
  const opt = UI.bonus || { cid: f.children[0]?.id, n: 2, reason: '' };
  return `<div class="say">${tron(56)}<div class="bubble" style="font-weight:600">Con bấm "đã làm xong" thì nhiệm vụ hiện ở đây. Ba mẹ kiểm tra rồi xác nhận để con nhận <b>${MISSION_STARS} sao</b>.</div></div>
  <h2 class="h3">Chờ xác nhận (${list.length})</h2>
  ${list.length ? list.map(x => `<div class="mission"><div class="hd">${ava(x.c.avatar, 'sm')}<div class="tx"><b>${esc(x.c.name)} · ${esc(x.T.title)}</b><span class="tiny muted">Lớp ${x.g} · gửi lúc ${new Date(x.m.ts).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })}</span></div></div><p>${esc(x.T.mission)}</p>
    <div class="row wrap"><button class="btn sm jade" data-act="approve" data-cid="${x.c.id}" data-key="${x.k}">Xác nhận +${MISSION_STARS} ⭐</button><button class="btn sm ghost" data-act="reject" data-cid="${x.c.id}" data-key="${x.k}">Chưa đạt, làm lại</button></div></div>`).join('') : '<div class="card muted" style="font-weight:700">Không có nhiệm vụ nào đang chờ.</div>'}
  <h2 class="h3">Thưởng thêm sao</h2>
  <form class="card stack" data-form="bonus">
    <div class="field"><label>Cho con</label><div class="chips">${f.children.map(c => `<button type="button" class="chip ${opt.cid === c.id ? 'on' : ''}" data-act="bonusSet" data-k="cid" data-val="${c.id}">${c.avatar} ${esc(c.name)}</button>`).join('')}</div></div>
    <div class="field"><label>Số sao</label><div class="chips">${[1, 2, 3, 5].map(n => `<button type="button" class="chip ${opt.n == n ? 'on' : ''}" style="--c:var(--gold)" data-act="bonusSet" data-k="n" data-val="${n}">${n} ⭐</button>`).join('')}</div></div>
    <div class="field"><label for="b-reason">Lý do</label><input class="input" id="b-reason" name="reason" placeholder="VD: Tự làm hết bài tập về nhà" value="${esc(opt.reason)}"></div>
    <p class="tiny muted" style="font-weight:700">Sao thưởng thêm vẫn tính vào mức tối đa ${capOf(f)} sao/tuần.</p>
    <button class="btn gold block" type="submit">Tặng sao</button>
  </form>`;
}
function vPWallet(f) {
  const weeks = [...Array(6)].map((_, k) => weekKey(addDays(new Date(), -7 * k)));
  return `<div class="say">${bi(56)}<div class="bubble" style="font-weight:600">Gợi ý: mỗi sao = <b>1.000đ</b> do ba mẹ tự thưởng. Hệ thống tự dừng tính thưởng khi con đạt <b>${capOf(f)} sao/tuần</b>. Trao tiền xong, ba mẹ bấm "Đã trao" để ghi sổ.</div></div>`
  + f.children.map(c => {
    const up = unpaid(f, c.id);
    const conf = UI.confirm === 'pay:' + c.id;
    return `<section class="card stack"><div class="row">${ava(c.avatar, 'sm')}<b class="h3" style="flex:1">${esc(c.name)}</b></div>
      <div class="row between"><div><div class="eyebrow">Chưa trao</div><div class="money">${vnd(up * STAR)}</div><span class="tiny muted" style="font-weight:700">${up} sao</span></div>
      ${up ? (conf ? '' : `<button class="btn sm jade" data-act="payAsk" data-cid="${c.id}">Đã trao thưởng</button>`) : '<span class="pill jade">Đã trao đủ</span>'}</div>
      ${conf ? `<div class="demo stack" style="gap:8px">Xác nhận ba mẹ đã trao <b>${vnd(up * STAR)}</b> cho ${esc(c.name)}?<div class="row"><button class="btn sm jade" data-act="pay" data-cid="${c.id}">Xác nhận</button><button class="btn sm ghost" data-act="cancelConfirm">Hủy</button></div></div>` : ''}
      <div style="overflow-x:auto"><table class="table"><thead><tr><th>Tuần</th><th class="r">Sao</th><th class="r">Tiền thưởng</th></tr></thead><tbody>
      ${weeks.map(w => { const s = weekStars(f, c.id, w); const d = new Date(w + 'T00:00'); return `<tr><td>${w === weekKey() ? 'Tuần này' : 'Từ ' + d.getDate() + '/' + (d.getMonth() + 1)}</td><td class="r">${s}/${capOf(f)}</td><td class="r">${vnd(s * STAR)}</td></tr>`; }).join('')}
      </tbody></table></div></section>`;
  }).join('')
  + `<h2 class="h3">Lịch sử trao thưởng</h2><section class="card ledger">${(f.payouts || []).length ? f.payouts.slice().reverse().slice(0, 12).map(x => { const c = childOf(f, x.cid); return `<div class="li"><span>🎁</span><span class="tx">${esc(c?.name || 'Con')}<small>${new Date(x.ts).toLocaleDateString('vi-VN')} · ${x.stars} sao</small></span><span class="n" style="color:var(--jade)">${vnd(x.amount)}</span></div>`; }).join('') : '<p class="muted">Chưa có lần trao thưởng nào.</p>'}</section>`;
}
function vPAccount(f) {
  return `<h2 class="h3">Hồ sơ của con</h2>
  <section class="card ledger">${f.children.map(c => `<div class="li">${ava(c.avatar, 'sm')}<span class="tx">${esc(c.name)}<small>Lớp ${c.grade} · PIN ••••</small></span><button class="btn sm ghost" data-act="editChild" data-cid="${c.id}">Sửa</button></div>`).join('')}</section>
  <button class="btn block jade" data-act="addChild">+ Thêm hồ sơ con</button>
  <h2 class="h3">Cài đặt thưởng & học</h2>
  <section class="card stack">
    <div class="field"><label for="cap">Mức sao tối đa mỗi tuần: <b class="num">${capOf(f)} sao = ${vnd(capOf(f) * STAR)}</b></label><input class="range" id="cap" type="range" min="10" max="${MAX_CAP}" step="5" value="${capOf(f)}" data-act-input="cap"><span class="tiny muted" style="font-weight:700">Tối đa ${MAX_CAP} sao/tuần. Sao vượt mức được ghi là sao luyện tập, không tính tiền.</span></div>
    <div class="divider"></div>
    <div class="row between"><div style="min-width:0"><b>Mở khóa toàn bộ bài học</b><p class="tiny muted" style="font-weight:700">Con có thể mở bất kỳ bài nào, không cần học xong bài trước. Con luôn được chọn lớp 1–5.</p></div><button class="switch ${f.unlockAll ? 'on' : ''}" data-act="toggleUnlock" role="switch" aria-checked="${!!f.unlockAll}" aria-label="Mở khóa toàn bộ"></button></div>
  </section>
  <h2 class="h3">Tài khoản ba mẹ</h2>
  <form class="card stack" data-form="parentInfo">
    <div class="field"><label for="a-name">Tên hiển thị</label><input class="input" id="a-name" name="name" value="${esc(f.parentName)}"></div>
    <div class="field"><label>Đăng nhập bằng</label><input class="input" value="${esc(f.login)}" disabled></div>
    <div class="field"><label for="a-ppin">Mã PIN ba mẹ (4 số)</label><input class="input" id="a-ppin" name="ppin" inputmode="numeric" maxlength="4" placeholder="Để trống nếu giữ nguyên"></div>
    <div class="field"><label for="a-pass">Mật khẩu mới</label><input class="input" id="a-pass" name="pass" type="password" autocomplete="new-password" placeholder="Để trống nếu giữ nguyên"></div>
    ${UI.err ? `<p class="err">${esc(UI.err)}</p>` : ''}
    <button class="btn block" type="submit">Lưu thay đổi</button>
  </form>
  <details class="card"><summary style="font-weight:800;cursor:pointer">Cách tính sao & thưởng</summary><div class="stack tiny" style="margin-top:10px;font-weight:600">
    <p>• Mỗi bài có 2 bước: <b>Bài học</b> và <b>Luyện tập</b>, mỗi bước được 1–3 sao theo tỉ lệ trả lời đúng lần đầu (từ 90%: 3 sao, từ 70%: 2 sao). Làm lại chỉ được thêm phần sao vượt kỷ lục cũ.</p>
    <p>• Bài ôn tập cuối chủ đề, ôn tập học kì: tối đa 3 sao. Nhiệm vụ thực tế: +${MISSION_STARS} sao khi ba mẹ xác nhận.</p>
    <p>• 1 sao = 1.000đ là mức gợi ý để ba mẹ tự thưởng cho con; ứng dụng không giữ hay chuyển tiền. Tuần tính từ thứ Hai đến Chủ nhật, tối đa ${capOf(f)} sao/tuần (không quá ${MAX_CAP} sao).</p>
    <p>• Mỗi lớp đi theo thứ tự các mạch kiến thức của chương trình.</p></div></details>
  <details class="card"><summary style="font-weight:800;cursor:pointer">📜 Lưu ý & miễn trừ trách nhiệm</summary><div class="stack tiny" style="margin-top:10px;font-weight:600">${DISCLAIMER}</div></details>
  <h2 class="h3">Sao lưu dữ liệu</h2>
  <section class="card stack"><p class="tiny muted" style="font-weight:700">Dữ liệu chỉ nằm trong trình duyệt của máy này. Tải file sao lưu để chuyển sang máy khác hoặc phòng khi xóa lịch sử trình duyệt.</p>
    ${restoreBlock(true)}
  </section>
  <button class="btn block ghost" data-act="logout">Đăng xuất</button>
  <p class="sync">${syncLabel()}</p>`;
}
function childSheet(cid) {
  return () => {
    const f = fam(); const c = cid ? childOf(f, cid) : { name: '', grade: 1, avatar: '🐰', pin: '' };
    const del = UI.confirm === 'del:' + cid;
    return `<span class="grip"></span>${childForm(cid ? 'editChild' : 'addChild', c, cid ? 'Sửa hồ sơ của con' : 'Thêm hồ sơ con', cid ? 'Lưu' : 'Thêm con')}
    ${cid ? (del ? `<div class="demo stack" style="gap:8px">Xóa hồ sơ <b>${esc(c.name)}</b> và toàn bộ tiến độ, sao của con? Không thể hoàn tác.<div class="row"><button class="btn sm" data-act="delChild" data-cid="${cid}">Xóa hồ sơ</button><button class="btn sm ghost" data-act="cancelConfirm">Hủy</button></div></div>` : `<button class="btn block ghost" style="color:var(--wrong)" data-act="delAsk" data-cid="${cid}">Xóa hồ sơ này</button>`) : ''}`;
  };
}

/* ---------- actions ---------- */
function validPin(s) { return /^\d{4}$/.test(s); }
const normLogin = s => String(s || '').trim().toLowerCase().replace(/\s+/g, '');
function findFamily(login) { const l = normLogin(login); return Object.values(STORE.families).find(f => f.login === l); }
const ACT = {
  go: d => go(d.v),
  toChild: () => { if (DEV.familyId && STORE.families[DEV.familyId]) go('profiles'); else go('family'); },
  startReg: () => { UI.reg = { step: 1 }; UI.edit = null; go('register'); },
  regBack: () => { UI.reg.step = 1; UI.edit = null; go('register'); },
  demo: async () => { await seedDemo(); DEV.familyId = 'demo'; saveDev(); go('profiles'); },
  forgetFamily: () => { DEV.familyId = null; DEV.session = null; saveDev(); go('welcome'); },
  pinFor: d => go('pin', { pinFor: d.cid }),
  pinKey: d => {
    if (d.k === 'del') { UI.pin = UI.pin.slice(0, -1); UI.pinBad = false; return render(); }
    if (UI.pin.length >= 4) return; UI.pin += d.k; UI.pinBad = false; render();
    if (UI.pin.length === 4) setTimeout(checkPin, 120);
  },
  closeSheet: (d, t, e) => { if (e.target.closest('[data-stop]')) return; UI.sheet = null; UI.confirm = null; UI.edit = null; UI.err = ''; render(); },
  tab: d => { UI.tab = d.t; render(); window.scrollTo(0, 0); },
  ptab: d => { UI.ptab = d.t; UI.fresh = false; UI.err = ''; UI.confirm = null; render(); window.scrollTo(0, 0); },
  grade: d => { UI.grade = +d.g; const f = fam(), c = curChild(); prog(f, c.id).lastGrade = +d.g; saveFam(f); render(); },
  toGradePick: () => go('gradePick'),
  pickGrade: d => { const f = fam(), c = curChild(); prog(f, c.id).lastGrade = +d.g; saveFam(f); go('child', { tab: 'learn', grade: +d.g }); setTimeout(scrollToCurrent, 60); },
  openNode: d => {
    const f = fam(), c = curChild(); const s = nodeStates(f, c, +d.g)[+d.i];
    if (!s.open) return toast('Học xong chặng trước để mở chặng này nhé!');
    UI.sheet = nodeSheet(+d.g, +d.i); render();
  },
  startLesson: d => { UI.sheet = null; startLesson(d.key, d.kind, +d.g, +d.i); },
  say: d => say(d.t),
  choose: d => { const L = UI.L, it = curItem(); if (L.state !== null) return; const o = it.q.opts[+d.k]; L.picked = o; answer(checkAnswer(it.q, o)); },
  key: d => {
    const L = UI.L, q = curItem().q; if (L.state !== null) return;
    if (d.k === 'del') L.input = L.input.slice(0, -1);
    else if (d.k === '/' ) { if (L.input && !L.input.includes('/')) L.input += '/'; }
    else if (d.k === ',') { if (L.input && !L.input.includes(',')) L.input += ','; }
    else if (L.input.replace(/\D/g, '').length < 12) L.input = (L.input === '0' ? '' : L.input) + d.k;
    render();
  },
  checkNum: () => { const L = UI.L, q = curItem().q; if (L.state !== null || !L.input) return; answer(checkAnswer(q, L.input)); },
  next: () => nextItem(),
  quitLesson: () => { UI.confirm = 'quit'; render(); },
  cancelQuit: () => { UI.confirm = null; render(); },
  doQuit: () => { try { speechSynthesis.cancel(); } catch (e) {} UI.L = null; go('child'); },
  backMap: d => { const r = UI.result; go('child', { tab: 'learn' }); if (d.sheet && r) { UI.sheet = nodeSheet(r.g, r.i); render(); } else setTimeout(scrollToCurrent, 60); },
  missionDone: d => {
    const f = fam(), c = curChild(), p = prog(f, c.id); if (p.missions[d.key]) return;
    p.missions[d.key] = { status: 'pending', ts: Date.now() }; saveFam(f); toast(`Đã gửi cho ba mẹ! Chờ xác nhận để nhận ${MISSION_STARS} sao nhé.`);
  },
  switchUser: () => { DEV.session = null; saveDev(); go('profiles'); },
  toParentPin: () => go('pin', { pinFor: '__parent' }),
  approve: d => {
    const f = fam(), p = prog(f, d.cid), m = p.missions[d.key]; if (!m || m.status !== 'pending') return;
    const x = lessonByKey(d.key); const r = award(f, d.cid, MISSION_STARS, `Nhiệm vụ: ${x ? x.T.title : ''} · Lớp ${x ? x.g : ''}`);
    m.status = 'approved'; m.approvedAt = Date.now(); saveFam(f);
    toast(r.counted ? `Đã xác nhận · +${r.counted} sao cho ${childOf(f, d.cid).name}` : `Đã xác nhận · tuần này con đã đủ ${capOf(f)} sao`);
  },
  reject: d => { const f = fam(), p = prog(f, d.cid); delete p.missions[d.key]; saveFam(f); toast('Đã trả lại nhiệm vụ để con làm lại.'); },
  bonusSet: d => { const f = fam(); const r = $('#b-reason')?.value || ''; UI.bonus = Object.assign({ cid: f.children[0]?.id, n: 2, reason: '' }, UI.bonus, { reason: r, [d.k]: d.k === 'n' ? +d.val : d.val }); render(); },
  payAsk: d => { UI.confirm = 'pay:' + d.cid; render(); },
  cancelConfirm: () => { UI.confirm = null; render(); },
  pay: d => {
    const f = fam(), p = prog(f, d.cid); let s = 0; p.ledger.forEach(e => { if (!e.paid) { s += e.counted; e.paid = true; } });
    (f.payouts ||= []).push({ id: uid(), ts: Date.now(), cid: d.cid, stars: s, amount: s * STAR }); UI.confirm = null; saveFam(f); toast(`Đã ghi sổ trao ${vnd(s * STAR)}`);
  },
  toggleUnlock: () => { const f = fam(); f.unlockAll = !f.unlockAll; saveFam(f); render(); },
  addChild: () => { UI.edit = null; UI.editCid = null; UI.err = ''; UI.sheet = childSheet(null); render(); },
  editChild: d => { UI.edit = null; UI.editCid = d.cid; UI.err = ''; UI.confirm = null; UI.sheet = childSheet(d.cid); render(); },
  delAsk: d => { UI.confirm = 'del:' + d.cid; render(); },
  delChild: d => { const f = fam(); f.children = f.children.filter(c => c.id !== d.cid); delete f.progress[d.cid]; UI.sheet = null; UI.confirm = null; saveFam(f); toast('Đã xóa hồ sơ.'); },
  editSet: (d, t) => {
    const form = t.closest('form');
    UI.edit = Object.assign({}, UI.edit, { name: form?.querySelector('[name=name]')?.value, pin: form?.querySelector('[name=pin]')?.value, [d.k]: d.k === 'grade' ? +d.val : d.val });
    render();
  },
  logout: () => { DEV.session = null; saveDev(); go('welcome'); },
  toKids: () => { DEV.session = null; saveDev(); UI.fresh = false; go('profiles'); },
  donAmt: d => { UI.donAmt = +d.v; render(); },
  dlQR: d => {
    const amt = +d.v, url = donateImage(amt), a = document.createElement('a');
    a.href = url; a.download = `ma-qr-ung-ho-toan-vui${amt ? '-' + amt : '-tuy-tam'}.${url.startsWith('data:image/png') ? 'png' : 'jpg'}`;
    document.body.appendChild(a); a.click(); a.remove(); toast('Đã tải mã QR. Mở ứng dụng ngân hàng → quét QR → chọn ảnh từ thư viện nhé!');
  },
  copyAcct: () => {
    const done = () => toast(`Đã chép số tài khoản ${DONATE.acct}`);
    try { navigator.clipboard.writeText(DONATE.acct).then(done, () => { selectAcct(); toast('Số tài khoản đã được chọn, ba mẹ bấm Sao chép nhé.'); }); }
    catch (e) { selectAcct(); toast('Số tài khoản đã được chọn, ba mẹ bấm Sao chép nhé.'); }
  },
  share: () => {
    const url = location.href.split('#')[0].split('?')[0];
    const text = `${APP_NAME}: app học Toán tiểu học lớp 1–5 miễn phí, bám sát chương trình GDPT 2018. Ba mẹ đồng hành cùng con 15 phút mỗi ngày nha!`;
    const copy = () => { try { navigator.clipboard.writeText(text + ' ' + url).then(() => toast('Đã chép lời giới thiệu và link. Ba mẹ dán vào tin nhắn để gửi bạn bè nhé!'), () => toast('Link: ' + url)); } catch (e) { toast('Link: ' + url); } };
    if (navigator.share) navigator.share({ title: APP_NAME, text, url }).catch(err => { if (err && err.name !== 'AbortError') copy(); });
    else copy();
  },
  exportData: () => {
    const f = fam(); const data = JSON.stringify({ app: APP_ID, v: 1, exportedAt: new Date().toISOString(), families: { [f.id]: f } }, null, 1);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = `toan-vui-sao-luu-${dayKey()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Đã tải file sao lưu.');
  },
  doImport: () => {
    const d = UI.importData; if (!d) return;
    for (const [fid, rf] of Object.entries(d.families)) { rf.updatedAt = Date.now(); STORE.families[fid] = rf; }
    const ids = Object.keys(d.families); persist(); UI.importData = null; UI.confirm = null;
    if (UI.view !== 'parent') { DEV.familyId = ids[0]; saveDev(); go('parentLogin'); toast('Đã khôi phục! Ba mẹ đăng nhập bằng mật khẩu cũ, hoặc cho con vào học.'); }
    else toast('Đã khôi phục dữ liệu.');
  }
};
function scrollToCurrent() { const el = document.querySelector('.node.current'); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
function selectAcct() { const el = document.getElementById('donate-acct'); if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
function checkPin() {
  const f = STORE.families[DEV.familyId]; if (!f) return go('welcome');
  if (UI.pinFor === '__parent') {
    if (UI.pin === f.parentPin) { DEV.session = { type: 'parent', fid: f.id }; saveDev(); LAST_ACT = Date.now(); return go('parent', { ptab: 'home' }); }
  } else { const c = childOf(f, UI.pinFor); if (c && UI.pin === c.pin) { DEV.session = { type: 'child', fid: f.id, cid: c.id }; saveDev(); return go('gradePick'); } }
  UI.pin = ''; UI.pinBad = true; beep(false); render();
}
const FORMS = {
  parentLogin: async fd => {
    const f = findFamily(fd.get('login'));
    if (!f) { UI.err = 'Máy này chưa có tài khoản đó. Nếu đã tạo trên máy khác, hãy khôi phục từ file sao lưu bên dưới.'; return render(); }
    if (f.passHash !== await hashPw(fd.get('pass'))) { UI.err = 'Mật khẩu chưa đúng. Bấm "Quên mật khẩu?" nếu cần đặt lại.'; return render(); }
    DEV.familyId = f.id; DEV.session = { type: 'parent', fid: f.id }; saveDev(); LAST_ACT = Date.now(); go('parent', { ptab: 'home' });
  },
  family: fd => { const f = findFamily(fd.get('login')); if (!f) { UI.err = 'Không tìm thấy tài khoản này trên máy. Ba mẹ hãy đăng nhập hoặc tạo tài khoản trước.'; return render(); } DEV.familyId = f.id; saveDev(); go('profiles'); },
  reg1: async fd => {
    const name = fd.get('name').trim(), login = normLogin(fd.get('login')), pass = fd.get('pass'), ppin = fd.get('ppin').trim();
    UI.reg.name = name; UI.reg.login = fd.get('login');
    if (!name) UI.err = 'Nhập tên hiển thị cho tài khoản.';
    else if (!/^(\+?\d{9,12}|[^@\s]+@[^@\s]+\.[^@\s]+)$/.test(login)) UI.err = 'Nhập số điện thoại (9–12 số) hoặc email hợp lệ.';
    else if (findFamily(login)) UI.err = 'Số điện thoại/email này đã có tài khoản. Hãy đăng nhập.';
    else if (pass.length < 6) UI.err = 'Mật khẩu cần ít nhất 6 ký tự.';
    else if (!validPin(ppin)) UI.err = 'Mã PIN ba mẹ gồm đúng 4 chữ số.';
    else { UI.reg = Object.assign(UI.reg, { step: 2, login, passHash: await hashPw(pass), ppin }); UI.edit = null; UI.err = ''; return go('register'); }
    render();
  },
  reg2: (fd, form) => {
    const r = UI.reg; const c = readChild(fd, form); if (!c) return render();
    const f = { id: 'f' + uid(), parentName: r.name, login: r.login, passHash: r.passHash, parentPin: r.ppin, weeklyCap: MAX_CAP, unlockAll: false, createdAt: Date.now(), children: [{ id: uid(), ...c }], progress: {}, payouts: [] };
    STORE.families[f.id] = f; saveFam(f);
    DEV.familyId = f.id; DEV.session = { type: 'parent', fid: f.id }; saveDev(); UI.edit = null; LAST_ACT = Date.now();
    go('parent', { ptab: 'home', fresh: true }); toast(`Đã tạo tài khoản! Con đăng nhập bằng mã PIN ${c.pin}.`);
  },
  addChild: (fd, form) => { const f = fam(); const c = readChild(fd, form); if (!c) return render(); f.children.push({ id: uid(), ...c }); UI.sheet = null; UI.edit = null; saveFam(f); toast(`Đã thêm ${c.name}.`); },
  editChild: (fd, form) => {
    const f = fam(); const c = childOf(f, UI.editCid); const v = readChild(fd, form); if (!c || !v) return render();
    Object.assign(c, v); UI.sheet = null; UI.edit = null; saveFam(f); toast('Đã lưu hồ sơ.');
  },
  bonus: fd => {
    const f = fam(), o = Object.assign({ cid: f.children[0]?.id, n: 2 }, UI.bonus); const reason = (fd.get('reason') || '').trim() || 'Ba mẹ thưởng';
    if (!o.cid) return; const r = award(f, o.cid, o.n, '🎁 ' + reason); UI.bonus = { cid: o.cid, n: 2, reason: '' }; saveFam(f);
    toast(r.counted ? `Đã tặng ${r.counted} sao cho ${childOf(f, o.cid).name}` : `Tuần này ${childOf(f, o.cid).name} đã đủ ${capOf(f)} sao.`);
  },
  forgot: async fd => {
    if (UI.forgotLock && Date.now() < UI.forgotLock) return;
    const f = findFamily(fd.get('login')), ppin = (fd.get('ppin') || '').trim(), pass = fd.get('pass') || '';
    if (!f || f.demo) { UI.err = 'Máy này chưa có tài khoản đó.'; return render(); }
    if (ppin !== f.parentPin) { UI.forgotTries = (UI.forgotTries || 0) + 1; if (UI.forgotTries >= 5) { UI.forgotLock = Date.now() + 60000; UI.forgotTries = 0; setTimeout(render, 60500); } UI.err = 'Mã PIN ba mẹ chưa đúng.'; return render(); }
    if (pass.length < 6) { UI.err = 'Mật khẩu mới cần ít nhất 6 ký tự.'; return render(); }
    f.passHash = await hashPw(pass); saveFam(f); UI.forgotTries = 0; go('parentLogin'); toast('Đã đặt mật khẩu mới. Mời ba mẹ đăng nhập.');
  },
  parentInfo: async fd => {
    const f = fam(); const name = fd.get('name').trim(), ppin = fd.get('ppin').trim(), pass = fd.get('pass');
    if (!name) { UI.err = 'Tên hiển thị không được để trống.'; return render(); }
    if (ppin && !validPin(ppin)) { UI.err = 'Mã PIN ba mẹ gồm đúng 4 chữ số.'; return render(); }
    if (pass && pass.length < 6) { UI.err = 'Mật khẩu cần ít nhất 6 ký tự.'; return render(); }
    f.parentName = name; if (ppin) f.parentPin = ppin; if (pass) f.passHash = await hashPw(pass); UI.err = ''; saveFam(f); toast('Đã lưu thay đổi.');
  }
};
function readChild(fd, form) {
  const name = (fd.get('name') || '').trim(), pin = (fd.get('pin') || '').trim();
  const editing = form?.dataset.form === 'editChild';
  const orig = editing ? childOf(fam(), UI.editCid) : null;
  const grade = UI.edit?.grade || orig?.grade || 1, avatar = UI.edit?.avatar || orig?.avatar || '🐰';
  if (!name) { UI.err = 'Nhập tên của con.'; return null; }
  if (!validPin(pin)) { UI.err = 'Mã PIN của con gồm đúng 4 chữ số.'; return null; }
  UI.err = ''; return { name, pin, grade, avatar };
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  if (t.tagName === 'INPUT') return;
  const a = ACT[t.dataset.act]; if (!a) return;
  if (t.type === 'submit' && t.form) return;
  if (t.dataset.act === 'closeSheet' && e.target.closest('[data-stop]')) return;
  e.preventDefault(); a(t.dataset, t, e);
});
document.addEventListener('submit', e => {
  const form = e.target.closest('form[data-form]'); if (!form) return; e.preventDefault();
  const h = FORMS[form.dataset.form]; if (h) h(new FormData(form), form);
});
document.addEventListener('input', e => {
  if (e.target.dataset.actInput === 'cap') { const f = fam(); f.weeklyCap = Math.min(MAX_CAP, +e.target.value); const lbl = e.target.previousElementSibling.querySelector('b'); if (lbl) lbl.textContent = `${f.weeklyCap} sao = ${vnd(f.weeklyCap * STAR)}`; }
});
document.addEventListener('change', e => {
  if (e.target.id === 'importFile' && e.target.files[0]) {
    e.target.files[0].text().then(t => { try { const d = JSON.parse(t); if (d.app !== APP_ID || !d.families) throw 0; UI.importData = { families: d.families, names: Object.values(d.families).map(x => x.parentName).join(', ') }; UI.confirm = 'import'; render(); } catch (er) { toast('File không đúng định dạng sao lưu của ứng dụng.'); } });
    return;
  }
  if (e.target.dataset.actInput === 'cap') { const f = fam(); saveFam(f); render(); }
});
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (UI.view === 'pin' && /^[0-9]$/.test(e.key)) ACT.pinKey({ k: e.key });
  else if (UI.view === 'pin' && e.key === 'Backspace') ACT.pinKey({ k: 'del' });
  else if (UI.view === 'lesson' && !UI.confirm) {
    const L = UI.L, it = curItem();
    if (it.scored && L.state === null && it.q.kind !== 'mc') {
      if (/^[0-9]$/.test(e.key)) ACT.key({ k: e.key });
      else if (e.key === ',' || e.key === '.') ACT.key({ k: it.q.kind === 'frac' ? '/' : ',' });
      else if (e.key === '/') ACT.key({ k: '/' });
      else if (e.key === 'Backspace') ACT.key({ k: 'del' });
      else if (e.key === 'Enter') ACT.checkNum();
      return;
    }
    if (it.scored && L.state === null && it.q.kind === 'mc' && /^[1-4]$/.test(e.key) && it.q.opts[+e.key - 1]) return ACT.choose({ k: +e.key - 1 });
    if (e.key === 'Enter' && (L.state !== null || !it.scored)) { e.preventDefault(); nextItem(); }
  }
});

/* ---------- khu vực ba mẹ tự khóa sau 10 phút không thao tác ---------- */
let LAST_ACT = Date.now();
['pointerdown', 'keydown', 'input'].forEach(ev => document.addEventListener(ev, () => { LAST_ACT = Date.now(); }, true));
function lockParent() { DEV.session = null; saveDev(); go('profiles'); }
setInterval(() => { if (DEV.session?.type === 'parent' && Date.now() - LAST_ACT > 10 * 60 * 1000) { lockParent(); toast('Khu vực ba mẹ đã tự khóa sau 10 phút không dùng.'); } }, 20000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && DEV.session?.type === 'parent' && Date.now() - LAST_ACT > 10 * 60 * 1000) lockParent(); });

/* ---------- nút Back của Android ---------- */
let GUARD = false;
function isRoot() { return !UI.sheet && !UI.confirm && (UI.view === 'welcome' || (UI.view === 'child' && UI.tab === 'learn') || (UI.view === 'parent' && UI.ptab === 'home')); }
function handleBack() {
  if (UI.view === 'lesson') { UI.confirm = 'quit'; render(); return; }
  if (UI.sheet || UI.confirm) { UI.sheet = null; UI.confirm = null; UI.edit = null; UI.err = ''; render(); return; }
  const v = UI.view;
  if (v === 'child') { UI.tab = 'learn'; render(); return; }
  if (v === 'parent') { UI.ptab = 'home'; render(); return; }
  if (v === 'result') return go('child', { tab: 'learn' });
  if (v === 'pin') return go('profiles');
  if (v === 'gradePick') { DEV.session = null; saveDev(); return go('profiles'); }
  if (v === 'forgot') return go('parentLogin');
  if (v === 'register' && UI.reg.step === 2) { UI.reg.step = 1; return go('register'); }
  go('welcome');
}
window.addEventListener('popstate', () => { GUARD = false; if (!isRoot()) handleBack(); syncGuard(); });
function syncGuard() { try { if (!isRoot() && !GUARD) { history.pushState({ tv: 1 }, ''); GUARD = true; } } catch (e) {} }

/* ---------- khởi động ---------- */
(async function boot() {
  loadLocal();
  await seedDemo();
  const s = DEV.session; const f = s && STORE.families[s.fid];
  if (f && s.type === 'child' && childOf(f, s.cid)) { UI.view = 'child'; UI.grade = learnGrade(f, childOf(f, s.cid)); }
  else { DEV.session = null; saveDev(); UI.view = (DEV.familyId && STORE.families[DEV.familyId]) ? 'profiles' : 'welcome'; }
  render();
})();

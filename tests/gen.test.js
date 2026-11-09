// Chạy: node tests/gen.test.js — sinh thử mọi dạng bài trong chương trình và kiểm tra đáp án.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = {}; vm.createContext(ctx);
for (const f of ['curriculum.js', 'gen.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', f), 'utf8').replace(/^const (CURRICULUM_TEXT|GEN) /m, 'var $1 '), ctx);
vm.runInContext('this.makeQ = makeQ; this.checkAnswer = checkAnswer; this.TXT = CURRICULUM_TEXT;', ctx);
const specs = new Set(); let lessons = 0;
ctx.TXT.trim().split('\n').forEach(l => { l = l.trim(); if (!l || l[0] === '#' || l[0] === '@') return; const p = l.split('|'); if (p.length !== 4) throw new Error('Sai định dạng: ' + l); lessons++; p[2].split(';').forEach(s => specs.add(s.trim())); });
let errs = 0;
for (const s of specs) {
  for (let i = 0; i < 400; i++) {
    let q; try { q = ctx.makeQ(s); } catch (e) { console.log('LỖI', s, e.message); errs++; break; }
    const blob = [q.q, q.fig, q.ex, q.ans, ...(q.opts || [])].join(' ');
    const bad = [];
    if (/NaN|undefined|Infinity|null/.test(blob)) bad.push('có NaN/undefined');
    if (q.ans === '' || q.ans === undefined) bad.push('không có đáp án');
    if (q.kind === 'mc') { if (!q.opts.includes(q.ans)) bad.push('đáp án không nằm trong lựa chọn'); if (new Set(q.opts).size !== q.opts.length) bad.push('lựa chọn trùng'); if (q.opts.length < 2) bad.push('ít lựa chọn'); }
    else if (!ctx.checkAnswer(q, q.ans)) bad.push('tự chấm sai');
    if (q.kind === 'num' && /^-|−/.test(q.ans)) bad.push('đáp án âm');
    if (bad.length) { console.log('✗', s, bad.join(', '), '\n  ', q.q.replace(/<[^>]+>/g, ''), '→', q.ans, q.opts || ''); errs++; break; }
  }
}
// chấm đáp án: các trường hợp đặc biệt
const T = (q, x, want) => { if (ctx.checkAnswer(q, x) !== want) { console.log('✗ checkAnswer', JSON.stringify(q), x); errs++; } };
T({ kind: 'num', ans: '12345' }, '12 345', true); T({ kind: 'num', ans: '12345' }, '12.345', true); T({ kind: 'num', ans: '2,5' }, '2.5', true); T({ kind: 'num', ans: '2,5' }, '2,50', true);
T({ kind: 'num', ans: '25' }, '2,5', false); T({ kind: 'frac', ans: '1/2' }, '2/4', true); T({ kind: 'frac', ans: '1/2', exact: true }, '2/4', false); T({ kind: 'frac', ans: '2/1' }, '2', true);
console.log(`${lessons} bài học, ${specs.size} dạng bài, ${errs ? errs + ' lỗi' : 'không có lỗi'}`);
process.exit(errs ? 1 : 0);

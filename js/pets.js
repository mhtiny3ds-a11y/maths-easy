'use strict';
/* =========================================================
   Thú cưng của con: con chọn nuôi 1 bạn. Mỗi lần con làm xong một bài,
   thú cưng được ăn một bữa, nhận điểm lớn (XP), lên cấp và đổi hình dáng.
   Hình vẽ do ứng dụng tự vẽ.
   ========================================================= */
const PET_SPECIES = {
  rong: { name: 'Rồng Mây', c: '#3CC7A6', c2: '#239E82', belly: '#D9F7EE', food: ['🍪', '🍇', '🍉'], blurb: 'Bạn rồng nhỏ mê mây trắng, lớn lên sẽ có đôi cánh bay khắp trời.' },
  tho: { name: 'Thỏ Bông', c: '#FFF4F6', c2: '#F28AA0', belly: '#FFFFFF', food: ['🥕', '🍓', '🎂'], blurb: 'Bạn thỏ trắng mềm như bông, lớn lên thành thỏ tiên có đũa phép.' },
  cun: { name: 'Cún Đốm', c: '#E3B47C', c2: '#A86F45', belly: '#FFF1DE', food: ['🦴', '🍖', '🍰'], blurb: 'Bạn cún vui tính, lớn lên thành cún siêu anh hùng mặc áo choàng.' },
  ga: { name: 'Gà Lửa', c: '#FFD447', c2: '#F5A524', belly: '#FFF6C9', food: ['🌽', '🍎', '🍰'], blurb: 'Bạn gà con vàng óng, lớn lên hóa thành chim lửa rực rỡ.' }
};
const PET_STAGES = [
  { name: 'Quả trứng', min: 0 },
  { name: 'Em bé', min: 1 },
  { name: 'Nhí nhảnh', min: 3 },
  { name: 'Thiếu niên', min: 7 },
  { name: 'Trưởng thành', min: 12 },
  { name: 'Huyền thoại', min: 18 }
];
/* Cấp độ theo XP: cấp L cần 4·(L−1)² XP. Mỗi bài học xong (2 bước) được khoảng 6–8 XP.
   Với nhịp học đều: Thiếu niên khoảng giữa lớp 1, Trưởng thành khoảng hết lớp 2, Huyền thoại khoảng lớp 4. */
const petLevel = xp => xp > 0 ? 1 + Math.floor(Math.sqrt(xp / 4)) : 1;
const petXpFor = L => 4 * (L - 1) * (L - 1);
function petStage(pet) { if (!pet || !pet.xp) return 0; const L = petLevel(pet.xp); let s = 1; PET_STAGES.forEach((st, i) => { if (i && L >= st.min) s = i; }); return s; }
const petFedToday = pet => !!(pet && pet.lastFed === dayKey());
const petName = pet => (pet && pet.name) || (pet && PET_SPECIES[pet.species].name) || '';

/* ---------- vẽ thú cưng ---------- */
function petEyes(mood, y = 58) {
  if (mood === 'cheer' || mood === 'eat') return `<path d="M42 ${y}q6-8 12 0M66 ${y}q6-8 12 0" stroke="#2B1A10" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (mood === 'hungry') return `<circle cx="48" cy="${y}" r="5.5" fill="#2B1A10"/><circle cx="72" cy="${y}" r="5.5" fill="#2B1A10"/><circle cx="49.5" cy="${y - 1.5}" r="1.8" fill="#fff"/><circle cx="73.5" cy="${y - 1.5}" r="1.8" fill="#fff"/><path d="M40 ${y - 7}l10 -5M80 ${y - 7}l-10 -5" stroke="#2B1A10" stroke-width="2.5" stroke-linecap="round"/><path d="M84 ${y + 2}q3 6 0 8q-3-2 0-8z" fill="#7CC6F2"/>`;
  return `<circle cx="48" cy="${y}" r="6" fill="#2B1A10"/><circle cx="72" cy="${y}" r="6" fill="#2B1A10"/><circle cx="50" cy="${y - 2}" r="2.2" fill="#fff"/><circle cx="74" cy="${y - 2}" r="2.2" fill="#fff"/>`;
}
function petMouth(mood, y = 70) {
  if (mood === 'eat') return `<ellipse cx="60" cy="${y + 1}" rx="6" ry="5" fill="#7A2E2E"/>`;
  if (mood === 'hungry') return `<path d="M54 ${y + 3}q6-5 12 0" stroke="#2B1A10" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  return `<path d="M53 ${y}q7 7 14 0" stroke="#2B1A10" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
}
const crown = (y = 14) => `<path d="M44 ${y + 12}l4-14 7 8 5-11 5 11 7-8 4 14z" fill="#F5C531" stroke="#C99A10" stroke-width="2"/><circle cx="60" cy="${y + 4}" r="2.5" fill="#E8435A"/>`;
const sparkles = () => `<path d="M14 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM104 22l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5zM100 92l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#F5C531"/>`;
function petBody(sp, st, mood) {
  const S = PET_SPECIES[sp], c = S.c, c2 = S.c2, b = S.belly;
  const face = petEyes(mood) + petMouth(mood) + `<circle cx="38" cy="68" r="5" fill="#FF8FA6" opacity=".55"/><circle cx="82" cy="68" r="5" fill="#FF8FA6" opacity=".55"/>`;
  const ry = [0, 30, 33, 36, 38, 38][st];
  const base = `<ellipse cx="60" cy="${110 - ry}" rx="${30 + st}" ry="${ry}" fill="${c}" stroke="${c2}" stroke-width="2.5"/><ellipse cx="60" cy="${114 - ry * .6}" rx="${17 + st}" ry="${ry * .55}" fill="${b}"/>`;
  const feet = `<ellipse cx="46" cy="110" rx="9" ry="5" fill="${c2}"/><ellipse cx="74" cy="110" rx="9" ry="5" fill="${c2}"/>`;
  let back = '', front = '';
  if (sp === 'rong') {
    back += `<path d="M86 96q24 4 22-16q-6 8-16 6" fill="${c}" stroke="${c2}" stroke-width="2.5"/>`;
    if (st >= 2) front += `<path d="M44 ${82 - ry}l-4-14 10 8zM76 ${82 - ry}l4-14-10 8z" fill="#F5C531" stroke="#C99A10" stroke-width="1.5"/>`;
    if (st >= 3) back += `<path d="M32 70q-22-14-26 6q12-4 24 6z" fill="${c2}" opacity=".9"/><path d="M88 70q22-14 26 6q-12-4-24 6z" fill="${c2}" opacity=".9"/>`;
    if (st >= 4) { back = back.replace(/q-22-14-26 6q12-4 24 6/, 'q-30-26-34 4q16-6 30 10').replace(/q22-14 26 6q-12-4-24 6/, 'q30-26 34 4q-16-6-30 10'); front += `<path d="M52 ${80 - ry}l3-6 3 6M62 ${80 - ry}l3-6 3 6" stroke="${c2}" stroke-width="3" fill="none"/>`; }
    if (st >= 5) back += `<ellipse cx="22" cy="100" rx="16" ry="7" fill="#fff" opacity=".9"/><ellipse cx="100" cy="102" rx="16" ry="7" fill="#fff" opacity=".9"/>`;
  }
  if (sp === 'tho') {
    const L = [0, 14, 20, 24, 22, 20][st];
    back += `<ellipse cx="46" cy="${78 - ry - L / 2}" rx="8" ry="${L}" fill="${c}" stroke="${c2}" stroke-width="2.5" transform="rotate(-10 46 ${78 - ry})"/><ellipse cx="74" cy="${78 - ry - L / 2}" rx="8" ry="${L}" fill="${c}" stroke="${c2}" stroke-width="2.5" transform="rotate(10 74 ${78 - ry})"/><ellipse cx="46" cy="${78 - ry - L / 2}" rx="3.5" ry="${L * .7}" fill="#FFC2CF" transform="rotate(-10 46 ${78 - ry})"/><ellipse cx="74" cy="${78 - ry - L / 2}" rx="3.5" ry="${L * .7}" fill="#FFC2CF" transform="rotate(10 74 ${78 - ry})"/>`;
    back += `<circle cx="90" cy="100" r="7" fill="#fff" stroke="${c2}" stroke-width="2"/>`;
    if (st >= 3) front += `<path d="M48 ${86 - ry}l12 6 12-6-4 10-8-4-8 4z" fill="#F28AA0"/>`;
    if (st >= 4) front += `<path d="M90 64l14-20" stroke="#C99A10" stroke-width="3" stroke-linecap="round"/><path d="M104 36l2.5 6 6 .5-4.6 4 1.5 6-5.4-3.2-5.4 3.2 1.5-6-4.6-4 6-.5z" fill="#F5C531"/>`;
    if (st >= 5) back += `<ellipse cx="26" cy="64" rx="16" ry="10" fill="#CFE7FF" opacity=".85" transform="rotate(-25 26 64)"/><ellipse cx="94" cy="64" rx="16" ry="10" fill="#CFE7FF" opacity=".85" transform="rotate(25 94 64)"/>`;
  }
  if (sp === 'cun') {
    const E = [0, 12, 14, 16, 16, 16][st];
    front += `<ellipse cx="${34 - st}" cy="${86 - ry}" rx="9" ry="${E}" fill="${c2}" transform="rotate(20 ${34 - st} ${86 - ry})"/><ellipse cx="${86 + st}" cy="${86 - ry}" rx="9" ry="${E}" fill="${c2}" transform="rotate(-20 ${86 + st} ${86 - ry})"/>`;
    front += `<circle cx="74" cy="${96 - ry * .3}" r="6" fill="${c2}" opacity=".6"/><circle cx="44" cy="${104 - ry * .2}" r="4" fill="${c2}" opacity=".6"/>`;
    back += `<path d="M88 94q14-6 12-18" stroke="${c2}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    if (st >= 2) front += `<path d="M40 ${88 - ry * .25}q20 8 40 0" stroke="#E8435A" stroke-width="5" fill="none"/><circle cx="60" cy="${94 - ry * .25}" r="4" fill="#F5C531"/>`;
    if (st >= 4) back += `<path d="M34 ${96 - ry}q-14 30-6 40h64q8-10-6-40z" fill="#E8435A" opacity=".9"/>`;
    if (st >= 5) front += `<circle cx="60" cy="${102 - ry * .2}" r="7" fill="#F5C531" stroke="#C99A10" stroke-width="2"/><path d="M57 ${102 - ry * .2}h6M60 ${99 - ry * .2}v6" stroke="#fff" stroke-width="2"/>`;
  }
  if (sp === 'ga') {
    if (st >= 2) front += `<path d="M52 ${82 - ry}q2-10 8-4q4-10 8 0q6-4 4 6z" fill="#E8435A"/>`;
    back += st >= 3 ? `<path d="M30 74q-18 4-14 20q10-2 18-10z" fill="${c2}"/><path d="M90 74q18 4 14 20q-10-2-18-10z" fill="${c2}"/>` : `<ellipse cx="30" cy="84" rx="7" ry="11" fill="${c2}"/><ellipse cx="90" cy="84" rx="7" ry="11" fill="${c2}"/>`;
    if (st >= 4) back += `<path d="M86 100q24-6 30-30q-12 12-22 10q12-10 12-26q-10 16-24 20z" fill="#F07B3F"/>`;
    if (st >= 5) back += `<path d="M30 80q-24-20-20-44q6 16 18 20q-8-16 2-30q2 22 14 34z" fill="#F07B3F" opacity=".9"/><path d="M90 80q24-20 20-44q-6 16-18 20q8-16-2-30q-2 22-14 34z" fill="#F07B3F" opacity=".9"/>`;
    front += `<path d="M55 66l5 6 5-6z" fill="#F07B3F"/>`;
    return back + base + feet.replace(/fill="[^"]+"/g, 'fill="#F07B3F"') + front + face.replace(petMouth(mood), mood === 'eat' ? '<ellipse cx="60" cy="72" rx="5" ry="4" fill="#7A2E2E"/>' : '') + (st >= 5 ? crown(110 - ry * 2 - 20) + sparkles() : '');
  }
  return back + base + feet + front + face + (st >= 5 ? crown(110 - ry * 2 - (sp === 'tho' ? 12 : 20)) + sparkles() : '');
}
function petEgg(sp) {
  const S = PET_SPECIES[sp], dot = sp === 'tho' ? '#FFC2CF' : S.c;
  return `<ellipse cx="60" cy="72" rx="30" ry="38" fill="#FFFBF2" stroke="${S.c2}" stroke-width="3"/><circle cx="48" cy="58" r="7" fill="${dot}"/><circle cx="72" cy="82" r="9" fill="${dot}"/><circle cx="66" cy="50" r="4" fill="${dot}"/><circle cx="46" cy="90" r="5" fill="${dot}"/><path d="M40 70l6-6 6 6 6-6 6 6" stroke="${S.c2}" stroke-width="2" fill="none" opacity=".5"/>`;
}
/* Vẽ thú cưng: giai đoạn càng cao thì thú càng to (scale) và có thêm chi tiết */
function petSvg(pet, size = 120, mood, cls = '', stageOverride) {
  if (!pet) return '';
  const st = stageOverride ?? petStage(pet); const md = mood || (petFedToday(pet) ? 'happy' : 'hungry');
  const sc = [0.8, 0.62, 0.72, 0.82, 0.92, 1][st];
  const body = st === 0 ? petEgg(pet.species) : petBody(pet.species, st, md);
  return `<svg class="mascot pet ${cls}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true"><g transform="translate(60 114) scale(${sc}) translate(-60 -114)">${body}</g></svg>`;
}

/* ---------- cho ăn ---------- */
/* Gọi khi con làm xong một bài: thú cưng được ăn, cộng XP theo số sao. Trả về thông tin để màn kết quả hiển thị. */
function feedPet(p, stars, why = 'lesson') {
  const pet = p.pet; if (!pet) return null;
  const L0 = petLevel(pet.xp || 0), S0 = petStage(pet);
  const gain = why === 'mission' ? 3 : stars + 1;
  pet.xp = (pet.xp || 0) + gain; pet.meals = (pet.meals || 0) + 1; pet.lastFed = dayKey();
  pet.fedDays ||= {}; pet.fedDays[dayKey()] = (pet.fedDays[dayKey()] || 0) + 1;
  const foods = PET_SPECIES[pet.species].food; const food = foods[Math.max(0, Math.min(2, (stars || 2) - 1))];
  return { gain, food, levelUp: petLevel(pet.xp) > L0, level: petLevel(pet.xp), grew: petStage(pet) > S0, stage: petStage(pet) };
}
function petThanks(c, pet, fr) {
  const n = esc(petName(pet));
  if (fr.grew) return `Oa! Nhờ ${esc(c.name)} chăm chỉ học bài, ${n} đã lớn thành <b>${PET_STAGES[fr.stage].name}</b> rồi! Cảm ơn ${esc(c.name)} nhiều lắm! 🎉`;
  if (fr.levelUp) return `Măm măm ${fr.food}! ${n} lên <b>cấp ${fr.level}</b> rồi! Cảm ơn ${esc(c.name)} đã chăm chỉ học bài nuôi mình lớn nha! 🥰`;
  return pick([`Măm măm ${fr.food}! Ngon quá! Cảm ơn ${esc(c.name)} đã chăm chỉ học bài cho mình ăn nha!`, `${fr.food} Cảm ơn ${esc(c.name)}! Con học giỏi là mình được ăn no, mau lớn lắm đó!`, `Yeah, ${fr.food}! ${n} cảm ơn ${esc(c.name)} vì đã chăm chỉ học bài. Mai mình học tiếp nhé!`]);
}

/* ---------- màn hình thú cưng của con ---------- */
function vPetChooser(c) {
  return `<div class="say">${pi('cheer', 60, 'bob')}<div class="bubble">${esc(c.name)} ơi, chọn một bạn thú cưng để nuôi nhé! Mỗi lần con học xong một bài, bạn ấy được ăn và <b>lớn dần lên</b>.</div></div>
  <div class="petpick">${Object.entries(PET_SPECIES).map(([k, S]) => `<button class="petopt" data-act="petChoose" data-sp="${k}">${petSvg({ species: k, xp: 40 }, 96, 'happy', '', 3)}<b>${S.name}</b><span class="tiny muted">${S.blurb}</span></button>`).join('')}</div>
  <p class="tiny muted" style="text-align:center;font-weight:700">Con chọn kỹ nha, mỗi con chỉ nuôi một bạn thôi.</p>`;
}
function vPet(f, c, p) {
  const pet = p.pet; if (!pet) return vPetChooser(c);
  const S = PET_SPECIES[pet.species], L = petLevel(pet.xp || 0), st = petStage(pet), fed = petFedToday(pet);
  const lo = petXpFor(L), hi = petXpFor(L + 1), pct = Math.round(((pet.xp || 0) - lo) / (hi - lo) * 100);
  const nextSt = PET_STAGES[st + 1];
  const today = (pet.fedDays && pet.fedDays[dayKey()]) || 0;
  const msg = st === 0 ? `Mình đang ở trong trứng nè! ${esc(c.name)} học xong 1 bài là mình nở ra liền!` : fed ? `Hôm nay mình đã được ăn ${today} bữa rồi, no căng bụng! Cảm ơn ${esc(c.name)} nha! 🥰` : `Mình đói bụng quá… ${esc(c.name)} học 1 bài cho mình ăn với nha! 🥺`;
  return `<section class="card petcard" style="--pc:${S.c};--pc2:${S.c2}">
      <div class="petstage">${petSvg(pet, 190, null, 'bob')}</div>
      <div class="row between" style="align-items:flex-end"><div style="min-width:0"><div class="eyebrow">${S.name} · ${PET_STAGES[st].name}</div><h2 class="h2">${esc(petName(pet))}</h2></div><span class="pill gold">Cấp ${L}</span></div>
      <div><div class="row between tiny" style="font-weight:800"><span>Điểm lớn</span><span class="num">${pet.xp || 0}/${hi}</span></div><div class="meter" style="margin-top:4px"><i style="width:${pct}%;background:var(--jade)"></i></div></div>
      <div class="kv"><div><b>${pet.meals || 0}</b><span>bữa đã ăn</span></div><div><b>${today}</b><span>bữa hôm nay</span></div><div><b>${nextSt ? 'Cấp ' + nextSt.min : '★'}</b><span>${nextSt ? 'để thành ' + nextSt.name : 'đã lớn nhất'}</span></div></div>
    </section>
    <div class="say">${petSvg(pet, 52)}<div class="bubble" style="font-weight:600">${msg}</div></div>
    <button class="btn block jade" data-act="tab" data-t="learn">📚 Học bài cho ${esc(petName(pet))} ăn</button>
    <h2 class="h3">Hành trình lớn lên</h2>
    <div class="evo">${PET_STAGES.map((s, i) => `<div class="evo-i ${i <= st ? '' : 'off'} ${i === st ? 'cur' : ''}">${petSvg(pet, 64, 'happy', '', i)}<b>${s.name}</b><span>${i ? 'Cấp ' + s.min : 'Lúc đầu'}</span></div>`).join('')}</div>
    <section class="card stack"><b>Cách nuôi ${esc(petName(pet))}</b><p class="tiny" style="font-weight:600">• Mỗi lần con học xong một bước (Bài học, Luyện tập hay Ôn tập), ${esc(petName(pet))} được ăn một bữa và nhận điểm lớn bằng số sao + 1.<br>• Nhiệm vụ thực tế được ba mẹ xác nhận: thêm 3 điểm lớn.<br>• Đủ điểm thì lên cấp; đến cấp mốc thì đổi hình dáng và to hơn.<br>• Ngày nào chưa học, ${esc(petName(pet))} sẽ hơi đói, nhưng không sao đâu, học một bài là bạn ấy vui ngay!</p>
    <form class="row" data-form="petName"><input class="input" name="name" maxlength="20" value="${esc(petName(pet))}" aria-label="Đặt tên thú cưng" style="flex:1"><button class="btn sm ghost" type="submit">Đặt tên</button></form></section>`;
}

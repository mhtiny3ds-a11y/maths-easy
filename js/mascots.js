'use strict';
/* =========================================================
   Nhân vật đồng hành (vẽ riêng cho Toán Vui Cùng Pi):
   - Mèo Pi: cô mèo cam đeo nơ xanh hình dấu cộng, dẫn con học mỗi bài.
   - Cánh cụt Tròn: giữ sổ nhiệm vụ thực tế.
   - Heo đất Bi: giữ hũ sao thưởng.
   ========================================================= */
function pi(mood = 'happy', size = 96, cls = '') {
  const eyes = mood === 'cheer'
    ? `<path d="M36 62q8-10 16 0M68 62q8-10 16 0" stroke="#3A2416" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
    : mood === 'oops'
    ? `<ellipse cx="44" cy="62" rx="9" ry="10" fill="#fff"/><ellipse cx="76" cy="62" rx="9" ry="10" fill="#fff"/><circle cx="44" cy="65" r="5" fill="#3A2416"/><circle cx="76" cy="65" r="5" fill="#3A2416"/><path d="M99 40c3 6 4 9 0 12c-4-3-3-6 0-12z" fill="#7CC6F2"/>`
    : mood === 'think'
    ? `<ellipse cx="44" cy="62" rx="9" ry="10" fill="#fff"/><ellipse cx="76" cy="62" rx="9" ry="10" fill="#fff"/><circle cx="47" cy="58" r="5.5" fill="#3A2416"/><circle cx="79" cy="58" r="5.5" fill="#3A2416"/><text x="96" y="30" font-size="20" font-weight="800" fill="#2F6FE4" font-family="Baloo 2,sans-serif">?</text>`
    : `<ellipse cx="44" cy="62" rx="9" ry="10.5" fill="#fff"/><ellipse cx="76" cy="62" rx="9" ry="10.5" fill="#fff"/><circle cx="45" cy="63" r="6" fill="#3A2416"/><circle cx="75" cy="63" r="6" fill="#3A2416"/><circle cx="47" cy="60.5" r="2.2" fill="#fff"/><circle cx="77" cy="60.5" r="2.2" fill="#fff"/>`;
  const mouth = mood === 'oops' ? `<ellipse cx="60" cy="80" rx="4" ry="3.5" fill="#7A2E2E"/>` : `<path d="M52 76q4 5 8 0q4 5 8 0" stroke="#3A2416" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const paw = mood === 'cheer' ? `<ellipse cx="17" cy="70" rx="9" ry="13" fill="#F59A3C" transform="rotate(-30 17 70)"/><ellipse cx="103" cy="70" rx="9" ry="13" fill="#F59A3C" transform="rotate(30 103 70)"/>` : '';
  return `<svg class="mascot ${cls}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <path d="M96 104q20-6 14-30" stroke="#F59A3C" stroke-width="9" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="104" rx="30" ry="15" fill="#F59A3C"/><ellipse cx="60" cy="106" rx="17" ry="10" fill="#FFE6C7"/>
  ${paw}
  <path d="M22 44 L26 12 L50 32 Z" fill="#F59A3C"/><path d="M98 44 L94 12 L70 32 Z" fill="#F59A3C"/>
  <path d="M28 38 L30 20 L44 32 Z" fill="#FFC2B8"/><path d="M92 38 L90 20 L76 32 Z" fill="#FFC2B8"/>
  <ellipse cx="60" cy="64" rx="42" ry="36" fill="#FBAE52"/>
  <path d="M52 30q8 4 16 0M48 38q12 5 24 0" stroke="#E5872B" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="60" cy="76" rx="22" ry="15" fill="#FFE6C7"/>
  ${eyes}
  <path d="M57 71h6l-3 3.5z" fill="#F07B8A"/>${mouth}
  <path d="M22 72h14M22 79l14-3M98 72H84M98 79l-14-3" stroke="#C86F22" stroke-width="2" stroke-linecap="round"/>
  <circle cx="33" cy="76" r="5" fill="#FF9E9E" opacity=".6"/><circle cx="87" cy="76" r="5" fill="#FF9E9E" opacity=".6"/>
  <path d="M44 96 L60 102 L44 108 Z" fill="#2F6FE4"/><path d="M76 96 L60 102 L76 108 Z" fill="#2F6FE4"/><circle cx="60" cy="102" r="6" fill="#1F55C0"/>
  <path d="M60 99v6M57 102h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
</svg>`;
}
function tron(size = 80, cls = '') {
  return `<svg class="mascot ${cls}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <ellipse cx="60" cy="68" rx="38" ry="44" fill="#2C3E66"/>
  <ellipse cx="60" cy="78" rx="27" ry="32" fill="#FFFFFF"/>
  <ellipse cx="60" cy="44" rx="30" ry="22" fill="#2C3E66"/>
  <ellipse cx="47" cy="50" rx="11" ry="12" fill="#fff"/><ellipse cx="73" cy="50" rx="11" ry="12" fill="#fff"/>
  <circle cx="48" cy="52" r="6" fill="#1B1B2F"/><circle cx="72" cy="52" r="6" fill="#1B1B2F"/><circle cx="50" cy="49.5" r="2" fill="#fff"/><circle cx="74" cy="49.5" r="2" fill="#fff"/>
  <path d="M53 62 L67 62 L60 71 Z" fill="#F5A524"/>
  <circle cx="38" cy="64" r="5" fill="#FFB3C1" opacity=".8"/><circle cx="82" cy="64" r="5" fill="#FFB3C1" opacity=".8"/>
  <ellipse cx="22" cy="80" rx="8" ry="20" fill="#2C3E66" transform="rotate(16 22 80)"/>
  <ellipse cx="46" cy="113" rx="11" ry="5" fill="#F5A524"/><ellipse cx="74" cy="113" rx="11" ry="5" fill="#F5A524"/>
  <rect x="72" y="74" width="30" height="36" rx="4" fill="#1F9E78" transform="rotate(8 87 92)"/>
  <rect x="80" y="70" width="14" height="7" rx="2" fill="#BDEBD9" transform="rotate(8 87 92)"/>
  <path d="M79 86l3 3 5-6M78 98l3 3 5-6" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" transform="rotate(8 87 92)"/>
  <ellipse cx="96" cy="94" rx="7" ry="14" fill="#2C3E66" transform="rotate(-30 96 94)"/>
</svg>`;
}
function bi(size = 80, cls = '') {
  return `<svg class="mascot ${cls}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
  <path d="M100 74q14-2 10 10q-4 6-10 0" stroke="#F28AA0" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="30" y="96" width="14" height="16" rx="5" fill="#F28AA0"/><rect x="76" y="96" width="14" height="16" rx="5" fill="#F28AA0"/>
  <path d="M30 34 L36 14 L50 30 Z" fill="#F28AA0"/><path d="M90 34 L84 14 L70 30 Z" fill="#F28AA0"/>
  <ellipse cx="60" cy="68" rx="46" ry="38" fill="#FFB4C4"/>
  <rect x="48" y="31" width="24" height="6" rx="3" fill="#C2566F"/>
  <circle cx="44" cy="60" r="5" fill="#3A2416"/><circle cx="76" cy="60" r="5" fill="#3A2416"/><circle cx="45.6" cy="58.4" r="1.8" fill="#fff"/><circle cx="77.6" cy="58.4" r="1.8" fill="#fff"/>
  <ellipse cx="60" cy="76" rx="15" ry="11" fill="#F28AA0"/><ellipse cx="55" cy="76" rx="3" ry="4" fill="#C2566F"/><ellipse cx="65" cy="76" rx="3" ry="4" fill="#C2566F"/>
  <circle cx="32" cy="74" r="6" fill="#FF8FA6" opacity=".7"/><circle cx="88" cy="74" r="6" fill="#FF8FA6" opacity=".7"/>
  <path d="M60 86l5 10.2 11.2 1.6-8.1 7.9 1.9 11.2L60 111.6l-10 5.3 1.9-11.2-8.1-7.9 11.2-1.6z" fill="#F5A524" stroke="#C97F0E" stroke-width="2"/>
</svg>`;
}

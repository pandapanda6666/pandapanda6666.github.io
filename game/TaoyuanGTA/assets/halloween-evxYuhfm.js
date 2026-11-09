import{H as e}from"./engine-Codfgizn.js";import{l as t}from"./dom-DZNhMrZO.js";import{X as n}from"./world-BrfbAKQq.js";import{pr as r}from"./game-Bf3Nuyky.js";var i=`uniglow-taipei`;function a(){return e()??{at:()=>n(i),title:s.title,body:s.body,gpsLabel:s.gpsLabel,gpsSet:s.gpsSet}}var o=`tgta-hw-promo-2026`,s={badge:{zh:`萬聖節快樂`,en:`Happy Halloween`},kicker:{zh:`萬聖節限定 · 10/30–10/31`,en:`HALLOWEEN ONLY · OCT 30–31`},title:{zh:`UNIGLOW 萬聖節限定服裝上架！`,en:`Halloween costumes now at UNIGLOW!`},body:{zh:`今晚街上到處是變裝的人潮。到忠孝東路的 UNIGLOW 旗艦店挑一套萬聖節服裝，一起上街狂歡！`,en:`Costumed crowds are out on the streets tonight. Pick up a Halloween outfit at the UNIGLOW flagship on Zhongxiao East Road and join them!`},go:{zh:`去逛逛`,en:`Take me there`},later:{zh:`稍後`,en:`Later`},gpsSet:{zh:`📍 已導航到忠孝東路的 UNIGLOW 旗艦店`,en:`📍 GPS set: UNIGLOW flagship, Zhongxiao E. Rd.`},gpsLabel:{zh:`UNIGLOW 萬聖節限定`,en:`UNIGLOW Halloween`}},c=`<svg viewBox="-32 -14 64 28" aria-hidden="true"><g class="hw-wing"><path d="M-3-1C-8-9-18-11-30-5c4 2 5 5 4 8-4-3-8-2-10 1-3-3-7-3-9 0-2-2-3-3-4-2z"/><path d="M3-1C8-9 18-11 30-5c-4 2-5 5-4 8 4-3 8-2 10 1 3-3 7-3 9 0 2-2 3-3 4-2z"/></g><path d="M0-6.5-2.6-9.5-3-4.5C-4-2-4 3-1.5 6L0 7.5 1.5 6C4 3 4-2 3-4.5l-.4-5z"/></svg>`,l=`<svg viewBox="0 0 64 60" aria-hidden="true"><path d="M30 11c-1-5 1-8 5-10l2.4 3c-3 1.4-4 3.6-3.2 7z" fill="#5a7a2c"/><ellipse cx="20" cy="35" rx="15" ry="21" fill="#d9600c"/><ellipse cx="44" cy="35" rx="15" ry="21" fill="#d9600c"/><ellipse cx="32" cy="35" rx="15.5" ry="23" fill="#f47d16"/><ellipse cx="27" cy="25" rx="5" ry="9" fill="#ffa64a" opacity=".45"/><g class="hw-face" fill="#ffd75e"><path d="M18 29h8l-4-7z"/><path d="M38 29h8l-4-7z"/><path d="M30 35h4l-2-3.4z"/><path d="M16 40c6 9 26 9 32 0-2.6.8-4.6 1-6.4 1.4L39.4 38l-2.6 3.6L32 39.6l-4.8 2-2.6-3.6-2.2 3.4C20.6 41 18.6 40.8 16 40z"/></g></svg>`,u=`<svg viewBox="-12 -10 24 22" aria-hidden="true"><g fill="none" stroke="#120a18" stroke-width="1.3" stroke-linecap="round"><path d="M-3-1-8-6-11-2M-3 1-9-1-11 4M-3 2-8 4-9 9M-2 3-5 8-5 11"/><path d="M3-1 8-6 11-2M3 1 9-1 11 4M3 2 8 4 9 9M2 3 5 8 5 11"/></g><ellipse cx="0" cy="2" rx="4" ry="5" fill="#120a18"/><circle cx="0" cy="-3.6" r="2.6" fill="#120a18"/><circle cx="-1" cy="-3.9" r=".7" fill="#ff7a1a"/><circle cx="1" cy="-3.9" r=".7" fill="#ff7a1a"/></svg>`;function d(){let e=[16,31,47,64,82],t=(e,t)=>[100-Math.cos(e)*t,0+Math.sin(e)*t],n=Array.from({length:7},(e,t)=>t/6*(Math.PI/2)),r=``;for(let e of n){let[n,i]=t(e,104);r+=`M100 0L${n.toFixed(1)} ${i.toFixed(1)}`}for(let i of e)for(let e=0;e<6;e++){let[a,o]=t(n[e],i*(e%2?.97:1)),[s,c]=t(n[e+1],i*(e%2?1:.97)),[l,u]=t((n[e]+n[e+1])/2,i*.8);r+=`M${a.toFixed(1)} ${o.toFixed(1)}Q${l.toFixed(1)} ${u.toFixed(1)} ${s.toFixed(1)} ${c.toFixed(1)}`}return`<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${r}" fill="none" stroke="currentColor" stroke-width=".55" stroke-linecap="round"/></svg>`}function f(e=[`UNI`,`GLOW`]){let t=e=>e.replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]),n=Math.min(12.5,50/Math.max(1,e[0].length,e[1].length)),r=(e,r)=>`<text x="20" y="${e}" text-anchor="middle" font-family="Avenir Next Condensed,Bahnschrift,Arial Narrow,sans-serif" font-weight="800" font-size="${n}" fill="#fff" letter-spacing=".5">${t(r)}</text>`;return`<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" fill="#e60012"/>`+r(18,e[0])+r(31.5,e[1])+`</svg>`}var p=`
body.tr-hw { --hw-or: #ff7a1a; --hw-or2: #ffa23d; --hw-pu: #8e3dff; --hw-pu2: #c69bff; --hw-night: #1a0b2e; }
.hw-layer { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.hw-layer svg { display: block; width: 100%; height: 100%; overflow: visible; }

/* ---- title */
.ti:not(.show) .hw-ti, .pm:not(.show) .hw-pm { display: none; }
.hw-ti { transition: opacity 0.6s ease; }
.ti.live .hw-ti { opacity: 0; }
.ti.ti-white .hw-tint, .ti.ti-white .hw-moon { display: none; }
.hw-tint { position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 78% 0%, rgba(110, 40, 190, 0.42), transparent 70%),
    linear-gradient(180deg, rgba(60, 18, 110, 0.30), rgba(60, 18, 110, 0) 45%),
    radial-gradient(ellipse 80% 40% at 65% 78%, rgba(255, 110, 20, 0.20), transparent 70%);
  mix-blend-mode: hard-light; }
.hw-moon { position: absolute; left: 84%; top: 20%; width: clamp(54px, 8.5vmin, 120px); aspect-ratio: 1; border-radius: 50%;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(circle at 64% 60%, rgba(196, 130, 60, 0.35) 0 9%, transparent 10%),
    radial-gradient(circle at 34% 66%, rgba(196, 130, 60, 0.28) 0 6%, transparent 7%),
    radial-gradient(circle at 46% 30%, rgba(196, 130, 60, 0.25) 0 7%, transparent 8%),
    radial-gradient(circle at 38% 34%, #fff8de, #ffd98a 55%, #f0a94c);
  box-shadow: 0 0 2.2vmin 0.8vmin rgba(255, 196, 110, 0.55), 0 0 9vmin 4vmin rgba(255, 140, 40, 0.22); }
.hw-bat { position: absolute; color: #12081b; width: clamp(38px, 5.6vmin, 78px); aspect-ratio: 64 / 28; }
.hw-bat-b { width: 100%; height: 100%; }
.hw-bat svg { fill: currentColor; filter: drop-shadow(0 0 2px rgba(255, 170, 90, 0.5)); }
.hw-wing { transform-box: view-box; transform-origin: 50% 50%; }
.hw-web { position: absolute; width: clamp(90px, 17vmin, 230px); aspect-ratio: 1; color: rgba(236, 226, 255, 0.5); filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.6)); }
.hw-ti .hw-web { right: 0; top: calc(var(--bar) + env(safe-area-inset-top, 0px)); }
.hw-spider { position: absolute; width: clamp(16px, 2.4vmin, 30px); aspect-ratio: 24 / 22; }
.hw-spider::before { content: ''; position: absolute; left: 50%; bottom: 60%; width: 1px; height: 30vmin; background: linear-gradient(rgba(236, 226, 255, 0), rgba(236, 226, 255, 0.55)); }
.hw-ti .hw-spider { right: calc(clamp(90px, 17vmin, 230px) * 0.38); top: calc(var(--bar) + env(safe-area-inset-top, 0px) + clamp(90px, 17vmin, 230px) * 0.62); }
.hw-pumpkins { position: absolute; right: var(--ti-xr); bottom: calc(var(--bar) + env(safe-area-inset-bottom, 0px) - 0.3em); display: flex; align-items: flex-end; gap: 0.2em; }
.hw-pk { width: clamp(38px, 7vmin, 96px); aspect-ratio: 64 / 60; filter: drop-shadow(0 0 1.2vmin rgba(255, 140, 30, 0.55)); }
.hw-pk.s { width: clamp(28px, 4.8vmin, 66px); }
.hw-pk .hw-face { filter: drop-shadow(0 0 2px #ffb300); }
body.tr-portrait .hw-moon { left: 80%; top: 33%; width: clamp(54px, 16vmin, 110px); }
body.tr-portrait .hw-ti .hw-web { top: auto; bottom: calc(var(--bar) + env(safe-area-inset-bottom, 0px)); transform: scaleY(-1); width: clamp(80px, 22vmin, 170px); }
body.tr-portrait .hw-ti .hw-spider { display: none; }
body.tr-portrait .hw-pumpkins { left: var(--ti-x); right: auto; }
body.tr-compact:not(.tr-portrait) .hw-moon { display: none; }
body.tr-compact:not(.tr-portrait) .hw-ti .hw-web { width: clamp(60px, 16vmin, 100px); }
body.tr-compact:not(.tr-portrait) .hw-ti .hw-spider { display: none; }
body.tr-compact .hw-bat.x { display: none; }
body.tr-compact:not(.tr-portrait) .hw-pk { width: clamp(30px, 9vmin, 56px); }
body.tr-compact:not(.tr-portrait) .hw-pk.s { width: clamp(22px, 6.4vmin, 40px); }

/* the sticker on the logo */
body.tr-hw .ti-logo { position: relative; }
.hw-badge { position: absolute; right: -0.4em; top: -1.9em; z-index: 1; display: flex; align-items: center; gap: 0.45em;
  padding: 0.38em 0.85em 0.38em 0.5em; border-radius: 0.5em; transform: rotate(-5deg); transform-origin: 80% 100%;
  background: linear-gradient(135deg, #ff9a2e, #ff6a00); color: #1f0a33; border: 2px solid #1f0a33;
  box-shadow: 0.22em 0.22em 0 #1f0a33, 0 0.6em 1.4em rgba(0, 0, 0, 0.45); font-size: clamp(11px, 1.25vw, 19px); white-space: nowrap; pointer-events: none; }
.hw-badge-pk { width: 1.9em; aspect-ratio: 64 / 60; flex: none; }
.hw-badge-pk svg { width: 100%; height: 100%; }
.hw-badge-t b { display: block; font: 900 1.05em/1.1 var(--tr-font); letter-spacing: 0.12em; }
.hw-badge-t small { display: block; font: 800 0.62em/1.2 var(--tr-display); letter-spacing: 0.24em; text-transform: uppercase; color: #4a1a7a; }
body.tr-lang-en .hw-badge-t b { font-family: var(--tr-display); font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
body.tr-compact .hw-badge { font-size: 11px; top: -1.7em; }
body.tr-portrait .hw-badge { font-size: clamp(11px, 3.1vw, 16px); top: -2.4em; right: 0; }

/* the menu buttons: orange → purple instead of signboard red; a pumpkin on the focused title button */
body.tr-hw .ti-menu .mbtn.focus::before { background: linear-gradient(180deg, var(--hw-or), var(--hw-pu)); }
body.tr-hw .ti-menu .mbtn.focus .mbtn-ic { color: #e8590c; }
body.tr-hw .ti-menu .mbtn.focus { background: linear-gradient(90deg, #fff1e0, var(--paper) 70%); }
body.tr-hw .ti-menu .mbtn.focus::after { content: ''; position: absolute; right: 0.7em; top: 50%; width: 1.5em; height: 1.4em; margin-top: -0.75em;
  background: ${`url("data:image/svg+xml,${encodeURIComponent(l.replace(` class="hw-face"`,``).replace(` aria-hidden="true"`,` xmlns="http://www.w3.org/2000/svg"`))}")`} center / contain no-repeat; }
body.tr-hw .ti.ti-white .ti-menu .mbtn.focus { background: #1f0a33; }
body.tr-hw .pm-btn.focus:not(.pm-support) { background: linear-gradient(90deg, rgba(255, 122, 26, 0.42), rgba(142, 61, 255, 0.12) 85%); }
body.tr-hw .pm-btn.focus::before { background: linear-gradient(180deg, var(--hw-or), var(--hw-pu)); }
body.tr-hw .pm-btn.active::after { background: var(--hw-or); }
body.tr-hw .srow.focus { box-shadow: inset 0.2em 0 0 var(--hw-or); }
body.tr-hw .sl-fill { background: linear-gradient(90deg, var(--hw-pu), var(--hw-or)); }
body.tr-hw .sl-knob { box-shadow: 0 0 0 0.2em rgba(255, 122, 26, 0.5), 0 0.15em 0.4em rgba(0, 0, 0, 0.5); }
body.tr-hw .ti-pane { border-top-color: var(--hw-or); box-shadow: 0 2em 5em rgba(0, 0, 0, 0.55), 0 -0.4em 2em -1em rgba(142, 61, 255, 0.45); }
body.tr-hw .dlg { border-color: rgba(198, 155, 255, 0.28); box-shadow: 0 2em 5em rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 122, 26, 0.12), 0 0 3em rgba(142, 61, 255, 0.25); }
body.tr-hw .dlg-btns .primary { background: linear-gradient(135deg, #ff8a1f, #e8590c); color: #1a0a00; }

/* ---- pause */
body.tr-hw .pm-bg { background-image:
    linear-gradient(90deg, rgba(8, 4, 14, 0.92), rgba(8, 4, 14, 0.72) 45%, rgba(8, 4, 14, 0.6)),
    radial-gradient(ellipse at 15% 20%, rgba(255, 122, 26, 0.2), transparent 55%),
    radial-gradient(ellipse at 92% 100%, rgba(142, 61, 255, 0.26), transparent 60%); }
body.tr-hw .pm-card { background: linear-gradient(135deg, rgba(255, 122, 26, 0.18), rgba(142, 61, 255, 0.08) 60%, rgba(255, 255, 255, 0.02)); border-left-color: var(--hw-or); }
body.tr-hw .pm-top { border-bottom-color: rgba(198, 155, 255, 0.2); }
.hw-pm .hw-web { right: 0; top: 0; width: clamp(110px, 20vmin, 260px); color: rgba(236, 226, 255, 0.28); }
.hw-pm .hw-bat { color: #3b1a5e; }
.hw-pm .hw-bat svg { filter: drop-shadow(0 0 6px rgba(198, 155, 255, 0.55)); }
.hw-pm-foot { position: absolute; right: var(--pm-xr); bottom: calc(1.3em + env(safe-area-inset-bottom)); display: flex; align-items: flex-end; gap: 0.6em; opacity: 0.95; }
.hw-pm-foot .hw-pk { width: 2.6em; }
.hw-pm-foot .hw-pk.s { width: 1.9em; }
.hw-pm-foot span { font: 800 0.9em/1.2 var(--tr-font); letter-spacing: 0.18em; color: var(--hw-or2); padding-bottom: 0.35em; text-shadow: 0 0 0.8em rgba(255, 122, 26, 0.5); }
body.tr-compact .hw-pm-foot, body.tr-compact .hw-pm .hw-bat { display: none; }

/* ---- the promo card */
.dlg.hw-promo { width: min(31em, 92vw); max-height: calc(100% - 2em); overflow: auto; padding: 0; border-radius: 0.9em; font-size: clamp(13px, 1.7vmin, 17px);
  background: linear-gradient(180deg, #170b26, #110c18 40%); border: 1px solid rgba(198, 155, 255, 0.3); }
.hw-promo-art { position: relative; height: 8.4em; overflow: hidden; border-radius: 0.9em 0.9em 0 0;
  background: radial-gradient(ellipse 60% 90% at 72% 0%, rgba(142, 61, 255, 0.65), transparent 70%), linear-gradient(180deg, #2a0f4a, #3d1658 55%, #6a2a3a); }
.hw-promo-art::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 2.2em; background: linear-gradient(180deg, transparent, rgba(255, 122, 26, 0.32)); }
.hw-promo-art .hw-moon { left: 80%; top: 32%; width: 3.6em; }
.hw-promo-art .hw-bat { width: 2.6em; }
.hw-promo-art .hw-web { left: 0; top: 0; width: 6em; transform:; color: rgba(236, 226, 255, 0.4); }
.hw-promo-mark { position: absolute; left: 1.3em; bottom: 1.1em; width: 4.2em; height: 4.2em; z-index: 1; box-shadow: 0 0.4em 1.2em rgba(0, 0, 0, 0.5); transform: rotate(-4deg); }
.hw-promo-mark svg { width: 100%; height: 100%; }
.hw-promo-pks { position: absolute; right: 1.1em; bottom: 0.35em; z-index: 1; display: flex; align-items: flex-end; gap: 0.15em; }
.hw-promo-pks .hw-pk { width: 3.3em; }
.hw-promo-pks .hw-pk.s { width: 2.4em; }
.hw-promo-in { padding: 1.15em 1.5em 1.4em; }
.hw-promo-kicker { font: 800 0.74em/1.3 var(--tr-display); letter-spacing: 0.28em; color: var(--hw-or2); }
.hw-promo-title { margin-top: 0.35em; }
.hw-promo-title b { display: block; font: 900 1.42em/1.3 var(--tr-font); letter-spacing: 0.04em; color: #fff; }
.hw-promo-title small { display: block; margin-top: 0.15em; font: 700 0.86em/1.35 var(--tr-font); color: var(--hw-pu2); }
.hw-promo-text { margin: 0.75em 0 1.25em; font-size: 0.98em; line-height: 1.65; color: rgba(246, 243, 236, 0.84); }
.hw-promo .dlg-btns .mbtn { min-height: 44px; }
@media (max-height: 430px) {
  .hw-promo-art { height: 5em; }
  .hw-promo-art .hw-moon { width: 2.6em; }
  .hw-promo-mark { width: 3em; height: 3em; bottom: 0.7em; }
  .hw-promo-pks .hw-pk { width: 2.3em; } .hw-promo-pks .hw-pk.s { width: 1.8em; }
  .hw-promo-in { padding: 0.8em 1.3em 1em; }
  .hw-promo-text { margin: 0.45em 0 0.8em; }
}

/* ---- motion (only when the player has not asked for less) */
@media (prefers-reduced-motion: no-preference) {
  .hw-fly { animation: hwFly var(--d, 19s) linear var(--dl, 0s) infinite; }
  .hw-fly.b { animation-name: hwFlyB; }
  .hw-fly.c { animation-name: hwFlyC; }
  .hw-bat-b { animation: hwBob 1.3s ease-in-out infinite alternate; }
  .hw-wing { animation: hwFlap 0.2s ease-in-out infinite alternate; }
  .hw-hover .hw-wing { animation-duration: 0.16s; }
  .hw-hover { animation: hwHover 2.6s ease-in-out var(--dl, 0s) infinite alternate; }
  .hw-spider { animation: hwSpider 3.6s ease-in-out infinite alternate; }
  .hw-pk .hw-face { animation: hwFlicker 2.4s steps(1) infinite; }
  .hw-pk.s .hw-face { animation-delay: -1.1s; }
  .hw-badge { animation: hwSwing 3.2s ease-in-out infinite alternate; }
  .ti.show:not(.intro-done) .hw-badge { animation: hwBadgeIn 0.7s cubic-bezier(.2, 1.4, .4, 1) 1.2s both, hwSwing 3.2s ease-in-out 1.9s infinite alternate; }
  body.tr-hw .ti-menu .mbtn.focus::after { animation: hwWiggle 1.6s ease-in-out infinite; }
  .hw-moon { animation: hwGlow 4s ease-in-out infinite alternate; }
}
@keyframes hwFly {
  0% { transform: translate(34vw, 8vh) scale(0.8); opacity: 0; }
  6% { opacity: 1; }
  30% { transform: translate(16vw, -3vh) scale(0.9); }
  55% { transform: translate(0, 2vh) scale(1); }
  80% { transform: translate(-14vw, -5vh) scale(1.05); }
  94% { opacity: 1; }
  100% { transform: translate(-26vw, -18vh) scale(1.1); opacity: 0; }
}
@keyframes hwFlyB {
  0% { transform: translate(-30vw, 4vh) scale(0.75); opacity: 0; }
  6% { opacity: 1; }
  35% { transform: translate(-12vw, -4vh) scale(0.85); }
  60% { transform: translate(0, 1vh) scale(0.95); }
  94% { opacity: 1; }
  100% { transform: translate(24vw, -16vh) scale(1); opacity: 0; }
}
@keyframes hwFlyC {
  0% { transform: translate(20vw, -12vh) scale(0.7); opacity: 0; }
  8% { opacity: 1; }
  40% { transform: translate(6vw, 3vh) scale(0.8); }
  70% { transform: translate(-6vw, -2vh) scale(0.85); }
  92% { opacity: 1; }
  100% { transform: translate(-18vw, 10vh) scale(0.9); opacity: 0; }
}
@keyframes hwBob { from { transform: translateY(-0.12em); } to { transform: translateY(0.18em); } }
@keyframes hwFlap { from { transform: scaleY(1.05); } to { transform: scaleY(0.4); } }
@keyframes hwHover { from { transform: translate(0, -0.3em) rotate(-4deg); } to { transform: translate(0.4em, 0.35em) rotate(5deg); } }
@keyframes hwSpider { from { transform: translateY(-0.6em); } to { transform: translateY(0.9em); } }
@keyframes hwFlicker { 0%, 100% { opacity: 1; } 12% { opacity: 0.72; } 15% { opacity: 1; } 48% { opacity: 0.86; } 52% { opacity: 1; } 77% { opacity: 0.8; } }
@keyframes hwSwing { from { transform: rotate(-5deg); } to { transform: rotate(-2deg); } }
@keyframes hwBadgeIn { from { opacity: 0; transform: rotate(-24deg) scale(0.4); } to { opacity: 1; transform: rotate(-5deg) scale(1); } }
@keyframes hwWiggle { 0%, 70%, 100% { transform: rotate(0); } 78% { transform: rotate(-12deg); } 86% { transform: rotate(10deg); } 93% { transform: rotate(-5deg); } }
@keyframes hwGlow { from { filter: brightness(1); } to { filter: brightness(1.08); } }
`;function m(e,n,r){let i=t(`div`,`hw-bat ${n}`,e);for(let[e,t]of Object.entries(r))i.style.setProperty(e,t);return t(`div`,`hw-bat-b`,i).innerHTML=c,i}function h(e,n){let r=t(`div`,n,e);return t(`div`,`hw-pk`,r).innerHTML=l,t(`div`,`hw-pk s`,r).innerHTML=l,r}function g(e){let{kit:n,titleEl:r}=e,i=t(`div`,`hw-layer hw-ti`);i.setAttribute(`aria-hidden`,`true`);let a=r.querySelector(`.ti-vignette`);r.insertBefore(i,a?a.nextSibling:r.firstChild),t(`div`,`hw-tint`,i),t(`div`,`hw-moon`,i),m(i,`hw-fly`,{left:`70%`,top:`30%`,"--d":`17s`,"--dl":`-4s`}),m(i,`hw-fly b`,{left:`62%`,top:`22%`,"--d":`23s`,"--dl":`-15s`,width:`clamp(20px, 2.8vmin, 40px)`}),m(i,`hw-fly c x`,{left:`78%`,top:`40%`,"--d":`13s`,"--dl":`-9s`,width:`clamp(18px, 2.4vmin, 34px)`}),m(i,`hw-fly x`,{left:`88%`,top:`14%`,"--d":`29s`,"--dl":`-21s`,width:`clamp(16px, 2.1vmin, 30px)`}),m(i,`hw-fly b`,{left:`74%`,top:`52%`,"--d":`21s`,"--dl":`-2s`,width:`clamp(22px, 3vmin, 44px)`}),t(`div`,`hw-web`,i).innerHTML=d(),t(`div`,`hw-spider`,i).innerHTML=u,h(i,`hw-pumpkins`);let o=r.querySelector(`.ti-logo`);if(o){let e=t(`div`,`hw-badge`);e.setAttribute(`aria-hidden`,`true`),t(`span`,`hw-badge-pk`,e).innerHTML=l,n.keep(n.dual(t(`span`,`hw-badge-t`,e),s.badge));let r=()=>{e.parentElement!==o&&o.appendChild(e)};r(),new MutationObserver(r).observe(o,{childList:!0})}}function _(e){let{kit:n,pauseEl:r}=e,i=t(`div`,`hw-layer hw-pm`);i.setAttribute(`aria-hidden`,`true`);let a=r.querySelector(`.pm-bg`);r.insertBefore(i,a?a.nextSibling:r.firstChild),t(`div`,`hw-web`,i).innerHTML=d(),m(i,`hw-hover`,{right:`9%`,top:`26%`,"--dl":`-1s`}),m(i,`hw-hover`,{right:`17%`,top:`17%`,"--dl":`-2.2s`,width:`clamp(18px, 2.4vmin, 34px)`}),m(i,`hw-hover`,{right:`5%`,top:`42%`,"--dl":`-0.4s`,width:`clamp(16px, 2vmin, 28px)`});let o=t(`div`,`hw-pm-foot`,i);n.keep(n.bind(t(`span`,``,o),s.badge)),t(`div`,`hw-pk s`,o).innerHTML=l,t(`div`,`hw-pk`,o).innerHTML=l}function v(){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function y(){try{return localStorage.getItem(o)===v()}catch{return!1}}function b(){try{localStorage.setItem(o,v())}catch{}}function x(){if(document.querySelector(`.dlg-wrap, dialog[open], [aria-modal="true"], .tr-moved, #loader`))return!0;let e=document.getElementById(`sys-overlay`);return!!e&&e.style.display!==`none`}function S(e){let{kit:n}=e,i=n.ctx,o=i.params.get(`hwpromo`)===`1`,c=typeof navigator<`u`&&navigator.webdriver||i.params.has(`shot`)||i.params.has(`autopilot`),l=i.params.get(`hwpromo`)===`0`||c&&!o,u=!1,p=0,g=()=>{let c=a(),l=c.at();if(!l)return!1;u=!0,o||b(),e.setModal(!0);let p=t(`div`,`dlg-wrap hw-promo-wrap`,n.menuLayer),g=t(`div`,`dlg hw-promo`,p);g.setAttribute(`role`,`dialog`),g.setAttribute(`aria-modal`,`true`);let _=t(`div`,`hw-promo-art`,g);_.setAttribute(`aria-hidden`,`true`),t(`div`,`hw-web`,_).innerHTML=d(),t(`div`,`hw-moon`,_),m(_,`hw-hover`,{left:`56%`,top:`16%`,"--dl":`-0.8s`}),m(_,`hw-hover`,{left:`66%`,top:`48%`,"--dl":`-1.9s`,width:`1.6em`}),m(_,`hw-hover`,{left:`36%`,top:`24%`,"--dl":`-1.2s`,width:`1.4em`}),t(`div`,`hw-promo-mark`,_).innerHTML=f(c.logo),h(_,`hw-promo-pks`);let v=t(`div`,`hw-promo-in`,g);n.bind(t(`div`,`hw-promo-kicker`,v),s.kicker);let y=n.dual(t(`div`,`hw-promo-title`,v),c.title);y.id=`hw-promo-title`,g.setAttribute(`aria-labelledby`,y.id),n.bind(t(`div`,`hw-promo-text`,v),c.body);let x=t(`div`,`dlg-btns`,v),S,C=!1,w=t=>{C||(C=!0,e.nav.pop(S),p.classList.remove(`show`),setTimeout(()=>p.remove(),250),e.setModal(!1))};r(n,x,s.later,()=>{n.sfx(`ui_back`),w(`later`)},{cls:`dlg-btn`,dual:!1});let T=r(n,x,s.go,()=>{let e=c.at()??l;try{i.ui.setWaypoint({x:e.x,z:e.z},c.gpsLabel,!0),i.events.emit(`notify`,{text:c.gpsSet,kind:`info`,duration:3.5})}catch(e){console.warn(`[halloween] GPS`,e)}n.sfx(`ui_confirm`),w(`go`)},{cls:`dlg-btn primary`,dual:!1});return S={root:g,onBack:()=>w(`back`),initial:()=>T},e.nav.push(S),requestAnimationFrame(()=>p.classList.add(`show`)),!0};return{schedule:()=>{if(l||u||p||!o&&y())return;let t=performance.now(),n=0;p=window.setInterval(()=>{let r=performance.now();if(u||r-t>18e4){window.clearInterval(p),p=0;return}if(!(r-t>4e3&&e.canInterrupt()&&!x()&&!document.hidden)){n=0;return}if(n||=r,!(r-n<1500))try{g()&&(window.clearInterval(p),p=0)}catch(e){console.warn(`[halloween] promo`,e),u=!0,window.clearInterval(p),p=0}},500)}}}var C=null;function w(e){if(C)return C;let t=document.createElement(`style`);t.id=`tr-halloween-css`,t.textContent=p,document.head.appendChild(t),document.body.classList.add(`tr-hw`);try{g(e)}catch(e){console.warn(`[halloween] title`,e)}try{_(e)}catch(e){console.warn(`[halloween] pause`,e)}let n=S(e);return C={onPlay:()=>n.schedule()},C}export{w as installHalloween};
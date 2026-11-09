import{Rn as e}from"./engine-Codfgizn.js";import{_ as t,b as n,f as r,g as i,i as a,l as o,n as s,p as c,t as l,u}from"./cities-DQ0VZ9Jl.js";var d={departures:{zh:`出境航班`,en:`DEPARTURES`},time:{zh:`時間`,en:`Time`},flight:{zh:`航班`,en:`Flight`},dest:{zh:`目的地`,en:`Destination`},gate:{zh:`登機門`,en:`Gate`},remark:{zh:`備註`,en:`Remarks`},checkin:{zh:`報到中`,en:`CHECK-IN`},onTime:{zh:`準時`,en:`ON TIME`},tomorrow:{zh:`明日`,en:`TOMORROW`},fare:{zh:`機票`,en:`Fare`},free:{zh:`首航優惠 免費`,en:`Inaugural flight: FREE`},rate:{zh:`匯率`,en:`Rate`},oneWallet:{zh:`兩地同一個錢包`,en:`one wallet in both cities`},after:{zh:`付款後`,en:`after the fare`},arrive:{zh:`抵達`,en:`Arrives`},leaves:{zh:`起飛`,en:`Departs`},wallet:{zh:`錢包`,en:`Wallet`},there:{zh:`在`,en:`In `},firstVisit:{zh:`首次前往 · 抵達後故事從頭開始`,en:`First visit · your story there starts on arrival`},checkIn:{zh:`辦理登機`,en:`Check in`},leave:{zh:`離開`,en:`Leave`},board:{zh:`登機`,en:`Board`},back:{zh:`返回`,en:`Back`},boarding:{zh:`登機證`,en:`BOARDING PASS`},passenger:{zh:`旅客`,en:`Passenger`},seat:{zh:`座位`,en:`Seat`},boardTime:{zh:`登機時間`,en:`Boarding`},short:{zh:`現金不足以支付機票`,en:`Not enough cash for the fare`},economy:{zh:`經濟艙`,en:`ECONOMY`},hint:{zh:`Enter 確認 · Esc 離開`,en:`Enter confirm · Esc leave`}},f={departures:{zh:`高鐵 發車時刻`,en:`HSR DEPARTURES`},flight:{zh:`車次`,en:`Train`},gate:{zh:`月台`,en:`Platform`},checkin:{zh:`售票中`,en:`ON SALE`},fare:{zh:`車票`,en:`Fare`},free:{zh:`首次搭乘優惠 免費`,en:`First ride: FREE`},oneWallet:{zh:`各城市同一個錢包`,en:`one wallet in every city`},leaves:{zh:`發車`,en:`Departs`},checkIn:{zh:`購票`,en:`Buy ticket`},board:{zh:`上車`,en:`Board`},boarding:{zh:`高鐵車票`,en:`HSR TICKET`},boardTime:{zh:`進站時間`,en:`Gates open`},short:{zh:`現金不足以支付車票`,en:`Not enough cash for the fare`},economy:{zh:`標準車廂`,en:`STANDARD`}},p={zh:`同為新臺幣`,en:`same currency`},m={zh:`各城市同一個錢包`,en:`one wallet in every city`},h={zh:`↑ ↓ 選擇目的地`,en:`↑ ↓ destination`},g=e=>(e.tz??0)*60,_=`"Avenir Next Condensed","Bahnschrift","DIN Condensed","Roboto Condensed","Arial Narrow",sans-serif`,v=`"SF Mono","Menlo","Consolas","DejaVu Sans Mono",monospace`,y=`
.trb-root.hsr .trb-head{border-bottom-color:#f26a21}.trb-root.hsr .trb-head .ic{background:#f26a21;color:#fff;font-size:17px}
.trb-root.hsr .bp-plane:after{content:'▶';color:#f26a21}.trb-root.hsr .bp-top{background:#f26a21}
.hst-wrap{width:min(700px,92vw);display:flex;flex-direction:column;align-items:center}
.hst-slot{position:relative;z-index:1;width:104%;height:30px;border-radius:9px;background:linear-gradient(180deg,#3a3e45,#24272c);box-shadow:inset 0 -2px 0 #0007,0 6px 14px #0006;
  display:flex;justify-content:center;padding-top:4px;box-sizing:border-box;font:800 10px ${e};letter-spacing:.3em;color:#aeb2b8}
.hst-slot:after{content:'';position:absolute;left:4%;right:4%;bottom:6px;height:3px;border-radius:2px;background:#07080a}
.hst-clip{width:100%;overflow:hidden;padding:0 10px 20px;margin-top:-6px}
.hst{position:relative;border-radius:7px;overflow:hidden;background:#fdfdfb;color:#1b1c1f;box-shadow:0 14px 30px rgba(0,0,0,.5);font-family:${e};
  animation:hst-issue .9s cubic-bezier(.25,.8,.3,1) both}
@keyframes hst-issue{from{transform:translateY(-104%)}62%{transform:translateY(2%)}to{transform:none}}
.hst:before{content:'';position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,#0000 0 3px,#00000005 3px 4px)}
.hst-hd{display:flex;align-items:baseline;gap:.7em;padding:9px 16px 0;font-size:11px;color:#5d6066;letter-spacing:.08em}
.hst-hd b{font-size:15px;font-weight:900;color:#f26a21;letter-spacing:.14em}
.hst-hd span{font:800 10px ${_};letter-spacing:.24em;color:#f26a21}
.hst-hd em{font-style:normal;margin-left:auto}.hst-hd em+em{margin-left:0;padding:1px 7px;border:1px solid #c9cbcf;border-radius:3px;font-weight:800;color:#1b1c1f}
.hst-main{display:flex;align-items:center;gap:16px;padding:8px 16px 12px}
.hst-qr{width:88px;height:88px;flex:none;padding:5px;background:#fff;border:1px solid #e1e2e4;border-radius:4px}
.hst-route{flex:1;min-width:0;display:flex;align-items:center;justify-content:center;gap:10px}
.hst-st{text-align:center;min-width:0}
.hst-st b{display:block;font-size:40px;font-weight:900;line-height:1.05;letter-spacing:.06em}
.hst-st small{display:block;font:700 12px ${_};letter-spacing:.16em;color:#62656b;text-transform:uppercase}
.hst-st i{display:block;font:800 25px ${v};font-style:normal;margin-top:4px;letter-spacing:.02em}
.hst-st i small{display:inline;font:700 10px ${e};letter-spacing:.04em;margin-right:.3em}
.hst-arw{flex:none;color:#f26a21;font-size:20px;letter-spacing:-.18em;padding-bottom:30px}
.hst-seat{flex:none;display:flex;flex-direction:column;gap:5px;padding-left:14px;border-left:1px dashed #c9cbcf}
.hst-seat div{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:10.5px;color:#62656b;white-space:nowrap}
.hst-seat b{font:900 24px ${v};color:#1b1c1f;letter-spacing:.02em}
.hst-low{display:grid;grid-template-columns:auto auto auto 1fr;align-items:end;gap:6px 18px;padding:9px 16px 10px;background:#fbe4d3;border-top:3px solid #f26a21}
.hst-low div{font-size:10.5px;color:#7a5b48;white-space:nowrap}
.hst-low b{display:block;font:900 16px ${e};color:#1b1c1f;margin-top:1px}
.hst-low b.m{font-family:${v}}
.hst-low s{font:700 12px ${v};color:#9a7f6e;margin-right:.4em}
.hst-low .free{color:#d4541a}
.hst-low .note{text-align:right;line-height:1.45}
.hst-low code{font:700 11px ${v};color:#4b3a30;letter-spacing:.06em}
@media (max-width:820px),(max-height:560px){
  .hst-wrap{width:min(640px,94vw)} .hst-qr{width:62px;height:62px;padding:3px} .hst-st b{font-size:28px} .hst-st i{font-size:19px}
  .hst-seat b{font-size:18px} .hst-main{gap:10px;padding:5px 12px 8px} .hst-hd{padding:7px 12px 0}
  .hst-low{grid-template-columns:auto auto auto;padding:6px 12px 7px} .hst-low .note{display:none} .hst-low b{font-size:14px}
}
@media (max-width:480px){.hst-qr{display:none}.hst-st b{font-size:24px}}
@media (prefers-reduced-motion:reduce){.hst{animation:none}}
`,b=`
.trb-dests{display:flex;gap:6px;margin:0 0 8px}.trb-dests button{appearance:none;flex:1;border:1px solid #ffffff2a;background:#ffffff0d;color:#e8e8e2;border-radius:8px;
padding:6px 8px;font:800 14px inherit;font-family:inherit;cursor:pointer}.trb-dests button.on{background:#f5c400;color:#14161b;border-color:#f5c400}
.trb-dests small{display:block;font-size:10px;font-weight:700;opacity:.75;letter-spacing:.08em}.trb-row.alt{cursor:pointer;color:#ffd23a;opacity:.75}.trb-row.alt:hover{opacity:1}
`,x=!1;function S(){if(x)return;x=!0;let t=document.createElement(`style`);t.id=`trav-board-css`;let n=`"Avenir Next Condensed","Bahnschrift","DIN Condensed","Roboto Condensed","Arial Narrow",sans-serif`,r=`"SF Mono","Menlo","Consolas","DejaVu Sans Mono",monospace`;t.textContent=`
.trb-root{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;font-family:${e};color:#f2f2ee;
  -webkit-user-select:none;user-select:none;touch-action:manipulation;animation:trb-in .26s cubic-bezier(.2,.8,.2,1)}
.trb-root.out{animation:trb-out .2s ease-in forwards}
@keyframes trb-in{from{opacity:0}to{opacity:1}} @keyframes trb-out{to{opacity:0}}
.trb-back{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(8,12,20,.6),rgba(3,4,8,.9));-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.trb-panel{position:relative;width:min(1120px,96vw);max-height:94vh;max-height:94dvh;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#101318;
  box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.07);animation:trb-pop .3s cubic-bezier(.2,.9,.25,1.1)}
@keyframes trb-pop{from{transform:translateY(16px) scale(.975)}to{transform:none}}
.trb-head{display:flex;align-items:center;gap:16px;padding:12px 18px;background:#1a1e25;border-bottom:3px solid #f5c400}
.trb-head .ic{width:34px;height:34px;flex:none;border-radius:8px;background:#f5c400;color:#14161b;display:grid;place-items:center;font-size:20px;font-weight:900}
.trb-title{font-weight:900;font-size:20px;letter-spacing:.08em}
.trb-sub{font:700 11px ${n};letter-spacing:.2em;opacity:.65;text-transform:uppercase}
.trb-clock{margin-left:auto;text-align:right;font:800 26px ${r};color:#f5c400;letter-spacing:.04em}
.trb-clock small{display:block;font:600 11px ${e};color:#c8c8c0;letter-spacing:.06em}
.trb-close{appearance:none;border:0;background:#ffffff14;color:#fff;width:36px;height:36px;border-radius:50%;font-size:19px;cursor:pointer;flex:none}
.trb-body{display:flex;min-height:0;flex:1}
.trb-fids{flex:1.35;min-width:0;padding:10px 12px 12px;background:#0b0d11;overflow:auto}
.trb-row{display:grid;grid-template-columns:4.2em 5.6em 1fr 3.4em 7.4em;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;font:700 15px ${r};color:#ffd23a;letter-spacing:.04em}
.trb-row.h{font:700 11px ${e};color:#8d8f94;letter-spacing:.12em;padding-top:2px;padding-bottom:6px;border-bottom:1px solid #22262d;border-radius:0}
.trb-row .to{font:800 16px ${e};color:#f2f2ee;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.trb-row .to small{font:700 11px ${n};color:#9a9ca2;letter-spacing:.12em;margin-left:.6em}
.trb-row .rm{font:800 12px ${e};letter-spacing:.06em;color:#9a9ca2}
.trb-row .rm.go{color:#5fe08f}
.trb-row .al{display:block;font:700 10px ${n};letter-spacing:.14em;color:#8d8f94}
.trb-row.other{opacity:.62}
.trb-row.sel{background:linear-gradient(90deg,rgba(245,196,0,.16),rgba(245,196,0,.05));box-shadow:inset 3px 0 0 #f5c400;cursor:pointer}
.trb-card{width:360px;flex:none;padding:16px 18px 14px;display:flex;flex-direction:column;gap:9px;background:#14171d;border-left:1px solid #22262d}
.trb-lab{font:800 11px ${n};letter-spacing:.22em;color:#8d8f94;text-transform:uppercase}
.trb-dest{font-weight:900;font-size:34px;line-height:1.02;letter-spacing:.04em}
.trb-dest small{display:block;font:700 14px ${n};letter-spacing:.18em;color:#a9abb1;margin-top:3px}
.trb-times{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.trb-times div{background:#1b1f26;border-radius:8px;padding:7px 9px;font-size:11px;color:#9a9ca2}
.trb-times b{display:block;font:800 21px ${r};color:#f2f2ee;margin-top:2px}
.trb-fare{display:flex;align-items:baseline;justify-content:space-between;font-size:13px;color:#b9bbc0}
.trb-fare b{font:800 19px ${r};color:#f2f2ee}
.trb-fare s{color:#7a7c82;margin-right:.5em;font-family:${r}}
.trb-fare .promo{color:#5fe08f;font-weight:900}
.trb-xch{background:#1b1f26;border-radius:9px;padding:9px 10px;font-size:12.5px;line-height:1.55;color:#b9bbc0}
.trb-xch b{color:#f2f2ee;font-family:${r};font-size:15px}
.trb-xch .arrow{color:#f5c400;margin:0 .35em}
.trb-xch .dim{color:#7e8086}
.trb-warn{min-height:18px;font-size:13px;font-weight:800;color:#ff6b6b;text-align:center}
.trb-go{appearance:none;border:0;margin-top:auto;padding:13px 12px;border-radius:11px;cursor:pointer;color:#14161b;font-weight:900;font-size:19px;letter-spacing:.1em;
  background:linear-gradient(180deg,#ffd52e,#f0b400);box-shadow:0 6px 18px rgba(245,196,0,.3);display:flex;align-items:center;justify-content:center;gap:10px}
.trb-go:disabled{background:#3a3d44;color:#8d8f94;box-shadow:none;cursor:default}
.trb-go kbd,.trb-sec kbd{font:800 11px ${n};background:#0000001f;border-radius:5px;padding:2px 6px}
@media (pointer:coarse){.trb-go kbd{display:none}}
.trb-sec{appearance:none;border:1px solid #343841;background:transparent;color:#c9cbd0;border-radius:10px;padding:9px;font:800 14px ${e};cursor:pointer}
.trb-foot{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;padding:7px 12px;background:#0b0d11;font-size:12px;color:#7e8086;border-top:1px solid #1d2128}
/* the boarding pass */
.trb-pass{display:none;padding:22px 22px 18px;flex-direction:column;align-items:center;gap:16px;background:#101318}
.trb-root.pass .trb-body,.trb-root.pass .trb-foot{display:none}
.trb-root.pass .trb-pass{display:flex}
.bp{position:relative;width:min(760px,90vw);display:flex;border-radius:14px;overflow:hidden;background:#fbfaf6;color:#17191d;box-shadow:0 18px 50px rgba(0,0,0,.5);animation:bp-print .55s cubic-bezier(.2,.9,.25,1)}
@keyframes bp-print{from{transform:translateY(-30px);clip-path:inset(0 0 100% 0)}to{transform:none;clip-path:inset(0 0 0 0)}}
.bp-main{flex:1;min-width:0;padding:14px 18px 12px}
.bp-top{display:flex;align-items:center;gap:10px;margin:-14px -18px 10px;padding:9px 18px;background:#c8102e;color:#fff}
.bp-top b{font-weight:900;letter-spacing:.12em;font-size:15px}
.bp-top span{margin-left:auto;font:800 12px ${n};letter-spacing:.24em}
.bp-route{display:flex;align-items:center;gap:14px;margin:4px 0 8px}
.bp-code{font:900 44px ${n};letter-spacing:.02em;line-height:1}
.bp-city{font-size:13px;font-weight:800;color:#555}
.bp-plane{flex:1;height:2px;background:repeating-linear-gradient(90deg,#bbb 0 6px,transparent 6px 11px);position:relative}
.bp-plane:after{content:'✈';position:absolute;left:50%;top:50%;transform:translate(-50%,-56%);font-size:22px;color:#c8102e;background:#fbfaf6;padding:0 6px}
.bp-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 12px}
.bp-grid div{font-size:10.5px;color:#777;letter-spacing:.06em}
.bp-grid b{display:block;font:800 17px ${r};color:#17191d;letter-spacing:.02em;margin-top:1px}
.bp-stub{width:178px;flex:none;padding:12px 14px;border-left:2px dashed #c9c6bc;display:flex;flex-direction:column;gap:6px;background:#f3f1ea}
.bp-stub div{font-size:10px;color:#777}
.bp-stub b{display:block;font:800 15px ${r};color:#17191d}
.bp-bar{margin-top:auto;height:38px;background:repeating-linear-gradient(90deg,#17191d 0 2px,transparent 2px 4px,#17191d 4px 5px,transparent 5px 8px,#17191d 8px 11px,transparent 11px 12px)}
.trb-acts{display:flex;gap:10px;width:min(760px,90vw)}
.trb-acts .trb-go{flex:1;margin:0}
.trb-acts .trb-sec{width:9em}
@media (max-width:820px),(max-height:560px){
  .trb-panel{position:absolute;inset:0;width:auto;max-height:none;border-radius:0}
  .trb-head{padding:max(6px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) 6px max(10px,env(safe-area-inset-left));gap:10px}
  .trb-sub,.trb-foot{display:none}
  .trb-title{font-size:16px} .trb-clock{font-size:19px}
  .trb-fids{display:none}
  .trb-card{width:auto;flex:1;border-left:0;padding:8px max(14px,env(safe-area-inset-right)) 0 max(14px,env(safe-area-inset-left));overflow:auto;gap:6px}
  .trb-dest{font-size:22px;display:flex;align-items:baseline;gap:.6em}
  .trb-dest small{margin-top:0;font-size:12px}
  .trb-times b{font-size:16px}
  .trb-times div{padding:5px 8px}
    .trb-xch{padding:6px 9px;line-height:1.4}
  .trb-warn{min-height:0}
  /* the check-in button stays on screen: pinned to the bottom of the scrolling card */
  .trb-card .trb-go{position:sticky;bottom:0;margin-top:auto;padding:10px;font-size:17px;box-shadow:0 -8px 14px #14171d}
  .trb-card .trb-sec{display:none}
  .bp-code{font-size:32px} .bp-stub{display:none}
  .trb-pass{padding:10px;overflow:auto}
}
`,t.textContent+=y,t.textContent+=b,document.head.appendChild(t)}var C=e=>e.replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]??e);function w(e,l,_,v,y=0){let b=e=>(l===`ja`||A.pageText)&&v?v(e):l===`en`?e.en:e.zh,x=e=>l===`zh`||l===`ja`?e.en:A.enOnly?``:e.zh,S=l!==`en`,w=s[e.to],T=s[e.from],E=r(e.route),D=E===`hsr`,O=D?{...d,...f}:d,k=c(e.route),j=i(e.to,E),M=u(e.dep.min),N=u(e.dep.min+e.route.hours*60+g(e)),P=!e.promo&&e.wallet<e.fare,F=e.blocked??(P?O.short:null),I=[`<div class="trb-row h"><span>${b(O.time)}</span><span>${b(O.flight)}</span><span>${b(O.dest)}</span><span>${b(O.gate)}</span><span>${b(O.remark)}</span></div>`],L=e.others.map(e=>({time:e.time,html:`<div class="trb-row other"><span>${u(e.time)}</span><span>${C(e.flight)}<span class="al">${C(b(e.airline))}</span></span><span class="to">${C(b(e.to))}<small>${C(x(e.to))}</small></span><span>${C(e.gate)}</span><span class="rm">${C(b(e.remark))}</span></div>`}));L.push({time:e.dep.min+(e.dep.nextDay?1440:0),html:`<div class="trb-row sel" data-act="go"><span>${M}</span><span>${C(e.dep.flight)}<span class="al">${C(S?k.zh:k.en)}</span></span><span class="to">${C(b(w.name))}<small>${C(x(w.name))} ${j.code}</small></span><span>${C(e.route.gate)}</span><span class="rm go">${C(b(e.dep.nextDay?O.tomorrow:O.checkin))}</span></div>`}),(e.__all??[]).forEach((t,n)=>{if(t===e)return;let a=i(t.to,r(t.route));L.push({time:t.dep.min+(t.dep.nextDay?1440:0),html:`<div class="trb-row alt" data-pick="${n}"><span>${u(t.dep.min)}</span><span>${C(t.dep.flight)}<span class="al">${C(S?k.zh:k.en)}</span></span><span class="to">${C(b(s[t.to].name))}<small>${C(x(s[t.to].name))} ${a.code}</small></span><span>${C(t.route.gate)}</span><span class="rm go">${C(b(t.dep.nextDay?O.tomorrow:O.checkin))}</span></div>`})}),L.sort((e,t)=>e.time-t.time);for(let e of L)I.push(e.html);let R=e.destWallet===null?``:`<div>${C(b(O.there))}${C(b(w.name))} <b>${o(e.destWallet,_.toC)}</b></div>`,z=!n(`paris`)&&(e.to===`paris`||e.from===`paris`)?C(b({zh:`不與其他城市互通`,en:`no exchange`,ja:`両替なし`})):a[T.currency].code===a[w.currency].code?C(b(p)):`${C(b(O.rate))} ${t(T.currency,w.currency)}`,B=(e.__all?.length??0)>1?`<div class="trb-dests">${e.__all.map((e,t)=>`<button type="button" data-pick="${t}" class="${t===y?`on`:``}">${C(b(s[e.to].name))}<small>${i(e.to,r(e.route)).code}</small></button>`).join(``)}</div>`:``;return`
      <div class="trb-head"><div class="ic">${D?`高`:`✈`}</div><div><div class="trb-title">${C(b(O.departures))}</div><div class="trb-sub">${C(b(e.counter))}</div></div>
        <div class="trb-clock">${u(e.hour*60)}<small>${C(b(T.name))}</small></div><button class="trb-close" type="button" data-act="cancel">✕</button></div>
      <div class="trb-body">
        <div class="trb-fids">${I.join(``)}</div>
        <div class="trb-card">${B}
          <div class="trb-lab">${C(e.dep.flight)} · ${C(S?k.zh:k.en)}</div>
          <div class="trb-dest">${C(b(w.name))}<small>${C(x(w.name))} · ${C(b(j.name))} ${j.code}</small></div>
          <div class="trb-times"><div>${C(b(O.leaves))}${e.dep.nextDay?` · ${C(b(O.tomorrow))}`:``}<b>${M}</b></div><div>${C(b(O.arrive))} (${C(b(w.name))})<b>${N}</b></div></div>
          <div class="trb-fare"><span>${C(b(O.fare))}</span>${e.promo?`<span><s>${o(e.route.fare,_.fromC)}</s><span class="promo">${C(b(O.free))}</span></span>`:`<b>${o(e.fare,_.fromC)}</b>`}</div>
          <div class="trb-xch trb-wallet">${C(b(O.wallet))} <b>${o(e.wallet,_.fromC)}</b><span class="arrow">→</span><b>${o(_.left,_.fromC)}</b> <span class="dim">${C(b(O.after))}</span>
            ${R}<div class="dim">${C(b(!n(`paris`)&&(e.to===`paris`||e.from===`paris`)?{zh:`巴黎有自己的歐元錢包`,en:`Paris keeps its own euro wallet`,ja:`パリのユーロは別の財布`}:m))} · ${z}</div>${e.firstVisit?`<div class="dim">${C(b(O.firstVisit))}</div>`:``}</div>
          <div class="trb-warn">${F?C(b(F)):``}</div>
          <button class="trb-go" type="button" data-act="go" ${F?`disabled`:``}>${C(b(O.checkIn))} ▸ <kbd>Enter</kbd></button>
          <button class="trb-sec" type="button" data-act="cancel">${C(b(O.leave))}</button>
        </div>
      </div>
      <div class="trb-pass"></div>
      <div class="trb-foot">${(e.__all?.length??0)>1?`${C(b(O.hint))} · ${C(b(h))}`:C(b(O.hint))}</div>`}function T(e){let t=2166136261;for(let n=0;n<e.length;n++)t=Math.imul(t^e.charCodeAt(n),16777619);let n=()=>((t=Math.imul(t^t>>>15,2246822507)^Math.imul(t^t>>>13,3266489909))>>>0)/4294967296,r=(e,t)=>{for(let[n,r]of[[0,0],[18,0],[0,18]]){let i=e-n,a=t-r;if(i>=-1&&i<=7&&a>=-1&&a<=7)return i<0||a<0||i>6||a>6||Math.max(Math.abs(i-3),Math.abs(a-3))===2?0:1}return-1},i=``;for(let e=0;e<25;e++)for(let t=0;t<25;t++){let a=r(t,e);(a>=0?a===1:t===6||e===6?(t+e)%2==0:n()<.5)&&(i+=`M${t} ${e}h1v1h-1z`)}return i}var E=e=>({zh:e.zh.replace(/^高鐵/,``).replace(/站$/,``),en:e.en.replace(/^HSR\s+/,``).replace(/\s+Station$/,``)});function D(e){let t=0;for(let n=0;n<e.length;n++)t=t*31+e.charCodeAt(n)>>>0;return[3,4,5,7,8,9,10][t%7]}function O(e,t,n,r,a){let c=t!==`en`,l=E(i(e.from,`hsr`).name),d=E(i(e.to,`hsr`).name),f=e.dep.flight.replace(/^\D+\s*/,``),p=new Date;e.dep.nextDay&&p.setDate(p.getDate()+1);let m=`${p.getFullYear()}/${String(p.getMonth()+1).padStart(2,`0`)}/${String(p.getDate()).padStart(2,`0`)}`,h=D(n),g=`${String(h).padStart(2,`0`)}-${f.slice(-2)}-${n.replace(/\D/g,``).padStart(2,`0`)}-${m.replace(/\//g,``).slice(2)}`,_=e=>c?e.zh:e.en,v=e=>c?e.en:e.zh,y=e.promo?`<b class="m"><s>${o(e.route.fare,s[e.from].currency)}</s><span class="free">${c?`免費`:`FREE`}</span></b>`:`<b class="m">${o(e.fare,s[e.from].currency)}</b>`;return`
      <div class="hst-wrap">
        <div class="hst-slot">取票口 · TICKETS</div>
        <div class="hst-clip"><div class="hst">
          <div class="hst-hd"><b>高鐵</b><span>HIGH SPEED RAIL</span><em>${m}</em><em>${c?`全票 · 對號座`:`Adult · Reserved`}</em></div>
          <div class="hst-main">
            <svg class="hst-qr" viewBox="0 0 25 25" shape-rendering="crispEdges" aria-hidden="true"><path d="${T(`${e.dep.flight}|${n}|${m}`)}" fill="#111"/></svg>
            <div class="hst-route">
              <div class="hst-st"><b>${C(_(l))}</b><small>${C(v(l))}</small><i><small>${c?`發車`:`DEP`}</small>${u(e.dep.min)}</i></div>
              <div class="hst-arw">▶▶▶</div>
              <div class="hst-st"><b>${C(_(d))}</b><small>${C(v(d))}</small><i><small>${c?`到達`:`ARR`}</small>${u(e.dep.min+e.route.hours*60)}</i></div>
            </div>
            <div class="hst-seat">
              <div>車次 Train<b>${C(f)}</b></div>
              <div>車廂 Car<b>${h}</b></div>
              <div>座位 Seat<b>${C(n)}</b></div>
            </div>
          </div>
          <div class="hst-low">
            <div>票價 Fare${y}</div>
            <div>車廂 Class<b>${c?`標準車廂`:`Standard`}</b></div>
            <div>旅客 Passenger<b>${C(_(e.passenger.name))}</b></div>
            <div class="note">限當日當次有效 · Valid on this train only<br><code>${g}</code></div>
          </div>
        </div></div>
      </div>
      <div class="trb-acts"><button class="trb-sec" type="button" data-act="back">${C(r)}</button><button class="trb-go" type="button" data-act="board">${C(a)} ▶ <kbd>Enter</kbd></button></div>`}function k(e,t,n,a){let o=e=>(t===`ja`||A.pageText)&&a?a(e):t===`en`?e.en:e.zh,l=t!==`en`,p=s[e.from],m=s[e.to],h=r(e.route),_=h===`hsr`;if(_)return O(e,t===`ja`?`zh`:t,n,o(d.back),o(f.board??d.board));let v=_?{...d,...f}:d,y=c(e.route),b=i(e.from,h),x=i(e.to,h),S=u(e.dep.min-(_?10:25));return`
      <div class="bp">
        <div class="bp-main">
          <div class="bp-top"><b>${l?y.zh:y.en}</b>${l?` <small style="opacity:.85">${y.en}</small>`:``}<span>${C(o(v.boarding))}</span></div>
          <div class="bp-route"><div><div class="bp-code">${b.code}</div><div class="bp-city">${C(o(p.name))}</div></div><div class="bp-plane"></div>
            <div style="text-align:right"><div class="bp-code">${x.code}</div><div class="bp-city">${C(o(m.name))}</div></div></div>
          <div class="bp-grid">
            <div>${C(o(v.passenger))}<b>${C(o(e.passenger.name))}</b></div>
            <div>${C(o(v.flight))}<b>${C(e.dep.flight)}</b></div>
            <div>${C(o(v.gate))}<b>${C(e.route.gate)}</b></div>
            <div>${C(o(v.seat))}<b>${n}</b></div>
            <div>${C(o(v.boardTime))}<b>${S}</b></div>
            <div>${C(o(v.leaves))}<b>${u(e.dep.min)}</b></div>
            <div>${C(o(v.arrive))}<b>${u(e.dep.min+e.route.hours*60+g(e))}</b></div>
            <div>${C(o(v.economy))}<b>${_?`7`:`Y`}</b></div>
          </div>
        </div>
        <div class="bp-stub"><div>${C(o(v.flight))}<b>${C(e.dep.flight)}</b></div><div>${C(o(v.seat))}<b>${n}</b></div><div>${b.code} → ${x.code}</div><div class="bp-bar"></div></div>
      </div>
      <div class="trb-acts"><button class="trb-sec" type="button" data-act="back">${C(o(v.back))}</button><button class="trb-go" type="button" data-act="board">${C(o(v.board))} ${_?`▶`:`✈`} <kbd>Enter</kbd></button></div>`}var A=class e{host;root=null;data=null;stage=`board`;resolve=null;keyH=e=>this.onKey(e);seat=`23A`;armedAt=0;constructor(e){this.host=e}get isOpen(){return!!this.root}t(t){return this.host.lang()===`ja`&&this.host.t||e.pageText&&this.host.t?this.host.t(t):this.host.lang()===`en`?t.en:t.zh}alt(t){return this.host.lang()===`ja`||e.enOnly&&this.host.lang()===`en`?``:this.host.lang()===`en`?t.zh:t.en}open(e){S(),this.close(!0),this.data=e;{this.base=e,this.pick=0;let t=[e,...e.alts??[]];for(let e of t)e.__all=t;let n=t.findIndex(e=>e.to===`tokyo`);n>0&&(this.pick=n,this.data=t[n])}this.stage=`board`,this.armedAt=performance.now()+350,this.seat=`${18+Math.floor(Math.random()*14)}${[`A`,`F`,`A`,`K`][Math.floor(Math.random()*4)]}`,r(e.route)===`hsr`&&(this.seat=`${1+Math.floor(Math.random()*17)}${[`A`,`E`,`A`,`E`,`B`,`C`,`D`][Math.floor(Math.random()*7)]}`);let t=document.createElement(`div`);return t.className=`trb-root`,t.innerHTML=`<div class="trb-back"></div><div class="trb-panel"></div>`,document.body.appendChild(t),this.root=t,t.querySelector(`.trb-back`).addEventListener(`click`,()=>this.cancel()),window.addEventListener(`keydown`,this.keyH,!0),this.render(),new Promise(e=>this.resolve=e)}amounts(){let e=this.data,t=s[e.from].currency,n=s[e.to].currency;return{left:Math.max(0,e.wallet-e.fare),fromC:t,toC:n}}render(){let e=this.root,t=this.data;if(!e||!t)return;let n=e.querySelector(`.trb-panel`),i=this.host.lang(),a=i!==`en`,c=s[t.to];s[t.from];let f=this.amounts(),p=u(t.dep.min);u(t.dep.min+t.route.hours*60);let m=!t.promo&&t.wallet<t.fare;t.blocked??(m&&d.short);let h=[];h.push(`<div class="trb-row h"><span>${this.t(d.time)}</span><span>${this.t(d.flight)}</span><span>${this.t(d.dest)}</span><span>${this.t(d.gate)}</span><span>${this.t(d.remark)}</span></div>`);let g=t.others.map(e=>({time:e.time,html:`<div class="trb-row other"><span>${u(e.time)}</span><span>${C(e.flight)}<span class="al">${C(this.t(e.airline))}</span></span><span class="to">${C(this.t(e.to))}<small>${C(this.alt(e.to))}</small></span><span>${C(e.gate)}</span><span class="rm">${C(this.t(e.remark))}</span></div>`}));g.push({time:t.dep.min+(t.dep.nextDay?1440:0),html:`<div class="trb-row sel" data-act="go"><span>${p}</span><span>${C(t.dep.flight)}<span class="al">${C(a?l.zh:l.en)}</span></span><span class="to">${C(this.t(c.name))}<small>${C(this.alt(c.name))} ${c.airport.code}</small></span><span>${C(t.route.gate)}</span><span class="rm go">${C(this.t(t.dep.nextDay?d.tomorrow:d.checkin))}</span></div>`}),g.sort((e,t)=>e.time-t.time);for(let e of g)h.push(e.html);t.destWallet===null||`${C(this.t(d.there))}${C(this.t(c.name))}${o(t.destWallet,f.toC)}`,e.classList.toggle(`hsr`,r(t.route)===`hsr`),n.innerHTML=w(t,i,f,this.host.t,this.pick??0),n.querySelectorAll(`[data-act]`).forEach(e=>e.addEventListener(`click`,t=>{t.stopPropagation(),e.dataset.act===`cancel`?this.cancel():this.confirm()})),n.querySelectorAll(`[data-pick]`).forEach(e=>e.addEventListener(`click`,t=>{t.stopPropagation(),M(this,Number(e.dataset.pick)||0)})),this.stage===`pass`&&this.renderPass()}renderPass(){let e=this.root,t=this.data;if(!e||!t)return;e.classList.add(`pass`);let n=e.querySelector(`.trb-pass`);s[t.from],s[t.to],this.host.lang(),u(t.dep.min-25),n.innerHTML=k(t,this.host.lang(),this.seat,this.host.t),n.querySelector(`[data-act="back"]`).addEventListener(`click`,e=>{e.stopPropagation(),this.back()}),n.querySelector(`[data-act="board"]`).addEventListener(`click`,e=>{e.stopPropagation(),this.confirm()})}nav(e){Math.abs(e)===2&&j(this,e/2)}confirm(){let e=this.data;if(e&&this.root){if(this.stage===`board`){let t=!e.promo&&e.wallet<e.fare;if(e.blocked||t){this.host.sfx(`ui_back`);return}this.host.sfx(`ui_confirm`),this.stage=`pass`,this.renderPass();return}this.host.sfx(`ui_confirm`),this.finish(this.pick?{ok:!0,seat:this.seat,pick:this.pick}:{ok:!0,seat:this.seat})}}back(){if(this.stage===`pass`){this.stage=`board`,this.root?.classList.remove(`pass`),this.host.sfx(`ui_back`);return}this.cancel()}cancel(){if(this.root){if(this.stage===`pass`)return this.back();this.host.sfx(`ui_back`),this.finish({ok:!1})}}onKey(e){if(!this.root)return;let t=e.code,n=t===`Enter`||t===`NumpadEnter`||t===`KeyE`||t===`Space`;if(n&&(e.repeat||performance.now()<this.armedAt)){e.preventDefault(),e.stopPropagation();return}let r=!0;t===`ArrowLeft`||t===`KeyA`?this.nav(-1):t===`ArrowRight`||t===`KeyD`?this.nav(1):t===`ArrowUp`||t===`KeyW`?j(this,-1):t===`ArrowDown`||t===`KeyS`?j(this,1):n?(this.armedAt=performance.now()+250,this.confirm()):t===`Escape`||t===`Backspace`?this.back():r=!1,r&&(e.preventDefault(),e.stopPropagation())}finish(e){let t=this.resolve;this.resolve=null,this.close(),t?.(e)}close(e=!1){window.removeEventListener(`keydown`,this.keyH,!0);let t=this.root;this.root=null,t&&(e?t.remove():(t.classList.add(`out`),setTimeout(()=>t.remove(),220)))}};function j(e,t){if(e.stage!==`board`)return;let n=e.base?.__all?.length??1;n>1&&M(e,((e.pick??0)+(t<0?n-1:1))%n)}function M(e,t){let n=e.base?.__all;n&&n[t]&&e.stage===`board`&&t!==(e.pick??0)&&(e.pick=t,e.data=n[t],e.host.sfx(`ui_hover`),e.render())}export{A as DepartureBoard};
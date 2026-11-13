import{r as e,t}from"./partnerRules-Dhf9ptkQ.js";/* empty css                */import{flipTo as n,pagerHtml as r}from"./pages-BRuvJSKD.js";var i=new URL("./partner-outside-hoFEEaA1.jpg",import.meta.url).href,a=new URL("./partner-inside-W3IO0SMZ.jpg",import.meta.url).href,o=e=>e.replace(/[&<>"']/g,e=>`&${{"&":`amp`,"<":`lt`,">":`gt`,'"':`quot`,"'":`#39`}[e]};`),s=`<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,c=`<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2.5h5.5V8M9.2 2.8L2.5 9.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,l=`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8.5L10 3l7 5.5V17H3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 17v-4.5h4V17" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,u=`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2.5 6h15v2.5a1.5 1.5 0 000 3V14h-15v-2.5a1.5 1.5 0 000-3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M12.5 6.5v7" stroke="currentColor" stroke-width="1.3" stroke-dasharray="1.4 1.6"/></svg>`,d=`<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7.5l1.2-3.5h11.6L17 7.5M3 7.5h14M3 7.5a2.3 2.3 0 004.7 0 2.3 2.3 0 004.6 0 2.3 2.3 0 004.7 0M4.5 10v7h11v-7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.5 17v-3.5h3V17" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,f=`<svg class="pt-arr" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M7 3l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;function p(){return!!document.querySelector(`.ct-ui`)}function m(m,h){if(p())return Promise.resolve();let g=m.t({zh:`zh`,en:`en`})!==`en`,_=e=>g?e.zh:e.en,v=(e,t)=>o(g?e:t),y=(()=>{try{return window.matchMedia(`(pointer: coarse)`).matches}catch{return!1}})(),b=e=>{try{m.audio.play(e,{ui:!0,volume:.55})}catch{}},x=m.input.enabled;m.input.enabled=!1;try{m.input.unlockPointer()}catch{}let S=_(t.plays),C=[[`填寫表單`,`Fill in the form`,`留下品牌、店址與聯絡方式，告訴我們你想在遊戲裡辦什麼活動。`,`Your brand, address and contact — and the event you’d run in the game.`],[`團隊評選`,`We pick`,`團隊會從表單中選出最有趣的品牌活動，並主動聯絡你。`,`The team picks the most interesting brand events and gets in touch.`],[`免費蓋店`,`We build it, free`,`我們把你的店面實際蓋進遊戲地圖，招牌、門面、店內都照你的店做。`,`We build your shop into the map — sign, front and inside, modelled on yours.`],[`玩家上門`,`Players walk in`,`玩家在遊戲裡逛你的店、領兌換券，再到實體門市兌換。`,`Players visit your shop in the game, take a coupon and redeem it at the real one.`]],w=document.createElement(`div`);return w.className=h&&h.n>1?`ct-ui pt-ui paged`:`ct-ui pt-ui`,w.setAttribute(`role`,`dialog`),w.setAttribute(`aria-modal`,`true`),w.setAttribute(`aria-labelledby`,`pt-title`),w.innerHTML=`
    <section class="ct-card">
      <figure class="ct-photo pt-photo">
        <div class="pt-shots">
          <div class="pt-shot"><img src="${i}" alt="${v(`麵屋狂飆的店面：檜木招牌、暖簾、紅燈籠，門口排隊的人`,`Menya Kuangbiao from the street: the hinoki sign, the noren, red lanterns, the queue`)}" decoding="async"><span class="pt-tag">${v(`室外`,`Outside`)}</span></div>
          <div class="pt-shot"><img src="${a}" alt="${v(`麵屋狂飆店內：檜木吧台、木札菜單、紙燈籠和開放廚房`,`Inside: the hinoki counter, wooden menu tags, paper lanterns and the open kitchen`)}" decoding="async"><span class="pt-tag">${v(`室內`,`Inside`)}</span></div>
        </div>
        <div class="pt-ticket" aria-hidden="true">
          <div class="pt-stub">${g?`<span>${[...`兌換券`].map(e=>`<b>${e}</b>`).join(``)}</span>`:`<span class="en">COUPON</span>`}</div>
          <div class="pt-main">
            <p class="pt-from">${v(`臺北狂飆 × 你的店`,`TAIPEI RUSH × YOUR SHOP`)}</p>
            <p class="pt-item">${v(`唐揚雞`,`Karaage`)}<small>${v(` 一份`,` ×1`)}</small></p>
            <p class="pt-use">${v(`遊戲內領取・憑券至實體門市兌換`,`Picked up in game · redeem at the real shop`)}</p>
            <i class="pt-bars"></i>
          </div>
        </div>
        <figcaption class="pt-flow">
          <span class="pt-flow-h">${v(`活動範例`,`Example`)}</span>
          <span class="pt-beats">
            <span>${l}${v(`走進麵屋狂飆`,`Walk in`)}</span>${f}
            <span>${u}${v(`領唐揚雞兌換券`,`Get a coupon`)}</span>${f}
            <span>${d}${v(`到實體店兌換`,`Redeem in store`)}</span>
          </span>
        </figcaption>
      </figure>
      <div class="ct-body">
        <button type="button" class="ct-x" data-act="close" aria-label="${v(`關閉`,`Close`)}">${s}</button>
        ${r(h,g)}
        <div class="ct-a">
        <p class="ct-eyebrow">${v(`臺北狂飆 × ${S}次遊玩回饋`,`Taipei Rush × ${S} plays`)}<span class="pt-pill">${v(`品牌店家招募`,`Brands wanted`)}</span></p>
        <h1 id="pt-title">${v(`想把你的店，`,`Put your shop`)}<br>${v(`放進臺北狂飆嗎？`,`in Taipei Rush.`)}</h1>
        <p class="ct-lede">${v(`為了慶祝 ${S}次遊玩，我們正式邀請臺灣的品牌、實體店家與餐廳加入遊戲城市——把你的店蓋進地圖，讓每一位玩家都能走進去、認識你，再走進你真正的店。`,`To celebrate ${S} plays, we’re inviting Taiwanese brands, shops and restaurants into the city: your shop built on the map, where every player can walk in, get to know you — and then visit you for real.`)}</p>
        </div>
        <div class="ct-b">
        <dl class="ct-facts">
          <div><dt>${v(`遊玩人次`,`Plays`)}</dt><dd>${g?`500`:`5`}<small>${v(` 萬+`,`M+`)}</small></dd></div>
          <div><dt>${v(`建置費用`,`Build cost`)}</dt><dd>${v(`免費`,`Free`)}</dd></div>
          <div><dt>${v(`入選名額`,`Places`)}</dt><dd>${v(`限量`,`Few`)}</dd></div>
        </dl>
        <h2 class="ct-how">${v(`如何參加`,`How it works`)}</h2>
        <ol class="ct-steps">
          ${C.map(([e,t,n,r],i)=>`<li><span class="ct-n">${i+1}</span><div><b>${v(e,t)}</b><span>${v(n,r)}</span></div></li>`).join(``)}
        </ol>
        </div>
        <div class="ct-c">
        <div class="ct-actions">
          <div class="ct-tags pt-link"><code>${o(t.formLabel)}</code><button type="button" class="ct-copy" data-act="copy">${v(`複製連結`,`Copy link`)}</button></div>
          <a class="ct-go pt-go" data-act="form" href="${o(t.formUrl)}" target="_blank" rel="noopener">${v(`填寫合作表單`,`Sign up your shop`)}${c}</a>
        </div>
        <p class="ct-fine">${v(`因開發資源有限，團隊將從表單中挑選有趣的品牌活動，免費把店面蓋進遊戲；成效好的話，會再多蓋幾家。不是老闆？複製連結，傳給你最愛的那間店。`,`Our dev time is limited, so the team picks the most interesting brand events from the form and builds those shops for free — and more if it works. Not an owner? Copy the link and send it to the shop you love.`)}</p>
        </div>
      </div>
    </section>`,document.body.appendChild(w),h?.turned&&w.classList.add(`flip`),requestAnimationFrame(()=>w.classList.add(`in`)),new Promise(t=>{let r=()=>{if(w.removeEventListener(`click`,a),w.classList.remove(`in`),w.classList.add(`out`),m.input.enabled=x||m.input.enabled,!y)try{m.input.lockPointer()}catch{}setTimeout(()=>w.remove(),260),t()},i=e=>{w.removeEventListener(`click`,a),m.input.enabled=x||m.input.enabled,w.remove(),h?.flip(e),t()},a=t=>{let a=t.target.closest(`[data-act]`);if(!a)return;t.stopPropagation();let o=a.dataset.act;if(o===`close`)b(`ui_back`),r();else if((o===`prev`||o===`next`)&&h)b(`ui_confirm`),i(n(h,o));else if(o===`form`)b(`ui_confirm`);else if(o===`copy`){let t=()=>{a.textContent=_({zh:`已複製`,en:`Copied`}),a.classList.add(`ok`)};try{navigator.clipboard.writeText(e(g)).then(t,t)}catch{t()}}};w.addEventListener(`click`,a);let o=w.querySelector(`.ct-card`);o?.setAttribute(`tabindex`,`-1`),o?.focus({preventScroll:!0})})}export{p as partnerOpen,m as showPartner};
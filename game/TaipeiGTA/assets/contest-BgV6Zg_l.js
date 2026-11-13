import{a as e,i as t,n,t as r}from"./contestRules-BkP7wJPE.js";/* empty css                */import{flipTo as i,pagerHtml as a}from"./pages-BRuvJSKD.js";var o=new URL("./contest-books-Cbm9oTlC.jpg",import.meta.url).href,s=e=>e.replace(/[&<>"']/g,e=>`&${{"&":`amp`,"<":`lt`,">":`gt`,'"':`quot`,"'":`#39`}[e]};`),c=``,l=``,u=e=>e.replace(/\u0001/g,`<i class="ct-nb">`).replace(/\u0002/g,`</i>`),d=`<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;function f(){return!!document.querySelector(`.ct-ui`)}function p(p,m,h){if(f())return Promise.resolve();let g=p.t({zh:`zh`,en:`en`})!==`en`,_=e=>g?e.zh:e.en,v=(e,t)=>s(g?e:t),y=(()=>{try{return window.matchMedia(`(pointer: coarse)`).matches}catch{return!1}})(),b=e=>{try{p.audio.play(e,{ui:!0,volume:.55})}catch{}},x=p.input.enabled;p.input.enabled=!1;try{p.input.unlockPointer()}catch{}let S=(Date.parse(p.params.get(`contestnow`)??``)||Date.now())-Date.now(),C=t(Date.now()+S)===`judging`,w=C?[[`投稿已截止`,`Entries closed`,`${r.endDate.zh} 23:59 截止，之後的貼文不列入評選。`,`Entries closed at 23:59 on ${r.endDate.en}; later posts don’t count.`],[`審查中`,`Judging`,`團隊正在逐一看大家的店與 Threads 參賽貼文。`,`The team is looking at every shop and every entry post.`],[`公佈名單`,`Winners announced`,`${r.announceDate.zh}公佈 ${r.winners} 家優勝店家。`,`The ${r.winners} winning shops are announced on ${r.announceDate.en}.`],[`聯絡得獎者`,`Watch your DMs`,`我們會透過 Threads 私訊聯絡得獎玩家，請留意訊息。`,`We’ll contact the winners by Threads DM — keep an eye on your messages.`]]:[[`開一間店`,`Open a shop`,`到康定路「創業街」的店門口，打造只屬於你的店。`,`Go to 創業街 on Kangding Rd and make a shop that is yours alone.`],[`發上 Threads`,`Post on Threads`,`在裝潢模式按「分享」，遊戲網址會自動附上。`,`Tap Share in build mode — the game’s link comes with it.`],[`標記參賽`,`Tag your post`,`標記 ${c}${r.account}${l}，加上 ${c}${r.hashtag}${l}。`,`Tag ${c}${r.account}${l} and add ${c}${r.hashtag}${l}.`],[`等候通知`,`Watch your DMs`,`我們會選出 ${r.winners} 家店，私訊通知優勝者。`,`We pick ${r.winners} shops and DM the winners.`]],T=document.createElement(`div`);T.className=h&&h.n>1?`ct-ui paged`:`ct-ui`,T.setAttribute(`role`,`dialog`),T.setAttribute(`aria-modal`,`true`),T.setAttribute(`aria-labelledby`,`ct-title`),T.innerHTML=`
    <section class="ct-card">
      <figure class="ct-photo">
        <img src="${o}" alt="${v(`島嶼書店：在創業街開的書店`,`Island Books, a bookshop opened on Startup Street`)}" decoding="async">
        <figcaption>${v(`範例・島嶼書店`,`Example · Island Books`)}</figcaption>
      </figure>
      <div class="ct-body">
        <button type="button" class="ct-x" data-act="close" aria-label="${v(`關閉`,`Close`)}">${d}</button>
        ${a(h,g)}
        <div class="ct-a">
        <p class="ct-eyebrow">${v(`臺北狂飆創業競賽`,`Taipei Rush Startup Contest`)}</p>
        ${C?`<h1 id="ct-title">${v(`活動已截止，`,`Entries are closed.`)}<br>${v(`謝謝你的參與！`,`Thank you for taking part!`)}</h1>
        <p class="ct-lede">${v(`投稿已於 ${r.endDate.zh} 23:59 截止。接下來 ${r.judgingDays} 天是審查期，我們會在 ${r.announceDate.zh}公佈 ${r.winners} 家優勝店家，並私訊聯絡得獎玩家。優勝的店會照你的設計蓋進遊戲，展出 ${r.showcaseDays} 天。`,`Entries closed at 23:59 on ${r.endDate.en}. The next ${r.judgingDays} days are for judging: on ${r.announceDate.en} we announce the ${r.winners} winning shops and contact the winners by DM. Their shops go into the game as designed, on show for ${r.showcaseDays} days.`)}</p>
        <p class="ct-when"><span>${v(`審查期 `,`Judging · `)}${s(_(r.judging))}</span><span class="ct-cd"><em class="ct-cdl"></em> <b></b></span></p>`:`<h1 id="ct-title">${v(`開一間你的店，`,`Open your shop.`)}<br>${v(`讓全臺北看見。`,`Let all of Taipei see it.`)}</h1>
        <p class="ct-lede">${v(`為了慶祝 ${r.plays.zh}人次遊玩，我們將選出 ${r.winners} 家最有創意的店，照你的設計真的蓋進遊戲，展出 ${r.showcaseDays} 天，讓每一位玩家都看得到。`,`To celebrate ${r.plays.en} plays, we’ll pick the ${r.winners} most creative shops and build them into the game, just as you designed them — on show to every player for ${r.showcaseDays} days.`)}</p>
        <p class="ct-when"><span>${s(_(r.dates))}</span><span class="ct-cd"><em class="ct-cdl"></em> <b></b></span></p>`}
        </div>
        <div class="ct-b">
        <dl class="ct-facts">
          <div><dt>${v(`優勝店家`,`Winners`)}</dt><dd>${r.winners}<small>${v(` 家`,``)}</small></dd></div>
          ${C?`<div><dt>${v(`審查期`,`Judging`)}</dt><dd>${r.judgingDays}<small>${v(` 天`,` days`)}</small></dd></div>`:`<div><dt>${v(`創作期`,`To build`)}</dt><dd>${r.days}<small>${v(` 天`,` days`)}</small></dd></div>`}
          <div><dt>${v(`全服展出`,`On show`)}</dt><dd>${r.showcaseDays}<small>${v(` 天`,` days`)}</small></dd></div>
        </dl>
        <h2 class="ct-how">${C?v(`接下來`,`What happens next`):v(`如何參加`,`How to enter`)}</h2>
        <ol class="ct-steps">
          ${w.map(([e,t,n,r],i)=>`<li><span class="ct-n">${i+1}</span><div><b>${v(e,t)}</b><span>${u(v(n,r))}</span></div></li>`).join(``)}
        </ol>
        </div>
        <div class="ct-c">
        <div class="ct-actions${C?` solo`:``}">
          ${C?``:`<div class="ct-tags"><code>${s(n)}</code><button type="button" class="ct-copy" data-act="copy">${v(`複製`,`Copy`)}</button></div>`}
          <button type="button" class="ct-go" data-act="go">${v(`前往創業街`,`Go to 創業街`)}</button>
        </div>
        <p class="ct-fine">${C?v(`你的店還在，截止後也能繼續經營。得獎結果由《臺北狂飆》團隊評選，並透過 Threads 私訊通知。`,`Your shop is still yours to run. Winners are chosen by the Taipei Rush team and contacted by Threads DM.`):v(`優勝者由《臺北狂飆》團隊選出，並透過 Threads 私訊通知。`,`Winners are chosen by the Taipei Rush team and contacted by Threads DM.`)}</p>
        </div>
      </div>
    </section>`,document.body.appendChild(T),h?.turned&&T.classList.add(`flip`),requestAnimationFrame(()=>T.classList.add(`in`));let E=T.querySelector(`.ct-cdl`),D=T.querySelector(`.ct-cd b`),O=()=>{let n=Date.now()+S,i=t(n);if(C){let t=n>=r.announceAt,i=_(t?{zh:`今天公佈得獎名單`,en:`Winners announced today`}:{zh:`公佈倒數`,en:`Announced in`});E&&E.textContent!==i&&(E.textContent=i),D&&(D.textContent=t?``:e(r.announceAt-n,g));return}let a=_(i===`soon`?{zh:`開跑倒數`,en:`Starts in`}:{zh:`截止倒數`,en:`Closes in`});E&&E.textContent!==a&&(E.textContent=a),D&&(D.textContent=e((i===`soon`?r.startsAt:r.endsAt)-n,g))};O();let k=window.setInterval(O,1e3);return new Promise(e=>{let t=t=>{if(T.removeEventListener(`click`,a),window.clearInterval(k),T.classList.remove(`in`),T.classList.add(`out`),p.input.enabled=x||p.input.enabled,!y)try{p.input.lockPointer()}catch{}setTimeout(()=>T.remove(),260),t?.(),e()},r=t=>{T.removeEventListener(`click`,a),window.clearInterval(k),p.input.enabled=x||p.input.enabled,T.remove(),h?.flip(t),e()},a=e=>{let a=e.target.closest(`[data-act]`);if(!a)return;e.stopPropagation();let o=a.dataset.act;if(o===`close`)b(`ui_back`),t();else if((o===`prev`||o===`next`)&&h)b(`ui_confirm`),r(i(h,o));else if(o===`go`)b(`ui_confirm`),t(m);else if(o===`copy`){let e=()=>{a.textContent=_({zh:`已複製`,en:`Copied`}),a.classList.add(`ok`)};try{navigator.clipboard.writeText(n).then(e,e)}catch{e()}}};T.addEventListener(`click`,a);let o=T.querySelector(`.ct-card`);o?.setAttribute(`tabindex`,`-1`),o?.focus({preventScroll:!0})})}export{r as CONTEST,n as ENTRY_TAGS,f as contestOpen,p as showContest};
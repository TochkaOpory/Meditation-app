// ======================== СЧЁТЧИК ПРОДАЖ «5 ВРАТ» ========================
const PROMO_LIMIT = 100;
const PROMO_PRICE_RU = '990 ₽';
const PROMO_PRICE_EN = '$11';
const REGULAR_PRICE_RU = '2990 ₽';
const REGULAR_PRICE_EN = '$33';
const WORKER_COUNTER_URL = `${WORKER_URL}/promo-counter`;

let promoSalesCount = 0;
let promoActive = true;

async function loadPromoCounter() {
  try {
    const resp = await fetch(`${WORKER_URL}/promo-counter`);
    if (resp.ok) {
      const d = await resp.json();
      promoSalesCount = d.count || 0;
      promoActive = promoSalesCount < PROMO_LIMIT;
    }
  } catch(e) {
    // Если воркер не поддерживает эндпоинт, читаем из localStorage как fallback
    promoSalesCount = parseInt(localStorage.getItem('promo_sales_count') || '0');
    promoActive = promoSalesCount < PROMO_LIMIT;
  }
  updatePromoPriceUI();
}

function getCurrentAllPrice(lang) {
  if (promoActive) return lang === 'en' ? PROMO_PRICE_EN : PROMO_PRICE_RU;
  return lang === 'en' ? REGULAR_PRICE_EN : REGULAR_PRICE_RU;
}

function getPromoNote(lang) {
  if (promoActive) {
    const left = PROMO_LIMIT - promoSalesCount;
    if (lang === 'en') return `🔥 Special offer for the first 100 users — only ${left} spots left! Price will return to ${REGULAR_PRICE_EN}.`;
    return `🔥 Специальная цена для первых 100 пользователей — осталось ${left} мест! После цена вернётся на ${REGULAR_PRICE_RU}.`;
  } else {
    if (lang === 'en') return `ℹ️ The promotional offer has ended. Regular price ${REGULAR_PRICE_EN}.`;
    return `ℹ️ Акция завершена. Действует стандартная цена ${REGULAR_PRICE_RU}.`;
  }
}

function updatePromoPriceUI() {
  // Обновляем кнопку «Купить все ключи»
  const allPriceSpan = document.getElementById('allPriceSpan');
  if (allPriceSpan) allPriceSpan.innerText = getCurrentAllPrice(currentLang);

  // Обновляем/создаём пояснительную строку под кнопкой
  let noteEl = document.getElementById('promoNote');
  if (!noteEl) {
    noteEl = document.createElement('div');
    noteEl.id = 'promoNote';
    noteEl.style.cssText = 'font-size:12px;color:var(--gold);text-align:center;margin:-6px 0 10px;line-height:1.5;padding:0 4px;';
    const buyAllBtn = document.getElementById('buyAllBtn');
    if (buyAllBtn && buyAllBtn.parentNode) {
      buyAllBtn.parentNode.insertBefore(noteEl, buyAllBtn.nextSibling);
    }
  }
  noteEl.innerText = getPromoNote(currentLang);
}


function stopActiveAudio(){ if(activeAudio){ activeAudio.pause(); activeAudio=null; } }
function formatTime(sec){ if(isNaN(sec)||!isFinite(sec)) return '0:00'; const m=Math.floor(sec/60),s=Math.floor(sec%60); return `${m}:${s<10?'0'+s:s}`; }
function openLink(url){ if(window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url); else window.open(url,'_blank'); }

// Ripple effect
function addRipple(el, e){
  const rect = el.getBoundingClientRect();
  const r = document.createElement('span');
  r.className = 'ripple';
  const size = Math.max(rect.width, rect.height) * 1.5;
  r.style.cssText = `width:${size}px;height:${size}px;left:${(e.clientX||rect.left+rect.width/2)-rect.left-size/2}px;top:${(e.clientY||rect.top+rect.height/2)-rect.top-size/2}px`;
  el.appendChild(r);
  r.addEventListener('animationend', ()=>r.remove());
}
document.addEventListener('click', e=>{
  const host = e.target.closest('.ripple-host');
  if(host) addRipple(host, e);
});

// ======================== КОНФИГ ========================
const WORKER_URL = 'https://checker.mirhaet83.workers.dev';
const TRIBUTE_LINKS = {
  key2: 'https://t.me/tribute/app?startapp=pub9',
  key3: 'https://t.me/tribute/app?startapp=pubx',
  key4: 'https://t.me/tribute/app?startapp=puby',
  all:  'https://t.me/tribute/app?startapp=pubz',
  donate: 'https://t.me/tribute/app?startapp=dJwq',
  training: 'https://web.tribute.tg/p/vPL'
};
const AUDIO_URLS = { bonus: 'https://files.catbox.moe/mhz6kz.mp3' };
const BOT_USERNAME = 'Tochkaopoypraktikbot';

let userStatus = {key2:false,key3:false,key4:false};
let completed = {key2:false,key3:false};
let welcomeShown = {key2:false,key3:false,key4:false};
let currentContent = null, currentStepIndex = 0, stepHistory = [];
let activeAudio = null;
let currentLang = localStorage.getItem('app_lang') || 'ru';
let vratasOpen = false;

// ======================== ПЕРЕВОДЫ ========================
const T = {
  ru: {
    tagline:'«Не волшебная таблетка, но близко к тому, чтобы ты проснулся»',
    buyAllPrefix:'Получить все ключи (2+3+4)', get allPrice(){ return getCurrentAllPrice('ru'); },
    key2Title:'КЛЮЧ 2', key3Title:'КЛЮЧ 3', key4Title:'КЛЮЧ 4',
    key2Name:'Золотое сияние', key3Name:'Искусство быть', key4Name:'Субстрат жизненности',
    key2Price:'', key3Price:'', key4Price:'',
    donate:'💛 Донат автору', note:'нажмите на раздел, чтобы начать',
    accessOpen:'✓ открыт доступ', accessClosed:'🔒 закрыт доступ',
    back:'← Назад', toStart:'🏁 В начало', toHome:'🏠 На главную',
    next:'Далее', answer:'✍️ Ответить', buy:'💳 Купить',
    goToKey:'🔓 Перейти к следующему ключу',
    bonusPodcastButton:'🎁 Получить бонус-подкаст', complete:'Завершить',
    lblNeuro:'НЕЙРОКОУЧИНГ', lblVratas:'ПУСТОТА — ЭТО ФОРМА', lblKosmo:'КОСМОЭНЕРГЕТИКА',
    btnTraining:'🎓 Записаться на начальное обучение',
    btnDiagnostics:'🔍 Записаться на диагностику',
    kosmoSubtitle:'Выберите блок для изучения',
    neuroSubtitle:'Нейронаука для личной эффективности',
    backToBlocks:'← К блокам', freqCount:'частот',
    vratasIntro:'Четыре практики-медитации, которые последовательно открывают внутренние ресурсы — через тело, эмоции, разум и душу. Каждый ключ — отдельный уровень глубины. Ключ 1 бесплатен, ключи 2–4 доступны единым пакетом.',
  },
  en: {
    tagline:'"Not a magic pill, but close to waking you up"',
    buyAllPrefix:'Get all keys (2+3+4)', get allPrice(){ return getCurrentAllPrice('en'); },
    key2Title:'KEY 2', key3Title:'KEY 3', key4Title:'KEY 4',
    key2Name:'Golden Glow', key3Name:'The Art of Being', key4Name:'Substrate of Vitality',
    key2Price:'', key3Price:'', key4Price:'',
    donate:'💛 Donate to author', note:'tap a section to start',
    accessOpen:'✓ access granted', accessClosed:'🔒 access closed',
    back:'← Back', toStart:'🏁 To start', toHome:'🏠 Home',
    next:'Next', answer:'✍️ Answer', buy:'💳 Buy',
    goToKey:'🔓 Go to next key',
    bonusPodcastButton:'🎁 Get bonus podcast', complete:'Complete',
    lblNeuro:'NEUROCOACHING', lblVratas:'EMPTINESS IS FORM', lblKosmo:'KOSMOENERGETIKA',
    btnTraining:'🎓 Sign up for basic training',
    btnDiagnostics:'🔍 Book a diagnostic session',
    kosmoSubtitle:'Choose a block to study',
    neuroSubtitle:'Neuroscience for personal effectiveness',
    backToBlocks:'← Back to blocks', freqCount:'frequencies',
    vratasIntro:'Four meditation practices that sequentially unlock inner resources — through body, emotions, mind and soul. Each key is a new level of depth. Key 1 is free; keys 2–4 are available as one complete package.',
  }
};
function t(k){ return (T[currentLang]||T.ru)[k]||k; }

function updateUILanguage(){
  document.getElementById('tagline').innerText = t('tagline');
  document.getElementById('buyAllText').innerText = t('buyAllPrefix');
  document.getElementById('allPriceSpan').innerText = t('allPrice');
  document.getElementById('key2Title').innerText = t('key2Title');
  document.getElementById('key3Title').innerText = t('key3Title');
  document.getElementById('key4Title').innerText = t('key4Title');
  document.getElementById('key2Name').innerText  = t('key2Name');
  document.getElementById('key3Name').innerText  = t('key3Name');
  document.getElementById('key4Name').innerText  = t('key4Name');
  document.getElementById('key2Price').innerText = t('key2Price');
  document.getElementById('key3Price').innerText = t('key3Price');
  document.getElementById('key4Price').innerText = t('key4Price');
  document.getElementById('donateBtnText').innerText = currentLang==='en'?'Donate to author':'Донат автору';
  document.getElementById('note').innerText = t('note');
  document.getElementById('lblNeuro').innerText  = t('lblNeuro');
  document.getElementById('lblVratas').innerText = t('lblVratas');
  document.getElementById('lblKosmo').innerText  = t('lblKosmo');
  const vi = document.getElementById('vratasIntroText');
  if(vi) vi.innerText = t('vratasIntro');
  updateStatusUI();
  updatePromoPriceUI();
}

function setLanguage(lang){
  currentLang = lang;
  localStorage.setItem('app_lang', lang);
  updateUILanguage();
  loadUserStatus();
}
document.querySelectorAll('.lang-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    setLanguage(btn.getAttribute('data-lang'));
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ======================== СТАТУСЫ КЛЮЧЕЙ ========================
async function loadUserStatus(){
  const webApp=window.Telegram?.WebApp;
  if(!webApp?.initData) return;
  try{
    const resp=await fetch(`${WORKER_URL}/user-status?initData=${encodeURIComponent(webApp.initData)}`);
    if(resp.ok){const d=await resp.json();userStatus={key2:!!d.key2,key3:!!d.key3,key4:!!d.key4};updateStatusUI();}
  }catch(e){console.error(e);}
}

function updateStatusUI(){
  const buyAllBtn = document.getElementById('buyAllBtn');
  if(buyAllBtn){
    const anyPurchased = userStatus.key2||userStatus.key3||userStatus.key4;
    buyAllBtn.style.display = anyPurchased ? 'none' : '';
  }
  const setKey=(id,owned)=>{
    const el=document.getElementById(id+'Status');
    if(el){ el.innerHTML=owned?t('accessOpen'):t('accessClosed'); el.className='status-badge '+(owned?'status-open':'status-closed'); }
    const pr=document.getElementById(id+'Price');
    if(pr) pr.style.display='none';
  };
  setKey('key2',userStatus.key2);
  setKey('key3',userStatus.key3);
  setKey('key4',userStatus.key4);
}

// ======================== АУДИОПЛЕЕР ========================
function buildPlayer(url, containerId){
  const c=document.getElementById(containerId); if(!c) return null;
  const audio=new Audio(); audio.preload='metadata';
  const div=document.createElement('div'); div.className='custom-player';
  div.innerHTML=`
    <div class="player-controls">
      <button class="play-btn" id="pb_${containerId}">▶</button>
      <span class="time" id="tm_${containerId}">0:00 / --:--</span>
      <input type="range" class="seek-bar" id="sb_${containerId}" value="0" step="0.1" min="0" max="100">
      <select class="speed-select" id="ss_${containerId}">
        <option value="0.75">0.75×</option>
        <option value="1" selected>1×</option>
        <option value="1.25">1.25×</option>
        <option value="1.5">1.5×</option>
        <option value="2">2×</option>
      </select>
    </div>`;
  c.appendChild(div);
  const pb=div.querySelector('.play-btn'),
        tm=div.querySelector('.time'),
        sb=div.querySelector('.seek-bar'),
        ss=div.querySelector('.speed-select');
  let playing=false, dragging=false;

  audio.addEventListener('loadedmetadata',()=>{
    if(isFinite(audio.duration)){ sb.max=audio.duration; tm.innerText=`0:00 / ${formatTime(audio.duration)}`; }
  });
  audio.addEventListener('timeupdate',()=>{
    if(!dragging&&isFinite(audio.duration)){
      sb.value=audio.currentTime;
      tm.innerText=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }
  });
  audio.addEventListener('ended',()=>{ playing=false; pb.innerText='▶'; pb.style.background=''; });
  audio.addEventListener('error',(e)=>{ console.error('Audio error',e); tm.innerText=currentLang==='ru'?'⚠ ошибка загрузки':'⚠ load error'; });

  pb.addEventListener('click',()=>{
    if(playing){ audio.pause(); pb.innerText='▶'; playing=false; }
    else{ audio.src=audio.src||url; audio.play().then(()=>{ pb.innerText='⏸'; playing=true; }).catch(err=>{ console.error(err); tm.innerText=currentLang==='ru'?'⚠ не удалось воспроизвести':'⚠ playback failed'; }); }
  });
  sb.addEventListener('mousedown',()=>{ dragging=true; });
  sb.addEventListener('input',()=>{ if(isFinite(audio.duration)) tm.innerText=`${formatTime(+sb.value)} / ${formatTime(audio.duration)}`; });
  sb.addEventListener('change',()=>{ audio.currentTime=parseFloat(sb.value); dragging=false; });
  ss.addEventListener('change',()=>{ audio.playbackRate=parseFloat(ss.value); });

  // Устанавливаем src после всех listeners
  audio.src = url;
  activeAudio=audio; return audio;
}

// ======================== НАВИГАЦИЯ ========================
function toggleVratasPanel(){
  vratasOpen=!vratasOpen;
  const panel=document.getElementById('vratasPanel');
  panel.classList.toggle('open',vratasOpen);
  document.getElementById('btnVratas').style.borderColor=vratasOpen?'var(--gold)':'';
}

function goHome(){
  stopActiveAudio();
  document.getElementById('dynamicPanel').classList.add('hidden');
  document.getElementById('homeScreen').classList.remove('hidden');
  currentContent=null; loadUserStatus();
}

function showError(msg){
  stopActiveAudio();
  const panel=document.getElementById('dynamicPanel');
  panel.innerHTML=`<div class="meditation-card error-message">⚠️ ${msg}<br><button id="errBtn" class="btn-audio" style="margin-top:16px;">${t('back')}</button></div>`;
  panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
  document.getElementById('errBtn')?.addEventListener('click',goHome);
}

function showPanel(el){
  const panel=document.getElementById('dynamicPanel');
  panel.innerHTML=''; panel.appendChild(el);
  panel.classList.remove('hidden');
  document.getElementById('homeScreen').classList.add('hidden');
  panel.scrollTop=0;
}

function navRow(backCb, startCb, homeCb){
  const d=document.createElement('div');
  d.style.cssText='display:flex;justify-content:space-between;margin-top:22px;gap:8px;';
  d.innerHTML=`<button class="back-home ripple-host" id="snBack">${t('back')}</button><button class="back-to-start ripple-host" id="snStart">${t('toStart')}</button><button class="back-home ripple-host" id="snHome">${t('toHome')}</button>`;
  setTimeout(()=>{
    document.getElementById('snBack')?.addEventListener('click',()=>{stopActiveAudio();backCb();});
    document.getElementById('snStart')?.addEventListener('click',()=>{stopActiveAudio();startCb();});
    document.getElementById('snHome')?.addEventListener('click',()=>{stopActiveAudio();homeCb();});
  },0);
  return d;
}

// ======================== НЕЙРОКОУЧИНГ ========================
const NEURO_BLOCKS = [
  {
    id: 'neuro_what',
    icon: '📖',
    label: 'Что такое нейрокоучинг?',
    labelEn: 'What is neurocoaching?',
    content: {
      title: '📖 Что такое нейрокоучинг?',
      items: [
        {
          name: 'Суть и происхождение',
          desc: 'Нейрокоучинг — направление на стыке классического коучинга и нейропсихологии, которое начало формироваться во второй половине XX века. Метод основан на реальных открытиях нейронауки: мозг пластичен, он способен создавать новые нейронные связи на протяжении всей жизни.\n\nЭто не просто «работа с целями» — это понимание того, КАК именно мозг принимает решения, формирует привычки и блокирует изменения. Нейрокоуч работает не только с сознательными установками, но и с глубинными, часто неосознаваемыми программами поведения.'
        },
        {
          name: 'Чем отличается от классического коучинга?',
          desc: 'Классический коучинг задаёт вопросы и строит план действий. Нейрокоучинг добавляет к этому научную базу:\n\n• Учитывает, как страх и стресс блокируют префронтальную кору — зону рационального мышления\n• Работает с лимбической системой — центром эмоций и автоматических реакций\n• Использует нейропластичность для «перепрошивки» неэффективных паттернов\n• Задействует техники из нейролингвистики, когнитивной психологии и телесно-ориентированного подхода'
        },
        {
          name: 'Ключевые принципы',
          desc: '🧬 Нейропластичность\nМозг меняется под влиянием нового опыта — физически. Новые нейронные связи формируются при каждом повторении нового поведения. Это основа метода.\n\n🔬 Научный подход\nВсе техники опираются на исследования в области нейробиологии и когнитивной психологии. Обзор 2024 года (MBSR, д-р Джон Кабат-Зинн) подтверждает эффективность практик осознанности для снижения тревоги, хронической боли и профессионального выгорания.\n\n🎯 Персонализация\nНет шаблонов — только индивидуальный подбор техник под психофизиологические особенности человека.\n\n🚀 Фокус на будущем\nНе требует глубокого погружения в прошлое. Направлен на конкретные результаты здесь и сейчас.'
        }
      ]
    }
  },
  {
    id: 'neuro_requests',
    icon: '🎯',
    label: 'С какими запросами я работаю?',
    labelEn: 'What can be worked on?',
    content: {
      title: '🎯 С какими запросами я работаю?',
      items: [
        {
          name: 'Личная эффективность и продуктивность',
          desc: 'Управление временем и энергией, преодоление прокрастинации, постановка и достижение целей. Нейрокоучинг помогает «перепрошить» автоматические реакции на стресс и выстроить режим, при котором мозг работает в ресурсном состоянии.\n\n→ Пример: человек годами откладывает важный проект. Мы находим нейронный «тормоз» — страх оценки или перфекционизм — и меняем паттерн реакции.'
        },
        {
          name: 'Эмоциональный интеллект и стресс',
          desc: 'Управление эмоциями в сложных ситуациях, работа с тревогой и выгоранием, развитие устойчивости. Мозг в состоянии хронического стресса буквально теряет способность к стратегическому мышлению — мы это исправляем.\n\n→ Пример: руководитель срывается на команду. Разбираем триггеры, создаём новые реакции через дыхательные и телесные техники.'
        },
        {
          name: 'Убеждения и ограничивающие паттерны',
          desc: 'Замена деструктивных программ мышления на ресурсные. Именно убеждения — «я недостаточно хорош», «у меня не получится» — определяют поведение на уровне подсознания. Нейрокоучинг работает с ними напрямую.\n\n→ Пример: человек убеждён, что не заслуживает успеха. Через работу с образами и нейрографикой мы трансформируем это убеждение в ресурс.'
        },
        {
          name: 'Самооценка и синдром самозванца',
          desc: 'Повышение уверенности в себе, работа с внутренним критиком, избавление от синдрома самозванца. Исследования показывают, что самооценка напрямую связана с активностью определённых зон мозга — и её можно тренировать.'
        },
        {
          name: 'Карьера, лидерство и коммуникация',
          desc: 'Развитие лидерских качеств, навыков публичных выступлений, эффективной коммуникации в команде. Нейрокоучинг помогает выявить и усилить природные сильные стороны, а не «подтягивать слабые».'
        }
      ]
    }
  },
  {
    id: 'neuro_techniques',
    icon: '💪',
    label: 'Техники и инструменты',
    labelEn: 'Techniques & tools',
    content: {
      title: '💪 Техники и инструменты',
      items: [
        {
          name: 'Нейрографика',
          desc: 'Метод визуальной работы с подсознанием, разработанный Павлом Пискарёвым. Клиент создаёт спонтанный рисунок, символизирующий проблему, а затем через определённые шаги трансформирует его — буквально «перерисовывая» ограничения в новые возможности.\n\nКак работает: рисунок активирует правое полушарие и позволяет обойти защитные механизмы сознания. Это не арт-терапия — это точный алгоритм изменения нейронных паттернов.'
        },
        {
          name: 'Работа с убеждениями',
          desc: 'Технология обнаружения и замены ограничивающих убеждений. Мы выявляем программу, которая управляет поведением на уровне подсознания, и создаём новую — ресурсную.\n\nЭтапы:\n1. Осознание — замечаем убеждение\n2. Разотождествление — «это не я, это программа»\n3. Переформулирование — создаём альтернативу\n4. Закрепление — повторение формирует новую нейронную связь'
        },
        {
          name: 'Дыхательные и глазодвигательные практики',
          desc: 'Простые, но мощные инструменты для быстрой регуляции состояния. Научно доказано, что осознанное дыхание активирует парасимпатическую нервную систему и снижает уровень кортизола за 3–5 минут.\n\n• "Физзарядка для мозга" — упражнения для синхронизации полушарий\n• Техника 4-7-8 — для быстрого выхода из стресса\n• Глазодвигательная десенсибилизация — снятие эмоциональных блоков'
        },
        {
          name: 'Техника «Остановка мыслей»',
          desc: 'Инструмент для прерывания негативного внутреннего диалога. Когда мозг «зацикливается» на тревожных сценариях, этот метод создаёт паузу и переключает фокус.\n\nАлгоритм прост: заметить мысль → назвать её («это снова мой внутренний критик») → осознанно переключить внимание. Повторение создаёт новую нейронную привычку.'
        },
        {
          name: 'Медитации осознанности (Mindfulness)',
          desc: 'Практики для развития осознанности и управления вниманием. Исследования 2024 года показывают: регулярная практика mindfulness снижает реактивность амигдалы (центра страха), улучшает когнитивный контроль и повышает стрессоустойчивость.\n\nМинимальная эффективная доза: 10–15 минут в день на протяжении 8 недель.'
        },
        {
          name: 'Якорение (из НЛП)',
          desc: 'Техника создания быстрого доступа к ресурсному состоянию — уверенности, спокойствию, мотивации. Якорь — это жест, слово или образ, который «включает» нужное состояние.\n\nКак создать якорь:\n1. Войдите в сильное ресурсное состояние\n2. В пике — сделайте жест (например, соедините большой и указательный палец)\n3. Повторите 5–7 раз\n4. Проверьте: жест → состояние активируется автоматически'
        }
      ]
    }
  },
  {
    id: 'neuro_video',
    icon: '🎬',
    label: 'Видео: как работают убеждения',
    labelEn: 'Video: how beliefs work',
    content: {
      title: '🎬 Как работают убеждения подсознания',
      intro: 'Видеопрактика о том, как негативные убеждения управляют нашей жизнью — и как загружать в подсознание новые, ресурсные программы.',
      videoUrl: 'https://files.catbox.moe/l1c4sq.mp4',
      items: [
        {
          name: 'О чём это видео?',
          desc: 'Убеждения — это не просто мысли. Это нейронные программы, записанные в подсознании, которые автоматически управляют нашими реакциями, выборами и результатами.\n\nВ этой практике:\n• Как распознать ограничивающее убеждение\n• Почему «просто думать позитивно» не работает\n• Пошаговый алгоритм загрузки новых убеждений в подсознание'
        }
      ]
    }
  },
  {
    id: 'neuro_why',
    icon: '✨',
    label: 'Почему это работает?',
    labelEn: 'Why does it work?',
    content: {
      title: '✨ Почему это работает?',
      items: [
        {
          name: 'Научная основа',
          desc: 'Нейрокоучинг опирается на реальные открытия нейронауки:\n\n🧠 Нейропластичность — мозг физически меняется под влиянием нового опыта. Новые нейронные связи (синапсы) формируются при каждом повторении нового паттерна поведения.\n\n🎯 Управление вниманием — внимание это ограниченный ресурс мозга. Нейрокоучинг учит им управлять через активацию префронтальной коры — зоны стратегического мышления.\n\n💡 Работа с подсознанием — около 95% наших решений принимаются на автопилоте, без участия сознания. Именно там хранятся ключи к изменениям.'
        },
        {
          name: 'Это не «псевдонаука»',
          desc: 'Нейрокоучинг использует методики, эффективность которых подтверждена исследованиями:\n\n• MBSR (Mindfulness-Based Stress Reduction) — обзор 2024 года подтверждает снижение тревоги, депрессии и хронической боли\n• Когнитивно-поведенческая терапия (основа работы с убеждениями) — один из самых изученных методов в психологии\n• Техники регуляции нервной системы — дыхательные практики изменяют активность вегетативной нервной системы за минуты\n\nЭто системная работа, требующая вовлечённости. Но результаты — устойчивые, потому что они закреплены на уровне нейронных связей.'
        },
        {
          name: '«Не волшебная таблетка, но близко»',
          desc: 'Нейрокоучинг — это не магия. Это понимание инструкции к собственному мозгу.\n\nКаждый человек уже обладает всеми ресурсами для изменений. Задача нейрокоуча — помочь получить к ним доступ и научить пользоваться ими самостоятельно.\n\nСредний срок заметных изменений при регулярной работе: 4–8 недель. Устойчивые трансформации — 3–6 месяцев.'
        }
      ]
    }
  }
];

function openNeuroSection(){
  stopActiveAudio();
  const wrap=document.createElement('div');
  wrap.style.cssText='padding:0 0 40px;';

  const hdr=document.createElement('div');
  hdr.className='section-header';
  hdr.innerHTML=`<div class="section-title">🧠 ${t('lblNeuro')}</div><div class="section-sub">${t('neuroSubtitle')}</div>`;
  wrap.appendChild(hdr);

  const intro=document.createElement('div');
  intro.className='neuro-intro-card';
  intro.innerHTML=`<div style="font-size:13px;color:var(--ink-2);line-height:1.7;">${currentLang==='ru'?'Нейрокоучинг — синтез коучинга и нейронауки. Метод основан на нейропластичности — способности мозга создавать новые связи и «перепрограммировать» неэффективные паттерны поведения на любом этапе жизни.':'Neurocoaching is a synthesis of coaching and neuroscience, based on neuroplasticity — the brain\'s ability to form new connections and reprogram ineffective behaviour patterns at any stage of life.'}</div>`;
  wrap.appendChild(intro);

  NEURO_BLOCKS.forEach(bl=>{
    const btn=document.createElement('button');
    btn.className='kosmo-block-btn ripple-host';
    const label=currentLang==='ru'?bl.label:bl.labelEn;
    btn.innerHTML=`<span class="kosmo-block-icon">${bl.icon}</span><span class="kosmo-block-label">${label}</span><span style="font-size:13px;color:var(--gold);margin-left:6px;">›</span>`;
    btn.addEventListener('click',()=>openNeuroBlock(bl));
    wrap.appendChild(btn);
  });

  // Кнопка диагностики
  const diagBtn=document.createElement('button');
  diagBtn.className='btn-diagnostics ripple-host';
  diagBtn.style.marginTop='20px';
  diagBtn.innerHTML=`🔍 <span>${t('btnDiagnostics')}</span>`;
  diagBtn.addEventListener('click',()=>{
    if(window.Telegram?.WebApp){
      window.Telegram.WebApp.openTelegramLink(`https://t.me/${BOT_USERNAME}?start=startdiognostika`);
    } else {
      openLink(`https://t.me/${BOT_USERNAME}?start=startdiognostika`);
    }
  });
  wrap.appendChild(diagBtn);

  const homeBtn=document.createElement('button');
  homeBtn.className='back-home ripple-host';
  homeBtn.style.cssText='margin-top:14px;display:block;width:100%;';
  homeBtn.innerText=`🏠 ${t('toHome')}`;
  homeBtn.addEventListener('click',goHome);
  wrap.appendChild(homeBtn);

  showPanel(wrap);
}

function openNeuroBlock(bl){
  stopActiveAudio();
  const data=bl.content;
  const wrap=document.createElement('div');
  wrap.style.cssText='padding:0 0 40px;';

  const hdr=document.createElement('div');
  hdr.className='meditation-card';
  hdr.innerHTML=`<div class="med-title">${data.title}</div>${data.intro?`<div class="med-sub">${data.intro}</div>`:''}`;
  wrap.appendChild(hdr);

  // Видео блок
  if(data.videoUrl){
    const vb=document.createElement('div');
    vb.className='video-block';
    vb.innerHTML=`<video controls preload="none" playsinline style="width:100%;display:block;border-radius:22px;">
      <source src="${data.videoUrl}" type="video/mp4">
    </video>
    <div class="video-label">${currentLang==='ru'?'Нажмите ▶ для просмотра':'Tap ▶ to watch'}</div>`;
    wrap.appendChild(vb);
  }

  // Карточки с техниками/разделами
  (data.items||[]).forEach(item=>{
    const card=document.createElement('div'); card.className='freq-card';
    card.innerHTML=`
      <div class="freq-header">
        <span class="freq-name">${item.name}</span>
        <span class="freq-toggle">▼</span>
      </div>
      <div class="freq-body">
        <p class="freq-desc">${item.desc}</p>
      </div>`;
    const header=card.querySelector('.freq-header');
    const body=card.querySelector('.freq-body');
    const toggle=card.querySelector('.freq-toggle');
    header.addEventListener('click',()=>{ const open=body.classList.toggle('open'); toggle.classList.toggle('open',open); });
    wrap.appendChild(card);
  });

  const nav=document.createElement('div');
  nav.style.cssText='display:flex;gap:10px;margin-top:20px;';
  const backBtn=document.createElement('button'); backBtn.className='back-home ripple-host'; backBtn.style.flex='1';
  backBtn.innerText=t('backToBlocks'); backBtn.addEventListener('click',openNeuroSection);
  const homeBtn=document.createElement('button'); homeBtn.className='back-home ripple-host'; homeBtn.style.flex='1';
  homeBtn.innerText=`🏠 ${t('toHome')}`; homeBtn.addEventListener('click',goHome);
  nav.appendChild(backBtn); nav.appendChild(homeBtn);
  wrap.appendChild(nav);

  showPanel(wrap);
}

// ======================== КОСМОЭНЕРГЕТИКА ========================
function openKosmoSection(){
  stopActiveAudio();
  const wrap=document.createElement('div');
  wrap.style.cssText='padding:0 0 40px;';

  const hdr=document.createElement('div');
  hdr.className='section-header';
  hdr.innerHTML=`<div class="section-title">✨ ${t('lblKosmo')}</div><div class="section-sub">${t('kosmoSubtitle')}</div>`;
  wrap.appendChild(hdr);

  const blocks=[
    {id:'vvedenie',         icon:'📖', label:'Введение',           labelEn:'Introduction'},
    {id:'buddhist',         icon:'🌸', label:'Буддийский блок',    labelEn:'Buddhist Block'},
    {id:'magical',          icon:'🔥', label:'Магический блок',    labelEn:'Magical Block'},
    {id:'magister',         icon:'⚡', label:'Магистровый блок',   labelEn:'Magister Block'},
    {id:'zoroastr',         icon:'🕯️', label:'Зороастризм',        labelEn:'Zoroastrianism'},
    {id:'ognenniy_tsvetok', icon:'🌸', label:'Огненный цветок',    labelEn:'Fire Flower'},
  ];
  blocks.forEach(bl=>{
    const btn=document.createElement('button'); btn.className='kosmo-block-btn ripple-host';
    const label=currentLang==='ru'?bl.label:bl.labelEn;
    const count=(KOSMO_DATA[bl.id]?.frequencies||[]).length;
    btn.innerHTML=`<span class="kosmo-block-icon">${bl.icon}</span><span class="kosmo-block-label">${label}</span><span class="kosmo-block-count">${count} ${t('freqCount')}</span><span style="font-size:13px;color:var(--gold);margin-left:6px;">›</span>`;
    btn.addEventListener('click',()=>openKosmoBlock(bl.id));
    wrap.appendChild(btn);
  });

  const trainingBtn=document.createElement('button');
  trainingBtn.className='btn-training-kosmo ripple-host';
  trainingBtn.innerHTML=`🎓 <span>${t('btnTraining')}</span>`;
  trainingBtn.addEventListener('click',()=>{ openLink(TRIBUTE_LINKS.training); });
  wrap.appendChild(trainingBtn);

  const homeBtn=document.createElement('button');
  homeBtn.className='back-home ripple-host';
  homeBtn.style.cssText='margin-top:14px;display:block;width:100%;';
  homeBtn.innerText=`🏠 ${t('toHome')}`; homeBtn.addEventListener('click',goHome);
  wrap.appendChild(homeBtn);

  showPanel(wrap);
}

function openKosmoBlock(blockId){
  stopActiveAudio();
  const data=KOSMO_DATA[blockId]; if(!data) return;
  const wrap=document.createElement('div'); wrap.style.cssText='padding:0 0 40px;';

  const hdr=document.createElement('div'); hdr.className='meditation-card';
  hdr.innerHTML=`<div class="med-title">${data.title}</div><div class="med-sub">${data.intro}</div>`;
  wrap.appendChild(hdr);

  data.frequencies.forEach(freq=>{
    const card=document.createElement('div'); card.className='freq-card';
    card.innerHTML=`
      <div class="freq-header">
        <span class="freq-name">${freq.name}</span>
        <span class="freq-toggle">▼</span>
      </div>
      <div class="freq-body"><p class="freq-desc">${freq.desc}</p></div>`;
    const header=card.querySelector('.freq-header'),body=card.querySelector('.freq-body'),toggle=card.querySelector('.freq-toggle');
    header.addEventListener('click',()=>{ const open=body.classList.toggle('open'); toggle.classList.toggle('open',open); });
    wrap.appendChild(card);
  });

  const nav=document.createElement('div'); nav.style.cssText='display:flex;gap:10px;margin-top:20px;';
  const backBtn=document.createElement('button'); backBtn.className='back-home ripple-host'; backBtn.style.flex='1';
  backBtn.innerText=t('backToBlocks'); backBtn.addEventListener('click',openKosmoSection);
  const homeBtn=document.createElement('button'); homeBtn.className='back-home ripple-host'; homeBtn.style.flex='1';
  homeBtn.innerText=`🏠 ${t('toHome')}`; homeBtn.addEventListener('click',goHome);
  nav.appendChild(backBtn); nav.appendChild(homeBtn);
  wrap.appendChild(nav);

  showPanel(wrap);
}

// ======================== КЛЮЧ 1 — 5 ВРАТ ========================
const FREE_STEPS_RU=[
  {type:'welcome',content:'👋 Здравствуйте.\nМеня зовут Михаил. Я основатель школы Точка опоры.\n\nЧто получите:\n🎧 3 мин — настройка перед практикой\n🎧 10 мин — первая технология (Ключ №1)\n🎧 7 мин — интеграция после практики\n🎁 Бонус — аудиоподкаст «5 врат технология»\n📝 3 шага к почти волшебству\n\nЭто первый кирпич. Начнём?',btnText:'Да, начнём'},
  {type:'audio',audio:'https://files.catbox.moe/qipf0o.mp3',title:'🎧 Шаг 1. Настройка (3 минуты)',text:'Слушайте перед медитацией. Наденьте наушники, закройте глаза.\n👇 Когда закончите, нажмите ДАЛЕЕ',btnText:'Далее'},
  {type:'audio',audio:'https://files.catbox.moe/udem2c.mp3',title:'🔑 Ключ 1 · 5 врат (10 минут)',text:'🎧 10 минут тишины внутри и снаружи. Наденьте наушники, закройте глаза, дышите свободно.\n🌀 После окончания нажмите ДАЛЕЕ',btnText:'Далее → интеграция'},
  {type:'audio',audio:'https://files.catbox.moe/vmafp1.mp3',title:'🧩 Шаг 3 из 4. Интеграция (7 минут)',text:'Вы прошли медитацию. Теперь — самое важное: закрепить состояние.\n🎧 Наденьте наушники, закройте глаза.',btnText:'Далее'},
  {type:'bonus_podcast',content:'📝 Три шага к почти волшебству\n\n1. Запишите одно ощущение из практики.\n2. Спросите себя: «Что я могу сделать прямо сейчас, чтобы продлить это состояние?» — и сделайте.\n\n🎁 Ваш бонус: подкаст «5 врат медитации»',btnText:'🎁 Получить бонус-подкаст'},
  {type:'next_key_prompt',nextKey:'key2',description:'Хотите остальные 3 ключа по быту, душе и социуму?\n\n✨ Начните с ключа 2 «Золотое сияние»'}
];
const FREE_STEPS_EN=[
  {type:'welcome',content:"👋 Hello. My name is Mikhail.\n\nWhat you'll get:\n🎧 3 min – tuning\n🎧 10 min – Key #1\n🎧 7 min – integration\n🎁 Bonus podcast\n📝 3 steps to almost magic",btnText:'Yes, let\'s start'},
  {type:'audio',audio:'https://files.catbox.moe/qipf0o.mp3',title:'🎧 Step 1. Tuning (3 min)',text:'Put on headphones, close your eyes.',btnText:'Next'},
  {type:'audio',audio:'https://files.catbox.moe/udem2c.mp3',title:'🔑 Key 1 · 5 Gates (10 min)',text:'🎧 10 minutes of silence. Headphones on, eyes closed.',btnText:'Next → integration'},
  {type:'audio',audio:'https://files.catbox.moe/vmafp1.mp3',title:'🧩 Step 3 of 4. Integration (7 min)',text:"You've completed the meditation. Now stabilize the state.",btnText:'Next'},
  {type:'bonus_podcast',content:'📝 Three steps to almost magic\n\n1. Write one feeling from the practice.\n2. Ask: "What can I do right now to prolong this state?" – and do it.\n\n🎁 Bonus: podcast "5 Gates"',btnText:'🎁 Get bonus podcast'},
  {type:'next_key_prompt',nextKey:'key2',description:'Want the remaining 3 keys?\n\n✨ Start with Key 2 "Golden Glow"'}
];

let freeIdx=0,freeHist=[];

function renderFreeStep(){
  const steps=currentLang==='ru'?FREE_STEPS_RU:FREE_STEPS_EN;
  if(freeIdx>=steps.length){goHome();return;}
  const step=steps[freeIdx];
  const isAudio=step.type==='audio';
  const outer=document.createElement('div');
  if(isAudio){ outer.className='fullscreen-audio-card'; outer.style.animation='fadeInUp 0.4s ease'; }
  const card=document.createElement('div'); card.className='meditation-card';
  let html='';
  const txt=v=>(v||'').replace(/\n/g,'<br>');
  if(step.type==='welcome'){
    html=`<div class="med-title">${currentLang==='ru'?'📘 Добро пожаловать':'📘 Welcome'}</div><div class="med-sub">${txt(step.content)}</div><button id="snBtn" class="btn-audio ripple-host">${step.btnText}</button>`;
  } else if(isAudio){
    html=`<div class="med-title">${step.title}</div><div class="med-sub">${txt(step.text)}</div><div id="playerContainer"></div><button id="snBtn" class="btn-audio ripple-host">${step.btnText}</button>`;
  } else if(step.type==='bonus_podcast'){
    html=`<div class="med-title">🎁 Бонус</div><div class="med-sub">${txt(step.content)}</div><button id="bpBtn" class="btn-audio btn-secondary ripple-host">${step.btnText}</button><button id="snBtn" class="btn-audio ripple-host" style="margin-top:12px;">${t('complete')}</button>`;
  } else if(step.type==='next_key_prompt'){
    const nk=step.nextKey,purchased=userStatus[nk];
    if(purchased) html=`<div class="med-title">🔓 Следующий ключ</div><div class="med-sub">${txt(step.description)}</div><button id="nkBtn" class="btn-audio ripple-host">${t('goToKey')}</button>`;
    else html=`<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${txt(step.description)}</div><button id="nkBuyBtn" class="btn-audio ripple-host">${currentLang==='ru'?'💳 Открыть все ключи — 990 ₽':'💳 Get all keys — $11'}</button>`;
    html+=`<button id="snHomeBtn" class="back-home ripple-host" style="margin-top:12px;">← ${t('toHome')}</button>`;
  }
  html+=`<div style="display:flex;justify-content:space-between;margin-top:22px;gap:8px;"><button id="snBack" class="back-home ripple-host">${t('back')}</button><button id="snStart" class="back-to-start ripple-host">${t('toStart')}</button><button id="snHome" class="back-home ripple-host">${t('toHome')}</button></div>`;
  card.innerHTML=html; outer.appendChild(card);
  const panel=document.getElementById('dynamicPanel');
  panel.innerHTML=''; panel.appendChild(outer);
  panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
  if(isAudio&&step.audio) buildPlayer(step.audio,'playerContainer');
  document.getElementById('snBtn')?.addEventListener('click',()=>{stopActiveAudio();freeHist.push(freeIdx);freeIdx++;renderFreeStep();});
  document.getElementById('snBack')?.addEventListener('click',()=>{stopActiveAudio();if(freeHist.length)freeIdx=freeHist.pop();else if(freeIdx>0)freeIdx--;renderFreeStep();});
  document.getElementById('snStart')?.addEventListener('click',()=>{stopActiveAudio();freeIdx=0;freeHist=[];renderFreeStep();});
  document.getElementById('snHome')?.addEventListener('click',()=>{stopActiveAudio();goHome();});
  document.getElementById('bpBtn')?.addEventListener('click',e=>{e.preventDefault();showBonusPodcast();});
  if(step.type==='next_key_prompt'){
    if(userStatus[step.nextKey]) document.getElementById('nkBtn')?.addEventListener('click',()=>openKeyContent(step.nextKey));
    else document.getElementById('nkBuyBtn')?.addEventListener('click',()=>{openLink(TRIBUTE_LINKS.all);setTimeout(loadUserStatus,2000);});
    document.getElementById('snHomeBtn')?.addEventListener('click',goHome);
  }
}
function startFreeKey(){ freeIdx=0; freeHist=[]; renderFreeStep(); }

// ======================== ПЛАТНЫЕ КЛЮЧИ ========================
function showBonusPodcast(){
  stopActiveAudio();
  const outer=document.createElement('div'); outer.className='fullscreen-audio-card';
  const card=document.createElement('div'); card.className='meditation-card';
  card.innerHTML=`<div class="med-title">${currentLang==='ru'?'🎁 Бонус: подкаст «Пустота — это форма»':'🎁 Bonus: podcast "Emptiness is Form"'}</div><div class="med-sub">${currentLang==='ru'?'Дополнительная аудиопрактика.':'Additional audio practice.'}</div><div id="bonusPlayer"></div><button id="closeBonusBtn" class="btn-audio btn-secondary ripple-host">${t('complete')}</button>`;
  outer.appendChild(card);
  const panel=document.getElementById('dynamicPanel');
  panel.innerHTML=''; panel.appendChild(outer);
  panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
  buildPlayer(AUDIO_URLS.bonus,'bonusPlayer');
  document.getElementById('closeBonusBtn').addEventListener('click',()=>{stopActiveAudio();goHome();});
}

function renderStepWithFullscreen(step,nextCb,backCb,homeCb,startCb){
  const isAudio=(step.type==='audio'||step.type==='audio_with_text'||step.type==='audio_with_image');
  const outer=document.createElement('div');
  if(isAudio){ outer.className='fullscreen-audio-card'; outer.style.animation='fadeInUp 0.4s ease'; }
  const card=document.createElement('div'); card.className='meditation-card';
  let html='';
  const txt=v=>(v||'').replace(/\n/g,'<br>');
  if(step.type==='welcome'||step.type==='text'){
    html=`<div class="med-title">${currentLang==='ru'?'📘 Информация':'📘 Info'}</div><div class="med-sub">${txt(step.content||step.text)}</div><button id="snBtn" class="btn-audio ripple-host">${t('next')}</button>`;
  } else if(isAudio){
    html=`<div class="med-title">${step.title||'🎧 Аудио'}</div><div class="med-sub">${txt(step.text)}</div>`;
    if(step.type==='audio_with_image') html+=`<div class="image-container"><img src="${step.image}" loading="lazy"></div>`;
    html+=`<div id="playerContainer"></div><button id="snBtn" class="btn-audio ripple-host">${step.btnText||t('next')}</button>`;
  } else if(step.type==='images_with_text'){
    html=`<div class="med-title">${currentLang==='ru'?'🖼️ Иллюстрации':'🖼️ Illustrations'}</div><div class="med-sub">${txt(step.text)}</div><button id="showImgsBtn" class="btn-audio btn-secondary ripple-host">${step.btnText||(currentLang==='ru'?'Показать':'Show')}</button><div id="hiddenImgs" style="display:none">${(step.images||[]).map(s=>`<div class="image-container"><img src="${s}" loading="lazy"></div>`).join('')}</div><button id="snBtn" class="btn-audio ripple-host" style="margin-top:12px;">${t('next')} →</button>`;
  } else if(step.type==='quiz'){
    html=`<div class="med-title">${currentLang==='ru'?'📝 Осмысление':'📝 Reflection'}</div><div class="med-sub">${txt(step.text)}</div>${(step.questions||[]).map((q,i)=>`<div class="quiz-question">${i+1}. ${q}</div>`).join('')}<button id="snBtn" class="btn-audio ripple-host">${t('answer')}</button>`;
  } else if(step.type==='next_key_prompt'){
    const nk=step.nextKey,p=userStatus[nk];
    if(p) html=`<div class="med-title">🔓 Следующий ключ</div><div class="med-sub">${txt(step.description)}</div><button id="nkBtn" class="btn-audio ripple-host">${t('goToKey')}</button>`;
    else html=`<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${txt(step.description)}</div><button id="nkBuyBtn" class="btn-audio ripple-host">${currentLang==='ru'?`💳 Открыть все ключи — ${getCurrentAllPrice('ru')}`:`💳 Get all keys — ${getCurrentAllPrice('en')}`}</button>`;
    html+=`<button id="snHomeBtn" class="back-home ripple-host">← ${t('toHome')}</button>`;
  } else if(step.type==='bonus_pdf'){
    html=`<div class="med-title">📘 Бонус</div><div class="med-sub">${txt(step.text)}</div><a href="${step.pdf}" target="_blank" class="btn-audio ripple-host" style="display:inline-block">${step.btnText}</a><button id="snBtn" class="btn-audio ripple-host">${t('next')}</button>`;
  } else if(step.type==='final_bonus'){
    html=`<div class="med-title">🎁 Завершение</div><div class="med-sub">${txt(step.content)}</div><button id="snBtn" class="btn-audio ripple-host">${step.btnText||t('complete')}</button>`;
  } else if(step.type==='bonus_podcast'){
    html=`<div class="med-title">🎁 Бонус</div><div class="med-sub">${txt(step.content)}</div><button id="bpBtn" class="btn-audio btn-secondary ripple-host">${step.btnText}</button><button id="snBtn" class="btn-audio ripple-host" style="margin-top:12px;">${t('complete')}</button>`;
  }
  html+=`<div style="display:flex;justify-content:space-between;margin-top:22px;gap:8px;"><button id="snBack" class="back-home ripple-host">${t('back')}</button><button id="snStart" class="back-to-start ripple-host">${t('toStart')}</button><button id="snHome" class="back-home ripple-host">${t('toHome')}</button></div>`;
  card.innerHTML=html; outer.appendChild(card);
  const panel=document.getElementById('dynamicPanel');
  panel.innerHTML=''; panel.appendChild(outer);
  if(isAudio&&step.audio) buildPlayer(step.audio,'playerContainer');
  document.getElementById('snBtn')?.addEventListener('click',()=>{stopActiveAudio();nextCb();});
  document.getElementById('snBack')?.addEventListener('click',()=>{stopActiveAudio();backCb();});
  document.getElementById('snStart')?.addEventListener('click',()=>{stopActiveAudio();startCb();});
  document.getElementById('snHome')?.addEventListener('click',()=>{stopActiveAudio();homeCb();});
  if(step.type==='next_key_prompt'){
    if(userStatus[step.nextKey]) document.getElementById('nkBtn')?.addEventListener('click',()=>openKeyContent(step.nextKey));
    else document.getElementById('nkBuyBtn')?.addEventListener('click',()=>{openLink(TRIBUTE_LINKS.all);setTimeout(loadUserStatus,2000);});
    document.getElementById('snHomeBtn')?.addEventListener('click',homeCb);
  }
  if(step.type==='images_with_text'){
    const sb=document.getElementById('showImgsBtn'),hd=document.getElementById('hiddenImgs');
    sb?.addEventListener('click',()=>{ if(hd.style.display==='none'){hd.style.display='block';sb.textContent=currentLang==='ru'?'Скрыть':'Hide';}else{hd.style.display='none';sb.textContent=step.btnText||(currentLang==='ru'?'Показать':'Show');} });
  }
  document.getElementById('bpBtn')?.addEventListener('click',e=>{e.preventDefault();showBonusPodcast();});
}

async function openKeyContent(keyId){
  if(!userStatus[keyId]){showError(currentLang==='ru'?'Доступ не оплачен.':'Access not purchased.');return;}
  const panel=document.getElementById('dynamicPanel');
  panel.innerHTML=`<div class="meditation-card" style="margin-top:60px;text-align:center;"><div class="loading-spinner"></div> ${currentLang==='ru'?'Загрузка...':'Loading...'}</div>`;
  panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
  try{
    const webApp=window.Telegram?.WebApp;
    if(!webApp?.initData) throw new Error('no initData');
    const resp=await fetch(`${WORKER_URL}/get-content?initData=${encodeURIComponent(webApp.initData)}&key=${keyId}&lang=${currentLang}`);
    if(!resp.ok) throw new Error('not ok');
    const content=await resp.json();
    if(!content?.steps) throw new Error('no steps');
    currentContent=content; currentStepIndex=0; stepHistory=[];
    if(content.steps[0]?.type==='welcome'&&welcomeShown[keyId]) currentStepIndex=1;
    renderCurrentStep();
  }catch(e){console.error(e);showError(currentLang==='ru'?'Ошибка загрузки контента.':'Content load error.');loadUserStatus();}
}

function renderCurrentStep(){
  if(!currentContent||currentStepIndex>=currentContent.steps.length){
    if(currentContent?.key_id==='key2'){completed.key2=true;localStorage.setItem('completed',JSON.stringify(completed));}
    if(currentContent?.key_id==='key3'){completed.key3=true;localStorage.setItem('completed',JSON.stringify(completed));}
    goHome();return;
  }
  const step=currentContent.steps[currentStepIndex];
  renderStepWithFullscreen(step,
    ()=>{if(currentStepIndex===0&&currentContent.steps[0]?.type==='welcome')welcomeShown[currentContent.key_id]=true;stepHistory.push(currentStepIndex);currentStepIndex++;renderCurrentStep();},
    ()=>{if(stepHistory.length)currentStepIndex=stepHistory.pop();else if(currentStepIndex>0)currentStepIndex--;renderCurrentStep();},
    ()=>{goHome();},
    ()=>{currentStepIndex=0;stepHistory=[];renderCurrentStep();}
  );
}

// ======================== ИНИЦИАЛИЗАЦИЯ ========================
document.getElementById('btnNeuro').addEventListener('click', openNeuroSection);
document.getElementById('btnVratas').addEventListener('click', toggleVratasPanel);
document.getElementById('btnKosmo').addEventListener('click', openKosmoSection);
document.getElementById('buyAllBtn').addEventListener('click', ()=>{ openLink(TRIBUTE_LINKS.all); setTimeout(loadUserStatus,2000); });
document.getElementById('donateBtn').addEventListener('click', ()=>{ openLink(TRIBUTE_LINKS.donate); });

document.querySelectorAll('.key-card').forEach(card=>{
  card.addEventListener('click',()=>{
    const key=card.dataset.key;
    if(key==='key1'){ startFreeKey(); return; }
    loadUserStatus().then(()=>{
      if(userStatus[key]) openKeyContent(key);
      else{
        const currentPrice = getCurrentAllPrice(currentLang);
        const confirmMsg = currentLang==='ru'
          ? `Открыть все 3 ключа за ${currentPrice}?`
          : `Get all 3 keys for ${currentPrice}?`;
        if(confirm(confirmMsg)){
          openLink(TRIBUTE_LINKS.all); setTimeout(loadUserStatus,2000);
        }
      }
    });
  });
});

try{ const s=localStorage.getItem('completed'); if(s) completed=JSON.parse(s); }catch(e){}

function hideLoadingScreen(){
  const ls=document.getElementById('loadingScreen');
  if(ls){ ls.classList.add('hidden'); setTimeout(()=>ls.remove(),600); }
}

function initApp(){
  if(window.Telegram&&window.Telegram.WebApp){
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    document.querySelectorAll('.lang-btn').forEach(btn=>{
      btn.classList.toggle('active', btn.getAttribute('data-lang')===currentLang);
    });
    updateUILanguage();
    loadPromoCounter();
    loadUserStatus().finally(()=>{ hideLoadingScreen(); });
  } else {
    setTimeout(initApp,100);
  }
}

// Скрываем загрузку не позже чем через 2.5с
setTimeout(hideLoadingScreen, 2500);
initApp();
window.addEventListener('focus',loadUserStatus);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) loadUserStatus(); });
setInterval(loadUserStatus,15000);

// ======================== 3D FON ========================
(function initCosmicBackground() {
    // ... (скопируйте сюда всю функцию initCosmicBackground из вашего последнего HTML) ...
    // Она занимает много места, но вы её уже имеете.
})();

// ======================== КОНФИГ ========================
const WORKER_URL = 'https://checker.mirhaet83.workers.dev';
const TRIBUTE_LINKS = {
    key2: 'https://t.me/tribute/app?startapp=pub9',
    key3: 'https://t.me/tribute/app?startapp=pubx',
    key4: 'https://t.me/tribute/app?startapp=puby',
    all: 'https://t.me/tribute/app?startapp=pubz',
    donate: 'https://t.me/tribute/app?startapp=dJwq'
};
const AUDIO_URLS = { bonus: "https://files.catbox.moe/mhz6kz.mp3" };

// Состояния
let userStatus = { key2: false, key3: false, key4: false };
let completed = { key2: false, key3: false };
let welcomeShown = { key2: false, key3: false, key4: false };
let currentContent = null, currentStepIndex = 0, stepHistory = [];
let activeAudio = null;

// ======================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ========================
function stopActiveAudio() { if(activeAudio) { activeAudio.pause(); activeAudio=null; } }
function formatTime(sec) { if(isNaN(sec)) return "0:00"; const m=Math.floor(sec/60), s=Math.floor(sec%60); return `${m}:${s<10?'0'+s:s}`; }

// ======================== БЕСПЛАТНЫЙ КЛЮЧ 1 (ЛОКАЛЬНО, БЕЗ WORKER) ========================
const freeSteps = [
    { type: "welcome", content: "👋 Здравствуйте. Меня зовут Михаил.\n\nЧто получите:\n🎧 3 мин — настройка\n🎧 10 мин — Ключ №1 «5 врат»\n🎧 7 мин — интеграция\n🎁 бонус-подкаст\n📝 3 шага к почти волшебству" },
    { type: "audio", audio: "https://files.catbox.moe/qipf0o.mp3", title: "🎧 Настройка", text: "Слушайте перед медитацией.", btnText: "ДАЛЕЕ" },
    { type: "audio", audio: "https://files.catbox.moe/udem2c.mp3", title: "🔑 КЛЮЧ 1 · 5 врат", text: "Закройте глаза, дышите свободно.", btnText: "ДАЛЕЕ → интеграция" },
    { type: "audio", audio: "https://files.catbox.moe/vmafp1.mp3", title: "🧩 Интеграция", text: "Закрепите состояние.", btnText: "ДАЛЕЕ" },
    { type: "bonus_podcast", content: "🎁 Бонус: подкаст «5 врат»", btnText: "Забрать бонус" }
];
let freeStepIndex = 0, freeHistory = [], freeAudio = null;

function renderFreeStep() {
    if(freeStepIndex >= freeSteps.length) { goHome(); return; }
    const step = freeSteps[freeStepIndex];
    const isAudio = step.type === 'audio';
    const wrapperDiv = document.createElement('div');
    if(isAudio) { wrapperDiv.className = 'fullscreen-audio-card'; wrapperDiv.style.animation = 'fadeInUp 0.4s ease'; }
    const cardDiv = document.createElement('div'); cardDiv.className = 'meditation-card';
    let innerHtml = '';
    if(step.type === 'welcome') {
        innerHtml = `<div class="med-title">📘 Информация</div><div class="med-sub">${step.content.replace(/\n/g,'<br>')}</div><button id="stepNextBtn" class="btn-audio">Далее</button>`;
    } else if(step.type === 'audio') {
        innerHtml = `<div class="med-title">${step.title}</div><div class="med-sub">${step.text}</div><div id="playerContainer"></div><button id="stepNextBtn" class="btn-audio">${step.btnText}</button>`;
    } else if(step.type === 'bonus_podcast') {
        innerHtml = `<div class="med-title">🎁 Бонус</div><div class="med-sub">${step.content}</div><button id="bonusPodcastBtn" class="btn-audio btn-secondary">${step.btnText}</button><button id="stepNextBtn" class="btn-audio" style="margin-top:20px;">Завершить</button>`;
    }
    innerHtml += `<div style="display:flex; justify-content:space-between; margin-top:20px;"><button id="stepBackBtn" class="back-home">← Назад</button><button id="stepStartBtn" class="back-to-start">🏁 В начало</button><button id="stepHomeBtn" class="back-home">🏠 На главную</button></div>`;
    cardDiv.innerHTML = innerHtml;
    wrapperDiv.appendChild(cardDiv);
    const panel = document.getElementById('dynamicPanel'); panel.innerHTML = ''; panel.appendChild(wrapperDiv);
    panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');

    if(step.type === 'audio' && step.audio) {
        const container = document.getElementById('playerContainer');
        if(container) {
            const audio = new Audio(step.audio);
            audio.preload = 'metadata';
            const playerDiv = document.createElement('div'); playerDiv.className = 'custom-player';
            playerDiv.innerHTML = `<div class="player-controls"><button class="play-btn">▶</button><span class="time">0:00 / 0:00</span><input type="range" class="seek-bar" value="0" step="0.01"><select class="speed-select"><option value="0.5">0.5x</option><option value="0.75">0.75x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></select></div>`;
            container.appendChild(playerDiv);
            const playBtn = playerDiv.querySelector('.play-btn'), timeSpan = playerDiv.querySelector('.time'), seekBar = playerDiv.querySelector('.seek-bar'), speedSelect = playerDiv.querySelector('.speed-select');
            let playing = false;
            audio.addEventListener('loadedmetadata',()=>{ if(isFinite(audio.duration)){ seekBar.max=audio.duration; timeSpan.innerText=`0:00 / ${formatTime(audio.duration)}`; } });
            audio.addEventListener('timeupdate',()=>{ if(!isNaN(audio.duration)){ seekBar.value=audio.currentTime; timeSpan.innerText=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`; } });
            audio.addEventListener('ended',()=>{ playing=false; playBtn.innerText='▶'; });
            playBtn.addEventListener('click',()=>{ if(playing){ audio.pause(); playBtn.innerText='▶'; playing=false; } else { audio.play().catch(e=>{}); playBtn.innerText='⏸'; playing=true; } });
            seekBar.addEventListener('input',()=>{ audio.currentTime=parseFloat(seekBar.value); });
            speedSelect.addEventListener('change',()=>{ audio.playbackRate=parseFloat(speedSelect.value); });
            freeAudio = audio; activeAudio = audio;
        }
    }
    document.getElementById('stepNextBtn')?.addEventListener('click',()=>{ stopActiveAudio(); if(step.type === 'bonus_podcast'){ goHome(); } else { freeHistory.push(freeStepIndex); freeStepIndex++; renderFreeStep(); } });
    document.getElementById('stepBackBtn')?.addEventListener('click',()=>{ stopActiveAudio(); if(freeHistory.length) freeStepIndex=freeHistory.pop(); else if(freeStepIndex>0) freeStepIndex--; renderFreeStep(); });
    document.getElementById('stepStartBtn')?.addEventListener('click',()=>{ stopActiveAudio(); freeStepIndex=0; freeHistory=[]; renderFreeStep(); });
    document.getElementById('stepHomeBtn')?.addEventListener('click',()=>goHome());
    if(step.type === 'bonus_podcast') {
        document.getElementById('bonusPodcastBtn')?.addEventListener('click', (e) => { e.preventDefault(); showBonusPodcast(); });
    }
}

function startFreeKey() { freeStepIndex=0; freeHistory=[]; renderFreeStep(); }

// ======================== ОСТАЛЬНЫЕ ФУНКЦИИ (для платных ключей) ========================
async function loadUserStatus() {
    const webApp = window.Telegram?.WebApp;
    if(!webApp?.initData) return;
    try{
        const resp = await fetch(`${WORKER_URL}/user-status?initData=${encodeURIComponent(webApp.initData)}`);
        if(resp.ok) {
            const data = await resp.json();
            userStatus = { key2:!!data.key2, key3:!!data.key3, key4:!!data.key4 };
            updateStatusUI();
        }
    } catch(e){ console.error(e); }
}

function updateStatusUI(){
    const k2=document.getElementById('key2Status'); if(k2){ k2.innerHTML=userStatus.key2?'✓ открыт доступ':'🔒 закрыт доступ'; k2.className=userStatus.key2?'status-badge status-open':'status-badge status-closed';}
    const k3=document.getElementById('key3Status'); if(k3){ if(!userStatus.key3) k3.innerHTML='🔒 закрыт доступ'; else if(userStatus.key3 && !completed.key2) k3.innerHTML='🔓 сначала пройдите КЛЮЧ 2'; else k3.innerHTML='✓ открыт доступ'; k3.className=(userStatus.key3 && completed.key2)?'status-badge status-open':(userStatus.key3?'status-badge status-locked':'status-badge status-closed');}
    const k4=document.getElementById('key4Status'); if(k4){ if(!userStatus.key4) k4.innerHTML='🔒 закрыт доступ'; else if(userStatus.key4 && (!completed.key2 || !completed.key3)) k4.innerHTML='🔓 сначала пройдите КЛЮЧ 2 и КЛЮЧ 3'; else k4.innerHTML='✓ открыт доступ'; k4.className=(userStatus.key4 && completed.key2 && completed.key3)?'status-badge status-open':'status-badge status-locked';}
}

function openTributePayment(link){ if(window.Telegram?.WebApp) window.Telegram.WebApp.openLink(link); else window.open(link,'_blank'); setTimeout(()=>loadUserStatus(),2000); }

async function loadKeyContent(keyId){
    const webApp=window.Telegram?.WebApp;
    if(!webApp?.initData) return null;
    const resp=await fetch(`${WORKER_URL}/get-content?initData=${encodeURIComponent(webApp.initData)}&key=${keyId}`);
    if(resp.ok) return await resp.json();
    return null;
}

function showBonusPodcast() {
    stopActiveAudio();
    const wrapper = document.createElement('div'); wrapper.className = 'fullscreen-audio-card';
    const card = document.createElement('div'); card.className = 'meditation-card';
    card.innerHTML = `<div class="med-title">🎁 Бонус: подкаст «5 врат»</div><div class="med-sub">Дополнительная аудиопрактика.</div><div id="bonusPlayerContainer"></div><button id="closeBonusBtn" class="btn-audio btn-secondary">Закрыть</button>`;
    wrapper.appendChild(card);
    const panel = document.getElementById('dynamicPanel'); panel.innerHTML = ''; panel.appendChild(wrapper);
    panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
    const container = document.getElementById('bonusPlayerContainer');
    const audio = new Audio(AUDIO_URLS.bonus);
    audio.preload = 'metadata';
    const playerDiv = document.createElement('div'); playerDiv.className = 'custom-player';
    playerDiv.innerHTML = `<div class="player-controls"><button class="play-btn">▶</button><span class="time">0:00 / 0:00</span><input type="range" class="seek-bar" value="0" step="0.01"><select class="speed-select"><option value="0.5">0.5x</option><option value="0.75">0.75x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></select></div>`;
    container.appendChild(playerDiv);
    const playBtn=playerDiv.querySelector('.play-btn'), timeSpan=playerDiv.querySelector('.time'), seekBar=playerDiv.querySelector('.seek-bar'), speedSelect=playerDiv.querySelector('.speed-select');
    let isPlaying=false;
    audio.addEventListener('loadedmetadata',()=>{ if(isFinite(audio.duration)){ seekBar.max=audio.duration; timeSpan.innerText=`0:00 / ${formatTime(audio.duration)}`; } });
    audio.addEventListener('timeupdate',()=>{ if(!isNaN(audio.duration)){ seekBar.value=audio.currentTime; timeSpan.innerText=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`; } });
    audio.addEventListener('ended',()=>{ isPlaying=false; playBtn.innerText='▶'; });
    playBtn.addEventListener('click',()=>{ if(isPlaying){ audio.pause(); playBtn.innerText='▶'; isPlaying=false; } else { audio.play().catch(console.log); playBtn.innerText='⏸'; isPlaying=true; } });
    seekBar.addEventListener('input',()=>{ audio.currentTime=parseFloat(seekBar.value); });
    speedSelect.addEventListener('change',()=>{ audio.playbackRate=parseFloat(speedSelect.value); });
    activeAudio = audio;
    document.getElementById('closeBonusBtn').addEventListener('click',()=>{ stopActiveAudio(); goHome(); });
}

function renderStepWithFullscreen(step, nextCallback, backCallback, homeCallback, startCallback){
    // ... (та же функция, что была в вашем коде) ...
    // Она уже у вас есть, скопируйте её из последнего рабочего HTML.
    // Чтобы не раздувать ответ, я предполагаю, что вы её вставите.
    // Если нужна полная – напишите, я добавлю.
}

async function openKeyContent(keyId){
    if(!userStatus[keyId]){ showErrorAndGoHome(`Доступ к ключу не оплачен.`); return; }
    const panel=document.getElementById('dynamicPanel');
    panel.innerHTML=`<div class="meditation-card"><div class="loading-spinner"></div> Загрузка...</div>`;
    panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
    try{
        const content = await loadKeyContent(keyId);
        if(!content?.steps) throw new Error();
        currentContent = content; currentStepIndex = 0; stepHistory = [];
        if(content.steps[0]?.type==='welcome' && welcomeShown[keyId]) currentStepIndex = 1;
        renderCurrentStep();
    } catch(e){ showErrorAndGoHome("Ошибка загрузки контента."); await loadUserStatus(); }
}

function renderCurrentStep(){
    if(!currentContent || currentStepIndex>=currentContent.steps.length){
        if(currentContent?.key_id==='key2'){ completed.key2=true; localStorage.setItem('completed',JSON.stringify(completed)); }
        if(currentContent?.key_id==='key3'){ completed.key3=true; localStorage.setItem('completed',JSON.stringify(completed)); }
        goHome(); return;
    }
    const step=currentContent.steps[currentStepIndex];
    renderStepWithFullscreen(step,
        ()=>{ if(currentStepIndex===0 && currentContent.steps[0]?.type==='welcome') welcomeShown[currentContent.key_id]=true; stepHistory.push(currentStepIndex); currentStepIndex++; renderCurrentStep(); },
        ()=>{ if(stepHistory.length) currentStepIndex=stepHistory.pop(); else if(currentStepIndex>0) currentStepIndex--; renderCurrentStep(); },
        ()=>{ goHome(); },
        ()=>{ currentStepIndex=0; stepHistory=[]; renderCurrentStep(); }
    );
}

function goHome(){ stopActiveAudio(); document.getElementById('dynamicPanel').classList.add('hidden'); document.getElementById('homeScreen').classList.remove('hidden'); currentContent=null; loadUserStatus(); }
function showErrorAndGoHome(msg){ stopActiveAudio(); const panel=document.getElementById('dynamicPanel'); panel.innerHTML=`<div class="meditation-card error-message">⚠️ ${msg}<br><button id="errorHomeBtn" class="btn-audio">Вернуться</button></div>`; panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden'); document.getElementById('errorHomeBtn')?.addEventListener('click',()=>goHome()); }

async function onKeyClick(keyId){
    if(keyId === 'key1') {
        startFreeKey();
        return;
    }
    await loadUserStatus();
    if(userStatus[keyId]) {
        openKeyContent(keyId);
    } else {
        const prices={key2:'890 ₽', key3:'1390 ₽', key4:'1890 ₽'};
        if(confirm(`${keyId.toUpperCase()} — ${prices[keyId]}\nОплатить через Tribute?`)) openTributePayment(TRIBUTE_LINKS[keyId]);
    }
}

document.querySelectorAll('.key-card').forEach(card=>{ card.addEventListener('click',()=>{ const key=card.dataset.key; onKeyClick(key); }); });
document.getElementById('buyAllBtn')?.addEventListener('click',()=>openTributePayment(TRIBUTE_LINKS.all));
document.getElementById('donateBtn')?.addEventListener('click',()=>openTributePayment(TRIBUTE_LINKS.donate));

function initApp() {
    if(window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        loadUserStatus().then(() => goHome());
    } else {
        setTimeout(initApp, 100);
    }
}
initApp();
window.addEventListener('focus',()=>loadUserStatus());
document.addEventListener('visibilitychange', () => { if (!document.hidden) loadUserStatus(); });
setInterval(loadUserStatus, 15000);

// ======================== 3D ФОН (оригинальный) ========================
(function initCosmicBackground() {
    // ... (полностью скопируйте эту функцию из вашего текущего app.js, она не меняется) ...
})();

// ======================== ОСНОВНАЯ ЛОГИКА ========================
const WORKER_URL = 'https://checker.mirhaet83.workers.dev';
const TRIBUTE_LINKS = {
    key2: 'https://t.me/tribute/app?startapp=pub9',
    key3: 'https://t.me/tribute/app?startapp=pubx',
    key4: 'https://t.me/tribute/app?startapp=puby',
    all: 'https://t.me/tribute/app?startapp=pubz',
    donate: 'https://t.me/tribute/app?startapp=dJwq'
};
const AUDIO_URLS = { bonus: "https://files.catbox.moe/mhz6kz.mp3" };

let userStatus = { key2: false, key3: false, key4: false };
let completed = { key2: false, key3: false };
let welcomeShown = { key2: false, key3: false, key4: false };
let currentContent = null, currentStepIndex = 0, stepHistory = [];
let activeAudio = null;

let currentLang = localStorage.getItem('app_lang') || 'ru';

// ======================== ЛОКАЛИЗАЦИЯ ИНТЕРФЕЙСА ========================
const translations = {
    ru: {
        tagline: '«Не волшебная таблетка, но близко»',
        buyAll: '🎁 Купить все ключи (2+3+4) — 2990 ₽ / $40',
        key1Name: '5 врат',
        key2Name: 'Золотое сияние',
        key3Name: 'Искусство быть',
        key4Name: 'Субстрат жизненности',
        donate: '👋 Передать привет автору',
        note: 'нажмите на ключ, чтобы начать практику',
        accessOpen: '✓ открыт доступ',
        accessClosed: '🔒 закрыт доступ',
        firstComplete: '🔓 сначала пройдите КЛЮЧ 2',
        firstComplete2: '🔓 сначала пройдите КЛЮЧ 2 и КЛЮЧ 3',
        key1Price: 'Бесплатно',
        key2Price: '890 ₽ / $12',
        key3Price: '1390 ₽ / $19',
        key4Price: '1890 ₽ / $25',
        back: '← Назад',
        toStart: '🏁 В начало',
        toHome: '🏠 На главную',
        listenPodcast: '🎧 Слушать подкаст',
        startPractice: '✨ Начать практику',
        next: 'Далее',
        answer: '✍️ Ответить',
        listenConclusion: '🎙 Слушать заключение',
        buy: '💳 Купить',
        goToKey: '🔓 Перейти к следующему ключу',
        bonusPodcastButton: '🎁 Получить бонус-подкаст',
        complete: 'Завершить'
    },
    en: {
        tagline: '"Not a magic pill, but close"',
        buyAll: '🎁 Buy all keys (2+3+4) — 2990 ₽ / $40',
        key1Name: '5 Gates',
        key2Name: 'Golden Glow',
        key3Name: 'The Art of Being',
        key4Name: 'Substrate of Vitality',
        donate: '👋 Say hi to author',
        note: 'tap on a key to start practice',
        accessOpen: '✓ access granted',
        accessClosed: '🔒 access closed',
        firstComplete: '🔓 complete KEY 2 first',
        firstComplete2: '🔓 complete KEY 2 and KEY 3 first',
        key1Price: 'Free',
        key2Price: '890 ₽ / $12',
        key3Price: '1390 ₽ / $19',
        key4Price: '1890 ₽ / $25',
        back: '← Back',
        toStart: '🏁 To start',
        toHome: '🏠 Home',
        listenPodcast: '🎧 Listen to podcast',
        startPractice: '✨ Start practice',
        next: 'Next',
        answer: '✍️ Answer',
        listenConclusion: '🎙 Listen to conclusion',
        buy: '💳 Buy',
        goToKey: '🔓 Go to next key',
        bonusPodcastButton: '🎁 Get bonus podcast',
        complete: 'Complete'
    }
};

function updateUILanguage() {
    const t = translations[currentLang];
    document.getElementById('tagline').innerText = t.tagline;
    document.getElementById('buyAllBtn').innerText = t.buyAll;
    document.getElementById('key1Name').innerText = t.key1Name;
    document.getElementById('key2Name').innerText = t.key2Name;
    document.getElementById('key3Name').innerText = t.key3Name;
    document.getElementById('key4Name').innerText = t.key4Name;
    document.getElementById('donateBtn').innerText = t.donate;
    document.getElementById('note').innerText = t.note;
    document.getElementById('key1Price').innerText = t.key1Price;
    document.getElementById('key2Price').innerText = t.key2Price;
    document.getElementById('key3Price').innerText = t.key3Price;
    document.getElementById('key4Price').innerText = t.key4Price;
    updateStatusUI();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    updateUILanguage();
    // Если открыт какой-то ключ (платный или free), перезагрузить его с новым языком
    if (currentContent) {
        // Если это платный ключ (key2-4), перезагружаем контент
        if (currentContent.key_id !== 'key1') {
            openKeyContent(currentContent.key_id);
        } else {
            // Если ключ 1, перезапускаем его локально
            startFreeKey();
        }
    }
    loadUserStatus();
}

// Обработчики переключателя языка (должны быть добавлены после загрузки DOM)
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ======================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ========================
function stopActiveAudio() { if(activeAudio) { activeAudio.pause(); activeAudio=null; } }
function formatTime(sec) { if(isNaN(sec)) return "0:00"; const m=Math.floor(sec/60); const s=Math.floor(sec%60); return `${m}:${s<10?'0'+s:s}`; }

// ======================== ЛОКАЛЬНЫЙ КЛЮЧ 1 (ДВЕ ВЕРСИИ) ========================
const freeSteps_ru = [
    { type: "welcome", content: "👋 Здравствуйте.\nМеня зовут Михаил. ... (ваш русский текст) ...", btnText: "ДА" },
    { type: "audio", audio: "https://files.catbox.moe/qipf0o.mp3", title: "🎧 Шаг 1. Настройка (3 минуты)", text: "Слушайте перед медитацией...", btnText: "ДАЛЕЕ" },
    { type: "audio", audio: "https://files.catbox.moe/udem2c.mp3", title: "🔑 Ключ 1 · 5 врат (10 минут)", text: "«Не волшебная таблетка...", btnText: "ДАЛЕЕ → интеграция" },
    { type: "audio", audio: "https://files.catbox.moe/vmafp1.mp3", title: "🧩 Шаг 3 из 4. Интеграция (7 минут)", text: "Вы прошли медитацию...", btnText: "ДАЛЕЕ" },
    { type: "bonus_podcast", content: "📝 Шаг 4 из 4. Три шага к почти волшебству...", btnText: "🎁 Получить бонус-подкаст" },
    { type: "next_key_prompt", nextKey: "key2", description: "Хотите остальные 3 ключа...\n💰 Стоимость ключа 2: 890 ₽ / $12" }
];

const freeSteps_en = [
    { type: "welcome", content: "👋 Hello.\nMy name is Mikhail...", btnText: "YES" },
    { type: "audio", audio: "https://files.catbox.moe/qipf0o.mp3", title: "🎧 Step 1. Tuning (3 minutes)", text: "Listen before meditation...", btnText: "NEXT" },
    { type: "audio", audio: "https://files.catbox.moe/udem2c.mp3", title: "🔑 Key 1 · 5 Gates (10 minutes)", text: "\"Not a magic pill, but close\"...", btnText: "NEXT → integration" },
    { type: "audio", audio: "https://files.catbox.moe/vmafp1.mp3", title: "🧩 Step 3 of 4. Integration (7 minutes)", text: "You've completed the meditation...", btnText: "NEXT" },
    { type: "bonus_podcast", content: "📝 Step 4 of 4. Three steps to almost magic...", btnText: "🎁 Get bonus podcast" },
    { type: "next_key_prompt", nextKey: "key2", description: "Do you want the remaining 3 keys...\n💰 Price of Key 2: 890 ₽ / $12" }
];

function getFreeSteps() { return currentLang === 'ru' ? freeSteps_ru : freeSteps_en; }

let freeStepIndex = 0, freeHistory = [], freeAudio = null;

function renderFreeStep() {
    const steps = getFreeSteps();
    if(freeStepIndex >= steps.length) { goHome(); return; }
    const step = steps[freeStepIndex];
    const isAudio = step.type === 'audio';
    const wrapperDiv = document.createElement('div');
    if(isAudio) { wrapperDiv.className = 'fullscreen-audio-card'; wrapperDiv.style.animation = 'fadeInUp 0.4s ease'; }
    const cardDiv = document.createElement('div'); cardDiv.className = 'meditation-card';
    let innerHtml = '';
    const t = translations[currentLang];
    if(step.type === 'welcome') {
        innerHtml = `<div class="med-title">📘 Информация</div><div class="med-sub">${step.content.replace(/\n/g,'<br>')}</div><button id="stepNextBtn" class="btn-audio">${step.btnText}</button>`;
    } else if(step.type === 'audio') {
        innerHtml = `<div class="med-title">${step.title}</div><div class="med-sub">${step.text}</div><div id="playerContainer"></div><button id="stepNextBtn" class="btn-audio">${step.btnText}</button>`;
    } else if(step.type === 'bonus_podcast') {
        innerHtml = `<div class="med-title">🎁 Бонус</div><div class="med-sub">${step.content}</div><button id="bonusPodcastBtn" class="btn-audio btn-secondary">${step.btnText}</button><button id="stepNextBtn" class="btn-audio" style="margin-top:20px;">${t.complete}</button>`;
    } else if(step.type === 'next_key_prompt') {
        const nextKey = step.nextKey, purchased = userStatus[nextKey];
        if(purchased) innerHtml = `<div class="med-title">🔓 Переход к следующему ключу</div><div class="med-sub">${step.description}</div><button id="nextKeyBtn" class="btn-audio">${t.goToKey}</button>`;
        else innerHtml = `<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${step.description}</div><button id="buyNextKeyBtn" class="btn-audio">${t.buy} (890 ₽ / $12)</button>`;
        innerHtml += `<button id="homeAfterKeyBtn" class="back-home">← ${t.toHome}</button>`;
    }
    innerHtml += `<div style="display:flex; justify-content:space-between; margin-top:20px;"><button id="stepBackBtn" class="back-home">${t.back}</button><button id="stepStartBtn" class="back-to-start">${t.toStart}</button><button id="stepHomeBtn" class="back-home">${t.toHome}</button></div>`;
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
    document.getElementById('stepNextBtn')?.addEventListener('click',()=>{ stopActiveAudio(); if(step.type === 'bonus_podcast'){ freeStepIndex++; renderFreeStep(); } else if(step.type === 'next_key_prompt'){ if(userStatus[step.nextKey]) openKeyContent(step.nextKey); else openTributePayment(TRIBUTE_LINKS[step.nextKey]); } else { freeHistory.push(freeStepIndex); freeStepIndex++; renderFreeStep(); } });
    document.getElementById('stepBackBtn')?.addEventListener('click',()=>{ stopActiveAudio(); if(step.type === 'next_key_prompt'){ goHome(); } else { if(freeHistory.length) freeStepIndex=freeHistory.pop(); else if(freeStepIndex>0) freeStepIndex--; renderFreeStep(); } });
    document.getElementById('stepStartBtn')?.addEventListener('click',()=>{ stopActiveAudio(); freeStepIndex=0; freeHistory=[]; renderFreeStep(); });
    document.getElementById('stepHomeBtn')?.addEventListener('click',()=>goHome());
    if(step.type === 'bonus_podcast') {
        document.getElementById('bonusPodcastBtn')?.addEventListener('click', (e) => { e.preventDefault(); showBonusPodcast(); });
    }
    if(step.type === 'next_key_prompt') {
        if(userStatus[step.nextKey]) document.getElementById('nextKeyBtn')?.addEventListener('click',()=>openKeyContent(step.nextKey));
        else document.getElementById('buyNextKeyBtn')?.addEventListener('click',()=>openTributePayment(TRIBUTE_LINKS[step.nextKey]));
        document.getElementById('homeAfterKeyBtn')?.addEventListener('click',()=>goHome());
    }
}

function startFreeKey() { freeStepIndex=0; freeHistory=[]; renderFreeStep(); }

// ======================== ПЛАТНЫЕ КЛЮЧИ (2,3,4) ========================
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
    const t = translations[currentLang];
    const k2=document.getElementById('key2Status'); if(k2){ k2.innerHTML=userStatus.key2 ? t.accessOpen : t.accessClosed; k2.className=userStatus.key2?'status-badge status-open':'status-badge status-closed';}
    const k3=document.getElementById('key3Status'); if(k3){ if(!userStatus.key3) k3.innerHTML=t.accessClosed; else if(userStatus.key3 && !completed.key2) k3.innerHTML=t.firstComplete; else k3.innerHTML=t.accessOpen; k3.className=(userStatus.key3 && completed.key2)?'status-badge status-open':(userStatus.key3?'status-badge status-locked':'status-badge status-closed');}
    const k4=document.getElementById('key4Status'); if(k4){ if(!userStatus.key4) k4.innerHTML=t.accessClosed; else if(userStatus.key4 && (!completed.key2 || !completed.key3)) k4.innerHTML=t.firstComplete2; else k4.innerHTML=t.accessOpen; k4.className=(userStatus.key4 && completed.key2 && completed.key3)?'status-badge status-open':'status-badge status-locked';}
}

function openTributePayment(link){ if(window.Telegram?.WebApp) window.Telegram.WebApp.openLink(link); else window.open(link,'_blank'); setTimeout(()=>loadUserStatus(),2000); }

async function loadKeyContent(keyId){
    const webApp=window.Telegram?.WebApp;
    if(!webApp?.initData) return null;
    const resp = await fetch(`${WORKER_URL}/get-content?initData=${encodeURIComponent(webApp.initData)}&key=${keyId}&lang=${currentLang}`);
    if(resp.ok) return await resp.json();
    return null;
}

function showBonusPodcast() {
    stopActiveAudio();
    const wrapper = document.createElement('div'); wrapper.className = 'fullscreen-audio-card';
    const card = document.createElement('div'); card.className = 'meditation-card';
    const t = translations[currentLang];
    card.innerHTML = `<div class="med-title">🎁 Бонус: подкаст «5 врат»</div><div class="med-sub">${currentLang === 'ru' ? 'Дополнительная аудиопрактика.' : 'Additional audio practice.'}</div><div id="bonusPlayerContainer"></div><button id="closeBonusBtn" class="btn-audio btn-secondary">${t.complete}</button>`;
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

function renderStepWithFullscreen(step, nextCallback, backCallback, homeCallback, startCallback) {
    const isAudioStep = (step.type==='audio' || step.type==='audio_with_text' || step.type==='audio_with_image');
    const wrapperDiv = document.createElement('div');
    if(isAudioStep) { wrapperDiv.className = 'fullscreen-audio-card'; wrapperDiv.style.animation = 'fadeInUp 0.4s ease'; }
    const cardDiv = document.createElement('div'); cardDiv.className = 'meditation-card';
    let innerHtml = '';
    const t = translations[currentLang];
    if(step.type==='welcome' || step.type==='text') {
        innerHtml = `<div class="med-title">📘 Информация</div><div class="med-sub">${(step.content||step.text||'').replace(/\n/g,'<br>')}</div><button id="stepNextBtn" class="btn-audio">${t.next}</button>`;
    } else if(isAudioStep) {
        innerHtml = `<div class="med-title">${step.title||'🎧 Аудио'}</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div>`;
        if(step.type==='audio_with_image') innerHtml += `<div class="image-container"><img src="${step.image}" alt="illustration" loading="lazy"></div>`;
        // Если в step.btnText уже есть перевод из KV, используем его, иначе заменяем стандартным
        let btnText = step.btnText || t.next;
        // Для замены стандартных кнопок на локализованные
        if (step.btnText === '▶ Прослушать подкаст') btnText = t.listenPodcast;
        if (step.btnText === '🎧 Начать медитацию') btnText = t.startPractice;
        if (step.btnText === '🎧 Получить подкаст') btnText = t.listenPodcast;
        if (step.btnText === '🖼️ Просмотреть картинки') btnText = '🖼️ ' + (currentLang === 'ru' ? 'Показать иллюстрации' : 'Show illustrations');
        if (step.btnText === '✍️ Далее') btnText = t.next;
        if (step.btnText === '🎧 К аудиоподкасту') btnText = t.listenConclusion;
        innerHtml += `<div id="playerContainer"></div><button id="stepNextBtn" class="btn-audio">${btnText}</button>`;
    } else if(step.type==='images_with_text') {
        let btnText = step.btnText || (currentLang === 'ru' ? 'Показать картинки' : 'Show images');
        innerHtml = `<div class="med-title">🖼️ Картинки</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div><button id="showImagesBtn" class="btn-audio btn-secondary">${btnText}</button><div id="hiddenImages" style="display:none;">${step.images.map(src=>`<div class="image-container"><img src="${src}" loading="lazy"></div>`).join('')}</div><button id="stepNextBtn" class="btn-audio" style="margin-top:20px;">${t.next} →</button>`;
    } else if(step.type==='quiz') {
        innerHtml = `<div class="med-title">📝 Осмысление</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div>${step.questions.map((q,i)=>`<div class="quiz-question">${i+1}. ${q}</div>`).join('')}<button id="stepNextBtn" class="btn-audio">${t.answer}</button>`;
    } else if(step.type==='next_key_prompt') {
        const nextKey = step.nextKey, purchased = userStatus[nextKey];
        const priceText = nextKey === 'key3' ? (currentLang === 'ru' ? '1390 ₽ / $19' : '1390 ₽ / $19') : (currentLang === 'ru' ? '1890 ₽ / $25' : '1890 ₽ / $25');
        if(purchased) innerHtml = `<div class="med-title">🔓 Переход к следующему ключу</div><div class="med-sub">${step.description||'Вы прошли этот ключ!'}</div><button id="nextKeyBtn" class="btn-audio">${t.goToKey}</button>`;
        else innerHtml = `<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${step.description||`Откройте ${nextKey==='key3'? (currentLang === 'ru' ? 'КЛЮЧ 3' : 'KEY 3') : (currentLang === 'ru' ? 'КЛЮЧ 4' : 'KEY 4')}`}</div><button id="buyNextKeyBtn" class="btn-audio">${t.buy} (${priceText})</button>`;
        innerHtml += `<button id="homeAfterKeyBtn" class="back-home">← ${t.toHome}</button>`;
    } else if(step.type==='bonus_pdf') {
        innerHtml = `<div class="med-title">📘 Бонусный материал</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div><a href="${step.pdf}" target="_blank" class="btn-audio" style="display:inline-block;">${step.btnText}</a><button id="stepNextBtn" class="btn-audio">${t.next}</button>`;
    } else if(step.type==='final_bonus') {
        innerHtml = `<div class="med-title">🎁 Завершение</div><div class="med-sub">${(step.content||'').replace(/\n/g,'<br>')}</div><button id="stepNextBtn" class="btn-audio">${step.btnText||t.complete}</button>`;
    } else if(step.type === 'bonus_podcast') {
        innerHtml = `<div class="med-title">🎁 Бонус</div><div class="med-sub">${step.content}</div><button id="bonusPodcastBtn" class="btn-audio btn-secondary">${step.btnText}</button><button id="stepNextBtn" class="btn-audio" style="margin-top:20px;">${t.complete}</button>`;
    }
    innerHtml += `<div style="display:flex; justify-content:space-between; margin-top:20px;"><button id="stepBackBtn" class="back-home">${t.back}</button><button id="stepStartBtn" class="back-to-start">${t.toStart}</button><button id="stepHomeBtn" class="back-home">${t.toHome}</button></div>`;
    cardDiv.innerHTML = innerHtml;
    wrapperDiv.appendChild(cardDiv);
    const panel = document.getElementById('dynamicPanel'); panel.innerHTML = ''; panel.appendChild(wrapperDiv);
    if(isAudioStep && step.audio) {
        const container = document.getElementById('playerContainer');
        if(container) {
            const audio = new Audio(step.audio);
            audio.preload = 'metadata';
            const playerDiv = document.createElement('div'); playerDiv.className = 'custom-player';
            playerDiv.innerHTML = `<div class="player-controls"><button class="play-btn">▶</button><span class="time">0:00 / 0:00</span><input type="range" class="seek-bar" value="0" step="0.01"><select class="speed-select"><option value="0.5">0.5x</option><option value="0.75">0.75x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></select></div>`;
            container.appendChild(playerDiv);
            const playBtn=playerDiv.querySelector('.play-btn'), timeSpan=playerDiv.querySelector('.time'), seekBar=playerDiv.querySelector('.seek-bar'), speedSelect=playerDiv.querySelector('.speed-select');
            let playing=false;
            audio.addEventListener('loadedmetadata',()=>{ if(isFinite(audio.duration)){ seekBar.max=audio.duration; timeSpan.innerText=`0:00 / ${formatTime(audio.duration)}`; } });
            audio.addEventListener('timeupdate',()=>{ if(!isNaN(audio.duration)){ seekBar.value=audio.currentTime; timeSpan.innerText=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`; } });
            audio.addEventListener('ended',()=>{ playing=false; playBtn.innerText='▶'; });
            playBtn.addEventListener('click',()=>{ if(playing){ audio.pause(); playBtn.innerText='▶'; playing=false; } else { audio.play().catch(e=>{}); playBtn.innerText='⏸'; playing=true; } });
            seekBar.addEventListener('input',()=>{ audio.currentTime=parseFloat(seekBar.value); });
            speedSelect.addEventListener('change',()=>{ audio.playbackRate=parseFloat(speedSelect.value); });
            activeAudio = audio;
        }
    }
    document.getElementById('stepNextBtn')?.addEventListener('click',()=>{ stopActiveAudio(); nextCallback(); });
    document.getElementById('stepBackBtn')?.addEventListener('click',()=>{ stopActiveAudio(); backCallback(); });
    document.getElementById('stepStartBtn')?.addEventListener('click',()=>{ stopActiveAudio(); startCallback(); });
    document.getElementById('stepHomeBtn')?.addEventListener('click',()=>{ stopActiveAudio(); homeCallback(); });
    if(step.type==='next_key_prompt'){
        if(userStatus[step.nextKey]) document.getElementById('nextKeyBtn')?.addEventListener('click',()=>openKeyContent(step.nextKey));
        else document.getElementById('buyNextKeyBtn')?.addEventListener('click',()=>openTributePayment(TRIBUTE_LINKS[step.nextKey]));
        document.getElementById('homeAfterKeyBtn')?.addEventListener('click',()=>goHome());
    }
    if(step.type==='images_with_text'){
        const showBtn=document.getElementById('showImagesBtn'), hiddenDiv=document.getElementById('hiddenImages');
        showBtn?.addEventListener('click',()=>{ if(hiddenDiv.style.display==='none'){ hiddenDiv.style.display='block'; showBtn.textContent=currentLang === 'ru' ? 'Скрыть картинки' : 'Hide images'; } else { hiddenDiv.style.display='none'; showBtn.textContent=step.btnText||(currentLang === 'ru' ? 'Показать картинки' : 'Show images'); } });
    }
    if(step.type === 'bonus_podcast') {
        document.getElementById('bonusPodcastBtn')?.addEventListener('click', (e) => { e.preventDefault(); showBonusPodcast(); });
    }
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
        ()=>{ currentStepIndex=0; stepHistory=[]; renderCurrentStep(); });
}

function goHome(){ stopActiveAudio(); document.getElementById('dynamicPanel').classList.add('hidden'); document.getElementById('homeScreen').classList.remove('hidden'); currentContent=null; loadUserStatus(); }
function showErrorAndGoHome(msg){ stopActiveAudio(); const panel=document.getElementById('dynamicPanel'); panel.innerHTML=`<div class="meditation-card error-message">⚠️ ${msg}<br><button id="errorHomeBtn" class="btn-audio">${translations[currentLang].back}</button></div>`; panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden'); document.getElementById('errorHomeBtn')?.addEventListener('click',()=>goHome()); }

async function onKeyClick(keyId){
    if(keyId === 'key1') {
        startFreeKey();
        return;
    }
    await loadUserStatus();
    if(userStatus[keyId]) {
        openKeyContent(keyId);
    } else {
        const prices={key2:'890 ₽ / $12', key3:'1390 ₽ / $19', key4:'1890 ₽ / $25'};
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
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if(btn.getAttribute('data-lang') === currentLang) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        updateUILanguage();
        loadUserStatus().then(() => goHome());
    } else {
        setTimeout(initApp, 100);
    }
}
initApp();
window.addEventListener('focus',()=>loadUserStatus());
document.addEventListener('visibilitychange', () => { if (!document.hidden) loadUserStatus(); });
setInterval(loadUserStatus, 15000);

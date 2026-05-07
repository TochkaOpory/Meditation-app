// ======================== 3D ФОН (оригинальный) ========================
(function initCosmicBackground() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02010a, 0.05);
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 7);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    const universeGroup = new THREE.Group();
    const entityGroup = new THREE.Group();
    const bodyGroup = new THREE.Group();
    scene.add(universeGroup);
    scene.add(entityGroup);
    entityGroup.add(bodyGroup);
    
    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const colorPalette = [0xffffff, 0xffd700, 0x88ccff, 0xffb288];
    for(let i=0; i<starCount; i++) {
        const r = 10 + Math.random() * 40;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        starPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i*3+2] = r * Math.cos(phi);
        const col = new THREE.Color(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
        starColors[i*3] = col.r;
        starColors[i*3+1] = col.g;
        starColors[i*3+2] = col.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.8 }));
    universeGroup.add(stars);
    
    // body particles
    const bodyPoints = [];
    function addVolumePoints(radius, height, count, offset, isSphere=true) {
        for(let i=0;i<count;i++) {
            let x,y,z;
            if(isSphere){
                const u=Math.random(), v=Math.random();
                const theta=u*2*Math.PI, phi=Math.acos(2*v-1);
                const r=Math.cbrt(Math.random())*radius;
                x=r*Math.sin(phi)*Math.cos(theta);
                y=r*Math.sin(phi)*Math.sin(theta);
                z=r*Math.cos(phi);
            } else {
                const theta=Math.random()*2*Math.PI;
                const r=Math.sqrt(Math.random())*radius;
                x=r*Math.cos(theta);
                z=r*Math.sin(theta);
                y=(Math.random()-0.5)*height;
            }
            bodyPoints.push(x+offset.x, y+offset.y, z+offset.z);
        }
    }
    addVolumePoints(0.25,0,800,{x:0,y:1.3,z:0});
    addVolumePoints(0.35,1.2,1500,{x:0,y:0.5,z:0},false);
    addVolumePoints(0.5,0.2,1000,{x:0,y:-0.1,z:0.1},false);
    addVolumePoints(0.12,0.8,400,{x:-0.45,y:0.5,z:0},false);
    addVolumePoints(0.12,0.8,400,{x:0.45,y:0.5,z:0},false);
    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(bodyPoints, 3));
    const particleBody = new THREE.Points(bodyGeo, new THREE.PointsMaterial({ color: 0xffd700, size: 0.02, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
    bodyGroup.add(particleBody);
    
    function createCenter(color, yPos, size){
        const mesh=new THREE.Mesh(new THREE.SphereGeometry(size,16,16), new THREE.MeshBasicMaterial({color, transparent:true, opacity:0.8, blending:THREE.AdditiveBlending}));
        mesh.position.y=yPos;
        const glow=new THREE.Mesh(new THREE.SphereGeometry(size*2.5,16,16), new THREE.MeshBasicMaterial({color, transparent:true, opacity:0.2, blending:THREE.AdditiveBlending, depthWrite:false}));
        mesh.add(glow);
        mesh.add(new THREE.PointLight(color,1,2));
        return mesh;
    }
    bodyGroup.add(createCenter(0xff7700,0.1,0.08), createCenter(0xffb288,0.7,0.08), createCenter(0xffffff,1.35,0.05));
    
    const idealSphere=new THREE.Mesh(new THREE.SphereGeometry(0.15,32,32), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending}));
    idealSphere.position.y=2.2;
    const idealGlow=new THREE.Mesh(new THREE.SphereGeometry(0.6,32,32), new THREE.MeshBasicMaterial({color:0xfff0aa, transparent:true, opacity:0.3, blending:THREE.AdditiveBlending}));
    idealSphere.add(idealGlow);
    idealSphere.add(new THREE.PointLight(0xffffff,2,5));
    entityGroup.add(idealSphere);
    
    const core=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,8,8), new THREE.MeshBasicMaterial({color:0xffeaa0, transparent:true, opacity:0.6, blending:THREE.AdditiveBlending}));
    core.position.y=-1;
    entityGroup.add(core);
    const crystal=new THREE.Mesh(new THREE.ConeGeometry(0.3,1,6), new THREE.MeshBasicMaterial({color:0x88ccff, transparent:true, opacity:0.7, blending:THREE.AdditiveBlending, wireframe:true}));
    crystal.position.y=-3;
    crystal.rotation.x=Math.PI;
    entityGroup.add(crystal);
    const cocoon=new THREE.Mesh(new THREE.SphereGeometry(1.4,24,24), new THREE.MeshBasicMaterial({color:0xffd700, wireframe:true, transparent:true, opacity:0.05, blending:THREE.AdditiveBlending}));
    cocoon.scale.set(1,1.4,1);
    cocoon.position.y=0.6;
    entityGroup.add(cocoon);
    
    const cascadeCount=100;
    const cascadeGeo=new THREE.BufferGeometry();
    const cascadePos=new Float32Array(cascadeCount*3);
    for(let i=0;i<cascadeCount;i++){ cascadePos[i*3]=(Math.random()-0.5)*0.1; cascadePos[i*3+1]=2.2-Math.random()*5.2; cascadePos[i*3+2]=(Math.random()-0.5)*0.1; }
    cascadeGeo.setAttribute('position', new THREE.BufferAttribute(cascadePos,3));
    const cascade=new THREE.Points(cascadeGeo, new THREE.PointsMaterial({color:0xffffff, size:0.03, transparent:true, opacity:0.8, blending:THREE.AdditiveBlending}));
    entityGroup.add(cascade);
    
    let timeAnim=0;
    function animateBackground(){
        requestAnimationFrame(animateBackground);
        timeAnim+=0.016;
        const breath=Math.sin(timeAnim*1.5);
        bodyGroup.scale.set(1+breath*0.015,1+breath*0.015,1+breath*0.015);
        cocoon.material.opacity=0.05+(Math.sin(timeAnim*2)+1)*0.03;
        cocoon.rotation.y+=0.002;
        const pulse=(Math.sin(timeAnim*3)+1)*0.5;
        idealGlow.scale.set(1+pulse*0.2,1+pulse*0.2,1+pulse*0.2);
        crystal.rotation.y+=0.01;
        universeGroup.rotation.y-=0.0005;
        universeGroup.rotation.x=Math.sin(timeAnim*0.05)*0.1;
        const positions=cascade.geometry.attributes.position.array;
        for(let i=1;i<positions.length;i+=3){ positions[i]-=0.025; if(positions[i]<-3) positions[i]=2.2; }
        cascade.geometry.attributes.position.needsUpdate=true;
        camera.position.x=Math.sin(timeAnim*0.1)*6;
        camera.position.z=Math.cos(timeAnim*0.1)*6;
        camera.position.y=1+Math.sin(timeAnim*0.2)*1.5;
        camera.lookAt(0,0.8,0);
        renderer.render(scene,camera);
    }
    animateBackground();
    window.addEventListener('resize',()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); });
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
        key4Price: '1890 ₽ / $25'
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
        key4Price: '1890 ₽ / $25'
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
    loadUserStatus(); // обновим статусы (переведутся надписи)
}

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
    { type: "welcome", content: "👋 Здравствуйте.\nМеня зовут Михаил. Я основатель школы Точка опоры.\nВы выбрали название «Не волшебная таблетка, но близко» — значит, цените честность.\nЯ не буду говорить, что вы всё бросите и улетите.\n\nЧто получите:\n🎧 3 мин — настройка перед практикой\n🎧 10 мин — первая технология (Ключ №1)\n🎧 7 мин — интеграция после практики\n🎁 Бонус — аудиоподкаст «5 врат технология»\n📝 3 шага к почти волшебству — простые действия, которые вы делаете после медитации\n\nЭто первый кирпич.\nНачнём? Нажмите ДА", btnText: "ДА" },
    { type: "audio", audio: "https://files.catbox.moe/qipf0o.mp3", title: "🎧 Шаг 1. Настройка (3 минуты)", text: "Слушайте перед медитацией. Наденьте наушники, закройте глаза.\n👇 Когда закончите, нажмите ДАЛЕЕ", btnText: "ДАЛЕЕ" },
    { type: "audio", audio: "https://files.catbox.moe/udem2c.mp3", title: "🔑 Ключ 1 · 5 врат (10 минут)", text: "«Не волшебная таблетка, но близко»\n\n🎧 10 минут тишины внутри и снаружи. Лучше заранее позаботьтесь о том, чтобы вас никто не потревожил.\n\nКак принять:\n• Наденьте наушники\n• Закройте глаза\n• Дышите свободно\n\n🌀 После окончания нажмите ДАЛЕЕ → интеграция 7 минут", btnText: "ДАЛЕЕ → интеграция" },
    { type: "audio", audio: "https://files.catbox.moe/vmafp1.mp3", title: "🧩 Шаг 3 из 4. Интеграция (7 минут)", text: "Вы прошли медитацию. Теперь — самое важное: закрепить состояние.\n🎧 Наденьте наушники, закройте глаза.\nЭтот короткий трек поможет «упаковать» ощущения в тело, чтобы они остались с вами.\n👇 Нажмите ДАЛЕЕ", btnText: "ДАЛЕЕ" },
    { type: "bonus_podcast", content: "📝 Шаг 4 из 4. Три шага к почти волшебству\n\nВы уже прослушали контент. Теперь — ваше действие (это и отличает «не таблетку» от таблетки):\n\n📝 Три шага к почти волшебству:\n1. Запишите одно ощущение, которое появилось во время или после практики.\n2. Спросите: «Что я могу сделать прямо сейчас, чтобы продлить это состояние?» — и сделайте.\n\n🎁 Ваш бонус: подкаст «5 врат медитации» — о том, какие уровни открывает регулярная практика.\nЕсли вы дошли сюда — вы уже не ищете таблетку.", btnText: "🎁 Получить бонус-подкаст" },
    { type: "next_key_prompt", nextKey: "key2", description: "Хотите остальные 3 ключа (медитации 2,3,4) по быту, душе и социуму?\n\n✨ Начните с ключа 2 «Золотое сияние» – практика для баланса в повседневности.\n\n💰 Стоимость ключа 2: 890 ₽ / $12" }
];

const freeSteps_en = [
    { type: "welcome", content: "👋 Hello.\nMy name is Mikhail. I am the founder of the School \"Point of Support\".\nYou chose the title \"Not a magic pill, but close\" – meaning you value honesty.\nI won't tell you that you'll fly away.\n\nWhat you'll get:\n🎧 3 min – pre-practice tuning\n🎧 10 min – first technology (Key #1)\n🎧 7 min – post-practice integration\n🎁 Bonus – audio podcast \"5 Gates Technology\"\n📝 3 steps to almost magic – simple actions after meditation\n\nThis is the first brick.\nShall we start? Press YES", btnText: "YES" },
    { type: "audio", audio: "https://files.catbox.moe/qipf0o.mp3", title: "🎧 Step 1. Tuning (3 minutes)", text: "Listen before meditation. Put on headphones, close your eyes.\n👇 When finished, press NEXT", btnText: "NEXT" },
    { type: "audio", audio: "https://files.catbox.moe/udem2c.mp3", title: "🔑 Key 1 · 5 Gates (10 minutes)", text: "\"Not a magic pill, but close\"\n\n🎧 10 minutes of silence inside and outside. Better make sure no one disturbs you.\n\nHow to practice:\n• Put on headphones\n• Close your eyes\n• Breathe freely\n\n🌀 After finishing, press NEXT → integration 7 min", btnText: "NEXT → integration" },
    { type: "audio", audio: "https://files.catbox.moe/vmafp1.mp3", title: "🧩 Step 3 of 4. Integration (7 minutes)", text: "You've completed the meditation. Now – the most important: stabilize the state.\n🎧 Put on headphones, close your eyes.\nThis short track will help \"pack\" the sensations into the body so they stay with you.\n👇 Press NEXT", btnText: "NEXT" },
    { type: "bonus_podcast", content: "📝 Step 4 of 4. Three steps to almost magic\n\nYou've already listened to the content. Now – your action (this is what distinguishes \"not a pill\" from a pill):\n\n📝 Three steps to almost magic:\n1. Write down one feeling that appeared during or after the practice.\n2. Ask: \"What can I do right now to prolong this state?\" – and do it.\n\n🎁 Your bonus: podcast \"5 Gates of Meditation\" – about the levels that regular practice opens.\nIf you've come this far – you are no longer looking for a pill.", btnText: "🎁 Get bonus podcast" },
    { type: "next_key_prompt", nextKey: "key2", description: "Do you want the remaining 3 keys (meditations 2,3,4) for everyday life, soul, and society?\n\n✨ Start with Key 2 \"Golden Glow\" – a practice for balance in daily life.\n\n💰 Price of Key 2: 890 ₽ / $12" }
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
    if(step.type === 'welcome') {
        innerHtml = `<div class="med-title">📘 Информация</div><div class="med-sub">${step.content.replace(/\n/g,'<br>')}</div><button id="stepNextBtn" class="btn-audio">${step.btnText}</button>`;
    } else if(step.type === 'audio') {
        innerHtml = `<div class="med-title">${step.title}</div><div class="med-sub">${step.text}</div><div id="playerContainer"></div><button id="stepNextBtn" class="btn-audio">${step.btnText}</button>`;
    } else if(step.type === 'bonus_podcast') {
        innerHtml = `<div class="med-title">🎁 Бонус</div><div class="med-sub">${step.content}</div><button id="bonusPodcastBtn" class="btn-audio btn-secondary">${step.btnText}</button><button id="stepNextBtn" class="btn-audio" style="margin-top:20px;">Завершить</button>`;
    } else if(step.type === 'next_key_prompt') {
        const nextKey = step.nextKey, purchased = userStatus[nextKey];
        if(purchased) innerHtml = `<div class="med-title">🔓 Переход к следующему ключу</div><div class="med-sub">${step.description}</div><button id="nextKeyBtn" class="btn-audio">Перейти к ключу 2</button>`;
        else innerHtml = `<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${step.description}</div><button id="buyNextKeyBtn" class="btn-audio">💳 Купить ключ 2 (890 ₽ / $12)</button>`;
        innerHtml += `<button id="homeAfterKeyBtn" class="back-home">← На главную</button>`;
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

function renderStepWithFullscreen(step, nextCallback, backCallback, homeCallback, startCallback) {
    const isAudioStep = (step.type==='audio' || step.type==='audio_with_text' || step.type==='audio_with_image');
    const wrapperDiv = document.createElement('div');
    if(isAudioStep) { wrapperDiv.className = 'fullscreen-audio-card'; wrapperDiv.style.animation = 'fadeInUp 0.4s ease'; }
    const cardDiv = document.createElement('div'); cardDiv.className = 'meditation-card';
    let innerHtml = '';
    if(step.type==='welcome' || step.type==='text') {
        innerHtml = `<div class="med-title">📘 Информация</div><div class="med-sub">${(step.content||step.text||'').replace(/\n/g,'<br>')}</div><button id="stepNextBtn" class="btn-audio">Далее</button>`;
    } else if(isAudioStep) {
        innerHtml = `<div class="med-title">${step.title||'🎧 Аудио'}</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div>`;
        if(step.type==='audio_with_image') innerHtml += `<div class="image-container"><img src="${step.image}" alt="illustration" loading="lazy"></div>`;
        innerHtml += `<div id="playerContainer"></div><button id="stepNextBtn" class="btn-audio">${step.btnText||'Далее'}</button>`;
    } else if(step.type==='images_with_text') {
        innerHtml = `<div class="med-title">🖼️ Картинки</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div><button id="showImagesBtn" class="btn-audio btn-secondary">${step.btnText||'Показать картинки'}</button><div id="hiddenImages" style="display:none;">${step.images.map(src=>`<div class="image-container"><img src="${src}" loading="lazy"></div>`).join('')}</div><button id="stepNextBtn" class="btn-audio" style="margin-top:20px;">Далее →</button>`;
    } else if(step.type==='quiz') {
        innerHtml = `<div class="med-title">📝 Осмысление</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div>${step.questions.map((q,i)=>`<div class="quiz-question">${i+1}. ${q}</div>`).join('')}<button id="stepNextBtn" class="btn-audio">${step.btnText||'Далее'}</button>`;
    } else if(step.type==='next_key_prompt') {
        const nextKey = step.nextKey, purchased = userStatus[nextKey];
        const t = translations[currentLang];
        const priceText = nextKey === 'key3' ? '1390 ₽ / $19' : '1890 ₽ / $25';
        if(purchased) innerHtml = `<div class="med-title">🔓 Переход к следующему ключу</div><div class="med-sub">${step.description||'Вы прошли этот ключ!'}</div><button id="nextKeyBtn" class="btn-audio">Перейти к следующему ключу</button>`;
        else innerHtml = `<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${step.description||`Откройте ${nextKey==='key3'?'КЛЮЧ 3':'КЛЮЧ 4'}`}</div><button id="buyNextKeyBtn" class="btn-audio">💳 Купить (${priceText})</button>`;
        innerHtml += `<button id="homeAfterKeyBtn" class="back-home">← На главную</button>`;
    } else if(step.type==='bonus_pdf') {
        innerHtml = `<div class="med-title">📘 Бонусный материал</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div><a href="${step.pdf}" target="_blank" class="btn-audio" style="display:inline-block;">${step.btnText}</a><button id="stepNextBtn" class="btn-audio">Далее</button>`;
    } else if(step.type==='final_bonus') {
        innerHtml = `<div class="med-title">🎁 Завершение</div><div class="med-sub">${(step.content||'').replace(/\n/g,'<br>')}</div><button id="stepNextBtn" class="btn-audio">${step.btnText||'Завершить'}</button>`;
    } else if(step.type === 'bonus_podcast') {
        innerHtml = `<div class="med-title">🎁 Бонус</div><div class="med-sub">${step.content}</div><button id="bonusPodcastBtn" class="btn-audio btn-secondary">${step.btnText}</button><button id="stepNextBtn" class="btn-audio" style="margin-top:20px;">Завершить</button>`;
    }
    innerHtml += `<div style="display:flex; justify-content:space-between; margin-top:20px;"><button id="stepBackBtn" class="back-home">← Назад</button><button id="stepStartBtn" class="back-to-start">🏁 В начало</button><button id="stepHomeBtn" class="back-home">🏠 На главную</button></div>`;
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
        showBtn?.addEventListener('click',()=>{ if(hiddenDiv.style.display==='none'){ hiddenDiv.style.display='block'; showBtn.textContent='Скрыть картинки'; } else { hiddenDiv.style.display='none'; showBtn.textContent=step.btnText||'Показать картинки'; } });
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

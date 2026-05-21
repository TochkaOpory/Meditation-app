// ======================== 3D ФОН ========================
(function initCosmicBackground() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02010a, 0.05);
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 7);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    const universeGroup=new THREE.Group(), entityGroup=new THREE.Group(), bodyGroup=new THREE.Group();
    scene.add(universeGroup); scene.add(entityGroup); entityGroup.add(bodyGroup);
    const starGeo=new THREE.BufferGeometry(), starCount=3000, starPos=new Float32Array(starCount*3), starColors=new Float32Array(starCount*3);
    const colorPalette=[0xffffff,0xffd700,0x88ccff,0xffb288];
    for(let i=0;i<starCount;i++){const r=10+Math.random()*40,theta=2*Math.PI*Math.random(),phi=Math.acos(2*Math.random()-1);starPos[i*3]=r*Math.sin(phi)*Math.cos(theta);starPos[i*3+1]=r*Math.sin(phi)*Math.sin(theta);starPos[i*3+2]=r*Math.cos(phi);const col=new THREE.Color(colorPalette[Math.floor(Math.random()*colorPalette.length)]);starColors[i*3]=col.r;starColors[i*3+1]=col.g;starColors[i*3+2]=col.b;}
    starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));starGeo.setAttribute('color',new THREE.BufferAttribute(starColors,3));
    universeGroup.add(new THREE.Points(starGeo,new THREE.PointsMaterial({size:0.05,vertexColors:true,transparent:true,opacity:0.8})));
    const bodyPoints=[];
    function addVol(radius,height,count,offset,isSphere=true){for(let i=0;i<count;i++){let x,y,z;if(isSphere){const u=Math.random(),v=Math.random(),theta=u*2*Math.PI,phi=Math.acos(2*v-1),r=Math.cbrt(Math.random())*radius;x=r*Math.sin(phi)*Math.cos(theta);y=r*Math.sin(phi)*Math.sin(theta);z=r*Math.cos(phi);}else{const theta=Math.random()*2*Math.PI,r=Math.sqrt(Math.random())*radius;x=r*Math.cos(theta);z=r*Math.sin(theta);y=(Math.random()-0.5)*height;}bodyPoints.push(x+offset.x,y+offset.y,z+offset.z);}}
    addVol(0.25,0,800,{x:0,y:1.3,z:0});addVol(0.35,1.2,1500,{x:0,y:0.5,z:0},false);addVol(0.5,0.2,1000,{x:0,y:-0.1,z:0.1},false);addVol(0.12,0.8,400,{x:-0.45,y:0.5,z:0},false);addVol(0.12,0.8,400,{x:0.45,y:0.5,z:0},false);
    const bodyGeo=new THREE.BufferGeometry();bodyGeo.setAttribute('position',new THREE.Float32BufferAttribute(bodyPoints,3));
    bodyGroup.add(new THREE.Points(bodyGeo,new THREE.PointsMaterial({color:0xffd700,size:0.02,transparent:true,opacity:0.4,blending:THREE.AdditiveBlending,depthWrite:false})));
    function mkCenter(color,yPos,size){const m=new THREE.Mesh(new THREE.SphereGeometry(size,16,16),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending}));m.position.y=yPos;const g=new THREE.Mesh(new THREE.SphereGeometry(size*2.5,16,16),new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.2,blending:THREE.AdditiveBlending,depthWrite:false}));m.add(g);m.add(new THREE.PointLight(color,1,2));return m;}
    bodyGroup.add(mkCenter(0xff7700,0.1,0.08),mkCenter(0xffb288,0.7,0.08),mkCenter(0xffffff,1.35,0.05));
    const idealSphere=new THREE.Mesh(new THREE.SphereGeometry(0.15,32,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending}));idealSphere.position.y=2.2;
    const idealGlow=new THREE.Mesh(new THREE.SphereGeometry(0.6,32,32),new THREE.MeshBasicMaterial({color:0xfff0aa,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending}));idealSphere.add(idealGlow);idealSphere.add(new THREE.PointLight(0xffffff,2,5));entityGroup.add(idealSphere);
    const core=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,8,8),new THREE.MeshBasicMaterial({color:0xffeaa0,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending}));core.position.y=-1;entityGroup.add(core);
    const crystal=new THREE.Mesh(new THREE.ConeGeometry(0.3,1,6),new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending,wireframe:true}));crystal.position.y=-3;crystal.rotation.x=Math.PI;entityGroup.add(crystal);
    const cocoon=new THREE.Mesh(new THREE.SphereGeometry(1.4,24,24),new THREE.MeshBasicMaterial({color:0xffd700,wireframe:true,transparent:true,opacity:0.05,blending:THREE.AdditiveBlending}));cocoon.scale.set(1,1.4,1);cocoon.position.y=0.6;entityGroup.add(cocoon);
    const cascadeCount=100,cascadeGeo=new THREE.BufferGeometry(),cascadePos=new Float32Array(cascadeCount*3);
    for(let i=0;i<cascadeCount;i++){cascadePos[i*3]=(Math.random()-0.5)*0.1;cascadePos[i*3+1]=2.2-Math.random()*5.2;cascadePos[i*3+2]=(Math.random()-0.5)*0.1;}
    cascadeGeo.setAttribute('position',new THREE.BufferAttribute(cascadePos,3));
    const cascade=new THREE.Points(cascadeGeo,new THREE.PointsMaterial({color:0xffffff,size:0.03,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending}));entityGroup.add(cascade);
    let t=0;
    function anim(){requestAnimationFrame(anim);t+=0.016;const b=Math.sin(t*1.5);bodyGroup.scale.set(1+b*0.015,1+b*0.015,1+b*0.015);cocoon.material.opacity=0.05+(Math.sin(t*2)+1)*0.03;cocoon.rotation.y+=0.002;const p=(Math.sin(t*3)+1)*0.5;idealGlow.scale.set(1+p*0.2,1+p*0.2,1+p*0.2);crystal.rotation.y+=0.01;universeGroup.rotation.y-=0.0005;universeGroup.rotation.x=Math.sin(t*0.05)*0.1;const pos=cascade.geometry.attributes.position.array;for(let i=1;i<pos.length;i+=3){pos[i]-=0.025;if(pos[i]<-3)pos[i]=2.2;}cascade.geometry.attributes.position.needsUpdate=true;camera.position.x=Math.sin(t*0.1)*6;camera.position.z=Math.cos(t*0.1)*6;camera.position.y=1+Math.sin(t*0.2)*1.5;camera.lookAt(0,0.8,0);renderer.render(scene,camera);}
    anim();
    window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});
})();

// ======================== КОНФИГ ========================
const WORKER_URL = 'https://checker.mirhaet83.workers.dev';
const TRIBUTE_LINKS = {
    key2: 'https://t.me/tribute/app?startapp=pub9',
    key3: 'https://t.me/tribute/app?startapp=pubx',
    key4: 'https://t.me/tribute/app?startapp=puby',
    all:  'https://t.me/tribute/app?startapp=pubz',
    donate: 'https://t.me/tribute/app?startapp=dJwq',
    training: 'https://t.me/tribute/app?startapp=dJwq'  // ← замените на ссылку начального обучения
};
const AUDIO_URLS = { bonus: 'https://files.catbox.moe/mhz6kz.mp3' };

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
        tagline:"«Не волшебная таблетка, но близко к тому, чтобы ты проснулся»",
        buyAllPrefix:"Купить все ключи (2+3+4)", allPrice:"2990 ₽",
        key2Title:"КЛЮЧ 2", key3Title:"КЛЮЧ 3", key4Title:"КЛЮЧ 4",
        key2Name:"Золотое сияние", key3Name:"Искусство быть", key4Name:"Субстрат жизненности",
        key2Price:"890 ₽", key3Price:"1390 ₽", key4Price:"1890 ₽",
        donate:"👋 Передать привет автору", note:"нажмите на раздел, чтобы начать",
        accessOpen:"✓ открыт доступ", accessClosed:"🔒 закрыт доступ",
        firstComplete:"🔓 сначала пройдите КЛЮЧ 2",
        firstComplete2:"🔓 сначала пройдите КЛЮЧ 2 и КЛЮЧ 3",
        back:"← Назад", toStart:"🏁 В начало", toHome:"🏠 На главную",
        next:"Далее", answer:"✍️ Ответить", buy:"💳 Купить",
        goToKey:"🔓 Перейти к следующему ключу",
        bonusPodcastButton:"🎁 Получить бонус-подкаст", complete:"Завершить",
        lblVratas:"5 ВРАТ", lblKosmo:"КОСМОЭНЕРГЕТИКА",
        btnTraining:"🎓 Записаться на начальное обучение",
        kosmoSubtitle:"Выберите блок для изучения",
        backToBlocks:"← К блокам", freqCount:"частот",
        listenPodcast:"🎧 Слушать подкаст", listenConclusion:"🎙 Слушать заключение",
    },
    en: {
        tagline:'"Not a magic pill, but close to waking you up"',
        buyAllPrefix:"Buy all keys (2+3+4)", allPrice:"$40",
        key2Title:"KEY 2", key3Title:"KEY 3", key4Title:"KEY 4",
        key2Name:"Golden Glow", key3Name:"The Art of Being", key4Name:"Substrate of Vitality",
        key2Price:"$12", key3Price:"$19", key4Price:"$25",
        donate:"👋 Say hi to author", note:"tap a section to start",
        accessOpen:"✓ access granted", accessClosed:"🔒 access closed",
        firstComplete:"🔓 complete KEY 2 first",
        firstComplete2:"🔓 complete KEY 2 and KEY 3 first",
        back:"← Back", toStart:"🏁 To start", toHome:"🏠 Home",
        next:"Next", answer:"✍️ Answer", buy:"💳 Buy",
        goToKey:"🔓 Go to next key",
        bonusPodcastButton:"🎁 Get bonus podcast", complete:"Complete",
        lblVratas:"5 GATES", lblKosmo:"KOSMOENERGETIKA",
        btnTraining:"🎓 Sign up for basic training",
        kosmoSubtitle:"Choose a block to study",
        backToBlocks:"← Back to blocks", freqCount:"frequencies",
        listenPodcast:"🎧 Listen podcast", listenConclusion:"🎙 Listen conclusion",
    }
};

function t(k){ return (T[currentLang]||T.ru)[k] || k; }

function updateUILanguage(){
    document.getElementById('tagline').innerText = t('tagline');
    document.getElementById('buyAllText').innerText = t('buyAllPrefix');
    document.getElementById('allPriceSpan').innerText = t('allPrice');
    document.getElementById('key2Title').innerText = t('key2Title');
    document.getElementById('key3Title').innerText = t('key3Title');
    document.getElementById('key4Title').innerText = t('key4Title');
    document.getElementById('key2Name').innerText = t('key2Name');
    document.getElementById('key3Name').innerText = t('key3Name');
    document.getElementById('key4Name').innerText = t('key4Name');
    document.getElementById('key2Price').innerText = t('key2Price');
    document.getElementById('key3Price').innerText = t('key3Price');
    document.getElementById('key4Price').innerText = t('key4Price');
    document.getElementById('donateBtn').innerText = t('donate');
    document.getElementById('note').innerText = t('note');
    document.getElementById('lblVratas').innerText = t('lblVratas');
    document.getElementById('lblKosmo').innerText = t('lblKosmo');
    document.getElementById('btnTraining').innerText = t('btnTraining');
    updateStatusUI();
}

function setLanguage(lang){
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    updateUILanguage();
    loadUserStatus();
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.getAttribute('data-lang'));
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ======================== ВСПОМОГАТЕЛЬНЫЕ ========================
function stopActiveAudio(){ if(activeAudio){ activeAudio.pause(); activeAudio=null; } }
function formatTime(sec){ if(isNaN(sec)) return '0:00'; const m=Math.floor(sec/60),s=Math.floor(sec%60); return `${m}:${s<10?'0'+s:s}`; }
function openLink(url){ if(window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url); else window.open(url,'_blank'); }

function buildPlayer(url, containerId){
    const c = document.getElementById(containerId); if(!c) return null;
    const audio = new Audio(url); audio.preload='metadata';
    const div = document.createElement('div'); div.className='custom-player';
    div.innerHTML=`<div class="player-controls"><button class="play-btn">▶</button><span class="time">0:00 / 0:00</span><input type="range" class="seek-bar" value="0" step="0.01"><select class="speed-select"><option value="0.5">0.5x</option><option value="0.75">0.75x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></select></div>`;
    c.appendChild(div);
    const pb=div.querySelector('.play-btn'),ts=div.querySelector('.time'),sb=div.querySelector('.seek-bar'),ss=div.querySelector('.speed-select');
    let playing=false;
    audio.addEventListener('loadedmetadata',()=>{if(isFinite(audio.duration)){sb.max=audio.duration;ts.innerText=`0:00 / ${formatTime(audio.duration)}`;}});
    audio.addEventListener('timeupdate',()=>{if(!isNaN(audio.duration)){sb.value=audio.currentTime;ts.innerText=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;}});
    audio.addEventListener('ended',()=>{playing=false;pb.innerText='▶';});
    pb.addEventListener('click',()=>{if(playing){audio.pause();pb.innerText='▶';playing=false;}else{audio.play().catch(()=>{});pb.innerText='⏸';playing=true;}});
    sb.addEventListener('input',()=>{audio.currentTime=parseFloat(sb.value);});
    ss.addEventListener('change',()=>{audio.playbackRate=parseFloat(ss.value);});
    activeAudio=audio; return audio;
}

// ======================== ГЛАВНЫЙ ЭКРАН ========================
function toggleVratasPanel(){
    vratasOpen = !vratasOpen;
    const panel = document.getElementById('vratasPanel');
    panel.classList.toggle('open', vratasOpen);
    const btn = document.getElementById('btnVratas');
    btn.style.borderColor = vratasOpen ? '#D4AF37' : '';
}

// ======================== КОСМОЭНЕРГЕТИКА ========================
function openKosmoSection(){
    stopActiveAudio();
    const panel = document.getElementById('dynamicPanel');
    const wrap = document.createElement('div');
    wrap.style.cssText='padding:20px 0;min-height:100vh;';

    const header = document.createElement('div');
    header.className='meditation-card';
    header.innerHTML=`<div class="med-title">✨ ${currentLang==='ru'?'Космоэнергетика':'Kosmoenergetika'}</div><div class="med-sub">${t('kosmoSubtitle')}</div>`;
    wrap.appendChild(header);

    const blocks=[
        {id:'vvedenie',          icon:'📖', label:'Введение',              labelEn:'Introduction'},
        {id:'buddhist',          icon:'🌸', label:'Буддийский блок',       labelEn:'Buddhist Block'},
        {id:'magical',           icon:'🔥', label:'Магический Блок',       labelEn:'Magical Block'},
        {id:'magister',          icon:'⚡', label:'Магистровый блок',      labelEn:'Magister Block'},
        {id:'zoroastr',          icon:'🕯️', label:'Зороастризм',           labelEn:'Zoroastrianism'},
        {id:'ognenniy_tsvetok',  icon:'🌸', label:'Огненный цветок',       labelEn:'Fire Flower'},
    ];

    blocks.forEach(bl=>{
        const btn=document.createElement('button');
        btn.className='kosmo-block-btn';
        const label = currentLang==='ru'?bl.label:bl.labelEn;
        const count = (KOSMO_DATA[bl.id]?.frequencies||[]).length;
        btn.innerHTML=`<span class="kosmo-block-icon">${bl.icon}</span><span class="kosmo-block-label">${label}</span><span class="kosmo-block-count">${count} ${t('freqCount')}</span>`;
        btn.addEventListener('click',()=>openKosmoBlock(bl.id));
        wrap.appendChild(btn);
    });

    const homeBtn=document.createElement('button');
    homeBtn.className='back-home'; homeBtn.style.cssText='margin-top:20px;display:block;width:100%;';
    homeBtn.innerText=`🏠 ${t('toHome')}`; homeBtn.addEventListener('click',goHome);
    wrap.appendChild(homeBtn);

    panel.innerHTML=''; panel.appendChild(wrap);
    panel.classList.remove('hidden');
    document.getElementById('homeScreen').classList.add('hidden');
}

function openKosmoBlock(blockId){
    stopActiveAudio();
    const data = KOSMO_DATA[blockId];
    if(!data) return;
    const panel = document.getElementById('dynamicPanel');
    const wrap = document.createElement('div');
    wrap.style.cssText='padding:20px 0 40px;';

    // Header
    const hdr=document.createElement('div'); hdr.className='meditation-card';
    hdr.innerHTML=`<div class="med-title">${data.title}</div><div class="med-sub">${data.intro}</div>`;
    wrap.appendChild(hdr);

    // Frequencies
    data.frequencies.forEach((freq,idx)=>{
        const card=document.createElement('div'); card.className='freq-card';
        card.innerHTML=`
            <div class="freq-header" data-idx="${idx}">
                <span class="freq-name">${freq.name}</span>
                <span class="freq-toggle">▼</span>
            </div>
            <div class="freq-body">
                <p class="freq-desc">${freq.desc}</p>
            </div>`;
        const header=card.querySelector('.freq-header');
        const body=card.querySelector('.freq-body');
        const toggle=card.querySelector('.freq-toggle');
        header.addEventListener('click',()=>{
            const open=body.classList.toggle('open');
            toggle.classList.toggle('open',open);
        });
        wrap.appendChild(card);
    });

    // Nav
    const nav=document.createElement('div');
    nav.style.cssText='display:flex;gap:10px;margin-top:20px;';
    const backBtn=document.createElement('button'); backBtn.className='back-home'; backBtn.style.flex='1';
    backBtn.innerText=t('backToBlocks'); backBtn.addEventListener('click',openKosmoSection);
    const homeBtn=document.createElement('button'); homeBtn.className='back-home'; homeBtn.style.flex='1';
    homeBtn.innerText=`🏠 ${t('toHome')}`; homeBtn.addEventListener('click',goHome);
    nav.appendChild(backBtn); nav.appendChild(homeBtn);
    wrap.appendChild(nav);

    panel.innerHTML=''; panel.appendChild(wrap);
    panel.classList.remove('hidden');
    document.getElementById('homeScreen').classList.add('hidden');
    panel.scrollTop=0;
}

// ======================== КЛЮЧ 1 — 5 ВРАТ ========================
const FREE_STEPS_RU = [
    {type:'welcome', content:'👋 Здравствуйте.\nМеня зовут Михаил. Я основатель школы Точка опоры.\nВы выбрали название «Не волшебная таблетка, но близко» — значит, цените честность.\n\nЧто получите:\n🎧 3 мин — настройка перед практикой\n🎧 10 мин — первая технология (Ключ №1)\n🎧 7 мин — интеграция после практики\n🎁 Бонус — аудиоподкаст «5 врат технология»\n📝 3 шага к почти волшебству\n\nЭто первый кирпич. Начнём? Нажмите ДА', btnText:'ДА'},
    {type:'audio', audio:'https://files.catbox.moe/qipf0o.mp3', title:'🎧 Шаг 1. Настройка (3 минуты)', text:'Слушайте перед медитацией. Наденьте наушники, закройте глаза.\n👇 Когда закончите, нажмите ДАЛЕЕ', btnText:'ДАЛЕЕ'},
    {type:'audio', audio:'https://files.catbox.moe/udem2c.mp3', title:'🔑 Ключ 1 · 5 врат (10 минут)', text:'🎧 10 минут тишины внутри и снаружи. Наденьте наушники, закройте глаза, дышите свободно.\n🌀 После окончания нажмите ДАЛЕЕ', btnText:'ДАЛЕЕ → интеграция'},
    {type:'audio', audio:'https://files.catbox.moe/vmafp1.mp3', title:'🧩 Шаг 3 из 4. Интеграция (7 минут)', text:'Вы прошли медитацию. Теперь — самое важное: закрепить состояние.\n🎧 Наденьте наушники, закройте глаза.\n👇 Нажмите ДАЛЕЕ', btnText:'ДАЛЕЕ'},
    {type:'bonus_podcast', content:'📝 Шаг 4 из 4. Три шага к почти волшебству\n\n1. Запишите одно ощущение, которое появилось во время или после практики.\n2. Спросите: «Что я могу сделать прямо сейчас, чтобы продлить это состояние?» — и сделайте.\n\n🎁 Ваш бонус: подкаст «5 врат медитации»', btnText:'🎁 Получить бонус-подкаст'},
    {type:'next_key_prompt', nextKey:'key2', description:'Хотите остальные 3 ключа по быту, душе и социуму?\n\n✨ Начните с ключа 2 «Золотое сияние»'}
];
const FREE_STEPS_EN = [
    {type:'welcome', content:"👋 Hello.\nMy name is Mikhail. I am the founder of the School \"Point of Support\".\n\nWhat you'll get:\n🎧 3 min – tuning\n🎧 10 min – Key #1\n🎧 7 min – integration\n🎁 Bonus podcast\n📝 3 steps to almost magic\n\nShall we start? Press YES", btnText:'YES'},
    {type:'audio', audio:'https://files.catbox.moe/qipf0o.mp3', title:'🎧 Step 1. Tuning (3 min)', text:'Put on headphones, close your eyes.\n👇 When finished, press NEXT', btnText:'NEXT'},
    {type:'audio', audio:'https://files.catbox.moe/udem2c.mp3', title:'🔑 Key 1 · 5 Gates (10 min)', text:'🎧 10 minutes of silence. Headphones on, eyes closed, breathe freely.\n🌀 After finishing, press NEXT', btnText:'NEXT → integration'},
    {type:'audio', audio:'https://files.catbox.moe/vmafp1.mp3', title:'🧩 Step 3 of 4. Integration (7 min)', text:"You've completed the meditation. Now – stabilize the state.\n🎧 Headphones on, eyes closed.\n👇 Press NEXT", btnText:'NEXT'},
    {type:'bonus_podcast', content:'📝 Step 4 of 4. Three steps to almost magic\n\n1. Write one feeling from the practice.\n2. Ask: "What can I do right now to prolong this state?" – and do it.\n\n🎁 Your bonus: podcast "5 Gates of Meditation"', btnText:'🎁 Get bonus podcast'},
    {type:'next_key_prompt', nextKey:'key2', description:'Want the remaining 3 keys?\n\n✨ Start with Key 2 "Golden Glow"'}
];

let freeIdx=0, freeHist=[];

function renderFreeStep(){
    const steps = currentLang==='ru'?FREE_STEPS_RU:FREE_STEPS_EN;
    if(freeIdx>=steps.length){goHome();return;}
    const step=steps[freeIdx];
    const isAudio=step.type==='audio';
    const outer=document.createElement('div');
    if(isAudio){outer.className='fullscreen-audio-card';outer.style.animation='fadeInUp 0.4s ease';}
    const card=document.createElement('div'); card.className='meditation-card';
    let html='';
    if(step.type==='welcome'){
        html=`<div class="med-title">📘 Информация</div><div class="med-sub">${step.content.replace(/\n/g,'<br>')}</div><button id="snBtn" class="btn-audio">${step.btnText}</button>`;
    } else if(isAudio){
        html=`<div class="med-title">${step.title}</div><div class="med-sub">${step.text.replace(/\n/g,'<br>')}</div><div id="playerContainer"></div><button id="snBtn" class="btn-audio">${step.btnText}</button>`;
    } else if(step.type==='bonus_podcast'){
        html=`<div class="med-title">🎁 Бонус</div><div class="med-sub">${step.content.replace(/\n/g,'<br>')}</div><button id="bpBtn" class="btn-audio btn-secondary">${step.btnText}</button><button id="snBtn" class="btn-audio" style="margin-top:16px;">${t('complete')}</button>`;
    } else if(step.type==='next_key_prompt'){
        const nk=step.nextKey, purchased=userStatus[nk];
        const price=currentLang==='ru'?'890 ₽':'$12';
        if(purchased) html=`<div class="med-title">🔓 Следующий ключ</div><div class="med-sub">${step.description.replace(/\n/g,'<br>')}</div><button id="nkBtn" class="btn-audio">${t('goToKey')}</button>`;
        else html=`<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${step.description.replace(/\n/g,'<br>')}</div><button id="nkBuyBtn" class="btn-audio">${t('buy')} (${price})</button>`;
        html+=`<button id="snHomeBtn" class="back-home" style="margin-top:12px;">← ${t('toHome')}</button>`;
    }
    html+=`<div style="display:flex;justify-content:space-between;margin-top:20px;gap:8px;"><button id="snBack" class="back-home">${t('back')}</button><button id="snStart" class="back-to-start">${t('toStart')}</button><button id="snHome" class="back-home">${t('toHome')}</button></div>`;
    card.innerHTML=html; outer.appendChild(card);
    const panel=document.getElementById('dynamicPanel'); panel.innerHTML=''; panel.appendChild(outer);
    panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
    if(isAudio&&step.audio) buildPlayer(step.audio,'playerContainer');
    document.getElementById('snBtn')?.addEventListener('click',()=>{stopActiveAudio();freeHist.push(freeIdx);freeIdx++;renderFreeStep();});
    document.getElementById('snBack')?.addEventListener('click',()=>{stopActiveAudio();if(freeHist.length)freeIdx=freeHist.pop();else if(freeIdx>0)freeIdx--;renderFreeStep();});
    document.getElementById('snStart')?.addEventListener('click',()=>{stopActiveAudio();freeIdx=0;freeHist=[];renderFreeStep();});
    document.getElementById('snHome')?.addEventListener('click',()=>{stopActiveAudio();goHome();});
    document.getElementById('bpBtn')?.addEventListener('click',e=>{e.preventDefault();showBonusPodcast();});
    if(step.type==='next_key_prompt'){
        if(userStatus[step.nextKey]) document.getElementById('nkBtn')?.addEventListener('click',()=>openKeyContent(step.nextKey));
        else document.getElementById('nkBuyBtn')?.addEventListener('click',()=>{openLink(TRIBUTE_LINKS[step.nextKey]);setTimeout(loadUserStatus,2000);});
        document.getElementById('snHomeBtn')?.addEventListener('click',goHome);
    }
}

function startFreeKey(){freeIdx=0;freeHist=[];renderFreeStep();}

// ======================== ПЛАТНЫЕ КЛЮЧИ ========================
async function loadUserStatus(){
    const webApp=window.Telegram?.WebApp;
    if(!webApp?.initData) return;
    try{
        const resp=await fetch(`${WORKER_URL}/user-status?initData=${encodeURIComponent(webApp.initData)}`);
        if(resp.ok){const d=await resp.json();userStatus={key2:!!d.key2,key3:!!d.key3,key4:!!d.key4};updateStatusUI();}
    }catch(e){console.error(e);}
}

function updateStatusUI(){
    const k2=document.getElementById('key2Status');
    if(k2){k2.innerHTML=userStatus.key2?t('accessOpen'):t('accessClosed');k2.className=userStatus.key2?'status-badge status-open':'status-badge status-closed';}
    const k3=document.getElementById('key3Status');
    if(k3){k3.innerHTML=!userStatus.key3?t('accessClosed'):(completed.key2?t('accessOpen'):t('firstComplete'));k3.className=(userStatus.key3&&completed.key2)?'status-badge status-open':(userStatus.key3?'status-badge status-locked':'status-badge status-closed');}
    const k4=document.getElementById('key4Status');
    if(k4){k4.innerHTML=!userStatus.key4?t('accessClosed'):((completed.key2&&completed.key3)?t('accessOpen'):t('firstComplete2'));k4.className=(userStatus.key4&&completed.key2&&completed.key3)?'status-badge status-open':'status-badge status-locked';}
}

function showBonusPodcast(){
    stopActiveAudio();
    const outer=document.createElement('div'); outer.className='fullscreen-audio-card';
    const card=document.createElement('div'); card.className='meditation-card';
    card.innerHTML=`<div class="med-title">🎁 Бонус: подкаст «5 врат»</div><div class="med-sub">${currentLang==='ru'?'Дополнительная аудиопрактика.':'Additional audio practice.'}</div><div id="bonusPlayer"></div><button id="closeBonusBtn" class="btn-audio btn-secondary">${t('complete')}</button>`;
    outer.appendChild(card);
    const panel=document.getElementById('dynamicPanel'); panel.innerHTML=''; panel.appendChild(outer);
    panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
    buildPlayer(AUDIO_URLS.bonus,'bonusPlayer');
    document.getElementById('closeBonusBtn').addEventListener('click',()=>{stopActiveAudio();goHome();});
}

function renderStepWithFullscreen(step,nextCb,backCb,homeCb,startCb){
    const isAudio=(step.type==='audio'||step.type==='audio_with_text'||step.type==='audio_with_image');
    const outer=document.createElement('div');
    if(isAudio){outer.className='fullscreen-audio-card';outer.style.animation='fadeInUp 0.4s ease';}
    const card=document.createElement('div'); card.className='meditation-card';
    let html='';
    const txt=v=>(v||'').replace(/\n/g,'<br>');
    if(step.type==='welcome'||step.type==='text'){
        html=`<div class="med-title">📘 Информация</div><div class="med-sub">${txt(step.content||step.text)}</div><button id="snBtn" class="btn-audio">${t('next')}</button>`;
    } else if(isAudio){
        html=`<div class="med-title">${step.title||'🎧 Аудио'}</div><div class="med-sub">${txt(step.text)}</div>`;
        if(step.type==='audio_with_image') html+=`<div class="image-container"><img src="${step.image}" loading="lazy"></div>`;
        html+=`<div id="playerContainer"></div><button id="snBtn" class="btn-audio">${step.btnText||t('next')}</button>`;
    } else if(step.type==='images_with_text'){
        html=`<div class="med-title">🖼️ Иллюстрации</div><div class="med-sub">${txt(step.text)}</div><button id="showImgsBtn" class="btn-audio btn-secondary">${step.btnText||'Показать'}</button><div id="hiddenImgs" style="display:none">${(step.images||[]).map(s=>`<div class="image-container"><img src="${s}" loading="lazy"></div>`).join('')}</div><button id="snBtn" class="btn-audio" style="margin-top:16px;">${t('next')} →</button>`;
    } else if(step.type==='quiz'){
        html=`<div class="med-title">📝 Осмысление</div><div class="med-sub">${txt(step.text)}</div>${(step.questions||[]).map((q,i)=>`<div class="quiz-question">${i+1}. ${q}</div>`).join('')}<button id="snBtn" class="btn-audio">${t('answer')}</button>`;
    } else if(step.type==='next_key_prompt'){
        const nk=step.nextKey,p=userStatus[nk];
        const price=nk==='key3'?(currentLang==='ru'?'1390 ₽':'$19'):(nk==='key4'?(currentLang==='ru'?'1890 ₽':'$25'):(currentLang==='ru'?'890 ₽':'$12'));
        if(p) html=`<div class="med-title">🔓 Следующий ключ</div><div class="med-sub">${txt(step.description)}</div><button id="nkBtn" class="btn-audio">${t('goToKey')}</button>`;
        else html=`<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${txt(step.description)}</div><button id="nkBuyBtn" class="btn-audio">${t('buy')} (${price})</button>`;
        html+=`<button id="snHomeBtn" class="back-home">← ${t('toHome')}</button>`;
    } else if(step.type==='bonus_pdf'){
        html=`<div class="med-title">📘 Бонус</div><div class="med-sub">${txt(step.text)}</div><a href="${step.pdf}" target="_blank" class="btn-audio" style="display:inline-block">${step.btnText}</a><button id="snBtn" class="btn-audio">${t('next')}</button>`;
    } else if(step.type==='final_bonus'){
        html=`<div class="med-title">🎁 Завершение</div><div class="med-sub">${txt(step.content)}</div><button id="snBtn" class="btn-audio">${step.btnText||t('complete')}</button>`;
    } else if(step.type==='bonus_podcast'){
        html=`<div class="med-title">🎁 Бонус</div><div class="med-sub">${txt(step.content)}</div><button id="bpBtn" class="btn-audio btn-secondary">${step.btnText}</button><button id="snBtn" class="btn-audio" style="margin-top:16px;">${t('complete')}</button>`;
    }
    html+=`<div style="display:flex;justify-content:space-between;margin-top:20px;gap:8px;"><button id="snBack" class="back-home">${t('back')}</button><button id="snStart" class="back-to-start">${t('toStart')}</button><button id="snHome" class="back-home">${t('toHome')}</button></div>`;
    card.innerHTML=html; outer.appendChild(card);
    const panel=document.getElementById('dynamicPanel'); panel.innerHTML=''; panel.appendChild(outer);
    if(isAudio&&step.audio) buildPlayer(step.audio,'playerContainer');
    document.getElementById('snBtn')?.addEventListener('click',()=>{stopActiveAudio();nextCb();});
    document.getElementById('snBack')?.addEventListener('click',()=>{stopActiveAudio();backCb();});
    document.getElementById('snStart')?.addEventListener('click',()=>{stopActiveAudio();startCb();});
    document.getElementById('snHome')?.addEventListener('click',()=>{stopActiveAudio();homeCb();});
    if(step.type==='next_key_prompt'){
        if(userStatus[step.nextKey]) document.getElementById('nkBtn')?.addEventListener('click',()=>openKeyContent(step.nextKey));
        else document.getElementById('nkBuyBtn')?.addEventListener('click',()=>{openLink(TRIBUTE_LINKS[step.nextKey]);setTimeout(loadUserStatus,2000);});
        document.getElementById('snHomeBtn')?.addEventListener('click',homeCb);
    }
    if(step.type==='images_with_text'){
        const sb=document.getElementById('showImgsBtn'),hd=document.getElementById('hiddenImgs');
        sb?.addEventListener('click',()=>{if(hd.style.display==='none'){hd.style.display='block';sb.textContent=currentLang==='ru'?'Скрыть':'Hide';}else{hd.style.display='none';sb.textContent=step.btnText||'Показать';}});
    }
    document.getElementById('bpBtn')?.addEventListener('click',e=>{e.preventDefault();showBonusPodcast();});
}

async function openKeyContent(keyId){
    if(!userStatus[keyId]){showError('Доступ не оплачен.');return;}
    const panel=document.getElementById('dynamicPanel');
    panel.innerHTML=`<div class="meditation-card"><div class="loading-spinner"></div> Загрузка...</div>`;
    panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
    try{
        const webApp=window.Telegram?.WebApp;
        if(!webApp?.initData) throw new Error();
        const resp=await fetch(`${WORKER_URL}/get-content?initData=${encodeURIComponent(webApp.initData)}&key=${keyId}&lang=${currentLang}`);
        if(!resp.ok) throw new Error();
        const content=await resp.json();
        if(!content?.steps) throw new Error();
        currentContent=content; currentStepIndex=0; stepHistory=[];
        if(content.steps[0]?.type==='welcome'&&welcomeShown[keyId]) currentStepIndex=1;
        renderCurrentStep();
    }catch(e){showError('Ошибка загрузки контента.');loadUserStatus();}
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

function goHome(){
    stopActiveAudio();
    document.getElementById('dynamicPanel').classList.add('hidden');
    document.getElementById('homeScreen').classList.remove('hidden');
    currentContent=null; loadUserStatus();
}

function showError(msg){
    stopActiveAudio();
    const panel=document.getElementById('dynamicPanel');
    panel.innerHTML=`<div class="meditation-card error-message">⚠️ ${msg}<br><button id="errBtn" class="btn-audio">${t('back')}</button></div>`;
    panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
    document.getElementById('errBtn')?.addEventListener('click',goHome);
}

// ======================== ИНИЦИАЛИЗАЦИЯ ========================
document.getElementById('btnVratas').addEventListener('click', toggleVratasPanel);
document.getElementById('btnKosmo').addEventListener('click', openKosmoSection);
document.getElementById('btnTraining').addEventListener('click', ()=>{ openLink(TRIBUTE_LINKS.training); });
document.getElementById('buyAllBtn').addEventListener('click', ()=>{ openLink(TRIBUTE_LINKS.all); setTimeout(loadUserStatus,2000); });
document.getElementById('donateBtn').addEventListener('click', ()=>{ openLink(TRIBUTE_LINKS.donate); });

document.querySelectorAll('.key-card').forEach(card=>{
    card.addEventListener('click',()=>{
        const key=card.dataset.key;
        if(key==='key1'){ startFreeKey(); return; }
        loadUserStatus().then(()=>{
            if(userStatus[key]) openKeyContent(key);
            else {
                const prices={key2:currentLang==='ru'?'890 ₽':'$12',key3:currentLang==='ru'?'1390 ₽':'$19',key4:currentLang==='ru'?'1890 ₽':'$25'};
                if(confirm(`${key.toUpperCase()} — ${prices[key]}\n${currentLang==='ru'?'Оплатить через Tribute?':'Pay via Tribute?'}`)){
                    openLink(TRIBUTE_LINKS[key]); setTimeout(loadUserStatus,2000);
                }
            }
        });
    });
});

try{ const s=localStorage.getItem('completed'); if(s) completed=JSON.parse(s); }catch(e){}

function initApp(){
    if(window.Telegram&&window.Telegram.WebApp){
        window.Telegram.WebApp.ready(); window.Telegram.WebApp.expand();
        document.querySelectorAll('.lang-btn').forEach(btn=>{
            btn.classList.toggle('active', btn.getAttribute('data-lang')===currentLang);
        });
        updateUILanguage();
        loadUserStatus().then(goHome);
    } else { setTimeout(initApp,100); }
}

initApp();
window.addEventListener('focus',loadUserStatus);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden) loadUserStatus(); });
setInterval(loadUserStatus,15000);

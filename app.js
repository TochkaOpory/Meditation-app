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
    
    const universeGroup = new THREE.Group();
    const entityGroup = new THREE.Group();
    const bodyGroup = new THREE.Group();
    scene.add(universeGroup);
    scene.add(entityGroup);
    entityGroup.add(bodyGroup);
    
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
        starColors[i*3] = col.r; starColors[i*3+1] = col.g; starColors[i*3+2] = col.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.8 }));
    universeGroup.add(stars);
    
    const bodyPoints = [];
    function addVolumePoints(radius, height, count, offset, isSphere=true) {
        for(let i=0;i<count;i++) {
            let x,y,z;
            if(isSphere){ const u=Math.random(),v=Math.random(); const theta=u*2*Math.PI,phi=Math.acos(2*v-1); const r=Math.cbrt(Math.random())*radius; x=r*Math.sin(phi)*Math.cos(theta); y=r*Math.sin(phi)*Math.sin(theta); z=r*Math.cos(phi); }
            else { const theta=Math.random()*2*Math.PI; const r=Math.sqrt(Math.random())*radius; x=r*Math.cos(theta); z=r*Math.sin(theta); y=(Math.random()-0.5)*height; }
            bodyPoints.push(x+offset.x, y+offset.y, z+offset.z);
        }
    }
    addVolumePoints(0.25,0,800,{x:0,y:1.3,z:0}); addVolumePoints(0.35,1.2,1500,{x:0,y:0.5,z:0},false); addVolumePoints(0.5,0.2,1000,{x:0,y:-0.1,z:0.1},false); addVolumePoints(0.12,0.8,400,{x:-0.45,y:0.5,z:0},false); addVolumePoints(0.12,0.8,400,{x:0.45,y:0.5,z:0},false);
    const bodyGeo = new THREE.BufferGeometry();
    bodyGeo.setAttribute('position', new THREE.Float32BufferAttribute(bodyPoints, 3));
    const particleBody = new THREE.Points(bodyGeo, new THREE.PointsMaterial({ color: 0xffd700, size: 0.02, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
    bodyGroup.add(particleBody);
    function createCenter(color, yPos, size){ const mesh=new THREE.Mesh(new THREE.SphereGeometry(size,16,16), new THREE.MeshBasicMaterial({color, transparent:true, opacity:0.8, blending:THREE.AdditiveBlending})); mesh.position.y=yPos; const glow=new THREE.Mesh(new THREE.SphereGeometry(size*2.5,16,16), new THREE.MeshBasicMaterial({color, transparent:true, opacity:0.2, blending:THREE.AdditiveBlending, depthWrite:false})); mesh.add(glow); mesh.add(new THREE.PointLight(color,1,2)); return mesh; }
    bodyGroup.add(createCenter(0xff7700,0.1,0.08), createCenter(0xffb288,0.7,0.08), createCenter(0xffffff,1.35,0.05));
    const idealSphere=new THREE.Mesh(new THREE.SphereGeometry(0.15,32,32), new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.9, blending:THREE.AdditiveBlending})); idealSphere.position.y=2.2; const idealGlow=new THREE.Mesh(new THREE.SphereGeometry(0.6,32,32), new THREE.MeshBasicMaterial({color:0xfff0aa, transparent:true, opacity:0.3, blending:THREE.AdditiveBlending})); idealSphere.add(idealGlow); idealSphere.add(new THREE.PointLight(0xffffff,2,5)); entityGroup.add(idealSphere);
    const core=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,8,8), new THREE.MeshBasicMaterial({color:0xffeaa0, transparent:true, opacity:0.6, blending:THREE.AdditiveBlending})); core.position.y=-1; entityGroup.add(core);
    const crystal=new THREE.Mesh(new THREE.ConeGeometry(0.3,1,6), new THREE.MeshBasicMaterial({color:0x88ccff, transparent:true, opacity:0.7, blending:THREE.AdditiveBlending, wireframe:true})); crystal.position.y=-3; crystal.rotation.x=Math.PI; entityGroup.add(crystal);
    const cocoon=new THREE.Mesh(new THREE.SphereGeometry(1.4,24,24), new THREE.MeshBasicMaterial({color:0xffd700, wireframe:true, transparent:true, opacity:0.05, blending:THREE.AdditiveBlending})); cocoon.scale.set(1,1.4,1); cocoon.position.y=0.6; entityGroup.add(cocoon);
    const cascadeCount=100; const cascadeGeo=new THREE.BufferGeometry(); const cascadePos=new Float32Array(cascadeCount*3);
    for(let i=0;i<cascadeCount;i++){ cascadePos[i*3]=(Math.random()-0.5)*0.1; cascadePos[i*3+1]=2.2-Math.random()*5.2; cascadePos[i*3+2]=(Math.random()-0.5)*0.1; }
    cascadeGeo.setAttribute('position', new THREE.BufferAttribute(cascadePos,3));
    const cascade=new THREE.Points(cascadeGeo, new THREE.PointsMaterial({color:0xffffff, size:0.03, transparent:true, opacity:0.8, blending:THREE.AdditiveBlending})); entityGroup.add(cascade);
    let timeAnim=0;
    function animateBackground(){ requestAnimationFrame(animateBackground); timeAnim+=0.016; const breath=Math.sin(timeAnim*1.5); bodyGroup.scale.set(1+breath*0.015,1+breath*0.015,1+breath*0.015); cocoon.material.opacity=0.05+(Math.sin(timeAnim*2)+1)*0.03; cocoon.rotation.y+=0.002; const pulse=(Math.sin(timeAnim*3)+1)*0.5; idealGlow.scale.set(1+pulse*0.2,1+pulse*0.2,1+pulse*0.2); crystal.rotation.y+=0.01; universeGroup.rotation.y-=0.0005; universeGroup.rotation.x=Math.sin(timeAnim*0.05)*0.1; const positions=cascade.geometry.attributes.position.array; for(let i=1;i<positions.length;i+=3){ positions[i]-=0.025; if(positions[i]<-3) positions[i]=2.2; } cascade.geometry.attributes.position.needsUpdate=true; camera.position.x=Math.sin(timeAnim*0.1)*6; camera.position.z=Math.cos(timeAnim*0.1)*6; camera.position.y=1+Math.sin(timeAnim*0.2)*1.5; camera.lookAt(0,0.8,0); renderer.render(scene,camera); }
    animateBackground();
    window.addEventListener('resize',()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); });
})();

// ======================== БАЗА ДАННЫХ КОСМОЭНЕРГЕТИКИ ========================
const KOSMO_DATA = {
    buddhist: {
        title: '🌸 Буддийский блок',
        intro: 'Частоты Буддийского блока являются основой для любой целительской деятельности космоэнергета любого уровня и решают основную массу вопросов физического, энергетического и душевного здоровья. Наработку частот начинать нужно с Буддийского блока.',
        frequencies: [
            { name: 'ФАРУН-БУДДА', desc: 'Универсальная исцеляющая частота. Лечит все заболевания, насыщает чистой энергией. Обладает заживляющим свойством — эффективна при лечении свежих ожогов и заживлении язв ЖКТ. При язве с наложением рук фиксированный срок излечения — 21 день (11 сеансов через день). Быстро выводит из обморока, шока. При сердечном приступе дать частоту в 4 чакру. Является ключом — через неё открываются все частоты Буддийского блока, за исключением Зевса.' },
            { name: 'ФИРАСТ', desc: 'Для запуска чакр, лечения энуреза, зубной боли, десен, тугоухости, тромбофлебита, снятия сглаза, порчи, колдовства, чистки квартир, офисов, товара, предметов. Можно работать на все органы (прожечь — вытянуть пепел) — чистка органа от негативной энергетики, подготовка к лечению другими частотами. В Буддийском блоке основное видение даёт Фираст.' },
            { name: 'КРАОН, ДЖИЛИУС', desc: 'Краон — мягкая частота, Джилиус — ударный. Лечат любые заболевания крови, в том числе диабет, желтуха. Сначала работаем Краон (5 сеансов), анализируем результаты. При незначительных результатах переходим на Джилиус. Общая энергетика, лотос открыт. Чистим и лечим печень (фильтр крови).' },
            { name: 'КУРФ', desc: 'Выпрямление костей черепа ребёнка при кривой головке (родовая травма). Работа при открытом родничке, бесконтактно. Внутричерепное, внутриглазное давление, глаукома — работаем полуконтактно. Лотос открыт для оттока энергии.' },
            { name: 'НИНАЛИС', desc: 'Применяется при заболеваниях сердца, гриппе, аллергии. Излечиваются любые заболевания сердца, в том числе порок сердца. Контактно на сердце работаем только после инфаркта для рассасывания рубцов. При сердечном приступе на 4 чакру дать любую частоту — приступ прекращается.' },
            { name: 'РАУН', desc: 'Алкоголизм, курение, наркотическая зависимость. Продолжительность сеанса 40 минут при закрытом лотосе. Обязательным условием является желание пациента. При ломке от героина — снимается полностью за 3–4 дня. Частоту не закрывать.' },
            { name: 'РИСУР', desc: 'Лечит почки, печень, все заболевания желудочно-кишечного тракта (инфекционные, отравления, дизентерия, холера и др.). Дублирует частоту Святой Моисей. Рисур работает сутки.' },
            { name: 'СУРИ-САНЛАЙ (СУР-САН)', desc: 'Работа на улучшение зрения. Обязательное условие — смена стёкол на -0,25 диоптрии. Работать через день. Лечение кожных заболеваний, аллергия (мягкая, обволакивающая частота). При глаукоме чередовать с Ранул.' },
            { name: 'РАНУЛ', desc: 'Работать как частотой Сурий-Санлай. Ранул — ударная частота. Сурий-Санлай — обволакивающий. Применяется при глаукоме.' },
            { name: 'СВЯТОЙ БУДДА', desc: 'Частота работает на грыжи, рубцы, послеоперационные шрамы, переломы, суставы, желудок и опухоли ЖКТ. При переломе в гипсе — кость сростётся правильно. Работаем полуконтактно, через день.' },
            { name: 'СВЯТОЙ ИИСУС', desc: 'Лечение суставов, простудных заболеваний горла, нормализация давления, снижение температуры. Полиартрит — лечится полгода. При гипертонии — после запуска чакр даём частоту 10–15 минут. При высокой температуре у ребёнка — управляемый температурный кризис.' },
            { name: 'СВЯТОЙ МОИСЕЙ', desc: 'Дыхательные пути, печень, почки, желудок, рак желудка. Пациентов с 4-й стадией рака желудка не брать. Лёгкие (включая рак, туберкулёз, воспаление), бронхи — наложением рук поочерёдно на низ и верх лёгких с оставлением дуги. Частота мягкая.' },
            { name: 'СВЯТОЙ МУХАММЕД', desc: 'Все виды аллергических заболеваний, заживление ран, уничтожение бородавок и жировиков, уничтожение волос в ненужных местах. На аллергию — универсальная. Родинки, бородавки — бесконтактно глазами. Жировики убираются Святой Мухаммед + Шаон.' },
            { name: 'СИНРАХ, СИНЛАХ', desc: 'Синрах — омоложение женщин, Синлах — мужчин. Синлах + Тата — частоты гормонального фона, работают с гормонами. Похудение, потенция. Щитовидная железа — в связке с Тата и Фираст+Шаон.' },
            { name: 'УРАЛ', desc: 'Против простуды, гриппа, менингита. Грипп — инкубационный период 21 сутки, справляемся за три дня: 1-й день — общий сеанс бесконтактно, 2-й — кризис или улучшение, 3-й — закрепляем результат. Менингит — 40–60 мин, Урал бесконтактно 2 раза в день.' },
            { name: 'ФАРУН', desc: 'Применяется при сколиозе, отложении солей, полиартрите. Общая энергетика. После сеанса энергетический массаж позвоночника. Грудной отдел (наименее подвижен) — там чаще образуются энергетические пробки, пробивается частотой Фарун.' },
            { name: 'ШАОН', desc: 'Основная функция — разбивка и выведение камней и песка. Обладает разбивающим свойством. В паре с Фирастом присутствует в 95% заболеваний. Камни из почек и желчного пузыря выходят безболезненно. Рак прямой кишки — Фираст + Шаон.' },
            { name: 'ЗЕВС', desc: 'Энергия Богов Олимпа. Универсальная частота, действует на все заболевания и усиливает действие других частот. Применяется для запуска чакр в паре с Фирастом.' },
        ]
    },
    magical: {
        title: '🔥 Магический блок',
        intro: 'Частоты Магического блока открываются после освоения Буддийского блока. Работают с тонкими планами, защитой, кармой и особыми состояниями. После наработки Буддийского блока нарабатываются частоты Магического блока.',
        frequencies: [
            { name: 'ПЕРВЫЙ МАГИЧЕСКИЙ', desc: 'Частота не нарабатывается. Прекрасно работает для снятия нижних привязок (сжигает их). При работе на снятие порчи, заговора, сглаза, проклятья — идёт мощный возврат на колдуна и заказчика. Открывается посредством мыслеобраза.' },
            { name: 'АГНИ, ХУМ', desc: 'Чистка, стрессы, депрессия. Агни — мужская энергетика + космическая частота (космический огонь). Хум — женская энергетика, космическая частота. Агни — для вызова такси (мыслеобраз: белый треугольник на голубом небе). Хум — для предотвращения драк, скандалов: при открытии частоты всё успокаивается.' },
            { name: 'АГНИ-ХУМ', desc: 'Даёт нейтральную энергию. Для получения: над головой и ниже 1-й чакры — два фильтра. Агни — энергия сверху, Хум — снизу. Удерживать 20–40 минут. Смешение в 3 и 4 чакрах. Нейтральная энергия идёт по меридианам в руки и передаётся пациенту.' },
            { name: 'АНАЭЛЬ', desc: 'Частота любви. Прикладная, нет лечебного фактора. При ссоре — на участников ссоры. Пьяный — быстро и тихо ляжет спать. Начальник вызывает на ковёр — на начальника. Женщине кто-то понравился — на уровне подсознания мужчину тянет к ней.' },
            { name: 'БОНН', desc: 'Частота летающих йогов. Применяется для работы с тяжелобольными, не встающими с постели, и инсультниками. Даётся в конце сеанса при закрытом лотосе. Через 40 минут больной может подняться, появляется лёгкость. Свежий инсульт — в конце сеанса Бонн, через неделю поднимется с постели. Частоту не закрывать.' },
            { name: 'ГЕКАТТА', desc: 'Женская энергетика. Лечит трещины на сосках, при отсутствии молока. При лечении гинекологии. Увеличение груди на 1,5 размера. При мастопатии частоту не использовать.' },
            { name: 'ДО', desc: 'Выходы в астральное клише. Первые наработки — лёжа. Под подушку положить вещь-якорь. Поймать момент между бодрствованием и дрёмой (3–10 сек). Выход происходит в астральное клише, поэтому информация не абсолютно достоверна. Минимальная ошибка — 20%.' },
            { name: 'ЗОЛОТАЯ ПИРАМИДА', desc: 'Чистка и защита пациента и больших территорий от эпидемий. Для Магистра — База Махатма. Для остальных — Золотая пирамида. Открывается мыслеобразом. Пример: в Ташкенте была эпидемия холеры, группа из 7 космоэнергетов работала с городом — никто не умер.' },
            { name: 'ЛУЛИ', desc: 'Частотой лучше не пользоваться. ДЦП — кармическое заболевание. Общая энергетика и один раз дать Сутра-Карма. Положительные результаты через год.' },
            { name: 'ЛУГРА', desc: 'Частота лечения животных. У овчарки — энтерит и чумка лечатся. Работает бесконтактно. Можно открыть на большую территорию (ферму). Частоту не закрывать.' },
            { name: 'ЛУННЫЙ СВЕТ', desc: 'Анестезия. На травму не работает. Почечная колика — сначала Фираст + моторчик-колодец + разрез, потом Лунный свет. Открывается мыслеобразом. На зубную боль срабатывает через 20 минут.' },
            { name: 'МАМА', desc: 'Планетарная частота с отрицательной женской энергетикой, идёт из центра Земли. Для тяжелобольных и подавления стрессов (женская энергетика). Колодец открывается автоматически — сам забирает всю грязь. Открывается в конце сеанса.' },
            { name: 'МИДИ, ГЕКТАС', desc: 'Миди — планетарная частота Духов природы (-). Гектас — космическая (+). Дают информацию в лечебных ситуациях (мыслеобраз). На природе: открыть Миди — дух природы почувствует и оставит в покое. На рыбалке, в лесу. Для считывания информации с пациента. Для встречи людей (должник придёт сам).' },
            { name: 'ОСВЯЩЕНИЕ ПРЕДМЕТОВ', desc: 'Заряжает предметы божественной чистой энергией. Работа с золотом, украшениями. Для чистки вещей умершего — открыть частоту на шкаф. Нельзя работать на деньги.' },
            { name: 'РАТХА', desc: 'Защита космоэнергета. Открывается в исключительных случаях. Если на уровне решено, что человек действительно обидел — Ратха откроется. Если космоэнергет простил обидчика — частота работает в 2 раза сильней. Для закрытия обидчик должен попросить прощения от души. На близких не открывается.' },
            { name: 'СУТРА КАРМА', desc: 'Снятие кармы, наработанной родственниками (6 поколений). Открывается когда медленно идёт излечение. Иногда спонтанно — пациент может смеяться, рыдать. Частота открывается один раз. Закрыть сами не можем. Проявления: злость, апатия, стыдливость — признак хорошей работы.' },
            { name: 'ТАТА', desc: 'Работает на нормализацию веса. Тата + Синрах (Синлах) 30–40 минут. При похудении есть только когда очень хочется. Всегда иметь еду при себе. За компанию не есть — иначе результата не будет.' },
            { name: 'ТИТАН', desc: 'Для запуска чакр методом видения в золоте. Только когда Зевс + Фираст не справляются. Даёт энергетический дисбаланс — многие под Титаном падают. После использования 2–3 сеанса восстанавливать энергетику.' },
            { name: 'ТОР', desc: 'Не нарабатывать. Разбивка тяжёлых масс тёмной энергетики (мигрень, тяжёлая головная боль, почечная колика). Открывается мыслеобразом. На голову — не более 5–7 ударов. Вытяжка после работы обязательна.' },
            { name: 'ХУТТА', desc: 'Управлению и контролю не подлежит. Закрывается после выполнения функции. Проявления: обострения, кризис, смех, рыдания — признак работы. Может проявить себя на энергетическом уровне. Если отработала в течение 12 дней — повторно не ранее чем через 2–3 недели. Открывается в конце сеанса.' },
            { name: 'РИНАЛТИ', desc: 'Относительно новая частота. Против колорадского жука и тли в сельском хозяйстве. При воздействии на человека — избавление от глистной инвазии. Устраняет перхоть, вызванную грибком. Некоторые виды кожных грибков при обработке заряженной водой.' },
        ]
    },
    magister: {
        title: '⚡ Магистровый блок',
        intro: 'Частоты уровня Магистра. При наработанных Буддийском и Магическом блоках Магистровский блок практически не нарабатывается. Требуют высокого уровня ответственности и соответствующего посвящения.',
        frequencies: [
            { name: 'АСС', desc: 'Применяется против адептов (энергетических двойников, колдунов) — лишает их силы. При планетарном нападении открыть на себя. При выходе на 2–3-й уровни встречают адепты — канал лишает их силы.' },
            { name: 'АСТРАЛЬНЫЙ ПОРОШОК', desc: 'Для работы нужна специальная пиала (никто не должен касаться). Набрать порошок в руку-лодочку, назвав Космическое имя. Чистит и лечит все заболевания. Даётся в ограниченных количествах. Собирается для конкретного пациента. Как правило приходит умирающий — вся доза ему, и через 3 дня — чудо.' },
            { name: 'ВУДУ', desc: 'Канал с отрицательной женской энергетикой. Не нарабатывается. Для смены решений человека. Держать 2–3 месяца. При работе более 6 месяцев — психические изменения. Канал ШИВА нейтрализует ВУДУ.' },
            { name: 'ГЛАИХ', desc: 'Уничтожение забытых и переродившихся фантомов, демонических сущностей, чистка квартир. Открывается по магической схеме. Забытый фантом через 21–24 дня перерождается в демоническую сущность. При открытии канала — период полураспада сущности начинается в доли секунды.' },
            { name: 'ДИСТА, ТАККЕ', desc: 'Каналы-убийцы сущностей и уничтожения противников. Есть цивилизации без души — на них работать можно. На людей с душой работать нельзя.' },
            { name: 'ДХАНВАНТАРИ', desc: 'Лечебный канал Магистра и выше. При проблемах со здоровьем — открыть канал (достаточно подумать). Открывать только на своего ученика, просто космоэнергета в исключительных случаях (например, если умирает). На мастера открыть нельзя.' },
            { name: 'КАНАЛ ФАНТОМНЫХ ОПЕРАЦИЙ', desc: 'Поставить пациента или положить. Эфирная оболочка в 3–4 см от тела. Надуть на 2–3 см. Сделать шаг из себя. Дать установку на оздоровление. Фантом умнее нас в сто тысяч раз, но интеллекта нет. Скорость фантома — около 300 км/ч. Всегда забирать фантомов.' },
            { name: 'ЛЕЙ-ГУНН', desc: 'Выход не просто в астральное клише, но на уровни и в параллельные миры. Вверх — 11 уровней (+), вниз — 13 уровней (первый +, начиная со второго -). Нижний мир даёт знания: диагностика, свойства трав, кристаллов, общение с животными.' },
            { name: 'МЕKТАБУ', desc: 'Защита Магистров на уровнях. При открытии поле сжимается до 3–4 метров (становится как камень). Страх выдавливается на оболочку и передаётся угрозе. Для срабатывания Магистр должен быть уверен на 100%.' },
            { name: 'МИЛУТИ, СИРИУС', desc: 'Сверхкосмические информационные каналы. Дают выходы на Высший Космический Разум, любую информацию по познанию космоса. При наработке начнёте считывать информацию, не выходя на уровни. Полученная информация закрытого типа — нельзя никому говорить.' },
            { name: 'НАЛЛИ', desc: 'Космическо-планетарный канал. Для путешествий по планетам и галактикам (Юпитер, Марс). Хорошо работает в паре с Лей-Гунн. Если приглашают что-либо посмотреть — приглашение не принимать. Путешествовать одному.' },
            { name: 'НИРВАНА', desc: 'Канал работает на раковые заболевания (кроме рака желудка 4-й степени). Сеанс не менее 30 минут. Без точного диагноза (подтверждённого биопсией) не работать — иначе космоэнергет получает рак в том же органе. На себя открывать запрещается.' },
            { name: 'СУЛИЯ', desc: 'Канал сильней Ратхи. Открыть только осознанно. Загрузит карму детей до 7-го колена. Космоэнергет живёт на Земле последний раз и уйдёт в высшие миры.' },
            { name: 'ТОКА-ТОН', desc: 'Канал супер-любви. В течение полугода — большая любовь, потом остуда, ненависть. Лучше пользоваться Анаэль — открывать его постоянно.' },
            { name: 'ПАН', desc: 'Бог лесов, шутник, озорник. Даёт возможность подписать бумаги у руководства, уговорить. Важно поймать момент и вовремя поблагодарить и отпустить канал, иначе испортит. Если не отпустить — начальник порвёт уже подписанное заявление.' },
            { name: 'ПЕРУН', desc: 'Бог огня. Защита при выходе на уровни, избавление от энергосущностей, лечит простуду и любые заболевания лёгких. Столб (не опускается). Открывается мыслеобразом. При лёгкой простуде — тепло, при воспалении лёгких — жарко, всё течёт.' },
            { name: 'ПИРВА', desc: 'Канал-убийца на космических уровнях и против магии при враждебных действиях. Работать до полного уничтожения враждебного влияния. Сила воздействия зависит от наработки.' },
            { name: 'ТУ, УККО, АЙСКЕ', desc: 'Защита, контакты в параллельных мирах, развитие видения. Открывать только на себя. Нарабатывать каждый отдельно, затем соединять: Ту+Укко, Ту+Айске, Ту+Укко+Айске. Не менее 20 мин при каждом варианте. Чистят трикуту.' },
            { name: 'УЛЬГЕНЬ', desc: 'Против НЛО плазмоидных из параллельных миров. При контакте голосов — открыть Ульгень. Плазмоидное НЛО растворится мгновенно. В случае физического НЛО — срабатывает автоматически. Действует против навязчивого человека — через 3 мин. вспомнит о чём-то и уйдёт.' },
            { name: 'ШИВА', desc: 'Интеллектуальный канал. Увеличение памяти, интеллекта, способности к языкам. Для снятия привязок, нейтрализации магии. Перед экзаменом открыть на ребёнка за 20–30 минут — перед глазами будут вставать страницы, вспомнит всё. Нейтрализует ВУДУ.' },
        ]
    },
    block4: {
        title: '🌌 Блок Хутта (4-й блок)',
        intro: 'Блок Хутта включает в себя около 800 частот. Для квалифицированной работы требуется видение и соответствующие настройки — уровень Магистра. Это наиболее глубокий и сложный уровень системы космоэнергетики.',
        frequencies: [
            { name: 'БЛОК ХУТТА — ОБЩЕЕ', desc: 'Блок содержит около 800 частот. Работа с ним требует развитого видения, уровня Магистра и соответствующих посвящений. Частоты этого блока работают с самыми глубокими уровнями энергетики человека, планеты и космоса. Посвящение в блок Хутта является одним из высших в системе космоэнергетики.' },
            { name: 'ХУТТА (ключевая)', desc: 'Управлению и контролю не подлежит. Закрывается после выполнения определённой функции. Проявления: обострения, кризис, смех, рыдания. Если Хутта отработала в течение 12 дней (резкое улучшение + исчезновение проявлений), повторно не ранее чем через 2–3 недели. Создаёт вибрации вокруг пациента (маленькие золотые червячки). Открывается в конце сеанса между 4 и 5 чакрой.' },
            { name: 'РАБОТА НА УРОВНЯХ', desc: 'Для работы с блоком Хутта необходим навык выхода на уровни (До, Лей-Гунн). Вверх 11 уровней со знаком плюс, вниз — 13 уровней. Первый нижний уровень — Мир духов природы. На уровнях никому не доверять. Любой адепт магии может считать мозг и принять любой образ.' },
            { name: 'ВИДЕНИЕ', desc: 'Видение — одно из главных итоговых задач космоэнергетического обучения. Развивается через практику с частотами Буддийского, Магического и Магистровского блоков. Основное видение в Буддийском блоке даёт Фираст. Видение в золоте — Титан (осторожно).' },
        ]
    },
    zoroastr: {
        title: '🕯️ Эгрегорный Зороастризм',
        intro: 'Для работы требуются свечи и дым растительного содержания. Одна свеча — одно желание. Желание должно быть реальным. По каналам идут мыслеобразы. Лучше частоты не смешивать. Исполнение желания от 2 часов до 2 месяцев. При работе лучше иметь дома лампадку и поддерживать огонь постоянно.',
        frequencies: [
            { name: 'МИТРА', desc: 'Универсальная рассеивающая частота. Работает на исполнение любых желаний. Признак того, что желание принято — мурашки по коже. Мыслеобраз: юноша в золотых доспехах.' },
            { name: 'ХУМО (Богиня счастья)', desc: 'Счастье, благополучие в доме, удача, фортуна, благосостояние. Мыслеобраз: тень пролетающей птицы за плечами пациента.' },
            { name: 'ХУББИ (Богиня воды)', desc: 'Оберегает от наводнений, землетрясений, засухи и других стихийных бедствий, связанных с ними несчастий в доме и во время путешествий. Работает на погоду. Мыслеобраз: контур человека в тумане.' },
            { name: 'МИТРИХ (Бог войны)', desc: 'Изгнание бесов. Мыслеобраз: бородатый воин в доспехах.' },
            { name: 'НАХИД / АНАХИТА (Богиня Любви)', desc: 'Приносит в дом счастье, достаток и успокоение. Лечит бесплодие, если пациентку не отталкивает от вас. Мыслеобраз: белая птица с золотыми крыльями и серебрённой головой.' },
            { name: 'ЙЕДИНЕ', desc: 'Работает на любую защиту, в том числе на порыв вуали астрала, помогает при лечении шизофрении. Мыслеобраз: тень щита воина.' },
            { name: 'МАХ (Луна)', desc: 'Лечение бешенства, детских болезней и болезней, вызванных женской энергетикой, снимает бессонницу у стариков, лунатизм, депрессии. Мыслеобраз: полная луна, от неё идёт свет. Свет луны нейтрализует женскую энергетику.' },
            { name: 'ДЕЕН', desc: 'Чистка квартир, любовь. Мыслеобраз: четвёрка белых запряжённых коней.' },
            { name: 'ЭШМА (Демон похоти)', desc: 'Растительная частота, демон. Может применяться для того, чтобы соблазнить мужчину (женщину).' },
            { name: 'СРАУШЬ (Культ мёртвых)', desc: 'Уничтожение полтергейстов, мытарей и шумов в квартире. Пользоваться редко. Мыслеобраз: чёрная мельница или чёрный кабан.' },
            { name: 'АХРИМАН (Бог зла)', desc: 'Работает на зло. На гуманоиды — не трогать (сродни Ратха). Если открывать 2–4 раза в год — может перебить все остальные частоты. Пользоваться только когда совсем достали, не более одного раза в год. Мыслеобраз: чёрный страшный человек в чёрной одежде.' },
            { name: 'ОГНЕННЫЙ ЦВЕТОК', desc: '1. Предназначен для насыщения огненной энергией человека (приведения в чувства). 2. Бесконтактного запуска чакр человека.' },
        ]
    }
};

// ======================== ОСНОВНАЯ ЛОГИКА ========================
const WORKER_URL = 'https://checker.mirhaet83.workers.dev';
const TRIBUTE_LINKS = {
    key2: 'https://t.me/tribute/app?startapp=pub9',
    key3: 'https://t.me/tribute/app?startapp=pubx',
    key4: 'https://t.me/tribute/app?startapp=puby',
    all: 'https://t.me/tribute/app?startapp=pubz',
    donate: 'https://t.me/tribute/app?startapp=dJwq',
    training: 'https://t.me/tribute/app?startapp=dJwq' // ← замените на реальную ссылку обучения
};
const AUDIO_URLS = { bonus: "https://files.catbox.moe/mhz6kz.mp3" };

let userStatus = { key2: false, key3: false, key4: false };
let completed = { key2: false, key3: false };
let welcomeShown = { key2: false, key3: false, key4: false };
let currentContent = null, currentStepIndex = 0, stepHistory = [];
let activeAudio = null;
let currentLang = localStorage.getItem('app_lang') || 'ru';

// ======================== ЛОКАЛИЗАЦИЯ ========================
const translations = {
    ru: {
        tagline: '«Не волшебная таблетка, но близко к тому, чтобы ты проснулся»',
        buyAllPrefix: 'Купить все ключи (2+3+4)',
        allPrice: '2990 ₽',
        key2Title: 'КЛЮЧ 2', key3Title: 'КЛЮЧ 3', key4Title: 'КЛЮЧ 4',
        key2Name: 'Золотое сияние', key3Name: 'Искусство быть', key4Name: 'Субстрат жизненности',
        key2Price: '890 ₽', key3Price: '1390 ₽', key4Price: '1890 ₽',
        donate: '👋 Передать привет автору',
        note: 'нажмите на раздел, чтобы начать',
        accessOpen: '✓ открыт доступ', accessClosed: '🔒 закрыт доступ',
        firstComplete: '🔓 сначала пройдите КЛЮЧ 2',
        firstComplete2: '🔓 сначала пройдите КЛЮЧ 2 и КЛЮЧ 3',
        back: '← Назад', toStart: '🏁 В начало', toHome: '🏠 На главную',
        listenPodcast: '🎧 Слушать подкаст', startPractice: '✨ Начать практику',
        next: 'Далее', answer: '✍️ Ответить', listenConclusion: '🎙 Слушать заключение',
        buy: '💳 Купить', goToKey: '🔓 Перейти к следующему ключу',
        bonusPodcastButton: '🎁 Получить бонус-подкаст', complete: 'Завершить',
        key2PriceShort: '890 ₽', key3PriceShort: '1390 ₽', key4PriceShort: '1890 ₽', allPriceShort: '2990 ₽',
        btnVratas: '🔑 5 ВРАТ', btnKosmo: '✨ КОСМОЭНЕРГЕТИКА',
        btnTraining: '🎓 Записаться на начальное обучение',
        kosmoTitle: 'Космоэнергетика', kosmoSubtitle: 'Выберите блок для изучения',
        backToBlocks: '← К блокам',
        freqCount: 'частот',
    },
    en: {
        tagline: '"Not a magic pill, but close to waking you up"',
        buyAllPrefix: 'Buy all keys (2+3+4)',
        allPrice: '$40',
        key2Title: 'KEY 2', key3Title: 'KEY 3', key4Title: 'KEY 4',
        key2Name: 'Golden Glow', key3Name: 'The Art of Being', key4Name: 'Substrate of Vitality',
        key2Price: '$12', key3Price: '$19', key4Price: '$25',
        donate: '👋 Say hi to author',
        note: 'tap a section to start',
        accessOpen: '✓ access granted', accessClosed: '🔒 access closed',
        firstComplete: '🔓 complete KEY 2 first',
        firstComplete2: '🔓 complete KEY 2 and KEY 3 first',
        back: '← Back', toStart: '🏁 To start', toHome: '🏠 Home',
        listenPodcast: '🎧 Listen to podcast', startPractice: '✨ Start practice',
        next: 'Next', answer: '✍️ Answer', listenConclusion: '🎙 Listen to conclusion',
        buy: '💳 Buy', goToKey: '🔓 Go to next key',
        bonusPodcastButton: '🎁 Get bonus podcast', complete: 'Complete',
        key2PriceShort: '$12', key3PriceShort: '$19', key4PriceShort: '$25', allPriceShort: '$40',
        btnVratas: '🔑 5 GATES', btnKosmo: '✨ KOSMOENERGETIKA',
        btnTraining: '🎓 Sign up for basic training',
        kosmoTitle: 'Kosmoenergetika', kosmoSubtitle: 'Choose a block to study',
        backToBlocks: '← Back to blocks',
        freqCount: 'frequencies',
    }
};

function updateUILanguage() {
    const t = translations[currentLang];
    document.getElementById('tagline').innerText = t.tagline;
    document.getElementById('buyAllText').innerText = t.buyAllPrefix;
    document.getElementById('allPriceSpan').innerText = t.allPrice;
    document.getElementById('key2Title').innerText = t.key2Title;
    document.getElementById('key3Title').innerText = t.key3Title;
    document.getElementById('key4Title').innerText = t.key4Title;
    document.getElementById('key2Name').innerText = t.key2Name;
    document.getElementById('key3Name').innerText = t.key3Name;
    document.getElementById('key4Name').innerText = t.key4Name;
    document.getElementById('key2Price').innerText = t.key2Price;
    document.getElementById('key3Price').innerText = t.key3Price;
    document.getElementById('key4Price').innerText = t.key4Price;
    document.getElementById('donateBtn').innerText = t.donate;
    document.getElementById('note').innerText = t.note;
    document.getElementById('btnVratas').innerText = t.btnVratas;
    document.getElementById('btnKosmo').innerText = t.btnKosmo;
    document.getElementById('btnTraining').innerText = t.btnTraining;
    updateStatusUI();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    updateUILanguage();
    if (currentContent) {
        if (currentContent.key_id !== 'key1') openKeyContent(currentContent.key_id);
        else startFreeKey();
    }
    loadUserStatus();
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// ======================== ВСПОМОГАТЕЛЬНЫЕ ========================
function stopActiveAudio() { if(activeAudio) { activeAudio.pause(); activeAudio=null; } }
function formatTime(sec) { if(isNaN(sec)) return "0:00"; const m=Math.floor(sec/60); const s=Math.floor(sec%60); return `${m}:${s<10?'0'+s:s}`; }

// ======================== КОСМОЭНЕРГЕТИКА ========================
function openKosmoSection() {
    stopActiveAudio();
    const t = translations[currentLang];
    const panel = document.getElementById('dynamicPanel');
    panel.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'padding: 20px 0; min-height: 100vh;';
    
    const header = document.createElement('div');
    header.className = 'meditation-card';
    header.innerHTML = `
        <div class="med-title">✨ ${t.kosmoTitle}</div>
        <div class="med-sub" style="margin-bottom:8px;">${t.kosmoSubtitle}</div>
    `;
    wrapper.appendChild(header);
    
    const blocks = [
        { id: 'buddhist', icon: '🌸', label: 'Буддийский блок', labelEn: 'Buddhist Block', count: KOSMO_DATA.buddhist.frequencies.length },
        { id: 'magical',  icon: '🔥', label: 'Магический Блок', labelEn: 'Magical Block', count: KOSMO_DATA.magical.frequencies.length },
        { id: 'magister', icon: '⚡', label: 'Магистровый блок', labelEn: 'Magister Block', count: KOSMO_DATA.magister.frequencies.length },
        { id: 'block4',   icon: '🌌', label: '4-й Блок (Хутта)', labelEn: '4th Block (Khutta)', count: KOSMO_DATA.block4.frequencies.length },
        { id: 'zoroastr', icon: '🕯️', label: 'Зороастризм', labelEn: 'Zoroastrianism', count: KOSMO_DATA.zoroastr.frequencies.length },
    ];
    
    blocks.forEach(block => {
        const btn = document.createElement('button');
        btn.className = 'kosmo-block-btn';
        const label = currentLang === 'ru' ? block.label : block.labelEn;
        btn.innerHTML = `
            <span class="kosmo-block-icon">${block.icon}</span>
            <span class="kosmo-block-label">${label}</span>
            <span class="kosmo-block-count">${block.count} ${t.freqCount}</span>
        `;
        btn.addEventListener('click', () => openKosmoBlock(block.id));
        wrapper.appendChild(btn);
    });
    
    const homeBtn = document.createElement('button');
    homeBtn.className = 'back-home';
    homeBtn.style.cssText = 'margin-top: 20px; display: block; width: 100%;';
    homeBtn.innerText = `🏠 ${t.toHome}`;
    homeBtn.addEventListener('click', () => goHome());
    wrapper.appendChild(homeBtn);
    
    panel.appendChild(wrapper);
    panel.classList.remove('hidden');
    document.getElementById('homeScreen').classList.add('hidden');
}

function openKosmoBlock(blockId) {
    stopActiveAudio();
    const t = translations[currentLang];
    const data = KOSMO_DATA[blockId];
    const panel = document.getElementById('dynamicPanel');
    panel.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'padding: 20px 0; min-height: 100vh;';
    
    // Header card
    const headerCard = document.createElement('div');
    headerCard.className = 'meditation-card';
    headerCard.innerHTML = `
        <div class="med-title">${data.title}</div>
        <div class="med-sub">${data.intro}</div>
    `;
    wrapper.appendChild(headerCard);
    
    // Frequencies list
    data.frequencies.forEach((freq, idx) => {
        const freqCard = document.createElement('div');
        freqCard.className = 'freq-card';
        freqCard.innerHTML = `
            <div class="freq-header" id="freq-header-${blockId}-${idx}">
                <span class="freq-name">${freq.name}</span>
                <span class="freq-toggle">▼</span>
            </div>
            <div class="freq-body" id="freq-body-${blockId}-${idx}" style="display:none;">
                <p class="freq-desc">${freq.desc}</p>
            </div>
        `;
        freqCard.querySelector('.freq-header').addEventListener('click', () => {
            const body = document.getElementById(`freq-body-${blockId}-${idx}`);
            const toggle = freqCard.querySelector('.freq-toggle');
            if (body.style.display === 'none') {
                body.style.display = 'block';
                toggle.style.transform = 'rotate(180deg)';
                toggle.style.transition = 'transform 0.3s';
            } else {
                body.style.display = 'none';
                toggle.style.transform = 'rotate(0deg)';
            }
        });
        wrapper.appendChild(freqCard);
    });
    
    // Nav buttons
    const navDiv = document.createElement('div');
    navDiv.style.cssText = 'display:flex; justify-content:space-between; margin-top:20px; gap:10px;';
    navDiv.innerHTML = `
        <button id="backToBlocksBtn" class="back-home" style="flex:1;">${t.backToBlocks}</button>
        <button id="backHomeFromBlock" class="back-home" style="flex:1;">🏠 ${t.toHome}</button>
    `;
    wrapper.appendChild(navDiv);
    
    panel.appendChild(wrapper);
    panel.classList.remove('hidden');
    document.getElementById('homeScreen').classList.add('hidden');
    
    document.getElementById('backToBlocksBtn').addEventListener('click', () => openKosmoSection());
    document.getElementById('backHomeFromBlock').addEventListener('click', () => goHome());
    
    // Scroll to top
    panel.scrollTop = 0;
}

// ======================== ЛОКАЛЬНЫЙ КЛЮЧ 1 (5 ВРАТ) ========================
const freeSteps_ru = [
    { type: "welcome", content: "👋 Здравствуйте.\nМеня зовут Михаил. Я основатель школы Точка опоры.\nВы выбрали название «Не волшебная таблетка, но близко» — значит, цените честность.\nЯ не буду говорить, что вы всё бросите и улетите.\n\nЧто получите:\n🎧 3 мин — настройка перед практикой\n🎧 10 мин — первая технология (Ключ №1)\n🎧 7 мин — интеграция после практики\n🎁 Бонус — аудиоподкаст «5 врат технология»\n📝 3 шага к почти волшебству — простые действия, которые вы делаете после медитации\n\nЭто первый кирпич.\nНачнём? Нажмите ДА", btnText: "ДА" },
    { type: "audio", audio: "https://files.catbox.moe/qipf0o.mp3", title: "🎧 Шаг 1. Настройка (3 минуты)", text: "Слушайте перед медитацией. Наденьте наушники, закройте глаза.\n👇 Когда закончите, нажмите ДАЛЕЕ", btnText: "ДАЛЕЕ" },
    { type: "audio", audio: "https://files.catbox.moe/udem2c.mp3", title: "🔑 Ключ 1 · 5 врат (10 минут)", text: "«Не волшебная таблетка, но близко»\n\n🎧 10 минут тишины внутри и снаружи. Лучше заранее позаботьтесь о том, чтобы вас никто не потревожил.\n\nКак принять:\n• Наденьте наушники\n• Закройте глаза\n• Дышите свободно\n\n🌀 После окончания нажмите ДАЛЕЕ → интеграция 7 минут", btnText: "ДАЛЕЕ → интеграция" },
    { type: "audio", audio: "https://files.catbox.moe/vmafp1.mp3", title: "🧩 Шаг 3 из 4. Интеграция (7 минут)", text: "Вы прошли медитацию. Теперь — самое важное: закрепить состояние.\n🎧 Наденьте наушники, закройте глаза.\nЭтот короткий трек поможет «упаковать» ощущения в тело, чтобы они остались с вами.\n👇 Нажмите ДАЛЕЕ", btnText: "ДАЛЕЕ" },
    { type: "bonus_podcast", content: "📝 Шаг 4 из 4. Три шага к почти волшебству\n\nВы уже прослушали контент. Теперь — ваше действие (это и отличает «не таблетку» от таблетки):\n\n📝 Три шага к почти волшебству:\n1. Запишите одно ощущение, которое появилось во время или после практики.\n2. Спросите: «Что я могу сделать прямо сейчас, чтобы продлить это состояние?» — и сделайте.\n\n🎁 Ваш бонус: подкаст «5 врат медитации» — о том, какие уровни открывает регулярная практика.\nЕсли вы дошли сюда — вы уже не ищете таблетку.", btnText: "🎁 Получить бонус-подкаст" },
    { type: "next_key_prompt", nextKey: "key2", description: "Хотите остальные 3 ключа (медитации 2,3,4) по быту, душе и социуму?\n\n✨ Начните с ключа 2 «Золотое сияние» – практика для баланса в повседневности." }
];

const freeSteps_en = [
    { type: "welcome", content: "👋 Hello.\nMy name is Mikhail. I am the founder of the School \"Point of Support\".\nYou chose the title \"Not a magic pill, but close\" – meaning you value honesty.\nI won't tell you that you'll fly away.\n\nWhat you'll get:\n🎧 3 min – pre-practice tuning\n🎧 10 min – first technology (Key #1)\n🎧 7 min – post-practice integration\n🎁 Bonus – audio podcast \"5 Gates Technology\"\n📝 3 steps to almost magic – simple actions after meditation\n\nThis is the first brick.\nShall we start? Press YES", btnText: "YES" },
    { type: "audio", audio: "https://files.catbox.moe/qipf0o.mp3", title: "🎧 Step 1. Tuning (3 minutes)", text: "Listen before meditation. Put on headphones, close your eyes.\n👇 When finished, press NEXT", btnText: "NEXT" },
    { type: "audio", audio: "https://files.catbox.moe/udem2c.mp3", title: "🔑 Key 1 · 5 Gates (10 minutes)", text: "\"Not a magic pill, but close\"\n\n🎧 10 minutes of silence inside and outside.\n\nHow to practice:\n• Put on headphones\n• Close your eyes\n• Breathe freely\n\n🌀 After finishing, press NEXT → integration 7 min", btnText: "NEXT → integration" },
    { type: "audio", audio: "https://files.catbox.moe/vmafp1.mp3", title: "🧩 Step 3 of 4. Integration (7 minutes)", text: "You've completed the meditation. Now – the most important: stabilize the state.\n🎧 Put on headphones, close your eyes.\n👇 Press NEXT", btnText: "NEXT" },
    { type: "bonus_podcast", content: "📝 Step 4 of 4. Three steps to almost magic\n\nYou've already listened to the content. Now – your action:\n\n📝 Three steps:\n1. Write down one feeling that appeared during or after the practice.\n2. Ask: \"What can I do right now to prolong this state?\" – and do it.\n\n🎁 Your bonus: podcast \"5 Gates of Meditation\".\nIf you've come this far – you are no longer looking for a pill.", btnText: "🎁 Get bonus podcast" },
    { type: "next_key_prompt", nextKey: "key2", description: "Do you want the remaining 3 keys (meditations 2,3,4)?\n\n✨ Start with Key 2 \"Golden Glow\" – a practice for balance in daily life." }
];

function getFreeSteps() { return currentLang === 'ru' ? freeSteps_ru : freeSteps_en; }
let freeStepIndex = 0, freeHistory = [], freeAudio = null;

function buildAudioPlayer(audioUrl, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';
    const playerDiv = document.createElement('div');
    playerDiv.className = 'custom-player';
    playerDiv.innerHTML = `<div class="player-controls"><button class="play-btn">▶</button><span class="time">0:00 / 0:00</span><input type="range" class="seek-bar" value="0" step="0.01"><select class="speed-select"><option value="0.5">0.5x</option><option value="0.75">0.75x</option><option value="1" selected>1x</option><option value="1.25">1.25x</option><option value="1.5">1.5x</option><option value="2">2x</option></select></div>`;
    container.appendChild(playerDiv);
    const playBtn=playerDiv.querySelector('.play-btn'), timeSpan=playerDiv.querySelector('.time'), seekBar=playerDiv.querySelector('.seek-bar'), speedSelect=playerDiv.querySelector('.speed-select');
    let playing=false;
    audio.addEventListener('loadedmetadata',()=>{ if(isFinite(audio.duration)){ seekBar.max=audio.duration; timeSpan.innerText=`0:00 / ${formatTime(audio.duration)}`; }});
    audio.addEventListener('timeupdate',()=>{ if(!isNaN(audio.duration)){ seekBar.value=audio.currentTime; timeSpan.innerText=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`; }});
    audio.addEventListener('ended',()=>{ playing=false; playBtn.innerText='▶'; });
    playBtn.addEventListener('click',()=>{ if(playing){ audio.pause(); playBtn.innerText='▶'; playing=false; } else { audio.play().catch(e=>{}); playBtn.innerText='⏸'; playing=true; }});
    seekBar.addEventListener('input',()=>{ audio.currentTime=parseFloat(seekBar.value); });
    speedSelect.addEventListener('change',()=>{ audio.playbackRate=parseFloat(speedSelect.value); });
    activeAudio = audio;
    return audio;
}

function renderFreeStep() {
    const steps = getFreeSteps();
    if(freeStepIndex >= steps.length) { goHome(); return; }
    const step = steps[freeStepIndex];
    const isAudio = step.type === 'audio';
    const wrapperDiv = document.createElement('div');
    if(isAudio) { wrapperDiv.className = 'fullscreen-audio-card'; wrapperDiv.style.animation = 'fadeInUp 0.4s ease'; }
    const cardDiv = document.createElement('div'); cardDiv.className = 'meditation-card';
    const t = translations[currentLang];
    let innerHtml = '';
    if(step.type === 'welcome') {
        innerHtml = `<div class="med-title">📘 Информация</div><div class="med-sub">${step.content.replace(/\n/g,'<br>')}</div><button id="stepNextBtn" class="btn-audio">${step.btnText}</button>`;
    } else if(step.type === 'audio') {
        innerHtml = `<div class="med-title">${step.title}</div><div class="med-sub">${step.text.replace(/\n/g,'<br>')}</div><div id="playerContainer"></div><button id="stepNextBtn" class="btn-audio">${step.btnText}</button>`;
    } else if(step.type === 'bonus_podcast') {
        innerHtml = `<div class="med-title">🎁 Бонус</div><div class="med-sub">${step.content.replace(/\n/g,'<br>')}</div><button id="bonusPodcastBtn" class="btn-audio btn-secondary">${step.btnText}</button><button id="stepNextBtn" class="btn-audio" style="margin-top:20px;">${t.complete}</button>`;
    } else if(step.type === 'next_key_prompt') {
        const nextKey = step.nextKey, purchased = userStatus[nextKey];
        const priceText = currentLang === 'ru' ? '890 ₽' : '$12';
        if(purchased) innerHtml = `<div class="med-title">🔓 Следующий ключ</div><div class="med-sub">${step.description.replace(/\n/g,'<br>')}</div><button id="nextKeyBtn" class="btn-audio">${t.goToKey}</button>`;
        else innerHtml = `<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${step.description.replace(/\n/g,'<br>')}</div><button id="buyNextKeyBtn" class="btn-audio">${t.buy} (${priceText})</button>`;
        innerHtml += `<button id="homeAfterKeyBtn" class="back-home" style="margin-top:12px;">← ${t.toHome}</button>`;
    }
    innerHtml += `<div style="display:flex; justify-content:space-between; margin-top:20px;"><button id="stepBackBtn" class="back-home">${t.back}</button><button id="stepStartBtn" class="back-to-start">${t.toStart}</button><button id="stepHomeBtn" class="back-home">${t.toHome}</button></div>`;
    cardDiv.innerHTML = innerHtml;
    wrapperDiv.appendChild(cardDiv);
    const panel = document.getElementById('dynamicPanel'); panel.innerHTML = ''; panel.appendChild(wrapperDiv);
    panel.classList.remove('hidden'); document.getElementById('homeScreen').classList.add('hidden');
    if(step.type === 'audio' && step.audio) buildAudioPlayer(step.audio, 'playerContainer');
    document.getElementById('stepNextBtn')?.addEventListener('click',()=>{ stopActiveAudio(); if(step.type === 'bonus_podcast'){ freeStepIndex++; renderFreeStep(); } else { freeHistory.push(freeStepIndex); freeStepIndex++; renderFreeStep(); }});
    document.getElementById('stepBackBtn')?.addEventListener('click',()=>{ stopActiveAudio(); if(freeHistory.length) freeStepIndex=freeHistory.pop(); else if(freeStepIndex>0) freeStepIndex--; renderFreeStep(); });
    document.getElementById('stepStartBtn')?.addEventListener('click',()=>{ stopActiveAudio(); freeStepIndex=0; freeHistory=[]; renderFreeStep(); });
    document.getElementById('stepHomeBtn')?.addEventListener('click',()=>goHome());
    if(step.type === 'bonus_podcast') document.getElementById('bonusPodcastBtn')?.addEventListener('click', (e)=>{ e.preventDefault(); showBonusPodcast(); });
    if(step.type === 'next_key_prompt') {
        if(userStatus[step.nextKey]) document.getElementById('nextKeyBtn')?.addEventListener('click',()=>openKeyContent(step.nextKey));
        else document.getElementById('buyNextKeyBtn')?.addEventListener('click',()=>openTributePayment(TRIBUTE_LINKS[step.nextKey]));
        document.getElementById('homeAfterKeyBtn')?.addEventListener('click',()=>goHome());
    }
}

function startFreeKey() { freeStepIndex=0; freeHistory=[]; renderFreeStep(); }

// ======================== ПЛАТНЫЕ КЛЮЧИ ========================
async function loadUserStatus() {
    const webApp = window.Telegram?.WebApp;
    if(!webApp?.initData) return;
    try{
        const resp = await fetch(`${WORKER_URL}/user-status?initData=${encodeURIComponent(webApp.initData)}`);
        if(resp.ok) { const data = await resp.json(); userStatus = { key2:!!data.key2, key3:!!data.key3, key4:!!data.key4 }; updateStatusUI(); }
    } catch(e){ console.error(e); }
}

function updateStatusUI(){
    const t = translations[currentLang];
    const k2=document.getElementById('key2Status'); if(k2){ k2.innerHTML=userStatus.key2?t.accessOpen:t.accessClosed; k2.className=userStatus.key2?'status-badge status-open':'status-badge status-closed';}
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
    buildAudioPlayer(AUDIO_URLS.bonus, 'bonusPlayerContainer');
    document.getElementById('closeBonusBtn').addEventListener('click',()=>{ stopActiveAudio(); goHome(); });
}

function renderStepWithFullscreen(step, nextCallback, backCallback, homeCallback, startCallback) {
    const isAudioStep = (step.type==='audio' || step.type==='audio_with_text' || step.type==='audio_with_image');
    const wrapperDiv = document.createElement('div');
    if(isAudioStep) { wrapperDiv.className = 'fullscreen-audio-card'; wrapperDiv.style.animation = 'fadeInUp 0.4s ease'; }
    const cardDiv = document.createElement('div'); cardDiv.className = 'meditation-card';
    const t = translations[currentLang];
    let innerHtml = '';
    if(step.type==='welcome' || step.type==='text') {
        innerHtml = `<div class="med-title">📘 Информация</div><div class="med-sub">${(step.content||step.text||'').replace(/\n/g,'<br>')}</div><button id="stepNextBtn" class="btn-audio">${t.next}</button>`;
    } else if(isAudioStep) {
        innerHtml = `<div class="med-title">${step.title||'🎧 Аудио'}</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div>`;
        if(step.type==='audio_with_image') innerHtml += `<div class="image-container"><img src="${step.image}" alt="illustration" loading="lazy"></div>`;
        let btnText = step.btnText || t.next;
        innerHtml += `<div id="playerContainer"></div><button id="stepNextBtn" class="btn-audio">${btnText}</button>`;
    } else if(step.type==='images_with_text') {
        let btnText = step.btnText || (currentLang === 'ru' ? 'Показать картинки' : 'Show images');
        innerHtml = `<div class="med-title">🖼️ Картинки</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div><button id="showImagesBtn" class="btn-audio btn-secondary">${btnText}</button><div id="hiddenImages" style="display:none;">${step.images.map(src=>`<div class="image-container"><img src="${src}" loading="lazy"></div>`).join('')}</div><button id="stepNextBtn" class="btn-audio" style="margin-top:20px;">${t.next} →</button>`;
    } else if(step.type==='quiz') {
        innerHtml = `<div class="med-title">📝 Осмысление</div><div class="med-sub">${(step.text||'').replace(/\n/g,'<br>')}</div>${step.questions.map((q,i)=>`<div class="quiz-question">${i+1}. ${q}</div>`).join('')}<button id="stepNextBtn" class="btn-audio">${t.answer}</button>`;
    } else if(step.type==='next_key_prompt') {
        const nextKey = step.nextKey, purchased = userStatus[nextKey];
        let priceText = nextKey==='key3'?(currentLang==='ru'?'1390 ₽':'$19'):(nextKey==='key4'?(currentLang==='ru'?'1890 ₽':'$25'):(currentLang==='ru'?'890 ₽':'$12'));
        if(purchased) innerHtml = `<div class="med-title">🔓 Переход к следующему ключу</div><div class="med-sub">${step.description||'Вы прошли этот ключ!'}</div><button id="nextKeyBtn" class="btn-audio">${t.goToKey}</button>`;
        else innerHtml = `<div class="med-title">🔒 Следующий ключ</div><div class="med-sub">${step.description||''}</div><button id="buyNextKeyBtn" class="btn-audio">${t.buy} (${priceText})</button>`;
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
    if(isAudioStep && step.audio) buildAudioPlayer(step.audio, 'playerContainer');
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
        showBtn?.addEventListener('click',()=>{ if(hiddenDiv.style.display==='none'){ hiddenDiv.style.display='block'; showBtn.textContent=currentLang==='ru'?'Скрыть картинки':'Hide images'; } else { hiddenDiv.style.display='none'; showBtn.textContent=step.btnText||(currentLang==='ru'?'Показать картинки':'Show images'); }});
    }
    if(step.type === 'bonus_podcast') document.getElementById('bonusPodcastBtn')?.addEventListener('click', (e)=>{ e.preventDefault(); showBonusPodcast(); });
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
    if(keyId === 'key1') { startFreeKey(); return; }
    await loadUserStatus();
    if(userStatus[keyId]) { openKeyContent(keyId); }
    else {
        const priceText = currentLang==='ru'?{key2:'890 ₽',key3:'1390 ₽',key4:'1890 ₽'}:{key2:'$12',key3:'$19',key4:'$25'};
        if(confirm(`${keyId.toUpperCase()} — ${priceText[keyId]}\n${currentLang==='ru'?'Оплатить через Tribute?':'Pay via Tribute?'}`)) openTributePayment(TRIBUTE_LINKS[keyId]);
    }
}

// ======================== НАЗНАЧЕНИЕ ОБРАБОТЧИКОВ ========================
document.querySelectorAll('.key-card').forEach(card=>{ card.addEventListener('click',()=>{ onKeyClick(card.dataset.key); }); });
document.getElementById('buyAllBtn')?.addEventListener('click',()=>openTributePayment(TRIBUTE_LINKS.all));
document.getElementById('donateBtn')?.addEventListener('click',()=>openTributePayment(TRIBUTE_LINKS.donate));
document.getElementById('btnVratas')?.addEventListener('click',()=>{ startFreeKey(); });
document.getElementById('btnKosmo')?.addEventListener('click',()=>{ openKosmoSection(); });
document.getElementById('btnTraining')?.addEventListener('click',()=>{ openTributePayment(TRIBUTE_LINKS.training); });

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
    } else { setTimeout(initApp, 100); }
}

try {
    const savedCompleted = localStorage.getItem('completed');
    if(savedCompleted) completed = JSON.parse(savedCompleted);
} catch(e) {}

initApp();
window.addEventListener('focus',()=>loadUserStatus());
document.addEventListener('visibilitychange', () => { if (!document.hidden) loadUserStatus(); });
setInterval(loadUserStatus, 15000);

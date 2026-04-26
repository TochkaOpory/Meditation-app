// ОСНОВНАЯ ЛОГИКА ПРИЛОЖЕНИЯ
const STORAGE_KEY = "meditation_progress";
const TRACKER_KEY = "meditation_tracker";

// ========== ЗАГРУЗКА СПИСКА МЕДИТАЦИЙ ==========
function renderMeditationList() {
    const container = document.getElementById("meditationList");
    if (!container) return;

    const savedProgress = getProgress();

    container.innerHTML = MEDITATIONS.map(med => {
        const isCompleted = savedProgress.completed.includes(med.id);
        const isCurrent = savedProgress.current === med.id;
        const cardClass = isCurrent ? "card card-active" : "card";

        return `
            <div class="${cardClass}" data-id="${med.id}">
                <div class="meditation-header">
                    <span class="meditation-title">${med.title}</span>
                    <span class="meditation-duration">${med.duration}</span>
                </div>
                <div class="meditation-desc">${med.description}</div>
                ${isCompleted ? '<div style="font-size:12px; color:#84cc16; margin-bottom:8px;">✓ Завершено</div>' : ''}
                <button class="btn-play" data-id="${med.id}" data-audio="${med.audioUrl}" data-title="${med.title}">▶ Слушать</button>
                <button class="btn-next" data-id="${med.id}" data-next="true">→ Далее (отметить завершённым)</button>
            </div>
        `;
    }).join("");

    // вешаем обработчики
    document.querySelectorAll('.btn-play').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const url = btn.dataset.audio;
            const title = btn.dataset.title;
            playMeditation(id, url, title);
        });
    });

    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            markAsCompleted(id);
            autoSuggestNext(id);
        });
    });
}

// ========== ПЛЕЕР ==========
function playMeditation(id, audioUrl, title) {
    const audio = document.getElementById("audioPlayer");
    const source = document.getElementById("audioSource");
    const nowPlayingTitle = document.getElementById("nowPlayingTitle");
    const nowPlayingStatus = document.getElementById("nowPlayingStatus");

    if (!audio || !source) return;

    // сохраняем текущую медитацию в прогресс
    const progress = getProgress();
    progress.current = id;
    saveProgress(progress);

    source.src = audioUrl;
    audio.load();
    audio.play().catch(e => console.log("Автовоспроизведение заблокировано:", e));

    if (nowPlayingTitle) nowPlayingTitle.innerText = title;
    if (nowPlayingStatus) nowPlayingStatus.innerText = "🎧 Слушаю...";

    // подсветка активной карточки
    renderMeditationList();

    // когда трек закончился — предложить отметить завершённым
    audio.onended = () => {
        if (nowPlayingStatus) nowPlayingStatus.innerText = "✅ Завершено. Нажмите «Далее» в карточке, чтобы отметить.";
    };
}

// ========== ПРОГРЕСС ==========
function getProgress() {
    const defaultProgress = {
        completed: [],      // массив id завершённых медитаций
        current: null       // id текущей медитации
    };
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultProgress;
    try {
        return JSON.parse(saved);
    } catch(e) {
        return defaultProgress;
    }
}

function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    updateProgressUI();
}

function markAsCompleted(medId) {
    const progress = getProgress();
    if (!progress.completed.includes(medId)) {
        progress.completed.push(medId);
        saveProgress(progress);
        renderMeditationList();

        // добавим вибрацию, если доступно (Telegram Haptic)
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
        }
    }
}

// авто-предложение следующей медитации
function autoSuggestNext(currentId) {
    const currentIndex = MEDITATIONS.findIndex(m => m.id === currentId);
    if (currentIndex !== -1 && currentIndex + 1 < MEDITATIONS.length) {
        const nextMed = MEDITATIONS[currentIndex + 1];
        setTimeout(() => {
            if (confirm(`✨ Следующая ступень — «${nextMed.title}». Начать сейчас?`)) {
                playMeditation(nextMed.id, nextMed.audioUrl, nextMed.title);
            }
        }, 500);
    } else {
        // это была последняя медитация
        const allCompleted = MEDITATIONS.every(m => getProgress().completed.includes(m.id));
        if (allCompleted) {
            setTimeout(() => {
                alert("🎉 Поздравляю! Вы прошли все 4 ключа. «Не волшебная таблетка, но близко» — система освоена. Закрепляйте практикой каждый день.");
            }, 300);
        }
    }
}

function updateProgressUI() {
    const progress = getProgress();
    const percent = Math.round((progress.completed.length / MEDITATIONS.length) * 100);
    const percentElem = document.getElementById("progressPercent");
    const fillElem = document.getElementById("progressFill");
    if (percentElem) percentElem.innerText = `${percent}%`;
    if (fillElem) fillElem.style.width = `${percent}%`;
}

// ========== БОНУС-ТРЕКЕР ==========
function getTracker() {
    const defaultTracker = { dates: [] };
    const saved = localStorage.getItem(TRACKER_KEY);
    if (!saved) return defaultTracker;
    try {
        return JSON.parse(saved);
    } catch(e) {
        return defaultTracker;
    }
}

function saveTracker(tracker) {
    localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
    renderTracker();
}

function markToday() {
    const today = new Date().toISOString().split('T')[0];
    const tracker = getTracker();
    if (!tracker.dates.includes(today)) {
        tracker.dates.push(today);
        saveTracker(tracker);
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
        }
    } else {
        alert("Сегодня вы уже отмечали практику");
    }
}

function renderTracker() {
    const container = document.getElementById("daysGrid");
    if (!container) return;

    const tracker = getTracker();
    const today = new Date().toISOString().split('T')[0];

    // последние 14 дней
    const days = [];
    for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const isCompleted = tracker.dates.includes(dateStr);
        days.push({ date: dateStr, completed: isCompleted });
    }

    container.innerHTML = days.map(day => `
        <div class="day-circle ${day.completed ? 'completed' : ''}" data-date="${day.date}">
            ${new Date(day.date).getDate()}
        </div>
    `).join("");

    // клик по кружку, чтобы отметить сегодня
    const todayCircle = container.querySelector(`.day-circle[data-date="${today}"]`);
    if (todayCircle && !tracker.dates.includes(today)) {
        todayCircle.style.cursor = "pointer";
        todayCircle.addEventListener("click", (e) => {
            e.stopPropagation();
            markToday();
        });
    }
}

function resetTracker() {
    if (confirm("Сбросить календарь практик? Все ваши отметки удалятся.")) {
        saveTracker({ dates: [] });
    }
}

// ========== ЗАГРУЗКА ПРИЛОЖЕНИЯ ==========
function init() {
    renderMeditationList();
    updateProgressUI();
    renderTracker();

    // кнопка сброса трекера
    const resetBtn = document.getElementById("resetTrackerBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", resetTracker);
    }

    // интеграция с Telegram WebApp
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.setHeaderColor("bg_color");
    }
}

init();

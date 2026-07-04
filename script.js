// ===== STATE MANAGEMENT =====
const state = {
    currentDate: new Date(),
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: null,
    cycleDay: 12,
    totalCycleDays: 28,
    periodDays: 5,
    lastPeriodStart: null,
    symptoms: [],
    mood: null,
    intensity: 3,
    periodLog: {},
    cycleHistory: []
};

// ===== DOM ELEMENTS =====
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthEl = document.getElementById('currentMonth');
const cycleDayEl = document.getElementById('cycleDay');
const daysUntilPeriodEl = document.getElementById('daysUntilPeriod');
const currentCycleDayEl = document.getElementById('currentCycleDay');
const fertilityStatusEl = document.getElementById('fertilityStatus');

// ===== SYMPTOMS DATA =====
const symptoms = [
    { id: 'cramps', icon: 'fa-solid fa-bolt', label: 'Cramps' },
    { id: 'headache', icon: 'fa-solid fa-head-side-virus', label: 'Headache' },
    { id: 'bloating', icon: 'fa-solid fa-circle-exclamation', label: 'Bloating' },
    { id: 'fatigue', icon: 'fa-solid fa-bed', label: 'Fatigue' },
    { id: 'mood_swings', icon: 'fa-solid fa-face-smile', label: 'Mood Swings' },
    { id: 'acne', icon: 'fa-solid fa-face-frown', label: 'Acne' },
    { id: 'back_pain', icon: 'fa-solid fa-spine', label: 'Back Pain' },
    { id: 'nausea', icon: 'fa-solid fa-stomach', label: 'Nausea' },
    { id: 'breast_tenderness', icon: 'fa-solid fa-heart-pulse', label: 'Breast Tenderness' },
    { id: 'cravings', icon: 'fa-solid fa-utensils', label: 'Cravings' }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Set default last period start to 12 days ago
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 12);
    state.lastPeriodStart = defaultDate;
    
    // Set form default
    document.getElementById('lastPeriodStart').value = formatDateInput(defaultDate);
    document.getElementById('cycleLength').value = state.totalCycleDays;
    document.getElementById('periodDuration').value = state.periodDays;
    
    renderCalendar();
    updateDashboard();
    renderSymptoms();
    setupEventListeners();
    initChart();
});

// ===== CALENDAR =====
function renderCalendar() {
    const month = state.currentMonth;
    const year = state.currentYear;
    
    currentMonthEl.textContent = new Date(year, month).toLocaleString('default', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    let html = '';
    
    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(name => {
        html += `<div class="day-name">${name}</div>`;
    });
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        html += `<div class="day other-month"></div>`;
    }
    
    // Days
    const periodDays = getPeriodDays();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toDateString();
        const isToday = dateString === today.toDateString();
        const isPeriod = periodDays.includes(day);
        const isFertile = isFertileDay(day);
        
        let classes = 'day';
        if (isToday) classes += ' today';
        if (isPeriod) classes += ' period';
        if (isFertile) classes += ' fertile';
        if (state.selectedDate && dateString === state.selectedDate.toDateString()) {
            classes += ' selected';
        }
        
        html += `<div class="${classes}" data-day="${day}" data-month="${month}" data-year="${year}" onclick="selectDay(${day}, ${month}, ${year})">
            ${day}
        </div>`;
    }
    
    calendarGrid.innerHTML = html;
}

function getPeriodDays() {
    if (!state.lastPeriodStart) return [];
    
    const startDate = new Date(state.lastPeriodStart);
    const days = [];
    
    for (let i = 0; i < state.periodDays; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        if (d.getMonth() === state.currentMonth && d.getFullYear() === state.currentYear) {
            days.push(d.getDate());
        }
    }
    return days;
}

function isFertileDay(day) {
    // Simple fertile window calculation (assuming ovulation around day 14)
    const cycleDay = calculateCycleDay(day);
    return cycleDay >= 12 && cycleDay <= 16;
}

function calculateCycleDay(day) {
    if (!state.lastPeriodStart) return 1;
    
    const start = new Date(state.lastPeriodStart);
    const current = new Date(state.currentYear, state.currentMonth, day);
    const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24));
    return diffDays + 1;
}

function selectDay(day, month, year) {
    state.selectedDate = new Date(year, month, day);
    renderCalendar();
    showToast(`Selected ${new Date(year, month, day).toLocaleDateString()}`);
}

function changeMonth(delta) {
    state.currentMonth += delta;
    if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear--;
    } else if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear++;
    }
    renderCalendar();
}

// ===== DASHBOARD =====
function updateDashboard() {
    const cycleDay = state.cycleDay;
    cycleDayEl.textContent = cycleDay;
    currentCycleDayEl.textContent = cycleDay;
    
    // Update phase
    const phase = getPhase(cycleDay);
    document.getElementById('phaseName').textContent = phase;
    
    // Update days until period
    const daysUntil = state.totalCycleDays - cycleDay;
    daysUntilPeriodEl.textContent = daysUntil > 0 ? daysUntil : 0;
    
    // Update fertility status
    if (cycleDay >= 12 && cycleDay <= 16) {
        fertilityStatusEl.textContent = 'High';
        fertilityStatusEl.style.color = '#9B6BFF';
    } else if (cycleDay >= 8 && cycleDay <= 11) {
        fertilityStatusEl.textContent = 'Medium';
        fertilityStatusEl.style.color = '#FFB347';
    } else {
        fertilityStatusEl.textContent = 'Low';
        fertilityStatusEl.style.color = '#6B6B6B';
    }
    
    // Update progress ring
    const progress = (cycleDay / state.totalCycleDays) * 100;
    document.querySelector('.progress-ring-circle').style.setProperty('--progress', `${progress}%`);
}

function getPhase(day) {
    if (day <= 5) return 'Menstruation';
    if (day <= 11) return 'Follicular Phase';
    if (day <= 16) return 'Ovulation';
    if (day <= 28) return 'Luteal Phase';
    return 'Menstruation';
}

// ===== SYMPTOMS =====
function renderSymptoms() {
    const grid = document.getElementById('symptomGrid');
    let html = '';
    
    symptoms.forEach(symptom => {
        const isActive = state.symptoms.includes(symptom.id);
        html += `
            <button class="symptom-btn ${isActive ? 'active' : ''}" onclick="toggleSymptom('${symptom.id}')">
                <i class="${symptom.icon}"></i>
                <span>${symptom.label}</span>
            </button>
        `;
    });
    
    grid.innerHTML = html;
}

function toggleSymptom(id) {
    const index = state.symptoms.indexOf(id);
    if (index > -1) {
        state.symptoms.splice(index, 1);
    } else {
        state.symptoms.push(id);
    }
    renderSymptoms();
}

// ===== MOOD TRACKER =====
document.addEventListener('DOMContentLoaded', () => {
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            moodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.mood = this.dataset.mood;
        });
    });
    
    const intensitySlider = document.getElementById('intensitySlider');
    intensitySlider.addEventListener('input', function() {
        document.getElementById('intensityLabel').textContent = this.value;
        state.intensity = parseInt(this.value);
    });
});

function saveDailyLog() {
    if (!state.mood) {
        showToast('Please select your mood first!', 'warning');
        return;
    }
    
    const log = {
        date: new Date().toISOString().split('T')[0],
        mood: state.mood,
        intensity: state.intensity,
        symptoms: [...state.symptoms]
    };
    
    state.periodLog[log.date] = log;
    showToast('Daily log saved successfully! 🌸', 'success');
    
    // Reset
    state.symptoms = [];
    state.mood = null;
    document.getElementById('intensitySlider').value = 3;
    document.getElementById('intensityLabel').textContent = '3';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    renderSymptoms();
}

// ===== INSIGHTS =====
function initChart() {
    const ctx = document.getElementById('cycleChart').getContext('2d');
    
    // Generate sample cycle data
    const labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const data = [28, 27, 29, 28, 27, 28];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cycle Length (days)',
                data: data,
                borderColor: '#FF6B9D',
                backgroundColor: 'rgba(255, 107, 157, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#FF6B9D',
                pointBorderColor: '#FFF',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 25,
                    max: 32,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ===== PERIOD LOGGING =====
function logPeriod() {
    const today = new Date();
    state.lastPeriodStart = new Date(today);
    state.cycleDay = 1;
    
    document.getElementById('lastPeriodStart').value = formatDateInput(today);
    updateDashboard();
    renderCalendar();
    
    showToast('Period logged! 🌸 Starting new cycle', 'success');
    
    // Celebrate with animation
    createCelebration();
}

function createCelebration() {
    const colors = ['#FF6B9D', '#9B6BFF', '#FF6B6B', '#6BFF9B', '#FFD93D'];
    const container = document.body;
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const emoji = document.createElement('div');
            emoji.textContent = ['🌸', '✨', '💖', '🌺', '💫', '🎉'][Math.floor(Math.random() * 6)];
            emoji.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: -20px;
                font-size: ${Math.random() * 30 + 20}px;
                animation: confettiFall ${Math.random() * 2 + 2}s ease-in forwards;
                pointer-events: none;
                z-index: 9999;
            `;
            container.appendChild(emoji);
            
            setTimeout(() => emoji.remove(), 3000);
        }, i * 50);
    }
}

// ===== PROFILE =====
function saveProfile() {
    const cycleLength = parseInt(document.getElementById('cycleLength').value);
    const periodDuration = parseInt(document.getElementById('periodDuration').value);
    const lastPeriodStart = document.getElementById('lastPeriodStart').value;
    
    if (!cycleLength || !periodDuration || !lastPeriodStart) {
        showToast('Please fill all fields', 'warning');
        return;
    }
    
    state.totalCycleDays = cycleLength;
    state.periodDays = periodDuration;
    state.lastPeriodStart = new Date(lastPeriodStart);
    
    // Calculate cycle day
    const diffDays = Math.floor((new Date() - state.lastPeriodStart) / (1000 * 60 * 60 * 24));
    state.cycleDay = (diffDays % cycleLength) + 1;
    
    updateDashboard();
    renderCalendar();
    showToast('Profile saved successfully! 🌸', 'success');
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ===== WELLNESS FEATURES =====
function startMeditation() {
    showToast('🧘 Starting guided meditation...', 'info');
    // Add meditation animation
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    `;
    overlay.innerHTML = `
        <div style="font-size: 4rem; animation: pulse 1.5s ease-in-out infinite;">🧘</div>
        <h2 style="color: white; margin-top: 20px;">Take a deep breath...</h2>
        <div style="color: rgba(255,255,255,0.8); margin-top: 10px;">5-minute guided meditation</div>
    `;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.remove();
        showToast('Meditation complete! Feel refreshed? 🌸', 'success');
    }, 5000);
}

// ===== TAB NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.dataset.tab;
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
});

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    
    toastMessage.textContent = message;
    
    // Set icon and color based on type
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#6BFF9B';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = '#FFD93D';
    } else if (type === 'info') {
        icon.className = 'fas fa-info-circle';
        icon.style.color = '#9B6BFF';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== ADDITIONAL ANIMATIONS =====
// Add confetti animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') changeMonth(-1);
    if (e.key === 'ArrowRight') changeMonth(1);
    if (e.key === 'p' || e.key === 'P') logPeriod();
    if (e.key === 's' || e.key === 'S') saveDailyLog();
});

// ===== PWA SUPPORT =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg))
        .catch(err => console.log('SW registration failed:', err));
}

// ===== EXPORT FOR GLOBAL ACCESS =====
window.logPeriod = logPeriod;
window.changeMonth = changeMonth;
window.selectDay = selectDay;
window.toggleSymptom = toggleSymptom;
window.saveDailyLog = saveDailyLog;
window.saveProfile = saveProfile;
window.startMeditation = startMeditation;
window.showToast = showToast;

console.log('🌸 Period Tracker App Loaded Successfully!');
console.log('📅 Current Cycle Day:', state.cycleDay);
console.log('💡 Tips: Use arrow keys for calendar navigation');

// ============================================
// LOADING SCREEN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    startLoading();
});

function startLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 2;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Wait a moment then hide loading screen
            setTimeout(() => {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    document.getElementById('mainApp').classList.remove('hidden');
                }, 800);
            }, 500);
        }
        
        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }, 200);
}

// ============================================
// RANGE INPUT HANDLERS
// ============================================
function updateRangeValue(inputId, displayId) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    display.textContent = input.value;
}

// ============================================
// CYCLE CALCULATION
// ============================================
function calculatePeriod(event) {
    event.preventDefault();
    
    // Get form values
    const lastPeriodDate = document.getElementById('lastPeriodDate').value;
    const cycleLength = parseInt(document.getElementById('cycleLength').value);
    const periodDuration = parseInt(document.getElementById('periodDuration').value);
    
    if (!lastPeriodDate) {
        showNotification('Please select your last period date', 'warning');
        return;
    }
    
    // Calculate
    const lastPeriod = new Date(lastPeriodDate);
    const today = new Date();
    
    // Calculate days since last period
    const daysSinceLastPeriod = Math.floor((today - lastPeriod) / (1000 * 60 * 60 * 24));
    
    // Calculate current cycle day
    let currentDay = (daysSinceLastPeriod % cycleLength) + 1;
    if (currentDay < 1) currentDay = 1;
    if (currentDay > cycleLength) currentDay = cycleLength;
    
    // Calculate next period date
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    
    // Calculate days until next period
    const daysUntilNext = Math.max(0, Math.floor((nextPeriod - today) / (1000 * 60 * 60 * 24)));
    
    // Calculate fertility window
    const ovulationDay = Math.floor(cycleLength / 2);
    const fertileStart = ovulationDay - 3;
    const fertileEnd = ovulationDay + 3;
    
    // Determine phase
    const phase = getPhase(currentDay, cycleLength);
    const phaseEmoji = getPhaseEmoji(phase);
    const phaseDescription = getPhaseDescription(phase);
    
    // Display results
    displayResults({
        currentDay,
        nextPeriod: nextPeriod.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }),
        daysUntilNext,
        fertileWindow: `Days ${fertileStart}-${fertileEnd}`,
        phase,
        phaseEmoji,
        phaseDescription,
        cycleLength,
        progress: (currentDay / cycleLength) * 100
    });
}

// ============================================
// PHASE HELPERS
// ============================================
function getPhase(day, cycleLength) {
    if (day <= 5) return 'Menstruation';
    if (day <= 11) return 'Follicular Phase';
    if (day <= Math.floor(cycleLength / 2) + 2) return 'Ovulation';
    return 'Luteal Phase';
}

function getPhaseEmoji(phase) {
    const map = {
        'Menstruation': '🩸',
        'Follicular Phase': '🌱',
        'Ovulation': '🥚',
        'Luteal Phase': '🌙'
    };
    return map[phase] || '🌸';
}

function getPhaseDescription(phase) {
    const map = {
        'Menstruation': 'Your period is here. Rest and listen to your body.',
        'Follicular Phase': 'Energy is rising. Great time for new beginnings!',
        'Ovulation': 'Peak fertility. You may feel more energetic and social.',
        'Luteal Phase': 'Wind down and practice self-care. PMS symptoms may appear.'
    };
    return map[phase] || 'Your body is going through its natural cycle.';
}

// ============================================
// DISPLAY RESULTS
// ============================================
function displayResults(data) {
    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.classList.remove('hidden');
    
    // Smooth scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Populate data with animation delay
    setTimeout(() => {
        document.getElementById('currentDay').textContent = `Day ${data.currentDay}`;
        document.getElementById('nextPeriod').textContent = data.nextPeriod;
        document.getElementById('daysUntil').textContent = `${data.daysUntilNext} days`;
        document.getElementById('fertilityWindow').textContent = data.fertileWindow;
        
        document.getElementById('phaseName').textContent = data.phase;
        document.querySelector('.phase-icon').textContent = data.phaseEmoji;
        document.getElementById('phaseDescription').textContent = data.phaseDescription;
        
        // Update progress
        const progressFill = document.getElementById('cycleProgressFill');
        progressFill.style.width = data.progress + '%';
        document.getElementById('progressPercentage').textContent = Math.round(data.progress) + '%';
        document.getElementById('totalCycleDays').textContent = `${data.cycleLength} days`;
        
        // Celebration animation for certain phases
        if (data.phase === 'Ovulation' || data.daysUntilNext <= 3) {
            createCelebration();
        }
    }, 300);
}

// ============================================
// CELEBRATION ANIMATION
// ============================================
function createCelebration() {
    const emojis = ['🌸', '✨', '💖', '🌺', '💫', '🎉', '🌷', '💗'];
    const container = document.body;
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: -20px;
                font-size: ${Math.random() * 25 + 20}px;
                animation: confettiFall ${Math.random() * 2 + 2}s ease-in forwards;
                pointer-events: none;
                z-index: 9999;
            `;
            container.appendChild(el);
            
            setTimeout(() => el.remove(), 3500);
        }, i * 80);
    }
}

// ============================================
// RESET CALCULATOR
// ============================================
function resetCalculator() {
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('periodForm').reset();
    document.getElementById('cycleLengthValue').textContent = '28';
    document.getElementById('periodDurationValue').textContent = '5';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showNotification('Ready to calculate again! 🌸', 'info');
}

// ============================================
// SHARE RESULTS
// ============================================
function shareResults() {
    const currentDay = document.getElementById('currentDay').textContent;
    const nextPeriod = document.getElementById('nextPeriod').textContent;
    const daysUntil = document.getElementById('daysUntil').textContent;
    
    const shareText = `🌸 My Period Tracker Results:
• ${currentDay}
• Next Period: ${nextPeriod}
• ${daysUntil} until period
• Calculated with PeriodCalc 🌸`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Period Tracker Results',
            text: shareText,
        }).catch(() => {});
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Results copied to clipboard! 📋', 'success');
        }).catch(() => {
            // If clipboard fails, show alert
            alert(shareText);
        });
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === 'success' ? '#2D2D44' : type === 'warning' ? '#FFB347' : '#9B6BFF'};
        color: white;
        padding: 16px 28px;
        border-radius: 14px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        animation: slideInRight 0.5s ease;
        max-width: 400px;
    `;
    
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `${icon} ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
    @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// THEME TOGGLE
// ============================================
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = document.querySelector('.theme-toggle i');
    if (document.body.classList.contains('dark-theme')) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.tagName !== 'INPUT') {
        document.getElementById('periodForm').dispatchEvent(new Event('submit'));
    }
    if (e.key === 'r' || e.key === 'R') {
        resetCalculator();
    }
});

// ============================================
// SET DEFAULT DATE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to 28 days ago (typical cycle)
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 28);
    document.getElementById('lastPeriodDate').value = defaultDate.toISOString().split('T')[0];
});

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================
window.updateRangeValue = updateRangeValue;
window.calculatePeriod = calculatePeriod;
window.resetCalculator = resetCalculator;
window.shareResults = shareResults;
window.toggleTheme = toggleTheme;

console.log('🌸 Period Calculator App Loaded!');
console.log('📝 Enter your cycle details and get instant results.');
console.log('⌨️ Press R to reset, Enter to calculate.');

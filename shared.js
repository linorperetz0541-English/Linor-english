/* ==========================================
   LINOR'S ENGLISH HUB — SHARED JAVASCRIPT
   
   ✅ AUTO-DETECTS unit files in /units/ folder!
   
   How it works:
   1. Each grade page defines a gradeConfig object
   2. The autoDetectUnits() function checks which files exist
   3. Cards are built automatically — available or locked
   
   Linor just needs to:
   - Add a file to /units/ (e.g., units/9th-unit4.html)
   - Refresh the page
   - Done! The card unlocks automatically.
   ========================================== */

/* ===== AUTO-DETECT UNITS SYSTEM ===== */

/**
 * Main function: checks which unit files exist and builds the grid.
 * Called from each grade page with a config object.
 * 
 * @param {Object} config - { grade: "9th", units: [{number, title}, ...] }
 */
async function autoDetectUnits(config) {
    const grid = document.getElementById('unitsGrid');
    const loadingMsg = document.getElementById('loadingMessage');
    
    if (!grid || !config) return;

    // Check all unit files in parallel
    const results = await Promise.all(
        config.units.map(unit => checkUnitFile(config.grade, unit))
    );

    // Remove loading message
    if (loadingMsg) loadingMsg.remove();

    // Count available
    let availableCount = 0;

    // Build cards
    results.forEach((result, index) => {
        const unit = config.units[index];
        const isAvailable = result;
        
        if (isAvailable) availableCount++;

        const card = createUnitCard(config.grade, unit, isAvailable, index);
        grid.appendChild(card);
    });

    // Update stats in header
    updateStats(config.units.length, availableCount);

    // Re-init scroll animations
    animateOnScroll();
}

/**
 * Checks if a unit file exists by trying to fetch it.
 * Returns true if the file exists (HTTP 200), false otherwise.
 */
async function checkUnitFile(grade, unit) {
    // Use absolute path so Netlify Pretty URLs don't break the fetch
    const filePath = `/units/${grade}-unit${unit.number}.html`;
    
    try {
        const response = await fetch(filePath, { method: 'GET' });
        return response.ok; // true if status 200
    } catch (error) {
        return false; // Network error = file doesn't exist
    }
}

/**
 * Creates a unit card element (either as a link or locked div).
 */
function createUnitCard(grade, unit, isAvailable, index) {
    // Use absolute path so links work correctly from any URL
    const filePath = `/units/${grade}-unit${unit.number}.html`;
    
    // Create the right element type
    const card = document.createElement(isAvailable ? 'a' : 'div');
    
    if (isAvailable) {
        card.href = filePath;
        card.className = 'unit-card animate-in';
    } else {
        card.className = 'unit-card locked animate-in';
    }
    
    card.setAttribute('data-status', isAvailable ? 'available' : 'coming');
    card.setAttribute('data-title', unit.title.toLowerCase());
    card.style.animationDelay = (index * 0.05) + 's';

    // Card inner HTML
    card.innerHTML = `
        <div class="unit-card-inner">
            <span class="unit-number">Unit ${unit.number}</span>
            <h3>${isAvailable ? '📖' : '🔒'} ${unit.title}</h3>
            <p class="unit-desc">${isAvailable 
                ? 'Vocabulary, reading & exercises' 
                : 'Coming Soon'
            }</p>
            <span class="unit-btn-label ${isAvailable ? 'available' : 'coming'}">
                ${isAvailable ? '✅ Start Learning →' : '🔜 Coming Soon'}
            </span>
        </div>
    `;

    return card;
}

/**
 * Updates the stats in the header (total, available, coming soon).
 */
function updateStats(total, available) {
    const totalEl = document.getElementById('totalUnits');
    const availableEl = document.getElementById('availableCount');
    const comingEl = document.getElementById('comingCount');
    
    if (totalEl) totalEl.textContent = total;
    if (availableEl) availableEl.textContent = available;
    if (comingEl) comingEl.textContent = total - available;
}


/* ===== SEARCH FUNCTION ===== */
function filterUnits() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.unit-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const title = card.getAttribute('data-title') || '';
        const text = card.textContent.toLowerCase();
        
        if (title.includes(query) || text.includes(query)) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

/* ===== FILTER TABS ===== */
function setFilter(filter, btn) {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    btn.classList.add('active');
    
    const cards = document.querySelectorAll('.unit-card');
    cards.forEach(card => {
        const status = card.getAttribute('data-status');
        
        if (filter === 'all') {
            card.style.display = '';
        } else if (status === filter) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ===== COPY LINK FUNCTION ===== */
function copyLink(page, btn) {
    const baseUrl = window.location.href.replace(/\/[^/]*$/, '/');
    const fullUrl = baseUrl + page;
    
    navigator.clipboard.writeText(fullUrl).then(() => {
        const toast = document.getElementById('copyToast');
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => { toast.classList.remove('show'); }, 2500);
        }
        
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = originalText; }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        btn.textContent = '✅ Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
    });
}

/* ===== EXERCISE SYSTEM ===== */
let exerciseScore = 0;
let exerciseTotal = 0;
let exerciseAnswered = 0;

function initExercises() {
    const exercises = document.querySelectorAll('.exercise');
    exerciseTotal = exercises.length;
    exerciseScore = 0;
    exerciseAnswered = 0;
    updateProgress();
}

function checkAnswer(button, exerciseId, selectedIndex, correctIndex) {
    const exercise = document.getElementById(exerciseId);
    const feedback = exercise.querySelector('.feedback');
    const buttons = exercise.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.6';
    });
    
    exerciseAnswered++;
    
    if (selectedIndex === correctIndex) {
        exerciseScore++;
        button.style.background = '#d4edda';
        button.style.borderColor = '#28a745';
        button.style.color = '#155724';
        button.style.opacity = '1';
        feedback.textContent = '✅ Correct! Well done!';
        feedback.className = 'feedback correct';
    } else {
        button.style.background = '#f8d7da';
        button.style.borderColor = '#dc3545';
        button.style.color = '#721c24';
        button.style.opacity = '1';
        
        buttons[correctIndex].style.background = '#d4edda';
        buttons[correctIndex].style.borderColor = '#28a745';
        buttons[correctIndex].style.opacity = '1';
        
        const correctLetter = String.fromCharCode(97 + correctIndex);
        feedback.textContent = '❌ Not quite. The correct answer is ' + correctLetter + ')';
        feedback.className = 'feedback wrong';
    }
    
    updateProgress();
    
    if (exerciseAnswered === exerciseTotal) {
        setTimeout(showScore, 800);
    }
}

function updateProgress() {
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('progressText');
    
    if (bar && text) {
        const pct = exerciseTotal > 0 ? (exerciseAnswered / exerciseTotal * 100) : 0;
        bar.style.width = pct + '%';
        text.textContent = 'Exercise ' + exerciseAnswered + ' of ' + exerciseTotal;
    }
}

function showScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (!scoreDisplay) return;
    
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreEmoji = document.getElementById('scoreEmoji');
    const scoreMessage = document.getElementById('scoreMessage');
    
    scoreNumber.textContent = exerciseScore + '/' + exerciseTotal;
    
    const percentage = (exerciseScore / exerciseTotal) * 100;
    
    if (percentage === 100) {
        scoreEmoji.textContent = '🏆';
        scoreMessage.textContent = 'Perfect score! Amazing work!';
    } else if (percentage >= 75) {
        scoreEmoji.textContent = '🌟';
        scoreMessage.textContent = 'Great job! Keep it up!';
    } else if (percentage >= 50) {
        scoreEmoji.textContent = '💪';
        scoreMessage.textContent = 'Good effort! Practice makes perfect!';
    } else {
        scoreEmoji.textContent = '📚';
        scoreMessage.textContent = 'Keep studying! You\'ll get better!';
    }
    
    scoreDisplay.style.display = 'block';
    scoreDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function retryExercises() {
    const exercises = document.querySelectorAll('.exercise');
    
    exercises.forEach(exercise => {
        const buttons = exercise.querySelectorAll('.option-btn');
        const feedback = exercise.querySelector('.feedback');
        
        buttons.forEach(btn => {
            btn.style.pointerEvents = '';
            btn.style.opacity = '';
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
        });
        
        feedback.className = 'feedback';
        feedback.textContent = '';
        feedback.style.display = 'none';
    });
    
    document.getElementById('scoreDisplay').style.display = 'none';
    exerciseScore = 0;
    exerciseAnswered = 0;
    updateProgress();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===== ANIMATE ON SCROLL ===== */
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => observer.observe(el));
}

/* ===== INIT ON PAGE LOAD ===== */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize exercises if on a unit page
    if (document.querySelector('.exercise')) {
        initExercises();
    }
    
    // Start scroll animations
    animateOnScroll();
});
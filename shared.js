/* ==========================================
   LINOR'S ENGLISH HUB — SHARED JAVASCRIPT
   
   This file is loaded by ALL pages.
   It handles: Search, Filters, Exercises,
   Progress tracking, Animations.
   
   Linor doesn't need to touch this file!
   ========================================== */

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
    
    // Show "no results" message
    const noResults = document.getElementById('noResults');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

/* ===== FILTER TABS ===== */
function setFilter(filter, btn) {
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    btn.classList.add('active');
    
    // Filter cards
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

/* ===== EXERCISE SYSTEM ===== */
let exerciseScore = 0;
let exerciseTotal = 0;
let exerciseAnswered = 0;

// Initialize exercise tracking
function initExercises() {
    const exercises = document.querySelectorAll('.exercise');
    exerciseTotal = exercises.length;
    exerciseScore = 0;
    exerciseAnswered = 0;
    updateProgress();
}

// Check answer
function checkAnswer(button, exerciseId, selectedIndex, correctIndex) {
    const exercise = document.getElementById(exerciseId);
    const feedback = exercise.querySelector('.feedback');
    const buttons = exercise.querySelectorAll('.option-btn');
    
    // Disable all buttons in this exercise
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.6';
    });
    
    exerciseAnswered++;
    
    if (selectedIndex === correctIndex) {
        // CORRECT
        exerciseScore++;
        button.style.background = '#d4edda';
        button.style.borderColor = '#28a745';
        button.style.color = '#155724';
        button.style.opacity = '1';
        feedback.textContent = '✅ Correct! Well done!';
        feedback.className = 'feedback correct';
    } else {
        // WRONG
        button.style.background = '#f8d7da';
        button.style.borderColor = '#dc3545';
        button.style.color = '#721c24';
        button.style.opacity = '1';
        
        // Highlight correct answer
        buttons[correctIndex].style.background = '#d4edda';
        buttons[correctIndex].style.borderColor = '#28a745';
        buttons[correctIndex].style.opacity = '1';
        
        const correctLetter = String.fromCharCode(97 + correctIndex);
        feedback.textContent = '❌ Not quite. The correct answer is ' + correctLetter + ')';
        feedback.className = 'feedback wrong';
    }
    
    updateProgress();
    
    // Show score when all exercises are done
    if (exerciseAnswered === exerciseTotal) {
        setTimeout(showScore, 800);
    }
}

// Update progress bar
function updateProgress() {
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('progressText');
    
    if (bar && text) {
        const pct = exerciseTotal > 0 ? (exerciseAnswered / exerciseTotal * 100) : 0;
        bar.style.width = pct + '%';
        text.textContent = 'Exercise ' + exerciseAnswered + ' of ' + exerciseTotal;
    }
}

// Show final score
function showScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (!scoreDisplay) return;
    
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreEmoji = document.getElementById('scoreEmoji');
    const scoreMessage = document.getElementById('scoreMessage');
    
    scoreNumber.textContent = exerciseScore + '/' + exerciseTotal;
    
    // Dynamic emoji and message based on score
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

// Retry exercises
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
// ===== Bing Search Automator =====
// Fully client-side, no server required

(function () {
    'use strict';

    // ===== Random Search Query Database =====
    const SEARCH_WORDS = [
        // Technology
        'artificial intelligence trends 2026', 'best smartphones 2026', 'cloud computing basics',
        'cybersecurity tips for beginners', 'machine learning tutorial', 'best laptop for students',
        'how does blockchain work', 'quantum computing explained', 'top programming languages',
        'web development framework comparison', 'data science career path', 'IoT smart home devices',
        'best coding bootcamps', 'software engineering salary', 'tech startup ideas',
        'virtual reality headsets review', 'augmented reality apps', 'robotics for beginners',
        'best antivirus software', 'how to learn Python',

        // Science
        'how do black holes form', 'NASA Mars mission update', 'climate change solutions',
        'renewable energy sources', 'human genome project results', 'ocean exploration discoveries',
        'how do vaccines work', 'space tourism companies', 'endangered species list 2026',
        'photosynthesis process explained', 'periodic table elements', 'evolution theory summary',
        'what causes earthquakes', 'solar system planets facts', 'DNA structure discovery',

        // Health & Fitness
        'healthy breakfast recipes', 'best exercises for weight loss', 'yoga for beginners',
        'mental health tips', 'benefits of meditation', 'how to improve sleep quality',
        'vitamin D deficiency symptoms', 'running tips for beginners', 'healthy meal prep ideas',
        'stress management techniques', 'benefits of drinking water', 'home workout routines',
        'intermittent fasting guide', 'protein rich foods list', 'how to build muscle',

        // Education
        'study tips for students', 'online learning platforms', 'how to write an essay',
        'scholarship applications tips', 'best universities in the world', 'math problem solving strategies',
        'history of ancient Rome', 'how to learn a new language', 'physics formulas cheat sheet',
        'chemistry experiment ideas', 'philosophy famous thinkers', 'geography world capitals',
        'literature classic books list', 'algebra basics tutorial', 'SAT preparation guide',

        // Entertainment
        'best movies 2026', 'top Netflix series recommendations', 'new music releases this week',
        'video game reviews 2026', 'best books to read', 'celebrity news today',
        'upcoming movie trailers', 'best podcasts to listen to', 'board games for family',
        'anime recommendations list', 'best comedy shows', 'music festivals 2026',
        'streaming service comparison', 'best documentaries', 'popular TikTok trends',

        // Travel
        'best travel destinations 2026', 'budget travel tips', 'what to pack for vacation',
        'best airlines review', 'national parks to visit', 'travel insurance comparison',
        'beach destinations tropical', 'European cities to visit', 'travel photography tips',
        'solo travel safety tips', 'best hostels in Europe', 'cruise ship vacation deals',
        'hiking trails near me', 'best food around the world', 'cultural festivals worldwide',

        // Food & Cooking
        'easy dinner recipes', 'how to make pasta from scratch', 'best pizza recipe',
        'baking tips for beginners', 'coffee brewing methods', 'vegan recipes collection',
        'how to grill steak', 'homemade bread recipe', 'smoothie recipes healthy',
        'Asian cuisine recipes', 'dessert recipes chocolate', 'meal planning weekly',
        'spice combinations cooking', 'food preservation methods', 'cooking techniques guide',

        // Business & Finance
        'how to invest in stocks', 'cryptocurrency market update', 'personal finance tips',
        'small business ideas 2026', 'tax filing tips', 'real estate market trends',
        'passive income ideas', 'retirement planning guide', 'credit score improvement',
        'budgeting apps comparison', 'entrepreneurship advice', 'marketing strategy tips',
        'remote work best practices', 'freelancing platforms review', 'stock market analysis',

        // Sports
        'football match results today', 'NBA standings current season', 'Olympic games history',
        'tennis grand slam winners', 'formula 1 race schedule', 'best soccer players 2026',
        'swimming training tips', 'basketball shooting techniques', 'marathon training plan',
        'golf swing improvement', 'extreme sports adventure', 'esports tournament results',

        // Lifestyle
        'home decoration ideas', 'minimalist living tips', 'DIY craft projects',
        'gardening for beginners', 'pet care guide dogs', 'fashion trends 2026',
        'skincare routine steps', 'how to organize closet', 'productivity tips daily',
        'sustainable living practices', 'digital detox benefits', 'morning routine ideas',
        'how to save money', 'relationship advice tips', 'time management techniques',

        // Random & Trending
        'what is trending today', 'fun facts about animals', 'world records guinness',
        'optical illusions explained', 'mythology stories Greek', 'random facts history',
        'how tall is Mount Everest', 'deepest ocean trench', 'fastest land animal',
        'most spoken languages world', 'interesting science experiments', 'weird laws around world',
        'amazing architecture buildings', 'natural wonders of world', 'mysterious places earth'
    ];

    // ===== DOM Elements =====
    const searchCountInput = document.getElementById('searchCount');
    const intervalInput = document.getElementById('interval');
    const startBtn = document.getElementById('startBtn');
    const progressSection = document.getElementById('progressSection');
    const progressBar = document.getElementById('progressBar');
    const progressCount = document.getElementById('progressCount');
    const queryText = document.getElementById('queryText');
    const logSection = document.getElementById('logSection');
    const logList = document.getElementById('logList');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const statusMessage = document.getElementById('statusMessage');

    // ===== State =====
    let isRunning = false;
    let currentSearch = 0;
    let totalSearches = 0;
    let searchInterval = null;
    let usedQueries = new Set();

    // ===== Initialize =====
    function init() {
        loadSettings();
        bindEvents();
    }

    // ===== Settings Persistence =====
    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem('bingAutoSettings') || '{}');
            if (saved.searchCount) searchCountInput.value = saved.searchCount;
            if (saved.interval) intervalInput.value = saved.interval;
        } catch (e) { /* ignore */ }
    }

    function saveSettings() {
        try {
            localStorage.setItem('bingAutoSettings', JSON.stringify({
                searchCount: parseInt(searchCountInput.value),
                interval: parseInt(intervalInput.value)
            }));
        } catch (e) { /* ignore */ }
    }

    // ===== Event Binding =====
    function bindEvents() {
        startBtn.addEventListener('click', toggleSearch);
        clearLogBtn.addEventListener('click', clearLog);

        searchCountInput.addEventListener('input', validateInput);
        intervalInput.addEventListener('input', validateInput);

        // Prevent form submission on enter
        [searchCountInput, intervalInput].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    input.blur();
                }
            });
        });
    }

    // ===== Input Validation =====
    function validateInput(e) {
        const input = e.target;
        const val = parseInt(input.value);
        const min = parseInt(input.min);
        const max = parseInt(input.max);

        if (input.value === '') return;

        if (isNaN(val) || val < min || val > max) {
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    }

    function getValidatedValues() {
        let count = parseInt(searchCountInput.value);
        let interval = parseInt(intervalInput.value);

        if (isNaN(count) || count < 1) count = 1;
        if (count > 100) count = 100;
        if (isNaN(interval) || interval < 3) interval = 3;
        if (interval > 60) interval = 60;

        searchCountInput.value = count;
        intervalInput.value = interval;
        searchCountInput.classList.remove('error');
        intervalInput.classList.remove('error');

        return { count, interval };
    }

    // ===== Search Logic =====
    function toggleSearch() {
        if (isRunning) {
            stopSearch();
        } else {
            startSearch();
        }
    }

    function startSearch() {
        const { count, interval } = getValidatedValues();
        saveSettings();

        totalSearches = count;
        currentSearch = 0;
        usedQueries.clear();
        isRunning = true;

        // UI updates
        startBtn.classList.add('running');
        startBtn.querySelector('.btn-text').textContent = 'Stop Searches';
        progressSection.classList.remove('hidden');
        logSection.classList.remove('hidden');
        statusMessage.classList.add('hidden');
        logList.innerHTML = '';

        updateProgress();

        // Perform first search immediately
        performSearch();

        // Schedule remaining searches
        if (totalSearches > 1) {
            searchInterval = setInterval(() => {
                if (currentSearch >= totalSearches) {
                    completeSearch();
                    return;
                }
                performSearch();
            }, interval * 1000);
        }
    }

    function stopSearch() {
        isRunning = false;
        if (searchInterval) {
            clearInterval(searchInterval);
            searchInterval = null;
        }

        startBtn.classList.remove('running');
        startBtn.querySelector('.btn-text').textContent = 'Start Searches';
        queryText.textContent = 'Stopped';
    }

    function completeSearch() {
        stopSearch();

        statusMessage.classList.remove('hidden');
        queryText.textContent = 'Completed!';

        // Vibrate on mobile if supported
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    }

    function performSearch() {
        if (!isRunning || currentSearch >= totalSearches) {
            if (currentSearch >= totalSearches) completeSearch();
            return;
        }

        const query = getRandomQuery();
        currentSearch++;

        // Update UI
        queryText.textContent = query;
        updateProgress();
        addLogEntry(currentSearch, query);

        // Open Bing search
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&form=QBLH`;
        const searchWindow = window.open(searchUrl, '_blank');

        // Try to close the tab after a delay (may not work on all browsers)
        if (searchWindow) {
            setTimeout(() => {
                try { searchWindow.close(); } catch (e) { /* cross-origin restriction */ }
            }, 4000);
        }

        // Check if completed
        if (currentSearch >= totalSearches) {
            if (searchInterval) {
                clearInterval(searchInterval);
                searchInterval = null;
            }
            setTimeout(() => completeSearch(), 1000);
        }
    }

    function getRandomQuery() {
        // Get unused queries first
        const available = SEARCH_WORDS.filter(q => !usedQueries.has(q));
        let query;

        if (available.length > 0) {
            query = available[Math.floor(Math.random() * available.length)];
        } else {
            // If all used, add random suffix to make unique
            const base = SEARCH_WORDS[Math.floor(Math.random() * SEARCH_WORDS.length)];
            query = `${base} ${new Date().getFullYear()} ${Math.random().toString(36).slice(2, 5)}`;
        }

        usedQueries.add(query);
        return query;
    }

    // ===== UI Updates =====
    function updateProgress() {
        const percent = totalSearches > 0 ? (currentSearch / totalSearches) * 100 : 0;
        progressBar.style.width = `${percent}%`;
        progressCount.textContent = `${currentSearch} / ${totalSearches}`;
    }

    function addLogEntry(number, query) {
        const item = document.createElement('div');
        item.className = 'log-item';

        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        item.innerHTML = `
            <span class="log-number">${number}</span>
            <span class="log-query">${escapeHtml(query)}</span>
            <span class="log-time">${time}</span>
        `;

        // Insert at top for newest-first order
        logList.insertBefore(item, logList.firstChild);

        // Limit log entries
        while (logList.children.length > 100) {
            logList.removeChild(logList.lastChild);
        }
    }

    function clearLog() {
        logList.innerHTML = '';
    }

    // ===== Utilities =====
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== Start App =====
    init();
})();

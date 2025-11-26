// app.js (Updated to fetch NU Sociology.json)

// Firebase SDKs, configuration, and initialization are removed.

// Global data store and key
let NU_DATA = null;
const NU_SOCIOLOGY_DATA_KEY = 'nuSociologyData';
// JSON ফাইলের নাম
const JSON_FILE_PATH = 'NU Sociology.json'; 

// --- Core Data Loading Function (Local Storage + Fetch Logic) ---
async function loadData() {
    const loader = document.querySelector('.loader');
    loader.textContent = 'ডাটা লোড হচ্ছে... (লোকাল স্টোরেজ চেক করা হচ্ছে)';
    
    // ১. Local Storage থেকে লোড করার চেষ্টা
    const localData = localStorage.getItem(NU_SOCIOLOGY_DATA_KEY);

    if (localData) {
        try {
            NU_DATA = JSON.parse(localData);
            console.log('Data loaded from Local Storage.');
            loader.textContent = 'ডাটা লোড সম্পন্ন।';
        } catch (e) {
            console.error('Error parsing Local Storage data:', e);
            // ২. Local Storage-এ ডেটা দুর্নীতিগ্রস্ত হলে ফাইল থেকে লোড
            await loadDataFromFile(loader);
        }
    } else {
        // ৩. Local Storage-এ ডেটা না থাকলে ফাইল থেকে লোড
        await loadDataFromFile(loader);
    }
    
    // লোডিং শেষে নেভিগেশন শুরু
    setTimeout(() => {
        const loaderDiv = document.querySelector('.loader');
        if (loaderDiv) {
            loaderDiv.remove(); // Remove the loader
        }
        handleInitialNavigation();
    }, 500); // Give a small delay for better UX
}

async function loadDataFromFile(loader) {
    loader.textContent = `লোকাল স্টোরেজে ডেটা নেই। ${JSON_FILE_PATH} ফাইল থেকে ডেটা লোড হচ্ছে...`;
    
    try {
        // Fetch API ব্যবহার করে JSON ফাইল লোড করা
        const response = await fetch(JSON_FILE_PATH);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        NU_DATA = data;
        
        // Local Storage-এ সেভ করা
        try {
            localStorage.setItem(NU_SOCIOLOGY_DATA_KEY, JSON.stringify(NU_DATA));
            console.log('Data fetched from file and saved to Local Storage.');
            loader.textContent = 'ফাইল থেকে ডেটা লোড ও Local Storage-এ সেভ সম্পন্ন।';
        } catch (e) {
            console.error('Error saving data to Local Storage. Check storage limits.', e);
            alert('আপনার ব্রাউজারের লোকাল স্টোরেজে ডেটা সেভ করা যায়নি। স্টোরেজ পূর্ণ থাকতে পারে।');
        }
        
    } catch (error) {
        console.error('Error fetching data from file:', error);
        loader.textContent = 'ডেটা লোড করতে ব্যর্থ। অনুগ্রহ করে ফাইলটি পরীক্ষা করুন।';
        alert('ডেটা লোড করতে ব্যর্থ। নিশ্চিত করুন NU Sociology.json ফাইলটি অ্যাপের সাথে একই ফোল্ডারে আছে।');
        // If fetching fails, the app will stop here or render empty content
    }
}

// --- Navigation and Rendering Functions ---
// (পূর্বের কোডের বাকি সমস্ত ফাংশন অপরিবর্তিত থাকবে)

function handleInitialNavigation() {
    const path = window.location.hash.slice(1).split('/');
    const view = path[0] || 'home';
    const year = path[1] || null;
    const courseCode = path[2] || null;

    if (view === 'course' && year && courseCode) {
        navigate(view, year, courseCode);
    } else if (view.includes('Year')) {
        navigate(view);
    } else if (view === 'search') {
        navigate(view);
    } else {
        navigate('home');
    }
}

window.navigate = function(view, year = null, courseCode = null) {
    if (!NU_DATA) return; // Wait for data to load
    
    const contentContainer = document.getElementById('content-container');
    contentContainer.innerHTML = ''; 
    closeSidebar(); 

    if (view === 'home') {
        renderHomeView(contentContainer);
    } else if (view.includes('Year')) {
        renderYearView(contentContainer, view);
    } else if (view === 'course' && year && courseCode) {
        renderCourseView(contentContainer, year, courseCode);
    } else if (view === 'search') {
        renderSearchView(contentContainer);
    }
    
    // Update URL hash
    if (view === 'course') {
        window.location.hash = `#${view}/${year}/${courseCode}`;
    } else if (view.includes('Year')) {
        window.location.hash = `#${view}`;
    } else if (view === 'search') {
        window.location.hash = `#search`;
    } else {
        window.location.hash = `#home`;
    }
}

function renderHomeView(container) {
    container.innerHTML = `
        <div class="card">
            <h2>স্বাগতম!</h2>
            <p>জাতীয় বিশ্ববিদ্যালয়ের সমাজবিজ্ঞান বিভাগের বিগত বছরের প্রশ্নাবলির সংগ্রহশালায় আপনাকে স্বাগতম। বামপাশের মেনু থেকে আপনার বর্ষ নির্বাচন করুন।</p>
            <p>এই অ্যাপটি অফলাইনে কাজ করার জন্য Local Storage ব্যবহার করে। ডেটা প্রথমে **${JSON_FILE_PATH}** ফাইল থেকে লোড হয়।</p>
        </div>
        <div class="card">
            <h3>বর্ষসমূহ</h3>
            ${Object.keys(NU_DATA).map(year => `
                <div class="course-item" onclick="navigate('${year}')">
                    ${year} এর কোর্সসমূহ 
                    <span class="material-symbols-outlined">chevron_right</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderYearView(container, year) {
    if (!NU_DATA[year]) {
        container.innerHTML = `<div class="card"><h2>${year}</h2><p>এই বর্ষের কোনো ডেটা খুঁজে পাওয়া যায়নি।</p></div>`;
        return;
    }
    
    container.innerHTML = `
        <h2>${year} এর কোর্সসমূহ</h2>
        <div class="course-list">
            ${Object.entries(NU_DATA[year]).map(([code, details]) => `
                <div class="course-item" onclick="navigate('course', '${year}', '${code}')">
                    <strong>${code}</strong>: ${details.title_bd}
                    <span class="material-symbols-outlined">chevron_right</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderCourseView(container, year, courseCode) {
    const courseDetails = NU_DATA[year][courseCode];
    if (!courseDetails) {
        container.innerHTML = `<div class="card"><h2>ত্রুটি</h2><p>কোর্স কোড ${courseCode} এর জন্য কোনো ডেটা খুঁজে পাওয়া যায়নি।</p></div>`;
        return;
    }

    container.innerHTML = `
        <h2>${courseDetails.title_bd} (${courseCode})</h2>
        <p class="course-title-en">${courseDetails.title_en}</p>
        
        <div id="syllabus-container">
            <h3>সিলেবাস</h3>
            ${Object.entries(courseDetails.syllabus || {}).map(([chapter, details]) => `
                <div class="syllabus-item">
                    <strong>অধ্যায় ${details.chapter}:</strong> ${details.title_bn} (${details.title_en})
                </div>
            `).join('')}
        </div>
        
        <div id="board-questions-container">
            <h3>বিগত বছরের প্রশ্নাবলি</h3>
            ${Object.entries(courseDetails.board || {}).map(([examId, examDetails]) => `
                <div class="panel-container">
                    <div class="panel-header" onclick="togglePanel(this)">
                        <span>${examDetails.title_bn} ${examDetails.exam_year}</span>
                        <span class="material-symbols-outlined">expand_more</span>
                    </div>
                    <div class="panel-content">
                        ${renderQuestions(examDetails.data)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderQuestions(questions) {
    if (!questions || Object.keys(questions).length === 0) {
        return '<p>এই পরীক্ষায় কোনো প্রশ্ন নেই।</p>';
    }

    const sections = {};
    Object.values(questions).forEach(q => {
        if (!sections[q.section]) {
            sections[q.section] = [];
        }
        sections[q.section].push(q);
    });

    return Object.entries(sections).map(([sectionName, questionList]) => `
        <div class="section-group">
            <h4>${sectionName}</h4>
            ${questionList.sort((a, b) => a.sl.localeCompare(b.sl, 'bn')).map(q => `
                <div class="question-item">
                    ${q.sl}. ${q.question}
                </div>
            `).join('')}
        </div>
    `).join('');
}

function renderSearchView(container) {
    container.innerHTML = `
        <div class="card">
            <h2>অনুসন্ধান</h2>
            <input type="text" id="search-input" placeholder="প্রশ্ন বা কোর্সের নাম দিয়ে খুঁজুন..." class="search-input">
        </div>
        <div id="search-results">
            <p>অনুসন্ধানের ফলাফল এখানে দেখা যাবে।</p>
        </div>
    `;

    const searchInput = document.getElementById('search-input');
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(searchInput.value.trim());
        }, 300);
    });
}

function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (query.length < 2) {
        resultsContainer.innerHTML = '<p>অনুসন্ধান করতে কমপক্ষে ২টি অক্ষর দিন।</p>';
        return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];
    
    // Iterate through all years, courses, and questions
    Object.entries(NU_DATA).forEach(([year, courses]) => {
        Object.entries(courses).forEach(([code, details]) => {
            // Search Course Title (Bangla/English)
            if (details.title_bd.toLowerCase().includes(lowerQuery) || details.title_en.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'Course',
                    text: `${details.title_bd} (${code})`,
                    year: year,
                    code: code
                });
            }
            
            // Search Questions
            Object.values(details.board || {}).forEach(examDetails => {
                Object.values(examDetails.data || {}).forEach(question => {
                    if (question.question.toLowerCase().includes(lowerQuery)) {
                        results.push({
                            type: 'Question',
                            text: question.question,
                            year: year,
                            code: code,
                            exam: `${examDetails.exam_year}`
                        });
                    }
                });
            });
        });
    });

    if (results.length === 0) {
        resultsContainer.innerHTML = `<p>“${query}” এর জন্য কোনো ফলাফল খুঁজে পাওয়া যায়নি।</p>`;
        return;
    }

    // Render Results
    const uniqueResults = [...new Set(results.map(r => JSON.stringify(r)))].map(s => JSON.parse(s));

    resultsContainer.innerHTML = `
        <h4>মোট ফলাফল: ${uniqueResults.length} টি</h4>
        <div class="result-list">
            ${uniqueResults.map(r => {
                if (r.type === 'Course') {
                    return `
                        <div class="course-item" onclick="navigate('course', '${r.year}', '${r.code}')">
                            <span class="material-symbols-outlined">school</span>
                            <strong>কোর্স:</strong> ${r.text} (${r.year})
                            <span class="material-symbols-outlined">chevron_right</span>
                        </div>
                    `;
                } else if (r.type === 'Question') {
                    return `
                        <div class="question-item" onclick="navigate('course', '${r.year}', '${r.code}')">
                            <span class="material-symbols-outlined">quiz</span>
                            <strong>প্রশ্ন (${r.exam}):</strong> ${r.text}
                            <span class="material-symbols-outlined">chevron_right</span>
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;
}

// --- UI Utility Functions ---

/** Toggles the visibility of the collapsible panels (questions) */
window.togglePanel = function(headerElement) {
    const content = headerElement.nextElementSibling;
    const icon = headerElement.querySelector('.material-symbols-outlined');

    content.classList.toggle('open'); 
    
    if (content.classList.contains('open')) {
        icon.innerText = 'expand_less';
        content.style.maxHeight = content.scrollHeight + "px"; 
    } else {
        icon.innerText = 'expand_more';
        content.style.maxHeight = '0';
    }
}

/** Handles hash changes for navigation */
window.onhashchange = function() {
    if (window.NU_DATA) {
        handleInitialNavigation();
    }
};

/** Mobile Sidebar Toggle */
window.toggleSidebar = function() {
    document.getElementById('nav-sidebar').classList.toggle('open');
};

/** Closes the sidebar on mobile */
function closeSidebar() {
    if (window.innerWidth <= 600) {
        document.getElementById('nav-sidebar').classList.remove('open');
    }
}

// Start the application after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadData);
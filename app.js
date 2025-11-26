// app.js

// Firebase SDKs are imported as modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// --- Firebase Configuration (আপনার দেওয়া তথ্য) ---
// Note: This API Key is public and should ideally be stored securely, 
// but for client-side web apps, it's often included directly.
const firebaseConfig = {
  apiKey: "AIzaSyA0dkYiItJAFyzt0xdIy3n2_aD2c6j5e6U",
  authDomain: "nu-sociology-6c395.firebaseapp.com",
  databaseURL: "https://nu-sociology-6c395-default-rtdb.firebaseio.com",
  projectId: "nu-sociology-6c395",
  storageBucket: "nu-sociology-6c395.appspot.com",
  messagingSenderId: "902446269904",
  appId: "1:902446269904:web:836edb3fd4348fed2465d5",
  measurementId: "G-X4S45DXWET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- Global State and Constants ---
window.NU_DATA = null;
let currentState = {
    view: 'home',
    year: null,
    courseCode: null,
    searchQuery: ''
};
const contentContainer = document.getElementById('content-container');

// --- Main Functions ---

/** Loads data from the Firebase Realtime Database at the 'Content' path. */
async function loadData() {
    try {
        // ডেটা লোড করার জন্য সঠিক পাথ: 'Content'
        const dbRef = ref(db, 'Content'); 
        
        console.log("Attempting to fetch data from Firebase at path: /Content"); 
        
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            window.NU_DATA = data;
            console.log("✅ Data loaded successfully from Firebase.");
            
            // Navigate after loading
            const hash = window.location.hash.slice(1);
            navigate(hash || 'home');
        } else {
            // ডাটাবেস পাথ ঠিক থাকলে, কিন্তু কোনো ডাটা না থাকলে
            throw new Error("❌ ডাটাবেসের `/Content` পাথে কোনো ডাটা খুঁজে পাওয়া যায়নি। আপনার ডাটাবেস কাঠামো যাচাই করুন।");
        }
    } catch (error) {
        console.error("❌ Firebase থেকে ডাটা লোড করতে সমস্যা:", error);

        // ত্রুটির প্রকারভেদের উপর ভিত্তি করে আরও নির্দিষ্ট বার্তা
        let errorMessage = error.message;
        if (errorMessage.includes('Permission denied')) {
            errorMessage = 'অনুমতি অস্বীকার করা হয়েছে। অনুগ্রহ করে Firebase Realtime Database-এর Rules (নিয়মাবলী)-এ `read: true` সেট করুন।';
        } else if (errorMessage.includes('Failed to fetch')) {
            errorMessage = 'নেটওয়ার্ক সংযোগ সমস্যা বা ভুল `databaseURL`। আপনার সংযোগ এবং কনফিগারেশন যাচাই করুন।';
        }

        document.getElementById('content-container').innerHTML = `
            <h2 style="color: var(--on-primary-container); background-color: var(--primary-container); padding: 15px; border-radius: 8px;">❌ ডাটা লোড ব্যর্থ (Firebase)</h2>
            <p style="color: red;"><strong>সমস্যার কারণ:</strong> ${errorMessage}</p>
            <p><strong>দ্রুত সমাধান:</strong></p>
            <ol>
                <li>Firebase কনসোলে যান -> Realtime Database -> **Rules** ট্যাবে যান।</li>
                <li>নিয়মাবলী পরিবর্তন করে নিশ্চিত করুন যে <code>"read": true</code> সেট করা আছে। যেমন:
                    <pre style="background-color: #eee; padding: 10px; border-radius: 5px;"><code>{
  "rules": {
    ".read": "true",
    ".write": "false" 
  }
}</code></pre>
                </li>
                <li>নিশ্চিত করুন যে আপনার ব্রাউজারে <code>http://localhost...</code> এর মাধ্যমে একটি **লোকাল সার্ভার** ব্যবহার করা হচ্ছে (ফাইলটি সরাসরি ব্রাউজারে খুলবেন না)।</li>
                <li>নিশ্চিত করুন যে ডাটাবেসের রুট নোডের ভেতরেই <code>Content</code> নামক একটি নোড রয়েছে।</li>
            </ol>
        `;
    }
}

/** Renders the Home page with year selection cards. */
function renderHome() {
    contentContainer.innerHTML = `<h2>জাতীয় বিশ্ববিদ্যালয় সমাজবিজ্ঞান বিভাগ</h2>`;
    
    if (!window.NU_DATA || Object.keys(window.NU_DATA).length === 0) {
        contentContainer.innerHTML += `<p>ডাটাবেস থেকে কোনো বর্ষের ডাটা পাওয়া যায়নি। Firebase ডাটা স্ট্রাকচার পরীক্ষা করুন।</p>`;
        return;
    }
    
    const yearKeys = Object.keys(window.NU_DATA);
    let yearCards = '<div class="course-grid">';
    yearKeys.forEach(year => {
        // '1st Year' -> '১ম বর্ষ'
        const yearTitle = year.replace(' Year', ' বর্ষ');
        yearCards += `<div class="material-card" onclick="navigate('${year}')"><h3>${yearTitle}</h3><p>বিগত বছরের প্রশ্ন ও কোর্স ম্যাটেরিয়াল</p></div>`;
    });
    yearCards += '</div>';
    contentContainer.innerHTML += yearCards;
}

/** Renders the Course List for a specific year. */
function renderYear(year) {
    const yearTitle = year.replace(' Year', ' বর্ষ');
    const courses = window.NU_DATA[year];
    if (!courses) {
        contentContainer.innerHTML = `<h2>${yearTitle}</h2><p>এই বর্ষের কোনো কোর্স ডাটা খুঁজে পাওয়া যায়নি।</p>`;
        return;
    }
    let courseList = `<h2>${yearTitle}</h2><div class="course-grid">`;
    Object.keys(courses).forEach(code => {
        let title = `কোর্স কোড: ${code}`;
        // Add course title heuristics here (For better user experience)
        // You might want to get these titles from the database if available
        if (code === '211501') title = "বাংলাদেশের অভ্যুদয়ের ইতিহাস";
        else if (code === '212001') title = "সমাজবিজ্ঞানের মৌলিক ধারণা";
        else if (code === '222007') title = "সামাজিক গবেষণা পদ্ধতি";

        courseList += `<div class="material-card" onclick="navigate('course', '${year}', '${code}')"><h3>${title}</h3><p>কোর্স কোড: ${code}</p><p>প্রশ্নাবলী দেখুন</p></div>`;
    });
    courseList += '</div>';
    contentContainer.innerHTML = courseList;
}

/** Renders the detailed Course page with Tabs (Exam List/Chapter List). */
function renderCourse(year, code) {
    const courseData = window.NU_DATA[year][code];
    if (!courseData) {
        contentContainer.innerHTML = `<h2>কোর্স খুঁজে পাওয়া যায়নি।</h2>`;
        return;
    }

    let courseTitle = `কোর্স কোড: ${code}`;
    // Add course title heuristics here
    if (code === '211501') courseTitle = "বাংলাদেশের অভ্যুদয়ের ইতিহাস";
    else if (code === '212001') courseTitle = "সমাজবিজ্ঞানের মৌলিক ধারণা";
    else if (code === '222007') courseTitle = "সামাজিক গবেষণা পদ্ধতি";


    const hasBoardData = courseData.board && Object.keys(courseData.board).length > 0;
    const hasChapterData = courseData.chapter && Object.keys(courseData.chapter).length > 0;
    
    let activeTab = hasBoardData ? 'board' : (hasChapterData ? 'chapter' : '');

    let html = `
        <h2 onclick="navigate('${year}')" style="cursor: pointer; color: var(--primary); margin-bottom: 5px;">← ${year.replace(' Year', ' বর্ষ')}</h2>
        <h1>${courseTitle}</h1>
        <p>কোর্স কোড: ${code}</p>

        <div class="tab-bar">
            ${hasBoardData ? `<div class="tab-button ${activeTab === 'board' ? 'active' : ''}" onclick="showTab('board', this)">পরীক্ষাভিত্তিক</div>` : ''}
            ${hasChapterData ? `<div class="tab-button ${activeTab === 'chapter' ? 'active' : ''}" onclick="showTab('chapter', this)">অধ্যায়ভিত্তিক</div>` : ''}
        </div>

        <div id="tab-content-board" class="tab-content-item ${activeTab === 'board' ? 'active' : ''}">
            ${renderExamList(courseData.board, year, code)}
        </div>

        ${hasChapterData ? `
            <div id="tab-content-chapter" class="tab-content-item ${activeTab === 'chapter' ? 'active' : ''}">
                ${renderChapterList(courseData.chapter, year, code)}
            </div>
        ` : ''}
    `;
    
    contentContainer.innerHTML = html;

    // Initially show the correct tab content
    const activeContent = document.querySelector(`.tab-content-item.active`);
    if(activeContent) activeContent.style.display = 'block';
}

/** Renders the list of available Exam Years. */
function renderExamList(boardData, year, code) {
    if (!boardData || Object.keys(boardData).length === 0) return "<p>বিগত বছরের কোনো পরীক্ষার ডাটা খুঁজে পাওয়া যায়নি।</p>";

    let html = '<div class="course-grid">';
    // Sort years in reverse (most recent first)
    const examKeys = Object.keys(boardData).sort((a, b) => {
        // Assuming keys are numerical or can be compared as strings
        return parseInt(b) - parseInt(a);
    }); 

    examKeys.forEach(yearKey => {
        const examYear = boardData[yearKey].exam_year; // Use the actual exam_year from data
        html += `
            <div class="material-card" onclick="renderExamDetail('${yearKey}', '${year}', '${code}')">
                <h3>${examYear} সালের পরীক্ষা</h3>
                <p>প্রশ্নাবলী দেখতে ক্লিক করুন</p>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

/** Renders the list of available Chapter Titles. */
function renderChapterList(chapterData, year, code) {
    if (!chapterData || Object.keys(chapterData).length === 0) return "<p>অধ্যায়ভিত্তিক কোনো টপিক বা প্রশ্ন খুঁজে পাওয়া যায়নি।</p>";
    
    let html = '<div class="course-grid">';
    const chapterKeys = Object.keys(chapterData).sort((a, b) => {
        // Sort by chapter number if available, otherwise by key
        const chapA = chapterData[a].chapter || Infinity;
        const chapB = chapterData[b].chapter || Infinity;
        return chapA - chapB;
    });

    chapterKeys.forEach(chapterKey => {
        const chapter = chapterData[chapterKey];
        html += `
            <div class="material-card" onclick="renderChapterDetail('${chapterKey}', '${year}', '${code}')">
                <h3>${chapter.title_bn || 'নাম অজানা'}</h3>
                <p>অধ্যায় ${chapter.chapter || '?'}</p>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

/** Renders the questions for a single, selected Exam Year. */
window.renderExamDetail = function(examKey, year, code) {
    const courseData = window.NU_DATA[year] ? window.NU_DATA[year][code] : null;
    if (!courseData || !courseData.board || !courseData.board[examKey]) return;

    const examData = courseData.board[examKey];
    const backLink = `onclick="navigate('course', '${year}', '${code}')" style="cursor: pointer; color: var(--primary);"`;

    const questions = examData.data ? Object.values(examData.data) : [];
    const sections = {};
    questions.forEach(q => {
        const section = q.section || 'সাধারণ প্রশ্নাবলী';
        if (!sections[section]) sections[section] = [];
        sections[section].push(q);
    });

    let sectionContent = '';
    Object.keys(sections).forEach(sectionName => {
        const sectionQuestions = sections[sectionName].map(q => {
            return `<div class="question-item"><strong>${q.sl || '*'}.</strong> ${q.question}</div>`;
        }).join('');

        sectionContent += `
            <div class="expansion-panel">
                <div class="panel-header" onclick="togglePanel(this)">
                    ${sectionName} (${sections[sectionName].length}টি প্রশ্ন)
                    <span class="material-symbols-outlined">expand_more</span>
                </div>
                <div class="panel-content">
                    ${sectionQuestions}
                </div>
            </div>
        `;
    });

    contentContainer.innerHTML = `
        <h2 ${backLink}>← ফিরে যান (কোর্স পাতায়)</h2>
        <h1>${examData.exam_year} সালের প্রশ্নাবলী</h1>
        ${sectionContent || '<p>এই পরীক্ষার কোনো প্রশ্ন খুঁজে পাওয়া যায়নি।</p>'}
    `;
}

/** Renders the questions/data for a single, selected Chapter. */
window.renderChapterDetail = function(chapterKey, year, code) {
    const courseData = window.NU_DATA[year] ? window.NU_DATA[year][code] : null;
    if (!courseData || !courseData.chapter || !courseData.chapter[chapterKey]) return;

    const chapterData = courseData.chapter[chapterKey];
    const backLink = `onclick="navigate('course', '${year}', '${code}')" style="cursor: pointer; color: var(--primary);"`;

    const questions = chapterData.data ? Object.values(chapterData.data) : [];
    const questionHtml = questions.map(q => {
        return `<div class="question-item">
            <strong>প্রশ্ন:</strong> ${q.question}<br>
            ${q.answer ? `<div style="padding-left: 10px; margin-top: 5px;"><strong>উত্তর:</strong> ${q.answer}</div>` : ''}
        </div>`;
    }).join('');

    contentContainer.innerHTML = `
        <h2 ${backLink}>← ফিরে যান (কোর্স পাতায়)</h2>
        <h1>অধ্যায় ${chapterData.chapter || '?'}: ${chapterData.title_bn || 'নাম অজানা'}</h1>
        <div class="material-card">
            ${questionHtml || '<p>এই অধ্যায়ের জন্য কোনো প্রশ্ন বা উত্তর পাওয়া যায়নি।</p>'}
        </div>
    `;
}

/** Simple navigation function (router). */
window.navigate = function(view, year = null, courseCode = null) {
    currentState.view = view;
    currentState.year = year;
    currentState.courseCode = courseCode;
    currentState.searchQuery = ''; // Clear search when navigating away

    // Update URL hash for simple state management (optional but good practice)
    const hash = `#${view}${year ? '/' + year : ''}${courseCode ? '/' + courseCode : ''}`;
    history.pushState(currentState, '', hash);

    document.getElementById('nav-sidebar').classList.remove('open'); // Close sidebar on mobile

    if (window.NU_DATA === null) {
        // Data not loaded yet, just show the loader
        document.getElementById('content-container').innerHTML = `<div class="loader">ডাটা লোড হচ্ছে...</div>`;
        return;
    }
    
    if (view === 'home') {
        renderHome();
    } else if (view.includes('Year')) {
        renderYear(view);
    } else if (view === 'course' && year && courseCode) {
        renderCourse(year, courseCode);
    } else if (view === 'search') {
        renderSearch();
    }
}

/** Performs the data search (simplified global search) */
window.performSearch = function(query) {
    currentState.searchQuery = query.toLowerCase().trim();
    const resultsDiv = document.getElementById('search-results');
    
    if (currentState.searchQuery.length < 2) {
        resultsDiv.innerHTML = '<p style="color: var(--outline);">অনুসন্ধান শুরু করুন...</p>';
        return;
    }
    
    let results = [];
    Object.keys(window.NU_DATA).forEach(yearKey => {
        const yearCourses = window.NU_DATA[yearKey];
        Object.keys(yearCourses).forEach(courseCode => {
            const course = yearCourses[courseCode];
            
            // Search Board Questions
            if (course.board) {
                Object.values(course.board).forEach(exam => {
                    if(exam.data){ // Check if exam.data exists
                         Object.values(exam.data).forEach(q => {
                            if (q.question && q.question.toLowerCase().includes(currentState.searchQuery)) {
                                results.push({
                                    type: 'Board Question',
                                    text: q.question,
                                    year: yearKey.replace(' Year', ' বর্ষ'),
                                    code: courseCode,
                                    exam_year: exam.exam_year // Use exam_year from exam object
                                });
                            }
                        });
                    }
                });
            }

            // Search Chapter/Topic Questions
            if (course.chapter) {
                 Object.values(course.chapter).forEach(chap => {
                    if(chap.data){ // Check if chap.data exists
                         Object.values(chap.data).forEach(q => {
                            if (q.question && q.question.toLowerCase().includes(currentState.searchQuery)) {
                                results.push({
                                    type: 'Topic Question',
                                    text: q.question,
                                    year: yearKey.replace(' Year', ' বর্ষ'),
                                    code: courseCode,
                                    chapter_title: chap.title_bn
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    // Display Results
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p style="color: var(--outline);">কোনো ফলাফল খুঁজে পাওয়া যায়নি।</p>';
    } else {
        let resultsHtml = `<h3>ফলাফল (${results.length}টি)</h3>`;
        results.forEach(res => {
            // Reconstruct the navigation path
            const navYear = res.year.replace(' বর্ষ', ' Year');
            // Note: Since search results don't point to a specific exam or chapter, 
            // navigating to the 'course' page is the best generic action.
            resultsHtml += `
                <div class="material-card" onclick="navigate('course', '${navYear}', '${res.code}')">
                    <p style="font-size: 0.8rem; color: var(--outline); margin-bottom: 5px;">
                        ${res.year} | কোর্স: ${res.code} 
                        ${res.exam_year ? `| পরীক্ষা: ${res.exam_year}` : `| টপিক: ${res.chapter_title || 'অজানা'}`}
                    </p>
                    <p><strong>${res.text}</strong></p>
                </div>
            `;
        });
        resultsDiv.innerHTML = resultsHtml;
    }
}

/** Renders the Search Page. */
function renderSearch() {
    contentContainer.innerHTML = `
        <h2>অনুসন্ধান</h2>
        <div class="search-container" style="margin-bottom: 20px;">
            <input type="text" id="search-input" placeholder="কোর্স কোড বা প্রশ্নের অংশ লিখুন..." 
                   style="width: 100%; padding: 10px; border: 1px solid var(--outline); border-radius: 8px;"
                   onkeyup="performSearch(this.value)"
                   value="${currentState.searchQuery}"> </div>
        <div id="search-results">
            <p style="color: var(--outline);">অনুসন্ধান শুরু করুন...</p>
        </div>
    `;
    if (currentState.searchQuery) {
        // If there was a previous search query, run the search immediately
        performSearch(currentState.searchQuery);
    }
}

/** Toggles the mobile navigation drawer (sidebar) */
window.toggleSidebar = function() {
    document.getElementById('nav-sidebar').classList.toggle('open');
}

/** Toggles the active tab content */
window.showTab = function(tabId, buttonElement) {
    document.querySelectorAll('.tab-content-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
    
    // Deactivate all previously active content displays
    document.querySelectorAll('.tab-content-item').forEach(el => el.style.display = 'none');

    // Activate the new content display
    const content = document.getElementById(`tab-content-${tabId}`);
    if (content) {
        content.classList.add('active');
        content.style.display = 'block'; // Make content visible
    }

    if (buttonElement) {
        buttonElement.classList.add('active');
    }
}

/** Toggles the Expansion Panel (Accordion) */
window.togglePanel = function(headerElement) {
    const content = headerElement.nextElementSibling;
    const icon = headerElement.querySelector('.material-symbols-outlined');

    // Toggle the 'open' class for styling and transition
    content.classList.toggle('open'); 
    
    if (content.classList.contains('open')) {
        icon.innerText = 'expand_less';
        // Set max-height for smooth transition (1000px is arbitrary but high enough)
        content.style.maxHeight = '1000px'; 
    } else {
        icon.innerText = 'expand_more';
        // Reset max-height to 0 to trigger close transition
        content.style.maxHeight = '0';
    }
}

/** Handles hash changes for navigation */
window.onhashchange = function() {
    const path = window.location.hash.slice(1).split('/');
    const view = path[0] || 'home';
    const year = path[1] || null;
    const courseCode = path[2] || null;
    
    // Only navigate if the data is already loaded to avoid race conditions
    if (window.NU_DATA) {
        if (view === 'course' && year && courseCode) {
            navigate(view, year, courseCode);
        } else if (view.includes('Year')) {
            navigate(view);
        } else if (view === 'search') {
            // Need to handle search query if present in hash, but current hash logic doesn't include it.
            // Keeping it simple and just navigating to the search page.
            navigate(view);
        } else {
            navigate('home');
        }
    }
};


// Start the Application: Load Data
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
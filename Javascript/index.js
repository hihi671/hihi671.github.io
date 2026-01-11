import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getDatabase, ref, push, serverTimestamp, query, limitToLast, orderByKey, endBefore, get } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js';
import { initializeAppCheck, ReCaptchaV3Provider } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app-check.js';

const firebaseConfig = {
    apiKey: "AIzaSyBodxxzeqHRBHrlxZKhQZjpc_LPiLEP--I",
    authDomain: "myweb-1f8c8.firebaseapp.com",
    databaseURL: "https://myweb-1f8c8-default-rtdb.firebaseio.com",
    projectId: "myweb-1f8c8",
    storageBucket: "myweb-1f8c8.firebasestorage.app",
    messagingSenderId: "933632391116",
    appId: "1:933632391116:web:c83a759eb82ab7c7adcf69",
    measurementId: "G-PLC6TDSDS1"
};
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true; 
}
const app = initializeApp(firebaseConfig);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6Lf3SUcsAAAAAOr0fU_zCazezhWEgR1EVIZdzQdW'),
    isTokenAutoRefreshEnabled: true
});
const db = getDatabase(app);
const commentsRef = ref(db, 'comments');
const pageSize = 5;
let lastTimestamp = null;
let currentLang = 'cn';

const langMap = {
    'cn': {
        alert: '請輸入暱稱與留言！',
        fail: '發送失敗: ',
        switch: '切換深淺模式',
        top: '回到頂部',
        nickname: '暱稱',
        content: '想說的話...',
        submit: '發送留言',
        loading: '載入留言中...',
        empty: '尚無留言',
        more: '載入更多',
        post: '發送留言',
        wait: '請等待'
    },
    'en': {
        alert: 'Please enter nickname and message!',
        fail: 'Failed to Post: ',
        switch: 'Toggle Dark Mode',
        top: 'Back to Top',
        nickname: 'Nickname',
        content: 'What’s on your mind...',
        submit: 'Post Message',
        loading: 'Loading comments...',
        empty: 'No comments yet',
        more: 'Load More',
        post: 'Post Message',
        wait: 'Wait'
    },
    'jp': {
        alert: 'ニックネームとメッセージを入力してください！',
        fail: '送信に失敗しました: ',
        switch: 'ダークモード切替',
        top: 'トップに戻る',
        nickname: 'ニックネーム',
        content: 'メッセージを入力してください...',
        submit: '送信する',
        loading: 'コメントを読み込み中...',
        empty: 'コメントはまだありません',
        more: 'もっと読み込む',
        post: '送信する',
        wait: 'お待ちください'
    }
};

window.onbeforeunload = function() {
    window.scrollTo(0, 0);
};

window.onscroll = function() {
    const $backToTop = $('#backToTop');
    if ($('#mainContent').hasClass('contentLoaded') && 
        (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20)) {
        $backToTop.stop(true, true).fadeIn(300).css("display", "flex");
    } else {
        $backToTop.fadeOut(300);
    }
};

$(function () {
    const savedLang = localStorage.getItem('language');
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang.toLowerCase();

    if (savedLang) {
        currentLang = savedLang;
    } else if (shortLang.includes('ja')) {
        currentLang = 'jp';
    } else if (shortLang.includes('en')) {
        currentLang = 'en';
    } else {
        currentLang = 'cn';
    }

    changeLanguage(currentLang);
    updateButtonTitle();

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        $('#modeIcon').text('☀️');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        $('#modeIcon').text('🌓');
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (!localStorage.getItem('theme')) {
            const newTheme = event.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            $('#modeIcon').text(event.matches ? '☀️' : '🌓');
            setTimeout(() => { AOS.refresh(); }, 100);
        }
    });
    
    initLoadingBar();

    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('#backToTop').addClass('show');
        } else {
            $('#backToTop').removeClass('show');
        }
    });

    initComments();

    $('#loadMoreBtn').on('click', () => {
        loadComments(true);
    });
});

export function changeLanguage(language) {
    currentLang = language;
    
    localStorage.setItem('language', language); 

    const langs = ['chinese', 'english', 'japanese'];
    langs.forEach(l => {
        $(`.${l}`).hide();
    });

    const langMap = { 'cn': '.chinese', 'en': '.english', 'jp': '.japanese' };
    $(langMap[language]).show();

    updateButtonTitle();
    updateCommentBoardText(language);
    
    setTimeout(() => { AOS.refresh(); }, 100);
}

export async function postComment() {
    const map = langMap[currentLang] || langMap['cn'];
    const $btn = $('#submitComment');
    const name = $('#nickname').val().trim();
    const msg = $('#commentText').val().trim();
    let userIp = 'unknown'

    if (!name || !msg) {
        alert(map.alert);
        return;
    }

    $btn.prop('disabled', true);

    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (!ipResponse.ok) {
            throw new Error(`IP API Status: ${ipResponse.status}`);
        }
        const ipData = await ipResponse.json();
        userIp = ipData.ip || 'unknown';
        
        await push(commentsRef, { 
            name: name, 
            message: msg, 
            time: serverTimestamp(),
            ip: userIp
        });

        $('#nickname').val("");
        $('#commentText').val("");
        initComments();
        startCountdown(10);
    } catch (error) {
        console.error(map.fail, error);
        $btn.prop('disabled', false);
        $btn.text(map.post);
    }
}

export function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

export function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        $('#modeIcon').text('🌓');
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        $('#modeIcon').text('☀️');
    }

    setTimeout(() => { AOS.refresh(); }, 100);
}

function updateButtonTitle() {
    const map = langMap[currentLang] || langMap['cn'];
    const fab = $('#darkMode');
    const topBtn = $('#backToTop');
    
    fab.attr('title', map.switch);
    topBtn.attr('title', map.top);
}

function updateCommentBoardText(lang) {
    const map = langMap[lang] || langMap['cn'];
    $('#nickname').attr('placeholder', map.nickname);
    $('#commentText').attr('placeholder', map.content);
    if (!$('#submitComment').prop('disabled')) {
        $('#submitComment').text(map.submit);
    }
    $('#loadingMsg').text(map.loading);
    $('#loadMoreBtn').text(map.more);
}

function initLoadingBar() {
    const $bar = $("#bar");
    const $progressDiv = $(".progress");
    
    const imgs = document.querySelectorAll('img[src]:not([loading="lazy"])'); 
    const total = imgs.length + 1;
    let loaded = 0;

    function increment() {
        loaded++;
        let width = Math.round((loaded / total) * 100);
        $bar.stop().animate({ width: width + "%" }, 200);

        if (loaded >= total) {
            setTimeout(() => {
                $progressDiv.fadeOut("slow", function() {
                    $('#mainContent, #darkMode, .language').addClass('contentLoaded');
                    AOS.init({ easing: 'ease-out-back', duration: 1000 });
                    AOS.refresh();
                });
            }, 500);
        }
    }

    if (imgs.length === 0) {
        increment();
    } else {
        imgs.forEach(img => {
            if (img.complete) increment();
            else $(img).on('load error', increment);
        });
    }
    increment(); 
}

function initComments() {
    $('#commentList').empty();
    lastTimestamp = null;
    loadComments(false);
}

async function loadComments(isLoadMore = false) {
    const map = langMap[currentLang] || langMap['cn'];
    let commentsQuery;
    if (!isLoadMore) {
        commentsQuery = query(commentsRef, orderByKey(), limitToLast(pageSize));
    } else {
        commentsQuery = query(commentsRef, orderByKey(), endBefore(lastTimestamp), limitToLast(pageSize));
    }

    const snapshot = await get(commentsQuery);
    const data = snapshot.val();

    if (!data) {
        $('#loadMoreBtn').hide();
        if (!isLoadMore) {
            $('#commentList').html(`<p class="emptyList">${map.empty}</p>`);
        }
        return;
    }

    const entries = Object.entries(data);
    lastTimestamp = entries[0][0];

    if (entries.length < pageSize) {
        $('#loadMoreBtn').hide();
    } else {
        $('#loadMoreBtn').show();
    }

    entries.reverse().forEach(([key, item]) => {
        const displayTime = formatMyDate(item.time);
        const commentHtml = `
            <div class="commentItem">
                <div class="commentHeader">
                    <span class="commentName">${escapeHtml(item.name)}</span>
                    <span class="commentTime">${displayTime}</span>
                </div>
                <div class="comment-body">${escapeHtml(item.message)}</div>
            </div>`;
        
        $('#commentList').append(commentHtml);
    });
}

function formatMyDate(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function startCountdown(seconds) {
    const map = langMap[currentLang] || langMap['cn'];
    const $btn = $('#submitComment');
    let timeLeft = seconds;

    const timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            $btn.prop('disabled', false);
            $btn.text(map.post);
        } else {
            $btn.text(`${map.wait} ${timeLeft}s`);
            timeLeft--;
        }
    }, 1000);
}

function escapeHtml(text) {
    return $('<div>').text(text).html();
}

window.changeLanguage = changeLanguage;
window.postComment = postComment;
window.scrollToTop = scrollToTop;
window.toggleDarkMode = toggleDarkMode;
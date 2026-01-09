let currentLang = 'cn';

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
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

    const swiper = new Swiper(".mySwiper", {
        direction: "horizontal",
        effect: "fade",
        speed: 1200,
        slidesPerView: 1,
        spaceBetween: 10,
        lazy: { loadPrevNext: true, },
        pagination: { el: '.swiper-pagination', dynamicBullets: true },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    });
    
    initLoadingBar();

    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            $('#backToTop').addClass('show');
        } else {
            $('#backToTop').removeClass('show');
        }
    });
});

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
                    AOS.init({ easing: 'ease-out-back', duration: 1000 });
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

function changeLanguage(language) {
    currentLang = language;
    
    localStorage.setItem('language', language); 

    const langs = ['chinese', 'english', 'japanese'];
    langs.forEach(l => {
        $(`.${l}`).hide();
    });

    const langMap = { 'cn': '.chinese', 'en': '.english', 'jp': '.japanese' };
    $(langMap[language]).show();

    updateButtonTitle();
    
    setTimeout(() => { AOS.refresh(); }, 100);
}

function updateButtonTitle() {
    const fab = $('#darkMode');
    const topBtn = $('#backToTop');
    
    const modeTitles = { 'cn': '切換深淺模式', 'jp': 'ダークモード切替', 'en': 'Toggle Dark Mode' };
    const topTitles = { 'cn': '回到頂部', 'jp': 'トップに戻る', 'en': 'Back to Top' };
    
    fab.attr('title', modeTitles[currentLang] || modeTitles['cn']);
    topBtn.attr('title', topTitles[currentLang] || topTitles['cn']);
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function toggleDarkMode() {
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
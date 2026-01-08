let currentLang = 'cn';

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

$(function () {
    const browserLang = navigator.language || navigator.userLanguage; 
    const shortLang = browserLang.toLowerCase();
    if (shortLang.includes('ja')) {
        currentLang = 'jp';
    } else if (shortLang.includes('en')) {
        currentLang = 'en';
    } else {
        currentLang = 'cn';
    }

    changeLanguage(currentLang);
    updateFabTitle();

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        $('#mode-icon').text('☀️');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        $('#mode-icon').text('🌓');
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (!localStorage.getItem('theme')) {
            const newTheme = event.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            $('#mode-icon').text(event.matches ? '☀️' : '🌓');
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
            $('#back-to-top').addClass('show');
        } else {
            $('#back-to-top').removeClass('show');
        }
    });
});

function initLoadingBar() {
    const $bar = $("#bar1");
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
    
    const langs = ['chinese', 'english', 'japanese'];
    langs.forEach(l => {
        $(`.${l}`).hide();
    });

    const langMap = { 'cn': '.chinese', 'en': '.english', 'jp': '.japanese' };
    $(langMap[language]).show();

    updateFabTitle();
    
    setTimeout(() => { AOS.refresh(); }, 100);
}

function updateFabTitle() {
    const fab = $('#dark-mode-fab');
    const topBtn = $('#back-to-top');
    
    const modeTitles = { 'cn': '切換深淺模式', 'jp': 'ダークモード切替', 'en': 'Toggle Dark Mode' };
    const topTitles = { 'cn': '回到頂部', 'jp': 'トップに戻る', 'en': 'Back to Top' };
    
    fab.attr('title', modeTitles[currentLang] || modeTitles['cn']);
    topBtn.attr('title', topTitles[currentLang] || topTitles['cn']);
}

function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        $('#mode-icon').text('🌓');
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        $('#mode-icon').text('☀️');
    }

    setTimeout(() => { AOS.refresh(); }, 100);
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
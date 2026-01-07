window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

$(function () {
    const swiper = new Swiper(".mySwiper", {
        direction: "horizontal",
        effect: "fade",
        speed: 1200,
        slidesPerView: 1,
        spaceBetween: 10,
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets',
            dynamicBullets: true,
            hideOnClick: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
            hideOnClick: true,
        },
    });
    initLoadingBar();
})

function initLoadingBar() {
    const $bar = $("#bar1");
    const $progressDiv = $(".progress");
    const imgs = document.querySelectorAll('img');
    const total = imgs.length + 1;
    let loaded = 0;

    function increment() {
        loaded++;
        let width = Math.round((loaded / total) * 100);
        $bar.stop().animate({ width: width + "%" }, 200);

        if (loaded >= total) {
            setTimeout(() => {
                $progressDiv.fadeOut("slow", function() {
                    AOS.init({
                        easing: 'ease-out-back',
                        duration: 1000,
                    });
                });
            }, 500);
        }
    }

    if (imgs.length === 0) {
        increment();
    } else {
        imgs.forEach(img => {
            if (img.complete) {
                increment();
            } else {
                $(img).on('load error', increment);
            }
        });
    }
    
    increment(); 
}

function change_language(language) {
    var chineseElements = document.getElementsByClassName("chinese");
    var englishElements = document.getElementsByClassName("english");
    var japaneseElements = document.getElementsByClassName("japanese");

    Array.from(chineseElements).forEach(function (element) {
        element.style.display = "none";
    });

    Array.from(englishElements).forEach(function (element) {
        element.style.display = "none";
    });

    Array.from(japaneseElements).forEach(function (element) {
        element.style.display = "none";
    });

    if (language === 'cn') {
        Array.from(chineseElements).forEach(function (element) {
            element.style.display = "block";
        });
    } else if (language === 'en') {
        Array.from(englishElements).forEach(function (element) {
            element.style.display = "block";
        });
    } else if (language === 'jp') {
        Array.from(japaneseElements).forEach(function (element) {
            element.style.display = "block";
        });
    }
}
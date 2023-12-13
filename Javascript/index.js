$(function () {
    AOS.init({
        easing: 'ease-out-back',
        duration: 1000
    });
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
})

document.onreadystatechange = function (e) {
    if (document.readyState == "interactive") {
        var all = document.getElementsByTagName("*");
        for (var i = 0, max = all.length; i < max; i++) {
            set_ele(all[i]);
        }
    }
}

function check_element(ele) {
    var all = document.getElementsByTagName("*");
    var totalele = all.length;
    var per_inc = 100 / all.length;

    if ($(ele).on()) {
        var prog_width = per_inc + Number(document.getElementById("progress_width").value);
        document.getElementById("progress_width").value = prog_width;
        $("#bar1").animate({
            width: prog_width + "%"
        }, 3, function () {
            if (document.getElementById("bar1").style.width == "100%") {
                $(".progress").fadeOut("slow");
            }
        });
    } else {
        set_ele(ele);
    }
}

function set_ele(set_element) {
    check_element(set_element);
}

function change_language(language) {
    // 獲取所有語言元素
    var chineseElements = document.getElementsByClassName("chinese");
    var englishElements = document.getElementsByClassName("english");
    var japaneseElements = document.getElementsByClassName("japanese");

    // 隱藏所有語言元素
    Array.from(chineseElements).forEach(function (element) {
        element.style.display = "none";
    });

    Array.from(englishElements).forEach(function (element) {
        element.style.display = "none";
    });

    Array.from(japaneseElements).forEach(function (element) {
        element.style.display = "none";
    });

    // 根據選擇的語言顯示相應元素
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
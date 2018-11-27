// ==UserScript==
// @name            Show 163 Image 4 FF
// @namespace        a@b.c
// @author                jasake
// @description        显示网易新闻图片(webp->jpg)
// @include                http*://*.163.com/*
// ==/UserScript==

    window.addEventListener('load', function(e) {
        [].forEach.call(document.querySelectorAll('img:-moz-broken'), function(x) {
            x.src = x.src + '&type=jpg';
        });
    },
    false);
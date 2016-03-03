// ==UserScript==
// @name          No-URL-Redirect
// @namespace     test
// @include       http*://*.zhihu.com/*
// @version       0.1
// @description   移除链接重定向
// @grant none
// @run-at        document-start
// ==/UserScript==

document.addEventListener('DOMContentLoaded', function (){
var Atext=document.body.innerHTML;document.body.innerHTML=Atext.replace(/\/\/link\.zhihu\.com\/\?target=(https?)%3A/gi,'$1:');
}, false);
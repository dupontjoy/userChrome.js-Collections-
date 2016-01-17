// ==UserScript==
// @name        Weixin_Image
// @namespace   微信图片反盗链
// @description 微信图片反盗链
// @include     *
// @version     2016.01.17
// @grant 		  none
// ==/UserScript==
(function(){
var wxIMGs=document.querySelectorAll('img[data-src][data-original]');for(i=0;i<wxIMGs.length;i++){wxIMGs[i].src=wxIMGs[i].getAttribute('data-src');}void(0)
})()

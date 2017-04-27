// ==UserScript==
// @name        图片源链接更改
// @namespace   微信, 得到图片反盗链
// @description 设置data-src等于src. 需要配合Referchange使用, 设置qpic.cn和qlogo.cn为@Block.
// @include     *
// @version     2017.04.27
// @grant 		  none
// ==/UserScript==
(function(){
var wxIMGs=document.querySelectorAll('img[data-src][data-original]');for(i=0;i<wxIMGs.length;i++){wxIMGs[i].src=wxIMGs[i].getAttribute('data-src');}void(0)
var dedaoIMGs=document.querySelectorAll('img[src][data-url]');for(i=0;i<dedaoIMGs.length;i++){dedaoIMGs[i].src=dedaoIMGs[i].getAttribute('data-url');}void(0)
})()

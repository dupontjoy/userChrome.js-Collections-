// ==UserScript==
// @name        Weixin_Image
// @namespace   微信图片反盗链
// @description 设置data-src等于src. 需要配合Referchange使用, 设置qpic.cn和qlogo.cn为@Block.
// @include     *
// @version     2016.01.21
// @grant 		  none
// ==/UserScript==
(function(){
var wxIMGs=document.querySelectorAll('img[data-src][data-original]');for(i=0;i<wxIMGs.length;i++){wxIMGs[i].src=wxIMGs[i].getAttribute('data-src');}void(0)
})()

// ==UserScript==
// @name        Weixin_Image
// @namespace   微信, 得到, 网易图片反盗链
// @description 设置data-src等于src. 需要配合Referchange使用, 设置qpic.cn和qlogo.cn为@Block.
// @include     *dedao*
// @include     *163.com*
// @version     2017.06.13
// @grant 		  none
// ==/UserScript==
(function(){
//微信文章
var wxIMGs=document.querySelectorAll('img[data-src][data-original]');for(i=0;i<wxIMGs.length;i++){wxIMGs[i].src=wxIMGs[i].getAttribute('data-src');}void(0);
//得到分享
var dedaoIMGs=document.querySelectorAll('img[src][data-url]');for(i=0;i<dedaoIMGs.length;i++){dedaoIMGs[i].src=dedaoIMGs[i].getAttribute('data-url');}void(0);
//网易
document.querySelector('.more-article');var IMGs = document.querySelectorAll('figure[data-echo],aside[data-echo]');[].forEach.call(IMGs,function(x){x.outerHTML=x.outerHTML.replace(/figure|aside/,'img').replace('data-echo','src');});void(0);
})()
// ==UserScript==
// @name        Weixin_Image
// @namespace   微信, 得到图片反盗链
// @description 设置data-src等于src. 需要配合Referchange使用, 设置qpic.cn和qlogo.cn为@Block.
// @include     *dedao*
// @version     2017.04.28
// @grant 		  none
// ==/UserScript==
(function(){
//微信文章
var wxIMGs=document.querySelectorAll('img[data-src][data-original]');for(i=0;i<wxIMGs.length;i++){wxIMGs[i].src=wxIMGs[i].getAttribute('data-src');}void(0);
//得到分享
var dedaoIMGs=document.querySelectorAll('img[src][data-url]');for(i=0;i<dedaoIMGs.length;i++){dedaoIMGs[i].src=dedaoIMGs[i].getAttribute('data-url');}void(0);
})()

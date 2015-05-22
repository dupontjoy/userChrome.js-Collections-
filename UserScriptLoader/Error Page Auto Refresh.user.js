// ==UserScript==
// @name           Error Page Auto Refresh
// @description    Refresh on failed page loading & Gateway problems
// @author         feiruo&hsyh
// @Mod            Dupont整理
// @version        0.0.17
// @grant          none
// @namespace      https://greasyfork.org/zh-CN/users/363
// ==/UserScript==

var time = 10000; //原脚本时间设置：默认为10秒，单位以毫秒计

(function () 
{
//from: hsyh 2014.09.25
if (document.getElementsByTagName('div') [0].getAttribute('id') == 'errorPageContainer')
{
//setTimeout(f: fn(), ms: number) -> number
setTimeout(function () {
window.location.reload(true);
}, 10000);
} 

//感谢feiruo
if (/^(about:neterror)/.test(document.URL))
{setTimeout(function() {window.location.reload(true);}, time);}
		
})();
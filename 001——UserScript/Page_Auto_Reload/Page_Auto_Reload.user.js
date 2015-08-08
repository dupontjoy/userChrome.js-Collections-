// ==UserScript==
// @name           Page Auto Reload
// @description    Reload page on a given timing
// @author         Cing
// @include        http*://ic.sjlpj.cn/UpShelf/OperationManageList
// @include        http*://ic.sjlpj.cn/#/UpShelf/OperationManageList
// @version        0.0.2
// @grant          none
// @namespace      
// ==/UserScript==

var time = 600000; //单位以毫秒计（10分鐘）

(function () 
{
setTimeout(function() {location.reload(true);}, time);
})();
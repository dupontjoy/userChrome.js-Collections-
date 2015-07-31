// ==UserScript==
// @name           Page Auto Reload
// @description    Reload page on a given timing
// @author         Cing
// @include        http://ic.sjlpj.cn/*UpShelf/OperationManageList
// @version        0.0.1
// @grant          none
// @namespace      
// ==/UserScript==

var time = 3600000; //单位以毫秒计（1小時）

(function () 
{
setTimeout(function() {window.location.reload(true);}, time);
})();
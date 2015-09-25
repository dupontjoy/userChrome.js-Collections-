// ==UserScript==
// @name           Page Auto Reload
// @description    Reload page on a given timing
// @author         Cing
// @include        http*://ic.sjlpj.cn/UpShelf/OperationManageList
// @include        http*://ic.sjlpj.cn/#/UpShelf/OperationManageList
// @version        0.0.3
// @grant          none
// @namespace      
// ==/UserScript==

var time = 30; //单位以分鐘计

(function () 
{
setTimeout(function() {location.reload(true);}, time * 60000);
})();
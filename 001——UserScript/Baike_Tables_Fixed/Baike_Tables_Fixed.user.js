// ==UserScript==
// @name        Baike Tables Fixed
// @namespace   BaikeTablesFixed@baidu.com
// @description 修正百度百科某些表格排版异常
// @include     http://baike.baidu.com/view/*
// @include     http://baike.baidu.com/link?url=*
// @version     1
// @grant       none
// ==/UserScript==

/* 估计是百度百科的表格输出程序没有考虑到 td 的属性有 rowspan="0"、colspan="0" 的情况。
// 由于只有 Firefox 和 Opera(Presto) 支持这两个特殊值，
// 而在 IE 和 webkit 引擎中，这两个值会被忽略（HTML4 + 中，Firefox 也会在 "Quirks Mode" 下忽略：
// https://developer.mozilla.org/en-US/docs/Mozilla_Quirks_Mode_Behavior#Tables）。*/

Array.prototype.forEach.call(document.querySelectorAll('td[rowspan="0"], td[colspan="0"]'), function(td){
	(td.matches || td.mozMatchesSelector).call(td, '[rowspan="0"]') && td.removeAttribute('rowspan');
	(td.matches || td.mozMatchesSelector).call(td, '[colspan="0"]') && td.removeAttribute('colspan');
});
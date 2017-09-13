// ==UserScript==
// @name         redirect
// @description  简单的重定向
// @namespace    1018148046
// @author       颜太吓
// @include      chrome://browser/content/browser.xul
// @version      0.1
// @charset      UTF-8
// ==/UserScript==
(() => {
	'use strict';
	let {WebRequest} = Cu.import("resource://gre/modules/WebRequest.jsm", {});
	Cu.import("resource://gre/modules/MatchPattern.jsm");
	let rules = [{
		name: "sourceforge下載 >> 鏡像站點",
		from: /https:\/\/sourceforge\.net\/projects\/(((\w)\w).*)\/files\/(.*)\/download/i,
		//to: "http://jaist.dl.sourceforge.net/project/$1/$4",
		//to: "http://nchc.dl.sourceforge.net/project/$1/$4",
		to: "http://master.dl.sourceforge.net/project/$1/$4",
		//to: "http://softlayer-sng.dl.sourceforge.net/project/$1/$4",
	}, {
		name: "百度贴吧|百科 >> 原始大图",
		from: /http:\/\/(imgsrc|[\w]?\.hiphotos)\.baidu\.com\/(forum|baike)\/[\w].+\/sign=[^\/]+(\/.*).jpg/i,
		to: "http://$1.baidu.com/$2/pic/item$3.jpg"
	}, {
		name: "哔哩哔哩番剧页面",
		from: /http:\/\/www.bilibili\.com\/html\/html5player.html(.*)/i,
		exclude: /as_wide/,
		to: "http://www.bilibili.com/html/html5player.html$1&as_wide=1&autoplay=1"
	}];
	//重定向
	let redirect = e => {
		for (let rule of rules) {
			if (rule.from.test(e.url) && (!rule.exclude || !rule.exclude.test(e.url))) {
        return {redirectUrl: e.url.replace(rule.from, rule.to)};
      }
		}
	}
	WebRequest.onBeforeSendHeaders.addListener(redirect, {urls: new MatchPattern('<all_urls>')}, ["blocking"]);
	//去除跨域限制
	let response = e => {
		let Headers = e.responseHeaders;
		Headers.push({name:'Access-Control-Allow-Origin',value: e.browser.registeredOpenURI.prePath},
			{name:'Access-Control-Allow-Credentials',value: true},
			{name:'Access-Control-Allow-Headers',value: 'Range'},
			{name:'Access-Control-Allow-Methos',value: 'GET, OPTIONS, POST'});
		return {responseHeaders : Headers};
	}, urls = ['http://interface.bilibili.com/playurl?*', 'http://*.acgvideo.com/*', 'http://play.youku.com/play/get.json?*', 'http://k.youku.com/player/getFlvPath/sid/*', 'http://*/youku/*.flv'];
	WebRequest.onHeadersReceived.addListener(response, {urls: new MatchPattern(urls)}, ["responseHeaders","blocking"]);
})();
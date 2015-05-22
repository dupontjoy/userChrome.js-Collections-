// ==UserScript==
// @name  网页自动化系列点击
// @namespace  autoClick1by1.jasonshaw
// @version    0.4
// @description  匹配的任意url，顺序逐个点击设定的obj，任意不存在则彻底停止
// @include      http://*.kdslife.com/show/photo/*.html
// @include      http://www.repaik.com/forum.php?mod=viewthread*
// @include      http://*.pcauto.com.cn/*/*/*/*.html
// @include      http://bbs.pinggu.org/plugin.php?id=dsu_paulsign:sign*
// @include      http://www.repaik.com/plugin.php?id=dsu_paulsign:sign*
// @include      http://bbs.kafan.cn/thread-*-*-*.html
// @include      http://*.fx678.com*
// @note         允许是定standby状态，用于要点击的内容依赖页面初始加载后的动态加载才能运行的情况，默认直接运行系列化点击，否则等待动态加载后运行
// @note         允许自定义网站的点击延迟时间
// @note         允许自定义网站的是否在系列点击之后关闭网页
// @note         增加脚本运行判断，解决个别页面动态加载问题，比如睿派克签到
// @note         支持kds阻止相册自动翻页
// @note         支持睿派克、人大论坛自动等自动签到
// @note         支持卡饭、睿派克自动关闭侧栏
// @note         支持太平洋汽车本页展开全部内容
// @run-at       document-end
// @copyright  2014+, jasonshaw
// ==/UserScript==
(function(){
	var autoClose = false,delay = 500,standby = false;
	var prefs = {
		'kds': {
			standby: false,//定义是否，存在等待
			startReg: /http:\/\/model\.kdslife\.com\/show\/photo\/\d+\.html/i,//定义href正则
			autoClose: true,//config中dom.allow_scripts_to_close_windows  需要为true, 存在风险，请谨慎使用
			elements: ['.bigp_nav2 > form > input[value="stop"]'],//所有参数为要点击的按钮的css3 selector
			delay: 500
		},
		'repaik': {
			startReg: /http:\/\/www\.repaik\.com\/forum\.php\?mod=viewthread&tid=\d+/i,
			elements: ['a.btn_s_close']
		},
		'pcauto': {
			startReg: /http:\/\/\w+\.pcauto\.com\.cn\/.+\.html/i,
			elements: ['div.pageViewGuidedd > a[rel="nofollow"]']
		},
		'pinggu': {
			startReg: /http:\/\/bbs\.pinggu\.org\/plugin\.php\?id=dsu_paulsign:sign/,
			elements: ['ul.qdsmile > li#fd','table[class="tfm qdtfm"] input[value="2"]','td.qdnewtd3 > a']
		},
		'repaik1': {
			standby: true,//这里的自动签到，就是动态加载，需要等待签到所需的dom元素和js加载和执行完毕，再运行自动化点击实现签到
			autoClose: true,
			startReg: /http:\/\/www\.repaik\.com\/plugin\.php\?id=dsu_paulsign:sign/,
			elements: ['ul.qdsmile > li#ch','table[class="tfm"] input[value="2"]','.tr3 > div:nth-child(2) > a > img']
		},
		'kafan': {
			startReg: /http:\/\/bbs\.kafan\.cn\/thread-\d+-\d+-\d+\.html/,
			elements: ['a.btn_s_close']
		},
		'fx678': {
			startReg: /http:\/\/\w+\.fx678\.com/i,
			elements: ['#here_hh']
		},
	};
	function autoClick1by1(){
		var href = window.location.href,site = null,i = 0;
		for (var key in prefs) if(prefs[key].startReg.test(href)) {site = key;break;}
		if(site == null) return;
		var elements = prefs[site].elements;
		autoClose = prefs[site].autoClose || autoClose;
		delay = prefs[site].delay || delay;
		standby = prefs[site].standby || standby;
		setTimeout(function(){
			try {
				var elements = prefs[site].elements;
				while(elements[i]){
					var obj = document.querySelector(elements[i]);
					if(obj == null) return;
					obj.click();
					i++;
				}
			} catch(e){alert(e);}
		}, delay);
		setTimeout(function(){
			if(autoClose) window.close();
		}, delay+100);		
	}
	if(standby) {document.onreadystatechange = function () {
		if(document.readyState == "complete")autoClick1by1();
	}}
	else autoClick1by1();
})();

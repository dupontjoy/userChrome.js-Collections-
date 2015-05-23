// ==UserScript==
// @name            AidBar.uc.js
// @description     标签栏辅助自定义工具栏
// @include         chrome://browser/content/browser.xul
// @charset         UTF-8
// @author          defpt
// @homepageURL     https://github.com/defpt/userChromeJs/tree/master/AidBar.uc.js
// @reviewURL       http://bbs.kafan.cn/thread-1727960-1-1.html
(function() {
	var TabsToolbar = document.getElementById("TabsToolbar");
	if(TabsToolbar) {
		var aidBar = document.createElement('hbox');
		aidBar.setAttribute('id', 'TabsToolbar_aidBar');
		aidBar.setAttribute("label", "辅助栏");
		aidBar.setAttribute("class", "toolbar");
		TabsToolbar.insertBefore(aidBar, document.getElementById("alltabs-button"));
		
		document.insertBefore(document.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent('\
#TabsToolbar_aidBar{\
	overflow:hidden; \
	max-width:16px; \
	opacity:0; \
	transition: 0.8s; \
	transition-delay:1s;\
}\
#TabsToolbar_aidBar:hover{\
   max-width:300px;/*300px足够用了吧？*/\
    opacity:1;\
	transition-delay:.2s;\
}\
#TabsToolbar_aidBar > image, .statusbarpanel-iconic{\
	padding:5px 2px;\
}\
') + '"'), document.documentElement);
	}
})();
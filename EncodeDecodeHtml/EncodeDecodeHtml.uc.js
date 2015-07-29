// ==UserScript==
// @label            EncodeDecodeHtml.uc.js
// @description      各式的編碼編輯工具
// @author           skofkyo
// @license          MIT License
// @compatibility    Firefox 29+
// @charset          UTF-8
// @version          2014.12.13
// @include          main
// @include          chrome://browser/content/browser.xul

// @note             2015.07.29 換圖標 by Cing
// ==/UserScript==

(function() {

	var type = 2;		// 0:按鈕 2:工具菜單
	var image16 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAlUlEQVQ4ja2TwQ2AIAxF3wau4QCuwCxcPTKMI7iBO7iCA3BiArxUJaSCik2a0NL/+1MK/Gg9MAMBiDcepKbXwB4Yga7QpJMan5PMcvHUnGBOC5XOmpKQJuILsIpJg5VraA7Y5OwBWyMYBHScYxb7JwSpAs1NiWDimq6RvE3ipabAiMyoKCnOoPkZmxepeZUPks+f6bPtGg1LLkKBszsAAAAASUVORK5CYII=";

	if (type == 0) {
		CustomizableUI.createWidget({
			defaultArea: CustomizableUI.AREA_NAVBAR,
			id: "EncodeDecodeHtml",
			label: "編碼工具",
			tooltiptext: "編碼工具",
		});
		var EncodeTool = document.getElementById("EncodeDecodeHtml");
		EncodeTool.setAttribute("type", "menu");
		
		var cssStr = '@-moz-document url("chrome://browser/content/browser.xul"){'
			 +'#EncodeDecodeHtml .toolbarbutton-icon {list-style-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAlUlEQVQ4ja2TwQ2AIAxF3wau4QCuwCxcPTKMI7iBO7iCA3BiArxUJaSCik2a0NL/+1MK/Gg9MAMBiDcepKbXwB4Yga7QpJMan5PMcvHUnGBOC5XOmpKQJuILsIpJg5VraA7Y5OwBWyMYBHScYxb7JwSpAs1NiWDimq6RvE3ipabAiMyoKCnOoPkZmxepeZUPks+f6bPtGg1LLkKBszsAAAAASUVORK5CYII=)}'
			 +'}';
		var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
		var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
		sss.loadAndRegisterSheet(ios.newURI("data:text/css;base64," + btoa(cssStr), null, null), sss.USER_SHEET);

	} else if (type == 2) {
		EncodeTool = document.createElement("menu");
		EncodeTool.setAttribute("id", "EncodeDecodeHtml");
		EncodeTool.setAttribute("label", "編碼工具");
		EncodeTool.setAttribute("class", "menu-iconic");
		EncodeTool.setAttribute("image", image16);
		var dev = document.getElementById("devToolsSeparator");
		dev.parentNode.insertBefore(EncodeTool, dev)
	}

    EncodeToolitem = {
        add: function(amenu, parent) {
            var amenu = [
                {
                    label: "Unicode轉換",
                    tooltiptext: "Unicode轉換",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAe0lEQVQ4ja2T0Q3AIAhE3y4u4zTu40DORT+ExFqtRXsJHxAPj0PhjggkDlGA4CHIIvKOiqDEz0qM0OZuLxLVxED1YQuZOrfLRJQgzc2zJkJV+SiOCEXr5kVUhcutzA5YfenPqoGZ/dqgHyfieFy5i1FT95qly48/3H+4AA6QJ51Bic5yAAAAAElFTkSuQmCC",
					oncommand: 'Unicode();',
                },
                //{label: "sep"}, 
                {
                    label: "Javascript/HTML 格式化",
                    tooltiptext: "Javascript/HTML 格式化",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAaElEQVQ4jWNgoCL4TwA3EGMAPrnrhAwhZIA4IUMIGcBAyBBCBqBjkgwgSi264Ewo7YFk60wcavEacBRNTJlUA/KgckfxqMVrAAzADCLoAnSnIyvOY0CECV4DkAOM7EDEB3AaQAqmDgAAtlxHLWMw/vEAAAAASUVORK5CYII=",
					oncommand: 'JavaScriptBeautify();',
                },
                {
                    label: "CSS格式化",
                    tooltiptext: "CSS格式化",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhElEQVQ4jWNgQID/BDBBgE/RfwYGhgZiDfDAYut/BgaG64QMgWk4CqXzoIbB5MQJGQIzYCYeObyGoLvAA+oKmBzBQMUXBrjUEhYkx4CZUPZRHHyCBsAUKuPgEzQgjwE1DND5BA3QhdJbGRDpgIGBgeEkA2q6wGnAakpdQAzAaQApmDoAABPeUU+r3umtAAAAAElFTkSuQmCC",
					oncommand: 'CssBeautify();',
                },
                {
                    label: "檔案Base64編碼",
                    tooltiptext: "檔案Base64編碼",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAbElEQVQ4jWNgGAzgPwUYbgC5FmMYcBTJdA8smo4yMDAo4zIgD4oZoIrQXZYHFcNpALLp6EAZKo/XBf+RbEH3AkwjUQbg8xpBA5ABsq3o0aeMzYCZaM7GFr14XQBTgGwLyQaQAlAMoCgpDywAAF13Uxwj2+klAAAAAElFTkSuQmCC",
					oncommand: 'FileEncodeToBase64URL();',
                },
                {
                    label: "文字Base64解碼/編碼",
                    tooltiptext: "Base64解碼/編碼",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAbElEQVQ4jWNgGAzgPwUYbgC5FmMYcBTJdA8smo4yMDAo4zIgD4oZoIrQXZYHFcNpALLp6EAZKo/XBf+RbEH3AkwjUQbg8xpBA5ABsq3o0aeMzYCZaM7GFr14XQBTgGwLyQaQAlAMoCgpDywAAF13Uxwj2+klAAAAAElFTkSuQmCC",
					oncommand: 'Base64DecodeandEncode();',
                },
                {
                    label: "URL解碼/編碼",
                    tooltiptext: "URL解碼/編碼",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAxklEQVQ4jbWTLw6DMBjFf2ZmZg5VyxGw6F0AyQWQOA6whAv0Clxgd5icmsUhd4iJPkLXEla27CVNm/R7f/q1hT/A/ELOgafmEAUwpIjUwAhkQaoROKcm6YEbcACOwB1oUskzBo0rYPeSkfOEi/4VGuAhgXoPMQdauRuWm+mB8hO5U/HIe9MsrheThDYjGxVXgbAFTrgbaUOyYXlApZzW9k2wjhwyxa+I0co9U23nb/pnjOJ5uKgmehs5rjnFBnlGKaG1/7IfLwdcLCL/I9hSAAAAAElFTkSuQmCC",
					oncommand: 'URLDE();',
                },
                {
                    label: "線上圖片編輯",
                    tooltiptext: "線上圖片編輯",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA6klEQVQ4jc2SIW7DQBBFBwRUWu16vf9VCiwIKGykHKWgRygsyAHCCnuEwgLDHKDABygMCAgMDAgscIktuc7WNcxIQ1b73oy+xuxqStIrcASaYUs6AGszsxDCoiiK1S8YWEvamdnyn54Be0nfKaXH/vRDCGExtqH3/l5SZWa3wFnSqb9BMwH+BGqgbiXPkwQ9+KPLpCzLp2EGWUEOTim9XHzMCVp4B5xH4b8EwJdzbg68dXCM8cHMbqYKGknvkqpuMrCPMd7lBEfn3HzwtgE2vcBmkk7eey4E7RXWNnJEkipgm82gtU865eurH5ZsTgQIYhNoAAAAAElFTkSuQmCC",
                    oncommand: 'gBrowser.selectedTab = gBrowser.addTab("http://apps.pixlr.com/editor/");',
                },
                {
                    label: "JavaScript壓縮",
                    tooltiptext: "JavaScript壓縮",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAWklEQVQ4jWNgGCwghoGB4Q8DA8N/IvEfBgYGT2QDPjIwMFijGfofB5sBqvYZLsXIYsgYmzxBA4iVp50BZHmBjZouoNgAor3wjIHCdOAJFSA2JT5jQEuJQxgAAFeqQ1dXIFWxAAAAAElFTkSuQmCC",
                    oncommand: 'gBrowser.selectedTab = gBrowser.addTab("http://closure-compiler.appspot.com/home");',
                },
                {
                    label: "CSS壓縮",
                    tooltiptext: "CSS壓縮",
                    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAWklEQVQ4jWNgGCwghoGB4Q8DA8N/IvEfBgYGT2QDPjIwMFijGfofB5sBqvYZLsXIYsgYmzxBA4iVp50BZHmBjZouoNgAor3wjIHCdOAJFSA2JT5jQEuJQxgAAFeqQ1dXIFWxAAAAAElFTkSuQmCC",
                    oncommand: 'gBrowser.selectedTab = gBrowser.addTab("http://csscompressor.com/");',
                },

            ]

            var menupopup = document.createElement("menupopup");
            menupopup.setAttribute("id", "EncodeDecodeHtmlPopup");
            EncodeTool.appendChild(menupopup);

            for (var i = 0; i < amenu.length; i++) {
                if (amenu[i].label == "sep") {
                    var menuseparator = document.createElement("menuseparator");
                    menupopup.appendChild(menuseparator);
                } else {
                    var menuitem = document.createElement("menuitem");
                    menuitem.setAttribute("label", amenu[i].label);
                    menuitem.setAttribute("tooltiptext", amenu[i].tooltiptext);
                    menuitem.setAttribute("image", amenu[i].image);
                    menuitem.setAttribute("class", "menuitem-iconic");
                    menuitem.setAttribute("oncommand", amenu[i].oncommand);
                    //menuitem.setAttribute("onclick", amenu[i].onclick);
                    menupopup.appendChild(menuitem);
                }
                
            }
        },
    };
    EncodeToolitem.add();
})();

function Unicode() {
	var PATH = '/chrome/Local/html/Unicode.html';
	var handleRelativePath = function(path) {if (path) {path = path.replace(/\//g, '\\').toLocaleLowerCase();var ProfD = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get("ProfD", Ci.nsILocalFile).path;return ProfD + path;}};var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);file.initWithPath(handleRelativePath(PATH));gBrowser.selectedTab = gBrowser.addTab(file.path);
}
function JavaScriptBeautify() {
	var PATH = '/chrome/Local/html/JavaScriptBeautify.html';
	var handleRelativePath = function(path) {if (path) {path = path.replace(/\//g, '\\').toLocaleLowerCase();var ProfD = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get("ProfD", Ci.nsILocalFile).path;return ProfD + path;}};var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);file.initWithPath(handleRelativePath(PATH));gBrowser.selectedTab = gBrowser.addTab(file.path);
}
function CssBeautify() {
	var PATH = '/chrome/Local/html/CssBeautify.html';
	var handleRelativePath = function(path) {if (path) {path = path.replace(/\//g, '\\').toLocaleLowerCase();var ProfD = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get("ProfD", Ci.nsILocalFile).path;return ProfD + path;}};var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);file.initWithPath(handleRelativePath(PATH));gBrowser.selectedTab = gBrowser.addTab(file.path);
}
function FileEncodeToBase64URL() {
	var PATH = '/chrome/Local/html/FileEncodeToBase64URL.html';
	var handleRelativePath = function(path) {if (path) {path = path.replace(/\//g, '\\').toLocaleLowerCase();var ProfD = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get("ProfD", Ci.nsILocalFile).path;return ProfD + path;}};var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);file.initWithPath(handleRelativePath(PATH));gBrowser.selectedTab = gBrowser.addTab(file.path);
}
function Base64DecodeandEncode() {
	var PATH = '/chrome/Local/html/Base64DecodeandEncode.html';
	var handleRelativePath = function(path) {if (path) {path = path.replace(/\//g, '\\').toLocaleLowerCase();var ProfD = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get("ProfD", Ci.nsILocalFile).path;return ProfD + path;}};var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);file.initWithPath(handleRelativePath(PATH));gBrowser.selectedTab = gBrowser.addTab(file.path);
}
function URLDE() {
	var PATH = '/chrome/Local/html/URLDE.html';
	var handleRelativePath = function(path) {if (path) {path = path.replace(/\//g, '\\').toLocaleLowerCase();var ProfD = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get("ProfD", Ci.nsILocalFile).path;return ProfD + path;}};var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);file.initWithPath(handleRelativePath(PATH));gBrowser.selectedTab = gBrowser.addTab(file.path);
}




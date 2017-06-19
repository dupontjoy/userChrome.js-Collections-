// ==UserScript==
// @description  Tab Plus 标签页增强
// @include      chrome://browser/content/browser.xul

// 2015.01.23  新标签打开『查看图片』
// 2014.07.26  點擊頁面恢復原來的地址
// 2014.05.14  修改激活左侧标签
// ==/UserScript==

/*=====以下爲另外收集整合的腳本=====*/

//紧邻当前标签新建标签页
(function() {
    try {
        if(!gBrowser) return;
    }catch(e) {
        return;
    }
    
    gBrowser.tabContainer.addEventListener("TabOpen", tabOpenHandler, false);

    function tabOpenHandler(event) {
        var tab = event.target;
        gBrowser.moveTabTo(tab, gBrowser.mCurrentTab._tPos + 1);
    }

})();

// 关闭当前标签页回到左边标签
try {
eval("gBrowser._blurTab = " + gBrowser._blurTab.toString().replace('this.selectedTab = tab;', "this.selectedTab = aTab.previousSibling? aTab.previousSibling : tab;"));
}catch(e){};

//點擊頁面恢復原來的地址
gBrowser.addEventListener("DOMWindowCreated", function () {
window.content.document.addEventListener("click", function (e) {
document.getElementById("urlbar").handleRevert();
}, false);
}, false);

//当地址栏失去焦点后恢复原来的地址
if (location == "chrome://browser/content/browser.xul") {
var ub = document.getElementById("urlbar");
ub.addEventListener("blur", function () {
this.handleRevert();
}, false);
}
    
//新标签打开『查看图片』
location == "chrome://browser/content/browser.xul" && document.querySelector("#context-viewimage").setAttribute("oncommand", 'openUILinkIn(gContextMenu.imageURL,"tab")') & document.querySelector("#context-viewbgimage").setAttribute("oncommand", 'openUILinkIn(gContextMenu.bgImageURL,"tab")')

//自动关闭下载产生的空白标签
eval("gBrowser.mTabProgressListener = " + gBrowser.mTabProgressListener.toString().replace(/(?=var location)/, '\
if (aWebProgress.DOMWindow.document.documentURI == "about:blank"\
&& aRequest.QueryInterface(nsIChannel).URI.spec != "about:blank") {\
aWebProgress.DOMWindow.setTimeout(function() {\
!aWebProgress.isLoadingDocument && aWebProgress.DOMWindow.close();\
}, 100);\
}\
'));


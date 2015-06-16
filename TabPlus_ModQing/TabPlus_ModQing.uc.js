// ==UserScript==
// @description  Tab Plus 标签页增强
// @include      chrome://browser/content/browser.xul

// 2015.06.16 08:00 加入Copy Gif（直接複製圖像即可）
// 2015.04.21 14:00 加入滾輪切換，自動聚焦
// 2015.04.02 10:00 精簡
// 2015.03.19 16:00 open_in_new_tab更新到GOLF-AT 2.1.20150305版
// 2015.01.23 21:00 新标签打开『查看图片』
// 2014.07.26 點擊頁面恢復原來的地址
// 2014.05.14 修改激活左侧标签
// ==/UserScript==

//地址栏、搜索栏、书签菜单、书签工具栏、历史菜单、主页按钮

(function() {
    try {
        eval('isBlankPageURL = ' + isBlankPageURL.toString().replace(
            'return ', '$&aURL=="" || aURL=="about:privatebrowsing" '
            +'|| '));
    }catch(e){}

    /* 在当前标签页打开 Bookmarklet */
    try {
        eval('openLinkIn = ' + openLinkIn.toString().replace(
            'if (where == "save")', 'if (url.match(/^javascript:/))\n'+
            '    where = "current";\n  $&'));
    }catch(e){}

    /* open bookmark/history in new tab */
    try {
        eval("whereToOpenLink = " + whereToOpenLink.toString().replace(
            'return "window";',"$&\n\n  var Class = e.target?e.target."
            +"getAttribute('class') : null;\n  try {\n    if (Class=='"
            +"')\n      Class=e.target.parentNode.getAttribute('class'"
            +");\n  }catch(e) {}\n  if ((!isBlankPageURL(gBrowser.curr"
            +"entURI.spec) || gBrowser.webProgress.isLoadingDocument) "
            +"&& Class && (Class.indexOf('bookmark-item')>=0 || Class."
            +"indexOf('placesTree')>=0 || Class=='subviewbutton') && !"
            +"IsInSideBar(e.target))\n    return 'tab';"));
    }catch(e){}

    /* bookmark/history on sidebar/place-manager */
    try {
        eval("PlacesUIUtils.openNodeWithEvent = " + PlacesUIUtils.
            openNodeWithEvent.toString().replace("window.whereToOpenLink"
            , "whereToOpenLink"));
    }catch(e){}
    
    /* open url in new tab */
    try {
        try { // firefox 3.0.*
            eval("BrowserLoadURL = "+ BrowserLoadURL.toString().replace(
                /if \(aTriggeringEvent instanceof MouseEvent\) {/,
                "_LoadURL(aTriggeringEvent, aPostData); return; $&"));
        }
        catch(e) { // firefox 3.1+
            var urlbar = document.getElementById("urlbar");
            eval("urlbar.handleCommand="+ urlbar.handleCommand.toString(
                ).replace("aTriggeringEvent.altKey && ", "").replace(
                "altEnter && !isTabEmpty","!isMouseEvent && !isTabEmpty"
                ));
        }
    }catch(e){}

    /* open home in new tab */
    try {
        eval("BrowserGoHome = " + BrowserGoHome.toString().replace(
            /switch \(where\) {/, "where = (gBrowser.currentURI.spec!="
            +"'about:blank' || gBrowser.webProgress.isLoadingDocument"+
            ") ? 'tab' : 'current'; $&")); 
    }catch(e){}

    /* open search in new tab */
    try {
        var searchbar = document.getElementById("searchbar");
        eval("searchbar.handleSearchCommand="+searchbar.handleSearchCommand.
            toString().replace(/this.doSearch\(textValue,/,
            "if (!gBrowser.webProgress.isLoadingDocument&&\n\t\tisBlankPage"
            +"URL(gBrowser.currentURI.spec))\n\t\twhere='current';\n\telse"+
            "\n\t\twhere='tab';\n\t$&"));
    }catch(e){}

})();

function _LoadURL(aTriggeringEvent, aPostData)
{
    var where = (gBrowser.currentURI.spec!='about:blank' ||
        gBrowser.webProgress.isLoadingDocument) ? 'tab' :
        'current';
    if (gURLBar.value!='') openUILinkIn(gURLBar.value, where);
    return true;
}

function IsInSideBar(target)
{
    if (!target) return false;
    try {
        var node = target._placesNode;
    }catch(e) { node = null; }
    try {
        if (!node && (target.parentNode.id=='placeContent'
            || target.parentNode.id=='bookmarks-view'))
            node = target.parentNode.selectedNode;
        return node && PlacesUtils.nodeIsBookmark(node) &&
            PlacesUtils.annotations.itemHasAnnotation(node
            .itemId,PlacesUIUtils.LOAD_IN_SIDEBAR_ANNO);
    }catch(e) { return false; }
}

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

//标签页关闭后激活左侧标签页
(function() {
    try {
        if(!gBrowser) return;
    }catch(e) {
        return;
    }

    gBrowser.tabContainer.addEventListener("TabClose", tabCloseHandler, false);

    function tabCloseHandler(event) {
        var tab = event.target;
                // 如果是因下载而产生的空白页
                if (tab.linkedBrowser.contentDocument.URL == 'about:blank') return;
                if (tab._tPos <= gBrowser.mTabContainer.selectedIndex){
                        if (tab.previousSibling) {
                                gBrowser.mTabContainer.selectedIndex--;
                        }
                }
    }

})();

//點擊頁面恢復原來的地址
gBrowser.addEventListener("DOMWindowCreated", function () {
window.content.document.addEventListener("click", function (e) {
document.getElementById("urlbar").handleRevert();
}, false);
}, false);
    
//新标签打开『查看图片』
location == "chrome://browser/content/browser.xul" && document.querySelector("#context-viewimage").setAttribute("oncommand", 'openUILinkIn(gContextMenu.imageURL,"tab")') & document.querySelector("#context-viewbgimage").setAttribute("oncommand", 'openUILinkIn(gContextMenu.bgImageURL,"tab")')

//滚轮切换标签
    gBrowser.mTabContainer.addEventListener("DOMMouseScroll", function(event){
        this.advanceSelectedTab(event.detail > 0 ? +1 : -1, true);
    }, true);

/*
//鼠标停留标签自动聚焦
     (document.getElementById("tabbrowser-tabs") || gBrowser.mTabBox).addEventListener('mouseover',
    function self(e) {
        if ((self.target = e.target).localName === 'tab') {
            if (!self.timeoutID) {
                this.addEventListener('mouseout',
                function() {
                    clearTimeout(self.timeoutID);
                },
                false);
            }
            self.timeoutID = setTimeout(function() {
                gBrowser.selectedTab = self.target;
            },
            50);
        }
    },
    false); 
*/

//CopyGIF by kidzgy
(function () {
    // copy gif
    var copyimage = document.querySelector("#context-copyimage-contents");
    copyimage.addEventListener("command", function() {
        var selection = content.getSelection();
        var ranges = [];
        for (var i = 0; i < selection.rangeCount; i++)
            ranges.push(selection.getRangeAt(i));
 
        var range = document.createRange();
        range.selectNode(document.popupNode);
        selection.removeAllRanges();
        selection.addRange(range);
        goDoCommand("cmd_copy");
        selection.removeAllRanges();
         
        for (i in ranges)
            selection.addRange(ranges[i]);
    }, false);
})()
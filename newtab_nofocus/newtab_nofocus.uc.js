//不聚焦地址栏 by skofkyo
//http://bbs.kafan.cn/forum.php?mod=redirect&goto=findpost&ptid=1865786&pid=38002012
(function() {
    window.CustomNewTab = {
        init: function() {
            gBrowser.tabContainer.addEventListener('TabOpen', CustomNewTab.newTabfocus, false);
        },
        newTabfocus: function() {
            if (/^(about|http|file|chrome)/.test(gBrowser.selectedBrowser.currentURI.spec)) {
                setTimeout(function() {
                    gBrowser.selectedBrowser.focus();
                }, 0);
            }
        }
    }
    CustomNewTab.init();
})();
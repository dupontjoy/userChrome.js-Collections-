// ==UserScript==
// @name                 NewTabOverridemod.uc.js
// @description       修改Firefox 41以上版本 新增分頁開啟的URL
// @author               aborix/skofkyo
// @include              main
// @license               MIT License
// @compatibility    Firefox 41+
// @charset              UTF-8
// @version              0.2.2
// @note                   0.2.2 2016-7-17 修正新視窗 新分頁按鈕mouseover事件無效的問題
// @note                   2016-7-11 19:48 取消TabClose事件 新增工具選單
// @note                   透過about:config頁修改 需將鼠標移動到新分頁按鈕才能完成設定 透過工具選單進行設定立即生效
// @note                   2016-7-11 01:33 通過添加修改about:config browser.newtab.url的值 來更改新分頁開啟的鏈結
// @note                   當修改了browser.newtab.url的值後 需關閉一個分頁或將鼠標移動到新分頁按鈕設定值才會生效
// @note                   mod by skofkyo
// @homepageURL    https://github.com/skofkyo/userChromeJS/blob/master/SubScript/NewTabOverridemod.uc.js
// ==/UserScript==
(function() {

    window.BrowserNewtabUrl = {

        init: function() {
            this.updateURL();
            this.addmenuitem();
        },

        updateURL: function() {
            try {
                Services.prefs.getCharPref("browser.newtab.url");
            } catch (e) {
                //about:config?filter=browser.newtab.url
                Services.prefs.setCharPref("browser.newtab.url", "about:newtab");
            }
            const url = Services.prefs.getCharPref("browser.newtab.url");
            if (Number(gAppInfo.version.substring(0, 2)) < 44)
                NewTabURL.override(url)
            else
                aboutNewTabService.newTabURL = url;
        },

        ntoset: function() {
            var bnu = Services.prefs.getCharPref("browser.newtab.url");
            var text = prompt('輸入要更改的網址。', bnu);
            Services.prefs.setCharPref("browser.newtab.url", text);
            this.updateURL();
        },

        addmenuitem: function() {
            var ins = $("devToolsSeparator");
            ins.parentNode.insertBefore($C("menuitem", {
                id: "NewTabOverride_set",
                class: "menuitem-iconic",
                label: "NewTabOverride 設定",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAACd0lEQVQ4jd2TXUiTcRTGT3RhUgk2ogUqTOZbXVgXIg6h4fqQmF7khdBVdyFYVgihkRQ1hKDhPnx1pZRFSFayyolRhGUkZcpWfqTZdO7d++5l3xt+bNPW04UTtI+LsG564Fz8Oef5cc7h/In+FxUSUep6IalmDbPISDeq10Upyt2kAd6i/pTi+R+bpSmkrq/KadbX7n/qGagDYp8Q/2KE4byy99LZvLYj+WmaHz0pmZmZRxmGOSaTy8rlclk5wzBlSsWuLtfLMgBmYKkX4NuBSDeAAWDhIg7npelXQ3bqDFp7LB5FMOSD1y/CGxARCHrA+WZxVWv41mepAGZbAXcrMN8O+7BmPku6+fiaVgoUBRoAWFyKwRfwIhDywR/0IBj2IxoLo6fPhq57NQAsQGIQgAN9nVWRn/ZQWqpmAUAQOHD8DDjeAV5wguNnMMXZYekxY7T/CqzWDrDXm2GzPgPwChnSLUVrQMXFh64BCQgivwxyOeAWXRifHIHT7cDDzjbUayrxpNsC6/AYsrN3Xy4pUTTs3ZN1Zg0od19uDYAkyAGX4MQMN42Po0P4bB/Bm3ev0T84hIWvcwAAiURyYJV9A0ml29WFhYrTJ6sqXyxE58C7OThd0xDcHCanxmEbeY+xiQ9wClNwe51widOIzPlRUXHiseqgqlIikeQTEdGFutoJ/EYJxBFdigCIA0j8sqb6XPXyYapUyjv3H3SE2CZW1Dc2eAysztfI6gNsszGo02tDOqM2bGR1oSaTMWhqaQzcaDX5Wm6ZPLfv3hTNj8xhpVKpXZkvlYjSiWgrEW0joh1ElEFEMiLKSYY8+c5I5lfq0+kvfN5/o++IQ7gOwp/D5AAAAABJRU5ErkJggg==",
                oncommand: "BrowserNewtabUrl.ntoset();",
            }), ins);
        },
    };

    let tbtset = {
        startup: function() {
            var tbt = $("tabbrowser-tabs");
            var newTabBtn = document.getAnonymousElementByAttribute(tbt, "class", "tabs-newtab-button");
            newTabBtn.addEventListener('mouseover', BrowserNewtabUrl.updateURL, false);
        },
    };

    tbtset.startup();
    BrowserNewtabUrl.init();

    function $(id) {
        return document.getElementById(id);
    }

    function $C(name, attr) {
        var el = document.createElement(name);
        if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
        return el;
    }

}());
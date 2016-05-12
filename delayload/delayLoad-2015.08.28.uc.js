// ==UserScript==
// @name           delayLoad.uc
// @description    延时加载FX扩展
// @include        chrome://browser/content/browser.xul
// @updateURL      https://github.com/xinggsf/uc/raw/master/delayLoad.uc.js
// @compatibility  Firefox 34.0+
// @author         modify by xinggsf
// @version        2015.8.28
// @note           启用/禁用须重启FX的扩展不能延迟加载！！
// ==UserScript==
 
location == "chrome://browser/content/browser.xul" && (() => {        
    let {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} =Components;
    Cu.import("resource://gre/modules/AddonManager.jsm");
 
    function toggleDelay(disable) {
        let id,
        a = [//扩展ID在目录Profiles\extensions
            '{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}', //ABP
            'elemhidehelper@adblockplus.org',//EHH
            '{A065A84F-95B6-433A-A0C8-4C040B77CE8A}',//Pan
            '{DF8D5767-D2C3-48F9-B199-5EF1F7D672FB}',//EHH for Pan
            'redirector@einaregilsson.com',//Redirector
            'simpleproxy@jc3213.github',//Simpe Proxy
            
        ];
        for(id of a) AddonManager.getAddonByID(id, 
            addon => addon.userDisabled = disable);
    }
 
    //启用 延迟加载扩展
    this._timer && clearTimeout(this._timer);
    this._timer = setTimeout(() => toggleDelay(false), 1500);
 
    // firefox关闭时禁用 延迟加载扩展
    window.addEventListener("unload", () => toggleDelay(true), false);
})();
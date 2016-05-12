// ==UserScript==
// @name           delayLoad.uc
// @namespace      delayLoad.xinggsf
// @description    延时加载FX扩展
// @include        chrome://browser/content/browser.xul
// @updateURL      https://raw.githubusercontent.com/xinggsf/uc/master/delayLoad.uc.js
// @compatibility  Firefox 34+
// @author         modify by xinggsf
// @version        2016.5.11
// ==/UserScript==
 
Cu.import("resource://gre/modules/AddonManager.jsm");
let timer, addons = [
    '{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}', //ABP
    'elemhidehelper@adblockplus.org',//EHH
    '{A065A84F-95B6-433A-A0C8-4C040B77CE8A}',//Pan
    '{DF8D5767-D2C3-48F9-B199-5EF1F7D672FB}',//EHH for Pan
    'redirector@einaregilsson.com',//Redirector
    'simpleproxy@jc3213.github',//Simpe Proxy

    //'uBlock0@raymondhill.net',//uBlock Origin
    //'{fe272bd1-5f76-4ea4-8501-a05d35d823fc}',//ABE
    //'{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}',//ABP
    //'firebug@software.joehewitt.com',
    //'sowatchmk2@jc3213.github',//soWatch! mk2
];
 
function toggleDelay(disable) {
    for(let id of addons)
        AddonManager.getAddonByID(id, a => {
    //console.log(this, 'a.userDisabled :', a.userDisabled);
    a.userDisabled = disable;
        });
}
 
timer && clearTimeout(timer);
//启用 延迟加载扩展
timer = setTimeout(() => toggleDelay(!1), 1500);
 
window.addEventListener("unload", () => {
    if (!Application.windows.length) toggleDelay(true);
}, !1);
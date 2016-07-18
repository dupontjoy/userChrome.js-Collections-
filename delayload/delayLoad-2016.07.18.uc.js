// ==UserScript==
// @name           delayLoad.uc
// @namespace      delayLoad.xinggsf
// @description    延时加载Firefox扩展,支持e10s
// @include        chrome://browser/content/browser.xul
// @updateURL      https://raw.githubusercontent.com/xinggsf/uc/master/delayLoad.uc.js
// @compatibility  Firefox 34+
// @author         xinggsf
// @version        2016.7.18
// ==/UserScript==
 
-function() {
    Cu.import('resource://gre/modules/AddonManager.jsm');
    let tool = {
        addons: [//about:support 可看到所有扩展ID
    'redirector@einaregilsson.com',//Redirector
    'uBlock0@raymondhill.net',
    'VimFx@akhodakivskiy.github.com',
    
    //'{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}', //ABP
    //'elemhidehelper@adblockplus.org',//EHH
    //'{A065A84F-95B6-433A-A0C8-4C040B77CE8A}',//Pan
    //'{DF8D5767-D2C3-48F9-B199-5EF1F7D672FB}',//EHH for Pan
        ],
        toggleDelay: function(disable) {
            for(let id of this.addons)
                AddonManager.getAddonByID(id, a => a.userDisabled = disable);
        },
        //sessionstore-windows-restored final-ui-startup content-document-global-created
        observe: function(aSubject, aTopic, aData) {
            if ('quit-application' === aTopic) this.shutdown();
        },
        startup: function() {
            //延迟加载扩展
            setTimeout(() => this.toggleDelay(!1), 900);
            Services.obs.addObserver(this, 'quit-application', false);
        },
        shutdown: function() {
            this.toggleDelay(!0);
            Services.obs.removeObserver(this, 'quit-application');
        }
    }
 
    tool.startup();
}();
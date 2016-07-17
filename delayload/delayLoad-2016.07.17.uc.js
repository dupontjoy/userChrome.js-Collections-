// ==UserScript==
// @name           delayLoad.uc
// @namespace      delayLoad.xinggsf
// @description    延时加载Firefox扩展,支持e10s
// @include        chrome://browser/content/browser.xul
// @updateURL      https://raw.githubusercontent.com/xinggsf/uc/master/delayLoad.uc.js
// @compatibility  Firefox 34+
// @author         xinggsf
// @version        2016.7.16
// ==/UserScript==
 
-function() {
    Cu.import('resource://gre/modules/AddonManager.jsm');
    let {Services} = Cu.import('resource://gre/modules/Services.jsm', null);
    let tool = {
        addons: [//about:support 可看到所有扩展ID
            '{A065A84F-95B6-433A-A0C8-4C040B77CE8A}',//pan
            //'uBlock0@raymondhill.net',//uBlock Origin
            //'{fe272bd1-5f76-4ea4-8501-a05d35d823fc}',//ABE
            //'{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}',//ABP
            //'firebug@software.joehewitt.com',
            //'sowatchmk2@jc3213.github',//soWatch! mk2
        ],
        toggleDelay: function(disable) {
            for(let id of this.addons)
                AddonManager.getAddonByID(id, a => a.userDisabled = disable);
        },
        observe: function(aSubject, aTopic, aData) {
            switch (aTopic) {
                case 'quit-application':
                    this.shutdown();
                    break;
                case 'sessionstore-windows-restored'://'final-ui-startup','content-document-global-created'
                    this.toggleDelay(!1);
                    break;
            }
        },
        startup: function() {
            Services.obs.addObserver(this, 'sessionstore-windows-restored', false);
            Services.obs.addObserver(this, 'quit-application', false);
            //禁止Firefox Hello扩展
            AddonManager.getAddonByID('loop@mozilla.org', a => a.userDisabled = true);
        },
        shutdown: function() {
            this.toggleDelay(!0);
            Services.obs.removeObserver(this, 'sessionstore-windows-restored');
            Services.obs.removeObserver(this, 'quit-application');
        }
    }
 
    tool.startup();
}();
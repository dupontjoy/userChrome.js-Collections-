// ==UserScript==
// @name        禁止打印弹窗 for USL
// @namespace   禁止打印弹窗 for UserScriptLoader
// @include     http://www.economist.com/*
// @version     0.0.1
// @grant       none
// @run-at      document-start
// ==/UserScript==

Object.defineProperty(unsafeWindow, 'print', {
    get: function() {
        return function() {}
    },
    set: function() {}
});
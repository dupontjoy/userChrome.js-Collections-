// ==UserScript==
// @name           SingletonFox
// @namespace      http://www.quchao.com/entry/singletonfox
// @description    Use only one instance of Firefox to handle all the URL requests.
// @include        main
// @compatibility  Firefox 2.0 3.0.*
// @author         Qu Chao (Chappell.Wat) <Chappell.Wat@Gmail.com>
// @version        1.2
// @Note
// ==/UserScript==
// Released under the GPL license
//  http://www.gnu.org/copyleft/gpl.html
// Appreciate to
//  mergeWindow2.uc.js from 2ch
// ver 1.0 @ 2008-7-18
//  itialize release
// ver 1.1 @ 2008-7-24
//  Disable new-window functions and overwrite the related prefs.
// ver 1.2 @ 2008-7-26
//  Prevent Firefox from opening a new window by clicking a link when pressing SHIFT.

(function() {
  var CW = function() {
    var rf = function() {
      var f3 = typeof PlacesController === 'function';
      window.OpenBrowserWindow = window.BrowserOpenTab;
      eval('window.handleLinkClick=' + window.handleLinkClick.toString().replace('openNewWindowWith(href, doc' + (f3 ? '': 'URL') + ', null, false);', 'openNewTabWith(href, doc' + (f3 ? '': 'URL') + ', null, event, false);'));
      eval('nsContextMenu.prototype.openLink=' + nsContextMenu.prototype.openLinkInTab);
      eval('nsBrowserAccess.prototype.openURI=' + nsBrowserAccess.prototype.openURI.toString().replace('switch (aWhere) {', 'aWhere= Ci.nsIBrowserDOMWindow.OPEN_NEWTAB;\n$&'));
      if (f3) eval('PlacesController.prototype.doCommand=' + PlacesController.prototype.doCommand.toString().replace('"window"', '"tab"'));
      else eval('BookmarksController.doCommand=' + BookmarksController.doCommand.toString().replace('"window"', '"tab"'))
    },
    op = function() {
      var $ = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefBranch);
      $.setIntPref('browser.link.open_newwindow', 3);
      $.setIntPref('browser.link.open_newwindow.restriction', 0);
      $.setIntPref('browser.link.open_external', 3)
    },
    gm = function($) {
      return (gm = function() {
        return $
      })()
    },
    ib = function($) {
      return $.mTabs.length === 1 && $.currentURI.spec === 'about:blank' && $.selectedBrowser.sessionHistory.count < 2 && !$.selectedTab.hasAttribute('busy') && !$.selectedBrowser.contentDocument.body.hasChildNodes()
    },
    il = function($) {
      return $.currentURI.spec !== 'about:blank' || $.selectedTab.getAttribute('busy') === '' || $.selectedBrowser.contentDocument.body.hasChildNodes()
    };
    return {
      nt: function() {
        var _ = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator).getEnumerator('navigator:browser');
        if (_.hasMoreElements()) while (_.hasMoreElements()) {
          var B = _.getNext(),
          A = gm(B);
          if (B !== A) {
            var $ = B.getBrowser();
            if (!ib($))(function() {
              if (!il($)) setTimeout(arguments.callee, 0);
              else {
                var _ = Cc['@mozilla.org/browser/sessionstore;1'].getService(Ci.nsISessionStore);
                _.setWindowState(A, _.getWindowState(B), false);
                A.focus();
                B.BrowserTryToCloseWindow()
              }
            })();
            else B.BrowserTryToCloseWindow()
          } else {
            rf();
            op()
          }
        }
        return false
      }
    }
  } ();
  CW.nt()
})();
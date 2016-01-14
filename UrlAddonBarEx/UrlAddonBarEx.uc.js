// ==UserScript==
// @name                url-addon-bar
// @namespace       urlAddonBar@zbinlin
// @description        将附加组件栏移到地址栏
// @include              chrome://browser/content/browser.xul
// @author              zbinlin
// @homepage        http://bitcp.com
// @version              0.1.4
// ==/UserScript==

(function(CSS){
 if (typeof LinkTargetDisplay == "undefined") return;
  // Show/Hide delay. original: 70/150(ms)
  LinkTargetDisplay.DELAY_SHOW = 0;
  LinkTargetDisplay.DELAY_HIDE = 500;

  // Cut "http://"
  XULBrowserWindow._overLink = "";
  XULBrowserWindow.__defineGetter__("overLink", function() {
    return this._overLink;
  });
  XULBrowserWindow.__defineSetter__("overLink", function(text) {
    if (text && text.indexOf('http://') === 0) {
      text = text.substr(7);
    }
    return this._overLink = text;
  });

  // Hide Animation
  if (!XULBrowserWindow.updateStatusField_org) {
    XULBrowserWindow.updateStatusField_org = XULBrowserWindow.updateStatusField;
  }
  eval("XULBrowserWindow.updateStatusField = " + XULBrowserWindow.updateStatusField_org.toString().replace(
    'field.setAttribute("crop", type == "overLink" ? "center" : "end");',
    'if (text) field.setAttribute("crop", type == "overLink" ? "center" : "end");'
  ));

  XULBrowserWindow.statusTextField.__defineGetter__('label', function() {
    return this.getAttribute("label");
  });
  XULBrowserWindow.statusTextField.__defineSetter__('label', function(str) {
    if (str) {
      this.setAttribute('label', str);
      this.style.opacity = 1;
    } else {
      this.style.opacity = 0;
      
      // 消えたら左側に帰ってきて欲しい
      setTimeout(function(){ XULBrowserWindow.statusTextField.removeAttribute('mirror'); }, 110);
    }
    return str;
  });

window.urlAddonBar = {
    init: function () {
        if (this._loaded) return;
        this._loaded = true;
        this.xulstyle = addStyle(CSS);
        let (addonBar = document.getElementById("ctraddon_addon-bar")) {
            if (!addonBar) return;
            if (addonBar.getAttribute("customizing") === "true") {
                window.addEventListener("aftercustomization", this, false);
            } else {
                this.toggle() && window.addEventListener("beforecustomization", this, true);
            }
        }
    },
    handleEvent: function (e) {
        switch (e.type) {
            case "beforecustomization" :
                window.addEventListener("aftercustomization", this, false);
                break;
            case "aftercustomization" :
                window.removeEventListener("aftercustomization", this, false);
                break;
        }
        this.toggle();
    },
    contains: function (otherNode) {
        if (!this instanceof Node || !otherNode instanceof Node) return false;
        return (this === otherNode) || !!(this.compareDocumentPosition(otherNode) & this.DOCUMENT_POSITION_CONTAINED_BY);
    },
    toggle: function () {
        let addonBar = document.getElementById("ctraddon_addon-bar");
        if (!addonBar) return false;
        if (this._isInUrlbar) {
            let browserBottombox = document.getElementById("browser-bottombox");
            if (this.contains.bind(browserBottombox)(addonBar)) return false;
            if (!browserBottombox) return false;
            browserBottombox.appendChild(addonBar);
            addonBar.setAttribute("toolboxid", "navigator-toolbox");
            addonBar.setAttribute("context", "toolbar-context-menu");
            this._isInUrlbar = false;
        } else {
            let urlbarIcons = document.getElementById("urlbar-icons");
            if (!urlbarIcons) return false;
            if (this.contains.bind(urlbarIcons)(addonBar)) return false;
            urlbarIcons.insertBefore(addonBar, urlbarIcons.firstChild);
            addonBar.removeAttribute("toolboxid");
            addonBar.removeAttribute("context");
            this._isInUrlbar = true;
        }
        return true;
    },
    uninit: function () {
        this._isInUrlbar = true;
        this.toggle();
        window.removeEventListener("beforecustomization", this, true);
        window.removeEventListener("aftercustomization", this, false);
    }
};
window.urlAddonBar.init();

window.addEventListener("unload", function (e) {
      win.removeEventListener("unload", arguments.callee, false);
	urlAddonBar.uninit()
      delete window.urlAddonBar;
}, false);
function addStyle(css) {
	var pi = document.createProcessingInstruction(
		'xml-stylesheet',
		'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
	);
	return document.insertBefore(pi, document.documentElement);
}

})('\
@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\
\
@-moz-document url("chrome://browser/content/browser.xul") {\
\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1 > .toolbarbutton-menubutton-dropmarker {\
    border-style: none !important;\
    box-shadow: none !important;\
    padding: 0 0 0 1px !important;\
}\
\
#urlbar-icons > * {\
    padding: 0 3px !important;\
}\
\
#urlbar-icons > #ctraddon_addon-bar,\
#urlbar-icons > #ctraddon_addon-bar > #status-bar {\
    -moz-appearance: none !important;\
    height: 18px !important;\
    min-height: 18px !important;\
    border-style: none !important;\
    background: transparent !important;\
    -moz-box-align: center !important;\
    padding: 0 !important;\
    margin: 0 !important;\
    box-shadow: none !important;\
}\
\
#urlbar-icons > #ctraddon_addon-bar > toolbaritem {\
    -moz-box-align: center !important;\
    -moz-box-pack: center !important;\
}\
\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1,\
#urlbar-icons > #ctraddon_addon-bar statusbarpanel,\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1 > .toolbarbutton-menubutton-button {\
    -moz-appearance: none !important;\
    border-style: none !important;\
    border-radius: 0 !important;\
    padding: 0 3px !important;\
    margin: 0 !important;\
    background: transparent !important;\
    box-shadow: none !important;\
    -moz-box-align: center !important;\
    -moz-box-pack: center !important;\
}\
\
#urlbar-icons > #ctraddon_addon-bar > .toolbarbutton-1,\
#urlbar-icons > #ctraddon_addon-bar > #status-bar > statusbarpanel {\
    min-width: 18px !important;\
    min-height: 18px !important;\
}\
\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1 > .toolbarbutton-icon,\
#urlbar-icons > #ctraddon_addon-bar > #status-bar > statusbarpanel > .statusbarpanel-icon {\
    max-width: 18px !important;\
    /* max-height: 18px !important; */\
    padding: 0 !important;\
    margin: 0 !important;\
}\
\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1 > .toolbarbutton-menubutton-button,\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1 > .toolbarbutton-menubutton-button > .toolbarbutton-icon {\
    padding: 0 !important;\
    margin: 0 !important;\
}\
\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1:not([disabled="true"]):hover,\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1:not([disabled="true"])[type="menu-button"]:hover,\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1:not([disabled="true"])[open="true"],\
#urlbar-icons > #ctraddon_addon-bar .toolbarbutton-1:not([disabled="true"])[type="menu-button"][open="true"],\
#urlbar-icons > #ctraddon_addon-bar > #status-bar statusbarpanel:not([disabled="true"]):hover,\
#urlbar-icons > #ctraddon_addon-bar > #status-bar statusbarpanel:not([disabled="true"])[open="true"] {\
    background-image: -moz-linear-gradient(rgba(242, 245, 249, 0.95), rgba(220, 223, 225, 0.67) 49%, rgba(198, 204, 208, 0.65) 51%, rgba(194, 197, 201, 0.3)) !important;\
}\
\
#urlbar-icons > #ctraddon_addon-bar #addonbar-closebutton,\
#urlbar-icons > #ctraddon_addon-bar toolbarspring,\
#urlbar-icons > #ctraddon_addon-bar toolbarspacer,\
#urlbar-icons > #ctraddon_addon-bar toolbarseparator,\
#urlbar-icons > #ctraddon_addon-bar > #status-bar > .statusbar-resizerpanel {\
    display: none !important;\
}\
\
}\
');

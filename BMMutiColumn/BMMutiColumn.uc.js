// ==UserScript==
// @name           BMMutiColumn.uc.js
// @description    书签菜单自动分列显示
// @author         ding
// @include        main
// @version        2015.12.24
// @startup        window.BMMutiColumn.init();
// @shutdown       window.BMMutiColumn.destroy();
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function (css) {
  if (window.BMMutiColumn) {
    window.BMMutiColumn.destroy();
    delete window.BMMutiColumn;
  }
  var BMMutiColumn = {
    inIDOMUtils: null,
    cachedMenus: [],
    init: function () {
      this.inIDOMUtils = Components.classes['@mozilla.org/inspector/dom-utils;1'].getService(Components.interfaces.inIDOMUtils);
      $('PlacesToolbarItems').addEventListener('popupshown', this, false);
      $('BMB_bookmarksPopup').addEventListener('popupshown', this, false);
      $('BMB_bookmarksPopup').addEventListener('click', this, false);
      this.style = addStyle(css);
    },
    destroy: function () {
      $('PlacesToolbarItems').removeEventListener('popupshown', this, false);
      $('BMB_bookmarksPopup').removeEventListener('popupshown', this, false);
      $('BMB_bookmarksPopup').removeEventListener('click', this, false);
      if (this.style && this.style.parentNode) this.style.parentNode.removeChild(this.style);
      var i = 0;
      for (i = 0; i < this.cachedMenus.length; i++) {
        var menu = this.cachedMenus[i];
        if (menu && menu._x_inited) {
          menu._x_scrollbox.width = '';
          delete menu._x_scrollbox;
          delete menu._x_inited;
          delete menu._x_box;
        }
      }
      this.cachedMenus = [];
    },
    handleEvent: function (event) {
    	var menupopup;
      if (event.target.tagName == 'menu') {
         menupopup = event.target.menupopup;
      }else if (event.target.tagName == 'menupopup'){
      	menupopup = event.target;
      }else return;
      if(!menupopup)return;
      
      if (!menupopup._x_inited) {
        var scrollbox = menupopup._scrollBox._scrollbox;
        var boxs = this.inIDOMUtils.getChildrenForNode(scrollbox, true);
        if (boxs && boxs.length > 0) {
          menupopup._x_box = boxs[0];
          menupopup._x_scrollbox = scrollbox;
          menupopup._x_inited = true;
          this.cachedMenus.push(menupopup);
        }
      }
      
      if (menupopup._x_inited) {
        menupopup._x_scrollbox.width = menupopup._x_box.scrollWidth;
        //弹出菜单点击bug，要计算两次
        if (event.type=="click") {
        	menupopup._x_scrollbox.width = menupopup._x_box.scrollWidth;
        }
      }
    }
  }
  BMMutiColumn.init();
  window.BMMutiColumn = BMMutiColumn;
  function $(id) {
    return document.getElementById(id);
  }
  function addStyle(css) {
    var pi = document.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"');
    return document.insertBefore(pi, document.documentElement);
  }
})('\
.bookmark-item[container] >menupopup>hbox .scrollbox-innerbox{\
        min-height: 22px !important;\
        height:auto!important;\
        display: flex !important;\
        flex-flow:column wrap !important;\
        overflow: -moz-hidden-unscrollable!important;\
}\
.bookmark-item[container] >menupopup>hbox{\
         max-height:-moz-calc(100vh - 129px)!important;\
         height: auto !important;\
}\
.bookmark-item[container] >menupopup>:-moz-any(menuitem, menu, menuseparator) {\
          max-width: 250px !important;\
          min-width: 100px !important;\
}\
');

// ==UserScript==
// @name           BMMutiColumn.uc.js
// @description    书签菜单自动分列显示
// @author         ding
// @include        main
// @version        2015.12.24.3
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
      $('PlacesToolbarItems').addEventListener('popupshowing', this, false);
      $('BMB_bookmarksPopup').addEventListener('popupshowing', this, false);
      $('BMB_bookmarksPopup').addEventListener('click', this, false);
      this.style = addStyle(css);
    },
    destroy: function () {
      $('PlacesToolbarItems').removeEventListener('popupshowing', this, false);
      $('BMB_bookmarksPopup').removeEventListener('popupshowing', this, false);
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
      //没有初始化或换过位置，重新设置属性
      if (!menupopup._x_inited || !menupopup._x_scrollbox.scrollWidth ) {
        var scrollbox = menupopup._scrollBox._scrollbox;
        var boxs = this.inIDOMUtils.getChildrenForNode(scrollbox, true);
        if (boxs && boxs.length > 0) {
          menupopup._x_box = boxs[0];
          menupopup._x_scrollbox = scrollbox;          
          if(!menupopup._x_inited){
	          menupopup._x_inited = true;
	          this.cachedMenus.push(menupopup);
	        }
        }
      }
      if (menupopup._x_inited) {
        if(!(menupopup._x_scrollbox.width==menupopup._x_box.scrollWidth))menupopup._x_scrollbox.width = menupopup._x_box.scrollWidth;
        //弹出菜单点击bug，要计算两次
        if (event.type=="click") {
        	if(!(menupopup._x_scrollbox.width==menupopup._x_box.scrollWidth))menupopup._x_scrollbox.width = menupopup._x_box.scrollWidth;
        }
        //如果菜单数量或者文字宽度发生变化，可能会多出空区域，重新计算下
        	var lastmenu = menupopup.lastChild;
	        while(lastmenu){
	        	if(lastmenu.scrollWidth>=90)break;
	        	lastmenu = lastmenu.previousSibling;
	        }
	        if(lastmenu && lastmenu.scrollWidth>=90){
	        	var pos1 = lastmenu.boxObject.x-0+lastmenu.boxObject.width;
	        	var pos2 = menupopup._x_box.boxObject.x-0+menupopup._x_box.boxObject.width;
	        	if(pos2-pos1>30){	
	        		menupopup._x_scrollbox.width = "";
	        		menupopup._x_scrollbox.width = menupopup._x_box.scrollWidth;
	        	}
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
  function log(msg){
  	var alertClass = Components.classes['@mozilla.org/alerts-service;1'];
    var alertService = alertClass.getService(Components.interfaces.nsIAlertsService);
    alertService.showAlertNotification('chrome://MASclearcache/skin/clearcache.png', msg, ' ', false, '', null, '');
  }
})('\
#BMB_bookmarksPopup .scrollbox-innerbox,\
.bookmark-item[container] >menupopup>hbox .scrollbox-innerbox{\
        min-height: 22px !important;\
        height:auto !important;\
        display: flex !important;\
        flex-flow:column wrap !important;\
        overflow: -moz-hidden-unscrollable !important;\
        align-content: flex-start !important;\
}\
#BMB_bookmarksPopup,\
.bookmark-item[container] >menupopup>hbox{\
         max-height:-moz-calc(100vh - 129px)!important;\
         height: auto !important;\
}\
#BMB_bookmarksPopup>:-moz-any(menuitem, menu, menuseparator),\
.bookmark-item[container] >menupopup>:-moz-any(menuitem, menu, menuseparator) {\
          max-width: 250px !important;\
          min-width: 100px !important;\
}\
#BMB_bookmarksPopup{\
	max-width:-moz-calc(100vw - 20px)!important;\
}\
');

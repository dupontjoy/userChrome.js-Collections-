// ==UserScript==
// @name           AutoHidebookmark.uc.js
// @namespace http://bbs.kafan.cn/forum.php?mod=redirect&goto=findpost&ptid=1817667&pid=34415770
// @author         Kelo
// ==/UserScript==
location == 'chrome://browser/content/browser.xul' && (function() {
	var HideTimer = null,PopTimer = null,popels = null,els = null;
	setTimeout(function() {
		function mouseover() {
			els = this;
			if (popels && els != popels) HidePopup();
			if (HideTimer) {
				window.clearTimeout(HideTimer);
				HideTimer = null;
			}
			if (!PopTimer)
				PopTimer = window.setTimeout(function() {
					AutoPopup();
				}, 100);
		}

		function mouseout() {
			els = this;
			if (PopTimer) {
				window.clearTimeout(PopTimer);
				PopTimer = null;
			}
			if (!HideTimer)
				HideTimer = window.setTimeout(function() {
					HidePopup();
				}, 100);
		}

		function AutoPopup() {
			PopTimer = null;
			els.open = true;
			popels = els;
		}

		function HidePopup() {
			HideTimer = null;
			if (popels) popels.open = false;
			popels = null;
		}

		function addEvent() {
			var els = document.querySelectorAll('#PlacesToolbarItems > toolbarbutton.bookmark-item[type="menu"]');
			for (var i = 0; i < els.length; i++) {
				els[i].addEventListener('mouseover', mouseover, false);
				els[i].addEventListener('mouseout', mouseout, false);
				/*els[i].onmouseover = mouseover;
				els[i].onmouseout = mouseout;*/
			}
		}
                         
		addEvent();
                         	document.getElementById("PersonalToolbar").addEventListener('DOMAttrModified', addEvent, false); //Dom 结构变化

		//定时器定时查看变化
		/*setInterval(function checkEvent(){
                                     var checkels = document.querySelectorAll('#PlacesToolbarItems > toolbarbutton.bookmark-item[type="menu"]');
                                      if(!checkels[0].onmouseover) addEvent();
		},2000);*/

	}, 0);
})();
// ==UserScript==
// @name           MemoryMonitorMod.uc.js
// @description    简单的FF内存监视器
// @include        main
// @charset        UTF-8

// @note           2015.05.28 19:00 小調內存颜色值
// @note           2015.05.25 21:00 Mod by zhulinxizi，美化边框
// @note           2014.11.04 23:30 设置其位置在地址栏前/後（可选）
// @note           2014.02.10 删除自动重启功能，修复分级颜色显示：正常显示为黑色，超过预警值的0.6倍为蓝色，超出预警值显示为红色
// @note           2014.02.08 基于原MemoryMonitorMod.uc.js修改，兼容FF28+

// ==/UserScript==
var ucjsMM = {
	_interval : 10000,
	//内存刷新周期, 单位 ms
	_Warningvalue : 900,  //内存预警值, 单位 MB
	_Warningcolor : 'red',//red 或 #f46060
	_Stdvalue2 : 700,  //颜色2
	_Stdcolor2 : 'orange',//orange 或 #ed6c44
	_Stdvalue1 : 500,  //颜色1
	_Stdcolor1 : 'green',//blue 或 #69cc56
	_MemoryValue : 0,  //内存初始值
	_Memorycolor : 'grey',//grey 或 #3e3e3e
	_prefix : 'MB',    //内存单位

	interval : null,
	init : function () {
		var toolbar = document.getElementById('urlbar-icons');//放地址栏后面
		/*var toolbar = document.getElementById('identity-box').parentNode;//放地址栏前面*/
		var memoryPanel = document.createElement('statusbarpanel');
		memoryPanel.id = 'MemoryDisplay';
		memoryPanel.setAttribute('label', ucjsMM._MemoryValue + ucjsMM._prefix);
		memoryPanel.setAttribute('tooltiptext', '内存监视器，点击打开about:memory');
		toolbar.insertBefore(memoryPanel, toolbar.childNodes[2]);
		document.insertBefore(document.createProcessingInstruction('xml-stylesheet', 'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent('\
			#MemoryDisplay{\
				-moz-appearance: none;\
			    padding: 0;\
				border: none;\
				font-size:11px;\
			}\
			#MemoryDisplay .statusbarpanel-text{\
				margin:0;\
				padding-left: 2px;\
				padding-right: 2px;\
				height: 16px;\
				border: 1px solid;\
			}\
		') + '"'), document.documentElement);
		this.start();
		this.interval = setInterval(this.start, this._interval);
	},
	start : function () {
		try {
			const Cc = Components.classes;
			const Ci = Components.interfaces;
			var MemReporters = Cc['@mozilla.org/memory-reporter-manager;1'].getService(Ci.nsIMemoryReporterManager);
			var workingSet = MemReporters.resident;
			ucjsMM._MemoryValue = Math.round(workingSet / (1024 * 1024));
			var memoryPanel = document.getElementById('MemoryDisplay');
			memoryPanel.setAttribute('label', ucjsMM._MemoryValue + ucjsMM._prefix);
			memoryPanel.setAttribute('onclick', "openUILinkIn('about:addons-memory','tab')");
			if (ucjsMM._MemoryValue > ucjsMM._Warningvalue) {
				memoryPanel.style.color = ucjsMM._Warningcolor;
				memoryPanel.style.borderColor = ucjsMM._Warningcolor;
			} else {
				if (ucjsMM._MemoryValue > ucjsMM._Stdvalue3){
					memoryPanel.style.color = ucjsMM._Stdcolor3;
					memoryPanel.style.borderColor = ucjsMM._Stdcolor3;
				}
				else {
					if (ucjsMM._MemoryValue > ucjsMM._Stdvalue2){
						memoryPanel.style.color = ucjsMM._Stdcolor2;
						memoryPanel.style.borderColor = ucjsMM._Stdcolor2;
					}
					else {
						if (ucjsMM._MemoryValue > ucjsMM._Stdvalue1){
							memoryPanel.style.color = ucjsMM._Stdcolor1;
							memoryPanel.style.borderColor = ucjsMM._Stdcolor1;
						}
						else{
							memoryPanel.style.color = ucjsMM._Memorycolor;
							memoryPanel.style.borderColor = ucjsMM._Memorycolor;
						}
					}
				}
			}
		} catch (ex) {
			clearInterval(ucjsMM.interval);
		}
	},
	addFigure : function (str) {
		var num = new String(str).replace(/,/g, '');
		while (num != (num = num.replace(/^(-?\d+)(\d{3})/, '$1,$2')));
		return num;
	}
}
ucjsMM.init();

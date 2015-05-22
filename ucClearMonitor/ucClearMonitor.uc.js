// ==UserScript==
// @name           ucClearMonitor.uc.js
// @description    清理缓存、历史记录、LOS's, 内存使用预警
// @author         dannylee
// @namespace      lidanny2012/ucClearMonitor@gmail.com
// @include        main
// @license        MIT License
// @compatibility  Firefox 10-26
// @charset        UTF-8
// @version        0.0.8.4
// 2014.11.04      afom.exe改到Local文件夾下(上次改漏了一個地方)
// @note           2014/4/27 FF29下可以隐藏按钮并将控制面板合并至打开菜单按钮（三横杠）, 右键打开面板，中键清理当前站点
// @note           2014/4/27 改变配文目录/UCProfileDir/afom/afom.exe目录便于整体备份.
// @note           2014/4/11 Fixed bugs for FF29 new customUI.
// @note           强化中键清理当前站点，增加了附加选项，类似Forget's site, 调整了部分UI功能
// @note           取代cachestatus/clickclean/clearconsole/memoryfox附加组件
// @note           默认图标放置在Tabbar, 在72-75行修改
// @note           鼠标中键一键清理当前站点cookies和访问记录，右键一键火狐清理历史
// @note           report bug and linkurl: https://g.mozest.com/thread-43513-1-1
// @note           about:config 修改userChromeJS.UCCM.interval 定义刷新内存用量周期最小为30000(30秒)
// @note           about:config 修改userChromeJS.UCCM.MaxMemory 定义内存用量预警值最小为700(700M)
// @note           内存预警后，会自动清理内存 afom.exe文件在https://g.mozest.com/thread-43513-1-1下载
// @note           afom.exe文件放在: 配文目录/UCProfileDir/afom(手动建立)/ 目录下，否则选项变灰
// @updateURL     https://j.mozest.com/ucscript/script/111.meta.js
// @screenshot    http://j.mozest.com/images/uploads/previews/000/00/01/27c1e4d6-9b0e-c6df-f342-9c0befb870dc.jpg http://j.mozest.com/images/uploads/previews/000/00/01/thumb-27c1e4d6-9b0e-c6df-f342-9c0befb870dc.jpg
// ==/UserScript==

(function (css) {
	if (window.UCCM) {
	  window.UCCM.uninit();
	  delete window.UCCM;
  }
  const CI = Components.interfaces;
  const CC = Components.classes;
  const CU = Components.utils;
  CU.import("resource://gre/modules/Services.jsm");
  
  window.UCCM = {
  	_ps:  CC["@mozilla.org/preferences-service;1"].getService(CI.nsIPrefService).getBranch("userChromeJS.UCCM.").QueryInterface(CI.nsIPrefBranch2),
  	MemReporters: CC["@mozilla.org/memory-reporter-manager;1"].getService(CI.nsIMemoryReporterManager),
  	cachesrv: CC["@mozilla.org/network/cache-service;1"].getService(CI.nsICacheService),
  	imagecachesrv: CC["@mozilla.org/image/tools;1"].getService(CI.imgITools).getImgCacheForDocument(null),
  	clearHistorysrv: CC["@mozilla.org/browser/nav-history-service;1"].getService(CI.nsIBrowserHistory),
  	clearCookiesrv: CC["@mozilla.org/cookiemanager;1"].getService(CI.nsICookieManager),
  	clearHttpLoginsrv: CC["@mozilla.org/network/http-auth-manager;1"].getService(CI.nsIHttpAuthManager),
  	alertSvr: CC["@mozilla.org/alerts-service;1"].getService(CI.nsIAlertsService),
  	observerService: CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService),
  	
  	_isready: false,
  	CMBTN: null,
  	
  	//pref value
  	_CMcache: true,
  	_CMoffline: false,
  	_CMimage: false,
  	_CMtrim: false,
  	_CMhistory: true,
  	_CMcookies: true,
  	_CMhttpLogins: true,
  	_CMlocal: false,
  	_CMlsos: false,
  	_CMclosetab: false,
  	_CMclosedoit: false,
  	_CMcleardomain: false,
  	_CMhistcache: false,
  	_CMtrimtab: false,
  	_CMsitePlugin: false,
    _CMsitePasswords: false,
    _CMsitePermissions: false,
    _CMsiteOffline: false,
    _CMsitePreferences: false,
    _CMhideButton: false,//FF29 only
    
  	_prefix: "M",
  	_interval: 60000,  //内存刷新周期
  	_MaxMemory: 1500,  //内存预警上限（M）
  	_MemoryAlert: false,  //启用内存预警最小化窗口
  	_MemoryValue: 0,
  	_useafom: false,
  	dotimer: null,
  	afomrunning: false,
  	PanelUIclick: null, //FF29 only
  	
  	init: function(){
  		this._isready = false;
  		var overlay = '\
  		<overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
          <toolbarpalette id="TabsToolbar">\
            <toolbarbutton id="UCCM-icon" label="UCCM" insertbefore="tabbrowser-tabs" \
                             class="toolbarbutton-1 chromeclass-toolbar-additional" type="menu" removable="true"\
                             image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACIElEQVQ4jbWRTUjTcRjHv9vfLXUuqRDF5ZR0kU4XiRRqXapTUCNCwiiwS5AdOnRJerGCyigoeqVkKJVRuxQu9+KcM7dWGRkKFi1cbJi27DAbe2mbfbusQWyhHXrgc/t9Pg/8HuB/ziByd9iRaxoSyTgIWcCO7PP/GjDNXjrGxI1TjBxvpV2SRz0gXZRsBZTDhUX8ca+Dcy1afj/UTKtIGliUbADqLYJ092htFYNt++nftZmftm6gWVjSv6DcJwj7nIoCupSFdDdq+GV7I6e31HG0YiV7xeKTCwaMMtEb33oVfbXl9NSUphhRLGNftsCnEhz8q/z1LtrcR+S0ayS0yLP4oiCH48V5dJfI6S5ZyrEiGR/nYDyjrG+C8O2BmAnvRf6cvsKg6ygnL2zjS+0qmkqzaZSJOCQX8dVOPMsY8HXj3JxtE+dn7jD2vIExx1rGR+oZn9Ay8aGFQecBfu7eS/99MfVNEP6QvV24NfukgnHvZcYnDjNqrUrHpmbsdR19OsTStnt1YGLqNuOe04xY1zFiWpNG1KZm2FlDTydm0gJvr6LLb97IiLOaUZeGEZeG4YFKhoyrGTKoGDKoGHHUMGAp49h1DGT6gnzzGfR87JRw6uFyzvYqGOgvZ3hYzbCjOoWvR07DCezJFBAA5DdUolrXinZTO0zODky+u4b59zfB39jO4hEAWcYrABAByEo+WAGgGIASQFkSBQB5cllqfgEkgzG71IsLUAAAAABJRU5ErkJggg==" \
                             tooltiptext="鼠标中键清除当前站点cookies和历史，右键一键清理历史" popup="UCCM-popup"  onclick="UCCM.doclearall(event);">\
                 <menupopup id="UCCM-popup" noautohide="true" position="after_start" \
                           onpopupshowing="UCCM.onPopupShowing(event);">\
                   <vbox id="UCCM-contents" >\
                     <groupbox  id="UCCM-SHOW" class="GRPCM">\
                       <caption label="已使用内存" />\
                       <hbox>\
                       <spacer flex="1" />\
                       <label id="UCCM-MEM" class="item-msg" tooltiptext="左键查看内存使用, 中键清理缓存, 右键执行内存整理"  onclick="UCCM.doaboutmem(event);" />\
                       <spacer flex="1" />\
                       </hbox>\
                       <checkbox id="trimafom"  value="useafom" label="启用预警，执行afom.exe(15秒)整理内存" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       <checkbox id="trimmem"  value="MemoryAlert" label="启用预警，执行GC和CC整理内存" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       <hbox>\
                       <checkbox id="trimCLcachechk" label="同时清理缓存" checked="false" value="CMtrim" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       <spacer flex="1" />\
                       <checkbox id="trimclosetabchk" label="关闭标签页仅保留当前页" checked="false" value="CMtrimtab" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       </hbox>\
                       <checkbox id="hidePanelUIbutton"  value="CMhideButton" label="合并控制面板到火狐打开菜单按钮" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                     </groupbox>\
                     <groupbox  id="UCCM-CLSITE" class="GRPCM">\
                       <caption label="清理当前站点选项(中键点击图标)" class="chk-commandall" tooltiptext="点击立即清理" onclick="UCCM.clearsiteall();" />\
                       <hbox>\
                       <checkbox id="cleartabsitedomain"  value="CMcleardomain" label="清除整个域名" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       <spacer flex="1" />\
                       <checkbox id="cleartabsitePlugin"  value="CMsitePlugin" label="站点插件数据" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       </hbox>\
                       <hbox>\
                       <checkbox id="cleartabsitePasswords"  value="CMsitePasswords" label="已保存密码" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       <spacer flex="1" />\
                       <checkbox id="cleartabsitePermissions"  value="CMsitePermissions" label="Permissions设置" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       </hbox>\
                       <hbox>\
                       <checkbox id="cleartabsiteOffline"  value="CMsiteOffline" label="脱机存储" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       <spacer flex="1" />\
                       <checkbox id="cleartabsitePreferences"  value="CMsitePreferences" label="站点设置" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                       </hbox>\
                     </groupbox>\
                     <groupbox  id="UCCM-CLHIS" class="GRPCM">\
                       <caption label="一键清理历史记录选项(右键点击图标)"  class="chk-commandall" tooltiptext="点击立即清理" onclick="UCCM.clearallhist();" />\
                         <hbox>\
                         <checkbox id="closedoit"  value="CMclosedoit" label="退出时执行一键清理历史" checked="false" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                         <spacer flex="1" />\
                         <label id="clearallrestart" value="清除全部历史并重启" class="chk-command" onclick="UCCM.doclearrestart(event);" />\
                         </hbox>\
                         <hbox>\
                         <checkbox id="historychk" checked="true" value="CMhistory" class="chk-link" oncommand="UCCM.CMsetPref(event);"/>\
                         <label id="CLRhistory" value="清理历史记录" class="chk-command" tooltiptext="立即执行清理" onclick="UCCM.doCMD(event);" />\
                         <spacer flex="1" />\
                         <checkbox id="lsoschk"  checked="false" value="CMlsos" class="chk-link" oncommand="UCCM.CMsetPref(event);"/>\
                         <label id="CLRlsos" value="清理Flash LSOs" class="chk-command" tooltiptext="立即执行清理" onclick="UCCM.doCMD(event);" />\
                         </hbox>\
                         <hbox>\
                         <checkbox id="cookieschk" checked="true" value="CMcookies" class="chk-link" oncommand="UCCM.CMsetPref(event);"/>\
                         <label id="CLRcookies" value="清理Cookies" class="chk-command" tooltiptext="立即执行清理" onclick="UCCM.doCMD(event);" />\
                         <spacer flex="1" />\
                         <label id="viewcookies" value="查看cookies" class="chk-command" onclick="UCCM.doviewcookies(event);" />\
                         </hbox>\
                         <hbox>\
                         <checkbox id="httpLoginschk" checked="true" value="CMhttpLogins" class="chk-link" oncommand="UCCM.CMsetPref(event);"/>\
                         <label id="CLRhttpLogins" value="清理HttpLogins" class="chk-command" tooltiptext="立即执行清理" onclick="UCCM.doCMD(event);" />\
                         <spacer flex="1" />\
                         <checkbox id="localchk"  checked="false" value="CMlocal" class="chk-link" oncommand="UCCM.CMsetPref(event);"/>\
                         <label id="CLRlocal" value="清理html5/本地存储" class="chk-command" tooltiptext="立即执行清理" onclick="UCCM.doCMD(event);" />\
                         </hbox>\
                         <hbox>\
                         <checkbox id="closetabchk" label="关闭全部标签页" checked="false" value="CMclosetab" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                         <spacer flex="1" />\
                         <checkbox id="CLRhistcache" label="同时清理缓存" checked="false" value="CMhistcache" class="chk-link" oncommand="UCCM.CMsetPref(event);" />\
                         </hbox>\
                     </groupbox>\
                     <groupbox  id="UCCM-CLMEM" class="GRPCM">\
                       <caption label="清理缓存选项(中键点击内存显示)" class="chk-commandall" tooltiptext="点击立即清理" onclick="UCCM.clearallcache();" />\
                         <hbox>\
                         <checkbox id="cachechk" checked="true" value="CMcache" class="chk-link" oncommand="UCCM.CMsetPref(event);"/>\
                         <label id="CLRcache" value="清理缓存" class="chk-command" tooltiptext="立即清理" onclick="UCCM.docacheCMD(event);" />\
                         <spacer flex="1" />\
                         <checkbox id="offlinechk" checked="false" value="CMoffline" class="chk-link" oncommand="UCCM.CMsetPref(event);"/>\
                         <label id="CLRoffline" value="清理脱机缓存" class="chk-command" tooltiptext="立即清理" onclick="UCCM.docacheCMD(event);" />\
                         <spacer flex="1" />\
                         <checkbox id="imagechk" checked="false" value="CMimage" class="chk-link" oncommand="UCCM.CMsetPref(event);"/>\
                         <label id="CLRimage" value="清理图标缓存" class="chk-command" tooltiptext="立即清理" onclick="UCCM.docacheCMD(event);" />\
                         </hbox>\
                     </groupbox>\
                     <hbox id="UCCMMSGBOX">\
                       <label id="UCCMMSG" class="UCCM-msg" value=""/>\
                     </hbox>\
                   </vbox>\
                 </menupopup>\
               </toolbarbutton>\
          </toolbarpalette>\
    	</overlay>';
    	overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
      window.userChrome_js.loadOverlay(overlay, UCCM);
      UCCM.style = addStyle(css);
  	},
  	
  	observe: function(subject, topic, data) {
    	switch (topic) {
    	  case "xul-overlay-merged" :
        if (!this._isready) {
            Application.console.log("UCCM界面加载完毕！");
				    this._isready = true;
				    this.CMBTN = document.getElementById("UCCM-icon");
          	this.refreshPrefs();
          	this.style = addStyle(css);
          	window.addEventListener("unload", this, false);
          	this.iniUI();
          	this.refrashMemory();
          	this.initimer();
          	this._ps.addObserver("", this, false);
        }
        break;
        case "nsPref:changed" :
        switch (data) {
        	case 'interval':
        	  this._interval =  this._ps.getIntPref("interval");
            if (this._interval < 30000)
              this._interval =  30000;
            break;
          case 'MaxMemory':
            this._MaxMemory =  this._ps.getIntPref("MaxMemory"); 
            if (this._MaxMemory < 700)
              this._MaxMemory =  700;
            break; 
        }
        case "quit-application-requested" :
        if (data != "restart") {
          if (this._CMclosedoit) {
          	  if (this._CMhistory)
          	    this.clearHistorysrv.removeAllPages();
          	  if (this._CMcookies)
          	    this.clearCookiesrv.removeAll();
          	  if (this._CMhttpLogins)
          	    this.clearHttpLoginsrv.clearAll();
          	  if (this._CMlocal)
          	    this.clearAllLocalStorage();
          	  if (this._CMlsos)
          	    this.delLSOs();
          }
        } 
        break;
      }  
    },
    
    handleEvent: function( evt ) {
  	  switch(evt.type){
  			case "unload": this.uninit(); break;
  		}
  	},
  	
  	uninit: function(event) {
  		this._ps.removeObserver("", this, false);
  	  if (this.CMBTN) this.CMBTN.parentNode.removeChild(this.CMBTN);
  	  window.removeEventListener("unload", this, false);
  	},
  	
  	refreshPrefs: function() {
      if (!this._ps.prefHasUserValue("CMcache")) {
          this._ps.setBoolPref("CMcache", true);
      }
      this._CMcache = this._ps.getBoolPref("CMcache");
      
      if (!this._ps.prefHasUserValue("CMoffline")) {
          this._ps.setBoolPref("CMoffline",false);
      }
      this._CMoffline =  this._ps.getBoolPref("CMoffline");
      
      if (!this._ps.prefHasUserValue("CMimage")) {
          this._ps.setBoolPref("CMimage",false);
      }
      this._CMimage =  this._ps.getBoolPref("CMimage"); 
      
      if (!this._ps.prefHasUserValue("CMtrim")) {
          this._ps.setBoolPref("CMtrim",false);
      }
      this._CMtrim =  this._ps.getBoolPref("CMtrim");
      
      if (!this._ps.prefHasUserValue("CMhistory")) {
          this._ps.setBoolPref("CMhistory",true);
      }
      this._CMhistory =  this._ps.getBoolPref("CMhistory");
      
      if (!this._ps.prefHasUserValue("CMcookies")) {
          this._ps.setBoolPref("CMcookies",true);
      }
      this._CMcookies =  this._ps.getBoolPref("CMcookies");

      if (!this._ps.prefHasUserValue("CMcleardomain")) {
          this._ps.setBoolPref("CMcleardomain",false);
      }
      this._CMcleardomain =  this._ps.getBoolPref("CMcleardomain");
      
      if (!this._ps.prefHasUserValue("CMhttpLogins")) {
          this._ps.setBoolPref("CMhttpLogins",true);
      }
      this._CMhttpLogins =  this._ps.getBoolPref("CMhttpLogins");
      
      if (!this._ps.prefHasUserValue("CMlocal")) {
          this._ps.setBoolPref("CMlocal",false);
      }
      this._CMlocal =  this._ps.getBoolPref("CMlocal");
      
      if (!this._ps.prefHasUserValue("CMlsos")) {
          this._ps.setBoolPref("CMlsos",false);
      }
      this._CMlsos =  this._ps.getBoolPref("CMlsos");
      
      if (!this._ps.prefHasUserValue("CMclosetab")) {
          this._ps.setBoolPref("CMclosetab",false);
      }
      this._CMclosetab =  this._ps.getBoolPref("CMclosetab");
      
      if (!this._ps.prefHasUserValue("CMhistcache")) {
          this._ps.setBoolPref("CMhistcache",false);
      }
      this._CMhistcache =  this._ps.getBoolPref("CMhistcache");
      
      if (!this._ps.prefHasUserValue("CMtrimtab")) {
          this._ps.setBoolPref("CMtrimtab",false);
      }
      this._CMtrimtab =  this._ps.getBoolPref("CMtrimtab");
      
      if (!this._ps.prefHasUserValue("CMclosedoit")) {
          this._ps.setBoolPref("CMclosedoit",false);
      }
      this._CMclosedoit =  this._ps.getBoolPref("CMclosedoit");
      
      if (!this._ps.prefHasUserValue("interval")) {
          this._ps.setIntPref("interval",60000);
      }
      this._interval =  this._ps.getIntPref("interval");
      if (this._interval < 30000)
        this._interval =  30000;
      
      if (!this._ps.prefHasUserValue("MaxMemory")) {
          this._ps.setIntPref("MaxMemory",2000);
      }
      this._MaxMemory =  this._ps.getIntPref("MaxMemory"); 
      if (this._MaxMemory < 700)
        this._MaxMemory =  700; 
      
      if (!this._ps.prefHasUserValue("MemoryAlert")) {
          this._ps.setBoolPref("MemoryAlert",false);
      }
      this._MemoryAlert =  this._ps.getBoolPref("MemoryAlert");
      
      if (!this._ps.prefHasUserValue("useafom")) {
          this._ps.setBoolPref("useafom",false);
      }
      this._useafom =  this._ps.getBoolPref("useafom");
      
      if (!this._ps.prefHasUserValue("CMsitePlugin")) {
          this._ps.setBoolPref("CMsitePlugin",false);
      }
      this._CMsitePlugin =  this._ps.getBoolPref("CMsitePlugin");
      if (!this._ps.prefHasUserValue("CMsitePasswords")) {
          this._ps.setBoolPref("CMsitePasswords",false);
      }
      this._CMsitePasswords =  this._ps.getBoolPref("CMsitePasswords");
      if (!this._ps.prefHasUserValue("CMsitePermissions")) {
          this._ps.setBoolPref("CMsitePermissions",false);
      }
      this._CMsitePermissions =  this._ps.getBoolPref("CMsitePermissions");
      if (!this._ps.prefHasUserValue("CMsiteOffline")) {
          this._ps.setBoolPref("CMsiteOffline",false);
      }
      this._CMsiteOffline =  this._ps.getBoolPref("CMsiteOffline");
      if (!this._ps.prefHasUserValue("CMsitePreferences")) {
          this._ps.setBoolPref("CMsitePreferences",false);
      }
      this._CMsitePreferences =  this._ps.getBoolPref("CMsitePreferences");
      
      if (!this._ps.prefHasUserValue("CMhideButton")) {
          this._ps.setBoolPref("CMhideButton",false);
      }
      this._CMhideButton =  this._ps.getBoolPref("CMhideButton");
  	},
  	
  	initimer: function(){
  		if (UCCM.dotimer)
  	      clearInterval(UCCM.dotimer);
  	  if (UCCM._MemoryAlert || UCCM._useafom) {
  	    UCCM.dotimer = setInterval(UCCM.refrashMemory, UCCM._interval);
  	  }
  	},
  	
  	iniUI: function(){
  	  document.getElementById("cachechk").setAttribute("checked", this._CMcache);
      document.getElementById("offlinechk").setAttribute("checked", this._CMoffline);
      document.getElementById("imagechk").setAttribute("checked", this._CMimage);
      document.getElementById("trimCLcachechk").setAttribute("checked", this._CMtrim);
      document.getElementById("historychk").setAttribute("checked", this._CMhistory);
      document.getElementById("cookieschk").setAttribute("checked", this._CMcookies);
      document.getElementById("cleartabsitedomain").setAttribute("checked", this._CMcleardomain);
      document.getElementById("httpLoginschk").setAttribute("checked", this._CMhttpLogins);
      document.getElementById("localchk").setAttribute("checked", this._CMlocal);
      document.getElementById("lsoschk").setAttribute("checked", this._CMlsos);  
      document.getElementById("closetabchk").setAttribute("checked", this._CMclosetab);
      document.getElementById("closedoit").setAttribute("checked", this._CMclosedoit);
      document.getElementById("trimmem").setAttribute("checked", this._MemoryAlert);
      document.getElementById("trimafom").setAttribute("checked", this._useafom);
      document.getElementById("CLRhistcache").setAttribute("checked", this._CMhistcache);
      document.getElementById("trimclosetabchk").setAttribute("checked", this._CMtrimtab);
      document.getElementById("trimCLcachechk").disabled = !this._MemoryAlert;
      document.getElementById("trimclosetabchk").disabled = !this._MemoryAlert;
      
      document.getElementById("cleartabsitePlugin").setAttribute("checked", this._CMsitePlugin);
      document.getElementById("cleartabsitePasswords").setAttribute("checked", this._CMsitePasswords);
      document.getElementById("cleartabsitePermissions").setAttribute("checked", this._CMsitePermissions);
      document.getElementById("cleartabsiteOffline").setAttribute("checked", this._CMsiteOffline);
      document.getElementById("cleartabsitePreferences").setAttribute("checked", this._CMsitePreferences);
      if (UCCM.iscanuseafom()) 
        document.getElementById("trimafom").disabled = false;
      else {
      	document.getElementById("trimafom").disabled = true;
      	if (this._useafom) {
      	   this._useafom = false;
      	   this._ps.setBoolPref("useafom", false);
      	}
      }
      document.getElementById("trimmem").disabled = this._useafom;
      document.getElementById("trimCLcachechk").disabled = this._useafom;
      document.getElementById("trimclosetabchk").disabled = this._useafom;
      if (this._CMclosedoit)
              UCCM.observerService.addObserver(this, "quit-application-requested", false);
       
      document.getElementById("hidePanelUIbutton").setAttribute("checked", this._CMhideButton);        
      if (getFoxVer() >= 29) {
      	document.getElementById("hidePanelUIbutton").hidden = false;
      	if (this._CMhideButton)
      	this.toggleUI(true);
      } else {
        document.getElementById("hidePanelUIbutton").hidden = true;
      }
  	},
  	
  	CMsetPref: function(e) {
  		var ssid = e.target.getAttribute("value");
  		if (this._ps.prefHasUserValue(ssid)) {
          this._ps.setBoolPref(ssid, e.target.getAttribute("checked"));
          switch(ssid){
  			    case "CMcache": 
  			    this._CMcache = this._ps.getBoolPref("CMcache"); 
  			    break;
  			    case "CMoffline": 
  			    this._CMoffline = this._ps.getBoolPref("CMoffline"); 
  			    break;
  			    case "CMimage": 
  			    this._CMimage = this._ps.getBoolPref("CMimage"); 
  			    break;
  			    case "CMtrim": 
  			    this._CMtrim = this._ps.getBoolPref("CMtrim"); 
  			    break;
  			    case "CMhistory": 
  			    this._CMhistory = this._ps.getBoolPref("CMhistory"); 
  			    break;
  			    case "CMcookies": 
  			    this._CMcookies = this._ps.getBoolPref("CMcookies"); 
  			    break;
  			    case "CMcleardomain": 
  			    this._CMcleardomain = this._ps.getBoolPref("CMcleardomain"); 
  			    break;
  			    case "CMsitePlugin": 
  			    this._CMsitePlugin = this._ps.getBoolPref("CMsitePlugin"); 
  			    break;
  			    case "CMsitePasswords": 
  			    this._CMsitePasswords = this._ps.getBoolPref("CMsitePasswords"); 
  			    break;
  			    case "CMsitePermissions": 
  			    this._CMsitePermissions = this._ps.getBoolPref("CMsitePermissions"); 
  			    break;
  			    case "CMsiteOffline": 
  			    this._CMsiteOffline = this._ps.getBoolPref("CMsiteOffline"); 
  			    break;
  			    case "CMsitePreferences": 
  			    this._CMsitePreferences = this._ps.getBoolPref("CMsitePreferences"); 
  			    break;
  			    case "CMhttpLogins": 
  			    this._CMhttpLogins = this._ps.getBoolPref("CMhttpLogins"); 
  			    break;
  			    case "CMlocal": 
  			    this._CMlocal = this._ps.getBoolPref("CMlocal"); 
  			    break;
  			    case "CMlsos": 
  			    this._CMlsos = this._ps.getBoolPref("CMlsos"); 
  			    break;
  			    case "CMclosetab": 
  			    this._CMclosetab = this._ps.getBoolPref("CMclosetab"); 
  			    break;
  			    case "CMtrimtab": 
  			    this._CMtrimtab = this._ps.getBoolPref("CMtrimtab"); 
  			    break;
  			    case "CMhistcache": 
  			    this._CMhistcache = this._ps.getBoolPref("CMhistcache"); 
  			    break;
  			    case "CMclosedoit": 
  			    this._CMclosedoit = this._ps.getBoolPref("CMclosedoit"); 
  			    if (this._CMclosedoit)
              UCCM.observerService.addObserver(this, "quit-application-requested", false);
            else
            	UCCM.observerService.removeObserver(this, "quit-application-requested", false);
  			    break;
  			    case "MemoryAlert": 
  			    this._MemoryAlert = this._ps.getBoolPref("MemoryAlert"); 
  			    document.getElementById("trimCLcachechk").disabled = !this._MemoryAlert;
            document.getElementById("trimclosetabchk").disabled = !this._MemoryAlert;
  			    this.initimer();
  			    break;
  			    case "useafom": 
  			    this._useafom = this._ps.getBoolPref("useafom");
  			    document.getElementById("trimmem").disabled = this._useafom;
            document.getElementById("trimCLcachechk").disabled = this._useafom;
            document.getElementById("trimclosetabchk").disabled = this._useafom; 
  			    break;
  			    case "CMhideButton": 
  			    this._CMhideButton = this._ps.getBoolPref("CMhideButton");
  			    document.getElementById("UCCM-popup").hidePopup();
  			    this.toggleUI(this._CMhideButton);
  			    break;
  		    }
      }
  	},
  	
  	docacheCMD: function(e) {
  	  var ssid = e.target.id;
  	  switch(ssid){
  	    case "CLRcache": 
  			this.cachesrv.evictEntries(Components.interfaces.nsICache.STORE_ON_DISK);
		    this.cachesrv.evictEntries(Components.interfaces.nsICache.STORE_IN_MEMORY);
		    this.notifymsg("缓存已清理完成！");
  			break;
  			case "CLRoffline": 
  			this.cachesrv.evictEntries(Components.interfaces.nsICache.STORE_OFFLINE);
  			this.notifymsg("脱机缓存已清理完成！");
  			break;
  			case "CLRimage": 
  			this.imagecachesrv.clearCache(false);
  			this.notifymsg("图标缓存已清理完成！");
  			break;
  	  }
  	},
  	
  	doCMD: function(e) {
  		var ssid = e.target.id;
  	  switch(ssid){ 
    	  case "CLRhistory":
    	  this.clearHistorysrv.removeAllPages();
    	  this.notifymsg("历史记录已清理！");
    	  break;
    	  case "CLRcookies":
    	  this.clearCookiesrv.removeAll();
    	  this.notifymsg("cookies已清理！");
    	  break;
    	  case "CLRhttpLogins":
    	  this.clearHttpLoginsrv.clearAll();
    	  this.notifymsg("httpLogins已清理！");
    	  break;
    	  case "CLRlocal":
    	  this.clearAllLocalStorage();
    	  this.notifymsg("html5 LocalStorage已清理！");
    	  break;
    	  case "CLRlsos":
    	  this.delLSOs();
    	  this.notifymsg("Flash cookies已清理！");
    	  break;
  	  }
  	},
  	
  	delLSOs: function(){
  	  function delpath(){
        try{
          OSLOC.initWithPath(fdir);
          if (OSLOC.exists) 
            OSLOC.remove(!0);
        }catch(e){}
      }
      var OS = CC["@mozilla.org/xre/app-info;1"].getService(CI.nsIXULRuntime).OS.toLowerCase();
      var OSDIR = CC["@mozilla.org/file/directory_service;1"].getService(CI.nsIProperties);
      var OSLOC = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile);
      var fdir;
  		if (OS == "linux") {
  			OS = OSDIR.get("Home",CI.nsIFile);
  			fdir = OS.path + "/.macromedia/Flash_Player/#SharedObjects";
  			delpath();
  			fdir  =OS.path + "/.macromedia/Flash_Player/macromedia.com/support/flashplayer/sys";
  		} else if (OS == "darwin") {
  		  OS = OSDIR.get("ULibDir",CI.nsIFile);
  		  fdir = OS.path + "/Preferences/Macromedia/Flash Player/#SharedObjects";
  		  delpath();
  		  fdir = OS.path + "/Preferences/Macromedia/Flash Player/macromedia.com/support/flashplayer/sys";
  		} else {
  		  OS  =OSDIR.get("AppData",CI.nsIFile);
  		  fdir = OS.path + "\\Macromedia\\Flash Player\\#SharedObjects";
  		  delpath();
  		  fdir = OS.path + "\\Macromedia\\Flash Player\\macromedia.com\\support\\flashplayer\\sys";
  		}
  		delpath();
  	},
  	
    doclosealltab: function(cris){
  		var abrser = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator).getMostRecentWindow("navigator:browser").gBrowser;
	    abrser.removeAllTabsBut(abrser.mCurrentTab);
	    if (cris)
        abrser.removeCurrentTab();
    },
    
    doviewcookies: function(){
      window.openDialog("chrome://browser/content/preferences/cookies.xul","_new","chrome,centerscreen");
    },
    
    doaboutmem: function(evt){
    	var slab = document.getElementById("UCCM-MEM");
    	if (evt.target != slab) return;
    	if (evt.button == 0) {
  		  var abrser = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator).getMostRecentWindow("navigator:browser").gBrowser;
	      abrser.selectedTab = abrser.addTab("about:memory");
	    } else if ((evt.button == 1)) {
	      this.clearallcache();
	    } else {
	    	evt.preventDefault();
	    	if (UCCM.iscanuseafom() && UCCM._useafom) 
	    	   UCCM.doMFtask();
	    	else
	    	  UCCM.doGCandCC();
	    	UCCM.refrashMemory();
	    }
    },
    
    clearallcache: function(){
        if (this._CMcache) {
  			  this.cachesrv.evictEntries(Components.interfaces.nsICache.STORE_ON_DISK);
		      this.cachesrv.evictEntries(Components.interfaces.nsICache.STORE_IN_MEMORY);
  			}
  			if (this._CMoffline){
  			  this.cachesrv.evictEntries(Components.interfaces.nsICache.STORE_OFFLINE);
  			}
  			if (this._CMimage) { 
  			  this.imagecachesrv.clearCache(false);
  			}
  			this.notifymsg("缓存已清理！");
    },
    
    clearallhist: function(){
        if (this._CMclosetab) this.doclosealltab(true);
		  	if (this._CMhistory)
    	    this.clearHistorysrv.removeAllPages();
    	  if (this._CMcookies)
    	    this.clearCookiesrv.removeAll();
    	  if (this._CMhttpLogins)
    	    this.clearHttpLoginsrv.clearAll();
    	  if (this._CMlocal)
    	    this.clearAllLocalStorage();
    	  if (this._CMlsos)
    	    this.delLSOs();
    	  if (this._CMhistcache)
    	    this.clearallcache();
    	  this.notifymsg("一键清理历史记录已完成！");
    },
    
    doclearall: function(evt) {
    	if (evt.target != this.CMBTN) return;
    	if (evt.button == 0) {
         //evt.stopPropagation();
         //evt.preventDefault();
         return;
      }
      else if (evt.button == 1) {
        UCCM.clearsiteall();
        this.alertSvr.showAlertNotification(null, "UCCM", "当前站点访问记录已清理完成！", false, "", null);
      }
		  else {
		  	evt.preventDefault();
		  	UCCM.clearallhist();
		  	this.alertSvr.showAlertNotification(null, "UCCM", "一键清理历史已完成！", false, "", null);
		  }
    },
    
    doclearrestart: function() {
	    this.doclosealltab(true);
	    this.clearHistorysrv.removeAllPages();
	    this.clearCookiesrv.removeAll();
	    this.clearHttpLoginsrv.clearAll();
	    this.clearAllLocalStorage();
	    this.delLSOs();
    	this.reastartfox();
    },
    
    reastartfox: function() {
      CC["@mozilla.org/toolkit/app-startup;1"].getService(CI.nsIAppStartup).quit(CI.nsIAppStartup.eForceQuit|CI.nsIAppStartup.eRestart);
    },
    
    onPopupShowing: function(evt) {
    	if (!UCCM.afomrunning)
        UCCM.refrashMemory();
    },
    
    refrashMemory: function() {
      var g_MemReporters = UCCM.MemReporters.resident;
      UCCM._MemoryValue = Math.round(g_MemReporters / (1024 * 1024));
      var minimizeMemory = UCCM._MaxMemory * 1024 * 1024;
      var MemoryPanel = document.getElementById("UCCM-MEM");
      MemoryPanel.setAttribute("value", "已使用:" + UCCM.addFigure(UCCM._MemoryValue) + UCCM._prefix + " / 预警值:" + UCCM._MaxMemory + UCCM._prefix);
      if(g_MemReporters > minimizeMemory) {
      	MemoryPanel.style.color = "red";
      	if (UCCM.iscanuseafom() && UCCM._useafom) {
      		UCCM.doMFtask();
      	} else if (UCCM._MemoryAlert) {
					UCCM.doGCandCC();
					if (this._CMtrimtab) 
						this.doclosealltab(false);
					if (this._CMtrim) {
					  if (this._CMcache) {
      			  this.cachesrv.evictEntries(Components.interfaces.nsICache.STORE_ON_DISK);
    		      this.cachesrv.evictEntries(Components.interfaces.nsICache.STORE_IN_MEMORY);
      			}
      			if (this._CMoffline)
      			  this.cachesrv.evictEntries(Components.interfaces.nsICache.STORE_OFFLINE);
      			if (this._CMimage) 
      			  this.imagecachesrv.clearCache(false);
					}
			  }
			} else {
				MemoryPanel.style.color = "blue";
			}
    },
    
    addFigure: function(str) {
		  var num = new String(str).replace(/,/g, "");
		  while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
		  return num;
	  },
    
    notifymsg: function(msg) {
      document.getElementById("UCCMMSG").value = msg;
    },
    
    removeDataFromsite: function(aDomain) {
    	if (this._CMsitePlugin) {
        // Plugin data
        const phInterface = CI.nsIPluginHost;
        const FLAG_CLEAR_ALL = phInterface.FLAG_CLEAR_ALL;
        let (ph = CC["@mozilla.org/plugin/host;1"].getService(phInterface)) {
          let tags = ph.getPluginTags();
          for (let i = 0; i < tags.length; i++) {
            try {
              ph.clearSiteData(tags[i], aDomain, FLAG_CLEAR_ALL, -1);
            } catch (e) {
              // Ignore errors from the plugin
            }
          }
        }
      }
      
      if (this._CMsitePasswords) {
        // Passwords
        let (lm = CC["@mozilla.org/login-manager;1"].
                  getService(CI.nsILoginManager)) {
          try {
            let logins = lm.getAllLogins();
            for (let i = 0; i < logins.length; i++)
              if (hasRootDomain(logins[i].hostname, aDomain))
                lm.removeLogin(logins[i]);
          }
          catch (ex if ex.message.indexOf("User canceled Master Password entry") != -1) { }
    
          let disabledHosts = lm.getAllDisabledHosts();
          for (let i = 0; i < disabledHosts.length; i++)
            if (hasRootDomain(disabledHosts[i], aDomain))
              lm.setLoginSavingEnabled(disabledHosts, true);
        }
      }
      
      if (this._CMsitePermissions) {
        // Permissions
        let (pm = CC["@mozilla.org/permissionmanager;1"].
                  getService(CI.nsIPermissionManager)) {
          let enumerator = pm.enumerator;
          while (enumerator.hasMoreElements()) {
            let perm = enumerator.getNext().QueryInterface(CI.nsIPermission);
            if (hasRootDomain(perm.host, aDomain))
              pm.remove(perm.host, perm.type);
          }
        }
      }
      
      if (this._CMsiteOffline) {
        // Offline Storages
        let (qm = CC["@mozilla.org/dom/quota/manager;1"].
                  getService(CI.nsIQuotaManager)) {
          let caUtils = {};
          let scriptLoader = CC["@mozilla.org/moz/jssubscript-loader;1"].
                             getService(CI.mozIJSSubScriptLoader);
          scriptLoader.loadSubScript("chrome://global/content/contentAreaUtils.js",
                                     caUtils);
          let httpURI = caUtils.makeURI("http://" + aDomain);
          let httpsURI = caUtils.makeURI("https://" + aDomain);
          qm.clearStoragesForURI(httpURI);
          qm.clearStoragesForURI(httpsURI);
        }
      }
       
      if (this._CMsitePreferences) {
        // Content Preferences
        function onContentPrefsRemovalFinished() {
          Services.obs.notifyObservers(null, "browser:purge-domain-data", aDomain);
        }
        
        let cps2 = CC["@mozilla.org/content-pref/service;1"].
                   getService(CI.nsIContentPrefService2);
        cps2.removeBySubdomain(aDomain, null, {
          handleCompletion: function() onContentPrefsRemovalFinished(),
          handleError: function() {}
        });
      }
    },
    
    clearsiteall: function(){
      var tab = null;
      var uri = null;
      var abrser = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator).getMostRecentWindow("navigator:browser").gBrowser;
      tab = abrser.selectedTab;
      var current_url = tab.linkedBrowser.currentURI.spec;
      if(current_url) {
        current_url = current_url.toUpperCase();
        if (current_url.substring(0, 4) != "HTTP")
          return;
        else {
          var ioService = CC["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
          uri = ioService.newURI(current_url, null, null);
        }
        if (UCCM._beginsWith(current_url, "HTTP://")) {
          if(!UCCM._beginsWith(current_url, "HTTP://WWW.")) {
            var s=current_url;
            current_url = s.substring(0, 7) + "." + s.substring(7);
          }
        } else if (UCCM._beginsWith(current_url, "HTTPS://")) {
          if(!UCCM._beginsWith(current_url, "HTTPS://WWW.")) {
            var s=current_url;
            current_url = s.substring(0, 8) + "." + s.substring(8);
          }
        }
        abrser.removeTab(tab);
        var iter = this.clearCookiesrv.enumerator;
        var cookie_count = 0;
        if (this._CMcleardomain) {
          var domain = current_url.replace(/^HTTPS?:\/\/.*\.([^\.|:|\/]*\.[^\.|:|\/]*)\/.*/, "$1");
          while (iter.hasMoreElements()) {
            var cookie = iter.getNext();
            if (cookie instanceof Components.interfaces.nsICookie) {
              if (cookie.host.toUpperCase().indexOf(domain) != -1) {
                  this.clearCookiesrv.remove(cookie.host, cookie.name, cookie.path, cookie.blocked);
                  cookie_count++;
              }
            }
          }
          this.clearHistorysrv.removePagesFromHost(domain.toLowerCase(), true);
          this.removeDataFromsite(domain.toLowerCase());
          this.notifymsg("当前标签页" + domain.toLowerCase() + "已清理完成！");
        } else {
          while (iter.hasMoreElements()) {
            var cookie = iter.getNext();
            if (cookie instanceof Components.interfaces.nsICookie) {
              if (current_url.indexOf(cookie.host.toUpperCase()) != -1) {
                  this.clearCookiesrv.remove(cookie.host, cookie.name, cookie.path, cookie.blocked);
                  cookie_count++;
              }
            }
          }
          this.clearHistorysrv.removePagesFromHost(uri.host.toLowerCase(), false);
          this.removeDataFromsite(uri.host.toLowerCase());
          this.notifymsg("当前标签页" + uri.host.toLowerCase() + "已清理完成！");
        }
      }
    },
    
    _beginsWith : function (string, text) {
      var pos = string.indexOf(text);
      if (pos == 0) {
        return true;
      } else {
        return false;
      }
    },
    
    doGCandCC: function() {
      let activeWindow = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI.nsIWindowMediator).getMostRecentWindow("navigator:browser");
      activeWindow.QueryInterface(CI.nsIInterfaceRequestor).getInterface(CI.nsIDOMWindowUtils).cycleCollect();
      CU.forceGC();
      this.notifymsg("memory垃圾回收和循环回收已完成！");
    },
    
    toggleUI: function(MODE) {
      var PUI = document.getElementById("PanelUI-menu-button");
      if (!PUI) return;
      if (MODE) {
      	UCCM.PanelUIclick = PUI.getAttribute("onclick");
      	PUI.setAttribute("onclick", "UCCM.PUIclick(event);");
      	var popup = document.getElementById("UCCM-popup");
      	document.getElementById('mainPopupSet').appendChild(popup);
      	UCCM.CMBTN.hidden = true;
      } else {
        PUI.setAttribute("onclick", UCCM.PanelUIclick);
        UCCM.PanelUIclick = null;
        var popup = document.getElementById("UCCM-popup");
        UCCM.CMBTN.hidden = false;
        UCCM.CMBTN.appendChild(popup);
      }
    },
    
		  	
    PUIclick: function(event) {
      if (event.button == 0) {
      	UCCM.PanelUIclick
      } else if (event.button == 1) {
      	event.preventDefault();
      	UCCM.clearsiteall();
        UCCM.alertSvr.showAlertNotification(null, "UCCM", "当前站点访问记录已清理完成！", false, "", null);
      } else if (event.button == 2) {
        event.preventDefault();
        document.getElementById("UCCM-popup").showPopup(event.target, -1, -1, 'popup', 'bottomleft', 'topleft'); 
      }
    },
    
    //for afom.exe mode
    iscanuseafom: function() {
      var fileToActivate0 = CC["@mozilla.org/file/directory_service;1"].
  		getService(CI.nsIProperties).
  		get("UChrm", CI.nsIFile).
  		QueryInterface(CI.nsILocalFile);
  		fileToActivate0.append("Local");
  		fileToActivate0.append("afom");
  		fileToActivate0.append("afom.exe");
  		if (fileToActivate0.exists())
  		  return true;
  		else
  			return false;
    },
    
    SetMfxRestart: function(){
			var key = CC["@mozilla.org/windows-registry-key;1"].createInstance(CI.nsIWindowsRegKey);
			key.open(key.ROOT_KEY_CURRENT_USER,"SOFTWARE",key.ACCESS_ALL);
			if (key.hasChild("Afom")) {
				var child = key.openChild("Afom",key.ACCESS_ALL);
				if( child ) {
					child.writeIntValue("mfxRestart", 1);
					child.close();
				}
			}
			key.close();
		},
		
		SetActivateStartMFX: function() {
			var key = CC["@mozilla.org/windows-registry-key;1"].createInstance(CI.nsIWindowsRegKey);
			key.open(key.ROOT_KEY_CURRENT_USER,"SOFTWARE",key.ACCESS_ALL);
			if (key.hasChild("Afom")) {
				var child = key.openChild("Afom",key.ACCESS_ALL);
				if( child ) {
					child.writeIntValue("startMFX", 1);
					child.close();
				}
			}
			key.close();
		},
		
		ResetActivateStartMFX: function() {
			var key = CC["@mozilla.org/windows-registry-key;1"].createInstance(CI.nsIWindowsRegKey);
			key.open(key.ROOT_KEY_CURRENT_USER,"SOFTWARE",key.ACCESS_ALL);
			if (key.hasChild("Afom")) {
				var child = key.openChild("Afom",key.ACCESS_ALL);
				if( child ) {
					child.writeIntValue("startMFX", 0);
					child.close();
				}
			}
			key.close();
		},
		
		ResetMfxRestart: function() {
			var key = CC["@mozilla.org/windows-registry-key;1"].createInstance(CI.nsIWindowsRegKey);
			key.open(key.ROOT_KEY_CURRENT_USER,"SOFTWARE",key.ACCESS_ALL);
			if (key.hasChild("Afom")) {
				var child = key.openChild("Afom",key.ACCESS_ALL);
				if( child ) {
					child.writeIntValue("mfxRestart", 0);
					child.close();
				}
			}
			key.close();
		},
		
		GoMF: function() {
			this.SetMfxRestart();
  		this.SetActivateStartMFX();
  		var fileToActivate0 = CC["@mozilla.org/file/directory_service;1"].
  		getService(CI.nsIProperties).
  		get("UChrm", CI.nsIFile).
  		QueryInterface(CI.nsILocalFile);
  		fileToActivate0.append("Local");
  		fileToActivate0.append("afom");
  		fileToActivate0.append("afom.exe");
  		var fileToExec0 = CC["@mozilla.org/file/local;1"].createInstance(CI.nsILocalFile);
  		fileToExec0.initWithPath(fileToActivate0.path);
  		if (fileToExec0.exists()) {
  			var process0 = CC["@mozilla.org/process/util;1"].createInstance(CI.nsIProcess);
  			process0.init(fileToExec0);
  			process0.run(false, 0, 0);
  			UCCM.alertSvr.showAlertNotification(null, "UCCM", "afom.exe已启动开始清理内存！", false, "", null);
  			return true;
  		} else
  			return false;
  	},
  	
  	StopMF: function() {
  		  this.ResetActivateStartMFX();
			  this.ResetMfxRestart();
  			CU.import("resource://gre/modules/ctypes.jsm")
  			var FindWindow=0;
  			var SendMessage=0;
  			var RegisterWindowMessage=0;
  			var rMsg=0;
  			var hWnd=0;
  			var user32dll = ctypes.open("user32.dll");
  			try {
  					FindWindow = user32dll.declare('FindWindowW',ctypes.winapi_abi, ctypes.int32_t, ctypes.jschar.ptr, ctypes.jschar.ptr);
  			} catch(e){
  					FindWindow = user32dll.declare('FindWindowW',ctypes.stdcall_abi, ctypes.int32_t, ctypes.ustring, ctypes.ustring);
  			}
  			try {
  					SendMessage = user32dll.declare('SendMessageW',ctypes.winapi_abi, ctypes.int32_t, ctypes.int32_t, ctypes.uint32_t, ctypes.int32_t, ctypes.int32_t);
  			} catch(e) {
  					SendMessage = user32dll.declare('SendMessageW',ctypes.stdcall_abi, ctypes.int32_t, ctypes.int32_t, ctypes.uint32_t, ctypes.int32_t, ctypes.int32_t);
  			}
  			try {
  					RegisterWindowMessage = user32dll.declare('RegisterWindowMessageW', ctypes.winapi_abi, ctypes.uint32_t, ctypes.jschar.ptr);
  			} catch(e) {
  					RegisterWindowMessage = user32dll.declare('RegisterWindowMessageW', ctypes.stdcall_abi, ctypes.uint32_t, ctypes.ustring);
  			}
  			try {
  					rMsg = RegisterWindowMessage('UWM_AFOM_MSG-6FDBF489-1D15-4b5f-A649-CE4A18E8DD43');
  			} catch(e) {
  					alert("[ StopMF ] Could not set RegisterWindowMessage : "+e);
  			}
  			try {
  					hWnd = FindWindow('afom', 'Memory Fox');
  			} catch(e) {
  					alert("[ StopMF ] Could not use FindWindow function: "+e);
  			}
  			var n1 = 2;
  			var n2 = 2;
  
  			if( hWnd )
  				SendMessage(hWnd, rMsg, n1, n2);
  			user32dll.close();
  			if (UCCM.afomrunning) {
  			  UCCM.afomrunning = false;
  			  UCCM.initimer();
  			  UCCM.alertSvr.showAlertNotification(null, "UCCM", "afom.exe已经完成清理内存!并已退出！", false, "", null);
  			  this.notifymsg("afom.exe清理已完成！");
  			}
  	},
  	
  	doMFtask: function() {
  	      var canrun = UCCM.GoMF();
      		if (canrun) {
      			UCCM.afomrunning = true;
      			if (UCCM.dotimer) 
      			  window.clearInterval(UCCM.dotimer);
      			window.setTimeout('UCCM.StopMF()',15000);
      		}
  	},
  	
  	clearAllLocalStorage: function (){
      var g_fdLocalStorage_SQLiteDB = CC["@mozilla.org/file/directory_service;1"].getService(CI.nsIProperties).get("ProfD", CI.nsIFile);
      if (g_fdLocalStorage_SQLiteDB == null)
        return;
      g_fdLocalStorage_SQLiteDB.append("webappsstore.sqlite");
      if (g_fdLocalStorage_SQLiteDB == null)
        return;
      var bLocalStorage_SQLiteDB_Exists = g_fdLocalStorage_SQLiteDB.exists();
      if (false == bLocalStorage_SQLiteDB_Exists)
        return;
      var g_dbHandle_LocalStorage = CC["@mozilla.org/storage/service;1"].getService(CI.mozIStorageService);
      if(g_dbHandle_LocalStorage == null) {
      	g_fdLocalStorage_SQLiteDB = null;
        return;
      }
      var g_dbConn_LocalStorage = null;
      try {
        g_dbConn_LocalStorage = g_dbHandle_LocalStorage.openDatabase(g_fdLocalStorage_SQLiteDB);
      } catch(e) {
      	g_fdLocalStorage_SQLiteDB = null;
      	g_dbHandle_LocalStorage = null;
        g_dbConn_LocalStorage = null;
        return;
      }
      if (false == g_dbConn_LocalStorage.connectionReady) {
      	g_fdLocalStorage_SQLiteDB = null;
      	g_dbHandle_LocalStorage = null;
        g_dbConn_LocalStorage = null;
        return;
      }
      var dbDelete_statement = g_dbConn_LocalStorage.createStatement(
                "delete from webappsstore2;");
      dbDelete_statement.execute();
      g_fdLocalStorage_SQLiteDB = null;
      g_dbHandle_LocalStorage = null;
      g_dbConn_LocalStorage = null;
    },
    
    QueryInterface: function(aIID) {
        if (aIID.equals(Components.interfaces.nsIWebProgressListener)   ||
            aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
            aIID.equals(Components.interfaces.nsISupports))
                return this;
        throw Components.results.NS_NOINTERFACE;
    }
  };
  UCCM.init();
  window.UCCM = UCCM;
  
  function addStyle(css) {
  	var pi = document.createProcessingInstruction(
  		'xml-stylesheet',
  		'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
  	);
  	return document.insertBefore(pi, document.documentElement);
  }
  
  function hasRootDomain(str, aDomain) {
    let index = str.indexOf(aDomain);
    if (index == -1)
      return false;
  
    if (str == aDomain)
      return true;
  
    let prevChar = str[index - 1];
    return (index == (str.length - aDomain.length)) &&
           (prevChar == "." || prevChar == "/");
  }
  
  function getFoxVer(){
      var info = Components.classes["@mozilla.org/xre/app-info;1"]
                 .getService(Components.interfaces.nsIXULAppInfo);
      var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
      return ver;
  }
})('\
#UCCM-icon {\
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
#UCCM-icon > .toolbarbutton-icon {\
    padding: 0 !important;\
    margin: 0 !important;\
    border: 0 !important;\
    background-image: none !important;\
    background-color: transparent !important;\
    box-shadow: none !important;\
    -moz-transition: none !important;\
}\
#UCCM-icon:not([disabled="true"]):hover,\
#UCCM-icon:not([disabled="true"])[type="menu"]:hover,\
#UCCM-icon:not([disabled="true"])[open="true"],\
#UCCM-icon:not([disabled="true"])[type="menu"][open="true"] {\
    background-image: -moz-linear-gradient(rgba(242, 245, 249, 0.95), rgba(220, 223, 225, 0.67) 49%, rgba(198, 204, 208, 0.65) 51%, rgba(194, 197, 201, 0.3)) !important;\
}\
#UCCM-icon dropmarker{display: none !important;}\
#UCCM-popup { list-style-image: none !important; padding: 0; margin: 0; -moz-appearance:none; }\
#UCCM-contents {\
	-moz-appearance:none;\
  background-color: #f1f5fb;\
  box-shadow: 1px 0 2px rgb(204,214,234) inset;\
  -moz-padding-start: 3px;\
  -moz-padding-end: 2px;\
  padding-top: 2px;\
  padding-bottom: 2px;\
}\
.item-msg { font-size: 13px; font-weight:bold; color: blue; background-color: yellow;}\
.item-msg:hover { font-size: 16px; font-weight:bold; color: blue; cursor: pointer;}\
.chk-command { font-size: 13px; font-weight: normal; text-decoration: underline; cursor: pointer; margin-left: -8px;}\
.chk-command:hover { font-size: 13px; font-weight: normal;color: #484; text-decoration: underline; cursor: pointer;}\
.chk-commandall { list-style-image: none !important; font-size: 13px; font-weight: bold;color: blue; text-decoration: underline; cursor: pointer;}\
.chk-link { list-style-image: none !important; font-size: 13px; font-weight: normal;}\
.GRPCM { list-style-image: none !important; font-size: 14px; font-weight:bold; }\
.UCCM-msg { font-size: 14px; color: #484; }\
'.replace(/[\r\n\t]/g, ''));

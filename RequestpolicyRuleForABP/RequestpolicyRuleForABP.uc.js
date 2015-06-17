// ==UserScript==
// @name           RequestpolicyRuleForABP.uc.js
// @description    Requestpolicy黑名单法，使用ABP过滤UC脚本
// @author         dannylee
// @namespace      lidanny2012@gmail.com
// @include        main
// @license        MIT License
// @compatibility  Firefox 18-29
// @charset        UTF-8
// @version        1.2.5.6
// @note           1.2.5 2014.4.26Changes for ABP 2.6
// @note           1.2.4 2014.3.28新的透明图标, 移除cjxlist规则, 修复在FF29新定制界面的bugs, Modify for FF29's AddonbarforUC.uc.js
// @note           1.2.3 2014.1.5 合并和移除异步函数处理,添加合并规则忽略白名单开关、修复合并规则不全、元素隐藏规则导入重复BUG, 添加cjxlist规则
// @note           1.2.2 2013.12.31 FIXED bug
// @note           1.2.1 2013.8.13 已生效规则点击禁用对ABP订阅规则也有效
// @note           1.2.1 2013.8.06 malwaredomain、fanboy-social订阅规则的自定义导入，增加订阅规则整体移除功能, 修复元素隐藏规则判断错误的bug
// @note           1.2 2013.5.06 加入easyprivacy和fanboy tracker订阅规则的自定义导入, 自动判断是否重复, 取消查看全部规则，使用ABP规则列表
// @note           1.1 2013.5.05 完善规则导入判定ABP订阅规则中是否有类似规则，加入ghostery BUGS规则导入功能
// @note           1.0 2013.5.03 修复规则导入没有match的BUG
// @note           0.9 2013.4.23 修复BUG, 改到想呕，定稿发布!
// @note           0.8 2013.4.22 加入元素列表，调用ABP Composer, 新建tab打开元素
// @note           0.7 2013.4.22 修改与ABP规则的同步BUG
// @note           0.6 2013.4.21 集成Requestpolicy Deny trackers规则订阅 \chrome\requestpolicy
// @note           0.5 2013.4.20 加强规则列表功能
// @note           0.4 2013.4.19 增加UI功能显现, 取消slider bar
// @note           0.3 2013.4.17 重写核心, 使用ABP API,改名为RequestpolicyRuleForABP.uc.js
// @note           0.2 2013.4.11 UI改写自Requestpolicy Beta 1.0版
// @note           0.1 2012.3.21 Requestpolicylite.uc.js 改自扩展Requestpolicy 0.5.25
// @note           FF 18.0以上版本适用
// @note           需要ABP2.1版本以上，Adblock Edge未测试, Adblock lite无法使用
// @updateURL     https://j.mozest.com/ucscript/script/101.meta.js
// @screenshot    http://j.mozest.com/images/uploads/previews/000/00/01/c4eaa4bc-e18d-306d-9f50-3219ce300c85.jpg http://j.mozest.com/images/uploads/previews/000/00/01/thumb-c4eaa4bc-e18d-306d-9f50-3219ce300c85.jpg
// ==/UserScript==

(function (css) {
	if (window.RPBT) {
	  window.RPBT.uninit();
	  delete window.RPBT;
  }
  const CI = Components.interfaces;
  const CC = Components.classes;
  const Cu = Components.utils;
  const REQUESTPOLICY_DIR = "requestpolicy";
  const DEFAULTPOLICY = "allow";
  const DEFAULT_SUBSCRIPTION_LIST_URL_BASE = 'http://subscription.requestpolicy.com/subs/official/';
  const SUBSCRIPTION_UPDATE_SUCCESS = 'SUCCESS';
  
  Cu.import("resource://gre/modules/XPCOMUtils.jsm");
  Cu.import("resource://gre/modules/Services.jsm");
  
  var EXPORTED_SYMBOLS = ["RPBT"];
  
  var ABPInstalled = false;
  function require(module) {
  	let result = {};
  	result.wrappedJSObject = result;
  	Services.obs.notifyObservers(result, "adblockplus-require", module);
  	return result.exports;
  	if(!result.exports) {
		  // Try Adblock Edge
		  Services.obs.notifyObservers(result, "adblockedge-require", module);
		  if(!result.exports) {
			  return null;
		  }
	  }
  }
  
  if(require("requestNotifier")) {
  	var {Filter, RegExpFilter, BlockingFilter, WhitelistFilter, ElemHideBase} = require("filterClasses");
	  var {FilterNotifier} = require("filterNotifier");
	  var {FilterStorage} = require("filterStorage");
  	var {RequestNotifier} = require("requestNotifier");
  	var {Subscription, SpecialSubscription} = require("subscriptionClasses");
  	var {defaultMatcher} = require("matcher");
  	//var {UI} = require("ui");
  	ABPInstalled = true;
  }
  
  if(ABPInstalled) {
	  var publicURL = Cc["@adblockplus.org/abp/public;1"].getService(Ci.nsIURI);
	  Cu.import(publicURL.spec);
  }
  
  var requestNotifier = null;
  
  let contentTypes = ["OTHER", "SCRIPT", "IMAGE", "STYLESHEET", "OBJECT", "SUBDOCUMENT", "DOCUMENT", "XMLHTTPREQUEST", "OBJECT_SUBREQUEST", "FONT", "MEDIA"];

  
  window.RPBT = {
  	QueryInterface: function(uuid) {
      if (!uuid.equals(Ci.nsISupports)) {
        throw Cr.NS_ERROR_NO_INTERFACE;
      }
      return this;
    },
    
  	_ps:  CC["@mozilla.org/preferences-service;1"].getService(CI.nsIPrefService).getBranch("userChromeJS.RPBT.").QueryInterface(CI.nsIPrefBranch2),
	  _os:  CC["@mozilla.org/observer-service;1"].getService(CI.nsIObserverService),
	  _ios: CC['@mozilla.org/network/io-service;1'].getService(CI.nsIIOService),
    _eTLDService: CC["@mozilla.org/network/effective-tld-service;1"].getService(CI.nsIEffectiveTLDService),
    _idnService: CC["@mozilla.org/network/idn-service;1"].getService(CI.nsIIDNService),
       
  	_blockingDisabled : false, 
  	_isSOP: false,  
  	_cancelWHITE: false,
  	_SHOWABP: true,
  	RPForABPRuleList_UCJS: null,  
  	RPForABPRuleList_UCJS_URL: null,  
  	_needsReloadOnMenuClose: false, 
  	_selfsetfilterdisabled: false,
    _allowedRequests: {},
    _blockedRequests: {},
    _actionsAllRules: {},
    _actionsRules: {}, 
    
    //UI
    _menu : null,
    _originItem : null,
    _allowedDestinationsList : null,
    _blockedDestinationsList : null,
    _addRulesList : null,
    _ABPRulelist : null,
    _ContentLocationList: null,
    _SOPMODE: null,
    _IMPMODE: null,
    _SHOWABPMODE: null,
    _ShowRule: null,
    _SUBTYPE: null,
    allbtn: null,
    actbtn: null,
    rpbtn: null,
    _isready: false,
    _alldata: [],
    _CrDomain: null,
    _Crlocation: null,
    
    _type: {},
    typeDescr: {},
    isbusy : false,
    timer: null,
    subscription: null,
    subscriptionloaded: false,
    ISPOPUP: false,
    //LSOSBUG: null,
    
    init: function(){
    	if (!ABPInstalled) { 
    		Application.console.log("ABP Not Installed!");
    		return;
    	}
    	let iface = Ci.nsIContentPolicy;
      for (let typeName of contentTypes) {
        if ("TYPE_" + typeName in iface)
        {
          let id = iface["TYPE_" + typeName];
          this._type[typeName] = id;
          this.typeDescr[id] = typeName;
        }
      }
      this._type.ELEMHIDE = 0xFFFD;
      this.typeDescr[0xFFFD] = "ELEMHIDE";

      this._type.POPUP = 0xFFFE;
      this.typeDescr[0xFFFE] = "POPUP"; 
      
    	this._isready = false;//addon-bar  urlbar-icons
    	var overlay = '\
      <overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
               xmlns:html="http://www.w3.org/1999/xhtml"> \
          <toolbarpalette id="urlbar-icons">\
               <toolbarbutton id="RPBT-icon" label="Requestpolicy_blocksite" \
                             class="toolbarbutton-1 chromeclass-toolbar-additional" type="menu" removable="true"\
                             image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACZUlEQVQ4ja3SP0gbURwH8O/iIg46OLSKpAQPYmxOe0lPLu2l8a4eeIG6iEhVbLVoS7dsboU0UP9AkjZEEpBY09YIAXWS6FqnJ+rSToKFhqziltDy7SCaWKdCv/DgDe/3+f147wH/JY/QBANhDKCIQQiEIDAEgWEIjEJgHAKTEJiGwAyKmEUYw2iqAQbCzc+aT5wRZ8Udd1NOyvSmvdSyGvWcTiNv0CpYtDdtmhtmpSPacYJZhGvAAIrOiLPS9qaNjqiDnfOd7FroomfJQyWhUE2p9Gf8DKwGaKwbNDfMCl6hWAMGIdxxNx1RB6UFia55F0tnJf6d8nmZwY9BhrZDxEuIGhCCkJPyRef5Lk7mJm8UX0Zf0Wlv2cRsPTAE4U176Vqodfa983EsN8adbzvXAH/aT6tgETP1wDCEltXoWfJcHaz+qvLw5yFH1ka4872GqCmVRt4gXtQDoxB6TqeSUEiS4lQw+D7I5a/LPCodceLTxBWgJBTqOZ2YrgfGIYy8QTWlXhu3/0M/q7+r7FvsI0mWzkqU4zK1rEY8rwcmcGwVLPoz/mvAwY+Dq/3U+hQ9MQ/dMTd9GR8xiuMa8BT79qbNwGqA5fPyjZsvnZUox2R2x7spLUqUkzJhY7/+FfbML2bFWDcYXAtSX9HpT/upplQqCYVyXKY75qa0KF38lahUgRd7NeAx5tpft5+an81KaDtEe8umVbBo5A3qOZ1aVqMv46OclCm9lSotT1pOcQdzl+WNaEAvehDBQ+ziAQQ0CKgQuA8BBQL3INADgbsQcGEXtxAB0AugEQAaALQCuP2PqxVAwx/qWbCIUSY0IQAAAABJRU5ErkJggg==" \
                             tooltiptext="跨站请求扫描已开启" popup="rp-popup"  onclick="RPBT.toggleTemporarilyAllowAll(event);">\
                 <menupopup id="rp-popup" noautohide="true" position="after_start"\
                           onpopupshowing="RPBT.onPopupShowing(event);"\
                           onpopuphiding="RPBT.onPopupHiding(event);">\
                  <vbox id="rp-contents">\
                    <hbox id="rp-main">\
                      <vbox id="rp-origins-destinations">\
                        <label id="rp-origin" class="rp-od-item-domain" tooltiptext="查看全部已生效规则(包含第一方)" onclick="RPBT.addActionRules();" />\
                        <vbox id="rp-allowed-destinations">\
                          <label id="rp-allowed-destinations-title" value="允许的目标" />\
                          <vbox id="rp-allowed-destinations-list" class="rp-label-list"/>\
                        </vbox>\
                      </vbox>\
                      <vbox id="rp-details">\
                          <vbox id="rp-rules-add" />\
                          <spacer flex="1" />\
                          <vbox id="rp-footer">\
                            <hbox id="rp-footer-links">\
                            <p><checkbox id="FilterSCRIPT" label="脚本:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="SCRIPTID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" />\
                            <checkbox id="FilterOBJECT" label="对象:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="OBJECTID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" />\
                            <checkbox id="FilterSUBDOCUMENT" label="框架:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="SUBDOCUMENTID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" />\
                            <checkbox id="FilterDOCUMENT" label="文档:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="DOCUMENTID" class="rp-footer-link" value="" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" /></p>\
                            </hbox>\
                            <hbox id="rp-footer-linkst">\
                            <p><checkbox id="FilterOTHER" label="其它:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="OTHERID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" />\
                            <checkbox id="FilterFONT" label="字体:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="FONTID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" />\
                            <checkbox id="FilterSTYLESHEET" label="样式:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="STYLESHEETID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" />\
                            <checkbox id="FilterIMAGE" label="图片:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="IMAGEID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" /></p>\
                            </hbox>\
                            <hbox id="rp-footer-linkstt">\
                            <p><checkbox id="FilterMEDIA" label="多媒体:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="MEDIAID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" />\
                            <checkbox id="FilterOBJECT_SUBREQUEST" label="插件请求:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="OBJECT_SUBREQUESTID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" />\
                            <checkbox id="FilterXMLHTTPREQUEST" label="XML请求:"  checked="true" tooltiptext="选择过滤, 点击数量查看元素列表" class="rp-footer-link" /><label id="XMLHTTPREQUESTID" class="rp-footer-link" value="0" tooltiptext="查看元素列表" onclick="RPBT.showtypelication(event);" /></p>\
                            </hbox>\
                          </vbox>\
                     </vbox>\
                    </hbox>\
                    <hbox id="rp-footer-rule" width="100%">\
                        <groupbox  id="ALLABPRULE" flex="1" hidden="false" height="200" width="100%"><caption id="GPID" label="ABP跨站请求阻止规则(UC)列表" />\
                         <hbox>\
                         <vbox id="rp-blocked-destinations" width="40%" >\
                          <checkbox id="SHOWABP" checked="true" label="显示ABP订阅规则" class="rp-footer-link" oncommand="RPBT.setSHOWABPmode();"/>\
                          <label id="rp-blocked-destinations-title" value="已阻止的目标" />\
                          <vbox id="rp-blocked-destinations-list" class="rp-label-list" tooltiptext="点击第三方主机列表查看已生效ABP规则" />\
                         </vbox>\
                         <listbox flex="1" id="rp-ABP-add" style="overflow:auto;" seltype="single" width="100%" height="200" disableKeyNavigation="true" >\
                         <listhead  style="font-weight:bold;">\
                            		<listheader label="启用" maxwidth="50"/>\
                            		<listheader label="规则"/>\
                         </listhead>\
                         <listcols  id="listrule" flexible="1">\
                            		<listcol  maxwidth="50"/>\
                            		<listcol  flex="4" />\
                         </listcols>\
                         </listbox>\
                         </hbox>\
                        </groupbox>\
                         <groupbox  id="ALLRPRULE" flex="1"  hidden="true" height="200" width="100%">\
         			             <caption label="订阅规则列表(双击添加到ABP跨站请求阻止规则(UC)列表)" />\
         			             <vbox id="ALLRPRULE" width="100%" height="200" >\
                           <tree id="rulelist-details-tree" flex="1" seltype="single" width="100%" height="200" class="rp-rule-info" ondblclick="RPBT.Ruletree.AddItToABPRule();">\
                     			 <treecols >\
                     				<treecol id="requestpolicy-origin" label="来源" flex="1" crop="center" persist="width ordinal hidden"/>\
                             <splitter class="tree-splitter"/>\
                             <treecol id="requestpolicy-destination" label="目标" flex="1" crop="center" persist="width ordinal hidden"/>\
                             <splitter class="tree-splitter"/>\
                             <treecol id="requestpolicy-blocked" label="类型" width="80" crop="center" persist="width ordinal hidden"/>\
                             <splitter class="tree-splitter"/>\
                     			 </treecols>\
                     			 <treechildren/>\
                           </tree>\
                           <spacer flex="1" />\
                           <radiogroup id="SUBRULETYPE" class="rp-footer-link" oncommand="RPBT.setGHBUGmode();">\
                               <p><radio label="RP-Privacy" id="RPRule" value="0" />\
                                <radio label="GH-BUGS" id="GHBUGSRule" value="1" />\
                                <radio label="Easyprivacy" id="EasyprivacyRule" value="2" />\
                                <radio label="FanboyTracking" id="FanboyRule" value="3" />\
                                <radio label="MalwareDomains" id="malware" value="4" />\
                                <radio label="Fanboy Social" id="Fanboy-Social" value="5" /></p>\
                           </radiogroup>\
                           <p><label id="RPUPDATE" class="rp-footer-link" value="更新RP-Privacy订阅规则" onclick="RPBT.Ruletree.doRPUPDATE();"/>\
                     	     <label value="  "/><label id="RPADDALL" class="rp-footer-link" value="合并RP-Privacy订阅规则到ABP" onclick="RPBT.Ruletree.doADDALLRP();"/>\
                     	     <label value="  "/><label id="RPDELALL" class="rp-footer-link" value="从ABP移除RP-Privacy订阅规则" onclick="RPBT.Ruletree.doDELALLRP();"/>\
                     	     <spacer flex="1" />\
                     	     <checkbox id="CANCELWHITE" checked="false" label="忽略白名单" class="rp-footer-link" oncommand="RPBT.setIMPTmode();"/></p>\
                     	     </vbox>\
                     	   </groupbox>\
                    </hbox>\
                    <hbox id="rp-footer-applay">\
                       <radiogroup id="SHOWALLACTRULE" class="rp-footer-link" oncommand="RPBT.setShowRuleMode();">\
                         <p><radio label="活动的全部规则" id="ShowActionRule" value="1" />\
                         <radio label="其它订阅规则" id="ShowRPRule" value="2" /></p>\
                       </radiogroup>\
                        <label id="totalrule" value="用户规则总数：" tooltiptext="查看用户过滤规则" onclick="RPBT.openABPFiltersDialog(event);" />\
                        <spacer flex="1" />\
                        <checkbox id="USESOP" checked="false" label="使用主机扫描模式(不推荐)" class="rp-footer-link" oncommand="RPBT.setSOPmode();"/>\
                    </hbox>\
                    <hbox id="rp-footer-message">\
                      <label id="RPUPDATEINFO" class="rp-footer-info" value=""/>\
                    </hbox>\
                    <hbox id="rp-footer-location" >\
                      <listbox flex="1" id="rp-ACT-location" style="overflow:auto;" height="150" hidden="true" tooltiptext="双击新标签页打开，右键使用ABP屏蔽" onclick="RPBT.contenttypeclick(event);" ondblclick="RPBT.contenttypeDBclick(event);"/>\
                    </hbox>\
                  </vbox>\
                </menupopup>\
               </toolbarbutton>\
          </toolbarpalette>\
    	</overlay>';
    	if (getFoxVer() >= 29) {
    	  if (window.UCADDONBAR)
    	    overlay.replace('<toolbarpalette id="addon-bar">', '<toolbarpalette id="UC-addon-bar">');
    	  else
    	  	overlay.replace('<toolbarpalette id="addon-bar">', '<toolbarpalette id="nav-bar">');
    	}
      overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
      window.userChrome_js.loadOverlay(overlay, RPBT);
      RPBT.style = addStyle(css);
    },
    
    uninit: function(event) {
      this._ps.removeObserver("", this, false);
      var e = document.getElementById("rp-popup");
  	  if (e) e.parentNode.removeChild(e);
  		var e = document.getElementById("RPBT-icon");
  	  if (e) e.parentNode.removeChild(e);
  	  var e = document.getElementById("requestpolicy-rule");
  	  if (e) e.parentNode.removeChild(e);
  	  var e = document.getElementById("requestpolicy-splitter");
  	  if (e) e.parentNode.removeChild(e);
  	  window.removeEventListener("unload", this, false);
  	  window.removeEventListener("load", this, false);
  	},
  	
  	observe: function(subject, topic, data) {
    	switch (topic) {
    	case "xul-overlay-merged" :
        if (!this._isready) {
            Application.console.log("RequestPolicyRuleForABP界面加载完毕！");
				    this._isready = true;
				    this.icon = document.getElementById("RPBT-icon");
          	
          	this.refreshPrefs();
          	this.style = addStyle(css);
          	this._iniOverloay();
        }
        break;
      case "nsPref:changed" :
        switch (data) {
        	case 'blockingDisabled':
        	  this._blockingDisabled = this._ps.getBoolPref("blockingDisabled");
					  this.refrashService();
            break;
          case 'isSOP':
            this._isSOP = this._ps.getBoolPref("isSOP");
            break; 
          case 'SHOWABP':
            this._SHOWABP = this._ps.getBoolPref("SHOWABP");
            break; 
          case 'cancelWHITE':
            this._cancelWHITE = this._ps.getBoolPref("cancelWHITE");
            break; 
        }
      }  
    },
    
    _iniOverloay: function() {
            this._menu = document.getElementById("rp-popup");
            this._originItem = document.getElementById("rp-origin");
            this._allowedDestinationsList = document.getElementById("rp-allowed-destinations-list");
            this._blockedDestinationsList = document.getElementById("rp-blocked-destinations-list");
            this._addRulesList = document.getElementById("rp-rules-add");
            this._ABPRulelist = document.getElementById("rp-ABP-add");
            this._ContentLocationList = document.getElementById("rp-ACT-location");
            this._SOPMODE = document.getElementById("USESOP");
            this._IMPMODE = document.getElementById("CANCELWHITE");
            this._SHOWABPMODE = document.getElementById("SHOWABP");
            this._ShowRule = document.getElementById("SHOWALLACTRULE");
            this._SUBTYPE = document.getElementById("SUBRULETYPE");
    	      this.actbtn = document.getElementById('ShowActionRule');
    	      this.rpbtn = document.getElementById('ShowRPRule');
            if (this._ShowRule) {
              	this._ShowRule.value = 1;
              	this._ShowRule.selectedItem = this.actbtn;
              	this.actbtn.checked = true;
            }
            if (this._SUBTYPE) {
              	this._SUBTYPE.value = 0;
              	this._SUBTYPE.selectedItem = document.getElementById('RPRule'); 
              	document.getElementById('RPRule').checked = true;
            }
            this._SOPMODE.setAttribute("checked", this._isSOP);
            this._IMPMODE.setAttribute("checked", this._cancelWHITE);
            this._SHOWABPMODE.setAttribute("checked", this._SHOWABP);
      		  this.refrashService();
      		  this._ps.addObserver("", this, false);
            window.addEventListener("unload", this, false);
            this._loadsubscription();
            if (this.subscriptionloaded) {
              RPBT.setShowRuleMode();
              RPBT.Ruletree.init();
            }
    },
  	
  	handleEvent: function( evt ) {
  	  switch(evt.type){
  			case "unload": this.uninit(); break;
  		}
  	},
  	
  	_loadsubscription: function() {
  		if (!this.RPForABPRuleList_UCJS_URL) {
  		  RPBT.subscription = SpecialSubscription.create(this.RPForABPRuleList_UCJS);
        FilterStorage.addSubscription(RPBT.subscription);
        this.RPForABPRuleList_UCJS_URL = RPBT.subscription.url;
        this._ps.setCharPref("RPForABPRuleList_UCJS", this.RPForABPRuleList_UCJS + ":::" + this.RPForABPRuleList_UCJS_URL);
        this._loginfo("ABP跨站请求阻止规则(UC)创建成功！");
        RPBT._addABPListener();
        this.subscriptionloaded = true;
  		} else {
  			try{
  				RPBT.subscription = Subscription.fromURL(this.RPForABPRuleList_UCJS_URL);
  				RPBT._addABPListener();
  				this._loginfo("ABP跨站请求阻止规则(UC)加载成功！");
  				this.subscriptionloaded = true;
  			}catch(e){
  				this._loginfo("ABP跨站请求阻止规则(UC)未加载成功！");
  				this.subscriptionloaded = false;
  			}
  		}
  	},
  	
  	_addABPListener: function(){
  	  let me = RPBT;
      let RPproxy = function() {
           return me._onChange.apply(me, arguments);
      };
      FilterNotifier.addListener(RPproxy);
       window.addEventListener("unload", function() {
          FilterNotifier.removeListener(RPproxy);
         }, false);
  	},
  	
  	_onChange: function(action, item, param1, param2, param3) {
      switch (action) {
        case "filter.disabled": {
        	if (this._selfsetfilterdisabled) {
        	  this._selfsetfilterdisabled = false;
        	  break;
        	}
        	let asubscription = param1;
        	//if (this._ShowRule.selectedItem == this.actbtn)
        	if (asubscription == RPBT.subscription)
          for (let i = 0; i < this._ABPRulelist.itemCount; i++){ 
             var aitem = this._ABPRulelist.getItemAtIndex(i);
             if (aitem.filteritem == item) {
               aitem.getElementsByTagName("checkbox")[0].setAttribute("checked", !item.disabled);
               break;
             }
          }
          break;
        }
        case "filter.removed": {
          let asubscription = param1;
          let position = param2;
          //if (asubscription == RPBT.subscription && this._ShowRule.selectedItem == this.actbtn) 
          if (asubscription == RPBT.subscription)
          for (let i = 0; i < this._ABPRulelist.itemCount; i++){ 
             var aitem = this._ABPRulelist.getItemAtIndex(i);
             if (aitem.filteritem == item) {
             	 this._ABPRulelist.removeChild(aitem);
             	 RPBT._logtotal();
               break;
             }
          }
          break;
        }
      }
    },
    
    setShowRuleMode: function() {
    	if (this._ShowRule.selectedItem == this.actbtn) {
  		   var GRPABP = document.getElementById("ALLABPRULE");
  		   GRPABP.setAttribute('hidden', false);
  		 	 var GRPRP = document.getElementById("ALLRPRULE");
  		   GRPRP.setAttribute('hidden', true);
  		   var GRPAC = document.getElementById("GPID");
  		   GRPAC.setAttribute('label', "活动的全部过滤规则");
  		   this._ABPRulelist.setAttribute('tooltiptext', "单击启用/禁用，双击可删除(对ABP订阅规则无效)");
  		   this.addActionRules();
    	} else if (this._ShowRule.selectedItem == this.rpbtn) {
  		   var GRPRP = document.getElementById("ALLRPRULE");
  		   GRPRP.setAttribute('hidden', false);
  		   var GRPABP = document.getElementById("ALLABPRULE");
  		   GRPABP.setAttribute('hidden', true);
  		   RPBT._logtotal();
    	}
  	},
  	
  	addActionRules: function(amode) {
    	  if (this._ShowRule.selectedItem == this.actbtn ){
    	  	if (typeof amode == "undefined" || amode == "") {
            this._removeChildren(this._ABPRulelist);
            for each(let filterrec in this._actionsAllRules) {
            	for (let j = 0; j < filterrec.actionrule.length; j++) {
            		let filter = filterrec.actionrule[j]; 
            		var item = this._addlistcoltolistitem(filter, "rp-ACrule-info");
            		let i = filter.subscriptions.indexOf(RPBT.subscription);
            		if (i >= 0) {
            		  item.setAttribute("disabled", false);
            		  this._ABPRulelist.appendChild(item);
                  this._ABPRulelist.ensureElementIsVisible(item);
            		} else {
            			if (this._SHOWABP) {
            			  item.setAttribute("disabled", true);
            			  item.getElementsByTagName("checkbox")[0].disabled = true;
            			  this._ABPRulelist.appendChild(item);
                    this._ABPRulelist.ensureElementIsVisible(item);
            			} else 
            				continue;
            	  }
            	}
            }
          } else {
          	if (this._actionsRules[amode]) {
          		this._removeChildren(this._ABPRulelist);
          		for (let j = 0; j < this._actionsRules[amode].actionrule.length; j++) {
            		let filter = this._actionsRules[amode].actionrule[j];
            		var item = this._addlistcoltolistitem(filter, "rp-ACrule-info");
          	    let i = filter.subscriptions.indexOf(RPBT.subscription);
          	    if (i >= 0) {
            		  item.setAttribute("disabled", false);
            		  this._ABPRulelist.appendChild(item);
                  this._ABPRulelist.ensureElementIsVisible(item);
            		} else {
            			if (this._SHOWABP) {
            			  item.setAttribute("disabled", true);
            			  item.getElementsByTagName("checkbox")[0].disabled = true;
            			  this._ABPRulelist.appendChild(item);
                    this._ABPRulelist.ensureElementIsVisible(item);
            			} else 
            				continue;
            	  }
            	}
          	}
          }
    	  }
    },
  	
  	_addlistcoltolistitem: function(afilter, cssData) {
  		      var newListItem = document.createElement("listitem");
  		      var newCell1 = document.createElement("listcell"); 
        		var newCell2 = document.createElement("listcell");
        		var chk1 = document.createElement("checkbox");
        		var lab1 = document.createElement("label");
        		chk1.setAttribute("checked",!afilter.disabled);
        		lab1.setAttribute("value",afilter.text);
        		chk1.setAttribute("onclick", "RPBT.actruleclick(event);");
        		chk1.setAttribute("onfocus", "RPBT.onfocus(event);");
        		lab1.setAttribute("ondblclick", "RPBT.ACTruledbclick(event);");
        		lab1.setAttribute("onfocus", "RPBT.onfocus(event);");
        		newCell1.appendChild(chk1);
        		newCell2.appendChild(lab1);
        		newListItem.appendChild(newCell1);
        		newListItem.appendChild(newCell2);
        		newListItem.allowEvents = true;
        		newListItem.setAttribute("class", cssData);
        		newListItem.filteritem = afilter;
        		newListItem.setAttribute("value",afilter.text);
        		return newListItem;
  	},
  	
  	onfocus: function(event) {
  		if (event.button != 0) return;
  		var parentItem = this.parentNode.parentNode;
  		if (parentItem.parentNode.selectedItem != parentItem)
  			parentItem.parentNode.selectedItem = parentItem;
  	},
  	
    actruleclick: function(event) {
    	if (event.button != 0) return;
      var item = this._ABPRulelist.selectedItem;
      if (!item) return;
      var enabled = !item.getElementsByTagName("checkbox")[0].checked;
      if (item.disabled) {
      	item.getElementsByTagName("checkbox")[0].checked = enabled;
      	item.filteritem.disabled = !enabled;
      	this._needsReloadOnMenuClose = true;
      	this._loginfo("设置订阅规则状态:" + enabled + ", 关闭弹出菜单将自动刷新!");
      	return;
      }
      var iteminx = -1;
      do
      {
        iteminx = RPBT.subscription.filters.indexOf(item.filteritem, iteminx + 1);
        if (iteminx >= 0) {
          break;
        }
      } while (iteminx >= 0);
      //this._loginfo(enabled + ":" + iteminx);
      if (iteminx >= 0)
      try{
      	  if (RPBT.subscription.filters[iteminx] && RPBT.subscription.filters[iteminx] == item.filteritem) {
            this._selfsetfilterdisabled = true;
            RPBT.subscription.filters[iteminx].disabled = !enabled;
            this._needsReloadOnMenuClose = true;
            this._loginfo("设置规则状态:" + enabled + ", 关闭弹出菜单将自动刷新!");
          }
      } catch(e) { this._loginfo("设置启用状态失败" + e); }
    },
  	
    ACTruledbclick: function(event) { //
    	if (event.button != 0) return;
      var item = this._ABPRulelist.selectedItem;
      if (!item) return;
      if (item.disabled) return;
      var afilter = null;
      try{
        afilter = item.filteritem;
        FilterStorage.removeFilter(afilter, RPBT.subscription);
        //this._ABPRulelist.removeChild(this._ABPRulelist.selectedItem);
        this._needsReloadOnMenuClose = true;
        this._loginfo("删除成功！, 关闭弹出菜单将自动刷新!");
      } catch(e) { this._loginfo("删除失败！" + e); }
    },
  	
  	_examineCrossSite: function(node, item, scanComplete) {
      	var re = {
    			    docDomain : item.docDomain,
    			    location : item.location,
    			    typename : item.type,
    			    filter : item.filter,
    			    orig : item,
    			    nodes : [node],
    			    thirdParty : item.thirdParty
  		      };
      	this._alldata.push(re);
    },
    
    //for UI
    onPopupShowing : function(event) {
    	this.ISPOPUP = true;
    	if (this.subscriptionloaded) {
    	  this.prepareNode();
    	  //for ABP2.6
    	  if (RPBT.subscription.filters.length == 0)
    	    RPBT.subscription = Subscription.fromURL(this.RPForABPRuleList_UCJS_URL);//end
    	  RPBT._logtotal();
      }
    },
    
    prepareNode : function() {
    	if (this._blockingDisabled) return;
    	let cwin = this._getFocusedWindow();
    	var curl = cwin.content.document.location.href;
    	//if (curl == this._Crlocation && !this._needsReloadOnMenuClose) return;
    	var aDomain= cwin.content.document.domain;
    	//if (!aDomain || aDomain == "") return;
    	if (this._needsReloadOnMenuClose)
    	  this._needsReloadOnMenuClose = false;
    	this._alldata = [ ];
    	this._populateMenuForUncontrollableOrigin();
    	if (curl.substring(0,4) != "http") return;
      this._Crlocation = cwin.content.document.location.href;
      
    	aDomain = cwin.content.document.location;
    	aDomain = this.getDomain(aDomain);
    	this._CrDomain = aDomain;
    	this._originItem.setAttribute('value', aDomain);
      if (requestNotifier)
          requestNotifier.shutdown();
      this.isbusy = true;
      requestNotifier = new RequestNotifier(cwin.content, function(wnd, node, item, scanComplete) {
        if (item)
          window.RPBT._examineCrossSite(node, item, scanComplete);
        if (scanComplete) 
          window.RPBT.isbusy = false;
       });
      this.timer = window.setTimeout(function() { if(!RPBT.isbusy) { RPBT.prepareMenu();}}, 300);
    },
    
    prepareMenu : function() {
    	if (!this.subscriptionloaded) return;
    	  if (this.timer) {
    		  requestNotifier = null;
          window.clearTimeout(this.timer);
          this.timer = null;
        }
        this._allowedRequests = {};
        this._blockedRequests = {};
        this._actionsAllRules = {};
        this._actionsRules = {};
        for(var i = 0; i < this._alldata.length; i++) {
        	var afilter = this._alldata[i].filter;
        	var maindomain = this._alldata[i].docDomain;
        	if (afilter) {
        		if (!this._actionsAllRules[maindomain]) {
        			var rlqres = {
            				  docDomain : maindomain,
            				  actionrule : []
            	}
            	this._actionsAllRules[maindomain] = rlqres;
            	this._actionsAllRules[maindomain].actionrule.push(afilter);
        		} else {
        		  var qindex = -1;
      	  		var qtag = false;
              do
              {
                qindex = this._actionsAllRules[maindomain].actionrule.indexOf(afilter, qindex + 1);
                if (qindex >= 0) {
                  qtag = true;
                  break;
                }
              } while (qindex >= 0);
      	  		if (!qtag) 
      	  		  this._actionsAllRules[maindomain].actionrule.push(afilter);
        		}
        	}
        	if (this._alldata[i].thirdParty) {
            	var typeid = this._alldata[i].typename;
            	var tyname = this.typeDescr[typeid];
            	if (tyname == "ELEMHIDE" || tyname == "POPUP" || !tyname) 
            	  continue;
            	var label = this._alldata[i].location;
            	if (label.substring(0,4) != "http") continue;
            	if (!this.isValidUri(label)) continue;
            	if (this._isSOP)
            	  var dm = this.getHost(label);
            	else
            	  var dm = this.getDomain(label);
            	
          		try{
            		if (!this._allowedRequests[dm] && !afilter) {
            			var res = {
            				docDomain : dm,
            				OTHER : [],
            				SCRIPT : [],
            				IMAGE : [],
            				STYLESHEET : [],
            				OBJECT : [],
            				SUBDOCUMENT : [],
            				DOCUMENT : [],
            				XMLHTTPREQUEST : [],
            				OBJECT_SUBREQUEST : [],
            				FONT : [],
            				MEDIA : []
            			}
            			this._allowedRequests[dm] = res;
            			this._allowedRequests[dm][tyname].push(label);
            		}else if (this._allowedRequests[dm] && !afilter) {
            			this._allowedRequests[dm][tyname].push(label);
            		}
            		if (!this._blockedRequests[dm] && afilter) {
            			var rest = {
            				docDomain : dm,
            				OTHER : [],
            				SCRIPT : [],
            				IMAGE : [],
            				STYLESHEET : [],
            				OBJECT : [],
            				SUBDOCUMENT : [],
            				DOCUMENT : [],
            				XMLHTTPREQUEST : [],
            				OBJECT_SUBREQUEST : [],
            				FONT : [],
            				MEDIA : []
            			}
            			this._blockedRequests[dm] = rest;
            			this._blockedRequests[dm][tyname].push(label);
            		}else if (this._blockedRequests[dm] && afilter) {
            			this._blockedRequests[dm][tyname].push(label);
            		}
            	  if (afilter){
            	  	if (!this._actionsRules[dm]) {
            	  	  var rlres = {
            				  docDomain : dm,
            				  actionrule : []
            			  }
            			  this._actionsRules[dm] = rlres;
            			  this._actionsRules[dm].actionrule.push(afilter);
            	  	} else {
            	  		var aindex = -1;
            	  		var atag = false;
                    do
                    {
                      aindex = this._actionsRules[dm].actionrule.indexOf(afilter, aindex + 1);
                      if (aindex >= 0) {
                        atag = true;
                        break;
                      }
                    } while (aindex >= 0);
            	  		if (!atag) 
            	  		  this._actionsRules[dm].actionrule.push(afilter);
            	  	}
            	  }
          	  }catch(e){}
          }
        	
        }
        this.addhostmenu();
        this.addActionRules();
        this._ContentLocationList.setAttribute("hidden", "true");
    },
    
    addhostmenu: function() {
    	document.getElementById('rp-allowed-destinations').hidden = true;
      for each(let item in this._allowedRequests) {
        	var menulb = item.docDomain;
          this._addListItem(this._allowedDestinationsList, 'rp-od-item', menulb);
      }
      document.getElementById('rp-allowed-destinations').hidden = false;
      for each(let item in this._blockedRequests) {
        	var menulb = item.docDomain;
          this._addListItem(this._blockedDestinationsList, 'rp-stop-rule', menulb);
      }
    },
    
    onPopupHiding : function(event) {
    	this.ISPOPUP = false;
    	if (!this.subscriptionloaded) return;
    	this._ContentLocationList.setAttribute("hidden", "true");
      if (this._needsReloadOnMenuClose) {
      	    RPBT.reloadcontent();
      }
    },
    
    reloadcontent: function(event) {
            BrowserReloadSkipCache();
    },
    
    refreshPrefs: function() {
      if (!this._ps.prefHasUserValue("blockingDisabled")) {
          this._ps.setBoolPref("blockingDisabled",false);
      }
      this._blockingDisabled = this._ps.getBoolPref("blockingDisabled");
      if (!this._ps.prefHasUserValue("isSOP")) {
          this._ps.setBoolPref("isSOP",false);
      }
      this._isSOP =  this._ps.getBoolPref("isSOP");
      
      if (!this._ps.prefHasUserValue("cancelWHITE")) {
          this._ps.setBoolPref("cancelWHITE",false);
      }
      this._cancelWHITE =  this._ps.getBoolPref("cancelWHITE");
      
      if (!this._ps.prefHasUserValue("SHOWABP")) {
          this._ps.setBoolPref("SHOWABP",true);
      }
      this._SHOWABP =  this._ps.getBoolPref("SHOWABP");
      
      if (this._ps.prefHasUserValue("RPForABPRuleList_UCJS")) { 
      	var thelist = [ ];
      	thelist = this._ps.getCharPref("RPForABPRuleList_UCJS").split(":::");
      	this.RPForABPRuleList_UCJS = thelist[0].trim();
      	this.RPForABPRuleList_UCJS_URL = thelist[1].trim();
      } else {
      	this.RPForABPRuleList_UCJS = "ABP跨站请求阻止规则(UC)";
      	this.RPForABPRuleList_UCJS_URL = null;
      }
  	},
	
  	refrashService: function() {
  		this._blockingDisabled = this._ps.getBoolPref("blockingDisabled");
  		if (this._blockingDisabled) {
  			   this.icon.setAttribute("tooltiptext", "跨站请求扫描已禁用");
           this.icon.setAttribute("image", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACaklEQVQ4ja3Qz0rrQBQG8Nl0I25ciHBBQQP+QbGVYqkQbCtaSda+gYukYIPtlATupC0MMWinMNL0XYTq2tUouFUqPkDoPih8d2VKr6sL94OBYZjzO2eGkP+R7e3t+Ww2S3O53Cifz6tCoaCKxaLSdV2VSiVVqVTU8fGxqlaryjCMkWEYtFwuz6dANpulpmmOLctKKKXwPA++74NzjjAMIYSAlBKDwQBCiMSyrLFhGDQFcrncyLKs5Pz8HLZt4+LiAo7joNFowHVdMMbQ7XYRBAF6vR76/X5imuYoBfL5vKKUwrZt1Ot11Ot1xHGMvzOZTHB1dYXhcAjTNFUKFAoF5Xle2vn29vZH8Xc454iiCIZhTIFisah834fjOGnny8tLSCnx9PQ0A3Q6HUgpZwFd1xXnHI1GI734+fmJ8XiMfr+P5+fn9JwxBiEETk9Pp0CpVFJhGMJ1XQDA6+srGGO4u7vD+/v7zJNc10UYhqhWq1OgUqkoIQQYYzPj+r6Pr68vUEoBAHEco9VqgXOOk5OTKXB0dPQipUS3250B3t7e0n0URaCUotlsot1u4/Dw8CUFyuXy42AwQBAEmEwmP34+jmNQSkEpheM48DwP+/v7jylwcHDwcHNzk/R6PYRhCM45Op0OGGNwXRetVgvNZhOO48C2bdRqtUTTtIcU2N3d/X12dvZxfX2dDIdDRFEEKSWEECnYbrfheR5qtVqi6/rH0tLS7+/6uUwms7e6uhrs7Ozcb21tqc3NTbWxsaHW19eVpmlK0zS1tramVlZW1PLy8v3CwkJACNkjhMwRQkiGELJICPn1j2uREJL5A+sW6gFbG/CRAAAAAElFTkSuQmCC");
  		     Application.console.log("跨站请求扫描已禁用!");
  		} else {
  			   this.icon.setAttribute("tooltiptext", "跨站请求扫描已开启");
           this.icon.setAttribute("image", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACZUlEQVQ4ja3SP0gbURwH8O/iIg46OLSKpAQPYmxOe0lPLu2l8a4eeIG6iEhVbLVoS7dsboU0UP9AkjZEEpBY09YIAXWS6FqnJ+rSToKFhqziltDy7SCaWKdCv/DgDe/3+f147wH/JY/QBANhDKCIQQiEIDAEgWEIjEJgHAKTEJiGwAyKmEUYw2iqAQbCzc+aT5wRZ8Udd1NOyvSmvdSyGvWcTiNv0CpYtDdtmhtmpSPacYJZhGvAAIrOiLPS9qaNjqiDnfOd7FroomfJQyWhUE2p9Gf8DKwGaKwbNDfMCl6hWAMGIdxxNx1RB6UFia55F0tnJf6d8nmZwY9BhrZDxEuIGhCCkJPyRef5Lk7mJm8UX0Zf0Wlv2cRsPTAE4U176Vqodfa983EsN8adbzvXAH/aT6tgETP1wDCEltXoWfJcHaz+qvLw5yFH1ka4872GqCmVRt4gXtQDoxB6TqeSUEiS4lQw+D7I5a/LPCodceLTxBWgJBTqOZ2YrgfGIYy8QTWlXhu3/0M/q7+r7FvsI0mWzkqU4zK1rEY8rwcmcGwVLPoz/mvAwY+Dq/3U+hQ9MQ/dMTd9GR8xiuMa8BT79qbNwGqA5fPyjZsvnZUox2R2x7spLUqUkzJhY7/+FfbML2bFWDcYXAtSX9HpT/upplQqCYVyXKY75qa0KF38lahUgRd7NeAx5tpft5+an81KaDtEe8umVbBo5A3qOZ1aVqMv46OclCm9lSotT1pOcQdzl+WNaEAvehDBQ+ziAQQ0CKgQuA8BBQL3INADgbsQcGEXtxAB0AugEQAaALQCuP2PqxVAwx/qWbCIUSY0IQAAAABJRU5ErkJggg==");
           Application.console.log("跨站请求扫描已开启!");
  		};
  		return;
  	},
  	
  	setSOPmode: function() {
  		this._isSOP = this._SOPMODE.checked ? true : false;
  	  this._ps.setBoolPref("isSOP",this._SOPMODE.checked);
  	  this._removeChildren(this._allowedDestinationsList);
  	  this._removeChildren(this._blockedDestinationsList);
      this._removeChildren(this._addRulesList);
      if (this._ShowRule.selectedItem == this.actbtn ) 
        this._removeChildren(this._ABPRulelist);
      //document.getElementById('rp-allowed-destinations').hidden = true;
      this._populatecheck();
      this.prepareMenu();
  	},
  	
  	setIMPTmode: function() {
  		this._cancelWHITE = this._IMPMODE.checked ? true : false;
  	  this._ps.setBoolPref("cancelWHITE",this._IMPMODE.checked);
  	},
  	
  	setSHOWABPmode: function() {
  		this._SHOWABP = this._SHOWABPMODE.checked ? true : false;
  	  this._ps.setBoolPref("SHOWABP",this._SHOWABPMODE.checked);
      if (this._ShowRule.selectedItem == this.actbtn ) 
        this._removeChildren(this._ABPRulelist);
      this.addActionRules();
  	},
  	
  	toggleTemporarilyAllowAll : function(event) {
  		if (event.target == this.icon && event.button == 1) {
        var disabled = !this._blockingDisabled;
        this.setBlockingDisabled(disabled);
      }
    },
    
    setBlockingDisabled : function(disabled) {
    	this._blockingDisabled = disabled;
      this._ps.setBoolPref('blockingDisabled', disabled);
    },
    
    makeURI: function(/**String*/ uri) /**nsIURI*/ {
      try
      {
        return this._ios.newURI(uri, null, null);
      }
      catch (e) {
        return null;
      }
    },
    
    getUriObject: function(uri) {
    	if (!(uri instanceof Ci.nsIURI))
        uri = this.makeURI(uri);
      if (uri instanceof Ci.nsINestedURI)
        return uri.innermostURI;
      else
        return uri;
    },
    
    isValidUri: function(uri) {
      try {
        this.getUriObject(uri);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    getDomain: function(uri) {
      var host = this.getHost(uri);
      try {
        var baseDomain = this._eTLDService.getBaseDomainFromHost(host, 0);
        return this._idnService.convertToDisplayIDN(baseDomain, {});
      } catch (e) {
        if (e.name == "NS_ERROR_HOST_IS_IP_ADDRESS") {
          return host;
        } else if (e.name == "NS_ERROR_INSUFFICIENT_DOMAIN_LEVELS") {
          return host;
        } else {
          throw e;
        }
      }
    },
    
    getHost: function(uri) {
    	try {
    		return this.getUriObject(uri).host;
      } catch (e) {
    	  return null;
      }
    },
    
    _getFocusedWindow: function(){
      var focusedWindow = document.commandDispatcher.focusedWindow;
      if (!focusedWindow || focusedWindow == window)
          return window.content;
      else
          return focusedWindow;
    },
    
    _populateMenuForUncontrollableOrigin : function() {
      this._originItem.setAttribute('value', '没有来源');
      this._removeChildren(this._allowedDestinationsList);
      this._removeChildren(this._blockedDestinationsList);
      this._removeChildren(this._addRulesList);
      if (this._ShowRule.selectedItem == this.actbtn ) 
        this._removeChildren(this._ABPRulelist);
      this._populatecheck();
      this._ContentLocationList.setAttribute("hidden", "true");
    },
    
    _populatecheck: function() {
      for (let typeName of contentTypes) {
      	let countitem = document.getElementById(typeName+"ID");
      	let typeitem = document.getElementById("Filter"+typeName);
        if (countitem) {
          countitem.setAttribute('value', 0);
          countitem.setAttribute('checked', true);
          countitem.setAttribute('hidden', true);
          typeitem.setAttribute('hidden', true);
        }
      }
    },
    
    _removeChildren : function(el) {
    	if (el == this._ABPRulelist) {
    		for (var i= el.getRowCount() - 1; i>=0; i--) {
		          el.removeItemAt(i);
	      }
    	} else {
    	  while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
      }
    },
    
    _addListItem : function(list, cssClass, value) { //tooltiptext
      var item = document.createElement("label");
      item.setAttribute("id", value);
      item.setAttribute("value", value);
      item.setAttribute("class", cssClass);
      item.setAttribute("onclick", 'RPBT.itemSelected(event);');
      list.insertBefore(item, null);
      return item;
    },
    
    itemSelected : function(event) {
      var item = event.target;
      if (item.parentNode.id == 'rp-allowed-destinations-list') {
        this._activateDestinationItem(item);
      } else if (item.parentNode.id == 'rp-blocked-destinations-list') {
        this._activateblockedItem(item);
      } else if (item.parentNode.id == 'rp-rules-add') {
      	event.preventDefault();
        this._processRuleSelection(item);
      } 
    },
    
    _activateDestinationItem: function(item) {
    	var dm = item.value;
      var rec = {};
      rec = this._allowedRequests[dm];
      this._setchecknum(rec);
      this._removeChildren(this._addRulesList);
      var denyall = "→阻止所有站点到" + rec.docDomain + "的第三方请求";
      var itemA = this._addListItem(this._addRulesList, 'rp-start-rule', denyall);
      itemA.requestpolicyFrom = "allsite";
      itemA.requestpolicyThird = rec.docDomain;
      var denyfor = "→阻止所有从 " + this._CrDomain + " 到 " + rec.docDomain + "的第三方请求";
      var itemF = this._addListItem(this._addRulesList, 'rp-start-rule', denyfor);
      itemF.requestpolicyFrom = this._CrDomain;
      itemF.requestpolicyThird = rec.docDomain;
      var denyjust = "→仅允许从 " + this._CrDomain + " 到 " + rec.docDomain + "的第三方请求";
      var itemL = this._addListItem(this._addRulesList, 'rp-start-rule', denyjust);
      itemL.requestpolicyFrom = this._CrDomain;
      itemL.requestpolicyThird = rec.docDomain;
      itemL.requestpolicyallow = this._CrDomain;
      this.addActionRules(rec.docDomain);
      this._ContentLocationList.setAttribute("hidden", "true");
    },
    
    _activateblockedItem: function(item) {
    	var dm = item.value;
      var rec = {};
      rec = this._blockedRequests[dm];
      this._setchecknum(rec);
      this._removeChildren(this._addRulesList);
      this.addActionRules(rec.docDomain);
      this._ContentLocationList.setAttribute("hidden", "true");
    },
    
    _processRuleSelection: function(item) {
    	var athird = "";
    	athird = this._populateThirdcheck();
    	if (athird == "") {
    		this._loginfo("没有选择过滤的内容！");
    		return;
    	}
    	var Fitem = item.requestpolicyFrom;
    	var Titem = item.requestpolicyThird;
    	if (Fitem == "allsite") {
    		var filtertext = "||" + Titem + "^" + athird;
    	} else {
    		if (!item.requestpolicyallow){
    		  var filtertext = "||" + Titem + "^" + athird + ",domain=" + Fitem;
    		  var nofiltertext =  "||" + Titem + "^" + athird + ",domain=~" + Fitem;
    		} else {
    			var filtertext = "||" + Titem + "^" + athird + ",domain=~" + Fitem;
    			var nofiltertext = "||" + Titem + "^" + athird + ",domain=" + Fitem;
    		}
    	}
    	try {
    		if (filtertext.indexOf("domain=") != -1) {
           var newnofilter = Filter.fromText(nofiltertext);
           if (this._filterisexit(newnofilter)) {
             this._loginfo("逻辑相反规则已存在，添加失败!");
             return;
           }
        }
        var newfilter = Filter.fromText(filtertext);
        if (!this._filterisexit(newfilter)) {
          FilterStorage.addFilter(newfilter, RPBT.subscription);
          RPBT._needsReloadOnMenuClose = true;
          delete this._allowedRequests[Titem];
          this._removeChildren(this._allowedDestinationsList);
          this._removeChildren(this._blockedDestinationsList);
          document.getElementById('rp-allowed-destinations').hidden = true;
          this._populatecheck();
          this.addhostmenu();
          this._ContentLocationList.setAttribute("hidden", "true");
          this._loginfo("RP用户规则已添加到ABP! 关闭弹出菜单将自动刷新!");
        } else {
        	this._loginfo("RP用户规则规则已存在！！!");
        }
      }catch(e){
        this._loginfo("添加不成功!" + e); 
      }
    },
    
    _AddABPtextfilter: function(afilter) {
      var filtertext = afilter;
      var tagidx = filtertext.indexOf("^$");
      if (tagidx > 2) {
        var shtext = filtertext.substring(0, tagidx);
        var shfiltertext = this.formatfiltertext(shtext);
        try{
          var newshfilter = Filter.fromText(shfiltertext);
          if (this._filterisexit(newshfilter)) {
        	  return 1;
          }
        } catch(e) {}
      } else {
        var shfiltertext = this.formatfiltertext(filtertext);
        try{
          var newshfilter = Filter.fromText(shfiltertext);
          if (this._filterisexit(newshfilter)) {
        	  return 1;
          }
        } catch(e) {}
      }
      try {
        var newfilter = Filter.fromText(filtertext);
        if (!this._filterisexit(newfilter)) {
          FilterStorage.addFilter(newfilter, RPBT.subscription);
          return 0;
        } else { 
        	return 1;
        }
      }catch(e){
      	return 2;
      }
    },
    
    formatfiltertext: function(atext) {
    	var filtertext = atext;
    	if (filtertext.substring(0, 1) != "|")
    	  return  filtertext;
    	var tagidx = atext.indexOf("^$"); 
    	if (tagidx != -1)
    	  return  filtertext;
    	else {
    	  var strlen = filtertext.length;
        var taglast = filtertext.substring(strlen-1);
        if (taglast == "?" || taglast == "/" || taglast == "^" || taglast == "*" || taglast == ".") {
          filtertext = filtertext.substring(0, strlen-1);
          return  filtertext;
        } else
        	return  filtertext;
    	}
    },
    
    _DELABPtextfilter: function(afilter) {
      var filtertext = afilter;
      try {
        var newfilter = Filter.fromText(filtertext);
        if (this._filterisexit(newfilter)) {
          FilterStorage.removeFilter(newfilter, RPBT.subscription);
          return 0;
        } else { 
        	return 1;
        }
      }catch(e){
      	return 2;
      }
    },
    
    _populateThirdcheck: function() {
    	var result = "";
    	var athirdpard = "$";
    	var exthirdpard = "$";
    	
    	var allcheck = 0;
    	var excheck = 0;
    	var canblcok = 0;
      for (let typeName of contentTypes) {
      	canblcok = canblcok +1;
      	let countitem = document.getElementById("Filter" + typeName);
      	if (countitem.hidden) continue;
        if (countitem.checked) {
        	allcheck = allcheck + 1;
        	if (allcheck > 1)
            athirdpard = athirdpard + "," + typeName;
          else
          	athirdpard = athirdpard + typeName;
        } else {
        	excheck = excheck + 1;
        	if (excheck > 1)
        	  exthirdpard = exthirdpard + ", ~" + typeName;
        	else
        		exthirdpard = exthirdpard + "~" + typeName;
        }
      }
      if (excheck == 0) {
      	result = "$third-party";
      } else if (excheck >= canblcok) {
      	result = "";
      } else if (allcheck >= excheck) {
      	result = exthirdpard + ",third-party";
      } else if (allcheck < excheck) {
      	result = athirdpard + ",third-party";
      }
      return result;
    },
    
    _setchecknum: function(res) {
    	var resrec = {};
    	resrec = res;
      for (let typeName of contentTypes) {
      	let countitem = document.getElementById(typeName+"ID");
      	let typeitem = document.getElementById("Filter"+typeName);
        if (countitem) {
          countitem.setAttribute('value', resrec[typeName].length);
          if (countitem.value > 0) {
          	countitem.locationobj = resrec[typeName];
            countitem.setAttribute('hidden', false);
            typeitem.setAttribute('hidden', false);
          } else {
          	countitem.locationobj = null;
          	countitem.setAttribute('hidden', true);
            typeitem.setAttribute('hidden', true);
          }
        }
      }
    },
    
    _filterisexit: function(afilter) {
    	var isexit = false;
    	isexit = defaultMatcher.hasFilter(afilter);
    	if (!isexit) {
      	let iteminx = -1;
        do
        {
          iteminx = RPBT.subscription.filters.indexOf(afilter, iteminx + 1);
          if (iteminx >= 0) 
          	isexit = true;
        } while (iteminx >= 0);
      }
      return isexit;
    },
    
    showtypelication: function(event) {
       if (event.button != 0 || !event.target.locationobj)
         return;
       var lclist = [];
       var typename = event.target.id;
       var inx = typename.indexOf("ID");
       typename = typename.substring(0, inx)
       var typeid = this._type[typename];
       lclist = event.target.locationobj;
       var aloc = "";
       this._removeChildren(this._ContentLocationList);
       for (var i= 0; i < lclist.length; i++) {
       	 aloc = lclist[i];
         var item = this._ContentLocationList.appendItem(aloc, aloc);
         item.setAttribute("class", "rp-ACrule-info");
         item.typeid = typeid;
       }
       this._ContentLocationList.setAttribute("hidden", "false");
    },
    
    contenttypeclick: function(event) {
      if (event.button != 2 || this._ContentLocationList.selectedIndex == -1 )
        return;
      var item = event.target;
      if (event.button == 2) {
        var typeid = item.typeid;
        var lcurl = item.value;
        for(var i = 0; i < this._alldata.length; i++) {
          var stypeid = this._alldata[i].typename;
        	if (stypeid == 0xFFFD || stypeid == 0xFFFE) 
        	  continue;
        	var alabel = this._alldata[i].location;
        	if (lcurl ==alabel && typeid == stypeid) {
        		openDialog("chrome://adblockplus/content/ui/composer.xul", "_blank", "chrome,centerscreen,resizable,dialog=no,dependent", this._alldata[i].nodes, this._alldata[i].orig);
        	  break;
        	}
        }
      }
    },
    
    contenttypeDBclick: function(event) {
      if (event.button != 0 || this._ContentLocationList.selectedIndex == -1 )
        return;
      var item = event.target;
      if (event.button == 0)
        window.openNewTabWith(item.value, window.gBrowser.contentDocument, null, event, false);
    },
    
    getRPUserDir : function() {
      var profileDir = CC["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("UChrm", CI.nsIFile);
      var file = profileDir.clone().QueryInterface(CI.nsILocalFile);
      file.appendRelativePath("UCProfileDir");
      file.appendRelativePath(REQUESTPOLICY_DIR);
      if(!file.exists()) {
        file.create(CI.nsIFile.DIRECTORY_TYPE, 0700);
      }
      return file;
    },
    
    loadRawPolicyFromFile : function() {
    	    var filename = "deny_trackers.json";
          var policyFile = RPBT.getRPUserDir();
          policyFile.appendRelativePath(filename);
          if (policyFile.exists()) {
            var str = RPBT.fileToString(policyFile);
            var rawPolicy = new RawPolicy(str);
            return rawPolicy;
          } else 
          	return null;
    },
    
    loadGHBUGFromFile : function() {
    	    var filename = "ghostery-bugs.json";
          RPBT.Ruletree.GHFiles = RPBT.getRPUserDir();
          RPBT.Ruletree.GHFiles.appendRelativePath(filename);
          if (RPBT.Ruletree.GHFiles.exists()) {
            var str = RPBT.fileToString(RPBT.Ruletree.GHFiles);
            return str;
          } else 
          	return null;
    },
    
    saveRawPolicyToFile : function(policy) {
    	    var filename = "deny_trackers.json";
          var policyFile = RPBT.getRPUserDir();
          policyFile.appendRelativePath(filename);
          RPBT.stringToFile(JSON.stringify(policy), policyFile);
    },
    
    fileToString : function(file) {
      var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
          .createInstance(Components.interfaces.nsIFileInputStream);
      stream.init(file, 0x01, 0444, 0);
      stream.QueryInterface(Components.interfaces.nsILineInputStream);
      
      var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
                    createInstance(Components.interfaces.nsIConverterInputStream);
      cstream.init(stream, "UTF-8", 0, 0);
      
      var str = "";
      var data = {};
      do { 
        read = cstream.readString(0xffffffff, data);
        str += data.value;
      } while (read != 0);
      cstream.close(); 
      return str;
    },
    
    stringToFile : function(str, file) {
      var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
          .createInstance(Components.interfaces.nsIFileOutputStream);
      stream.init(file, 0x02 | 0x08 | 0x10 | 0x20, -1, 0);
  
      var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
          .createInstance(Components.interfaces.nsIConverterOutputStream);
      cos.init(stream, "UTF-8", 4096, 0x0000);
      cos.writeString(str);
      cos.close();
      stream.close();
    },
    
    _ruleDataPartToDisplayString : function(ruleDataPart) {
      var str = "";
      if (ruleDataPart["s"]) {
        str += ruleDataPart["s"] + "://";
      }
      str += ruleDataPart["h"] ? ruleDataPart["h"] : "*";
      if (ruleDataPart["port"]) {
        str += ":" + ruleDataPart["port"];
      }
      return str;
    },
    
    _loginfo: function(atext) {
    	document.getElementById("RPUPDATEINFO").value = atext;
    },
    
    _logtotal: function() {
      document.getElementById("totalrule").value = "用户过滤规则总数：" + RPBT.subscription.filters.length.toString();
    },
    
    setGHBUGmode: function() {
    	if (this._SUBTYPE.selectedItem == document.getElementById("GHBUGSRule")) {
    		document.getElementById("RPUPDATE").value = "更新ghostery-Bugs规则";
    		document.getElementById("RPADDALL").value = "合并ghostery-Bugs规则";
    		document.getElementById("RPDELALL").value = "从ABP移除ghostery-Bugs规则";
    		RPBT.Ruletree.clear();
    		for (var i = 0; i < RPBT.Ruletree.GHBUGS.length; i++)	
    	    RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.GHBUGS[i]);
    	  RPBT._loginfo("ghostery-BUGS规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
    	} else if (this._SUBTYPE.selectedItem == document.getElementById("RPRule")) {
    		document.getElementById("RPUPDATE").value = "更新RP-Privacy规则";
    		document.getElementById("RPADDALL").value = "合并RP-Privacy规则";
    		document.getElementById("RPDELALL").value = "从ABP移除RP-Privacy规则";
    		RPBT.Ruletree.clear();
    		RPBT.Ruletree.populateRuleTable();
    		RPBT._loginfo("RP deny-tracker规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
    	} else if (this._SUBTYPE.selectedItem == document.getElementById("EasyprivacyRule")) {
    		document.getElementById("RPUPDATE").value = "更新Easyprivacy规则";
    		document.getElementById("RPADDALL").value = "合并Easyprivacy规则";
    		document.getElementById("RPDELALL").value = "从ABP移除Easyprivacy规则";
    		this._importSUBpatternsfile(0);
    		RPBT.Ruletree.clear();
    		for (var i = 0; i < RPBT.Ruletree.SUBfilters.length; i++) {	
    		      	 if (RPBT.Ruletree.SUBfilters[i].substring(0,2) == "@@")
    	             RPBT.Ruletree.addAllowedRequest("allow", "", RPBT.Ruletree.SUBfilters[i]);
    	           else
    	           	 RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.SUBfilters[i]);
    	        }
    	  RPBT._loginfo("Easyprivacy规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
    	} else if (this._SUBTYPE.selectedItem == document.getElementById("FanboyRule")) {
    		document.getElementById("RPUPDATE").value = "更新Fanboy Tracking规则";
    		document.getElementById("RPADDALL").value = "合并Fanboy Tracking规则";
    		document.getElementById("RPDELALL").value = "从ABP移除Fanboy Tracking规则";
    		this._importSUBpatternsfile(1);
    		RPBT.Ruletree.clear();
    		for (var i = 0; i < RPBT.Ruletree.SUBfilters.length; i++) {	
    		      	 if (RPBT.Ruletree.SUBfilters[i].substring(0,2) == "@@")
    	             RPBT.Ruletree.addAllowedRequest("allow", "", RPBT.Ruletree.SUBfilters[i]);
    	           else
    	           	 RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.SUBfilters[i]);
    	        }
    	  RPBT._loginfo("Fanboy Tracking规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
    	}  else if (this._SUBTYPE.selectedItem == document.getElementById("malware")) {
    		document.getElementById("RPUPDATE").value = "更新Malware Domain规则";
    		document.getElementById("RPADDALL").value = "合并Malware Domain规则";
    		document.getElementById("RPDELALL").value = "从ABP移除Malware Domain规则";
    		this._importSUBpatternsfile(2);
    		RPBT.Ruletree.clear();
    		for (var i = 0; i < RPBT.Ruletree.SUBfilters.length; i++) {	
    		      	 if (RPBT.Ruletree.SUBfilters[i].substring(0,2) == "@@")
    	             RPBT.Ruletree.addAllowedRequest("allow", "", RPBT.Ruletree.SUBfilters[i]);
    	           else
    	           	 RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.SUBfilters[i]);
    	        }
    	  RPBT._loginfo("Malware Domain规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
    	}  else if (this._SUBTYPE.selectedItem == document.getElementById("Fanboy-Social")) {
    		document.getElementById("RPUPDATE").value = "更新Fanboy Social规则";
    		document.getElementById("RPADDALL").value = "合并Fanboy Social规则";
    		document.getElementById("RPDELALL").value = "从ABP移除Fanboy Social规则";
    		this._importSUBpatternsfile(3);
    		RPBT.Ruletree.clear();
    		for (var i = 0; i < RPBT.Ruletree.SUBfilters.length; i++) {	
    		      	 if (RPBT.Ruletree.SUBfilters[i].substring(0,2) == "@@")
    	             RPBT.Ruletree.addAllowedRequest("allow", "", RPBT.Ruletree.SUBfilters[i]);
    	           else
    	           	 RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.SUBfilters[i]);
    	        }
    	  RPBT._loginfo("Fanboy Social规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
    	}
    },
    
    _importSUBpatternsfile : function(atype) {
    	if (atype == 0)
    	  var filename = "Easyprivacy.ini";
    	else if (atype == 1)
    		var filename = "FanboyTracking.ini";
      else if (atype == 2)
    		var filename = "malwaredomains_full.ini";
    	else if (atype == 3)
    		var filename = "Fanboy_Social.ini";
      else
      	return;
      var subfile = RPBT.getRPUserDir();
      subfile.appendRelativePath(filename);
      RPBT.Ruletree.SUBfilters = [];
      if (subfile.exists()) {
        var fileStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
            .createInstance(Components.interfaces.nsIFileInputStream);
        fileStream.init(subfile, 0x01, 0444, 0);
        var stream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
                      createInstance(Components.interfaces.nsIConverterInputStream);
        stream.init(fileStream, "UTF-8", 16384, 0); 	   
        stream = stream.QueryInterface(Ci.nsIUnicharLineInputStream);
        var line = {};
        var val = "";
        var cont;
        var newcow = 0;
        do {
          cont = stream.readLine(line);
          val = line.value;
          val = val.trim();
          if (val != "" && val[0] != "[" && val[0] != "!") {
          	RPBT.Ruletree.SUBfilters.push(val);
          	newcow = newcow + 1;
          }
        } while (cont);
        stream.close();
      }
  	},
  	
  	openABPFiltersDialog: function(evt) {
  		if (evt.button != 0) return;
  		var item = this._ABPRulelist.selectedItem;
  		if (item)
  		  var filter = item.filteritem;
  		else
  		  var filter = RPBT.subscription.filters[0];
      let existing = Services.wm.getMostRecentWindow("abp:filters");
      if (existing) {
        try {
          existing.focus();
        } catch (e) {}
        if (filter)
          existing.SubscriptionActions.selectFilter(filter);
      }
      else {
        Services.ww.openWindow(null, "chrome://adblockplus/content/ui/filters.xul", "_blank", "chrome,centerscreen,resizable,dialog=no", {wrappedJSObject: filter});
      }
    },
    //end UI 
  };

  RPBT.Ruletree = {
  	_inited : false,
  	_visibleData : [],
    _name : 'deny_trackers',
    _url : null, 
    _GHurl: null,
    _data : null,
  	rawPolicy: null,
  	GHFiles: null,
  	GHBUGS: [],
  	SUBfilters: [],
  	updateinfo : { SUCC: 0, ISEXIT: 0, FAULT: 0, crruindex: -1, isrun: false},
  	atimer: null,
  	
    get visibleData() { return this._visibleData; },
	  set visibleData(val) { this._visibleData = val; },
    get tree() { return document.getElementById("rulelist-details-tree"); },
    
    toString : function () {
      return "[Subscription " + this._name + " " + this._url + "]";
    },
    
    view: {
  		mgr: null,		
  		_columnNameToIndexMap : {
      "requestpolicy-origin" : 0,
      "requestpolicy-destination" : 1,
      "requestpolicy-blocked" : 2,
      },
  		
  		inittree: function(mgr) {
  			this.mgr = mgr;
  		},
  		
  		get rowCount() { return this.mgr.visibleData.length;  },
  		getCellText : function(index, column) {
        try {
          var columnIndex = this._columnNameToIndexMap[column.id];
          return this._getVisibleItemAtIndex(index)[this._columnNameToIndexMap[column.id]];
        } catch (ex) {
        }
        return "";
      },
  		_getVisibleItemAtIndex : function(index) {
        return this.mgr.visibleData[this.mgr.visibleData.length - index - 1];
      },
      isContainerOpen : function(index) { return false;},
      isContainerEmpty : function(index) { return false; },
      isEditable : function(index, column) { return false; },
      hasNextSibling : function(index, after) { return false; },
  		isSeparator: function(aIndex) { return false; },
  		isSorted: function() { return false; },
  		isContainer: function(aIndex) { return false; },
  		setTree: function(aTree){},
  		getImageSrc: function(aRow, aColumn) {},
  		getProgressMode: function(aRow, aColumn) {},
  		getCellValue: function(aRow, aColumn) {},
  		cycleHeader: function(aColId, aElt) {},
  		getRowProperties: function(aRow, aProperty) {},
  		getColumnProperties: function(aColumn, aColumnElement, aProperty) {},
  		getCellProperties: function getCellProperties(aRow, aColumn, aProperty) { },
  
  		get selection() { return this._selection != undefined ? this._selection : (this.mgr.tree ? this.mgr.tree.selection : null); },
  		set selection(val) { return this._selection = val; }
  	},
  	
    init : function() {
    	this.view.inittree(this);
			this.tree.treeBoxObject.view = this.view;
			this._url = DEFAULT_SUBSCRIPTION_LIST_URL_BASE + this._name + '.json';
			this._GHurl = "https://www.ghostery.com/update/all?format=json";
			this.populateRuleTable();
			this.addGHBUGRuleTable();
    },
    
    populateRuleTable: function(){
    	  if (!this._inited) {
    		   this._inited = true;
    	  }
    	  this.rawPolicy = RPBT.loadRawPolicyFromFile();
    	  if (!this.rawPolicy) {
    	  	return;
    	  }
    	  
    	  for (var i = 0; i < this.rawPolicy._entries['deny'].length; i++) {
          var entry = this.rawPolicy._entries['deny'][i];
          var origin = entry['o'] ? RPBT._ruleDataPartToDisplayString(entry['o']) : '';
          var dest = entry['d'] ? RPBT._ruleDataPartToDisplayString(entry['d']) : '';
          this.addAllowedRequest('deny', origin, dest);
        }
        for (var i = 0; i < this.rawPolicy._entries["allow"].length; i++) {
          var entry = this.rawPolicy._entries['allow'][i];
          var origin = entry['o'] ? RPBT._ruleDataPartToDisplayString(entry['o']) : '';
          var dest = entry['d'] ? RPBT._ruleDataPartToDisplayString(entry['d']) : '';
          this.addAllowedRequest('allow', origin, dest);
        }
    },
    
    sorter: function(a, b) {
		  var aName = a.name.toLowerCase();
		  var bName = b.name.toLowerCase();
		  return aName > bName ? 1 : aName < bName ? -1 : 0
	  },
	  
  	unwrap: function(pattern) {
  		var combined = [],
  			first = pattern.substring(0, pattern.indexOf('(')),
  			last = pattern.substring(pattern.lastIndexOf(')') + 1, pattern.length),
  			parts = pattern.substring(pattern.indexOf('(') + 1, pattern.lastIndexOf(')')).split('|');
  		if ( (last == '?') || (last.charAt(0) == '?') ) {
  			return combined;
  		}
  		for (var i = 0; i < parts.length; i++) {
  			combined.push( (first + parts[i] + last).replace(/\\/g, '') );
  		}
  		return combined;
  	},
    
    addGHBUGRuleTable: function(){
    	 var i, j, unwrapped;
		      ALLBUGS = null;
       var GHSTR = RPBT.loadGHBUGFromFile();
       if (GHSTR == '' || GHSTR == null) {
    	  	return;
    	 }
    	 ALLBUGS = JSON.parse(GHSTR).bugs;
    	 //RPBT.LSOSBUG = null;
    	 //RPBT.LSOSBUG = JSON.parse(GHSTR).lsos;
    	 if (!ALLBUGS)
    	   return;
   		 for (i = 0; i < ALLBUGS.length; i++) {
    			var bug = ALLBUGS[i];
    			bug.id = bug.id.toString(); // coerce to string, just in case
    			unwrapped = [];
  				if (bug.pattern.replace(/(\\\.|\\\/|\\\?|\\\-)/g, '').match(/^[A-Za-z0-9;\-_]+$/)) {
  					this.GHBUGS.push(bug.pattern.replace(/\\/g, ''));
  				} else { 
  					var count = bug.pattern.split('(').length;
  					if (count == 2) {
  						unwrapped = this.unwrap(bug.pattern);
  					}
  					var keep = true;
  					if ( (unwrapped) && (unwrapped.length > 0) ) {
  						for (j = 0; j < unwrapped.length; j++) {
  							if (unwrapped[j].replace(/(\.|\/|\?)/g, '').match(/^[A-Za-z0-9;\-_]+$/)) {
  							} else {
  								keep = false;
  								break;
  							}
  						}
  						if (keep) {
  							for (var q = 0; q < unwrapped.length; q++)
  							   this.GHBUGS.push(unwrapped[q]);
  						}
  					}
  				}
   	   }
    },
    
    clear : function(e) {
			var oldRowCount = this.view.rowCount;
			this.tree.treeBoxObject.rowCountChanged(0, -oldRowCount);
			var selection = this.view.selection;
			if (selection)
				selection.clearSelection();
			this.rawPolicy = null;
      this.visibleData = [];
    },
    
    addAllowedRequest : function(type, originUri, destUri) {
      var typeCell = type == 'allow' ? '允许' : '阻止';
      this.visibleData.push([originUri, destUri, typeCell]);
      
      this.visibleData = this.visibleData;		// yea for hidden side-effects
			if (this.view.selection)
			{
				this.view.selection.clearSelection();
			}
			this.tree.treeBoxObject.view = this.view;	// force total refresh
    },
    
    doRPUPDATE: function() {
    	if (RPBT._SUBTYPE.selectedItem == document.getElementById("GHBUGSRule")) {
    		function updateGHCompleted(result) {
      		RPBT._loginfo(result);
      		if (result == SUBSCRIPTION_UPDATE_SUCCESS) {
      			RPBT.Ruletree.clear();
      			RPBT.Ruletree.GHBUGS = [];
      			setTimeout(function () {
      			  RPBT.Ruletree.addGHBUGRuleTable();
      			  RPBT._loginfo("请等待...");
      			  for (var i = 0; i < RPBT.Ruletree.GHBUGS.length; i++)	
    	         RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.GHBUGS[i]);
    	        RPBT._loginfo("ghostery-BUGS规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
    	      }, 200);
      		}
        }
        RPBT._loginfo("请等待，正在更新...");
        this.updateGH(updateGHCompleted);
    	} else if (RPBT._SUBTYPE.selectedItem == document.getElementById("RPRule")) {
      	function updateCompleted(result) {
      		RPBT._loginfo(result);
      		if (result == SUBSCRIPTION_UPDATE_SUCCESS) {
      			RPBT.Ruletree.clear();
      			setTimeout(function () { 
      				RPBT.Ruletree.populateRuleTable(); 
      				RPBT._loginfo("RP deny-tracker规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
      			}, 200);
      		}
        }
        RPBT._loginfo("请等待，正在更新...");
        this.update(updateCompleted);
      } else if (RPBT._SUBTYPE.selectedItem == document.getElementById("EasyprivacyRule")) {
      	function updateSUBCompleted(result) {
      		RPBT._loginfo(result);
      		if (result == SUBSCRIPTION_UPDATE_SUCCESS) {
      			RPBT.Ruletree.clear();
      			setTimeout(function () { 
      				RPBT._importSUBpatternsfile(0);
      				RPBT._loginfo("请等待...");
    		      for (var i = 0; i < RPBT.Ruletree.SUBfilters.length; i++) {	
    		      	 if (RPBT.Ruletree.SUBfilters[i].substring(0,2) == "@@")
    	             RPBT.Ruletree.addAllowedRequest("allow", "", RPBT.Ruletree.SUBfilters[i]);
    	           else
    	           	 RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.SUBfilters[i]);
    	        }
    	        RPBT._loginfo("Easyprivacy规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
      			}, 200);
      		}
        }
        RPBT._loginfo("请等待，正在更新...");
        this.updateSUB(updateSUBCompleted, 0);
      } else if (RPBT._SUBTYPE.selectedItem == document.getElementById("FanboyRule")) {
      	function updateSUBFCompleted(result) {
      		RPBT._loginfo(result);
      		if (result == SUBSCRIPTION_UPDATE_SUCCESS) {
      			RPBT.Ruletree.clear();
      			setTimeout(function () { 
      				RPBT._importSUBpatternsfile(1);
      				RPBT._loginfo("请等待...");
    		      for (var i = 0; i < RPBT.Ruletree.SUBfilters.length; i++) {	
    		      	 if (RPBT.Ruletree.SUBfilters[i].substring(0,2) == "@@")
    	             RPBT.Ruletree.addAllowedRequest("allow", "", RPBT.Ruletree.SUBfilters[i]);
    	           else
    	           	 RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.SUBfilters[i]);
    	        }
    	        RPBT._loginfo("Fanboy Tracking规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
      			}, 200);
      		}
        }
        RPBT._loginfo("请等待，正在更新...");
        this.updateSUB(updateSUBFCompleted, 1);
      } else if (RPBT._SUBTYPE.selectedItem == document.getElementById("malware")) {
      	function updateSUBFCompleted(result) {
      		RPBT._loginfo(result);
      		if (result == SUBSCRIPTION_UPDATE_SUCCESS) {
      			RPBT.Ruletree.clear();
      			setTimeout(function () { 
      				RPBT._importSUBpatternsfile(2);
      				RPBT._loginfo("请等待...");
    		      for (var i = 0; i < RPBT.Ruletree.SUBfilters.length; i++) {	
    		      	 if (RPBT.Ruletree.SUBfilters[i].substring(0,2) == "@@")
    	             RPBT.Ruletree.addAllowedRequest("allow", "", RPBT.Ruletree.SUBfilters[i]);
    	           else
    	           	 RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.SUBfilters[i]);
    	        }
    	        RPBT._loginfo("Malware Domain规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
      			}, 200);
      		}
        }
        RPBT._loginfo("请等待，正在更新...");
        this.updateSUB(updateSUBFCompleted, 2);
      } else if (RPBT._SUBTYPE.selectedItem == document.getElementById("Fanboy-Social")) {
      	function updateSUBFCompleted(result) {
      		RPBT._loginfo(result);
      		if (result == SUBSCRIPTION_UPDATE_SUCCESS) {
      			RPBT.Ruletree.clear();
      			setTimeout(function () { 
      				RPBT._importSUBpatternsfile(3);
      				RPBT._loginfo("请等待...");
    		      for (var i = 0; i < RPBT.Ruletree.SUBfilters.length; i++) {	
    		      	 if (RPBT.Ruletree.SUBfilters[i].substring(0,2) == "@@")
    	             RPBT.Ruletree.addAllowedRequest("allow", "", RPBT.Ruletree.SUBfilters[i]);
    	           else
    	           	 RPBT.Ruletree.addAllowedRequest("deny", "", RPBT.Ruletree.SUBfilters[i]);
    	        }
    	        RPBT._loginfo("Fanboy Social规则共:" + RPBT.Ruletree._visibleData.length.toString() + "个!");
      			}, 200);
      		}
        }
        RPBT._loginfo("请等待，正在更新...");
        this.updateSUB(updateSUBFCompleted, 3);
      }
    },
    
    update : function (errorCallback) {
      var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Components.interfaces.nsIXMLHttpRequest);
      var self = this;
      req.onload = function (event) {
        try {
          self._rawData = req.responseText;
          if (!self._rawData) {
          	var error = '返回了一个空文件！';
            setTimeout(function () { errorCallback(error); }, 0);
            return;
          }
          self._data = JSON.parse(req.responseText);
          try {
            var serial = self._data['metadata']['serial'];
          } catch (e) {
            var error = '没有Policy serial number';
            setTimeout(function () { errorCallback(error); }, 0);
            return;
          }
          if (typeof serial != 'number' || serial % 1 != 0) {
            var error = '无效的Policy serial number: ' + serial;
            setTimeout(function () { errorCallback( error); }, 0);
            return;
          }
          try {
            var newrawPolicy = new RawPolicy(self._rawData);
            RPBT.saveRawPolicyToFile(newrawPolicy);
          } catch (e) {
          	setTimeout(function () { errorCallback(e.toString()); }, 0);
            return;
          }
          setTimeout(function () {
                errorCallback(SUBSCRIPTION_UPDATE_SUCCESS);
          }, 0);
        } catch (e) {
        	setTimeout(function () { errorCallback(e.toString()); }, 0);
        }
      };
      req.onerror = function (event) {
      	setTimeout(function () { errorCallback(req.statusText); }, 0);
      	var error = req.statusText;
      	return error;
      };
      req.open('GET', this._url);
      req.send(null);
    },
    
    updateGH : function (errorCallback) {
    	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Components.interfaces.nsIXMLHttpRequest);
      var self = this;
      req.onload = function (event) {
        try {
          self._GHData = req.responseText;
          if (!self._GHData) {
          	var error = '返回了一个空文件！';
            setTimeout(function () { errorCallback(error); }, 0);
            return;
          }
          self._GHData = self._GHData.replace(/[\r\n]/g, '');
          //self._GHData = windowMediator.getMostRecentWindow("").atob(self._GHData);
          RPBT.stringToFile(self._GHData, RPBT.Ruletree.GHFiles);
          
          setTimeout(function () {
                errorCallback(SUBSCRIPTION_UPDATE_SUCCESS);
          }, 0);
        } catch (e) {
        	setTimeout(function () { errorCallback(e.toString()); }, 0);
        }
      };
      req.onerror = function (event) {
      	setTimeout(function () { errorCallback(req.statusText); }, 0);
      	var error = req.statusText;
      	return error;
      };
      req.open('GET', this._GHurl);
      req.send(null);
    },
    
    updateSUB : function (errorCallback, atype) {
    	if (atype == 0) {
    	  var suburl = "https://easylist-downloads.adblockplus.org/easyprivacy.txt";
    	  var filename = "Easyprivacy.ini";
    	} else if (atype == 1) {
    	  var suburl = "https://secure.fanboy.co.nz/fanboy-tracking.txt";
    	  var filename = "FanboyTracking.ini";
    	} else if (atype == 2) {
    	  var suburl = "https://easylist-downloads.adblockplus.org/malwaredomains_full.txt";
    	  var filename = "malwaredomains_full.ini";
    	} else if (atype == 3) {
    	  var suburl = "https://easylist-downloads.adblockplus.org/fanboy-social.txt";
    	  var filename = "Fanboy_Social.ini";
    	} else
    		return;
      var subfile = RPBT.getRPUserDir();
      subfile.appendRelativePath(filename);
      
    	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
        .createInstance(Components.interfaces.nsIXMLHttpRequest);
      var self = this;
      req.onload = function (event) {
        try {
          self._SUBData = req.responseText;
          if (!self._SUBData) {
          	var error = '返回了一个空文件！';
            setTimeout(function () { errorCallback(error); }, 0);
            return;
          }
          //self._GHData = windowMediator.getMostRecentWindow("").atob(self._GHData);
          RPBT.stringToFile(self._SUBData, subfile);
          
          setTimeout(function () {
                errorCallback(SUBSCRIPTION_UPDATE_SUCCESS);
          }, 0);
        } catch (e) {
        	setTimeout(function () { errorCallback(e.toString()); }, 0);
        }
      };
      req.onerror = function (event) {
      	setTimeout(function () { errorCallback(req.statusText); }, 0);
      	var error = req.statusText;
      	return error;
      };
      req.open('GET', suburl);
      req.send(null);
    }, 
    
    AddSUBToABPRule: function() {
    	var selection = this.view.selection;
			var idxitem = selection.currentIndex;
    	if (idxitem >= 0) {
    		var ett = this.visibleData.length - idxitem - 1
      	var desthost = this.visibleData[ett][1].trim();
      	if (RPBT._cancelWHITE && (desthost.substring(0,2) == "@@")) {
      		this.updateinfo.FAULT = this.updateinfo.FAULT + 1;
      		RPBT._loginfo(desthost + "已经忽略！");
      	  return;
      	}
      	var ar = RPBT._AddABPtextfilter(desthost);
  			if (ar == 0) {
  				this.updateinfo.SUCC = this.updateinfo.SUCC + 1;
  				RPBT._loginfo("已成功添加！");
  			} else if (ar == 1) {
  				this.updateinfo.ISEXIT = this.updateinfo.ISEXIT + 1;
  				RPBT._loginfo(desthost + "已存在，不需要添加！");
  		  } else {
  		  	this.updateinfo.FAULT = this.updateinfo.FAULT + 1;
  		  	RPBT._loginfo(desthost + "添加失败！");
  		  }
  		  RPBT._logtotal();
      }
    },
    
    AddGHBUGToABPRule: function() {
    	var selection = this.view.selection;
			var idxitem = selection.currentIndex;
    	if (idxitem >= 0) {
    		var ett = this.visibleData.length - idxitem - 1
      	var desthost = this.visibleData[ett][1].trim();
      	var resarra = [];
      	resarra = this.gettestUrl(desthost);
      	if (resarra[0] == 1) {
      		this.updateinfo.ISEXIT = this.updateinfo.ISEXIT + 1;
      	  RPBT._loginfo("相似规则已存在，添加失败!");
          return;
      	} else {
      		if (desthost.substring(0, 1) == "/")
      	    var ar = RPBT._AddABPtextfilter(desthost);
      	  else if (desthost.substring(0, 1) == ".") {
      	  	if (resarra[1])
      	      var ar = RPBT._AddABPtextfilter("||" + desthost.substring(1));
      	    else
      	    	var ar = RPBT._AddABPtextfilter(desthost);
      	  } else {
      	    if (resarra[1])
      	      var ar = RPBT._AddABPtextfilter("||" + desthost);
      	    else
      	    	var ar = RPBT._AddABPtextfilter(desthost);
      	  }
        	if (ar == 0) {
        		this.updateinfo.SUCC = this.updateinfo.SUCC + 1;
        	  RPBT._loginfo("添加成功!");
        	} else if (ar == 1) {
        		this.updateinfo.ISEXIT = this.updateinfo.ISEXIT + 1;
        		RPBT._loginfo("规则已存在!");
        	} else {
        		this.updateinfo.FAULT = this.updateinfo.FAULT + 1;
        		RPBT._loginfo("添加失败!");
        	}
      	}
      	RPBT._logtotal();
      }
    },
    
    gettestUrl: function(aurl) {
    	var atext = "", anewURI = null, istopdomain = true;
    	if (aurl.substring(0, 1) == ".") {
    	  atext = "http://www" + aurl;
    	  anewURI = RPBT.makeURI(atext);
    	  if (!anewURI) {
    	    atext = "http://www.example" + aurl;
    	    istopdomain = false;
    	  }
    	} else if (aurl.substring(0, 1) != "." && aurl.substring(0, 1) == "/") {
    		atext = "http://www.example.com" + aurl;
    		istopdomain = false;
    	} else if (aurl.substring(0, 1) != "." && aurl.substring(0, 1) != "/") {
        atext = "http://" + aurl;
        anewURI = RPBT.makeURI(atext);
    	  if (!anewURI) {
    	    atext = "http://www.example.com/" + aurl;
    	    istopdomain = false;
    	  }
      } else {
      	atext = "http://" + aurl;
      	anewURI = RPBT.makeURI(atext);
    	  if (!anewURI) {
    	    atext = "http://www.example.com/" + aurl;
    	    istopdomain = false;
    	  }
      }
      var amatch = defaultMatcher.matchesAny(atext, "DOCUMENT", null, false);
      var ares = (amatch && amatch instanceof BlockingFilter ? true : false);
    	if (ares) {
        return [1, istopdomain];
  		}
  		amatch = defaultMatcher.matchesAny(atext, "DOCUMENT", null, true);
      ares = (amatch && amatch instanceof BlockingFilter ? true : false);
    	if (ares) {
        return [1, istopdomain];
  		}
  		return [0, istopdomain];
    },
    
    AddItToABPRule: function() {
    	if (!RPBT.subscriptionloaded) return;
    	if (RPBT._SUBTYPE.selectedItem == document.getElementById("GHBUGSRule")) {
    	   this.AddGHBUGToABPRule();
    	   return;
    	}  else if (RPBT._SUBTYPE.selectedItem == document.getElementById("EasyprivacyRule") || 
    		          RPBT._SUBTYPE.selectedItem == document.getElementById("FanboyRule") || 
    		          RPBT._SUBTYPE.selectedItem == document.getElementById("malware") || 
    		          RPBT._SUBTYPE.selectedItem == document.getElementById("Fanboy-Social")) {
    	   this.AddSUBToABPRule();
    	   return;
    	}
    	var selection = this.view.selection;
			var idxitem = selection.currentIndex;
    	if (idxitem >= 0) {
    		var ett = this.visibleData.length - idxitem - 1
      	var fromhost = this.visibleData[ett][0].trim();
      	var desthost = this.visibleData[ett][1].trim();
      	var ruleadd  = this.visibleData[ett][2];
      	if (desthost.substring(0,2) == "||") { 
      		return;
        }
      	if (desthost.substring(0,2) == "*.")
      	  desthost = desthost.substring(2);
      	if (fromhost != "" && fromhost.substring(0,2) == "*.")
      	  fromhost = fromhost.substring(2);
    		var RPfilter = "||" + desthost + "^$third-party";
    		var nofilter =  null;
    		if (fromhost != "" && fromhost != desthost) {
    		  if (ruleadd == "允许") {
    		    RPfilter = RPfilter + ",domain=~" + fromhost;
    		    nofilter =  RPfilter + ",domain=" + fromhost;
    		  }else if (ruleadd == "阻止") {
    			  RPfilter = RPfilter + ",domain=" + fromhost;
    			  nofilter =  RPfilter + ",domain=~" + fromhost;
    			}else
    				;
    		}
    		if (nofilter) {
    		  let amatch = defaultMatcher.matchesAny("http://www." + desthost, "DOCUMENT", fromhost, true);
          var ares = (amatch && amatch instanceof BlockingFilter ? true : false);
    		} else {
    			let amatch = defaultMatcher.matchesAny("http://www." + desthost, "DOCUMENT", null, true);
          var ares = (amatch && amatch instanceof BlockingFilter ? true : false);
    		}
    		if (ares) {
    			this.updateinfo.ISEXIT = this.updateinfo.ISEXIT + 1;
    		  RPBT._loginfo("相似规则已存在，添加失败!");
          return;
    		}
    		
    		if (nofilter) {
    		   var newnofilter = Filter.fromText(nofilter);
           if (RPBT._filterisexit(newnofilter)) {
           	 this.updateinfo.ISEXIT = this.updateinfo.ISEXIT + 1;
             RPBT._loginfo("逻辑相反规则已存在，添加失败!");
             return;
           }
    		}
    		
    		var ar = RPBT._AddABPtextfilter(RPfilter);
  			if (ar == 0) {
  				this.updateinfo.SUCC = this.updateinfo.SUCC + 1;
  			  RPBT._loginfo("已成功添加！");
  			} else if (ar == 1) {
  				this.updateinfo.ISEXIT = this.updateinfo.ISEXIT + 1;
  				RPBT._loginfo(desthost + "已存在，不需要添加！");
  		  } else {
  		  	this.updateinfo.FAULT = this.updateinfo.FAULT + 1;
  		  	RPBT._loginfo(desthost + "添加失败或忽略！");
  		  }
  		  RPBT._logtotal();
    	}
    },
    
    doADDALLRP: function() {
    	if (!RPBT.subscriptionloaded) return;
    	if (this.visibleData.length <= 0) return;
    	this.updateinfo = { SUCC: 0, ISEXIT: 0, FAULT: 0, crruindex: 0, isrun: true};
    	RPBT._loginfo("请等待...");
    	RPBT.Ruletree.atimer = window.setInterval(function() {
    		  if (!RPBT.Ruletree.updateinfo.isrun) return;
    		  if (RPBT.Ruletree.updateinfo.crruindex < RPBT.Ruletree.visibleData.length) {
    		  	RPBT.Ruletree.updateinfo.isrun = false;
    		  	RPBT.Ruletree.view.selection.select(RPBT.Ruletree.updateinfo.crruindex);
			      RPBT.Ruletree.tree.treeBoxObject.ensureRowIsVisible(RPBT.Ruletree.updateinfo.crruindex);
			      if (RPBT._SUBTYPE.selectedItem == document.getElementById("GHBUGSRule"))
			        RPBT.Ruletree.AddGHBUGToABPRule();
			      else if (RPBT._SUBTYPE.selectedItem == document.getElementById("RPRule"))
			  	    RPBT.Ruletree.AddItToABPRule();
			  	  else if (RPBT._SUBTYPE.selectedItem == document.getElementById("EasyprivacyRule") || 
			  	       RPBT._SUBTYPE.selectedItem == document.getElementById("FanboyRule") || 
			  	       RPBT._SUBTYPE.selectedItem == document.getElementById("malware") || 
			  	       RPBT._SUBTYPE.selectedItem == document.getElementById("Fanboy-Social"))
			  	  RPBT.Ruletree.AddSUBToABPRule();
			  	  RPBT.Ruletree.updateinfo.crruindex = RPBT.Ruletree.updateinfo.crruindex + 1;
			  	  RPBT._loginfo(RPBT.Ruletree.updateinfo.SUCC.toString() + "条添加成功！ " + 
                    RPBT.Ruletree.updateinfo.ISEXIT.toString() + "条已经存在！ " + 
                    RPBT.Ruletree.updateinfo.FAULT.toString() + "条添加失败或忽略！");
            RPBT.Ruletree.updateinfo.isrun = true;
    		  } else {
    		    window.clearInterval(RPBT.Ruletree.atimer);
			  	    RPBT.Ruletree.atimer = null;
    		  }
    		}, 1);
    },
    
    doDELALLRP: function() {
      if (!RPBT.subscriptionloaded) return;
    	if (this.visibleData.length <= 0) return;
    	this.updateinfo = { SUCC: 0, ISEXIT: 0, FAULT: 0, crruindex: 0, isrun: true};
    	RPBT._loginfo("请等待...");
    	RPBT.Ruletree.atimer = window.setInterval(function() {
    	    if (!RPBT.Ruletree.updateinfo.isrun) return;
    	    if (RPBT.Ruletree.updateinfo.crruindex < RPBT.Ruletree.visibleData.length) {
    	      RPBT.Ruletree.updateinfo.isrun = false;
    		  	RPBT.Ruletree.view.selection.select(RPBT.Ruletree.updateinfo.crruindex);
			      RPBT.Ruletree.tree.treeBoxObject.ensureRowIsVisible(RPBT.Ruletree.updateinfo.crruindex);
			      if (RPBT._SUBTYPE.selectedItem == document.getElementById("GHBUGSRule"))
			        RPBT.Ruletree.DelGHBUGToABPRule();
			      else if (RPBT._SUBTYPE.selectedItem == document.getElementById("RPRule"))
			  	    RPBT.Ruletree.DelItToABPRule();
			  	  else if (RPBT._SUBTYPE.selectedItem == document.getElementById("EasyprivacyRule") || 
			  	       RPBT._SUBTYPE.selectedItem == document.getElementById("FanboyRule") || 
			  	       RPBT._SUBTYPE.selectedItem == document.getElementById("malware") || 
			  	       RPBT._SUBTYPE.selectedItem == document.getElementById("Fanboy-Social"))
			  	  RPBT.Ruletree.DELSUBToABPRule();
			  	  RPBT.Ruletree.updateinfo.crruindex = RPBT.Ruletree.updateinfo.crruindex + 1;
            RPBT._loginfo(RPBT.Ruletree.updateinfo.SUCC.toString() + "条移除成功！ " + 
                    RPBT.Ruletree.updateinfo.ISEXIT.toString() + "条不存在！ " + 
                    RPBT.Ruletree.updateinfo.FAULT.toString() + "条移除失败！");
            RPBT.Ruletree.updateinfo.isrun = true;
    	    } else {
    		    window.clearInterval(RPBT.Ruletree.atimer);
			  	    RPBT.Ruletree.atimer = null;
			  	}
    	  }, 1);
    },
    
    DELSUBToABPRule: function() {
    	var selection = this.view.selection;
			var idxitem = selection.currentIndex;
    	if (idxitem >= 0) {
    		var ett = this.visibleData.length - idxitem - 1
      	var desthost = this.visibleData[ett][1].trim();
      	var ar = RPBT._DELABPtextfilter(desthost);
  			if (ar == 0) {
  				this.updateinfo.SUCC = this.updateinfo.SUCC + 1;
  			  RPBT._loginfo("已成功移除！");
  			} else if (ar == 1) {
  				this.updateinfo.ISEXIT = this.updateinfo.ISEXIT + 1;
  				RPBT._loginfo(desthost + "不存在！");
  		  } else {
  		  	this.updateinfo.FAULT = this.updateinfo.FAULT + 1;
  		  	RPBT._loginfo(desthost + "移除失败！");
  		  }
  		  RPBT._logtotal();
      }
    },
    
    DelItToABPRule: function() {
    	var selection = this.view.selection;
			var idxitem = selection.currentIndex;
    	if (idxitem >= 0) {
    		var ett = this.visibleData.length - idxitem - 1
      	var fromhost = this.visibleData[ett][0].trim();
      	var desthost = this.visibleData[ett][1].trim();
      	var ruleadd  = this.visibleData[ett][2];
      	if (desthost.substring(0,2) == "||") { 
      		return;
        }
      	if (desthost.substring(0,2) == "*.")
      	  desthost = desthost.substring(2);
      	if (fromhost != "" && fromhost.substring(0,2) == "*.")
      	  fromhost = fromhost.substring(2);
    		var RPfilter = "||" + desthost + "^$third-party";
    		if (fromhost != "" && fromhost != desthost) {
    		  if (ruleadd == "允许") {
    		    RPfilter = RPfilter + ",domain=~" + fromhost;
    		  }else if (ruleadd == "阻止") {
    			  RPfilter = RPfilter + ",domain=" + fromhost;
    			}else
    				;
    		}
    		var ar = RPBT._DELABPtextfilter(RPfilter);
  			if (ar == 0) {
  				this.updateinfo.SUCC = this.updateinfo.SUCC + 1;
  			  RPBT._loginfo("已成功移除！");
  			} else if (ar == 1) {
  				this.updateinfo.ISEXIT = this.updateinfo.ISEXIT + 1;
  				RPBT._loginfo(desthost + "不存在！");
  		  } else {
  		  	this.updateinfo.FAULT = this.updateinfo.FAULT + 1;
  		  	RPBT._loginfo(desthost + "移除失败！");
  		  }
  		  RPBT._logtotal();
    	}
    },
    
    DelGHBUGToABPRule: function() {
    	var selection = this.view.selection;
			var idxitem = selection.currentIndex;
    	if (idxitem >= 0) {
    		var ett = this.visibleData.length - idxitem - 1
      	var desthost = this.visibleData[ett][1].trim();
      	var resarra = [];
      	resarra = this.gettestUrl(desthost);
      	if (resarra[0] == 1) {
      		var ar = RPBT._DELABPtextfilter(desthost);
      	} else {
      		if (desthost.substring(0, 1) == "/")
      	    var ar = RPBT._DELABPtextfilter(desthost);
      	  else if (desthost.substring(0, 1) == ".") {
      	  	if (resarra[1])
      	      var ar = RPBT._DELABPtextfilter("||" + desthost.substring(1));
      	    else
      	    	var ar = RPBT._DELABPtextfilter(desthost);
      	  } else {
      	    if (resarra[1])
      	      var ar = RPBT._DELABPtextfilter("||" + desthost);
      	    else
      	    	var ar = RPBT._DELABPtextfilter(desthost);
      	  }
      	}
      	  if (ar == 0) {
        		this.updateinfo.SUCC = this.updateinfo.SUCC + 1;
        	  RPBT._loginfo("移除成功!");
        	} else if (ar == 1) {
        		this.updateinfo.ISEXIT = this.updateinfo.ISEXIT + 1;
        		RPBT._loginfo("规则不存在!");
        	} else {
        		this.updateinfo.FAULT = this.updateinfo.FAULT + 1;
        		RPBT._loginfo("移除失败!");
        	}
      	RPBT._logtotal();
      }
    }
    
  };
  
  function RawPolicy(jsonData) {
    this._metadata = {"version" : 1};
    this._entries = {};
    if (jsonData) {
      this._fromJSON(jsonData);
    }
    if (!this._entries["allow"]) {
      this._entries["allow"] = [];
    }
    if (!this._entries["deny"]) {
      this._entries["deny"] = [];
    }
  }
  
  RawPolicy.prototype = {
    _metadata : null,
    _entries : null,
  
    toString : function() {
      return "[RawPolicy " + this._metadata + " " + this._entries + "]";
    },
  
    getAllowRuleCount : function() {
      return this._entries["allow"].length;
    },
    
    getDenyRuleCount : function() {
      return this._entries["deny"].length;
    },
  
    _checkDataObj : function(dataObj) {
      if (!("metadata" in dataObj)) {
        throw "Invalid policy data: no 'metadata' key";
      }
      if (!("version" in dataObj.metadata)) {
        throw "Invalid policy data: no 'version' key";
      }
      if (dataObj.metadata.version != 1) {
        throw "Wrong metadata version. Expected 1, was "
            + dataObj.metadata.version;
      }
      if (!("entries" in dataObj)) {
        throw "Invalid policy data: no 'entries' key";
      }
    },
    
    _fromJSON : function(data) {
      var dataObj = JSON.parse(data);
  
      this._checkDataObj(dataObj);
      this._metadata = dataObj.metadata;
      this._entries = dataObj.entries;
    },
    
    toJSON : function() {
      var tempObj = {"metadata" : this._metadata, "entries" : this._entries};
      return tempObj;
    }
  };
  
  RPBT.init();
  window.RPBT = RPBT;
  
  function addStyle(css) {
  	var pi = document.createProcessingInstruction(
  		'xml-stylesheet',
  		'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
  	);
  	return document.insertBefore(pi, document.documentElement);
  }
  function getFoxVer(){
      var info = Components.classes["@mozilla.org/xre/app-info;1"]
                 .getService(Components.interfaces.nsIXULAppInfo);
      var ver = parseInt(info.version.substr(0,3) * 10,10) / 10;
      return ver;
  }
})('\
#rp-popup { padding: 0; margin: 0; }\
#rp-contents { background-color: #ffffff; }\
#rp-main { padding: 10px 10px 10px 10px; font-size: 14px; }\
#rp-origins-destinations { width : 300px; margin-right: 10px; }\
.rp-od-item { border: 1px solid #ffffff; padding: 0 12px 0 12px; margin: 0px 4px 0px 4px; border-radius: 3px; }\
#rp-origins-destinations [selected-origin="true"] { border-color: #ddd !important; background-color: #eaeaea; }\
#rp-origins-destinations [selected-origin="false"]:hover { border-color: #eee !important; background-color: #f1f1f1; }\
#rp-allowed-destinations [selected-dest="true"] { border-color: #ded !important; background-color: #e1ffe1; }\
#rp-allowed-destinations [selected-dest="false"]:hover { border-color: #efe !important; background-color: #f1fff1; }\
#rp-allowed-destinations-list .rp-od-item:hover { border-color: #eee !important; background-color: #f1f1f1; cursor: pointer;}\
#rp-details .rp-od-item:hover { border-color: #eee !important; background-color: #f1f1f1; cursor: pointer;}\
.rp-stop-rule { font-size: 16px; text-decoration: underline; cursor: pointer;}\
.rp-od-item-domain { text-decoration: underline; cursor: pointer;}\
.rp-stop-rule:hover { border-color: #eee !important; font-size: 16px; background-color: #f1f1f1; cursor: pointer;}\
.rp-start-rule { font-size: 16px; color: #844; border: 1px solid #ffffff; padding: 0 12px 0 12px; margin: 0px 4px 0px 4px; border-radius: 3px; }\
#rp-details .rp-start-rule:hover { font-size: 16px; color: #844; border-color: #ded !important; background-color: #f1f1f1; cursor: pointer;}\
#rp-origin { font-size: 1.2em; color : #555; padding-right: 10px; }\
#rp-allowed-destinations { color: #484; margin-top: 1em; }\
#rp-allowed-destinations-title { color: #aca; }\
#rp-details { padding: 0 1em 0 1em; border-left: 1px solid #eee; width: 500px !important; }\
#rp-footer { border-top: 1px solid #ddd; padding: 0 5px 2px 5px; -moz-box-pack: end; }\
#rp-footer-applay { border-top: 1px solid #ddd; padding: 0 5px 2px 5px; -moz-box-pack: end; }\
#rp-footer-links,#rp-footer-linkst,#rp-footer-linkstt { margin-top: 4px; list-style-image: none;}\
.rp-footer-link { list-style-image: none; color: #888; font-size: 14px; margin: 0 10px 0 10px; }\
.rp-footer-link:hover { list-style-image: none; color: #555; text-decoration: underline; cursor: pointer; }\
#rp-footer-rule { list-style-image: none; border-top: 1px solid #ddd; padding: 0 5px 2px 5px; -moz-box-pack: end; }\
#rp-footer-rule .rp-od-item:hover { list-style-image: none; border-color: #eee !important; background-color: #f1f1f1; cursor: pointer;}\
#RPUPDATE {list-style-image: none; color: #888; font-size: 14px; margin: 0 10px 0 10px; }\
.rp-footer-info { list-style-image: none; color: #844; font-size: 14px; margin: 0 10px 0 10px; }\
.rp-rule-info { list-style-image: none; font-size: 14px; margin: 0 10px 0 10px;  cursor: pointer;}\
.rp-rule-info:hover { list-style-image: none; border-color: #eee !important; background-color: #f1f1f1; cursor: pointer;}\
.rp-ACrule-info[disabled="false"] { list-style-image: none; font-size: 14px; margin: 0 10px 0 10px;  cursor: pointer;}\
.rp-ACrule-info:hover [disabled="false"] { list-style-image: none; font-size: 14px; margin: 0 10px 0 10px;  cursor: pointer;}\
.rp-ACrule-info[disabled="true"] { list-style-image: none; color: #888; font-size: 14px; margin: 0 10px 0 10px;  cursor: pointer;}\
#rp-blocked-destinations { color: #844; margin-top: 1em; }\
#rp-blocked-destinations-title { color: #caa; }\
#rp-ACT-location {color: #888; font-size: 14px; margin: 0 10px 0 10px;  cursor: pointer;}\
#totalrule { color: #484; font-size: 16px; margin: 0 10px 0 10px;  cursor: pointer;}\
'.replace(/[\r\n\t]/g, ''));

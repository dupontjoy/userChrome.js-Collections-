// ==UserScript==
// @name			UserCSSLoader.uc.js
// @description		類似 Stylish 的用戶樣式管理器 (Stylish みたいなもの)
// @namespace		http://d.hatena.ne.jp/Griever/
// @author			Griever
// @include			main
// @license			MIT License
// @compatibility	Firefox 4
// @charset			UTF-8
// @version			0.0.4
// @homepageURL		https://github.com/Griever/userChromeJS/blob/master/UserCSSLoader
// @note			2014/7/10 Mod by Oos 添加 CSS 選單 Ctrl + 中鍵複選啟用/停用, 按鈕中鍵重新加載和右鍵啟用 / 禁用 UserCSSLoader
// @note			2014/7/10 Mod by feiruo 添加啟用/停用 UserCSSLoader
// @note			2014/7/8 Mod by feiruo 添加重載 userChrome.css 和重載 userContent.css
// @note			2014/2/26 Mod by dannylee 添加可切換圖標和選單模式, CSS 選單中鍵重載
// @note			0.0.4 Remove E4X
// @note			CSSEntry クラスを作った
// @note			スタイルのテスト機能を作り直した
// @note			ファイルが削除された場合 rebuild 時に CSS を解除しメニューを消すようにした
// @note			uc で読み込まれた .uc.css の再読み込みに仮対応
// ==/UserScript==

/****** 使用方法 ******

在選單「CSS-Stylish管理」選單中：
左鍵點擊各 CSS 項目，切換各項目的「應用與否」；
中鍵點擊各 CSS 項目，重新加載各項目;
Ctrl + 中鍵點擊各 CSS 項目，也是切換各項目的「應用與否」，但不退出選單，即可連續操作;
右鍵點擊各 CSS 項目，則是調用編輯器對其進行編輯；

userChrome.css 和 userContent.css
左鍵：重載
右鍵：編輯

在 about:config 裡修改 "view_source.editor.path" 以指定編輯器
在 about:config 裡修改 "UserCSSLoader.FOLDER" 以指定存放文件夾

類似滾動條 css 的瀏覽器 chrome 樣式，請改成以 "xul-" 為開頭，或以 ".as.css" 為結尾的文件名，才能正常載入

 **** 結束說明 ****/

(function(css) {

let { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
if (!window.Services)
	Cu.import("resource://gre/modules/Services.jsm");

// 起動時に他の窓がある（２窓目の）場合は抜ける
let list = Services.wm.getEnumerator("navigator:browser");
let inIDOMUtils = Cc["@mozilla.org/inspector/dom-utils;1"].getService(Ci.inIDOMUtils);
while(list.hasMoreElements()) { if(list.getNext() != window) return; }

if (window.UCL) {
	window.UCL.destroy();
	delete window.UCL;
}

window.UCL = {
	isready: false,
	USE_UC: "UC" in window,
	AGENT_SHEET: Ci.nsIStyleSheetService.AGENT_SHEET,
	USER_SHEET : Ci.nsIStyleSheetService.USER_SHEET,
	readCSS    : {},
	UIPREF: "showtoolbutton",
	ShowToolButton: true,
	UCLdisable:false,
	disabled_listTmp:{},
	get disabled_list() {
		let obj = [];
		try {
			obj = this.prefs.getComplexValue("disabled_list", Ci.nsISupportsString).data.split("|");
		} catch(e) {}
		delete this.disabled_list;
		return this.disabled_list = obj;
	},
	get prefs() {
		delete this.prefs;
		return this.prefs = Services.prefs.getBranch("UserCSSLoader.")
	},
	get styleSheetServices() {
		delete this.styleSheetServices;
		return this.styleSheetServices = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
	},
	get FOLDER() {
		let aFolder;
		try {
			// UserCSSLoader.FOLDER があればそれを使う
			let folderPath = this.prefs.getCharPref("FOLDER");
			aFolder = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile)
			aFolder.initWithPath(folderPath);
		} catch (e) {
			aFolder = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
			aFolder.appendRelativePath("UserCSSLoader");//指定用戶css文件夾名稱，若不存在會自動創建
		}
		if (!aFolder.exists() || !aFolder.isDirectory()) {
			aFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0664);
		}
		delete this.FOLDER;
		return this.FOLDER = aFolder;
	},
	getFocusedWindow: function() {
		let win = document.commandDispatcher.focusedWindow;
		if (!win || win == window) win = content;
		return win;
	},
	init: function() {
		UCL.isready = false;
		var overlay = '\
			<overlay xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul" \
					 xmlns:html="http://www.w3.org/1999/xhtml"> \
				<toolbarpalette id="TabsToolbar">\
					<toolbarbutton id="usercssloader-menu" \
								   label="UserCSSLoader" \
								   class="toolbarbutton-1" \
								   type="menu" \
								   removable="true" \
								   onclick="UCL.iconClick(event);" >\
						<menupopup id="usercssloader-menupopup"\
								   onclick="event.preventDefault(); event.stopPropagation();" >\
							<menuitem label="重新加載全部樣式"\
									  tooltiptext="僅選中的樣式"\
									  accesskey="R"\
									  acceltext="Alt + R"\
									  oncommand="UCL.rebuild();" />\
							<menuitem id="userChrome-item"\
									  label="userChrome.css"\
									  hidden="false"\
									  onclick="UCL.userC(event,\'userChrome.css\');"/>\
							<menuitem  id="userContent-item"\
									  label="userContent.css"\
									  hidden="false"\
									  onclick="UCL.userC(event,\'userContent.css\');"/>\
							<menu label="管理選單">\
								<menupopup>\
									<menuitem label="打開樣式目錄"\
											  accesskey="O"\
											  oncommand="UCL.openFolder();" />\
									<menuitem label="編寫新樣式 (外部編輯器)"\
											  accesskey="N"\
											  oncommand="UCL.create();" />\
									<menuitem label="編寫瀏覽器的樣式 (Chrome)"\
											  id="usercssloader-test-chrome"\
											  accesskey="C"\
											  oncommand="UCL.styleTest(window);" />\
									<menuitem label="編寫此網站的樣式 (Web)"\
											  id="usercssloader-test-content"\
											  accesskey="W"\
											  oncommand="UCL.styleTest();" />\
									<menuitem label="尋找此網站的樣式"\
											  accesskey="F"\
											  oncommand="UCL.searchStyle();" />\
									<menu label=".uc.css" accesskey="U" hidden="'+ !UCL.USE_UC +'">\
										<menupopup id="usercssloader-ucmenupopup">\
											<menuitem label="Rebuild(.uc.js)"\
													  oncommand="UCL.UCrebuild();" />\
											<menuseparator id="usercssloader-ucsepalator"/>\
										</menupopup>\
									</menu>\
									<menuitem id="showCSStoolsbutton" label="用戶樣式管理器顯示為按鈕"\
											  oncommand="UCL.toggleUI(1);" />\
								</menupopup>\
							</menu>\
							<menuseparator id="ucl-sepalator"/>\
						</menupopup>\
					</toolbarbutton>\
				</toolbarpalette>\
			</overlay>';
	overlay = "data:application/vnd.mozilla.xul+xml;charset=utf-8," + encodeURI(overlay);
	window.userChrome_js.loadOverlay(overlay, UCL);
	UCL.style = addStyle(css);

	//dannylee
	var menuitem = $("menu_ToolsPopup").insertBefore($C("menu", {
		id: "usercssloader_Tools_Menu",
		label: "用戶樣式管理器腳本版",
		class: "menu-iconic",
		onclick: "UCL.iconClick(event);"
	}), $("menu_preferences"));

	//dannylee
	if (!this.prefs.prefHasUserValue(this.UIPREF)) {
		this.prefs.setBoolPref(this.UIPREF, true);
	}
	this.ShowToolButton = this.prefs.getBoolPref(this.UIPREF);
	},

	observe: function(subject, topic, data) {
		if (topic == "xul-overlay-merged") {
			if (!UCL.isready) {
				UCL.isready = true;
				$("mainKeyset").appendChild($C("key", {
					id: "usercssloader-rebuild-key",
					oncommand: "UCL.rebuild();",
					key: "R",
					modifiers: "alt",
				}));
				this.rebuild();
				this.initialized = true;
				if (UCL.USE_UC) {
					setTimeout(function() {
						UCL.UCcreateMenuitem();
						}, 100);
				}
				window.addEventListener("unload", this, false);
				//dannylee
				$("showCSStoolsbutton").setAttribute("label", "用戶樣式管理器顯示為" + (this.ShowToolButton ? "選單" : "按鈕"));
				UCL.toggleUI(0);
				Application.console.log("UserCSSLoader 界面加載完畢！");
			}
		}
	},

	//dannylee
	toggleUI: function(tag) {
		if (tag > 0) {
			UCL.prefs.setBoolPref(UCL.UIPREF, !UCL.prefs.getBoolPref(UCL.UIPREF));
			UCL.ShowToolButton = UCL.prefs.getBoolPref(UCL.UIPREF);
		}
		window.setTimeout(function() {
			$("usercssloader_Tools_Menu").hidden = UCL.ShowToolButton;
			$("usercssloader-menu").hidden = !UCL.ShowToolButton;
			if (!UCL.ShowToolButton) {
				$("usercssloader_Tools_Menu").appendChild($("usercssloader-menupopup"));
				$("showCSStoolsbutton").setAttribute("label", "用戶樣式管理器顯示為按鈕");
			} else {
				$("usercssloader-menu").appendChild($("usercssloader-menupopup"));
				$("showCSStoolsbutton").setAttribute("label", "用戶樣式管理器顯示為選單");
			}
		}, 10);
	},

	uninit: function() {
		var dis = [x for(x in this.readCSS) if (!this.readCSS[x].enabled)];
		var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
		str.data = dis.join("|");
		this.prefs.setComplexValue("disabled_list", Ci.nsISupportsString, str);
		window.removeEventListener("unload", this, false);
	},
	destroy: function() {
		var i = $("usercssloader-menu");
		if (i) i.parentNode.removeChild(i);
		var i = $("usercssloader-rebuild-key");
		if (i) i.parentNode.removeChild(i);
		this.uninit();
	},
	handleEvent: function(event) {
		switch(event.type) {
			case "unload": this.uninit(); break;
		}
	},
	enableUCL:function() {
		var str = "用戶樣式管理器";
		var dstr = "\n\n左鍵：用戶樣式選單\n中鍵：重新加載已選樣式\n右鍵：啟用 / 禁用";
		if (!UCL.UCLdisable) {
			for (let [leafName, CSS] in Iterator(this.readCSS)) {
				CSS.enabled = false;
				delete this.readCSS[leafName];
			}
			UCL.UCLdisable=!UCL.UCLdisable;
			$("usercssloader_Tools_Menu").setAttribute("state", "disable");
			$("usercssloader_Tools_Menu").setAttribute("tooltiptext", str + "已禁用" + dstr);
			$("usercssloader-menu").setAttribute("state", "disable");
			$("usercssloader-menu").setAttribute("tooltiptext", str + "已禁用" + dstr);
			XULBrowserWindow.statusTextField.label = "UserCSSLoader 已禁用";
		} else {
			this.rebuild();
			UCL.UCLdisable=!UCL.UCLdisable;
			$("usercssloader_Tools_Menu").setAttribute("state", "enable");
			$("usercssloader_Tools_Menu").setAttribute("tooltiptext", str + "已啟用" + dstr);
			$("usercssloader-menu").setAttribute("state", "enable");
			$("usercssloader-menu").setAttribute("tooltiptext", str + "已啟用" + dstr);
			XULBrowserWindow.statusTextField.label = "UserCSSLoader 已啟用";
		}
	},
	rebuild: function() {
		let ext = /\.css$/i;
		let not = /\.uc\.css/i;
		let files = this.FOLDER.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);

		while (files.hasMoreElements()) {
			let file = files.getNext().QueryInterface(Ci.nsIFile);
			if (!ext.test(file.leafName) || not.test(file.leafName)) continue;
			let CSS = this.loadCSS(file);
			CSS.flag = true;
		}
		for (let [leafName, CSS] in Iterator(this.readCSS)) {
			if (!CSS.flag) {
				CSS.enabled = false;
				delete this.readCSS[leafName];
			}
			delete CSS.flag;
			this.rebuildMenu(leafName);
		}
		if (this.initialized)
			XULBrowserWindow.statusTextField.label = "重新加載樣式已完成";//Rebuild しました
	},
	loadCSS: function(aFile) {
		var CSS = this.readCSS[aFile.leafName];
		if (!CSS) {
			CSS = this.readCSS[aFile.leafName] = new CSSEntry(aFile);
			if (this.disabled_list.indexOf(CSS.leafName) === -1) {
				CSS.enabled = true;
			}
		} else if (CSS.enabled) {
			CSS.enabled = true;
		}
		return CSS;
	},
//按鈕css列表子選單start
	rebuildMenu: function(aLeafName) {
		var CSS = this.readCSS[aLeafName];
		var menuitem = $("usercssloader-" + aLeafName);

		if (!CSS) {
			if (menuitem)
				menuitem.parentNode.removeChild(menuitem);
			return;
		}

		if (!menuitem) {
			menuitem = $("usercssloader-menupopup").appendChild($C("menuitem", {
				label: aLeafName,
				id: "usercssloader-" + aLeafName,
				class: "usercssloader-item " + (CSS.SHEET == this.AGENT_SHEET? "AGENT_SHEET" : "USER_SHEET"),
				type: "checkbox",
				autocheck: "false",
				oncommand: "UCL.toggle('"+ aLeafName +"');",
				onclick: "UCL.itemClick(event);",
				tooltiptext: "左鍵：啟用 / 禁用\n中鍵：重新加載\n右鍵：編輯\nCtrl + 中鍵：複選啟用 / 禁用"
			}));
		}
		menuitem.setAttribute("checked", CSS.enabled);
	},
//按鈕css列表子選單end
	toggle: function(aLeafName) {
		var CSS = this.readCSS[aLeafName];
		if (!CSS) return;
		CSS.enabled = !CSS.enabled;
		this.rebuildMenu(aLeafName);
	},
	itemClick: function(event) {
		if (event.button == 0) return;

		event.preventDefault();
		event.stopPropagation();
		let label = event.currentTarget.getAttribute("label");

		if (event.button == 1) {
			if (event.ctrlKey) {
				this.toggle(label);
			}
			else {
				var CSS = this.readCSS[label];
				if (!CSS) return;
				CSS.reloadCSS();
				XULBrowserWindow.statusTextField.label = label + " 重新加載已完成!";
			}
		}
		else if (event.button == 2) {
			closeMenus(event.target);
			this.edit(this.getFileFromLeafName(label));
		}
	},
	iconClick: function(event) {
		if (event.button == 2) {
			UCL.enableUCL();
			event.preventDefault();
		} else if (event.button == 1) {
			UCL.rebuild();
		}
	},
	getFileFromLeafName: function(aLeafName) {
		let f = this.FOLDER.clone();
		f.QueryInterface(Ci.nsILocalFile); // use appendRelativePath
		f.appendRelativePath(aLeafName);
		return f;
	},
	styleTest: function(aWindow) {
		aWindow || (aWindow = this.getFocusedWindow());
		new CSSTester(aWindow, function(tester) {
			if (tester.saved)
				UCL.rebuild();
		});
	},
	searchStyle: function() {
		let win = this.getFocusedWindow();
		let word = win.location.host || win.location.href;
		openLinkIn("https://userstyles.org/styles/browse?category=" + word, "tab", {});//http://userstyles.org/styles/browse/site/
	},
	openFolder: function() {
		this.FOLDER.launch();
	},
	editUserCSS: function(aLeafName) {
		let file = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
		file.appendRelativePath(aLeafName);
		this.edit(file);
	},
	edit: function(aFile) {
		var editor = Services.prefs.getCharPref("view_source.editor.path");
		if (!editor) return alert("未指定外部編輯器的路徑。\n請在about:config中設置view_source.editor.path");//エディタのパスが未設定です。\n view_source.editor.path を設定してください
		try {
			var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
			UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0? "GB2312": "UTF-8";//Shift_JIS
			var path = UI.ConvertFromUnicode(aFile.path);
			var app = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
			app.initWithPath(editor);
			var process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
			process.init(app);
			process.run(false, [path], 1);
		} catch (e) {}
	},
	create: function(aLeafName) {
		if (!aLeafName) aLeafName = prompt("請輸入文件名", new Date().toLocaleFormat("%Y_%m%d_%H%M%S"));//ファイル名を入力してください
		if (aLeafName) aLeafName = aLeafName.replace(/\s+/g, " ").replace(/[\\/:*?\"<>|]/g, "");
		if (!aLeafName || !/\S/.test(aLeafName)) return;
		if (!/\.css$/.test(aLeafName)) aLeafName += ".css";
		let file = this.getFileFromLeafName(aLeafName);
		this.edit(file);
	},
	UCrebuild: function() {
		let re = /^file:.*\.uc\.css(?:\?\d+)?$/i;
		let query = "?" + new Date().getTime();
		Array.slice(document.styleSheets).forEach(function(css) {
			if (!re.test(css.href)) return;
			if (css.ownerNode) {
				css.ownerNode.parentNode.removeChild(css.ownerNode);
			}
			let pi = document.createProcessingInstruction('xml-stylesheet','type="text/css" href="'+ css.href.replace(/\?.*/, '') + query +'"');
			document.insertBefore(pi, document.documentElement);
		});
		UCL.UCcreateMenuitem();
	},
	UCcreateMenuitem: function() {
		let sep = $("usercssloader-ucsepalator");
		let popup = sep.parentNode;
		if (sep.nextSibling) {
			let range = document.createRange();
			range.setStartAfter(sep);
			range.setEndAfter(popup.lastChild);
			range.deleteContents();
			range.detach();
		}

		let re = /^file:.*\.uc\.css(?:\?\d+)?$/i;
		Array.slice(document.styleSheets).forEach(function(css) {
			if (!re.test(css.href)) return;
			let fileURL = decodeURIComponent(css.href).split("?")[0];
			let aLeafName = fileURL.split("/").pop();
			let m = popup.appendChild($C("menuitem", {
				label: aLeafName,
				tooltiptext: fileURL,
				id: "usercssloader-" + aLeafName,
				type: "checkbox",
				autocheck: "false",
				checked: "true",
				oncommand: "this.setAttribute('checked', !(this.css.disabled = !this.css.disabled));",
				onclick: "UCL.UCItemClick(event);"
			}));
			m.css = css;
		});
	},
	UCItemClick: function(event) {
		if (event.button == 0) return;
		event.preventDefault();
		event.stopPropagation();

		if (event.button == 1) {
			event.target.doCommand();
		}
		else if (event.button == 2) {
			closeMenus(event.target);
			let fileURL = event.currentTarget.getAttribute("tooltiptext");
			let file = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler).getFileFromURLSpec(fileURL);
			this.edit(file);
		}
	},
	userC:function(event,str) { //add by feiruo
			if (event.button == 0) {
			UCL.reloadUserCSS(str);
		} else if (event.button == 2) {
			UCL.editUserCSS(str);
		}
	},
	reloadUserCSS: function(str) {
		var aFile = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
		aFile.appendRelativePath(str);
		var fileURL = Services.io.getProtocolHandler("file")
			.QueryInterface(Ci.nsIFileProtocolHandler)
			.getURLSpecFromFile(aFile);
		if (str=="userChrome.css") {
			var rule = UCL.getStyleSheet(document.documentElement, fileURL);
			if (!rule) return;
			inIDOMUtils.parseStyleSheet(rule, UCL.loadText(aFile));
			rule.insertRule(":root{}", rule.cssRules.length); 
			var w = window.open("", "", "width=10, height=10");
			w.close();
		}
		if (str=="userContent.css") {			
			var rule = UCL.getStyleSheet(content.document.documentElement, fileURL);
			if (!rule) return;
			inIDOMUtils.parseStyleSheet(rule, UCL.loadText(aFile));
			rule.insertRule(":root{}", rule.cssRules.length); 
			// 再描畫處理
			var s = gBrowser.markupDocumentViewer;
			s.authorStyleDisabled = !s.authorStyleDisabled;
			s.authorStyleDisabled = !s.authorStyleDisabled;
		}
		XULBrowserWindow.statusTextField.label = "重新加載 " + str + " 已完成";
	},
	getStyleSheet: function(aElement, cssURL) {
		var rules = inIDOMUtils.getCSSStyleRules(aElement);
		var count = rules.Count();
		if (!count) return null;

		for (var i = 0; i < count; ++i) {
			var rule = rules.GetElementAt(i).parentStyleSheet;
			if (rule && rule.href === cssURL)
				return rule;
		};
		return null;
	},
	loadText: function(aFile) {
		if (!aFile.exists() || !aFile.isFile()) return null;
		var fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
		var sstream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream);
		fstream.init(aFile, -1, 0, 0);
		sstream.init(fstream);
		var data = sstream.read(sstream.available());
		try {
			data = decodeURIComponent(escape(data));
		} catch (e) {}
		sstream.close();
		fstream.close();
		return data;
	}, //end by feiruo
};

function CSSEntry(aFile) {
	this.path = aFile.path;
	this.leafName = aFile.leafName;
	this.lastModifiedTime = 1;
	this.SHEET = /^xul-|\.as\.css$/i.test(this.leafName) ? 
		Ci.nsIStyleSheetService.AGENT_SHEET: 
		Ci.nsIStyleSheetService.USER_SHEET;
}
CSSEntry.prototype = {
	sss: Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService),
	_enabled: false,
	get enabled() {
		return this._enabled;
	},
	set enabled(isEnable) {
		var aFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile)
		aFile.initWithPath(this.path);
	
		var isExists = aFile.exists(); // ファイルが存在したら true
		var lastModifiedTime = isExists ? aFile.lastModifiedTime : 0;
		var isForced = this.lastModifiedTime != lastModifiedTime; // ファイルに変更があれば true

		var fileURL = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler).getURLSpecFromFile(aFile);
		var uri = Services.io.newURI(fileURL, null, null);

		if (this.sss.sheetRegistered(uri, this.SHEET)) {
			// すでにこのファイルが読み込まれている場合
			if (!isEnable || !isExists) {
				this.sss.unregisterSheet(uri, this.SHEET);
			}
			else if (isForced) {
				// 解除後に登錄し直す
				this.sss.unregisterSheet(uri, this.SHEET);
				this.sss.loadAndRegisterSheet(uri, this.SHEET);
			}
		} else {
			// このファイルは読み込まれていない
			if (isEnable && isExists) {
				this.sss.loadAndRegisterSheet(uri, this.SHEET);
			}
		}
		if (this.lastModifiedTime !== 1 && isEnable && isForced) {
			log(this.leafName + " 確認已更新。");//の更新を確認しました。
		}
		this.lastModifiedTime = lastModifiedTime;
		return this._enabled = isEnable;
	},
	reloadCSS: function() {
		if (!this._enabled) return;
		var aFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile)
		aFile.initWithPath(this.path);
		var isExists = aFile.exists(); 
		var lastModifiedTime = isExists ? aFile.lastModifiedTime : 0;
		var fileURL = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler).getURLSpecFromFile(aFile);
		var uri = Services.io.newURI(fileURL, null, null);
		this.sss.unregisterSheet(uri, this.SHEET);
		this.sss.loadAndRegisterSheet(uri, this.SHEET);
	}
};

function CSSTester(aWindow, aCallback) {
	this.win = aWindow || window;
	this.doc = this.win.document;
	this.callback = aCallback;
	this.init();
}
CSSTester.prototype = {
	sss: Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService),
	preview_code: "",
	saved: false,
	init: function() {
		this.dialog = openDialog(
			"data:text/html;charset=utf8,"+encodeURIComponent('<!DOCTYPE HTML><html lang="ja"><head><title>CSSTester</title></head><body></body></html>'),
			"",
			"width=550,height=400,dialog=no");
		this.dialog.addEventListener("load", this, false);
	},
	destroy: function() {
		this.preview_end();
		this.dialog.removeEventListener("unload", this, false);
		this.previewButton.removeEventListener("click", this, false);
		this.saveButton.removeEventListener("click", this, false);
		this.closeButton.removeEventListener("click", this, false);
	},
	handleEvent: function(event) {
		switch(event.type) {
			case "click":
				if (event.button != 0) return;
				if (this.previewButton == event.currentTarget) {
					this.preview();
				}
				else if (this.saveButton == event.currentTarget) {
					this.save();
				}
				else if (this.closeButton == event.currentTarget) {
					this.dialog.close();
				}
				break;
			case "load":
				var doc = this.dialog.document;
				doc.body.innerHTML = '\
					<style type="text/css">\
						:not(input):not(select) { padding: 0px; margin: 0px; }\
						table { border-spacing: 0px; }\
						body, html, #main, #textarea { width: 100%; height: 100%; }\
						#textarea { font-family: monospace; }\
					</style>\
					<table id="main">\
						<tr height="100%">\
							<td colspan="4"><textarea id="textarea"></textarea></td>\
						</tr>\
						<tr height="40">\
							<td><input type="button" value="預覽" /></td>\
							<td><input type="button" value="儲存" /></td>\
							<td width="80%"><span class="log"></span></td>\
							<td><input type="button" value="關閉" /></td>\
						</tr>\
					</table>\
				';
				this.textbox = doc.querySelector("textarea");
				this.previewButton = doc.querySelector('input[value="預覽"]');
				this.saveButton = doc.querySelector('input[value="儲存"]');
				this.closeButton = doc.querySelector('input[value="關閉"]');
				this.logField = doc.querySelector('.log');

				var code = "@namespace url(" + this.doc.documentElement.namespaceURI + ");\n";
				code += this.win.location.protocol.indexOf("http") === 0?
					"@-moz-document domain(" + this.win.location.host + ") {\n\n\n\n}":
					"@-moz-document url(" + this.win.location.href + ") {\n\n\n\n}";
				this.textbox.value = code;
				this.dialog.addEventListener("unload", this, false);
				this.previewButton.addEventListener("click", this, false);
				this.saveButton.addEventListener("click", this, false);
				this.closeButton.addEventListener("click", this, false);

				this.textbox.focus();
				let p = this.textbox.value.length - 3;
				this.textbox.setSelectionRange(p, p);

				break;
			case "unload":
				this.destroy();
				this.callback(this);
				break;
		}
	},
	preview: function() {
		var code = this.textbox.value;
		if (!code || !/\:/.test(code))
			return;
		code = "data:text/css;charset=utf-8," + encodeURIComponent(this.textbox.value);
		if (code == this.preview_code)
			return;
		this.preview_end();
		var uri = Services.io.newURI(code, null, null);
		this.sss.loadAndRegisterSheet(uri, Ci.nsIStyleSheetService.AGENT_SHEET);
		this.preview_code = code;
		this.log("預覽");
	},
	preview_end: function() {
		if (this.preview_code) {
			let uri = Services.io.newURI(this.preview_code, null, null);
			this.sss.unregisterSheet(uri, Ci.nsIStyleSheetService.AGENT_SHEET);
			this.preview_code = "";
		}
	},
	save: function() {
		var data = this.textbox.value;
		if (!data) return;

		var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		fp.init(window, "", Ci.nsIFilePicker.modeSave);
		fp.appendFilter("CSS Files","*.css");
		fp.defaultExtension = "css";
		if (window.UCL)
			fp.displayDirectory = UCL.FOLDER;
		var res = fp.show();
		if (res != fp.returnOK && res != fp.returnReplace) return;

		var suConverter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
		suConverter.charset = "UTF-8";
		data = suConverter.ConvertFromUnicode(data);
		var foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
		foStream.init(fp.file, 0x02 | 0x08 | 0x20, 0664, 0);
		foStream.write(data, data.length);
		foStream.close();
		this.saved = true;
	},
	log: function() {
		this.logField.textContent = new Date().toLocaleFormat("%H:%M:%S") + ": " + $A(arguments);
	}
};

UCL.init();
setTimeout(function() {
	$("usercssloader-menu").setAttribute("tooltiptext", "用戶樣式管理器已啟用\n\n左鍵：用戶樣式選單\n中鍵：重新加載已選樣式\n右鍵：啟用 / 禁用");
	$("userChrome-item").setAttribute("tooltiptext", "左鍵：重載\n右鍵：編輯");
	$("userContent-item").setAttribute("tooltiptext", "左鍵：重載\n右鍵：編輯");
}, 1000);

function $(id) { return document.getElementById(id); }
function $A(arr) Array.slice(arr);
function $C(name, attr) {
	var el = document.createElement(name);
	if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
	return el;
}
function addStyle(css) {
	var pi = document.createProcessingInstruction(
		'xml-stylesheet',
		'type="text/css" href="data:text/css;utf-8,' + encodeURIComponent(css) + '"'
	);
	return document.insertBefore(pi, document.documentElement);
}
function log() { Application.console.log(Array.slice(arguments)); }
})('\
#usercssloader_Tools_Menu,\
#usercssloader-menu {\
	list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAARklEQVQ4jWNgYGD4TyFm+L/uaBJezMDA8H+vgyEGHk4GEIPxGnBhdikKZmBg+P/vEyscjxrASjglEmPAvBMPMPBwMoASDADElRSk+LLlQAAAAABJRU5ErkJggg==);\
}\
#usercssloader_Tools_Menu[state="disable"],\
#usercssloader-menu[state="disable"] {\
	list-style-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAARElEQVQ4je3SsQkAMAgAwd/V3RzAARzEZUwXCAEjpAsprv3qAfISaWYlIEVk81Kgowyo6gLIiJh+IM4ndgLuvnkpcGMAOeYtnkwr+88AAAAASUVORK5CYII=);\
}\
#usercssloader-menu,\
#usercssloader-menu > .toolbarbutton-icon {\
	padding:0!important;\
}\
#usercssloader-menu dropmarker{display:none!important;}\
#usercssloader-menupopup .usercssloader-item[checked="false"] {\
	-moz-box-ordinal-group:99!important;\
	color:gray!important;\
}\
'.replace(/[\r\n\t]/g, ''));

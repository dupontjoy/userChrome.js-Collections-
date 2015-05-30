// ==UserScript==
// @name                Extension Options Menu.uc.js
// @description         拡張を操作するボタンを追加
// @include             main
// @version             3.0.0  プラグインも表示するように アイテムのソート方法を指定できるように
// @downloadURL         http://u6.getuploader.com/script/search?q=Extension+Options+Menu.uc.js
// @note                作成にあたりアドオン版Extension Options Menuとucjs_optionsmenu_0.8.uc.jsとtoggleRestartlessAddons.jsを参考にさせてもらいました
// ==/UserScript==
/*
按鈕圖標
左鍵：擴展及插件選單
中鍵：啟用 / 停用 DOM & Element Inspector (重新啟動瀏覽器)
右鍵：打開擴展管理員

擴展
左鍵：啟用 / 禁用擴展
中鍵：打開擴展主頁
右鍵：打開擴展選項（如果有的話）
CTRL + 左鍵：打開擴展的安裝文件夾
CTRL + 中鍵：複製擴展 ID 和圖標地址（如果可用）到剪貼板
CTRL + 右鍵：移除擴展
*/
(function() {
	EOM = {
		BUTTON_TYPE:		2, // 0:按鈕 2:菜單
		ADDON_TYPES:		['extension', 'plugin'], // 顯示的項目類型 (表示するアイテムの種類)
		SHOW_VERSION:		true, // 顯示版本 (ヴァージョンを表示するか)
		SHOW_ALL:			true, // 顯示全部，包括沒有選項的 (設定のないアドオンも表示するか)
		SHOW_USERDISABLED:	true, // 顯示禁用的 (無効のアドオンを表示するか)
		SHOW_APPDISABLED:	false, // 顯示不兼容的 (互換性のないアドオンを表示するか)
		AUTO_RESTART:		false, // 啟用/停用擴展後立即重新啟動瀏覽器(無需重啟擴展除外) (アドオンの有効/無効時に自動で再起動するか(再起動不要アドオンは除外される))
		ICON_URL:			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADyUlEQVQ4jUXM/VMTdADA4a/kkM2Ul8GQgbyDkrzUpUZ2FqAwbGCXioaAdqPUAb4AzonGi4IDBk4EREYyUPBIPRB8yZdMJTyqS0NTBmF6liR3kgd2GqB3ffqh7nr+gEf07pI0D9Ur7g0edb812Oxx++FRz96hNp9bQ6d9f/rhE3lfj8qjve9DnxO9q7xPWpN82/rW+HX0afw7bq/1v3Y50k0lBgzSDi6GQtc86F4A1ih4FAejCVj1YdyNd+WpzpenO2bxrGgO42WhYJ7LRO1cvonx2Cj6CyWHJo76MPZFIC/PhzDSEsbPWh8GMwO5s8abHrUca4o7v6zz4sEmXx7qAnmyew7PDaF0LlKmiv4CiWWiQcl4izcvvnyNG4luXFRMwhoyhd4Ie27GO3MnwZWBFHcefDqTXzf58njnbP7MD/4vyLepHzc7M3FEydhxPzrfduScQnA1eDLfzpNyPdqBm3Fy+tRyBpbIub9GyaNtAYzmBNEZqdQIa65N/ViVPX+ZnXl5zIN7W9055yvj69en0x0t5/twGdZ3p3EmPZSGuniurQvi91R3RrIC/g0G84SFfTZQbcdYnTNjzR6MVHrzsjmA/hQXujwFv815hSbTInY+2c7pHeEMqu0Z1XpxY6H7x6Jnp8TCHsFwqZQR0zRe1Dvx7Lgn4ydmcDdK0K0UDPhP5lxqEOWnEuiOcuPuO68ysETBmUWKNBGs0RwIL62hzLiMCYOAQzKGa6ei/dxAZNMl0jPjOFIwHXNNMHvb1dQdVNFSq+ZwYxyaLU5bhEgyVIvSfkqNK6BYwH4bqBIsbTqB6AH/qt3MN28ioiaD/Ob3MHQlUNazDtPtVFR5julClqKvluS2otpTwOPCKVAk6CwOIKjhCp6nhvFrvY/ywt+4XJ0gtlKLseUtys8up+KrFSzfLs8QsuRtBxS6KqT5rcwvMpFUkkNgZTsKy48EHPmO2ef/IOTqc7yvQ6jJRL45CEObGuPZpf8HLpuNKPQ1SPJOMqn4Cg77LuNdcwk/SxeuhlZmHLqD095rxOa/z2f1weS1LKbopIplevlGIUvS1crT9uCSZcJVX4NbQSMzS47hVXUBj6YBQnRJxGQFEp8TxuYKLzLNb5JzOILCtmg+0DumC1my7rCDJhenDYU4ZZTgnFWBa85B3HY1IjXcIEy3kvU5As3uqaw1+JBqnEVG9RvoLOEszZ5mFHYfZS6Urd5aIE3culKanJ0oTcxOtF29Pcl21bZlnslq/YL1bhWxWmFYrJ1cEp0mKY9Jsy2O0doaVel2lpgNdlH/AMh2OJbhO5RfAAAAAElFTkSuQmCC',

		sort: {
			enabled: 0,
			clickToPlay: 0,
			disabled: 1
			// 0, 0, 0 - 按字母順序排列 (アルファベット順に)
			// 0, 0, 1 - 把啟用和禁用分開並按字母順序排列 (アドオンマネージャと同じようにソート)
			// 0, 1, 2 - 啟用 add-ons，然後click-to-play，最後禁用 (enabled add-ons, then click-to-play and then disabled)
		},

		init: function() {
			if (EOM.BUTTON_TYPE == 0) {
				var btn = $('TabsToolbar').appendChild($C('toolbarbutton', {
					id: 'eom-button',
					type: 'menu',
					class: 'toolbarbutton-1',
					style: '-moz-transform: scale(0.875);'
				}));
			}
			else if (EOM.BUTTON_TYPE == 2) {
				var btn = $("menu_ToolsPopup").insertBefore($C('menu', {
					id: 'eom-menu',
					label: '擴展及插件管理器',
					class: 'menu-iconic',
				}), $("menu_preferences"));
			}
			btn.setAttribute('tooltiptext', '左鍵：擴展及插件選單\n中鍵：啟用 / 停用 DOM & Element Inspector (重新啟動瀏覽器)\n右鍵：打開擴展管理員');
			btn.setAttribute('image', this.ICON_URL);
			btn.setAttribute('onclick', 'EOM.iconClick(event);');

			var mp = btn.appendChild($C('menupopup', {
				id: 'eom-button-popup',
				onpopupshowing: 'EOM.populateMenu(event.currentTarget)',
				onclick: 'event.preventDefault(); event.stopPropagation();',
				style: "max-width: 420px;"
			}));
			mp.addEventListener("mouseover", function (event) {event.originalTarget.setAttribute('closemenu', "none")}, true);
		},

		populateMenu: function(aParent) {
			var popup = aParent;
			var i, mi, addon, addons, menuIcon, df,
				sep, type, prevType, addStyle;
			var _this = this;

			for (i = 0, len = popup.childNodes.length; i < len; i++) {
				popup.removeChild(popup.firstChild);
			}

			AddonManager.getAddonsByTypes(this.ADDON_TYPES, function(addonlist) {
				addons = Array.slice(addonlist);
			});

			var thread = Services.tm.mainThread;
			while (addons == void(0)) {
				thread.processNextEvent(true);
			}

			function sortPosition(addon) {
				if ('STATE_ASK_TO_ACTIVATE' in AddonManager && addon.userDisabled == AddonManager.STATE_ASK_TO_ACTIVATE)
					return EOM.sort.clickToPlay;
				return (!addon.isActive) ? EOM.sort.disabled : EOM.sort.enabled;
			}

			function key(addon) {
				return EOM.ADDON_TYPES.indexOf(addon.type) + '\n' + sortPosition(addon) + '\n' + addon.name.toLowerCase();
			}

			addons.sort(function(a, b) {
				var ka = key(a);
				var kb = key(b);
				return ka == kb ? 0 : ka < kb ? -1 : 1;
			});

			for (i = 0, len = addons.length; i < len; i++) {
				addon = addons[i];
				df = document.createDocumentFragment();
				sep = $C('menuseparator');

				if ((!addon.appDisabled || (addon.appDisabled && this.SHOW_APPDISABLED)) && ((addon.isActive && addon.optionsURL) || ((addon.userDisabled && this.SHOW_USERDISABLED) || (!addon.userDisabled && this.SHOW_ALL) || (addon.appDisabled && this.SHOW_APPDISABLED)))) {
					type = addon.type;
					if (prevType && type != prevType)
						df.appendChild(sep);
					prevType = type;
					menuIcon = addon.iconURL
							|| type == 'extension' && 'chrome://mozapps/skin/extensions/extensionGeneric-16.png'
							|| type == 'plugin' && 'chrome://mozapps/skin/plugins/pluginGeneric-16.png';
					date = new Date(addon.updateDate);
					updateDate = date.getFullYear() + '年' + (date.getMonth()+1) + "月" + date.getDate() + '日';
					mi = $C('menuitem', {
						label: _this.SHOW_VERSION ? addon.name += ' ' + '[' + addon.version + ']' : addon.name,
						tooltiptext: '左鍵：啟用 / 禁用擴展' + ' (Size: ' + Math.floor(addon.size / 1024) + 'KB)' + '\n中鍵：打開擴展主頁 - ' + addon.homepageURL + '\n右鍵：打開擴展選項 - ' + addon.optionsURL + '\nCtrl + 左鍵：打開擴展的安裝文件夾\nCtrl + 中鍵：複製擴展 ID - ' + addon.id + ' 和\n　　　　　　圖標地址 - ' + addon.iconURL + '\nCtrl + 右鍵：移除擴展' + '\n\n更新日期：' + updateDate + '\n說明：' + addon.description,
						class: 'menuitem-iconic',
						image: menuIcon
					});
					if (addon.type == 'plugin') {
						mi.setAttribute("tooltiptext", '左鍵：啟用 / 禁用插件' + ' (Size: ' + Math.floor(addon.size / 1024) + 'KB)' + '\nCtrl + 中鍵：複製插件 ID - ' + addon.id + ' 和\n　　　　　　圖標地址 - ' + addon.iconURL + '\n\n更新日期：' + updateDate + '\n說明：' + addon.description)
					}
					mi.addon = addon;
					mi.addEventListener('click', function(e) {
						EOM.itemClick(e, this.addon);
					}, true);
					EOM.setDisabled(mi, addon.userDisabled);
					EOM.setUninstalled(mi, addon.pendingOperations != 0);
					addStyle = mi.style;

					if (!addon.optionsURL && addon.isActive)
						addStyle.color = 'blue';
					if (!addon.optionsURL && !addon.homepageURL && addon.isActive)
						addStyle.color = 'red';
					if (addon.userDisabled)
						addStyle.color = 'gray';
					if (addon.type == 'plugin' && 'STATE_ASK_TO_ACTIVATE' in AddonManager && addon.userDisabled == AddonManager.STATE_ASK_TO_ACTIVATE)
						addStyle.color = 'green';

					df.appendChild(mi);
					popup.appendChild(df);
				}
			}

			var menusep = popup.insertBefore($C('menuseparator'), popup.firstChild);
			var menugroup = popup.insertBefore($C("menugroup", {
				id: "eom-menugroup"
			}), menusep);

			for (let i = 0, menu; menu = mMenus[i]; i++) {
				let menuItem = menugroup.appendChild($C("menuitem", {
					label: menu.alabel,
					tooltiptext: menu.label,
					image: menu.image,
					class: "menuitem-iconic",
					oncommand: menu.oncommand,
					style: menu.style || "max-width: 10px;"
				}));
			}
		},

		iconClick: function(event) {
			switch (event.button) {
			case 1:
				EOM.DOMEI(event);
				break;
			case 2:
				gBrowser.selectedTab = gBrowser.addTab('about:addons');
				event.preventDefault();
				break;
			}
		},

		DOMEI: function(event) {
			var { AddonManager } = Components.utils.import("resource://gre/modules/AddonManager.jsm", {});
			var AddonIDs = [
				'inspector@mozilla.org',
				'InspectElement@zbinlin',
				];
			for(n = 0; n < AddonIDs.length; n++) {
				AddonManager.getAddonByID(AddonIDs[n], function(addon) {
					addon.userDisabled = addon.userDisabled ? false : true;
				});
			}
			Application.restart();
		},

		CopyList: function(event) {
			Application.extensions ? Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(Application.extensions.all.map(function(item, id) {
				return id + 1 + ". " + item._item.name + " [" + item._item.version + "]" + "\nID:" + item._item.id;
			}).join("\n")) : Application.getExtensions(function(extensions) {
				Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(extensions.all.map(function(item, id) {
					return id + 1 + ". " + item._item.name + " [" + item._item.version + "]" + "\nID:" + item._item.id;
				}).join("\n"));
			})
			XULBrowserWindow.statusTextField.label = "擴展清單已複製";
		},

		itemClick: function(e, aAddon) {
			var addon = aAddon;
			var mi = e.target;
			var ctrl = e.ctrlKey,
				shift = e.shiftKey,
				alt = e.altKey;
			switch (e.button) {
			case 0:
				// 啟用/禁用擴展 (有効/無効を切り替え)
				if (!ctrl && !shift && !alt) {
					let curDis = addon.userDisabled;
					let newDis;
					if ('STATE_ASK_TO_ACTIVATE' in AddonManager && curDis == AddonManager.STATE_ASK_TO_ACTIVATE)
						newDis = false;
					else if (!curDis)
						newDis = true;
					else {
						if (this.isAskToActivateAddon(addon))
							newDis = AddonManager.STATE_ASK_TO_ACTIVATE;
						else
							newDis = false;
					}
					addon.userDisabled = newDis;
					this.setDisabled(mi, newDis);
				}
				// 打開擴展的安裝文件夾 (拡張のフォルダを開く)
				else if (ctrl && !shift && !alt) {
					var dir = Services.dirsvc.get('ProfD', Ci.nsIFile);
					var nsLocalFile = Components.Constructor('@mozilla.org/file/local;1', 'nsILocalFile', 'initWithPath');
					dir.append('extensions');
					dir.append(addon.id);
					var fileOrDir = dir.path + (dir.exists() ? '' : '.xpi');
					try {
						(new nsLocalFile(fileOrDir)).reveal();
					} catch (ex) {
						var addonDir = /.xpi$/.test(fileOrDir) ? dir.parent : dir;
						try {
							if (addonDir.exists()) {
								addonDir.launch();
							}
						} catch (ex) {
							var uri = Services.io.newFileURI(addonDir);
							var protSvc = Cc['@mozilla.org/uriloader/external-protocol-service;1'].getService(Ci.nsIExternalProtocolService);
							protSvc.loadUrl(uri);
						}
					}
				}
				break;
			case 1:
				// 打開擴展首頁 (拡張のウェブページを開く)
				if ((!ctrl && !shift && !alt) && addon.homepageURL) {
					openLinkIn(addon.homepageURL, 'tabshifted', {}); // 'tab' で背面に開く
				}
				// 複製擴展 ID 和圖標地址 (いろいろコピー)
				else if (ctrl && !shift && !alt) {
					clipboard = Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper);
					clipboard.copyString("id: " + addon.id + "\r\n" + "iconURL: " + addon.iconURL);
				}
				break;
			case 2:
				// 打開擴展選項 (拡張の設定画面を開く)
				if ((!ctrl && !shift && !alt) && addon.optionsURL) {
					if (addon.optionsType == 2) {
						BrowserOpenAddonsMgr('addons://detail/' + encodeURIComponent(addon.id) + ('/preferences'));
					} else {
						openDialog(addon.optionsURL, addon.name, 'chrome,titlebar,toolbar,resizable,scrollbars,centerscreen,dialog=no,modal=no');
					}
				}
				// 移除擴展 (アンインストール)
				else if (ctrl && !shift && !alt) {
					(addon.pendingOperations & AddonManager.PENDING_UNINSTALL) ? addon.cancelUninstall() : addon.uninstall();
					this.setUninstalled(mi, addon.pendingOperations & AddonManager.PENDING_UNINSTALL);
				}
				break;
			}
		},

		isAskToActivateAddon: function(addon) {
			return addon.type == 'plugin'
					&& 'STATE_ASK_TO_ACTIVATE' in AddonManager
					&& Application.prefs.getValue('plugins.click_to_play', false);
		},

		setDisabled: function(mi, disabled) {
			var askToActivate = 'STATE_ASK_TO_ACTIVATE' in AddonManager && disabled == AddonManager.STATE_ASK_TO_ACTIVATE;
			(askToActivate) ? mi.classList.add('askToActivate') : mi.classList.remove('askToActivate');
			(disabled && !askToActivate) ? mi.classList.add('addon-disabled') : mi.classList.remove('addon-disabled');
		},

		setUninstalled: function(mi, uninstalled) {
			(uninstalled) ? mi.classList.add('addon-uninstall') : mi.classList.remove('addon-uninstall');
		}
	};
	var mMenus = [
		{
			alabel: '重新啟動瀏覽器',
			label: '清除 startupCache',
			image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACgElEQVQ4jY2RfUzMARjHv7tODnmJOxGm3LnKe3fnoh+W184ypjmZpZrQFLOSstns5g/cIXq9fuqQUd4tx0jFcLVRrSxNNE2bsUYY5Sr09Y9u2Nz6/vk83+ez5/s8gBvFAbKCUKw7Hz6o3KrDDHfev5Qmx/BCAVvKklR1b8rSWHMovM+ignJAw6IeEZU7FC3tNxeSjWvJF8l8Z0/tu5eyqKloiWd6MjDELcCqg/5hqk8bm8LIulCyQiCrjGRVCjuupbN04+Tygyoo3EIypkNVluDd0OsIJe+F8KV5IjtFFXkhnM7iRF5eM+aaEfBwDeTpEGDVQcgLwTyTAl4AIGqhrNg+uvlzaTBti3D0nEGa2W6ZRNoW87VpAfPnwuAC2I1eLa3FMT8cphVOUQtNfz1XA1XJqkH3bQJWAkBJhMcZ54mp/Hl4Fq8aPM+5AFUxsi42JLFR3PwtQ40J/ySShAHS31sFPt873smjKjqihr5yOSo3DH7NO2vZkm/8njUb+v/dJg6Q1e6Sv2FOIOs3jfzqalxYjlM/CrXsvrWVxSs9TwFAjh7q0wKsohbyft8RJcZWJ4zp+nTAj4/WD/v45+vCWtN9SHsk2zINLJiPvVYdNjRbo2mP9X9i8cM4ADAp4FUoINYmIP6kgNV/5bwaIS3tOaEmr0Tybe5qPtg553N3dRa/1Yi8ETvNYQ6A7/+iAQDMAfC9bZQ97jT7k0ULyevR5KUo8qzAnrt7WJ6oeSpqMdMtRNRCXrJMkl27bWTHh/3jfzJDSWb4s/eYmg37QliwALvdAvplCcJUR8yI953mKayP9/5ycRls2cHQAZAMCGDyw6grBumz4qUS83ENgtx5fwEzyhRmLMK7zwAAAABJRU5ErkJggg==",
			oncommand: "Services.appinfo.invalidateCachesOnRestart() || Application.restart();",
			style: "min-width: 358px;"
		},
		{
			label: "打開擴展目錄",
			image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADEElEQVQ4jY2RXUiTcRjF/9JFpBAapk5NnWzzI5vTbb5uuunrtFm5XCpi7tVEs0zU9aFFk6wmiV9RfrRqkRgZhVIZSjXUNDPCmaamlZQQ0gdFVxGFbu10paXzonN5Hs6P5zkPISsVniYjArXAzv8vceVyIi8A71g7hNW9k56eQsfFEYeQtUlOzqFJ69dzV4uuIbw4LxLB7CCyfNDGccgujcE9rqgvM4D6ZAjmvKjm+HYUbWShLYxn65Rsfro87iHwI9H5YBUYsankGqQXnkNycQyBlSaIK+7i6x4pblFBn/e6usMUswVP4vgzjKMr6y/ANYhFonIR1WxGTMsrSI2TEBnGwG8cgUjfjY+7JeiL5eM8zx/jieEYUYThPhVireP6Zi4iHEhk9im/Q20vvAuvQNBoRkjDMJry9mM0NRrv0yi8U0fgTZIIU4lCjNECm1kuQDXbh/m7RVzxARJ/pJLI8uF3oguc+iG0ZqSiR03jbbIYw2oRLhdSMCvCYIoIfqZycfH5twUHIs1d2LDXgI3F1+Bf8xjeVf1w1/fAu/QmprcJUX9UCk27EvcSQtEZHjRo94Z18qwPXsc64FczCK8zj+B2+iHoWiNS9BVo04hwSB+FlNZ45FRIoaigPtgBjuZtvlXZUIDx4cNIb2rGhvJOfDFrYOpVIePmVqS0JkBlVEDZSEN8Ujy7FExRurIMx0N0tdrA0S5jPKxzJdA0n4OHrg1fzAxeDqpxp0sJ7VUaygYa7JKA64SQNUuAg7t9yw06PoY7d+F1vwbWuRL8nNmHH1M5sEwzmJ9Ih2VUDX1LLGJrYsDRhsAjj3t7CcAkuYW2N9LfrF91sH4qg3VOC8tsAb5PZMMyzWDApMLOszLIqmQ2ySkZhMejEFAknFx2/8EsbtCD1sSpoY5kWOe0MF2NHzhTxPv9a1KD+907EK4T2/ilIoSWRdrc0tmMk8Rli12JRzTstK4rCfML74ttN+qo5NIstqq3ha46fThY4Ug7J7MY7rfgYspCBM7OduFFZW/34uWm+vivOgxw9HSiXPgr7T+DX3N5gyCN2AAAAABJRU5ErkJggg==",
			oncommand: "FileUtils.getFile('ProfD', ['extensions']).reveal();"
		},
		{
			label: "複製擴展清單",
			image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABlSURBVDhP5Y5BCsAgEAP3i/1AP+D/zxUlwWBXXQueOhAQzQStcN3p2UmVFK80C7QGH1aEBniOBPqhgRnsQB8P8KzRe+i/+YHCO+htQNPjdaB/G4D6hoWekFzQohfUxngSg4pglgGUsQ0ZR4jGSwAAAABJRU5ErkJggg==",
			oncommand: "EOM.CopyList(event);"
		}
	];
	var css = '\
		#eom-button dropmarker {display:none;}\
		#eom-button, #eom-button > .toolbarbutton-icon {padding:0!important;}\
		#eom-menugroup .menu-iconic-icon {margin-left:2px;}\
		.addon-disabled > .menu-iconic-left {filter:url("chrome://mozapps/skin/extensions/extensions.svg#greyscale")}\
		.addon-disabled label {opacity:0.8;}\
		.addon-disabled label:after {content:"停用";}\
		.addon-uninstall label {font-weight:bold!important;}\
		.addon-uninstall label:after {content:"移除";}\
		'.replace(/[\r\n\t]/g, '');;
	EOM.style = addStyle(css);
	EOM.init();
	function $(id) document.getElementById(id);
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
})();

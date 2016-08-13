// ==UserScript==
// @name				AnotherButton
// @description			可移動的按鈕菜單
// @author				feiruo
// @modified    skofkyo
// @compatibility 		Firefox 45+
// @charset 			UTF-8
// @include				main
// @id 					[A26C02CA]
// @startup        		window.anobtn.init();
// @shutdown       		window.anobtn.unint(true);
// @reviewURL			http://bbs.kafan.cn/thread-1657589-1-1.html
// @homepageURL	 		https://github.com/feiruo/userChromeJS/tree/master/anoBtn
// @version		 		1.3.0.9-2016.08.14 UC细线图标
// @note		 		1.3.0.9	2016.08.12 增加UC腳本管理功能
// @note		 		1.3.0.8	2016.07.30 搬運addMenuPlus代碼 增加函數功能 text,url 可用 %u返回當前頁面網址 %s返回當前選取的文字 %es%返回當前選取的文字並進行UTF-8 URI編碼 %p返回剪貼簿文字 %ep%返回剪貼簿文字並進行UTF-8 URI編碼
// @note		 		1.3.0.7	2016.07.17 23:34 修正新視窗無法正常載入選單的問題 by skofkyo
// @note		 		1.3.0.x	xxxx.xx.xx 使用CustomizableUI.createWidget.jsm建立按鈕 配置文件內的按鈕設置不適用此mod by skofkyo
// @note		 		1.3.0	2014.08.12 19:00 支持多級菜單，不限制菜單級數。
// @note		 		1.2.1
// @note 			1.2修復按鈕移動之後重載殘留問題，增加菜單彈出位置選擇。
// @note 			1.1解決編輯器中文路徑問題，修改菜單，提示等文字。
// @note 			1.0
// @note         	  	支持菜單和腳本設置重載
// @note          		需要 _anoBtn.js 配置文件
// ==/UserScript==
(function() {
    var icon = 0; // 0為UC细线圖標 1為三槓動畫圖標
    var delay = 800;//延遲加載選單
    var anobtn = {
        editor: 1,//UC腳本編輯器設置
        //editor: 'D:\\Software\\TeraPad\\TeraPad.exe',//UC腳本編輯器設置
        removeExt: true, //腳本名稱不顯示 uc.js/uc.xul
        anobtn: true,//強制啟用AnotherButton腳本true/false 避免意外關閉
        get file() {
            let aFile;
            aFile = Services.dirsvc.get("UChrm", Ci.nsILocalFile);
            aFile.appendRelativePath("Local");
            aFile.appendRelativePath("_anoBtn.js");
            delete this.file;
            return this.file = aFile;
        },
        get focusedWindow() {
            return gContextMenu && gContextMenu.target ? gContextMenu.target.ownerDocument.defaultView : (content ? content : gBrowser.selectedBrowser.contentWindowAsCPOW);
        },
        startup: function() {
            setTimeout(function(event) {
                anobtn.reload(true);
            }, delay);
        },
        init: function() {
            var ins;
            ins = $("devToolsSeparator");
            ins.parentNode.insertBefore($C("menuitem", {
                id: "anobtn_set",
                class: "menuitem-iconic",
                label: "AnotherButton",
                tooltiptext: "左鍵：重載配置\n右鍵：編輯配置",
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAjUlEQVQ4jeWTQQ7DIAwEfcpn/IR69n3trXkTfCf5QnopEYpSQFyLxA2Pd83agCTpmLlAstniLyCfAJs9LYC7L5JWYLt03iSt7r40AZLeHRvP2xkAycysdI6IqMEREUWJAfl2OB17Q7OrH5XvLupmAHlU3ZDMf7HwKwfA48xBR0EzicCrCah2Yb8U7mUXPmgv3jqIXPj2AAAAAElFTkSuQmCC",
                oncommand: "setTimeout(function(){ anobtn.reload(true); }, 10) && anobtn.alert('配置已經重新載入');",
                onclick: "if (event.button == 2) { event.preventDefault(); closeMenus(event.currentTarget);anobtn.EditFile(anobtn.file); }",
            }), ins);
            this.addmenumovebtn();
            this.addstyle();
            this.addPrefListener(anobtn.readLaterPrefListener);
            window.addEventListener('unload', function() {anobtn.removePrefListener(anobtn.readLaterPrefListener);}, false);
            if (this.anobtn) window.addEventListener('DOMWindowClose', anobtn.anobtntrue, false);
        },
        addmenumovebtn: function() {
            CustomizableUI.createWidget({
                defaultArea: CustomizableUI.AREA_NAVBAR,
                id: "anobtn",
                type: 'custom',
                onBuild: function(aDocument) {
                    var toolbarbutton = aDocument.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
                    var props = {
                        id: "anobtn",
                        class: "toolbarbutton-1 chromeclass-toolbar-additional",
                        label: "Anobtn",
                        removable: "true",
                        overflows: "false",
                        type: "menu",
                        context: "_child",
                        tooltiptext: '左鍵：AnotherButton選單\n中鍵：打開Chrome資料夾\n右鍵：重新啟動(清除緩存)',
                        onclick: 'anobtn.onClick(event)',
                        popup: "anobtn_popup"
                    };
                    for (var p in props) {
                        toolbarbutton.setAttribute(p, props[p]);
                    };
                    return toolbarbutton;
                }
            });
        },
        addstyle: function() {
            if (icon == 0) {
                var cssStr = '@-moz-document url("chrome://browser/content/browser.xul"){' 
                + '#anobtn .toolbarbutton-icon {list-style-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIUlEQVQ4jWNgoBL4T6L4qAGD1gByMNkuIxqMGkCFWCAIADkHKNi3qrUNAAAAAElFTkSuQmCC)}' 
                + '.anobtnuc.menu-iconic menuitem[checked="false"]'
                + '{-moz-box-ordinal-group:99!important;}'
                + '}';
                var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
                var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
                sss.loadAndRegisterSheet(ios.newURI("data:text/css;base64," + btoa(cssStr), null, null), sss.USER_SHEET);
            } else if (icon == 1) {
                var cssStr = '@-moz-document url("chrome://browser/content/browser.xul"){' 
                + '#TabsToolbar #anobtn {background: none !important;}' 
                + '#anobtn .toolbarbutton-icon{' 
                + 'list-style-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAQCAYAAAB+690jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAsdJREFUeNrMVltrE0EUntndNNWEtFZjbEsrtqmRmksx+guKlEIQfRAR9En0QXzzd/gu2EdfvSBFCJKCN1BrMSWgsUqb2IZeTGqbNCGb3dnxnJCUcXvJ+NbAxwyZc749c/abb5ZyzslB+lFHR087jMcAHoDSIt4CFAF5QFVcMB7lHDC4AMhHW/DwRn4ZU8UFDeBLxCfvnwmcPiKzg/T3uT+jY7EHMM3+s7Dy0zMaGog7VCUqw2MwayaRmh8jJ/wFe0GdQ0NDTpNZJRkijMUce0H09y93yTgVrelM6tW0KSSKOdxWkAK90z9+mt6EuSkDjMWcHU/IpdnmZjFpmiaRAcZizg4NaZ6eLtw4vPXuRsewAx0A9y6aMkEcqzAuADZETbFozEmo0ke0tuPApRCnS+Me7yHS7nYSRbVpijPSdrhAuv1L3H+hKGqKqp4etVEEipJSSvrik89uhIJnXTKt//otXbo4fumhxcmSyMPH73Wdu3b7qcPhiMjwmBafmc7mxzSFEmxbRVg7OTw8bIKm1mWIAoEAbqiTTeSyIg9NTXWsV61IrVKV1BSta0rZ5Tzqb9+9rzSOY0tg7F6aKpaKScMwiAwwFnPQh5oUTT/qBwzCQ3wNTe3lR1uAAuwgA+MPcyLX7Gjdj+jcBy9ZXegntcpR6Je6OwvjpLql042VLVIpLhNuLYoP9L188eT6SCTcLtPimS9JLXb56hsofJ6IHQI/GnDTuNrrjZJeb0sexthsZur5Ffr6MR4WXSyoMxQM6obJyjIFjYTDGhwdFQ5BXTdM8KM88UV1JnclOVUa4YPnLWsiV+dRRO3EXyUMWT/C2L20Uy5XpP0IY0U/0gQ1r926c3da8KN9TynEL8O4Zr+1aGa2xLOpm9t+tP+NZhGztka5VeL2guAPdOsUTNKSlyN2U7cH0s+TKHbU1eL/8GznH7TPj78CDAD/U5+2FYl1DgAAAABJRU5ErkJggg==") !important;' 
                + '}' 
                + '#anobtn:not(:hover) .toolbarbutton-icon {' 
                + '-moz-image-region: rect(0px 18px 16px 0px) !important;' 
                + '-moz-transition: all 0.2s !important;' 
                + '}' 
                + '#anobtn:hover .toolbarbutton-icon {' 
                + '-moz-image-region: rect(0px 36px 16px 18px) !important;' 
                + '-moz-transition: all 0.2s !important;' 
                + '}' 
                + '.anobtnuc.menu-iconic menuitem[checked="false"]'
                + '{-moz-box-ordinal-group:99!important;}'
                + '}';
                var sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
                var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
                sss.loadAndRegisterSheet(ios.newURI("data:text/css;base64," + btoa(cssStr), null, null), sss.USER_SHEET);
            }
        },
        reload: function(event) {
            var aFile = this.file;
            var data = loadFile(this.file);
            if (!aFile || !aFile.exists() || !aFile.isFile() || !data) return this.alert('Load Error: 配置文件不存在');
            var sandbox = new Cu.Sandbox(new XPCNativeWrapper(window));
            sandbox.Components = Components;
            sandbox.Cc = Cc;
            sandbox.Ci = Ci;
            sandbox.Cr = Cr;
            sandbox.Cu = Cu;
            sandbox.Services = Services;
            sandbox.locale = Services.prefs.getCharPref("general.useragent.locale");
            try {
                Cu.evalInSandbox(data, sandbox, "1.8");
            } catch (e) {
                this.alert('Error: ' + e + '\n請重新檢查配置文件');
                return;
            }
            try {
                this.unint();
            } catch (e) {}
            this.anomenu = sandbox.anomenu;
            $("mainPopupSet").appendChild(this.makepopup());
        },
        unint: function(real) {
            for (var i = 0; i < this.anomenu.length; i++) {
                var obj = this.anomenu[i];
                try {
                    $("main-menubar").insertBefore($(obj.id), $("main-menubar").childNodes[7]);
                } catch (e) {}
            }
            $("anobtn_popup").removeEventListener('popupshowing', (event) => anobtn.onpopup(event));
            $("mainPopupSet").removeChild($("anobtn_popup"));
            if (real) {
                $("anobtn_set").parentNode.removeChild($("anobtn_set"));
            }
        },
        makepopup: function(event) {
            var popup = $C("menupopup", {
                id: "anobtn_popup",
                position: "after_start",
                onclick: 'event.preventDefault(); event.stopPropagation();',
            });
            popup.addEventListener('popupshowing', (event) => anobtn.onpopup(event));
            var obj, menuitem;
            for (var i = 0; i < this.anomenu.length; i++) {
                obj = this.anomenu[i];
                menuitem = $(obj.id);
                if (menuitem) {
                    for (let [key, val] in Iterator(obj)) {
                        if (typeof val == "function") obj[key] = val = "(" + val.toSource() + ").call(this, event);";
                        menuitem.setAttribute(key, val);
                    }
                    menuitem.classList.add("anobtn");
                    menuitem.classList.add("menu-iconic");
                } else {
                    menuitem = obj.child ? this.newMenu(obj) : this.newMenuitem(obj);
                }
                popup.appendChild(menuitem);
            }
            return popup;
        },
        newMenu: function(menuObj, islow) {
            var menu = $C("menu");
            var popup = menu.appendChild($C("menupopup"));
            for (let [key, val] in Iterator(menuObj)) {
                if (key === "child") continue;
                if (typeof val == "function") menuObj[key] = val = "(" + val.toSource() + ").call(this, event);"
                menu.setAttribute(key, val);
            }
            menuObj.child.forEach(function(obj) {
                popup.appendChild(this.newMenuitem(obj));
            }, this);
            let cls = menu.classList;
            cls.add("anobtn");
            cls.add("menu-iconic");
            return menu;
        },
        newMenuitem: function(obj) {
            if (obj.child) return this.newMenu(obj);
            var menuitem;
            if (obj.label === "separator" || (!obj.label && !obj.text && !obj.oncommand && !obj.command)) {
                menuitem = $C("menuseparator");
            } else {
                menuitem = $C("menuitem");
            }
            for (let [key, val] in Iterator(obj)) {
                if (typeof val == "function") obj[key] = val = "(" + val.toSource() + ").call(this, event);";
                menuitem.setAttribute(key, val);
            }
            var cls = menuitem.classList;
            cls.add("anobtn");
            cls.add("menuitem-iconic");
            if (obj.oncommand || obj.command) return menuitem;
            if (obj.exec) {
                obj.exec = this.handleRelativePath(obj.exec);
            }
            menuitem.setAttribute("oncommand", "anobtn.onCommand(event);");
            this.setIcon(menuitem, obj);
            return menuitem;
        },
        setIcon: function(menu, obj) {
            if (menu.hasAttribute("src") || menu.hasAttribute("image") || menu.hasAttribute("icon")) return;
            if (obj.exec) {
                var aFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
                try {
                    aFile.initWithPath(obj.exec);
                } catch (e) {
                    return;
                }
                if (!aFile.exists()) {
                    menu.setAttribute("disabled", "true");
                } else {
                    let fileURL = Services.io.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler).getURLSpecFromFile(aFile);
                    menu.setAttribute("image", "moz-icon://" + fileURL + "?size=16");
                }
                return;
            }
        },
        onpopup: function(event) {
            var mp = event.target;
            if (mp !== event.currentTarget) {
                return;
            }
            var nodes = mp.querySelectorAll('.anobtnuc.menu-iconic');
            for (var i = 0, len = nodes.length; i < len; i++) {
                nodes[i].parentNode.removeChild(nodes[i]);
            }
            var sep = document.createElement('menuseparator');
            sep.setAttribute('class', 'anobtnuc menu-iconic');
            mp.appendChild(sep);
            var scripts = userChrome_js.scripts.concat(userChrome_js.overlays);
            for (let j = 0, lenj = userChrome_js.arrSubdir.length; j < lenj; j++) {
                var dirName = (userChrome_js.arrSubdir[j] == '') ? 'root' : userChrome_js.arrSubdir[j];
                var flg = false;
                for (var i = 0, len = scripts.length; i < len; i++) {
                    var script = scripts[i];
                    if (script.dir !== dirName) continue;
                    flg = true;
                    break;
                }
                if (!flg) continue;
                var menu = mp.appendChild(document.createElement('menu'));
                menu.setAttribute('label', 'chrome/' + (dirName == 'root' ? '' : dirName));
                menu.setAttribute('tooltiptext', '右鍵：打開資料夾');
                menu.setAttribute('class', 'anobtnuc menu-iconic');
                menu.setAttribute('onclick', 'anobtn.menuClick(event);');
                menu.dirName = dirName;
                var mp = menu.appendChild(document.createElement('menupopup'));
                mp.setAttribute('onpopupshowing', 'event.stopPropagation();');
                var flg = false;
                for (let i = 0, len = scripts.length; i < len; i++) {
                    var script = scripts[i];
                    var type = script.filename.lastIndexOf('uc.js') !== -1;
                    if (script.dir != dirName) continue;
                    if (flg && type !== flg) {
                        var sep = document.createElement('menuseparator');
                        mp.appendChild(sep);
                    }
                    flg = type;
                    var mi = mp.appendChild(document.createElement('menuitem'));
                    mi.setAttribute('label', this.removeExt ? script.filename.replace(/\.uc\.js$|\.uc\.xul$/g, '') : script.filename);
                    mi.setAttribute('oncommand', 'anobtn.chgScriptStat(script.filename);');
                    mi.setAttribute('onclick', 'if (event.button !== 0) { event.preventDefault(); event.stopPropagation(); anobtn.clickScriptMenu(event); }');
                    //mi.setAttribute('closemenu', 'none');
                    mi.setAttribute('type', 'checkbox');
                    mi.setAttribute('checked', !userChrome_js.scriptDisable[script.filename]);
                    if (script.description) {
                        mi.setAttribute('tooltiptext', '左鍵：啟用 / 禁用\n中鍵：復選啟用 / 禁用\n右鍵：編輯\n\n' + '說明：' + script.description);
                    } else {
                        mi.setAttribute('tooltiptext', '左鍵：啟用 / 禁用\n中鍵：復選啟用 / 禁用\n右鍵：編輯');
                    }
                    mi.script = script;
                }
                mp = event.target;
            }
        },
        onCommand: function(event) {
            var menuitem = event.target;
            var text = menuitem.getAttribute("text") || "";
            var exec = menuitem.getAttribute("exec") || "";
            var url = menuitem.getAttribute("url") || "";
            var where = menuitem.getAttribute("where") || "";
            if (url)
                this.openCommand(event, this.convertText(url), where);
            else if (exec)
                this.exec(exec, this.convertText(text));
            else if (text)
                this.copy(this.convertText(text));
        },
        openCommand: function(event, url, where, postData) {
            var uri;
            try {
                uri = Services.io.newURI(url, null, null);
            } catch (e) {
                return this.log(U("URL 不正確: ") + url);
            }
            if (uri.scheme === "javascript")
                loadURI(url);
            else if (where)
                openUILinkIn(uri.spec, where, false, postData || null);
            else if (event.button == 1)
                openNewTabWith(uri.spec);
            else openUILink(uri.spec, event);
        },
        convertText: function(text) {
            var tab = document.popupNode && document.popupNode.localName == "tab" ? document.popupNode : null;
            var win = tab ? tab.linkedBrowser.contentWindow : this.focusedWindow;
            text = text.toLocaleLowerCase()
            .replace("%u", win.location.href)//當前網址
            .replace("%s", this.getSelection(win))//當前選取的文字
            .replace("%es%", encodeURIComponent(this.getSelection(win)))//對選取文字進行URI編碼
            .replace("%p", readFromClipboard())//剪貼簿文字
            .replace("%ep%", encodeURIComponent(readFromClipboard()));//對剪貼簿文字進行URI編碼
            if (text.indexOf('\\') === 0)
                text = Services.dirsvc.get("ProfD", Ci.nsILocalFile).path + text;//開頭為"\\"則為配置資料夾的相對路徑加上text的路徑
            return text;
        },
        copy: function(aText) {
            Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(aText);
        },
        exec: function(path, arg) {
            var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
            var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
            if (path.indexOf('\\') === 0)
                path = Services.dirsvc.get("ProfD", Ci.nsILocalFile).path + path;//開頭為"\\"則為配置資料夾的相對路徑加上exec的路徑
            try {
                var a;
                if (typeof arg == 'string' || arg instanceof String) {
                    a = arg.split(/\s+/)
                } else if (Array.isArray(arg)) {
                    a = arg;
                } else {
                    a = [arg];
                }
                file.initWithPath(path);
                if (!file.exists()) {
                    Cu.reportError('File Not Found: ' + path);
                    alert("程序路徑出錯或程序不存在，請檢查配置");
                    return;
                }
                if (file.isExecutable()) {
                    process.init(file);
                    process.runw(false, a, a.length);
                } else {
                    file.launch();
                }
            } catch (e) {
                this.log(e);
            }
        },
        handleRelativePath: function(path) {
            if (path) {
                path = path.replace(/\//g, '\\').toLocaleLowerCase();
                var profD = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get("ProfD", Ci.nsILocalFile);
                if (/^(\\)/.test(path)) {
                    if (path.startsWith('\\..\\')) {
                        return profD.parent.path + path.replace('\\..', '');
                    }
                    return profD.path + path;
                } else {
                    return path;
                }
            }
        },
        getSelection: function(win) {
            win || (win = this.focusedWindow);
            var selection = this.getRangeAll(win).join(" ");
            if (!selection) {
                let element = document.commandDispatcher.focusedElement;
                let isOnTextInput = function(elem) {
                    return elem instanceof HTMLTextAreaElement ||
                        (elem instanceof HTMLInputElement && elem.mozIsTextField(true));
                };
                if (isOnTextInput(element)) {
                    selection = element.QueryInterface(Ci.nsIDOMNSEditableElement).editor.selection.toString();
                }
            }
            if (selection) {
                selection = selection.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ");
            }
            return selection;
        },
        getRangeAll: function(win) {
            win || (win = this.focusedWindow);
            var sel = win.getSelection();
            var res = [];
            for (var i = 0; i < sel.rangeCount; i++) {
                res.push(sel.getRangeAt(i));
            };
            return res;
        },
        alert: function(aString, aTitle) {
            Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService).showAlertNotification("", aTitle || "Another Button", aString, false, "", null);
        },
        EditFile: function(aFile) {
            if (!aFile || !aFile.exists() || !aFile.isFile())
                return alert("Load Error: 設置檔不存在:\n" + aFile.path);
            var editor = Services.prefs.getCharPref("view_source.editor.path");
            if (!editor) {
                alert("請先設定文字編輯器的路徑!!!");
                var fp = Cc['@mozilla.org/filepicker;1'].createInstance(Ci.nsIFilePicker);
                fp.init(window, "設定全局腳本編輯器", fp.modeOpen);
                fp.appendFilter("執行檔案", "*.exe");
                if (fp.show() == fp.returnCancel || !fp.file)
                    return;
                else {
                    editor = fp.file;
                    Services.prefs.setCharPref("view_source.editor.path", editor.path);
                }
                return;
            }
            var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
            var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
            var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
            UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0 ? "BIG5" : "UTF-8";
            try {
                var path = UI.ConvertFromUnicode(aFile.path);
                var args = [path]
                file.initWithPath(editor);
                process.init(file);
                process.run(false, args, args.length);
            } catch (e) {}
        },
        menuClick: function(event) {
            switch (event.button) {
                case 2:
                    var menu, label, rlabel, fdir;
                    menu = event.target;
                    label = menu.getAttribute("label");
                    if (label == "chrome/") {
                        rlabel = label.replace("chrome/", "chrome");
                    } else {
                        rlabel = label.replace("\/", "\\");
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    fdir = "\\" + rlabel;
                    anobtn.exec(fdir);
                    break;
            }
        },
        onClick: function(event) {
            if (event.button === 1) {
                anobtn.open(0);
            } else if (event.button === 2) {
                event.preventDefault();
                event.stopPropagation();
                Services.appinfo.invalidateCachesOnRestart();
                ('BrowserUtils' in window) ? BrowserUtils.restartApplication(): Application.restart();
            }
        },
        edit: function(key, pathArray) {
            var vieweditor = Services.prefs.getCharPref("view_source.editor.path");
            var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
            UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0 ? "BIG5" : "UTF-8";
            var path = UI.ConvertFromUnicode(this.getPath(key, pathArray));
            if (this.editor === 1) {
                if (!vieweditor) {
                    alert("請先設定文字編輯器的路徑!!!");
                    var fp = Cc['@mozilla.org/filepicker;1'].createInstance(Ci.nsIFilePicker);
                    fp.init(window, "設定全局腳本編輯器", fp.modeOpen);
                    fp.appendFilter("執行檔案", "*.exe");
                    if (fp.show() == fp.returnCancel || !fp.file)
                        return;
                    else {
                        vieweditor = fp.file;
                        Services.prefs.setCharPref("view_source.editor.path", vieweditor.path);
                    }
                    return;
                }
                this.launch(Services.prefs.getCharPref('view_source.editor.path'), path);
            } else {
                this.launch(this.editor, path);
            }
        },
        open: function(key, pathArray, arg) {
            var path = this.getPath(key, pathArray);
            this.launch(path, arg);
        },
        launch: function(path, arg) {
            arg = [arg] || [];
            var file = this.getLocalFile(path);
            if (!file.exists()) {
                return;
            }
            if (file.isExecutable()) {
                var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
                process.init(file);
                process.run(false, arg, arg.length);
            } else {
                file.reveal();
            }
        },
        getLocalFile: function(path) {
            var file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
            file.initWithPath(path);
            return file;
        },
        getDir: function(key, pathArray) {
            var dir;
            if (key.indexOf('\\') !== -1) {
                dir = this.getLocalFile(key);
            } else {
                dir = Services.dirsvc.get(key, Ci.nsILocalFile);
            }
            if (pathArray != null) {
                for (var i = 0, len = pathArray.length; i < len; ++i) {
                    dir.append(pathArray[i]);
                }
            }
            return dir.path;
        },
        getPath: function(key, pathArray) {
            pathArray = pathArray || [];
            var path = '';
            switch (key) {
                case 0:
                    path = this.getDir('UChrm', pathArray);
                    break;
                case 1:
                    path = this.getDir('ProfD', pathArray);
                    break;
                case 2:
                    path = this.getDir('WinD', pathArray);
                    break;
                case 3:
                    path = this.getDir('ProgF', pathArray);
                    break;
                case 4:
                    path = pathArray;
                    break;
                case 'C':
                    path = this.getDir('C:\\', pathArray);
                    break;
                case 'D':
                    path = this.getDir('D:\\', pathArray);
                    break;
            }
            return path;
        },
        clickScriptMenu: function(event) {
            var target = event.target;
            var script = target.script;
            var fileURL = Services.io.getProtocolHandler('file').QueryInterface(Ci.nsIFileProtocolHandler).getFileFromURLSpec(script.url);
            if (event.button === 1) {
                this.chgScriptStat(script.filename);
                target.setAttribute('checked', !userChrome_js.scriptDisable[script.filename]);
            } else if (event.button === 2) {
                this.edit(4, fileURL.path);
            }
        },
        chgScriptStat: function(afilename) {
            var s = this.getPref('userChrome.disable.script');
            if (!userChrome_js.scriptDisable[afilename]) {
                s = (s + ',').replace(afilename + ',', '') + afilename + ',';
            } else {
                s = (s + ',').replace(afilename + ',', '');
            }
            s = s.replace(/,,/g, ',').replace(/^,/, '');
            this.setPref('userChrome.disable.script', s);
            userChrome_js.scriptDisable = this.restoreState(s.split(','));
        },
        restoreState: function(arr) {
            var disable = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                disable[arr[i]] = true;
            }
            return disable;
        },
        getPref: function(prefName) {
            return Preferences.get(prefName);
        },
        setPref: function(prefName, value) {
            Preferences.set(prefName, value);
        },
        addPrefListener: function(aObserver) {
            Services.prefs.addObserver(aObserver.domain, aObserver, false);
        },
        removePrefListener: function(aObserver) {
            Services.prefs.removeObserver(aObserver.domain, aObserver);
        },
        readLaterPrefListener: {
            domain: 'userChrome.disable',
            observe: function(aSubject, aTopic, aPrefstring) {
                if (aTopic === 'nsPref:changed') {
                    setTimeout(() => {
                        var s = anobtn.getPref('userChrome.disable.script');
                        userChrome_js.scriptDisable = anobtn.restoreState(s.split(','));
                    }, 0);
                }
            }
        },
        anobtntrue: function(event) {
            var duc = Services.prefs.getCharPref("userChrome.disable.script").replace(/AnotherButtonforUCmanage\.uc\.js\,/g, "")
            Services.prefs.setCharPref("userChrome.disable.script", duc);
        },
    };
    window.anobtn = anobtn;
    anobtn.startup();
    anobtn.init();
    function $(id) {
        return document.getElementById(id);
    }
    function log() {
        Application.console.log("[Another Button] " + Array.slice(arguments));
    }
    function $C(name, attr) {
        var el = document.createElement(name);
        if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
        return el;
    }
    function loadFile(aFile) {
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
    }
})();
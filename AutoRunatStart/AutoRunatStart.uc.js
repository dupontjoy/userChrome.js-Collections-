// ==UserScript==
// @name            Goagent.uc.js
// @namespace       http://www.firefoxfan.com
// @note            让Goagent 或其它更多程序随火狐同时启动
// @version         0.0.1
// ==/UserScript==

location == "chrome://browser/content/browser.xul" && (function () {
            var exeFilePath = [
            ".\\chrome\\Local\\GFW\\psiphon3.exe",
            //".\\目录\\程序.exe",
        ];//点.开头的是profile目录       
            var WM = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getXULWindowEnumerator(null);
            WM.getNext();
            if (!WM.hasMoreElements()) {
                    var killProcess = [];
                    exeFilePath.forEach(function (path) {
                            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                            file.initWithPath(path.replace(/^\./, Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile).path));
                            var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
                            process.init(file);
                            process.run(false, null, null);
                            killProcess.push(process.kill);
                    });
                    Application.storage.set("killProcess", killProcess);
            }
            window.addEventListener("unload", function () {
                    var WW = Components.classes["@mozilla.org/embedcomp/window-watcher;1"].getService(Components.interfaces.nsIWindowWatcher).getWindowEnumerator();
                    if (!WW.hasMoreElements()) {
                            [i() for each(i in Application.storage.get("killProcess", null))];
                            //killProcess("goagent.exe");    //杀掉GoAgent的进程
                            //killProcess("python27.exe");  //杀掉python27的进程
                    }
            }, false);

            function killProcess(name) {
                    var taskkill = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("SysD", Components.interfaces.nsILocalFile);
                    taskkill.append("taskkill.exe");
                    var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
                    process.init(taskkill);
                    process.run(false, ["/im", name, "/f"], 3);
            }
    })()
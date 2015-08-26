// ==UserScript==
// @name           Switch Proxy
// @namespace   switchProxy@slimx.com
// @description    快速切换代理状态,编辑pac文件
// @version        3.0.6.6
// @updateURL     https://j.mozest.com/ucscript/script/30.meta.js
// ==/UserScript==
var proxySwitcher = new function () {
    //文本编辑器的路径
    var editorPath = Services.dirsvc.get("ProfD", Ci.nsILocalFile).path + "\\..\\Software\\Notepad2\\Notepad2.exe";
    //pac文件的路径
    var pacPath = Services.dirsvc.get("UChrm", Ci.nsILocalFile).path + "\\local\\Pac\\autoproxy.pac";
    var pacPath2 = Services.dirsvc.get("UChrm", Ci.nsILocalFile).path + "\\local\\Pac\\autoproxy2.pac";
    //自动重载当前页面
    var autoReload = true;
    //指定代理使用的端口
    var ports = {"Shadowsocks":1080,"Goagent":8087, "Free Gate":8580,"Psiphon":8080,"Latern":8787,};
    //------------------------------------------------------------------------------------------------------------------
    var nowPac = gPrefService.getCharPref('network.proxy.autoconfig_url');
    var nowPort = gPrefService.getIntPref("network.proxy.http_port")
    var labels = ["Direct", "Proxy", "Auto"];

    function $E(/**String*/ parent, /**String*/ content) {
        var range = document.createRange();
        range.selectNodeContents($(parent));
        range.collapse(false);
        range.insertNode(range.createContextualFragment(content.replace(/\n|\t/g, '')));
        range.detach();
    }

    function $(e) {
        return document.getElementById(e);
    }

    function getValue() {
        return gPrefService.getIntPref("network.proxy.type");
    }

    function setLabel(index) {
        var type = labels[index];
        if (index=="1"){
    		nowPort = gPrefService.getIntPref("network.proxy.http_port")
            //should be proxy:port
            type=type+":"+nowPort
        }else if(index=="2"){//Auto:2,1
            if(nowPac==pacPath){
	            type=type+":1"
            }else if(nowPac==pacPath2){
	            type=type+":2"
            }else{
	            type=type+"other"
            }
        }
        $("proxySwitcher").setAttribute("label", type);

    }

    this.onPopup = function (event) {
        //todo
        var value = getValue();
        if (value == 0) {
            event.target.children[2].setAttribute("checked", true);
        } else if (value == 2) {
            event.target.children[3].setAttribute("checked", true);
        } else if (value == 1) {
            var port = gPrefService.getIntPref("network.proxy.http_port");
            Object.keys(ports).forEach(function (item, index) {
                if (ports[item] == port) {
                    event.target.children[index + 4].setAttribute("checked", true);
                }
            })
        }

    }

    this.switchP = function (index, port) {
        //change port
        if (index == 1) {
	        if(!port)port=nowPort;
            gPrefService.setIntPref('network.proxy.http_port', port);
        }
        gPrefService.setIntPref('network.proxy.type', index);
        setLabel(index);
    }

    this.ConnectionSetting = function () {
        window.open("chrome://browser/content/preferences/connection.xul", "", "chrome,resizable=yes,centerscreen")
    }
    this.click = function (e){
        if(!e.button == 0)return
        var now = gPrefService.getIntPref('network.proxy.type');
        var new_type = "120"[now];//hack, 0->1,1->2,2->0
        proxySwitcher.switchP(new_type);
    }

    this.switchPACFile = function(){
        if (nowPac == pacPath){
	        //nowPac = pacPath2;
            gPrefService.setCharPref('network.proxy.autoconfig_url',nowPac=pacPath2)
        }else{
	        //nowPac = pacPath
            gPrefService.setCharPref('network.proxy.autoconfig_url',nowPac=pacPath)
        }
        //reloadpac
                    var pps = Components.classes['@mozilla.org/network/protocol-proxy-service;1'];
                    if ("nsPIProtocolProxyService" in Components.interfaces) {
                        //linux
                        var url = navigator.preference("network.proxy.autoconfig_url");
                        pps = pps.getService(Components.interfaces.nsPIProtocolProxyService);
                        pps.configureFromPAC(url);
                    } else {
                        //win
                        pps = pps.getService();
                        pps.reloadPAC();
                    }
        setLabel(getValue())
    }

    this.editPac = function () {
        const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].
            getService(Components.interfaces.nsIClipboardHelper);
        gClipboardHelper.copyString("if (shExpMatch(url, '*" + "put hostaname here" + "/*')) return PROXY;");

        var appFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
        appFile.initWithPath(editorPath);
        var application = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
        application.init(appFile);

        var file = Components.classes["@mozilla.org/file/local;1"].
            createInstance(Components.interfaces.nsILocalFile);
        file.persistentDescriptor = pacPath;
        var time0 = file.lastModifiedTime;
        

        application.runwAsync([pacPath], 1, {observe:function (subject, topic, data) {
            if (topic = "process-finished") {
                setTimeout(function () {
                    file.persistentDescriptor = pacPath;
                    if (file.lastModifiedTime == time0)return;
                    //reloadpac
                    var pps = Components.classes['@mozilla.org/network/protocol-proxy-service;1'];
                    if ("nsPIProtocolProxyService" in Components.interfaces) {
                        //linux
                        var url = navigator.preference("network.proxy.autoconfig_url");
                        pps = pps.getService(Components.interfaces.nsPIProtocolProxyService);
                        pps.configureFromPAC(url);
                    } else {
                        //win
                        pps = pps.getService();
                        pps.reloadPAC();
                    }
                    if (autoReload)gBrowser.reloadTab(gBrowser.selectedTab);
                }, 1000);
            }
        }
        });
    }

    this.init = function () {
        $E("urlbar-icons", '<statusbarpanel id="proxySwitcher"\
        context="proxySwitcherPopup"\
        onclick = "proxySwitcher.click(event)"\
        class="statusbarpanel-iconic-text"\
        label="proxy"/>');


        var menuString = '<menupopup id="proxySwitcherPopup"\
                        onpopupshowing="proxySwitcher.onPopup(event)">\
                            <menuitem label="Edit Pac" oncommand="proxySwitcher.editPac()"/>\
                            <menuitem label="Connection Setting" oncommand="proxySwitcher.ConnectionSetting()"/>\
                            <menuitem label="switch PAC" oncommand="proxySwitcher.switchPACFile()"/>\
                            <menuseparator/>\
                            <menuitem label="Direct"\
                            type="radio"\
                            name="proxySwitcherGroup"\
                            oncommand="proxySwitcher.switchP(0)"/>\
                            <menuitem label="Auto"\
                            type="radio"\
                            name="proxySwitcherGroup"\
                            oncommand="proxySwitcher.switchP(2)"/>';

        Object.keys(ports).forEach(function (item) {
            menuString += '<menuitem label="' + item + '"\
                                       type="radio"\
                                       name="proxySwitcherGroup"\
                                       oncommand="proxySwitcher.switchP(1,' + ports[item] + ')"/>';

        });
        menuString += '</menupopup>';
        $E("mainPopupSet", menuString)

        setLabel(getValue());
    }

}
proxySwitcher.init();


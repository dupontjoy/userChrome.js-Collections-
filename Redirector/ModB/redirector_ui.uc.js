// ==UserScript==
// @name            redirector_ui.uc.js
// @namespace       redirector@haoutil.com
// @description     Redirect your requests.
// @include         chrome://browser/content/browser.xul
// @author          harv.c
// @homepage        http://haoutil.com
// @downloadURL     https://raw.githubusercontent.com/Harv/userChromeJS/master/redirector_ui.uc.js
// @startup         Redirector.init();
// @shutdown        Redirector.destroy(true);
// @version         1.5.5.4
// ==/UserScript==
(function() {
    Cu.import("resource://gre/modules/XPCOMUtils.jsm");
    Cu.import("resource://gre/modules/Services.jsm");
    Cu.import("resource://gre/modules/NetUtil.jsm");

    function RedirectorUI() {
        this.rules = "local/_redirector.js".split("/"); // 规则文件路径
        this.addIcon = true;                            // 是否添加按钮
        this.state = true;                              // 是否启用脚本
        this.enableIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABZ0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMDvo9WkAAAI2SURBVDhPbVPNahNRGP3uzORvMhNCy7RJmGziICEtZOuiNbjRB5CgD+AyG1e6i4ib0m4KbhRKEemu1oUgbgTzAhXBjd2IUJBuopKCGjJzPSe5GWLpB5f5fs45uffcG7kYzWZzuVAo9DKZzJHjOB+5mBeLxV4YhksGdmlYnuc9tG37HLkG8Qz5wLKsAXP2OCuVSg+IJSGNTqfj+L5/hFTncrlBpVLp9Pv9FMScvWw2O0Cpie12u/ZsikDjCT4aW9/5vrpa1CLl+UrCsICvIo5C+IEdYg1HJIqiK0qpvyC/01qrROQZCHq+YqUSrNPEtm8TT5F8Pv+WHHIF5myjSOr1+hoBCwKPkN8dO859rdTPRKnRWRB4xMDMdXLg2bZA7TPOdswBYy6A76ZpCciv2fvl+1dNS8ghV+Dwb7i7Z/qLAntYfWz/KdY4tqxP6KfGkkOu4I4nKJ6b/qLAEMQJtk8fDs5dt2Ig0yAHAhMKfEXy3vT/O8Ifz2vh+wNHOB2JrBjINHAbH8gVuP8CamM4GnCwKMB6Ylk91rFtv2TNaDQaK3hgY3iwL0EQbMBRDUd3ObwocBJFORzhG+oEjOvsua67Sw65rHkTr9CIsZsuyBsA38M3PTOu8hp7eAs38JTvEEuOGYu0Wq0lkE+wrRgvbAtPu2xGabTb7TLezBYwCXbwhRwzmkWtVluG6huk/CONYNIhvHnMBbOYw0fRxBA7JV0W1Wr1FskQGaLELSoKDtnDmW/OUPMQ+QfYiMmtP0QQSQAAAABJRU5ErkJggg==";
        this.disableIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABZ0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMDvo9WkAAAHuSURBVDhPfVM7S4JRGP6832kKFVOLnIwckuZWaWrwfkG0hn5CY9HWEDgE4qBD0BSFuLRESdjWWIRTQ0u1BVEYZc9zPJ/5KfXAy3nPezvv7Sjj8Hq9UavVWjUajV1QD/RhMpnuIKt4PJ6wNJtEOBx22my2Q51O1zcYDJ9ms7mNswqqgb/W6/Vf0H05HI6DUChkkW4DSOcbOsOgGggEvFI1RDAYnIXNEdi+0+m8iEajpoEGgFODzlCsx+PxuWQyuaxSNptdLJfLLmmq2O32LRy03RMCvLYkU6vznk6nG6D+GL1nMpkN4QCgH02U1GNWfL2KyyfqmqESxmqAIjPI5/Nr4F9Ab8Vi0Uobn88XYcYul2tXQYe7aNIVFYQagM5SRNklZaVSaVqKFEznHn4dBuix21I+mkFL8me8o4SmNBFA1icI8igCgKlJ+TBAKpW6xfkqnfdjsZhmdPA5VQN0kUFbyjUlFAqFAPhn0FMul9OM1mKxsPSOaCIaMtFEtQfgN3lHFtwBATYRRx97scPVFWPERTNGNUAikTDj/gD6RpAVyvB6azhGYmSR+FoEhqtwnBJKALIFyqiD7TZEv4tEuN1uyB3qKtfVckbh9/vnsUDHYDn/c80qEwyCMkQmf30mEla5MuE8iv++M9Z+7Dsryg+nccGV4H85ngAAAABJRU5ErkJggg==";
    }
    RedirectorUI.prototype = {
        hash: new Date().getTime(),
        _mm: null,
        _ppmm: null,
        get mm() {
            if (!this._mm) {
                this._mm = Cc["@mozilla.org/childprocessmessagemanager;1"].getService(Ci.nsISyncMessageSender);
            }
            return this._mm;
        },
        get ppmm() {
            if (!this._ppmm) {
                this._ppmm = Cc["@mozilla.org/parentprocessmessagemanager;1"].getService(Ci.nsIMessageBroadcaster);
            }
            return this._ppmm;
        },
        get redirector() {
            if (!Services.redirector) {
                let state = this.state;
                XPCOMUtils.defineLazyGetter(Services, "redirector", function() {
                    Redirector.prototype.rules = [];
                    Redirector.prototype.state = state;
                    Redirector.prototype.clearCache = function() {
                        // clear cache
                        this._cache = {
                            redirectUrl: {},
                            clickUrl: {}
                        };
                    };
                    return new Redirector();
                });
            }
            return Services.redirector;
        },
        init: function() {
            this.state = this.redirector.state;
            if (this.state) {
                this.redirector.init(window);
            }
            this.drawUI();
            // register self as a messagelistener
            this.mm.addMessageListener("redirector:toggle", this);
            this.mm.addMessageListener("redirector:toggle-item", this);
            this.mm.addMessageListener("redirector:reload", this);
        },
        destroy: function(shouldDestoryUI) {
            this.redirector.destroy(window);
            if (shouldDestoryUI) {
                this.destoryUI();
            }
            // this.mm.removeMessageListener("redirector:toggle", this);
            // this.mm.removeMessageListener("redirector:toggle-item", this);
            // this.mm.removeMessageListener("redirector:reload", this);
        },
        drawUI: function() {
            if (this.addIcon && !document.getElementById("redirector-icon")) {
                // add icon
                let icon = document.getElementById("urlbar-icons").appendChild(document.createElement("image"));
                icon.setAttribute("id", "redirector-icon");
                icon.setAttribute("context", "redirector-menupopup");
                icon.setAttribute("onclick", "Redirector.iconClick(event);");
                icon.setAttribute("tooltiptext", "Redirector");
                icon.setAttribute("style", "padding: 0px 2px; list-style-image: url(" + (this.state ? this.enableIcon : this.disableIcon) + ")");
                // add menu
                let xml = '\
                    <menupopup id="redirector-menupopup">\
                        <menuitem label="Enable" id="redirector-toggle" type="checkbox" autocheck="false" key="redirector-toggle-key" checked="' + this.state + '" oncommand="Redirector.toggle();" />\
                        <menuitem label="Reload" id="redirector-reload" oncommand="Redirector.reload();"/>\
                        <menuitem label="Edit" id="redirector-edit" oncommand="Redirector.edit();"/>\
                        <menuseparator id="redirector-sepalator"/>\
                    </menupopup>\
                ';
                let range = document.createRange();
                range.selectNodeContents(document.getElementById("mainPopupSet"));
                range.collapse(false);
                range.insertNode(range.createContextualFragment(xml.replace(/\n|\t/g, "")));
                range.detach();
                // add rule items
                this.buildItems();
            }
            if (!document.getElementById("redirector-toggle-key")) {
                // add shortcuts
                let key = document.getElementById("mainKeyset").appendChild(document.createElement("key"));
                key.setAttribute("id", "redirector-toggle-key");
                key.setAttribute("oncommand", "Redirector.toggle();");
                key.setAttribute("key", "r");
                key.setAttribute("modifiers", "shift");
            }
        },
        destoryUI: function() {
            let icon = document.getElementById("redirector-icon");
            if (icon) {
                icon.parentNode.removeChild(icon);
                delete icon;
            }
            let menu = document.getElementById("redirector-menupopup");
            if (menu) {
                menu.parentNode.removeChild(menu);
                delete menu;
            }
            let key = document.getElementById("redirector-toggle-key");
            if (key) {
                key.parentNode.removeChild(key);
                delete key;
            }
        },
        buildItems: function(forceLoadRule) {
            if (forceLoadRule || this.redirector.rules.length == 0) {
                this.loadRule();
            }
            let menu = document.getElementById("redirector-menupopup");
            if (!menu) return;
            for (let i = 0; i < this.redirector.rules.length; i++) {
                let menuitem = menu.appendChild(document.createElement("menuitem"));
                menuitem.setAttribute("label", this.redirector.rules[i].name);
                menuitem.setAttribute("id", "redirector-item-" + i);
                menuitem.setAttribute("class", "redirector-item");
                menuitem.setAttribute("type", "checkbox");
                menuitem.setAttribute("autocheck", "false");
                menuitem.setAttribute("checked", typeof this.redirector.rules[i].state == "undefined" ? true : this.redirector.rules[i].state);
                menuitem.setAttribute("oncommand", "Redirector.toggle('"+ i +"');");
                menuitem.setAttribute("disabled", !this.state);
            }
        },
        clearItems: function() {
            let menu = document.getElementById("redirector-menupopup");
            let menuitems = document.querySelectorAll("menuitem[id^='redirector-item-']");
            if (!menu || !menuitems) return;
            for (let menuitem of menuitems) {
                menu.removeChild(menuitem);
            }
        },
        loadRule: function() {
            var aFile = FileUtils.getFile("UChrm", this.rules, false);
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
            if (!data) return;
            var sandbox = new Cu.Sandbox(new XPCNativeWrapper(window));
            try {
                Cu.evalInSandbox(data, sandbox, "1.8");
            } catch (e) {
                return;
            }
            this.redirector.rules = sandbox.rules;
        },
        toggle: function(i, callfromMessage) {
            if (i) {
                // update checkbox state
                let item = document.getElementById("redirector-item-" + i);
                if (!callfromMessage) {
                    this.redirector.rules[i].state = !this.redirector.rules[i].state;
                }
                if (item) item.setAttribute("checked", this.redirector.rules[i].state);
                // clear cache
                this.redirector.clearCache();
                if (!callfromMessage) {
                    // notify other windows to update
                    this.ppmm.broadcastAsyncMessage("redirector:toggle-item", {hash: this.hash, item: i});
                }
            } else {
                let menuitems = document.querySelectorAll("menuitem[id^='redirector-item-']");
                this.state = !this.state;
                this.redirector.state = this.state;
                if (this.state) {
                    this.init();
                    Object.keys(menuitems).forEach(function(n) menuitems[n].setAttribute("disabled", false));
                } else {
                    this.destroy();
                    Object.keys(menuitems).forEach(function(n) menuitems[n].setAttribute("disabled", true));
                }
                // update checkbox state
                let toggle = document.getElementById("redirector-toggle");
                if (toggle) {
                    toggle.setAttribute("checked", this.state);
                }
                // update icon state
                let icon = document.getElementById("redirector-icon");
                if (icon) {
                    icon.style.listStyleImage = "url(" + (this.state ? this.enableIcon : this.disableIcon) + ")";
                }
                if (!callfromMessage) {
                    // notify other windows to update
                    this.ppmm.broadcastAsyncMessage("redirector:toggle", {hash: this.hash});
                }
            }
        },
        reload: function(callfromMessage) {
            if (!callfromMessage) {
                this.redirector.clearCache();
            }
            this.clearItems();
            this.buildItems(true);
            if (!callfromMessage) {
                // notify other windows to update
                this.ppmm.broadcastAsyncMessage("redirector:reload", {hash: this.hash});
            }
        },
        edit: function() {
            let aFile = FileUtils.getFile("UChrm", this.rules, false);
            if (!aFile || !aFile.exists() || !aFile.isFile()) return;
            var editor;
            try {
                editor = Services.prefs.getComplexValue("view_source.editor.path", Ci.nsILocalFile);
            } catch (e) {
                alert("Please set editor path.\nview_source.editor.path");
                toOpenWindowByType('pref:pref', 'about:config?filter=view_source.editor.path');
                return;
            }
            var UI = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);
            UI.charset = window.navigator.platform.toLowerCase().indexOf("win") >= 0 ? "gbk" : "UTF-8";
            var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
            try {
                var path = UI.ConvertFromUnicode(aFile.path);
                var args = [path];
                process.init(editor);
                process.run(false, args, args.length);
            } catch (e) {
                alert("editor error.")
            }
        },
        iconClick: function(event) {
            switch(event.button) {
                case 1:
                    document.getElementById("redirector-toggle").doCommand();
                    break;
                default:
                    document.getElementById("redirector-menupopup").openPopup(null, null, event.clientX, event.clientY);
            }
            event.preventDefault();
        },
        // nsIMessageListener interface implementation
        receiveMessage: function(message) {
            if (this.hash == message.data.hash) {
                return;
            }
            switch (message.name) {
                case "redirector:toggle":
                    this.toggle(null, true);
                    break;
                case "redirector:toggle-item":
                    this.toggle(message.data.item, true);
                    break;
                case "redirector:reload":
                    this.reload(true);
                    break;
            }
        }
    };

    function Redirector() {
        this.rules = [];
    }
    Redirector.prototype = {
        _cache: {
            redirectUrl: {},
            clickUrl: {}
        },
        classDescription: "Redirector content policy",
        classID: Components.ID("{1d5903f0-6b5b-4229-8673-76b4048c6675}"),
        contractID: "@haoutil.com/redirector/policy;1",
        xpcom_categories: ["content-policy", "net-channel-event-sinks"],
        init: function(window) {
            window.addEventListener("click", this, false);
            let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
            if (!registrar.isCIDRegistered(this.classID)) {
                registrar.registerFactory(this.classID, this.classDescription, this.contractID, this);
                let catMan = XPCOMUtils.categoryManager;
                for (let category of this.xpcom_categories)
                    catMan.addCategoryEntry(category, this.contractID, this.contractID, false, true);
                Services.obs.addObserver(this, "http-on-modify-request", false);
                Services.obs.addObserver(this, "http-on-examine-response", false);
            }
        },
        destroy: function(window) {
            window.removeEventListener("click", this, false);
            let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
            if (registrar.isCIDRegistered(this.classID)) {
                registrar.unregisterFactory(this.classID, this);
                let catMan = XPCOMUtils.categoryManager;
                for (let category of this.xpcom_categories)
                    catMan.deleteCategoryEntry(category, this.contractID, false);
                Services.obs.removeObserver(this, "http-on-modify-request", false);
                Services.obs.removeObserver(this, "http-on-examine-response", false);
            }
        },
        getRedirectUrl: function(originUrl) {
            let redirectUrl = this._cache.redirectUrl[originUrl];
            if(typeof redirectUrl != "undefined") {
                return redirectUrl;
            }
            redirectUrl = null;
            let url, redirect;
            let regex, from, to, exclude, decode;
            for (let rule of this.rules) {
                if (typeof rule.state == "undefined") rule.state = true;
                if (!rule.state) continue;
                if (rule.computed) {
                    regex = rule.computed.regex; from = rule.computed.from; to = rule.computed.to; exclude = rule.computed.exclude; decode = rule.computed.decode;
                } else {
                    regex = rule.regex || rule.wildcard; from = rule.from; to = rule.to; exclude = rule.exclude; decode = rule.decode;
                    if (rule.wildcard) {
                        from = this.wildcardToRegex(rule.from);
                        exclude = this.wildcardToRegex(rule.exclude);
                    }
                    rule.computed = {regex: regex, from: from, to: to, exclude: exclude, decode: decode};
                }
                url = decode ? this.decodeUrl(originUrl) : originUrl;
                redirect = regex
                    ? from.test(url) ? !(exclude && exclude.test(url)) : false
                    : from == url ? !(exclude && exclude == url) : false;
                if (redirect) {
                    url = typeof to == "function"
                        ? regex ? to(url.match(from)) : to(from)
                        : regex ? url.replace(from, to) : to;
                    redirectUrl = {
                        url : decode ? url : this.decodeUrl(url),    // 避免二次解码
                        resp: rule.resp
                    };
                    break;
                }
            }
            this._cache.redirectUrl[originUrl] = redirectUrl;
            return redirectUrl;
        },
        decodeUrl: function(encodedUrl) {
            let decodedUrl;
            try {
                decodedUrl = decodeURIComponent(encodedUrl);
            } catch(e) {
                decodedUrl = encodedUrl;
            }
            return decodedUrl;
        },
        wildcardToRegex: function(wildcard) {
            if (!wildcard)
                return null;
            return new RegExp((wildcard + "").replace(new RegExp("[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]", "g"), "\\$&").replace(/\\\*/g, "(.*)").replace(/\\\?/g, "."), "i");
        },
        getTarget: function(redirectUrl, callback) {
            NetUtil.asyncFetch(redirectUrl.url, function(inputStream, status) {
                let binaryOutputStream = Cc['@mozilla.org/binaryoutputstream;1'].createInstance(Ci['nsIBinaryOutputStream']);
                let storageStream = Cc['@mozilla.org/storagestream;1'].createInstance(Ci['nsIStorageStream']);
                let count = inputStream.available();
                let data = NetUtil.readInputStreamToString(inputStream, count);
                storageStream.init(512, count, null);
                binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
                binaryOutputStream.writeBytes(data, count);
                redirectUrl.storageStream = storageStream;
                redirectUrl.count = count;
                if (typeof callback === 'function')
                    callback();
            });
        },
        // nsIDOMEventListener interface implementation
        handleEvent: function(event) {
            if (!event.ctrlKey && "click" === event.type && 1 === event.which) {
                let target = event.target;
                while(target) {
                    if (target.tagName && "BODY" === target.tagName.toUpperCase()) break;
                    if (target.tagName && "A" === target.tagName.toUpperCase()
                        && target.target && "_BLANK" === target.target.toUpperCase()
                        && target.href) {
                        this._cache.clickUrl[target.href] = true;
                        break;
                    }
                    target = target.parentNode;
                }
            }
        },
        // nsIContentPolicy interface implementation
        shouldLoad: function(contentType, contentLocation, requestOrigin, context, mimeTypeGuess, extra) {
            // don't redirect clicking links with "_blank" target attribute
            // cause links will be loaded in current tab/window
            if (this._cache.clickUrl[contentLocation.spec]) {
                this._cache.clickUrl[contentLocation.spec] = false;
                return Ci.nsIContentPolicy.ACCEPT;
            }
            // only redirect documents
            if (contentType != Ci.nsIContentPolicy.TYPE_DOCUMENT)
                return Ci.nsIContentPolicy.ACCEPT;
            if (!context || !context.loadURI)
                return Ci.nsIContentPolicy.ACCEPT;
            let redirectUrl = this.getRedirectUrl(contentLocation.spec);
            if (redirectUrl && !redirectUrl.resp) {
                context.loadURI(redirectUrl.url, requestOrigin, null);
                return Ci.nsIContentPolicy.REJECT_REQUEST;
            }
            return Ci.nsIContentPolicy.ACCEPT;
        },
        shouldProcess: function(contentType, contentLocation, requestOrigin, context, mimeTypeGuess, extra) {
            return Ci.nsIContentPolicy.ACCEPT;
        },
        // nsIChannelEventSink interface implementation
        asyncOnChannelRedirect: function(oldChannel, newChannel, flags, redirectCallback) {
            this.onChannelRedirect(oldChannel, newChannel, flags);
            redirectCallback.onRedirectVerifyCallback(Cr.NS_OK);
        },
        onChannelRedirect: function(oldChannel, newChannel, flags) {
            // only redirect documents
            if (!(newChannel.loadFlags & Ci.nsIChannel.LOAD_DOCUMENT_URI))
                return;
            let newLocation = newChannel.URI.spec;
            if (!newLocation)
                return;
            let callbacks = [];
            if (newChannel.notificationCallbacks)
                callbacks.push(newChannel.notificationCallbacks);
            if (newChannel.loadGroup && newChannel.loadGroup.notificationCallbacks)
                callbacks.push(newChannel.loadGroup.notificationCallbacks);
            let win, webNav;
            for (let callback of callbacks) {
                try {
                    win = callback.getInterface(Ci.nsILoadContext).associatedWindow;
                    webNav = win.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation);
                    break;
                } catch(e) {}
            }
            if (!webNav)
                return;
            let redirectUrl = this.getRedirectUrl(newLocation);
            if (redirectUrl && !redirectUrl.resp) {
                webNav.loadURI(redirectUrl.url, null, null, null, null);
            }
        },
        // nsIObserver interface implementation
        observe: function(subject, topic, data, additional) {
            switch (topic) {
                case "http-on-modify-request": {
                    let http = subject.QueryInterface(Ci.nsIHttpChannel);
                    let redirectUrl = this.getRedirectUrl(http.URI.spec);
                    if (redirectUrl && !redirectUrl.resp)
                        if(http.redirectTo)
                            // firefox 20+
                            http.redirectTo(Services.io.newURI(redirectUrl.url, null, null));
                        else
                            // others replace response body
                            redirectUrl.resp = true;
                    break;
                }
                case "http-on-examine-response": {
                    let http = subject.QueryInterface(Ci.nsIHttpChannel);
                    let redirectUrl = this.getRedirectUrl(http.URI.spec);
                    if (redirectUrl && redirectUrl.resp) {
                        if(!http.redirectTo)
                            redirectUrl.resp = false;
                        if (!redirectUrl.storageStream || !redirectUrl.count) {
                            http.suspend();
                            this.getTarget(redirectUrl, function() {
                                http.resume();
                            });
                        }
                        let newListener = new TrackingListener();
                        subject.QueryInterface(Ci.nsITraceableChannel);
                        newListener.originalListener = subject.setNewListener(newListener);
                        newListener.redirectUrl = redirectUrl;
                    }
                    break;
                }
            }
        },
        // nsIFactory interface implementation
        createInstance: function(outer, iid) {
            if (outer)
                throw Cr.NS_ERROR_NO_AGGREGATION;
            return this.QueryInterface(iid);
        },
        // nsISupports interface implementation
        QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentPolicy, Ci.nsIChannelEventSink, Ci.nsIObserver, Ci.nsIFactory, Ci.nsISupports])
    };
    function TrackingListener() {
        this.originalListener = null;
        this.redirectUrl = null;
    }
    TrackingListener.prototype = {
        // nsITraceableChannel interface implementation
        onStartRequest: function(request, context) {
            this.originalListener.onStartRequest(request, context);
        },
        onStopRequest: function(request, context) {
            this.originalListener.onStopRequest(request, context, Cr.NS_OK);
        },
        onDataAvailable: function(request, context) {
            this.originalListener.onDataAvailable(request, context, this.redirectUrl.storageStream.newInputStream(0), 0, this.redirectUrl.count);
        },
        // nsISupports interface implementation
        QueryInterface: XPCOMUtils.generateQI([Ci.nsIStreamListener, Ci.nsISupports])
    };

    if (window.Redirector) {
        window.Redirector.destroy();
        delete window.Redirector;
    }

    window.Redirector = new RedirectorUI();
    window.Redirector.init();
})();
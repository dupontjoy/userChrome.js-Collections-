// ==UserScript==
// @name            AntiChinaVideoAdsMod.uc.js
// @namespace       AntiChinaVideoAdsMod
// @description     ACVAA的UC脚本版
// @include         chrome://browser/content/browser.xul
// @author          harv.c
// @homepage        http://haoutil.tk
// @version         1.6.5.14
// @updateURL     https://j.mozest.com/ucscript/script/92.meta.js

//2015.07.07  修改swf文件夾位置

// ==/UserScript==
(function() {
	// 脚本地址：https://j.mozest.com/zh-CN/ucscript/script/92/
	// 播放器相关讨论：http://bbs.kafan.cn/thread-1507278-1-1.html
	// 播放器updateurl: https://bitbucket.org/kafan15536900/haoutil/raw/master/player/testmod
	var localSwfRativePath = Services.dirsvc.get("ProfD", Ci.nsILocalFile).path + "\\..\\Plugins\\swf\\";//window使用
	//var localSwfRativePath = '/chrome/swf/'; //linux下使用
	//本地播放器相对路径，可以自己把播放器放在profile/chrome/swf/下面
	var NetSwfpath = 'https://bitbucket.org/kafan15536900/haoutil/raw/master/player/testmod/';  //备用网络播放器路径

	let LocalAntiADSwfs = ['loader.swf', 'player.swf', 'tudou.swf','olc_8.swf', 'sp.swf', 'iqiyi_out.swf', 'iqiyi5.swf','iqiyi.swf', 'ku6.swf', 'ku6_out.swf', 'letv.swf', 'SSLetvPlayer.swf', 'baiduAD.swf', 'pptv.swf', 'livePlayer.swf', 'player4player2.swf', 'pptv_live.swf', 'pps.swf', 'sohu.swf', '17173_Player_file.swf', '17173_Player_stream.swf', '17173_Player_file_out.swf', '17173_Player_stream_out.swf']; //目前已知播放器
	let AntiADSwfPaths = [];
	for (let swfName of LocalAntiADSwfs) {
		AntiADSwfPaths[swfName] = NetSwfpath + swfName; //先设定默认用网络上的播放器
	}
	var localSwfPath = Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile).path + localSwfRativePath;
	//window.alert(localSwfPath);
	try { //如果在本地找到swf目录，就开始寻找本地swf播放器，有几个替换几个……找不到的还是用网络路径
		let aFolder = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		aFolder.initWithPath(localSwfPath);
		let files = aFolder.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);
		while (files.hasMoreElements()) {
			let file = files.getNext().QueryInterface(Ci.nsIFile);
			if (/\.swf$/i.test(file.leafName))
				localSwfPath=localSwfPath.replace(/\\/g,"/");//替换反斜杠。
				AntiADSwfPaths[file.leafName] = 'file:///' + localSwfPath + file.leafName;
		}
	} catch (ex) {
		Application.console.log("youkuantiads: 本地播放器目录不存在或为空，youkuantiads将使用网络播放器");
	}
    function AntiChinaVideoAds() {};
	//window.alert(AntiADSwfPaths['loader.swf']);
	//单独本地播放器。
	//var refD = 'file:///' + Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsILocalFile).path.replace(/\\/g,"/") + '/chrome/swf/';//添加以替换反斜杠.replace(/\\/g,"/");
    AntiChinaVideoAds.prototype = {
    SITES: {
        'youku_loader': {
            'player': AntiADSwfPaths['loader.swf'],
            're': /http:\/\/static\.youku\.com(\/v[\d\.]+)?\/v\/swf\/loaders?\.swf/i
        },
        'youku_player': {
            'player': AntiADSwfPaths['player.swf'],
            're': /http:\/\/static\.youku\.com(\/v[\d\.]+)?\/v\/swf\/q?player[^\.]*\.swf/i
        },
        'ku6': {
            'player': AntiADSwfPaths['ku6.swf'],
            're': /http:\/\/player\.ku6cdn\.com\/default\/common\/player\/\d{12}\/player\.swf/i
        },
        'ku6_out': {
            'player': AntiADSwfPaths['ku6_out.swf'],
            're': /http:\/\/player\.ku6cdn\.com\/default\/out\/\d{12}\/player\.swf/i
        },
        'iqiyi': {
            'player0': AntiADSwfPaths['iqiyi_out.swf'],
            'player1': AntiADSwfPaths['iqiyi5.swf'],
            'player2': AntiADSwfPaths['iqiyi_out.swf'],
            're': /https?:\/\/www\.iqiyi\.com\/(player\/\d+\/Player|common\/flashplayer\/\d+\/(Main|Coop|Share|Enjoy)?Player_?.*)\.swf/i
        },//您的电脑可能存在恶意插件
        'tudou': {
            'player': AntiADSwfPaths['tudou.swf'],
            're': /http:\/\/js\.tudouui\.com\/.*portalplayer[^\.]*\.swf/i
        },
        'tudou_olc': {
            'player': AntiADSwfPaths['olc_8.swf'],
            're': /http:\/\/js\.tudouui\.com\/.*olc[^\.]*\.swf/i
        },
        'tudou_sp': {
            'player': AntiADSwfPaths['sp.swf'],
            're': /http:\/\/js\.tudouui\.com\/.*\/socialplayer[^\.]*\.swf/i
        },
		'letv': {
            'player': AntiADSwfPaths['letv.swf'],
            're': /http:\/\/.*letv[\w]*\.com\/(hz|.*?\/((?!(Live|seed|Disk))(S(?!SDK)[\w]{2,3})?(?!Live)[\w]{4}|swf))Player\.swf/i
	    },
        'letv_live': {
            'player': AntiADSwfPaths['letvlive.swf'],
            're': /http:\/\/.*letv[\w]*\.com\/p\/\d+\/\d+\/\d+\/newplayer\/LivePlayer\.swf/i
        },
        'letvskin': {
            'player': 'http://player.letvcdn.com/p/201407/24/15/newplayer/1/SSLetvPlayer.swf',
            're': /http:\/\/.*letv[\w]*\.com\/p\/\d+\/\d+\/(?!15)\d*\/newplayer\/\d+\/S?SLetvPlayer\.swf/i
        },
        /*'pptv': {
            'player': AntiADSwfPaths['pptv.swf'],
            're': /http:\/\/player.pplive.cn\/ikan\/.*\/player4player2\.swf/i
        },*/
		'pplive': {
            'player': AntiADSwfPaths['pptvLive.swf'],
            're': /http:\/\/player.pplive.cn\/live\/.*\/player4live2\.swf/i
        },
		'ppliveplayer': {
            'player': AntiADSwfPaths['player4player2.swf'],
            're': /http:\/\/player\.pplive\.cn\/ikan\/.*\/player4player2\.swf/i
        },
		'sohu': {
           'player': AntiADSwfPaths['sohu_live.swf'],
           're': /http:\/\/tv\.sohu\.com\/upload\/swf\/(?!ap).*\d+\/(main|PlayerShell)\.swf/i
        },
        'sohu_liv': {
           'player': AntiADSwfPaths['sohu_live.swf'],
           're': /http:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?(\/test)?\/(testplayer|player|webplayer)\/(main|main\d|playershell)\.swf/i
        },
		'pps': {
            'player': AntiADSwfPaths['pps.swf'],
            're': /http:\/\/www\.iqiyi\.com\/player\/cupid\/.*\/pps[\w]+.swf/i
        },
		'ppsiqiyi': {
            'player': AntiADSwfPaths['iqiyi_out.swf'],
            're': /http:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/PPSMainPlayer.*\.swf/i
		},	
		'ppslive': {
            'player': 'http://www.iqiyi.com/player/20140613210124/livePlayer.swf',
            're': /http:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/am.*\.swf/i
		},		
        '17173': {
            'player': AntiADSwfPaths['17173_Player_file.swf'],
            're': /http:\/\/f\.v\.17173cdn\.com\/\d+\/flash\/Player_file\.swf/i			                
		},
        '17173_out': {
            'player': AntiADSwfPaths['17173_Player_file_out.swf'],
  	    're': /http:\/\/f\.v\.17173cdn\.com(\/\d+)?\/flash\/Player_file_(custom)?out\.swf/i
     	},			
	    '17173_stream_customOut': {
            'player': AntiADSwfPaths['17173_Player_stream_out.swf'],
  	    're': /http:\/\/f\.v\.17173cdn\.com(\/\d+)?\/flash\/Player_stream_(custom)?Out\.swf/i
	    },			
        '17173_live': {
            'player': AntiADSwfPaths['17173_Player_stream.swf'],
            're': /http:\/\/f\.v\.17173cdn\.com\/\d+\/flash\/Player_stream(_firstpage)?\.swf/i
        },
		'baiduAD': {
            'player': AntiADSwfPaths['baiduAD.swf'],
		    're': /http:\/\/list\.video\.baidu\.com\/swf\/advPlayer\.swf/i
		}
    },
	FILTERS: {
	    'qq': {
            'player': 'http://livep.l.qq.com/livemsg',
            're': /http:\/\/livew\.l\.qq\.com\/livemsg\?/i
        }
	},
	DOMAINS: {
    'iqiyi': {
      'host': 'http://www.iqiyi.com/',
      're': /http:\/\/.*\.qiyi\.com/i
      },
	'youku': {
      'host': 'http://www.youku.com/',
      're': /http:\/\/.*\.youku\.com/i
      }
    },
    os: Cc['@mozilla.org/observer-service;1']
            .getService(Ci.nsIObserverService),
    init: function() {
        var site = this.SITES['iqiyi'];
        site['preHandle'] = function(aSubject) {
            var wnd = this.getWindowForRequest(aSubject);
            if(wnd) {
                site['cond'] = [
                    !/(^((?!baidu|61|178).)*\.iqiyi\.com|pps\.tv)/i.test(wnd.self.location.host),
                    wnd.self.document.querySelector('span[data-flashplayerparam-flashurl]'),
                    true
                ];
                if(!site['cond']) return;
                
                for(var i = 0; i < site['cond'].length; i++) {
                    if(site['cond'][i]) {
                        if(site['player'] != site['player' + i]) {
                            site['player'] = site['player' + i];
                            site['storageStream'] = site['storageStream' + i] ? site['storageStream' + i] : null;
                            site['count'] = site['count' + i] ? site['count' + i] : null;
                        }
                        break;
                    }
                }
            }
        };
        site['callback'] = function() {
            if(!site['cond']) return;

            for(var i = 0; i < site['cond'].length; i++) {
                if(site['player' + i] == site['player']) {
                    site['storageStream' + i] = site['storageStream'];
                    site['count' + i] = site['count'];
                    break;
                }
            }
        };
    },
    // getPlayer, get modified player
    getPlayer: function(site, callback) {
        NetUtil.asyncFetch(site['player'], function(inputStream, status) {
            var binaryOutputStream = Cc['@mozilla.org/binaryoutputstream;1']
                                        .createInstance(Ci['nsIBinaryOutputStream']);
            var storageStream = Cc['@mozilla.org/storagestream;1']
                                    .createInstance(Ci['nsIStorageStream']);
            var count = inputStream.available();
            var data = NetUtil.readInputStreamToString(inputStream, count);

            storageStream.init(512, count, null);
            binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
            binaryOutputStream.writeBytes(data, count);

            site['storageStream'] = storageStream;
            site['count'] = count;

            if(typeof callback === 'function') {
                callback();
            }
        });
    },
    getWindowForRequest: function(request){
        if(request instanceof Ci.nsIRequest){
            try{
                if(request.notificationCallbacks){
                    return request.notificationCallbacks
                                .getInterface(Ci.nsILoadContext)
                                .associatedWindow;
                }
            } catch(e) {}
            try{
                if(request.loadGroup && request.loadGroup.notificationCallbacks){
                    return request.loadGroup.notificationCallbacks
                                .getInterface(Ci.nsILoadContext)
                                .associatedWindow;
                }
            } catch(e) {}
        }
        return null;
    },
    observe: function(aSubject, aTopic, aData) {
	    if (aTopic == "http-on-modify-request") {
    var httpReferer = aSubject.QueryInterface(Ci.nsIHttpChannel);
    for (var i in this.DOMAINS) {
      var domain = this.DOMAINS[i];
        try {
        var URL = httpReferer.originalURI.spec;
          if (domain['re'].test(URL)) {
            httpReferer.setRequestHeader('Referer', domain['host'], false);
          }
        } catch (e) {}
      }
    }
	
        if(aTopic != 'http-on-examine-response') return;

        var http = aSubject.QueryInterface(Ci.nsIHttpChannel);
				
        var aVisitor = new HttpHeaderVisitor();
        http.visitResponseHeaders(aVisitor);
        if (!aVisitor.isFlash()) return;
        
        for(var i in this.SITES) {
            var site = this.SITES[i];
            if(site['re'].test(http.URI.spec)) {
                var fn = this, args = Array.prototype.slice.call(arguments);

                if(typeof site['preHandle'] === 'function')
                    site['preHandle'].apply(fn, args);

                if(!site['storageStream'] || !site['count']) {
                    http.suspend();
                    this.getPlayer(site, function() {
                        http.resume();
                        if(typeof site['callback'] === 'function')
                            site['callback'].apply(fn, args);
                    });
                }

                var newListener = new TrackingListener();
                aSubject.QueryInterface(Ci.nsITraceableChannel);
                newListener.originalListener = aSubject.setNewListener(newListener);
                newListener.site = site;

                break;
            }
        }
    },
    QueryInterface: function(aIID) {
        if(aIID.equals(Ci.nsISupports) || aIID.equals(Ci.nsIObserver))
            return this;

        return Cr.NS_ERROR_NO_INTERFACE;
    },
    register: function() {
        this.init();
        this.os.addObserver(this, 'http-on-examine-response', false);
		this.os.addObserver(this, "http-on-modify-request", false);
    },
    unregister: function() {
        this.os.removeObserver(this, 'http-on-examine-response', false);
		this.os.removeObserver(this, "http-on-modify-request", false);
    }
};

    // TrackingListener, redirect youku player to modified player
    function TrackingListener() {
        this.originalListener = null;
        this.site = null;
    }
    TrackingListener.prototype = {
        onStartRequest: function(request, context) {
            this.originalListener.onStartRequest(request, context);
        },
        onStopRequest: function(request, context) {
            this.originalListener.onStopRequest(request, context, Cr.NS_OK);
        },
        onDataAvailable: function(request, context) {
            this.originalListener.onDataAvailable(request, context, this.site['storageStream'].newInputStream(0), 0, this.site['count']);
        }
    };

    function HttpHeaderVisitor() {
        this._isFlash = false;
    }
    HttpHeaderVisitor.prototype = {
        visitHeader: function(aHeader, aValue) {
            if (aHeader.indexOf("Content-Type") !== -1) {
                if (aValue.indexOf("application/x-shockwave-flash") !== -1) {
                    this._isFlash = true;
                }
            }
        },
        isFlash: function() {
            return this._isFlash;
        }
    };

    // register observer
    var y = new AntiChinaVideoAds();
    if(location == 'chrome://browser/content/browser.xul') {
        y.register();
    }

    // unregister observer
    window.addEventListener('unload', function() {
        if(location == 'chrome://browser/content/browser.xul') {
            y.unregister();
        }
    });
})();

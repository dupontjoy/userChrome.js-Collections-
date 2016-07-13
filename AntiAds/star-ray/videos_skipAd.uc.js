// ==UserScript==
// @name            videos_skipAd.uc
// @description     视频站去广告
// @include         main
// @author          xinggsf
// @version         2016.7.11
// @homepage        http://blog.csdn.net/xinggsf
// @downloadUrl     https://raw.githubusercontent.com/xinggsf/uc/master/videos_skipAd.uc.js
// @startup         videos_skipAd.startup();
// @shutdown        videos_skipAd.shutdown();
// ==/UserScript==
(function() {
	if (!String.prototype.includes) {
		String.prototype.includes = function(s) {
			return -1 !== this.indexOf(s);
		}
	}
	String.prototype.mixMatchUrl = function(ml) {//正则或ABP规则匹配网址
		if (ml instanceof RegExp)
			return ml.test(this);
		if (ml.startsWith('||'))
			return -1 !== this.indexOf(ml.slice(2), 7);
		if (ml[0] === '|')
			return this.startsWith(ml.slice(1));
		if (ml[ml.length-1] === '|')
			return this.endsWith(ml.slice(0, ml.length-1));
		return this.includes(ml);
	}
    Cu.import("resource://gre/modules/XPCOMUtils.jsm");
	let {Services} = Cu.import("resource://gre/modules/Services.jsm", null);

	const DIRECT_FILTERS = [//flash请求广告地址
		'|http://sax.sina.com.cn/',
		'|http://de.as.pptv.com/',
		'||.gtimg.com/qqlive/', //qq pause
		/^http:\/\/v\.163\.com\/special\/.+\.xml/,
		/^http:\/\/www\.iqiyi\.com\/common\/flashplayer\/\d+\/(\w{32}|cornersign.+)\.swf/,//pause
		'||.letvimg.com/',
		/^http:\/\/(\d+\.){3}\d+\/(\d{1,3}\/){3}letv-gug\/\d{1,3}\/ver.+\.letv/,
	],
	swfWhiteList = [//gpu加速白名单
		'||.pdim.gs/static/',//熊猫直播
		'|http://v.6.cn/apple/player/',
		'||.plures.net/pts/swfbin/player/live.swf',//龙珠直播
		'|http://www.gaoxiaovod.com/ck/player.swf',
		'|http://assets.dwstatic.com/video/',
	],
	swfBlockList = [//免gpu加速名单
		'upload.swf',
		/clipboard\d*\.swf$/,
		'|http://static92cc.db-cache.com/swf/',
	];
	FILTERS = [
		{
			'id': 'youku',
			'player': [
				/^http:\/\/static\.youku\.com\/v.+(?:play|load)er.*\.swf/,
				'|http://player.youku.com/player.php/sid/',
				'|http://cdn.aixifan.com/player/cooperation/acfunxyouku.swf',
			],
			'url': /^http:\/\/val[fcopb]\.atm\.youku\.com\/v[fcopb]/,
			'secured': true
		},{
			'id': 'tudou',
			'player': /^http:\/\/js\.tudouui\.com\/.+player.+\.swf/,
			'url': /^http:\/\/val[fcopb]\.atm\.youku\.com\/v[fcopb]/,
		},{
			'id': 'iqiyi',
			'player': /^http:\/\/www\.iqiyi\.com\/.+player.+\.swf/,
			'url': /^http:\/\/(\w+\.){3}\w+\/videos\/other\/\d+\/.+\.(f4v|hml)/
		},{
			'id': 'iqiyi_acfun',
			'player': '|http://cdn.aixifan.com/player/cooperation/acfunxqiyi.swf',
			'url': '||t7z.cupid.iqiyi.com/'
		},{
			'id': 'sohu',
			'player': /^http:\/\/tv\.sohu\.com\/upload\/swf\/.+\/main\.swf/,
			'url': '|http://v.aty.sohu.com/v',
			'secured': true
		},{
			'id': 'qq',
			'url': '/vmind.qqvideo.tc.qq.com/',
			'player': /^http:\/\/(cache\.tv|imgcache)\.qq\.com\/.+player.*\.swf/
		},
	],
	HTML5_FILTERS = [
		{//音悦台MV去黑屏
			'id': 'yinyuetai',
			'url': '|http://hc.yinyuetai.com/partner/yyt/',
			'secured': true
		},
	];
	let Utils = {
		getWindow: function(node) {
			if ("ownerDocument" in node && node.ownerDocument)
				node = node.ownerDocument;
			if ("defaultView" in node)
				return node.defaultView;
			return null;
		},
        getNodeForRequest: function(http){
            if (http instanceof Ci.nsIRequest){
                try {
                    let x = http.notificationCallbacks ||
						http.loadGroup.notificationCallbacks;
					if (x) return x.getInterface(Ci.nsILoadContext);
                } catch(e) {}
            }
            return null;
        },
        getWindowForRequest: function(http){
			let node = this.getNodeForRequest(http);
            if (node) return node.associatedWindow;
            return null;
        },
		block: function(http, secured) {
			if (secured) http.suspend();
			else http.cancel(Cr.NS_BINDING_ABORTED);
		},
		verifyHeader: function(http, field, partVal) {
			try {
				return http.getResponseHeader(field).includes(partVal);
            } catch(e) {
				return !1;
			}
		},
		isFromFlash: function(http) {
			return /\.swf(?:$|\?)/.test(http.referrer.spec);
		},
		openFlashGPU: function(p, data) {
			if (!data.isPlayer && !this.isPlayer(p, data.url))
				return;
			(p instanceof Ci.nsIDOMHTMLEmbedElement) ? p.setAttribute('wmode', 'gpu')
				: this.setFlashParam(p, 'wmode', 'gpu');
			this.refreshElem(p);
		},
		isPlayer: function(p, url) {
			if (swfWhiteList.some(x => url.mixMatchUrl(x))) return !0;
			if (swfBlockList.some(x => url.mixMatchUrl(x))) return !1;
			if (!p.width) return !1;
			if (p.width.endsWith('%')) return !0;
			if (parseInt(p.width) < 233 || parseInt(p.height) < 53) return !1;
			if (p instanceof Ci.nsIDOMHTMLEmbedElement)
				return p.matches('[allowFullScreen]');
			return /"allowfullscreen"/i.test(p.innerHTML);
		},
		refreshElem: function(o) {
			let s = o.style.display;
			o.style.display = 'none';
			setTimeout(() => {
				s ? o.style.display = s : o.style.removeProperty('display');
			}, 9);
		},
		setFlashParam: function(p, name, v) {
			let e = p.querySelector('embed');
			e && e.setAttribute(name, v);
			p.hasAttribute(name) && p.setAttribute(name, v);
			name = name.toLowerCase();
			for (let o of p.childNodes) {
				if (o.name && o.name.toLowerCase() === name) {
					o.value = v;
					return;
				}
			}
			e = p.ownerDocument.createElement('param');
			e.name = name;
			e.value = v;
			p.appendChild(e);
		},
		unwrapURL : function(url) {
			if (url instanceof Ci.nsINestedURI)
				return url.innermostURI;
			if (url instanceof Ci.nsIURI)
				return url;
			return this.makeURI(url);
		},
		makeURI : function (url) {
			try {
				return Services.io.newURI(url, null, null);
			} catch (e) {
				return null;
			}
		},
	};

	if (window.videos_skipAd) {
		window.videos_skipAd.shutdown();
		delete window.videos_skipAd;
	}
	window.videos_skipAd = {
        classDescription: "videos_skipAd content policy",
        classID: Components.ID("{F3D5E46E-C9E6-4642-9A71-82ECDBACED35}"),
        contractID: "@xinggsf.org/videos_skipAd/policy;1",
        xpcom_categories: ["content-policy"],
        // nsIFactory interface implementation
        createInstance: function(outer, iid) {
            if (outer) throw Cr.NS_ERROR_NO_AGGREGATION;
            return this.QueryInterface(iid);
        },
        // nsISupports interface implementation
        QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentPolicy,
			Ci.nsIObserver, Ci.nsIFactory, Ci.nsISupports]),

		directFilter: function(url) {
			return DIRECT_FILTERS.some(k => url.mixMatchUrl(k));
		},
		doPlayer: function(url, node) {
			// if (!Utils.verifyHeader(http, 'Content-Type', 'application/x-shockwave-flash'))
				// return;
			for (let i of FILTERS) {
				let r = (i.player instanceof Array) ?
					i.player.some(j => url.mixMatchUrl(j)) :
					url.mixMatchUrl(i.player);
				if (r) {
					i.swf = url;
					Utils.openFlashGPU(node, {'isPlayer': 1});
					if (typeof i.preHandle === 'function')
						i.preHandle(url);
					return;
				}
			}
			Utils.openFlashGPU(node, {'url': url});
		},
		filter: function(http) {
			let s = http.URI.spec.toLowerCase();
			if (s in this.blockUrls) {
				let i = this.blockUrls[s];
				if (typeof i.filter === 'function') i.filter(http);
				else Utils.block(http, i.secured);
				delete this.blockUrls[s];
			}
		},
		preFilter: function(playerUrl, url) {
			let k = FILTERS.find(i => i.swf === playerUrl &&
				url.mixMatchUrl(i.url));
			if (k) this.blockUrls[url] = k;
		},
		html5Filter: function(http) {
            // if (!Utils.verifyHeader(http, 'Content-Type', 'video/'))
				// return;
			let s = http.URI.spec.toLowerCase();
			for (let i of HTML5_FILTERS) {
				if (s.mixMatchUrl(i.url)) {
					Utils.block(http, i.secured);
					return;
				}
			}
		},
		setReferer: function(http) {
			http.setRequestHeader('Referer', 'http://www.youku.com/', !1);
		},
        // nsIContentPolicy interface implementation
		// @contentType: TYPE_IMAGE=3, TYPE_OBJECT=5, TYPE_SUBDOCUMENT =7, TYPE_OBJECT_SUBREQUEST =12, TYPE_MEDIA =15, TYPE_OTHER =1
		//@contentLocation 请求地址URI, @requestOrigin 页面地址URI
        shouldLoad: function(contentType, contentLocation, requestOrigin, node, mimeTypeGuess, extra) {
			// Ignore requests without context and top-level documents
			if (!node || contentType == Ci.nsIContentPolicy.TYPE_DOCUMENT)
				return Ci.nsIContentPolicy.ACCEPT;

			let wnd = Utils.getWindow(node);
			if (!wnd)
				return Ci.nsIContentPolicy.ACCEPT;

			let url = Utils.unwrapURL(contentLocation).spec.toLowerCase();
			if (contentType !==12 && (node instanceof Ci.nsIDOMHTMLObjectElement || node instanceof Ci.nsIDOMHTMLEmbedElement))
			{
				//Fix type for objects misrepresented as frames or images
				if (/\.swf(?:$|\?)/.test(url)) {
					if (contentType !==5 &&
						(contentType ===3 || contentType ===7))
						contentType = 5;
				}
				//Fix type for object_subrequest misrepresented as media/images/other
				else if (contentType ===1 || contentType ===3 || contentType ===15)
					contentType = 12;
			}

			if (contentType === 5) {//objects
				this.doPlayer(url, node);
			}
			else if (contentType === 12) {//object_subrequest
				//Application.console.log(requestOrigin.spec);
				let playerUrl = (node instanceof Ci.nsIDOMHTMLEmbedElement) ? node.src : node.data || node.children.movie.value;
				this.preFilter(playerUrl.toLowerCase(), url);
				if (this.directFilter(url))
					return Ci.nsIContentPolicy.REJECT_REQUEST;
			}
			return Ci.nsIContentPolicy.ACCEPT;
        },
        observe: function(aSubject, aTopic, aData) {
            let http = aSubject.QueryInterface(Ci.nsIHttpChannel);
            switch (aTopic) {
				case 'http-on-examine-response':
					this.filter(http);
					this.html5Filter(http);
					break;
				//case 'http-on-modify-request':
					//this.setReferer(http);
					//this.directFilter(http);
					//break;
			}
        },
        startup: function() {
            let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
            if (!registrar.isCIDRegistered(this.classID)) {
                registrar.registerFactory(this.classID, this.classDescription, this.contractID, this);
                let catMan = XPCOMUtils.categoryManager;
                for (let category of this.xpcom_categories)
                    catMan.addCategoryEntry(category, this.contractID, this.contractID, false, true);
                //Services.obs.addObserver(this, "http-on-modify-request", false);
                Services.obs.addObserver(this, "http-on-examine-response", false);
            }
			let item = FILTERS.find(k => k.id === 'iqiyi');
			item.preHandle = function (url) {
				this.count = 0;
			};
			item.filter = function (http) {
				this.count ++;
				if (2 !== this.count)
					Utils.block(http, this.secured);
			};
			this.blockUrls = {};
        },
        shutdown: function() {
            let registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
            if (registrar.isCIDRegistered(this.classID)) {
                registrar.unregisterFactory(this.classID, this);
                let catMan = XPCOMUtils.categoryManager;
                for (let category of this.xpcom_categories)
                    catMan.deleteCategoryEntry(category, this.contractID, false);
                //Services.obs.removeObserver(this, "http-on-modify-request", false);
                Services.obs.removeObserver(this, "http-on-examine-response", false);
            }
			this.blockUrls = null;
        }
    };

	videos_skipAd.startup();
})();
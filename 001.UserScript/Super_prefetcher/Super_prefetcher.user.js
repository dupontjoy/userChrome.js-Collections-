// ==UserScript==
// @name Super_prefetcher
// @author NLF
// @description  方便的前进,后退并且预读...#^_^#...(Support Opera 10.1+ ,Fx3.6+(need GreaseMonkey) ,Chrome5.0+)..
// @create 2010-7-12
// @lastmodified 2010-12-21
// @namespace  http://userscripts.org/users/NLF
// @version 2.1.0.0
// @download  http://bbs.operachina.com/viewtopic.php?f=41&t=82513
// @include http*
// ==/UserScript==

/*
	*Opera 翻页手势命令:
			上一页:   go to page, "javascript:superPrefetcher.back();"
			下一页:   go to page, "javascript:superPrefetcher.go();"
	*Firefox 翻页手势脚本(需fireGestures扩展):
			上一页:   content.window.wrappedJSObject.superPrefetcher.back();
			下一页:   content.window.wrappedJSObject.superPrefetcher.go();
	*chrome翻页手势命令(随便找个支持执行脚本的手势扩展,比如mouse Stroke,chrome Gesture,创建执行脚本的手势,将下面的命令粘贴进去):
			上一页:   (function(){var document=window.document;var event=document.createEvent('HTMLEvents');event.initEvent('superPrefetcher.back',true,false);document.dispatchEvent(event);})();
			下一页:   (function(){var document=window.document;var event=document.createEvent('HTMLEvents');event.initEvent('superPrefetcher.go',true,false);document.dispatchEvent(event);})();
*/

/*
	*XHR预读模式:xmlHttpRequest请求源文档然后分析出图片进行预读...
	*iframe预读模式:使用iframe预先载入下一页.
*/
(function(window,document){
	function init(){
		var time1=new Date();
		if(!document.body)return;

		//一些设置...
		var prefs={
			iframeD:false						,//默认在无高级规则的网站上使用 iframe预读(不推荐);
			keymatch:true							,//给没有规则的网站使用..关键字匹配模式寻找下一页(不建议关闭)..
					cases:false					,//关键字区分大小写....
					digitalCheck:true			,//对数字连接进行检测,从中找出下一页的链接
					pfwordl:{//关键字前面的字符限定.
						previous:{//上一页关键字前面的字符,例如 "上一页" 要匹配 "[上一页" ,那么prefix要的设置要不小于1,并且character要包含字符 "["
							enable:true,
							maxPrefix:3,
							character:[' ','　','[','［','<','＜','‹','«','<<','『','「','【','(','←']
						},
						next:{//下一页关键字前面的字符
							enable:true,
							maxPrefix:2,
							character:[' ','　','[','［','『','「','【','(']
						}
					},
					sfwordl:{//关键字后面的字符限定.
						previous:{//上一页关键字后面的字符
							enable:true,
							maxSubfix:2,
							character:[' ','　',']','］','』','」','】',')']
						},
						next:{//下一页关键字后面的字符
							enable:true,
							maxSubfix:3,
							character:[' ','　',']','］','>','﹥','›','»','>>','』','」','】',')','→']
						}
					},
			linkOutline:true,//给链接外边框.
					specialstyle:{//找到的那个链接的特殊样式..[粗细,样式,颜色];
						previous:['2px','solid','#0000FF'],//上页链接
						next:['2px','solid','#00FF00']//下页链接
					},
					allalert:true,//给其他上页,下页链接边框.
							alertstyle:{//其他链接边框样式..[粗细,样式,颜色];
								previous:['1px','solid','#0000FF'],//上页链接
								next:['1px','solid','#00FF00']//下页链接
							},
			arrowKeyPage:true	,//允许使用左右方向键翻页.
			DisableI:true	,//只在顶层窗口加载JS..提升性能..注意在一些框架集网页上..使用 DIExclude 数组就行排除.(推荐开启)..
			preFetch:true,//预读链接.
					prePage:false,//预读上一页
					nextPage:true,//预读下一页
					remain:2/3,//当剩余页面高度 是 可见页面高度的多少倍时,开始预读..
		};
		//设置结束...

		//////////////////////////-------------规则开始-------////////////////
		//-----------高级规则-----------//
		var SITEINFO=[
			{siteName:'google搜索',																																//站点名字...(可选)
				url:/^https?:\/\/\w{3,10}\.google(?:\.\w{1,4}){1,2}\/search/i,											//站点正则...(~~必须~~)
				siteExample:'http://www.google.com',																								//站点实例...(可选)
				enable:true,																																			//启用.(总开关)(可选)
				useiframe:false,																																		//是否用iframe预读...(可选)
				preLink:'//table[@id="nav"]/descendant::a[1][parent::td[@class="b"]]',			//上一页链接 xpath 或者 CSS选择器 或者 函数返回值 (prelink 和 nextlink最少填一个)
				nextLink:'//table[@id="nav"]/descendant::a[last()][parent::td[@class="b"]]',				//下一页链接 xpath 或者 CSS选择器 或者 函数返回值 (prelink 和 nextlink最少填一个)
				//nextLink:'css;table#nav>tbody>tr>td.b:last-child>a',
				//nextLink:function(){return document.evaluate('//table[@id="nav"]/descendant::a[last()][parent::td[@class="b"]]',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;},
			},
		];

		//统配规则..用来灭掉一些DZ.或者phpwind论坛系统..此组规则..优先级自动降为最低..
		var SITEINFO_TP=[
			{siteName:'Discuz论坛帖子列表页面',
				url:/^https?:\/\/[^\/]+\/(?:(?:forum)|(?:showforum)|(?:viewforum))/i,
				preLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
				nextLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href]',
			},
			{siteName:'Discuz论坛帖子内容页面',
				url:/^https?:\/\/[^\/]+\/(?:(?:thread)|(?:viewthread)|(?:showtopic)|(?:viewtopic))/i,
				preLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
				nextLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href]',
			},
			{siteName:'phpWind论坛帖子列表页面',
				url:/^https?:\/\/[^\/]+\/(?:bbs\/)?thread/i,
				preLink:'//div[starts-with(@class,"pages")]/b[1]/preceding-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/preceding-sibling::li/a[1][not(@class)][@href]',
				nextLink:'//div[starts-with(@class,"pages")]/b[1]/following-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/following-sibling::li/a[1][not(@class)][@href]',
			},
			{siteName:'phpWind论坛帖子内容页面',
				url:/^https?:\/\/[^\/]+\/(?:bbs\/)?read/i,
				preLink:'//div[starts-with(@class,"pages")]/b[1]/preceding-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/preceding-sibling::li/a[1][not(@class)][@href]',
				nextLink:'//div[starts-with(@class,"pages")]/b[1]/following-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/following-sibling::li/a[1][not(@class)][@href]',
			},
		];

		//在以下网站上允许在非顶层窗口上加载JS..比如猫扑之类的框架集网页.
		var DIExclude=[
			['猫扑帖子内容页面',true,/http:\/\/dzh\.mop\.com\/topic\/readSub/i],
			['水木社区帖子内容',true,/http:\/\/www\.newsmth\.net\/bbstcon/i],
		];

		//黑名单,在此网页上禁止加载..3个项.分别是:名字,启用,网站正则..
		var blackList=[
			['中关村首页',true,/^http:\/\/www\.zol\.com\.cn\/(?:#.*)?$/i],
			['Gmail',true,/mail\.google\.com/i],
			['Google reader',true,/google\.com\/reader\//i],
			['优酷视频播放页面',true,/http:\/\/v\.youku\.com\//i],
		];

		//上一页关键字
		var prePageKey=[
				'上一页',
				'上一頁',
				'上1页',
				'上1頁',
				'上页',
				'上頁',
				'翻上頁',
				'翻上页',
				'上一张',
				'上一張',
				'上一幅',
				'上一章',
				'上一节',
				'上一節',
				'上一篇',
				'前一页',
				'前一頁',
				'后退',
				'後退',
				'上篇',
				'previous',
				'previous Page',
				'前へ'
		];

		//下一页关键字
		var nextPageKey=[
				'下一页',
				'下一頁',
				'下1页',
				'下1頁',
				'下页',
				'下頁',
				'翻页',
				'翻頁',
				'翻下頁',
				'翻下页',
				'下一张',
				'下一張',
				'下一幅',
				'下一章',
				'下一节',
				'下一節',
				'下一篇',
				'后一页',
				'後一頁',
				'前进',
				'下篇',
				'后页',
				'往后',
				'Next',
				'Next Page',
				'次へ'
		];

		//你的自定义高级规则..优先级最高..
		var CUS_SITEINFO=[
		];

		//你的统配规则,优先级最高.
		var CUS_SITEINFO_TP=[
		];

		//你的自定义关键字..此数组里面的关键字..优先级最高.
		var CUS_nextPageKey=[
		];

		var CUS_prePageKey=[
		];
//////////////////////////-------------规则结束-------////////////////

		//css 获取单个元素
		function getElementByCSS(css,contextNode){
			return (contextNode || document).querySelector(css);
		};

		//xpath 获取单个元素
		function getElementByXpath(xpath,contextNode){
			var doc=document;
			contextNode=contextNode || doc;
			return doc.evaluate(xpath,contextNode,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
		};

		//xpath 获取多个元素.
		function getAllElementsByXpath(xpath,contextNode){
			var doc=document;
			contextNode=contextNode || doc;
			return doc.evaluate(xpath,contextNode,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
		};

		//获取单个元素,混合
		function getElement(selector){
			var ret;
			if(!selector)return ret;
			if(typeof selector=='string'){
				if(selector.search(/^css;/i)==0){
					ret=getElementByCSS(selector.slice(4));
				}else{
					ret=getElementByXpath(selector);
				};
			}else{
				ret=selector();
			};
			return ret;
		};

		//处理正则的函数..
		function toRE(obj){
			if(obj instanceof RegExp){
				return obj;
			}else{
				return (obj instanceof Array)? new RegExp(obj[0],obj[1]) : new RegExp(obj);
			};
		};

		//分析黑名单..
		var i,
					ii;

		var blacklist_x;

		var URL=location.href.replace(/#.*$/,'');

		for(i=0,ii=blackList.length;i<ii;i++){
			blacklist_x=blackList[i];
			if(blacklist_x[1] && toRE(blacklist_x[2]).test(URL))return;
		};

		//是否在frame上加载..
		if(prefs.DisableI && window.self!=window.parent){
			var isreturn=true,
						DIExclude_x;
			for(i=0,ii=DIExclude.length;i<ii;i++){
				DIExclude_x=DIExclude[i];
				if(DIExclude_x[1] && DIExclude_x[2].test(URL)){
					isreturn=false;
					break;
				};
			};
			if(isreturn){
				//alert(location.href);
				return;
			};
		};

		//规则合并
		try{
			SITEINFO_TP=CUS_SITEINFO_TP.concat(SITEINFO_TP);//统配规则
		}catch(e){};
		try{
			SITEINFO=SITEINFO.concat(SITEINFO_TP);
		}catch(e){};
		try{
			SITEINFO=CUS_SITEINFO.concat(SITEINFO);
		}catch(e){}

		var G_window=window;
		try{
			G_window=unsafeWindow;
		}catch(e){};


		var nextlink,
					prelink,
					yd_iframepre;

		//第一阶段,分析高级规则..
		var SII;
		for(i=0,ii=SITEINFO.length;i<ii;i++){
			SII=SITEINFO[i];
			if(SII.enable!==false && toRE(SII.url).test(URL)){
				if(SII.nextLink)nextlink=getElement(SII.nextLink);
				if(SII.preLink)prelink=getElement(SII.preLink);
				//alert(nextlink);
				if(nextlink || prelink){
					//alert(nextlink);
					//alert(prelink);
					yd_iframepre=(SII.useiframe || false);
					break;
				};
			};
		};

		//第二阶段.核对关键字..
		var alllinks,
					alllinksl;


		//如果没有找全
		if(!(nextlink && prelink) && prefs.keymatch){
			alllinks=document.links;
			alllinksl=alllinks.length;

			try{
				nextPageKey=CUS_nextPageKey.concat(nextPageKey);
			}catch(e){};

			try{
				prePageKey=CUS_prePageKey.concat(prePageKey);
			}catch(e){};


			function autoGetLink(){
				var _prePageKey=prePageKey;
				var _nextPageKey=nextPageKey;
				var _nPKL=nextPageKey.length;
				var _pPKL=prePageKey.length;
				var _getAllElementsByXpath=getAllElementsByXpath;
				var _Number=Number;

				var _alllinks=alllinks;
				var _alllinksl=alllinksl;


				var curLHref=URL;
				var _nextlink=nextlink;
				var _prelink=prelink;;

				var DCEnable=prefs.digitalCheck;
				//alert(_nextlink);
				//alert(_prelink);


				var i,a,ahref,atext,numtext,DCRE=/^\s*[^\d]{0,1}(\d+)[^\d]{0,1}\s*$/;
				var aP,initSD,searchD=1,preS1,preS2,searchedD,pSNText,preSS,nodeType;
				var nextS1,nextS2,nSNText,nextSS;
				var aimgs,j,jj,aimg_x,xbreak,k,keytext;

				function finalCheck(a){
					var ahref=a.href;
					//2个条件:http协议链接,非跳到当前页面的链接
					if(/^https?:/i.test(ahref) && ahref.replace(/#.*$/,'')!=curLHref){
						return a;//返回对象A
						//return ahref;
					};
				};

				for(i=0;i<_alllinksl;i++){
					if(_nextlink && _prelink)break;
					a=_alllinks[i];
					if(!a)continue;//undefined跳过
					//links集合返回的本来就是包含href的a元素..所以不用检测
					//if(!a.hasAttribute("href"))continue;
					atext=a.textContent;

					if(atext){
						if(DCEnable){
							numtext=atext.match(DCRE);
							if(numtext){//是不是纯数字
								numtext=numtext[1];
								//alert(numtext);
								aP=a;
								initSD=0;

								if(!_nextlink){
									preS1=a.previousSibling;
									preS2=a.previousElementSibling;

									while(!(preS1 || preS2) && initSD<searchD){
										aP=aP.parentNode;
										if(aP){
											preS1=aP.previousSibling;
											preS2=aP.previousElementSibling;
										};
										initSD++;
										//alert('initSD: '+initSD);
									};
									searchedD=initSD>0? true : false;

									if(preS1 || preS2){
										pSNText=preS1? preS1.textContent.match(DCRE) : '';
										if(pSNText){
											preSS=preS1;
										}else{
											pSNText=preS2? preS2.textContent.match(DCRE) : '';
											preSS=preS2;
										};
										//alert(previousS);
										if(pSNText){
											pSNText=pSNText[1];
											//alert(pSNText)
											if(_Number(pSNText)==_Number(numtext)-1){
												//alert(searchedD);
												nodeType=preSS.nodeType;
												//alert(nodeType);
												if(nodeType==3 || (nodeType==1 && (searchedD? _getAllElementsByXpath('./descendant-or-self::a[@href]',preSS).snapshotLength==0 : (!preSS.hasAttribute('href') || preSS.href==curLHref)))){
													_nextlink=finalCheck(a);
													//alert(_nextlink);
												};
												continue;
											};
										};
									};
								};

								if(!_prelink){
									nextS1=a.nextSibling;
									nextS2=a.nextElementSibling;

									while(!(nextS1 || nextS2) && initSD<searchD){
										aP=aP.parentNode;
										if(aP){
											nextS1=a.nextSibling;
											nextS2=a.nextElementSibling;
										};
										initSD++;
										//alert('initSD: '+initSD);
									};
									searchedD=initSD>0? true : false;

									if(nextS1 || nextS2){
										nSNText=nextS1? nextS1.textContent.match(DCRE) : '';
										if(nSNText){
											nextSS=nextS1;
										}else{
											nSNText=nextS2? nextS2.textContent.match(DCRE) : '';
											nextSS=nextS2;
										};
										//alert(nextS);
										if(nSNText){
											nSNText=nSNText[1];
											//alert(pSNText)
											if(_Number(nSNText)==_Number(numtext)+1){
												//alert(searchedD);
												nodeType=nextSS.nodeType;
												//alert(nodeType);
												if(nodeType==3 || (nodeType==1 && (searchedD? _getAllElementsByXpath('./descendant-or-self::a[@href]',nextSS).snapshotLength==0 : (!nextSS.hasAttribute("href") || nextSS.href==curLHref)))){
													_prelink==finalCheck(a);
													//alert(_prelink);
												};
											};
										};
									};
								};
								continue;
							};
						};
					}else{
						atext=a.title;
					};
					if(!atext){
						aimgs=a.getElementsByTagName('img');
						for(j=0,jj=aimgs.length;j<jj;j++){
							aimg_x=aimgs[j];
							atext=aimg_x.alt || aimg_x.title;
							if(atext)break;
						};
					};
					if(!atext)continue;
					//alert(atext);
					if(!_nextlink){
						xbreak=false;
						for(k=0;k<_nPKL;k++){
							keytext=_nextPageKey[k];
							if(!(keytext.test(atext)))continue;
							_nextlink=finalCheck(a);
							xbreak=true;
							break;
						};
						if(xbreak || _nextlink)continue;
					};
					if(!_prelink){
						for(k=0;k<_pPKL;k++){
							keytext=_prePageKey[k];
							if(!(keytext.test(atext)))continue;
							_prelink=finalCheck(a);
							break;
						};
					};
				};


				prelink=_prelink;
				nextlink=_nextlink;
			};

			function parseKWRE(){
				function modifyPageKey(name,pageKey,pageKeyLength){
					function strMTE(str){
						return (str.replace(/\\/g, '\\\\')
									.replace(/\+/g, '\\+')
									.replace(/\./g, '\\.')
									.replace(/\?/g, '\\?')
									.replace(/\{/g, '\\{')
									.replace(/\}/g, '\\}')
									.replace(/\[/g, '\\[')
									.replace(/\]/g, '\\]')
									.replace(/\^/g, '\\^')
									.replace(/\$/g, '\\$')
									.replace(/\*/g, '\\*')
									.replace(/\(/g, '\\(')
									.replace(/\)/g, '\\)')
									.replace(/\|/g, '\\|')
									.replace(/\//g, '\\/'));
					};

				var pfwordl=prefs.pfwordl,
							sfwordl=prefs.sfwordl;

				var RE_enable_a=pfwordl[name].enable,
							RE_maxPrefix=pfwordl[name].maxPrefix,
							RE_character_a=pfwordl[name].character,
							RE_enable_b=sfwordl[name].enable,
							RE_maxSubfix=sfwordl[name].maxSubfix,
							RE_character_b=sfwordl[name].character;
				var plwords,
							slwords,
							rep;

				plwords=RE_maxPrefix>0? ('['+(RE_enable_a? strMTE(RE_character_a.join('')) : '.')+']{0,'+RE_maxPrefix+'}') : '';
				plwords='^\\s*' + plwords;
				//alert(plwords);
				slwords=RE_maxSubfix>0? ('['+(RE_enable_b? strMTE(RE_character_b.join('')) : '.')+']{0,'+RE_maxSubfix+'}') : '';
				slwords=slwords + '\\s*$';
				//alert(slwords);
				rep=prefs.cases? '' : 'i';

				for(var i=0;i<pageKeyLength;i++){
					pageKey[i]=new RegExp(plwords + strMTE(pageKey[i]) + slwords,rep);
					//alert(pageKey[i]);
				};
				return pageKey;
			};

				//转成正则.
				prePageKey=modifyPageKey('previous',prePageKey,prePageKey.length);
				nextPageKey=modifyPageKey('next',nextPageKey,nextPageKey.length);
			};

			parseKWRE();
			autoGetLink();
		};


		//alert(new Date()-time1);
		//alert(linktext);
		//alert(nextlink)
		if(!nextlink && !prelink)return;
		//alert(new Date()-time1);

		function LinkObject(link,href,outlineNS,outlineSS){
			this.link=link;
			this.href=href;
			this.outlineNS=outlineNS;
			this.outlineSS=outlineSS;
		};

		function createDocumentByString(str){
			if(!str){
				return;
			};
			if(document.documentElement.nodeName != 'HTML'){
				return new DOMParser().parseFromString(str, 'application/xhtml+xml');
			};
			var doc;
			if(document.implementation.createHTMLDocument){
				doc=document.implementation.createHTMLDocument('superPreloader');
			}else{
				try{
					doc=document.cloneNode(false);
					doc.appendChild(doc.importNode(document.documentElement, false));
					doc.documentElement.appendChild(doc.createElement('head'));
					doc.documentElement.appendChild(doc.createElement('body'));
				}catch(e){};
			};
			if(!doc)return;
			var range=document.createRange();
			range.selectNodeContents(document.body);
			var fragment = range.createContextualFragment(str);
			doc.body.appendChild(fragment);
			var headChildNames={
				TITLE: true,
				META: true,
				LINK: true,
				STYLE:true, 
				BASE: true
			};
			var child;
			var body=doc.body;
			var bchilds=body.childNodes;
			for(var i=bchilds.length-1;i>=0;i--){//移除head的子元素
				child=bchilds[i];
				if(headChildNames[child.nodeName])body.removeChild(child);
			};
			return doc;
		};

		LinkObject.prototype={
			prefetch:function(){
				yd_iframepre? this.IR() : this.XR();
			},
			IR:function(){
				var i=document.createElement('iframe');
				i.name='N_preiframe';
				i.style.cssText='\
					display:none!important;\
				';
				i.src=this.href;
				document.body.appendChild(i);
			},
			XR:function(){
				function XRLoaded(){
					if(this.readyState!=4)return;
					var str=this.responseText;
					var doc=createDocumentByString(str);
					if(!doc)return;
					var images=doc.images;
					var isl=images.length;
					var img;
					var i;
					var existSRC={};
					var isrc;
					for(i=isl-1;i>=0;i--){
						isrc=images[i].getAttribute('src');
						if(!isrc || existSRC[isrc]){
							continue;
						}else{
							existSRC[isrc]=true;
						};
						img=document.createElement('img');
						img.src=isrc;
						//document.body.appendChild(img);
					};
				};
				var xhr=new XMLHttpRequest();
				xhr.onreadystatechange=XRLoaded;
				xhr.open("GET",this.href,true);
				xhr.overrideMimeType('text/html; charset=' + document.characterSet);
				try{
					xhr.send(null);
				}catch(err){
					if(err.message.toLowerCase().indexOf('security')!=-1){
						this.IR();
					};
				};
			},
			addOutline:function(){
				if(!prefs.linkOutline)return;
				var link=this.link;
				if(typeof link=='string')return;
				var href=this.href;
				var outlineNS=this.outlineNS;
				var outlineSS=this.outlineSS;

				if(prefs.allalert){
					if(!alllinks){
						alllinks=document.links;
						alllinksl=alllinks.length;
					};
					var alllinks_x;
					for(var i=0,ii=alllinksl;i<ii;i++){
						alllinks_x=alllinks[i];
						if(!alllinks_x)continue;
						if(alllinks_x.href==href){
							alllinks_x.style.setProperty('outline',outlineNS,'important');
						};
					};
				};
				link.style.setProperty('outline',outlineSS,'important');
			}
		};

		var strNL,
					strPL;

			var nextLO,
						preLO;

		if(nextlink){
			strNL=nextlink.href || nextlink;
			nextLO=new LinkObject(nextlink,strNL,prefs.alertstyle.next.join(' '),prefs.specialstyle.next.join(' '));
			nextLO.addOutline();
		};

		if(prelink){
			strPL=prelink.href || prelink;
			preLO=new LinkObject(prelink,strPL,prefs.alertstyle.previous.join(' '),prefs.specialstyle.previous.join(' '));
			preLO.addOutline();
		};
 

		//翻页快捷键..
		var superPrefetcher={
			go:function(){
				if(strNL){
					location.href=strNL;
					//this.go=function(){};
				};
			},
			back:function(){
				if(strPL){
					location.href=strPL;
					//this.back=function(){};
				};
			},
		};

		G_window.superPrefetcher=superPrefetcher;

		if(prefs.arrowKeyPage){
			document.addEventListener('keyup',function(e){
				//alert(e.keyCode);
				var tarNN=e.target.nodeName.toLowerCase();
				if(tarNN!='body' && tarNN!='html')return;
				switch(e.keyCode){
					case 37:{
						superPrefetcher.back();
					}break;
					case 39:{
						superPrefetcher.go();
					}break;
					default:break;
				};
			},false);
		};

		//监听下一页事件.
		document.addEventListener('superPrefetcher.go',function(){
			superPrefetcher.go();
		},false);

		//监听下一页事件.
		document.addEventListener('superPrefetcher.back',function(){
			superPrefetcher.back();
		},false);

		if(!prefs.preFetch)return;

		var prefetched;
		function prefetchNextPage(){
			if(prefetched)return;
			prefetched=true;
			window.removeEventListener('scroll',scrollHandler,false);
			window.removeEventListener('load',prefetchNextPage,false);
			//alert('预读开始..');
			if(nextLO && prefs.nextPage){
				nextLO.prefetch();
			};
			if(preLO && prefs.prePage){
				preLO.prefetch();
			};
		};


		var remainPage=prefs.remain;
		//alert(remainPage);
		function scrollHandler(){
			var scrolly=window.scrollY,
						WI=window.innerHeight,
						scrollH=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
			if((scrollH-scrolly-WI)/WI<=remainPage){
				prefetchNextPage();
			};
		};

		window.addEventListener('scroll',scrollHandler,false);
		window.addEventListener('load',prefetchNextPage,false);

	};


	if(window.name!='N_preiframe'){
		if(window.opera){
			document.addEventListener('DOMContentLoaded',init,false);
		}else{
			init();
		};
		//window.addEventListener('load',init,false);
	};

})(window,document);


//自动更新模块
(function(){
	//不支持chrome
	if(window.chrome)return;
	var operaObj=window.opera;
	if(operaObj){
		var operaSS=operaObj.scriptStorage;
		if(!operaSS)return;

		if(window.name=='operaUJSCMIframe'){
			document.addEventListener('DOMContentLoaded',function(){
				window.parent.postMessage('operaUJSCMIframe:'+document.body.textContent,'*');
			},false);
		};
	};

	if(window.self!=window.top)return;

	//--必须填的3个参数
	var prefs={
		id:'85345'											,//上传在 userscript上的脚本 编号.. 如地址 http://userscripts.org/scripts/show/84937 id为 84937
		curVersion:'2.1.0.0'						,//当前的版本号
		userJSName:'Super_prefetcher'		,//用户脚本的名字
	};
	//--必须填的3个参数

	var id=prefs.id,
				curVersion=prefs.curVersion,
				userJSName=prefs.userJSName;

	var metaData='http://userscripts.org/scripts/source/'+id+'.meta.js',
				downloadPage='http://userscripts.org/scripts/show/'+id,
				downloadAddress='http://userscripts.org/scripts/source/'+id+'.user.js',
				curURL=location.href;

	var GM_log=this.GM_log,
			GM_getValue=this.GM_getValue,
			GM_setValue=this.GM_setValue,
			GM_registerMenuCommand=this.GM_registerMenuCommand,
			GM_xmlhttpRequest=this.GM_xmlhttpRequest,
			GM_openInTab=this.GM_openInTab,
			GM_addStyle=this.GM_addStyle;

	//for opera
	if(operaObj){
		var idRandom,
					hashRandom;
		var idRE=new RegExp('@uso:script\\s+'+id,'i');
		//alert(idRE)
		var crossMessage=function(url,loadFN){
			if(window.name=='operaUJSCMIframe')return;
			window.addEventListener('message',function(e){
				var data=e.data,
							origin=e.origin;//发送消息的框架所在的域名
				//alert(data)
				if(data.indexOf('operaUJSCMIframe:')==0 && data.length>17 && data.search(idRE)!=-1){
					window.removeEventListener('message',arguments.callee,false);
					//alert(e.source)//跨域的情况下,将返回安全警告
					//alert(origin);
					//alert(data);
					var iframe=document.getElementById('operaUJSCMIframe'+idRandom);
					if(iframe)iframe.parentNode.removeChild(iframe);
					loadFN(data.slice(17));
				};
			},false);
			var Oiframe=document.createElement('iframe');
			Oiframe.name='operaUJSCMIframe';
			idRandom=Math.random();
			Oiframe.id='operaUJSCMIframe'+idRandom;//保证是独一无二的Id,这样在删除的时候,不会删除其他JS创建的iframe.
			Oiframe.src=url;
			Oiframe.style.setProperty('display','none','important');
			function apppendIframe(){
				apppendPosition.appendChild(Oiframe);
			};
			var apppendPosition=document.body;
			if(!apppendPosition){
				document.addEventListener('DOMContentLoaded',function(){
					apppendPosition=document.body;
					apppendIframe();
				},false);
			}else{
				apppendIframe();
			};
		};

		GM_log=console.log;
		GM_getValue=function(key,defaultValue){
			var value=operaSS.getItem(key);
			if(!value)return defaultValue;
			value=eval(value);
			var Vtype=value[1];
			value=decodeURIComponent(value[0]);
			switch(Vtype){
				case 'boolean':{
					return value=='true'? true:false;
				}break;
				case 'number':{
					return Number(value)
				}break;
				case 'string':{
					return value;
				}break;
				default:{
					//console.log(Vtype);
				}break;
			};
		};
		GM_setValue=function(key,value){
			if(!key || !value)return;
			key=String(key);
			operaSS.setItem(key,'["'+encodeURIComponent(String(value))+'","'+((typeof value).toLowerCase())+'"]');
		};
		GM_registerMenuCommand=function(){
			
		};
		GM_xmlhttpRequest=function(){
			
		};
		GM_openInTab=window.open;
		GM_addStyle=function(css){
			var style=document.createElement('style');
			style.type='text/css';
			style.textContent=css;
			document.getElementsByTagName('head')[0].appendChild(style);
		};
	};


	var checking;
	function checkUpdate(manual){
		if(checking)return;
		GM_setValue(id+'_lastCT',String(curT));
		checking=true;
		//manual=true;

		function getInfo(txt){
			//alert(txt);
			var latestVersion=txt.match(/@\s*version\s*([\d\.]+)\s*/i);
			if(latestVersion){
				latestVersion=latestVersion[1];
			}else{
				checking=false;
				if(manual)alert('检查失败,版本号不符合要求(版本号必须由 数字 和 . 组成),并且递增.');
				return;
			};
			//alert(latestVersion);

			var description=txt.match(/@\s*description\s*(.+)/i);
			if(description){
				description=description[1];
			};
			//alert(description);

			var author=txt.match(/@\s*author\s*(.+)\s*/i);
			if(author){
				author=author[1];
			};

			var timestamp=txt.match(/@\s*uso:timestamp\s*(.+)\s*/i);
			if(timestamp){
				timestamp=timestamp[1];
			};
			//alert(timestamp);

			//对比版本号
			var needUpdate;
			var xlatestVersion=latestVersion;
			var latestVersion=latestVersion.split('.');
			var lVLength=latestVersion.length;
			var currentVersion=curVersion.split('.');
			var cVLength=currentVersion.length;
			var lV_x;
			var cV_x;
			for(var i=0;i<lVLength;i++){
				lV_x=Number(latestVersion[i]);
				cV_x=(i>=cVLength)? 0 : Number(currentVersion[i]);
				if(lV_x>cV_x){
					needUpdate=true;
					break;
				}else if(lV_x<cV_x){
					break;
				};
			};
			checking=false;

			if(isDownloadPage){
				var install_script=document.getElementById('install_script');
				if(install_script){
					var userjs=install_script.getElementsByClassName('userjs');
					if(userjs){
						userjs=userjs[0];
						userjs.style.cssText='\
							font-size:14px!important;\
							color:black!important;\
						';
						if(needUpdate){
							userjs.style.setProperty('color','red','important');
							if(operaObj){
								userjs.textContent='更新:请右键另存为,然后改名为:'+userJSName+'.js';
							}else{
								userjs.textContent='更新:立即安装';
							}
						}else{
							userjs.textContent='不需要更新';
						};
					};
				};
			}else{
				if(needUpdate){
					var ok=confirm('找到了一个更新!'+'\n\nJS名字: '+userJSName+(author? ('\n作者: '+author) : '')+'\n描述: '+(description? description : '无')+'\n\n当前版本号: '+curVersion+'\n最新版本号: '+xlatestVersion+(timestamp? ('\n\n更新时间: '+timestamp):'')+'\n\n你是否要升级到最新呢?');
					if(ok){
						location.href=operaObj? downloadPage : downloadAddress;
					};
				}else{
					//手动更新才提示这个..
					if(manual){
						alert('已经是最新的了!'+'\n\nJS名字: '+userJSName+(author? ('\n作者: '+author) : '')+'\n描述: '+(description? description : '无')+'\n\n当前版本号: '+curVersion+'\n');
					};
				};
			};
		};

		if(operaObj){
			crossMessage(metaData,function(data){
				getInfo(data);
			});

		}else{
			GM_xmlhttpRequest({
				method: "GET",
				url:metaData,
				onload: function(rsp){
					if(rsp.status!=200){
						checking=false;
						if(manual){
							alert('网络故障,检查失败,请稍后再试试!')
						};
						return;
					};
					getInfo(rsp.responseText);
				}
			});
		};
	};

	function checkUpdateM(){
		checkUpdate(true);
	};

	if(operaObj){
		//alert(userJSName+'_checkUpdate');
		window[userJSName+'_checkUpdate']=checkUpdateM;
	};
	//javascript:Super_prefetch_checkUpdate();


	var registerMenuCommand=GM_getValue(id+'_registerMenuCommand',null);
	//alert(registerMenuCommand)
	if(registerMenuCommand===null){
		registerMenuCommand=true;
		GM_setValue(id+'_registerMenuCommand',registerMenuCommand);
	};
	if(registerMenuCommand){
		GM_registerMenuCommand('检查 '+userJSName+' 更新',checkUpdateM);
	};

	var autoUpdate=GM_getValue(id+'_autoUpdate',null);
	//alert(autoUpdate)
	if(autoUpdate===null){
		autoUpdate=true;
		GM_setValue(id+'_autoUpdate',autoUpdate);
	};
	if(!autoUpdate)return;

	var interval=GM_getValue(id+'_interval',null);
	//alert(interval)
	if(interval===null){
		interval='7';
		GM_setValue(id+'_interval',interval);
	};
	interval=Number(interval);


	var needCheck;
	var curT=new Date().getTime();
	//alert(typeof curT);

	var lastCT=GM_getValue(id+'_lastCT',null);
	//alert(lastCT);

	if(lastCT===null){
		needCheck=true;
	}else{
		var oneDay=86400000;//毫秒
		lastCT=Number(lastCT);
		needCheck=(((curT-lastCT)/oneDay)>=interval);
	};

	//如果在下载页面.
	var isDownloadPage=(curURL.indexOf(downloadPage)==0);
	//needCheck=true;
	if(needCheck || isDownloadPage)checkUpdate();
})();

// This is a greasemonkey script, for use with the Firefox extension Greasemonkey.
// More info: http://greasemonkey.mozdev.org/
//
// ==UserScript==
// @name			Super Next Page
// @author			Godeye
// @version			0.2.4
// @date				2012-01-02
// @namespace	godeye
// @description    左右键翻页并预读下一页 
// @description 	Based on Next Page & Prefetch Next Page & AutoPagerizer
// @identifier     	http://userscripts.org/scripts/source/38066.user.js
// @include          http://*
// @include          https://*
// @exclude			http://www.baidu.com/*
// @exclude			http://mail.163.com/*
// ==/UserScript==

/*
*************************************************
>>>>>>>>>>>超级下一页<<<<<<<<<<<<<
作者:godeye
Userscript:http://userscripts.org/scripts/show/38066
Mailto:ntdrv_1@126.com

说明:
功能开启/关闭:
StatusInTitle 	是否在标题栏显示预读状态
coloredlink		是否显示彩色链接
iconenable		是否显示右上方图标
historyenable	是否开启前进后退修正
详见参数设置部分,将相应变量设为false即可关闭
*************************************************
*/

(function() {
	if (window != top) if(checkInIframe()) return; // 如果已经在框架中了则退出，防止生成无限多个嵌套。。。
		
	
//==================================================================
	//参数设置
	var URL = 'http://userscripts.org/scripts/show/38066';
	var VERSION = '0.2.4';
	var leftpages = 1.5;	// 剩余页面高度小于 leftpages 倍可视窗体高度时，开始预读取下一页
	var scrollpos = 0.5;	// 剩余页面高度小于 scrollpos 倍总页面高度时，开始预读取下一页
	var StatusInTitle = false; // 是否在标题栏显示预读状态
	var coloredlink = true;  //是否显示彩色链接
	var iconenable = (window == top);	//是否显示右上方图标
	var historyenable = (window.location.hash == '');  //是否开启前进后退修正,为防止冲突,默认对使用ajax网站不启用
	var historymax = 10; //最大历史数目
	var intervaltime = 50;  //地址栏变化监听函数间隔,毫秒
	
//==================================================================


	
	//自定义图标颜色
	var COLOR = {  
	    on: '#0f0',
	    off: '#ccc',
		loading:'#ff0',
	    textdone: '#0ff',
		done: '#00f',
		not_found: '#0a0',
	    error: '#f0f'
	}
	// 自定义图标文字 
	var TEXT = (navigator.language == "zh-CN") ? {  //for chinese 
		prefetching:'正在预取...',
		textdone:'已预取文字...',
		textdonetip:'此页面文字已被预取，正在预取图片等...',
		done:'已完全预取',
		donetip:'此页面已被完全预取',
		error:'预读错误:',
		errortip:'此页面不能读取'
		} : {	// for other language
		prefetching:'Prefetching...',
		textdone:'Text Prefetched...',
		textdonetip:'Text Prefetched...，Now Prefetching Image...',
		done:'Prefetching Complete',
		donetip:'This page has been Prefetched',
		error:'Eorror Occurred:',
		errortip:'Can not Prefetching'
		}
		
/*
******************************************
 图标显示部分
 *****************************************
 */
	var IconHelper = function() {
	    this.state = GM_getValue('STATE');
	    var self = this

	    var toggle = function() {self.stateToggle()}
	    this.toggle = toggle

		this.initIcon()
		this.initHelp()
	    this.icon.addEventListener("mouseover",function(){self.viewHelp()}, true)
	}

	IconHelper.prototype.initHelp = function() {
	    var helpDiv = document.createElement('div')
	    helpDiv.setAttribute('id', 'nextpage_help')
	    helpDiv.setAttribute('style', 'padding:5px;position:fixed;' +
	                     'top:-200px;right:3px;font-size:10px;' +
	                     'background:#fff;color:#000;border:1px solid #ccc;' +
	                     'z-index:256;text-align:left;font-weight:normal;' +
	                     'line-height:120%;font-family:verdana;')

	    var toggleDiv = document.createElement('div')
	    toggleDiv.setAttribute('style', 'margin:0 0 0 50px;text-align:right;')
	    var a = document.createElement('a')
	    a.setAttribute('class', 'nextpage_link')
	    a.innerHTML = 'on/off'
	    a.href = 'javascript:void(0)'
	    var self = this
	    var toggle = function() {
	        self.stateToggle()
	        helpDiv.style.top = '-200px'
	    }
	    a.addEventListener('click', toggle, false)
	    toggleDiv.appendChild(a)

	    var s = '<div style="width:100px; float:left;">'
	    for (var i in COLOR) {
	        s += '<div style="float:left;width:1em;height:1em;' +
	            'margin:0 3px;background-color:' + COLOR[i] + ';' +
	            '"></div><div style="margin:0 3px">' + i + '</div>'
	    }
	    s += '</div>'
	    var colorDiv = document.createElement('div')
	    colorDiv.innerHTML = s
		helpDiv.appendChild(toggleDiv)
	    helpDiv.appendChild(colorDiv)
	    

	    var versionDiv = document.createElement('div')
	    versionDiv.setAttribute('style', 'clear:both;')
	    versionDiv.innerHTML = '<a href="' + URL +
	        '">Super Next Page</a> ' + VERSION
	    helpDiv.appendChild(versionDiv)
	    document.body.appendChild(helpDiv)

	    var proc = function(e) {
	        var c_style = document.defaultView.getComputedStyle(helpDiv, '')
	        var s = ['top', 'left', 'height', 'width'].map(function(i) {
	            return parseInt(c_style.getPropertyValue(i)) })
	        if (e.clientX < s[1] || e.clientX > (s[1] + s[3] + 11) ||
	            e.clientY < s[0] || e.clientY > (s[0] + s[2] + 11)) {
	                helpDiv.style.top = '-200px'
	        }
	    }
	    helpDiv.addEventListener('mouseout', proc, false)
	    this.helpLayer = helpDiv
	}

	IconHelper.prototype.viewHelp = function() {
	    this.helpLayer.style.top = '3px'
	}



	IconHelper.prototype.stateToggle = function() {
	    if (this.state == 'enable') {
	        this.disable()
	    }
	    else {
	        this.enable()
	    }
	}

	IconHelper.prototype.enable = function() {
	    this.state = 'enable'
		GM_setValue('STATE','enable');
	    this.icon.style.background = COLOR['on']
	    this.icon.style.opacity = 1
	}

	IconHelper.prototype.disable = function() {
	    this.state = 'disable'
		GM_setValue('STATE','disable');
	    this.icon.style.background = COLOR['off']
	    this.icon.style.opacity = 0.5
	}








	IconHelper.prototype.initIcon = function() {
	    var div = document.createElement("div")
	    div.setAttribute('id', 'nextpage_icon')
	    with (div.style) {
	        fontSize   = '12px'
	        position   = 'fixed'
	        top        = '3px'
	        right      = '3px'
	        background = COLOR['on']
	        color      = '#fff'
	        width = '10px'
	        height = '10px'
	        zIndex = '255'
	        if (this.state != 'enable') {
	            background = COLOR['off']
	        }
	    }
	    document.body.appendChild(div)
	    this.icon = div
	}


	IconHelper.prototype.error = function() {
	    this.icon.style.background = COLOR['error']
	}

	IconHelper.prototype.set = function(s) {
	    if (this.state == 'enable') {
			this.icon.style.background = COLOR[s]
		}
	}
	
	IconHelper.prototype.remove = function() {
		var s = document.getElementsByTagId('nextpage_help');
		if (s) s.parentNode.removeChild(s); 
		var t = document.getElementsByTagId('nextpage_icon');
		if (t) t.parentNode.removeChild(t); 
	}
	
	
	ap = (iconenable) ? (new IconHelper()):'';
	


/*
******************************************
判断下一页部分
 *****************************************
 */	
 
	//初始化全局变量	
	var readyfornext = false;  //下一页框架是否已加载
	var prefetched = false;  //是否已预读
	var currenturl = location.href;  //当前实际的URL,当使用动态网页时,地址栏地址和实际地址不等,
    var checked = false;  //链接是否已检查
    var delay = false;	//延迟标志
    var next = {}; //下一页链接
	var nextlinks;
	var newhistory = true;  //是否是新的浏览记录
	var lasthistory = new  Object;  //最后一个网页历史
	var lasthistorypushed = false;  //最后一个网页是否已记录
	

    var previous = {};
    // 下一页链接里的文字
    next.texts      = [ 'next',
                        'next page',
                        'old',
                        'older',
                        'earlier',
                        '下页',
                        '下頁',
                        '下一页',
                        '下一頁',
                        '后一页',
                        '后一頁',
                        '翻下页',
                        '翻下頁',
                        '后页',
                        '后頁',
                        '下翻',
                        '下一个',
                        '下一张',
                        '下一幅',
                        '下一节',
                        '下一章',
                        '下一篇',
                        '后一章',
                        '后一篇'
                      ];
    // 上一页链接里的文字
    previous.texts  = [ 'previous',
                        'prev',
                        'previous page',
                        'new',
                        'newer',
                        'later',
                        '上页',
                        '上頁',
                        '上一页',
                        '上一頁',
                        '前一页',
                        '前一頁',
                        '翻上页',
                        '翻上頁',
                        '前页',
                        '前頁',
                        '上翻',
                        '上一个',
                        '上一张',
                        '上一幅',
                        '上一节',
                        '上一章',
                        '上一篇',
                        '前一章',
                        '前一篇'
                      ];
    // 可能会误判的关键词
    next.miswords   = { "下一章": 30,
                        "下一篇": 30,
                        "后一章": 30,
                        "后一篇": 30,
                        "下一节": 30,
                        ">>": 2000,
                        "»": 2000
                      }
    previous.miswords = { "上一章": 30,
                          "上一篇": 30,
                          "前一章": 30,
                          "前一篇": 30,
                          "上一节": 30,
                          "<<": 2000,
                          "«": 2000
                        }

    // 取得自定义关键词
    getCustom(next, "next");
    getCustom(previous, "previous");
    // 注册脚本菜单
    registerMenu("next");
    registerMenu("previous");
    
    // 最后添加一些论坛使用的翻页符号
    next.texts.push(">>");
    next.texts.push(">");
    next.texts.push("»");
    next.texts.push("›");
    previous.texts.push("<<");
    previous.texts.push("<");
    previous.texts.push("«");
    previous.texts.push("‹");

    // 翻页文字的前面和后面可能包含的字符（正则表达式）
    var preRegexp  = '(^\\s*(?:[<‹«]*|[>›»]*|[\\(\\[『「［【]?)\\s*)';
    var nextRegexp = '(\\s*(?:[>›»]*|[\\)\\]』」］】]?)\\s*$)';

    // 取得并设置自定义关键词
    function getCustom(aObj, key) {
      var site, re;
      var cKeyWords = GM_getValue("custom_" + key, "");
      var words = cKeyWords.split(/,|，/);
      for each (var w in words) {
        site = null;
        if (/^\s*{\s*(\S*?)\s*}(.*)$/.test(w)) {
          site = RegExp.$1;
          w = RegExp.$2;
          site = site.replace(/[\/\?\.\(\)\+\-\[\]\$]/g, "\\$&").replace(/\*/g, "\.*");
        }
        w = w.replace(/\\/g, "\\").replace(/^\s+|\s+$/g, "");
        if (w) {
          if (site) {
            re = eval('/' + site + '/i');
            if (re.test(currenturl))
              aObj.texts.push(w);
          }
          else
            aObj.texts.push(w);
        }
      }
    }

    // 注册菜单
    function registerMenu(key) {
      if (navigator.language == "zh-CN") {
        var word = key == "next" ? "下一页" : "上一页";
        GM_registerMenuCommand("Next Page " + word + "关键词", function(){setCustom(key, word)});
      }
      else {
        GM_registerMenuCommand("Next Page custom_" + key, function(){setCustom(key, key)});
      }
    }

    // 设置新的关键词
    function setCustom(k, w) {
      var text = navigator.language == "zh-CN" ? "请输入“"+w+"”的关键词，以“,”号分隔开。" : "Please enter the "+w+" page key-words, split with ','.";
      var result = prompt(text, GM_getValue("custom_" + k, ""));
      if (result != null) GM_setValue("custom_" + k, result);
    }

    function checkLinks() {
      var link, text, ldnc, lnc, ldpc, lpc, num, digChked, digStart, linkNumber, found;
      var regexp = new RegExp();
      // 查找相应的链接
      var links = document.getElementsByTagName('A');
      for (var i = 0; i < links.length; i++) {
        link = links[i];

        // 跳过不起作用的链接
        if (!link.offsetParent || link.offsetWidth == 0 || link.offsetHeight == 0 || !link.hasAttribute("href") && !link.hasAttribute("onclick"))
          continue;
        // 跳过日历
        if (/(?:^|\s)(?:monthlink|weekday|day|day[\-_]\S+)(?:\s|$)/i.test(link.className))
          continue;
		
		//检测链接的id、calss、rel属性
		//ADD: 0.2.4 增加了对rel属性的检测
        if (/^nextlink/i.test(link.id) || /^linknext/i.test(link.id) ||
            /(^|\s)nextlink/i.test(link.className) || /(^|\s)linknext/i.test(link.className) || link.rel.toLowerCase() == 'next')
          next.link = link;
        if (/^prev(ious)?link/i.test(link.id) || /^linkprev(ious)?/i.test(link.id) ||
            /(^|\s)prev(ious)?link/i.test(link.className) || /(^|\s)linkprev(ious)?/i.test(link.className) || link.rel.toLowerCase() == 'prev')
          previous.link = link;

        text = link.textContent;
        if (!text) {
          // 若链接中没有文字，则检查图片的alt属性、链接或图片的title
		  //BUGFIX: 0.2.4 childNodes是对象不是数组!
		  //for each (var img in link.childNodes) {
          for (var j = 0; j < link.childNodes; j++) {
			img = link.childNodes[j];
            if (img.localName.toUpperCase() == "IMG") {
              text = img.alt || link.title || img.title;
              if (text) break;
            }
          }
          if (!text) continue;
        }
        text = text.toLowerCase().replace(/^\s+|\s+$/g, "");
        if (!text) continue;

        // 纯数字链接
        if (isDigital(text)) {
          if (digChked) continue;
          linkNumber = parseInt(RegExp.$1);
          if (!digStart) {
          // 检测上一个位置是否是当前页面的页数
            if (isCurrentPageNumber(link, linkNumber, -1)) {
              next.link = link;
              next.found = true;
              next.pos = i;
              digStart = digChked = true;
              ldpc = i + 30;
              continue;
            }
            // 否则，检测自身是否是当前页面的页数
            else if (isCurrentPageNumber(link, linkNumber, 0)) {
              // 再检测下一个位置是否是“下一页”的链接
              if (getNextLink(link, linkNumber+1, true)) {
                next.pos = i;
                digStart = digChked = true;
                ldpc = i + 30;
                continue;
              }
              // 设置同一组的纯数字链接已被检查
              digChked = true;
              // 设置往后的30个位置以内为“下一页”的可能链接，以提高检测速度。
              ldnc = i + 30;
            }
            // 同组的只需要被检测一次
            digStart = true;
          }
          // 检测下一个位置是否是当前页面的页数
          var tmpNode = isCurrentPageNumber(link, linkNumber, 1);
          if (tmpNode) {
            previous.link = link;
            previous.found = true;
            previous.pos = i;
            // 再检测下下一个位置是否是“下一页”的链接
            if (getNextLink(tmpNode, linkNumber+2, true))
              break;
            // 设置同一组的纯数字链接已被检查
            digChked = true;
            // 设置往后的30个位置以内为“下一页”的可能链接，以提高检测速度。
            ldnc = i + 30;
          }
          continue;
        }
        else {
          found = false;
          if (!next.found && !(lnc < i) && !(ldnc < i)) {
            for (var j = 0; j < next.texts.length; j++) {
              if (regexp.compile(preRegexp + next.texts[j] + nextRegexp, 'i').test(text)) {
                // 检测到“下一页”的链接
                found = true;
                next.link = link;
                num = next.miswords[next.texts[j]];
                // 若“下一页”的词语有可能会误判时，最多再检测预定个数的链接。
                (num == null) ? next.found = true : lnc = i + num;
                break;
              }
            }
          }
          if (!next.digital && lnc < i) next.found = true;

          if (!found && !previous.found && !(lpc < i) && !(ldpc < i)) {
            for (var j = 0; j < previous.texts.length; j++) {
              if (regexp.compile(preRegexp + previous.texts[j] + nextRegexp, 'i').test(text)) {
                // 检测到“上一页”的链接
                previous.link = link;
                num = previous.miswords[previous.texts[j]];
                // 若“上一页”的词语有可能会误判时，最多再检测预定个数的链接。
                (num == null) ? previous.found = true : lpc = i + num;
                break;
              }
            }
          }
          if (lpc < i) previous.found = true;
          // 重新设置纯数字链接未被检查
          digChked = digStart = null;
        }

        // 找到“上一页”和“下一页”的链接或找到其中一个而另一个超过规定范围没找到，将不再查找。
        if (next.found && previous.found ||
            next.found && i > next.pos + 30 ||
            previous.found && i > previous.pos + 30)
          break;
      }
      // 通过以上方法没有找到“下一页”的，把第一次检测出来的数字1的链接作为当前页，2作为“下一页”。
      if (!next.found && !next.link && next.digital)
        next.link = next.digital;

      if (next.link) next.found = true;
      if (previous.link) previous.found = true;

      if (!next.found && !previous.found)
        checkButtons();
    }

    // 检查翻页按钮
    function checkButtons() {
      var but, text, found;
      var regexp = new RegExp();
      var buts = document.getElementsByTagName('INPUT');
      for (var i = 0; i < buts.length; i++) {
        but = buts[i];
        if (but.hasAttribute("disabled") || !(/^button$/i.test(but.type) && but.getAttribute("onclick"))) continue;

        text = but.value;
        found = false;
        if (!next.found) {
          for (var j = 0; j < next.texts.length; j++) {
            if (regexp.compile(preRegexp + next.texts[j] + nextRegexp, 'i').test(text)) {
              // 检测到“下一页”的按钮
              next.link = but;
              next.found = found = true;
              break;
            }
          }
        }

        if (!found && !previous.found) {
          for (var j = 0; j < previous.texts.length; j++) {
            if (regexp.compile(preRegexp + previous.texts[j] + nextRegexp, 'i').test(text)) {
              // 检测到“上一页”的按钮
              previous.link = but;
              previous.found = true;
              break;
            }
          }
        }
        if (next.found && previous.found) break;
      }
    }

    // 取得相邻的纯数字节点，type: 1 下一个；-1 上一个
    function getSiblingNode(node, type) {
      if (!node) return null;
      node = getSibling(node, type);
      while (node && (node.nodeName == "#coment" ||
            (/^\s*[\]］】]?[,\|]?\s*[\[［【]?\s*$/.test(node.textContent))))
        node = getSibling(node, type);
      return node;
    }
    function getSibling(aNode, type) {
      if (!aNode) return null;
      if (isOnlyNode(aNode)) {
        try {
          aNode = (type == 1 ? aNode.parentNode.nextSibling : aNode.parentNode.previousSibling);
          if (skipNode(aNode))
            aNode = (type == 1 ? aNode.nextSibling : aNode.previousSibling);
          aNode = aNode.childNodes[0];
          if (skipNode(aNode))
            aNode = aNode.nextSibling;
        }
        catch (e) {return null;}
      }
      else {
        aNode = (type == 1 ? aNode.nextSibling : aNode.previousSibling);
      }
      return aNode;
    }
    function isOnlyNode(n) {
      return !n.nextSibling && !n.previousSibling ||
             !n.nextSibling && skipNode(n.previousSibling) && !n.previousSibling.previousSibling ||
             !n.previousSibling && skipNode(n.nextSibling) && !n.nextSibling.nextSibling ||
             skipNode(n.previousSibling) && !n.previousSibling.previousSibling &&
             skipNode(n.nextSibling) && !n.nextSibling.nextSibling;
    }
    function skipNode(sNode) {
      return sNode && /*sNode.nodeName == "#text" &&*/ (/^\s*$/.test(sNode.textContent));
    }

    // 检测是否有下一页的纯数字链接，number:页数
    function getNextLink(node, number, set) {
      var tNode = getSiblingNode(node, 1);
      if (tNode && tNode.nodeName == "A" && isDigital(tNode.textContent)) {
        if (RegExp.$1 == number) {
          // 找到纯数字链接
          if (set) {
            next.link = tNode;
            next.found = true;
          }
          return tNode;
        }
      }
      return null;
    }

    function isDigital(str, t) {
      str = str.replace(/^\s+|\s+$/g, "");
      if (t == -1)
        str = str.split(/\s+/).pop();
      else if (t == 1)
        str = str.split(/\s+/)[0];
      return (/^(\d+)$/.test(str)) ||
             (/^\[(\d+)\]$/.test(str)) ||
             (/^【(\d+)】$/.test(str)) ||
             (/^［(\d+)］$/.test(str)) ||
             (/^<(\d+)>$/.test(str)) ||
			 (/^(\d+),$/.test(str));	//***[自己加的]判断诸如1,2,3,4的数字连接
    }

    // 判断是否是当前页面的数字，type:-1,0,1 分别是要判别的上一个、当前、下一个节点
    function isCurrentPageNumber(node, linkNum, type) {
      var tNode = (type == 0 ? node : getSiblingNode(node, type));
      if (tNode && (tNode.nodeName != "A" && isDigital(tNode.textContent, type) ||
          tNode.nodeName == "A" && !tNode.hasAttribute("onclick") &&
          (!tNode.href && isDigital(tNode.textContent, type) || !(/\/#[^\/]+$/.test(tNode.href)) &&
          tNode.href == currenturl && isDigital(tNode.textContent, type)))) {
        var n = linkNum + type;
        if (n > 0 && RegExp.$1 == n) {
          if (next.digital) next.digital = null;
          return tNode;
        }
      }
      // 某些论坛处在第一页时，实际链接和当前页链接不符，只有和其余纯数字链接的结构或颜色不同时，
      // 才使用纯数字的“2”作为“下一页”的链接。
      else if (type == 0 && !next.digital && tNode && tNode.nodeName == "A" &&
            (/^\s*[\[［【]?1[\]］】]?\s*$/.test(tNode.textContent))) {
        var two = getNextLink(tNode, 2);
        if (two && difDigital(tNode, two))
          next.digital = two;
      }
      return null;
    }

    function difDigital(node1, node2) {
      if (getStructure(node1) == getStructure(node2) && getStyleColor(node1) == getStyleColor(node2))
        return false;
      return true;
    }
    function getStructure(aNode) {
      return aNode.innerHTML.replace(/\d+/, "");
    }
    function getStyleColor(aNode) {
      return document.defaultView.getComputedStyle(aNode, null).getPropertyValue("color");
    }

    function openLink(linkNode) {
      if (!linkNode) return;
      if (linkNode.getAttribute("onclick") || (/\/#[^\/]*$/.test(linkNode.href)) &&
          linkNode.href.replace(/\/#[^\/]*$/, "") == currenturl.replace(/\/(?:#[^\/]*|#?)$/, "")) {
        // 有些4D鼠标摆动一下滚轮会触发多下的方向键，故增设一个延迟参数，使它只翻一页。
        delay = true;
        setTimeout(cleanVars, 300);
        var e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", 1, 1, window, 1, 0,0,0,0,0,0,0,0,0, linkNode);
        linkNode.dispatchEvent(e);
      }
      else if (linkNode.href && linkNode.href != currenturl){
        cleanVars();
		location.assign(linkNode.href);
      }
    }
    function cleanVars() {
      try {
		//预读为否
		prefetched = false;
		readyfornext = false;
		nextlinks = null;
		
        checked = false;
        delay = false;
        next.link = next.found = next.digital = null;
		// next.found = next.digital = null;
        previous.link = previous.found = previous.digital = null;
        delete next.pos;
        delete previous.pos;
		if (StatusInTitle) {
			document.title = document.title.replace(/【.*】/,'');
		}
      } catch(e) {}
    }

    function onKeyDown(event) {
      // 不是左右方向建被按下或不到延迟时间则退出
      if (event.ctrlKey || event.shiftKey || event.metaKey || event.keyCode != 37 && event.keyCode != 39 || delay)
        return

      // 确保光标不是定位在文字输入框或选择框
      var localName = event.target.localName.toUpperCase();
      if (localName == 'TEXTAREA' || localName == 'INPUT' || localName == 'SELECT')
        return;

      // 检查过且没有发现上一页或下一页的连接，则退出
      if (checked && !next.found && !previous.found)
        return;

      if (!checked) {
        checkLinks();
        checked = true;
      }

      if (event.keyCode == 37 && previous.found) {
        // 左方向键，跳到“上一页”
        openLink(previous.link)
      }
      else if (event.keyCode == 39 && next.found) {
        // 右方向键，跳到“下一页”
		if (readyfornext) {
			
			var e = document.createEvent("MouseEvents");
			e.initMouseEvent("click", 1, 1, window, 1, 0,0,0,0,0,0,0,0,0, next.link);
			next.link.dispatchEvent(e);
		} else {
			openLink(next.link);
		}
      }
    }






	
/*
 ******************************************************************************************
 *  预取下一页部分
 ******************************************************************************************
 */
	//本窗口是否在预取框架内
	function checkInIframe(){
		var r = false;
		try{
			r = parent.document.getElementById('pfnext_if').src == location;
		} catch(e){}
		return r;
	}
	
	// 获取距页面底部最近的元素的top值
	function getTopest(xpresult){
		var topest=0, tmp;
		for (var i=0;i<xpresult.snapshotLength;i++){
			tmp = getTop(xpresult.snapshotItem(i));
			topest = topest > tmp?topest:tmp;
		}
		return topest;
	}

	
	//获取元素相对页面顶部的纵坐标
	function getTop(e){
    var offset = e.offsetTop;
    if (e.offsetParent != null) 
        offset += getTop(e.offsetParent);
    return offset;
	}
	
	
	function onIframeLoaded(event,reg,status,statusTip,borderColor){
	    var thishref = String(event.target.location);
	    
	    
		var nexthref = String(next.link.href);
		
		if (nexthref.replace(/\/$/, '') == thishref.replace(/\/$/, '')) {
		
			if (StatusInTitle) {
				// 将预取情况显示在标题中。
				document.title = document.title.replace(/【.*】/,'【' + status + '】');
			}
			
			// try {
				//用颜色框标记出已被预取的链接。如不需要可注释掉下面两行。
				// next.link.style.border = 'solid 3px ' + borderColor;
				// next.link.title = next.link.title.replace(/【.*】/,'') + '【' + statusTip + '】';
			// } 
			// catch (e) {
			// }
			
			// 给所有被预取的链接添加事件。点击该连接时将 iframe 中已经预取到的内容直接覆盖 top 页面，达到迅速打开页面的效果。
			
			for (var j = 0; j < nextlinks.snapshotLength; j++) {
				if(reg){	//是否注册,防止注册多个EventListener
					nextlinks.snapshotItem(j).addEventListener('click', function(event){
						onClick(event)
					}, false)
				}
				
				if (coloredlink) {
					try {
						nextlinks.snapshotItem(j).style.border = 'solid 3px ' + borderColor;
						nextlinks.snapshotItem(j).title = nextlinks.snapshotItem(j).title.replace(/【.*】/,'') + '【' + statusTip + '】';
					} catch (e) {
					}
				}
			
			}
		}

	}
	
	
	//点击事件处理
	function onClick(event){
	    var i_html = document.getElementById('pfnext_if').contentDocument.getElementsByTagName('body')[0];
	    var html = document.getElementsByTagName('body')[0];
	    if (!html.innerHTML.length || !i_html.innerHTML.length) 
	        return;
		//增加一个新历史记录
		if(historyenable) {
			newhistory = true;
			var history = new Object;
			history.url = location.href;
			history.html = html.innerHTML;
			historyManage.addCase(history);
		}
		html.innerHTML = i_html.innerHTML;
		currenturl = next.link;  //计算实际URL
		
		window.scrollTo(0, 0);
		delete ap;
		cleanVars();
		ap = (iconenable) ? (new IconHelper()):'';
	    watch_scroll();
	    event.stopPropagation();
	    event.preventDefault();
	}
	
	function matchNode(xpath, root){
    var type = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
    var doc = root ? root.evaluate ? root : root.ownerDocument : document;
    return doc.evaluate(xpath, root || doc, null, type, null);
}
	
	var innerHeight = window.innerHeight ? window.innerHeight : document.body.clientHeight;
	function watch_scroll(){
		if (!prefetched && ap.state != 'disable') {
				if (!checked) {
					checked = true;
					checkLinks();
				}
				if (next.found && next.link.href) {
					nextlinks = matchNode('//a[@href="' + next.link.getAttribute('href') + '"]'); 
					var scrollTop = window.scrollY;
					// var scrollHeight = document.body.scrollHeight;
					var scrollHeight = getTopest(nextlinks);
					
					if (scrollHeight - innerHeight - scrollTop < innerHeight * leftpages || scrollHeight - innerHeight - scrollTop < scrollHeight * scrollpos) {
						// 如果剩余页面高度小于 leftpages * 窗口高度，则开始预取下一页
						prefetched = true;
						
						var prefetchContainerDiv = document.createElement('div');
	                    prefetchContainerDiv.setAttribute('style', 'position: fixed; top:0; left:0; opacity: 0;z-index: -10;');
	                    document.body.appendChild(prefetchContainerDiv);
						
						var prefetchIframe = document.createElement('iframe');
                        prefetchIframe.setAttribute('id', 'pfnext_if');
                        prefetchIframe.setAttribute('style', 'display: none;');
                        prefetchIframe.setAttribute('style', 'visibility: hidden;');
                        prefetchIframe.setAttribute('src', String(next.link.href));
                        prefetchContainerDiv.appendChild(prefetchIframe);
						
						//注册地址栏变化的监听函数
						if(historyenable){
							historyManage.run(historyHandle);
						}
						
						
                        if (StatusInTitle) {
                            document.title += '【' + TEXT.prefetching + '】';
                        }
						if(iconenable) ap.set('loading');
						
						var prefetchIframe = document.getElementById('pfnext_if');
                        
                        // 当框架加载完成，改变标题栏提示，并给相应链接添加事件。
                        // 结构已加载完毕
                        prefetchIframe.contentWindow.addEventListener('DOMContentLoaded', function(event){
                            onIframeLoaded(event,true,TEXT.textdone,TEXT.textdonetip,COLOR.textdone);
							readyfornext = true;
							if(iconenable) ap.set('textdone');
                        }, false)
                        // 完全加载完毕
                        prefetchIframe.contentWindow.addEventListener('load', function(event){
                            onIframeLoaded(event,false,TEXT.done,TEXT.donetip,COLOR.done)
							if(iconenable) ap.set('done');
                        }, false)
						// 加载错误
                        prefetchIframe.contentWindow.addEventListener('OnError', function(event){
                             onIframeLoaded(event,false,TEXT.error+event,TEXT.errortip,COLOR.error)
							 if(iconenable) ap.set('error');
                        }, false)
						
						
						
					}
				} else {
					if(iconenable) ap.set('not_found');
				}
		}
	}

	
/*
********************************
前进后退修正部分
********************************
*/

var historyManage = (function(){
			var cases = new Array(historymax);  //浏览历史循环数组
			var casesIndex = 0;	//循环数组索引
			var lastHash = 0;  //最后锚
			var getHash = function(){ //获得当前锚
				var i, href;
				href = top.location.href;
				i = href.indexOf("#");
				return i >= 0?href.substr(i+1):0;
			};
			return {
				//增加一个历史项
				addCase:function(caseData){//alert('case add!\n'+'caseIndex:'+casesIndex+'\nurl:'+caseData.url);	
					cases[casesIndex] = caseData;
					if(++casesIndex>=historymax) casesIndex = 0;
					location.hash = casesIndex
				},
				//增加最后一个历史项(用于正确前进)
				pushCase:function(caseData){//alert('case pushed!\n'+'caseIndex:'+casesIndex+'\nurl:'+caseData.url);
					cases[casesIndex] = caseData;
				},
				//监听函数
				run:function(fn){
					if(getHash()!="")location.hash=getHash();
					setInterval(function(){
						var newHash = getHash();
						if(lastHash!=newHash){//alert('Hash changed!'+'\nbefore:'+lastHash+'\nafter:'+newHash);
							fn(cases[newHash]);
							lastHash = newHash;
						}
					},intervaltime);
				}
			};
		})();

	//锚号变化处理	
	function historyHandle(history){
		//浏览历史记录变更(前进后退)
		checkLastPage();
		if(!newhistory){//alert('history changed!\nhash:'+location.hash+'\nurl:'+history.url);
			document.getElementsByTagName('body')[0].innerHTML=history.html;
			currenturl = history.url;
			window.scrollTo(0, 0);
			//是否前进至了最后一个记录,重新预读
			if (currenturl==lasthistory.url){
				delete ap;
				cleanVars();
				ap = (iconenable) ? (new IconHelper()):'';
				watch_scroll();
			}
		}
		newhistory = false;		
	}
	
	//处理最后一个网页(用于正确前进)
	function checkLastPage(){
		if(!newhistory&&!lasthistorypushed) {
			historyManage.pushCase(lasthistory);
			lasthistorypushed = true;
		}else if(newhistory){
			lasthistory.url = location;
			lasthistory.html = document.getElementsByTagName('body')[0].innerHTML;
			lasthistorypushed = false;
		}
	}
	
    window.addEventListener("keydown", function(e){onKeyDown(e)}, true);
	//****预读下一页****
	window.addEventListener('load', watch_scroll, true);
	window.addEventListener('scroll', watch_scroll, true);
})();


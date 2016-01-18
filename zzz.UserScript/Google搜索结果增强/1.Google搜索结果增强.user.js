// ==UserScript==
// @name Google搜索结果增强
// @namespace test
// @include https://www.google.com/*
// @version 0.8
// @description 屏蔽卡饭教程，移除结果链接重定向
// @grant none
// @run-at       document-start
// ==/UserScript==
var observer = new MutationObserver(clean);
var options = {childList: true,subtree: true};
observer.observe(document, options);

function clean() {
    blockKeyWord();
    var items = document.querySelectorAll('a[onmousedown]');
		for(var i =0;i<items.length;i++){
    		items[i].removeAttribute('onmousedown');
    }
}

var keyword=['kafan.cn/topic','kafan.cn/edu','kafan</em>.cn/topic','kafan</em>.cn/edu',
             'wcuckoo.com','eooele.com','uberalift.com','aipeicai.com','gufensoso.cn',
             'kw115.co','whost.win','360du.net.cn','kuaiso.com','gukong.com','loveyoursuit.tk',
             'weidaohang.org','590s.com','hesooo.com','zhao580.com','092992.cn','ciliba.com',
             'yunkuaijie.com','pmsou.com','wrsou.com','wuaikx.com','woe.cc','hao136.com',
             '360doc.com','juziso.com','d1s.top'];
var regkeyword=keyword[0].replace(".","\\.");
for (var j=1;j<keyword.length;j++){regkeyword = regkeyword +"|"+ keyword[j].replace(".","\\.");}
var regexp= new RegExp(regkeyword);

function blockKeyWord() {
  var citeList = document.querySelectorAll('.g h3 a');
  for (var index = 0;index < citeList.length; index++) {
      var element = citeList[index];
      if (regexp.test(element.href)||element.innerHTML.indexOf('快搜') > - 1) { element.parentNode.parentNode.parentNode.remove();}
  }
}

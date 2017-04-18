// ==UserScript==
// @name           Listen to my - Replace and Shield(2A)
// @author         Yulei
// @namespace      Yuleigq@gmail.com
// @description    My site I call the shots;I listen to my site.Anti-AD,Replace and Shield to Word or Code.(2Advanced)
// @version        1.02.17
// @create         2013-04-15
// @lastmodified   2013-04-17
// @include        http://*
// @include        file://*
// @exclude        http://192.168.*
// @copyright      2013+, Yulei
// @grant          none
// @run-at         document-start
// @updateURL      none
// @downloadURL    none
// ==/UserScript==

(function() {//alert(document.body);

var AList={
/***************
 要查找或替换的内容，使用正则
* 每句一行，用双引号括起来，冒号之间必须一对一，英文逗号分隔；出错了你别叫；
*如屏蔽，写成 "原文":"已改", 即可
* 要屏蔽或替换后的内容，不能使用正则 
****************/
////---- Begin以下内容增减开始 ----////

"百度|摆渡" : "度娘",
"新" : "new", /* 中英对译 */
"歌" : "哥",
"<b>(\\S+)</b>" : "<i>$1</i>",
"hm.baidu.com" : "",
"fu\\*k" : "fuck", /* 被屏蔽词 */
"http://\\w+.\\w+.\\w+/\\d/\\d+/\\d+/\\d+/\\d+_avatar_middle.jpg" : "",  /* 屏蔽DZ头像 */


////---- End到此结束了 ----////
"":""
};

//以下你不懂，别碰哦，坏了就(~_-o!!)杯具了

function Yu() {
//var Dci=document.documentElement.innerHTML;
for (var i in AList){ var Xy=new RegExp(i,"ig");
//如果只是屏蔽或替换要求比较简单，请使用下面一条，以免开大站时网页闪屏
//document.documentElement.innerHTML=document.documentElement.innerHTML.replace(Xy,AList[i]);
document.body.innerHTML=document.body.innerHTML.replace(Xy,AList[i]);
}

};
 if (window.opera){window.opera.addEventListener('BeforeEvent.DOMContentLoaded',Yu,false)}else{Yu()};


 /* （兼容：Firefox18、Chromes23、Opera12；）
 *  我的地盘我做主；替换、屏蔽、拦截网页中的文字及元素。高级版2
 *白黑名单，自行添加，如
 * @include  http://*baidu.c*
 * @exclude  http://192.168.*
  * 简简单单 -|- by Yulei 本脚本只作学习研究参考用，版权所有 不得滥用、商用、它用，后果自负 */
})();


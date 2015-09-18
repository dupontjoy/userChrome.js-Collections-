// ==UserScript==
// @name        解除右键限制
// @namespace   no
// @description 只是解除右键，并没有解除选中限制，所以在有的网站不能选中复制文字。开关型的小书签，比较强力，能解除CSS鼠标限制，再次点击以关闭效果。
// @include     http*://*.terapeak.com*
// @author      Cing
// @version     2015.09.17
// @grant 		  none
// 来源：http://bbs.kafan.cn/forum.php?mod=redirect&goto=findpost&ptid=1665500&pid=30170365

// ==/UserScript==

//只是解除右键
(function(){
javascript:function applyWin(a){if(typeof a.__nnANTImm__==="undefined"){a.__nnANTImm__={};a.__nnANTImm__.evts=["mousedown","mousemove","copy","contextmenu"];a.__nnANTImm__.initANTI=function(){a.__nnantiflag__=true;a.__nnANTImm__.evts.forEach(function(c,b,d){a.addEventListener(c,this.fnANTI,true)},a.__nnANTImm__)};a.__nnANTImm__.clearANTI=function(){delete a.__nnantiflag__;a.__nnANTImm__.evts.forEach(function(c,b,d){a.removeEventListener(c,this.fnANTI,true)},a.__nnANTImm__);delete a.__nnANTImm__};a.__nnANTImm__.fnANTI=function(b){b.stopPropagation();return true};a.addEventListener("unload",function(b){a.removeEventListener("unload",arguments.callee,false);if(a.__nnantiflag__===true){a.__nnANTImm__.clearANTI()}},false)}a.__nnantiflag__===true?a.__nnANTImm__.clearANTI():a.__nnANTImm__.initANTI()}applyWin(top);var fs=top.document.querySelectorAll("frame, iframe");for(var i=0,len=fs.length;i<len;i++){var win=fs[i].contentWindow;try{win.document}catch(ex){continue}applyWin(fs[i].contentWindow)};void 0;
})()
// ==UserScript==
// @name        修正 Discuz 论坛 relatedlink 的 bug
// @namespace   Y大 (http://bbs.kafan.cn/forum.php?mod=redirect&goto=findpost&ptid=1755690&pid=32037181)
// @include     *forum.php?mod=viewthread&tid=*
// @version     1
// @grant       none
// @run-at      document-start
// ==/UserScript==
 
function run() {
  Object.defineProperty(window, 'relatedlink', {
    get: function() { return []; },
    set: function() {}
  });
}
 
var script = document.createElement('script');
script.textContent = '(' + run.toString() + ')();';
document.head.appendChild(script)
// ==UserScript==
// @name          Offsite Blank
// @namespace     Offsite_Blank
// @description   force offsite links to open in a new window//强制外站链接在新窗口中打开
// @version       1
// @Mod           star-ray
// @grant         none
// @include       http*
// ==/UserScript==
 
var a, i, s = location.host,
c = document.querySelectorAll('a[href]:not([target=_blank])');
for (i = c.length; a = c[--i];)
    if (a.host !== s) a.target = '_blank';
// ==UserScript==
// @name          Offsite Blank
// @namespace     http://diveintogreasemonkey.org/download/
// @description   force offsite links to open in a new window//强制外站链接在新窗口中打开
// @version       1
// @include       http://*
// @include       https://*
// ==/UserScript==

var a, thisdomain, links;
thisdomain = window.location.host;
links = document.getElementsByTagName('a');
for (var i = 0; i < links.length; i++) {
	a = links[i];
	if (a.host && a.host != thisdomain) {
		a.target = "_blank";
	}
}
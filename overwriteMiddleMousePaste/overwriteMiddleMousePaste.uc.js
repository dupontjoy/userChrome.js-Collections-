// ==UserScript==
// @name overwriteMiddleMousePaste.uc.js
// @namespace http://d.hatena.ne.jp/Griever/
// @include main
// ==/UserScript==
document.documentElement.addEventListener("click", function(event){
if (event.button !== 1 || !gPrefService.getBoolPref('middlemouse.paste')) return;
var localName = event.target.localName.toLowerCase();
if ((localName === 'input' || localName === 'textarea' || localName === 'textbox') &&
document.commandDispatcher.getControllerForCommand("cmd_paste") ){
goDoCommand("cmd_paste");
event.preventDefault();
}
}, true);
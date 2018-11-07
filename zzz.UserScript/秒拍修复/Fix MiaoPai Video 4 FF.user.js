// ==UserScript==
// @name              Fix MiaoPai Video 4 FF
// @namespace         a@b.c
// @author            jasake
// @description       Fix MiaoPai Video 4 FF
// @include           http://n.miaopai.com/media/*
// ==/UserScript==

location.href = 'javascript:var event=new Event("videoFix");document.dispatchEvent(event);void(0)';
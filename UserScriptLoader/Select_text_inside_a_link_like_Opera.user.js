// ==UserScript==
// @name        Select text inside a link like Opera
// @namespace   eight04.blogspot.com
// @description Disable link dragging and select text.
// @include     http://*
// @include     https://*
// @version     4.0.12
// @grant		GM_addStyle
// @run-at      document-start
// ==/UserScript==

"use strict";

function caretPositionFromPoint(x, y) {
	if (document.caretPositionFromPoint) {
		return document.caretPositionFromPoint(x, y);
	}
	var r = document.caretRangeFromPoint(x, y);
	return {
		offsetNode: r.startContainer,
		offset: r.startOffset
	};
}

function inSelect(caretPos, selection){
	var i, len = selection.rangeCount, range;
	for (i = 0; i < len; i++) {
		range = selection.getRangeAt(i);
		if (range.isPointInRange(caretPos.offsetNode, caretPos.offset)) {
			return true;
		}
	}
	return false;
}

var force = {
	target: null,
	select: getSelection(),
	currentPos: {
		x: null,
		y: null
	},
	startPos: {
		x: null,
		y: null
	},
	lastMouseDownPos: {
		x: null,
		y: null
	},
	handleEvent: function(e){
		var caretPos, a, movementX, movementY, select;

		if (e.type == "click") {

			if (e.ctrlKey || e.shiftKey || e.altKey || e.button) {
				return;
			}

			// Fix browser clicking issue.
			select = window.getSelection();
			if (this.uninitFlag || !select.isCollapsed && e.pageX && e.pageY && (e.pageX != this.lastMouseDownPos.x || e.pageY != this.lastMouseDownPos.y)) {
				e.preventDefault();
				e.stopImmediatePropagation();
			}

		} else if (e.type == "mousedown") {

			if (e.ctrlKey || e.shiftKey || e.altKey || e.button) {
				return;
			}

			// Trak clicking to solve this:
			// https://greasyfork.org/ru/forum/discussion/1898/doesn-t-work-on-some-sites
			this.lastMouseDownPos.x = e.pageX;
			this.lastMouseDownPos.y = e.pageY;

			this.uninitFlag = false;

			if (e.target.nodeName == "IMG") {
				this.imgFlag = true;
			}

			select = window.getSelection();
			if (!select.isCollapsed) {
				caretPos = caretPositionFromPoint(e.pageX - window.scrollX, e.pageY - window.scrollY);
				if (!inSelect(caretPos, select)) {
					select.collapse(caretPos.offsetNode, caretPos.offset);
				}
			}

		} else if (e.type == "mouseup") {

			this.checkMove = false;
			this.imgFlag = false;

			if (!this.target) {
				return;
			}

			this.uninitFlag = true;
			this.uninit();

		} else if (e.type == "mousemove") {

			this.moveX = e.pageX - this.currentPos.x;
			this.moveY = e.pageY - this.currentPos.y;
			this.currentPos.x = e.pageX;
			this.currentPos.y = e.pageY;

			if (!this.target) {
				return;
			}

			select = window.getSelection();
			caretPos = caretPositionFromPoint(this.currentPos.x - window.scrollX, this.currentPos.y - window.scrollY);
			if (!this.multiSelect) {
				select.extend(caretPos.offsetNode, caretPos.offset);
			} else {
				this.range.setEnd(caretPos.offsetNode, caretPos.offset);
			}

		} else if (e.type == "dragstart") {

			if (e.button || e.altKey || e.shiftKey) {
				return;
			}

			if (this.imgFlag) {
				this.imgFlag = false;
				return;
			}

			a = e.target;
			while (a.nodeName != "A" && a.nodeName != "HTML") {
				a = a.parentNode;
			}

			if (!a.href) {
				return;
			}

			movementX = e.pageX - this.currentPos.x;
			movementY = e.pageY - this.currentPos.y;

			if (!movementX && !movementY) {
				movementX = this.moveX;
				movementY = this.moveY;
			}
			if (Math.abs(movementX) < Math.abs(movementY)) {
				return;
			}

			e.preventDefault();
			this.target = a;
			this.init(e);
		}
	},
	init: function(e){
		var select = window.getSelection();

		this.startPos.x = e.pageX;
		this.startPos.y = e.pageY;

		this.multiSelect = e.ctrlKey;

		var caretPos = caretPositionFromPoint(this.startPos.x - window.scrollX, this.startPos.y - window.scrollY);
		if (!this.multiSelect) {
			select.collapse(caretPos.offsetNode, caretPos.offset);
		} else {
			this.range = new Range();
			this.range.setEnd(caretPos.offsetNode, caretPos.offset);
			this.range.collapse();
			select.addRange(this.range);
		}

		this.target.classList.add("force-select");

	},
	uninit: function(){

		this.target.classList.remove("force-select");
		this.target = null;
		this.range = null;
		this.multiSelect = false;

	}
};

document.addEventListener("mousemove", force, false);
document.addEventListener("mouseup", force, false);
document.addEventListener("mousedown", force, true);
document.addEventListener("click", force, true);
document.addEventListener("dragstart", force, true);
document.addEventListener("DOMContentLoaded", function(){
	GM_addStyle(".force-select{ -moz-user-select: text!important; }");
}, false);

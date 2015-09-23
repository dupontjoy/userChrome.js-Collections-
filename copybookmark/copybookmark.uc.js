// ==UserScript==
// @id             copyBookmark
// @name           Enhanced Bookmark Copy
// @version        0.9.2
// @namespace      simon
// @author         Simon Chan
// @description    Let you copy title or both title and url of bookmark(s) easier.
// @include        chrome://browser/content/browser.xul
// @include        chrome://browser/content/places/places.xul
// @include        chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include        chrome://browser/content/history/history-panel.xul
// @run-at         document-end
// ==/UserScript==

(function () {
	var targetURIs = [
		"chrome://browser/content/browser.xul",
		"chrome://browser/content/places/places.xul",
		"chrome://browser/content/bookmarks/bookmarksPanel.xul",
		"chrome://browser/content/history/history-panel.xul"
	];
	if (!location in targetURIs)
		return;

	var topLevel;
	function getSpace(indentLevel) {
		var str = [];
		for (var i = -1; i < indentLevel - topLevel; i++)
			str.push(null);
		return str.join("    ");
	}

	XPCOMUtils.defineLazyServiceGetter(this, "annotations", "@mozilla.org/browser/annotation-service;1", "nsIAnnotationService");

	function getChildren(node, type) {
		var results = [];
		var space = getSpace(node.indentLevel);

		if (PlacesUtils.nodeIsFolder(node) && annotations.itemHasAnnotation(node.itemId, PlacesUtils.LMANNO_FEEDURI)) {
			results.push(space + node.title);
			if (type == "both")
				results.push(space + annotations.getItemAnnotation(node.itemId, PlacesUtils.LMANNO_FEEDURI));
		}
		else if (PlacesUtils.nodeIsContainer(node)) {
			asContainer(node);
			var wasOpen = node.containerOpen;
			if (!wasOpen)
				node.containerOpen = true;
			results.push(space + node.title + " " + "(文件夾)");
			for (var i = 0; i < node.childCount; i++)
				results = results.concat(getChildren(node.getChild(i), type));
			node.containerOpen = wasOpen;
		}
		if (PlacesUtils.nodeIsURI(node)) {
			if (node.title == null)
				results.push(space + "(無標題)");
			else
				results.push(space + node.title);
			if (type == "both")
				results.push(space + node.uri);
		}
		if (PlacesUtils.nodeIsSeparator(node))
			results.push(space + "--------------------");

		return results;
	}

	XPCOMUtils.defineLazyServiceGetter(this, "clipboard", "@mozilla.org/widget/clipboardhelper;1", "nsIClipboardHelper");

	function copyBookmark_copy(type) {
		var results = [];
		PlacesUIUtils.getViewForNode(document.popupNode).selectedNodes.forEach(function (node) {
			topLevel = node.indentLevel;
			if (PlacesUtils.nodeIsFolder(node) &&
			asQuery(node).queryOptions.excludeItems) {
				var oldState = node.containerOpen;
				var concreteId = PlacesUtils.getConcreteItemId(node);
				results = results.concat(getChildren(PlacesUtils.getFolderContents(concreteId, false, true).root, type));
				node.containerOpen = oldState;
			}
			else
				results = results.concat(getChildren(node, type));
		});
		clipboard.copyString(results.join("\r\n"));
	}

	var copyMenuItem = $("placesContext_copy");
		copyMenuItem.label = "複製網址";
	var copyTitleMenuItem = copyMenuItem.parentNode.insertBefore($C("menuitem", {
		id: "copyBookmark_copyTitle",
		label: "複製標題",
		selection: "any",
		closemenu: "single",
		accesskey: "t"
	}), copyMenuItem);
		copyTitleMenuItem.addEventListener("command", function () {copyBookmark_copy();});
	var copyBothMenuItem = copyMenuItem.parentNode.insertBefore($C("menuitem", {
		id: "copyBookmark_copyBoth",
		label: "複製標題和網址",
		selection: "any",
		closemenu: "single",
		accesskey: "u"
	}), copyMenuItem.nextSibling);
		copyBothMenuItem.addEventListener("command", function () {copyBookmark_copy("both");});

	function QI_node(aNode, aIID) {
		var result = null;
		try {
			result = aNode.QueryInterface(aIID);
		}
		catch (e) { }
		return result;
	}
	function asContainer(aNode) {
		return QI_node(aNode, Ci.nsINavHistoryContainerResultNode);
	}
	function asQuery(aNode) {
		return QI_node(aNode, Ci.nsINavHistoryQueryResultNode);
	}
	function $(id) document.getElementById(id);
	function $C(name, attr) {
		var el = document.createElement(name);
		if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
		return el;
	}
})();

location == "chrome://browser/content/browser.xul" && (function () {
    var contextMenu = document.getElementById("contentAreaContextMenu");
    (function (menuitem) {
        menuitem.id = "context-copygif";
        menuitem.setAttribute("label", "複製GIF");
        menuitem.addEventListener("command", function () {
var selection = content.getSelection();
var ranges = [];
for (var i = 0; i < selection.rangeCount; i++)
ranges.push(selection.getRangeAt(i));
 
var range = document.createRange();
range.selectNode(document.popupNode);
selection.removeAllRanges();
selection.addRange(range);
goDoCommand("cmd_copy");
selection.removeAllRanges();
 
for (i in ranges)
selection.addRange(ranges);
}, false);
    })(contextMenu.insertBefore(document.createElement("menuitem"), document.getElementById("context-copyimage")));
    contextMenu.addEventListener("popupshowing", function () {
        gContextMenu.showItem("context-copygif", gContextMenu.onImage);
    }, false);
})()
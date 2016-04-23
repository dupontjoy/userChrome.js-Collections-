// ==UserScript==
// @name          Check Range
// @namespace     http://squarefree.com/userscripts
// @description   Lets you check or uncheck a range of checkboxes by clicking the first checkbox and then Shift+clicking the last checkbox.
// @include       *
// @version       1.0.1
// @exclude       http://gmail.google.com/*
// @exclude       https://gmail.google.com/*
// ==/UserScript==

/*

  Author: Jesse Ruderman - http://www.squarefree.com/
  Suggested on http://69.90.152.144/collab/GreaseMonkeyUserScriptRequest at 2005-04-06 17:00:13 anonymously.
  
  Features:
   * Works with both mouse (shift+click) and keyboard (shift+space).
   * Use to select or deselect.
   * Use forwards or backwards.
  
  Tested with:
   * Hotmail, Yahoo! Mail, Google Personalized profile creation.
   * HTML loose, HTML strict, XHTML (with the XHTML mime type).
  
*/


(function(){
    // Toggle radio buttons by shift-clicking on the selected one
    document.addEventListener("click", function (event) {
        if (event.target.checked &&
            (event.shiftKey || event.button == 1) &&
            event.target.matches("input[type=radio]"))
        {
            event.target.checked = false;
        }
    });

    /*
     * Check Range - Toggle checkboxes with Shift+click
     *
     * BASED ON "Check Range"
     * From http://squarefree.com/userscripts
     * By Jesse Ruderman - http://www.squarefree.com/
     */
var currentCheckbox = null;

function NSResolver(prefix) 
{
  if (prefix == 'html') {
    return 'http://www.w3.org/1999/xhtml';
  }
  else {
    //this shouldn't ever happen
    return null;
  }
}

function selectCheckboxRange(start, end)
{
  var xpath, i, checkbox, last;

  if (document.documentElement.namespaceURI) // XML
    xpath = "//html:input[@type='checkbox']";
  else // HTML
    xpath = "//input[@type='checkbox']";
    
  var checkboxes = document.evaluate(xpath, document, NSResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  for (i = 0; (checkbox = checkboxes.snapshotItem(i)); ++i) {
    if (checkbox == end) {
      last = start;
      break;
    }
    if (checkbox == start) {
      last = end;
      break;
    }
  }

  for (; (checkbox = checkboxes.snapshotItem(i)); ++i) {
    if (checkbox != start && checkbox != end && checkbox.checked != start.checked) {
      // Instead of modifying the checkbox's value directly, fire an onclick event.
      // This makes scripts that are part of Yahoo! Mail and Google Personalized pick up the change.
      // Doing it this way also triggers an onchange event, which is nice.
      var evt2 = document.createEvent("MouseEvents");
      evt2.initEvent("click", true, false);
      checkbox.dispatchEvent(evt2);
    }

    if (checkbox == last) {
      break;
    }
  }
}

function handleChange(event)
{
  var t = event.target;

  if (isCheckbox(t) && (event.button == 0 || event.keyCode == 32)) {
    if (event.shiftKey && currentCheckbox) {
      selectCheckboxRange(currentCheckbox, t);
    }

    currentCheckbox = t;
  }
}

function isCheckbox(elt)
{
  // tagName requires toUpperCase because of HTML vs XHTML
  return (elt.tagName.toUpperCase() == "INPUT" && elt.type == "checkbox");
}

// onchange always has event.shiftKey==true, so to tell whether
// shift was held, we have to use onkeyup and onclick instead.
document.documentElement.addEventListener("keyup", handleChange, true);
document.documentElement.addEventListener("click", handleChange, true);

})();

// ==UserScript==
// @name         check-range
// @version      1.1.1
// @namespace    http://kafene.org
// @description  Toggle checkboxes with Shift+click. Bonus: toggle radio buttons too!
// @include      *
// @run-at       document-start
// @grant        none
// @license      MIT <https://raw.githubusercontent.com/kafene/userscripts/mater/LICENSE>
// @require      https://raw.githubusercontent.com/ded/domready/master/src/ready.js
// @downloadURL  https://raw.githubusercontent.com/kafene/userscripts/master/check-range.user.js
// @updateURL    https://raw.githubusercontent.com/kafene/userscripts/master/check-range.user.js
// ==/UserScript==

domready(function () {
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

    function selectCheckboxRange(start, end) {
        var checkboxes = document.querySelectorAll("input[type=checkbox]");
        var i = 0, len = checkboxes.length, last, checkbox;
        for (; i < len; ++i) {
            if (checkboxes[i] == end) { last = start; break; }
            if (checkboxes[i] == start) { last = end; break; }
        }
        for (; i < len; ++i) {
            checkbox = checkboxes[i];
            if (checkbox != start && checkbox != end && checkbox.checked != start.checked) {
                // Instead of modifying the checkbox's value directly, fire an onclick event.
                // This makes scripts that are part of Yahoo! Mail and Google Personalized pick up the change.
                // Doing it this way also triggers an onchange event, which is nice.
                var mouseEvent = document.createEvent("MouseEvents");
                mouseEvent.initEvent("click", true, false);
                checkbox.dispatchEvent(mouseEvent);
            }
            if (checkbox === last) { break; }
        }
    }

    function handleChange(event) {
        var target = event.target;
        var isCheckbox = target.matches("input[type=checkbox]");
        if (isCheckbox && (event.button == 0 || event.keyCode == 32)) {
            if (event.shiftKey && currentCheckbox) {
                selectCheckboxRange(currentCheckbox, target);
            }
            currentCheckbox = target;
        }
    }

    // onchange always has event.shiftKey==true, so to tell whether
    // shift was held, we have to use onkeyup and onclick instead.
    document.documentElement.addEventListener("keyup", handleChange, true);
    document.documentElement.addEventListener("click", handleChange, true);
});

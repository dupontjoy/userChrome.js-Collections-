// ==UserScript==
// @name        Panda in Milliseconds Mod
// @author      Miku
// @namespace   https://greasyfork.org/users/2251
// @license     GNU GPL
// @description Panda (refresh) a page in milliseconds instead of seconds. Mod: 修改了按键和时间
// @include     http://ic.sjlpj.cn/*UpShelf/OperationManageList
// @version     2015.06.08-2016.11.08
// @grant       none
// ==/UserScript==

/**
 * The purpose of this script is because most scripts capped out the panda interval at one second.
 * By temporarily disabling Page Monitor--Mturk will allow us to refresh a page faster than one second.
 * In theory millisecond refreshing should capture more HITs than that of "seconds" scripts.
 */

/**
 * Change refreshInterval's value to change the panda speed.
 *
 * Note: the value needs to be defined in milliseconds.
 */
var refreshInterval = 10*60*1000; //milliseconds

/**
 * Capture the current page
 */
var currentPage = window.location.href;

/**
 * The refresh function
 */
var refresh = function() {
    window.location.reload(false);
};

/**
 * Start listening for key presses
 */
window.addEventListener('keydown', KeyCodes, true);

/**
 * Check the status of the panda for changes in key presses
 */
checkRefresh();

/**
 * Define what the key press does after being pressed
 *
 * Key F1 was pressed and starts the panda
 * Key F2 was held down or pressed which stops the panda
 */
function KeyCodes(e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 112: // F1 was pressed
            savePage();
            break;
        case 113: // F2
            deletePage();
            break;
    }

    /**
     * After a key is pressed, check if the panda should start or stop
     */
    checkRefresh();
}

/**
 * Function to save the panda status
 */
function savePage() {
    if (localStorage.getItem("reload") === null) { //check if the reload status exists
        localStorage.setItem('reload', currentPage);
    } else { //if the status does exist, delete it and save anew
        deletePage();
        localStorage.setItem('reload', currentPage);
    }
}

/**
 * Function to purge the panda status
 */
function deletePage() {
    localStorage.removeItem('reload');
}

/**
 * Main function which reads the panda status
 */
function checkRefresh() {
    reload = localStorage.getItem('reload');
    if (reload == currentPage) {
        console.log('Reloading page...');
        setTimeout(refresh, refreshInterval); //comment this out to use the other function
        //setTimeout(window.location.reload(false), refreshInterval); //this method seems broken and doesn't follow refreshInterval's value. Use this method for maximum panda speed
    }
}
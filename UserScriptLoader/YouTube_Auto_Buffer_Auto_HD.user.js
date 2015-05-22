// ==UserScript==
// @name          YouTube Auto Buffer & Auto HD
// @namespace     http://userscripts.org/users/23652
// @description   Buffers the video without autoplaying and puts it in HD if the option is on. For Firefox, Opera, & Chrome
// @icon          https://raw.github.com/joesimmons/YouTube---Auto-Buffer---Auto-HD/master/media/logo-64x64.png
// @include       http://*.youtube.com/*
// @include       http://youtube.com/*
// @include       https://*.youtube.com/*
// @include       https://youtube.com/*
// @copyright     JoeSimmons
// @author        JoeSimmons
// @version       1.2.87
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @require       https://greasyfork.org/scripts/1885-joesimmons-library/code/JoeSimmons'%20Library.js?version=4838
// @require       https://greasyfork.org/scripts/2104-youtube-button-container-require/code/YouTube%20-%20Button%20Container%20(@require).js?version=5493
// @require       https://greasyfork.org/scripts/1884-gm-config/code/GM_config.js?version=4836
// @grant         GM_info
// @grant         GM_getValue
// @grant         GM_log
// @grant         GM_openInTab
// @grant         GM_registerMenuCommand
// @grant         GM_setValue
// @grant         GM_xmlhttpRequest
// ==/UserScript==

/* CHANGELOG

1.2.87 (1/22/2014)
    - fixed odd internal error that made the player not show
    - fixed problem with "Red Bar" not being disabled properly

1.2.86 (12/21/2013)
    - fixed Large player button (as far as I can tell)
    - added Automatic quality option (the YouTube default)
    - switched the DASH option default to enabled
        this is really what the script was made for... auto-buffering

1.2.85 (12/11/2013)
    - added a script icon
    - added a "Player Color Scheme" option
    - fixed bug with SPF not being de-activated properly in non-Firefox browsers
    - fixed volume bug
    - fixed adding time in url bug. it will now skip to the right portion of the video
    - changed internal name of the "Activation Mode" option. shouldn't affect the user
    - the script doesn't add any javascript to the page anymore
        it uses onYouTubePlayerReady to detect when the player is ready;
            it's much more performant than an interval

1.2.84 (10/31/2013)
    - added primitive type checking when copying ytplayer.config.args into the flashvars.
        this fixes the issue with Flashgot and possibly other add-ons
    - fixed non-activation by moving the _spf_state check to the top of init.
        this disables SPF on every YouTube page now, and should make the script activate correctly
    - changed all RegExp test methods to match. match seems more consistent.
        I've had cases where test doesn't work, but match does

1.2.83 (10/28/2013)
    - added auto HD, volume, and more activation modes for html5 (thanks to youtube updating its API)
    - changed the default quality to 1080p
    - changed the wording of some options
    - changed the "Disable Dash Playback" option to false for default
    - disabled SPF (aka Red Bar feature) completely until I get playlists working better
    - changed the setPref prototype function to a regular function

1.2.82 (9/5/2013)
    - added support for older Firefox versions (tested on 3.6)
    - added a new option to disable 'dash' playback (videos loading in blocks/pieces)
    - re-added ad removal feature (experimental for now)

1.2.81
    - fixed HTML5 support. YT changed tag names so the script got confused
    - made a few minor performance tweaks
    - fixed 'play symbol in title' bug in autobuffer mode (it would show playing, even though it's paused/buffering)

1.2.80
    - switched to JSL.setInterval for consistency and drift accommodation
    - visual tweaks to:
        msg().
            the rest of the page now dims while the msg box is visible
            changed the spacing of most of the elements
            changed the font sizes and the font (Arial)
            added a close button instead of requiring a double click
            made it auto-open the options screen when the msg is closed
        GM_config.
            made the background color more mellow and moved the section title near the middle

1.2.79
    - adjusted to the new play symbol in the youtube title feature
    - Changed margins on the settings button when in footer
    - Switched JSL/pushState checking order.
        Previously in 1.2.78, if JSL didn't exist or wasn't @required, the script
        would still loop every 500ms to re-set the pushState method, even though the
        script wasn't going to be running.
        I switched that so that JSL has to exist before the script does anything.

1.2.78
    - Fixed bug where options button wasn't getting added to the footer with the new Red Bar YT feature

1.2.77
    - Adapted to the new YouTube feature that uses HTML5's history.pushState to load videos
    - Small fixes here and there
    - Excluded (with RegExp) pages without videos on them
    - Fixed GM_config.log()
    - Declared all variables at the beginning of functions
    - Made finding the video player a little more reliable
    - Make 'autoplay on playlists' work with HTML5 videos

1.2.76
    - Added new quality option ('1080p+' - for anything higher than 1080p)

1.2.75
    - Added a new option (to move option button to page footer)
    - Added a new option (to autoplay on playlists regardless of auto[play/buffer] setting)
    - Added a first time user message box
    - Fixed bug with GM_config's [set/get]Value functions. Chrome/Opera were not using localStorage before this update

1.2.74
    - Adapted to YouTube's new layout

1.2.73
    - Added compatibility for user pages

1.2.72
    - Made it fully working again in Opera & Chrome
    - Switched from setInterval to setTimeout due to instability
    - Added an anonymous function wrapper

1.2.71
    - Added compatibility for HTML5

*/




// run the script in an IIFE, to hide its variables from the global scope
(function (undefined) {

    'use strict';

    var aBlank = ['', '', ''],
        URL = location.href,
        navID = 'watch7-user-header',
        rYoutubeUrl = /^https?:\/\/([^\.]+\.)?youtube\.com\//,
        // rYoutubeBlacklistedUrl = /^https?:\/\/([^\.]+\.)?youtube\.com\/(feed\/(?!subscriptions)|account|inbox|my_|tags|view_all|analytics)/i,
        rList = /[?&]list=/i,
        rPlaySymbol = /^\u25B6\s*/,
        script_name = 'YouTube - Auto-Buffer & Auto-HD',
        tTime = (URL.match(/[&#?]t=([sm0-9]+)/) || aBlank)[1],
        ads = [
            'supported_without_ads',
            'ad3_module',
            'adsense_video_doc_id',
            'allowed_ads',
            'baseUrl',
            'cafe_experiment_id',
            'afv_inslate_ad_tag',
            'advideo',
            'ad_device',
            'ad_channel_code_instream',
            'ad_channel_code_overlay',
            'ad_eurl',
            'ad_flags',
            'ad_host',
            'ad_host_tier',
            'ad_logging_flag',
            'ad_preroll',
            'ad_slots',
            'ad_tag',
            'ad_video_pub_id',
            'aftv',
            'afv',
            'afv_ad_tag',
            'afv_instream_max',
            'afv_ad_tag_restricted_to_instream',
            'afv_video_min_cpm',
            'prefetch_ad_live_stream'
        ],
        hasMainBeenRun, missing_require, nav, uw, wait_intv;

    function toNum(a) {
        return parseInt(a, 10);
    }

    // msg by JoeSimmons
    function msg(infoObject) {

        var box_id_name = 'script_msg',
            box = document.getElementById(box_id_name),
            rLinebreaks = /[\r\n]/g,
            title = typeof infoObject.title === 'string' && infoObject.title.length > 3 ? infoObject.title : 'Message Box by JoeSimmons.';

        // add BR tags to line breaks
        infoObject.text = infoObject.text.replace(rLinebreaks, '<br />\n');

        function msg_close(event) {
            event.preventDefault();

            document.getElementById(box_id_name).style.display = 'none';

            if (typeof infoObject.onclose === 'function') {
                infoObject.onclose();
            }
        }

        if (box == null) {
            JSL.addStyle('' +
                '@keyframes blink { ' +
                    '50% { color: #B95C00; } ' +
                '}\n\n' +
                '#' + box_id_name + ' .msg-header { ' +
                    'animation: blink 1s linear infinite normal; ' +
                '}' +
            '');
            document.body.appendChild(
                JSL.create('div', {id : box_id_name, style : 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999999; background-color: rgba(0, 0, 0, 0.6);'}, [
                    // main box
                    JSL.create('div', {id : box_id_name + '_box', style : 'position: absolute; top: 25%; left: 25%; width: 50%; height: 50%; padding-top: 50px; background-color: #E9E9E9; border: 3px double #006195;'}, [
                        // header
                        JSL.create('div', {style : 'margin: 0 auto; padding-bottom: 40px; color: #F07800; font-size: 21pt; font-family: Arial, Verdana, "Myriad Pro"; font-weight: normal; text-shadow: 2px 2px 4px #C7C7C7; text-align: center;', 'class' : 'msg-header', textContent : title}),

                        // text (message)
                        JSL.create('div', {innerHTML : infoObject.text, style : 'text-align: center; margin: 0 auto; padding-top: 39px; border-top: 1px solid #B0B0B0; color: #000000; font-size: 11pt; font-family: Arial, Verdana, "Myriad Pro"; font-weight: normal; text-shadow: 0 0 8px #AEAEAE;'}),

                        // close button
                        JSL.create('div', {style : 'position: absolute; bottom: 20px; left: 0; width: 100%; text-align: center;'}, [
                            JSL.create('input', {id : box_id_name + '_close', type : 'button', value : 'Close Message', onclick : msg_close, style : 'margin: 0 auto; padding: 2px 20px; font-size: 11pt; font-family: Arial, Verdana, "Myriad Pro"; font-weight: normal;'})
                        ])
                    ])
                ])
            );
        } else {
            box.innerHTML += infoObject.text;
        }
        
    }

    // will return true if the value is a primitive value
    function isPrimitiveType(value) {
        switch (typeof value) {
            case 'string': case 'number': case 'boolean': case 'undefined': {
                return true;
            }
            case 'object': {
                return !value;
            }
        }

        return false;
    }

    function setPref(str, values) {
        var i, value, rQuery;

        for (i = 0; value = values[i]; i += 1) {
            // (several lines for readability)
            rQuery = new RegExp('[?&]?' + value[0] + '=[^&]*');
            str = str.replace(rQuery, '') + '&' + value[0] + '=' + value[1];
            str = str.replace(/^&+|&+$/g, '');
        }

        return str;
    }

    // unwraps the element so we can use its methods freely
    function unwrap(elem) {
        if (elem) {
            if ( typeof XPCNativeWrapper === 'function' && typeof XPCNativeWrapper.unwrap === 'function' ) {
                return XPCNativeWrapper.unwrap(elem);
            } else if (elem.wrappedJSObject) {
                return elem.wrappedJSObject;
            }
        }

        return elem;
    }

    function fixPlaySymbol() {
        document.title = document.title.replace(rPlaySymbol, '');
    }

    // grabs the un-wrapped player
    function getPlayer() {
        var doc = uw.document;
        return doc.getElementById('c4-player') || doc.getElementById('movie_player');
    }

    // adds the Options button below the video
    function addButton() {
        var footer = GM_config.get('footer') === true,
            footerHolder = document.getElementById('footer-main');

        addButtonToContainer('Auto-Buffer Options', function () { GM_config.open(); }, 'autobuffer-options');

        if (footer && footerHolder) {
            footerHolder.appendChild( document.getElementById('autobuffer-options') );
        }
    }

     // this function sets up the script
    function init() {
        hasMainBeenRun = false;

        // get the raw window object of the YouTube page
        uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : unwrap(window);

        // disable Red Bar aka SPF
        if (uw._spf_state && uw._spf_state.config) {
            uw._spf_state.config['navigate-limit'] = 0;
            uw._spf_state.config['navigate-part-received-callback'] = function (targetUrl) {
                location.href = targetUrl;
            };
        }

        uw.onYouTubePlayerReady = function onYouTubePlayerReady(player) {
            if (typeof player === 'object' && hasMainBeenRun === false) {
                window.postMessage('YTAB__ready', '*');
            }
        };

        JSL.waitFor({
            selector : '#c4-player, #movie_player',
            verifier : function (elem) {
                elem = unwrap( elem[0] );
                return typeof elem.stopVideo === 'function';
            },
            done : function () {
                if (hasMainBeenRun === false) {
                    main();
                }
            }
        });
    }

    // this is the main function. it does all the autobuffering, quality/volume changing, annotation hiding, etc
    function main() {
        var player = getPlayer(),
            parent = player.parentNode,
            alreadyBuffered = false,
            time = 0,
            args, arg, buffer_intv, fv, isHTML5, playerClone,
            playIfPlaylist, val, userOpts;

        // don't let main() run again unless a new video is loaded
        hasMainBeenRun = true;

        // remove the player out of the document temporarily while other things are being done,
        // to reduce the time the player may be playing the video
        parent.removeChild(player);

        // set up the user options object
        userOpts = {
            activationMode    : GM_config.get('activationMode'),
            disableDash       : GM_config.get('disableDash') === true,
            hideAnnotations   : GM_config.get('hideAnnotations') === true,
            hideAds           : GM_config.get('hideAds') === true,
            quality           : GM_config.get('autoHD'),
            theme             : GM_config.get('theme'),
            volume            : GM_config.get('volume')
        };

        // set up other variables
        playerClone = player.cloneNode(true);
        fv = player.getAttribute('flashvars');
        isHTML5 = !!document.querySelector('video.html5-main-video');
        playIfPlaylist = !!URL.match(rList) && GM_config.get('autoplayplaylists') === true;

        if (uw.ytplayer && uw.ytplayer.config && uw.ytplayer.config.args) {
            args = uw.ytplayer.config.args;
        }

        // set the volume to the user's preference
        if (userOpts.volume != 1000) {
            player.setVolume(userOpts.volume);
        }

        if (isHTML5) {
            if (player.getPlaybackQuality() !== userOpts.quality) {
                player.setPlaybackQuality(userOpts.quality);
            }

            if (!playIfPlaylist) {
                if (userOpts.activationMode === 'buffer') {
                    player.pauseVideo();
                } else if (userOpts.activationMode === 'none') {
                    player.stopVideo();
                }
            }
        } else {
            // copy 'ytplayer.config.args' into the flash vars
            if (args) {
                for (arg in args) {
                    val = args[arg];
                    if ( args.hasOwnProperty(arg) && isPrimitiveType(val) ) {
                        fv = setPref(fv, [ [ arg, encodeURIComponent(val) ] ]);
                    }
                }
            }

            // ad removal
            if (userOpts.hideAds) {
                fv = fv.replace(new RegExp('(&amp;|[&?])?(' + ads.join('|') + ')=[^&]*', 'g'), '');
                /*
                fv = setPref(fv, 
                    ads.map(function (ad) {
                        return [ad, ''];
                    })
                );
                */
            }

            // disable DASH playback
            if (userOpts.disableDash) {
                fv = setPref(fv, [
                    ['dashmpd', ''],
                    ['dash', '0']
                ]);
            }

            // edit the flashvars
            fv = setPref(fv, [
                ['vq', userOpts.quality],                                                           // set the quality
                ['autoplay', (userOpts.activationMode !== 'none' || playIfPlaylist) ? '1' : '0' ],  // enable/disable autoplay
                ['iv_load_policy', userOpts.hideAnnotations ? '3' : '1' ],                          // enable/disable annotations
                ['theme', userOpts.theme],                                                          // use light/dark theme

                // some "just-in-case" settings
                ['enablejsapi',           '1'],                                                     // enable JS API
                ['jsapicallback',         'onYouTubePlayerReady'],                                  // enable JS ready callback
                ['fs',                    '1'],                                                     // enable fullscreen button, just in-case
                ['modestbranding',        '1'],                                                     // hide YouTube logo in player
                ['disablekb',             '0']                                                      // enable keyboard controls in player
            ]);

            // handle video starting time
            if ( tTime.match(/\d+m/) ) {
                time += toNum( tTime.match(/(\d+)m/)[1] ) * 60;
            }
            if ( tTime.match(/\d+s/) ) {
                time += toNum( tTime.match(/(\d+)s/)[1] );
            }
            if ( tTime.match(/^\d+$/) ) {
                time += toNum(tTime);
            }
            if (time <= 3) {
                // if no time is in the url, check the player's time
                try {
                    // sometimes causes a weird error.
                    // it will say getCurrentTime isn't a function,
                    // even though the typeof is "function",
                    // and alerting its value says [native code]
                    time = player.getCurrentTime();
                } catch (e) {}
                if (time <= 3) {
                    time = 0;
                }
            }
            fv = setPref( fv, [ ['start', time] ] );

            // set the new player's flashvars
            playerClone.setAttribute('flashvars', fv);

            // replace the original player with the modified clone
            parent.appendChild(playerClone);

            if (userOpts.activationMode === 'buffer' && playIfPlaylist === false) {
                // handle auto-buffering
                buffer_intv = JSL.setInterval(function () {
                    var player = getPlayer();

                    if (player && typeof player.getPlayerState === 'function') {
                        JSL.clearInterval(buffer_intv);

                        // pause the video so it can buffer
                        player.pauseVideo();

                        // seek back to beginning if time elapsed is not much
                        if (player.getCurrentTime() <= 3) {
                            player.seekTo(0);
                        }

                        // adjust to the 'play symbol in title' feature
                        window.setTimeout(fixPlaySymbol, 1000);
                    }
                }, 100);
            } else if (userOpts.activationMode === 'none') {
                // adjust to the 'play symbol in title' feature
                window.setTimeout(fixPlaySymbol, 1500);
            }
        }

        // show the first time user message, then set it to never show again
        if (GM_config.getValue('yt-autobuffer-autohd-first', 'yes') === 'yes') {
            msg({
                text : 'Welcome to "' + script_name + '".\n\n\n\n' +
                    'There is an options button below the video.\n\n\n\n' +
                    'The options screen will automatically open when you close this message.',
                title : '"' + script_name + '" Message',
                onclose : function () { GM_config.open(); }
            });
            GM_config.setValue('yt-autobuffer-autohd-first', 'no');
        }
    }

    // make sure the page is not in a frame
    // & is on a YouTube page (the @include works most of the time, but this is 100%)
    // & isn't on a blacklisted YouTube page
    if ( window !== window.top || !URL.match(rYoutubeUrl) /*|| URL.match(rYoutubeBlacklistedUrl)*/ ) { return; }

    // quit if one of the @requires is non-existent
    if (typeof JSL === 'undefined' || typeof GM_config === 'undefined' || typeof addButtonToContainer === 'undefined') {
        missing_require = typeof JSL === 'undefined' ? 'JSL' : typeof GM_config === 'undefined' ? 'GM_config' : typeof addButtonToContainer ? 'Button Container' : 'unknown';

        return alert('' +
            'A @require is missing (' + missing_require + ').\n\n' +
            'Either you\'re not using the correct plug-in, or @require isn\'t working.\n\n' +
            'Please review the script\'s main page to see which browser & add-on to use.' +
        '');
    }

    // add a user-script command
    if (typeof GM_registerMenuCommand === 'function') {
        GM_registerMenuCommand('"' + script_name + '" Options', GM_config.open);
    }

    // init GM_config
    GM_config.init('"' + script_name + '" Options', {
        activationMode : {
            section : ['Main Options'],
            label : 'Activation Mode',
            type : 'select',
            options : {
                'buffer' : 'Auto Buffer (aka Auto Pause)',
                'play' : 'Auto Play',
                'none' : 'Stop Loading Immediately'
            },
            'default' : 'buffer'
        },
        autoHD : {
            label : 'Auto HD',
            type : 'select',
            options : {
                'default' : 'Automatic (default)',
                'tiny' : '144p',
                'small' : '240p',
                'medium' : '360p',
                'large' : '480p',
                'hd720' : '720p (HD)',
                'hd1080' : '1080p (HD)',
                'hd1440' : '1440p (HD)',
                'highres' : 'Original (highest)'
            },
            'default' : 'hd1080'
        },
        disableDash : {
            label : 'Disable DASH Playback',
            type : 'checkbox',
            'default' : true,
            title : '"DASH" loads the video in blocks/pieces; disrupts autobuffering -- Note: Qualities are limited when disabled'
        },
        hideAds : {
            label : 'Disable Ads',
            type : 'checkbox',
            'default' : true,
            title : 'Should disable advertisements. AdBlock is better, though. Get that instead'
        },
        hideAnnotations : {
            label : 'Disable Annotations',
            type : 'checkbox',
            'default' : false
        },
        theme : {
            section : ['Other Options'],
            label : 'Player Color Scheme',
            type : 'select',
            options : {
                'dark' : 'Dark Theme',
                'light' : 'Light Theme'
            },
            'default' : 'dark'
        },
        volume : {
            label : 'Set volume to: ',
            type : 'select',
            options : {
                '1000' : 'Don\'t Change',
                '0' : 'Off',
                '5' : '5%',
                '10' : '10%',
                '20' : '20%',
                '25' : '25% (quarter)',
                '30' : '30%',
                '40' : '40%',
                '50' : '50% (half)',
                '60' : '60%',
                '70' : '70%',
                '75' : '75% (three quarters',
                '80' : '80%',
                '90' : '90%',
                '100' : '100% (full)',
            },
            title : 'What to set the volume to',
            'default' : '1000'
        },
        autoplayplaylists : {
            label : 'Autoplay on Playlists (override)',
            type : 'checkbox',
            'default' : false,
            title : 'This will enable autoplay on playlists, regardless of the "Activation Mode" option'
        },
        footer : {
            label : 'Options Button In Footer',
            type : 'checkbox',
            'default' : false,
            title : 'This will make the options button show at the bottom of the page in the footer'
        }
    }, '' +
    'body { ' +
        'background-color: #DDDDDD !important; ' +
        'color: #434343 !important; ' +
        'font-family: Arial, Verdana, sans-serif !important; ' +
    '}' +
    '#config_header { ' +
        'font-size: 16pt !important; ' +
    '}' +
    '.config_var { ' +
        'margin-left: 20% !important; ' +
        'margin-top: 20px !important; ' +
    '}' +
    '#header { ' +
        'margin-bottom: 40px !important; ' +
        'margin-top: 20px !important; ' +
    '}' +
    '.indent40 { ' +
        'margin-left: 20% !important; ' +
    '}' + 
    '.config_var * { ' +
        'font-size: 10pt !important; ' +
    '}' +
    '.section_header_holder { ' +
        'border-bottom: 1px solid #BBBBBB !important; ' +
        'margin-top: 14px !important; ' +
    '}' +
    '.section_header { ' +
        'background-color: #BEDBFF !important; ' +
        'color: #434343 !important; ' +
        'margin-left: 20% !important; ' +
        'margin-top: 8px !important; ' +
        'padding: 2px 200px !important; ' +
        'text-decoration: none !important; ' +
    '}' +
    '.section_kids { ' +
        'margin-bottom: 14px !important; ' +
    '}' +
    '.saveclose_buttons { ' +
        'font-size: 14pt !important; ' +
    '}' +
    '#buttons_holder { ' +
        'padding-right: 50px; ' +
    '}' +
    '', {
        close : function () {
            JSL('#c4-player, #movie_player').css('visibility', 'visible');
            JSL('#lights_out').hide();
        },
        open : function () {
            JSL('#c4-player, #movie_player').css('visibility', 'hidden');
            JSL('#lights_out').show('block');
            JSL('#GM_config').css('height', '80%').css('width', '80%').css('zIndex', '999999999999');
        }
    });

    // this is for the "lights out" feature of GM_config
    JSL.runAt('interactive', function () {
        JSL(document.body).append('div', {
            id : 'lights_out',
            style : 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 999999999998; background: rgba(0, 0, 0, 0.72);'
        });

        // call the function that sets up everything
        init();
    });

    // add a message listener for when the unsafeWindow function fires a message
    window.addEventListener('message', function (msg) {
        if (msg.data === 'YTAB__ready') {
            main();
        }
    }, false);

    // wait for an element that can hold the options button to load,
    // then run our add button function
    JSL.waitFor({
        selector : '#watch7-headline, #gh-overviewtab div.c4-spotlight-module-component, #footer-main',
        done : addButton
    });

}());
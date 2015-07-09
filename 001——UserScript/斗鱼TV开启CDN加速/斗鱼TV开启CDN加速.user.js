// ==UserScript==
// @name       斗鱼TV开启CDN加速
// @description  斗鱼TV开启CDN加速，提升画质，减少卡顿
// @namespace  http://www.cdn.dou.yu.tv.com/
// @version    0.1.1
// @icon http://www.douyutv.com/favicon.ico
// @grant unsafeWindow
// @match      http://www.douyutv.com/*
// @copyright  cts
// @author  cts
// @run-at document-end
// ==/UserScript==

//  https://greasyfork.org/zh-CN/scripts/4952

!function() {
    
    if(!$ROOM){
        return !!0;
    }
    
    function douyu(){
        
        $.ajax({
            type: "GET",
            data: {
                "room_id": $ROOM.room_id
            },
            url: "/specific/ajax_info",
            success: function(msg) {
                replace_swf(msg);
            }
        });
        
        
        function replace_swf(msg) {
            eval(getjs(msg));
            attributes.cdn = 'true';
            delete flashvars.IsIndex;
            swfobject.embedSWF(
                "http://staticlive.douyutv.com/common/simplayer/WebRoom.swf?v5325",
                "WebRoom",
                room_args.live_url ? "0" : "100%",
                room_args.live_url ? "0" : "100%",
                swfVersionStr,
                '',
                flashvars,
                params,
                attributes
            );
            
        }
        
        function getjs(msg) {
            var js = msg.match(
                /<script type="text\/javascript">([\s\S]*?)swfobject\.embedSWF/
            )[1]
            return js.replace(/flashvars\.IsIndex = 'true';/gim, '');
        }
    }
    
    $('#WebRoom').ready(douyu);
    
}();
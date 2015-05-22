// ==UserScript==
// @name        XunLei Yunbo Better Player
// @namespace   qixinglu.com
// @description 改进迅雷云播的播放器页面
// @grant       none
// @include     http://vod.xunlei.com/iplay.html?*
// @include     http://vod.xunlei.com/nplay.html?*
// ==/UserScript==

var addStyle = function(cssText) {
    var head = document.querySelector('head');
    var style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.textContent = cssText;
    head.appendChild(style);
};

var changePlayerArea = function() {
    var wrapNode = document.querySelector('.wrap');
    wrapNode.style.width = 'auto';
    wrapNode.style.padding = '0 20px';
    var height = window.innerHeight - 100; // 100 像素大约是顶部标题的高度
    var width = Math.ceil(height * 16 / 9); // 按 16:9 比例算出对应的宽度
    var playerArea = document.querySelector('#XL_CLOUD_VOD_PLAYER');
    playerArea.style.width = width + 'px';
    playerArea.style.height =  height + 'px';
};

var changeDownloadArea = function() {
    var lixian = 'http://lixian.vip.xunlei.com/lixian_login.html?furl='
    var originalNode = document.querySelector('#original_url');
    originalNode.textContent = originalNode.title;
    var downLink = document.createElement('a');
    downLink.href = lixian + originalNode.title;
    downLink.textContent = '离线下载';
    downLink.target = '_blank';
    downLink.style.display = 'block';
    downLink.style.color = '#808080';
    downLink.style.padding = '6px';
    downLink.style.margin = '0 0 0 32px';
    var copyBtn = document.querySelector('#mycopyer');
    copyBtn.replaceChild(downLink, document.querySelector('#copyer'));
};

var isOldVersion = location.pathname == '/iplay.html';
if (isOldVersion) {
    addStyle('' +
        'body { width: auto !important; }' +
        '.src { height: 31px; max-width: 1000px;' +
        '       text-overflow: ellipsis; word-break: keep-all; }'
    );
    changePlayerArea();
    window.addEventListener('resize', changePlayerArea);
    setTimeout(changeDownloadArea, 2000);
} else {
    location.href = location.href.replace('/nplay.html', '/iplay.html');
}

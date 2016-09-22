(function() {
// ==UserScript==
// @name         Super_preloaderPlus_one
// @namespace    https://github.com/ywzhaiqi
// @description  預讀+翻頁..全加速你的瀏覽體驗...
// @author       ywzhaiqi && NLF(原作者)
// @version      6.5.0
// @homepageURL  https://greasyfork.org/scripts/293-super-preloaderplus-one

// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand

// @include      http*
// @exclude      http*://mail.google.com/*
// @exclude      http*://maps.google*
// @exclude      http*://www.google.com/reader*
// @exclude      http*://www.google.com/calendar*
// @exclude      https://docs.google.com/*
// @exclude      http*://app.yinxiang.com/*
// @exclude      http*://www.dropbox.com/*
// @exclude      http*://www.toodledo.com/*
// @exclude      http://cloud.feedly.com/*
// @exclude      http://weibo.com/*
// @exclude      http://w.qq.com/*
// @exclude      http://web2.qq.com/*
// @exclude      http://openapi.qzone.qq.com/*
// @exclude      http://*cloud.vip.xunlei.com/*
// @exclude      http*://www.wumii.com/*
// @exclude      http://pan.baidu.com/*
// @exclude      http://yun.baidu.com/*
// @exclude      http://www.cnbeta.com/*
// @exclude      http://www.youku.com/
// @exclude      http://v.youku.com/*
// @exclude      http://www.iqiyi.com/*
// @exclude      http://www.duokan.com/reader/*
// ==/UserScript==


// 主要用於 chrome 原生下檢查更新，也可用於手動檢查更新
var scriptInfo = {
    version: '6.5.0',
    updateTime: '2015/1/10',
    homepageURL: 'https://greasyfork.org/scripts/293-super-preloaderplus-one',
    downloadUrl: 'https://greasyfork.org/scripts/293-super-preloaderplus-one/code/Super_preloaderPlus_one.user.js',
    metaUrl: 'https://greasyfork.org/scripts/293-super-preloaderplus-one/code/Super_preloaderPlus_one.meta.js',
};


//----------------------------------
// rule.js

if (window.name === 'mynovelreader-iframe') {
    return;
}

// 如果是取出下一頁使用的iframe window
if (window.name === 'superpreloader-iframe') { // 搜狗,iframe裡面怎麼不加載js啊?
    // 去掉了原版的另一種方法，因為新版本 chrome 已經支持。舊版本 chrome iframe裡面 無法訪問window.parent,返回undefined

    var domloaded = function (){  // 滾動到底部,針對,某些使用滾動事件加載圖片的網站.
        window.scroll(window.scrollX, 99999);
        window.parent.postMessage('superpreloader-iframe:DOMLoaded', '*');
    };
    if(window.opera){
        document.addEventListener('DOMContentLoaded', domloaded, false);
    } else {
        domloaded();
    }

    return;
}


// GM 兼容

gmCompatible();

/////////////////////設置(請注意開關的縮進關系..子開關一般在父開關為true的時候才會生效.)//////////////////////
var prefs={
    floatWindow: true,       // 顯示懸浮窗
        FW_position: 1,         // 1:出現在左上角;2:出現在右上角;3：出現在右下角;4：出現在左下角;
        FW_offset: [10, 10],    // 偏離版邊的垂直和水平方向的數值..(單位:像素)
        FW_RAS: true,           // 點擊懸浮窗上的保存按鈕..立即刷新頁面;
    pauseA: true,            // 快速停止自動翻頁(當前模式為翻頁模式的時候生效.);
        Pbutton: [0, 2, 0],     // 需要按住的鍵.....0: 不按住任何鍵;1: shift鍵;2: ctrl鍵; 3: alt鍵;(同時按3個鍵.就填 1 2 3)(一個都不按.就填 0 0 0)
        mouseA: true,           // 按住鼠標左鍵..否則.雙擊;
            Atimeout: 200,      // 按住左鍵時..延時.多少生效..(單位:毫秒);
        stop_ipage: true,       // 如果在連續翻頁過程中暫停.重新啟用後.不在繼續..連續翻頁..

    Aplus: true,             // 自動翻頁模式的時候..提前預讀好一頁..就是翻完第1頁,立馬預讀第2頁,翻完第2頁,立馬預讀第3頁..(大幅加快翻頁快感-_-!!)(建議開啟)..
    sepP: true,              // 翻頁模式下.分隔符.在使用上滾一頁或下滾一頁的時候是否保持相對位置..
    sepT: true,              // 翻頁模式下.分隔符.在使用上滾一頁或下滾一頁的時候使用動畫過渡..
        s_method: 3,            // 動畫方式 0-10 一種11種動畫效果..自己試試吧
        s_ease: 2,              // 淡入淡出效果 0：淡入 1：淡出 2：淡入淡出
        s_FPS: 60,              // 幀速.(單位:幀/秒)
        s_duration: 333,        // 動畫持續時長.(單位:毫秒);
    someValue: '',           // 顯示在翻頁導航最右邊的一個小句子..-_-!!..Powered by Super_preloader 隱藏了
    DisableI: true,          // 只在頂層窗口加載JS..提升性能..如果開啟了這項,那麼DIExclude數組有效,裡面的網頁即使不在頂層窗口也會加載....
    arrowKeyPage: true,      // 允許使用 左右方向鍵 翻頁..
    sepStartN: 2,            // 翻頁導航上的,從幾開始計數.(貌似有人在意這個,所以弄個開關出來,反正簡單.-_-!!)

    // 新增或修改的
    forceTargetWindow: GM_getValue('forceTargetWindow', true),  // 下一頁的鏈接設置成在新標簽頁打開
    debug: GM_getValue('debug', false),
    enableHistory: GM_getValue('enableHistory', false),    // 把下一頁鏈接添加到歷史記錄
    autoGetPreLink: false,   // 一開始不自動查找上一頁鏈接，改為調用時再查找
    excludes: GM_getValue('excludes', ''),
    custom_siteinfo: GM_getValue('custom_siteinfo', '[]'),
    lazyImgSrc: 'zoomfile|file|original|load-src|_src|imgsrc|real_src|src2|data-lazyload-src|data-ks-lazyload|data-lazyload|data-src|data-original|data-thumb|data-imageurl|data-defer-src|data-placeholder',
};

// 黑名單,網站正則..
var blackList=[
    // 例子
    // 'http://*.douban.com/*',
];

blackList = blackList.concat(prefs.excludes.split(/[\n\r]+/).map(function(line) {
    return line.trim();
}));


//在以下網站上允許在非頂層窗口上加載JS..比如貓撲之類的框架集網頁.
var DIExclude = [
    ['貓撲帖子', true, /http:\/\/dzh\.mop\.com\/[a-z]{3,6}\/\d{8}\/.*\.shtml$/i],
    ['鐵血社區', true, /^http:\/\/bbs\.tiexue\.net\/.*\.html$/i],
    ['鐵血社區-2', true, /^http:\/\/bbs\.qichelian\.com\/bbsqcl\.php\?fid/i],
    // 像 http://so.baiduyun.me/ 內嵌的百度、Google 框架
    ['百度網盤搜索引擎-百度', true, /^https?:\/\/www\.baidu\.com\/baidu/i],
    ['百度網盤搜索引擎-Google', true, /^https?:\/\/74\.125\.128\.147\/custom/i],
];

// 頁面不刷新的站點
var HashchangeSites = [
    { url: /^https?:\/\/(www|encrypted)\.google(stable)?\..{2,9}\/(webhp|#|$|\?)/, timer: 2000, mutationSelector: '#main' },
    // 運營商可能會在 #wd= 前面添加 ?tn=07084049_pg
    { url: /^https?:\/\/www\.baidu\.com\/($|#wd=)/, timer: 1000, mutationSelector: '#wrapper_wrapper' },
    { url: /^https?:\/\/www\.newsmth\.net/, timer: 1000 },
];

//////////////////////////---------------規則-------////////////////
//翻頁所要的站點信息.
//高級規則的一些默認設置..如果你不知道是什麼..請務必不要修改(刪除)它.此修改會影響到所有高級規則...
var SITEINFO_D={
    enable: true,               // 啟用
    useiframe: GM_getValue('SITEINFO_D.useiframe') || false,           // (預讀)是否使用iframe..
    viewcontent: false,         // 查看預讀的內容,顯示在頁面的最下方.
    autopager: {
        enable: false,           // 啟用自動翻頁...
        force_enable: GM_getValue('SITEINFO_D.autopager.force_enable') || false,  //默認啟用強制拼接
        manualA: false,         // 手動翻頁.
        useiframe: false,       // (翻頁)是否使用iframe..
            iloaded: false,     // 是否在iframe完全load後操作..否則在DOM完成後操作
            itimeout: 0,        // 延時多少毫秒後,在操作..
            newIframe: false,
        remain: 1,              // 剩余頁面的高度..是顯示高度的 remain 倍開始翻頁..
        maxpage: 99,            // 最多翻多少頁..
        ipages: [false, 2],     // 立即翻頁,第一項是控制是否在js加載的時候立即翻第二項(必須小於maxpage)的頁數,比如[true,3].就是說JS加載後.立即翻3頁.
        separator: true,        // 顯示翻頁導航..(推薦顯示.)
            separatorReal: true,  // 顯示真實的頁數
    }
};

//高優先級規則,第一個是教程.
var SITEINFO=[
    {name: 'Google搜索',                                                                                                                               //站點名字...(可選)
        url: '^https?://(?:(?:www|encrypted)\\.google(?:stable)?\\..{2,9}|wen\\.lu)/(?:webhp|search|#q|$|\\?)',   // 站點正則...(~~必須~~)
        //url:'wildc;http://www.google.com.hk/search*',
        siteExample:'http://www.google.com',                                                                                                //站點實例...(可選)
        enable:true,                                                                                                                                            //啟用.(總開關)(可選)
        useiframe:false,                                                                                                                                        //是否用iframe預讀...(可選)
        viewcontent:false,

        nextLink: 'id("pnnext") | id("navbar navcnt nav")//td[span]/following-sibling::td[1]/a | id("nn")/parent::a',                                                                                                                           //查看預讀的內容,顯示在頁面的最下方.(可選)
        // nextLink:'auto;',
        //nextLink:'//table[@id="nav"]/descendant::a[last()][parent::td[@class="b"]]',              //下一頁鏈接 xpath 或者 CSS選擇器 或者 函數返回值(此函數必須使用第一個傳入的參數作為document對象) (~~必選~~)
        //nextLink:'css;table#nav>tbody>tr>td.b:last-child>a',
        //nextLink:function(D,W){return D.evaluate('//table[@id="nav"]/descendant::a[last()][parent::td[@class="b"]]',D,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;},
        // 新增 Array 的格式，依次查找

        // preLink:'auto;',
        preLink: '//a[@id="pnprev"]',
        //preLink:'//table[@id="nav"]/descendant::a[1][parent::td[@class="b"]]',            //上一頁鏈接 xpath 或者 CSS選擇器 或者 函數返回值 (可選)
        autopager:{
            enable:false ,                                                                                               //啟用(自動翻頁)(可選)
            useiframe:false,                                                                                        //是否使用iframe翻頁(可選)
                iloaded:false,                                                                                      //是否在iframe完全load之後操作..否則在DOM完成後操作.
                itimeout:0,                                                                                             //延時多少毫秒後,在操作..
                newIframe: false,  // 下一頁使用新的 iframe，能解決按鈕無法點擊的問題
            pageElement: '//div[@id="ires"]',                                          //主體內容 xpath 或 CSS選擇器 或函數返回值(~~必須~~)
            // pageElement:'css;div#ires',
            //pageElement:function(doc,win){return doc.getElementById('ires')},
            //filter:'//li[@class="g"]',                                                                        //(此項功能未完成)xpath 或 CSS選擇器從匹配到的節點裡面過濾掉符合的節點.
            remain: 1/3,                                                                                                 //剩余頁面的高度..是顯示高度的 remain 倍開始翻頁(可選)
                relatedObj: ['css;div#navcnt','bottom'],                                                         //以這個元素當做最底的元素,計算頁面總高度的計算.(可選)
            replaceE: '//div[@id="navcnt"]',                 //需要替換的部分 xpat h或 CSS選擇器 一般是頁面的本來的翻頁導航(可選);
            //replaceE:'css;div#navcnt',
            ipages: [false,3],                               //立即翻頁,第一項是控制是否在js加載的時候立即翻第二項(必須小於maxpage)的頁數,比如[true,3].就是說JS加載後.立即翻3頁.(可選)
            separator: true,                                 //是否顯示翻頁導航(可選)
                separatorReal: true,
            maxpage: 66,                                     //最多翻頁數量(可選)
            manualA: false,                                  //是否使用手動翻頁.
            HT_insert: ['//div[@id="res"]',2],               //插入方式此項為一個數組: [節點xpath或CSS選擇器,插入方式(1：插入到給定節點之前;2：附加到給定節點的裡面;)](可選);
            //HT_insert:['css;div#res',2],
            lazyImgSrc: 'imgsrc',
            // 新增的自定義樣式。下面這個是調整 Google 下一頁可能出現的圖片排列問題。
            stylish: 'hr.rgsep{display:none;}' +
                '.rg_meta{display:none}.bili{display:inline-block;margin:0 6px 6px 0;overflow:hidden;position:relative;vertical-align:top}._HG{margin-bottom:2px;margin-right:2px}',
            documentFilter: function(doc){
                // 修正下一頁的圖片
                var x = doc.evaluate('//script/text()[contains(self::text(), "data:image/")]', doc, null, 9, null).singleNodeValue;
                if (x) {
                    try {
                        new Function('document, window, google', x.nodeValue)(doc, unsafeWindow, unsafeWindow.google);
                    } catch (e) {}
                }

                // 修正可能出現的 小箭頭更多按鈕 排版不正確的情況（2014-7-29）
                var oClassName = window.document.querySelector('#ires .ab_button').className;
                [].forEach.call(doc.querySelectorAll('#ires .ab_button'), function(elem){
                    if (elem.className != oClassName)
                        elem.className = oClassName;
                });
            },
            filter: function() {  // 在添加內容到頁面後運行

            },
            startFilter: function(win, doc) {  // 只作用一次
                // 移除 Google 重定向
                var script = doc.createElement('script');
                script.type = 'text/javascript';
                script.textContent = '\
                    Object.defineProperty(window, "rwt", {\
                        configurable: false,\
                        enumerable: true,\
                        get: function () {\
                            return function() {};\
                        },\
                    });\
                ';
                doc.documentElement.appendChild(script);
                doc.documentElement.removeChild(script);

                // 移動相關搜索到第一頁
                var brs = doc.getElementById('brs'),
                    ins = doc.getElementById('ires');
                if (brs && ins) {
                    ins.appendChild(brs);
                }
            }
        }
    },
    // ========= 自己蛋疼的 ================
    {name: 'firefox用スクリプトアップローダー | uploader.jp',
        url: /https?:\/\/u6\.getuploader\.com\/script\//i,
        siteExample: 'http://u6.getuploader.com/script/',
        nextLink: 'css;li.next > a',
        autopager: {
            pageElement: 'css;div.container > div.table-responsive',
            useiframe: true,
            ipages: [true, 3], 
        },
    }, 
    {name: '射手网(伪)',
        url: /https?:\/\/secure\.assrt\.net\/sub\/\?searchword=/i,
        siteExample: 'https://secure.assrt.net/sub/?searchword=Finding',
        //nextLink: '//a[contains(text(),">")]',
        nextLink:{
            startAfter:'&page=',
            mFails:[/^https?:\/\/secure\.assrt\.net\/sub\/\?searchword\=.*/i,'&page=1'],
            inc:1,
        },
        autopager: {
            pageElement: 'css;.subitem',
            useiframe: true,
            HT_insert: ['css;.pagelinkcard', 1],
        },
    }, 
    {name: '射手网(伪)',
        url: /https?:\/\/secure\.assrt\.net\//i,
        siteExample: 'https://secure.assrt.net/sub/?searchword=Finding',
        nextLink: '//a[contains(text(),">")]',
        autopager: {
            pageElement: 'css;.subitem',
            useiframe: true,
            HT_insert: ['css;.pagelinkcard', 1],
        },
    }, 
    {name: 'R3sub',
        url: /https?:\/\/r3sub\.com\//i,
        siteExample: 'http://r3sub.com/search.php?s=Finding',
        nextLink: 'css;.pagination > li:last-child > a',
        autopager: {
            pageElement: 'css;div.movie',
        },
    }, 
    {name: 'TLF字幕组',
        url: /https?:\/\/sub\.eastgame\.org\//i,
        siteExample: 'http://sub.eastgame.org/',
        nextLink: 'css;.nextpostslink',
        autopager: {
            pageElement: 'css;div[id^="post-"]',
        },
    }, 
    {name: 'Sub HD',
        url: /https?:\/\/subhd\.com\/(subs|search)/i,
        siteExample: 'http://subhd.com/subs/',
        nextLink: '//a[contains(text(),">")]',
        autopager: {
            pageElement: 'css;div.box',
        },
    }, 
    {name: '字幕庫',
        url: /https?:\/\/www\.zimuku\.net/i,
        siteExample: 'http://www.zimuku.net/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.table',
        },
    }, 
    {name: '字幕帝',
        url: /https?:\/\/www\.zimud\.com/i,
        siteExample: 'http://www.zimud.com/latest',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#sub-list',
        },
    }, 
    {name: '＊MioBT＊',
        url: /https?:\/\/www\.miobt\.com/i,
        siteExample: 'http://www.miobt.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#listTable',
        },
    }, 
    {name: '松鼠症倉庫',
        url: /https?:\/\/(hdm2011\.com|comic\-mega\.me)\/dnew\.php/i,
        siteExample: 'http://hdm2011.com/dnew.php?category_id=1',
        siteExample: 'http://comic-mega.me/dnew.php',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#gallery',
            useiframe: true,
        },
    }, 
    {name: '精品福利-污图社',
        url: /https?:\/\/www\.wutushe\.com/i,
        siteExample: 'http://www.wutushe.com/sfuli',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.excerpt.excerpt-one',
        },
    }, 
    {name: 'ZONGMEI众美',
        url: /https?:\/\/zongmei\.red\//i,
        siteExample: 'http://zongmei.red/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div[id^="post-"]',
        },
    }, 
    {name: '大连生活网',
        url: /https?:\/\/www\.dlkoo\.com\/down\/(\d?\/)?$/,
        siteExample: 'http://www.dlkoo.com/down/2/index_2.htm',
        //nextLink: '//a[contains(text(),"下一页")]',
        nextLink:{
            startAfter:'index_',
            mFails:[/^http:\/\/www\.dlkoo\.com\/down\/.*/i,'index_1.htm'],
            inc:1,
        },
        autopager: {
            pageElement: 'css;#mymov',
        },
    }, 
    {name: 'Rarbg',
        url: /https?:\/\/rarbg\.to\//i,
        siteExample: 'https://rarbg.to/torrents.php',
        nextLink: 'css;a[title="next page"]',
        autopager: {
            pageElement: 'css;tr.lista2',
        },
    }, 
    {name: 'xvideos',
        url: /https?:\/\/www\.xvideos\.com\//i,
        siteExample: 'http://www.xvideos.com/?k=K-Pop+Sex+Scandal+Korean+Celebrities+Prostituting',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.mozaique',
            useiframe: true,
        },
    }, 
    {name: '普普成人',
        url: /https?:\/\/www\.pupuxx\.info\/(art|sex|swf|txt).*\/(index.*\.html)?$/,
        siteExample: 'http://www.pupuxx.info/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.list.clearfix,#img_resize,.poster.clearfix',
            useiframe: true,
        },
    }, 
    {name: '普普成人',
        url: /https?:\/\/www\.pupuxx\.info\/art.*\/.*\/$/,
        siteExample: 'http://www.pupuxx.info/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.con',
            useiframe: true,
        },
    }, 
    {name: '辣美女',
        url: /https?:\/\/www\.lameinv\.com\//i,
        siteExample: 'http://www.lameinv.com/a/4839.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.content',
        },
    }, 
    {name: 'BTScene Torrents列表',
        url: /https?:\/\/www\.btstorrent\.cc\/(results|cat\/)/i,
        siteExample: 'http://www.btstorrent.cc/indexfull/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;tr[id^="_"]',
        },
    }, 
    //{name: 'BTScene Torrents提取種子連結',
    //    url: /https?:\/\/www\.btstorrent\.cc\/.*\.html$/,
    //    siteExample: 'https://www\.btstorrent\.cc/rio-2-1080p-brrip-x264-yify-tf4112014.html',
    //    nextLink: 'css;a#dlt_',
    //    autopager: {
    //        pageElement: 'css;.main_left',
    //        ipages: [true, 1], 
    //        HT_insert: ['css;.main_left', 1],
    //        separator: false,
    //        stylish: 'div.main_left > .analytics_container,.t_title,.dlb,.cont_  > p{display:none;}.cont_ {width: 800px;height: auto;margin: 5px auto;padding: 0;text-align: center;font-family: Verdana, Arial, Helvetica, sans-serif;}.link_pr {width: 350px;display: inline-block;font-family: Arial, Helvetica, sans-serif;padding: 12px;border-radius: 50px;background-color: #191919;color: white;font-weight: bold;text-decoration: none;font-size: 13px;border: 4px solid #c1c1c1;}',
    //    },
    //}, 
    {name: 'MEIYINGSE美影-美影社_唯美寫真,私拍套圖,艷照視頻',
        url: /https?:\/\/meiyingse\.com\//i,
        siteExample: 'http://meiyingse.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div[id^="post"]',
        },
    }, 
    {name: '蓝影网',
        url: /https?:\/\/www\.lanyingwang\.com\//i,
        siteExample: 'http://www.lanyingwang.com/',
        nextLink: 'css;.next > a',
        autopager: {
            pageElement: 'css;#main',
        },
    }, 
    {name: '威锋论坛 帖子列表',
        url: /https?:\/\/bbs\.feng\.com\/read\-htm\-tid\-.+\.html/i,
        siteExample: 'http://bbs.feng.com/read-htm-tid-10525232.html',
        nextLink: 'css;.fast_next',
        autopager: {
            pageElement: 'css;#postlist',
        },
    }, 
    {name: '大眼仔旭',
        url: /http:\/\/www\.dayanzai\.me\//i,
        siteExample: 'http://www.dayanzai.me/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.list',
            useiframe: true,
        },
    }, 
    {name: '火狐范',
        url: /http:\/\/firefoxfan\.cc\//i,
        siteExample: 'http://firefoxfan.cc/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.single-post.clearfix',
            useiframe: true,
        },
    }, 
    {name: '海芋小站',
        url: /http:\/\/www\.inote\.tw\//i,
        siteExample: 'http://www.inote.tw/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;[id^="post"]',
        },
    }, 
    {name: '就是教不落',
        url: /http:\/\/steachs\.com\//i,
        siteExample: 'http://steachs.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#post,.ads_index,.post',
        },
    }, 
    {name: '虫二電氣診所',
        url: /http:\/\/blog\.yam\.com\/danfong/i,
        siteExample: 'http://blog.yam.com/danfong',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="blogmain"]',
            remain: 3,
        },
    }, 
    {name: '阿榮福利味',
        url: /http:\/\/www\.azofreeware\.com\//i,
        siteExample: 'http://www.azofreeware.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.blog-posts > .date-outer',
            //				useiframe:true,
        },
    }, 
    {name: '電腦玩物',
        url: /http:\/\/www\.playpcesor\.com\//i,
        siteExample: 'http://www.playpcesor.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.blog-posts > .date-outer',
            //				useiframe:true,
        },
    }, 
    {name: 'GDaily',
        url: /https:\/\/www\.gdaily\.org\//i,
        siteExample: 'https://www.gdaily.org/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.single-post',
            //pageElement: 'css;#content [id^="post"]',
            //useiframe:true,
        },
    }, 
    {name: 'blogspot.com',
        url: /http:\/\/?(?:(?:[^\.]))+\.blogspot\.?(?:(?:com)|(?:tw))+\//i,
        siteExample: 'http://playpcesor.blogspot.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.blog-posts > .date-outer',
            //				useiframe:true,
        },
    }, 
    {name: '重灌狂人',
        url: /https:\/\/briian\.com\//i,
        siteExample: 'http://briian.com/',
        nextLink: 'auto;',
        autopager: {
            //remain: 3,
            pageElement: 'css;#content [id^="post"]',
            HT_insert: ['css;.pagination', 1],
        },
    }, 
    {name: '㊣軟體玩家',
        url: /https?:\/\/pcrookie\.com\//i,
        siteExample: 'https://pcrookie.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.post',
            HT_insert: ['css;.navigation', 1],
        },
    }, 
    {name: '《硬是要學！》網路生活通',
        url: /https?:\/\/www\.soft4fun\.net\//i,
        siteExample: 'http://www.soft4fun.net/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div#content > section',
            HT_insert: ['css;.navigation', 1],
        },
    }, 
    /*
    {name: '軟體部落',
        url: /https?:\/\/softblog\.tw\//i,
        siteExample: 'http://softblog.tw/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#content [id^="post"]',
            HT_insert:['css;.wp-pagenavi',1],		
        },
    }, 
    */
    {name: '★Portableware~綠色軟體集散區☆',
        url: /http:\/\/tw\.myblog\.yahoo\.com\/jen9945x\//i,
        siteExample: 'http://tw.myblog.yahoo.com/jen9945x/archive?l=a',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div#yarticle.ycntmod',
        },
    }, 
    {name: '動漫花園資源網',
        url: /https?:\/\/(share\.dmhy\.org|dmhy\.dandanplay\.com)\//i,
        siteExample: 'http://share.dmhy.org/',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="table clear"]',
            useiframe: true,
        },
    }, 
    {name: 'POPGO',
        url: /http:\/\/share\.popgo\.org\//i,
        siteExample: 'http://share.popgo.org/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#index_maintable',
        },
    }, 
    {name: '爱恋动漫BT下载',
        url: /http:\/\/www\.kisssub\.org\//i,
        siteExample: 'http://www.kisssub.org/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#listTable',
            //HT_insert: ['css;.pages', 1],
            //useiframe: true,
        },
    },
    {name: '極影BT發佈索引',
        url: /http:\/\/bt\.ktxp\.com\//i,
        siteExample: 'http://bt.ktxp.com/sort-1-1.html',
        nextLink: 'auto;',
        pageElement: '//div[@class="item-box round-corner"]',
    }, 
    {name: 'Mobile01',
        url: /http:\/\/www\.mobile01\.com\/?(?:(?:forumtopic)|(?:topiclist))+/i,
        siteExample: 'http://www.mobile01.com/forumtopic.php?c=17&s=10',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="tablelist forumlist"]',
            useiframe: true,
        },
    }, 
    {name: 'Mobile01 帖子頁面',
        url: /http:\/\/www\.mobile01\.com\/topicdetail.php\?f=/i,
        siteExample: 'http://www.mobile01.com/topicdetail.php?f=296&t=2408059&m=f&last=31456743',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="forum-content"]',
            useiframe: true,
        },
    }, 
    {name: '小馬資訊網',
        url: /http:\/\/www\.pccppc\.com\//i,
        siteExample: 'http://www.pccppc.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div#mainlist',
            HT_insert: ['css;#pageli', 1],
        },
    }, 
    {name: '惡魔圖書館',
        url: /http:\/\/sos117\.com\//i,
        siteExample: 'http://sos117.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.post,.post-meta',
        },
    }, 
    {name: 'yande.re',
        url: /^https?:\/\/yande\.re\/post/i,
        siteExample: 'http://yande.re/post?page=2&tags=',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;ul#post-list-posts>li',
            useiframe: true,
            separator: false,
        },
    }, 
    {name: '黑亮BT',
        url: /http:\/\/bt\.hliang\.com\/index.php/i,
        siteExample: 'http://bt.hliang.com/index.php',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="box clear"]',
        },
    }, 
    {name: '痞客邦 PIXNET',
        url: /http:\/\/?(?:(?:[^\.]))+\.pixnet\.net\//i,
        siteExample: 'http://flamefox.pixnet.net/blog',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@id="article-box"]',
        },
    }, 
    {name: 'userstyles.org',
        url: /https:\/\/userstyles\.org\/styles\//i,
        siteExample: 'http://userstyles.org/styles/browse?page=1',
        nextLink: 'css;.next_page',
        autopager: {
            pageElement: 'css;.style-brief.no-rating',
        },
    }, 
    {name: 'userscripts.org',
        url: /http:\/\/userscripts\.org\/scripts/i,
        siteExample: 'http://userscripts.org/scripts',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@id="content"]',
        },
    }, 
	{name: '海盜灣',
		url: /^https?:\/\/(gameofbay|unblockedbay|tpbunblocked|thepiratebay|ukpirate|piratebay|pirateproxy|urbanproxy|pirate|piratebayproxy|thebay|piratebays|piratebaymirror|ukpirateproxy|tpbmirror|fastpiratebay|thepiratebay\-proxy)\.(org|info|uk\.net|click|red|yt|tf|eu|trade|tech|tv|co|host|co\.uk|xyz|us|online|com|wf)\//i,
		exampleUrl: 'https://thepiratebay.org/browse/207',
		nextLink: 'auto;',
		autopager: {
			pageElement:'css;#searchResult > TBODY > TR:first-child,#searchResult > TBODY > TR:nth-child(2),#searchResult > TBODY > TR:nth-child(3),#searchResult > TBODY > TR:nth-child(4),#searchResult > TBODY > TR:nth-child(5),#searchResult > TBODY > TR:nth-child(6),#searchResult > TBODY > TR:nth-child(7),#searchResult > TBODY > TR:nth-child(8),#searchResult > TBODY > TR:nth-child(9),#searchResult > TBODY > TR:nth-child(10),#searchResult > TBODY > TR:nth-child(11),#searchResult > TBODY > TR:nth-child(12),#searchResult > TBODY > TR:nth-child(13),#searchResult > TBODY > TR:nth-child(14),#searchResult > TBODY > TR:nth-child(15),#searchResult > TBODY > TR:nth-child(16),#searchResult > TBODY > TR:nth-child(17),#searchResult > TBODY > TR:nth-child(18),#searchResult > TBODY > TR:nth-child(19),#searchResult > TBODY > TR:nth-child(20),#searchResult > TBODY > TR:nth-child(21),#searchResult > TBODY > TR:nth-child(22),#searchResult > TBODY > TR:nth-child(23),#searchResult > TBODY > TR:nth-child(24),#searchResult > TBODY > TR:nth-child(25),#searchResult > TBODY > TR:nth-child(26),#searchResult > TBODY > TR:nth-child(27),#searchResult > TBODY > TR:nth-child(28),#searchResult > TBODY > TR:nth-child(29),#searchResult > TBODY > TR:nth-child(30)',
			HT_insert:['css;#searchResult > TBODY > TR:last-child',1],
		}
	},
    /*
    {name: '海盜灣',
        url: "^https://gameofbay\.org/*",
        siteExample: 'https://thepiratebay.org/browse/207/2/3',
        siteExample: 'https://gameofbay.org/browse/207',
        nextLink: 'auto',
        autopager: {
            pageElement:'css;#searchResult',
            //pageElement:'css;#searchResult > TBODY > TR:first-child,#searchResult > TBODY > TR:nth-child(2),#searchResult > TBODY > TR:nth-child(3),#searchResult > TBODY > TR:nth-child(4),#searchResult > TBODY > TR:nth-child(5),#searchResult > TBODY > TR:nth-child(6),#searchResult > TBODY > TR:nth-child(7),#searchResult > TBODY > TR:nth-child(8),#searchResult > TBODY > TR:nth-child(9),#searchResult > TBODY > TR:nth-child(10),#searchResult > TBODY > TR:nth-child(11),#searchResult > TBODY > TR:nth-child(12),#searchResult > TBODY > TR:nth-child(13),#searchResult > TBODY > TR:nth-child(14),#searchResult > TBODY > TR:nth-child(15),#searchResult > TBODY > TR:nth-child(16),#searchResult > TBODY > TR:nth-child(17),#searchResult > TBODY > TR:nth-child(18),#searchResult > TBODY > TR:nth-child(19),#searchResult > TBODY > TR:nth-child(20),#searchResult > TBODY > TR:nth-child(21),#searchResult > TBODY > TR:nth-child(22),#searchResult > TBODY > TR:nth-child(23),#searchResult > TBODY > TR:nth-child(24),#searchResult > TBODY > TR:nth-child(25),#searchResult > TBODY > TR:nth-child(26),#searchResult > TBODY > TR:nth-child(27),#searchResult > TBODY > TR:nth-child(28),#searchResult > TBODY > TR:nth-child(29),#searchResult > TBODY > TR:nth-child(30)',
            //HT_insert:['css;#searchResult > TBODY > TR:last-child',1],		
            //pageElement: 'css;#searchResult',
            //useiframe: true,
        },
    }, 
    */
    {name: '綠色工廠 Easylife Blog',
        url: /http:\/\/portable\.easylife\.tw/i,
        siteExample: 'http://portable.easylife.tw/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.hentry',
            HT_insert: ['css;#pager', 1],
        },
    }, 
    {name: '滄者極限 - Powered by vBulletin帖子列表頁面',
        url: /http:\/\/www\.coolaler\.com\/forumdisplay.php/i,
        siteExample: 'http://www.coolaler.com/forumdisplay.php/149-%E6%B8%AC%E8%A9%A6%E8%BB%9F%E9%AB%94%E3%80%81%E9%A9%85%E5%8B%95%E7%A8%8B%E5%BC%8F%E6%8F%90%E4%BE%9B',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;form#inlinemodform',
        },
    }, 
    {name: '滄者極限 - Powered by vBulletin帖子內容頁面',
        url: /http:\/\/forum\.coolaler\.com\/showthread/i,
        siteExample: 'http://forum.coolaler.com/showthread.php?t=249302',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="posts"]',
        },
    }, 
    {name: 'AMO',
        url: /https:\/\/addons\.mozilla\.org\/?(?:(?:zh-TW)|(?:zh-CN))+\/firefox\/?(?:(?:extensions)|(?:search)|(?:themes))+/i,
        siteExample: 'https://addons.mozilla.org/zh-TW/firefox/extensions',
        nextLink: 'css;A[class="button next"]',
        autopager: {
            pageElement: 'css;.items > .item.addon,div#themes-listing.island > div.items',
        }
    }, 
    {name: 'AMO personas',
        url: /https:\/\/addons\.mozilla\.org\/?(?:(?:zh-TW)|(?:zh-CN))+\/firefox\/personas/i,
        siteExample: 'https://addons.mozilla.org/zh-TW/firefox/personas',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.personas-grid',
        }
    }, 
    {name: '奇摩搜索',
        url: /http:\/\/tw\.search\.yahoo\.com\/search/i,
        siteExample: 'http://tw.search.yahoo.com/search',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@id="main"]',
        },
    }, 
    {name: '奇摩知識搜索',
        url: /http:\/\/tw\.?(?:(?:knowledge)|(?:blog)|(?:news))+\.search\.yahoo\.com\/search/i,
        siteExample: 'http://tw.knowledge.search.yahoo.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@id="main"]',
            useiframe: true,
        },
    }, 
    {name: '巴哈哈啦帖子列表',
        url: /http:\/\/forum\.gamer\.com\.tw\/B\.php/i,
        siteExample: 'http://forum.gamer.com.tw/B.php?bsn=17532',
        nextLink: 'css;.next',
        autopager: {
            pageElement: 'css;table.FM-blist',
        },
    }, 
    {name: '巴哈哈啦帖子內容',
        url: /http:\/\/forum\.gamer\.com\.tw\/C\.php/i,
        siteExample: 'http://forum.gamer.com.tw/C.php?bsn=16303&snA=229&tnum=662',
        nextLink: 'css;.next',
        autopager: {
            pageElement: 'css;.FM-cbox1',
        },
    }, 
    {name: '巴哈哈啦',
        url: /http:\/\/acg\.gamer\.com\.tw\//i,
        siteExample: 'http://acg.gamer.com.tw/?p=pc',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.ACG-mainbox1',
        },
    }, 
    {name: 'Youtube搜索',
        url: /^https?:\/\/www\.youtube\.com\/results/i,
        siteExample: 'https://www.youtube.com/results?search_query=%E8%B0%B7%E9%98%BF%E8%8E%AB',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#results',
            useiframe: true,
        },
    }, 
    {name: 'Google Play 搜索',
        url: /^https?:\/\/play\.google\.com\/store\/search\?q/i,
        siteExample: 'https://play.google.com/store/search?q=dict&c=apps&start=24&num=24',
        nextLink: {
            startAfter: '&start=',
            mFails: [/^https:\/\/play\.google\.com\/.*\/search\?q.*/i, '&start=0&num24'],
            inc: 24,
        },
        autopager: {
            remain: 0.33,
            pageElement: 'css;.results-section-set',
        }
    }, 
    {name: '筆趣閣',
        url: /^http:\/\/www\.biquge\.com\/.+\.html/i,
        siteExample: 'http://www.biquge.com/0_67/471472.html',
        useiframe: true,
        nextLink: '//div[@class="bottem2"]/descendant::a[text()="下一章"]',
        autopager: {
            useiframe: true,
            pageElement: '//div[@id="content"]'
        }
    }, 
    {name: '原創閱讀網',
        example: 'http://www.yuanchuang.com/bookreader/10165901/10295065.html',
        url: /^http:\/\/www\.yuanchuang\.com\/bookreader\/.+\.html/i,
        nextLink: function(doc) {
            return doc.getElementById('btnNext').onclick.toString().match(/http.*html/)[0]
        },
        autopager: {
            HT_insert: ['css;#readtext', 2],
            pageElement: 'css;#readcon',
        }
    }, 
    {name: '百曉生中文網',
        example: 'http://www.bxs.cc/book/14/14151/3711953.html',
        url: /^http:\/\/www\.bxs\.cc\/book\/.+\.html/i,
        nextLink: "css;#nextpage",
        autopager: {
            pageElement: 'css;#readbox',
        }
    }, 
    {name: 'publichd.se',
        url: /^https?:\/\/publichd\.se\/index\.php\?page=torrents/i,
        siteExample: 'http://publichd.se//index.php?page=torrents&search=&category=0&active=0',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.b-content table#bgtorrlist2',
            HT_insert: ['css;div.b-content table#bgtorrlist2', 2],
        },
    }, 
    {name: 'publichd.eu',
        url: /^https?:\/\/publichd\.eu\/index\.php\?page=userdetails/i,
        siteExample: 'http://publichd.eu/index.php?page=userdetails&id=26',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#mcol > DIV > DIV:nth-child(2) > DIV > DIV > DIV > TABLE:nth-child(4)',
        },
    }, 
    {name: 'Shareファイル検索',
        url: /^https?:\/\/www\.sharedb\.info\/index\.php/i,
        siteExample: 'http://www.sharedb.info/index.php/cat-%E3%82%A2%E3%83%8B%E3%83%A1/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.fileinfo_odd,.fileinfo',
            useiframe: true,
        },
    }, 
    {name: 'Winnyファイル検索',
        url: /^https?:\/\/www\.nyhash\.info\/index\.php/i,
        siteExample: 'http://www.nyhash.info/index.php/cat-%E3%82%A2%E3%83%8B%E3%83%A1/',
        nextLink: 'auto;',
        useiframe: true,
        autopager: {
            pageElement: 'css;.fileinfo_odd,.fileinfo',
            useiframe: true,
            iloaded: true,
        },
    }, 
    {name: 'sukebei.nyaa.se',
        url: /^https?:\/\/sukebei\.nyaa\.se\/\?page=torrents/i,
        siteExample: 'http://sukebei.nyaa.se/?page=torrents&catid=7&subcat=25',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.tlist',
        },
    }, 
    {name: 'sukebei.nyaa.se',
        url: /^https?:\/\/sukebei\.nyaa\.se\/\?user=/i,
        siteExample: 'http://sukebei.nyaa.se/?user=180326',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.tlist',
        },
    }, 
    {name: 'www.nyaa.se',
        url: /^https?:\/\/www\.nyaa\.se\//i,
        siteExample: 'http://www.nyaa.se/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.tlist',
        },
    }, 
    {name: 'alabout.com',
        url: /^https?:\/\/www\.alabout\.com\/list/i,
        siteExample: 'http://www.alabout.com/list.php?sid=3',
        nextLink: '//a[contains(text(),"次ページ")]',
        useiframe: true,
        autopager: {
            pageElement: '//node()[preceding-sibling::hr and following-sibling::hr]',
            useiframe: true,
        },
    }, 
    {name: 'alafs.com',
        url: /^https?:\/\/alafs\.com\/list/i,
        siteExample: 'http://alafs.com/list.php?sid=3',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;HR[size="1"],TABLE[width="100%"][cellpadding="2"][border="0"],.thread_separator',
        },
    }, 
    {name: 'Dragon Ball Multiverse',
        url: /http:\/\/www\.dragonball-multiverse\.com\/cn\/page/i,
        siteExample: 'http://www.dragonball-multiverse.com/cn/page-0.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.dapage',
            useiframe: true,
            iloaded: true,
            remain: 10,
        },
    }, 
    {name: '我愛P2P',
        url: /^https?:\/\/oabt\.org\//i,
        siteExample: 'http://oabt.org/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.toplist',
            HT_insert: ['css;#copyOpt', 1],
        },
    }, 
    {name: 'YYeTs人人影視',
        url: /^https?:\/\/www\.yyets\.com\/php\/?(?:(?:resourcelist)|(?:subtitle))+/i,
        siteExample: 'http://www.yyets.com/php/resourcelist',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.box_4.res_listview,.box_4.res_listview4',
            HT_insert: ['css;.pages', 1],
        },
    }, 
    {name: 'm8008',
        url: /^https?:\/\/m8008\.com/i,
        siteExample: 'http://m8008.com/',
        nextLink: 'css;.newer,.next a',
        autopager: {
            pageElement: 'css;.post',
        },
    }, 
    {name: 'zhongwenmanhua',
        url: /^https?:\/\/zhongwenmanhua\.blog131\.fc2blog\.net\//i,
        siteExample: 'http://zhongwenmanhua.blog131.fc2blog.net/',
        nextLink: 'css;#main > DIV:nth-child(21) > A:last-child',
        autopager: {
            pageElement: 'css;#main > DIV:first-child,#main > DIV:nth-child(2),#main > DIV:nth-child(3),#main > DIV:nth-child(2),#main > DIV:nth-child(4),#main > DIV:nth-child(5),#main > DIV:nth-child(6),#main > DIV:nth-child(7),#main > DIV:nth-child(8),#main > DIV:nth-child(9),#main > DIV:nth-child(10),#main > DIV:nth-child(11),#main > DIV:nth-child(12),#main > DIV:nth-child(13),#main > DIV:nth-child(14),#main > DIV:nth-child(15),#main > DIV:nth-child(16),#main > DIV:nth-child(17),#main > DIV:nth-child(18),#main > DIV:nth-child(19),#main > DIV:nth-child(20)',
            HT_insert: ['css;.page_navi', 1],
        },
    }, 
    {name: '软件盒子',
        url: /^https?:\/\/www\.itopdog\.cn\//i,
        siteExample: 'http://www.itopdog.cn/page/2',
        nextLink: 'css;.more,DIV.navigation:last-child > A:last-child',
        autopager: {
            pageElement: 'css;#post,.post',
        },
    }, 
    {name: 'portableapps.com',
        url: /^https?:\/\/portableapps\.com\/news/i,
        siteExample: 'http://portableapps.com/news',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.view-content',
            HT_insert: ['css;.view-content', 2],
        },
    }, 
    {name: 'portableapps.com',
        url: /^https?:\/\/portableapps\.com\/search/i,
        siteExample: 'http://portableapps.com/search/node/Mozilla',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.search-results.node-results',
            HT_insert: ['css;.search-results.node-results', 2],
        },
    }, 
    {name: '.NET菜鳥自救會',
        url: /^https?:\/\/www\.dotblogs\.com\.tw\/chou/i,
        siteExample: 'http://www.dotblogs.com.tw/chou/Default.aspx',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.post',
            HT_insert: ['css;#HomePager', 1],
        },
    }, 
    {name: '奇摩部落格',
        url: /^https?:\/\/tw\.myblog\.yahoo\.com\/[^\/]+\/archive/i,
        siteExample: 'http://tw.myblog.yahoo.com/jen9945x/archive?l=a',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#yarticle > DIV:nth-child(2) > DIV > DIV:nth-child(2)',
            HT_insert: ['css;#yarticle > DIV:nth-child(2) > DIV > DIV:last-child', 1],
        },
    }, 
    {name: 'btscene.eu',
        url: /^https?:\/\/www\.btscene\.eu\/?(?:(?:subcat)|(?:verified))+/i,
        siteExample: 'http://www.btscene.eu/subcat/id/28/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.tor',
            HT_insert: ['css;.pagination2', 1],
        },
    }, 
    {name: 'Torrentz Search Engine',
        url: /^https?:\/\/torrentz\.eu\//i,
        siteExample: 'http://torrentz.eu/search?q=Legend',
        //nextLink: '//a[contains(text(),"Next »")]',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.results > dl',
            //pageElement: 'css;.results',
        },
    }, 
    {name: 'Kickass',
        url: /^https?:\/\/(kat|kickasstorrentsan)\.(cr|com)\//i,
        siteExample: 'https://kat.cr/movies/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.data',
            HT_insert: ['css;.pages.botmarg5px.floatright', 1],
        },
    }, 
    {name: 'isohunt.com',
        url: /^https?:\/\/isohunt\.com\/torrents/i,
        siteExample: 'http://isohunt.com/torrents/?ihs1=5&iho1=d&iht=3',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#serps',
            HT_insert: ['css;#IH_tblBody > TBODY > TR > TD:first-child > TABLE:nth-child(21)', 1],
        },
    }, 
    {name: '東京圖書館',
        url: /^https?:\/\/www\.tokyotosho\.info\/index\.php/i,
        siteExample: 'http://www.tokyotosho.info/index.php',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.listing',
            HT_insert: ['css;#main > FORM:nth-child(9) > TABLE:last-child', 1],
        },
    }, 
    {name: '東京圖書館 搜索',
        url: /^https?:\/\/www\.tokyotosho\.info\/search\.php/i,
        siteExample: 'http://www.tokyotosho.info/search.php?terms=mp4&type=0&size_min=&size_max=&username=',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.listing',
            HT_insert: ['css;#main > P:nth-child(10)', 1],
        },
    }, 
    {name: 'JAV Torrent 掲示板',
        url: /^https?:\/\/www\.freedl\.org\/treebbs2rss\/treebbs2rss\/tree\.php\?mode\=(tree|expn|dump)/i,
        siteExample: 'http://www.freedl.org/treebbs2rss/treebbs2rss/tree.php?mode=tree',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;body center div > a[name],.list',
            //separator: false,
        },
    }, 
    {name: 'JAV Torrent 掲示板',
        url: /^https?:\/\/www\.freedl\.org\/treebbs2rss\/treebbs2rss\/tree\.php\?mode\=root/i,
        siteExample: 'http://www.freedl.org/treebbs2rss/treebbs2rss/tree.php?mode=root',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.bgc',
            separator: false,
        },
    }, 
    {name: '綠軟家園',
        url: /^https?:\/\/www\.downg\.com\/list\//i,
        siteExample: 'http://www.downg.com/list/r_1_1.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.cp div.cp-main > dl',
            HT_insert: ['css;div.cp div.cp-main div.pages', 1],
        },
    }, 
    {name: '绿色软件联盟',
        url: /^https?:\/\/www\.xdowns\.com\/soft\//i,
        siteExample: 'http://www.xdowns.com/soft/8/9/Soft_009_5.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.co_area3',
            HT_insert: ['css;div.bd3 div.bd3r div.co_area2', 1],
        },
    }, 
    {name: '小7聚樂部帖子列表',
        url: /^https?:\/\/7club\.ithome\.com\.tw\/board\//i,
        siteExample: 'http://7club.ithome.com.tw/board/15/2/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div#normal-articles div.article-list section div.articles div.article',
        },
    }, 
    {name: '小7聚樂部帖子內容',
        url: /^https?:\/\/7club\.ithome\.com\.tw\/?(?:(?:article)|(?:search))+/i,
        siteExample: 'http://7club.ithome.com.tw/article/10033942/2',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;div.replies-block div#replies,div.data-list div.body',
        },
    }, 
    {name: '挨踢路人甲',
        url: /^https?:\/\/walker-a\.com\//i,
        siteExample: 'http://walker-a.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.post',
        },
    }, 
    {name: 'Win8迷',
        url: /^https?:\/\/www\.win8mi\.com\//i,
        siteExample: 'http://www.win8mi.com/',
        nextLink: 'auto;',
        autopager: {
            useiframe: true,
            pageElement: 'css;.post',
        },
    }, 
    {name: '靖 ● 技場',
        url: /^https?:\/\/www\.jinnsblog\.com\//i,
        siteExample: 'http://www.jinnsblog.com/search?updated-max=2013-05-17T13:56:00%2B08:00&max-results=5&start=10&by-date=false&m=0',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.post',
        },
    }, 
    {name: '和諧漫畫國度',
        url: /^https?:\/\/zlock1980\.blog\.fc2\.com\//i,
        siteExample: 'http://zlock1979.blog.fc2.com/page-1.html',
        nextLink: 'css;div.page_navi a[title="下一頁"]',
        autopager: {
            pageElement: 'css;div.content,.page_navi',
        },
    }, 
    {name: 'Browse icon sets | Icon Search Engine',
        url: /^https?:\/\/www\.iconfinder\.com\/browse\//i,
        siteExample: 'http://www.iconfinder.com/browse/',
        nextLink: 'auto;',
        autopager: {
            useiframe: true,
            pageElement: 'css;section.iconsets',
        },
    }, 
    {name: '人人資料庫',
        url: /^https?:\/\/www\.renrencd\.com\/list/i,
        siteExample: 'http://www.renrencd.com/list-53.html',
        nextLink: 'auto;',
        autopager: {
            useiframe: true,
            pageElement: 'css;.listview',
        },
    }, 
    {name: '久久漫畫網',
        url: /^https?:\/\/coldpic\.sfacg\.com\/AllComic\//i,
        siteExample: 'http://coldpic.sfacg.com/AllComic/438/243/',
        nextLink: '//a[@class="cViewPChange cNext"]',
        autopager: {
            useiframe: true,
            pageElement: 'css;#iBody',
        },
    }, 
    {name: '無限動漫',
        url: /^https?:\/\/new\.comicvip\.com\/show\//i,
        siteExample: 'http://new.comicvip.com/show/cool-11874.html?ch=6#',
        nextLink: 'css;#next2',
        autopager: {
            useiframe: true,
            pageElement: 'css;#TheImg',
        },
    }, 
    {name: '大ACG時代 NEW',
        url: /http:\/\/www\.flamefox\.org\//i,
        siteExample: 'http://www.flamefox.org/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#Blog1',
        },
    }, 
    {name: 'IT天空',
        url: /http:\/\/bbs\.itiankong\.com\/?(?:(?:forum)|(?:thread))+/i,
        siteExample: 'http://bbs.itiankong.com/forum-198-1.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#threadlist,#postlist',
        },
    }, 
    {name: '阿图人体艺术网',
        url: /http:\/\/www\.aturt\.com\/doc/i,
        siteExample: 'http://www.aturt.com/doc/499.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.content',
        },
    }, 
    {name: 'subom',
        url: /http:\/\/www\.subom\.net\/(search|newsubs)/i,
        siteExample: 'http://www.subom.net/search/Gone%20Girl/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;[id^="subs"],[class^="subs_list"]',
        },
    }, 
    {name: 'wnacg',
        url: /http:\/\/www\.wnacg\.com\/(albums|photos\-index\-).*\.html/,
        siteExample: 'http://www.wnacg.com/albums.html',
        nextLink: 'css;.next > a',
        autopager: {
            pageElement: 'css;.gallary_wrap',
        },
    }, 
    {name: 'wnacg',
        url: /http:\/\/www\.wnacg\.com\/photos\-view\-id\-\d+\.html/,
        siteExample: 'http://www.wnacg.com/photos-view-id-945033.html',
        nextLink: 'css;#imgarea > a',
        autopager: {
            pageElement: 'css;.photo',
            useiframe: true,
            separator: false,
            ipages: [true, 5],
        },
    }, 
    {name: 'greasyfork',
        url: /https:\/\/greasyfork\.org\//i,
        siteExample: 'https://greasyfork.org/zh-TW/scripts',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#browse-script-list',
        },
    }, 
    {name: '漫畫台',
        url: /http:\/\/www\.manhuatai\.com\/.*\/.*\.html/i,
        siteExample: 'http://www.manhuatai.com/doupocangqiong/1ce.html',
        nextLink: 'auto;',
        autopager: {
            useiframe: true,
            pageElement: 'css;.mh_comiclist.tc',
        },
    },
// ========= 自己蛋疼的 ================
    {name: '百度搜索',
        // 由於 Super_preloader 默認去掉了 # 後面部分
        // url: "^https?://www\\.baidu\\.com/(s|baidu|#wd=)",
        url: "^https?://www\\.baidu\\.com/",
        enable:true,
        nextLink:'id("page")/a[text()="下一页>"]',
        preLink:'id("page")/a[text()="上一頁>"]',
        autopager: {
            pageElement: 'css;div#content_left > *',
            HT_insert:['css;div#content_left',2],
            replaceE: 'css;#page',
            stylish: '.autopagerize_page_info, div.sp-separator {margin-bottom: 10px !important;}',
            startFilter: function(win) {
                // 設置百度搜索類型為 s?wd=
                try {
                    win.document.cookie = "ISSW=1";
                } catch (ex) {}
            }
        }
    },
    {name: '百度搜索 - baidulocal',
        url: '^https?://www\\.baidu\\.com/s.*&tn=baidulocal',
        nextLink: '//a[font[text()="下一頁"]]',
        pageElement: '//table[@width="100%" and @border="0"]/tbody/tr/td/ol',
        exampleUrl: 'http://www.baidu.com/s?wd=firefox&rsv_spt=1&issp=1&rsv_bp=0&ie=utf-8&tn=baidulocal&inputT=1364',
    },
    {name: '360搜索',
        url: "http://www\\.so\\.com/s",
        nextLink:'//div[@id="page"]/a[text()="下一頁>"] | id("snext")',
        autopager:{
            pageElement:'//div[@id="container"]',
            stylish: '.autopagerize_page_info, div.sp-separator { margin-bottom: 20px !important; }'
        }
    },
    {name: '搜狗搜索',
        url:/^https?:\/\/www\.sogou\.com\/(?:web|sogou)/i,
        siteExample:'http://www.sogou.com',
        enable:true,
        nextLink:'//div[@id="pagebar_container"]/a[@id="sogou_next"]',
        autopager:{
            pageElement:'//div[@class="results"]',
            replaceE: 'id("pagebar_container")'
        }
    },
    {name: 'Bing網頁搜索',
        url:/bing\.com\/search\?q=/i,
        siteExample:'bing.com/search?q=',
        nextLink:'//nav[@aria-label="navigation"]/descendant::a[last()][@class="sb_pagN"]',
        autopager:{
            pageElement: '//ol[@id="b_results"]/li[@class="b_algo"]',
            replaceE: '//nav[@aria-label="navigation"]'
        }
    },
    {name: '有道網頁搜索',
        url: /http:\/\/www\.youdao\.com\/search\?/i,
        siteExample: 'http://www.youdao.com/search?',
        nextLink: '//div[@class="c-pages"]/a[text()="下一頁"]',
        autopager: {
            pageElement: '//ol[@id="results"]',
            replaceE: 'id("resc")/div[@class="c-pages"]'
        }
    },
    {name: 'SoSo網頁搜索',
        url:/http:\/\/www\.soso\.com\/q/i,
        siteExample:'http://www.soso.com/q',
        nextLink:'//div[@class="pg"]/descendant::a[last()][@class="next"]',
        autopager:{
            // useiframe:true,
            pageElement:'//div[@id="result"]/ol/li',
            replaceE: 'id("pager")'
        }
    },
    {name: 'Disconnect Search',
        url: /^https?:\/\/search\.disconnect\.me\//i,
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("results")',
            replaceE: '//div[@class="pagination"]',
        }
    },
    {name: 'AOL 搜索',
        url: '^http://(www\\.)aolsearch.com/search\\?.+?[?&]q=',
        siteExample: 'http://www.aolsearch.com/search?q=test',
        nextLink: '//a[span[@class="nextRes"][text()="Next"]]',
        autopager: {
            pageElement: '//*[@id="c"]/div'
        }
    },
    {name: '谷搜客',
       url: /^https?:\/\/gusouk\.com\/search/i,
       siteExample: 'http://gusouk.com/search?q=firefox',
       nextLink: 'auto;',
       autopager: {
           pageElement: '//div[@class="search_result"]'
       }
    },
    {name: 'tmd123搜索',  // www.tmd123.com
       url: /^https?:\/\/54\.64\.24\.234\/search/i,
       siteExample: 'http://54.64.24.234/search/?q=firefox',
       nextLink: 'auto;',
       autopager: {
           pageElement: '//div[@class="search_result"]'
       }
    },
    {name: "Google custom",
        url: /^https?:\/\/74\.125\.128\.147\/custom/i,
        nextLink: 'id("pnnext") | id("navbar navcnt nav")//td[span]/following-sibling::td[1]/a | id("nn")/parent::a',
        autopager: {
            pageElement: '//div[@id="res"]',
        }
    },

    // ====== 目前 Super_preloaderPlus_one 還有問題的 ========
    {name: '水木社區',
        url: '^http://www\\.newsmth\\.net/nForum',
        nextLink: '//a[@title="下一頁"]',
        pageElement: '//div[@class="b-content"] | //div[@class="b-content corner"]',
        exampleUrl: 'http://www.newsmth.net/nForum/#!board/TouHou'
    },

    // =============== baidu 其它 ===========
    {name: '百度吧內搜索',
        url: /^http:\/\/tieba\.baidu\.com\/f\/search/i,
        siteExample: 'http://tieba.baidu.com/f/search/',
        nextLink: 'auto;',
        pageElement: 'css;.s_post'
    },
    {name: '百度新聞搜索',
        url: '^http://news\\.baidu\\.(?:[^.]{2,3}\\.)?[^./]{2,3}/ns',
        nextLink: 'id("page")/a[text()="下一頁>"]',
        pageElement: 'id("content_left")',
    },
    {name: '百度知道',
        url:/^https?:\/\/zhidao\.baidu\.com\/search\?/i,
        siteExample:'http://zhidao.baidu.com/search?pn=0&&rn=10&word=%BD%AD%C4%CFstyle',
        nextLink:'auto;',
        pageElement:'css;#wgt-list',
    },
    {name: '百度空間',
        url: '^http://hi\\.baidu\\.com',
        nextLink: 'id("pagerBar")/div/a[@class="next"]',
        autopager: {
            useiframe: true,
            pageElement: '//div[@class="mod-realcontent mod-cs-contentblock"]',
        },
        exampleUrl: 'http://hi.baidu.com/gelida',
    },
    {name: '百度文庫搜索',
        url: /^http:\/\/wenku\.baidu\.com\/search\?/i,
        exampleUrl: 'http://wenku.baidu.com/search?word=firefox&lm=0&od=0&fr=top_home',
        nextLink: '//div[@class="page-content"]/a[@class="next"]',
        autopager: {
            pageElement: '//div[@class="search-result"]',
        }
    },

    // ================ news、Reading ===========================
    {name: '新浪新聞',
        url: /^http:\/\/[a-z]+\.sina\.com\.cn\//i,
        exampleUrl: 'http://news.sina.com.cn/c/sd/2013-11-08/165728658916.shtml',
        nextLink: '//p[@class="page"]/a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@id="artibody"]',
            relatedObj: true,
        }
    },
    {name: '搜狐新聞',
        url: /^http:\/\/news\.sohu\.com\/.*\.shtml/i,
        exampleUrl: 'http://news.sohu.com/20120901/n352071543.shtml',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("contentText")',
        }
    },
    {name: '新華網新聞頁面',
        url:/http:\/\/news\.xinhuanet\.com\/.+\/\d+-/i,
        siteExample:'http://news.xinhuanet.com/politics/2010-07/19/c_12347755.htm',
        nextLink:'//div[@id="div_currpage"]/a[text()="下一頁"]',
        autopager:{
            remain:2,
            pageElement:'//table[@id="myTable"] | id("content")'
        }
    },
    {name: '騰訊網-大成網,新聞',
        url: /^http:\/\/[a-z]+\.qq\.com\/.*\.htm/i,
        exampleUrl: 'http://cd.qq.com/a/20131119/002713.htm',
        nextLink: 'id("ArtPLink")/ul/li/a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("Cnt-Main-Article-QQ")',
            relatedObj: true,
            replaceE: "css;#ArtPLink"
        }
    },
    {name: '大成社區',
        url: /^http:\/\/[a-z]+\.qq\.com\/(?:forum\.php|.*\.htm)/i,
        exampleUrl: 'http://mycd.qq.com/forum.php?mod=forumdisplay&fid=1001037360&page=',
        nextLink: '//div[@class="pgb"]/a[@class="nxt"]',
        autopager: {
            pageElement: 'id("threadlisttableid") | id("postlist") | id("threadlist")/table',
            replaceE: 'css;.page_box .pgb',
            lazyImgSrc: 'zoomfile'
        }
    },
    {name: '中國新聞網',
        url:/http:\/\/www\.chinanews\.com\/[a-z]+\/.+\.shtml/i,
        siteExample:'http://www.chinanews.com/英文/年/日期/編號.shtml',
        nextLink: '//div[@id="function_code_page"]/a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@class="left_zw"] | //div[@class="hd_photo"]',
            relatedObj: true,
            HT_insert:['//div[@id="function_code_page"]',1],
            filter:'//div[@id="function_code_page"]',
        }
    },
    {name: '人民網新聞',
        url: /^http:\/\/[a-z]+\.people\.com\.cn\/.*\.html/i,
        exampleUrl: 'http://ent.people.com.cn/n/2013/0823/c1012-22672732-2.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="text_img"] | //div[@id="p_content"]',
            relatedObj: true
        }
    },
    {name: '中關村在線新聞頁面',
        url:/http:\/\/(?:[^\.]+\.)?zol\.com\.cn\/\d+\/\d+/i,
        siteExample:'http://lcd.zol.com.cn/187/1875145.html',
        nextLink: '//div[@class="page"]/a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="cotent_idd" or @id="article-content"]',
            relatedObj: true,
            replaceE: 'css;.page'
        }
    },
    {name: 'FT中文網',
        url: /^http:\/\/www\.ftchinese\.com\/story\//i,
        exampleUrl: 'http://www.ftchinese.com/story/001053472',
        nextLink: '//div[@class="pagination"]/a[text()="余下全文"]',
        autopager: {
            pageElement: '//div[@id="bodytext"]',
            relatedObj: true,
            replaceE: '//div[@class="pagination"]'
        }
    },
    {name: 'Solidot: 奇客的資訊，重要的東西',
        url: /^http:\/\/www\.solidot\.org\//i,
        exampleUrl: 'http://www.solidot.org/?issue=20131205',
        nextLink: 'id("center")/div[@class="page"]/a[last()]',
        autopager: {
            pageElement: 'id("center")/div[@class="block_m"]',
            separatorReal: false
        }
    },
    {name: 'IT 之家',
        url: /^http:\/\/\w+\.ithome\.com\//i,
        nextLink: 'id("Pager")/div[@class="pagenew"]/a[text()=">"]',
        autopager: {
            pageElement: 'id("wrapper")/div[@class="content fl"]/div[@class="cate_list" or @class="post_list"]/ul[@class="ulcl"]',
            replaceE: 'id("Pager")/div[@class="pagenew"]'
        }
    },
    {name: '虎嗅網',
        url: "^http://www\\.huxiu\\.com/",
        nextLink: '//span[@class="next"]/a[text()=">"]',
        pageElement: '//div[@class="center-ctr-box"]'
    },
    {name: '36氪',
        url: "^http://www\\.36kr\\.com/.+",
        nextLink: '//a[@rel="next"]',
        pageElement: 'id("mainContainer")/descendant::div[contains(concat(" ", @class, ""),"krContent")]'
    },
    {name: '愛范兒 · Beats of Bits - 發現創新價值的科技媒體',
        url: "^http://www\\.ifanr\\.com/",
        nextLink: '//div[@class="content-nav"]/a[text()="下一頁"]',
        pageElement: 'id("content")/div[contains(concat(" ", @class, ""), "main")]'
    },
    {name: '創業幫',
        url: /^http:\/\/www\.cyzone\.cn\//i,
        exampleUrl: 'http://www.cyzone.cn/',
        nextLink: 'id("pages")/*[@class="current"]/following-sibling::a[1]',
        autopager: {
            pageElement: '//div[@class="left"]/div[starts-with(@class, "intere")]/ul[@class="list clearfix"]',
        }
    },
    {name: '蘿卜網',
        url: /^http:\/\/luo\.bo\//i,
        exampleUrl: 'http://luo.bo/',
        nextLink: '//div[@class="pagenavi"]/a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@class="homeposts"]/ul[contains(@class, "explist homelist")] | //div[@class="container"]/div[@class="content"]',
            replaceE: '//div[@class="pagenavi"]'
        }
    },
    {name: '愛活網 Evolife.cn_科技進化生活',
        url: /^http:\/\/[a-z]+\.evolife\.cn\//i,
        exampleUrl: 'http://go.evolife.cn/category/focus_121_1.html',
        nextLink: '//div[contains(@class, "pages")]/a[text()="下一頁" or contains(text(), ">")]',
        autopager: {
            pageElement: '//div[@class="zuijingengxin"]/div[@class="zuijingengxin_box"] | //div[@class="zuijingengxin"]/div[@class="text"]',
            replaceE: 'css;.pages',
            relatedObj: true,
        }
    },
    {name: '鳳凰網 - 鳳凰汽車',
        url: /^http:\/\/auto\.ifeng\.com\/.*\.shtml/i,
        exampleUrl: 'http://auto.ifeng.com/youji/20131115/1003513.shtml',
        nextLink: '//div[@class="arl-pages"]/a[@class="next"]',
        autopager: {
            pageElement: '//div[starts-with(@class,"arl-mian")]/div/div[@class="arl-cont"]',
            relatedObj: true,
            replaceE: '//div[@class="arl-pages"]'
        }
    },
    {name: '鳳凰網 - 新聞、財經',
        url: /^http:\/\/\w+\.ifeng\.com\//i,
        exampleUrl: 'http://finance.ifeng.com/a/20131115/11089994_1.shtml',
        nextLink: '//a[@id="pagenext"] | //div[@class="next" or @class="fy"]/a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@id="artical_real"] | //div[@class="content"]/div[@class="contentL"] | //div[@class="yib_left"]/div[@class="box_list"]',
            relatedObj: true,
            replaceE: 'id("artical")/div[@class="an"]/div[@class="next"] | //div[@class="yib_left"]/div[@class="fy"]'
        }
    },
    {name: '和訊財經微博',
        url: /^http:\/\/t\.hexun\.com\/.*\.html/i,
        exampleUrl: 'http://t.hexun.com/21210301/default.html',
        nextLink: '//li[contains(@class, "nextbtn2")]/a[text()="下一頁 >"]',
        autopager: {
            pageElement: '//div[@id="listWeibo"]',
            replaceE: '//div[@id="page2"]'
        }
    },
    {name: '和訊博客',
        url: /^http:\/\/\w+\.blog\.hexun\.com\//i,
        exampleUrl: 'http://23802543.blog.hexun.com/',
        nextLink: function(doc) {
            var url = doc.querySelector('.PageSkip_1 a[title="下一頁"]').getAttribute('href');
            url = url.replace(/(\/p\d+\/).*/, '$1default.html');
            return url;
        },
        autopager: {
            pageElement: 'id("DefaultContainer1_ArticleList_Panel1")'
        }
    },
    {name: '汽車之家',
        url: /^http:\/\/www\.autohome\.com\.cn\/.*\.html/i,
        exampleUrl: 'http://www.autohome.com.cn/culture/201310/643479-7.html',
        nextLink: 'id("articlewrap")/div[@class="page"]/a[@class="page-item-next"]',
        autopager: {
            pageElement: 'id("articleContent")',
            relatedObj: true,
            replaceE: 'id("articlewrap")/div[@class="page"]'
        }
    },
    {name: '汽車之家論壇帖子和列表',
        url:/^http:\/\/club\.autohome\.com\.cn\/bbs/i,
        siteExample:'http://club.autohome.com.cn/bbs/forum-c-2313-1.html',
        nextLink:'auto;',
        autopager:{
            pageElement:'//dl[@class="list_dl "][@lang] | //div[@class="conmain"]',
        }
    },
    {name: '愛卡汽車',
        url: /^http:\/\/yp\.xcar\.com\.cn\/.*\.html/i,
        exampleUrl: 'http://yp.xcar.com.cn/201311/news_1351064_1.html',
        nextLink: '//div[@class="article_page_bottom"]/a[@class="page_down"]',
        autopager: {
            pageElement: 'id("newsbody")',
            relatedObj: true,
            replaceE: '//div[@class="article_page_bottom"]'
        }
    },
    {name: '愛卡汽車論壇帖子',
        url:/^http:\/\/www\.xcar\.com\.cn\/bbs\/viewthread/i,
        siteExample:'http://www.xcar.com.cn/bbs/viewthread.php?tid=12474760',
        nextLink:'//a[text()="下一頁＞"][@href]',
        autopager:{
            pageElement:'//form[@id="delpost"] | //div[@class="maintable"][@id="_img"]',
        }
    },
    {name: '新聞 - 加拿大華人網',
        url: /^http:\/\/www\.sinonet\.org\/.*\.html/i,
        exampleUrl: 'http://www.sinonet.org/news/society/2013-11-15/301940.html',
        nextLink: '//p[@class="pageLink"]/a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("zoom")',
            relatedObj: true
        }
    },
    {name: '美國中文網',
        url: /^http:\/\/news\.sinovision\.net\/.*\.htm/i,
        exampleUrl: 'http://news.sinovision.net/politics/201401/00279206.htm',
        nextLink: '//div[@class="pg"]/a[@class="nxt"]',
        autopager: {
            pageElement: '//div[@class="d"]/table[@class="vwtb"]',
            replaceE: '//div[@class="pg"]',
            relatedObj: true
        }
    },
    {name: '火星網－中國領先的數字藝術門戶',
        url: /^http:\/\/news\.hxsd\.com\/.*\.html/i,
        exampleUrl: 'http://news.hxsd.com/CG-dynamic/201401/684528.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="news_content_left"]/div[@class="content"]',
        }
    },
    {name: '鐵血網',
        url: /^http:\/\/bbs\.tiexue\.net\/post.*\.html/i,
        exampleUrl: 'http://bbs.tiexue.net/post2_7969883_3.html',
        nextLink: '//div[@class="page"]/a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("postContent")/div[@class="newconli2"]',
            relatedObj: true
        }
    },
    {name: '看天下',
        url: /^http:\/\/www\.vistastory\.com\/.*\.html/i,
        exampleUrl: 'http://www.vistastory.com/a/201408/5395.html',
        nextLink: '//a[@class="cpnext"]',
        autopager: {
            pageElement: 'css;.arc_body',
        }
    },
    {name: '參政消息',
        url: '^http://china\\.cankaoxiaoxi\\.com/.*\\.shtml',
        nextLink: 'id("next_page")',
        pageElement: 'id("ctrlfscont")',
        exampleUrl: 'http://china.cankaoxiaoxi.com/roll10/2014/0817/464381.shtml',
    },
    {name: '中國網山東頻道',
        url: '^http://sd\\.china\\.com\\.cn/.*\\.html',
        autopager: {
            pageElement: 'css;.content',
                relatedObj: true,
        }
    },
    {name: '凱迪社區',
        url: '^http://club\\.kdnet\\.net/list\\.asp',
        nextLink: 'auto;',
        pageElement: '//div[@class="lf w840px"]/div[@class="list-table"]/table',
        exampleUrl: 'http://club.kdnet.net/list.asp?t=0&boardid=1&selTimeLimit=0&action=&topicmode=0&s=&page=1',
    },
    {name: '木木文摘',
        url: 'http://www\\.85nian\\.net/',
        nextLink: 'auto;',
        pageElement: 'css;.entry-content'
    },

    //--- 國外新聞
    {name: 'TouringCarTimes',
        url: /^http:\/\/www\.touringcartimes\.com\/category\//i,
        nextLink: '//li[@class="bpn-next-link"]/a',
        autopager: {
            pageElement: '//div[@id="archive_page_wrapper"]',
        }
    },
    {name: 'tomshardware',
        url: /^http:\/\/www\.tomshardware\.com\//i,
        exampleUrl: 'http://www.tomshardware.com/reviews/chrome-27-firefox-21-opera-next,3534-2.html',
        nextLink: '//li[@class="item icon active"]/following::a[1]',
        autopager: {
            pageElement: '//article[@id="news-content"]',
        }
    },

    // ========================= video =====================
    {name: '優酷視頻',
        url: /^http:\/\/(?:www|u|i|tv)\.youku\.com\//i,
        nextLink: '//a[@title="下一頁"] | //li[@class="next"]/a[text()="下一頁"] | //a[em/@class="ico_next"] | //a[span/@class="ico__pagenext"]',
        autopager: {
            pageElement: '//div[@id="list" or @id="listofficial"] | id("getVideoList") | id("imgType") | //div[@class="YK_main" or @class="mainCol"]/descendant::div[@class="items"]',
        }
    },
    {name: "搜庫-專找視頻",
        url: "^http://www\\.soku\\.com/",
        nextLink: '//li[@class="next"]/a[@title="下一頁"]',
        autopager: {
            pageElement: '//div[@class="sk_result"]',
            separatorReal: false,
        }
    },
    {name: '愛奇藝',
        url: /^http:\/\/(list|so)\.iqiyi\.com\//i,
        nextLink: '//div[@class="page"]/a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@class="list_content"]/div[@class="list0"] | //div[@class="s_main"]/descendant::div[@class="mod_sideright clearfix"]/ul',
        }
    },
    {name: '土豆網 - 全部視頻',
        url: /^http:\/\/www\.tudou\.com\/cate\/.*\.html/i,
        exampleUrl: 'http://www.tudou.com/cate/ach30.html',
        nextLink: '//div[@class="page-nav-bar"]/a[text()="下一頁>"]',
        autopager: {
            pageElement: '//div[@class="content"]',
        }
    },
    {name: '搜狐視頻 搜索',
        url: /^http:\/\/so\.tv\.sohu\.com\/mts\?&wd=/i,
        exampleUrl: 'http://so.tv.sohu.com/mts?&wd=%u6211%u662F%u7279%u79CD%u5175%u4E4B%u706B%u51E4%u51F0',
        nextLink: '//div[@class="page"]/a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@class="listBox clear"]/div[@class="column picList"]',
        }
    },
    {name: '搜狐視頻',
        url: /^http:\/\/so\.tv\.sohu\.com\/list/i,
        exampleUrl: 'http://so.tv.sohu.com/list_p1169_p2_u4E16_u754C_u676F_p3_p4_p5_p6_p7_p8_p9_p10_p11.html',
        nextLink: '//div[@class="page"]/a[@class="next"]',
        autopager: {
            pageElement: 'id("contentList")/div[@class="column-bd clear"]/ul[@class="cfix"]',
            replaceE: 'id("contentList")/div[@class="page"]',
        }
    },
    {name: 'bilibili',
        "url": "^http://(www\\.bilibili\\.tv/search|space\\.bilibili\\.tv/)",
        "nextLink": "//div[@class=\"pagelistbox\"]/a[@class=\"nextPage\"]|//ul[@class=\"page\"]/li[@class=\"current\"]/following-sibling::li[1]/a",
        "pageElement": "//div[@class=\"searchlist\"]/ul[@class=\"search_result\"]/li|//div[@class=\"main_list\"]/ul/li"
    },
    {name: 'youtube 搜索列表',
        url: /^https?:\/\/www\.youtube\.com\/results/i,
        nextLink: '//div[contains(concat(" ", @class, " "), " yt-uix-pager ")]//a[last()][@href]',
        autopager: {
            pageElement: 'id("results")',
            lazyImgSrc: 'data-thumb'
        }
    },
    {name: 'imdb',
        url: /^http:\/\/www\.imdb\.com\/search/i,
        exampleUrl: 'http://www.imdb.com/search/title?count=100&title_type=feature,tv_series&ref_=nv_ch_mm_1',
        nextLink: '//span[@class="pagination"]/a[last()] | id("right")/a[last()]',
        autopager: {
            pageElement: 'id("main")/*',
        }
    },

    // ====================== shopping、生活 ===========================
    {name: '淘寶搜索',
        url: '^http://(?:list|s|search[^.]*)\\.taobao\\.com/search',
        nextLink: '//a[@class="page-next"]',
        autopager: {
            pageElement: '//div[@class="tb-content"]',
            lazyImgSrc: 'data-lazyload-src|data-ks-lazyload',
        }
    },
    {name: "淘寶",
        url: /^http:\/\/(?!bbs).*\.taobao\.com\//i,
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@id="J_ShopSearchResult"]/div/div[contains(@class, "shop-hesper-bd")] | id("J_ItemListsContainer")/ul[@class="item-lists"]',
            lazyImgSrc: 'data-lazyload-src|data-ks-lazyload',
        }
    },
    {name: '天貓 - 搜索',
        url: '^http://list\\.tmall\\.com//?search_product\\.htm\\?',
        nextLink: '//a[@class="ui-page-next" and (text()="下一頁>>")]',
        autopager: {
            pageElement: '//div[@id="J_ItemList"]',
            relatedObj: true,
            replaceE: '//div[@class="ui-page-wrap"]',
            lazyImgSrc: 'data-lazyload-src|data-ks-lazyload',
        },
    },
    {name: '店內搜索頁-淘寶網',
        url: /^http:\/\/[^.]+\.taobao\.com\/search\.htm\?/i,
        exampleUrl: 'http://jiaqibaihou.taobao.com/search.htm?spm=a1z10.3.w4002-1381691988.18.GgWBry&mid=w-1381691988-0&search=y&keyword=%BC%AA%C1%D0&pageNo=1',
        nextLink: '//a[(text()="下一頁")][not(@class="disable")]',
        autopager: {
            pageElement: '//div[@id="J_ShopSearchResult"]/div/div[contains(@class, "shop-hesper-bd")]',
            lazyImgSrc: 'data-lazyload-src|data-ks-lazyload',
        }
    },
    {name: '淘寶論壇 ',
        url: /^http:\/\/bbs\.taobao\.com\//i,
        exampleUrl: 'http://bbs.taobao.com/catalog/thread/647133-264959947.htm?spm=0.0.0.0.Ji1u2u',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("detail")/div[@class="bbd"] | //div[@class="main-wrap"]//div[@class="bd"]/table[@class="posts"]',
            replaceE: '//div[@class="pagination"]'
        }
    },
    {name: '京東商城',
        url: /^http:\/\/.*\.jd\.com\//i,
        exampleUrl: 'http://list.jd.com/670-686-690-0-0-0-0-0-0-0-1-1-1-1-18-1574-29455-0.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("plist")',
            useiframe: true,
            lazyImgSrc: 'data-lazyload',
        }
    },
    {name: '京東讀書',
        url: /^http:\/\/read\.jd\.com\/.*\/.*\.html/i,
        exampleUrl: 'http://read.jd.com/16171/778043.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="mc clearfix"]',
        }
    },
    {name: '亞馬遜',
        url: /^http:\/\/www\.amazon\.cn\/gp\/search\//i,
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("mainResults") | id("btfResults")',
        }
    },
    {name: '易迅網',
        url: /^http:\/\/searchex\.yixun\.com\//i,
        exampleUrl: 'http://searchex.yixun.com/705798t706810-1001-/?YTAG=3.706810246020',
        nextLink: '//div[@class="sort_page_num"]/a[@title="下一頁"]',
        autopager: {
            pageElement: '//UL[@id="itemList"]',
            lazyImgSrc: 'init_src'
        }
    },
    {name: '前程無憂 - 搜索',
        url: /^http:\/\/search\.51job\.com\/jobsearch\/search_result/i,
        nextLink: '//table[@class="searchPageNav"]//td[@class="currPage"]/following-sibling::td[1]/a',
        autopager: {
            pageElement: 'id("resultList")',
        }
    },
    {name: '搶了個便宜 | 高性價比正品低價商品推薦網',
        url: /^http:\/\/www\.qlgpy\.com\//i,
        nextLink: '//div[@class="wpagenavi"]/a[text()="下頁"]',
        autopager: {
            pageElement: 'id("wrapmain")//ul[starts-with(@id, "post-")]',
        }
    },
    {name: '秒便宜論壇',
        url: /^http:\/\/bbs\.miaopy\.com\//i,
        exampleUrl: 'http://bbs.miaopy.com/activity/list-3.aspx',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.forumtopics-list',
            stylish: 'div.sp-separator { width: 800px !important;}'
        }
    },
    {name: '露天拍賣',
        url: /^http:\/\/[a-z]+\.ruten\.com\.tw\//i,
        exampleUrl: 'http://class.ruten.com.tw/category/sub00.php?c=0019000800010001',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="searchResult"]',
        }
    },
    {name: 'Yahoo!奇摩拍賣',
        url: /^https:\/\/tw\.bid\.yahoo\.com\//i,
        exampleUrl: 'https://tw.bid.yahoo.com/tw/2092076277-category-leaf.html?.r=1408853888',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("srp_sl_result")',
        }
    },
    // 手機評測等
    {name: '殺價幫3C導購網—真實 客觀 獨立 自由',
        url: /^http:\/\/www\.shajia\.cn\/article/i,
        exampleUrl: 'http://www.shajia.cn/article_list.php',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("agreement")',
        }
    },
    {name: '機鋒網',
        url: /^http:\/\/www\.gfan\.com\/review\/\w+\.html/,
        exampleUrl: 'http://www.gfan.com/review/2014091557751.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="news-content"]',
            relatedObj: true
        }
    },

    // ========================= 知識、閱讀 ============================
    {name: '豆瓣-書影音評論',
        url: '^http://.*\\.douban\\.com/subject',
        nextLink: '//div[@class="paginator"]/span[@class="next"]/a[contains(text(),"後頁>")]',
        autopager: {
            pageElement: '//ul[contains(@class,"topic-reply")] | //div[@class="article"]/table | //div[@id="comments" or @class="post-comments"]'
        }
    },
    {name: '我的小組話題 - 豆瓣',
        url: /^http:\/\/www\.douban\.com\/group\//i,
        exampleUrl: 'http://www.douban.com/group/',
        nextLink: '//div[@class="paginator"]/span[@class="next"]/a[text()="後頁>"]',
        autopager: {
            pageElement: 'id("content")/div/div[@class="article"]',
        }
    },
    {name: '豆瓣全站',
        url: '^http://.*\\.douban\\.com/.*',
        nextLink: '//div[@class="paginator"]/span[@class="next"]/a[contains(text(),"後頁>")]',
        autopager: {
            pageElement: 'id("miniblog") | //*[@class="photolst clearfix" or @class="photolst clearbox" or @class="event-photo-list" or @class="poster-col4 clearfix"] | \
            //div[@id="comment-section"] | //table[@class="olt" or @class="list-b"]/tbody | //div[contains(@class,"clearfix")]/div[@class="article"]'
        }
    },
    {name: '知乎',
        url: /^http:\/\/www\.zhihu\.com\/collection/i,
        exampleUrl: 'http://www.zhihu.com/collection/19561986',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("zh-list-answer-wrap")/div[@class="zm-item"]',
            useiframe: true,
                newIframe: true
        }
    },
    {name: '譯言網 | 譯文庫和原文庫',
        url: /^http:\/\/(?:article|source)\.yeeyan\.org\//i,
        nextLink: '//ul[contains(concat(" ",normalize-space(@class)," "), " y_page") ]/li/a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[contains(concat(" ",normalize-space(@class)," "), "content_box")] | //div[@class="y_l"]/div[@class="y_s_list"]',
            replaceE: '//ul[contains(concat(" ",normalize-space(@class)," "), " y_page") ]'
        }
    },
    {name: '譯言精選',
        url: /^http:\/\/select\.yeeyan\.org\//i,
        nextLink: '//ul[contains(@class, "s_page_n")]/li/a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("article_list")',
            replaceE: '//ul[contains(@class, "s_page_n")]'
        }
    },
    {name: ' 譯言小組',
        url: /^http:\/\/group\.yeeyan\.org\//i,
        nextLink: '//div[@class="paginator"]/a[@class="next"]',
        autopager: {
            pageElement: '//div[contains(@class, "column-main")]/div[contains(@class, "stream")]',
            replaceE: '//div[@class="paginator"]',
        }
    },
    {name: '主題站 | 果殼網 ',
        url: '^http://www\\.guokr\\.com/(?:site|group|ask|event)/',
        nextLink: '//ul[@class="gpages"]/li/a[contains(.,"下一頁")]',
        pageElement: '//div[@class="article-list"] | //ul[@class="titles"] | //ul[@class="ask-list"] | //ul[@class="event_list gclear"]',
    },
    {name: '大眾點評網',
        url: '^http://www\\.dianping\\.com/.*',
        nextLink: '//a[@class="NextPage" and @title="下一頁" and (text()="下一頁")]',
        pageElement: '//div[@id="searchList"]',
    },
    {name: '我們一起成長 | 幸福進化俱樂部共同成長博客圈',
        url: /^http:\/\/upwith\.me\//i,
        exampleUrl: 'http://upwith.me/',
        nextLink: '//div[@class="pagination"]/descendant::a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@class="content"]',
        }
    },
    {name: '知乎日報',
        url: '^http://zhihudaily\\.jd-app\\.com/',
        nextLink: '//h3/a[text()="<<< 前一天"]',
        autopager: {
            pageElement: 'css;body > *',
            separatorReal: false,
        },
        exampleUrl: 'http://zhihudaily.jd-app.com/',
    },

    // ========================= download ===========================
    {name: 'VeryCD搜索頁面',
        url: /http:\/\/www\.verycd\.com\/search\/folders.+/i,
        siteExample: 'http://www.verycd.com/search/folders/',
        nextLink: '//ul[@class="page"]//a[contains(text(),"下一頁")][@href]',
        autopager: {
            pageElement: '//ul[@id="resultsContainer"]',
            replaceE: 'id("page_html")/ul[@class="page"]',
            lazyImgSrc: '_src'
        }
    },
    {name: "VeryCD分類資源頁",
        url: /^http:\/\/www\.verycd\.com\/sto\/.+/i,
        exampleUrl: "http://www.verycd.com/sto/music/page1",
        nextLink: '//div[@class="pages-nav"]/a[text()="下一頁 »"]',
        autopager: {
            pageElement: '//div[@id="content"]/ul',
            lazyImgSrc: 'load-src',
            replaceE: '//div[@class="pages-nav"]'
        }
    },
    {name: 'SimpleCD | 讓被牆變得簡單',
        url: /^http:\/\/www\.simplecd\.me\//i,
        exampleUrl: 'http://www.simplecd.me/search/entry/?query=%E7%81%8C%E7%AF%AE%E9%AB%98%E6%89%8B',
        nextLink: '//td[@class="next"]/a[@class="enabled"]',
        autopager: {
            pageElement: '//div[@class="result-list" or @class="sub-recommend"]/div[@class="content"]',
        }
    },
    {name: '電驢站 愛磁力 iCiLi - 電驢下載站',
        url: /^http:\/\/www\.icili\.com\/emule/i,
        exampleUrl: 'http://www.icili.com/emule',
        nextLink: 'id("main")/div[@class="pager"]/descendant::a[text()=" > "]',
        autopager: {
            pageElement: 'id("main")/ul',
            replaceE: 'id("main")/div[@class="pager"]'
        }
    },
    {name: '射手網',
        url: /^http:\/\/(?:www\.)?shooter\.cn\/search\//i,
        exampleUrl: 'http://www.shooter.cn/search/Elysium/',
        preLink:{
            startAfter:'?page=',
            inc:-1,
            min:1,
        },
        nextLink:{
            startAfter:'?page=',
            mFails:[/^http:\/\/(?:www\.)?shooter\.cn\/search\/[^\/]+/i,'?page=1'],
            inc:1,
        },
        autopager: {
            pageElement: '//div[@id="resultsdiv"]/div[@class="subitem"]',
        }
    },
    {name: "YYeTs 人人影視",
        url: "^http://www\\.yyets\\.com/",
        nextLink: "//div[starts-with(@class, 'pages')]/descendant::a[text()='下一頁'] | //div[@class='pages']//a[@class='cur']/following-sibling::a",
        autopager: {
            pageElement: "//div[@class='box_1 topicList'] | //div[@class='box_4 res_listview' or @class='box_4 bg_eb'] | //ul[@class='u_d_list']/li | //ul[@class='allsearch dashed boxPadd6' or @class='dashed bbs_info_list']",
            replaceE: '//div[@class="pages" or @class="pages clearfix"]',
            separatorReal: false
        }
    },
    {name: 'TTmeiju.Com 您的高清美劇片源下載中心',
        url: /^http:\/\/www\.ttmeiju\.com\//i,
        exampleUrl: 'http://www.ttmeiju.com/meiju/Person.of.Interest.html?page=1',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="seedlistdiv" or @class="contentbox"]/table[@class="seedtable"]',
        }
    },
    {name: '電影天堂',
        url: /^http:\/\/www\.dy2018\.com\//i,
        exampleUrl: 'http://www.dy2018.com/html/gndy/dyzz/index.html',
        nextLink: '//div[@class="x"]/descendant::a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@class="co_area2"]/div[@class="co_content8"]',
        }
    },
    {name: '最新電影 | 龍部落',
        url: /^http:\/\/www\.longbuluo\.com\//i,
        exampleUrl: 'http://www.longbuluo.com/category/movie',
        nextLink: '//div[@class="pagebar"]/a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@class="postlist"]',
            replaceE: "css;.pagebar"
        }
    },
    {name: '高清連續劇 | 一起下載吧',
        url: /^http:\/\/17down\.net\/category/i,
        exampleUrl: 'http://17down.net/category/tv',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("content")/div[starts-with(@class, "entry_box")]',
            replaceE: '//div[@class="pagination"]'
        }
    },
    {name: 'Go下載',
        url: /^http:\/\/goxiazai\.cc\//i,
        exampleUrl: 'http://goxiazai.cc/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("main")/div[@class="post"]',
            replaceE: 'id("pagenavi")'
        }
    },
    {name: '720P電影下載,1080P電影下載,bt藍光電影下載,BT原盤電影下載：BT之家老牌電影下載網站，百萬用戶選擇了這裡',
        url: /^http:\/\/bbs\.1lou\.com\//i,
        exampleUrl: 'http://bbs.1lou.com/forum-index-fid-1183.htm',
        nextLink: '//div[@class="page"]/a[text()="▶"]',
        autopager: {
            pageElement: 'id("threadlist") | id("body")/div/table[@class="post_table"]',
        }
    },
    {name: '很BT電影聯盟',
        url: /^http:\/\/henbt\.com\//i,
        exampleUrl: 'http://henbt.com/',
        nextLink: '//div[@class="pages clear"]/a[@class="nextprev"]',
        autopager: {
            pageElement: 'id("btm")/div[@class="main"]/div[@class="box clear"]',
            separatorReal: false,
        }
    },
    // ================== PT ==============================
    {name: '光華，cmct，chd，皇後，hd86，khdbits，hdsky，hdvnbits，hd-sportbits，tccf，皇後mv，mt，hd4fans，hdhc，發燒友，tlfbits，joyhd，螞蟻pt，清影pt，北郵人，u2',
        url: /^https?:\/\/(?:bt\.upc\.edu|hdcmct|chdbits|open|hd86|khdbits|hdsky|hdvnbits|hd-sportbits|et8|mv\.open|tp\.m-team|www\.hd4fans|www\.hdhc|www\.pt|pt\.eastgame|www\.joyhd|ipv6\.antsoul|ipv4\.antsoul|pt\.hit\.edu|bt\.byr|u2\.dmhy)\.(net|cn|org|com|cd|cc|me|cm)\//i,
        exampleUrl: 'http://hdcmct.org/torrents.php',
        nextLink: '//b[@title="Alt+Pagedown"]/parent::a',
        autopager: {
            pageElement: '//table[@class="torrents"]',
        }
    },
    {name: '葡萄 :: 種子',
        url: /^https:\/\/pt\.sjtu\.edu\.cn\/torrents\.php/i,
        exampleUrl: 'https://pt.sjtu.edu.cn/torrents.php',
        nextLink: '//b[contains(text(), "下一頁")]/parent::a',
        autopager: {
            pageElement: '//table[@class="torrents"]',
        }
    },
    {name: '- HDWinG 高清影音人士的分享樂園',
        url: /^https?:\/\/hdwing\.com\/browse\.php/i,
        exampleUrl: 'http://hdwing.com/browse.php',
        nextLink: '//b[contains(text(), "下頁")]/parent::a',
        autopager: {
            pageElement: '//table[@class="torrents_list"]',
        }
    },
    {name: 'TTG',
        url: /^http:\/\/ttg\.im\/browse\.php/i,
        exampleUrl: 'http://ttg.im/browse.php',
        nextLink: '//b[contains(text(), "下頁")]/parent::a',
        autopager: {
        pageElement: 'id("torrent_table")',
        }
    },
    {name: '麥田',
        url: /^http:\/\/pt\.nwsuaf6\.edu\.cn\/torrents\.php/i,
        exampleUrl: 'http://hdcmct.org/torrents.php',
        nextLink: '//b[contains(text(), "下一頁")]/parent::a[@class="next"]',
        autopager: {
            pageElement: '//table[@class="torrents"]',
        }
    },
    {name: '樂乎網-有樂乎！',
        url: '^http://www\\.ulehu\\.com/',
        nextLink: '//a[@class="a1" and (text()="下一頁")]',
        pageElement: '//body/div[@class="container mt20"]/div[@class="content"]/div[@class="colMain"]/div',
        exampleUrl: 'http://www.ulehu.com/',
    },
    {name: 'HDRoad - 資源區',
        url: /^http:\/\/hdroad\.org\/browse\.php/i,
        exampleUrl: 'http://hdroad.org/browse.php',
        nextLink: '//a[contains(text(), "下一頁")]',
        autopager: {
            pageElement: '//div[@id="torrent-list"]',
        }
    },
    {name: '種子列表-北京交通大學知行PT',
        url: '^http://pt\\.zhixing\\.bjtu\\.edu\\.cn/search/',
        nextLink: '//a[@class="next"]',
        pageElement: '//table[@class="torrenttable"]',
        exampleUrl: 'http://pt.zhixing.bjtu.edu.cn/search/',
    },
    {name: '紫荊站 | ZiJingBT v2 | 種子頁',
        url: /^http:\/\/zijingbt\.njuftp\.org\//i,
        exampleUrl: 'http://zijingbt.njuftp.org/index.html',
        nextLink: '//a[contains(text(), "下一頁")]',
        autopager: {
            pageElement: '//table[@class="torrent_table"]',
        }
    },

    // ========================= bbs、blog ======================
    {name: '天涯論壇_帖子列表',
        url: '^http://bbs\\.tianya\\.cn/list',
        nextLink: '//a[text()="下一頁"]',
        pageElement: '//div[@class="mt5"]',
    },
    {name: '天涯論壇帖子',
        url:/http:\/\/bbs\.tianya\.cn\/.+\.shtml/i,
        siteExample:'http://bbs.tianya.cn/post-feeling-2792523-1.shtml',
        nextLink:'//div[@class="atl-pages"]/descendant::a[text()="下頁"][@href]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@class="atl-main"]',
            lazyImgSrc: 'original',
            filter: function(pages){
                var see_only_uname = unsafeWindow.see_only_uname;
                var setOnlyUser = unsafeWindow.setOnlyUser;
                if(see_only_uname){
                    setOnlyUser(see_only_uname);
                }
            }
        }
    },
    {name: 'mozest社區',
        url: /^https?:\/\/g\.mozest\.com/i,
        nextLink: '//div[@class="pages"]//a[@class="next"]',
        autopager: {
            pageElement: '//div[@id="threadlist"] | //div[@id="postlist"]',
            useiframe: true,
            replaceE: 'css;.pages_btns > .pages'
        }
    },
    {name: 'Firefox中文社區 - 列表',
        url: /^https?:\/\/www\.firefox\.net\.cn\/thread/i,
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;#J_posts_list',
            replaceE: 'css;.pages',
            useiframe: true
        }
    },
    {name: 'Firefox中文社區 - 帖子',
        url: /^https?:\/\/www\.firefox\.net\.cn\/read/i,
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.floor.cc.J_read_floor',
            useiframe: true,
            newIframe: true
        }
    },
    {name: 'Mozilla Addons - 用戶信息',
        url: /^https:\/\/addons\.mozilla\.org\/zh-CN\/[^\/]+\/user\//i,
        exampleUrl: 'https://addons.mozilla.org/zh-CN/firefox/user/Vasiliy_Temnikov/',
        nextLink: '//p[@class="rel"]/a[@class="button next"]',
        autopager: {
            pageElement: 'id("my-addons")',
            relatedObj: true,
        }
    },
    {name: 'Mozilla Addons',
        url: /^https?:\/\/addons\.mozilla\.org\/[^\/]+\/firefox/i,
        siteExample: 'https://addons.mozilla.org/zh-CN/firefox/',
        nextLink: '//p[@class="rel"]/a[@class="button next"][@href] | //ol[@class="pagination"]/li/a[@rel="next"][@href]',
        autopager: {

            pageElement: '//div[@id="pjax-results" or @class="separated-listing"]/div[@class="items"] | //section[@class="primary"]/div/div[@class="items"] | //ul[@class="personas-grid"] | //div[@id="my-addons"] | //div[@id="reviews"]',
            relatedObj: true,
            replaceE: 'css;.paginator'
        }
    },
    {name: '搜索 | Mozilla 技術支持',
        url: '^https://support\\.mozilla\\.org/zh-CN/search\\?',
        exampleUrl: 'https://support.mozilla.org/zh-CN/search?esab=a&product=firefox&q=%E7%BE%A4%E7%BB%84',
        nextLink: '//a[@class="btn-page btn-page-next" and contains(text(),"下一個")]',
        autopager: {
            pageElement: '//div[@id="search-results"]/div[@class="grid_9"]/div[@class="content-box"]',
        }
    },
    {name: '傲游瀏覽器-插件中心',
        url: "^http://extension\\.maxthon\\.cn/",
        nextLink: '//div[@class="pages page-right"]/a[text()=">"]',
        pageElement: '//ul[@id="delegate-all"]'
    },
    {name: "小米手機官方論壇",
        url: "^http://bbs\\.xiaomi\\.cn/",
        nextLink: "//a[@class='nxt' and (text()='下一頁')]",
        autopager: {
            pageElement: "id('postlist') | id('threadlist')",
            replaceE: '//div[@class="pg"][child::a[@class="nxt"]]',
            documentFilter: function(doc) {
                var firstDiv = doc.querySelector("div[id^='post_']");
                if (firstDiv) {
                    firstDiv.parentNode.removeChild(firstDiv);
                }
            }
        }
    },
    {name: '棋友家園',
        url: /^http:\/\/www\.weiqitv\.com\/home\/forum/i,
        exampleUrl: 'http://www.weiqitv.com/home/forum.php?mod=viewthread&tid=1623&extra=&page=1',
        nextLink: '//div[@class="pg"]/a[@class="nxt"]',
        autopager: {
            pageElement: 'id("threadlisttableid") | id("postlist")',
            useiframe: true,
        }
    },
    {name: 'Discuz X2.5修復',
        url:/^http?:\/\/(bbs.gfan|bbs.xda|bbs.weiphone|bbs.feng|www.weiqitv|www.diypda|f.ppxclub|bbs.sd001|bbs.itiankong)\.(com|cn)/i,
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@id="threadlist"] | //div[@id="postlist"]',
            replaceE: '//div[@class="pg"][child::a[@class="nxt"]]',
        }
    },
    {name: '威鋒論壇搜索',
        url: /^http:\/\/s\.feng\.com\/f\?srchtxt=/i,
        nextLink: '//div[@class="pages"]/a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@id="searchresult"]',
            replaceE: '//div[@class="pages"]'
        }
    },
    {name: 'Discuz 頁面跳轉修復',
        url:/^http:\/\/(bbs.pcbeta|bbs.besgold|www.pt80)\.(com|net)/i,
        nextLink:'//div[@class="pg"]/descendant::a[@class="nxt"]',
        autopager:{
            pageElement:'//div[@id="postlist"] | //form[@id="moderate"]',
            replaceE: '//div[@class="pg"][child::a[@class="nxt"]]',
        }
    },
    {name: 'vBulletin論壇 加加/看雪/XDA',
        url:/http:\/\/(bbs|forum)\.(jjol|pediy|xda-developers)\.(cn|com)\/(forumdisplay|showthread)/i,
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@id="posts"]/div[@align="center"] | //table[@class="tborder"][@id="threadslist"]',
        }
    },
    {name: 'xda-developers',
        url: "^http://forum\\.xda-developers\\.com/",
        nextLink: "//td[@class='alt1']/a[@rel='next']",
        autopager: {
            pageElement: "//table[@id='threadslist'] | //div[@id='posts']",
            replaceE: "//div[@class='pagenav']/table[@class='pagenavControls']",
            separatorReal: false
        }
    },
    {name: '玩機圈',
        url: /^http:\/\/www\.wanjiquan\.com\//i,
        exampleUrl: 'http://www.wanjiquan.com/forum-169-1.html',
        nextLink: 'css;.ma_tiezi_list_page > .next',
        autopager: {
            pageElement: '//form[@id="moderate"] | id("postlist")',
        }
    },
    {name: '極限社區',
        url: '^http://bbs\\.themex\\.net/',
        nextLink: '//a[@rel="next"]',
        pageElement: 'id("threadslist posts")',
    },
    {name: '天壇',
        url:/http:\/\/bbs\.waptw\.com/i,
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@id="content"]',
        }
    },
    {name: '鐵血社區',
        url:/^http:\/\/bbs\.tiexue\.net\/.*\.html$/i,
        nextLink:'//div[@class="pages"]/span/a[text()=">>"]',
        autopager:{
            pageElement:'//div[@class="posts_list"]',
        }
    },
    {name: '鐵血網',
        url:/http:\/\/[a-z]+\.tiexue\.net/i,
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@class="fontListBox"]',
        }
    },
    {name: '霏凡論壇 - 帖子列表',
        url:/http:\/\/bbs\.crsky\.com\/read\.php/i,
        nextLink:'//div[@class="pages"]//a[text()=">"]',
        autopager:{
            // useiframe:true,
            pageElement:'//div[@class="t5 t2"]',
        }
    },
    {name: '虎撲籃球論壇',
        url: /^http:\/\/bbs\.hupu\.com\//i,
        exampleUrl: 'http://bbs.hupu.com/8173461.html',
        nextLink: 'id("j_next")',
        autopager: {
            pageElement: '//div[@id="t_main"]/div[@class="floor"] | //table[@id="pl"]',
            replaceE: 'css;.page'
        }
    },
    {name: '人大經濟論壇',
        url:/http:\/\/bbs\.pinggu\.org\/thread/i,
        siteExample:'http://bbs.pinggu.org/thread-1562552-3-1.html',
        nextLink:'//div[@id="pgt"]/descendant::a[@class="nxt"]',
        autopager:{
            pageElement:'//div[@id="postlist"]',
        }
    },
    {name: '九尾網',
        url:/joowii\.com\/arc/i,
        siteExample:'http://www.joowii.com/arc/ysyl/ssgx/2012/0905/125571.html',
        nextLink:'auto;',
        autopager:{
            useiframe:true,
            pageElement:'//div[@class="article"]',
        }
    },
    {name: '17173.com中國游戲第一門戶站',
        url: '^http://news\\.17173\\.com/content/.*\\.shtml',
        nextLink: '//a[@class="page-next"]',
        pageElement: '//div[@id="matterc"]',
    },
    {name: '游俠網',
        url: /^http:\/\/(?:www|down)\.ali213\.net\//i,
        exampleUrl: 'http://www.ali213.net/news/html/2013-12/91377.html',
        nextLink: 'auto;',
        // nextLink: '//a[@id="after_this_page"][@href] | //div[@class="p_bar"]/a[text()="下頁"] | //div[@class="list_body_page"]/a[@title="下一頁"]',
        autopager: {
            pageElement: '//div[@id="Content" or @id="game_content" or @id="rqjxhb"]',
            relatedObj: true,
            lazyImgSrc: 'data-original'
        }
    },
    {name: '游民星空',
        url:/http:\/\/www\.gamersky\.com/i,
        siteExample:'http://www.gamersky.com/news/201207/206490.shtml',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@class="act mid"]',
            relatedObj: true
        }
    },
    {name: '3DMGAME',
        url:/http:\/\/www\.3dmgame\.com\/.*\.html/i,
        siteExample:'http://www.3dmgame.com/news/201312/2310792.html',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@class="QZmainL"]/div/div[contains(@class, "con")]',
            relatedObj: true,
        }
    },
    {name: '猴島論壇',
        url:/^http:\/\/bbs\.houdao\.com/i,
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@class="z threadCommon"] | //div[@class="mb10 bodd"]',
        }
    },
    {name: '178 魔獸世界、178動漫頻道',
        url: /^http:\/\/[a-z]+\.178\.com\/.*\.html/i,
        exampleUrl: 'http://wow.178.com/201308/170546277543.html',
        nextLink: 'id("cms_page_next")',
        autopager: {
            pageElement: '//div[@id="text"]',
            replaceE: '//div[@class="page"]',
            relatedObj: true
        }
    },
    {name: '阡陌居',
        url:/http:\/\/www\.1000qm\.com\/(?:thread\.php\?fid\-\d+|read\.php\?tid\-\d+)\.html/i,
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@class="z threadCommon"] | //div[@id="pw_content"][@class="mb10"]',
        }
    },
    {name: '煎蛋首頁',
        url:/http:\/\/jandan\.net\/(?:page)?/i,
        siteExample:'http://jandan.net/',
        useiframe:true,
        nextLink:'//div[@class="wp-pagenavi"]/child::a[text()=">"] | //p[@class="cp-pagenavi"]/a[text()="»"]',
        autopager:{
           pageElement:'//div[@id="content"] | id("comments")'
        }
    },
    {name: '蜂鳥網',
        url:/http:\/\/qicai\.fengniao\.com\/\d+\/\d+.html/i,
        siteExample:'http://qicai.fengniao.com/370/3705137.html',
        useiframe:true,
        nextLink:'auto;',
        autopager:{
            remain:1/3,
            relatedObj:['css;div.page_num','bottom'],
            pageElement:'//div[@class="article"]',
        }
    },
    {name: '55188論壇',
        url:/http:\/\/www\.55188\.com/i,
        siteExample:'http://www.55188.com/forum-8-1.html',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@class="mainbox threadlist"] | //div[@class="mainbox viewthread"]',
        }
    },
    {name: 'PCHOME 社區',
        url:/http:\/\/club\.pchome\.net/i,
        siteExample:'http://club.pchome.net/forum_1_15.html#',
        nextLink:'auto;',
        autopager:{
             pageElement:'//form[@id="mytopics"] | //div[@id="weibo_app"]',
        }
    },
    {name: 'pconline',
        url: '^http://[a-z]+\\.pconline\\.com\\.cn/',
        nextLink: '//div[contains(@class, "pconline_page") or contains(@class, "pager")]/a[@class="next"]',
        autopager: {
            pageElement: '//div[@id="article"]//div[@class="content"] | //ul[@id="ulHoverPic"] | //table[@class="posts"] | id("post_list") | id("topicList")',
            relatedObj: true,
            replaceE: 'css;.pconline_page',
        },
        exampleUrl: 'http://diy.pconline.com.cn/377/3774616.html',
    },
    {name: 'Chiphell',
        url: /^http:\/\/www\.chiphell\.com\/(?!forum)/i,
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("ct")/div[@class="mn"]/div[@class="bm"]/div[@class="bm_c xld"] | id("article_content")/../..',
            replaceE: '//div[@class="pg"]',
        }
    },
    {name: '糗事百科',
        url: '^http://www\\.qiushibaike\\.com/',
        nextLink: '//a[@class="next" and @title="下一頁"]',
        autopager: {
            pageElement: '//div[@class="main"]/div[contains(@class, "content-block")]/div[@class="col1"]',
            stylish: '.sp-separator { width: 620px !important; }'
        }
    },
    {name: '抽屜新熱榜',
        url: /^http:\/\/dig\.chouti\.com\//i,
        nextLink: '//a[@class="ct_page_edge" and (text()="下一頁")]',
        autopager: {
            pageElement: '//div[@id="content-list"]',
            lazyImgSrc: 'original',
            filter: function(pages){
                var chouti = unsafeWindow.chouti;
                var NS_links_comment_top = unsafeWindow.NS_links_comment_top;
                chouti.vote();
                chouti.addCollect();
                chouti.shareweibo();
                chouti.playVido();
                NS_links_comment_top.init();
            }
        }
    },
    {name: '貓撲大雜燴帖子',
        url:/http:\/\/dzh\.mop\.com\/topic\/readSub/i,
        nextLink:'//a[contains(text(),"下一頁")][@href]',
        autopager:{
            pageElement:'//div[@class="huitie"]',
        }
    },
    {name: '貓撲數碼、貓撲汽車等',
        url: /^http:\/\/(?!dzh).*\.mop\.com\/.*\.shtml/i,
        exampleUrl: 'http://digi.mop.com/sjsj/140522002176016.shtml',
        nextLink: 'id("nextp") | id("page_use")/a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@id="article"] | //div[@class="content"]/div[@class="inner"]/div[@class="nr_con"]',
                replaceE: '//div[@class="page"]',
            relatedObj: true,
        }
    },
    {name: '色影無忌帖子',
        url:/http:\/\/forum\.xitek\.com\/showthread/i,
        siteExample:'http://forum.xitek.com/showthread.php?threadid=571986',
        nextLink:'//font[@size="2"]/font[@class="thtcolor"]/following-sibling::a[@href]',
        autopager:{
            pageElement:'//body/table[position()>2 and position()<(last()-2)]',
        }
    },
    {name: '19樓帖子',
        url:/^http:\/\/www\.19lou\.com/i,
        siteExample:'http://www.19lou.com/forum-1502-thread-29762777-1-1.html',
        nextLink:'auto;',
        useiframe:true,
        autopager:{
            useiframe:true,
            pageElement:'//form[@name="postForm"] | //form[@name="manageForm"]',
        }
    },
    {name: 'blogspot',
        url: '^http://[^./]+\\.(blogspot|playpcesor)(?:\\.[^./]{2,3}){1,2}/(?!\\d{4}/)',
        exampleUrl: 'http://program-think.blogspot.com/  http://www.playpcesor.com/',
        nextLink: '//a[contains(concat(" ", @class, " "), " blog-pager-older-link ")]',
        autopager: {
            pageElement: '//div[contains(concat(" ", @class, " "), " hfeed ") or contains(concat(" ", @class, " "), " blog-posts ")] | id("Blog1")/div[contains(concat(" ", @class, " "), " entry ")]',
            relatedObj: true,
            replaceE: "css;#blog-pager"            }
    },
    {name: '北海365網',
        url: /^http:\/\/[a-z]+\.beihai365\.com\//i,
        exampleUrl: 'http://kj.beihai365.com/',
        nextLink: '//div[@class="pages"]/*[contains(concat(" ",normalize-space(@class)," "), " active ")]/following-sibling::a[1]',
        autopager: {
            pageElement: 'id("threadlist")/tr[@class="tr3"] | id("pw_content")//form[@method="post" and @name="delatc"]',
            replaceE: '//div[@class="pages"]',
        }
    },
    {name: 'gelbooru, safebooru etc',
        url: '^http://(?:www\\.)?\\w{3,4}booru\\.(?:com|org)',
        nextLink: 'id("paginator")//b/following-sibling::a[1]',
        pageElement: 'id("post-list")/div[@class="content"]//span[contains(@class,"thumb")]|id("content")/table',
        exampleUrl: 'http://gelbooru.com/index.php?page=post&s=list http://safebooru.org/index.php?page=post&s=list&tags=all http://safebooru.org/index.php?page=tags&s=list'
    },
    {name: '耳機大家壇 全球最大中文耳機論壇',
        url: /^http:\/\/www\.erji\.net\//i,
        exampleUrl: 'http://www.erji.net/thread.php?fid=138',
        nextLink: '//div[starts-with(@class,"pages")]/b[1]/following-sibling::a[1][not(@class)]',
        autopager: {
            pageElement: '//table[@id="ajaxtable"] | //div[@id="main"]/form[@method="post"]',
            replaceE: '//div[@class="pages"]'
        }
    },
    {name: '艾澤拉斯國家地理論壇',
        url: /^http:\/\/(?:bbs\.ngacn\.cc|nga\.178\.com)\//i,
        exampleUrl: 'http://bbs.ngacn.cc/thread.php?fid=390&rand=183',
        nextLink: '//a[@title="下一頁"][@href]',
        autopager: {
            pageElement: 'id("topicrows") | id("m_posts_c")',
            useiframe: true,
            separatorReal: false,
        }
    },
    {name: 'Final Fantasy Shrine Forums',
        url: /^http:\/\/forums\.ffshrine\.org\//i,
        exampleUrl: 'http://forums.ffshrine.org/general-discussion/',
        nextLink: '//a[@rel="next"][@href]',
        autopager: {
            pageElement: 'id("thread_inlinemod_form") | id("postlist")',
        }
    },
    {name: '天貓魔盒論壇',
        url: '^http://www\\.znds\\.com/*',
        nextLink: '//a[contains(text(), "下一頁")]',
        pageElement: 'id("threadlist")/div[@class="bm_c"]',
        exampleUrl: 'http://www.znds.com/bbs-172-3.html',
    },
    {name: 'Mobile01',
        url: /^http:\/\/www\.mobile01\.com\/topicdetail\.php.*$/i,
        exampleUrl: 'http://www.mobile01.com/topicdetail.php?f=254&t=3966939',
        nextLink: '//a[contains(text(), "下一頁")]',
        autopager: {
            pageElement: 'id("section")/div[@class="main"]/div[@class="forum-content"]',
        }
    },
    {name: '昆侖 - 資源/連載',
        url: '^http://bbs\\.ikunlun\\.net/forum\\.php.*$',
        nextLink: '//a[@class="now"]/following-sibling::a[1][not(@class="last") ]',
        pageElement: '//tr[@class="topic_list_row"]',
    },

    // ========================= picture ================================================
    {name: 'Flickr搜索',
        url:/http:\/\/www\.flickr\.com\/search\/\?q=/i,
        siteExample:'http://www.flickr.com/search/?q=opera',
        nextLink:'//div[@class="Paginator"]/a[@class="Next"][@href]',
        autopager:{
            pageElement:'//div[@id="ResultsThumbsDiv"]',
            replaceE:'//div[@class="Paginator"]',
        }
    },
    {name: 'Flickr photos',
        "url": "^http://www\\.flickr\\.com/photos/[^/]+/favorites(?:[/?#]|$)",
        "nextLink": "id(\"paginator-module\")/descendant::a[contains(concat(\" \", @class, \" \"), \" Next \")]",
        "pageElement": "id(\"faves\")",
        "insertBefore": "//div[@class=\"Pages\"]"
    },
    {name: 'pixiv',
        url:/http:\/\/www\.pixiv\.net\//i,
        siteExample:'http://www.pixiv.net/search.php?s_mode=s_tag_full&word=%E8%85%90 or http://www.pixiv.net/novel/ranking.php',
        nextLink:'//*[@class="next"]/a[@rel="next"][@href]',
        autopager:{
            pageElement:'//ul[contains(@class, "autopagerize_page_element")] | //section[contains(@class, "autopagerize-page-element")] | //div[@class="column-content"]/ul[contains(@class, "tag-list")]',
            relatedObj: true,
            replaceE: 'css;.pager-container > .page-list'
        }
    },
    {name: '照片處理網',
        url:/http:\/\/www\.photops\.com\/Article\/.+/i,
        siteExample:'http://www.photops.com/Article/xsjc/20100728172116.html',
        nextLink:'//a[text()="下一頁"][@href]',
        autopager:{
            pageElement:'//body/table[last()-2]',
            useiframe:true,
        }
    },
    {name: '撲家漢化平台',
        url:/^http:\/\/www\.pujiahh\.com\/library/i,
        siteExample:'http://www.pujiahh.com/library/',
        nextLink:'//div[@class="pagination"]/ul/li[@class="next-posts"]/a',
        autopager:{
            pageElement:'//div[@class="gametable"]/parent::div',
            replaceE: '//div[@class="pagination"]'
        }
    },
    // === art
    {name: 'deviantART Gallery',
        url: /^https?:\/\/\w+\.deviantart\.com\/gallery\//i,
        exampleUrl: 'https://razielmb.deviantart.com/gallery/',
        nextLink: '//li[@class="next"]/a',
        autopager: {
            pageElement: 'css;#gmi-ResourceStream',
            relatedObj: true
        }
    },
    // === mm ===
    {name: 'Show妹子',
        url:/^http:\/\/www\.showmeizi\.com\/\w+\/\d+/i,
        siteExample:'http://www.showmeizi.com/',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@class="post image"]/div[@class="main-body"]',
        }
    },
    {name: 'Beautyleg腿模寫真圖片網',
        url:/^http:\/\/www\.beautylegmm\.com\/\w+\/beautyleg-\d+.html/i,
        siteExample:'http://www.beautylegmm.com/x/beautyleg-x.html',
        nextLink:'auto;',
        autopager:{
            pageElement:'id("contents_post")/div[@class="post"]',
        }
    },
    {name: 'Rosi美女圖',
        url:/^http:\/\/www\.rosiyy\.com\/.*.html/i,
        siteExample:'http://www.rosiyy.com/x/x.html',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@class="clearfix"]/div[@class="grid_10"]/div[@class="post postimg"]/p/a',
        }
    },
    {name: '7160美女圖片',
        url: '^http://www\\.7160\\.com/*/*/',
        nextLink: '//a[text()="下一頁"]',
        pageElement: 'id("arc")/div/div/div/a/img',
        exampleUrl: 'http://www.7160.com/meinv/11988/',
    },
    {name: '七麗麗圖庫|7lili.com',
        url: '^http://www\\.7lili\\.com/.+/.+/.+/.+\\.html',
        nextLink: '//a[text()="下一頁"]',
        pageElement: '//div/div/div/a/img',
        exampleUrl: 'http://www.7lili.com/p/xinggan/201403/30333.html',
    },
    {name: '極品妹妹吧',
        url: '^http://www\\.jpmm8\\.com/html/*/',
        nextLink: '//a[text()="下一頁"]',
        pageElement: '//div/div/div/a/img',
        exampleUrl: 'http://www.jpmm8.com/html/wlmm/12163.html',
    },
    {name: '明星網',
        url: '^http://tuku\\.mingxing\\.com/*',
        nextLink: '//a[@title="下一頁"]',
        pageElement: '//div/div/div/div/p/a/img',
        exampleUrl: 'http://tuku.mingxing.com/xiezhen/30820/1.html',
    },
    {name: 'kds模特大本營',
        url: '^http://model\\.kdslife\\.com/show/photo/*',
        nextLink: '//a[contains(text(), "下一張")]',
        pageElement: 'id("mainPic")',
        exampleUrl: 'http://model.kdslife.com/show/photo/20256.html',
    },
    // === 壁紙、素材、icon
    {name: '桌酷壁紙',
        url: /^http:\/\/www\.zhuoku\.com\/.*\.htm/i,
        exampleUrl: 'http://www.zhuoku.com/zhuomianbizhi/computer-kuan/20140107052306.htm',
        nextLink: '//div[@class="turn"]/a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("liebiao")',
        }
    },
    {name: '統一壁紙站',
        url: '^http://www\\.3987\\.com/desk/wall/*',
        nextLink: '//a[@hidefocus="true" and @target="_self" and @title="下一頁"]',
        pageElement: 'id("Article")/div[@class="big-pic"]',
        exampleUrl: 'http://www.3987.com/desk/wall/31420.html',
    },
    {name: '素材天下',
        url: /^http:\/\/www\.sucaitianxia\.com\//i,
        exampleUrl: 'http://www.sucaitianxia.com/psd/Index.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="home_19"]/div[@class="left"]/div[@class="mid"]',
        }
    },
    {name: '暱圖網',
        url: /^http:\/\/[a-z]+\.nipic\.com\//i,
        exampleUrl: 'http://soso.nipic.com/search.aspx?t=tk&q=%B7%E2%C3%E6',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("bd") | //ul[@class="search-result-box clearfix"] | //center/table[@width="900" and @cellspacing="0" and @cellpadding="0" and @border="0"]',
            lazyImgSrc: "data-original",
            stylish: '.lazy { display: block; }'
        }
    },
    {name: 'easyicon.net',
        url: '^http://www\\.easyicon\\.net/iconsearch/',
        nextLink: '//div[@class="pages_all"]/a[text()="下一頁>"]',
        pageElement: 'id("result_right_layout")',
        exampleUrl: 'http://www.easyicon.net/iconsearch/feed/&color=black',
    },
    {name: 'iconarchive',
        url: '^http://www\\.iconarchive\\.com/search\\?q=*',
        nextLink: '//div[@class="pagination"]/a[@class="next"]',
        pageElement: 'id("layout-search-content")',
        exampleUrl: 'http://www.iconarchive.com/search?q=pin',
    },
    {name: 'Find Icons',
        url: '^http://findicons\\.com/search/',
        nextLink: '//div[@class="pages"]/a[contains(text(), "Next") or contains(text(), "下一頁")]',
        pageElement: 'id("search_con")/div[@class="icon_list icon_list_165"]',
        exampleUrl: 'http://findicons.com/search/earth',
    },

    // ========================= software ================================
    {name: '小眾軟件',
        url: 'http://www\\.appinn\\.com/',
        nextLink: '//a[@class="nextpostslink"]',
        pageElement: '//div[@id="spost"]',
    },
    {name: '善用佳軟',
        url: /^http:\/\/xbeta\.info\/page\//i,
        exampleUrl: 'http://xbeta.info/page/2',
        nextLink: '//div[@class="wp-pagenavi"]/a[@class="nextpostslink"]',
        autopager: {
            pageElement: 'id("entries-in")/div[@class="post"]',
            replaceE: "css;#entries-in > .wp-pagenavi"
        }
    },
    {name: '異次元軟件世界',
        url: /^http:\/\/www\.iplaysoft\.com\//i,
        exampleUrl: 'http://www.iplaysoft.com/tag/%E5%90%8C%E6%AD%A5',
        nextLink: '//span[@class="pagenavi_c"]/a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("postlist")/div[@class="entry"]',
            replaceE: '//div[@class="pagenavi"]/span[@class="pagenavi_c"]'
        }
    },
    {name: 'PlayNext - 低調的異次元',
        url: '^http://www\\.playnext\\.cn/',
        nextLink: '//div[@class="pagenavi"]/a[contains(text(), "下一頁")]',
        pageElement: '//div[@id="container"]/div[@class="content"]/div[@class="post-list"]',
    },
    {name: 'iPc.me - 與你分享互聯網的精彩！',
        url: '^http://www\\.ipc\\.me/',
        nextLink: '//div[@class="pagenavi"]/a[contains(text(), "下一頁")]',
        pageElement: 'id("posts-list")',
    },
    {name: '獨木成林',
        url: '^http://www\\.guofs\\.com/',
        nextLink: '//a[@class="nextpostslink"]',
        pageElement: 'id("content")',
        exampleUrl: 'http://www.guofs.com/',
    },
    {name: '軟件淘',
        url: '^http://www\\.65052424\\.com/',
        nextLink: '//a[@class="next"]',
        pageElement: '//div[@id="content"]',
        exampleUrl: 'http://www.65052424.com/page/7',
    },
    {name: 'portableapps',
        url: '^http://portableapps\\.com/(?:forums|node)/',
        nextLink: '//li[@class="pager-next"]/a',
        pageElement: 'id("forum")/table|id("comments")/*[not(@class="item-list")]'
    },
    {name: 'PortableAppC - 有中國特色的便攜軟件',
        url: /^http:\/\/www\.portableappc\.com\//i,
        exampleUrl: 'http://www.portableappc.com/',
        nextLink: '//a[@class="nextpostslink"]',
        autopager: {
            pageElement: 'id("main")/div[@class="box"]',
            replaceE: '//div[@class="wp-pagenavi"]'
        }
    },
    {name: '精品綠色便攜軟件',
        url: '^http://www\\.portablesoft\\.org/',
        nextLink: '//div[@class="pagination"]/a[text()="下頁 ›"]',
        pageElement: 'id("main")/div[@class="post-entry"]'
    },
    {name: 'zd423',
        url: /^http:\/\/www\.zdfans\.com\//i,
        exampleUrl: 'http://www.zdfans.com/',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'css;.content.column2 .excerpt',
            HT_insert: ['css;.paging', 1],
            //useiframe: true,
        }
    },
    {name: '軟件閣 - 原創綠色軟件更新,精品軟件共享',
        url: /^http:\/\/www\.lite6\.com\//i,
        exampleUrl: 'http://www.lite6.com/',
        nextLink: '//li[@class="next"]/a',
        autopager: {
            pageElement: '//div[@class="main"]/div[@class="left"]',
        }
    },
    {name: 'Yanu | 分享優秀、純淨、綠色、實用的精品軟件',
        url: '^http://www\\.ccav1\\.com/*',
        nextLink: 'id("content-list")/div[@class="pagination"]/a[text()="下頁"]',
        pageElement: '//div[@id="content-list"]',
        exampleUrl: 'http://www.ccav1.com/',
    },
    {name: '綠軟家園(綠色下載站)',
        url: /^http:\/\/www\.downg\.com\/.*\.html/i,
        exampleUrl: 'http://www.downg.com/list/r_1_1.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="cp top-list" or @class="cp software-list"]/div[@class="cp-main"]',
        }
    },
    {name: '綠色下載吧',
        url: /^http:\/\/www\.xiazaiba\.com\//,
        exampleUrl: 'http://www.xiazaiba.com/newsoft.html',
        nextLink: '//div[@class="page-num" or @class="ylmf-page"]/a[@class="nextprev"]',
        autopager: {
            pageElement: 'id("j_soft_list") | //ul[@class="list-soft list-soft-title j-hover"]',
        }
    },
    {name: '下載銀行',
        url: /^http:\/\/www\.downbank\.cn\/.*\.htm/i,
        exampleUrl: 'http://www.downbank.cn/soft/html/newlist-1.htm',
        nextLink: '//p[@class="list_page"]/a[text()="下一頁"] | id("NextPageText")//a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@id="topiclistzone"] | id("content")/div[@class="listitem"]/div[@class="cp-main"]',
        }
    },
    {name: '小路工作室',
        url: /^http:\/\/www\.wzlu\.cc\/.*\.html/i,
        exampleUrl: 'http://www.wzlu.cc/soft/html/newlist-1.html',
        nextLink: '//p[@class="list_page"]/a[text()="下一頁"] | id("NextPageText")//a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("topiclistzone") | id("listbox")',
        }
    },
    {name: '心海e站',
        url: /^http:\/\/hrtsea\.com\//i,
        exampleUrl: 'http://hrtsea.com/',
        nextLink: 'id("pagenavi")/span[@class="older"]/a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("main")',
        }
    },
    {name: '天天資源網',
        url: /^http:\/\/www\.ttrar\.com\//i,
        exampleUrl: 'http://www.ttrar.com/',
        nextLink: '//div[@id="page"]/a[text()="..."] | //div[@class="page"]/a[text()="下一頁"]',
        autopager: {
            pageElement: '//ul[@class="articlelist-ul"]',
            replaceE: "css;#page, .page"
        }
    },
    {name: '天天軟件',
        url: /^http:\/\/www\.tt7z\.com\//i,
        nextLink: 'auto;',
        autopager: {
            pageElement: '//ul[@class="articlelist-ul"]',
            replaceE: '//div[@id="left_content_list"]/div[@class="page"]'
        }
    },
    {name: 'Sublime text - Packages',
        url: '^https://sublime\\.wbond\\.net/browse',
        nextLink: '//nav[@class="pagination"]/a[@class="selected"]/following::a[1]',
        pageElement: '//div[@id="content"]/div[@class="results"]/ul[@class="packages results"]',
    },

    // ========================= dev =================================
    {name: 'User Scripts',
        url: /^https?:\/\/userscripts\.org/i,
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("review-list") | //tr[starts-with(@id, "scripts-")] | //tr[starts-with(@id, "posts-")]',
            replaceE: '//div[@class="pagination"]'
        }
    },
    {name: 'User scripts on Greasy Fork',
        url: /^https:\/\/greasyfork\.org/i,
        nextLink: '//a[@rel="next"]',
        autopager: {
            pageElement: 'id("browse-script-list") | id("Content")/ul',
        }
    },
    {name: 'User Styles',
        url: /^https?:\/\/(?:forum\.)?userstyles\.org\//i,
        nextLink: ['//a[@class="Next" and text()="›"]', 'auto;'],
        autopager: {
            pageElement: '//article[starts-with(@class,"style-brief")] | id("Content")/ul[@class="DataList Discussions"]',
            replaceE: 'css;.pagination'
        }
    },
    {name: '博客園',
        url: '^http://www\\.cnblogs\\.com/.*$',
        nextLink: '//a[(text()="Next >")]',
        pageElement: '//div[@id="post_list"]',
        exampleUrl: 'http://www.cnblogs.com/cate/javascript/',
    },
    {name: '開源中國',
        url: '^http://\\w+\\.oschina\\.net/',
        nextLink: '//li[@class="page next"]/a',
        pageElement: '//div[@class="code_list"]/ul | //div[@class="ProjectList"]/ul[@class="List"] | id("OSC_Content")/div[@class="SpaceList BlogList"]/ul | \
            id("OSC_Content")/div[@class="QuestionList"]/ul/li[@class="question"]',
    },
    {name: 'CSDN博客',
        url:/http:\/\/blog\.csdn\.net/i,
        siteExample:'http://blog.csdn.net/wangjieest?viewmode=list',
        nextLink:'//div[@id="papelist"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="article_list"]'
        }
    },
    {name: 'CSDN論壇',
        url:/^http:\/\/bbs\.csdn\.net\/forums\//i,
        siteExample:'http://bbs.csdn.net/forums/Qt',
        nextLink:'//div[@class="page_nav"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//body/div/div[@class="content"]/table',
            replaceE:'//div[@class="page_nav"]',
        }
    },
    {name: 'CSDN話題',
        url:/^http:\/\/bbs\.csdn\.net\/topics\//i,
        siteExample:'http://bbs.csdn.net/topics/390244325',
        nextLink:'//div[@class="control_area"]/descendant::a[@class="next"]',
        autopager:{
            pageElement:'//div[@class="detailed"]',
            replaceE:'//div[@class="control_area"]',
        }
    },
    {name: '51CTO',
        url:/^http:\/\/\w+\.51cto\.com\/\w+\/\d+\/\w+\.htm/i,
        siteExample:'http://developer.51cto.com/art/201007/214478.htm',
        nextLink:'auto;',
        autopager:{
            useiframe:false,
            relatedObj:['css;#content','bottom'],
            pageElement:'css;#content>p'
        }
    },
    {name: '圖靈社區 : 圖書',
        url: '^http://www\\.ituring\\.com\\.cn/article/',
        nextLink: 'auto;',
        pageElement: '//div[@id="question-header"]/h1 | //div[@class="post-text"]',
        separatorReal: false
    },
    {name: "Stack Overflow, Super User, Server Fault, Stack Apps",
        url: "^http://(?:meta\\.)?(?:s(?:erverfault|tackoverflow|uperuser|tackapps)|\\w+\\.stackexchange|askubuntu)\\.com/",
        nextLink: '//a[@rel="next"]',
        pageElement: "id(\"mainbar questions\")//div[contains(concat(\" \",@class,\" \"),\" question-summary \")]|id(\"answers\")/div[@class=\"pager-answers\"][1]/following-sibling::*[./following-sibling::div[@class=\"pager-answers\"]]",
    },

    // ========================= novel =============================
    {name: '起點文學',
        url:/^http:\/\/(www|read)\.(qidian|qdmm|qdwenxue)\.com\/BookReader\/\d+,\d+/i,
        siteExample:'http://www.qidian.com/BookReader/1545376,27301383.aspx',
        useiframe:true,
        nextLink:'//a[@id="NextLink"]',
        autopager:{
            enable:true,
            useiframe:true,
            pageElement:'//div[@id="maincontent"]/div[@class="booktitle"] | //div[@id="maincontent"]/div[@id="content"]'
        }
    },
    {name: '逐浪小說',
        url:/^http:\/\/book\.zhulang\.com\/.+\.html/i,
        siteExample:'http://book.zhulang.com/153319/62230.html',
        nextLink:'//div[@class="readpage_leftnfy"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@class="readpage_leftntxt"]',
        }
    },
    {name: '煙雨紅塵',
        url:/^http:\/\/www\.cc222\.com\/chapter\/.+\.html/i,
        siteExample:'http://www.cc222.com/chapter/558139.html',
        nextLink:'//div[@id="paging"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="aContainer"]',
            remain:1/5,
        }
    },
    {name: '17k',
        url:/^http:\/\/(mm.17k|www.17k)\.com\/chapter\/.+\.html/i,
        siteExample:'http://www.17k.com/chapter/143095/3714822.html',
        nextLink:'//div[@class="read_bottom"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@class="readAreaBox"]'
        }
    },
    {name: '縱橫書庫',
        url:/^http:\/\/book\.zongheng\.com\/chapter\/.+\.html/i,
        siteExample:'http://book.zongheng.com/chapter/239553/4380340.html',
        nextLink:'//div[@class="tc quickkey"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@class="readcon"]'
        }
    },
    {name: '縱橫女生',
        url:/^http:\/\/www\.mmzh\.com\/chapter\/.+\.html/i,
        siteExample:'http://www.mmzh.com/chapter/182074/3287355.html',
        nextLink:'//div[@class="tc key"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@class="book_con"]'
        }
    },
    {name: '新小說吧',
        url:/http:\/\/book\.xxs8\.com\/.+\.html/i,
        siteExample:'http://book.xxs8.com/165779/859903.html',
        nextLink:'//div[@class="page"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="midbody"]',
            maxpage:10,
        }
    },
    {name: '書迷樓',
        url:/http:\/\/www\.shumilou\.com\/.+\.html/i,
        siteExample:'http://www.shumilou.com/tiandilonghun/698520.html',
        nextLink:'//div[@class="content"]/div[@id="content"]/div[@class="title"]/a[text()="下一頁(→)"]',
        autopager:{
            pageElement:'//div[@class="content"]/div[@id="content"]',
        }
    },
    {name: '玄幻小說網',
        url:/^http:\/\/www\.xhxsw\.com\/books\/.+\.htm/i,
        siteExample:'http://www.xhxsw.com/books/1063/1063066/10579171.htm',
        nextLink:'//div[@id="footlink"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '新浪讀書',
        url:/^http:\/\/vip\.book\.sina\.com\.cn\/book\/.+\.html/i,
        siteExample:'http://vip.book.sina.com.cn/book/chapter_212356_210018.html',
        nextLink:'//p[@class="pages"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@class="mainContent"]'
        }
    },
    {name: '搜狐原創',
        url:/^http:\/\/vip\.book\.sohu\.com\/content/i,
        siteExample:'http://vip.book.sohu.com/content/124852/3902398/',
        nextLink:'//div[@class="artical_btn"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="bgdiv"]'
        }
    },
    {name: '紅袖添香',
        url:/^http:\/\/novel\.hongxiu\.com\/a\/.+\.shtml/i,
        siteExample:'http://novel.hongxiu.com/a/303084/3543064.shtml',
        nextLink:'//div[@class="papgbutton"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@class="wrapper_main"]'
        }
    },
    {name: '言情小說吧',
        url:/^http:\/\/www\.xs8\.cn\/book\/.+\.html/i,
        siteExample:'http://www.xs8.cn/book/132368/86157.html',
        nextLink:'//div[@class="chapter_Turnpage"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@class="chapter_content"]'
        }
    },
    {name: '來書小說網',
        url:/^http:\/\/www\.laishu\.com\/book\/.+\.shtml/i,
        siteExample:'http://www.laishu.com/book/8/8891/5488036.shtml',
        nextLink:'auto;',
        autopager:{
            pageElement:'//table[@class="tabkuan"]'
        }
    },
    {name: '小說閱讀網',
        url:/^http:\/\/www\.readnovel\.com\/novel\/.+/i,
        siteExample:'http://www.readnovel.com/novel/142947.html',
        nextLink:'//div[@class="bottomTools1"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@class="newContentBody "]'
        }
    },
    {name: '鳳鳴軒',
        url:/^http:\/\/read\.fmx\.cn\/files\/article\/html\/.+\.html/i,
        siteExample:'http://read.fmx.cn/files/article/html/5/7/0/4/8/5/70485/1339404.html',
        nextLink:'//div[@class="newread_fy"]/descendant::a[text()="下一章>>"]',
        autopager:{
            pageElement:'//div[@class="newbodybox"]'
        }
    },
    {name: '紅薯網',
        url:/http:\/\/www\.hongshu\.com\/content\/.+\.html/i,
        siteExample:'http://www.hongshu.com/content/38591/49531-1193339.html',
        nextLink:'//div[@class="ann"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="readtext"]'
        }
    },
    {name: '百書齋',
        url:/^http:\/\/baishuzhai\.com/i,
        siteExample:'http://baishuzhai.com/shancunqirenchuan/683763.html',
        nextLink:'//div[@class="page"]/descendant::a[text()="下一章(快捷鍵:→)"]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@id="booktext"]'
        }
    },
    {name: '百書庫',
        url:/^http:\/\/baishuku\.com\/html\/.+\.html/i,
        siteExample:'http://baishuku.com/html/40/40514/8778339.html',
        nextLink:'//div[@id="footlink"]/a[text()="下一頁(快捷鍵:→)"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '頂點小說',
        url: '^http://www\\.23us\\.com/html/.+\\.html',
        siteExample: 'http://www.23us.com/html/26/26627/16952316.html',
        nextLink: ' //dd[@id="footlink"]/descendant::a[text()="下一頁"]',
        pageElement: 'id("amain")/dl/dd/h1 | id("contents")'
    },
    {name: '快眼文學網',
        url:/^http:\/\/www\.kywxw\.com\/.+\.html/i,
        siteExample:'http://www.kywxw.com/0/12/3792643.html',
        nextLink:'//div[@id="thumb"]/descendant::a[text()="下一章"]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '就愛文學',
        url:/^http:\/\/www\.92wx\.org\/html\/.+\.html/i,
        siteExample:'http://www.92wx.org/html/0/807/220709.html',
        nextLink:'//div[@id="page_bar"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="chapter_content"]'
        }
    },
    {name: '親親小說網',
        url:/^http:\/\/www\.77shu\.com\/view\/.+\.html/i,
        siteExample:'http://www.77shu.com/view/0/20/2062418.html',
        nextLink:'auto;',
        autopager:{
            useiframe:true,
            pageElement:'//div[@id="chapter_content"] | //div[@id="content"]'
        }
    },
    {name: '七味書屋',
        url:/^http:\/\/www\.7wsw\.net\/html\/.+\.html/i,
        siteExample:'http://www.7wsw.net/html/shifangtianshi/719412.html',
        nextLink:'//div[@id="chapter_pager"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@class="book_middle_article"]'
        }
    },
    {name: '天天中文',
        url:/^http:\/\/www\.360118\.com\/html\/.+\.html/i,
        siteExample:'http://www.360118.com/html/21/21951/5416831.html',
        nextLink:'//div[@id="FootLink"]/descendant::a[text()="下一頁（快捷鍵→）"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '言情後花園',
        url:/^http:\/\/www\.yqhhy\.org\/novel\/.+\.html/i,
        siteExample:'http://www.yqhhy.org/novel/0/761/38769.html',
        nextLink:'//div[@id="link"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '平南文學',
        url:/^http:\/\/www\.pnxs\.com\/book\/.+\.html/i,
        siteExample:'http://www.pnxs.com/book/zhongshengyantaizidan/2164438.html',
        nextLink:'//div[@class="book_middle_text_next"]/descendant::a[text()="下一章"]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@class="book_middle_text"]'
        }
    },
    {name: '一流小說',
        url:/^http:\/\/www\.1lxs\.com\/novel\/.+\.html/i,
        siteExample:'http://www.1lxs.com/novel/80341/9055036.html',
        nextLink:'//div[@id="chapter_nav"]/descendant::a[text()="下一章"]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '一一小說',
        url:/^http:\/\/www\.11xs\.com\/.+\.htm/i,
        siteExample:'http://www.11xs.com/xs/213/119908.htm',
        nextLink:'//div[@id="LinkMenu"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="Content"]'
        }
    },
    {name: '六九中文',
        url:/^http:\/\/www\.69zw\.com\/xiaoshuo\/.+\.html/i,
        siteExample:'http://www.69zw.com/xiaoshuo/21/21943/4461482.html',
        nextLink:'//div[@class="chapter_Turnpage"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@class="novel_content"]'
        }
    },
    {name: '華夏書庫',
        url:/^http:\/\/www\.hxsk\.net\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.hxsk.net/files/article/html/67/67509/12704488.html',
        nextLink:'//td[@class="link_14"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//table[@class="border_l_r"]'
        }
    },
    {name: '書路/3K',
        url:/^http:\/\/www\.(shuluxs|kkkxs)\.com\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.shuluxs.com/files/article/html/22/22306/8727879.html',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '書山路',
        url:/^http:\/\/www\.shu36\.com\/book\/.+\.html/i,
        siteExample:'http://www.shu36.com/book/0/1/3.html',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '落秋',
        url:/^http:\/\/www\.luoqiu\.com\/html\/.+\.html/i,
        siteExample:'http://www.luoqiu.com/html/18/18505/1385765.html',
        nextLink:'//div[@id="bgdiv"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//table[@class="border_l_r"]',
        }
    },
    {name: '君子網',
        url:/^http:\/\/www\.junziwang\.com\/.+\.html/i,
        siteExample:'http://www.junziwang.com/0/155/25137.html',
        nextLink:'//div[@id="footlink"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '哈羅小說網',
        url:/^http:\/\/www\.hellodba\.net\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.hellodba.net/files/article/html/0/46/21565.html',
        nextLink:'//div[@class="papgbutton"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="htmlContent"]'
        }
    },
    {name: '百書樓',
        url:/^http:\/\/baishulou\.com\/read\/.+\.html/i,
        siteExample:'http://baishulou.com/read/10/10647/2536085.html',
        nextLink:'//a[text()="下一頁(快捷鍵:→)"][@href]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '萬書樓',
        url:/^http:\/\/www\.wanshulou\.com\/xiaoshuo\/.+\.shtml/i,
        siteExample:'http://www.wanshulou.com/xiaoshuo/29/29091/2062593.shtml',
        nextLink:'//div[@id="LinkMenu"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="BookText"]'
        }
    },
    {name: '萬卷書屋',
        url:/^http:\/\/www\.wjsw\.com\/html\/.+\.shtml/i,
        siteExample:'http://www.wjsw.com/html/35/35404/2887335.shtml',
        nextLink:'//div[@id="bookreadbottom"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="maincontent"]'
        }
    },
    {name: '書書網',
        url:/^http:\/\/www\.shushuw\.cn\/shu\/.+\.html/i,
        siteExample:'http://www.shushuw.cn/shu/28560/4509794.html',
        nextLink:'//div[@align="center"]/a[text()="下頁"][@href]',
        autopager:{
            pageElement:'//div[@class="cendiv"]'
        }
    },
    {name: '飛盧小說',
        url:/^http:\/\/b\.faloo\.com\/p\/.+\.html/i,
        siteExample:'http://b.faloo.com/p/247559/1.html',
        nextLink:'//div[@id="pager"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@class="main0"]'
        }
    },
    {name: '青帝文學網',
        url:/^http:\/\/www\.qingdi\.com\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.qingdi.com/files/article/html/0/27/13314.html',
        nextLink:'//div[@class="readerFooterPage"]/descendant::a[text()="下一頁"]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@class="readerTitle"]'
        }
    },
    {name: '筆下文學',
        url:/^http:\/\/www\.bxwx\.org\/b\/.+\.html/i,
        siteExample:'http://www.bxwx.org/b/56/56907/9020932.html',
        nextLink:'//div[@id="footlink"]/descendant::a[text()="下一頁[→]"]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '筆趣閣',
        url:/^http:\/\/www\.biquge\.com\/.+\.html/i,
        siteExample:'http://www.biquge.com/0_67/471472.html',
        nextLink:'//div[@class="bottem2"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '小說客棧',
        url:/^http:\/\/www\.xskz\.com\/xiaoshuo\/.+\.shtml/i,
        siteExample:'http://www.xskz.com/xiaoshuo/29/29091/2062593.shtml',
        nextLink:'//div[@id="LinkMenu"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="BookText"]'
        }
    },
    {name: '翠微居',
        url:/^http:\/\/www\.cuiweiju\.com\/html\/.+\.html/i,
        siteExample:'http://www.cuiweiju.com/html/124/124362/6468025.html',
        nextLink:'//p[@class="cz_bar"]/descendant::a[text()="下一章 》"]',
        autopager:{
            pageElement:'//div[@class="book_wrap"]'
        }
    },
    {name: '在線書吧',
        url:/^http:\/\/www\.bookba\.net\/Html\/Book\/.+\.html/i,
        siteExample:'http://www.bookba.net/Html/Book/15/15995/2030251.html',
        nextLink:'//td[@id="thumb"]/descendant::a[text()="下一章"]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '文學迷',
        url:/^http:\/\/www\.wenxuemi\.net\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.wenxuemi.net/files/article/html/10/10884/4852125.html',
        nextLink:'//div[@id="footlink"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '愛尚文學網',
        url:/^http:\/\/www\.kenshu\.cc\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.kenshu.cc/files/article/html/5/5379/6389640.html',
        nextLink:'//dd[@id="footlink"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@class="bdsub"]'
        }
    },
    {name: 'E品中文網',
        url:/^http:\/\/www\.epzw\.com\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.epzw.com/files/article/html/50/50244/3271485.html',
        nextLink:'//div[@id="link"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '大家讀書院',
        url:/^http:\/\/www\.dajiadu\.net\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.dajiadu.net/files/article/html/14/14436/3337407.html',
        nextLink:'//div[@id="footlink"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="center"]'
        }
    },
    {name: '北京愛書',
        url:/^http:\/\/www\.bj-ibook\.cn\/book\/.+\.htm/i,
        siteExample:'http://www.bj-ibook.cn/book/17/t10409k/12.htm',
        nextLink:'//div[@class="zhtop"]/a[text()="下一頁（快捷鍵→）"][@href]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@id="bmsy_content"]'
        }
    },
    {name: '小說570',
        url:/^http:\/\/www\.xiaoshuo570\.com/i,
        siteExample:'http://www.xiaoshuo570.com/11/11844/2678383.html',
        nextLink:'//div[@id="thumb"]/a[text()="下一頁"][@href]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@class="fonts_big"]',
        }
    },
    {name: '看書',
        url:/^http:\/\/www\.kanshu\.com\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.kanshu.com/files/article/html/30997/935806.html',
        nextLink:'//div[@class="yd_linebot"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//table[@class="yd_table"]'
        }
    },
    {name: '全本小說網',
        url:/^http:\/\/www\.quanben\.com\/xiaoshuo\/.+\.html/i,
        siteExample:'http://www.quanben.com/xiaoshuo/10/10412/2095098.html',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '晉江原創',
        url:/^http:\/\/www\.jjwxc\.net\/onebook\.php\?novelid=/i,
        siteExample:'http://www.jjwxc.net/onebook.php?novelid=862877&chapterid=6',
        nextLink: {
                startAfter:'&chapterid=',
                inc:1,
        },
        autopager:{
            pageElement:'//div[@class="noveltext"]',
        }
    },
    {name: '奇書屋',
        url:/^http:\/\/www\.qishuwu\.com\/.+/i,
        siteExample:'http://www.qishuwu.com/a_zhijian/314815/',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@id="bgdiv"]'
        }
    },
    {name: 'lu5小說網',
        url:/^http:\/\/www\.lu5\.com\/.+\.html/i,
        siteExample:'http://www.lu5.com/b/5/5442/9575830.html',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '飛庫',
        url:/^http:\/\/www\.feiku\.com\/\/html\/book\/.+\.shtm/i,
        siteExample:'http://www.feiku.com//html/book/130/164016/4891625.shtm',
        nextLink:'//div[@class="prenext"]/descendant::a[text()="下一頁→"]',
        autopager:{
            pageElement:'//div[@id="chcontent"]'
        }
    },
    {name: '幻俠小說網',
        url:/http:\/\/www\.huanxia\.com\/book\w+\.html/i,
        siteExample:'http://www.huanxia.com/book548761_6041285.html',
        nextLink:'//a[@href][@id="htmlxiazhang"]',
        autopager:{
            pageElement:'//div[@class="h1title"] | //div[@id="htmlContent"][@class="contentbox"]',
            HT_insert:['//div[@id="htmlContent"]',2],
        }
    },
    {name: '瀟湘書院',
        url:/^http:\/\/www\.xxsy\.net\/books\/.*\.html/i,
        siteExample:'http://www.xxsy.net/books/485034/5259176.html',
        nextLink:'//div[@id="detailsubsbox"]/span/a[@href][@title="閱讀下一章節"]',
        autopager:{
            pageElement:'//div[@id="detail_title"] | //div[@id="zjcontentdiv"]',
            HT_insert:['//div[@id="zjcontentdiv"]',2],
        }
    },
    {name: '書海',
        url:/^http:\/\/www\.shuhai\.com\/read\/.+\.html/i,
        siteExample:'http://www.shuhai.com/read/4014/371553.html',
        nextLink:'//div[@class="page_operate font_blue"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="txt"]'
        }
    },
    {name: 'yi-see',
        url:/^http:\/\/www\.yi-see\.com/i,
        siteExample:'http://www.yi-see.com/read_266768_15501.html',
        nextLink:'//div[@class="B2"]/descendant::a[text()="下一節"]',
        autopager:{
            pageElement:'//table[@width="900px"][@align="CENTER"]',
        }
    },
    {name: '天下書盟',
        url:/^http:\/\/www\.fbook\.net\/book\/.+\.htm/i,
        siteExample:'http://www.fbook.net/book/35793/2656834.htm',
        nextLink:'//div[@id="pages"]/descendant::a[text()="下一章"]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@id="bookbody"]'
        }
    },
    {name: '涂鴉小說網',
        url:/^http:\/\/www\.tooya\.net\/.+\.html/i,
        siteExample:'http://www.tooya.net/tooya/2/2094/820902.html',
        nextLink:'//div[@class="novel_bottom"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '百曉生/谷粒',
        url:/^http:\/\/www\.(bxs|guli)\.cc\/.+/i,
        siteExample:'http://www.bxs.cc/26758/7708992.html',
        enable:true,
        nextLink:'//div[@id="papgbutton"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="main"]/h1 | //div[@id="readbox"]/div[@id="content"] | //div[@id="readbox"]/div[@id="papgbutton"]',
                            HT_insert:['//div[@id="weekhot"]',1],
        }
    },
    {name: '熬夜看書',
        url:/^http:\/\/www\.aoye\.cc\/.+\.html/i,
        siteExample:'http://www.aoye.cc/843/5.html',
        nextLink:'//div[@id="pagebottom"]/descendant::a[@id="nextpage"]',
        autopager:{
            pageElement:'//pre[@id="content"]'
        }
    },
    {name: '塔讀文學',
        url:/^http:\/\/www\.tadu\.com\/book\/\d+\/\d+/i,
        siteExample:'http://www.tadu.com/book',
        nextLink:'//div[@class="container_center"]/div[@class="left"]/div[@class="jump"]/a[@href][text()="下一章>>"]',
        autopager:{
            useiframe:true,
            pageElement:'//div[@class="container_center"]/div[@class="left"]/div[@class="content"][@id="partContent"]',
        }
    },
    {name: '無錯小說網',
        url:/^http:\/\/www\.wcxiaoshuo\.com\/wcxs\-\d+\-\d+/i,
        siteExample:'http://www.wcxiaoshuo.com/wcxs-*-*/',
        nextLink:'auto;',
        autopager:{
            pageElement:'//div[@class="wrapper_main"][@id="jsreadbox"]/h1 | //div[@class="wrapper_main"][@id="jsreadbox"]/div[@id="htmlContent"][@class="contentbox"]',
        }
    },
    {name: '燃文',
        url:/^http:\/\/www\.ranwen\.cc\/.+\.html/i,
        siteExample:'http://www.ranwen.cc/A/9/9818/3505060.html',
        nextLink:'//div[@class="pageTools"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="oldtext"]'
        }
    },
    {name: '書河',
        url:/^http:\/\/www\.shuhe\.cc\/.+/i,
        siteExample:'http://www.shuhe.cc/30976/4401025/',
        nextLink:'//div[@class="bottem"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="TXT"]'
        }
    },
    {name: '89文學',
        url:/^http:\/\/89wx\.com\/.+\.htm/i,
        siteExample:'http://89wx.com/html/book/70/70732/6641331.htm',
        nextLink:'//dd[@id="footlink"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//dd[@id="contents"]'
        }
    },
    {name: '極速小說網',
        url:/^http:\/\/www\.186s\.cn\/files\/article\/html\/.+\.html/i,
        siteExample:'http://www.186s.cn/files/article/html/0/304/4528937.html',
        nextLink:'//div[@id="footlink"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '手打8',
        url:/^http:\/\/shouda8\.com\/.+\.html/i,
        siteExample:'http://shouda8.com/zhangyuxingchen/85649.html',
        nextLink:'//div[@id="papgbutton"]/descendant::a[text()="下一章（快捷鍵 →）"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: '閃文書庫',
        url:/^http:\/\/read\.shanwen\.com\/.+\.html/i,
        siteExample:'http://read.shanwen.com/14/14616/1011063.html',
        nextLink:'//td[@class="tb0"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@id="content"]'
        }
    },
    {name: 'PaiTxt',
        url:/^http:\/\/paitxt\.com\/.+\.html/i,
        siteExample:'http://paitxt.com/24/24596/4507312.html',
        nextLink:'//div[@class="book_middle_text_next"]/descendant::a[text()="下一章(快捷鍵:→)"]',
        autopager:{
            pageElement:'//div[@id="booktext"]'
        }
    },
    {name: '好書樓',
        url:/^http:\/\/www\.haoshulou\.com\/.+\.html/i,
        siteExample:'http://www.haoshulou.com/Hao/6/60238.html',
        nextLink:'//div[@class="movenext"]/descendant::a[text()="下一章"]',
        autopager:{
            pageElement:'//div[@id="booktext"]'
        }
    },
    {name: 'BookLink.Me:最有愛的小說搜索引擎',
        url: '^http://booklink\\.me/',
        nextLink: '//a[text()="下一頁"] | //a[font[text()="下一頁"]]',
        pageElement: '//table[@width="100%"][@cellspacing="0"][@cellpadding="2"]',
        scroll_only: true
    },
    // =============================== manhua ========================
    {name: '天極動漫頻道新聞',
        url:/http:\/\/comic\.yesky\.com\/\d+\/.+\.shtml/i,
        siteExample:'http://comic.yesky.com/249/11335749_5.shtml',
        nextLink:'//div[@id="numpage"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@class="article"]',
            remain:1.4,
            replaceE:'//div[@id="numpage"]',
        }
    },
    {name: '暴走漫畫',
        url: /^http:\/\/(baozou|baozoumanhua)\.com\//i,
        nextLink: '//div[@class="pagebar"]/a[text()="下一頁" or @class="next"] | //a[@class="next" and (text()="下一頁")]',
        autopager: {
            pageElement: '//div[@class="main cf"]/div[@class="content-block cf"]/div[1]',
        }
    },
    {name: '動漫之家漫畫網',
        url: "^http://(www|manhua)\\.dmzj\\.com/.+/.+shtml|^http://manhua\\.178\\.com/.+/.+shtml",
        siteExample:'http://manhua.178.com/lansechumoshi/15794.shtml',
        nextLink:'//div[@class="pages2"]/descendant::a[text()="下一頁"]',
        autopager:{
            pageElement:'//div[@class="inner_img"]',
            useiframe:true,
        }
    },
    {name: '愛漫畫',
        url:/^http:\/\/www\.imanhua\.com\/comic\/.+/i,
        siteExample:'http://www.imanhua.com/comic/55/list_39448.html',
        useiframe:true,
        preLink:{
            startAfter:'?p=',
            inc:-1,
            min:1,
        },
        nextLink:{
            startAfter:'?p=',
            mFails:[/^http:\/\/www\.imanhua\.com\/comic\/.+\.html/i,'?p=1'],
            inc:1,
            isLast:function(doc,win,lhref){
                var pageSelect=doc.getElementById('pageSelect');
                if(pageSelect){
                    var s2os=pageSelect.options;
                    var s2osl=s2os.length;
                    //alert(s2.selectedIndex);
                    if(pageSelect.selectedIndex==s2osl-1)return true;
                }
            },
        },
        autopager:{
            useiframe:true,
            remain:1/2,
            pageElement:'//img[@id="comic"]',
        }
    },
    {name: 'CC漫畫網',
        url: "^http://www\\.tuku\\.cc/comic/\\d+/\\d+/",
        siteExample:'http://www.tuku.cc/comic/6123/1/',
        nextLink:'auto;',
        autopager:{
            pageElement:'//img[@id="Img"]',
            useiframe:true,
        }
    },
    {name: '新動漫',
        url:/http:\/\/www\.xindm\.cn\/mh\/.+/i,
        siteExample:'http://www.xindm.cn/mh/shishangzuiqiangdizi/58784.html?p=2',
        preLink:{
            startAfter:'?p=',
            inc:-1,
            min:1,
        },
        nextLink:{
            startAfter:'?p=',
            mFails:[/http:\/\/www\.xindm\.cn\/mh\/.+\.html/i,'?p=1'],
            inc:1,
            isLast:function(doc,win,lhref){
                var topSelect=doc.getElementById('topSelect');
                if(topSelect){
                    var s2os=topSelect.options;
                    var s2osl=s2os.length;
                    if(topSelect.selectedIndex==s2osl-1)return true;
                }
            },
        },
        autopager:{
            pageElement:'//div[@id="imgArea"]',
            useiframe:true,
        }
    },
    {name: '看漫畫',
        url:/^http:\/\/www\.kkkmh\.com\/manhua\/\d+\/\d+\/\d+\.html/i,
        siteExample:'http://www.kkkmh.com/manhua/0710/1011/34412.html?p=2',
        nextLink: {
            startAfter: '?p=',
            mFails: [/^http:\/\/www\.kkkmh\.com\/manhua\/\d+\/\d+\/\d+\.html/i, '?p=1'],
            inc: 1,
            isLast: function(doc, gm_win, lhref) {
                var pic_num = gm_win.pic.length;
                var url_info = lhref.split("?p=");
                var current_page = Number(url_info[1]);
                if (current_page >= pic_num) {
                    return true;
                }
            },
        },
        autopager: {
            pageElement: 'css;img#pic-show-area',
            remain: 1 / 3,
            documentFilter: function(doc, lhref) {
                var current_pic_server = unsafeWindow.current_pic_server,
                    hex2bin = unsafeWindow.hex2bin,
                    pic = unsafeWindow.pic;

                var url_info = lhref.split("?p=");
                var current_page = Number(url_info[1]);
                if (isNaN(current_page)) return;
                var imgSrc = current_pic_server + hex2bin(pic[current_page - 1]);
                doc.getElementById("pic-show-area").setAttribute('src', imgSrc);
            }
        }
    },
    // 已失效
    // {name: 'SF在線漫畫',
    //     url:/http:\/\/comic\.sfacg\.com\/HTML\/.+/i,
    //     siteExample:'http://comic.sfacg.com/HTML/ZXCHZ/001/#p=2',
    //     preLink:{
    //         startAfter:'#p=',
    //         inc:-1,
    //         min:1,
    //     },
    //     nextLink:{
    //         startAfter:'#p=',
    //         mFails:[/http:\/\/comic\.sfacg\.com\/HTML\/.+\//i,'#p=1'],
    //         inc:1,
    //         isLast:function(doc,win,lhref){
    //             var pageSel=doc.getElementById('pageSel');
    //             if(pageSel){
    //                 var s2os=pageSel.options;
    //                 var s2osl=s2os.length;
    //                 if(pageSel.selectedIndex==s2osl-1)return true;
    //             }
    //         },
    //     },
    //     autopager:{
    //         pageElement:'//img[@id="curPic"]',
    //         useiframe:true,
    //         replaceE: 'id("Pages")'
    //     }
    // },
    {name: '熱血漫畫',
        url: /^http:\/\/www\.rexuedongman\.com\/comic\//i,
        siteExample: 'http://www.rexuedongman.com/comic/2957/36463/index.html?p=2',
        nextLink: {
            startAfter: '?p=',
            mFails: [/^http:\/\/www\.rexuedongman\.com\/comic\/.+/i, '?p=1'],
            inc: 1,
            isLast: function(doc, win, lhref) {
                var select = doc.getElementById('pageSelect');
                if (select) {
                    var s2os = select.options;
                    var s2osl = s2os.length;
                    if (select.selectedIndex == s2osl - 1) return true;
                }
            },
        },
        autopager: {
            useiframe: true,
            pageElement: '//img[@id="mangaFile"]',
        }
    },
    {name: '基德漫畫網',
        url: /^http:\/\/www\.jide123\.net\/manhua\/.*\.html/i,
        exampleUrl: 'http://www.jide123.net/manhua/3670/272725.html?p=2',
        nextLink: {
            startAfter: '?p=',
            mFails: [/^http:\/\/www\.jide123\.net\/manhua\/.*\.html/i, '?p=1'],
            inc: 1,
            isLast: function(doc, win, lhref) {
                var select = doc.getElementById('qTcms_select_i');
                if (select) {
                    var s2os = select.options;
                    var s2osl = s2os.length;
                    if (select.selectedIndex == s2osl - 1) return true;
                }
            },
        },
        autopager: {
            pageElement: 'id("qTcms_pic")',
            useiframe: true,
        }
    },
    {name: '5652在線漫畫',
        url: /^http:\/\/mh\.5652\.com\/mh\/.*\.shtml/i,
        exampleUrl: 'http://mh.5652.com/mh/20130124/5484/125907.shtml?p=2',
        nextLink: {
            startAfter: '?p=',
            mFails: [/^http:\/\/mh\.5652\.com\/mh\/.*\.shtml/i, '?p=1'],
            inc: 1,
            isLast: function(doc, win, lhref) {
                var select = doc.querySelector('.Directory_bar select');
                if (select) {
                    var s2os = select.options;
                    var s2osl = s2os.length;
                    if (select.selectedIndex == s2osl - 1) return true;
                }
            },
        },
        autopager: {
            pageElement: 'id("show_img")',
            useiframe: true,
        }
    },
    {name: '汗汗漫畫',
        url: /^http:\/\/\w+\.(?:vs20|3gmanhua|hhcomic)\.(?:com|net)\/\w+\/\w+\.htm/i,
        siteExample: 'http://page.vs20.com/1815454/115321.htm?v=2*s=6',
        nextLink: function(doc, win, cplink) {
            // hrefInc 的方式不行因為這個地址最後還有額外的 *s=6
            var m = cplink.match(/\?v=(\d+)/);
            if (!m) {
                // 第一頁這種情況 http://page.vs20.com/1815454/115321.htm?s=6
                return cplink.replace('?s=', '?v=2*s=');
            } else {
                var current = Number(m[1]),
                    next = current + 1;

                var select = doc.querySelector('#all select');
                if (!select) return;
                var max = select.options.length;
                if (next > max) return;
                return cplink.replace(m[0], '?v=' + next);
            }
        },
        autopager: {
            useiframe: true,
            pageElement: '//img[@id="ComicPic"]',
        }
    },
    {name: '99漫畫old',
        url: /^http:\/\/(cococomic|dm.99manga|99manga|99comic|www.99comic|www.hhcomic)\.(com|cc)\/.+\.htm/i,
        siteExample: 'http://99manga.com/man/2779/253724.htm?v=1*s=4',
        nextLink: function(doc, win, cplink) {
            // hrefInc 的方式不行因為這個地址最後還有額外的 *s=6
            var m = cplink.match(/\?v=(\d+)/);
            if (!m) {
                // 第一頁這種情況 http://page.vs20.com/1815454/115321.htm?s=6
                return cplink.replace('?s=', '?v=2*s=');
            } else {
                var current = Number(m[1]),
                    next = current + 1;

                var select = doc.querySelector('#all select');
                if (!select) return;
                var max = select.options.length;
                if (next > max) return;
                return cplink.replace(m[0], '?v=' + next);
            }
        },
        autopager: {
            useiframe: true,
            pageElement: '//img[@id="ComicPic"]',
        }
    },
    {name: '99漫畫new',
        url: /^http:\/\/(1mh|99mh|mh.99770|www.jmydm)\.(com|cc)\/.+/i,
        siteExample: 'http://99mh.com/comic/8436/117728/?p=1&s=0',
        nextLink: {
            startAfter: '?p=',
            mFails:[/^https?:\/\/99mh\.com\/comic\/\d+\/\d+\//i,'?p=1&s=0'],
            inc: 1,
        },
        autopager: {
            useiframe: true,
            maxpage: 20,
            pageElement: '//img[@id="imgCurr"]',
        }
    },
    {name: '動漫Fans',
        url: /http:\/\/www\.dm123\.cn\/bbs\/(thread\.php\?fid=|read\.php\?tid=)/i,
        siteExample: 'http://www.dm123.cn/bbs/read.php?tid=593645',
        nextLink: 'auto;',
        autopager: {
                pageElement: '//tbody[@id="threadlist"]|//div[@id="pw_content"]',
        }
    },
    {name: 'KuKu動漫',
        url:/http:\/\/comic\.kukudm\.com\/comiclist\/\d+\/\d+.*\.htm/i,
        siteExample:'http://comic.kukudm.com/comiclist/4/17099/3.htm',
        useiframe:true,
        nextLink:'//a[img[contains(@src,"images/d.gif")]]',
        autopager:{
            useiframe:true,
            pageElement:'//body/table[2]'
        }
    },
    {name: '52pk漫畫',
        url:/http:\/\/(op|sishen|narutocn)\.52pk\.com\/manhua\/\d+\/\d+/i,
        siteExample:'http://op.52pk.com/manhua/2010/921364.html',
        nextLink:'//li[@id="page__next"]/a[1]',
        autopager:{
            relatedObj:['css;li#page__select','bottom'],
            pageElement:'//div[@id="pictureContent"]'
        }
    },
    {name: '有妖氣漫畫',
        url:/http:\/\/www\.u17\.com\/comic_show\/.+/i,
        siteExample:'http://www.u17.com/comic_show/c28540_m0.html',
        autopager:{
            pageElement:'//div[@class="mg_auto"]',
            useiframe:true,
        }
    },
    //{name: '動漫屋',
    //    url:/http:\/\/(www|tel)\.dm5\.com\/.+/i,
    //    nextLink:'//span[@id="s_next"]/a[1]|//div[@class="inkk mato10"]/div[@id="search_fy"]/a[contains(text(),"下一页")]',
    //    /*//nextLink: 'css;span#s_next > a,.inkk.mato10 #search_fy > a:last-child',*/
    //    autopager:{
    //        pageElement:'//div[@id="cp_img"]|//div[@class="innr3"]/li[@class="red_lj"]',
    //        /*//pageElement: 'css;div#cp_img,div.innr3 > li.red_lj',*/
    //        useiframe:true,
    //        ipages: [true, 1], 
    //        separator: false,
    //        stylish: '#quanbupl,#loadmore,.cplk{display:none;}',
    //    }
    //},
    {name: '天使漫畫網,TSDM漫畫組',
        url:/^http:\/\/mh\.tsdm\.net\/comic\/.+/i,
        siteExample:'http://mh.tsdm.net/comic/4697/68059.html',
        useiframe:true,
        preLink:{
            startAfter:'?p=',
            inc:-1,
            min:1,
        },
        nextLink:{
            startAfter:'?p=',
            mFails:[/^http:\/\/mh\.tsdm\.net\/comic\/.+\.html/i,'?p=1'],
            inc:1,
            isLast:function(doc,win,lhref){
                var pageSelect=doc.getElementById('qTcms_select_i');
                if(pageSelect){
                    var s2os=pageSelect.options;
                    var s2osl=s2os.length;
                    //alert(s2.selectedIndex);
                    if(pageSelect.selectedIndex==s2osl-1)return true;
                }
            },
        },
        autopager:{
            useiframe:true,
            remain:1/2,
            pageElement:'//img[@id="qTcms_pic"]',
        }
    },
    {name: '漫畫頻道_游俠網',
        url: /^http:\/\/manhua\.ali213\.net\/comic\/.*\.html/i,
        exampleUrl: 'http://manhua.ali213.net/comic/5257/141336.html',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//div[@class="enjoy_hostcon"]',
            useiframe: true,
            replaceE: "//div[@class='enjoy_center_bottom_page']//*[@class='li_middle' or @class='previouspage' or @class='nextpage']"
        }
    },
    {name: '火影忍者中文網',
        url:/http:\/\/www\.narutom\.com\/comic\/.+/i,
        siteExample:'http://www.narutom.com/comic/11624.html?p=3',
        preLink:{
            startAfter:'?p=',
            inc:-1,
            min:1,
        },
        nextLink:{
            startAfter:'?p=',
            mFails:[/http:\/\/www\.narutom\.com\/comic\/.+\.html/i,'?p=1'],
            inc:1,
            isLast:function(doc,win,lhref){
                var topSelect=doc.getElementById('topSelect');
                if(topSelect){
                    var s2os=topSelect.options;
                    var s2osl=s2os.length;
                    if(topSelect.selectedIndex==s2osl-1)return true;
                }
            },
        },
        autopager:{
            pageElement:'//img[@id="showImg"]',
            useiframe:true,
        }
    },
    {name: '死神中文網',
        url:/http:\/\/(?:\w+\.)?bleachcn\.net\/manhua\/.+/i,
        siteExample:'http://naruto.bleachcn.net/manhua/6759.html',
        nextLink:'//div[@id="comic_pages"]/a[text()="下一頁"][@href]',
        autopager:{
            pageElement:'//div[@id="comic_endtext"]',
        }
    },
    {name: 'iiikl論壇',
        url: '^http://bbs\\.iiikl\\.net/forum\\.php\\?forum_id=.*',
        nextLink: '//a[@class="next"]',
        pageElement: '//tr[@class="topic_list_row"]',
        exampleUrl: 'http://bbs.iiikl.net/forum.php?forum_id=82&class_id=0&page=2'
    },
    {name: 'sosg論壇帖子',
        url:/http:\/\/www\.sosg\.net\/read/i,
        siteExample:'http://www.sosg.net/read.php?tid=424833',
        nextLink:'//td[@align="left"]/b/following-sibling::a[@href]',
        autopager:{
            pageElement:'//div[@id="b5"]/form/a/table[1]',
        }
    },
    {name: '澄空貼子內容',
        url:/http:\/\/bbs\.sumisora\.org\/read\.php\?tid=/i,
        siteExample:'http://bbs.sumisora.org/read.php?tid=11015694',
        nextLink:'auto;',
        autopager:{
            pageElement:'css;.t.t2',
        }
    },
    {name: '9gal蒼雪論壇',
        url:/http:\/\/bbs\.(9gal|9baka)\.com\/read\.php\?tid=/i,
        siteExample:'http://bbs.9gal.com/read.php?tid=299016',
        nextLink:'auto;',
        autopager:{
            pageElement:'//form[@method="post"]/a[@name]/following-sibling::div',
            replaceE:'//ul[@class="pages"]',
        },
    },
    {name: '和邪社|你的ACG生活 文不在長.內涵則明 圖不在色.意淫則靈',
        url: /^http:\/\/www\.hexieshe\.com\//i,
        exampleUrl: 'http://www.hexieshe.com/',
        nextLink: '//div[@class="pagebar"]/a[text()="Next"]',
        autopager: {
            pageElement: 'id("centent")',
        }
    },
    {name: 'haruhichan',
        url: /^http:\/\/haruhichan\.com\//i,
        nextLink: '//a[@rel="next"]',
        autopager: {
            pageElement: '//div[@id="postlist"]',
        }
    },
    {name: 'exhentai',
        url: '^http://exhentai\\.org/s/.*$',
        nextLink: '//img[@src="http://st.exhentai.net/img/n.png"]/..',
        pageElement: '//body/div[@class="sni"]',
        exampleUrl: 'http://exhentai.org/s/0088446283/653117-4',
        useiframe: true
    },
    {name: 'exhentai gallery',
        url: /^http:\/\/exhentai\.org\/g\//i,
        exampleUrl: 'http://exhentai.org/g/514954/d4fcb4973e/?p=1',
        nextLink: '//table[@class="ptt"]//a[text()=">"]',
        autopager: {
            pageElement: '//div[@id="gdt"]',
            relatedObj: true
        }
    },
    {name: 'exhentai frontpage',
        url: /^http:\/\/exhentai\.org\/(\?[^\/]+)?$/i,
        exampleUrl: 'http://exhentai.org/?page=2',
        nextLink: '//table[@class="ptt"]//a[text()=">"]',
        autopager: {
            pageElement: '//table[@class="ptt"]/..',
            relatedObj: true
        }
    },
    {name: 'Hentai Manga|Read free hentai xxx manga online',
        url: /^http:\/\/hentai4manga\.com\//i,
        exampleUrl: 'http://hentai4manga.com/',
        nextLink: '//div[@class="pages"]/a[contains(text(), ">")]',
        autopager: {
            pageElement: 'id("innerContent")',
        }
    },
    {name: '1024社區',
        url: '^http://(www\\.)?t66y\\.com/|^http://cl\\.man\\.lv/',
        nextLink: '//div[@class="pages"]/b/following-sibling::a[1]',
        pageElement: 'id("ajaxtable") | id("main")',
        exampleUrl: 'http://t66y.com/thread0806.php?fid=15',
    },
    {name: 'DLsite 検索結果',
        url: /^http:\/\/(?:[^.]+\.)?dlsite\.com\//i,
        exampleUrl: 'http://www.dlsite.com/home/fsr/=/language/jp/keyword/kon/age_category%5B0%5D/general/per_page/30/show_type/n/page/2',
        nextLink: '//td[@class="page_no"]/ul/li/a[text()="次へ" or text()="Next"]',
        autopager: {
            pageElement: 'id("search_result_list")',
        }
    },
    {name: 'Gyutto.com｜の検索結果',
        url: /^http:\/\/gyutto\.com\/search\/search_list\.php/i,
        exampleUrl: 'http://gyutto.com/search/search_list.php?_adult_check=yes&action=perPage&search_keyword=lol&search_type=&mode=search&perPage=30&pageID=2&ref_path=%2Fsearch%2Fsearch_list.php',
        nextLink: '//a[text()="次の30件へ"]',
        autopager: {
            pageElement: 'id("struct_2ColRightIn")/div[@class="unit_ItemList"]/div[contains(@class, "parts_ItemBox")]',
            relatedObj: true
        }
    },
    {name: 'JAVLibrary',
        url: /^http:\/\/www\.javlibrary\.com\/cn\//i,
        exampleUrl: 'http://www.javlibrary.com/cn/vl_bestrated.php',
        nextLink: '//div[@class="page_selector"]/a[@class="page next"]',
        autopager: {
            pageElement: 'id("rightcolumn")/div[@class="videothumblist"] | id("rightcolumn")/div[@class="starbox"]',
        }
    },
    {name: 'NyaaTorrents',
        url: '^http://(?:(?:www|sukebei?)\\.)?nyaa\\.se/',
        nextLink: '//div[@class="pages"]/b/following-sibling::a[1]',
        pageElement: '//table[@class="tlist"]',
        exampleUrl: 'http://www.nyaa.se/',
    },
    {name: '極影動漫',
        url: 'http://bt.ktxp.com/.+[0-9]+-*',
        nextLink: '//span[@class="current"]/following-sibling::a[1]',
        pageElement: '//div[@class="item-box round-corner" and div/@class="title"]',
    },
    {name: 'BTDigg Search',
        url: '^https?://btdigg.org/search*',
        nextLink: '//a[contains(text(),"→")]',
        pageElement: '//body/div/div/center',
    },


    // ==================== 國外站點 ===================
    {name: 'AnandTech',
        url: '^http://anandtech\\.com/',
        nextLink: '//div[@class="pagination"]/ul/li[@class="arrow"]/a[text()="▶"]',
        pageElement: '//section[@class="content"]/section[@class="main_cont"]/section[@class="main_cont"]',
        exampleUrl: 'http://anandtech.com/tag/mb',
    },
    {name: 'Android Police - Android News, Apps, Games, Phones, Tablets',
        url: '^http://www\\.androidpolice\\.com/',
        nextLink: '//div[@class="wp-pagenavi"]/a[text()="Next»"]',
        pageElement: '//div[@id="content"]',
        exampleUrl: 'http://www.androidpolice.com/',
    },
    {name: 'Anonymous speaks: the inside story of the HBGary hack | Ars Technica',
        url: '^http://arstechnica\\.com/',
        nextLink: '//a[span[contains(concat(" ", @class, " "), " next ")]]',
        pageElement: '//article[contains(concat(" ", @class, " "), " standalone ")]/section[@id="article-guts"]',
        exampleUrl: 'http://arstechnica.com/tech-policy/2011/02/anonymous-speaks-the-inside-story-of-the-hbgary-hack/',
    },
    {name: 'techPowerUp',
        url: '^http://www\\.techpowerup\\.com/',
        nextLink: '//a[@class="nextpage-top"] | //a[contains(text(),"Next")]',
        pageElement: '//div[@class="text"] | //section[@id="list"] | //form[@class="DiscussionList InlineModForm" or @class="InlineModForm section"]',
        exampleUrl: 'http://www.techpowerup.com/reviews/GSkill/F3-1600C7Q-32GTX/',
    },
    {name: 'Digital Photography Review',
        url: '^http://www\\.dpreview\\.com/',
        nextLink: '//a[@rel="nofollow"][contains(text(), "Next")]',
        pageElement: 'id("mainContent")/div[@class="news withDayIcons"]',
        exampleUrl: 'http://www.dpreview.com/previews/sony-cybershot-dsc-rx1r',
    },
    {name: 'Digital Photography Review 2',
        url: '^http://www\\.dpreview\\.com/',
        nextLink: '//div[@class="reviewPagesDropdown"]/a/img[@alt="Next page"]/..',
        insertBefore: 'id("amazonBuyboxContainer")',
        autopager: {
            pageElement: 'id("mainContent")',
            filter: 'css;.reviewNavigatorTop, #amazonBuyboxContainer, .ad, #comments, .buyboxOld.amazon',
                relatedObj: ['css;div.reviewNavigatorBottom','bottom'],
                HT_insert: ['id("amazonBuyboxContainer")',1],
        }
    },

    //-================ 手機網站 ========================
    {name: '手機百度百科',
        url: /^http:\/\/wapbaike\.baidu\.com\//i,
        exampleUrl: 'http://wapbaike.baidu.com/goodlist?uid=F381CCCD6FD2F58151EFFB4A63BFA4FF&ssid=0&pu=sz%401321_1004&bd_page_type=1&from=844b&st=4&step=2&net=1&bk_fr=bk_more_glist',
        nextLink: '//div[@class="pages"]/a[text()="下一頁"] | //div[@class="page"]/p[@class="next"]/a[text()="下頁"] | //table[@class="table next"]//a[text()="下頁"] | //a[@class="m-rm-5" and text()="余下全文"]',
        autopager: {
            pageElement: '//div[@class="bd"] | //div[@class="list"] | id("lemma-content")',
            separatorReal: false,
            replaceE: 'css;.page > .p-num'
        }
    },
    {name: '手機豆瓣',
        url: /^http:\/\/m\.douban\.com\/.*/i,
        exampleUrl: 'http://m.douban.com/book/subject/1088065/reviews?session=c0ea1419',
        nextLink: '//div[@class="pg" or @class="paginator"]/a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("bd")/div[@class="itm"] | //div[@class="bd"]/div[@class="list"]',
            separatorReal: false
        }
    },
    {name: '手機新浪新聞',
        url: /^http:\/\/[a-z]+\.sina\.cn\/\?sa=/i,
        exampleUrl: 'http://news.sina.cn/?sa=t124d10608655v71&pos=108&vt=4&clicktime=1386267238910&userid=user138626723891024077253801575993',
        nextLink: 'id("j_loadingBtn")',
        autopager: {
            pageElement: 'id("j_articleContent")',
            relatedObj: true
        }
    },
    {name: '手機網易網',
        url: '^http://3g\\.163\\.com/[a-z]+/.*\\.html',
        exampleUrl: 'http://3g.163.com/news/13/0914/04/98N4CSHI0001124J.html',
        nextLink: ['//a[text()="余下全文"]', '//a[text()="下頁"]'],
        autopager: {
            pageElement: '//div[@class="content"]',
            // separator: false,
            replaceE: '//div[@class="reset marTop10 cBlue"][child::a[text()="下頁"]] | //div[child::form[@class="reset"]]',
            relatedObj: true,
        }
    },
    {name: '手機鳳凰網',
        url: '^http://3g\\.ifeng\\.com/[a-z]+/',
        exampleUrl: 'http://3g.163.com/news/13/0914/04/98N4CSHI0001124J.html',
        nextLink: ['//a[text()="余下全文"]', '//a[text()="下一頁"]'],
        autopager: {
            pageElement: '//div[@class="zwword"]',
            // separator: false,
            relatedObj: true,
        }
    },
    {name: '手機環球網',
        url: '^http://wap\\.huanqiu\\.com/',
        nextLink: ['//a[text()="余下全文"]', '//a[text()="下一頁"]'],
        autopager: {
            pageElement: '//div[@class="newscont"]',
            // separator: false,
            separatorReal: false,
            relatedObj: true,
        }
    },
    {name: 'cnBeta.COM - 移動版',
        url: /^http:\/\/m\.cnbeta\.com\//i,
        exampleUrl: 'http://m.cnbeta.com/',
        nextLink: 'id("yw0")/a[@class="page-next"]',
        autopager: {
            pageElement: '//div/div/div[@class="list"]',
        }
    },
    {name: '手機版M.BookLink.Me',
        url: /^http:\/\/m\.booklink\.me\//i,
        exampleUrl: 'http://m.booklink.me/charpter.php?site_id=2&book_id=69507',
        nextLink: '//div[@class="sec nav"]/form/a[text()="下一頁"]',
        autopager: {
            pageElement: 'id("m_main")/ul[@class="list sec"]',
        }
    },
    {name: '開源中國(OSChina.NET)',
        url: /^http:\/\/m\.oschina\.net\//i,
        exampleUrl: 'http://m.oschina.net/',
        nextLink: 'auto;',
        autopager: {
            pageElement: '//ul[@class="ui-listview"]',
            useiframe: true
        }
    },
    {name: '博客園博客手機版',
        url: /^http:\/\/m\.cnblogs\.com\/blog\//i,
        exampleUrl: 'http://m.cnblogs.com/blog/',
        nextLink: '//a[text()="下一頁"]',
        autopager: {
            pageElement: '//div[@class="list_item"]',
        }
    },

    // ============== google 其它======================
    {name: "Google Bookmarks",
        "url": "^https?://www\\.google\\.(?:[^.]{2,3}\\.)?[^./]{2,3}/bookmarks/",
        "nextLink": "//div[contains(concat(\" \", @class, \" \"), \" kd-buttonbar \")]//tr/td[last()-1 or last]/a[img[contains(@src,\"right.png\")]]",
        "pageElement": "id(\"search\")"
    },
    {name: "Google Code List",
        url: "^https?://code\\.google\\.com/[pr]/(?:[^/]+/){2}list",
        nextLink: "id(\"colcontrol\")//div[contains(concat(\" \", @class, \" \"), \" pagination \")]/a[contains(., \"›\")]",
        pageElement: "id(\"resultstable\")//tr"
    },
    {
        "url": "^https?://code\\.google\\.com/hosting/search\\?",
        "nextLink": "id(\"serp\")/following::a[contains(., \"Next\")][1]",
        "pageElement": "id(\"serp\")/*"
    },
    {
        "url": "^http://[^.]+\\.google\\.(?:[^.]{2,3}\\.)?[^./]{2,3}/codesearch",
        "nextLink": "(id(\"navbar\")//td[@class=\"b\"]/a)[last()]",
        "pageElement": "//*[self::div[@class=\"h\"] or self::pre[@class=\"j\"] or self::div[@class=\"f\"]]",
        "insertBefore": "id(\"navbar\")"
    },
    {
        "url": "^https?://groups\\.google(?:\\.[^./]{2,3}){1,2}/groups/search",
        "nextLink": "id(\"navbar\")//td[last()][@class=\"b\"]/a",
        "pageElement": "id(\"res\")/*[self::div or self::br]"
    },
    {
        "url": "^http://scholar\\.google\\.(?:[^.]{2,3}\\.)?[^./]{2,3}/scholar",
        "nextLink": "//div[contains(concat(\" \", @class, \" \"), \" n \")]/table/tbody/tr/td[last()]/a|id(\"gs_n\")//table/tbody/tr/td[span and b]/following-sibling::td/a",
        "pageElement": "//form[@name=\"gs\"]/following-sibling::node()[ following::div[contains(concat(\" \", @class, \" \"), \" n \")] ]|id(\"gs_ccl\")/div[@class=\"gs_r\"]"
    },
    {
        "url": "^http://(?:[^.]+\\.)?google\\.(?:[^.]{2,3}\\.)?[^./]{2,3}/news",
        "nextLink": "id(\"end-next\")/..",
        "pageElement": "id(\"search-stories story-articles\")"
    },
    {
        "url": "^https?://www\\.google\\.(?:[^.]{2,3}\\.)?[^./]{2,3}/history/",
        "nextLink": "//td[@class=\"bl\"][last()-1]/a|//div[@class=\"nn\"]/parent::a",
        "pageElement": "//table[@class=\"res\"]"
    },
    {
        "url": "^http://www\\.google\\.[^./]{2,3}(?:\\.[^./]{2,3})?/logos/",
        "nextLink": "//div[@class=\"base-nav\"]//a[contains(., \"«\")]",
        "pageElement": "id(\"doodles\")|//div[contains(concat(\" \", @class, \" \"), \" title \")]"
    },
    {
        "url": "^http://books\\.google\\.(?:[^.]{2,3}\\.)?[^./]{2,3}/books",
        "nextLink": "id(\"navbar\")//span[@class=\"navlink\"]/parent::a",
        "pageElement": "id(\"main_content\")/*"
    },
    {
        "url": "^https?://appengine\\.google\\.com/datastore/explorer\\?.",
        "nextLink": "id(\"ae-datastore-explorer\")//a[@class=\"ae-paginate-next\"]",
        "pageElement": "id(\"ae-datastore-explorer-entities\")"
    },
    {
        "url": "^https?://(?:[^/]+\\.)?google(?:\\.\\w{2,3}){1,2}/movies",
        "nextLink": "id(\"pnnext\")|id(\"navbar navcnt nav\")//td[span]/following-sibling::td[1]/a|id(\"nn\")/parent::a",
        "pageElement": "id(\"movie_results\")/*"
    },
    {
        "url": "^https://chrome\\.google\\.com/webstore/(?:list|search)",
        "nextLink": "//table[@class=\"paginator\"]//td[last()]/a",
        "pageElement": "//div[@class=\"mod-fullpage\"]/div[@class=\"mod-body\"]"
    },
    {
        "url": "^http://www\\.google\\.com/intl/ja/googlebooks/chrome/",
        "nextLink": "id(\"info\")/p[contains(concat(\" \",@class,\" \"),\"nav\")]/a[img[@src=\"images/arrowright.gif\"]]",
        "pageElement": "id(\"page\")/div[a[img] or img]"
    },
    {
        "url": "^http://desktop\\.google\\.(?:[^.]{2,3}\\.)?[^./]{2,3}/",
        "nextLink": "id(\"content\")/table[@class=\"header\"]//a[contains(., \"»\")]",
        "pageElement": "id(\"content\")/*[(self::table and @class=\"gadget\") or (self::br and @style=\"clear: both;\")]"
    },
    {
        "url": "^http://sketchup\\.google\\.com/3dwarehouse/search\\?",
        "nextLink": "//div[@class=\"pager_next\"]/parent::a",
        "pageElement": "//div[@class=\"searchresult\"]/ancestor::tr[1]"
    },
    {
        "url": "^https://www\\.google\\.com/a/cpanel/[^/]+/",
        "nextLink": "//tr//ul[@class=\"inlinelist\"]//a[contains(text(),\"›\")]",
        "pageElement": "id(\"list\")"
    },
    {
        "url": "^http://www\\.google\\.com/support/forum/",
        "nextLink": "//div[@class=\"wppkrootCSS\"]/a[contains(text(), \">\")]",
        "pageElement": "//table[@class=\"lctCSS\"]"
    },
    {
        "url": "^http://www\\.google\\.com/products\\?",
        "nextLink": "id(\"nn\")/parent::a",
        "pageElement": "id(\"results\")|id(\"results\")/following-sibling::p[@class=\"clear\"]"
    },
    {
        "url": "^http://www\\.google\\.com/reviews/t",
        "nextLink": "//a[contains(text(), \"Next\")]",
        "pageElement": "id(\"allresults\")/table",
        "insertBefore": "//div[contains(concat(\" \", normalize-space(@class), \" \"), \" t_ftr \")]"
    },
    {
        "url": "^http://www\\.google\\.com/cse\\?cx=",
        "nextLink": "//div[@class='gsc-cursor-page gsc-cursor-current-page']/following-sibling::node()[1]",
        "pageElement": "//div[@class='gsc-webResult gsc-result']",
        "insertBefore": "//div[@class='gsc-cursor-box gs-bidi-start-align']"
    },
    {
        "url": "^http://www\\.google(?:\\.[^./]{2,3}){1,2}/m\\?.",
        "nextLink": "//*[starts-with(text(), \"Next page\") or starts-with(text(), \"次のページ\")]",
        "pageElement": "id(\"universal\")/div[not(@*)]",
        "insertBefore": "id(\"universal\")/*[@class][last()]"
    },
    {
        "url": "^http://followfinder\\.googlelabs\\.com/search",
        "nextLink": "//td[@class=\"more\"]//a[last()]",
        "pageElement": "//table//tr[//div]"
    },
    {
        "url": "^http://www\\.googlelabs\\.com/",
        "nextLink": "id(\"nav\")//td[@class=\"cur\"]/following-sibling::td[1]/a",
        "pageElement": "id(\"nav\")/preceding-sibling::ul"
    },

    // ========================= github ================================
    {name: "github mix",
        "url": "^https?://github\\.com/(?:dashboard|(?:timeline|[^/]+/[^/]+/(?:comments|network/feed)))",
        "nextLink": "//a[@hotkey=\"l\"]|//div[contains(concat(\" \",@class,\" \"),\" pagination \")]/a",
        "pageElement": "//div[@class=\"news\"]/div[contains(@class, \"alert\")]"
    },
    {name: "github 搜索",
        url: "^https?://github\\.com/search",
        nextLink: "//div[@class='pagination']/a[@rel='next']",
        autopager: {
            pageElement: "id('code_search_results issue_search_results')|//div[@class='sort-bar']/following-sibling::*[following-sibling::span[@class='search-foot-note']]",
            insertBefore: "//div[@class='pagination']",
            stylish: 'li.repo-list-item { text-align: left; }'
        }
    },
    {
        "url": "^https?://gist\\.github\\.com/",
        "nextLink": "//div[contains(concat(\" \", @class, \" \"), \" pagination \")]/a[contains(text(),\"Older\")]",
        "pageElement": "//div[contains(concat(\" \", @class, \" \"), \" gist-item \")]"
    },
        // 有點小問題，需要刷新下才有用
    {
        "url": "^https?://github\\.com/(?:changelog|[^/]+/[^/]+/commits)",
        "nextLink": "//a[contains(text(), \"Older\")]",
        "pageElement": "//*[starts-with(@class,\"commit-group\")]"
    },
    {
        "url": "^https?://github\\.com/[^/]+/[^/]+/watchers",
        "nextLink": "//div[@class=\"pagination\"]/span[@class=\"current\"]/following-sibling::a",
        "pageElement": "id(\"watchers\")"
    },
    {
        "url": "^https?://github\\.com/[^/]+/following",
        "nextLink": "//a[hotkey='l']",
        "pageElement": "id(\"watchers\")"
    },
    {
        "url": "^http://learn\\.github\\.com/p/",
        "nextLink": "//a[contains(text(), \"next\")]",
        "pageElement": "//div[@class=\"container\"]/div[@id=\"welcome\" or @class=\"content\"]"
    },
    {
        "url": "^http://github\\.com/blog",
        "nextLink": "//div[contains(concat(\" \",@class,\" \"),\" pagination \")]/a[contains(text(),\"Next\")]",
        "pageElement": "id(\"posts\")/div[contains(concat(\" \",@class,\" \"),\" list \")]/ul/li"
    },

    // ========= 很少用的 ================
    {name: 'bookcool-小說合集',
        url: '^http://www\\.bookcool\\.com/.*\\.htm',
        nextLink: '//div[@id="object1"]/descendant::a[last()][@href]',
        pageElement: '//div[@align="center"]/table[@width !="100%"]',
    },
    {name: 'Hachiya Makoto',
        url: '^http://g\\.e-hentai\\.org/s/.*$',
        nextLink: '//img[@src="http://ehgt.org/g/n.png"]/..',
        pageElement: '//body/div[@class="sni"]',
        exampleUrl: 'http://g.e-hentai.org/s/2221a78fe2/592744-3',
        useiframe: true
    },
];

//統配規則..用來滅掉一些DZ.或者phpwind論壇系統..此組規則..優先級自動降為最低..
var SITEINFO_TP=[
    {name: 'Discuz 論壇 - 搜索',
        url: '^https?://bbs\\.[a-z]+\\.cn/search\\.php\\?mod=forum',
        preLink: '//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
        nextLink: '//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href]',
        autopager: {
            pageElement:'//div[@id="threadlist"]',
            replaceE: '//div[@class="pg"][child::a[@class="nxt"]]'
        }
    },
    {name: "Discuz 論壇 - 導讀",
        url: /^https?:\/\/(?:bbs|u)\.[^\/]+\/(?:forum\.php\?mod=guide|home\.php\?mod=space)/i,
        preLink: '//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
        nextLink: '//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href]',
        autopager: {
            pageElement: "//div[@id='postlist'] | //form[@method='post'][@name] | //div[@id='threadlist']/div[@class='bm_c'] | //div[@class='xld xlda']",
            replaceE: '//div[@class="pg"][child::a[@class="nxt"]]'
        }
    },
    {name: 'Discuz論壇列表',
        url:/^https?:\/\/(?:www\.[^\/]+\/|[^\/]+\/(?:bbs\/)?)(?:2b\/)?(?:(?:forum)|(?:showforum)|(?:viewforum)|(?:search.php?)|(?:forumdisplay))+/i,
        preLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
        nextLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href] | //div[@class="p_bar"]/a[@class="p_curpage"]/following-sibling::a[@class="p_num"]',
        autopager:{
            pageElement:'//form[@method="post"][@name] | //div[@id="postlist"] | //div[@id="threadlist"][@class="slst mtw"] | //div[@class="slst"] | //div[@class="tl" or @class="vt"]/div[@class="bm"]',
            replaceE: '//div[@class="pages" or @class="pg"][child::a[@class="next" or @class="nxt"][@href]]',
            lazyImgSrc: 'file|pagespeed_lsc_url'
        }
    },
    {name: 'Discuz論壇帖子',
        url:/https?:\/\/(?:www\.[^\/]+\/|[^\/]+\/(?:bbs\/)?)(?:2b\/)?(?:(?:thread)|(?:viewthread)|(?:showtopic)|(?:viewtopic))+/i,
        preLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
        nextLink:'//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href] | //div[@class="p_bar"]/descendant::a[text()="››"]',
        autopager:{
            pageElement:'//div[@id="postlist"] | //form[@method="post"][@name]',
            replaceE: '//div[@class="pages" or @class="pg"][child::a[@class="next" or @class="nxt"][@href]]',
            lazyImgSrc: 'zoomfile',
            stylish: '.mbbs_code{font-family:Monaco,Consolas,"Lucida Console","Courier New",serif;font-size:12px;line-height:1.8em;list-style-type:decimal-leading-zero;padding-left:10px;background:none repeat scroll 0 0 #f7f7f7;color:#666;border:1px solid #ccc;overflow:hidden;padding:10px 0 5px 10px}',
            filter: function(pages){
                // 回復後插入到最後一頁
                var replays = document.querySelectorAll("#postlistreply");
                if(replays.length > 1){
                    var first = replays[0];
                    first.parentNode.removeChild(first);
                }

                // 在卡飯論壇如果不存在，會提示，所以默認禁用
                // var SyntaxHighlighter = unsafeWindow.SyntaxHighlighter;
                // if (SyntaxHighlighter && SyntaxHighlighter.highlight) {
                //     SyntaxHighlighter.highlight();
                // }
            },
            documentFilter: function(doc) {
                // 卡飯論壇的下一頁代碼區域可能無法著色，所以手動修改並添加樣式
                var pres = doc.querySelectorAll('pre[class^="brush:"]');
                [].forEach.call(pres, function(pre){
                    pre.classList.add('mbbs_code');
                });
            }
        }
    },
    {name: 'phpWind論壇列表',
        url:/^https?:\/\/(?:www\.[^\/]+\/|[^\/]+\/(?:bbs\/)?)?thread/i,
        preLink:'//div[starts-with(@class,"pages")]/b[1]/preceding-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/preceding-sibling::li/a[1][not(@class)][@href]',
        nextLink:'//div[starts-with(@class,"pages")]/b[1]/following-sibling::a[1][not(@class)] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/following-sibling::li/a[1][not(@class)]',
        autopager:{
            pageElement:'//div[@class="t z"] | //div[@class="z"] | //div[@id="ajaxtable"]',
        }
    },
    {name: 'phpWind論壇帖子',
        url:/^https?:\/\/(?:www\.[^\/]+\/|[^\/]+\/(?:bbs\/)?)?read/i,
        preLink:'//div[starts-with(@class,"pages")]/b[1]/preceding-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/preceding-sibling::li/a[1][not(@class)][@href]',
        nextLink:'//div[starts-with(@class,"pages")]/b[1]/following-sibling::a[1][not(@class)] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/following-sibling::li/a[1][not(@class)]',
        autopager:{
            pageElement:'//div[@class="t5"] | //div[@class="read_t"] | //div[@id="pw_content"]',
        }
    },
    {name: 'phpBB列表',
        url:/^https?:\/\/[^\/]+(\/[a-z,0-9]+)?\/viewforum/i,
        siteExample:'http://www.firefox.net.cn/forum/viewforum.php?f=4',
        nextLink:'auto;',
        autopager:{
            pageElement:'(//div[@id="page-body"]/div[@class="forumbg"]|//table[@class="forumline"]|//table[@class="tablebg"])',
            //replaceE:'//fildset[@class="display-options")]',
            remain:1/3,
        }
    },
    {name: 'phpBB帖子',
        url:/^https?:\/\/[^\/]+(\/[a-z,0-9]+)?\/viewtopic/i,
        siteExample:'http://www.firefox.net.cn/forum/viewtopic.php?t=34339',
        nextLink:'auto;',
        autopager:{
            //pageElement:'//div[@id="page-body"]',
            pageElement:'(//div[@id="page-body"]/div[contains(@class,"post")]|//table[@class="forumline"]|//table[@class="tablebg"])',
            //replaceE:"//fildset[@class='display-options']",
        }
    },
    {name: 'phpBB Search',
        url: /^https?:\/\/forum\.[^\/]+\/search\.php/i,
        exampleUrl: 'http://forum.everedit.net/search.php?keywords=%E5%A4%A7%E7%BA%B2',
        nextLink: 'auto;',
        autopager: {
            pageElement: 'id("page-body")/div[starts-with(@class, "search post")]',
            replaceE: 'id("page-body")/ul[@class="linklist"]'
        }
    },
];

//兼容 oautopager的規則放在這裡,此規則組..優先級最低(比統配規則還低)..
//所以說盡量不要放規則在這個組裡面.
var SITEINFO_comp=[
    {name: 'discuz論壇通用搜索',
        url: '^http://[^/]+/f/(?:discuz|search)',
        nextLink: 'auto;',
        pageElement: 'id("result-items")',
    },
    {name: 'View forum - 通用',
        url: '^https?://.+?/viewforum\\.php\\?',
        nextLink: '//span[@class="gensmall"]/b/b/following-sibling::a[1] | (//table/tbody/tr/td[@class="nav"])[last()]/b[last()]/following-sibling::a[1]  | //div[@class="pagination"]/span/strong/following-sibling::a[1] | //a[text()="Next"]',
        pageElement: '//ul[contains(concat(" ",@class," ")," topics ")]|//form[table/@class="forumline"]',
    },
    {name: 'wiki 通用',
        url: '.\\?(?:.+&)?search=',
        nextLink: '//a[@class="mw-nextlink"]',
        pageElement: '//ul[@class="mw-search-results"]',
    },
    {name: '通用 Forum 規則1',
        url: '^https?://.*((showthread\\.php\\?)|(forum|thread))',
        nextLink: '//a[@rel="next"]',
        pageElement: '//div[@id="posts"]|//ol[@id="posts"]/li',
        separatorReal: false
    },
    {name: '通用 Forum 規則2',
        url: '^https?://[^?#]+?/showthread\\.php\\?',
        nextLink: '//tr[@valign="top"]//div[@class="pagenav"]//a[contains(text(), ">")]',
        pageElement: '(//div[@class="pagenav"])[1]|//div[@id="posts"]/node()',
        separatorReal: false
    },
    {name: '通用 Forum 規則3',
        url: '^https?://.*((forumdisplay\\.php\\?)|forum)',
        nextLink: '//a[@rel="next" or (text()=">")]',
        pageElement: '//tbody[starts-with(@id,"threadbits_forum_")]/tr[td[contains(@id,"td_threadtitle")] and not(td/div/text()[contains(.,"Sticky:")])]|//ol[@id="threads" and @class="threads"]/li',
        separatorReal: false
    },
    {name: 'PHPWind 5.3.0 / 6.0.0 / 6.3.2 / 7.0.0 / 7.5.0 - View Thread',
        url: '^https?://.+/read\\.php\\?.*tid((=[0-9]+.*)|(-[0-9]+.*\\.html?))$',
        nextLink: 'auto;',
        pageElement: '//form[@name="delatc"]',
        exampleUrl: 'http://www.yydzh.com/read.php?tid=1584013',
    },
];

//分頁導航的6個圖標:
var sep_icons={
    top:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOjM3NkQ2MTFFOTUyNjExREZBNkRGOEVGQ0JDNkM0RDU3IiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOjM3NkQ2MTFGOTUyNjExREZBNkRGOEVGQ0JDNkM0RDU3Ij4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Mzc2RDYxMUM5NTI2MTFERkE2REY4  RUZDQkM2QzRENTciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Mzc2RDYxMUQ5NTI2MTFERkE2  REY4RUZDQkM2QzRENTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz7bso/VAAACxElEQVR42rSUS0iUURTH//d+j9EppSRtCjEi  w0EhjR6kIyUpWilFpbUTei1auMoellAQZFSbVrkQilplhZC9IKyNQg8CXVQKZigaOgojNdg3j++7  nTtjAzPqTI50Zu7ce+ec87vnnPtgQghIcZ3VxiGwGksRhomemwGHHKqRPwl6+ujFJXHvPLwWCUyN  VT7qvZ4UtK7oQtQ8CizLUlt4fr4U6ctmExPyZ478LelcMMNIa3vL2nkrR7KnvEaR/auuZ2akeHMt  f0SGsSvFSuk5rWOzs2RvXm6+zRJBDAx+8fUNfHjZfSNwMJ4fj6ekk9KU49hYuaXAZfs4/BzvhztR  6Nxmy85aXyl1SYFdjVrViuWrmqtLj9h7R18jKPwImD6CP0V5cY09fdnKZmmzKDA55Kqqrb2u4oR9  yNOHXz4PVEWDbtPhNSfR7+lGze46u6bp7dL2n8BkmMY4umrLj6XNCA8mfn4PQ3UdNgJzGzA28xnT  1giqdh4I2UqfuGAyYGTYUbH90JrMDAcbmuqFwlWCaiGoxQwomoCmc3z1vEV6RgrbUVTmkD7Sd+GI  GVo25Ra7tjp3af3ud1C5Dk3VQ9FazI+gYkAlqKqzUP/J3Yn8vAI9N8dZIn2jUJG3olE7nJ214cGp  /U2pMnVTmLCsIN4M3UMAXrj9g1B0AUXloAixb90Z0gtYpoBh+PD4xf2ZqemJ+p5bgSdRF4SMG0bd  31Ivt50MzxUYV463pchF3L/HaE5QjVNj4JzuocJw++5Vw/SLlFmEXTKojwbTgS+LqbfgZGmKAAzL  S+Xg4ARTCc5VFhpLKEXIFn1B5E5OG+PUy4wkDCGorDHj8R+lBGAGI+iN2t3QIowlfO3ig+kjb1v4  9aI2u1lBv0Xj+GA1nlKel+q8BnANdBrCdZVNBiwXSRY8eam1PjNBxlMLZpvo2UxWOP6T/BFgAOBe  8h+hfm64AAAAAElFTkSuQmCC',
    bottom:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOjg2RjU3NUQzOTUyNjExREY4M0U4RDZGQThBMjcwMEIzIiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOjg2RjU3NUQ0OTUyNjExREY4M0U4RDZGQThBMjcwMEIzIj4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODZGNTc1RDE5NTI2MTFERjgzRThE  NkZBOEEyNzAwQjMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ODZGNTc1RDI5NTI2MTFERjgz  RThENkZBOEEyNzAwQjMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz6bp+ZPAAAC0UlEQVR42rRVXUhUQRT+5t67uzdZwwX/0FKS  CCMiwcwi6QfpwcAgKHvzpR6EoKeQpIcIJCOCIB8SooIgKK2gssBwQ0PXsB8s8KdSIhFzXbHS2vbe  ufdOM3fd1mx3zRUPezgzzDnfnP3mm7mEMYaVMAkrZEq8hZ0nHQEe0hepD3RfpJlLAhagtcfPgBBA  sGWZzHbT4JEC2e4NON1UnbHkjoURiaDdf8kGpCELOncaMkF0FceKG5PnmPBVxSlBkom9iehemEN2  gYEt7/CEasLCiQKpihuLqSkhMLMAQ+ecCl5NMQ9vkqZm82glVkVZrSMy7uC5uyMT2UlCnFvV0CxY  Fps7PN6t5IZMHLB4MpER4uph86jr5GFP1wUKZd7GjelpWSWH9lenqKpL8KoyDmbolt25afBoEnic  uTBMand89uh1VeboYn71YcOvscmRxliquDf13V/i9T06sWtH+aqu8VuwJO2P3ITMUuUMPiagBoX3  w02oDje2rq3AE9/t0Fhg5LLAiM0xQ93w6JBv4H2/XpxZaXcrOBZRMVVIzAld1zmwDsPSUZi5Ha+G  Oum74Z5uUZvo8MQ/PPiir2NiZjrENnr2gnJQkxIOqkLTdA5MYVoGCtKLEJieYO2997+Imr9kE0cV  szyxvO35g9k0KQ+5KZtgaZgD1W0+s1avQwrx4K73hp0rav6VmxB9xKM2TKle1fqsJVjoKYObc6tr  YdBUlwcFni1oab8WNAytSuRGb1QUJ5GO22Z+fq339rQGS/MP2LdNIU4UrdmHx13NwW8/pupFTlJv  BbeGsclP294OvawoXV/pkoiC1/3d2ujEx6di7X+fzc/ccxaoREiN9A32Ijsn/Dq+GfCJmkruNAbe  OPf8MHD0LPNqqurivEbiFyav5shmOd7709TckBeTCsJvQ0vf+aS+GIeLTiXmeGFC8p+mqMz8V+6c  y1oWGoE/MvwtwABuklC1izbNcAAAAABJRU5ErkJggg==',
    pre:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOkUzRDUyNEQ5OTBFMjExREZCMjNFRjQzNkMwMjdFNUMwIiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOkUzRDUyNERBOTBFMjExREZCMjNFRjQzNkMwMjdFNUMwIj4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RTNENTI0RDc5MEUyMTFERkIyM0VG  NDM2QzAyN0U1QzAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RTNENTI0RDg5MEUyMTFERkIy  M0VGNDM2QzAyN0U1QzAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz6I8cyJAAAC20lEQVR42tRVW0hUURTd+5xz550PVMwcUksJ  JY2wrMHpoxQzQrFRxF5iGn1EERGEZCBI9OFPUR9ZkNRX0a9fkeBPEhFBP1mDFj0xdVTSqXnce8/p  3Gtjvh+IH53LZu6Bc9dZe+2196AQAtZjEVinxWIv3stsqXM3ATG+16E1iVbBVwUsOC525pI7dfNp  gRApDnxulvvrq5KCoFgoKhLjktsOeWud5d7qhHhX0lnPBaVqVcA6J3Njp9224ZGvtMHhD7yE/vFe  UlN+PM0V52jPr6WFKwbmTJ0ZbsZYt6+k0RkIfYLByX74HvTDYLSP1FQe25KYpTzYtJel25LQ1A+T  ERcFtgenw8U47anaX5+AFh0+BN6AwizAKAX/2HPQ7OPEV+HLzSyGu1YH2JOyFSICQmi6RhYEThkx  g6oO1lXuqctIS0kn74deACOKGZwIQCn62/GnkJaZggdLDpdlVyo3RgdU0yU4x7nTu8EsasQdT36Z  Jz9nt9L3oxcoMqASFOQvF5p0HKDOBbwaeUJ2FBTQosI9ddtPWq4Z30vGuCCwEORiXkbRiZJdR6zv  JFMBXILSKXAkQlWjgmuyFrqA4K/f0PO1E0u9B5w52zaecleQRkZm9wHGWvpoe17oTFWLjVKZtkTQ  JcNu/0NQ9bAIa5M4HBkAq5MKi41gdW6L5A1E6MgnJkbVjse3hz6+Dp379ox3zWuQL8P9tqv3GqbS  YBhua+qUEER6maIajchUZQZRQwyZi4bYeqs59DMobPKI1UrRHZcB5+Wn84FN/WPW04RsNDSl0KSn  VflwWSNNFo8LRF0Thoa2gfucLNvScxdKKkalDdbGnbLluRrhhArCNVUnBNcw3fCv7xVqMc8a40eL  cIxGVHkhrn1s2hWXwdkQybAP6sYNywAvOSv3ba2VM0OTOqswGR4DlUdiXjL4rxB4NvehKx31qf+2  YmZtwXQo4siSMv53f03rBvxHgAEAqLoqsgGSMo4AAAAASUVORK5CYII=',
    next:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOkY3M0ZDRTgzOTBFMjExREZCNjlFQUY1QUIyNjQ1NzE3IiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOkY3M0ZDRTg0OTBFMjExREZCNjlFQUY1QUIyNjQ1NzE3Ij4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RjczRkNFODE5MEUyMTFERkI2OUVB  RjVBQjI2NDU3MTciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RjczRkNFODI5MEUyMTFERkI2  OUVBRjVBQjI2NDU3MTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz6Q0swTAAAC50lEQVR42tRVXUhUQRQ+M/dnd0sN/1gtAimW  LXsoiAixFyGIHnqNioioh36ghyh6sCAijAgiIoLowSRMBG1b1n5s0XxRtiyRlIpQ1M1sKxV1XffH  e2emM+u6qG11EXzoXM6de2fOfPeb8x3OJUIIWAmjsEKmzj+UndeWrv0kAgoJWTglT0cW0vqB96L5  144bxu/Ac5sWWeHpQxfT0xq1QbY9D1SqgUJVHHWovHfE+U/GU5Mc1uQoi1cFgYbua8mPErxK8reC  Q8sGm+qACtdh6zmejnLEEGlXCC4TTAiGSeiYEVm+eGMRDhxBpes2DVQbFWQuihtsdu4gFiopY1WM  T0tgEKqmCFUnVEuCCypTwgWXdwTnloH96CylIsdtcUUloNspqDpFdAoaXhKQcYZBAqhK4ql4sVT9  tHjhINzZsN3uPnngjDMnJ18jinAQEFy3KXIQzBBE023ImOEbJ5L51eM1dooVwpgB971V8YyMgy/M  5wMfYlcantaNJ8yI8H+7LXzDVRSrSlAFiKJRITVk3ERQA9r6auF10AfRRBjqW+7Ghsf6KzMCm9yU  Q3Xf5+8PWtpfzVSsPyayVq8CioSRFGiaTpAruplMBc7CZmcZtL57kvgY7KzFvbcyAquKKoLeJPil  zq439e97etiOwv1coURWnqAE0ZOgBkjw0qJy6O17awR6/YHiQXZq7ZCRWTyptOpUIBQQtN9nnH3Z  +swfGhoVW3L3yBQTygmeykj6JmQaGh3hzYH6oBY196VE/2NV8FQj4IkoxIY64ISnyfNJjeVyd94u  MBkDw5yFjQXbQMwq4G17OGlSVoHxESt1LBaMIxODxtFGX91AsV7K12W5oTjbBQWOEvC0Vs+Yprkb  Y74ut212RcLRC43Nj0Ku3HLuLtgJnpaaaCw+fRDXui21zb+YdyoyXtrc/vgcdg3bRHjsMurZZLkf  L7XQXgahdOrhevnoFxeWxxTKcNNKEyL/3a9pxYB/CTAALMFZuEnI1jsAAAAASUVORK5CYII=',
    next_gray:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOjg1RDA5RjFGOTUyMjExREZCMkM4QUZEOEY4Qzg2MDREIiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOjg1RDA5RjIwOTUyMjExREZCMkM4QUZEOEY4Qzg2MDREIj4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODVEMDlGMUQ5NTIyMTFERkIyQzhB  RkQ4RjhDODYwNEQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ODVEMDlGMUU5NTIyMTFERkIy  QzhBRkQ4RjhDODYwNEQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz62tt8rAAACiUlEQVR42tRVS6tSURTe5/hWFAderhoIKqmI  U2eCBg2a9AOaBQ4iZxE0yCCcNYkGDYWaNEh8ICQpoYg4CJQIFA0chKGpBb7A9+Oc1jp4LnK12+GC  gxYs1j7stb79rcfeh2JZlpxCaHIiEfMLj8dzee836NlVwRRF/QKj57+LxeIh8BE5CwQChC+VRCIh  arWaiEQiTsViMQkGg+f/ZDyfz4lcLj9wiEajF2uz2UwUCgWRyWTE5/MJr/FqteIY8gqporI7SxaL  xfWbt1wuL4ClUimWgAMGYdbrNecjZJKOTgWCYzzUkYV60mh53/2MhAJ/At1iLLIDXWCTsGkATGGz  aJomDMOQ7XbLAcP+YufP62HzRqPRa5PJZPf7/edarVYC6SvwAADGOrAARmHTABgwWQqBQ6GQHA/f  bDYkHA4vjjJuNBofO51OKB6P96FJbDabZVOpFA2BLDBFxlhr7gBknM/nSalUIrPZjEQikXm73X56  FBhPBXnTbDbfFgqFqdfrZVUqFZc+KjIHthRfCmyow+EguVxuWavV3kHsq6PAyKher+PyWblcfl+p  VLZut5tBUMwdU0ZQJIDW6XSSarW6/gwyGAwe9vv94xcEa6bRaIhSqaRhrB4B0A24aXdcLhcFKXM1  RVA8AJn2ej0mnU7/gNm/u2v6X6cCJ4Hazeu81Wo9SCaT3yATxm63c+njHFssFo4x7I3A9xboRMgc  s3v2J6R3PxaLfdfr9YzRaCQGg4HodDqSSCSmwP42+LSv+2x+mUwmTwCoa7PZGFAEnU2n03uw91XQ  s3mFJMfjsTOTyTyGtWw4HD4H+0Hwe3xZrFbr/ueLbrd7Exo4hvVLIY8Q9d/9mk4G/EeAAQCBEkva  rHrRPgAAAABJRU5ErkJggg==',
    pre_gray:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ  bWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdp  bj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6  eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEz  NDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJo  dHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlw  dGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAv  IiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RS  ZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpD  cmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlE  PSJ4bXAuaWlkOjc0MTI5MDY4OTUyMjExREZCODVDREYyM0U0QjMzQkQzIiB4bXBNTTpEb2N1bWVu  dElEPSJ4bXAuZGlkOjc0MTI5MDY5OTUyMjExREZCODVDREYyM0U0QjMzQkQzIj4gPHhtcE1NOkRl  cml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NzQxMjkwNjY5NTIyMTFERkI4NUNE  RjIzRTRCMzNCRDMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzQxMjkwNjc5NTIyMTFERkI4  NUNERjIzRTRCMzNCRDMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1l  dGE+IDw/eHBhY2tldCBlbmQ9InIiPz5D2F5XAAACZklEQVR42tSVz6sSURTH7x0VJxX8CampSQtF  /AESConiQkhdlKKCLdr0YxW0iDaBSBLZok3tol27/oC3TcS14EpEBV24UOO5EETLn9M5g4KoPXu9  XHTgMNc7537me7/3zEg5jiOnCIacKISbQSAQuKjuI6VULhAInhSLxdWlFKMlv8mXer3+qU6nu79c  Ll/9KyvuKZXKN9FoVBqJRBRyufyZz+eLXxXslkqlXxOJhKTZbBJIBsY6mUz23uFw3P5bsEEoFH4D  kHQwGJBer0e63S7p9/tMKpW6pVarv5hMphsSiYRi8eZ6EDybzTYpg5/FeDyuYBiGtNttIhKJCBwc  aTQaZLFYMHDPZjQaP8P8NY1Gw0wmEw7nD4LH4zGmQCwWn4GnN7VaLVOv13kgqCfQFZhctVolcJg0  HA7ftdlsH2BHfJfg/YNglUqF+ekOhNPpFNVqNYKKEYpX6AhcTFerFSmXy4zL5RJ4PJ4Hbrf7La4H  xfQgGNa8sNvtD0OhkBiVYquhWoRCcvP5nEMoJu6uVCrRYDAoNZvNj6xW62MUcPAFMRgM79LpNIsF  Xq+XBxQKBYQjlIIifgzKaSwWw+0z8HCaTCbVw+HwtcViOW+1Wmd74E6nw2azWX4MgJ+5XI5F30At  nU6n/IM220VgPp//AfNYI4Yag0KheA639sHoxmYAqjiEohXo7RrKHx5CcQ6CrVQqzNFvxW6su2D7  tFfrllrtttalX+kNFPt47SlBv7Hfd9vrjxVvB8uyZOu7jX5cDez3+3mPMUejEard281R8E7h90wm  c/3IRs4vtPG/+2s6GfiXAAMAq3cXTADTBMIAAAAASUVORK5CYII=',
};

//懸浮窗的狀態顏色.
var FWKG_color={
    loading:'#8B00E8',    // 讀取中狀態
    prefetcher:'#5564AF', // 預讀狀態
    autopager:'#038B00',  // 翻頁狀態
    Apause:'#B7B700',     // 翻頁狀態(暫停).
    Astop:'#A00000',      // 翻頁狀態(停止)(翻頁完成,或者被異常停止.)(無法再開啟)
    dot:'#00FF05',        // 讀取完後,會顯示一個小點,那麼小點的顏色.
};

//當沒有找到規則的時候,進入自動搜索模式.
//在沒有高級規則的網站上.的一些設置..
var autoMatch={
    keyMatch:true,              //是否啟用關鍵字匹配
        cases:false,            //關鍵字區分大小寫....
        digitalCheck:true,      //對數字連接進行檢測,從中找出下一頁的鏈接
        pfwordl:{               //關鍵字前面的字符限定.
            previous:{          //上一頁關鍵字前面的字符,例如 "上一頁" 要匹配 "[上一頁" ,那麼prefix要的設置要不小於1,並且character要包含字符 "["
                enable:true,
                maxPrefix:3,
            character: [' ', '　', '[','［', '〔', '<', '＜', '‹', '«', '<<', '『', '「', '【', '(', '←']
            },
            next:{//下一頁關鍵字前面的字符
                enable:true,
                maxPrefix:2,
                character: [' ', '　', '[','［', '〔', '『', '「', '【', '(', '←']
            }
        },
        sfwordl:{               //關鍵字後面的字符限定.
            previous:{          //上一頁關鍵字後面的字符
                enable:true,
                maxSubfix:2,
                character: [' ', '　', ']','］', '〕', '』', '」', '】', ')', '→']
            },
            next:{              //下一頁關鍵字後面的字符
                enable:true,
                maxSubfix:3,
                character: [' ', '　', ']','］', '〕', '>', '﹥', '›', '»', '>>', '』', '」', '】', ')', '→', '▸']
            }
        },
    useiframe: GM_getValue('SITEINFO_D.useiframe') || false,            //(預讀)是否使用iframe..
    viewcontent: false,          //查看預讀的內容,顯示在頁面的最下方.
    FA: {                       //強制拼接 選項 功能設置.
        enable:false,           //默認啟用 強制拼接
        manualA:false,          //手動翻頁.
        useiframe:false,        //(翻頁)是否使用iframe..
            iloaded:false,      //(只在opera有效)如果使用iframe翻頁..是否在iframe完全load後操作..否則在DOM完成後操作
            itimeout:0,         //當使用iframe翻頁時在完成後繼續等待多少毫秒後,在操作..
        remain:1,               //剩余頁面的高度..是顯示高度的 remain 倍開始翻頁..
        maxpage:99,             //最多翻多少頁..
        ipages:[false,2],       //立即翻頁,第一項是控制是否在js加載的時候立即翻第二項(必須小於maxpage)的頁數,比如[true,3].就是說JS加載後.立即翻3頁.
        separator:true,         //顯示翻頁導航..(推薦顯示.)..
    }
};

//上一頁關鍵字
var prePageKey = [
    '較新的文章', '较新文章', 'Previous 75', '«', 'Newer posts',
    '上一頁', '上一页', '上1頁', '上1页', '上頁', '上页',
    '翻上頁', '翻上页',
    '上一張', '上一张', '上一幅', '上一章', '上一章', '上一節', '上一节', '上一篇', '上一篇',
    '前一頁', '前一页',
    '後退', '后退', '上篇', '上篇',
    'previous', 'previous Page', '前へ', '前のページ', '前ページ',
    '前の 20 件','前の 15 件','前の 10 件','前の 5 件'
];

//下一頁關鍵字
var nextPageKey = [
    '較舊的文章', '较旧的文章', 'Next 75', '»', 'Older posts',
    '下一頁', '下一页','下1頁', '下1页', '下頁', '下页',
    '翻頁', '翻页', '翻下頁', '翻下页', '早期文章',
    '下一張', '下一张', '下一幅', '下一章', '下一節', '下一节', '下一篇',
    '後一頁', '后一页',
    '前進', '前进', '下篇', '後頁', '后页', '往後', '往后',
    'Next', 'Next Page', '次へ', '次のページ', '次ページ',
    '次の 20 件','次の 15 件','次の 10 件','次の 5 件'
];

// 出在自動翻頁信息附加顯示真實相對頁面信息，一般能智能識別出來。如果還有站點不能識別，可以把地址的特征字符串加到下面
// 最好不要亂加，一些不規律的站點顯示出來的數字也沒有意義
var REALPAGE_SITE_PATTERN = ['search?', 'search_', 'forum', 'thread'];


//------------------------下面的不要管他-----------------
///////////////////////////////////////////////////////////////////


//----------------------------------
// 主要用於 chrome 原生下檢查更新，也可用於手動檢查更新
var scriptInfo = {
    version: '6.5.0',
    updateTime: '2015/1/10',
    homepageURL: 'https://greasyfork.org/scripts/293-super-preloaderplus-one',
    downloadUrl: 'https://greasyfork.org/scripts/293-super-preloaderplus-one/code/Super_preloaderPlus_one.user.js',
    metaUrl: 'https://greasyfork.org/scripts/293-super-preloaderplus-one/code/Super_preloaderPlus_one.meta.js',
};

var setup = function(){
    var d = document;
    var on = function(node, e, f) {
        node.addEventListener(e, f, false);
    };

    var $ = function(s) { return d.getElementById('sp-prefs-'+s); };
    if($('setup')) return;

    var styleNode = GM_addStyle('\
        #sp-prefs-setup { position:fixed;z-index:2147483647;top:30px;right:60px;padding:20px 30px;background:#eee;width:500px;border:1px solid black; }\
        #sp-prefs-setup * { color:black;text-align:left;line-height:normal;font-size:12px; }\
        #sp-prefs-setup a { color:black;text-decoration:underline; }\
        #sp-prefs-setup div { text-align:center;font-weight:bold;font-size:14px; }\
        #sp-prefs-setup ul { margin:15px 0 15px 0;padding:0;list-style:none;background:#eee;border:0; }\
        #sp-prefs-setup input, #sp-prefs-setup select { border:1px solid gray;padding:2px;background:white; }\
        #sp-prefs-setup li { margin:0;padding:6px 0;vertical-align:middle;background:#eee;border:0 }\
        #sp-prefs-setup button { width:150px;margin:0 10px;text-align:center;}\
        #sp-prefs-setup textarea { width:98%; height:60px; margin:3px 0; }\
        #sp-prefs-setup b { font-weight: bold; font-family: "微軟雅黑", sans-serif; }\
        #sp-prefs-setup button:disabled { color: graytext; }\
    ');

    var div = d.createElement('div');
    div.id = 'sp-prefs-setup';
    d.body.appendChild(div);
    div.innerHTML = '\
        <div>Super_preloaderPlus_one 設置</div>\
            <ul>\
                <li>當前版本為 <b>' + scriptInfo.version + ' </b>，上次更新時間為 <b>'+ scriptInfo.updateTime + '</b>\
                    <a id="sp-prefs-homepageURL" target="_blank" href="' + scriptInfo.homepageURL + '"/>腳本主頁</a>\
                </li>\
                <li><input type="checkbox" id="sp-prefs-debug" /> 調試模式</li>\
                <li><input type="checkbox" id="sp-prefs-dblclick_pause" /> 鼠標雙擊暫停翻頁（默認為 Ctrl + 長按左鍵）</li>\
                <li><input type="checkbox" id="sp-prefs-enableHistory" /> 添加下一頁到歷史記錄</li>\
                <li title="下一頁的鏈接設置成在新標簽頁打開"><input type="checkbox" id="sp-prefs-forceTargetWindow" /> 新標簽打開鏈接</li>\
                <li><input type="checkbox" id="sp-prefs-SITEINFO_D-useiframe" /> 在預讀模式下，默認啟用 iframe 方式</li>\
                <li><input type="checkbox" id="sp-prefs-SITEINFO_D-a_enable" /> 默認啟用自動翻頁 </li>\
                <li><input type="checkbox" id="sp-prefs-SITEINFO_D-a_force_enable" /> 自動翻頁默認啟用強制拼接</li>\
                <li>自定義排除列表：\
                    <div><textarea id="sp-prefs-excludes" placeholder="自定義排除列表，支持通配符。\n例如：http://*.douban.com/*"></textarea></div>\
                </li>\
                <li>自定義站點規則：\
                    <div><textarea id="sp-prefs-custom_siteinfo" placeholder="自定義站點規則"></textarea></div>\
                </li>\
            </ul>\
        <div><button id="sp-prefs-ok">確定</button><button id="sp-prefs-cancel">取消</button></div>';
    div = null;

    var close = function() {
        if (styleNode) {
            styleNode.parentNode.removeChild(styleNode);
        }
        var div = $('setup');
        div.parentNode.removeChild(div);
    };

    on($('ok'), 'click', function(){
        GM_setValue('enableHistory', prefs.enableHistory = !!$('enableHistory').checked);
        GM_setValue('forceTargetWindow', prefs.forceTargetWindow = !!$('forceTargetWindow').checked);
        GM_setValue('SITEINFO_D.useiframe', SITEINFO_D.useiframe = !!$('SITEINFO_D-useiframe').checked);
        GM_setValue('SITEINFO_D.autopager.enable', SITEINFO_D.autopager.enable = !!$('SITEINFO_D-a_enable').checked);
        GM_setValue('SITEINFO_D.autopager.force_enable', SITEINFO_D.autopager.force_enable = !!$('SITEINFO_D-a_force_enable').checked);

        GM_setValue('debug', xbug = !!$('debug').checked);
        debug = xbug ? console.log.bind(console) : function() {};

        GM_setValue('dblclick_pause', $('dblclick_pause').checked);
        GM_setValue('excludes', prefs.excludes = $('excludes').value);
        GM_setValue('custom_siteinfo', prefs.custom_siteinfo = $('custom_siteinfo').value);

        SP.loadSetting();

        close();
    });

    on($('cancel'), 'click', close);

    $('debug').checked = xbug;
    $('enableHistory').checked = prefs.enableHistory;
    $('forceTargetWindow').checked = prefs.forceTargetWindow;
    $('dblclick_pause').checked = GM_getValue('dblclick_pause') || false;
    $('SITEINFO_D-useiframe').checked = SITEINFO_D.useiframe;
    $('SITEINFO_D-a_enable').checked = SITEINFO_D.autopager.enable;
    $('SITEINFO_D-a_force_enable').checked = SITEINFO_D.autopager.force_enable;
    $('excludes').value = prefs.excludes;
    $('custom_siteinfo').value = prefs.custom_siteinfo;

};

var isUpdating = true;
function checkUpdate(button) {
    if (isUpdating) {
        return;
    }

    button.innerHTML = '正在更新中...';
    button.disabled = 'disabled';

    var reset = function() {
    	isUpdating = false;
    	button.innerHTML = '馬上更新';
    	button.disabled = '';
    };

    GM_xmlhttpRequest({
        method: "GET",
        url: scriptInfo.metaUrl,
        onload: function(response) {
            var txt = response.responseText;
            var curVersion = scriptInfo.version;
            var latestVersion = txt.match(/@\s*version\s*([\d\.]+)\s*/i);
            if (latestVersion) {
                latestVersion = latestVersion[1];
            } else {
                alert('解析版本號錯誤');
                return;
            }

            //對比版本號
            var needUpdate;
            var latestVersions = latestVersion.split('.');
            var lVLength = latestVersions.length;
            var currentVersion = curVersion.split('.');
            var cVLength = currentVersion.length;
            var lV_x;
            var cV_x;
            for (var i = 0; i < lVLength; i++) {
                lV_x = Number(latestVersions[i]);
                cV_x = (i >= cVLength) ? 0 : Number(currentVersion[i]);
                if (lV_x > cV_x) {
                    needUpdate = true;
                    break;
                } else if (lV_x < cV_x) {
                    break;
                }
            }

            if (needUpdate) {
                alert('本腳本從版本 ' + scriptInfo.version + '  更新到了版本 ' + latestVersion + '.\n請點擊腳本主頁進行安裝');
                document.getElementById("sp-prefs-homepageURL").boxShadow = '0 0 2px 2px #FF5555';
            }

            reset();
        }
    });

	setTimeout(reset, 30 * 1000);
}


//----------------------------------
// main.js

//------------------------下面的不要管他-----------------
///////////////////////////////////////////////////////////////////

var xbug = prefs.debug || GM_getValue("debug") || false;
var C = console;
var debug = xbug ? console.log.bind(console) : function() {};

// 變量
var isHashchangeSite = false,
    hashchangeTimer = 0;

var SP = {
    init: function() {
        if(document.body.getAttribute("name") === "MyNovelReader"){
            return;
        }

        this.loadSetting();

        GM_registerMenuCommand('Super_preloaderPlus_one 設置', setup);

        // 查找是否是頁面不刷新的站點
        var locationHref = location.href;
        var hashSite = _.find(HashchangeSites, function(x){ return toRE(x.url).test(locationHref); });
        if (hashSite) {
            isHashchangeSite = true;
            hashchangeTimer = hashSite.timer;
            debug('當前是頁面不刷新的站點', hashSite);
            setTimeout(function() {
                init(window, document);
            }, hashchangeTimer);
        } else {
            init(window, document);
        }

        // 分辨率 高度 > 寬度 的是手機
        if(window.screen.height > window.screen.width){
            GM_addStyle('div.sp-separator { min-width:auto !important; }');
        }
    },
    loadSetting: function(){
        var a_enable = GM_getValue('SITEINFO_D.autopager.enable');
        if (a_enable !== undefined) {
            SITEINFO_D.autopager.enable = a_enable;
        }

        var loadDblclickPause = function(reload){
            var dblclickPause = GM_getValue('dblclick_pause', prefs.dblclick_pause);
            if (dblclickPause) {
                prefs.mouseA = false;
                prefs.Pbutton = [0, 0, 0];
            }

            if (reload) location.reload();
        };

        var loadCustomSiteInfo = function() {
            var infos;
            try {
                infos = new Function('', 'return ' + prefs.custom_siteinfo)();
            }catch(e) {
                console.error('自定義站點規則錯誤', prefs.custom_siteinfo);
                // alert('自定義站點規則錯誤');
            }

            if (_.isArray(infos)) {
                SITEINFO = infos.concat(SITEINFO);
            }
        };

        loadDblclickPause();

        loadCustomSiteInfo();
    },
};


function init(window, document) {
    var startTime = new Date();

    var nullFn = function() {}; //空函數.
    var url = document.location.href.replace(/#.*$/, ''); //url 去掉hash
    var cplink = url;  // 翻上來的最近的頁面的url;
    var domain = document.domain; //取得域名.
    var domain_port = url.match(/https?:\/\/([^\/]+)/)[1]; //端口和域名,用來驗證是否跨域.

    // 新加的，以示區別
    var remove = [];  // 需要移除的事件

    debug('----------------------------------------------------');

    //懸浮窗
    var floatWO = {
        updateColor: nullFn,
        loadedIcon: nullFn,
        CmodeIcon: nullFn,
    };

    function floatWindow() {
        GM_addStyle('\
            #sp-fw-container {\
                z-index:999999!important;\
                text-align:left!important;\
            }\
            #sp-fw-container * {\
                font-size:13px!important;\
                color:black!important;\
                float:none!important;\
            }\
            #sp-fw-main-head{\
                position:relative!important;\
                top:0!important;\
                left:0!important;\
            }\
            #sp-fw-span-info{\
                position:absolute!important;\
                right:1px!important;\
                top:0!important;\
                font-size:10px!important;\
                line-height:10px!important;\
                background:none!important;\
                font-style:italic!important;\
                color:#5a5a5a!important;\
                text-shadow:white 0px 1px 1px!important;\
            }\
            #sp-fw-container input {\
                vertical-align:middle!important;\
                display:inline-block!important;\
                outline:none!important;\
                height: auto !important;\
                padding: 0px !important;\
                margin-bottom: 0px !important;\
            }\
            #sp-fw-container input[type="number"] {\
                width:50px!important;\
                text-align:left!important;\
            }\
            #sp-fw-container input[type="checkbox"] {\
                border:1px solid #B4B4B4!important;\
                padding:1px!important;\
                margin:3px!important;\
                width:13px!important;\
                height:13px!important;\
                background:none!important;\
                cursor:pointer!important;\
                visibility: visible !important;\
                position: static !important;\
            }\
            #sp-fw-container input[type="button"] {\
                border:1px solid #ccc!important;\
                cursor:pointer!important;\
                background:none!important;\
                width:auto!important;\
                height:auto!important;\
            }\
            #sp-fw-container li {\
                list-style:none!important;\
                margin:3px 0!important;\
                border:none!important;\
                float:none!important;\
            }\
            #sp-fw-container fieldset {\
                border:2px groove #ccc!important;\
                -moz-border-radius:3px!important;\
                border-radius:3px!important;\
                padding:4px 9px 6px 9px!important;\
                margin:2px!important;\
                display:block!important;\
                width:auto!important;\
                height:auto!important;\
            }\
            #sp-fw-container legend {\
                line-height: 20px !important;\
                margin-bottom: 0px !important;\
            }\
            #sp-fw-container fieldset>ul {\
                padding:0!important;\
                margin:0!important;\
            }\
            #sp-fw-container ul#sp-fw-a_useiframe-extend{\
                padding-left:40px!important;\
            }\
            #sp-fw-rect {\
                position:relative!important;\
                top:0!important;\
                left:0!important;\
                float:right!important;\
                height:10px!important;\
                width:10px!important;\
                padding:0!important;\
                margin:0!important;\
                -moz-border-radius:3px!important;\
                border-radius:3px!important;\
                border:1px solid white!important;\
                -webkit-box-shadow:inset 0 5px 0 rgba(255,255,255,0.3), 0 0 3px rgba(0,0,0,0.8)!important;\
                -moz-box-shadow:inset 0 5px 0 rgba(255,255,255,0.3), 0 0 3px rgba(0,0,0,0.8)!important;\
                box-shadow:inset 0 5px 0 rgba(255,255,255,0.3), 0 0 3px rgba(0,0,0,0.8)!important;\
                opacity:0.8!important;\
            }\
            #sp-fw-dot,\
            #sp-fw-cur-mode {\
                position:absolute!important;\
                z-index:9999!important;\
                width:5px!important;\
                height:5px!important;\
                padding:0!important;\
                -moz-border-radius:3px!important;\
                border-radius:3px!important;\
                border:1px solid white!important;\
                opacity:1!important;\
                -webkit-box-shadow:inset 0 -2px 1px rgba(0,0,0,0.3),inset 0 2px 1px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.9)!important;\
                -moz-box-shadow:inset 0 -2px 1px rgba(0,0,0,0.3),inset 0 2px 1px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.9)!important;\
                box-shadow:inset 0 -2px 1px rgba(0,0,0,0.3),inset 0 2px 1px rgba(255,255,255,0.3), 0px 1px 2px rgba(0,0,0,0.9)!important;\
            }\
            #sp-fw-dot{\
                right:-3px!important;\
                top:-3px!important;\
            }\
            #sp-fw-cur-mode{\
                left:-3px!important;\
                top:-3px!important;\
                width:6px!important;\
                height:6px!important;\
            }\
            #sp-fw-content{\
                padding:0!important;\
                margin:5px 5px 0 0!important;\
                -moz-border-radius:3px!important;\
                border-radius:3px!important;\
                border:1px solid #A0A0A0!important;\
                -webkit-box-shadow:-2px 2px 5px rgba(0,0,0,0.3)!important;\
                -moz-box-shadow:-2px 2px 5px rgba(0,0,0,0.3)!important;\
                box-shadow:-2px 2px 5px rgba(0,0,0,0.3)!important;\
            }\
            #sp-fw-main {\
                padding:5px!important;\
                border:1px solid white!important;\
                -moz-border-radius:3px!important;\
                border-radius:3px!important;\
                background-color:#F2F2F7!important;\
                background: -moz-linear-gradient(top, #FCFCFC, #F2F2F7 100%)!important;\
                background: -webkit-gradient(linear, 0 0, 0 100%, from(#FCFCFC), to(#F2F2F7))!important;\
            }\
            #sp-fw-foot{\
             position:relative!important;\
             left:0!important;\
             right:0!important;\
             min-height:20px!important;\
            }\
            #sp-fw-savebutton{\
                position:absolute!important;\
                top:0!important;\
                right:2px!important;\
            }\
            #sp-fw-container .sp-fw-spanbutton{\
                border:1px solid #ccc!important;\
                -moz-border-radius:3px!important;\
                border-radius:3px!important;\
                padding:2px 3px!important;\
                cursor:pointer!important;\
                background-color:#F9F9F9!important;\
                -webkit-box-shadow:inset 0 10px 5px white!important;\
                -moz-box-shadow:inset 0 10px 5px white!important;\
                box-shadow:inset 0 10px 5px white!important;\
            }\
        ');

        var div = document.createElement('div');
        div.id = 'sp-fw-container';
        div.innerHTML = '\
            <div id="sp-fw-rect" style="background-color:#000;">\
                <div id="sp-fw-dot" style="display:none;"></div>\
                <div id="sp-fw-cur-mode" style="display:none;"></div>\
            </div>\
            <div id="sp-fw-content" style="display:none;">\
                <div id="sp-fw-main">\
                    <div id="sp-fw-main-head">\
                        <input type="checkbox" title="使用翻頁模式,否則使用預讀模式" id="sp-fw-a_enable" name="sp-fw-a_enable"/>使用翻頁模式\
                        <span id="sp-fw-span-info">Super_preloader</span>\
                    </div>\
                    <fieldset>\
                        <legend title="預讀模式的相關設置" >預讀設置</legend>\
                        <ul>\
                            <li>\
                                <input type="checkbox" title="使用iframe預先載入好下一頁到緩存,否則使用xhr請求下一頁源碼,取出所有的圖片進行預讀" id="sp-fw-useiframe" name="sp-fw-useiframe"/>使用iframe方式\
                            </li>\
                            <li>\
                                <input type="checkbox" title="查看預讀的內容,將其顯示在頁面的底部,看看預讀了些什麼." id="sp-fw-viewcontent" name="sp-fw-viewcontent"/>查看預讀的內容\
                            </li>\
                        </ul>\
                    </fieldset>\
                    <fieldset id="sp-fw-autopager-field" style="display:block;">\
                        <legend title="自動翻頁模式的相關設置">翻頁設置</legend>\
                        <ul>\
                            <li>\
                                <input type="checkbox" title="使用iframe方式進行翻頁,否則使用xhr方式翻頁,可以解決某些網頁xhr方式無法翻頁的問題,如果xhr翻頁正常的話,就不要勾這項吧." id="sp-fw-a_useiframe" name="sp-fw-a_useiframe"/>使用iframe方式</input>\
                                <input type="checkbox" title="每個下一頁都用新的iframe，可以解決下一頁圖片或按鈕點擊的問題" id="sp-fw-a_newIframe" name="sp-fw-a_newIframe">新iframe</input>\
                                <ul id="sp-fw-a_useiframe-extend">\
                                    <li>\
                                        <input type="checkbox" title="等待iframe完全載入後(發生load事件),將內容取出,否則在DOM完成後,就直接取出來..(勾上後,會比較慢,但是可能會解決一些問題.)" id="sp-fw-a_iloaded" name="sp-fw-a_iloaded" />等待iframe完全載入\
                                    </li>\
                                    <li>\
                                        <input type="number"  min="0" title="在可以從iframe取數據的時候,繼續等待設定的毫秒才開始取出數據(此項為特殊網頁准備,如果正常,請設置為0)" id="sp-fw-a_itimeout" name="sp-fw-a_itimeout"/>ms延時取出\
                                    </li>\
                                </ul>\
                            </li>\
                            <li>\
                                <input type="checkbox" id="sp-fw-a_manualA" name="sp-fw-a_manualA" title="不會自動拼接上來,會出現一個類似翻頁導航的的圖形,點擊翻頁(在論壇的帖子內容頁面,可以考慮勾選此項,從而不影響你的回帖)"/>手動模式\
                            </li>\
                            <li>\
                                 剩余<input type="number" min="0" id="sp-fw-a_remain" name="sp-fw-a_remain" title="當剩余的頁面的高度是瀏覽器可見窗口高度的幾倍開始翻頁"/>倍頁面高度觸發\
                            </li>\
                            <li>\
                                 最多翻<input type="number" min="0" id="sp-fw-a_maxpage" name="sp-fw-a_maxpage" title="最多翻頁數量,當達到這個翻頁數量的時候,自動翻頁停止." />頁\
                            </li>\
                            <li>\
                                <input type="checkbox" id="sp-fw-a_separator" name="sp-fw-a_separator" title="分割頁面主要內容的導航條,可以進行頁面主要內容之間的快速跳轉定位等."/>顯示翻頁導航\
                            </li>\
                            <li>\
                                <input type="checkbox" title="將下一頁的body部分內容整個拼接上來.(當需翻頁的網站沒有高級規則時,該項強制勾選,無法取消.)" id="sp-fw-a_force" name="sp-fw-a_force"/>強制拼接\
                            </li>\
                            <li>\
                                <input type="checkbox" id="sp-fw-a_ipages_0" name="sp-fw-a_ipages_0" title="在JS加載後,立即連續翻後面設定的頁數"/>啟用 \
                                立即翻<input type="number" min="1" id="sp-fw-a_ipages_1" name="sp-fw-a_ipages_1" title="連續翻頁的數量" />頁\
                                <input type="button" value="開始" title="現在立即開始連續翻頁" id="sp-fw-a_starti" />\
                            </li>\
                        </ul>\
                    </fieldset>\
                    <div id="sp-fw-foot">\
                     <input type="checkbox" id="sp-fw-enable" title="總開關,啟用js,否則禁用." name="sp-fw-enable"/>啟用\
                     <span id="sp-fw-setup" class="sp-fw-spanbutton" title="打開設置窗口">設置</span>\
                     <span id="sp-fw-savebutton" class="sp-fw-spanbutton" title="保存設置">保存</span>\
                    </div>\
                </div>\
            </div>\
        ';
        document.body.appendChild(div);

        function $(id) {
            return document.getElementById(id);
        }

        var rect = $('sp-fw-rect'); //懸浮窗的小正方形,用顏色描述當前的狀態.
        var spanel = $('sp-fw-content'); //設置面板.

        var spanelc = {
            show: function() {
                spanel.style.display = 'block';
            },
            hide: function() {
                spanel.style.display = 'none';
            },
        };
        var rectt1, rectt2;
        //設置面板顯隱
        rect.addEventListener('mouseover', function(e) {
            rectt1 = setTimeout(spanelc.show, 100);
        }, false);
        rect.addEventListener('mouseout', function(e) {
            clearTimeout(rectt1);
        }, false);

        div.addEventListener('mouseover', function(e) {
            clearTimeout(rectt2);
        }, false);

        div.addEventListener('mouseout', function(e) {
            if (e.relatedTarget && e.relatedTarget.disabled) return; //for firefox and chrome
            rectt2 = setTimeout(spanelc.hide, 288);
        }, false);

        var dot = $('sp-fw-dot'); //載入完成後,顯示的小點
        dot.style.backgroundColor = FWKG_color.dot;

        var cur_mode = $('sp-fw-cur-mode'); //當載入狀態時,用來描述當前是翻頁模式,還是預讀模式.
        cur_mode.style.backgroundColor = SSS.a_enable ? FWKG_color.autopager : FWKG_color.prefetcher;

        var a_enable = $('sp-fw-a_enable'); //啟用翻頁模式
        var autopager_field = $('sp-fw-autopager-field'); //翻頁設置區域

        //預讀設置
        var useiframe = $('sp-fw-useiframe');
        var viewcontent = $('sp-fw-viewcontent');

        //翻頁設置
        var a_useiframe = $('sp-fw-a_useiframe');
        var a_iloaded = $('sp-fw-a_iloaded');
        var a_itimeout = $('sp-fw-a_itimeout');
        var a_manualA = $('sp-fw-a_manualA');
        var a_remain = $('sp-fw-a_remain');
        var a_maxpage = $('sp-fw-a_maxpage');
        var a_separator = $('sp-fw-a_separator');
        var a_ipages_0 = $('sp-fw-a_ipages_0');
        var a_ipages_1 = $('sp-fw-a_ipages_1');
        var a_force = $('sp-fw-a_force');

        // newIframe 輸入框的點擊
        var a_newIframe = $('sp-fw-a_newIframe');
        a_newIframe.addEventListener('click', function(){
            a_useiframe.checked = a_newIframe.checked;
        }, false);

        var a_starti = $('sp-fw-a_starti'); //開始立即翻頁
        a_starti.addEventListener('click', function() {
            if (this.disabled) return;
            var value = Number(a_ipages_1.value);
            if (isNaN(value) || value <= 0) {
                value = SSS.a_ipages[1];
                a_ipages_1.value = value;
            }
            autoPO.startipages(value);
        }, false);

        //總開關
        var enable = $('sp-fw-enable');
        $('sp-fw-setup').addEventListener('click', setup, false);

        // 保存設置按鈕.
        var savebutton = $('sp-fw-savebutton');
        savebutton.addEventListener('click', function(e) {
            var value = {
                Rurl: SSS.Rurl,
                useiframe: gl(useiframe),
                viewcontent: gl(viewcontent),
                enable: gl(enable),
            };

            function gl(obj) {
                return (obj.type == 'checkbox' ? obj.checked : obj.value);
            }
            if (SSS.a_enable !== undefined) {
                value.a_enable = gl(a_enable);
                value.a_useiframe = gl(a_useiframe);
                value.a_newIframe = gl(a_newIframe);
                value.a_iloaded = gl(a_iloaded);
                value.a_manualA = gl(a_manualA);
                value.a_force = gl(a_force);
                var t_a_itimeout = Number(gl(a_itimeout));
                value.a_itimeout = isNaN(t_a_itimeout) ? SSS.a_itimeout : (t_a_itimeout >= 0 ? t_a_itimeout : 0);
                var t_a_remain = Number(gl(a_remain));
                value.a_remain = isNaN(t_a_remain) ? SSS.a_remain : Number(t_a_remain.toFixed(2));
                var t_a_maxpage = Number(gl(a_maxpage));
                value.a_maxpage = isNaN(t_a_maxpage) ? SSS.a_maxpage : (t_a_maxpage >= 1 ? t_a_maxpage : 1);
                var t_a_ipages_1 = Number(gl(a_ipages_1));
                value.a_ipages = [gl(a_ipages_0), (isNaN(t_a_ipages_1) ? SSS.a_ipages[1] : (t_a_ipages_1 >= 1 ? t_a_ipages_1 : 1))];
                value.a_separator = gl(a_separator);
            }
            //alert(xToString(value));
            SSS.savedValue[SSS.sedValueIndex] = value;
            //alert(xToString(SSS.savedValue));
            saveValue('spfwset', xToString(SSS.savedValue));
            if ((e.shiftKey ? !prefs.FW_RAS : prefs.FW_RAS)) { //按住shift鍵,執行反向操作.
                setTimeout(function(){
                    location.reload();
                }, 1);
            }
        }, false);

        function ll(obj, value) {
            if (obj.type == 'checkbox') {
                obj.checked = value;
            } else {
                obj.value = value;
            }
        }

        //載入翻頁設置.
        if (SSS.a_enable === undefined) { //未定義翻頁功能.
            a_enable.disabled = true;
            autopager_field.style.display = 'none';
        } else {
            ll(a_enable, SSS.a_enable);
            ll(a_useiframe, SSS.a_useiframe);
            ll(a_newIframe, SSS.a_newIframe);
            ll(a_iloaded, SSS.a_iloaded);
            ll(a_itimeout, SSS.a_itimeout);
            ll(a_manualA, SSS.a_manualA);
            ll(a_force, SSS.a_force);
            ll(a_remain, SSS.a_remain);
            ll(a_maxpage, SSS.a_maxpage);
            ll(a_separator, SSS.a_separator);
            ll(a_ipages_0, SSS.a_ipages[0]);
            ll(a_ipages_1, SSS.a_ipages[1]);
        }

        if (!SSS.a_enable) { //當前不是翻頁模式,禁用立即翻頁按鈕.
            a_starti.disabled = true;
        }

        if (!SSS.hasRule) { //如果沒有高級規則,那麼此項不允許操作.
            a_force.disabled = true;
        }

        //載入預讀設置.
        ll(useiframe, SSS.useiframe);
        ll(viewcontent, SSS.viewcontent);

        //總開關
        ll(enable, SSS.enable);

        var FWKG_state = {
            loading: '讀取中狀態',
            prefetcher: '預讀狀態',
            autopager: '翻頁狀態',
            Apause: '翻頁狀態(暫停)',
            Astop: '翻頁狀態(停止)(翻頁完成,或者被異常停止)(無法再開啟)',
            dot: '讀取完後',
        };

        floatWO = {
            updateColor: function(state) {
                rect.style.backgroundColor = FWKG_color[state];
                rect.setAttribute("title", FWKG_state[state]);
            },
            loadedIcon: function(command) {
                dot.style.display = command == 'show' ? 'block' : 'none';
            },
            CmodeIcon: function(command) {
                cur_mode.style.display = command == 'show' ? 'block' : 'none';
            },
        };


        var vertical = parseInt(prefs.FW_offset[0], 10);
        var horiz = parseInt(prefs.FW_offset[1], 10);
        var FW_position = prefs.FW_position;

        // 非opera用fixed定位.
        div.style.position = 'fixed';
        switch (FW_position) {
            case 1:
                div.style.top = vertical + 'px';
                div.style.left = horiz + 'px';
                break;
            case 2:
                div.style.top = vertical + 'px';
                div.style.right = horiz + 'px';
                break;
            case 3:
                div.style.bottom = vertical + 'px';
                div.style.right = horiz + 'px';
                break;
            case 4:
                div.style.bottom = vertical + 'px';
                div.style.left = horiz + 'px';
                break;
            default:
                break;
        }
    }

    function sp_transition(start, end) {
        var TweenF = sp_transition.TweenF;
        if (!TweenF) {
            TweenF = Tween[TweenM[prefs.s_method]];
            TweenF = TweenF[TweenEase[prefs.s_ease]] || TweenF;
            sp_transition.TweenF = TweenF;
        }
        var frameSpeed = 1000 / prefs.s_FPS;
        var t = 0; //次數,開始
        var b = start; //開始
        var c = end - start; //結束
        var d = Math.ceil(prefs.s_duration / frameSpeed); //次數,結束

        var x = window.scrollX;

        function transition() {
            var y = Math.ceil(TweenF(t, b, c, d));
            //alert(y);
            window.scroll(x, y);
            if (t < d) {
                t++;
                setTimeout(transition, frameSpeed);
            }
        }
        transition();
    }

    function sepHandler(e) {
        e.stopPropagation();
        var div = this;
        //alert(div);
        var target = e.target;
        //alert(target);

        function getRelativeDiv(which) {
            var id = div.id;
            id = id.replace(/(sp-separator-)(.+)/, function(a, b, c) {
                return b + String((Number(c) + (which == 'pre' ? -1 : 1)));
            });
            //alert(id);
            return (id ? document.getElementById(id) : null);
        }

        function scrollIt(a, b) {
            //a=a!==undefined? a : window.scrollY;
            if (prefs.sepT) {
                sp_transition(a, b);
            } else {
                window.scroll(window.scrollX, b);
            }
        }

        var o_scrollY, divS;

        switch (target.className) {
            case 'sp-sp-gotop':
                scrollIt(window.scrollY, 0);
                break;
            case 'sp-sp-gopre':
                var prediv = getRelativeDiv('pre');
                if (!prediv) return;
                o_scrollY = window.scrollY;
                var preDS = prediv.getBoundingClientRect().top;
                if (prefs.sepP) {
                    divS = div.getBoundingClientRect().top;
                    preDS = o_scrollY - (divS - preDS);
                } else {
                    preDS += o_scrollY - 6;
                }
                scrollIt(o_scrollY, preDS);
                break;
            case 'sp-sp-gonext':
                var nextdiv = getRelativeDiv('next');
                if (!nextdiv) return;
                o_scrollY = window.scrollY;
                var nextDS = nextdiv.getBoundingClientRect().top;
                if (prefs.sepP) {
                    divS = div.getBoundingClientRect().top;
                    nextDS = o_scrollY + (-divS + nextDS);
                } else {
                    nextDS += o_scrollY - 6;
                }
                scrollIt(o_scrollY, nextDS);
                break;
            case 'sp-sp-gobottom':
                scrollIt(window.scrollY, Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
                break;
            default:
                break;
        }
    }

    //autopager
    var autoPO = {
        startipages: nullFn,
    };
    var hashchangeAdded = false;

    function autopager(SSS, floatWO) {
        //return;
        //更新懸浮窗的顏色.
        floatWO.updateColor('autopager');

        //獲取插入位置節點.
        var insertPoint;
        var pageElement;
        var insertMode;
        if (SSS.a_HT_insert) {
            insertPoint = getElement(SSS.a_HT_insert[0]);
            insertMode = SSS.a_HT_insert[1];
        } else {
            pageElement = getAllElements(SSS.a_pageElement);
            if (pageElement.length > 0) {
                var pELast = pageElement[pageElement.length - 1];
                insertPoint = pELast.nextSibling ? pELast.nextSibling : pELast.parentNode.appendChild(document.createTextNode(' '));
            }
        }

        if (insertPoint) {
            debug('驗證是否能找到插入位置節點:成功,', insertPoint);
        } else {
            C.error('驗證是否能找到插入位置節點:失敗', (SSS.a_HT_insert ? SSS.a_HT_insert[0] : ''), 'JS執行終止');
            floatWO.updateColor('Astop');
            return;
        }

        if (pageElement === undefined) {
            pageElement = getAllElements(SSS.a_pageElement);
        }
        if (pageElement.length > 0) {
            debug('驗證是否能找到主要元素:成功,', pageElement);
        } else {
            C.error('驗證是否能找到主要元素:失敗,', SSS.a_pageElement, 'JS執行終止');
            floatWO.updateColor('Astop');
            return;
        }

        if (SSS.a_stylish) {  // 插入自定義樣式
            GM_addStyle(SSS.a_stylish, 'Super_preloader-style');
        }

        var insertPointP;
        if (insertMode != 2) {
            insertPointP = insertPoint.parentNode;
        }

        var addIntoDoc;
        if (insertMode == 2) {
            addIntoDoc = function(obj) {
                return insertPoint.appendChild(obj);
            };
        } else {
            addIntoDoc = function(obj) {
                return insertPointP.insertBefore(obj, insertPoint);
            };
        }

        var doc, win;

        function XHRLoaded(req) {
            var str = req.responseText;
            doc = win = createDocumentByString(str);

            if (!doc) {
                C.error('文檔對象創建失敗');
                removeL();
                return;
            }
            floatWO.updateColor('autopager');
            floatWO.CmodeIcon('hide');
            floatWO.loadedIcon('show');
            working = false;
            scroll();
        }

        function removeL(isRemoveAddPage) {
            debug('移除各種事件監聽');
            floatWO.updateColor('Astop');
            var _remove = remove;
            for (var i = 0, ii = _remove.length; i < ii; i++) {
                _remove[i]();
            }

            if (isRemoveAddPage) {
                var separator = document.querySelector('.sp-separator');
                if (separator) {
                    var insertBefore = insertPoint;
                    if (insertMode == 2) {
                        var l = insertPoint.children.length;
                        if (l > 0) {
                            insertBefore = insertPoint.children[l - 1];
                        }
                    }

                    var range = document.createRange();
                    range.setStartBefore(separator);
                    range.setEndBefore(insertBefore);
                    range.deleteContents();
                    range.detach();

                    if (insertMode == 2) {  // 還需要額外移除？
                        insertPoint.removeChild(insertBefore);
                    }
                }
                var style = document.getElementById("Super_preloader-style");
                if (style)
                    style.parentNode.removeChild(style);
            }
        }
        if (isHashchangeSite && !hashchangeAdded) {
            window.addEventListener("hashchange", onhashChange, false);
            hashchangeAdded = true;
            debug('成功添加 hashchange 事件');
        }

        function onhashChange(event) {
            debug("觸發 Hashchang 事件");
            removeL(true);

            setTimeout(function(){
                nextlink = getElement(SSS.nextLink || 'auto;');
                nextlink = getFullHref(nextlink);
                // preLink = getElement(SSS.preLink || 'auto;');
                autopager(SSS, floatWO);
            }, hashchangeTimer);
        }

        var iframe;
        var messageR;

        function iframeLoaded() {
            var iframe = this;
            //alert(this.contentDocument.body)
            var body = iframe.contentDocument.body;
            if (body && body.firstChild) {
                setTimeout(function() {
                    doc = iframe.contentDocument;
                    removeScripts(doc);
                    win = iframe.contentWindow || doc;
                    floatWO.updateColor('autopager');
                    floatWO.CmodeIcon('hide');
                    floatWO.loadedIcon('show');
                    working = false;

                    scroll();
                }, SSS.a_itimeout);
            }
        }

        function iframeRquest(link) {
            messageR = false;
            if (SSS.a_newIframe || !iframe) {
                var i = document.createElement('iframe');
                iframe = i;
                i.name = 'superpreloader-iframe';
                i.width = '100%';
                i.height = '0';
                i.frameBorder = "0";
                i.style.cssText = '\
                    margin:0!important;\
                    padding:0!important;\
                    visibility:hidden!important;\
                ';
                i.src = link;
                if (SSS.a_iloaded) {
                    i.addEventListener('load', iframeLoaded, false);
                    remove.push(function() {
                        i.removeEventListener('load', iframeLoaded, false);
                    });
                } else {
                    var messagehandler = function (e) {
                        if (!messageR && e.data == 'superpreloader-iframe:DOMLoaded') {
                            messageR = true;
                            iframeLoaded.call(i);
                            if (SSS.a_newIframe) {
                                window.removeEventListener('message', messagehandler, false);
                            }
                        }
                    };
                    window.addEventListener('message', messagehandler, false);
                    remove.push(function() {
                        window.removeEventListener('message', messagehandler, false);
                    });
                }
                document.body.appendChild(i);
            } else {
                iframe.src = link;
                iframe.contentDocument.location.replace(link);
            }
        }

        var working;

        function doRequest() {
            working = true;
            floatWO.updateColor('loading');
            floatWO.CmodeIcon('show');

            debug('獲取下一頁' + (SSS.a_useiframe ? '(iframe方式)': ''), nextlink);
            if (SSS.a_useiframe) {
                iframeRquest(nextlink);
            } else {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: nextlink,
                    overrideMimeType: 'text/html; charset=' + document.characterSet,
                    onload: XHRLoaded
                });
            }
        }

        var ipagesmode = SSS.a_ipages[0];
        var ipagesnumber = SSS.a_ipages[1];
        var scrollDo = nullFn;
        var afterInsertDo = nullFn;
        if (prefs.Aplus) {
            afterInsertDo = doRequest;
            doRequest();
        } else {
            scrollDo = doRequest;
            if (ipagesmode) doRequest();
        }

        var manualDiv;

        function manualAdiv() {
            if (!manualDiv) {
                GM_addStyle('\
                    #sp-sp-manualdiv{\
                        line-height:1.6!important;\
                        opacity:1!important;\
                        position:relative!important;\
                        float:none!important;\
                        top:0!important;\
                        left:0!important;\
                        z-index: 1000!important;\
                        min-width:366px!important;\
                        width:auto!important;\
                        text-align:center!important;\
                        font-size:14px!important;\
                        padding:3px 0!important;\
                        margin:5px 10px 8px;\
                        clear:both!important;\
                        border-top:1px solid #ccc!important;\
                        border-bottom:1px solid #ccc!important;\
                        -moz-border-radius:30px!important;\
                        border-radius:30px!important;\
                        background-color:#F5F5F5!important;\
                        -moz-box-shadow:inset 0 10px 16px #fff,0 2px 3px rgba(0,0,0,0.1);\
                        -webkit-box-shadow:inset 0 10px 16px #fff,0 2px 3px rgba(0,0,0,0.1);\
                        box-shadow:inset 0 10px 16px #fff,0 2px 3px rgba(0,0,0,0.1);\
                    }\
                    .sp-sp-md-span{\
                        font-weight:bold!important;\
                        margin:0 5px!important;\
                    }\
                    #sp-sp-md-number{\
                        width:50px!important;\
                        vertical-align:middle!important;\
                        display:inline-block!important;\
                        text-align:left!important;\
                    }\
                    #sp-sp-md-imgnext{\
                        padding:0!important;\
                        margin:0 0 0 5px!important;\
                        vertical-align:middle!important;\
                        display:inline-block!important;\
                    }\
                    #sp-sp-manualdiv:hover{\
                        cursor:pointer;\
                    }\
                    #sp-sp-md-someinfo{\
                        position:absolute!important;\
                        right:16px!important;\
                        bottom:1px!important;\
                        font-size:10px!important;\
                        text-shadow:white 0 1px 0!important;\
                        color:#5A5A5A!important;\
                        font-style:italic!important;\
                        z-index:-1!important;\
                        background:none!important;\
                    }\
                ');

                var div = $C('div', { id: 'sp-sp-manualdiv' });
                manualDiv = div;
                var span = $C('span', { class: 'sp-sp-md-span' }, '下');
                div.appendChild(span);

                var input = $C('input', {
                    type: 'number',
                    value: 1,
                    min: 1,
                    title: '輸入你想要拼接的頁數(必須>=1),然後按回車.',
                    id: 'sp-sp-md-number'
                });

                var getInputValue = function () {
                    var value = Number(input.value);
                    if (isNaN(value) || value < 1) {
                        value = 1;
                        input.value = 1;
                    }
                    return value;
                };

                var spage = function () {
                    if (doc) {
                        var value = getInputValue();
                        //alert(value);
                        ipagesmode = true;
                        ipagesnumber = value + paged;
                        insertedIntoDoc();
                    }
                };
                input.addEventListener('keyup', function(e) {
                    //alert(e.keyCode);
                    if (e.keyCode == 13) { //回車
                        spage();
                    }
                }, false);
                div.appendChild(input);
                div.appendChild($C('span', { className: 'sp-sp-md-span' }, '頁'));
                div.appendChild($C('img', {id: 'sp-sp-md-imgnext', src: _sep_icons.next}));
                div.appendChild($C('span', { id: 'sp-sp-md-someinfo' }, prefs.someValue));
                document.body.appendChild(div);
                div.addEventListener('click', function(e) {
                    if (e.target.id == 'sp-sp-md-number') return;
                    spage();
                }, false);
            }
            addIntoDoc(manualDiv);
            manualDiv.style.display = 'block';
        }

        function beforeInsertIntoDoc() {
            working = true;
            if (SSS.a_manualA && !ipagesmode) { //顯示手動翻頁觸發條.
                manualAdiv();
            } else { //直接拼接.
                insertedIntoDoc();
            }
        }


        var sepStyle;
        var goNextImg = [false];
        var sNumber = prefs.sepStartN;
        var _sep_icons = sep_icons;
        var curNumber = sNumber;

        function createSep(lastUrl, currentUrl, nextUrl) {
            var div = document.createElement('div');
            if (SSS.a_separator) {
                if (!sepStyle) {
                    sepStyle = GM_addStyle('\
                        div.sp-separator{\
                            line-height:1.6!important;\
                            opacity:1!important;\
                            position:relative!important;\
                            float:none!important;\
                            top:0!important;\
                            left:0!important;\
                            min-width:366px;\
                            width:auto;\
                            text-align:center!important;\
                            font-size:14px!important;\
                            display:block!important;\
                            padding:3px 0!important;\
                            margin:5px 10px 8px;\
                            clear:both!important;\
                            border-top:1px solid #ccc!important;\
                            border-bottom:1px solid #ccc!important;\
                            -moz-border-radius:30px!important;\
                            border-radius:30px!important;\
                            background-color:#F5F5F5!important;\
                            -moz-box-shadow:inset 0 16px 20px #fff,0 2px 3px rgba(0,0,0,0.1);\
                            -webkit-box-shadow:inset 0 16px 20px #fff,0 2px 3px rgba(0,0,0,0.1);\
                            box-shadow:inset 0 16px 20px #fff,0 2px 3px rgba(0,0,0,0.1);\
                        }\
                        div.sp-separator img{\
                            vertical-align:middle!important;\
                            cursor:pointer!important;\
                            padding:0!important;\
                            margin:0 5px!important;\
                            border:none!important;\
                            display:inline-block!important;\
                            float:none!important;\
                            width: auto;\
                            height: auto;\
                        }\
                        div.sp-separator a.sp-sp-nextlink{\
                            margin:0 20px 0 -6px!important;\
                            display:inline!important;\
                            text-shadow:#fff 0 1px 0!important;\
                            background:none!important;\
                        }\
                        div.sp-separator span.sp-span-someinfo{\
                            position:absolute!important;\
                            right:16px!important;\
                            bottom:1px!important;\
                            font-size:10px!important;\
                            text-shadow:white 0 1px 0!important;\
                            color:#5A5A5A!important;\
                            font-style:italic!important;\
                            z-index:-1!important;\
                            background:none!important;\
                        }\
                    ');
                }

                div.className = 'sp-separator';
                div.id = 'sp-separator-' + curNumber;
                div.addEventListener('click', sepHandler, false);

                var pageStr = '第 <span style="color:red!important;">' + curNumber + '</span> 頁' +
                        ( SSS.a_separatorReal ? getRalativePageStr(lastUrl, currentUrl, nextUrl) : '');
                div.appendChild($C('a', {
                    class: 'sp-sp-nextlink',
                    href: currentUrl,
                    title: currentUrl
                }, pageStr));

                div.appendChild($C('img', {
                    src: _sep_icons.top,
                    class: 'sp-sp-gotop',
                    alt: '去到頂部',
                    title: '去到頂部'
                }));

                div.appendChild($C('img', {
                    src: curNumber == sNumber ? _sep_icons.pre_gray : _sep_icons.pre,
                    class: 'sp-sp-gopre',
                    title: '上滾一頁'
                }));

                var i_next = $C('img', {
                    src: _sep_icons.next_gray,
                    class: 'sp-sp-gonext',
                    title: '下滾一頁'
                });

                if (goNextImg.length == 2) {
                    goNextImg.shift();
                }
                goNextImg.push(i_next);
                div.appendChild(i_next);

                div.appendChild($C('img', {
                    src: _sep_icons.bottom,
                    class: 'sp-sp-gobottom',
                    alt: '去到底部',
                    title: '去到底部'
                }));

                div.appendChild($C('span', { class: 'sp-span-someinfo' }, prefs.someValue));
                curNumber += 1;
            } else {
                div.style.cssText = '\
                    height:0!important;\
                    width:0!important;\
                    margin:0!important;\
                    padding:0!important;\
                    border:none!important;\
                    clear:both!important;\
                    display:block!important;\
                    visibility:hidden!important;\
                ';
            }
            return div;
        }

        var paged = 0;

        function insertedIntoDoc() {
            if (!doc) return;

            if(SSS.a_documentFilter){
                try{
                    SSS.a_documentFilter(doc, nextlink);
                }catch(e){
                    C.error("執行 documentFilter 錯誤", e, SSS.a_documentFilter.toString());
                }
            }

            var docTitle = getElementByCSS("title", doc).textContent;

            removeScripts(doc);

            var fragment = document.createDocumentFragment();
            var pageElements = getAllElements(SSS.a_pageElement, false, doc, win);
            var ii = pageElements.length;
            if (ii <= 0) {
                debug('獲取下一頁的主要內容失敗', SSS.a_pageElement);
                removeL();
                return;
            }

            // 提前查找下一頁鏈接，後面再賦值
            var lastUrl = cplink;
            cplink = nextlink;
            var nl = getElement(SSS.nextLink, false, doc, win);
            if (nl) {
                nl = getFullHref(nl);
                if (nl == nextlink) {
                    nextlink = null;
                } else {
                    nextlink = nl;
                }
            } else {
                nextlink = null;
            }

            var i, pe_x, pe_x_nn;
            for (i = 0; i < ii; i++) {
                pe_x = pageElements[i];
                pe_x_nn = pe_x.nodeName;
                if (pe_x_nn == 'BODY' || pe_x_nn == 'HTML' || pe_x_nn == 'SCRIPT') continue;
                fragment.appendChild(pe_x);
            }

            if (SSS.filter && typeof(SSS.filter) == 'string') { //功能未完善.
                //alert(SSS.filter);
                var nodes = [];
                try {
                    nodes = getAllElements(SSS.filter, fragment);
                } catch (e) {}
                var nodes_x;
                for (i = nodes.length - 1; i >= 0; i--) {
                    nodes_x = nodes[i];
                    nodes_x.parentNode.removeChild(nodes_x);
                }
            }

            // lazyImgSrc
            if (SSS.lazyImgSrc) {
                handleLazyImgSrc(SSS.lazyImgSrc, fragment);
            }

            var imgs;
            if (!window.opera && SSS.a_useiframe && !SSS.a_iloaded) {
                imgs = getAllElements('css;img[src]', fragment); //收集所有圖片
            }

            // 處理下一頁內容部分鏈接是否新標簽頁打開
            if (prefs.forceTargetWindow) {
                var arr = Array.prototype.slice.call(fragment.querySelectorAll('a[href]:not([href^="mailto:"]):not([href^="javascript:"]):not([href^="#"])'));
                arr.forEach(function (elem){
                    elem.setAttribute('target', '_blank');
                    if (elem.getAttribute('onclick') == 'atarget(this)') {  // 卡飯論壇的控制是否在新標簽頁打開
                        elem.removeAttribute('onclick');
                    }
                });
            }

            var sepdiv = createSep(lastUrl, cplink, nextlink);
            if (pageElements[0] && pageElements[0].tagName == 'TR') {
                var insertParent = insertPoint.parentNode;
                var colNodes = getAllElements('child::tr[1]/child::*[self::td or self::th]', insertParent);
                var colums = 0;
                for (var x = 0, l = colNodes.length; x < l; x++) {
                    var col = colNodes[x].getAttribute('colspan');
                    colums += parseInt(col, 10) || 1;
                }
                var td = doc.createElement('td');
                td.appendChild(sepdiv);
                var tr = doc.createElement('tr');
                td.setAttribute('colspan', colums);
                tr.appendChild(td);
                fragment.insertBefore(tr, fragment.firstChild);
            } else {
                fragment.insertBefore(sepdiv, fragment.firstChild);
            }

            addIntoDoc(fragment);

            // filter
            if (SSS.filter && typeof(SSS.filter) == 'function') {
                try{
                    SSS.filter(pageElements);
                    debug("執行 filter(pages) 成功");
                }catch(e){
                    C.error("執行 filter(pages) 錯誤", e, SSS.filter.toString());
                }
            }

            if (imgs) { //非opera,在iframeDOM取出數據時需要重載圖片.
                setTimeout(function() {
                    var _imgs = imgs;
                    var i, ii, img;
                    for (i = 0, ii = _imgs.length; i < ii; i++) {
                        img = _imgs[i];
                        var src = img.src;
                        img.src = src;
                    }
                }, 99);
            }

            if (SSS.a_replaceE) {
                var oldE = getAllElements(SSS.a_replaceE);
                var oldE_lt = oldE.length;
                //alert(oldE_lt);
                if (oldE_lt > 0) {
                    var newE = getAllElements(SSS.a_replaceE, false, doc, win);
                    var newE_lt = newE.length;
                    //alert(newE_lt);
                    if (newE_lt == oldE_lt) {  // 替換
                        var oldE_x, newE_x;
                        for (i = 0; i < newE_lt; i++) {
                            oldE_x = oldE[i];
                            newE_x = newE[i];
                            newE_x = doc.importNode(newE_x, true);
                            oldE_x.parentNode.replaceChild(newE_x, oldE_x);
                        }
                    }
                }
            }

            paged += 1;
            if (ipagesmode && paged >= ipagesnumber) {
                ipagesmode = false;
            }
            floatWO.loadedIcon('hide');
            if (manualDiv) {
                manualDiv.style.display = 'none';
            }
            if (goNextImg[0]) goNextImg[0].src = _sep_icons.next;


            var ev = document.createEvent('Event');
            ev.initEvent('Super_preloaderPageLoaded', true, false);
            document.dispatchEvent(ev);

            if(prefs.enableHistory){
                try {
                    window.history.pushState(null, docTitle, cplink);
                } catch(e) {}
            }

            if (paged >= SSS.a_maxpage) {
                debug('到達所設定的最大翻頁數', SSS.a_maxpage);
                notice('<b>狀態</b>:' + '到達所設定的最大翻頁數:<b style="color:red">' + SSS.a_maxpage + '</b>');
                removeL();
                return;
            }
            var delayiframe = function(fn) {
                setTimeout(fn, 199);
            };
            if (nextlink) {
                // debug('找到下一頁鏈接:', nextlink);
                doc = win = null;
                if (ipagesmode) {
                    if (SSS.a_useiframe) { //延時點,firefox,太急會卡-_-!
                        delayiframe(doRequest);
                    } else {
                        doRequest();
                    }
                } else {
                    working = false;
                    if (SSS.a_useiframe) {
                        delayiframe(afterInsertDo);
                    } else {
                        afterInsertDo();
                    }
                }
            } else {
                debug('沒有找到下一頁鏈接', SSS.nextLink);
                removeL();
                return;
            }
        }

        //返回,剩余高度是總高度的比值.
        var relatedObj_0, relatedObj_1;
        if (SSS.a_relatedObj) {
            if (_.isArray(SSS.a_relatedObj)) {
                relatedObj_0 = SSS.a_relatedObj[0];
                relatedObj_1 = SSS.a_relatedObj[1];
            } else {
                relatedObj_0 = SSS.a_pageElement;
                relatedObj_1 = 'bottom';
            }
        }

        function getRemain() {
            var scrolly = window.scrollY;
            var WI = window.innerHeight;
            var obj = getLastElement(relatedObj_0);
            var scrollH = (obj && obj.nodeType == 1) ? (obj.getBoundingClientRect()[relatedObj_1] + scrolly) : Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
            return (scrollH - scrolly - WI) / WI; //剩余高度於頁面總高度的比例.
        }

        var pause = false;
        if (prefs.pauseA) {
            var Sbutton = ['target', 'shiftKey', 'ctrlKey', 'altKey'];
            var ltype = prefs.mouseA ? 'mousedown' : 'dblclick';
            var button_1 = Sbutton[prefs.Pbutton[0]];
            var button_2 = Sbutton[prefs.Pbutton[1]];
            var button_3 = Sbutton[prefs.Pbutton[2]];

            var pauseIt = function () {
                pause = !pause;
                if (prefs.stop_ipage) ipagesmode = false;
                if (pause) {
                    floatWO.updateColor('Apause');
                    notice('<b>狀態</b>:' + '自動翻頁<span style="color:red!important;"><b>暫停</b></span>.');
                } else {
                    floatWO.updateColor('autopager');
                    floatWO.CmodeIcon('hide');
                    notice('<b>狀態</b>:' + '自動翻頁<span style="color:red!important;"><b>啟用</b></span>.');
                }
                scroll();
            };
            var Sctimeout;

            var clearPause = function () {
                clearTimeout(Sctimeout);
                document.removeEventListener('mouseup', arguments.callee, false);
            };

            var pausehandler = function (e) {
                if (!SSS.a_manualA || ipagesmode || pause) {
                    if (e[button_1] && e[button_2] && e[button_3]) {
                        if (e.type == 'mousedown') {
                            document.addEventListener('mouseup', clearPause, false);
                            Sctimeout = setTimeout(pauseIt, prefs.Atimeout);
                        } else {
                            pauseIt();
                        }
                    }
                }
            };
            document.addEventListener(ltype, pausehandler, false);
            remove.push(function() {
                document.removeEventListener(ltype, pausehandler, false);
            });
        }

        function scroll() {
            if (!pause && !working && (getRemain() <= SSS.a_remain || ipagesmode)) {
                if (doc) { //有的話,就插入到文檔.
                    beforeInsertIntoDoc();
                } else { //否則就請求文檔.
                    scrollDo();
                }
            }
        }

        var timeout;
        function timeoutfn(){
            clearTimeout(timeout);
            timeout = setTimeout(scroll, 100);
        }
        window.addEventListener('scroll', timeoutfn, false);
        remove.push(function() {
            window.removeEventListener('scroll', timeoutfn, false);
        });

        autoPO = {
            startipages: function(value) {
                if (value > 0) {
                    ipagesmode = true;
                    ipagesnumber = value + paged;
                    notice('<b>狀態</b>:' + '當前已翻頁數量:<b>' + paged + '</b>,' + '連續翻頁到第<b style="color:red!important;">' + ipagesnumber + '</b>頁.');
                    if (SSS.a_manualA) insertedIntoDoc();
                    scroll();
                }
            },
        };
    }

    //prefetcher
    function prefetcher(SSS, floatWO) {
        function cContainer() {
            var div = document.createElement('div');
            var div2 = div.cloneNode(false);
            var hr = document.createElement('hr');
            div.style.cssText = '\
                margin:3px!important;\
                padding:5px!important;\
                border-radius:8px!important;\
                -moz-border-radius:8px!important;\
                border-bottom:1px solid #E30005!important;\
                border-top:1px solid #E30005!important;\
                background-color:#F5F5F5!important;\
                float:none!important;\
            ';
            div.title = '預讀的內容';
            div2.style.cssText = '\
                text-align:left!important;\
                color:red!important;\
                font-size:13px!important;\
                display:block!important;\
                float:none!important;\
                position:static!important;\
            ';
            hr.style.cssText = '\
                display:block!important;\
                border:1px inset #000!important;\
            ';
            div.appendChild(div2);
            div.appendChild(hr);
            document.body.appendChild(div);
            return {
                div: div,
                div2: div2
            };
        }

        floatWO.updateColor('prefetcher');

        floatWO.updateColor('loading');
        floatWO.CmodeIcon('show');

        if (SSS.useiframe) {
            var iframe = document.createElement('iframe');
            iframe.name = 'superpreloader-iframe';
            iframe.src = nextlink;
            iframe.width = '100%';
            iframe.height = '0';
            iframe.frameBorder = "0";
            iframe.style.cssText = '\
                margin:0!important;\
                padding:0!important;\
            ';
            iframe.addEventListener('load', function() {
                var body = this.contentDocument.body;
                if (body && body.firstChild) {
                    floatWO.updateColor('prefetcher');
                    floatWO.CmodeIcon('hide');
                    floatWO.loadedIcon('show');
                    this.removeEventListener('load', arguments.callee, false);

                    if (SSS.lazyImgSrc) {
                        handleLazyImgSrc(SSS.lazyImgSrc, body);
                    }
                }
            }, false);
            if (SSS.viewcontent) {
                var container = cContainer();
                container.div2.innerHTML = 'iframe全預讀: ' + '<br />' + '預讀網址: ' + '<b>' + nextlink + '</b>';
                iframe.height = '300px';
                container.div.appendChild(iframe);
            } else {
                document.body.appendChild(iframe);
            }
        } else {
            GM_xmlhttpRequest({
                method: "GET",
                url: nextlink,
                overrideMimeType: 'text/html; charset=' + document.characterSet,
                onload: function(req) {
                    var str = req.responseText;
                    var doc = createDocumentByString(str);
                    if (!doc) {
                        C.error('文檔對象創建失敗!');
                        return;
                    }

                    if (SSS.lazyImgSrc) {
                        handleLazyImgSrc(SSS.lazyImgSrc, doc);
                    }

                    var images = doc.images;
                    var isl = images.length;
                    var img;
                    var iarray = [];
                    var i;
                    var existSRC = {};
                    var isrc;
                    for (i = isl - 1; i >= 0; i--) {
                        isrc = images[i].getAttribute('src');
                        if (!isrc || existSRC[isrc]) {
                            continue;
                        } else {
                            existSRC[isrc] = true;
                        }
                        img = document.createElement('img');
                        img.src = isrc;
                        iarray.push(img);
                    }
                    if (SSS.viewcontent) {
                        var containter = cContainer();
                        var div = containter.div;
                        i = iarray.length;
                        containter.div2.innerHTML = '預讀取圖片張數: ' + '<b>' + i + '</b>' + '<br />' + '預讀網址: ' + '<b>' + nextlink + '</b>';
                        for (i -= 1; i >= 0; i--) {
                            div.appendChild(iarray[i]);
                        }
                    }
                    floatWO.updateColor('prefetcher');
                    floatWO.loadedIcon('show');
                    floatWO.CmodeIcon('hide');
                }
            });
        }
    }


    //執行開始..///////////////////

    // 分析黑名單
    var blackList_re = new RegExp(blackList.map(wildcardToRegExpStr).join("|"));
    if(blackList_re.test(url)){
        debug('匹配黑名單，js執行終止');
        return;
    }

    //是否在frame上加載..
    if (prefs.DisableI && window.self != window.parent) {
        var isReturn = !_.find(DIExclude, function(x){ return x[1] && x[2].test(url); });
        if (isReturn) {
            debug('url為:', url, '的頁面為非頂層窗口,JS執行終止.');
            return;
        }
    }
    debug('url為:', url, 'JS加載成功');

    //第一階段..分析高級模式..
    SITEINFO = SITEINFO.concat(SITEINFO_TP, SITEINFO_comp);

    //重要的變量兩枚.
    var nextlink;
    var prelink;
    //===============

    var SSS = {};

    var findCurSiteInfo = function() {
        var SII;
        var SIIA;
        var SIIAD = SITEINFO_D.autopager;
        var Rurl;
        var ii = SITEINFO.length;

        debug('高級規則數量:', ii);

        for (var i = 0; i < ii; i++) {
            SII = SITEINFO[i];
            Rurl = toRE(SII.url);
            if (Rurl.test(url)) {
                debug('找到匹配當前站點的規則:', SII, '是第', i + 1, '規則');

                // 運行規則的 startFilter
                if (SII.autopager && SII.autopager.startFilter) {
                    SII.autopager.startFilter(window, document);
                    debug('成功運行 startFilter');
                }

                nextlink = getElement(SII.nextLink || 'auto;');
                if (!nextlink) {
                    debug('無法找到下一頁鏈接,跳過規則:', SII, '繼續查找其他規則');
                    continue;
                }

                if (SII.preLink && SII.preLink != 'auto;') { //如果設定了具體的preLink
                    prelink = getElement(SII.preLink);
                } else {
                    if(prefs.autoGetPreLink){
                        getElement('auto;');
                    }
                }

                // alert(prelink);
                SSS.hasRule = true;
                SSS.Rurl = String(Rurl);
                // alert(SSS.Rurl);
                SSS.nextLink = SII.nextLink || 'auto;';
                SSS.viewcontent = SII.viewcontent;
                SSS.enable = (SII.enable === undefined) ? SITEINFO_D.enable : SII.enable;
                SSS.useiframe = (SII.useiframe === undefined) ? SITEINFO_D.useiframe : SII.useiframe;
                if (SII.pageElement) { //如果是Oautopager的規則..
                    if (!(SII.autopager instanceof Object)) SII.autopager = {};
                    SII.autopager.pageElement = SII.pageElement;
                    if (SII.insertBefore) SII.autopager.HT_insert = [SII.insertBefore, 1];
                }

                //自動翻頁設置.
                SIIA = SII.autopager;
                if (SIIA) {
                    SSS.a_pageElement = SIIA.pageElement;
                    if (!SSS.a_pageElement) break;
                    SSS.a_manualA = (SIIA.manualA === undefined) ? SIIAD.manualA : SIIA.manualA;
                    SSS.a_enable = (SIIA.enable === undefined) ? SIIAD.enable : SIIA.enable;
                    SSS.a_useiframe = (SIIA.useiframe === undefined) ? SIIAD.useiframe : SIIA.useiframe;
                    SSS.a_newIframe = (SIIA.newIframe === undefined) ? SIIAD.newIframe : SIIA.newIframe;
                    SSS.a_iloaded = (SIIA.iloaded === undefined) ? SIIAD.iloaded : SIIA.iloaded;
                    SSS.a_itimeout = (SIIA.itimeout === undefined) ? SIIAD.itimeout : SIIA.itimeout;
                    //alert(SSS.a_itimeout);
                    SSS.a_remain = (SIIA.remain === undefined) ? SIIAD.remain : SIIA.remain;
                    SSS.a_maxpage = (SIIA.maxpage === undefined) ? SIIAD.maxpage : SIIA.maxpage;
                    SSS.a_separator = (SIIA.separator === undefined) ? SIIAD.separator : SIIA.separator;
                    SSS.a_separatorReal = (SIIA.separatorReal === undefined) ? SIIAD.separatorReal : SIIA.separatorReal;
                    SSS.a_replaceE = SIIA.replaceE;
                    SSS.a_HT_insert = SIIA.HT_insert;
                    SSS.a_relatedObj = SIIA.relatedObj;
                    SSS.a_ipages = (SIIA.ipages === undefined) ? SIIAD.ipages : SIIA.ipages;

                    // new
                    SSS.filter = SII.filter || SIIA.filter;  // 新增了函數的形式，原來的功能是移除 pageElement
                    SSS.a_documentFilter = SII.documentFilter || SIIA.documentFilter;
                    SSS.a_stylish = SII.stylish || SIIA.stylish;
                    SSS.lazyImgSrc = SIIA.lazyImgSrc;
                }

                // 檢驗是否存在內容
                var pageElement = getElement(SSS.a_pageElement);
                if (!pageElement) {
                    debug('無法找到內容,跳過規則:', SII, '繼續查找其他規則');
                    continue;
                }

                break;
            }
        }

        if (!SSS.hasRule) {
            debug('未找到合適的高級規則,開始自動匹配.');
            //自動搜索.
            if (!autoMatch.keyMatch) {
                debug('自動匹配功能被禁用了.');
            } else {
                nextlink = autoGetLink();
                //alert(nextlink);
                if (nextlink) { //強制模式.
                    var FA = autoMatch.FA;
                    SSS.Rurl = window.localStorage ? ('am:' + (url.match(/^https?:\/\/[^:]*\//i) || [])[0]) : 'am:automatch';
                    //alert(SSS.Rurl);
                    SSS.enable = true;
                    SSS.nextLink = 'auto;';
                    SSS.viewcontent = autoMatch.viewcontent;
                    SSS.useiframe = autoMatch.useiframe;
                    SSS.a_force = true;
                    SSS.a_manualA = FA.manualA;
                    // SSS.a_enable = FA.enable || false; //不能使a_enable的值==undefined...
                    SSS.a_enable = FA.enable || SITEINFO_D.autopager.force_enable; //不能使a_enable的值==undefined...
                    SSS.a_useiframe = FA.useiframe;
                    SSS.a_iloaded = FA.iloaded;
                    SSS.a_itimeout = FA.itimeout;
                    SSS.a_remain = FA.remain;
                    SSS.a_maxpage = FA.maxpage;
                    SSS.a_separator = FA.separator;
                    SSS.a_ipages = FA.ipages;
                }
            }
        }

        // 如果規則沒 lazyImgSrc，設置默認值
        if (!SSS.lazyImgSrc) {
            SSS.lazyImgSrc = prefs.lazyImgSrc;
        }

        debug('搜索高級規則和自動匹配過程總耗時:', new Date() - startTime, '毫秒');
    };

    findCurSiteInfo();

    //上下頁都沒有找到啊
    if (!nextlink && !prelink) {
        debug('未找到相關鏈接, JS執行停止. 共耗時' + (new Date() - startTime) + '毫秒');
        return;
    } else {
        debug('上一頁鏈接:', prelink);
        debug('下一頁鏈接:', nextlink);
        nextlink = nextlink ? (nextlink.href || nextlink) : undefined;
        prelink = prelink ? (prelink.href || prelink) : undefined;
    }

    var superPreloader = {
        go: function() {
            if (nextlink) window.location.href = nextlink;
        },
        back: function() {
            if(!prelink) getElement('auto;');
            if (prelink) window.location.href = prelink;
        },
    };

    if (prefs.arrowKeyPage) {
        debug('添加鍵盤左右方向鍵翻頁監聽.');
        document.addEventListener('keyup', function(e) {
            var tarNN = e.target.nodeName;
            if (tarNN != 'BODY' && tarNN != 'HTML') return;
            switch (e.keyCode) {
                case 37:
                    superPreloader.back();
                    break;
                case 39:
                    superPreloader.go();
                    break;
                default:
                    break;
            }
        }, false);
    }

    // 監聽下一頁事件.
    debug('添加鼠標手勢翻頁監聽.');
    document.addEventListener('superPreloader.go', function() {
        superPreloader.go();
    }, false);

    // 監聽下一頁事件.
    document.addEventListener('superPreloader.back', function() {
        superPreloader.back();
    }, false);

    // 沒找到下一頁的鏈接
    if (!nextlink) {
        debug('下一頁鏈接不存在,JS無法繼續.');
        debug('全部過程耗時:', new Date() - startTime, '毫秒');
        return;
    }

    // 載入設置..
    var loadLocalSetting = function() {
        debug('加載設置');
        var savedValue = getValue('spfwset');
        if (savedValue) {
            try {
                savedValue = eval(savedValue);
            } catch (e) {
                saveValue('spfwset', ''); //有問題的設置,被手動修改過?,清除掉,不然下次還是要出錯.
            }
        }
        if (savedValue) {
            SSS.savedValue = savedValue;
            for (i = 0, ii = savedValue.length; i < ii; i++) {
                savedValue_x = savedValue[i];
                if (savedValue_x.Rurl == SSS.Rurl) {
                    for (var ix in savedValue_x) {
                        if (savedValue_x.hasOwnProperty(ix)) {
                            SSS[ix] = savedValue_x[ix]; //加載鍵值.
                        }
                    }
                    break;
                }
            }
            //alert(i);
            SSS.sedValueIndex = i;
        } else {
            SSS.savedValue = [];
            SSS.sedValueIndex = 0;
        }
    };

    loadLocalSetting();

    if (!SSS.hasRule) {
        SSS.a_force = true;
    }

    if (SSS.a_force) {
        SSS.a_pageElement = '//body/*';
        SSS.a_HT_insert = undefined;
        SSS.a_relatedObj = undefined;
    }

    if (prefs.floatWindow) {
        debug('創建懸浮窗');
        floatWindow(SSS);
    }

    if (!SSS.enable) {
        debug('本規則被關閉,腳本執行停止');
        debug('全部過程耗時:', new Date() - startTime, '毫秒');
        return;
    }
    debug('全部過程耗時:', new Date() - startTime, '毫秒');

    // 預讀或者翻頁.
    if (SSS.a_enable) {
        debug('初始化,翻頁模式.');
        autopager(SSS, floatWO);
    } else {
        debug('初始化,預讀模式.');
        prefetcher(SSS, floatWO);
    }

    var docChecked;
    function autoGetLink(doc, win) {
        if (!autoMatch.keyMatch) return;
        if (!parseKWRE.done) {
            parseKWRE();
            parseKWRE.done = true;
        }

        var startTime = new Date();
        doc = doc || document;
        win = win || window;

        if (doc == document) { //當前文檔,只檢查一次.
            //alert(nextlink);
            if (docChecked) return nextlink;
            docChecked = true;
        }

        var _prePageKey = prePageKey;
        var _nextPageKey = nextPageKey;
        var _nPKL = nextPageKey.length;
        var _pPKL = prePageKey.length;
        var _getFullHref = getFullHref;
        var _getAllElementsByXpath = getAllElementsByXpath;
        var _Number = Number;
        var _domain_port = domain_port;
        var alllinks = doc.links;
        var alllinksl = alllinks.length;

        var curLHref = cplink;
        var _nextlink;
        var _prelink;
        if (!autoGetLink.checked) { //第一次檢查
            _nextlink = nextlink;
            _prelink = prelink;
        } else {
            _prelink = true;
        }

        var DCEnable = autoMatch.digitalCheck;
        var DCRE = /^\s*\D{0,1}(\d+)\D{0,1}\s*$/;

        var i, a, ahref, atext, numtext;
        var aP, initSD, searchD = 1,
            preS1, preS2, searchedD, pSNText, preSS, nodeType;
        var nextS1, nextS2, nSNText, nextSS;
        var aimgs, j, jj, aimg_x, xbreak, k, keytext;

        function finalCheck(a, type) {
            var ahref = a.getAttribute('href'); //在chrome上當是非當前頁面文檔對象的時候直接用a.href訪問,不返回href
            if (ahref == '#') {
                return null;
            }
            ahref = _getFullHref(ahref); //從相對路徑獲取完全的href;

            //3個條件:http協議鏈接,非跳到當前頁面的鏈接,非跨域
            if (/^https?:/i.test(ahref) && ahref.replace(/#.*$/, '') != curLHref && ahref.match(/https?:\/\/([^\/]+)/)[1] == _domain_port) {
                if (xbug) {
                    debug((type == 'pre' ? '上一頁' : '下一頁') + '匹配到的關鍵字為:', atext);
                }
                return a; //返回對象A
                //return ahref;
            }
        }

        if (xbug) {
            debug('全文檔鏈接數量:', alllinksl);
        }

        for (i = 0; i < alllinksl; i++) {
            if (_nextlink && _prelink) break;
            a = alllinks[i];
            if (!a) continue; //undefined跳過
            //links集合返回的本來就是包含href的a元素..所以不用檢測
            //if(!a.hasAttribute("href"))continue;
            atext = a.textContent;
            if (atext) {
                if (DCEnable) {
                    numtext = atext.match(DCRE);
                    if (numtext) { //是不是純數字
                        //debug(numtext);
                        numtext = numtext[1];
                        //alert(numtext);
                        aP = a;
                        initSD = 0;

                        if (!_nextlink) {
                            preS1 = a.previousSibling;
                            preS2 = a.previousElementSibling;


                            while (!(preS1 || preS2) && initSD < searchD) {
                                aP = aP.parentNode;
                                if (aP) {
                                    preS1 = aP.previousSibling;
                                    preS2 = aP.previousElementSibling;
                                }
                                initSD++;
                                //alert('initSD: '+initSD);
                            }
                            searchedD = initSD > 0 ? true : false;

                            if (preS1 || preS2) {
                                pSNText = preS1 ? preS1.textContent.match(DCRE) : '';
                                if (pSNText) {
                                    preSS = preS1;
                                } else {
                                    pSNText = preS2 ? preS2.textContent.match(DCRE) : '';
                                    preSS = preS2;
                                }
                                //alert(previousS);
                                if (pSNText) {
                                    pSNText = pSNText[1];
                                    //debug(pSNText)
                                    //alert(pSNText)
                                    if (_Number(pSNText) == _Number(numtext) - 1) {
                                        //alert(searchedD);
                                        nodeType = preSS.nodeType;
                                        //alert(nodeType);
                                        if (nodeType == 3 || (nodeType == 1 && (searchedD ? _getAllElementsByXpath('./descendant-or-self::a[@href]', preSS, doc).snapshotLength === 0 : (!preSS.hasAttribute('href') || _getFullHref(preSS.getAttribute('href')) == curLHref)))) {
                                            _nextlink = finalCheck(a, 'next');
                                            //alert(_nextlink);
                                        }
                                        continue;
                                    }
                                }
                            }
                        }

                        if (!_prelink) {
                            nextS1 = a.nextSibling;
                            nextS2 = a.nextElementSibling;

                            while (!(nextS1 || nextS2) && initSD < searchD) {
                                aP = aP.parentNode;
                                if (aP) {
                                    nextS1 = a.nextSibling;
                                    nextS2 = a.nextElementSibling;
                                }
                                initSD++;
                                //alert('initSD: '+initSD);
                            }
                            searchedD = initSD > 0 ? true : false;

                            if (nextS1 || nextS2) {
                                nSNText = nextS1 ? nextS1.textContent.match(DCRE) : '';
                                if (nSNText) {
                                    nextSS = nextS1;
                                } else {
                                    nSNText = nextS2 ? nextS2.textContent.match(DCRE) : '';
                                    nextSS = nextS2;
                                }
                                //alert(nextS);
                                if (nSNText) {
                                    nSNText = nSNText[1];
                                    //alert(pSNText)
                                    if (_Number(nSNText) == _Number(numtext) + 1) {
                                        //alert(searchedD);
                                        nodeType = nextSS.nodeType;
                                        //alert(nodeType);
                                        if (nodeType == 3 || (nodeType == 1 && (searchedD ? _getAllElementsByXpath('./descendant-or-self::a[@href]', nextSS, doc).snapshotLength === 0 : (!nextSS.hasAttribute("href") || _getFullHref(nextSS.getAttribute('href')) == curLHref)))) {
                                            _prelink = finalCheck(a, 'pre');
                                            //alert(_prelink);
                                        }
                                    }
                                }
                            }
                        }
                        continue;
                    }
                }
            } else {
                atext = a.title;
            }
            if (!atext) {
                aimgs = a.getElementsByTagName('img');
                for (j = 0, jj = aimgs.length; j < jj; j++) {
                    aimg_x = aimgs[j];
                    atext = aimg_x.alt || aimg_x.title;
                    if (atext) break;
                }
            }
            if (!atext) continue;
            if (!_nextlink) {
                xbreak = false;
                for (k = 0; k < _nPKL; k++) {
                    keytext = _nextPageKey[k];
                    if (!(keytext.test(atext))) continue;
                    _nextlink = finalCheck(a, 'next');
                    xbreak = true;
                    break;
                }
                if (xbreak || _nextlink) continue;
            }
            if (!_prelink) {
                for (k = 0; k < _pPKL; k++) {
                    keytext = _prePageKey[k];
                    if (!(keytext.test(atext))) continue;
                    _prelink = finalCheck(a, 'pre');
                    break;
                }
            }
        }

        debug('搜索鏈接數量:', i, '耗時:', new Date() - startTime, '毫秒');

        if (!autoGetLink.checked) { //只在第一次檢測的時候,拋出上一頁鏈接.
            prelink = _prelink;
            autoGetLink.checked = true;
        }

        //alert(_nextlink);
        return _nextlink;
    }

    function parseKWRE() {
        function modifyPageKey(name, pageKey, pageKeyLength) {
            function strMTE(str) {
                return (str.replace(/\\/g, '\\\\')
                    .replace(/\+/g, '\\+')
                    .replace(/\./g, '\\.')
                    .replace(/\?/g, '\\?')
                    .replace(/\{/g, '\\{')
                    .replace(/\}/g, '\\}')
                    .replace(/\[/g, '\\[')
                    .replace(/\]/g, '\\]')
                    .replace(/\^/g, '\\^')
                    .replace(/\$/g, '\\$')
                    .replace(/\*/g, '\\*')
                    .replace(/\(/g, '\\(')
                    .replace(/\)/g, '\\)')
                    .replace(/\|/g, '\\|')
                    .replace(/\//g, '\\/'));
            }

            var pfwordl = autoMatch.pfwordl,
                sfwordl = autoMatch.sfwordl;

            var RE_enable_a = pfwordl[name].enable,
                RE_maxPrefix = pfwordl[name].maxPrefix,
                RE_character_a = pfwordl[name].character,
                RE_enable_b = sfwordl[name].enable,
                RE_maxSubfix = sfwordl[name].maxSubfix,
                RE_character_b = sfwordl[name].character;
            var plwords,
                slwords,
                rep;

            plwords = RE_maxPrefix > 0 ? ('[' + (RE_enable_a ? strMTE(RE_character_a.join('')) : '.') + ']{0,' + RE_maxPrefix + '}') : '';
            plwords = '^\\s*' + plwords;
            //alert(plwords);
            slwords = RE_maxSubfix > 0 ? ('[' + (RE_enable_b ? strMTE(RE_character_b.join('')) : '.') + ']{0,' + RE_maxSubfix + '}') : '';
            slwords = slwords + '\\s*$';
            //alert(slwords);
            rep = prefs.cases ? '' : 'i';

            for (var i = 0; i < pageKeyLength; i++) {
                pageKey[i] = new RegExp(plwords + strMTE(pageKey[i]) + slwords, rep);
                //alert(pageKey[i]);
            }
            return pageKey;
        }

        //轉成正則.
        prePageKey = modifyPageKey('previous', prePageKey, prePageKey.length);
        nextPageKey = modifyPageKey('next', nextPageKey, nextPageKey.length);
    }

    // 地址欄遞增處理函數.
    function hrefInc(obj, doc, win) {
        var _cplink = cplink;

        function getHref(href) {
            var mFails = obj.mFails;
            if (!mFails) return href;
            var str;
            if (typeof mFails == 'string') {
                str = mFails;
            } else {
                var fx;
                var array = [];
                var i, ii;
                var mValue;
                for (i = 0, ii = mFails.length; i < ii; i++) {
                    fx = mFails[i];
                    if (!fx) continue;
                    if (typeof fx == 'string') {
                        array.push(fx);
                    } else {
                        mValue = href.match(fx);
                        if (!mValue) return href;
                        array.push(mValue);
                    }
                }
                str = array.join('');
            }
            return str;
        }
        // alert(getHref(_cplink))

        var sa = obj.startAfter;
        var saType = typeof sa;
        var index;

        if (saType == 'string') {
            index = _cplink.indexOf(sa);
            if (index == -1) {
                _cplink = getHref(_cplink);
                index = _cplink.indexOf(sa);
                if (index == -1) return;
                //alert(index);
            }
        } else {
            var tsa = _cplink.match(sa);
            //alert(sa);
            if (!tsa) {
                _cplink = getHref(_cplink);
                sa = (_cplink.match(sa) || [])[0];
                if (!sa) return;
                index = _cplink.indexOf(sa);
                if (index == -1) return;
            } else {
                sa = tsa[0];
                index = _cplink.indexOf(sa);
                //alert(index)
                //alert(tsa.index)
            }
        }

        index += sa.length;
        var max = obj.max === undefined ? 9999 : obj.max;
        var min = obj.min === undefined ? 1 : obj.min;
        var aStr = _cplink.slice(0, index);
        var bStr = _cplink.slice(index);
        var nbStr = bStr.replace(/^(\d+)(.*)$/, function(a, b, c) {
            b = Number(b) + obj.inc;
            if (b >= max || b < min) return a;
            return b + c;
        });
        // alert(aStr+nbStr);
        if (nbStr !== bStr) {
            var ilresult;
            try {
                ilresult = obj.isLast(doc, unsafeWindow, _cplink);
            } catch (e) {}
            if (ilresult) return;
            return aStr + nbStr;
        }
    }

    // 獲取單個元素,混合
    function getElement(selector, contextNode, doc, win) {
        var ret;
        if (!selector) return ret;
        doc = doc || document;
        win = win || window;
        contextNode = contextNode || doc;
        var type = typeof selector;
        if (type == 'string') {
            if (selector.search(/^css;/i) === 0) {
                ret = getElementByCSS(selector.slice(4), contextNode);
            } else if (selector.toLowerCase() == 'auto;') {
                ret = autoGetLink(doc, win);
            } else {
                ret = getElementByXpath(selector, contextNode, doc);
            }
        } else if (type == 'function') {
            ret = selector(doc, win, cplink);
        } else if (selector instanceof Array) {
            for (var i = 0, l = selector.length; i < l; i++) {
                ret = getElement(selector[i], contextNode, doc, win);
                if (ret) {
                    break;
                }
            }
        } else {
            ret = hrefInc(selector, doc, win);
        }
        return ret;
    }
}


// ====================  libs  ==============================

// 自造簡化版 underscroe 庫，僅 ECMAScript 5
var _ = (function(){

    var nativeIsArray = Array.isArray;
    var _ = function(obj){
        if(obj instanceof _) return obj;
        if(!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    var toString = Object.prototype.toString;

    _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) == '[object Array]';
    };

    ['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(name){
        _['is' + name] = function(obj) {
            return toString.call(obj) == '[object ' + name + ']';
        };
    });

    // Return the first value which passes a truth test. Aliased as `detect`.
    _.find = function(obj, iterator, context){
        var result;
        obj.some(function(value, index, array){
            if(iterator.call(context, value, index, array)){
                result = value;
                return true;
            }
        });
        return result;
    };

    return _;
})();

/* jshint ignore:start */
//動畫庫
var Tween = {
    Linear: function(t, b, c, d) {
        return c * t / d + b;
    },
    Quad: {
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOut: function(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    },
    Cubic: {
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
    },
    Quart: {
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOut: function(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
    },
    Quint: {
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        }
    },
    Sine: {
        easeIn: function(t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOut: function(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOut: function(t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
    },
    Expo: {
        easeIn: function(t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOut: function(t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOut: function(t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    Circ: {
        easeIn: function(t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOut: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        }
    },
    Elastic: {
        easeIn: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },
        easeInOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        }
    },
    Back: {
        easeIn: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
    },
    Bounce: {
        easeIn: function(t, b, c, d) {
            return c - Tween.Bounce.easeOut(d - t, 0, c, d) + b;
        },
        easeOut: function(t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        easeInOut: function(t, b, c, d) {
            if (t < d / 2) return Tween.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
            else return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    }
};

var TweenM = [
    'Linear',
    'Quad',
    'Cubic',
    'Quart',
    'Quint',
    'Sine',
    'Expo',
    'Circ',
    'Elastic',
    'Back',
    'Bounce',
];

var TweenEase = [
    'easeIn',
    'easeOut',
    'easeInOut',
];
/* jshint ignore:end */


// ====================  functions  ==============================

function gmCompatible() {

    GM_addStyle = function(css, id){
        var s = document.createElement('style');
        if (id) {
            s.setAttribute(id, id);
        }
        s.setAttribute('type', 'text/css');
        s.setAttribute('style', 'display: none !important;');
        s.appendChild(document.createTextNode(css));
        return (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(s);
    };

    if (typeof unsafeWindow == "undefined") unsafeWindow = window;
    if (typeof GM_getValue != "undefined" && GM_getValue("a", "b") !== undefined) {
        return;
    }

    GM_getValue = function(key, defaultValue) {
        var value = window.localStorage.getItem(key);
        if (value === null) value = defaultValue;
        else if (value == 'true') value = true;
        else if (value == 'false') value = false;
        return value;
    };
    GM_setValue = function(key, value) {
        window.localStorage.setItem(key, value);
    };
    GM_registerMenuCommand = function() {};

    // chrome 原生支持
    if (typeof GM_xmlhttpRequest == 'undefined') {
        GM_xmlhttpRequest = function(opt) {
            var req = new XMLHttpRequest();
            req.open('GET', opt.url, true);
            req.overrideMimeType(opt.overrideMimeType);
            req.onreadystatechange = function (aEvt) {
                if (req.readyState == 4) {
                    if (req.status == 200) {
                        opt.onload(req);
                    }
                    else {
                        opt.onerror();
                    }
                }
            };
            req.send(null);
        };
    }
}

// By lastDream2013 略加修改，原版只能用於 Firefox
function getRalativePageStr(lastUrl, currentUrl, nextUrl) {
    function getDigital(str) {
        var num = str.replace(/^p/i, '');
        return parseInt(num, 10);
    }

    var getRalativePageNumArray = function (lasturl, url) {
        if (!lasturl || !url) {
            return [0, 0];
        }

        var lasturlarray = lasturl.split(/-|\.|\&|\/|=|#|\?/),
            urlarray = url.split(/-|\.|\&|\/|=|#|\?/),
            url_info,
            lasturl_info;
        // 一些 url_info 為 p1,p2,p3 之類的
        var handleInfo = function(s) {
            if (s) {
                return s.replace(/^p/, '');
            }
            return s;
        };
        while (urlarray.length !== 0) {
            url_info = handleInfo(urlarray.pop());
            lasturl_info = handleInfo(lasturlarray.pop());
            if (url_info != lasturl_info) {
                if (/[0-9]+/.test(url_info) && (url_info == "2" || /[0-9]+/.test(lasturl_info))) {
                    return [(parseInt(lasturl_info) || 1), parseInt(url_info)];
        }
            }
        }
        return [0, 0];
    };

    var ralativeOff;

    //論壇和搜索引擎網頁顯示實際頁面信息
    var ralativePageNumarray = [];
    if (nextUrl) {
        ralativePageNumarray = getRalativePageNumArray(currentUrl, nextUrl);
    } else {
        ralativePageNumarray = getRalativePageNumArray(lastUrl, currentUrl);
        ralativeOff = ralativePageNumarray[1] - ralativePageNumarray[0]; //用的上一頁的相對信息比較的，要補充差值……
        ralativePageNumarray[1] = ralativePageNumarray[1] + ralativeOff;
        ralativePageNumarray[0] = ralativePageNumarray[0] + ralativeOff;
    }

    // console.log('[獲取實際頁數] ', '要比較的3個頁數：',arguments, '，得到的差值:', ralativePageNumarray);
    if (isNaN(ralativePageNumarray[0]) || isNaN(ralativePageNumarray[1])) {
        return '';
    }

    var realPageSiteMatch = false;
    ralativeOff = ralativePageNumarray[1] - ralativePageNumarray[0];
    //上一頁與下一頁差值為1，並最大數值不超過10000(一般論壇也不會超過這麼多頁……)
    if (ralativeOff === 1 && ralativePageNumarray[1] < 10000) {
        realPageSiteMatch = true;
    }

    //上一頁與下一頁差值不為1，但上一頁與下一頁差值能被上一頁與下一面所整除的，有規律的頁面
    if (!realPageSiteMatch && ralativeOff !== 1) {
        if ((ralativePageNumarray[1] % ralativeOff) === 0 && (ralativePageNumarray[0] % ralativeOff) === 0) {
            realPageSiteMatch = true;
        }
    }

    if (!realPageSiteMatch) { //不滿足以上條件，再根據地址特征來匹配
        var sitePattern;
        for (var i = 0, length = REALPAGE_SITE_PATTERN.length; i < length; i++) {
            sitePattern = REALPAGE_SITE_PATTERN[i];
            if (currentUrl.toLocaleLowerCase().indexOf(sitePattern) >= 0) {
                realPageSiteMatch = true;
                break;
            }
        }
    }

    var ralativePageStr;
    if (realPageSiteMatch) { //如果匹配就顯示實際網頁信息
        if (ralativePageNumarray[1] - ralativePageNumarray[0] > 1) { //一般是搜索引擎的第xx - xx項……
            ralativePageStr = ' [ 實際：第 <font color="red">' + ralativePageNumarray[0] + ' - ' + ralativePageNumarray[1] + '</font> 項 ]';
        } else if ((ralativePageNumarray[1] - ralativePageNumarray[0]) === 1) { //一般的翻頁數，差值應該是1
            ralativePageStr = ' [ 實際：第 <font color="red">' + ralativePageNumarray[0] + '</font> 頁 ]';
        } else if ((ralativePageNumarray[0] === 0 && ralativePageNumarray[1]) === 0) { //找不到的話……
            ralativePageStr = ' [ <font color="red">實際網頁結束</font> ]';
        }
    } else {
        ralativePageStr = '';
    }
    return ralativePageStr || '';
}

function handleLazyImgSrc(rule, doc) {
    var imgAttrs = rule.split('|');
    imgAttrs.forEach(function(attr){
        attr = attr.trim();
        [].forEach.call(doc.querySelectorAll("img[" + attr + "]"), function(img){
            var newSrc = img.getAttribute(attr);
            if (newSrc && newSrc != img.src) {
                img.setAttribute("src", newSrc);
                img.removeAttribute(attr);
            }
        });
    });
}

function removeScripts(node) {  // 移除元素的 script
    var scripts = getAllElements('css;script', node);
    var scripts_x;
    for (i = scripts.length - 1; i >= 0; i--) {
        scripts_x = scripts[i];
        scripts_x.parentNode.removeChild(scripts_x);
    }
}

var noticeDiv;
var noticeDivto;
var noticeDivto2;
function notice(html_txt) {
    if (!noticeDiv) {
        var div = document.createElement('div');
        noticeDiv = div;
        div.style.cssText = '\
            position:fixed!important;\
            z-index:2147483647!important;\
            float:none!important;\
            width:auto!important;\
            height:auto!important;\
            font-size:13px!important;\
            padding:3px 20px 2px 5px!important;\
            background-color:#7f8f9c!important;\
            border:none!important;\
            color:#000!important;\
            text-align:left!important;\
            left:0!important;\
            bottom:0!important;\
            opacity:0;\
            -moz-border-radius:0 6px 0 0!important;\
            border-radius:0 6px 0 0!important;\
            -o-transition:opacity 0.3s ease-in-out;\
            -webkit-transition:opacity 0.3s ease-in-out;\
            -moz-transition:opacity 0.3s ease-in-out;\
        ';
        document.body.appendChild(div);
    }
    clearTimeout(noticeDivto);
    clearTimeout(noticeDivto2);
    noticeDiv.innerHTML = html_txt;
    noticeDiv.style.display = 'block';
    noticeDiv.style.opacity = '0.96';
    noticeDivto2 = setTimeout(function() {
        noticeDiv.style.opacity = '0';
    }, 1666);
    noticeDivto = setTimeout(function() {
        noticeDiv.style.display = 'none';
    }, 2000);
}

function $C(type, atArr, inner, action, listen) {
    var e = document.createElement(type);
    for (var at in atArr) {
        if (atArr.hasOwnProperty(at)) {
            e.setAttribute(at, atArr[at]);
        }
    }
    if (action && listen) {
        e.addEventListener(action, listen, false);
    }
    if (inner) {
        e.innerHTML = inner;
    }
    return e;
}

// css 獲取單個元素
function getElementByCSS(css, contextNode) {
    return (contextNode || document).querySelector(css);
}

// css 獲取所有元素
function getAllElementsByCSS(css, contextNode) {
    return (contextNode || document).querySelectorAll(css);
}

// xpath 獲取單個元素
function getElementByXpath(xpath, contextNode, doc) {
    doc = doc || document;
    contextNode = contextNode || doc;
    return doc.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// xpath 獲取多個元素.
function getAllElementsByXpath(xpath, contextNode, doc) {
    doc = doc || document;
    contextNode = contextNode || doc;
    return doc.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
}

// 獲取多個元素
function getAllElements(selector, contextNode, doc, win) {
    var ret = [];
    if (!selector) return ret;
    var Eles;
    doc = doc || document;
    win = win || window;
    contextNode = contextNode || doc;
    if (typeof selector == 'string') {
        if (selector.search(/^css;/i) === 0) {
            Eles = getAllElementsByCSS(selector.slice(4), contextNode);
        } else {
            Eles = getAllElementsByXpath(selector, contextNode, doc);
        }
    } else {
        Eles = selector(doc, win);
        if (!Eles) return ret;
        if (Eles.nodeType) { //單個元素.
            ret[0] = Eles;
            return ret;
        }
    }

    function unique(array) { //數組去重並且保持數組順序.
        var i, ca, ca2, j;
        for (i = 0; i < array.length; i++) {
            ca = array[i];
            for (j = i + 1; j < array.length; j++) {
                ca2 = array[j];
                if (ca2 == ca) {
                    array.splice(j, 1);
                    j--;
                }
            }
        }
        return array;
    }

    function makeArray(x) {
        var ret = [];
        var i, ii;
        var x_x;
        if (x.pop) { //普通的 array
            for (i = 0, ii = x.length; i < ii; i++) {
                x_x = x[i];
                if (x_x) {
                    if (x_x.nodeType) { //普通類型,直接放進去.
                        ret.push(x_x);
                    } else {
                        ret = ret.concat(makeArray(x_x)); //嵌套的.
                    }
                }
            }
            //alert(ret)
            return unique(ret);
        } else if (x.item) { //nodelist or HTMLcollection
            i = x.length;
            while (i) {
                ret[--i] = x[i];
            }
            /*
            for(i=0,ii=x.length;i<ii;i++){
                ret.push(x[i]);
            };
            */
            return ret;
        } else if (x.iterateNext) { //XPathResult
            i = x.snapshotLength;
            while (i) {
                ret[--i] = x.snapshotItem(i);
            }
            /*
            for(i=0,ii=x.snapshotLength;i<ii;i++){
                ret.push(x.snapshotItem(i));
            };
            */
            return ret;
        }
    }

    return makeArray(Eles);
}

// 獲取最後一個元素.
function getLastElement(selector, contextNode, doc, win) {
    var eles = getAllElements(selector, contextNode, doc, win);
    var l = eles.length;
    if (l > 0) {
        return eles[l - 1];
    }
}

function saveValue(key, value) {
    localStorage.setItem(key, encodeURIComponent(value));
}

function getValue(key) {
    var value = localStorage.getItem(key);
    return value ? decodeURIComponent(value) : undefined;
}

function createDocumentByString(str) {  // string轉為DOM
    if (!str) {
        C.error('沒有找到要轉成DOM的字符串');
        return;
    }
    if (document.documentElement.nodeName != 'HTML') {
        return new DOMParser().parseFromString(str, 'application/xhtml+xml');
    }

    var doc;
    try {
        // firefox and chrome 30+，Opera 12 會報錯
        doc = new DOMParser().parseFromString(str, 'text/html');
    } catch (ex) {}

    if (doc) {
        return doc;
    }

    if (document.implementation.createHTMLDocument) {
        doc = document.implementation.createHTMLDocument('superPreloader');
    } else {
        try {
            doc = document.cloneNode(false);
            doc.appendChild(doc.importNode(document.documentElement, false));
            doc.documentElement.appendChild(doc.createElement('head'));
            doc.documentElement.appendChild(doc.createElement('body'));
        } catch (e) {}
    }
    if (!doc) return;
    var range = document.createRange();
    range.selectNodeContents(document.body);
    var fragment = range.createContextualFragment(str);
    doc.body.appendChild(fragment);
    var headChildNames = {
        TITLE: true,
        META: true,
        LINK: true,
        STYLE: true,
        BASE: true
    };
    var child;
    var body = doc.body;
    var bchilds = body.childNodes;
    for (var i = bchilds.length - 1; i >= 0; i--) { //移除head的子元素
        child = bchilds[i];
        if (headChildNames[child.nodeName]) body.removeChild(child);
    }
    //alert(doc.documentElement.innerHTML);
    //debug(doc);
    //debug(doc.documentElement.innerHTML);
    return doc;
}

// 從相對路徑的a.href獲取完全的href值.
function getFullHref(href) {
    if (typeof href != 'string') href = href.getAttribute('href');
    //alert(href);
    //if(href.search(/^https?:/)==0)return href;//http打頭,不一定就是完整的href;
    var a = getFullHref.a;
    if (!a) {
        getFullHref.a = a = document.createElement('a');
    }
    a.href = href;
    //alert(a.href);
    return a.href;
}

// 任何轉成字符串，存儲，修改過
function xToString(x) {
    function toStr(x) {
        switch (typeof x) {
            case 'undefined':
                return Str(x);
            case 'boolean':
                return Str(x);
            case 'number':
                return Str(x);
            case 'string':
                return ('"' +
                    (x.replace(/(?:\r\n|\n|\r|\t|\\|")/g, function(a) {
                        var ret;
                        switch (a) { //轉成字面量
                            case '\r\n':
                                ret = '\\r\\n';
                                break;
                            case '\n':
                                ret = '\\n';
                                break;
                            case '\r':
                                ret = '\\r';
                                break;
                            case '\t':
                                ret = '\\t';
                                break;
                            case '\\':
                                ret = '\\\\';
                                break;
                            case '"':
                                ret = '\\"';
                                break;
                            default:
                                break;
                        }
                        return ret;
                    })) + '"');
            case 'function':
                var fnStr = Str(x);
                return fnStr.indexOf('native code') == -1 ? fnStr : 'function(){}';
            case 'object':
                //注,object的除了單純{},其他的對象的屬性會造成丟失..
                if (x === null) {
                    return Str(x);
                }
                switch (x.constructor.name) {
                    case "Object":
                        var i;
                        var rStr = '';
                        for (i in x) {
                            if (!x.hasOwnProperty(i)) { //去掉原型鏈上的屬性.
                                continue;
                            }
                            rStr += toStr(i) + ':' + toStr(x[i]) + ',';
                        }
                        return ('{' + rStr.replace(/,$/i, '') + '}');
                    case "Array":
                        var i;
                        var rStr = '';
                        for (i in x) {
                            if (!x.hasOwnProperty(i)) { //去掉原型鏈上的屬性.
                                continue;
                            }
                            rStr += toStr(x[i]) + ',';
                        }
                        return '[' + rStr.replace(/,$/i, '') + ']';
                    case "String":
                        return toStr(Str(x));
                    case "RegExp":
                        return Str(x);
                    case "Number":
                        return Str(x);
                    case "Boolean":
                        return Str(x);
                    default:
                        //alert(x.constructor);//漏了什麼類型麼?
                        break;
                }
            default:
                break;
        }
    }
    var Str = String;
    return toStr(x);
}

function toRE(obj) {
    if (obj instanceof RegExp) {
        return obj;
    } else if (obj instanceof Array) {
        return new RegExp(obj[0], obj[1]);
    } else {
        if (obj.search(/^wildc;/i) === 0) {
            obj = wildcardToRegExpStr(obj.slice(6));
        }
        return new RegExp(obj);
    }
}

function wildcardToRegExpStr(urlstr) {
    if (urlstr.source) return urlstr.source;
    var reg = urlstr.replace(/[()\[\]{}|+.,^$?\\]/g, "\\$&").replace(/\*+/g, function(str){
        return str === "*" ? ".*" : "[^/]*";
    });
    return "^" + reg + "$";
}


SP.init();

})();

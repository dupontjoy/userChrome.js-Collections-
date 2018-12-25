    // ==UserScript==
    // @namespace    synvaier@gmail.com
    // @name         最好的VIP视频破解
    // @description  点击通知消息，会跳转到破解网站，支持所有热门视频网站，优酷，爱奇艺，腾讯，搜狐，乐视，pptv，芒果tv，1905，暴风等
    // @license      MIT
    // @version      1.1.2
    // @match        *://v.youku.com/*
    // @match        *://*.iqiyi.com/v*
    // @match        *://v.qq.com/x/cover*
    // @match        *://film.sohu.com/album/*
    // @match        *://tv.sohu.com/v/*
    // @match        *://*.le.com/ptv/vplay/*
    // @match        *://v.pptv.com/show/*
    // @match        *://*.mgtv.com/b/*
    // @match        *://vip.1905.com/play/*
    // @match        *://*.baofeng.com/*
    // @grant        GM_openInTab
    // @grant        GM_notification
    // @run-at       document-body
    // ==/UserScript==

    //类: 通知消息
    class NotifiyMsg {
            constructor() {
                    this.title = '点击我跳转到破解网站';
                    this.text = '您正在看【' + document.title + '】';
                    this.timeout = 9000;
                    this.highlight = true;
            }

            show() {
                    GM_notification(this);
            }

            onclick() {
                    localStorage.ifClose = localStorage.ifClose || confirm('请问是否关闭当前页面？点击【确定】，当前页面2秒后自动关闭！');
                    localStorage.ifClose && setTimeout(window.close, 2000);
                    let url = encodeURIComponent(location.href);
                    //url = 'http://superov.com?encodeURLAddr='+ btoa(url);
                    url = 'http://v.renrenfabu.com/jiexi.php?url='+ btoa(url);
                    GM_openInTab(url, { active: true });
            }
    }

    new NotifiyMsg().show();
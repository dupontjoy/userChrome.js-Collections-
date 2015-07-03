##Redirector.uc.js及規則

Script create by **[cinhoo][1]** 参照Redirector扩展和AdBlock Plus扩展创作此神级腳本

Script mod by **[Oos][2]** 完善按钮与菜单切换版

**個人規則：** https://github.com/dupontjoy/userChromeJS/blob/master/Local/_redirector.js

![Redirector-Rules](img/Redirector-Rules.jpg)

###示例：

示例：鳳凰網 只顯示首圖修正

http://news.ifeng.com/a/ydzx/20150413/43541233_0.shtml 重定向到 http://news.ifeng.com/a/20150413/43541233_0.shtml

    {
      //方法來源：http://tieba.baidu.com/p/3699558655
      name: "鳳凰網 只顯示首圖修正",
      from: /^https?:\/\/(.*)\.ifeng\.com\/a\/(ydzx|)\/(.*)/i,
      to: "http://$1.ifeng.com/a/$3",
      regex: true
    },

示例：userscripts >> webextender鏡像

http://userscripts.org/ 和 http://userscripts.org:8080/ 都重定向到 http://www.webextender.net/

    {
     //userscripts.org和userscripts.org:8080都重定向到webextender.net
     name: "userscripts >> webextender鏡像",
     from: /^https?:\/\/userscripts\.org(?:\:8080|)\/(.*)/i,
     to: "http:\/\/webextender.net/$1",
     regex: true
    },


示例：sourceforge下載 >> 鏡像站點

http://sourceforge.net/projects/pcxfirefox/files/Release/Firefox/39.x/39.0/x86/sse2/pcxFirefox-39.0-zhTW-vc2013-x86-sse2-betterpgo-150703.7z/download 重定向到 http://master.dl.sourceforge.net/project/pcxfirefox/Release/Firefox/39.x/39.0/x86/sse2/pcxFirefox-39.0-zhTW-vc2013-x86-sse2-betterpgo-150703.7z

    {
     //在這樣的頁面點擊，就直接弹下載窗口
     //測試：http://sourceforge.net/projects/pcxfirefox/files/Release/Firefox/36.x/36.0.1/x86/sse2/
     name: "sourceforge下載 >> 鏡像站點",
     from: /^https?:\/\/sourceforge\.net\/projects\/(((\w)\w).*)\/files\/(.*)\/download/i,
     to: "http://master.dl.sourceforge.net/project/$1/$4",//這個源速度眞快
     //to: "ftp://ftp.jaist.ac.jp/pub/sourceforge/$3/$2/$1/$4",
     //to: "http://softlayer-sng.dl.sourceforge.net/project/$1/$4",
     regex: true
    },

示例：重定向12306的js到修改版

    {
     //重定向12306的js到修改版，用來定時刷票，但驗證碼得手動輸入。
     //方法來源：http://bbs.kafan.cn/thread-1809903-1-1.html
     name: "12306重定向JS",
     from: /(.*)kyfw\.12306\.cn\/otn\/resources\/merged\/queryLeftTicket_end_js.js(.*)/i,
     to: "https://raw.githubusercontent.com/dupontjoy/customization/master/12306/queryLeftTicket_end_js.js",
     regex: true
    },

![](https://raw.githubusercontent.com/dupontjoy/customization/master/12306/img/12306.jpg)

###部分規則卡飯發佈地址：

*[Google开源库重定向到国内][4]

*[百度云盘分享页，手机版 重定向至 电脑版][6]

[鳳凰網 只顯示首圖修正][7]

[Google搜圖去跳轉][8]

[百度貼吧和百科 原始大圖][9]

[500px.com原始大圖][10]

[贴吧手机页面定向][11]

[1]: http://bbs.kafan.cn/thread-1621837-1-1.html
[2]: https://github.com/Drager-oos/userChrome/blob/master/MainScript/Redirector.uc.js
[4]: http://bbs.kafan.cn/thread-1769934-1-1.html
[6]: http://bbs.kafan.cn/thread-1814510-1-1.html
[7]: http://bbs.kafan.cn/thread-1822205-1-1.html
[8]: http://bbs.kafan.cn/thread-1799098-1-1.html
[9]: http://bbs.kafan.cn/thread-1780442-1-1.html
[10]: http://bbs.kafan.cn/thread-1783842-1-1.html
[11]: http://bbs.kafan.cn/thread-1747112-1-1.html
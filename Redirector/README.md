##Redirector.uc.js及規則

Script create by **[cinhoo][1]** 参照Redirector扩展和AdBlock Plus扩展创作此神级腳本

Script mod by **[Oos][2]** 完善按钮与菜单切换版

Rules mod by **[Qing][3]** 收集并修改一些規則

![Redirector-Rules](img/Redirector-Rules.jpg)

###示例：

示例：鳳凰網 只顯示首圖修正

http://news.ifeng.com/a/ydzx/20150413/43541233_0.shtml 跳轉到 http://news.ifeng.com/a/20150413/43541233_0.shtml

    {
      //方法來源：http://tieba.baidu.com/p/3699558655
      name: "鳳凰網 只顯示首圖修正",
      from: /^https?:\/\/(.*)\.ifeng\.com\/a\/(ydzx|)\/(.*)/i,
      to: "http://$1.ifeng.com/a/$3",
      regex: true
    },

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
[3]: https://github.com/dupontjoy/userChromeJS/blob/master/Local/_redirector.js
[4]: http://bbs.kafan.cn/thread-1769934-1-1.html
[6]: http://bbs.kafan.cn/thread-1814510-1-1.html
[7]: http://bbs.kafan.cn/thread-1822205-1-1.html
[8]: http://bbs.kafan.cn/thread-1799098-1-1.html
[9]: http://bbs.kafan.cn/thread-1780442-1-1.html
[10]: http://bbs.kafan.cn/thread-1783842-1-1.html
[11]: http://bbs.kafan.cn/thread-1747112-1-1.html
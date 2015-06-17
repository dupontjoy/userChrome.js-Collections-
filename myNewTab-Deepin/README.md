myNewTab-Deepin
=============
**Originate by Defpt & ywzhaiqi**

**Deepin Mod by Hero Anonymous**

**Fix image download by Qing**

此版爲Deepin界面版：

仿：[http://start.linuxdeepin.com/index.zh_cn.html][1]

**1:** 從擴展版中提取

**2:** 修复下載圖片爲0KB的問題

**3: 媽媽再也不用擔心我被升級了**

**使用方法：**

第1步、解压后，把myNewTab整个文件夹复制到『extensions\userChromeJS@mozdev.org\content』下面，如图：
 
![文件夹位置示意图][2]

第2步、修改这两条参数：

> user_pref("browser.startup.homepage",
> "chrome://userchromejs/content/myNewTab/index.html");//首页
> 
> user_pref("browser.newtab.url",
> "chrome://userchromejs/content/myNewTab/index.html");//本地Html

大功告成！效果图：

![myNewTab-Classic预览图][3]

[1]:http://start.linuxdeepin.com/index.zh_cn.html
[2]: https://github.com/dupontjoy/userChrome.js-Collections-/blob/master/myNewTab-Classic/img/position.jpg
[3]: https://github.com/dupontjoy/userChrome.js-Collections-/blob/master/myNewTab-Deepin/img/myNewTab-Deepin.jpg

##CingFox
![icon](img/icon.jpg)

**Mod by Cing**

**個人Firefox配置完整打包**，基於pcxFirefox繁體中文版

自2008年Firefox 2.0開始使用Firefox，這麼多年下來，也積累了豐富的使用經驗。雖然不太懂代碼，但是因爲有一顆不怕折騰的心，折騰過擴展，油猴腳本，UC腳本，CSS樣式，正則規則，批處理等等。

本作界面基於[RunningCheese V5版](http://bbs.kafan.cn/thread-1821447-1-1.html)，使用的是Simple White主題+Yosemite樣式，整體界面清新自然，簡約時尚。(Yosemite樣式用Stylish擴展引導）

其馀擴展，腳本，和[樣式](https://github.com/dupontjoy/userChromeJS/tree/master/UserCSSLoader)（用[userCSSLoader.uc.js](https://github.com/dupontjoy/userChromeJS/blob/master/UCJSFiles/UserCSSLoader_ModOos.uc.js)引導）都是幾年下來不斷蒐集，小調整而來。

便攜版插件（Plugins）含：[個人提取的Flash32位](https://github.com/dupontjoy/userChrome.js-Collections-/tree/master/BackupProfiles_7z)，工行，CNTV，SumatraPDF等插件。

配置軟件（Software）含：一些FQ軟件（賬號不提供），Notepad2編輯器（[設爲默認的方法](https://github.com/dupontjoy/userChromeJS/blob/master/userContent/setRelativeEditPath.uc.js)）和截圖軟件。都是和Firefox息息相關的，其它不必要的軟件都不再打包。

###界面預覧：
<p align="center"><img width="650" src="img/preview.jpg" ></p>

####特色功能：
（左上角Logo ↓）<br/>
<p align="center"><img src="img/anobtn.jpg"></p>

（标签计数 ↓）<br/>
<p align="center"><img width="650" src="img/tab-number.jpg" ></p>

（标签加载进度条 ↓）<br/>
<p align="center"><img width="650" src="img/progressbar.jpg"></p>

（文件夹結构 ↓）<br/>
<p align="center"><img width="650" src="img/folder-structure.jpg"></p>

####各類右鍵菜單
（標籤右鍵菜單 ↓）<br/>
<p align="center"><img src="img/tab-right-menu.jpg"></p>

（頁面右鍵菜單 ↓）<br/>
<p align="center"><img src="img/page-right-menu.jpg"></p>

（鏈接和選中文字右鍵菜單 ↓）<br/>
<p align="center"><img src="img/link&select-right-menu.jpg"></p>

（輸入框右鍵菜單 ↓）<br/>
<p align="center"><img src="img/input-right-menu.jpg"></p>

（圖片右鍵菜單 ↓）<br/>
<p align="center"><img src="img/image-right-menu.jpg"></p>

（書籤右鍵菜單 ↓）<br/>
<p align="center"><img src="img/bookmark-right-menu.jpg"></p>

————————————————————————————————————————————
++++++++++++++++++++++++++++分割线++++++++++++++++++++++++++++++++
————————————————————————————————————————————
###說明：
1. 直接运行firefox文件夹中的firefox.exe即可<br/>
2. 換用简体Firefox程式：<br/>
（1）pcxFirefox+Portable.7z便携：<br/>
下载pcxFirefox（地址见参考），然后解压Portable.7z中的文件到firefox主程式中去。<br/>
（2）官方FTP原版+MyFirefox引导<br/>
3. 請仔细看user.js中参数的说明，酌情删减。<br/>
4. 配套软件都采用相对路径，请严格按照如下文件夹结构使用。会修改的朋友，可以自定义。<br/>
<p align="center" width="650"><img src="img/folder-structure.jpg"></p>
一些腳本中定義的相對路徑：<br/>
（1）setRelativeEditPath.uc.js定义了编辑器的相对位置：<br/>
<p align="center"><img width="650" src="img/note-1.jpg"></p>
（2）_anoBtn.js定义了左上角FFF Plus按钮中的软件的相对位置：<br/>
<p align="center"><img width="650" src="img/note-2.jpg"></p>
（3）BackupProfiles_7z.bat定义了配置与Firefox主程序的相对位置：<br/>
<p align="center"><img width="650" src="img/note-3.jpg"></p>

| | |
| :--- | :--- |
| **詳細說明及發佈地址** | http://bbs.kafan.cn/thread-1792671-1-1.html |
| SF Project | https://sourceforge.net/projects/qingfox/ |
| Chrome文件夾(UC腳本集) | https://github.com/dupontjoy/userChromeJS/ |

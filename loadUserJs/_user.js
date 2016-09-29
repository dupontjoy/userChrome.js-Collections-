{
'devtools.chrome.enabled': true,//VimFx必要
'devtools.command-button-eyedropper.enabled': true,
'devtools.command-button-rulers.enabled': true,
'devtools.selfxss.count': 0,
'privacy.donottrackheader.enabled': true,
//VimFx
'extensions.VimFx.prevent_autofocus': true,//阻止自动聚焦输入框
'extensions.VimFx.ignore_keyboard_layout': true,//忽略键盘布局
  /******************************************************************************************
 *这里是个人设置。
 *******************************************************************************************/
//*==========扩展设置==========*//
//adblockplus
'extensions.adblockplus.patternsbackups': 0,
'extensions.adblockplus.frameobjects': false,//在Java和Flash上显示标签 - 否
'extensions.adblockplus.subscriptions_antiadblockurl': "https://github.com/reek/anti-adblock-killer/raw/master/anti-adblock-killer-filters.txt",//原反-反ADP列表
//-非侵入式广告地址換成个人ABP规则
'extensions.adblockplus.subscriptions_exceptionscheckbox': true,//非入侵式广告勾选框
'extensions.adblockplus.subscriptions_exceptionsurl': "https://github.com/dupontjoy/customization/raw/master/Rules/ABP/Floating-n-Porn-Ads-Filter.txt",//原非入侵式广告订阅网址

//Autoproxy
'extensions.autoproxy.customProxy': "Shadowsocks;;1080;socks$GoAgent;;8087;$Lantern;;8787;$Psiphon;;8080;$Free%20Gate;;8580;",
'extensions.autoproxy.patternsbackups': 0,
'extensions.autoproxy.defaultstatusbaraction': 0,//点击图标时-快捷菜单
'extensions.autoproxy.defaulttoolbaraction': 0,//点击图标时-快捷菜单

//LastPass
'extensions.lastpass.hidecontextmenu': true,
'extensions.lastpass.showHomepageAfterLogin': false,//登入後不轉到密码库
'extensions.lastpass.0a148091163b8a7de3368af449db2947c700bea1552b01964d4ae55f930562e0.toplevelmatchingsites': true,//将匹配网站移动到顶部菜单
'extensions.lastpass.loginpws': "",//不保存密码

//FlashGot
'flashgot.hide-all': true,
'flashgot.hide-buildGallery': true,
'flashgot.hide-icons': true,
'flashgot.hide-it': true,
'flashgot.hide-media': true,
'flashgot.hide-options': true,
'flashgot.hide-sel': true,
'flashgot.omitCookies': true,//不发送Cookie
'flashgot.firstRunRedirection': false,//重建配置不弹FlashGot首页

//DownThemAll！
'extensions.dta.conflictresolution': 0,//文檔已存在時自動重命名
'extensions.dta.alertbox': 0,//下載完成後對話視窗提示
'extensions.dta.closedta': true,//辯識並列出Flash影片
'extensions.dta.ctxmenu': "0,0,0",//不顯示右鍵菜單
'extensions.dta.removecanceled': true,//從清單中移除中斷及錯誤的下載
'extensions.dta.confirmremove': false,//移除下載前不提示

//Greasemonkey
'extensions.greasemonkey.stats.prompted': true,//不弹改进建议提示
'extensions.greasemonkey.installDelay': 0,//安裝時的倒計時

//Stylish
'extensions.stylish.firstRun': 3,//重建配置不弹歡迎頁

//iMacros
'extensions.imacros.delay': 1000,//播放速度中等

//Pocket(Readitlater)
'extensions.isreaditlater.open': "tab",//新标签打开项目

//*==========脚本设置==========*//
//UC管理器取消延迟加载
'userChrome.EXPERIMENT': true,

//UserCSSLoader引导器
'UserCSSLoader.innereditor': false,//使用外部编辑器
'UserCSSLoader.showtoolbutton': false,//显示为菜单

//InspectElementModY
'userChromeJS.InspectElement.contentType': 2,//查看页面:Dom Inspector
'userChromeJS.InspectElement.mainWinType': 2,//查看窗口:Dom Inspector

//GrabScroll
'grabScroll.button': 1,//使用GrabScroll抓取的键位：中键
'grabScroll.clickable': false,//能够在链接上使用GrabScroll

//newDownloadPlus
//主界面
'userChromeJS.downloadPlus.downloadSound_Play': true,//下載完成提示音
'userChromeJS.downloadPlus.downloadFileSize': true,//精確顯示文件大小
'userChromeJS.downloadPlus.autoClose_blankTab': true,//自動關閉空白標籤
'userChromeJS.downloadPlus.download_speed': true,//下載面皮顯示下載速度
//下載界面
'userChromeJS.downloadPlus.download_dialog_saveas': true,//另存爲
'userChromeJS.downloadPlus.download_dialog_saveTo': true,//保存到
'userChromeJS.downloadPlus.download_dialog_saveTo_suffix': 1,//保存到——後綴樣式
'userChromeJS.downloadPlus.download_dialog_showCompleteURL': true,//双擊複製完整地址
'userChromeJS.downloadPlus.download_dialog_doubleclicksaveL': false,//双击保存執行下載
'userChromeJS.downloadPlus.download_dialog_doubleclickanyW': false,//双击任意地方執行下載
//其他
'userChromeJS.downloadPlus.new_Download': true,//新建下載
'userChromeJS.downloadPlus.new_Download_popups': true,//新建下載——是否彈窗
'userChromeJS.downloadPlus.downloadsPanel_removeFile': true,//從硬盤刪除
'userChromeJS.downloadPlus.download_checksum': true,//Hash計算
'userChromeJS.downloadPlus.save_And_Open': true,//保存并打開
'userChromeJS.downloadPlus.save_And_Open_RorL': 1,//保存并打開——打開文件
'userChromeJS.downloadPlus.download_dialog_changeName': true,//下載改名
'userChromeJS.downloadPlus.download_dialog_changeName_encodingConvert': true,//下載改名——是否開啟下拉菜單

//FeiRuoNet
'userChromeJS.FeiRuoNet.EnableRefChanger': true,//Refer切換,破解反盗链
'userChromeJS.FeiRuoNet.EnableUAChanger': true,//UA切換
'userChromeJS.FeiRuoNet.ModifyHeader': true,//HTTP头信息
'userChromeJS.FeiRuoNet.UrlbarSafetyLevel': false,//HTTPS等級高亮
'userChromeJS.FeiRuoNet.EnableProxyByError': false,//网络错误时代理
'userChromeJS.FeiRuoNet.ProxyMode': 0,//代理模式: 禁用代理

}
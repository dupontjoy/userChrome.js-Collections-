//==UserScript==
// @name           SougouDeskPic.uc.js
// @description    每次启动自动随机获取一张搜狗壁纸
// @homepageURL    http://bbs.kafan.cn/forum-215-1.html
// @note 2016.8.21 修复手动调用更新壁纸代码，顺便添加右键按钮，不必在那啥里面去配置了,同时修复了同步异步处理问题
// @note 2016.7.30 修复设置时间之后并没有成功的情况，原来是记录进pref的时候字段写错了。。。555555
// @note 11.22搜狗壁纸
// @note 11.22彼岸桌面壁纸
//==/UserScript==

//可供修改点1：表示间隔【多少分钟】范围【0--60*24*10】-0到10天  
var setTime = 60*12;//单位（分钟），默认为12小时   ->越界时间不准,就不好玩了 O_O
/**
注意如果不能成功的话，自己手动去吧 userchromejs.data.MyRiGouTime 设置为0
*/
// 可供修改点2：0-NetBian壁纸，1-Sougou壁纸
var userIndex = 1; 
var ALL = [
["http://www.netbian.com", 
// 可供修改点3：壁纸来源
"http://www.netbian.com/e/sch/index.php?keyboard=%C3%C0%C5%AE", 
"<a href=\"([^\"]{0,15})\" target=\"_blank\">", 
"<img src=\"([^\"]+)\"", 
"-1366x768.htm", 
"18"] //-1920x1080.htm

,["http://bizhi.sogou.com", 
// 可供修改点3：壁纸来源
"http://bizhi.sogou.com/label/search/?word=%B3%C7%CA%D0", 
"<a href=\"(/detail/info/[\\d]+)\" target=\"_blank\">", 
"<img height=\"600\" width=\"950\" src=\"([^\"]+)\"", 
null, 
"28"]
];
var dirURL;
var imgURL;
var site = ALL[userIndex][0];
var fatherurl = ALL[userIndex][1];
var regexp = RegExp(ALL[userIndex][2], "g"); //注意由于是全局量，所以在重复调用的时候需要重置lastIndex
var regexp2 = RegExp(ALL[userIndex][3], "g"); //注意由于是全局量，所以在重复调用的时候需要重置lastIndex
var otherInfo = ALL[userIndex][4];
var maxsize = ALL[userIndex][5];

function $(id) {
  return document.getElementById(id);
}

function $C(name, attr) {
  var el = document.createElement(name);
  if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
  return el;
}
var ins = $("context-openlinkintab");
ins.parentNode.insertBefore($C("menuitem", {
  id: "ACRiLeSouGou",
  label: "下一张壁纸",
  tooltiptext: "快速的切换桌面壁纸",
  onclick: "window.sougouPIC.setRileGou()",
  class: "menuitem-iconic",
  image: "data:image/png;base64,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",
}), ins);
window.sougouPIC = {
    checkRileGou:function(yourIndex) {
        if(yourIndex != null)   userIndex = yourIndex;
        setTime = setTime * 60000;
        var now=getNow();
        var history=getprfDate();
        if(now-history > setTime) {
            init();
        }
    },
    setRileGou:function(yourIndex) {
        init();
    }
}
function getNow () {
    var time=new Date().getTime() % 1000000000;
    return time;
}
function getprfDate () {
    var pref=Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    try {
        var data=pref.getIntPref('userchromejs.data.MyRiGouTime');
        return data;
    }
    catch(err) {
        pref.setIntPref('userchromejs.data.MyRiGouTime',0);
        return 0;
    }
}
function init (){
    // 先获取这里的N张图片的随机一张的网页地址
    var url = fatherurl;
    var xhr=new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange=function() {
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                var htmls = xhr.responseText;
                var tmpstr, tmpcount=0;
                var randomNum = Math.round(Math.random()*maxsize);
                while((tmpstr = regexp.exec(htmls)[1]) != null){
                    tmpcount++;
                    if(tmpcount == randomNum) break;
                }
                regexp.lastIndex = 0; //一定要有，为此我付出了一个晚上的代价
                dirURL = site+tmpstr;
                if(otherInfo != null){
                    var end = 
                    dirURL = dirURL.substr(0, dirURL.length-4)+otherInfo;
                }
                initDirURL();
            }
        }
    }
    xhr.send();
}
function initDirURL (){
    var xhr2 = new XMLHttpRequest();
    xhr2.open('GET', dirURL, true);
    dirURL = null;
    xhr2.onreadystatechange=function() {
        if(xhr2.readyState == 4){
            if(xhr2.status == 200){
                var endhtmls = xhr2.responseText;
                //endhtmls = endhtmls.substr(8800);
                imgURL = regexp2.exec(endhtmls)[1];
                regexp2.lastIndex = 0;
                setImg();
            }
        }
    }
    xhr2.send();
}
// 使用正则获得到改网页对应的大图的地址
function setImg (){
    var image = new Image();
    image.src=imgURL;
    image.onload=function() {
        var pref=Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
        var currentTime = new Date().getTime() % 1000000000;
        pref.setIntPref('userchromejs.data.MyRiGouTime', currentTime);
        var shell=Cc["@mozilla.org/browser/shell-service;1"].getService(Ci.nsIShellService);
        shell.setDesktopBackground(image,Ci.nsIShellService["BACKGROUND_STRETCH"]); 
        //try{var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        //var path = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfLD", Components.interfaces.nsILocalFile).path + "/ProfD/" + "sougou/"+new Date().getTime()+ ".jpg";
        //alert(path.replace("/\\/g", "/"));
        //file.initWithPath(path);
        //file.create(Components.interfaces.nsIFile.NOMAL_FILE_TYPE, 0777)		
        //Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist).saveURI(Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(imgURL, null, null), null,null,null,null,null, file,null);
        //imgURL = null;
        //}catch(err){alert(err)};    
    }
}
window.sougouPIC.checkRileGou();
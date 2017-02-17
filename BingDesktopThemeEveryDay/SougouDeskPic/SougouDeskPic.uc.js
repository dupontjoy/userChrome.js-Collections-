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
var setTime = 60*1;//单位（分钟），默认为12小时   ->越界时间不准,就不好玩了 O_O
/**
注意如果不能成功的话，自己手动去吧 userchromejs.data.MyRiGouTime 设置为0
*/
// 可供修改点2：0-NetBian壁纸，1-Sougou壁纸
var userIndex = 0; 
var ALL = [
["http://www.netbian.com", 
// 可供修改点3：壁纸来源
//"http://www.netbian.com/weimei/",//唯美
//"http://www.netbian.com/jianzhu/",//建筑
//"http://www.netbian.com/fengjing/",//风景
//"http://www.netbian.com/dongwu/",//动物
//"http://www.netbian.com/e/sch/index.php?keyboard=%C3%C0%C5%AE",//美女
"http://www.netbian.com/e/sch/index.php?keyboard=%B3%C7%CA%D0",//城市
"<a href=\"([^\"]{0,15})\" target=\"_blank\">", 
"<img src=\"([^\"]+)\"", 
"-1920x1080.htm", //-1366x768.htm
"17"], //-1920x1080.htm

["http://bizhi.sogou.com", 
// 可供修改点3：壁纸来源
//"http://bizhi.sogou.com/label/index/44",//周最热
//"http://bizhi.sogou.com/label/index/221",//风景周最热
//"http://bizhi.sogou.com/label/index/573",//心情周最热
"http://bizhi.sogou.com/label/index/731",//环游世界
//"http://bizhi.sogou.com/label/search/?word=%B3%C7%CA%D0",//城市
"<a href=\"(/detail/info/[\\d]+)\" target=\"_blank\">", 
"<img height=\"600\" width=\"950\" src=\"([^\"]+)\"", 
null, 
"28"],
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
  image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAlklEQVQ4ja2TwQ2AIAxF3ypO4iLMwRgs4Q6s4AYu4JmjZz20RCFiKvqThnDo4/cD8JP2zioAPYc2AQ5YgKQVgcEKGIFV16ygoKHRU2wi4G8se2C2AILary3XesxgAjZklIhk8gqQ5RS2KPAKagLu5s+wZAEkyhu4arMARsRy4AzSI3lMFgDaGLUpIddXj/b/U/70mbp1ACqzUNIq3zfEAAAAAElFTkSuQmCC",
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
                //alert(dirURL);
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
//==UserScript==
// @name           SougouDeskPic.uc.js
// @description    每次启动自动随机获取一张搜狗壁纸
// @homepageURL    http://bbs.kafan.cn/forum-215-1.html
// 
//==/UserScript==
var setTime = 0; //表示间隔多少分钟范围【0-60*24*10】-0到10天                     ->越界时间不准,就不好玩了       O_O
// father网页，只要是搜狗的有4*7张大图的应该都可以-----也可以用搜索结果，但是不能有中文，否则js失效
var fatherurl = "http://bizhi.sogou.com/label/index/44";
var regexp = RegExp("<a href=\"(/detail/info/[\\d]+)\" target=\"_blank\">", "g"); //注意由于是全局量，所以在重复调用的时候需要重置lastIndex
var regexp2 = RegExp("<img height=\"600\" width=\"950\" src=\"([^\"]+)\"", "g"); //注意由于是全局量，所以在重复调用的时候需要重置lastIndex

var dirURL;
var imgURL;
window.sougouPIC = {
    setRileGou:function() {
        setTime = setTime * 60000;
        var now=getNow();
        var history=getprfDate();
        if(now-history > setTime) {
            init();
            initDirURL();
            setImg();
        }
    }
}
function getNow () {
    var time=new Date().getTime() % 1000000000;
    return time;
}
function getprfDate () {
    var pref=Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    try {
        var data=pref.getIntPref('userchromejs.data.MysougouTime');
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
    xhr.open('GET', url, false);
    xhr.onreadystatechange=function() {
        if(xhr.readyState == 4){
            if(xhr.status == 200){
                var htmls = xhr.responseText;
                var tmpstr, tmpcount=0;
                var randomNum = Math.round(Math.random()*28);
                while((tmpstr = regexp.exec(htmls)[1]) != null){
                    tmpcount++;
                    if(tmpcount == randomNum) break;
                }
                regexp.lastIndex = 0; //一定要有，为此我付出了一个晚上的代价
                dirURL = "http://bizhi.sogou.com"+tmpstr;
            }
        }
    }
    xhr.send();
}
function initDirURL (){
    var xhr2 = new XMLHttpRequest();
    xhr2.open('GET', dirURL, false);
    dirURL = null;
    xhr2.onreadystatechange=function() {
        if(xhr2.readyState == 4){
            if(xhr2.status == 200){
                var endhtmls = xhr2.responseText;
                endhtmls = endhtmls.substr(8800);
                imgURL = regexp2.exec(endhtmls)[1];
                regexp2.lastIndex = 0;
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
        //alert("image.onload");
        var pref=Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
        var currentTime = new Date().getTime() % 1000000000;
        pref.setIntPref('userchromejs.data.MyRiGouTime', currentTime);
        var shell=Cc["@mozilla.org/browser/shell-service;1"].getService(Ci.nsIShellService);
        shell.setDesktopBackground(image,Ci.nsIShellService["BACKGROUND_STRETCH"]); 
        try{var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        var path = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfLD", Components.interfaces.nsILocalFile).path + "\\ProfD\\" + "\\sougou\\"+new Date().getTime()+ ".jpg";
        file.initWithPath(path);
        file.create(Components.interfaces.nsIFile.NOMAL_FILE_TYPE, 0777)		
        Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist).saveURI(Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(imgURL, null, null), null,null,null,null,null, file,null);
        imgURL = null;
        }catch(err){alert(err)};    
    }
    image.send();
}
window.sougouPIC.setRileGou();
//==UserScript==
// @name            DesktopWallpaper.uc.js
// @description     每次启动自动随机获取一张 必应壁纸 或 360壁纸
// @homepageURL     http://bbs.kafan.cn/thread-2085274-1-1.html
// @note 2017.05.08 第二个版本出来了，修改了下以前的壁纸获取方式，360壁纸偶尔还是有问题
// @note 2017.04.08 第一个版本出来了，包含必应壁纸和360壁纸，如果有bug你来打我呀
//==/UserScript==

//壁纸位置在Profiles/AppData/Mozilla/Firefox/桌面背景.bmp，如果不在，请参照这个位置
var setTime = 60*2;//单位(分钟)，默认为12小时，即超过12小时，自动换壁纸
var useBing = false; //true -->使用必应壁纸; false --->使用360壁纸
//var use360 = true;

var getUrl;
if(useBing){
    getUrl = "http://www.bing.com/HPImageArchive.aspx?format=js&idx=-1&n=7&mkt=zh-CN"; //idx=-1,明天; 0,今天; 1,昨天 n貌似最大只能为7
}else{
    //getUrl = "http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=search&start=0&count=20&kw=美女";//搜索方式[20张]---推荐
    getUrl = "http://wallpaper.apc.360.cn/index.php?c=WallPaperAloneRelease&a=getAppsByRecommWithTopic&order=create_time&start=0&count=20";//最新的一组[20张]---推荐
    //getUrl = "http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByTagsFromCategory&cids=6&start=0&count=20&tags=性感女神";//特殊，使用TAG-不推荐
    //getUrl = "http://wallpaper.apc.360.cn/index.php?c=WallPaper&a=getAppsByTagsFromCategory&cids=15&start=0&count=10&tags=温馨一刻";//特殊，使用TAG-不推荐
}
function $(id) {
  return document.querySelector(id);
}
function $C(name, attr) {
  var el = document.createElement(name);
  if (attr) Object.keys(attr).forEach(function(n) el.setAttribute(n, attr[n]));
  return el;
}
var ins = $("#context-openlinkintab");
ins.parentNode.insertBefore($C("menuitem", {
  id: "ACRiLeBing",
  label: "下一张壁纸",
  tooltiptext: "快速的切换桌面壁纸",
  onclick: "window.wallpaperPIC.setRileGou()",
  class: "menuitem-iconic",
  image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADA0lEQVQ4ja3TW0hTcRwH8H9wqIdIymSMITbczHnmYrazY7vPs/1P7ZyjWKSx5ea6WCRRGV0oZf8sKooI6S4i+aAVTSKiJI3oAtqFyIiM6iWKLiuTotvrtxdz9tBD0O/lBz/4fh5+/H6E/I9yuVyix+NKud0i83vdLBj0s7AkMWWRzKo0hS2prmKJuhhbvTLJkok6Vh+Pp+LxePkEYC4sTJls5RDUBPxLG0Dr1iNc1wSa3AJ51TZoa3agoeUgGpoPon7rXsjVtaCUpiYAg17HSmkcyw9fQ1P3fbRcfIrmyy+xo/8tNvS9wf7BDzjz4hs6H33B0TufULuhFaIgsAlAr8tjtoWrsLxtEFt6R9Da/xo7BzJovJzB2isf0f7kO7pf/MTJ4a84cu8LljXtwXx76WQgl5WEV0LbewuNPY+xs/8lYl0jWHhqBKsvvELnsx84/ugrDg19xoFbGVStawZvsWQBXe5MZgok4d4+gPquYdR2DsPGbqN0zxB2D37Ascff0HpzDC1X32FT73P4Y5sxt9CYBfJyZzJDeQz2zX0IHRqEpfk6Zq3vAz35EPuGPmP7wBjWpt8g3vEUS488gKO6EcYCw59AHi+jJNkJ84rTmF3TjlnL2iHv6sOKE3dRvf8mpK2XENx4HhVNPbD4lsCg12UBg0HPiixWlM53wyb4YHP64fCEEKRVCNJKeCUF5b4whAVB2J1elPA25OfnT1qiXp8yGo0oLiqClecxb54NXo8bmqqCUgqn04kyux08XwKzyYSCggLodLrsHYiiqAUCgTSlNB2JRM5pmna2pqamt7KyMqMoSkbTtF5VVc/KsnxOkqS01+tNi6KoZS/RbM4RPEKxIAhlkUhkXTQabYtGox2SJL0PhULvE4lERywWa1NVtVEURcHhcFjMZnPO7/wUQsh0QsgcQojM8/z1QCAwSikdDYVCY+FweExRlNGKioqPVqv1BiFkMSGkmBAyY/I/TSWE5BJCTBzHuTiO83Mc5+M4zjvefeMz93hYRwiZ9vf3/If6BQhfWSkcE3yUAAAAAElFTkSuQmCC"
}), ins);
window.wallpaperPIC = {
    checkRileGou:function(yourIndex) {
        if(yourIndex != null)   userIndex = yourIndex;
        setTime = setTime * 60000;
        var now=getNow();
        var history=getprfDate();
        if(now-history > setTime) {
            WallPaper_FindImage(getUrl);
        }
    },
    setRileGou:function(yourIndex) {
        WallPaper_FindImage(getUrl);
    }
}
function getNow () {
    var time=new Date().getTime() % 1000000000;
    return time;
}
Math.seed = 5;
Math.seededRandom = function(max, min) {
    max = max || 1;
    min = min || 0;
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    var rnd = Math.seed / 233280.0;
    return min + rnd * (max - min);
};
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
function WallPaper_FindImage(url){
//     var url = 'http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=10&mkt=en-US';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            console.log(xhr.responseText);
            var imgUrl = "";
            var resp = JSON.parse(xhr.responseText);
            if(url.indexOf("bing") > 0){
                imgUrl = "http://www.bing.com";
                resp = resp.images;
            }else{
                resp = resp.data;
            }
            var randomNum = parseInt(new Date().getTime()%100/100*resp.length);
            imgUrl += resp[randomNum].url;
            setImg(imgUrl);
        }
    }
    xhr.send();
}
// 使用正则获得到改网页对应的大图的地址
function setImg (imgURL){
    //alert(imgURL);
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
window.wallpaperPIC.checkRileGou()
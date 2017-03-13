//==UserScript==
// @name         BingDesktopThemeEveryDay.uc.js
// @description  每天第一次运行Firefox，将下载Bing首页背景，并设置为系统桌面背景。每天換背景，天天好心情，哦㖿！
// @author       527836355
// @include      main
// @charset      utf-8
// @version      1.1
// @mod          http://bbs.kafan.cn/forum.php?mod=redirect&goto=findpost&ptid=2080368&pid=39498368
// @homepageURL  https://github.com/dupontjoy/userChrome.js-Collections-/tree/master/BingDesktopThemeEveryDay

//2017.03.13 必应美图改到配置文件夹下

var bingWallpaperDesktop=function(){
    var prefManager=Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    return{
        fixDate:function(d){
            if(d<10)
                d='0'+d;
            return d;
        },
        getNow:function(){
            var d=new Date(),
                dt=d.getDate()+1,
                y,
                m;
            d.setDate(dt);
            y=d.getFullYear();
            m=this.fixDate(d.getMonth()+1);
            dt=this.fixDate(d.getDate());
            return parseInt(''+y+m+dt);
        },
        getDDate:function(){
            var pref;
            try{
                pref=prefManager.getIntPref('extensions.bingwallpaperdesktop.datadate');
                return pref;
            }
            catch(e){
                prefManager.setIntPref('extensions.bingwallpaperdesktop.datadate',0);
                return 0;
            }
        },
        init:function(){
            var ths=this;
            var xhr=new XMLHttpRequest();
            xhr.open('GET','http://cn.bing.com/HPImageArchive.aspx?format=js&idx=-1&n=1&nc='+new Date().getTime(),false);
            xhr.onload=function(){
                var response=JSON.parse(this.responseText),
                    images=response.images[0],
                    enddate=parseInt(images.enddate),
                    imgref=images.url,
                    cp=images.copyright,
                    ni=new Image();
                imgref='http://cn.bing.com'+imgref; 
                if(ths.getDDate()<enddate){
                    prefManager.setIntPref('extensions.bingwallpaperdesktop.datadate',enddate);
                    ni.src=imgref;
                    ni.onload=function(){
                        var shell=Cc["@mozilla.org/browser/shell-service;1"].getService(Ci.nsIShellService);
                        shell.setDesktopBackground(ni,Ci.nsIShellService["BACKGROUND_STRETCH"]);
                        try{
                            var file=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile),
                                //path="C:\\必应美图\\"+enddate+"-"+cp.replace(/ \(.*?\)/g,'')+".jpg";                
                            path=Services.dirsvc.get("ProfD", Ci.nsILocalFile).path + "\\BingDesktopTheme\\"+enddate+"-"+cp.replace(/ \(.*?\)/g,'')+".jpg"; 
                            file.initWithPath(path);
                            file.create(Components.interfaces.nsIFile.NOMAL_FILE_TYPE,0777);
                            Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist).saveURI(Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(imgref,null,null),null,null,null,null,null,file,null);
                        }
                        catch(err){
                            return false;
                        }
                    };
                }
            };
            xhr.send();
        },
        run:function(){
            var ths=this,
                runs=function(){
                    var now=ths.getNow(),
                        datadate=ths.getDDate();
                    if(now>datadate)
                        ths.init();
                };
            runs();
            setInterval(runs,120000);
        }
    };
}();
bingWallpaperDesktop.run();
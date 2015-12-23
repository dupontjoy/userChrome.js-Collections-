/******************************************************************************************
 *RefererChange，破解反外链。
//@NORMAL: 不改变referer
//@FORGE: 发送根站点referer
//@ORIGINAL: 发送打开站点referer
//@BLOCK: 发送空referer
 *******************************************************************************************/
var RefererChange = {
//2015.01.18 08:00 新增economist.com
//2015.01.15 新增wsj.com
//2014.12.16 增加poco
//2014.11.25 增加chiphell,niunews
//2014.11.09 增加pconline和postimg

 //目标网址类
'www.economist.com': 'https://www.google.com/',//突破每週3篇限制 
'www.wsj.com': 'https://www.google.com/',//免登陆或订阅看全文
'img.liufen.com': 'http://www.liufen.com.cn/',
'mangafiles.com' : 'http://www.imanhua.com/',
'douban.com': 'http://www.douban.com',
'yyets.com': 'http://www.yyets.com/',
'space.wenxuecity.com': 'http://bbs.wenxuecity.com/',
'www.autoimg.cn': 'http://club.autohome.com.cn/',
'kkkmh.com': 'http://www.kkkmh.com/',
'nonie.1ting.com': 'http://www.1ting.com/',
'img.knb.im': 'http://www.kenengba.com/',
'xici.net': 'http://www.xici.net/',
'media.chinagate.com': 'http://www.wenxuecity.com/',
'jdstatic.tankr.net': 'http://jandan.net/',
'sankakustatic.com': 'http://chan.sankakucomplex.com/',

// baidu 相关网站
'hiphotos.baidu.com': '@FORGE',
'hiphotos.bdimg.com' : '@FORGE',
'imgsrc.baidu.com': '@FORGE',
'baidu-img.cn': 'http://www.baidu.com/',
'bdstatic.com': 'http://tieba.baidu.com/',

// sina
'photo.sina.com.cn': '@BLOCK',
'sinaimg.cn': 'http://blog.sina.com.cn/',

//天涯
'tianya.cn': 'http://bbs.tianya.cn/',
'laibafile.cn' : 'http://www.tianya.cn/',

//其它
'bjguahao.gov.cn': '@BLOCK',//从其它网址跳转打不开
'bimg.126.net': '@FORGE',
'tankr.net': '@FORGE',
'51cto.com': '@FORGE',
'pconline.com.cn': '@FORGE',
'postimg.org': '@FORGE',
'chiphell.com': '@FORGE',
'niunews.cn': '@FORGE',
'poco.cn': '@FORGE',
'jump.bdimg.com': '@NORMAL',
'tmoke.com': '@BLOCK',
'51img1.com' : '@FORGE',
'zol-img.com.cn' : '@FORGE',
'img.cnbeta.com': '@FORGE',
'pixiv.net': '@FORGE',
'ph.126.net' : '@FORGE',
'isnowfy.com': '@FORGE',
'image.itmedia.co.jp': '@FORGE',
'2ch.net': '@FORGE',
'imepita.jp': '@ORIGINAL',
'tumblr.com': '@FORGE',
'photo.store.qq.com': '@FORGE',
'img.pconline.com.cn': '@FORGE',
'fc2.com': '@BLOCK',
'blogs.yahoo.co.jp': '@BLOCK',
'hentaiverse.net': '@BLOCK',
'qlogo.cn': '@BLOCK',
'qpic.cn': '@BLOCK',
'fmn.rrfmn.com': '@BLOCK',
'postimage.org': '@FORGE',
};

/******************************************************************************************
 *这里是UA自动切换规则列表。
 *支持正则匹配。
 *******************************************************************************************/
var UASites = [
//2015.05.11 13:00 更新工行規則
//2015.03.31 11:00 新增115Browser
//2015.01.15 FX35工行不支持10.0，新增20.0UA
//2014.12.11 調整圖標
{url : "http://(.*)\\.(chaojibiaoge|domypp)\\.com/",label : "Firefox20.0"},
{url : "http://www\\.apple\\.com/",label : "Chrome - Win7"},
{url : "https?://(?:mybank.*|b2c.*)\\.icbc\\.com\\.cn/",label : "Firefox20.0"},//工商銀行
{url : "https?://(.*?)n\\.baidu\\.com/",label : "Chrome - Win7"},//百度云
{url : "https?://(.*)?115\.com/",label : "115Browser"},
{url : "http:\/\/vod\.kankan\.com/",label : "Safari - Mac"}, //直接可以看kankan视频，无需高清组件
{url : "http:\/\/wap\.*",label : "UCBrowser"}, //WAP用UC浏览器
{url : "http:\/\/browser\.qq\.com\/*",label : "Chrome - Win7"}, 
{url : "http://www\\.google\\.co\\.jp\\m/",label : "iPhone"},
{url : "http://wapp\\.baidu\\.com/",label : "iPhone"},
{url : "http://wappass\\.baidu\\.com/",label : "iPhone"},
{url : "http://wapbaike\\.baidu\\.com/",label : "iPhone"},
{url : "http://weibo\\.cn/",label : "iPhone"},
{url : "http://m\\.hao123\\.com/",label : "iPhone"},
{url : "http://m\\.mail\\.163\\.com/",label : "iPhone"},
{url : "http://w\\.mail\\.qq\\.com//",label : "iPhone"},
{url : "http:\/\/m\\.qzone\\.com/",label : "iPhone"},
{url : "http://wap\\.58\\.com/",label : "iPhone"},
{url : "http://i\\.jandan\\.net/",label : "iPhone"},
{url : "http://www\\.tianya\\.com\\m/",label : "iPhone"},
{url : "http://m\\.xianguo\\.com\\wap/",label : "iPhone"},
{url : "http:\/\/ti\\.3g\\.qq\\.com/",label : "iPhone"},
{url : "http:\/\/[a-zA-Z0-9]*\\.z\\.qq\\.com/",label : "iPhone"},
];

/******************************************************************************************
 *这里是脚本中用到的各种图标设置。
 *******************************************************************************************/
var Icons = {
	//等待时国旗图标，预设Firefox内部图标【chrome://branding/content/icon16.png】。
	DEFAULT_Flag: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACG0lEQVQ4ja2TwW7aQBRF+ZDku0q/qChds5mxkDG2iY3H9jyTBFAWLAgRG7CwCawQi6BEQhgEFkiAuF3VaVXaSlWvdBazuGfx5r1c7n/H9/1rIvpCAUWS5E6S3FFAkU9+wff967+VP1FA6fPzMwaDAcbjMQaDAabTKSggEFEqpcxfLEvp5huNxnmxWGC73SIMQ9Tv6gjqAbrdLqT0Ub+rg4jOUro/S4QQV57nbZMkwel0wvF4xGazQafTgeu5GY1GA8PhEMITqRDiKhM4jnPTbrdxOBxwOByQJAlcz4UQ4heiKILruXAc52smsGzrpd/v4/X1FcPhEBQQ7Jp9kVarhdlsBsu2Xj4E1u3x/v4eRATLuv0tQT3AdDrFcrmEZd2eMoFZNXdm1cSP2DUbZtUEEYECglk1MRqNkKYp3t/fYZjGPhPohh7rhg7d0PH09IQ4jjGbzdBsNtHr9SBcAd3QMZlMMJ/PEYYhdEOPM0G5Ur7RKhoeHx+xWq2wXq+xXq/x9vaGVqsFraJBq2jQDT17l8vljyFyzq9UVd2qqoooirBarTLCMIRds6GqKgzTgOPUoKpqyjn/+MZcLpdTFCVfKpXOlm1huVwiSRIkSYLFYgGzauLh4QHNZhNaRTsrinJ5GxljeUVRUil99Ho9dLtduJ4LKX0QERRFSTnnny+Wv6dYLF4zxgqMsZhzvuec7xljMWOsUCwW/3xM/5JvTakQArDW8fcAAAAASUVORK5CYII=",

	//未知的国旗图标，预设同上，如不喜欢内置默认，可以再这里修改。
	Unknown_Flag: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwUlEQVQ4jZWRMahScRjFL40REW9ojqaGhoaGprg0eL3//3fkj0pCDrYp2hARmRItjk4ND0EuSFMgSEQIiuMjEjdnwUGIvLdF+bxc/j6ut8X3eM9X7z3P+vE7nPMdw9gRgPdEdCSlPJRS3t+9Xyrbtp8A4FqtFmQyGQbARHRERAXLsg6uNADwMZ1O83q9jpbLZdjtdnW5XPa3Rksi+iqEeA7g5j8NFosFu64bRjuaz+dhu93WhULBB8AAXCll3TTNO6fweDx+qLWOwvACf06TySR0HCdQSjGAt2fjKwA8m83+6zCdTsNWqxXkcjkG4Nq2/ezUgIg+ZbNZ3mw25yDP88JOp6NLpdLJL/4AaAkhnu4+cFyv14MoiiJmjvr9vq5Wq34ikeBt7+8AXpimeevC8+Lx+D0APBgMdK/X08lk8gT6KaV8HYvF7l46nxDiJQD2PC+sVCo+Ef0A8ODK3c/0/5zP5/0gCCKlFBPRu2vD2/6/ms1mMBqNjgGwEOLxtWEhxCMAPBwOjx3H0UT02zCMG/vEf6OU4tVqFRWLRZ+IvuwVn4g+pFIpbjQawXbnV3sZWJZ1IKU8BDAhom+2bd/eh/8LEFU+M9Rx2boAAAAASUVORK5CYII=",

	//本地文件图标，预设同上，如不喜欢内置默认，可以再这里修改。
	File_Flag: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAYAAAAS7Y8mAAAB3ElEQVQ4jZ3QT2vTcBzH8YGPxpt4EHwmHoc+BRV8ADuu+8MG2w47DJINVkLHWDrFKXpYBtqmttl+JV3/Zk1/SX5pfklq09TCx8O0yLB/0g+8j9/X4bu09GB7ex9fHB8XqSgqVBQVKgj3iaJCj46+0f39r8Wtrezzh3czl0plXxUKLjj/BcuKYNv3MRbDMEKk0wWIonKTSp0+SwSvrmaXVdUGY33Uau64RsODrts4OVFhGH2I4tWPlZXTp4ngfN6C4/RBCEWp1IammSCEQtM6kKQcwnAEyxpCknLft7c/PJkbzuUoGIug6zYIoSiXKSoVB4RQCIICVTVAiAVFMbC7+/nq4ODL47lh141QrbrQdQeVioPbW4ZazYUsl5DJ5JHJqJDlIi4uGtjZ+fQuATxAvd5FtcrGNZscphnANAO02wE4j1Euc6ytya/nhj0vQqvlodHo/pM7rl53Yds9XF93k8IDGIaPVov/t2aTg7H+InCMdjvE3V0wMdeNksOcx+h0Qpjm5LrdwWKwZfVA6eQ8L4amLQDb9s+pcZ4QzucpfH8Ix+lPzfeHSV7x/mWhwBAEIzAWTy0IRiAkwMbG+duZ8OZmdjmdLoaHh5ehIFz2ZiVJWri+fvbmz/mjv85vk5TTd5np7HoAAAAASUVORK5CYII=",

	//Base64编码地址图标，预设同上，如不喜欢内置默认，可以再这里修改。
	Base64_Flag: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAANCAYAAACgu+4kAAABC0lEQVQokZXTTSvEcRDA8Q/ZcvBQLlIeXoCDUl6Aq4tQzm7egHZtCoUk70EOXEjC3UEuDk4uHo8ODkIu2l27Djubv4e1a2qa38PMd2b6zQ92kUPpn5rHjlhcYREZpDETtpouRExO0JZ8SgN61JbliFVCNnExjhtM1ABkfwN04CTOztGdCGiN6v4ETOMZ63gI24ghHGOsGmAWnbjAAVqwgscI2g+/S/RXA6Qj+3A4dOEsKnkK4DWO0Kb8YiV4xyZusYFUosxRvGIbzZjEC+YxVwEUIsM9Bn2VFEbQF/smrEZrp5FcIUhr6pN2HKJYAeSjtwFM+Tl1mW+axlYkzlOe5yx6cae+f1DEG/Y+AKR8auXF6Pi+AAAAAElFTkSuQmCC",

	//LocalHOST【127.0.0.1】【::1】，预设同上，如不喜欢内置默认，可以再这里修改。
	LocahHost_Flag: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAYAAAAS7Y8mAAABNklEQVQ4ja2UwUpCQRSGPwx9gyAfooVLF0GLXiFo5QsUlkHcUgjcCZVEqIueQGjlIqwWbXqAom2IVJu2Bobg4raYM93D8ard7IeBuf/85xtm7szApA6BUNq6eGfKC4GdmLq5CqS4It+nBurbdlJwFahL/0SBRkB7EfhKDDQENsU/WgRul79lxv8Er8+BepVNrvgf0Gnw/bjQeUKolz6eE/ALNTBMAPU6AMaKUQLYMzM2VMESkAHSBpQWP6W8O8PhWDpj4AuoqfAl0AeegWXxckBP/EBlO8BAgzNAAcgDL0BLhW/UpFnx1lRxU2UfgGtgg+jM/+jNgDsC+CS6OKvAI/AE7BrwrQV6vf4CPE0zwe9E7wTAlYAHuC2bpXvcD4xVH7fEAHc+e0T7WcNd5YppZcl+AF0P+gbk74HicL4aGwAAAABJRU5ErkJggg==",

	//局域网【192.168.xxx.xxx】【169.254.xxx.xxx】，预设同上，如不喜欢内置默认，可以再这里修改。
	LAN_Flag: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAYAAAAS7Y8mAAABLklEQVQ4jeXUO0vcURAF8F8pxDqdAdFCZLUQ/ARiZ6f4AjWua2dhq4IaNEWKgNjFSi3ED2AhmEKxUXw3PrBQQwQbI6SSiJhiR1nwv6uwlXhguJc5cw4zl3svhTGIM1ziV8RvXGD4BW1BfMFDnvhejPEo7hJM7/HtfRlPJpg+xlQxxhlsYEv2dpxjG5sYKMb4Az6hHEMYQSXKUPpakxI0II0efEYnmtGCH5hBW+Q6curSaIxGnuGj7LmNoxt96A9RGnOYj1xvrBl0YQzTMd0TqlGLJsyiHTWoQkXs6zCBr6iPXGXUpNAa2pbgUrCCfRzhCofYwWJMsIZd2Wd8gT2sR4cLUXsY2pMc3h/J1+kUP/EvgbvHKo7zaG/JfipJ5AGWcJPA/cVydJekvX57xv8BD7eoP535NRkAAAAASUVORK5CYII=",

	//默认UA图标，预设同上，如不喜欢内置默认，可以再这里修改。
	DEFAULT_UA: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADSUlEQVQ4jW2Ta0wVBACFv3t5aMojFDBd5JBHpEy9lmODYoEt2hyJGpj5YBcLEixXmOHQBBSBgcEWLHBQU0qSatmukJPMwEc8ysmCbJMuoMgVLhBGMB7K6Y9zlZ6fZ+ecnR/nwP8RG+vsa/lhmemadVuizbZv7w3b+5t/7ogxfXRmAWB4QH8PBsDgklS62LXkfKnDj93XHW/cnpwzPD69oee36e3XzvydcOnrlvTvUpPLyvB8wH1qA8GHEoKyvV6vaJ2dblH0kcNafrJKxsv9mv99g85djlK/3UdDQ04Tt3u5+GsTqwHj/YDPwklvTJoxbUkN1NmDgTpXsFBexdUy1vXIWGvVq0ezdesXP6nPQRpBo3Z6mi4RBUDYk7g2xPGVLQmNZKDRHGQ96KKcLLOeKyqT8Yt2+VS2KKEoU1Xl4er5yVt3h5CtC8umTbjxSSSRHVuwD73noD/TDBrYif7Km6emz3cq5ECpjMXN8i5r0YryRi3OqFJ+QZQmOh7RSC+3qioJpXAZ71rjmBpMMcieYtDNrUa1Js1VQmqCHPbUyjO/Qf6F9TKV1Oup/dWqPBam6R6jxnsZr7NgpnQ5u7rXc8duRn1mgy6unKlVQdGaGXFAsxOr5Zd1SkG5pxWYVaPI3Zm62ewmDaHJQabOWthBhYk3O9cy0f8assUb1Rxk1JEwP8W9tE57d0ersvB5vZCaI8/txxX7jllj7UZN29ColdETJWwkYwEvtoUz2BuD+nc4q3u9kzpWO+vKK7NUs9FXb61bo4DYLD0el6ni/KWabEN32pDtNJ37tmHiaZhfG0i9NRL1mR00nOOprrQA5a0K1YpFa+WxNFkrX47X8SJ/jdagyTo09i1qPMxRYBYAma680eDP2O8RqC/FScN5j6o/11NX9jymC/u91VnhqEkLGj+BRgqRNZfujDjC7w/JA9w/dOfjGi+m6gNQcxjq2GLQ9UTUk4z609DAITSwC/2Rir0snkTA4T9zDoZ5Ge4UHJuD/Ut3dNID1fmgC4tQqwldjeHueTPt2WvYCsx42KFcgGcCjXxgdqcu9wmuli+h69MQOgufpXVzMN/MdeJtwAS4PSzAGfAEFgJLgFBHiAQigJB7nC/g/e8G/wD/na+RADPw9wAAAABJRU5ErkJggg==",
};
/******************************************************************************************
 *这里是图标弹出TIP文字的自定义设置。
 *******************************************************************************************/
var TipShow = {
	tipArrHost: "网站域名：", //域名
	tipArrIP: "网站IP：", //IP
	tipArrSep0: "", //分割线，留空就没有
	/*这里会显示 服务器信息	ServerInfo*/
	tipArrSep1: "", // 分割线，留空就没有
	/*这里会显示 网站IP信息*/
	tipArrSep2: "--------------------------------", //分割线，留空就没有
	/*这里会显示 我的信息*/
	tipArrSep3: "--------------------------------", //分割线，留空就没有
	/*这里会显示 网站SEO信息*/
	tipArrSep4: "--------------------------------", //分割线，留空就没有
	tipArrThanks: "Thx&From：", //感谢：xxxxx 来自xxxx
};
/******************************************************************************************
 *这里是自定义服务器信息显示，可以根据需要截取(只支持函数操作)。
 *******************************************************************************************/
var ServerInfo = [{
	label: "服务器：",
	words: "Server"
}, {
	label: "网站编码：", //项目名
	words: "Content-Type", //http头信息关键字
	//截取或替换的函数，返回的是null就是在没有结果的时候自动隐藏该项
	regx: function(word) {
		if (word && word.match("=")) {
			word = word.substring(word.indexOf("charset="));
			word = word.substring(8, word.length).toUpperCase();
			return word;
		} else return null;
	}
}, {
	label: "网站程序：",
	words: "X-Generator"
}, {
	label: "网站语言：",
	words: "X-Powered-By"
}];

/******************************************************************************************
text 为运行参数，如果无需参数，直接删除text属性，目前只支持 %u 为当前网页完整地址；
exec 为打开路径，可以是任意文件和文件夹，支持相对路径，相对于配置文件；
除了以上属性外，可以自定义添加其他属性，如果快捷键accesskey等。
=======================
{}, 为分隔条 
=======================
如果设置了id属性，会尝试获取此id并移动，如果在浏览器中没有找到此id，则创建此ID。
=======================
自带命令函数：【showFlagS.command】-----形式类型：
1、是非常简单的POST,如：
showFlagS.command('Post'（类型声明）, this.tooltipText（提交的URL）, aPostData（提交的数据）); 就这么简单，其他东西一概没有。
--------------
2、通用的GET，默认就是这个了，不用声明类型，最终结果为，新标签打开  url+参数  形式的网页。
showFlagS.command("网址", "参数1", "参数2", "参数3", "参数4", "参数5"，"参数6")
网址可以是：tooltipText(编辑项的tooltiptext,方便查看)，可以是查询API或网址；
网址也可以使用以下参数,参数有（当前网页的）:
ip：IP地址；
host：域名；
basedomain：主域名；
url：完整地址；
-----------------
3、功能相对比较强大的动作模拟（感谢FlagFox!!），可以参考与FlagFox，本脚本增加识别按钮class类名，使用方法如下：
showFlagS.command('Action','http://ping.chinaz.com/', 'host', 'IP', null,'but')
			    	Action：	声明类型，如果要使用模拟提交功能必须先使用Action声明；
'http://ping.chinaz.com/'： 	目标网址，推荐写在tooltipText，用this.tooltipText代表，方便使用的时候查看
					 host： 	打开目标网页时填写你输入数据位置的ID，
					   IP： 	这个是你需要输入的数据，内置IP，host,basedomain,url，具体代表请参考第二条。
					 null： 	点击使你输入的数据生效或提交按钮的ID，遇到奇葩网站提交按钮没有ID的话可以填写null，用下面一条解决
					  but: 		点击使你输入的数据生效或提交按钮的类名（class）
-----------------
还有一些其他的，比如编辑文件
showFlagS.command("Edit", "文件路径，支持相对路径")
showFlagS.command("Copy", "函数或者字符串")
*******************************************************************************************/
var Menus = [

];
/******************************************************************************************************************
 *这里是自定义浏览器标识UserAgent设置
 *******************************************************************************************************************/
var UAList = [
{name: "IE8 - Win7",//此处文字显示在右键菜单上，中文字符请转换成javascript编码，否则乱码(推荐http://rishida.net/tools/conversion/)
ua: "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)",
label: "IE8 - Win7",//此处文字显示在状态栏上，如果你设置状态栏不显示图标
image :"http://www.easyicon.net/api/resizeApi.php?id=581132&size=16"},

{  
name: "IE6 - XP",
ua: "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
label: "IE6 - XP",
image :"http://www.easyicon.net/api/resizeApi.php?id=581133&size=16"},

{name: "分隔线",},

{name: "Chrome - Win7",
ua: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1623.0 Safari/537.36",
label: "Chrome - Win7",
image :"http://www.google.com/images/icons/product/chrome-32.png"},

{name: "分隔线",},

//伪装 Opera 10.60
{  name: "Opera",
ua: "Opera/9.80 (Windows NT 6.1; U) Presto/2.6.30 Version/10.60",
label: "Opera",
image :"http://www.opera.com/favicon.ico"},

{name: "分隔线",},

//伪装 Safari - Mac OS X
{  name: "Safari - Mac",
ua: "Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_8; ja-jp) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16",
label: "Safari - Mac",
image :"http://www.easyicon.net/api/resizeApi.php?id=1092562&size=16"},

//伪装 iPhone，查询http://www.zytrax.com/tech/web/mobile_ids.html
{  name: "iPhone",
ua: "Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1_2 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7D11 Safari/528.16",
label: "iPhone",
image :"http://www.easyicon.net/api/resizeApi.php?id=1172525&size=16"},

//伪装 Apple iPad 2
{  name: "Apple iPad 2",
ua: "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
label: "Apple iPad 2",
image :"http://www.easyicon.net/api/resizeApi.php?id=584472&size=16"},

{name: "iOS/微信浏览器",
ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 6_1_4 like Mac OS X)AppleWebKit/536.26 (KHTML, like Gecko) Mobile/10B350MicroMessenger/4.5",
label: "iOS-WeChat",
image :"https://res.wx.qq.com/zh_CN/htmledition/v2/images/favicon27fe59.ico"},

{name: "分隔线",},

{name: "UCBrowser",
ua: "Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; Desktop) AppleWebKit/534.13 (KHTML, like Gecko) UCBrowser/8.9.0.251",
label: "UCBrowser",
image :"http://www.uc.cn/favicon.ico"},

{name: "115Browser",
ua: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36 115Browser/5.1.5",
label : "115Browser",
appVersion: true,
image :"http://www.115.com/favicon.ico"},

{name: "分隔线",},
{name : "BaiduYunGuanJia",
ua : "netdisk;5.2.7;PC;PC-Windows;6.2.9200;WindowsBaiduYunGuanJia",
label : "BaiduYunGuanJia",
image : "http://pan.baidu.com/res/static/images/favicon.ico"},

{name: "分隔线",},
// 伪装Firefox20.0
{  name: "Firefox20.0",
ua: "Mozilla/5.0 (Windows NT 6.2; Win64; x64;) Gecko/20100101 Firefox/20.0",
label: "Firefox20.0",
image :"http://www.easyicon.net/api/resizeApi.php?id=1123569&size=16"},

// 伪装Firefox10.0
{  name: "Firefox10.0",
ua: "Mozilla/5.0 (Windows NT 6.1; rv:10.0.6) Gecko/20120716 Firefox/10.0.6",
label: "Firefox10.0",
image :"http://www.easyicon.net/api/resizeApi.php?id=1123570&size=16"},
];
/******************************************************************************************************************
 *这里是查询源设置，只支持"GET"方式获取，taobao为脚本内置,可以自行按照示例添加。
 *不限定于IP，可以是其他相关的API，只要是你想要显示的都可以。
 *******************************************************************************************************************/
//查询本地信息
var MyInfo = {
	inquireAPI: "http://whois.pconline.com.cn/", //查询接口API 下同
	//截取函数,传入内容 docum 是XMLHttpRequest()的req.responseText，（具体可以百度	XMLHttpRequest()）。下同
	regulation: function(docum) {
		if (docum) {
			docum = docum.substring(docum.indexOf("位置"));
			docum = docum.substring(0, docum.indexOf("<h3>接口列表"));

			var addr = docum.substring(3, docum.indexOf("\n"));

			var ip = docum.substring(docum.indexOf("为:"));
			ip = ip.substring(2, ip.indexOf("\n"));

			var RemoteAddr = docum.substring(docum.indexOf("RemoteAddr"));
			RemoteAddr = RemoteAddr.substring(11, RemoteAddr.indexOf("<br/>"));
			if (addr || ip || RemoteAddr) {
				var MyInfos = "我的IP：" + ip + '\n' + "我的地址：" + addr + '\n' + "RemoteAddr：" + RemoteAddr;
				return MyInfos; //此处为传回值，为字符串
			} else return null;
		} else return null;
	}
};
//网站SEO信息
var SeoInfo = {
	inquireAPI: "http://seo.chinaz.com/?q=",
	regulation: function(docum) {
		if (docum) {
			var doc = docum;
			docum = docum.substring(docum.indexOf("baiduapp/"));
			var quanzhong = docum.substring(9, docum.indexOf(".gif"));

			docum = docum.substring(docum.indexOf("Rank_"));
			var Rank = docum.substring(5, docum.indexOf(".gif"));

			docum = docum.substring(docum.indexOf("blue>"));
			var sameip = docum.substring(5, docum.indexOf("<"));

			docum = docum.substring(docum.indexOf("域名年龄"));
			docum = docum.substring(docum.indexOf("blue>"));
			var domainage = docum.substring(5, docum.indexOf("<"));

			docum = docum.substring(docum.indexOf("创建于"));
			docum = docum.substring(docum.indexOf("blue>"));
			var start = docum.substring(5, docum.indexOf("<"));

			docum = docum.substring(docum.indexOf("过期时间为"));
			docum = docum.substring(docum.indexOf("blue>"));
			var lastage = docum.substring(5, docum.indexOf("<"));

			docum = docum.substring(docum.indexOf("备案号"));
			docum = docum.substring(docum.indexOf("</font>"));
			var beianhao = docum.substring(7, docum.indexOf("&nbsp;&nbsp;"));

			docum = docum.substring(docum.indexOf("性质"));
			docum = docum.substring(docum.indexOf("</font>"));
			var xingzhi = docum.substring(7, docum.indexOf("&nbsp;&nbsp;"));

			docum = docum.substring(docum.indexOf("名称"));
			docum = docum.substring(docum.indexOf("</font>"));
			var mingchen = docum.substring(7, docum.indexOf("&nbsp;&nbsp;"));

			docum = docum.substring(docum.indexOf("审核时间"));
			docum = docum.substring(docum.indexOf("</font>"));
			var shenhe = docum.substring(7, docum.indexOf("</td>"));

			docum = docum.substring(docum.indexOf("百度流量预计"));
			docum = docum.substring(docum.indexOf('_blank">'));
			var liuliang = docum.substring(8, docum.indexOf("</a>"));

			docum = docum.substring(docum.indexOf('库">'));
			var keydb = docum.substring(3, docum.indexOf("</a>"));

			docum = docum.substring(docum.indexOf('标题（Title）'));
			docum = docum.substring(docum.indexOf('red">'));
			var TitleN = docum.substring(5, docum.indexOf("</font>"));
			docum = docum.substring(docum.indexOf('10px;">'));
			var Title = docum.substring(7, docum.indexOf("</td>"));

			docum = docum.substring(docum.indexOf('red">'));
			var KeyWordsN = docum.substring(5, docum.indexOf("</font>"));
			docum = docum.substring(docum.indexOf('10px;">'));
			var KeyWords = docum.substring(7, docum.indexOf("</td>"));

			docum = docum.substring(docum.indexOf('red">'));
			var DescriptionN = docum.substring(5, docum.indexOf("</font>"));
			docum = docum.substring(docum.indexOf('10px;">'));
			var Description = docum.substring(7, docum.indexOf("</td>"));

			docum = docum.substring(docum.indexOf("30px"));

			docum = docum.substring(docum.indexOf('blue">'));
			var yasuo = docum.substring(6, docum.indexOf("</font>"));

			docum = docum.substring(docum.indexOf('原网页大小'));
			docum = docum.substring(docum.indexOf('blue">'));
			var yuanshi = docum.substring(6, docum.indexOf("</font>"));

			docum = docum.substring(docum.indexOf('压缩后大小'));
			docum = docum.substring(docum.indexOf('blue">'));
			var yasuohou = docum.substring(6, docum.indexOf("</font>"));

			docum = docum.substring(docum.indexOf('压缩比'));
			docum = docum.substring(docum.indexOf('blue">'));
			var yasuobi = docum.substring(6, docum.indexOf("</font>"));

			var info, infos;
			if (quanzhong && quanzhong.length < 3)
				info = "百度权重：" + quanzhong;
			if (Rank && Rank.length < 3)
				info = info + '  ||  ' + "GoogleRank：" + Rank;
			if (sameip && sameip.length < 6)
				info = info + '\n' + "同IP网站：" + sameip;
			if (sameip == "<!D") info = "暂时无法获取SEO信息 \n请稍后重试";
			if (domainage && domainage.length < 7)
				info = info + '\n' + "域名年龄：" + domainage;
			if (start && start.length == 11)
				info = info + '\n' + "创建于：" + start;
			if (lastage && lastage.length == 11)
				info = info + '\n' + "过期时间为：" + lastage;
			if (beianhao && beianhao.beianhao == 16)
				info = info + '\n' + "备案号：" + beianhao;
			if (xingzhi && xingzhi.length < 20)
				info = info + '\n' + "性质：" + xingzhi;
			if (mingchen && mingchen.length < 50)
				info = info + '\n' + "名称：" + mingchen;
			if (shenhe && shenhe.length == 10)
				info = info + '\n' + "审核时间：" + shenhe;
			if (liuliang && liuliang.length < 10)
				info = info + '\n' + "百度流量预计：" + liuliang;
			if (keydb && keydb.length < 10)
				info = info + '\n' + "关键词库：" + keydb;
			if (yasuo && yasuo.length == 1) {
				if (yuanshi && yuanshi.length < 10)
					info = info + '\n' + "网页大小：" + yuanshi + "KB";
				if (yasuohou && yasuohou.length < 10)
					info = info + '  ||  ' + "压缩后：" + yasuohou + "KB";
				if (yasuobi && yasuobi.length < 8)
					info = info + '  ||  ' + "压缩比：" + yasuobi;
			}
			if (Title) {
				if (TitleN && TitleN.length < 10)
					info = info + '\n' + "标题(" + TitleN + "个)：" + Title;
			} else {
				if (TitleN && TitleN.length < 10)
					info = info + '\n' + "标题：" + TitleN + "个";
			}
			if (KeyWords) {
				if (KeyWordsN && KeyWordsN.length < 10)
					info = info + '\n' + "关键词(" + KeyWordsN + "个)：" + KeyWords;
			} else {
				if (KeyWordsN && KeyWordsN.length < 10)
					info = info + '\n' + "关键词：" + KeyWordsN + "个";
			}
			if (Description) {
				if (DescriptionN && DescriptionN.length < 10)
					info = info + '\n' + "描述(" + DescriptionN + "个)：" + Description;
			} else {
				if (DescriptionN && DescriptionN.length < 10)
					info = info + '\n' + "描述：" + DescriptionN + "个";
			}
			return info; //此处为传回值，为字符串
		} else return null;
	}
};
//查询网站IP信息等
var SourceAPI = [{
	label: "纯真 查询源", //菜单中显示的文字
	id: "CZ", //必须设定一个ID，以便脚本读取
	isFlag: false, //是否作为国旗图标的查询源,所有自定义项目中，只能有一个设为true，其余可删除该项或为false,当你没有设定的时候会使用脚本预设
	isJustFlag: false, //是否仅作为国旗图标的查询源,如果有此项，就不会创建此项的菜单，也不会作为信息查询源使用。该项为false的时候可删除或注释掉
	inquireAPI: "http://www.cz88.net/ip/index.aspx?ip=",
	regulation: function(docum) {
		if (docum) { //判断是否有传入值

			var s_local, myip, myAddr;
			var addr_pos = docum.indexOf("AddrMessage");
			s_local = docum.substring(addr_pos + 13);
			s_local = s_local.substring(0, s_local.indexOf("<"));
			s_local = s_local.replace(/ +CZ88.NET ?/g, "");

			var myip_pos = docum.indexOf("cz_ip");
			myip = docum.substring(myip_pos + 7);
			myip = myip.substring(0, myip.indexOf("<"));

			var myAddr_pos = docum.indexOf("cz_addr");
			myAddr = docum.substring(myAddr_pos + 9);
			myAddr = myAddr.substring(0, myAddr.indexOf("<"));


			var obj = {}; //※必须，返回结果必须为object类型，此处为声明。
			if (myip) s_local = s_local + '\n' + '--------------------------------' + '\n' + '我的IP：' + myip; //可以显示自己的IP，可以关闭“查询本地信息”以节省资源
			if (myAddr) s_local = s_local + '\n' + '我的地址：' + myAddr; //加上自己的地址，可以关闭“查询本地信息”以节省资源
			obj.SiteInfo = s_local || null; //※必须，此处为返回结果中你需要显示的信息;当前项仅为图标查询源的时候可以非必须。
			//以下两项非必须，在此项目不作为国旗图标查询源的时候可以不用
			obj.countryCode = null; //此处为返回结果的国家CODE。
			obj.countryName = null; //此处为返回结果的国家名称【中文，需要lib数据库支持】。

			return obj || null; //返回“null”的时候便使用备用查询源；
		} else return null; //如果没有传入值则返回空
	}
}, {
	label: "太平洋电脑",
	id: "pconline",
	inquireAPI: "http://whois.pconline.com.cn/ip.jsp?ip=",
	regulation: function(docum) {
		if (docum) {
			var docum = docum.replace(/\n/ig, "");

			var obj = {};
			obj.SiteInfo = docum || null;
			obj.countryCode = null;
			obj.countryName = null;
			return obj || null;
		} else return null;
	}
}, {
	label: "MyIP查询源",
	id: "myip",
	inquireAPI: "http://www.myip.cn/",
	regulation: function(docum) {
		if (docum) {
			var myip_addr, myip_flag;
			var addr_pos = docum.indexOf("来自");
			myip_addr = docum.substring(addr_pos + 4);
			myip_addr = myip_addr.substring(0, myip_addr.indexOf("."));
			if (myip_addr.indexOf("&nbsp;") !== -1)
				myip_addr = myip_addr.substring(0, myip_addr.indexOf("&nbsp;"));
			if (myip_addr.indexOf("<") !== -1)
				myip_addr = myip_addr.substring(0, myip_addr.indexOf("<"));
			if (myip_addr.indexOf("\r\n\t\t") !== -1)
				myip_addr = myip_addr.substring(0, myip_addr.indexOf("\r\n\t\t"));

			var obj = {};
			obj.SiteInfo = myip_addr || null;
			obj.countryCode = null;
			obj.countryName = null;
			return obj || null;
		} else return null;
	}
}, {
	label: "新浪 查询源",
	id: "sina",
	inquireAPI: "http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=",
	regulation: function(docum) {
		if (docum) {
			var doc = JSON.parse(docum);
			if (doc.ret == 1) {
				if (doc.isp !== '' || doc.type !== '' || doc.desc !== '')
					var addr = doc.country + doc.province + doc.city + doc.district + '\n' + doc.isp + doc.type + doc.desc;
				else
					var addr = doc.country + doc.province + doc.city + doc.district;

				var obj = {};
				obj.SiteInfo = addr || null;
				obj.countryCode = null;
				obj.countryName = doc.country || null;
				return obj || null;
			} else return null;
		} else return null;
	}
}, {
	label: "波士顿大学",
	id: "CZedu",
	inquireAPI: "http://phyxt8.bu.edu/iptool/qqwry.php?ip=",
	regulation: function(docum) {
		if (docum) {
			var s_local = docum;
			s_local = s_local.replace(/ +CZ88.NET ?/g, "");

			var obj = {};
			obj.SiteInfo = s_local || null;
			obj.countryCode = null;
			obj.countryName = null;
			return obj || null;
		} else return null;

	}
}, {
	label: "淘宝 查询源",
	id: "taobao",
	isFlag: true,
	inquireAPI: "http://ip.taobao.com/service/getIpInfo.php?ip=",
	regulation: function(docum) {
		if (docum && JSON.parse(docum).code == 0) {
			var doc = JSON.parse(docum);
			var country_id = doc.data.country_id.toLocaleLowerCase();
			var addr = doc.data.country + doc.data.area;
			if (doc.data.region || doc.data.city || doc.data.county || doc.data.isp)
				addr = addr + '\n' + doc.data.region + doc.data.city + doc.data.county + doc.data.isp;

			var obj = {};
			obj.SiteInfo = addr || null;
			obj.countryCode = country_id || null;
			obj.countryName = doc.data.country || null;
			return obj || null;
		} else return null;
	}
}]
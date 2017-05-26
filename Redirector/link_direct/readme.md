###去链接重定向, 直接访问目标网站

目前已重定向网站:
- 职友集
- 知乎
- 豆瓣
- Mozilla
- Google搜图
- 360搜索

自1.5版Redirector支持解码后, 功能又强大了不少, 关键是开启**decode**

####规则:

```javascript
{
    //https://github.com/dupontjoy/userChrome.js-Collections-/tree/master/Redirector/link_direct
    name: "去跳转",
    from: /^https?:\/\/.*\.(?:jobui|google|so|)\.(?:com|org|)\/(.*(\?link|\?target|\?url|\?imgurl)=)?(http[^&]+).*/i,
    to: "$3",
    regex: true
},
{
    name: "豆瓣链接去跳转",
    from: /^https?:\/\/www\.douban\.com\/.*\?url=(http.*)/i,
    to: "$1",
    regex: true
},{
    name: "知乎链接去跳转",
    from: /^https?:\/\/(link|www)\.zhihu\.com\/(\?target=|question\/.*)(http.*)/i,
    to: "$3",
    regex: true
},{
    name: "好搜链接去跳转",
    from: /^https?:\/\/www\.so\.com\/link\?url=http([^&]+).*/i,
    to: "$1",
    regex: true
},{
    name: "WordPress博客外链去跳转",
    from: /^https?:\/\/.*\/go\.php\?url=(http.*)/i,
    to: "$1", 
    regex: true
},{
    name: "Pixiv外链去跳转",
    from: /^https?:\/\/www\.pixiv\.net\/jump\.php\?(http.*)/i,
    to: "$1", 
    regex: true
},
```

####用法: 
- 方法1: Redirector扩展
- 方法2: Redirector脚本

####测试:
- http://www.jobui.com/tips/redirect.php?link=http%3A%2F%2Fjobs.51job.com%2Fshenzhen-nsq%2F58889341.html
- https://link.zhihu.com/?target=https%3A//addons.mozilla.org/zh-cn/firefox/addon/linkchecker/%3Fsrc%3Dsearch
- https://www.douban.com/link2/?url=https%3A%2F%2Fcode.google.com%2Fp%2Fchromium%2Fissues%2Fdetail%3Fid%3D51084
- https://outgoing.mozilla.org/v1/5c2a5620285210f7267fdf87cfd39943f03f42538d2d98eec0b0cf5565dbca23/http%3A//vimium.github.io/
- https://www.google.com/imgres?imgurl=https%3A%2F%2Flh4.ggpht.com%2FwKrDLLmmxjfRG2-E-k5L5BUuHWpCOe4lWRF7oVs1Gzdn5e5yvr8fj-ORTlBF43U47yI%3Dw300&imgrefurl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dde.lotumapps.vibes&docid=Udigcj5zvVFziM&tbnid=D_y2y56rjrSoKM%3A&w=300&h=300&ved=0ahUKEwiywYaM0-rNAhWHfywKHdI0BSMQMwglKAAwAA&iact=mrc&uact=8&biw=1366&bih=659
- http://www.so.com/link?url=http%3A%2F%2Fbaike.so.com%2Fdoc%2F4368934-4574777.html&q=Firefox&ts=1469089830&t=8d126c3df745e90727a2acb3821708d&src=haosou
- https://www.douban.com/link2/?url=https%3A%2F%2Fitem.taobao.com%2Fitem.htm%3Fspm%3Da1z10.3-c.w4002-10457397471.62.F3nDNI%26id%3D526991279756

####反馈:
http://bbs.kafan.cn/thread-2047931-1-1.html
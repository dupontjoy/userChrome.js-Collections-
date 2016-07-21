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
name: "去跳轉",
from:/^https?:\/\/.*\.(?:jobui|zhihu|douban|mozilla|google|so|)\.(?:com|org|)\/(.*(\?link|\?target|\?url|\?imgurl)=)?(http[^&]+).*/i,
to: "$3",
decode: true,
regex: true
},
```

####用法: 
- 方法1: Redirector扩展
- 方法2: Redirector脚本

####反馈:
http://bbs.kafan.cn/thread-2047931-1-1.html
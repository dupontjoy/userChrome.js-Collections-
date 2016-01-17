Enable weixin image from 3-party sites: set src the same with data-src

Another way with Redirector:

    {
    //example: http://ding.youku.com/a/id_XMTY2NDYw.html
    //方法來源: http://bbs.csdn.net/topics/391051571
    name: "微信圖片 反盜鏈",
    from: /^https?:\/\/mmbiz\.qpic\.cn\/mmbiz\/(.*)\/(.*)\?wx_fmt=(.*)/i,
    to: "http://mmbiz.qlogo.cn/mmbiz/$1/640",
    regex: true
    },

![](img/anti-wx-pic.jpg)
Original download: https://github.com/ywzhaiqi/userChromeJS/tree/master/uAutoPagerize2

My Mod：Change rules to Chrome/Local folder

自定義規則：

示例：风之动漫

    {name: '风之动漫',
		 url: /^http:\/\/www\.fzdm\.com\/manhua/i,
		 exampleUrl: 'http://www.fzdm.com/manhua/117/RE23/',
		 nextLink: '//a[text()="下一页"]',
		 autopager: {
			pageElement: 'id("mh")/li',
		 }
	  }, 
	  
示例：新动漫

    {
    siteName: '新动漫',
    url: /http:\/\/www\.xindm\.cn\/mh\/.+/i,
    siteExample: 'http://www.xindm.cn/mh/shishangzuiqiangdizi/58784.html',
    preLink: {
        startAfter: '?page=',
        inc: -1,
        min: 1,
    },
    nextLink: {
        startAfter: '?page=',
        mFails: [/http:\/\/www\.xindm\.cn\/mh\/.+\.html/i, '?page=1'],
        inc: 1,
        isLast: function(doc, win, lhref) {
            var pageLink = doc.querySelector('.pageLink');
            if (pageLink) {
                if (pageLink.selectedIndex == pageLink.options.length - 1) return true;
            };
        },
    },
    autopager: {
        pageElement: '//div[@class="mh_box"]',
        useiframe: true,
    }
    },
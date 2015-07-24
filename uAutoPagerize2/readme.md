download: https://github.com/ywzhaiqi/userChromeJS/tree/master/uAutoPagerize2

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
##圍觀圖

NLF大神作品

Mod by Y大

原版：http://www.webextender.net/scripts/show/105741.html

Mod版：https://github.com/ywzhaiqi/userscript/tree/master/picviewerCE

##自定義規則：

示例：iTunes封面：

    {name: 'iTunes 封面',
		siteExample: 'https://itunes.apple.com/us/album/hao-xiang-tan-lian-ai/id538330286',
		url: /^https?:\/\/itunes.apple.com/i,
		getImage: function() {
			var oldsrc = this.src,
				newsrc;
			var pic = /(.+?mzstatic\.com\/.+)\/cover170x170/;
			if (pic.test(oldsrc)) {
				return oldsrc.replace(pic, '$1/cover1400x1400');
			}
     }
    },
    

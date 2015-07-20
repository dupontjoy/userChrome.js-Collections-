##圍觀圖

NLF大神作品

Mod by Y大

原版：http://www.webextender.net/scripts/show/105741.html

Y大版：https://github.com/ywzhaiqi/userscript/tree/master/picviewerCE

Self Mod：整合幾個自定義規則

##自定義規則：
默認大小为170x170，嫌圖小的可改爲600x600或者1400x1400

示例：iTunes 封面

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
    
示例：京东 主图

    {name: '京东 主图',
    siteExample: 'http://item.jd.com/1209642.html',
		url: /^https?:\/\/item.jd.com/i,
		getImage: function() {
			var oldsrc = this.src,
				newsrc;
			var pic = /(.+?360buyimg\.com\/)n[\d]\/(.+)/;
			if (pic.test(oldsrc)) {
				return oldsrc.replace(pic, '$1imgzone/$2');
			}
    }
    },

示例：天猫 主图

    {name: '天猫 主图',
		siteExample: 'https://detail.tmall.com/item.htm?id=41970251936',
		url: /^https?:\/\/detail.tmall.com/i,
		getImage: function() {
			var oldsrc = this.src,
				newsrc;
			var pic = /(.+?alicdn\.com\/.+)\/(.*)\.jpg\_(.*)\.jpg/i;
			if (pic.test(oldsrc)) {
				return oldsrc.replace(pic, '$1/$2.jpg');
			}
		}
	  },
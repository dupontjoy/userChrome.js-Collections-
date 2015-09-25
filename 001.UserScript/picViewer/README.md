##圍觀圖

NLF大神作品

Mod by Y大

原版：http://www.webextender.net/scripts/show/105741.html

Y大版：https://github.com/ywzhaiqi/userscript/tree/master/picviewerCE

Self Mod：整合幾個自定義規則

picviewerCE-RC-Mod：在Runningcheese版上修改

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
	  
示例：tradingfloor 大圖

	  {name: 'tradingfloor 大圖',
		siteExample: 'https://www.tradingfloor.com/posts/jump-on-board-the-eurgbp-downtrend-5614475',
		url: /^https?:\/\/www.tradingfloor.com/i,
		getImage: function() {
			var oldsrc = this.src,
				newsrc;
			var pic = /(.+?tradingfloor\.com\/.+)\/max608w\/(.+)/;
			if (pic.test(oldsrc)) {
				return oldsrc.replace(pic, '$1/original/$2');
			}
		}
	  },
	  
示例：Tmart 大图

    {
    name: 'Tmart 主图',
    siteExample: 'http://www.tmart.com/2-in-1-Bamboo-Desktop-Stand-Holder-Charger-Dock-for-Apple-Watch-iPhone-Samsung-other-Smartphone_p332289.html',
    url: /^https?:\/\/www.tmart.com/i,
    getImage: function() {
        var oldsrc = this.src,
        newsrc;
        var pic = /(.+?image-tmart\.com\/.+)\/(.+)\_60x60.jpg(.+)/;
        if (pic.test(oldsrc)) {
            return oldsrc.replace(pic, '$1/$2_800x800.jpg');
        }
    }
    },
    
示例：Banggood 大圖

    {
    name: 'Banggood 主图',
    siteExample: 'http://www.banggood.com/Original-Xiaomi-Mini-Portable-USB-Fan-p-977375.html',
    url: /^https?:\/\/www.banggood.com/i,
    getImage: function() {
        var oldsrc = this.src,
        newsrc;
        var pic = /(.+?img\.banggood\.com\/.+)\/(other_items|view)\/(.+)\.jpg(.*)/;
        if (pic.test(oldsrc)) {
            return oldsrc.replace(pic, '$1/large/$3.jpg');
        }
    }
    },
    
示例：Sunsky 大圖

    {
    name: 'Sunsky 主图',
    siteExample: 'http://www.sunsky-online.com/view/423464.htm',
    url: /^https?:\/\/www.sunsky-online.com/i,
    getImage: function() {
        var oldsrc = this.src,
        newsrc;
        var pic = /(.+?img\.sunsky-online\.com\/.+)\/(detail|product)_l\/(.+)\.jpg(.*)/;
        if (pic.test(oldsrc)) {
            return oldsrc.replace(pic, '$1/$2_raw/$3.jpg');
        }
    }
    },

示例：1688 大圖

    {
    name: '1688 主图',
    siteExample: 'http://detail.1688.com/offer/39098650520.html?spm=a261b.2187593.1998088710.147.LB7j1s',
    url: /^https?:\/\/detail.1688.com/i,
    getImage: function() {
        var oldsrc = this.src,
        newsrc;
        var pic = /(.+?\.aliimg\.com\/.+)\/(.+)\.(.+x.+).jpg(.*)/;
        if (pic.test(oldsrc)) {
            return oldsrc.replace(pic, '$1/$2.jpg');
        }
    }
    },

// ==UserScript==
// @name        In-Page Bookmark
// @namespace   org.jixun.bookmark
// @description 页内书签, 改写自: Tieba#3114763315 & GreasyFork#2676
// @include     *
// @version     1.0.2-2019.05.08
// @grant       unsafeWindow
// @run-at      document-start
// ==/UserScript==


var moduleBookmark = function () {
	try {
		this.init();
	} catch (e) {
		console.error ('org.jixun.bookmark: init failed :<', e);
	}
};
moduleBookmark.prototype = {
	extract: function (foo) {
		return foo.toString().replace(/--.+/g, '').match(/\/\*([\s\S]+)\*\//)[1];
	},

	attr: function (node, name, val) {
		if (arguments.length === 2) {
			if (name instanceof Object) {
				for (var x in name)
					if (name.hasOwnProperty (x))
						node.setAttribute (x, name[x]);

				return ;
			}

			var ret = node.getAttribute (name);
			try {
				return JSON.parse (ret);
			} catch (e) {
				return ret;
			}
		}

		if (val instanceof Object)
			val = JSON.stringify (val);

		node.setAttribute (name, val);
	},

	create: function (el, text, attr) {
		var r = document.createElement (el || 'div');
		if (text) r.textContent = text;

		// 快速配置属性
		if (attr instanceof Object)
			this.attr (r, attr);

		return r;
	},

	setBookmarks: function (o) {
		localStorage['jjwt_' + location.pathname] = JSON.stringify (o);
	},

	getBookmarks: function () {
		try {
			return JSON.parse(localStorage['jjwt_' + location.pathname]);
		} catch (e) {
			return [];
		}
	},

	// 添加并储存书签
	addMark: function (yPos, name) {
		var bm = this.getBookmarks(),
			defName = '未命名书签 #' + bm.length;

		if (!name) {
			name = prompt ('请输入新的书签名, 留空使用默认:', defName);

			// 用户单击取消
			if (null === name)
				return ;

			// 书签名是空的
			if (!name)
				name = defName;
		}

		bm.push ([
			typeof yPos == 'number' ?
				yPos : unsafeWindow.pageYOffset,

			name
		]);
		this.setBookmarks (bm);
		this.updMark ();
	},

	updMark: function () {
		// 重新构建书签
		this.lstBookmark.innerHTML = '';

		var that = this;
		this.getBookmarks ().forEach (function (mark, i) {
			// [位置, 名称]
			var li = that.create ('li');
			var linkGo  = that.create ('a', mark[1], {
				type: 'go',
				ypos: mark[0]
			});
			var linkDel = that.create ('a', '删',  {
				type: 'rm',
				line: i
			});

			[	linkGo,
				document.createTextNode (' [ '),
				linkDel,
				document.createTextNode (' ]')
			].forEach (li.appendChild.bind (li));
			that.lstBookmark.appendChild (li);
		});
	},

	init: function () {
		// 创建 div
		this.bm  = this.create ();
		this.nav = this.create ();
		this.main= this.create ();

		this.bm.id = 'jjwtBookMark';
		this.nav .className = 'bmNav';
		this.main.className = 'bmMain';

		//增加 [页内书签]
		this.h3  = this.create ('h3', 'M');
		this.main.appendChild (this.h3 );
		this.h3a = this.create ('span', 'M');
		this.nav .appendChild (this.h3a);

		// 增加 [添加书签] 按钮
		this.btnAddBookmark = this.create ('button', '此处添加');
		this.btnAddBookmark.onclick = this.addMark.bind (this, null, null);
		this.main.appendChild(this.btnAddBookmark);

		// 增加 [书签列表]
		this.lstBookmark = this.create ('ul');
		this.main.appendChild(this.lstBookmark);

		this.bm.appendChild (this.nav );
		this.bm.appendChild (this.main);
		document.body.appendChild (this.bm);

		// 增加 默认标签
		if (this.getBookmarks().length === 0)
			this.addMark (0, '页面顶部');

		// 刷新标签栏
		this.updMark ();

		this.lstBookmark
			.addEventListener ('click', this.markClick.bind (this), false);

		this.addStyle ();
	},

	markClick: function (eve) {
		var el = eve.target;
		if (el.tagName !== 'A' || !el.hasAttribute ('type'))
			return ;

		switch (this.attr (el, 'type')) {
			case 'go':
				unsafeWindow.scrollTo (0, parseInt(this.attr (el, 'ypos')));
				break;
			case 'rm':
				var m = this.getBookmarks ();
				m.splice (parseInt(this.attr (el, 'line')), 1);
				this.setBookmarks (m);
				this.updMark ();
				break;
		}
	},

	addStyle: function () {
		if (this.css) return ;

		this.css = document.createElement ('style');
		this.css.textContent = this.extract (function () {/*
#jjwtBookMark {
	font-family: Ubuntu, 'Microsoft JHengHei UI', 'Microsoft YaHei UI', sans-serif;

	font-size: 12px;
    font-weight: bold;
	border: 0px solid #aaa;
	border-right: 0;

	z-index: 9999999999;
	background: #ffffbb;
	text-align:left !important;
	word-break: break-all;
	overflow: hidden;


	-- 鼠标悬浮前状态
	width:  20px;

	-- 鼠标移开, 回收列表的时长为 0.3s
	transition: width .3s ease;

	-- 定位, 永远居中于页面
	top: 11%;
	height: 20px;
	margin-top: -40px;
	-- 定位, 固定到右边
	right: 5px;
	position: fixed;
    opacity: .5;
}
#jjwtBookMark:hover {
	-- 重置定位至右边, 填满整个高度
	margin-top: 0;
	top: 0;
	width: 10em;
	height: 100%;
    opacity: 1;

	-- 悬浮, 上下两条边不需要
	border-top: 0;
	border-bottom: 0;

	-- 悬浮, 展开列表的时长为 0.3s
	transition-duration: .7s;
}

-- 缩小时显示的标题
#jjwtBookMark > .bmNav {
	width: 20px;
	word-break:break-all;
	text-align: center;

	line-height: 1.3;
	padding: 3px 0;
}
#jjwtBookMark:hover > .bmNav {
	display: none;
}

-- 书签本体
#jjwtBookMark > .bmMain {
	display: none;
	position: absolute;
	word-break:break-all;
	width: 20em;
}
#jjwtBookMark:hover > .bmMain {
	display: block;
}

#jjwtBookMark h3 {
	padding: 0.5em;
	margin:  0;
	display: inline-block;
	font-size: large;
}

#jjwtBookMark ul {
	list-style: square inside none;
	padding: 0.5em 0;
	margin-left: 0.5em;
	padding-bottom: 0;

	-webkit-user-select: none;
	-moz-user-select: none;
	user-select: none;
}
#jjwtBookMark li {
	list-style: inherit;
}
#jjwtBookMark li > a {
	cursor: pointer;
}
		*/});
		document.head.appendChild (this.css);
	},

};

addEventListener ('DOMContentLoaded', function () {
	console.info ('org.jixun.bookmark: Ready to go.');
	new moduleBookmark ();
}, false);
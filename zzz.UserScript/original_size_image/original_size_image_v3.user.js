// ==UserScript==
// @name original_size_image_v3
// @author yansyrs
// @description 当图片被缩小或另外链接着图片时，显示原本尺寸的图片，可对图片进行拖拽、缩放或旋转。使用相册功能可列出当前页面的图片并预读，支持翻页功能。注：请勿将敏感信息保存到翻页设置里，如账号、密码等，以免信息泄露。
// @version v3.0.1
// @date 2015-08-31
// @namespace http://opera.im/archives/original_size_image_js_v3/
// @grant GM_getValue
// @grant GM_setValue
// @exclude *.jpg
// @exclude *.jpeg
// @exclude *.gif
// @exclude *.png
// @exclude *.bmp
// ==/UserScript==

(function (win, json){
/*------------------------------设置-------------------------------*/
	//这里根据你的 Opera 页面缩放情况填入相关数值。如默认 100% 则填 100。如果不使用 Opera 则不必理会这一项。
	//注：对于 Opera 11.10 以下的版本，如果你的页面缩放不是 100%，不调整这项值会造成居中错误的问题。Opera 11.10 可不必理会此项。
	var OP_PAGE_PERCENTAGE = 100;

	// 0——图片居中显示，如果过大，则缩放
	// 1——直接在鼠标旁边显示图片，不缩放
	var VIEW_STYLE = 1;

	// true——只在图片被缩小过（用户限定规则的除外），或者图片链接着另一张图片时显示查看按钮
	// false——任何图片（用户限定规则的除外）都显示查看按钮，如果图片链接着另一张图片，则显示被链接的图片，否则显示当前图片
	var VIEW_FILTER = true;

	// 图片面积小于该值时，则不显示查看按钮
	var MIN_AREA = 120 * 120;

	// 是否在图片上显示相册按钮
	// -1：不显示；0：伴随查看按钮显示；1：图片面积大于特定值或伴随查看按钮显示
	var SHOW_ALBUM_ICON = 1;

	//图片面积小于该值时，则不显示相册按钮
	var MIN_AREA_TO_SHOW_ALBUM_ICON = 500 * 500;

	//图片并未链接图片，且图片仅仅被缩小 x%，或者 x 像素的，则不显示查看按钮
	var DEC_PERCENTAGE = 2;
	var DEC_PIX = 20;

	//显示查看按钮的时延，单位为毫秒
	var VIEW_BUTTON_DELAY = 100;

	//查看按钮出现的位置
	//0——左上
	//1——右上
	var VIEW_BUTTON_POS = 0;

	//黑色背景的不透明度
	//注：取值为 0 到 1 之间的数，包括 0 跟 1。
	var BACKGROUND_OPACITY = 0.5;

	//显示预览图工具栏
	//true——显示；false——不显示
	var SHOW_TOOLS_BAR = true;

	//预览图下面的背景颜色，取值方式可参照 CSS 中的 background-color 属性
	var PREVIEW_DIV_COLOR = 'white';
	
	//预览图占窗口宽高的比例，1 为紧贴窗口边缘
	var PREVIEW_IN_WND_PADDING = 0.9;

	//预览图边框的边距，单位为像素
	var PREVIEW_DIV_PADDING = '5';

	//当 VIEW_STYLE = 2 时（鼠标悬停即显示）时，显示预览图的时延
	var VIEW_PREVIEW_DELAY = 100;

	//是否开启旋转功能
	//true——开启；false——不开启
	var ROTATE_ENABLE = true;

	//旋转开启的方式
	//0——长按
	//1——按住 alt 键（firefox、chrome 则为 ctrl 键）不放
	//2——长按或按alt键（firefox、chrome 则为 ctrl 键）
	var ROTATE_STYLE = 1;

	//旋转捕捉，即旋转的角度为下值的倍数
	//注：该值为整数，0 或负数为不开启捕捉
	var ROTATE_SNAP = 0;

	//旋转开启方式 2
	//0——不启用
	//1——按shift旋转
	var ROTATE_STYLE_2 = 1;

	//使用第二种旋转开启方式时的角度捕捉
	//注：该值为整数，0 或负数为不开启捕捉
	var ROTATE_SNAP_2 = 15;

	//当 ROTATE_STYLE = 0 或 2 时有效，长按 x 毫秒后开始旋转
	var LONG_PRESS_TIME = 300;

	//缩放方式
	//0——居中缩放
	//1——左上角对齐
	//2——按鼠标位置缩放
	var RESIZE_STYLE = 2;

	//显示原始尺寸方式
	//0——左上角对齐
	//1——按鼠标位置显示
	var ORIGINAL_STYLE = 1;

	//缩放速度，正数，值越大越快
	//注：当此参数为负数或零时，则不开启滚轮缩放图片功能。
	var RESIZE_SPEED = 5;

	//查看方式
	//true——当图片无链接，或链接的是一张图片，点击图片即可显示预览图，有可能与原有事件冲突。
	//false——必须点击查看按钮才显示预览图。
	//注：当设置为 true 时，如果点击事件冲突，请尝试按住 alt（firefox、chrome 则为 ctrl 键）进行点击。
	var CLICK_DIRECT_VIEW = false;

	//CLICK_DIRECT_VIEW = true 时，即使链接的不一定是一张图片也显示预览图。
	var ALWAYS_CLICK_DIRECT_VIEW = false;

	//EXCLUDE_IMG_LINK = true，当图片带链接时，则不做预览操作。
	//注：ALWAYS_CLICK_DIRECT_VIEW = true或者使用自定义规则时，会忽略这项值。
	var EXCLUDE_IMG_LINK = false;

	//鼠标单击预览图的事件
	//0——尺寸切换（屏幕适配或原始尺寸）
	//1——关闭预览图
	//其他——无动作
	var PREVIEW_CLICK_HDLR = 0;

	//当 PREVIEW_CLICK_HDLR = 1 时（关闭预览图），等待关闭的时延，用于兼容双击事件
	var PREVIEW_CLICK_CLOSE_DELAY = 300;

	//鼠标双击预览图的事件
	//0——关闭预览图
	//1——尺寸切换（屏幕适配或原始尺寸）
	//其他——无动作
	var PREVIEW_DBLCLICK_HDLR = 0;

	//点击空白处关闭预览图
	//true——开启；false——关闭
	var CLICK_BLANK_TO_CLOSE = true;

	//按 esc 键关闭预览图
	//true——开启；false——关闭
	var PRESS_ESC_TO_CLOSE = true;

	//切换图片或在相册时是否跟踪页面图片位置
	//0——不启用
	//1——没打开相册时启用
	//2——只在相册打开时启用
	//3——都启用
	var TRACE_IMAGE_IN_PAGE = 3;

	//状态栏是否显示使用提示
	var SHOW_TIPS_ON_STATUSBAR = true;

	//说明：图片查找规则，可根据正则表达式查找出原图 URL
	//true——开启规则检查
	//false——关闭规则检查
	var SITE_IMG_INFO_FLAG = true;
	
	//按下面格式进行添加，只有在 SITE_IMG_INFO_FLAG = true 才起作用
	//第一个值为图片匹配的正则表达式，第二个值为替换的内容，如何使用正则和替换，请自行搜索，或到论坛发帖求助
	//第三个值为可选值，可对替换后的链接地址作编码操作，可填常用编码函数，如 decodeURIComponent
	//第四个值为可选值，可填 "href"，当值为 "href" 时，则按照链接来匹配规则，而不是图片 src；当不填或值为其他时，则按照图片的 src 来匹配规则。可参考下面 google 的规则
	//以下设置可做参考
	var SITE_IMG_INFO = [
		[/http\:\/\/bbs\.themex\.net\/attachment\.php\?attachmentid\=(\w+).*\&thumb\=1\&d\=(\w+)/, 'http://bbs.themex.net/attachment.php?attachmentid=$1&d=$2'],
		[/http\:\/\/(\w+)\.douban\.com\/view\/photo\/thumb\/public\/(\w+)/, 'http://$1.douban.com/view/photo/photo/public/$2'],
		[/http\:\/\/126\.fm\/(\w+)s$/, 'http://126.fm/$1'],
		[/http\:\/\/oimage\w\w\.ydstatic\.com\/image\?.*(http.*126\.fm.*)/, '$1', 'decodeURIComponent'],
		[/http\:\/\/static\.minitokyo\.net\/thumbs\/(\d+)\/(\d+)\/(\d+)\.(\w+)\?(\w+)/, 'http://static.minitokyo.net/view/$1/$2/$3.$4?$5'],
		//[/http\:\/\/\w+\.google\.\w{2,3}(\..*)?\/(images|imgres)\?imgurl\=(.*)\&imgrefurl\=.*/, '$3', '', 'href'],//去掉前面的"//"可开启该规则
		[/^https?\:\/\/.*(=|\?)(https?\:\/\/.*\.(jpg|bmp|png|gif|jpeg))$/i, '$2', '', 'href'],
	];

	//说明：特例网站设置
	//第一个值为站点匹配的正则表达式，第二个值为特例设置
	//以下设置可做参考
	var SITE_STYLE_INFO = [
		//[/http\:\/\/www\.douban\.com\//, 'CLICK_DIRECT_VIEW = false; VIEW_STYLE = 1; VIEW_PREVIEW_DELAY = 250;'],
		[/http:\/\/t\.163\.com\//, 'CLICK_DIRECT_VIEW = false; VIEW_STYLE = 1; VIEW_PREVIEW_DELAY = 100;'],
		[/http:\/\/tieba\.baidu\.com\//, 'CLICK_DIRECT_VIEW = false;'],
	];

	//>>>相册功能设置
	//打开相册后，如果图片链接着另一张图片，则进行预读
	//该功能为预读线程数，即同时进行预读的图片张数，-1 为无限制
	var PRELOAD_THREAD_NUM = 5;

	//相册过滤选项，第一、二项参数为宽高值，第三项参数表示该项为默认值
	var ALBUM_FILTER = [
		[150, 150],
		[200, 200],
		[300, 300, 'default'],
		[400, 400],
		[600, 600],
	];

	//相册宫格数，第一、二项为行列数，第三项参数表示该项为默认值
	var ALBUM_GRID_SIZE = [
		[2, 4],
		[2, 5],
		[3, 3],
		[3, 4],
		[3, 5, 'default'],
		[4, 5],
		[4, 6],
		[5, 5],
		[5, 7],
	];
	
	//“手气不错”模式获取下一页链接时使用的关键字
	//注：“手气不错”的流程是
	//1、首先获取网页 head 声明的 next link
	//2、判断下一页链接的关键字，如下设置
	//3、如果 1、2 都无法获取到链接，则对网页链接的数字增加 1
	var NEXT_PAGE_LUCKY_KEYWORDS = ['next', '下一页', '下一頁', '下一章', '下一张', '下一張', '下一话', '下一話', '下一节', '下一節', '后页', '後頁', '>', '>>'];
	
	//在相册获取到下一页图片后，鼠标移到非本页的图片上时会有打开链接的按钮
	//设置该按钮打开链接的方式
	//0——内嵌 iframe 到本页的方式
	//1——在新链接打开
	//2——覆盖本页
	var ALBUM_PAGE_LINK_ACTION = 0;
	
	//当 ALBUM_PAGE_LINK_ACTION 等于 0 时，设置 iframe 窗口占浏览器窗口的百分比
	var ALBUM_PAGE_IFRAME_MIN_WIDTH = '1024px'; //只能设置像素
	var ALBUM_PAGE_IFRAME_WIDTH = '75%'; //只能设置百分比
	var ALBUM_PAGE_IFRAME_HEIGHT = '85%'; //只能设置百分比
	
	//在相册模式下打开预览图并用滚轮切换图片，当切换到最后两张时则自动获取下一页图片
	//true——开启；false——关闭
	var ALBUM_PAGE_AUTO_FETCH = true;
	
	//当 ALBUM_PAGE_AUTO_FETCH 为 true 时，每次自动获取的页数
	//注：值为正整数
	var ALBUM_PAGE_AUTO_FETCH_COUNT = 2;
	
	//<<<相册功能设置结束
/*---------------------------设置结束---------------------------------*/
	var target_obj = null;
	var preview_div = null;//大图的整个框架
	var preview_bg = null;//半暗背景
	var preview_head = null;//大图上面的三个按钮栏
	var preview_img = null;//大图
	var preview_img_clone = null;//用于解决页面未加载完时大图无法显示的问题
	var icon_view = null;//移到可放大的图片时显示的图标
	var icon_view_album = null;//移到一张稍大的图片时显示相册按钮
	var icon_view_page = null; //相册翻页后移到图片上显示打开网页按钮
	var preview_loading = null;
	var preview_loading_close = null;
	var preview_loading_close_icon = null;
	var preview_loading_img = null;
	var preview_exist_in_top = false; //用于iframe中判断顶层是否有preview div

	var preview_iframe_in_album = false;
	var timmer = null;//用于延时显示查看按钮
	var get_size_timmer = null;//用于获取图片尺寸
	var get_size_timeout_timmer = null;//获取图片尺寸超时
	var close_preview_timmer = null;//用于单击图片关闭预览图
	var timmer_rotate = null;//用于开启旋转
	//如果图片链接的是一张新图，尺寸要改变过两次才可信？？
	var org_pre_width = 0;//辅助获取新图的尺寸
	var org_cur_width = 0;//辅助获取新图的尺寸
	var org_count = 0;//辅助获取新图的尺寸
	var org_width = 0;
	var org_height = 0;
	//用于预览图拖拽
	var drag_flag = false;
	var mouse_lock = false;
	var offset_x = 0;
	var offset_y = 0;
	var preview_down_x = 0;//鼠标在预览图上点下的坐标
	var preview_down_y = 0;
	var create_lock = false;
	//用于预览图旋转
	var flag_rotate = false;
	var angle_org = 0;
	var angle_now = 0;
	var rotate_style = 1;

	var isOpera = false;
	var isChrome = false;

	// 用于缩放
	// 0——双击还原
	// 1——双击屏幕适配
	var fit_flag = 1;
	var percentage = 100;

	if(window.opera && window.opera.version() >= 11.10)
		OP_PAGE_PERCENTAGE = 100;

	var viewWidth = window.opera ? window.innerWidth / (OP_PAGE_PERCENTAGE / 100) : window.innerWidth;
	var viewHeight = window.opera ? window.innerHeight / (OP_PAGE_PERCENTAGE / 100) : window.innerHeight;

	var icon = {
		view: 'data:image/gif;base64,R0lGODlhGQAWAKIAAAICAv///6urqzY2NlpaWoKCgs/Pz+vr6yH5BAAAAAAALAAAAAAZABYAAANpCLrc/jC+QKu9mOHNdTUGt3mBoBTccXnGsAiYQagVy6AXAeCU/VIGlUlBC5AKilngMCi0FjxSSUDTAVyMkHHBGT4IPW5MAgiRDjAmeUYyFZDkskcdXxg88Lrizj3os1IiHWKCIn+HiAwJADs=',
		view_click:'data:image/gif;base64,R0lGODlhGQAWAKIAAI+Pj9DPzezs7G9bSykpKZYADv///wICAiH5BAAAAAAALAAAAAAZABYAAANueLrc/jA+Q6u9mOHNdQ2BwGULFQxFMQSbaHloqmKnS3myjA0H8JaGXMokAigINlhuYBAQAAHCgnkDCmIrA48gZbAMHowRQg1bohJWWMBySg4DQdgIGL8DHvfb67HvFXglen+AZiMdQIcjhIyNDwkAOw==',
		view_album: 'data:image/gif;base64,R0lGODlhGQAWAJEAAAICAo2Njf///wAAACH5BAAAAAAALAAAAAAZABYAAAJOhI+py70Co5wUCaekxUmfC1BVGG1hgKZq0JnCCref8QYiROfzad86+EPdQESX0BfSBXuin5E5Ku44zilVSiuRhtgt8GrRUpMfLneMTi8KADs=',
		view_page: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAWCAMAAAACYceEAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAxQTFRFjY2NAAAA6urqAgIC18oytwAAAFBJREFUeNqk0lsKACAIBEBd73/nIAlX0DDar2DQHibWRW6CKoV4QSXoBSSasqkRkEQrX5PIiartnUcS3b4lnXokfjd6nSycmdSTe/4HS4ABAD3XBL7FmpZ8AAAAAElFTkSuQmCC',
		album:'data:image/gif;base64,R0lGODlhFgAWAJAAAP7+/gAAACH5BAQKAP8ALAAAAAAWABYAAAJAhI+pFu0PIVv0hBljuuBy+k3dWIWkV5EWlkocWq6vunwwDMpsvOO1PspIepvWqRibIUxFpUXoOKZ+Hah1is1WCgA7',
		fit:'data:image/gif;base64,R0lGODlhFgAWAJAAAP7+/gAAACH5BAQKAP8ALAAAAAAWABYAAAJJhI+pFu0PIVv0hNmqvRfwXDne5GUdBnbng7DkWcKiRcbyPOaaou5L70sAbS3cMFaU1VwM48vUQuY+MB50BNJcq0FV5BsJiseHAgA7',
		full:'data:image/gif;base64,R0lGODlhFgAWAJAAAP7+/gAAACH5BAQKAP8ALAAAAAAWABYAAAJHhI+pFu0PIVv0hPlovuC62jUd9i0bFnLI502W+Krj/K7yfIOWqydc3vv5ZLAdLWUjokrJkTBjYpGAMVyKejr2XJFudwsOHwoAOw==',
		open: 'data:image/gif;base64,R0lGODlhFgAWAIAAAP7+/gAAACH5BAAAAAAALAAAAAAWABYAAAJBhI+pFu0PIVv0hFmtA5dntHXd93hmFppXVDbgNH7YiibiucQqrui3bgt6gK8ireKD1Yw8oQXGKjFlwqh1Q81qDQUAOw==',
		close:'data:image/gif;base64,R0lGODlhFgAWAJAAAP7+/gAAACH5BAQKAP8ALAAAAAAWABYAAAJJhI+pFu0PIVv0hNmqvRfwXDne5IGKOKZlh6Apu7bmm6AuCTNSTda31ds8TsGYEag6Kjus35GpywlxylMGOqNcixpk5PvtiseVAgA7',
		radius_close: 'data:image/gif;base64,R0lGODlhFgAWAIMAMYiIiO7u7hEREVVVVWZmZpmZmbu7u6qqqt3d3SIiInd3d0RERMzMzDMzMwAAAP///yH5BAEAAA8ALAAAAAAWABYAAwRP8MlJq70468271wEABNUBMBvgLJThDN3gABIiNCQXNA7aCIgPQ5BQOAwfiWqWfOwSt5xHxii8PgTmI0vjWAmTneOwseIoQwGqyW673/B2BAA7',
		loading:'data:image/gif;base64,R0lGODlhEAAQAPQAAObv9e70+Njn8C6BtgZpqQBmp2ShyU6UwYq41gRoqCZ8tL7X6PT4+iJ6sjiHuury98re7Nzp8vL2+aDF3bbS5dro8dDi7oKz00qSwLrV5mCfx////wAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgAAACwAAAAAEAAQAAAFNCAgjmRpnmiqplVbie4LxNXzWKJl44B++zxgbifs7Ya/o/GGtBSfRCX05+TFYK6VdsvlhgAAIfkECQoAAAAsAAACAAQADAAAAw5IVTqzDr4S6az4arZIAgAh+QQJCgAAACwAAAIACgAMAAAFLSAgjk1RNJemXWKBYYWWZVr7xnMNuLBM270cEPfb3Xw6HjF5FBphqdVwRDI1QgAh+QQJCgAAACwGAAIACgAMAAAEKRDIqVJSyBgk0zmJsSxG94VjCXigSJptCqPveroqS+e3bIOZzWxCsSgiACH5BAkKAAEALAYAAwAKAAoAAAQlMMjpWnNACCDbOY3AMEL3hWMZeKBImm0Ko+96uirbZNs8URZHBAAh+QQFCgAAACwAAAQAEAAIAAAFMeATRQ8AiKRJTRMVSVJkvrE5QdBEy8Bu4zoYzwe45YhEY7DWE/6OziZTiSqdRtZVKwQAIfkEBRQAAwAsAAAEABAACAAAAiCEBDOGyhaCUCLOUWW+m9qOWZ4mhtJ4lOC2qtbjHMkiFwA7',
		broken: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABJQTFRFAAAA////KysrXV1dpKSkysrKmT4w3AAAALJJREFUeNq8k1EOxCAIRGGA+195RUyEit1kP3aSxhRfGRBLdMo4iegLMV6Z6xcoRANwydEBnHO0QI42QOh3IBn9H4CXJncAUby0gNRZyYShG6CLtAJitlKJmqkEsYHp7lGsQRmc2MAM29jfzSJmnwGdKySegevDAr4gGhF3xFGkTgAB6Brs88L6tlu4x3FQLZCHFBZULXJjbZFblzbrf9McVE3RHHWWnMO6S/kNWBfmI8AADI4DnoqGLMQAAAAASUVORK5CYII=',
		next_page: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF6urq////yaDZGwAAAAJ0Uk5T/wDltzBKAAAAbElEQVR42uzVsQ0AMAzDMPf/p7v1ghSBAeoCbspZLgAAAAAAAAAAAAAAzYC8AAAAAAAAAAAAAAAAAAAAAAB+ADIcAAAAQB/ACwAAAAAAAAAAAAAAAAAAAAAaACMBAAAAAAAAAAAAAKwDrgADALddOiV2b79GAAAAAElFTkSuQmCC',
	};

	function _Message(message){
		if(message.indexOf('MSG_ID_ORIGINAL_SIZE_IMAGE_CREATE') != -1){
			preview_exist_in_top = preview_temp_lock = true;
		}
		window.top.postMessage(message, '*');
	}

	function _StopEvent(ev){
		ev.stopPropagation();
		ev.preventDefault();
	}

	function get_preview_orginal_size() {
		if(org_width == 0 || org_height == 0){
			if(is_undefined(preview_img.naturalWidth) == false){
				org_width = preview_img.naturalWidth;
				org_height = preview_img.naturalHeight;
			}
			else{
				org_width = preview_img.offsetWidth;
				org_height = preview_img.offsetHeight;
			}
		}
	}

	function get_angle(ox, oy, x, y){
		x = x - ox;
		y = oy - y;
		ox = oy = 0;
		if(ox == x)
			return (y > oy) ? 90 : 270;
		else if(oy == y)
			return (x > ox) ? 0 : 180;
		else{
			var n = 0; //默认第一象限
			if( (y > oy && x < ox) || (y < oy && x < ox))//第二、三象限
				n = 1;
			else if(y < oy && x > ox)//第四象限
				n = 2;
			return Math.atan( (y - oy) / (x - ox) ) / Math.PI * 180 + 180 * n;
		}
	}

	function stop_rotate(ev){
		window.removeEventListener('mousemove', rotate_handler, true);
		window.removeEventListener('mouseup', stop_rotate, true);
		if(timmer_rotate != null){
			clearTimeout(timmer_rotate);
			timmer_rotate = null;
		}
		if(flag_rotate){
			angle_now = angle_org - get_angle(get_container_origin().x, get_container_origin().y, ev.pageX, ev.pageY) + angle_now;
		}
		flag_rotate = false;
	}

	function is_undefined(x){
		if(typeof x != 'undefined')
			return false;
		return true;
	}

	function is_rotate_available(){
		var style = document.body.style;
		if( ! is_undefined(style.OTransform) || ! is_undefined(style.MozTransform) || ! is_undefined(style.WebkitTransform) || !is_undefined(style.Transform) )
			return true;
		return false;
	}

	function rotate_obj(obj, angle){
		var names = ['OTransform', 'MozTransform', 'WebkitTransform', 'Transform'];
		for (var i = 0; i < names.length; i++){
			if(!is_undefined(obj.style[names[i]])){
				obj.style[names[i]] = 'rotate(' + angle + 'deg)';
				break;
			}
		}
	}

	function rotate_handler(ev){
		var angle = get_angle(get_container_origin().x, get_container_origin().y, ev.pageX, ev.pageY);
		var style_str = preview_div.getAttribute('style');
		var angle_to_rotate = (angle_org - angle + angle_now);
		if(ROTATE_SNAP > 0 && rotate_style == 1){
			angle_to_rotate = Math.floor(angle_to_rotate / ROTATE_SNAP) * ROTATE_SNAP;
		}
		else if(ROTATE_SNAP_2 > 0 && rotate_style == 2){
			angle_to_rotate = Math.floor(angle_to_rotate / ROTATE_SNAP_2) * ROTATE_SNAP_2;
		}
		rotate_obj(preview_div, angle_to_rotate);
	}

	function start_rotate(ox, oy, x, y){
		timmer_rotate = null;
		mouse_lock = true;
		window.removeEventListener('mousemove', drag_proc, true);
		if(ox == x && oy == y)
			return false;
		flag_rotate = true;
		drag_flag = false;
		angle_org = get_angle(ox, oy, x, y);
		window.addEventListener('mousemove', rotate_handler, true);
		window.addEventListener('mouseup', stop_rotate, true);
	}

	function get_container_origin(){
		return {
			x: preview_div.offsetLeft + (preview_div.offsetWidth >> 1),
			y: preview_div.offsetTop + (preview_div.offsetHeight >> 1)
		}
	}

	function backgroundMouseDown (ev){
		if(ev.target != preview_img){
			drag_flag = false;
			mouse_lock = false;
		}
	}

	function drag_begin (ev){
		if(ev.button != 0)//非左键
			return false;
		ev.preventDefault();
		create_lock = true;
		preview_down_x = ev.pageX;
		preview_down_y = ev.pageY;
		var x = ev.pageX;
		var y = ev.pageY;
		offset_x = x - preview_div.offsetLeft;
		offset_y = y - preview_div.offsetTop;
		if(ev.target == preview_img){
			drag_flag = true;
			mouse_lock = true;
			window.addEventListener('mousemove', drag_proc, true);
		}
		if(ROTATE_ENABLE && is_rotate_available()){
			if(ROTATE_STYLE == 0 || ROTATE_STYLE == 2){
				if(timmer_rotate == null)
					timmer_rotate = setTimeout(function(){ rotate_style = 1; start_rotate(get_container_origin().x, get_container_origin().y, ev.pageX, ev.pageY); }, LONG_PRESS_TIME);
			}
			if(ROTATE_STYLE == 1 || ROTATE_STYLE == 2){
				if(isOpera ? ev.altKey : ev.ctrlKey){
					rotate_style = 1;
					start_rotate(get_container_origin().x, get_container_origin().y, ev.pageX, ev.pageY);
				}
			}
			if(ROTATE_STYLE_2 == 1){
				if(ev.shiftKey){
					rotate_style = 2;
					start_rotate(get_container_origin().x, get_container_origin().y, ev.pageX, ev.pageY);
				}
			}
		}
	}

	function cleanSelection(){
		if(window.getSelection() != '')
			window.getSelection().removeAllRanges();
	}
	
	function drag_proc(ev){
		if(!drag_flag || preview_img == null)
			return false;
		var x = ev.pageX;
		var y =	ev.pageY;
		preview_div.style.left = x - offset_x + 'px';
		preview_div.style.top = y - offset_y + 'px';
		cleanSelection();
	}

	function drag_over(ev){
		if(ev.button != 0)
			return false;
		drag_flag = false;
		create_lock = false;
		if(ev.pageX == preview_down_x && ev.pageY == preview_down_y){
			switch(PREVIEW_CLICK_HDLR){
				case 0:
					fit_to_screen_switch(ev.pageX, ev.pageY);
					break;
				case 1:
					if(close_preview_timmer == null){
						close_preview_timmer = setTimeout(function(){destroy_preview(); close_preview_timmer = null}, PREVIEW_CLICK_CLOSE_DELAY);
					}
					else{
						clearTimeout(close_preview_timmer);
						close_preview_timmer = null;
					}
					break;
				default:
					break;
			}
		}
	}

	function fit_to_screen_switch (x, y){
		get_preview_orginal_size();
		if(preview_img.offsetWidth != org_width || preview_img.offsetHeight != org_height)
			fit_to_screen_switch_ext(0, x, y);
		else
			fit_to_screen_switch_ext(1, x, y);
	}

	function fit_to_screen_switch_ext (fit_flag, x, y){
		get_preview_orginal_size();
		switch(fit_flag){
			case 0://还原
				var of_x = x - preview_div.offsetLeft;
				var of_y = y - preview_div.offsetTop;
				var o_w = preview_div.offsetWidth;
				var o_h = preview_div.offsetHeight;
				preview_img.style.width = 'auto';
				preview_img.style.height = 'auto';
				percentage = 100;
				fit_flag = 1;
				if(ORIGINAL_STYLE == 1){
					var p_x = of_x / o_w;
					var p_y = of_y / o_h;
					preview_div.style.left = x - (preview_div.offsetWidth * p_x) + 'px';
					preview_div.style.top = y - (preview_div.offsetHeight * p_y) + 'px';
				}
				break;
			case 1://屏幕适配
				preview_img.style.width = 'auto';
				preview_img.style.height = 'auto';
				percentage = 100;
				if(preview_img.offsetHeight > viewHeight * PREVIEW_IN_WND_PADDING){
					percentage = (viewHeight * 100 * PREVIEW_IN_WND_PADDING)/ org_height;
					preview_img.style.height = org_height * percentage/100 + 'px';
					preview_img.style.width = org_width * percentage/100 + 'px';
				}
				if(preview_img.offsetWidth > viewWidth * PREVIEW_IN_WND_PADDING){
					percentage = (viewWidth * 100 * PREVIEW_IN_WND_PADDING)/ org_width;
					preview_img.style.height = org_height * percentage/100 + 'px';
					preview_img.style.width = org_width * percentage/100 + 'px';
				}
				preview_div.style.left = (viewWidth - preview_div.offsetWidth) / 2 + window.pageXOffset +  'px';
				preview_div.style.top = (viewHeight - preview_div.offsetHeight) / 2 + window.pageYOffset + 'px';
				fit_flag = 0;
				break;
			default:
				break;
		}
	}
	
	function getWheelDir(ev){
		var val = !is_undefined(ev.wheelDelta) ? ev.wheelDelta/120 : (-ev.detail/3);
		return (val > 0) ? 1 : -1;
	}

	function resize_preview(ev){
		get_preview_orginal_size();
		var val = getWheelDir(ev);
		_StopEvent(ev);
		percentage += val * RESIZE_SPEED;
		if(percentage < 5)
			percentage = 5;
		var org_div_w, org_div_h, org_div_x, org_div_y;
		var of_x, of_y;
		if(RESIZE_STYLE != 1) {//居中缩放
			org_div_w = preview_div.offsetWidth;
			org_div_h = preview_div.offsetHeight;
			org_div_x = preview_div.offsetLeft;
			org_div_y = preview_div.offsetTop;
			of_x = ev.pageX - org_div_x;
			of_y = ev.pageY - org_div_y;
		}
		preview_img.style.width = org_width * percentage/100 + 'px';
		preview_img.style.height = org_height * percentage/100 + 'px';
		if(RESIZE_STYLE == 0) {//居中缩放
			preview_div.style.left = preview_div.offsetLeft - (preview_div.offsetWidth - org_div_w)/2 + 'px';
			preview_div.style.top = preview_div.offsetTop - (preview_div.offsetHeight - org_div_h)/2 + 'px';
		}
		else if(RESIZE_STYLE == 2) {//按鼠标位置缩放
			var p_x = (of_x / org_div_w);
			var p_y = (of_y / org_div_h);
			preview_div.style.left = ev.pageX - (preview_div.offsetWidth * p_x) + 'px';
			preview_div.style.top = ev.pageY - (preview_div.offsetHeight * p_y) + 'px';
		}
	}

	function set_preview_layout_ext(){
		var times = isOpera ? 2 : 1;
		get_preview_orginal_size();
		if(org_width != 0 && org_height != 0){
			if(is_undefined(preview_img.naturalWidth) == false){
				clearInterval(get_size_timmer);
				get_size_timmer = null;
				set_preview_layout();
			}
			else{
				if(org_pre_width != org_width){
					org_count ++;
					org_pre_width = org_cur_width;
					org_cur_width = org_width;
				}
				if(org_count > times){
					clearInterval(get_size_timmer);
					get_size_timmer = null;
					org_count = org_pre_width = org_cur_width = 0;
					set_preview_layout();
				}
				else{
					org_width = org_height = 0;
				}
			}
		}
	}

	function set_preview_layout(){
		destroy_preview_loading();
		if(org_width > viewWidth * PREVIEW_IN_WND_PADDING || org_height > viewHeight * PREVIEW_IN_WND_PADDING)
			fit_to_screen_switch_ext(1);
		preview_div.style.left = (viewWidth - preview_div.offsetWidth) / 2 + window.pageXOffset + 'px';
		preview_div.style.top = (viewHeight - preview_div.offsetHeight) / 2 + window.pageYOffset + 'px';
		preview_div.style.visibility = 'visible';
		preview_div.style.zIndex = 2147483647;
	}

	function create_preview_button(icon, func){
		var btn = _createElement('span');
		btn.setAttribute('style', 'margin-left: 5px; width: 22px !important; height: 22px !important; background-image: url("' + icon + '"); float: right !important; cursor: pointer !important;');
		btn.addEventListener('click', func, false);
		return btn;
	}

	function drag_fix(ev){
		var x = ev.pageX;
		var y = ev.pageY;
		if(drag_flag){
			preview_div.style.left = x - offset_x + 'px';
			preview_div.style.top = y - offset_y + 'px';
			cleanSelection();
			return true;
		}
		return false;
	}

	function create_whole_page_div(color, opacity, id){
		var div = _createElement('div', id ? id : 'ujs_preview_album_whole_page_div');
		div.setAttribute('style', 'position: absolute !important; left: 0px !important; top: 0px !important; z-index: 2147483647 !important; background-color: ' + color + ' !important; opacity: ' + opacity + ' !important; width: '+Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) + 'px !important; height: ' + Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, (window == window.top) ? viewHeight : 0) + 'px !important;');
		return div;
	}

	var has_played = false;
	var last_play_mouse_x = -1;
	var last_play_mouse_y = -1;

	function preview_bg_scroll_hdlr (ev) {
		if(VIEW_STYLE != 0){
			return;
		}
		var val = getWheelDir(ev), ret = false;
		var obj = ev.target;
		if(obj == preview_bg || obj == preview_div
		|| (has_played && Math.abs(ev.clientX - last_play_mouse_x) <= 40 && Math.abs(ev.clientY - last_play_mouse_y) <= 40)){
			//在 firefox 中切换上/下张时页面会滚动，使用 Timer 避免该问题
			setTimeout(function() {
				has_played = true;
				last_play_mouse_x = ev.clientX;
				last_play_mouse_y = ev.clientY;
				(val < 0) ? preview_album_play_next() : preview_album_play_previous(); 
			}, 1);
			ret = true;
			_StopEvent(ev);
		}
	}

	function preview_play_check(ev) {
		if(Math.abs(ev.clientX - last_play_mouse_x) > 40 || Math.abs(ev.clientY - last_play_mouse_y) > 40){
			has_played = false;
		}
	}

	var album_display_lock = false;

	function create_preview(x, y, imgLink, not_from_click){
		if(imgLink != null){
			if(album_in_select_mode){
				return;
			}
			destroy_all_preview();
			if(preview_album != null){
				if(target_obj.src && !not_from_click){
					curr_img_src = target_obj.src;
				}
				curr_index = preview_album_current_source_find_index_by_link(imgLink);
				preview_album_hightlight_photo(curr_index, true);
			}
			else if(album_display_lock == false){
				album_display_lock = true;
				preview_album_main();
			}
			if(VIEW_STYLE != 1){
				preview_bg = create_whole_page_div('black', BACKGROUND_OPACITY);
				preview_bg.addEventListener('mousemove', drag_fix, false);
				window.addEventListener('mousemvoe', preview_play_check, true);
				window.addEventListener('DOMMouseScroll', preview_bg_scroll_hdlr, true);
				window.addEventListener('mousewheel', preview_bg_scroll_hdlr, true);
				if(SHOW_TIPS_ON_STATUSBAR){
					preview_bg.addEventListener('mouseover', function(e){ window.status = '滚动鼠标滚轮查看上/下一张图片'; }, false);
				}
				document.body.appendChild(preview_bg);
			}
			preview_div = _createElement('div');
			preview_div.setAttribute('style', 'border: 1px solid gray !important; line-height: 0px !important; background-color: ' + PREVIEW_DIV_COLOR + ' !important; position: absolute !important; z-index: 2147483647 !important; padding: ' + PREVIEW_DIV_PADDING + 'px !important;');
			preview_div.style.left = -9999 + 'px';
			preview_div.style.top = -9999 + 'px';
			preview_div.style.visibility = 'hidden';
			preview_div.style.zIndex = -2147483647;
			
			if(SHOW_TOOLS_BAR){
				preview_head = _createElement('div');
				preview_head.setAttribute('style', 'min-width: 100px; height: 22px !important;');

				preview_head.appendChild(create_preview_button(icon.close, destroy_preview));
				preview_head.appendChild(create_preview_button(icon.open, function() { open_link(imgLink, 'new_page'); }));
				preview_head.appendChild(create_preview_button(icon.full, function(){ fit_to_screen_switch_ext(0); }));
				preview_head.appendChild(create_preview_button(icon.fit, function(){ fit_to_screen_switch_ext(1); }));
				if(preview_album == null){
					preview_head.appendChild(create_preview_button(icon.album, preview_album_main));
				}
				preview_div.appendChild(preview_head);
			}
			
			preview_img = _createElement('img');
			preview_img.src = imgLink;
			preview_img.setAttribute('style', 'margin-top: 0px !important; cursor: move !important; max-width: none !important; max-height: none !important; width: auto; height: auto; background-color: white !important;');
			if(SHOW_TOOLS_BAR){
				preview_img.style.marginTop = '3px';
			}
			window.addEventListener('mousedown', backgroundMouseDown, true);
			preview_img.addEventListener('mousedown', drag_begin, false);
			preview_img.addEventListener('mouseup', drag_over, false);
			switch(PREVIEW_DBLCLICK_HDLR){
				case 0:
					preview_img.addEventListener('dblclick', destroy_preview, false);
					break;
				case 1:
					preview_img.addEventListener('dblclick', fit_to_screen_switch, false);
					break;
				default:
					break;
			}
			if(RESIZE_SPEED > 0){
				preview_img.addEventListener('DOMMouseScroll', resize_preview, false);
				preview_img.addEventListener('mousewheel', resize_preview, false);
			}
			preview_div.appendChild(preview_img);
			document.body.appendChild(preview_div);
			
			//opera中，body子元素加载优先权高于孙子元素，此段代码用于解决页面未加载完成时图片不显示的问题。
			preview_img_clone = _createElement('img');
			preview_img_clone.src = imgLink;
			preview_img_clone.setAttribute('style', 'visibility: hidden !important; z-index: -2147483647 !important; position: absolute !important; width: 0px; height: 0px;');
			preview_img_clone.onerror = preview_img_clone.onload = function (ev) {
				if(preview_img_clone != null){
					_removeElement(preview_img_clone);
					preview_img_clone = null;
				}
				if(ev.type == 'error'){
					if(preview_loading != null){
						clearInterval(get_size_timmer);
						get_size_timmer = null;
						preview_loading_img.style.backgroundImage = 'url(' + icon.broken + ')';
					}
				}
			};
			document.body.appendChild(preview_img_clone);
		}
		//调整图片位置
		if(VIEW_STYLE == 1){//不居中
			preview_div.style.left = x + 5 + 'px';
			preview_div.style.top = y + 5 + 'px';
			preview_div.style.visibility = 'visible';
			preview_div.style.zIndex = 2147483647;
		}
		else{//图片居中显示，如果过大，则缩放
			var temp_img = new Image();
			temp_img.src = imgLink;
			if(temp_img.width != 0){
				get_preview_orginal_size();
				set_preview_layout();
			}
			else{
				create_preview_loading();
				get_size_timmer = setInterval(set_preview_layout_ext, 10);
			}
			delete temp_img;
		}
	}

	function create_preview_loading(){
		preview_loading = _createElement('div');
		preview_loading.setAttribute('style', 'border: 1px solid gray !important; background-color: white !important; position: absolute !important; z-index: 2147483647 !important; width: 100px !important; height: 105px !important;');
		preview_loading_close = _createElement('div');
		preview_loading_close_icon = _createElement('div');
		preview_loading_close_icon.setAttribute('style', 'width: 22px !important; height: 22px !important; background-image: url("' + icon.close + '"); float: right !important; cursor: pointer !important;');
		preview_loading_close_icon.addEventListener('click', destroy_all_preview, false);
		preview_loading_close.appendChild(preview_loading_close_icon);
		preview_loading.appendChild(preview_loading_close);
		preview_loading_img = _createElement('div');
		preview_loading_img.setAttribute('style', 'position: absolute !important; top: 5px !important; background-image: url("' + icon.loading + '") !important; background-position: center center !important; background-repeat:no-repeat !important; width: 100px !important; height: 100px !important;');
		preview_loading.appendChild(preview_loading_img);
		document.body.appendChild(preview_loading);
		preview_loading.style.left = (viewWidth - preview_loading.offsetWidth) / 2 + window.pageXOffset + 'px';
		preview_loading.style.top = (viewHeight - preview_loading.offsetHeight) / 2 + window.pageYOffset + 'px';
	}

	function destroy_preview_loading(){
		if(window != window.top){
			_Message('MSG_ID_ORIGINAL_SIZE_IMAGE_DESTROY_LOADING');
			return;
		}
		if(get_size_timmer){
			clearInterval(get_size_timmer);
			get_size_timmer = null;
		}
		if(get_size_timeout_timmer){
			clearTimeout(get_size_timeout_timmer);
			get_size_timeout_timmer = null;
		}
		if(preview_loading != null){
			_removeElement(preview_loading);
			preview_loading = null;
		}
	}

	function destroy_preview(event_or_keep_bg){
		if(window != window.top){
			_Message('MSG_ID_ORIGINAL_SIZE_IMAGE_DESTROY_PREVIEW');
			preview_exist_in_top = false;
			return;
		}
		if(timmer){
			clearTimeout(timmer);
			timmer = null;
		}
		reset_recycle_warning();
		if(event_or_keep_bg && typeof event_or_keep_bg != 'boolean'){
			_StopEvent(event_or_keep_bg);
		}
		if(preview_bg != null && event_or_keep_bg !== true){
			window.removeEventListener('mousemvoe', preview_play_check, true);
			window.removeEventListener('DOMMouseScroll', preview_bg_scroll_hdlr, true);
			window.removeEventListener('mousewheel', preview_bg_scroll_hdlr, true);
			_removeElement(preview_bg);
			preview_bg = null;
		}
		if(preview_div != null){
			window.removeEventListener('mousedown', backgroundMouseDown, true);
			window.removeEventListener('mousemove', drag_proc, true);
			
			_removeElement(preview_div);
			if(preview_img_clone != null){
				_removeElement(preview_img_clone);
				preview_img_clone = null;
			}
			
			if(get_size_timmer){
				clearInterval(get_size_timmer);
				get_size_timmer = null;
			}
			preview_div = null;
			percentage = 100;
			fit_flag = 1;
			org_width = org_width = angle_org = angle_now = 0;
		}
	}

	function getElementXY(ele){
		destroy_view_icon();
		var _x = ele.getBoundingClientRect().left + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
		var _y = ele.getBoundingClientRect().top + Math.max(document.documentElement.scrollTop, document.body.scrollTop);

		//var position = ele.style.position || window.getComputedStyle(ele, null).position;
		while(ele.parentNode && _tag(ele) != 'html'/* && position != 'absolute' && position != 'fixed'*/){
			var pEle = ele.parentNode;
			var pDisplay = pEle.style.display || window.getComputedStyle(pEle, null).display;
			var pTextIndent = pEle.style.textIndent || window.getComputedStyle(pEle, null).textIndent;
			if(pTextIndent == null || pTextIndent.trim() == '' || pTextIndent.indexOf('0') == 0){
				if(pDisplay != 'inline' && pDisplay != 'inline-table'){
					var pXY = getElementXY(pEle);
					return {x: Math.max(pXY.x, _x), y: Math.max(pXY.y, _y)};
				}
			}
			ele = pEle;
		}
		
		return {x: _x, y: _y};
	}
	
	var iframe_page = null;
	var open_link_lock = false;
	
	function open_link(url, mode){
		if(mode == 'new_page' || mode == 'replace_current'){
			var a = _createElement('a');
			a.setAttribute('style', 'width: 0px !important; height: 0px !important; position: absolute !important; left: -999px !important; top: -999px !important;');
			a.setAttribute('target', mode == 'new_page' ? '_blank' : '_self');
			a.href = url;
			document.body.appendChild(a);
			open_link_lock = true;
			a.click();
			open_link_lock = false;
			_removeElement(a);
		}
		else if(mode == 'iframe'){
			var page_bg = create_whole_page_div('black', BACKGROUND_OPACITY, 'ujs_preview_ablum_iframe_page_bg');
			iframe_page = _createElement('div', 'ujs_preview_album_iframe_page_container', 'ujs_osi_dialog_body');
			iframe_page.innerHTML = '' +
				'<span class="ujs_osi_radius_btn ujs_osi_radius_close_btn" id="ujs_preview_album_iframe_close"></span>' +
				'<a id="ujs_preview_album_iframe_addr"></a>' +
				'<iframe id="ujs_preview_album_iframe_page" osi_frame_name="ujs_osi_album_iframe" width="100%"></iframe>';
			document.body.appendChild(page_bg);
			document.body.appendChild(iframe_page);
			var a = $('#ujs_preview_album_iframe_addr');
			a.href = url;
			a.target = '_blank';
			a.textContent = '[点击新链接打开] ' + url.match(/([^#]*)#?.*/)[1];
			
			var iframe = $('#ujs_preview_album_iframe_page');
			iframe.src = url.replace('#__ujs_osi_focus__', '#__ujs_osi_focus__iframe__');
			$('#ujs_preview_album_iframe_close').addEventListener('click', function(){
				_removeElement(iframe_page);
				_removeElement(null, 'ujs_preview_ablum_iframe_page_bg');
				iframe_page = null;
			}, false);
			iframe.height = viewHeight * (parseInt(ALBUM_PAGE_IFRAME_HEIGHT) / 100) + 'px';
			
			if(CLICK_BLANK_TO_CLOSE){
				page_bg.addEventListener('click', function(){
					$('#ujs_preview_album_iframe_close').click();
				}, false);
			}
			
			reset_dialog_position(iframe_page, true);
		}
	}

	function show_view_icon(imgLink, canShowAlbumIcon){
		if(drag_flag || target_obj == preview_img || (VIEW_STYLE == 1 && preview_div != null)){
			destroy_view_icon();
			return false;
		}
		var pos = getElementXY(target_obj);
		var x = pos.x, y = pos.y;
		if(imgLink != null){
			var view_icon = '';
			view_icon = can_click_direct_view() ? icon.view_click : icon.view;
			if(VIEW_BUTTON_POS == 1)//右上
				x = x + target_obj.clientWidth - 25;
			icon_view = _createElement('span', null, 'ujs_osi_view_icon');
			icon_view.setAttribute('style', 'left: ' + x + 'px !important; top: ' + y + 'px !important; background-image: url("' + view_icon + '") !important;');
			icon_view.addEventListener('click', function(ev){
				if(window != window.top){
					var message = x + '+|+|+' + y + '+|+|+' + imgLink + '+|+|+' + 1 + '+|+|+' + 'MSG_ID_ORIGINAL_SIZE_IMAGE_CREATE';
					destroy_view_icon();
					_Message(message);
				}else{
					setTimeout(function(){create_preview(x, y, imgLink);}, 1);
				}
			}, false);
			document.body.appendChild(icon_view);
			x = (VIEW_BUTTON_POS == 1) ? (x - 25 - 1) : (x + 25 + 1);
		}
		
		if(preview_album != null){
			var url = target_obj.getAttribute('_fromurl');
			if(url != null && url.trim() != ''){
				_target_obj = target_obj;
				icon_view_page = _createElement('span', null, 'ujs_osi_view_icon');
				icon_view_page.setAttribute('style', 'left: ' + x + 'px !important; top: ' + y + 'px !important; background-image: url("' + icon.view_page + '") !important;');
				icon_view_page.title = '打开所在页面并定位到该元素：\n' + url;
				icon_view_page.addEventListener('click', function(ev){
					var _url = url.match(/([^#]*)#?.*/)[1];
					_url += '#__ujs_osi_focus__' + encodeURIComponent(_target_obj.src.replace(/\./g, '_-dot-_'));
					var action = 'iframe';
					if(ALBUM_PAGE_LINK_ACTION >= 2){
						action = 'replace_current';
					}
					else if(ALBUM_PAGE_LINK_ACTION >= 1){
						action = 'new_page';
					}
					open_link(_url, action);
				}, false);
				document.body.appendChild(icon_view_page);
				x = (VIEW_BUTTON_POS == 1) ? (x - 25 - 1) : (x + 25 + 1);
			}
		}

		if(preview_album == null && ((SHOW_ALBUM_ICON == 1 && canShowAlbumIcon) || (SHOW_ALBUM_ICON != -1 && imgLink != null)) ){
			icon_view_album = _createElement('span', null, 'ujs_osi_view_icon');
			icon_view_album.setAttribute('style', 'left: ' + x + 'px !important; top: ' + y + 'px !important; background-image: url("' + icon.view_album + '") !important;');
			icon_view_album.addEventListener('click', function(){
				preview_album_main();
			}, false);
			document.body.appendChild(icon_view_album);
		}
	}

	function destroy_view_icon (){
		if(target_obj != icon_view && target_obj != icon_view_album && target_obj != icon_view_page){
			if(timmer){
				clearTimeout(timmer);
			}
			if(icon_view != null){
				_removeElement(icon_view);
				icon_view = null;
			}
			if(icon_view_page != null){
				_removeElement(icon_view_page);
				icon_view_page = null;
			}
			if(icon_view_album != null){
				_removeElement(icon_view_album);
				icon_view_album = null;
			}
		}
	}

	function destroy_all_preview (keep_bg){
		destroy_preview_loading();
		destroy_view_icon();
		destroy_preview(keep_bg);
	}

	function diff_ingore(w, h, ow, oh){
		if((100 - w*100/ow) <= DEC_PERCENTAGE && (100 - h*100/oh) <= DEC_PERCENTAGE)
			return true;
		if(Math.abs(ow - w) <= DEC_PIX && Math.abs(oh - h) <= DEC_PIX)
			return true;
		return false;
	}

	function need_preview(w, h, ow, oh){
		if(VIEW_FILTER == false)
			return true;
		if(w > ow && h > oh)
			return false;
		if(diff_ingore(w, h, ow, oh))
			return false;
		return true;
	}

	function check_img_link (link){
		if(link.search(/(\.jpg|\.jpeg|\.png|\.gif|\.bmp)$/i) != -1)
			return true;
		return false;
	}

	function check_img_src_reg (obj){
		if(!SITE_IMG_INFO_FLAG)
			return '';
		var i, t_link = '', link = obj.src;
		for(i = 0; i < SITE_IMG_INFO.length; i++){
			if(SITE_IMG_INFO[i][3] == 'href'){
				var target_link = obj, find = false;
				while(_tag(target_link) != 'a' && target_link.parentNode){
					target_link = target_link.parentNode;
				}
				if(_tag(target_link) != 'a') continue;
				t_link = target_link.href;
			}
			else{
				t_link = link;
			}
			if(t_link.indexOf('data:') != 0 /* do not check base64 encoded image */ && SITE_IMG_INFO[i][0].test(t_link)){
				return (SITE_IMG_INFO[i][2]) ? eval(SITE_IMG_INFO[i][2] + '("' + t_link.replace(SITE_IMG_INFO[i][0], SITE_IMG_INFO[i][1]) + '")') : t_link.replace(SITE_IMG_INFO[i][0], SITE_IMG_INFO[i][1]);
			}
		}
		return '';
	}

	function can_click_direct_view(){
		var temp = target_obj;
		if(!CLICK_DIRECT_VIEW)
			return false;
		if(ALWAYS_CLICK_DIRECT_VIEW)
			return true;
		while(_tag(temp) != 'a' && temp.parentNode)
			temp = temp.parentNode;
		if(_tag(temp) != 'a')
			return true;
		else{
			if(check_img_src_reg(target_obj) || check_img_link(temp.href))
				return true;
		}
		return false;
	}

	var start_preview_x = 0, start_preview_y = 0, start_preview_link = '', start_preview_click_obj = null;
	function click_to_show_preview(ev){
		if(ev.target != start_preview_click_obj || (isOpera ? ev.altKey : ev.ctrlKey) || ev.button != 0){
			return;
		}
		_StopEvent(ev);
		if(preview_div == null || start_preview_link != preview_img.src){
			if(window != window.top){
				var message = start_preview_x + '+|+|+' + start_preview_y + '+|+|+' + start_preview_link + '+|+|+' + 1 + '+|+|+' + 'MSG_ID_ORIGINAL_SIZE_IMAGE_CREATE';
				destroy_view_icon();
				_Message(message);
			}else{
				setTimeout(function(){create_preview(start_preview_x, start_preview_y, start_preview_link);}, 1);
			}
			window.removeEventListener('click', arguments.callee, true);
		}
		else if(preview_div != null)
			destroy_all_preview();
	}

	function start_preview(x, y, target_x, target_y, link, canShowAlbumIcon){
		if(timmer){
			clearTimeout(timmer);
		}
		if(VIEW_STYLE == 1){
			show_view_icon(link, canShowAlbumIcon);
			if(window != window.top){
				var message = x + '+|+|+' + y + '+|+|+' + link + '+|+|+' + VIEW_PREVIEW_DELAY + '+|+|+' + 'MSG_ID_ORIGINAL_SIZE_IMAGE_CREATE';
				_Message(message);
			}
			else{
				timmer = setTimeout(function(){create_preview(x, y, link);}, VIEW_PREVIEW_DELAY);
			}
		}
		else{
			timmer = setTimeout(function(){show_view_icon(link, canShowAlbumIcon);}, VIEW_BUTTON_DELAY);
		}
		if( can_click_direct_view() && link != null){
			start_preview_x = target_x;
			start_preview_y = target_y;
			start_preview_link = link;
			start_preview_click_obj = target_obj;
			window.removeEventListener('click', click_to_show_preview, true);
			window.addEventListener('click', click_to_show_preview, true);
		}
	}

	function checkImage(ev){
		if(preview_iframe_in_album){
			return;
		}
		
		var x = ev.pageX;
		var y =	ev.pageY;
		if(flag_rotate){
			return false;
		}
		//用于修正拖拽过快造成的拖拽失败问题
		if(drag_fix(ev)){
			return false;
		}
		if(album_in_select_mode){
			return;
		}

		target_obj = ev.target;
		var temp = target_obj;
		if(preview_div != null){
			while(temp.parentNode){
				if(temp == preview_div){
					if(VIEW_STYLE == 1 && timmer){
						clearTimeout(timmer);
						timmer = null;
					}
					destroy_view_icon();
					return false;
				}
				temp = temp.parentNode;
			}
		}
		//指向非图片元素时，则关闭查看图标
		if(_tag(target_obj) != 'img'){
			if(VIEW_STYLE == 1){
				destroy_preview();
			}
			destroy_view_icon();
			return false;
		}

		var ow, oh, org_img = null;
		if( ! is_undefined(target_obj.naturalWidth) ){
			ow = target_obj.naturalWidth;
			oh = target_obj.naturalHeight;
		}
		else{
			//创建一个不显示的图片，用于验证原本尺寸
			var org_img = new Image();
			org_img.src = target_obj.src;
			ow = org_img.width;
			oh = org_img.height;
		}
		
		var imgLink = target_obj;
		while(_tag(imgLink) != 'a' && imgLink.parentNode)
			imgLink = imgLink.parentNode;
			
		//如果目标图片过小，则不生效
		if(target_obj.width * target_obj.height < MIN_AREA 
		&& check_img_src_reg(target_obj) == ''
		&& !(_tag(imgLink) == 'a' && check_img_link(imgLink.href) && target_obj.src != imgLink.href)
		){
			return false;
		}
		
		var link = null;
		if(VIEW_FILTER){//只在图片被缩小过，或者图片链接着另一张图片时显示查看按钮
			if(check_img_src_reg(target_obj) != ''){//自定义的规则
				link = check_img_src_reg(target_obj);
			}
			else if( _tag(imgLink) == 'a' && EXCLUDE_IMG_LINK == true){
			}
			else if( _tag(imgLink) == 'a' && check_img_link(imgLink.href) && EXCLUDE_IMG_LINK == false ){
				//图片链接，链接的是一张图片
				link = imgLink.href;
			}
			else if( (ow > target_obj.offsetWidth || oh > target_obj.offsetHeight)
				&& need_preview(target_obj.offsetWidth, target_obj.offsetHeight, ow, oh)){//原图被缩放
				link = target_obj.src;
			}
		}//if(VIEW_FILTER)
		else{//任何图片（除长或宽小于40像素外）都显示查看按钮，如果图片链接着另一张图片，则显示被链接的图片，否则显示当前图片
			if(check_img_src_reg(target_obj) != '' && preview_album == null){//自定义的规则
				link = check_img_src_reg(target_obj);
			}
			//图片链接，链接的是另一张图片
			else if( _tag(imgLink) == 'a' && (check_img_link(imgLink.href) || preview_album != null) ){
				link = imgLink.href;
			}
			else if(need_preview(target_obj.width, target_obj.height, ow, oh)){//没有链接图片
				if(diff_ingore(target_obj.offsetWidth, target_obj.offsetHeight, ow, oh)){
					link = target_obj.src;
				}
				else{
					link = target_obj.src;
				}
			}
		}
		start_preview(x, y, getElementXY(target_obj).x, getElementXY(target_obj).y, link, (target_obj.width * target_obj.height >= MIN_AREA_TO_SHOW_ALBUM_ICON));
		if(org_img != null){
			delete org_img;
		}
	}

	function closePreviewByClick(ev){
		if(open_link_lock)
			return;
		if(ev.button != 0)
			return;
		var temp = ev.target;
		var is_preview_obj = false;
		var is_loading_obj = false;
		var ret = false;
		if(preview_div != null || preview_loading != null){
			while(temp.parentNode){
				if(temp == preview_div)
					is_preview_obj = true;
				if(temp == preview_loading)
					is_loading_obj = true;
				temp = temp.parentNode;
			}
			if(is_preview_obj && preview_div != null || is_loading_obj && preview_loading != null){
				//do nothing
			}
			else if( ! is_loading_obj && ! mouse_lock && preview_loading != null
			|| ! is_preview_obj && ! mouse_lock && preview_div != null){
				destroy_all_preview();
				ret = true;
			}
			mouse_lock = false;
		}
		return ret;
	}

	//for preview album
	var album_icon = null;
	var preview_album = null;
	var album_settings = null;
	var album_confirm = null;
	var album_in_select_mode = false;
	var album_ctn = null;
	var album_tables = null;
	var albumStyleObj = null;
	var album_source = null;
	var curr_img_src = '';
	var curr_album_source = null;
	var curr_index = -1;
	var album_frame_count = 0;
	var album_frame_timeout = null;
	var album_scroll_lock = false;
	var album_row = 3;
	var album_col = 5;

	var _VIEW_STYLE, _MIN_AREA, _CLICK_DIRECT_VIEW, _ALWAYS_CLICK_DIRECT_VIEW;
	var preload_queue = [];
	var album_background = '#eaeaea';

	var styleStr = '.ujs_osi_view_icon { width: 25px !important; height: 22px !important; position: absolute !important; cursor: pointer !important; z-index: 2147483647 !important; } \n'
	+ '#ujs_preview_album_whole_page_div.hide { display: none !important; } \n'
	+ '#ujs_preview_ablum_settings { width: 100% !important; height: 23px !important; background: black !important; text-align: center !important; box-shadow: 0px 0px 10px black !important; position: fixed !important; top: 0px !important; left: 0px !important; z-index: 1 !important; color: white !important; } \n'
	+ '#ujs_preview_ablum_settings * { color: inherit; float: none !important; font-size: 12px !important; font-weight: normal !important; } \n'
	+ '#ujs_preview_ablum_settings input { display: inline !important; color: black !important; } \n'
	+ '#ujs_preview_ablum_settings input[type="text"] { background-color: white !important; margin: 0px !important; padding: 0px !important; width: auto !important; height: auto !important; } \n'
	+ '#ujs_preview_ablum_settings select { max-width: 100px !important; border: 0px !important; margin: 0px 0px 0px 10px !important; padding: 0px !important; width: auto !important; height: auto !important; display: inline !important; color: black !important; background-color: white !important; } \n'
	+ '#ujs_preview_ablum_settings input[type="button"] { padding: 2px 5px 2px 5px !important; margin: 0px 5px 0px 5px !important; width: auto !important; height: auto !important; background: #ffffff; border: 1px solid !important; border-color: #eeeeee #999999 #999999 #eeeeee !important; } \n'
	+ '#ujs_preview_ablum_page_count>span { display: inline-block !important; margin-left: 3px !important; cursor: pointer !important; border: 1px solid #555555 !important; width: 35px !important; padding: 2px !important; } \n'
	+ '#ujs_preview_ablum_page_count>.current_page { border: 1px solid white !important; } \n'
	+ '#ujs_preview_ablum_preload_info { margin-left: 10px !important; } \n'
	+ '#ujs_preview_ablum_preload_failed_to_load { color: red !important; margin-left: 10px !important; } \n'
	+ '#ujs_preview_album_tables { padding: 0px !important; margin: 0px !important; position: relative !important; transition: top 0.15s ease !important; -o-transition: top 0.15s ease !important; -webkit-transition: top 0.15s ease !important; -moz-transition: top 0.15s ease !important; } \n '
	+ '#ujs_preview_album_tables table { padding: 0px !important; margin: 0px !important; } \n'
	+ '#ujs_preview_album_tables table tr, #ujs_preview_album_tables table tr td { vertical-align: middle !important; text-align: center !important; } \n'
	+ '#ujs_preview_album_tables table>tr>td>a { display: inline-block !important; float: none !important; margin: 0 !important; width: auto !important; height: auto !important; } \n'
	+ '.ujs_preview_album_table * { background-color: transparent !important; border: none !important; } \n'
	+ '.ujs_preview_album_table td{ vertical-align: middle !important; } \n'
	+ '#ujs_preview_ablum_container { width: 98% !important; height: 100% !important; left: 0.5% !important; top: 25px !important; position: fixed !important; overflow: hidden !important; z-index: 0 !important; } \n'
	+ '.ujs_preview_album_text_button { display: inline-block !important; width: auto !important; color: white !important; cursor: pointer !important; } \n'
	+ '.ujs_preview_album_text_button:hover { color: yellow !important; } \n'
	+ '.ujs_osi_dialog_body { padding: 15px !important; background-color: #E8E8E8 !important; border: 2px solid gray !important; box-shadow: 0 0 20px #555555 !important; position: fixed !important; z-index: 2147483647 !important; text-align: left !important; border-radius: 10px !important; } \n'
	+ '#ujs_preview_ablum_url_list_container { left: 50% !important; top: 50% !important; margin: -150px 0px 0px -250px !important;} \n'
	+ '#ujs_preview_ablum_url_list_toolbar { height: 22px !important; } \n'
	+ '#ujs_preview_album_url_list_textarea { width: 500px !important; height: 300px !important; margin-top: 10px !important; border: 1px solid gray !important; background-color: white !important; color: black !important; } \n'
	+ '#ujs_preview_iframe_fetch_request { width: 0px !important; height: 0px !important; visibility: hide !important; position: absolute !important; left: -1px !important; top: -1px !important; } \n'
	+ '#ujs_select_node_tips { position: fixed !important; top: 0px !important; left: 0px !important; background-color: #f3f0a8 !important; color: black !important; padding: 10px !important; text-align: left !important; z-index: 2147483647 !important; } \n'
	+ '.ujs_select_node_hover { outline: red solid 2px !important; } \n'
	+ '#ujs_preview_album_next_page_settings, #ujs_preview_album_next_page_settings * { font-size: 12px !important; line-height: normal !important; color: black !important; text-shadow: none !important; visibility: visible !important; } \n'
	+ '#ujs_preview_album_next_page_settings * { position: static !important; } \n'
	+ '#ujs_preview_album_np_notice { color: red !important; } \n'
	+ '#ujs_preview_album_next_page_settings.hide { display: none !important; } \n'
	+ '#ujs_preview_album_next_page_settings .setting_detail { padding-left: 50px !important; } \n'
	+ '#ujs_preview_album_next_page_settings .ujs_osi_np_label { display: inline-block !important; width: 65px !important; } \n'
	+ '#ujs_preview_album_next_page_iframe_delay { width: 60px !important; height: 18px !important; border: 1px solid gray !important; padding: 2px !important; box-sizing: content-box !important; } \n'
	+ '#ujs_preview_album_next_page_settings .ujs_osi_np_tips { color: gray !important; max-width: 420px !important; display:inline-block !important; } \n'
	+ '#ujs_preview_album_next_page_settings input[type="text"] { border: 1px solid gray !important; padding: 2px !important; background-color: white !important; border-radius: 0px !important; box-shadow: none !important; height: auto !important; } \n'
	+ '#ujs_preview_album_next_page_settings input[type="text"]:not(#ujs_preview_album_next_page_xpath):not(#ujs_preview_album_next_page_xpath2):not(#ujs_preview_album_next_page_url) { width: 350px !important; } \n'
	+ '#ujs_preview_album_next_page_url { width: 400px !important; } \n'
	+ '#ujs_preview_album_next_page_xpath, #ujs_preview_album_next_page_xpath2 { width: 280px !important; } \n'
	+ '.ujs_osi_np_button { border: 1px solid gray !important; padding: 2px !important; cursor: pointer !important; display: inline-block !important; text-align: center !important;  float: none !important; background: none !important; height: auto !important; } \n'
	+ '#ujs_preview_album_toast { padding: 10px; box-shadow: 0px 0px 5px black !important; border-radius: 5px !important; position: fixed !important; bottom: 40px !important; background-color: gray !important; color: white !important; z-index: 2147483647 !important; font-size: 16px !important; } \n'
	+ '.ujs_osi_btn1 { width: 60px !important; margin-left: 5px !important; } \n'
	+ '.ujs_osi_btn2 { width: 100px !important; } \n'
	+ '.ujs_osi_btn3 { height: 20px !important; line-height: 20px !important; } \n'
	+ '.ujs_osi_np_button:hover { background-color: yellow !important; } \n'
	+ '#ujs_preview_album_next_page_settings>#confirm_bar { text-align: center !important; } \n'
	+ '.ujs_osi_sep { height: 1px !important; background-color: #CCCCCC !important; } \n'
	+ '#ujs_preview_album_all_settings { background-color: white !important; float: left !important; margin-right: 10px !important; width: 300px !important; min-height: 88px !important; max-height: 200px !important; padding: 5px !important; color: gray !important; overflow-y: scroll !important; } \n'
	+ '#ujs_preview_album_mgr_tips { width: 420px !important; color: red !important; padding-bottom: 5px !important; } \n'
	+ '#ujs_preview_album_mgr_btns { float: right !important; width: 100px !important; } \n'
	+ '.ujs_osj_vgap { height: 10px !important; } \n'
	+ '.osi_focus_finish { opacity: 0.5 !important; } \n'
	+ '#ujs_preview_album_iframe_page_container { width: ' + ALBUM_PAGE_IFRAME_WIDTH + ' !important; min-width: ' + ALBUM_PAGE_IFRAME_MIN_WIDTH + ' !important; } \n'
	+ '.ujs_osi_radius_btn { border-radius: 99px !important; background-color: white !important; border: 1px solid gray !important; font-size: 13px !important; width: 22px !important; height: 22px !important; line-height: 22px !important; text-align: center !important; padding: 0px !important; display: inline-block !important; cursor: pointer !important; } \n'
	+ '.ujs_osi_radius_btn:hover { background-color: yellow !important; } \n'
	+ '.ujs_osi_radius_close_btn { float: right !important; margin-top: -27px !important; margin-right: -25px !important; box-shadow: 0 0 5px gray !important; background-image: url("' + icon.radius_close + '") !important; } \n'
	+ '#ujs_preview_album_iframe_page { margin-top: 3px !important; border: 1px solid #cccccc !important; } \n'
	+ '#ujs_preview_album_iframe_addr, #ujs_preview_album_iframe_addr:visited { color: #4b90d0 !important; background: none !important; } \n'
	+ '#ujs_preview_album_iframe_addr:hover { color: #53a1e9 !important; }';

	function _addStyle(str){
		if(document.doctype && document.doctype.name == "wml"){
			return;
		}
		var styleObj = _createElement('style');
		styleObj.textContent = str;
		$('head').appendChild(styleObj);
		return styleObj;
	}

	function $(str){
		return document.querySelector(str);
	}

	function $$(str){
		return document.querySelectorAll(str);
	}

	function isVisible(obj){
		var display = obj.style.display || window.getComputedStyle(obj, null).display;
		var visibility = obj.style.visibility || window.getComputedStyle(obj, null).visibility;
		if(display.toLowerCase() == 'none' || visibility.toLowerCase() == 'hidden'){
			return false;
		}
		// Chrome 有的元素会无法获取到宽高，暂时没想到什么好方法
		if(!isChrome && obj.clientWidth == 0 && obj.clientHeight == 0
			&& obj.offsetWidth == 0 && obj.offsetHeight == 0
			&& obj.scrollWidth == 0 && obj.scrollHeight == 0){
			return false;
		}
		if(_tag(obj) != 'html' && obj.parentNode){
			return isVisible(obj.parentNode);
		}
		return true;
	}

	function _tag(obj){
		return obj ? obj.nodeName.toLowerCase() : '';
	}

	function _addClassName(obj, name) {
		if(obj && obj.length){
			var i = 0;
			for(i = 0; i < obj.length; i++){
				if(obj[i].className.indexOf(name) == -1){
					obj[i].className += ' ' + name;
				}
			}
		}
		else if(obj){
			if(obj.className.indexOf(name) == -1){
				obj.className += ' ' + name;
			}
		}
	}

	function _removeClassName(obj, name) {
		if(obj && obj.length){
			var i = 0;
			for(i = 0; i < obj.length; i++){
				if(obj[i].className.indexOf(name) != -1){
					obj[i].className = obj[i].className.replace(' ' + name, '');
				}
			}
		}
		else if(obj){
			if(obj.className.indexOf(name) != -1){
				obj.className = obj.className.replace(' ' + name, '');
			}
		}
	}

	function _createElement(tag, id, classId){
		var obj = document.createElement(tag);
		id && (obj.id = id);
		classId && (obj.className = classId);
		return obj;
	}

	function _removeElement(node, id, classId){
		if(node){
			node.parentNode.removeChild(node);
		}
		
		if(id){
			var obj = $('#' + id);
			if(obj){
				obj.parentNode.removeChild(obj);
			}
		}
		
		if(classId){
			var objs = $$('.' + classId);
			if(objs && objs.length > 0){
				for(var i = 0; i < objs.length; i++){
					objs[i].parentNode.removeChild(objs[i]);
				}
			}
		}
	}
	
	var osi_toast = null;
	var toast_timeout = -1;
	
	function _toast(str){
		if(osi_toast){
			_removeElement(osi_toast);
			osi_toast = null;
			if(toast_timeout > -1){
				clearTimeout(toast_timeout);
			}
		}
		osi_toast = _createElement('span', 'ujs_preview_album_toast');
		osi_toast.textContent = str;
		document.body.appendChild(osi_toast);
		reset_dialog_position(osi_toast);
		toast_timeout = setTimeout(function(){
			_removeElement(osi_toast);
			osi_toast = null;
			toast_timeout = -1;
		}, 1000 * 2);
	}

	/**
	*The two function is copied from os0x's oAutoPagerize
	*/
	function _createHTMLDocumentByString(str) {
		if (document.documentElement.nodeName != 'HTML') {
			return new DOMParser().parseFromString(str, 'application/xhtml+xml');
		}
		var html = String(str);// Thx! jAutoPagerize#HTMLResource.createDocumentFromString http://svn.coderepos.org/share/lang/javascript/userscripts/jautopagerize.user.js
		html = html.replace(/<script(?:[ \t\r\n][^>]*)?>[\S\s]*?<\/script[ \t\r\n]*>|<\/?(?:i?frame|html|script|object)(?:[ \t\r\n][^<>]*)?>/gi, ' ');
		var htmlDoc = _createDocument(html);
		return htmlDoc;
	}
	
	function _createDocument(source) {
		var doc = document.implementation.createHTMLDocument ?
				document.implementation.createHTMLDocument('hogehoge') :
				document.implementation.createDocument(null, 'html', null);
		var range = document.createRange();
		range.selectNodeContents(document.documentElement);
		var fragment = range.createContextualFragment(source);
		var headChildNames = {title: true, meta: true, link: true, script: true, style: true, /*object: true,*/ base: true/*, isindex: true,*/};
		var child, head = doc.createElement('head'), body = doc.createElement('body');
		while ((child = fragment.firstChild)) {
			if (
				(child.nodeType === Node.ELEMENT_NODE && !(_tag(child) in headChildNames)) || 
				(child.nodeType === Node.TEXT_NODE &&/\S/.test(child.nodeValue))
			   )
				break;
			head.appendChild(child);
		}
		body.appendChild(fragment);
		doc.documentElement.appendChild(head);
		doc.documentElement.appendChild(body);
		return doc;
	}
	/* --- copy end --- */

	/* --- for XPath begin --- */	
	function _selectNodes(doc, node, xpath){
		if(!is_undefined(node.selectNodes)){
			return node.selectNodes(xpath);
		}
		else{
			var result = doc.evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			var objs = [];
			for(var i = 0; i < result.snapshotLength; i++){
				objs.push(result.snapshotItem(i));
			}
			return objs;
		}
	}
	
	function _selectSingleNode(doc, node, xpath){
		var result = _selectNodes(doc, node, xpath);
		if(result && result.length > 0){
			return result[0];
		}
		return null;
	}
	
	if(!String.prototype.trim){
		String.prototype.trim = function(){
			var str = this.replace(/^\s*([^\s]*)((\s+[^\s]+)*)\s*$/, '$1$2');
			return str;
		}
	}
	
	function _getElePos(ele, nodeType) {
		var xpath = './' + nodeType;
		if(!ele.parentNode){
			return 0;
		}
		if(ele.id != ''){
			xpath += '[@id="' + ele.id + '"]';
		}
		if(ele.className != ''){
			xpath += '[@class="' + ele.className + '"]';
		}
		var p = _selectNodes(document, ele.parentNode, xpath);
		for(var i = 0; p[i]; i++){
			if(ele == p[i])
				return i+1;
		}
		return 0;
	}
	
	function _getXpathBySeed(curXpath, seed) {
		var xpathStr = curXpath;
		var pos = 0;
		var temp = '';
		if(xpathStr == null || xpathStr == ''){
			temp = _tag(seed);
			if(seed.id != ''){
				temp += '[@id="' + seed.id + '"]';
			}
			if(seed.className != ''){
				temp += '[@class="' + seed.className + '"]';
			}
			pos = _getElePos(seed, _tag(seed));
			if(pos >= 1)
				temp += '[' + pos + ']';
			xpathStr = temp;
		}
		while (_selectNodes(document, document, '//' + xpathStr).length != 1 && _tag(seed) != 'html' && seed.parentNode){
			temp = '';
			seed = seed.parentNode;
			temp = _tag(seed);
			if(seed.id != ''){
				temp += '[@id="' + seed.id + '"]';
			}
			if(seed.className != ''){
				temp += '[@class="' + seed.className + '"]';
			}
			pos = _getElePos(seed, _tag(seed));
			if(pos >= 1)
				temp += '[' + pos + ']';
			xpathStr = temp + '/' + xpathStr;
		}
		xpathStr = '//' + xpathStr;
		return xpathStr;
	}
	
	function _getNextXpath(ele) {
		var temp = ele;
		var isTextLink = false;
		var xpathStr = '';
		var pos = 0;

		if(ele.textContent != ''){
			isTextLink = true;
		}
		//check the selection whether it is a link or not
		while(_tag(temp) != 'a' && temp.parentNode){
			temp = temp.parentNode;
		}
		if(_tag(temp) != 'a'){
			return;
		}
		if(isTextLink){//if the link is a text link
			xpathStr = 'text()="' + ele.textContent + '"';
			var not_a_pure_link = false;
			if(_tag(ele) != 'a'){
				not_a_pure_link = true;
			}
			else{
				var childs = ele.childNodes;
				if(childs.length > 1){
					var i = 0, oldXpathStr = xpathStr;
					xpathStr = '';
					for(i = 0; i < childs.length; i++){
						if(childs[i].textContent && !xpathStr){
							xpathStr = 'text()="' + childs[i].textContent + '"';
						}
						if(_tag(childs[i]) != '#text'){
							not_a_pure_link = true;
						}
					}
					xpathStr = xpathStr ? xpathStr : oldXpathStr;
				}
			}
			if(not_a_pure_link){
				xpathStr = 'descendant-or-self::*[' + xpathStr + ']';
				xpathStr = 'a[' + xpathStr + ']';
			}
			else{
				xpathStr = 'a[' + xpathStr + ']';
			}
		}
		else{//the link is a image link
			//find the link position in DOM
			ele = temp;
			pos = _getElePos(ele, 'a');
			if(_selectNodes(document, ele, './img').length > 0){
				xpathStr = 'a[child::img[contains(@src, "' + _selectSingleNode(document, ele, './img').src.match(/([^\/]*\.(gif|jpg|jpeg|png|bmp))$/i)[1] + '")]]';
			}
			else if(pos >= 1){
				xpathStr = 'a[' + pos + ']';
			}
		}
		//get the final xpath
		xpathStr = _getXpathBySeed(xpathStr, ele);
		
		return xpathStr;
	};
	/* --- for XPath end --- */

	function get_default_filter_size () {
		var w = 0, h = 0;
		for(var i = 0; i < ALBUM_FILTER.length; i++){
			if(ALBUM_FILTER[i][2]){
				w = ALBUM_FILTER[i][0];
				h = ALBUM_FILTER[i][1];
			}
		}
		return {
			width: w,
			height: h
		}
	}

	function create_preview_album_setting_bar () {
		album_settings = _createElement('div', 'ujs_preview_ablum_settings');
		var str_filter = '', str_size = '', default_filter_w = 0, default_filter_h = 0;
		for(var i = 0; i < ALBUM_FILTER.length; i++){
			str_filter += '<option value="' + ALBUM_FILTER[i][0] + 'x' + ALBUM_FILTER[i][1] + '"' + (ALBUM_FILTER[i][2] ? ' selected="selected"' : '') + '>' + ALBUM_FILTER[i][0] + ' x ' + ALBUM_FILTER[i][1] + '</option>\r\n';
			if(ALBUM_FILTER[i][2]){
				default_filter_w = ALBUM_FILTER[i][0];
				default_filter_h = ALBUM_FILTER[i][1];
			}
		}
		for(var i = 0; i < ALBUM_GRID_SIZE.length; i++){
			str_size += '<option value="' + ALBUM_GRID_SIZE[i][0] + 'x' + ALBUM_GRID_SIZE[i][1] + '"' + (ALBUM_GRID_SIZE[i][2] ? ' selected="selected"' : '') + '>' + ALBUM_GRID_SIZE[i][0] + ' x ' + ALBUM_GRID_SIZE[i][1] + '</option>\r\n';
			album_row = ALBUM_GRID_SIZE[i][2] ? ALBUM_GRID_SIZE[i][0] : album_row;
			album_col = ALBUM_GRID_SIZE[i][2] ? ALBUM_GRID_SIZE[i][1] : album_col;
		}
		album_settings.innerHTML = 
		'<span id="ujs_preview_ablum_page_count"></span>' +
		'<span id="ujs_preview_album_normal_container">' +
			'<select id="ujs_preview_ablum_filter_selections">' +
				'<option value="0x0">全部显示</option>' +
				str_filter +
				'<option value="99999x99999">只显示预读</option>' +
			'</select>' +
			'<span style="margin-left: 10px;">' + 
				'面积小于 ' +
				'<input id="ujs_preview_ablum_setting_width" type="text" size="5" value="' + default_filter_w + '">' +
				' X ' +
				'<input id="ujs_preview_ablum_setting_height" type="text" size="5" value="' + default_filter_h + '">' + 
				' 的被 ' + 
				'<input id="ujs_preview_ablum_settings_go" type="button" value="过滤" title="链接着大图的除外">' + 
				' 宫格：' +
				'<select id="ujs_preview_ablum_grid_selections">' +
					str_size +
				'</select>' +
			'</span>' +
			'<span id="ujs_preview_ablum_preload_info">' +
				'<span id="ujs_preview_ablum_preload_completed_num"></span>' +
				' / ' +
				'<span id="ujs_preview_ablum_preload_need_to_load_num"></span>' +
				' 已预读' +
				'<span id="ujs_preview_ablum_preload_failed_to_load">（<span class="num"></span> 失败）</span>' +
			'</span>' +
			'<span id="ujs_preview_album_url_list" class="ujs_preview_album_text_button">URL 列表</span>' +
			'<span> | </span>' +
			'<span id="ujs_preview_album_next_page_setting" class="ujs_preview_album_text_button">下一页设置</span>' +
			'<span> | </span>' +
			'<span id="ujs_preview_ablum_close" class="ujs_preview_album_text_button">关闭</span>' +
		'</span>';
	}
	
	function create_preview_album_confirm (okFunc, cancelFunc) {
		var normal_container = $('#ujs_preview_album_normal_container') || null;
		if(normal_container == null){
			return;
		}
		normal_container.style.display = 'none';
		if(album_confirm == null){
			album_confirm = _createElement('span', 'ujs_preview_ablum_settings_confirm');
			album_confirm.innerHTML =
			'<input id="ujs_preview_album_confirm_ok" type="button" value="确定">' +
			'<input id="ujs_preview_album_confirm_cancel" type="button" value="取消">' +
			'<input id="ujs_preview_album_select_none" type="button" value="全部取消" style="float: right !important;">' +
			'<input id="ujs_preview_album_select_all" type="button" value="全选" style="float: right !important;">';
			normal_container.parentNode.insertBefore(album_confirm, normal_container);
			$('#ujs_preview_album_confirm_ok').addEventListener('click', okFunc, false);
			$('#ujs_preview_album_confirm_cancel').addEventListener('click', cancelFunc, false);
			$('#ujs_preview_album_select_all').addEventListener('click', preview_album_select_mode_select_all, false);
			$('#ujs_preview_album_select_none').addEventListener('click', preview_album_select_mode_select_none, false);
		}
	}
	
	function destroy_preview_album_confirm () {
		var normal_container = $('#ujs_preview_album_normal_container') || null;
		if(normal_container != null){
			normal_container.style.display = 'inline';
		}
		if(album_confirm != null){
			_removeElement(album_confirm);
			album_confirm = null;
		}
	}
	
	function preview_album_select_mode_click_hdlr (e) {
		if(e.button != 0){
			return;
		}
		var img = e.target;
		var obj = _selectNodes(document, img, 'ancestor-or-self::a');
		if(obj.length > 0){
			_StopEvent(e);
		}
		if(_tag(img) != 'img'){
			return;
		}
		if(img.className && img.className.indexOf('current') != -1){
			_removeClassName(img, 'current');
		}
		else{
			_addClassName(img, 'current');
		}
	}
	
	function preview_album_select_mode_select_all () {
		var imgs = $$('#ujs_preview_album_tables img');
		_addClassName(imgs, 'current');
	}
	
	function preview_album_select_mode_select_none () {
		var imgs = $$('#ujs_preview_album_tables img');
		_removeClassName(imgs, 'current');
	}
	
	function preview_album_entry_select_mode (finishFunc) {
		album_in_select_mode = true;
		preview_album_select_mode_select_all();
		create_preview_album_confirm(finishFunc, preview_album_exit_select_mode);
		window.addEventListener('click', preview_album_select_mode_click_hdlr, true);
	}
	
	function preview_album_exit_select_mode (){
		album_in_select_mode = false;
		destroy_preview_album_confirm();
		preview_album_select_mode_select_none();
		if(curr_index > 0){
			preview_album_hightlight_photo(curr_index, false);
		}
		window.removeEventListener('click', preview_album_select_mode_click_hdlr, true);
	}
	
	function preview_album_close_url_list_dialog (ev) {
		var bg = $('#ujs_preview_ablum_url_list_bg');
		if(bg){
			_removeElement(bg);
		}
		var dialog = $('#ujs_preview_ablum_url_list_container');
		if(dialog){
			_removeElement(dialog);
		}
		preview_album_exit_select_mode();
	}
	
	function preview_album_show_url_list (input, count) {
		var url_list_page_bg = create_whole_page_div('black', BACKGROUND_OPACITY, 'ujs_preview_ablum_url_list_bg');
		var list_container = _createElement('div', 'ujs_preview_ablum_url_list_container', 'ujs_osi_dialog_body');
		list_container.innerHTML =
		'<div id="ujs_preview_ablum_url_list_toolbar">请手动复制下列地址到下载工具中（共 ' + count + ' 个）</div>' +
		'<textarea id="ujs_preview_album_url_list_textarea">' + input + '</textarea>';
		document.body.appendChild(url_list_page_bg);
		document.body.appendChild(list_container);
		var close_btn = _createElement('span', null, 'ujs_osi_radius_btn ujs_osi_radius_close_btn');
		close_btn.addEventListener('click', preview_album_close_url_list_dialog, false);
		$('#ujs_preview_ablum_url_list_toolbar').appendChild(close_btn);
		$('#ujs_preview_album_url_list_textarea').select();
		if(CLICK_BLANK_TO_CLOSE){
			url_list_page_bg.addEventListener('click', preview_album_close_url_list_dialog, false);
		}
	}
	
	function preview_album_get_url_list_finish_callback () {
		var imgs = $$('#ujs_preview_album_tables img');
		var output = '', count = 0;;
		for(var i = 0; i < imgs.length; i++){
			if(imgs[i].className && imgs[i].className.indexOf('current') != -1){
				var link = curr_album_source[i].ohref || curr_album_source[i].href;
				output += link + '\r\n';
				count++;
			}
		}
		preview_album_show_url_list(output, count);
	}
	
	function preview_album_get_url_list () {
		preview_album_entry_select_mode(preview_album_get_url_list_finish_callback);
	}

	function preview_setting_go () {
		preview_album_jump_to_page(0);
		curr_album_source = filter_album_source(album_source);
		preview_album_clear_photos();
		preview_album_set_photos(curr_album_source);
		preview_album_start_preload(curr_album_source);
	}

	function preview_setting_filter_select (ev) {
		var index = this.selectedIndex;
		var value = this.options[index].value.split('x');
		var width = value[0], height = value[1];
		$('#ujs_preview_ablum_setting_width').value = width;
		$('#ujs_preview_ablum_setting_height').value = height;
		preview_setting_go();
	}

	function preview_setting_grid_select (ev) {
		var index = this.selectedIndex;
		var value = this.options[index].value.split('x');
		album_row = value[0];
		album_col = value[1];
		preview_setting_go();
	}

	function preview_album_scroll_to (obj, toHere) {
		var to_here = toHere, dir = 'none';
		var last_table_height = 0;
		var last_table = $('#ujs_preview_album_tables>table:last-child');
		var img_count = last_table.getElementsByTagName('a').length;
		var last_table_visible_rows = Math.ceil(img_count / album_col);
		last_table_height = (last_table.offsetHeight / album_row) * last_table_visible_rows;
		
		var limit_y = -($('#ujs_preview_album_tables').offsetHeight - 2 * last_table.offsetHeight + last_table_height);
		to_here = (to_here < limit_y) ? limit_y : to_here;
		to_here = (to_here > 0) ? 0 : to_here;
		dir = (to_here > parseInt(obj.style.top)) ? 'up' : 'down';
		obj.style.top = to_here + 'px';
		
		var f = dir == 'up' ? Math.ceil : Math.floor;
		var current_page = f(Math.abs(to_here) / $('#ujs_preview_album_tables>table').offsetHeight);
		if(to_here == limit_y){
			current_page = $$('#ujs_preview_album_tables>table').length - 1;
		}
		var indSpan = $('#ujs_preview_ablum_page_count>span:nth-child(' + (current_page + 1) + ')');
		if(indSpan){
			_removeClassName($$('#ujs_preview_ablum_page_count>span'), 'current_page');
			_addClassName(indSpan, 'current_page');
		}
		else{
			var select = $('#ujs_preview_ablum_page_count>select');
			if(select){
				select.selectedIndex = current_page;
			}
		}
	}
	
	function preview_album_get_curr_page_index(){
		try{
			return (parseInt($('#ujs_preview_ablum_page_count>.current_page').textContent) - 1);
		}
		catch(e){
		}
		
		try{
			return $('#ujs_preview_ablum_page_count>select').selectedIndex;
		}
		catch(e){
		}
		
		return -1;
	}

	function preview_album_scroll_hdlr (ev) {
		if($$('#ujs_preview_album_tables table').length <= 1){
			return;
		}
		var val = getWheelDir(ev);
		_StopEvent(ev);
		if(album_scroll_lock){
			return;
		}
		var curr_page_index = preview_album_get_curr_page_index() + 1;
		if(curr_page_index > 0){
			var to_page_index = val > 0 ? curr_page_index - 2 : curr_page_index;
			preview_album_jump_to_page(to_page_index);
			album_scroll_lock = true;
			setTimeout(function () { album_scroll_lock = false; }, 150);
		}
	}

	function preview_album_jump_to_page (index) {
		var table = $('#ujs_preview_album_tables>table');
		if(table){
			var toHere = 0 - table.offsetHeight * index;
			preview_album_scroll_to($('#ujs_preview_album_tables'), toHere);
		}
	}

	function preview_album_jump_to_page_by_click (ev){
		var obj = ev.target;
		if(_tag(obj) == 'span'){
			preview_album_jump_to_page( parseInt(obj.textContent) - 1 );
		}
	}

	function preview_album_table_click_hdlr (ev) {
		if(album_in_select_mode){
			return;
		}
		curr_index = -1;
		preview_album_hightlight_photo(curr_index, true);
	}
	
	var select_node_tips = '<strong>按 <font color="red">W</font> 扩大选区，按 <font color="red">N</font> 缩小选区</strong><br /><br /><strong>当前节点：</strong>Tag : [n]，ID：[i]，Class：[c]<br /><br /><strong>下一页 XPath：</strong>[x]';
	var selected_node_stack = [];
	var curr_selected_node = null;
	var select_node_flag = false;
	
	function select_node_highlight_element(node){
		if(node == $('#ujs_select_node_tips')){
			return;
		}
		if($('.ujs_select_node_hover')){
			_removeClassName($('.ujs_select_node_hover'), 'ujs_select_node_hover');
		}
		curr_selected_node = node;
		_addClassName(node, 'ujs_select_node_hover');
		select_node_update_tips(_tag(node), node.id, node.className.replace(/ ?ujs_select_node_hover/, ''));
	}
	
	function select_node_element_hover_hdlr(e){
		selected_node_stack = [];
		select_node_highlight_element(e.target);
	}
	
	function select_node_update_tips(node, id, className){
		if($('#ujs_select_node_tips')){
			id = id ? id : 'null';
			className = className ? className : 'null';
			var xpath = _getNextXpath(curr_selected_node);
			xpath = xpath ? xpath.replace(/\&/g, '&amp;').replace(/\"/g, '&quot;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;') : xpath;
			$('#ujs_select_node_tips').innerHTML = select_node_tips.replace('[n]', node).replace('[i]', id).replace('[c]', className).replace('[x]', xpath ? xpath : '该元素不是链接，不符合规则');
		}
	}
	
	function select_node_create_tips(){
		var span = document.createElement('span');
		span.innerHTML = select_node_tips.replace('[n]', 'null').replace('[i]', 'null').replace('[c]', 'null').replace('[x]', 'null');
		span.id = 'ujs_select_node_tips';
		document.body.appendChild(span);
	}
	
	function select_node_click_hdlr(e){
		_StopEvent(e);
		select_node_finish(false);

		e.stopPropagation();
		e.preventDefault();
	}
	
	function select_node_begin(){
		if(select_node_flag == false){
			select_node_flag = true;
			select_node_create_tips();
			window.addEventListener('mouseover', select_node_element_hover_hdlr, false);
			window.addEventListener('click', select_node_click_hdlr, true);
			_addClassName(next_page_settings_dialog, 'hide');
			_addClassName($('#ujs_preview_album_whole_page_div'), 'hide');
		}
	}
	
	var select_which_xpath = 0;
	
	function select_node_finish(force_finish){
		if(select_node_flag){
			var xpath = _getNextXpath(curr_selected_node);
			if(xpath || force_finish){
				select_node_flag = false;
				_removeElement(null, 'ujs_select_node_tips');
				window.removeEventListener('mouseover', select_node_element_hover_hdlr, false);
				window.removeEventListener('click', select_node_click_hdlr, true);
				if($('.ujs_select_node_hover')){
					_removeClassName($('.ujs_select_node_hover'), 'ujs_select_node_hover');
				}
				selected_node_stack = [];
				curr_selected_node = null;
				
				_removeClassName(next_page_settings_dialog, 'hide');
				_removeClassName($('#ujs_preview_album_whole_page_div'), 'hide');
				if(next_page_settings_dialog){
					$$('#ujs_preview_album_next_page_settings input[name="fetch_mode"]')[1].checked = true;
				}
				
				var which = (select_which_xpath == 0) ? '' : '2';
				if($('#ujs_preview_album_next_page_xpath' + which) && xpath){
					$('#ujs_preview_album_next_page_xpath' + which).value = xpath;
				}
			}
		}
	}
	
	/* --- for storage begin --- */
	function _cookie_set(key, value, expiredays) {
		var exdate=new Date();
		exdate.setDate(exdate.getDate()+expiredays);
		var cookieStr = key+ "=" + value +
			((expiredays==null) ? "" : ";expires="+exdate.toGMTString()) + ';path=/';
		if(cookieStr.length + document.cookie.length > 1024 * 4){
			//full
			_toast('该站点 Cookie 空间不足');
			return false;
		}
		else{
			document.cookie = cookieStr;
		}
	};
	
	function cookie_set(key, value) {
		const DAYS = 365 * 10; // for 10 years -.-!
		return _cookie_set(key, value, DAYS);
	}
	
	function cookie_get(key) {
		var value = '';
		if (document.cookie.length>0){
			c_start=document.cookie.indexOf(key + "=");
			if (c_start!=-1){
				c_start=c_start + key.length+1;
				c_end=document.cookie.indexOf(";",c_start);
				if (c_end==-1) c_end=document.cookie.length;
				value = document.cookie.substring(c_start,c_end);
			}
		}
		return value;
	}
	
	function cookie_del(key) {
		_cookie_set(key, '', 0);
	}
	
	function isCookieSupport(){
		return navigator.cookieEnabled;
	}
	
	const GLOBAL_STORAGE_NOT_SUPPORT = 'global storage not support';
	
	function isGlobalStorageSupport(){
		try{
			if(window.opera){
				var storage = window.opera.scriptStorage;
				if(!is_undefined(storage)){
					storage.setItem('ujs_osi_test', 'just_test');
					var value = storage.getItem('ujs_osi_test');
					if(value == 'just_test'){
						storage.removeItem('ujs_osi_test');
						return 'opera script storage';
					}
				}
				return GLOBAL_STORAGE_NOT_SUPPORT;
			}
			else{
				var ret = !is_undefined(GM_setValue);
				if(ret){
					// Check the function
					GM_setValue('ujs_osi_test', 'just_test');
					var value = GM_getValue('ujs_osi_test');
					if(value == 'just_test'){
						GM_setValue('ujs_osi_test', '');
						return 'GM storage';
					}
				}
				return GLOBAL_STORAGE_NOT_SUPPORT;
			}
		}
		catch(e){
			return GLOBAL_STORAGE_NOT_SUPPORT;
		}
	}
	
	var next_page_settings_dialog = null;
	var next_page_manager_dialog = null;
	
	//const _tag_storage = 'ujs_original_size_image_next_page';
	const _tag_storage = 'ujs_osi_np';
	
	var global_data = {
		urlArray: [], // for matching the page url
		xpathArray: [], // the matched page xpath
		xpathArray2: [], // the matched page xpath2
		ruleArray: [], // for matching the page url
		fetchArray: [], // auto or xpath or rule
		reqArray: [], // xhr or iframe mode
	};
	
	var old_url = null;
	var curr_url = null;
	var curr_xpath = null;
	var curr_xpath2 = null;
	var curr_rule = null;
	var curr_req_mode = 0;
	var curr_fetch_mode = 0;
	
	function cleanGlobalData(){
		global_data.urlArray = [];
		global_data.xpathArray = [];
		global_data.xpathArray2 = [];
		global_data.ruleArray = [];
		global_data.fetchArray = [];
		global_data.reqArray = [];
	}
	
	function addGlobalData(url, xpath, xpath2, rule, fetch, req){
		global_data.urlArray.push(url);
		global_data.xpathArray.push(xpath);
		global_data.xpathArray2.push(xpath2);
		global_data.ruleArray.push(rule);
		global_data.fetchArray.push(fetch);
		global_data.reqArray.push(req);
	}
	
	function setGlobalData(index, url, xpath, xpath2, rule, fetch, req){
		global_data.urlArray[index] = url;
		global_data.xpathArray[index] = xpath;
		global_data.xpathArray2[index] = xpath2;
		global_data.ruleArray[index] = rule;
		global_data.fetchArray[index] = fetch;
		global_data.reqArray[index] = req;
	}
	
	function deleteGlobalData(index){
		global_data.urlArray.splice(index, 1);
		global_data.xpathArray.splice(index, 1);
		global_data.xpathArray2.splice(index, 1);
		global_data.ruleArray.splice(index, 1);
		global_data.fetchArray.splice(index, 1);
		global_data.reqArray.splice(index, 1);
	}
	
	function resetCurrNextPageState(){
		curr_url = null;
		curr_xpath = null;
		curr_xpath2 = null;
		curr_rule = null;
		curr_req_mode = 0;
		curr_fetch_mode = 0;
	}
	
	function checkNextPageGlobalDataAvailable(){
		function __isOk(array, len){
			if(!array || is_undefined(array.length)){
				return false;
			}
			if(array.length != len){
				return false;
			}
			return true;
		}
		
		var ret = true;
		var len = 0;
		do{
			if(!global_data.urlArray || is_undefined(global_data.urlArray.length)){
				ret = false;
				break;
			}
			len = global_data.urlArray.length;
			if(__isOk(global_data.xpathArray, len) == false){
				ret = false;
				break;
			}
			if(__isOk(global_data.xpathArray2, len) == false){
				ret = false;
				break;
			}
			if(__isOk(global_data.ruleArray, len) == false){
				ret = false;
				break;
			}
			if(__isOk(global_data.fetchArray, len) == false){
				ret = false;
				break;
			}
			if(__isOk(global_data.reqArray, len) == false){
				ret = false;
				break;
			}
		}while(false);
		if(ret == false){
			cleanGlobalData();
			return false;
		}
		return true;
	}

	function saveNextPageGlobalData(){
		var value = encodeURI(json.stringify(global_data));
		var isEmpty = global_data.urlArray.length == 0;
		
		if(isGlobalStorageSupport() == 'opera script storage'){
			var storage = window.opera.scriptStorage;
			if(isEmpty){
				storage.removeItem(_tag_storage);
			}
			else{
				storage.setItem(_tag_storage, value);
			}
		}
		else if(isGlobalStorageSupport() == 'GM storage'){
			GM_setValue(_tag_storage, value);
		}
		else if(isGlobalStorageSupport() == GLOBAL_STORAGE_NOT_SUPPORT){
			// your browser do not support global storage
			// use cookie first, because cookie can save data in path "/" to cross sub domain
			if(isCookieSupport()){
				if(isEmpty) {
					cookie_del(_tag_storage);
				}
				else{
					cookie_set(_tag_storage, value);
				}
			}
			else if(!is_undefined(window.localStorage)){
			// use localStorage, localStorage can not cross domain nor sub domain
				if(isEmpty){
					localStorage.removeItem(_tag_storage);
				}
				else{
					localStorage.setItem(_tag_storage, value);
				}
			}
		}
	}
	
	function getNextPageGlobalData(){
		var value = null;
		var ret = false;
		
		if(isGlobalStorageSupport() == 'opera script storage'){
			value = window.opera.scriptStorage.getItem(_tag_storage);
		}
		else if(isGlobalStorageSupport() == 'GM storage'){
			value = GM_getValue(_tag_storage);
		}
		else if(isGlobalStorageSupport() == GLOBAL_STORAGE_NOT_SUPPORT){
			// your browser do not support global storage
			// use cookie first, because cookie can save data in path "/" to cross sub domain
			if(isCookieSupport()){
				value = cookie_get(_tag_storage);
			}
			else if(!is_undefined(window.localStorage)){
			// use localStorage, localStorage can not cross domain nor sub domain
				value = localStorage.getItem(_tag_storage);
			}
		}

		if(value){
			value = json.parse(decodeURI(value));
			global_data = value;
		}
		else{
			cleanGlobalData();
			resetCurrNextPageState();
		}
		checkNextPageGlobalDataAvailable();
	}
	
	function _getRadioIndex(group){
		for(var i = 0; i < group.length; i++){
			if(group[i].checked){
				return i;
			}
		}
		return -1;
	}
	
	function _isStringInArray(array, str){
		for(var i = 0; i < array.length; i++){
			if(str == array[i]){
				return i;
			}
		}
		return -1;
	}

	function toUnicodeStr(str){
		var result = '_';
		for(var i = 0; i < str.length; i++){
			result += str.charCodeAt(i) + '_';
		}
		return result;
	}
	
	function _isStringMatch(rule, str){
		var _rule = rule.trim();
		if(_rule.indexOf('[reg]') == 0){ // 用户自己使用正则表达式匹配
			_rule = _rule.replace('[reg]', '').replace(/\\/g, '\\\\').trim();
			var reg = new RegExp(_rule);
			return reg.test(str);
		}
		else{
			var part = _rule.split('*');
			for(var i = 0; i < part.length; i++){
				if(part[i] != ''){
					part[i] = toUnicodeStr(part[i]);
				}
			}
			_rule = part.join('.*?');
			var reg = new RegExp('^' + _rule + '$');
			return reg.test(toUnicodeStr(str));
		}
	}
	
	function saveNextPageSettings(){
		var save_flag = false; // 用于检查用户设置是否完整，完整才保存
		
		var fetch_mode = _getRadioIndex($$('#ujs_preview_album_next_page_settings input[name="fetch_mode"]'));
		var req_mode = _getRadioIndex($$('#ujs_preview_album_next_page_settings input[name="req_mode"]'));
		var delay = $('#ujs_preview_album_next_page_iframe_delay').value.trim();
		if(delay == ''){
			delay = '0';
		}
		if(req_mode == 1){
			req_mode = parseInt('' + req_mode + delay);
		}
		var url = null, xpath = null, xpath2 = null, rule = null;
		url = $('#ujs_preview_album_next_page_url').value.trim();
		xpath = $('#ujs_preview_album_next_page_xpath').value.trim();
		xpath2 = $('#ujs_preview_album_next_page_xpath2').value.trim();
		rule = $('#ujs_preview_album_next_page_rule').value.trim();
		if(fetch_mode >= 0 && req_mode >= 0 && url && _isStringMatch(url, window.location.href)){
			switch(fetch_mode){
			case 0:
				save_flag = true;
				break;
			case 1:
				if(xpath){
					save_flag = true;
				}
				break;
			case 2:
				if(rule){
					save_flag = true;
				}
				break;
			}
		}

		if(save_flag == true){
			var index  = _isStringInArray(global_data.urlArray, url);
			if(index >= 0){ // is already in array
				setGlobalData(index, url, xpath, xpath2, rule, fetch_mode, req_mode);
			}
			else{
				addGlobalData(url, xpath, xpath2, rule, fetch_mode, req_mode);
			}
			if(old_url && old_url != url){
				var old_index = _isStringInArray(global_data.urlArray, old_url);
				if(old_index >= 0){
					deleteGlobalData(old_index);
				}
			}
			saveNextPageGlobalData();
			getNextPageSettings();
			return true;
		}
		return false;
	}
	
	function deleteNextPageSettings(url){
		var index = _isStringInArray(global_data.urlArray, url);
		if(index >= 0){
			deleteGlobalData(index);
		}
		saveNextPageGlobalData();
		getNextPageSettings();
	}
	
	function clearNextPageSettings(){
		cleanGlobalData();
		saveNextPageGlobalData();
		getNextPageSettings();
	}
	
	function getNextPageSettings(){
		getNextPageGlobalData();
		// check the current url
		var i = 0;
		var find = false;
		for(; i < global_data.urlArray.length; i++){
			var url = global_data.urlArray[i];
			var href = window.location.href;
			if(_isStringMatch(url, href)){
				find = true;
				break;
			}
		}
		if(find){
			curr_url = global_data.urlArray[i];
			curr_xpath = global_data.xpathArray[i];
			curr_xpath2 = global_data.xpathArray2[i];
			curr_rule = global_data.ruleArray[i];
			curr_req_mode = global_data.reqArray[i];
			curr_fetch_mode = global_data.fetchArray[i];
		}
		else{
			resetCurrNextPageState();
		}
	}
	/* --- for storage end ---*/
	
	function preview_album_save_next_page_settings(){
		var ret = saveNextPageSettings();
		if(ret == false){
			alert('适用网址有误或数据不完整');
		}
		else{
			preview_album_close_next_page_settings();
		}
	}
	
	function preview_album_delete_next_page_settings(){
		var ret = confirm('是否删除应用于\n' + curr_url + '\n的设置？');
		if(ret == true){
			deleteNextPageSettings(curr_url);
			preview_album_close_next_page_settings();
		}
	}
	
	function preview_album_manager_clear_click_hdlr(){
		if(global_data.urlArray.length > 0){
			var ret = confirm('是否清除所有的站点设置？');
			if(ret){
				clearNextPageSettings();
				preview_album_load_next_page_manager_list();
			}
		}
	}
	
	function preview_album_manager_delete_click_hdlr(){
		var count = 0;
		var urls = [];
		var checkboxs = $$('#ujs_preview_album_all_settings input[type="checkbox"]');
		if(checkboxs && checkboxs.length > 0){
			var i = 0;
			for(; i < checkboxs.length; i++){
				if(checkboxs[i].checked){
					urls.push(global_data.urlArray[i]);
					count++;
				}
			}
			if(count > 0){
				var ret = confirm('是否删除这 ' + count + ' 项站点设置？');
				if(ret == true){
					for(i = 0; i < urls.length; i++){
						deleteNextPageSettings(urls[i]);
					}
					preview_album_load_next_page_manager_list();
				}
			}
			else{
				alert('请在左边勾选需要删除的站点设置');
			}
		}
	}
	
	function reset_dialog_position(dialog, vCenter){
		var width = dialog.clientWidth;
		var height = dialog.clientHeight;
		var left = (viewWidth - width) / 2;
		var top = (viewHeight - height) / 2;
		
		dialog.style.left = left + 'px';
		if(vCenter){
			dialog.style.top = top + 'px';
		}
	}
	
	function preview_album_manager_next_page_show_settings(){
		if(next_page_manager_dialog == null){
			next_page_manager_dialog = _createElement('div', null, 'ujs_osi_dialog_body');
			next_page_manager_dialog.innerHTML = '' +
				'<div id="ujs_preview_album_mgr_tips"></div>' +
				'<span id="ujs_preview_album_all_settings">' +
				'</span>' +
				'<span id="ujs_preview_album_mgr_btns">' +
					'<span class="ujs_osi_np_button ujs_osi_btn2 ujs_osi_btn3" id="ujs_preview_album_next_page_mgr_clear">清除</span><br />' +
					'<div class="ujs_osj_vgap"></div>' +
					'<span class="ujs_osi_np_button ujs_osi_btn2 ujs_osi_btn3" id="ujs_preview_album_next_page_mgr_delete">删除</span><br />' +
					'<div class="ujs_osj_vgap"></div>' +
					'<span class="ujs_osi_np_button ujs_osi_btn2 ujs_osi_btn3" id="ujs_preview_album_next_page_mgr_close">关闭</span>' +
				'</span>';
			document.body.appendChild(next_page_manager_dialog);
			var method = '';
			if(isGlobalStorageSupport() == GLOBAL_STORAGE_NOT_SUPPORT && isCookieSupport()){
				method = 'Cookie';
			}
			else if(isGlobalStorageSupport() == GLOBAL_STORAGE_NOT_SUPPORT && !isCookieSupport()){
				method = 'Localstorage';
			}
			if(method != ''){
				$('#ujs_preview_album_mgr_tips').innerHTML = '您正使用 ' + method + ' 存取数据，无法列出所有站点设置。请在浏览器内的管理界面中进行删除，关键字 ujs_osi_np';
			}
			
			preview_album_load_next_page_manager_list();
			
			$('#ujs_preview_album_next_page_mgr_close').addEventListener('click', preview_album_manager_next_page_close_settings, false);
			$('#ujs_preview_album_next_page_mgr_delete').addEventListener('click', preview_album_manager_delete_click_hdlr, false);
			$('#ujs_preview_album_next_page_mgr_clear').addEventListener('click', preview_album_manager_clear_click_hdlr, false);
		}
	}
	
	function preview_album_load_next_page_manager_list(){
		var container = $('#ujs_preview_album_all_settings');
		if(container){
			var count = global_data.urlArray.length;
			var htmlStr = '';
			for(var i = 0; i < count; i++){
				htmlStr += '<input type="checkbox" /> ' + global_data.urlArray[i] + '<br />';
			}
			if(htmlStr == ''){
				htmlStr = '无设置';
			}
			container.innerHTML = htmlStr;
			reset_dialog_position(next_page_manager_dialog, true);
		}
	}
	
	function preview_album_manager_next_page_close_settings(){
		if(next_page_manager_dialog){
			_removeElement(next_page_manager_dialog);
			next_page_manager_dialog = null;
		}
	}
	
	function preview_album_get_next_page_xpath(){
		select_node_begin();
	}
	
	function preview_album_show_next_page_settings () {
		if(next_page_settings_dialog == null){
			next_page_settings_dialog = _createElement('div', 'ujs_preview_album_next_page_settings', 'ujs_osi_dialog_body');
			next_page_settings_dialog.innerHTML = '' +
				'<span id="ujs_preview_album_np_notice"></span>' +
				'<span class="ujs_osi_np_label">适用网址</span><input type="text" id="ujs_preview_album_next_page_url" /><br />' +
				'<span class="ujs_osi_np_tips">可使用 * 通配符，例：*.example.com*<br />' +
				'如需正则表达式，请在开始处添加 [reg]，例：[reg] .*example\\.com.*</span><br /><br />' +
				'<div class="ujs_osi_sep"></div><br />' +
				'<input type="radio" name="fetch_mode" checked="checked" /> 手气不错，脚本自动获取下一页链接，无需手动设置<br /><br />' +
				'<input type="radio" name="fetch_mode" /> 手动获取页面下一页链接，使用 XPath 定位<br /><br />' +
					'<div class="setting_detail">' +
						'<span class="ujs_osi_np_label">XPath</span><input type="text" id="ujs_preview_album_next_page_xpath" /><span class="ujs_osi_np_button ujs_osi_btn1" id="ujs_preview_album_next_page_xpath_btn">点击获取</span><br /><br />' +
						'<span class="ujs_osi_np_label">XPath 2</span><input type="text" id="ujs_preview_album_next_page_xpath2" /><span class="ujs_osi_np_button ujs_osi_btn1" id="ujs_preview_album_next_page_xpath_btn2">点击获取</span><br />' +
						'<span class="ujs_osi_np_tips">当第一个 XPath 无法获取到链接时，则使用该 XPath 2 获取，可留空。一般用于章节切换，如漫画看完一话后可根据 XPath 2 切换到下一话' +
						'</span>' +
					'</div><br />' +
				'<input type="radio" name="fetch_mode" /> 自定义下一页链接的 URL 规则<br /><br />' +
					'<div class="setting_detail">' +
						'<span class="ujs_osi_np_label">URL 规则</span><input type="text" id="ujs_preview_album_next_page_rule" /><br />' +
						'<span class="ujs_osi_np_tips">规则遵循该格式：[+]text1[n=x, y(, z)]text2<br />' +
						'【1】如果 text1 和 text2 不在当前 url 上则会自动添加上去，可为空值<br />' +
						'【2】[n=x, y(, z)] 为计数器，x 为匹配不到当前页码时的初始值，y 为每翻一页的增量，z 可选，代表数字位数<br /><br />' +
						'例如当前页链接为 http://www.example.com/2.html<br />' +
						'[+][n=1,1].html 可获取 http://www.example.com/3.html<br />' +
						'[+]?p=[n=1,2,3]&m=1 可获取 http://www.example.com/2.html?p=003&m=1</span>' +
					'</div><br />' +
				'<div class="ujs_osi_sep"></div><br />' +
				'<input type="radio" name="req_mode" checked="checked" /> XHR（推荐）' +
				'&nbsp;&nbsp;&nbsp' +
				'<input type="radio" name="req_mode" /> iframe （XHR 无效请使用这个）&nbsp;&nbsp;延时&nbsp;<input type="number" id="ujs_preview_album_next_page_iframe_delay" min="0" />&nbsp;毫秒<br /><br />' +
				'<div id="confirm_bar">' +
					'<span class="ujs_osi_np_button ujs_osi_btn2" id="ujs_preview_album_next_page_save">保存</span>' +
					'&nbsp;&nbsp;&nbsp;' +
					'<span class="ujs_osi_np_button ujs_osi_btn2" id="ujs_preview_album_next_page_cancel">取消</span>' +
					'&nbsp;&nbsp;&nbsp;' +
					'<span id="ujs_preview_album_next_page_delete"><span class="ujs_osi_np_button ujs_osi_btn2">删除</span>&nbsp;&nbsp;&nbsp;</span>' +
					'<span class="ujs_osi_np_button ujs_osi_btn2" id="ujs_preview_album_next_page_manager">管理</span>' +
				'</div>';
			document.body.appendChild(next_page_settings_dialog);
			
			$('#ujs_preview_album_next_page_save').addEventListener('click', preview_album_save_next_page_settings, false);
			$('#ujs_preview_album_next_page_cancel').addEventListener('click', preview_album_close_next_page_settings, false);
			$('#ujs_preview_album_next_page_delete').addEventListener('click', preview_album_delete_next_page_settings, false);
			$('#ujs_preview_album_next_page_manager').addEventListener('click', preview_album_manager_next_page_show_settings, false);
			$('#ujs_preview_album_next_page_xpath_btn').addEventListener('click', function(){
				select_which_xpath = 0;
				preview_album_get_next_page_xpath();
			}, false);
			$('#ujs_preview_album_next_page_xpath_btn2').addEventListener('click', function(){
				select_which_xpath = 1;
				preview_album_get_next_page_xpath();
			}, false);
			
			preview_album_init_next_page_settings();
			
			reset_dialog_position(next_page_settings_dialog, true);
		}
	}
	
	function preview_album_get_np_iframe_dalay(req_mode){
		if(req_mode > 0){
			var req_str = '' + req_mode;
			var delay = req_str.substring(1);
			return parseInt(delay);
		}
		else{
			return 0;
		}
	}
	
	function preview_album_init_next_page_settings(){
		if(isGlobalStorageSupport() == GLOBAL_STORAGE_NOT_SUPPORT && isCookieSupport()){
			$('#ujs_preview_album_np_notice').innerHTML = '您正使用 Cookie 存储，请不要填写敏感信息 <br /><br />';
		}
		else if(isGlobalStorageSupport() == GLOBAL_STORAGE_NOT_SUPPORT && !isCookieSupport()){
			$('#ujs_preview_album_np_notice').innerHTML = '您的浏览器不支持跨子域存储 <br /><br />';
		}
	
		if(curr_url){
			old_url = $('#ujs_preview_album_next_page_url').value = curr_url;
		}
		else{
			old_url = $('#ujs_preview_album_next_page_url').value = '*' + window.location.host + '*';
			_removeElement(null, 'ujs_preview_album_next_page_delete');
		}
		if(curr_xpath){
			$('#ujs_preview_album_next_page_xpath').value = curr_xpath;
		}
		if(curr_xpath2){
			$('#ujs_preview_album_next_page_xpath2').value = curr_xpath2;
		}
		if(curr_rule){
			$('#ujs_preview_album_next_page_rule').value = curr_rule;
		}
		if(curr_fetch_mode >= 0){
			$$('#ujs_preview_album_next_page_settings input[name="fetch_mode"]')[curr_fetch_mode].checked = true;
		}
		if(curr_req_mode >= 0){
			$$('#ujs_preview_album_next_page_settings input[name="req_mode"]')[curr_req_mode > 0? 1 : 0].checked = true;
			if(curr_req_mode > 0){
				var delay = preview_album_get_np_iframe_dalay(curr_req_mode);
				$('#ujs_preview_album_next_page_iframe_delay').value = '' + delay;
			}
			else{
				$('#ujs_preview_album_next_page_iframe_delay').value = '100';
			}
		}
	}
	
	function preview_album_close_next_page_settings(){
		if(next_page_settings_dialog){
			_removeElement(next_page_settings_dialog);
			next_page_settings_dialog = null;
		}
	}
	
	function preview_album_next_url_auto (doc) {
		// 1st, we search for LINK tags
		var links = doc.getElementsByTagName('link');
		for (var i = 0; i < links.length; i++) {
			if (links[i].href &&
				links[i].hasAttribute('rel') &&
				links[i].getAttribute('rel').toLowerCase().indexOf('next') == 0) {
				return links[i].href;
			}
		}

		// 2nd, we search for A tags
		var regexp = new RegExp('(?:' + NEXT_PAGE_LUCKY_KEYWORDS.join('|') + ')', 'i');
		links = doc.links;
		for (i = 0; i < links.length; i++) {
			if (links[i].href &&
				links[i].textContent &&
				links[i].textContent.match(regexp)) {
				var keyword = RegExp.lastMatch;
				if(keyword.length / links[i].textContent.length > 0.5){
					return links[i].href;
				}
			}
		}

		// 3rd, we increase the num in url by 1
		var url = doc._currURL || doc.URL;
		if (url.match(/(\d+)(\D*)$/)){
			var num = RegExp.$1;
			var digit = (num.charAt(0) == '0') ? num.length : null;
			num = parseInt(num, 10) + 1;
			num = num.toString();
			digit = digit - num.length;
			for (var i = 0; i < digit; i++){
				num = '0' + num;
			}
			var ret = (RegExp.leftContext + num + RegExp.$2);
			var host = window.location.host;
			if(ret.indexOf(host) != -1){
				return ret;
			}
			return null;
		}

		return null;
	}
	
	var curr_page_i = 1;
	
	function getNumWitchZero(num, bit){
		var num = '' + num;
		var zero = '', i = 0;
		if(num.length >= bit) return num;
		for(i = 0; i < (bit - num.length); i++){
			zero += '0';
		}
		return (zero + num);
	}
	
	function preview_album_next_url_rule(){
		//var url = doc._currURL || doc.URL;
		var url = window.location.href;
		var urlInc = curr_rule.replace(/ /g, '');
		if(window.location.search){
			if(/\[\+\]\?([^=]+)=/.test(urlInc)){
				if(window.location.search.indexOf(RegExp.$1 + '=') == -1){
					urlInc = urlInc.replace(/\[\+\]\?/, '[+]&');
				}
			}
		}
		var curPageNum = 0;
		var nextUrl = null;
		
		if(/\[\+\].*\[n=\d+,\d+(\,\d+)?\]$/.test(urlInc)){
			var x = urlInc.match(/\[\+\](.*)\[n=\d+,\d+(\,\d+)?\]/)[1];
			urlInc.match(/\[\+\].*\[n=(\d+),(\d+)(\,\d+)?\]/);
			var oNum = parseInt(RegExp.$1);
			var oInc = parseInt(RegExp.$2);
			var oBit = 1;
			if(/\[\+\].*\[n=\d+,\d+,(\d+)\]/.test(urlInc)){
				oBit = parseInt(RegExp.$1);
			}
			var pos = url.lastIndexOf(x);
			if(pos != -1 && x != ''){
				pos += x.length;
				/(\d+)/.test(url.slice(pos));
				curPageNum = parseInt(RegExp.$1);
				curPageNum += curr_page_i * oInc;
				curPageNum = getNumWitchZero(curPageNum, oBit);
				nextUrl = (url.slice(0, pos) + curPageNum + RegExp.rightContext);
			}
			else{
				curPageNum = oNum + curr_page_i * oInc;
				curPageNum = getNumWitchZero(curPageNum, oBit);
				nextUrl = (url + x + curPageNum);
			}
		}
		else if(/\[\+\](.*)\[n=(\d+),(\d+)(\,\d+)?\](.+)/.test(urlInc)){
			var x = RegExp.$5;//结尾
			var y = RegExp.$1;//开头
			var oNum = parseInt(RegExp.$2);
			var oInc = parseInt(RegExp.$3);
			var oBit = 1;
			if(/\[\+\].*\[n=\d+,\d+,(\d+)\].+/.test(urlInc)){
				oBit = parseInt(RegExp.$1);
			}
			var pos = url.lastIndexOf(x);
			var reg = new RegExp('.*' + y.replace(/\?/g, '\\?') + '\\d+$');
			var reg1 = new RegExp('.*' + y.replace(/\?/g, '\\?') + '(\\d+)$');
			var reg2 = new RegExp('(.*)' + y.replace(/\?/g, '\\?') + '\\d+$');
			var frontUrl = (pos != -1) ? url.slice(0, pos) : frontUrl = url;
			if(reg.test(frontUrl)){
				curPageNum = parseInt(frontUrl.match(reg1)[1]);
				curPageNum += curr_page_i * oInc;
				curPageNum = getNumWitchZero(curPageNum, oBit);
				frontUrl = frontUrl.match(reg2)[1];
			}
			else{
				curPageNum = oNum + curr_page_i * oInc;
				curPageNum = getNumWitchZero(curPageNum, oBit);
			}
			nextUrl = (frontUrl + y + curPageNum + x);
		}
		return nextUrl;
	}
	
	function preview_album_get_next_page_url (mode, doc) {
		var theDoc = doc ? doc : document;
		if(mode == 0){ // 手气不错
			return preview_album_next_url_auto(theDoc);
		}
		else if(mode == 1){ // XPath
			if(curr_xpath){
				var link = _selectSingleNode(doc, doc, curr_xpath);
				if(link){
					return link.href;
				}
				else if(curr_xpath2){
					link = _selectSingleNode(doc, doc, curr_xpath2);
					if(link){
						return link.href;
					}
				}
			}
		}
		else if(mode == 2){ // rule
			return preview_album_next_url_rule();
		}
		return null;
	}

	var curr_page_document = null;
	
	function preview_album_start_fetching_next_page(){
		var url = preview_album_get_next_page_url(curr_fetch_mode, curr_page_document);
		if(url){
			_toast('下一页链接：' + url);
			fetch_the_images_from_url(url, (curr_req_mode == 0) ? 'xhr' : 'iframe_' + preview_album_get_np_iframe_dalay(curr_req_mode));
		}
		else{
			_toast('无法获取下一页链接，您可以在顶部工具栏中进入设置页面');
		}
	}
	
	function preview_album_next_page_click_hdlr (ev) {
		_StopEvent(ev);
		preview_album_start_fetching_next_page();
	}
	
	function preview_album_dblclick_hdlr (ev) {
		_StopEvent(ev);
		if(album_in_select_mode){
			return;
		}
		if(ev.target == $('#ujs_preview_next_page') || ev.target == $('#ujs_preview_next_page_icon')){
			return;
		}
		destroy_preview_album();
		cleanSelection();
	}
	
	function regist_preview_album_actions () {
		$('#ujs_preview_ablum_settings_go').addEventListener('click', preview_setting_go, false);
		$('#ujs_preview_album_tables').addEventListener('DOMMouseScroll', preview_album_scroll_hdlr, false);
		$('#ujs_preview_album_tables').addEventListener('mousewheel', preview_album_scroll_hdlr, false);
		$('#ujs_preview_album_tables').addEventListener('click', preview_album_table_click_hdlr, false);
		$('#ujs_preview_ablum_container').addEventListener('dblclick', preview_album_dblclick_hdlr, false);
		if(SHOW_TIPS_ON_STATUSBAR){
			$('#ujs_preview_ablum_container').addEventListener('mousemove', function(e) { window.status = '双击空白处关闭相册 | 空格键（+shift）显示下一张（上一张）图片'; }, false);
		}
		$('#ujs_preview_ablum_filter_selections').addEventListener('change', preview_setting_filter_select, false);
		$('#ujs_preview_ablum_grid_selections').addEventListener('change', preview_setting_grid_select, false);
		$('#ujs_preview_ablum_page_count').addEventListener('click', preview_album_jump_to_page_by_click, false);
		$('#ujs_preview_ablum_close').addEventListener('click', destroy_preview_album, false);
		$('#ujs_preview_album_url_list').addEventListener('click', preview_album_get_url_list, false);
		$('#ujs_preview_album_next_page_setting').addEventListener('click', preview_album_show_next_page_settings, false);
	}

	function create_preview_album () {
		if(preview_album == null){
			MIN_AREA = VIEW_STYLE = 0;
			CLICK_DIRECT_VIEW = true;
			ALWAYS_CLICK_DIRECT_VIEW = true;
			curr_img_src = '';
			reset_recycle_warning();
			preview_album = create_whole_page_div('white', 1);
			preview_album.style.background = album_background;
			create_preview_album_setting_bar();
			album_ctn = _createElement('div', 'ujs_preview_ablum_container');
			album_tables = _createElement('div', 'ujs_preview_album_tables');
			album_tables.style.top = '0px';
			
			preview_album.appendChild(album_settings);
			album_ctn.appendChild(album_tables);
			preview_album.appendChild(album_ctn);
			document.body.appendChild(preview_album);
			
			regist_preview_album_actions();
		}
	}

	function destroy_preview_album () {
		if(iframe_page){
			$('#ujs_preview_album_iframe_close').click();
		}
		page_sep = 0;
		auto_fetch_np_counter = 0;
		curr_page_document = null;
		clean_fetch_request();
		VIEW_STYLE = _VIEW_STYLE;
		MIN_AREA = _MIN_AREA;
		CLICK_DIRECT_VIEW = _CLICK_DIRECT_VIEW;
		ALWAYS_CLICK_DIRECT_VIEW = _ALWAYS_CLICK_DIRECT_VIEW;
		_removeElement(preview_album);
		if(curr_img_src != ''){
			find_and_focus_image(curr_img_src, true);
			curr_img_src = '';
		}
		preview_album = album_settings = album_ctn = album_tables = null;
		albumStyleObj && _removeElement(albumStyleObj);
		albumStyleObj = null;
		clean_preview_album_preload_callback();
	}

	function preview_album_page_count_add_one () {
		var pages = $('#ujs_preview_ablum_page_count');
		var pageSpan = $$('#ujs_preview_ablum_page_count>span');
		var pageSelect = $('#ujs_preview_ablum_page_count>select');
		var i = 0;
		var currDispMode = pageSelect ? 'select' : 'span', needUseSelect = false;
		
		if(pageSpan && pageSpan.length > 0){
			var w = 35 * (pageSpan.length + 1) + $('#ujs_preview_album_normal_container').offsetWidth;
			if(w > (viewWidth * 0.9)){
				needUseSelect = true;
			}
		}
		
		if(currDispMode == 'span' && needUseSelect){
			var index = parseInt($('#ujs_preview_ablum_page_count .current_page').textContent) - 1;
			var select = _createElement('select');
			for(i = 0; i < pageSpan.length + 1; i++){
				if(i < pageSpan.length){
					_removeElement(pageSpan[i]);
				}
				var option = _createElement('option');
				option.textContent = '第 ' + (i + 1) + ' 页';
				select.appendChild(option);
			}
			select.selectedIndex = index;
			pages.appendChild(select);
			select.addEventListener('change', function(e){
				var index = $('#ujs_preview_ablum_page_count>select').selectedIndex;
				preview_album_jump_to_page(index);
			}, false);
		}
		else if(currDispMode == 'select'){
			var index = $$('#ujs_preview_ablum_page_count>select>option').length + 1;
			var option = _createElement('option');
			option.textContent = '第 ' + index + ' 页';
			$('#ujs_preview_ablum_page_count>select').appendChild(option);
		}
		else if(currDispMode == 'span'){
			var index = $$('#ujs_preview_ablum_page_count>span').length + 1;
			var page = _createElement('span');
			page.textContent = index + '';
			pages.appendChild(page);
		}
	}

	function create_table_td (source) {
		var a = _createElement('a', null, 'ujs_preview_album_links');
		a.href = source.href;
		var img = _createElement('img', null, 'ujs_preview_album_imgs' + (page_sep == 1 ? ' sep' : ''));
		img.src = source.src;
		if(source.url != null){
			img.setAttribute('_fromurl', source.url);
		}
		a.appendChild(img);
		return a;
	}

	function create_next_page_button () {
		var a = _createElement('a', 'ujs_preview_next_page');
		a.href = '#';
		var span = _createElement('span', 'ujs_preview_next_page_icon');
		span.innerHTML = '' +
			'<span class="ujs_osi_np_btn_placeholder"></span>' +
			'<span id="ujs_preview_next_page_loading_text"></span>';
		a.addEventListener('click', preview_album_next_page_click_hdlr, false);
		a.appendChild(span);
		return a;
	}

	function preview_album_set_photos (source) {
		if(album_tables != null) {
			var tables = 0, i = 0, j = 0, k = 0, count = 0;
			var imgs = source;
			curr_index = 0;
			tables = Math.ceil((imgs.length + 1) / (album_col * album_row));
			count = 0;
			var container_w = $('#ujs_preview_ablum_container').offsetWidth;
			var container_h = $('#ujs_preview_ablum_container').offsetHeight;
			var setting_h = $('#ujs_preview_ablum_settings').offsetHeight;
			page_sep = 0;
			var tempUrl = imgs.length > 0 ? imgs[0].url : null;
			for(i = 0; i < tables; i++){
				var table = _createElement('table', null, 'ujs_preview_album_table');
				table.setAttribute('class', 'table_' + i);
				for(j = 0; j < album_row; j++){
					var tr = _createElement('tr');
					tr.setAttribute('align', 'center');
					tr.setAttribute('height', (container_h - setting_h) / album_row - 1);
					tr.setAttribute('class', 'tr_' + j);
					for(k = 0; k < album_col; k++){
						var td = _createElement('td');
						td.setAttribute('align', 'center');
						td.setAttribute('width', container_w / album_col);
						td.setAttribute('class', 'td_' + k);
						if(count < imgs.length){
							if(tempUrl != imgs[count].url){
								tempUrl = imgs[count].url;
								page_sep ^= 1;
							}
							var a = create_table_td(imgs[count]);
							td.appendChild(a);
							count++;
						}
						else if(count == imgs.length){
							//next-page button
							var a = create_next_page_button();
							td.appendChild(a);
							count++;
						}
						tr.appendChild(td);
					}
					table.appendChild(tr);
				}
				album_tables.appendChild(table);
				if(tables > 1){
					preview_album_page_count_add_one();
					_addClassName($('#ujs_preview_ablum_page_count>span:first-child'), 'current_page');
				}
			}

			albumStyleObj && _removeElement(albumStyleObj);
			//max size is 165
			var next_page_icon_size = Math.min(165, 0.7 * Math.min(container_w / album_col, (container_h - setting_h) / album_row));
			var imgStyleStr = '.ujs_preview_album_imgs { max-width: ' + (container_w / album_col - 25) + 'px !important; max-height: ' + ((container_h - setting_h) / album_row - 25) + 'px !important; padding: 5px !important; background-color: white !important; box-shadow: 0px 0px 10px gray !important; display: inline !important; width: auto !important; height: auto !important; } \n' +
			'.ujs_preview_album_imgs.sep { background-color: #FFD990 !important; } \n' +
			'.ujs_preview_album_imgs.ujs_osi_ab_loading { background-color: #409200 !important; } \n' +
			'.ujs_preview_album_imgs.failed { background-color: #930E0E !important; } \n' +
			'.ujs_preview_album_imgs.current { background-color: #0070B0 !important; } \n' + 
			'#ujs_preview_next_page { background: #BBBBBB !important; display: inline-block !important; border-radius: 999px !important; box-shadow: 0px 0px 10px #BBBBBB !important; } \n' +
			'#ujs_preview_next_page:hover { background: #CCCCCC !important; box-shadow: 0px 0px 10px #CCCCCC !important; } \n' +
			'#ujs_preview_next_page_icon { display: inline-block !important; width: ' + next_page_icon_size + 'px !important; height: ' + next_page_icon_size + 'px !important; background-image: url(\'' + icon.next_page + '\') !important; background-size: contain !important; background-repeat: no-repeat !important; background-position: center !important; } \n' +
			'#ujs_preview_next_page_icon .ujs_osi_np_btn_placeholder { height: 80% !important; display: inline-block !important; } \n' +
			'#ujs_preview_next_page_loading_text { color: #6C6C6C !important; } \n' +
			'#ujs_preview_next_page.ujs_osi_np_loading { cursor: wait !important; } \n' +
			'#ujs_preview_next_page.ujs_osi_np_loading #ujs_preview_next_page_icon { background-image: url(\'' + icon.loading + '\') !important; background-size: 26px 26px !important; }';
			albumStyleObj = _addStyle(imgStyleStr);
		}
	}

	var page_sep = 0;
	
	function preview_album_add_more_photos (source) {
		if(album_tables != null) {
			//find the next-page icon position
			var btn = $('#ujs_preview_next_page');
			var td_index = parseInt(btn.parentNode.className.replace('td_', ''));
			var tr_index = parseInt(btn.parentNode.parentNode.className.replace('tr_', ''));
			var table_index = parseInt(btn.parentNode.parentNode.parentNode.className.replace('table_', ''));
			
			var remain = (album_row * album_col) - tr_index * album_col - td_index;
			$('#ujs_preview_next_page').removeEventListener('click', preview_album_next_page_click_hdlr, false);
			_removeElement(null, 'ujs_preview_next_page');
			
			var container_w = $('#ujs_preview_ablum_container').offsetWidth;
			var container_h = $('#ujs_preview_ablum_container').offsetHeight;
			var setting_h = $('#ujs_preview_ablum_settings').offsetHeight;
			
			if(source.length > 0){
				page_sep ^= 1;
			}
			for(var i = 0; i < source.length + 1 /* 1 is for the btn */; i++) {
				if(remain == 0){ //need to create a new table
					if(table_index == 0){
						//It is just 1 page before, so there is no page indication in that case.
						//We need create the indication first
						preview_album_page_count_add_one();
						_addClassName($('#ujs_preview_ablum_page_count>span:first-child'), 'current_page');
					}
					td_index = 0;
					tr_index = 0;
					table_index++;
					var table = _createElement('table', null, 'ujs_preview_album_table');
					table.setAttribute('class', 'table_' + table_index);
					for(var j = 0; j < album_row; j++){
						var tr = _createElement('tr');
						tr.setAttribute('align', 'center');
						tr.setAttribute('height', (container_h - setting_h) / album_row - 1);
						tr.setAttribute('class', 'tr_' + j);
						for(var k = 0; k < album_col; k++){
							var td = _createElement('td');
							td.setAttribute('align', 'center');
							td.setAttribute('width', container_w / album_col);
							td.setAttribute('class', 'td_' + k);
							tr.appendChild(td);
						}
						table.appendChild(tr);
					}
					album_tables.appendChild(table);
					preview_album_page_count_add_one();
					remain = album_row * album_col;
				}
				var theTd = $('.table_' + table_index + '>.tr_' + tr_index + '>.td_' + td_index);
				if(i < source.length){
					var a = create_table_td(source[i]);
					theTd.appendChild(a);
				}
				else if(i == source.length){
					//next-page button
					var a = create_next_page_button();
					theTd.appendChild(a);
				}
				
				remain--;
				td_index++;
				if(td_index >= album_col){
					td_index = 0;
					tr_index++;
				}
			}
		}
	}

	function preview_album_preload_info_num_increase (span) {
		var num = parseInt(span.textContent);
		span.textContent = (++num) + '';
	}

	function preview_album_find_images_by_href (href) {
		return $('a[class="ujs_preview_album_links"][href="' + href + '"]>img');
	}

	function preview_album_preload_complete_callback (obj, success) {
		preview_album_preload_info_num_increase($('#ujs_preview_ablum_preload_completed_num'));
		preview_album_preload_next();
		var img = preview_album_find_images_by_href(obj.src);
		_removeClassName(img, 'ujs_osi_ab_loading');
		if( success == 'error' ){
			preview_album_preload_info_num_increase($('#ujs_preview_ablum_preload_failed_to_load .num'));
			_addClassName(img, 'failed');
			var a = $('a[class="ujs_preview_album_links"][href="' + obj.src + '"]');
			a.href = a.getElementsByTagName('img')[0].src;
			var i = preview_album_current_source_find_index_by_link(obj.src);
			curr_album_source[i].ohref = curr_album_source[i].href;
			curr_album_source[i].href = curr_album_source[i].src;
		}
		else if(img.src == '') {// imgur.com 上因滚动加载图片的功能而造成album无法显示图片的问题
			img.src = obj.src;
		}
	}

	var loading_image = [];

	function preview_album_preload_next() {
		if(preload_queue.length > 0){
			var source = preload_queue.shift();
			var image = new Image();
			image.src = source.href;
			setTimeout(function (){ //使用 timer 避免页面卡顿
				if(image.complete){
					preview_album_preload_complete_callback(image, 'load');
					image = null;
				}
				else{
					var _src = image.src;
					//重新赋值以再次加载，避免图片加载失败时UI更新不过来的问题
					if(image.width == 0 && image.height == 0){
						image.src = '';
						image.src = _src;
					}
					image.onerror = image.onload = function (e){
						preview_album_preload_complete_callback(image, e.type);
						image = null;
					};
					loading_image.push(image);
				}
			}, 0);
		}
	}

	function preview_album_start_preload (source, addMore) {
		var i = 0, count = 0;
		var span_completed = $('#ujs_preview_ablum_preload_completed_num');
		var span_all = $('#ujs_preview_ablum_preload_need_to_load_num');
		var span_failed = $('#ujs_preview_ablum_preload_failed_to_load .num');
		
		preload_queue = [];
		for(i = 0; i < source.length; i++){
			if(source[i].src != source[i].href){
				preload_queue.push(source[i]);
				count++;
				_addClassName(preview_album_find_images_by_href(source[i].href), 'ujs_osi_ab_loading');
			}
		}
		if(addMore){
			var old_num = parseInt(span_all.textContent);
			span_all.textContent = (old_num + count) + '';
		}
		else{
			span_all.textContent = count + '';
			span_completed.textContent = '0';
			span_failed.textContent = '0';
		}
		var thread = (PRELOAD_THREAD_NUM < 0) ? count : PRELOAD_THREAD_NUM;
		for(i = 0; i < thread; i++){
			preview_album_preload_next();
		}
	}

	function clean_preview_album_preload_callback(){
		for(var i = 0; i < loading_image.length; i++){
			loading_image[i].onload = null;
			loading_image[i].onerror = null;
			loading_image[i] = null;
		}
		loading_image = [];
	}

	function preview_album_clear_photos () {
		clean_preview_album_preload_callback();
		if(album_tables != null) {
			var tables = $$('#ujs_preview_album_tables table');
			if(tables && tables.length > 0){
				for(var i = 0; i < tables.length; i++){
					_removeElement(tables[i]);
				}
			}
		}
		var pages = $$('#ujs_preview_ablum_page_count>span');
		if(pages && pages.length > 0){
			for(var i = 0; i < pages.length; i++){
				_removeElement(pages[i]);
			}
		}
		else{
			var select = $('#ujs_preview_ablum_page_count>select');
			if(select){
				_removeElement(select);
			}
		}
	}

	function filter_album_source (sourceFrom) {
		var width = get_default_filter_size().width;
		var height = get_default_filter_size().height;
		var source = null;
		if(preview_album != null){
			width = parseInt($('#ujs_preview_ablum_setting_width').value);
			height = parseInt($('#ujs_preview_ablum_setting_height').value);
		}
		if( ! isNaN(width) && ! isNaN(height) ){
			var i = 0;
			source = [];
			for(i = 0; i < sourceFrom.length; i++){
				if( sourceFrom[i].width * sourceFrom[i].height >= width * height || sourceFrom[i].src != sourceFrom[i].href ){
					source.push(sourceFrom[i]);
				}
			}
		}
		return source;
	}

	function generate_album_source (sourceFrom) {
		var source = [], i = 0, j = 0, exist = false;

		for(i = 0; i < sourceFrom.length; i++){
			var _src, _href;
			var _width = sourceFrom[i].naturalWidth;
			var _height = sourceFrom[i].naturalHeight;
			var obj = sourceFrom[i];
			
			_src = _href = obj.src;
			var _temp_href = check_img_src_reg(obj);
			if(_temp_href != ''){
				_href = _temp_href;
			}
			else{
				while(_tag(obj) != 'a' && obj.parentNode)
					obj = obj.parentNode;
				if(_tag(obj) == 'a'){
					if(check_img_link(obj.href)){
						_href = obj.href;
					}
				}
			}
			
			exist = false;
			for(j = 0; j < source.length; j++){
				if(source[j].href == _href){
					exist = true;
					break;
				}
			}
			if( ! exist ){
				var doc = curr_page_document;
				source.push( {
					src : _src,
					width : _width,
					height : _height,
					href : _href,
					url : doc ? (doc._currURL || doc.URL) : null,
				} );
			}
		}
		return source;
	}

	function removeTheExistNewSource (newSource, source) {
		var index = 0;
		while(index < newSource.length){
			var removed = false;
			for(var i = 0; i < source.length; i++){
				if(newSource[index].href == source[i].href){
					newSource.splice(index, 1);
					removed = true;
					break;
				}
			}
			if(!removed){
				index++;
			}
		}
	}

	var fetch_the_images_all_complete_callback = null;
	
	function register_fetch_done_callback(func){
		fetch_the_images_all_complete_callback = func;
	}
	
	function unregister_fetch_done_callback(){
		fetch_the_images_all_complete_callback = null;
	}
	
	function fetch_done_callback(){
		if(fetch_the_images_all_complete_callback != null){
			fetch_the_images_all_complete_callback();
		}
	}
	
	function request_images_all_ready_callback (imgs) {
		if(preview_album != null){
			clean_fetch_request();
			_removeClassName($('#ujs_preview_next_page'), 'ujs_osi_np_loading');
			var newSource = generate_album_source(imgs);
			removeTheExistNewSource(newSource, album_source);
			album_source = album_source.concat(newSource);
			$('#ujs_preview_next_page_loading_text').textContent = '';
			
			var newFilterSource = filter_album_source(newSource);
			_toast('获取完毕，共 ' + imgs.length + ' 张图片，' + newSource.length + ' 个符合规则，过滤后显示 ' + newFilterSource.length + ' 张图片');
			curr_album_source = curr_album_source.concat(newFilterSource);
			preview_album_add_more_photos(newFilterSource);
			preview_album_start_preload(newFilterSource, true);
			fetch_done_callback();
		}
	}
	
	var load_url_imgs_interval = -1;
	var fetch_page_imgs_flag = false;

	function request_complete_callback (htmlText, fromIframe, url) {
		if(preview_album == null){
			return;
		}
		var i = 0;
		var doc = _createHTMLDocumentByString(htmlText);
		var docImgs = [];
		for(i = 0; i < doc.images.length; i++){
			var img = new Image();
			img.src = doc.images[i].src;
			docImgs.push(img);
		}
		doc._currURL = url;
		curr_page_document = doc;
		curr_page_i++;
		var interval_times = 0;
		load_url_imgs_interval = setInterval(function(){
			var imgs = docImgs;
			var img_loaded_count = 0;
			for(i = 0; i < imgs.length; i++){
				if(imgs[i].complete || (imgs[i].naturalWidth > 0 && imgs[i].naturalHeight)) {
					img_loaded_count++;
				}
			}
			$('#ujs_preview_next_page_loading_text').textContent = img_loaded_count + '/' + imgs.length;
			if(img_loaded_count == imgs.length || interval_times == Math.max(200, imgs.length)){
				clearInterval(load_url_imgs_interval);
				load_url_imgs_interval = -1;
				request_images_all_ready_callback(imgs);
			}
			interval_times++;
		}, 200);
	}
	
	function xhr_request_failed(){
		_toast('XHR 请求失败');
		_removeClassName($('#ujs_preview_next_page'), 'ujs_osi_np_loading');
		fetch_page_imgs_flag = false;
		$('#ujs_preview_next_page_loading_text').textContent = '';
	}
	
	function clean_fetch_request () {
		_removeElement(null, 'ujs_preview_iframe_fetch_request');
		if(load_url_imgs_interval != -1){
			clearInterval(load_url_imgs_interval);
			load_url_imgs_interval = -1;
		}
		fetch_page_imgs_flag = false;
	}

	function fetch_with_xhr (url) {
		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType('text/html; charset=' + document.characterSet);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				var htmlText = xhr.responseText;
				request_complete_callback(htmlText, false, url);
			}
			else if(xhr.readyState == 4 && xhr.status == 0){
				//load error
				xhr_request_failed();
			}
		}
		xhr.open('GET', url, true);
		xhr.send(null);
	}

	function fetch_with_iframe (url, delayAfterLoad) {
		var id = 'ujs_preview_iframe_fetch_request';
		_removeElement(null, id);
		var iframe = _createElement('iframe', id);
		iframe.src = url;
		iframe.name = id + '_' + delayAfterLoad;
		document.body.appendChild(iframe);
	}

	function fetch_the_images_from_url (url, mode) {
		if(fetch_page_imgs_flag){
			return;
		}
		fetch_page_imgs_flag = true;
		_addClassName($('#ujs_preview_next_page'), 'ujs_osi_np_loading');
		$('#ujs_preview_next_page_loading_text').textContent = '请求中';
		if(mode == 'xhr'){
			fetch_with_xhr(url);
		}
		else if(mode.indexOf('iframe_') != -1){
			fetch_with_iframe(url, mode.replace('iframe_', ''));
		}
	}

	function preview_album_current_source_find_index_by_link (link) {
		var i = 0;
		for(; i < curr_album_source.length; i++){
			if(curr_album_source[i].href == link){
				return i;
			}
		}
		return 0;
	}

	function has_scroll_bar(obj, isVertical){
		var overflow = obj.style.overflow || window.getComputedStyle(obj, null).overflow;
		if(overflow == 'hidden'){
			return false;
		}
		var overflowName = isVertical ? 'overflowY' : 'overflowX';
		var scrollMaxName = isVertical ? 'scrollTopMax' : 'scrollLeftMax';
		var overflowY = obj.style[overflowName] || window.getComputedStyle(obj, null)[overflowName];
		if(overflowY == 'hidden'){
			return false;
		}
		if(!is_undefined(obj[scrollMaxName])){
			return (obj[scrollMaxName] > 0);
		}
		else{
			var clientName = isVertical ? 'clientHeight' : 'clientWidth';
			var scrollName = isVertical ? 'scrollHeight' : 'scrollWidth';
			return (obj[clientName] > 0 && (obj[scrollName] > obj[clientName]));
		}
	}

	function scroll_to_element_ind(obj, showHilight, gravity, nameOffset, nameScroll, nameScrollMax) {
		if(isVisible(obj) == false){
			return;
		}
		var node = obj;
		var offset = 0;
		var scrollFlag = false;
		while(node.offsetParent || node.parentNode){
			if(node[nameOffset] > 0){
				scrollFlag = true;
				offset += node[nameOffset];
			}
			if(scrollFlag){
				if(has_scroll_bar(node, gravity == 'vertical')){
					var scrollOffset = Math.min(node[nameScrollMax] ? node[nameScrollMax] : offset, offset);
					node[nameScroll] = scrollOffset;
					offset = 0;
					scrollFlag = false;
				}
			}
			if(_tag(node) == 'html'){
				break;
			}
			else{
				node = node.offsetParent || node.parentNode;
			}
		}
		if(showHilight){
			(function(count){
				var interval = setInterval(function(){
					if(count % 2){
						_addClassName(obj, 'osi_focus_finish');
					}
					else{
						_removeClassName(obj, 'osi_focus_finish');
					}
					if(--count < 0){
						clearInterval(interval);
					}
				}, 300);
			})(3);
		}
	}
	
	function scroll_to_element(obj, showHilight){
		scroll_to_element_ind(obj, showHilight, 'vertical', 'offsetTop', 'scrollTop', 'scrollTopMax');
		scroll_to_element_ind(obj, showHilight, 'horizonal', 'offsetLeft', 'scrollLeft', 'scrollLeftMax');
	}

	function find_image(src) { //first one
		//不用 img[src=xxx] 查询，避免 src 为相对路径时找不到 img object
		var imgs = document.images;
		for(var i = 0; i < imgs.length; i++){
			if(decodeURI(imgs[i].src) == decodeURI(src)){
				return imgs[i];
			}
		}
		return null;
	}

	function saveAndSetIframeName(obj, name){
		var osi_fname = obj.getAttribute('osi_fname');
		if(!osi_fname || osi_fname == ''){
			obj.setAttribute('osi_fname', obj.name);
			obj.name = name;
		}
	}
	
	function restoreIframeName(obj){
		var name = obj.getAttribute('osi_fname');
		if(name){
			obj.name = name;
		}
		else{
			obj.removeAttribute('name');
		}
		obj.removeAttribute('osi_fname');
	}
	
	function find_and_focus_image(src, showHilight) {
		if(TRACE_IMAGE_IN_PAGE == 0
		|| (TRACE_IMAGE_IN_PAGE == 1 && preview_album != null)
		|| (TRACE_IMAGE_IN_PAGE == 2 && preview_album == null)
		){
			return;
		}
		var img = find_image(src);
		if(img != null){
			scroll_to_element(img, showHilight);
			if(window != window.top){
				var message = {data: window.name, msg: 'MSG_ID_FOCUS_TO_IFRAME'};
				window.top.postMessage(json.stringify(message), '*');
			}
		}
		else if(window.frames.length > 0){
			var f = window.frames;
			for(var i = 0; i < f.length; i++){
				var message = {data: src, arg1: showHilight, msg: 'MSG_ID_FIND_AND_FOCUS_IMAGE'};
				f[i].postMessage(json.stringify(message), '*');
			}
			
			var iframes = $$('iframe');
			if(iframes && iframes.length > 0){
				for(var j = 0; j < iframes.length; j++){
					saveAndSetIframeName(iframes[j], 'osi_fname_' + j);
				}
			}
			setTimeout(function(){
				if(iframes && iframes.length > 0){
					for(var k = 0; k < iframes.length; k++){
						restoreIframeName(iframes[k]);
					}
				}
			}, 1000);
		}
	}

	function preview_album_hightlight_photo (index, jumpToPage) {
		var curr_img = $('.ujs_preview_album_imgs.current');
		if(curr_img){
			_removeClassName(curr_img, 'current');
		}
		if(index != -1){
			var imgs = $$('#ujs_preview_album_tables img');
			if(index < imgs.length){
				_addClassName(imgs[index], 'current');
				var page_index = Math.floor(index / (album_row * album_col));
				if( ! jumpToPage ){
					preview_album_jump_to_page(page_index);
				}
			}
		}
	}

	function preview_album_show_coming_photo (index) {
		var link = curr_album_source[index].href;
		destroy_all_preview(true);
		if(preview_album == null){
			find_and_focus_image(curr_album_source[index].src, false);
		}
		else{
			curr_img_src = curr_album_source[index].src;
		}
		setTimeout(function(){
			create_preview(0, 0, link, true);
			preview_album_hightlight_photo(index, false);
		}, 0);
	}

	var recycle_warning_flag = false;
	var recycle_warning = 0;
	var recycle_warning_timer = null;

	function reset_recycle_warning(){
		if(recycle_warning_timer){
			clearTimeout(recycle_warning_timer);
			recycle_warning_timer = null;
		}
		recycle_warning_flag = false;
		recycle_warning = 0;
	}

	function preview_change_div_color(){
		if(preview_div != null){
			preview_div.style.outline = (recycle_warning % 2 == 0) ? '#AA0000 solid ' + PREVIEW_DIV_PADDING + 'px' : 'none';
		}
		recycle_warning++;
		if(recycle_warning < 4){
			recycle_warning_timer = setTimeout(preview_change_div_color, 150);
		}
		else{
			recycle_warning_timer = null;
			recycle_warning = 0;
		}
	}

	var auto_fetch_np_counter = 0;
	
	function preview_album_auto_fetch_next_page_callback(){
		if(auto_fetch_np_counter < ALBUM_PAGE_AUTO_FETCH_COUNT && preview_album != null){
			auto_fetch_np_counter++;
			preview_album_start_fetching_next_page();
		}
		else{
			auto_fetch_np_counter = 0;
			unregister_fetch_done_callback();
		}
	}
	
	function preview_album_auto_fetch_next_page(){
		if(ALBUM_PAGE_AUTO_FETCH == true && ALBUM_PAGE_AUTO_FETCH_COUNT >= 1 && auto_fetch_np_counter == 0){
			if(preview_album != null){
				auto_fetch_np_counter++;
				register_fetch_done_callback(preview_album_auto_fetch_next_page_callback);
				preview_album_start_fetching_next_page();
			}
		}
	}

	function preview_album_play_coming_photo(dir){
		if((preview_div != null || preview_album != null) && VIEW_STYLE == 0){
			var needCreate = (preview_div == null);
			curr_index = (preview_div != null) ? preview_album_current_source_find_index_by_link(preview_img.src) : ((curr_index == -1) ? 0 : curr_index);
			var recycle_condition = (dir == 1) ? curr_index >= curr_album_source.length - 1 : curr_index <= 0;
			if(Math.abs(curr_index - (curr_album_source.length - 1)) < 3){ //往下滚动，剩余两张图片的时候开始获取下一页
				preview_album_auto_fetch_next_page();
			}
			if( !needCreate && ((recycle_condition && (recycle_warning_flag == false || fetch_page_imgs_flag == true))
				|| curr_album_source.length == 1) ){
				if(recycle_warning_timer == null){
					preview_change_div_color();
				}
				recycle_warning_flag = true;
				return true;
			}
			recycle_warning_flag = false;
			curr_index = (preview_div != null) ? (recycle_condition ? ((dir == 1) ? 0 : curr_album_source.length - 1) : curr_index + dir) : curr_index;
			preview_album_show_coming_photo(curr_index);
			return true;
		}
		return false;
	}

	function preview_album_play_next(){
		return preview_album_play_coming_photo(1);
	}

	function preview_album_play_previous(){
		return preview_album_play_coming_photo(-1);
	}

	function preview_album_main_ind (source){
		if(preview_iframe_in_album){
			return;
		}
		
		curr_page_document = document;
		curr_page_i = 1;
		curr_album_source = [];
		curr_album_source = filter_album_source(source);
		if(album_display_lock){
			album_display_lock = false;
			return;
		}
		destroy_album_icon();
		create_preview_album();
		preview_album_set_photos(curr_album_source);
		preview_album_start_preload(curr_album_source);
		getNextPageSettings();
	}

	function preview_album_main(){
		if(preview_iframe_in_album){
			return;
		}
	
		destroy_all_preview();
		if(preview_album == null){
			if(window.top == window){
				album_frame_count = $$('iframe[src]').length;
				album_source = [];
				album_source = generate_album_source(document.images);
				if(album_frame_count == 0){
					preview_album_main_ind(album_source);
				}
				else{
					album_frame_count = window.frames.length;
					for(var i = 0; i < window.frames.length; i++){
						window.frames[i].postMessage('MSG_ID_SUBMIT_IMAGE_DATA_REQ', '*');
					}
					if(album_frame_timeout != null){
						clearTimeout(album_frame_timeout);
					}
					//此处 timer 防止 iframe 都被 urlfilter 过滤，造成 message 无法响应而显示不出界面的情况
					album_frame_timeout = setTimeout(function () {
						album_frame_count = -1;
						preview_album_main_ind(album_source);
						album_frame_timeout = null;
					}, 500);
				}
			}
			else{
				_Message('MSG_ID_CREATE_PREVIEW_ALBUM');
			}
		}
		else{
			destroy_preview_album();
		}
	}

	function key_handler (ev) {
		if(preview_iframe_in_album){
			return;
		}
		
		if(ev.keyCode == 27 /* ESC */){
			var ret = false;
			if(album_in_select_mode){
				var dialog = $('#ujs_preview_ablum_url_list_bg');
				if(dialog){
					preview_album_close_url_list_dialog();
				}
				else{
					preview_album_exit_select_mode();
				}
				ret = true;
			}
			else if(select_node_flag){
				select_node_finish(true);
				ret = true;
			}
			else if(next_page_manager_dialog){
				preview_album_manager_next_page_close_settings();
				ret = true;
			}
			else if(next_page_settings_dialog){
				preview_album_close_next_page_settings();
				ret = true;
			}
			else if(iframe_page){
				$('#ujs_preview_album_iframe_close').click();
				ret = true;
			}
			if(PRESS_ESC_TO_CLOSE && (preview_div != null || preview_exist_in_top) && ! ret){
				destroy_all_preview();
				ret = true;
			}
			if(preview_album != null && ! ret){
				destroy_preview_album();
			}
			_StopEvent(ev);
		}
		else if(ev.keyCode == 32 /* SPACE KEY */ && (preview_album != null || preview_div != null || preview_exist_in_top)){
			if(_tag(ev.target) == 'input' || _tag(ev.target) == 'textarea'){
				return;
			}
			_StopEvent(ev);
			
			ev.shiftKey ? preview_album_play_previous() : preview_album_play_next();
		}
		else if(ev.which == 87 && select_node_flag){ // 'w'
			if(curr_selected_node.parentNode){
				selected_node_stack.push(curr_selected_node);
				select_node_highlight_element(curr_selected_node.parentNode);
			}
		}
		else if(ev.which == 78 && select_node_flag){ // 'n'
			var preNode = selected_node_stack.pop();
			if(preNode){
				select_node_highlight_element(preNode);
			}
		}
	}

	function destroy_album_icon(){
		if(album_icon != null){
			_removeElement(album_icon);
			album_icon = null;
		}
	}
		
	//特例网站设置
	function run_site_setting (){
		var i;
		for(i = 0; i < SITE_STYLE_INFO.length; i++){
			if(SITE_STYLE_INFO[i][0].test(window.location.href)){
				eval(SITE_STYLE_INFO[i][1]);
			}
		}
	}

	function check_current_page() {
		var spec_ele = null;
		var ret = 'NORMAL_PAGE';
		spec_ele = _selectNodes(document, document, '//head/link[@href="resource://gre/res/TopLevelImageDocument.css" or @href="opera:style/image.css"]');
		if(spec_ele.length > 0){
			ret = 'IMG_PAGE';
		}
		/*chrome单独打开一张图片时不执行脚本，免去判断*/
		return ret;
	}

	function onMessage(ev){
		var message = ev.data;
		if(window == window.top){
			if(message.indexOf('MSG_ID_ORIGINAL_SIZE_IMAGE_CREATE') != -1){
				var temp = message.split('+|+|+');
				var x = parseInt(temp[0]), y = parseInt(temp[1]), link = temp[2], delay = parseInt(temp[3]);
				setTimeout(function(){create_preview(x, y, link);}, delay);
			}
			else if(message.indexOf('MSG_ID_ORIGINAL_SIZE_IMAGE_DESTROY_PREVIEW') != -1){
				destroy_preview();
			}
			else if(message.indexOf('MSG_ID_ORIGINAL_SIZE_IMAGE_DESTROY_LOADING') != -1){
				destroy_preview_loading();
			}
			else if(message.indexOf('MSG_ID_CREATE_PREVIEW_ALBUM') != -1){
				preview_album_main();
			}
			else if(message.indexOf('MSG_ID_FOCUS_TO_IFRAME') != -1){
				var obj = json.parse(message);
				var osi_fname = obj.data;
				
				var frames = $$('iframe');
				if(frames && frames.length > 0){
					for(var i = 0; i < frames.length; i++){
						if(frames[i].name == osi_fname){
							scroll_to_element(frames[i], false);
						}
						restoreIframeName(frames[i]);
					}
				}
			}
			else{
				try{
					var obj = json.parse(message);
					var msg = obj.msg;
					var source = obj.data;
					if(msg == 'MSG_ID_SUBMIT_IMAGE_DATA_RSP'){
						if(album_frame_count > 0){
							for(var i = 0; i < source.length; i++){
								album_source.push(source[i]);
							}
							album_frame_count --;
						}
						if(album_frame_count == 0){
							if(album_frame_timeout != null){
								clearTimeout(album_frame_timeout);
							}
							preview_album_main_ind(album_source);
						}
					}
					else if(msg == 'MSG_ID_IFRAME_FETCH_RSP'){
						request_complete_callback(source, true, obj.url);
					}
				}
				catch(e){
				}
			}
		}
		else{
			if(message.indexOf('MSG_ID_SUBMIT_IMAGE_DATA_REQ') != -1){
				var source = generate_album_source(document.images);
				var message = {data: source, msg: 'MSG_ID_SUBMIT_IMAGE_DATA_RSP'};
				_Message(json.stringify(message));
			}
			else{
				try{
					var obj = json.parse(message);
					var arg1 = obj.arg1;
					if(obj.msg == 'MSG_ID_FIND_AND_FOCUS_IMAGE'){
						find_and_focus_image(obj.data, arg1);
					}
				}
				catch(e){
				}
			}
		}
	}

	function dom_content_loaded_hdlr (ev) {
		var osi_frame_name = window.frameElement? window.frameElement.getAttribute('osi_frame_name') : null;
		if(window.name.indexOf('ujs_preview_iframe_fetch_request_') != -1){
			var delay = parseInt(window.name.replace('ujs_preview_iframe_fetch_request_', ''));
			setTimeout(function(){
				var message = {data: document.documentElement.outerHTML, msg: 'MSG_ID_IFRAME_FETCH_RSP', url: window.location.href};
				_Message(json.stringify(message));
			}, delay);
		}
		else if(window.location.href.indexOf('#__ujs_osi_focus__') != -1){
			preview_iframe_in_album = window.location.hash.indexOf('#__ujs_osi_focus__iframe__') != -1;
			var imgSrc = window.location.hash.replace(preview_iframe_in_album ? '#__ujs_osi_focus__iframe__' : '#__ujs_osi_focus__', '').replace(/_-dot-_/g, '.');
			imgSrc = decodeURIComponent(imgSrc);
			find_and_focus_image(imgSrc, true);
		}
		else if(osi_frame_name == 'ujs_osi_album_iframe'){
			preview_iframe_in_album = true;
		}
	}

	function _for_test(){
	}
	
	function main_function () {
		if(check_current_page() == 'IMG_PAGE')
			return false;
		_addStyle(styleStr);
		run_site_setting();
		_VIEW_STYLE = VIEW_STYLE;
		_MIN_AREA = MIN_AREA;
		_CLICK_DIRECT_VIEW = CLICK_DIRECT_VIEW;
		_ALWAYS_CLICK_DIRECT_VIEW = ALWAYS_CLICK_DIRECT_VIEW;
		if(VIEW_STYLE == 1)
			window.addEventListener('mousemove', checkImage, true);
		else
			window.addEventListener('mouseover', checkImage, true);
		if(CLICK_BLANK_TO_CLOSE){
			window.addEventListener('mouseup', closePreviewByClick, true);
		}
		if(!is_undefined(window.onkeydown))
			window.addEventListener('keydown', key_handler, true);
		else
			window.addEventListener('keypress', key_handler, true);
		window.addEventListener('message', onMessage, true);
		window.addEventListener('resize', function(e){
			if(preview_album != null){
				destroy_all_preview(false);
				destroy_preview_album();
			}
			viewWidth = window.opera ? window.innerWidth / (OP_PAGE_PERCENTAGE / 100) : window.innerWidth;
			viewHeight = window.opera ? window.innerHeight / (OP_PAGE_PERCENTAGE / 100) : window.innerHeight;
		}, true);
		if(document.readyState != 'interactive' && document.readyState != 'complete'){
			window.addEventListener('DOMContentLoaded', dom_content_loaded_hdlr, false);
		}
		win.ujs_original_size_image = {
			album_main : preview_album_main,
			album_play_next : preview_album_play_next,
			album_play_previous : preview_album_play_previous,
			_test : _for_test,
		};
		isOpera = !!window.opera;
		isChrome = !!window.chrome;
	}
	main_function();
	if(document.readyState == 'interactive' || document.readyState == 'complete'){
		dom_content_loaded_hdlr(null);
	}
})(typeof unsafeWindow != 'undefined' ? unsafeWindow : window, JSON);

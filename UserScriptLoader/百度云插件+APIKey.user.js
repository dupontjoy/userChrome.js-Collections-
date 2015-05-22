// ==UserScript==
// @name       百度云插件+APIKey
// @namespace  
// @version    4.4.1 beta
// @description  在百度云网盘的页面添加一个搜索框，调用搜索API搜索所有公开分享文件// To add a search frame that calls some api for searching some public shared files in BaiduYun cloud netdisk. 
// @require        http://code.jquery.com/jquery-2.1.1.min.js
// @description  For more imformation,please email me at wang0xinzhe@gmail.com. 
// @include       http://pan.baidu.com/disk/*
// @include      https://pan.baidu.com/disk/*
// @include      https://yun.baidu.com/#from=share_yun_logo/
// @include      http://yun.baidu.com/#from=share_yun_logo/
// @grant       GM_xmlhttpRequest
// @run-at document-end
// @copyright  2014,04,20 __By Wang Hsin-che   
// ==/UserScript==
//////////////////////////////////////////////////////////////////////
/////jQuery draggable plugin v0.2 by Wang Hsin-che @ 2014 08///////////////
/////usage: $(selector).draggable({handel:'handle',msg:{},callfunction:function(){}});
//////////////////////////////////////////////////////////////////////
(function($) {
	$.fn.draggable = function(options) {
		var settings = $.extend({
			handle: undefined,
			msg: {},
			callfunction: function() {}
		}, options);
		var _eleFunc = function() {
			var x0, y0,
				ele = $(this),
				handle;
			handle = (settings.handle === undefined ? ele : ele.find(settings.handle).eq(0) === undefined ? ele : ele.find(settings.handle).eq(0));
			ele.css({
				position: "absolute"
			}); //make sure that the "postion" is "absolute"
			handle.bind('mousedown', function(e0) {
				handle.css({
					cursor: "move"
				}); //set the appearance of cursor 
				x0 = ele.offset().left - e0.pageX; //*1
				y0 = ele.offset().top - e0.pageY; //*1
				$(document).bind('mousemove', function(e1) { //bind the mousemove event, caution:this event must be bind to "document"
					ele.css({
						left: x0 + e1.pageX,
						top: y0 + e1.pageY
					}); //this expression and the expression of *1 equal to "ele.origin_offset+mouse.current_offset-mouse.origin_offset"
				});
				$(document).one('mouseup', settings.msg, function(e) { //when the mouse up,unbind the mousemove event,bind only once
					settings.callfunction(e); //callback function
					$(document).unbind('mousemove');
					handle.css({
						cursor: "auto"
					});
				});
			});

			// 從這裡開始
		};
		return this.each(_eleFunc);
	};
})(jQuery);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////



/////定义
var SearchObject = function($, replaceEle) {
	var keyword = '',
		flag = '',
		info = 'Created by Wang Hsin-che @ 2014 04. The current version is 4.4.0';

	function searchClear() {
		$('#wxz_myDiv').slideUp();
		$('#wxz_input').val('');
		keyword = '';
		$('.wxz-content').empty(); //清空原来的内容
		console.log('clear');
	}

	function search(keyword, startIndex) {
		var url;
		if (keyword === '') {
			console.log('fail');
			return 0;
		}
		console.log('search');
		switch (flag) {
			case 'Google':
				url = 'https://www.googleapis.com/customsearch/v1element?key=AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY&rsz=filtered_cse&num=10&hl=en&prettyPrint=true&source=gcsc&gss=.com&sig=ee93f9aae9c9e9dba5eea831d506e69a&cx=018177143380893153305:yk0qpgydx_e&q=';
				url = url + keyword + '&start=' + startIndex;
				break;
			case 'SOSO':
				url = 'http://www.soso.com/q?query=';
				url = url + keyword + '+site%3Apan.baidu.com' + '&pg=' + parseInt(startIndex / 10, 10) + 1;
				break;
			default:
				console.log('error');
				return 0;
		}
		//显示loading条
		$('.wxz-content').html('<img src="data:image/gif;base64,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" />');
		$('#wxz_myDiv').slideDown();
		GM_xmlhttpRequest({
			method: "GET",
			url: url,
			headers: {
				"User-Agent": "Mozilla/5.0", // If not specified, navigator.userAgent will be used.
				"Accept": "text/xml" // If not specified, browser defaults will be used.
			},
			onload: function(response) {
				var
					data,
					showList,
					tempNode,
					totalPage = 1,
					totalResults;
				switch (flag) {
					case 'Google':
						data = JSON.parse(response.responseText);
						break;
					case 'SOSO':
						data = sosoToData(response.responseText);
						break;
					default:
						console.log('error');
						return 0;
				}
				totalResults = parseInt(data.cursor.estimatedResultCount, 10);
				//把json数据转为html，存入缓存showlist
				if (parseInt(data.cursor.resultCount, 10) === 0) {
					$('.wxz-content').html('<div class="loading-tips" align="center">无搜索结果...换个关键词重新试试？</div>');
				} //无结果时提示
				else {
					totalPage = parseInt((totalResults - 1) / 10, 10) + 1 > 10 ? 10 : parseInt((totalResults - 1) / 10, 10) + 1; //坑比，google自定义搜索只提供最大10页（每页10条）
					showList = "<p align='right'>---- by " + flag + " Search </p><p white-space='normal' class='temp' >keyword is    '" + keyword + "'    found  '" + data.cursor.resultCount + "'  Results</p><p>--------------------------------------------------<p>";
					$.each(data.results, function(index, element) {
						tempNode = '<a href="' + element.unescapedUrl + '"target="_blank">' + element.titleNoFormatting + '</a>';
						showList += '<p><p class="myTitle">' + tempNode + '</p>';
						showList += '<p class="mySnippet">' + element.contentNoFormatting + '</p>';
					});
					showList += '<p><p>-------------------------------------------------------------<p class="temp" margin-left="20px">"' + data.results.length + '"  items have been load </p>';
					$('.wxz-content').html(showList); //替换原来内容，之所以用了showlist作为缓存是为了提升速度
					$('.wxz-content').scrollTop(0); //滚到顶端
				}
				addAboutInfo(info);
				pageBar(parseInt(startIndex / 10, 10) + 1, totalPage);
				data = null;
				tempNode = null;
				totalPage = null;
				totalResults = null;
				showList = null;
			},
			onerror: function() {
				$('.wxz-content').html('<div class="loading-tips" align="center">出错了......</div>');
				console.log("error");
				return 0;
			}
		});
	}

	function addAboutInfo(info) {
		var temp = '<p align="right"><a href="javascript:alert(' + "'" + info + "'" + ')" ><font color="#333">About me</font></a></p>';
		$('.wxz-content').append(temp);
	}

	function sosoToData(html) {
		var begin = html.search('<div id="main">'),
			end = html.search('<div id="bottom">');
		var data = {
				cursor: {
					estimatedResultCount: 0,
					resultCount: 0
				},
				results: []
			},
			rbJquery = $(html.slice(begin, end)).find('.rb');
		$.each(rbJquery, function(index, val) {

			if (index === 0) {
				data.cursor.resultCount = parseInt($(val).find('em').text().replace(',', ''), 10);
				data.cursor.estimatedResultCount = data.cursor.resultCount;
			} else {
				var tempResult = {
					unescapedUrl: "",
					titleNoFormatting: "",
					contentNoFormatting: ""
				};
				tempResult.unescapedUrl = $(val).find("h3 a").attr('href');
				tempResult.titleNoFormatting = $(val).find("h3 a").text();
				tempResult.contentNoFormatting = $(val).find('div.ft').text();
				data.results.push(tempResult);
			}
			/* iterate through array or object */
		});
		return data;
	}

	function pageBar(page, totalPage) {
		var
			html = '\
				<div class="pagese "id="wxz-pagese">\
				<a href="javascript:void(0)" class="page-prev mou-evt">上一页</a>\
				<span class="page-content"></span>\
				<a href="javascript:void(0)" class="page-next mou-evt">下一页</a>\
				</div>\
				',
			pageNodeHtml = '<span class="page-number"></span>',
			i, c,
			startPage = 10 * parseInt((page - 1) / 10, 10) + 1;
		$('#wxz-pagese').replaceWith(html);
		c = $('#wxz-pagese').find('.page-content').eq(0);
		for (i = 0; i < 10; i++) {
			if (i + startPage > totalPage) {
				break;
			}
			if (i + startPage === page) {
				$(pageNodeHtml).html(i + startPage).addClass('global-disabled').appendTo(c);
			} else {
				$(pageNodeHtml).html(i + startPage)
					.bind('click', {
						msg: i + startPage
					}, function(e) {
						search(keyword, (e.data.msg - 1) * 10);
					})
					.appendTo(c);
			}
		}
		if (page <= 1) {
			$('#wxz-pagese').find('.page-prev').eq(0).addClass('global-disabled');
		} else {
			$('#wxz-pagese').find('.page-prev').eq(0).bind('click', {
				msg: page - 1
			}, function(event) {
				search(keyword, (event.data.msg - 1) * 10);
			});
		}
		if (page >= totalPage) {
			$('#wxz-pagese').find('.page-next').eq(0).addClass('global-disabled');

		} else {
			$('#wxz-pagese').find('.page-next').eq(0).bind('click', {
				msg: page + 1
			}, function(event) {
				search(keyword, (event.data.msg - 1) * 10);
			});
		}
		html = null;
		pageNodeHtml = null;
		i = null;
		c = null;
		startPage = null;
	}

	function setUI() {
		//根据屏幕设置div的大小位置
		var
			html_1 = '<div class="search-form" id="wxz_searchForm"><input class="search-query" placeholder=" 搜索公开分享文件" id="wxz_input">\
				<input type="button" value="GO" class="search-button" id="wxz_searchButton"></div>',
			//显示页面的html
			html_2 = '\
	<div class="b-panel b-dialog share-dialog" id="wxz_myDiv" style="z-index:99">\
	<div class="dlg-hd b-rlv" id="wxz_myDiv_title">\
	<div title="关闭" id="wxz_closeButton" class="dlg-cnr dlg-cnr-r"></div>\
	<h3 >搜索</h3>\
	</div>\
	<div class="wxz-content">\
	</div>\
	<div class="offline-bottom">\
	<div class="offline-pageing">\
	<div class="pagese " id="wxz-pagese">\
	</div>\
	</div>\
	</div>\
	</div>\
	',
	html_4='<li node-type="menu-nav" data-key="searcher" class="wxz-menu info-i wxz-dropdown has-pulldown">\
                <em class="f-icon pull-arrow"></em>\
                <span node-type="username" class="name top-username" id="wxzMenuDisplay" style="width: auto;">'+flag+'</span>\
                <div node-type="menu-list" class="wxz-menu-content pulldown user-info" style="display: none;">\
                	<em class="arrow"></em>\
                    <div class="content" style="height:auto">\
                        <span node-type="click-ele" data-key="SOSO" class="li wxz-menu-option">\
                            <a >by SOSO</a>\
                        </span>\
                        <span node-type="click-ele" data-key="Google" class="li wxz-menu-option">\
                            <a >by Google</a>\
                        </span>\
                        </div>\
                </div>\
            </li>\
	',
				cssText = '\
	<style type="text/css">\
		#wxz_searchButton{background-image:none;cursor:pointer;background-color: rgb(155, 154, 154);color: #ffffff;}\
			.wxz-content{line-height: 200%;text-align: left;white-space: normal;margin-left:20px;overflow:auto;}\
			.wxz-close{margin-right:20px;important;height:20px;cursor:pointer}\
			.wxz-next{margin-right:20px;float:right;height:20px;cursor:pointer}\
			.wxz-front{margin-right:40px;float:right;height:20px;cursor:pointer}\
			.wxz-content a{color:#0066FF!important;font: 14px/1.5 arial,sans-serif!important;}\
	</style>\
					';
		switch (replaceEle) {
			case '#top_menu_other':
				$(replaceEle).replaceWith(html_1); //搜索栏替换了广告
				break;
			case 'div.remaining':
				$(replaceEle).before(html_1);
				$('#wxz_searchForm').addClass('side-options');
				$('#wxz_searchButton').css({
					width: 40
				});
				break;
		}
		$('div.info.clearfix ul').prepend(html_4);//切换按钮

		$('body').append(html_2);
		$('head:first').append(cssText); //插入css

		//应用大小和页面
		$('.wxz-content').css({
			height: window.innerHeight / 3 * 2
		});
		$('#wxz_myDiv').css({
			top: window.innerHeight / 8,
			left: window.innerWidth / 4
		});
		//应用拖拽
		$("#wxz_myDiv").draggable({
			handle: "#wxz_myDiv_title"
		});
	}

	function bind() {
		//绑定各种函数
		$('#wxz_searchButton').click(function() {
			keyword = $('#wxz_input').val();
			search(keyword, 0);
		});
		$('#wxz_closeButton').click(function() {
			searchClear();
		});
		$('.li.wxz-menu-option').click(function(){
			flag=$(this).attr('data-key');
			$('#wxzMenuDisplay').text(flag);
			$('.wxz-menu-content').hide();
		});
		$('#wxz_input').keyup(function(event) {
			if (event.which == 13) {
				$('#wxz_searchButton').trigger('click');
			}
		});
	
}	return {
		init: function(option) {
			var
				t = window.setInterval(function() { //百度云把一些内容放到后面加载,因此我设置了一个延时循环，每隔100ms选择一下所需的元素，当所需的元素存在时，开始脚本，同时停止延时循环
					if ($(replaceEle).length > 0) {
						window.clearInterval(t);
						flag = option;
						setUI();
						bind();
					}
					console.log('waiting');
				}, 100);
		},
	};
};

//根据屏幕分辨率选择替换的元素
var ele = (window.innerWidth > 1024 ? '#top_menu_other' : 'div.remaining');

//启动
SearchObject(jQuery, ele).init('SOSO'); //to use google, please replace 'SOSO' with 'Google';
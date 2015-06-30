/**
 * 作者：黎柏文
 * 个人主页：http://libowen.com 
 * 作品主页：http://mimace.com/tool/soft_keyboard 
 * 时间：2012年8月19日 
 * 功能：在页面中插入软键盘（虚拟键盘）
 **/

if( document.getElementById("com_keyboard_panel") ){
	if(document.getElementById("com_keyboard_panel").style.display=="block"){
		document.getElementById("com_keyboard_panel").style.display="none";
	} else {
		document.getElementById("com_keyboard_panel").style.display="block";
	}
} else {

//必须重新赋值，如承接旧的，则GG下有类权限问题
com_keyboard = [];
com_keyboard.can_inps=[];
com_keyboard.shift = false;
com_keyboard.capslock = false;
com_keyboard.write="";
com_keyboard.write_val="";

//com_keyboard_panel拖拽移动
com_keyboard._IsMousedown = 0;
com_keyboard._ClickLeft = 0;
com_keyboard._ClickTop = 0;

com_keyboard.moveInit = function(divID,evt){ 
	if(!evt){
		evt=divID;
		divID="com_keyboard_panel";
	}
	if(!com_keyboard._ClickLeft && ((com_keyboard.getBrowserType=="ie" && navigator.appVersion.indexOf("MSIE 9")==-1) || com_keyboard.getBrowserType=="opera" ) ){	
		//首次初始化 //opera的渲染有问题，所以也要换
		document.getElementById(divID).style.position="absolute";
	}

    var obj = document.getElementById(divID);
	var ex,ey;
	if(com_keyboard.getBrowserType == "ie"){
		ex=evt.x;
		ey=evt.y;
	} else {
		ex=evt.pageX;
		ey=evt.pageY;
	}
	
	if(obj.style.position=="absolute"){ 
		//absolute
		if(obj.style.left){
			com_keyboard._ClickLeft = ex - parseInt(obj.style.left);
		} else {
			com_keyboard._ClickLeft=180;
		}
		if(obj.style.top){
			com_keyboard._ClickTop = ey - parseInt(obj.style.top);
		} else {
			com_keyboard._ClickTop=10;
		}
	} else {
		//支持fixed的情况
		if(obj.style.right){
			com_keyboard._ClickLeft = parseInt(obj.style.right) + ex;
		} else {
			com_keyboard._ClickLeft=3;
		}
		if(obj.style.bottom){
			com_keyboard._ClickTop = parseInt(obj.style.bottom) + ey;
		} else {
			com_keyboard._ClickTop=3;
		}
	}
    com_keyboard._IsMousedown = 1;
};

com_keyboard.Move = function(divID,evt){ 
	if(!evt){
		evt=divID;
		divID="com_keyboard_panel";
	}
    if(com_keyboard._IsMousedown == 0){
     	return;
    }
    var objDiv = document.getElementById(divID);
	var ex,ey;
	if(com_keyboard.getBrowserType == "ie"){
		ex=evt.x;
		ey=evt.y;
	} else {
		ex=evt.pageX;
		ey=evt.pageY;
	}
	if(objDiv.style.position=="absolute"){
		objDiv.style.left = String(ex - com_keyboard._ClickLeft)+"px";
		objDiv.style.top = String(ey - com_keyboard._ClickTop)+"px";
	} else {
		objDiv.style.right = String(com_keyboard._ClickLeft - ex)+"px";
		objDiv.style.bottom = String(com_keyboard._ClickTop - ey)+"px";
	}
};

com_keyboard.stopMove = function(){
    com_keyboard._IsMousedown = 0;
};

com_keyboard.getBrowserType = (function(){
	if(!-[1,]){
		return "ie";
	} else {
		if(window.navigator.userAgent.indexOf("Opera")>=0){
			return "opera";
		} else {
			return "other";
		}
	}
})();
//////END div拖拽移动


//指定填写栏
com_keyboard.focus_event=function(){
	com_keyboard.write=this;
	com_keyboard.write_val=this.value;
};

//初始化input相关，包括绑定事件和获取可填写的input
com_keyboard._input=function(){
	//location.hash="#"+Math.random();
	var inputs=document.getElementsByTagName("input");
	var can_inps=[];
	var type_val="";
	for(var i=0; i<inputs.length; i++){
		type_val=inputs[i].getAttribute("type");
		if(type_val!="button" && type_val!="checkbox" 
		&& type_val!="radio" && type_val!="image" && type_val!="file" 
		&& type_val!="submit" && type_val!="reset" 
		&& inputs[i].getAttribute("disabled")!="disabled"){
			if(type_val!="hidden" && type_val!="none" && inputs[i].style.visibility!="hidden"){
				can_inps[can_inps.length]=inputs[i];
			}
			com_keyboard.add_event(inputs[i], "focus", com_keyboard.focus_event);
		}
	}
	com_keyboard.can_inps=can_inps;
};

//软键盘相关
com_keyboard.click_event=function(evt){
	var t=this;
	////console.log(com_keyboard);
	if(!com_keyboard.write){
		com_keyboard.write=com_keyboard.can_inps[0];
		if(!com_keyboard.write){
			alert("获取不到填写框！");
			return false;
		}
	}
	
	//删除IE6时字母前多带的一个空格 
	character = (t.innerHTML).replace(" ", ""); // If it's a lowercase letter, nothing happens to this variable
	
	if(character=="关闭"||character=="关闭软键"|| character.toLowerCase()=="close"){
		com_keyboard.write.focus();
		return false;
	}
	if(character=="清空"){
		com_keyboard.write.value="";
		com_keyboard.write.focus();
		return false;
	}
	
	var t_class=t.className;
	
	var lis=document.getElementById("com_keyboard_panel").getElementsByTagName("li");
	var letter=[];
	var symbol=[];
	var temp_class_name="";
	var nodes="";
	for(var k=0; k<lis.length; k++){
		temp_class=lis[k].className;
		if(temp_class.indexOf("letter")!=-1){
			letter[letter.length]=lis[k];
		} else {
			if(temp_class.indexOf("symbol")!=-1){
				symbol[symbol.length]=lis[k];
			}
		}
	}
		
	// Shift keys
	if (t_class.indexOf("left-shift")!=-1 || t_class.indexOf("right-shift")!=-1) {
		//$(".letter").toggleClass("uppercase");
		//$(".symbol span").toggle();
		for(var k=0; k<letter.length; k++){
			if( (letter[k].className).indexOf("uppercase")!=-1){
				letter[k].className="letter";
			} else {
				letter[k].className="letter uppercase";
			}
		}
		for(var k=0; k<symbol.length; k++){
			nodes=symbol[k].childNodes;
			for(var i=0;i<nodes.length;i++){
				if(nodes[i].className=="on"){
					nodes[i].className="off";
				} else {
					nodes[i].className="on";
				}
			}
		}
		
		com_keyboard.shift = (com_keyboard.shift === true) ? false : true;
		com_keyboard.capslock = false;
		com_keyboard.write.focus();
		return false;
	}
	
	// Caps lock
	if (t_class.indexOf("capslock")!=-1) {
		//$(".letter").toggleClass("uppercase");
		for(var k=0; k<letter.length; k++){
			if( (letter[k].className).indexOf("uppercase")!=-1){
				letter[k].className="letter";
			} else {
				letter[k].className="letter uppercase";
			}
		}
		com_keyboard.capslock = true;
		com_keyboard.write.focus();
		return false;
	}
	
	// Delete
	if (t_class.indexOf("delete")!=-1) {
		var val = com_keyboard.write.value;
		com_keyboard.write.value=val.substr(0, val.length - 1);
		com_keyboard.write.focus();
		return false;
	}
	
	// Special characters
	if (t_class.indexOf("symbol")!=-1){ 
		//character = $("span:visible", $this).html(); 
		nodes=t.childNodes;
		for(var i=0;i<nodes.length;i++){
			if(nodes[i].className=="off"){
				character = nodes[i].innerHTML;
				switch(character){
					case "&lt;":
						character="<";
					break;
					case "&gt;":
						character=">";
					break;
					case "&amp;":
						character="&";
					break;
					case "&quot;":
						character="\"";
					break;
					default:
					
					break;
				}
				break;
			}
		}
	}
	if (t_class.indexOf("space")!=-1){ character = " "; }
	
	if (t_class.indexOf("tab")!=-1){
		//tab鼠标跳到下个input[name]:visible且type!=hidden
		//兼容后生成的input（有必要）
		com_keyboard._input();
		////
		var can_inps_length=com_keyboard.can_inps.length;
		var next_inp=com_keyboard.can_inps[0];
		for(var i=0;i<can_inps_length; i++){
			if(com_keyboard.can_inps[i]==com_keyboard.write){
				if(can_inps_length<=i+1){
					next_inp=com_keyboard.can_inps[0];
				} else {
					next_inp=com_keyboard.can_inps[i+1];
				}
				break;
			}
		}
		com_keyboard.write=next_inp;	//兼容部分input无法触发focus事件
		try{ next_inp.focus(); }catch(e){}
		return false;
	}
	if (t_class.indexOf("return")!=-1){ character = "\r\n"; }
	
	// Uppercase letter
	if (t_class.indexOf("uppercase")!=-1){ character = character.toUpperCase(); }
	
	// Remove shift once a key is clicked.
	if (com_keyboard.shift === true) {
		//$(".symbol span").toggle();
		for(var k=0; k<symbol.length; k++){
			nodes=symbol[k].childNodes;
			for(var i=0;i<nodes.length;i++){
				if(nodes[i].className=="on"){
					nodes[i].className="off";
				} else {
					nodes[i].className="on";
				}
			}
		}
		if (com_keyboard.capslock === false){ 
			//$(".letter").toggleClass("uppercase"); 
			for(var k=0; k<letter.length; k++){
				if( (letter[k].className).indexOf("uppercase")!=-1){
					letter[k].className="letter";
				} else {
					letter[k].className="letter uppercase";
				}
			}
		}
		
		com_keyboard.shift = false;
	}
	
	// Add the character
	if(com_keyboard.write_val===""){	//兼容部分js控制提示信息的情况
		com_keyboard.write.value=character;
	} else {
		com_keyboard.write.value+=character;
	}
	com_keyboard.write.focus();
};


//绑定面板事件（注意：后生成的input绑定不到）
com_keyboard.add_event=function(node, type, listener){
	// IE,傲游支持attachEvent;而火狐,netscape支持addEventListener  
	if(node.addEventListener) {
		node.addEventListener(type, listener, true);
	} else if(node.attachEvent) {
		node['e' + type + listener] = listener; 		//这句修复IE事件中this指向错误。修复后，this指向node
		node[type + listener] = function() {
			node['e' + type + listener](window.event); 	//修复IE事件中第一个参数不是EVENT的问题，标准DOM事件，第一个参数是event
		};
		node.attachEvent('on' + type, node[type + listener]);
	}
};

//关闭软键盘
com_keyboard.close=function(){
	document.getElementById("com_keyboard_panel").style.display="none";
}

//载入后执行
com_keyboard.load=function(){
	//插入面板的样式
	var style_val="#com_keyboard_panel{display:block;text-align:left;z-index:99999999;background-color:#3B5998;border:0 none;border-radius:3px;bottom:3px;right:3px;height:96px;margin:0px;padding:24px 0px 0px 2px;width:318px;font-family:Arial,Sans-Serif;font-size:14px;clear:both;position:fixed;+position:absolute;_position:absolute;+top:200px;_top:200px;top:200px\\0;}";
	style_val+="#com_keyboard_panel div {margin:0px;padding:0px;float:left;clear:none;border:0 none;overflow:hidden;}";
	style_val+="#com_keyboard_panel a {color:black;text-decoration:none;margin:0px;padding:0px;float:left;clear:none;border:0 none;overflow:hidden;}";
	style_val+="#com_keyboard_panel a:hover {color:#3B5998;text-decoration:underline;}";
	//style_val+="#com_keyboard{margin:0px;padding:0px;list-style:none;}";
	style_val+="#com_keyboard{margin:0px;padding:0px;list-style:none;width:318px;height:95px;display:block;}";
	style_val+="#com_keyboard_panel .btn,#com_keyboard li { font-family: Arial,Sans-Serif;color:black;font-size: 14px;float: left;margin:0px 2px 2px 0px;padding:0px;width:18px;height:20px;line-height:20px;text-align:center;background:#fff;border:1px solid #f9f9f9;border-radius: 2px; -moz-border-radius: 2px; -webkit-border-radius: 2px;}#com_keyboard .capslock, #com_keyboard .tab, #com_keyboard .left-shift { clear: left;}#com_keyboard .tab, #com_keyboard .delete { width: 28px;}#com_keyboard .capslock { width: 30px;}#com_keyboard .return { width: 38px;}#com_keyboard .left-shift { width: 33px;}#com_keyboard .right-shift { width: 50px;}#com_keyboard .space { width: 50px;}#com_keyboard .lastitem { margin-right: 0px;}#com_keyboard .uppercase { text-transform: uppercase;}#com_keyboard .on { display: none;}#com_keyboard .off { display: inline;}#com_keyboard li { cursor: pointer; cursor: hand;}#com_keyboard_panel .btn:hover,#com_keyboard li:hover { position: relative; top: 1px; left: 1px; border-color: #e5e5e5; cursor: pointer; color:#3B5998;}";
	style_val+="#com_keyboard_panel .btn{background-color:#EEEEEE;border:1px solid #CCCCCC;float:right;font-size:12px;height:14px;line-height:14px;margin:1px 1px 0px 4px;padding:1px 3px;width:auto;cursor:pointer;cursor:hand;}";
	
	//插入面板
	var new_panel=document.createElement("div");
	new_panel.style.width="auto";
	new_panel.style.height="auto";
	new_panel.style.overflow="auto";
	new_panel.style.display="block";
	//var panel_script=' onmousedown="com_keyboard.moveInit(\'com_keyboard_panel\',event);" onmousemove="com_keyboard.Move(\'com_keyboard_panel\',event);" onmouseup="com_keyboard.stopMove();" onmouseout="com_keyboard.stopMove();" ';
	var panel_script=' ';
	var panel_val='<div id="com_keyboard_panel" style="right:3px;bottom:3px;" >';
	panel_val+='<div style="position:absolute;background-color:#EFFFEF;border-radius:2px;height:20px;width:316px;margin:-22px 0px 0px;padding:0px;cursor:move;"><div class="btn" style="float:left;margin:2px 0px 0px 0px;background-color:#EFFFEF;border:none;"><a href="http://mimace.com/tool/soft_keyboard/" target="_blank" title="软键盘 | 虚拟键盘 | Soft keyboard | Virtual keyboard">软键盘 | Soft keyboard</a></div><div title="按住可拖拽移动软键盘位置 | Press down and can drag soft keyboard" '+panel_script+' style="float:left;margin:0px;height:19px;width:106px;cursor:move;background-color:#EFFFEF;border:none;"></div><div class="btn" title="关闭软件盘 | Close soft keyboard" id="com_keyboard_close_btn">关闭</div><div class="btn" title="打开使用帮助"><a href="http://mimace.com/tool/soft_keyboard/" target="_blank">帮助</a></div></div>';
	panel_val+='<div style="background-color:none;height:118px;margin:-23px 0px 0px -10px;position:absolute;width:12px;overflow:hidden;"></div>';
	panel_val+='<ul id="com_keyboard">';
	panel_val+='<li class="symbol"><span class="off">`</span><span class="on">~</span></li><li class="symbol"><span class="off">1</span><span class="on">!</span></li><li class="symbol"><span class="off">2</span><span class="on">@</span></li><li class="symbol"><span class="off">3</span><span class="on">#</span></li><li class="symbol"><span class="off">4</span><span class="on">$</span></li><li class="symbol"><span class="off">5</span><span class="on">%</span></li><li class="symbol"><span class="off">6</span><span class="on">^</span></li><li class="symbol"><span class="off">7</span><span class="on">&amp;</span></li><li class="symbol"><span class="off">8</span><span class="on">*</span></li><li class="symbol"><span class="off">9</span><span class="on">(</span></li><li class="symbol"><span class="off">0</span><span class="on">)</span></li><li class="symbol"><span class="off">-</span><span class="on">_</span></li><li class="symbol"><span class="off">=</span><span class="on">+</span></li><li class="delete lastitem">&larr;</li>';
	panel_val+='<li class="tab" title="切换到下一个填写框 | Switch to the next fill in the box" >tab</li><li class="letter">q</li><li class="letter">w</li><li class="letter">e</li><li class="letter">r</li><li class="letter">t</li><li class="letter">y</li><li class="letter">u</li><li class="letter">i</li><li class="letter">o</li><li class="letter">p</li><li class="symbol"><span class="off">[</span><span class="on">{</span></li><li class="symbol"><span class="off">]</span><span class="on">}</span></li><li class="symbol lastitem"><span class="off">\\</span><span class="on">|</span></li>';
	panel_val+='<li class="capslock" title="大或小写字母锁定 | Uppercase or lowercase lock">caps</li><li class="letter">a</li><li class="letter">s</li><li class="letter">d</li><li class="letter">f</li><li class="letter">g</li><li class="letter">h</li><li class="letter">j</li><li class="letter">k</li><li class="letter">l</li><li class="symbol"><span class="off">;</span><span class="on">:</span></li><li class="symbol"><span class="off">\'</span><span class="on">&quot;</span></li><li class="letter" title="清空当前填写框 | empty this input" style="width:38px;" >清空</li>';
	panel_val+='<li class="left-shift" title="切换键 | Shift">shift</li><li class="letter">z</li><li class="letter">x</li><li class="letter">c</li><li class="letter">v</li><li class="letter">b</li><li class="letter">n</li><li class="letter">m</li><li class="symbol"><span class="off">,</span><span class="on">&lt;</span></li><li class="symbol"><span class="off">.</span><span class="on">&gt;</span></li><li class="symbol"><span class="off">/</span><span class="on">?</span></li><li title="空格 | Space" class="space lastitem" style="width:57px;">&nbsp;</li>';
	panel_val+='</ul>';
	panel_val+='</div>';
	new_panel.innerHTML=panel_val+"<style type=\"text/css\">"+style_val+"</style>";
	document.body.appendChild(new_panel);
	
	//初始化：
	com_keyboard._input();
	var areas=document.getElementsByTagName("textarea");
	for(var i=0; i<areas.length; i++){
		com_keyboard.add_event(areas[i], "focus", com_keyboard.focus_event);
	}
	
	var panel=document.getElementById("com_keyboard_panel");
	
	//尽可能完善
	//console.log(panel.getElementsByTagName("div")[5]);
	com_keyboard.add_event(panel.getElementsByTagName("div")[5], "mouseout", com_keyboard._input);
	com_keyboard.add_event(panel.getElementsByTagName("div")[1], "mouseout", com_keyboard._input);
	
	//绑定软键盘按键事件
	var lis=panel.getElementsByTagName("li");
	for(var i=0; i<lis.length; i++){
		com_keyboard.add_event(lis[i], "click", com_keyboard.click_event);
	}
	
	//绑定拖拽移动
	var move=panel.getElementsByTagName("div")[0].getElementsByTagName("div")[1];
	com_keyboard.add_event(move, "mouseout", com_keyboard.stopMove);
	com_keyboard.add_event(move, "mouseup", com_keyboard.stopMove);
	com_keyboard.add_event(move, "mousemove", com_keyboard.Move);
	com_keyboard.add_event(move, "mousedown", com_keyboard.moveInit);
	
	//绑定关闭，隐藏软键盘的按钮事件
	com_keyboard.add_event(document.getElementById("com_keyboard_close_btn"), "click", com_keyboard.close);
	
	//动态添加的input或textarea也可获取到
	if(document.body.attachEvent){	
		document.body.attachEvent( "onclick", function(event) { 
			var tag_name=(event.srcElement.tagName).toLowerCase();
			var temp=event.srcElement.getAttribute("type");
			if((tag_name=="input" && (!temp || temp=="text" || temp=="password" || temp=="email" || temp=="phone" || temp=="number")) || tag_name=="textarea"){
				com_keyboard.write=event.srcElement;
			}
		});
	} else if(document.body.addEventListener){
		document.body.addEventListener( "click", function(client) { 	
			var tag_name=(client.target.tagName).toLowerCase();
			var temp=client.target.getAttribute("type");
			if((tag_name=="input" && (!temp || temp=="text" || temp=="password" || temp=="email" || temp=="phone" || temp=="number")) || tag_name=="textarea"){
				com_keyboard.write=client.target;
			}
		});
	}
};

com_keyboard.load();

}

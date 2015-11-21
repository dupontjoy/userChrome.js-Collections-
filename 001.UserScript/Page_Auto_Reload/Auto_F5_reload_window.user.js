// ==UserScript==
// @name        Auto F5 reload window 
// @namespace   http://userscripts.org/scripts/show/41891
// @version     0.53-20151121
// @author      paulonkey 
// @include 	http://ic.sjlpj.cn/*
// @grant		GM_deleteValue 
// @grant		GM_getValue
// @grant		GM_setValue 
// @description Reloads (aka refreshs) a webpage after a certian time. Config menu with "Shift + T". Autodetects language: English, German, Spanish and Dutch
// ==/UserScript==

/* I do not develop this project any more since Tab Mix Plus includes an autoreload button. If anyone is interested in bringing this project forwards, please tell me and I will set a link to the corresponding script page. */

/* Everybody is free to reuse this code for whatever he wants to. 
 Even for commercial purposes (LOL: would anybody of you pay for a crappy GM-script?!) 
 If there are questions please contact me at copa-cabana@gmx.de*/

/********************************************
           LANGUAGE SETTINGS
********************************************/

// console.log("start");

var lang = 5;
/* if you create another language, please contact me, to include the new language. */
if (window.navigator.language=='de')
   lang = 1;
if (window.navigator.language=='es')
   lang = 2;
if (window.navigator.language=='nl') //Thanks to Jos Zonneveld
   lang = 3;
if (window.navigator.language=='fr') //Thanks to Yves Michon 
   lang = 4;
if (window.navigator.language=='zh') //Thanks to Leonardo Ql
   lang = 5;

/*Messages in different languages.
Array(English, Deutsch, Español, Nederlands, Français, 普通话) */

//console.log("lang OK");

reload = [	'How often would you like your page to reload?  This number is in seconds.',	'In welchem Intervall -in Sekunden- soll die Seite neugeladen werden?',	'Cada cuantos segundos quiere actualizar la página?',	'Hoe vaak wilt u de pagina verversen?, Interval is in seconden',	'À quelle fréquence diriez-vous recharger votre page ? Ce nombre est en secondes.',	'How often would you like your page to reload?  This number is in seconds.'	];
statusbar_before_time = [	'',	'Die Seite wird in ',	'La página será cargada de nuevo en ',	'De pagina wordt in ',	'La page sera rechargée dans',	''	];
statusbar_behind_seconds = [	' seconds remaining...',	' Sekunden neugeladen...',	' segundos...',	' seconden over...',	'secondes restantes ...',	' 时间还剩...秒'	];
statusbar_behind_minutes = [	' minutes remaining...',	' Minuten neugeladen...',	' minutos...',	' minuten over...',	'minutes restantes ...',	' 时间还剩...分钟'	];
statusbar_behind_hours = [	' hours remaining...',	' Stunden neugeladen...',	' horas...',	' uren over...',	'heures restantes ...',	'  时间还剩...小时'	];
statusbar_stop_refresh = [	'The countdown has been cancelled...',	'Die Aktualisierung wurde abgebrochen...',	'La cuenta atrás ha sido cancelada...',	'Het aftellen is geannuleerd...',	'Le compte à rebours a été annulé ...',	' 倒计时已经取消...'	];
offline_box_message = [	'Lost connection to site. Page will be reloaded, when the connection is restored...',	'Verbindung fehlgeschlagen. Die Seite wird neugeladen, sobald wieder eine Verbindung besteht... ',	'Pérdida de conexion. La página será recargada cuando se recupere la conexion...',	'Verbinding met site verbroken. Als de verbinding is hersteld, zal de pagina opnieuw worden geladen...',	'la connexion au site est perdu. La page sera rechargée, lorsque la connexion sera rétablie ...',	'与网站失去连接，当连接恢复时，页面将被重新加载...'	];
options_title = [	'\"Auto F5 reload window\" options',	'Optionen für \"Auto F5 reload window\"',	'Opciones de \"Auto F5 reload window\"',	'\"Auto F5 reload window optie\'s\"',	' options de\"Auto F5 reload window\" ',	'\"Auto F5 reload window\" 设置'	];
options_default_timeout = [	'Default timeout',	'Standardtimeout',	'Tiempo de recarga estándar',	'Standaard timeout',	'délai par défaut',	'默认的超时时间'	];
options_timeout = [	'Timeout for this page',	'Timeout der aktuellen Seite',	'Tiempo de recarga de esta página',	'Timeout voor deze pagina',	' delai pour cette page',	'此网页超时时间'	];
options_random = [	'Add random value to timeout between 0 and',	'Zufallswert zu Timeout hinzufügen. Zwischen 0 und',	'Añadir número aleatorio entre 0 y',	'Voeg een willekeurige waarde aan timeout toe, tussen 0 en',	'Ajout de la valeur du délai d\'attente aléatoire compris entre 0 et',	'添加超时随机值，介于0和'	];
options_hotKeys = [	'Show and hide menu ',	'Menü ein- und ausblenden ',	'Mostrar y esconder menu ',	'Toon en verberg menu ',	'Afficher et masquer le menu',	'唤醒菜单快捷键'	];
options_separators = [	'Ignore everything after these symbols in URL(separate with spaces)',	'Ignoriere URLs nach folgenden Symbolen(mit Leerzeichen trennen)',	'Ignorar todo despues de estos símbolos en URLs (separar con espacios)',	'Negeer alles na deze symbolen in URL(gescheiden door spatie\'s)',	'Tout ignorer après ces symboles dans l\'URL (séparés par des espaces)',	'忽略网址这些符号之后的一切（用空格分隔）'	];
options_separators_incl = [	'Include the separators in the URL saved',	'Speichere URLs einschließlich Trennsymbole',	'Incluir separadores en la URL',	'Scheidingstekens insluiten in de opgeslagen URL',	'Inclure les séparateurs dans l\'URL enregistrée',	'包括保存URL中的分隔符'	];
options_autoclose = [	'Hide menu when clicking outside the menu',	'Bei Click außerhalb des Menüs, Menü ausblenden',	'Ocultar menú al clickear fuera del menú',	'Verberg menu als er buiten het menu wordt geklikt',	'Masquer le menu lorsque vous cliquez en dehors du menu',	'单击菜单外时隐藏菜单'	];
options_click_extend = [	'Prolong timeout on mouseclicks or keyboard input',	'Bei Mausklicks oder Tastatureingaben Timeout hinauszögern',	'Prolongar cuenta atras cliqueando o tecleando',	'Verleng timeouts muis klik of toetsenbord invoer',	'Prolongez le délai sur les clics de souris ou du clavier',	'当本页有鼠标和键盘活动时超时刷新'	];
options_refresh_all = [	'Reload all pages with default timeout, which has no timeout set',	'Aktualisiere alle Seiten mit Standardtimeout, für die kein Timeout gesetzt wurde',	'Actualiza todas las páginas con tiempo de recarga estándar, sin propio tiempo de recarga',	'Herlaad alle pagina\'s met standaard time-out, welke niet ingesteld zijn op standaard',	'Recharger toutes les pages avec temporisation par défaut, ce qui n\'a pas un délai défini',	'重新装入默认的超时时间，它没有超时设置所有页面'	];
options_btn_ok = [	'OK',	'OK',	'OK',	'OK',	'OK',	'确定'	];
options_btn_cancel = [	'Cancel',	'Abbrechen',	'Cancelar',	'Annuleren',	'annuler',	'取消'	];
options_btn_abort = [	'Abort reload',	'Neuladen verhindern',	'Abortar recarga',	'Herladen afbreken',	'Abandonner le rechargement',	'重置本页'	];
options_number_format = [	'Format examples: hh:mm:ss, h:m:ss, m:sss, s etc. like 1:20:30 oder 500 oder 3:100',	'Formatbeispiele: hh:mm:ss, h:m:ss, m:sss, s, also 1:20:30 oder 500 oder 3:100',	'Ejemplos de formato: hh:mm:ss, h:m:ss, m:sss, s etc. como 1:20:30 oder 500 oder 3:100',	'Formaat voorbeelden: hh:mm:ss, h:m:ss, m:sss, s etc. zoals 1:20:30 of 500 of 3:100',	'Format exemples: hh:mm:ss, h:m:ss, m:sss, s etc. comme 1:20:30 ou 500 ou 3:100',	'超时时间格式表达，例如 时时:分分:秒, 时:分:秒, 分:秒, 秒 等。就像 1:20:30 或者 500 或者3:100'	];
num_err_default = [	'Please enter a positiv numeric value for default timeout.',	'Bitte eine positive ganze Zahl für Standardtimeout eingeben.',	'Introducir número entero y postivo de tiempo de recarga estándar por favor',	'A.u.b. voer een positief getal in voor standaard time-out',	'S\'il vous plaît entrer une valeur numérique positive de delai par défaut.',	'请输入一个缺省的超时数字值。'	];
num_err_timeout = [	'Please enter a positiv numeric value for timeout.',	'Bitte eine positive ganze Zahl für Timeout eingeben.',	'Introducir número entero y postivo de tiempo de recarga por favor',	'A.u.b. voer een positief getal in voor time-out',	'S\'il vous plaît entrer une valeur numérique positive de delai.',	'请输入一个超时数字值。'	];
num_err_random = [	'Please enter a positiv numeric value for random value.',	'Bitte eine positive ganze Zahl für Zufallszahl eingeben.',	'Introducir número entero y postivo de número aleatorio por favor',	'A.u.b. voer een positief getal in voor een willekeurige waarde',	'S\'il vous plaît entrer une valeur numérique positive pour la valeur aléatoire.',	'请输入一个随机值数值。'	];
time_format_err = [	'Please do not enter more than three \':\'',	'Bitte nicht mehr als drei \':\' eingeben',	'No poner mas de tres \':\' por favor',	'A.u.b. voer niet meer dan drie \':\'',	'S\'il vous plaît ne pas entrer plus de trois \':\'',	'请不要输入超过三个 \':\''	];
hotkey_err = [	'Please enter a hotkey.',	'Bitte geben Sie ein Hotkey ein.',	'Por favor introduzca un hotkey.',	'A.u.b. voer een sneltoets in',	'S\'il vous plaît entrer un raccourci clavier.',	'请设置一个快捷键'	]; 

// console.log("messages OK");

/********************************************
               SETUP VARIABLES
********************************************/
/* Kill all arguments in the URL that are parameters, especially sessions, to
   Avoid infinite duplicate entries in about:config (where GM-vars are saved). */
var separators = GM_getValue('separators',"; ? #");
var sepArray = separators.split(" ");
var thepage = location.href;
for (var i = 0; i < sepArray.length; i++){
	if(sepArray[i].length>0 && thepage.indexOf(sepArray[i])>-1){
		thepage = thepage.substring(0,thepage.indexOf(sepArray[i]));
	}
}

/* Read other values from about:config. */
var default_timeout = GM_getValue('default_timeout','5:00');
var timeout = GM_getValue('timeout'+thepage, default_timeout);
var timeoutset = GM_getValue('timeoutset'+thepage,false);
var random = GM_getValue('random',0);

var hotkey = GM_getValue('hotkey','T');

var separators_incl = GM_getValue('separators_incl',true);
var autoclose = GM_getValue('autoclose',true);
var click_extend = GM_getValue('click_extend',false);
var refresh_all = GM_getValue('refresh_all',false);

var separators_incl_text = separators_incl ? 'checked="checked"' : '';
var autoclose_text = autoclose ? 'checked="checked"' : ''
var click_extend_text = click_extend ? 'checked="checked"' : '';
var refresh_all_text = refresh_all ? 'checked="checked"' : '';

//console.log("vars ok");

/* Variables for offline check */
// var xmlhttp=false;
try{
	var xmlhttp = new XMLHttpRequest();
}catch (e){
	xmlhttp=false;
}

var length_behind_time;

/********************************************
        THE DIV FOR THE OPTIONS MENU
********************************************/
var option_box = document.createElement('div');
option_box.innerHTML = '<div id="F5rw_option_box" style="text-align:left; position:fixed; bottom:50px; left:' + (screen.width/2-300) + 'px; width:600; visibility:hidden; margin:0px; margin:auto; padding:4px; color:#000; border:1px solid #000000; background:#EEF; -moz-border-radius:6px; font:12px arial; z-index:99999;">' + 
'<form action="">'+ /* The form is necessary for the functionality of the abort button...*/
'<table id="F5rw_table" cellpadding="0"cellspacing="0" width="100%" style="border:none">' +
'<tr id="F5rw_row"><td id="F5rw_cell" colspan="2" align="center"><span id="F5rw_span" style="font-size:16px;font-weight:bold;">'         + options_title[lang]  + '</span><td id="F5rw_cell">         </td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell">' + options_default_timeout[lang] + '</td><td id="F5rw_cell"><input type="text" size="10" value="' + default_timeout      + '" id="F5rw_default_timeout">*      </td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell">' + options_timeout[lang]         + '</td><td id="F5rw_cell"><input type="text" size="10" value="' + timeout              + '" id="F5rw_timeout">*              </td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell">' + options_random[lang]          + '</td><td id="F5rw_cell"><input type="text" size="10" value="' + random               + '" id="F5rw_random">*               </td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell">' + options_hotKeys[lang]         + '</td><td id="F5rw_cell"><input type="text" size="01" value="' + hotkey               + '" id="F5rw_hotkey"  maxlength="1"> </td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell">' + options_separators[lang]      + '</td><td id="F5rw_cell"><input type="text" size="10" value="' + separators           + '" id="F5rw_separators">&nbsp;&nbsp;</td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell">' + options_separators_incl[lang] + '</td><td id="F5rw_cell"><input type="checkbox" '              + separators_incl_text +   'id="F5rw_separators_incl" >      </td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell">' + options_autoclose[lang]       + '</td><td id="F5rw_cell"><input type="checkbox" '              + autoclose_text       +   'id="F5rw_autoclose" >            </td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell">' + options_click_extend[lang]    + '</td><td id="F5rw_cell"><input type="checkbox" '              + click_extend_text    +   'id="F5rw_click_extend" >         </td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell">' + options_refresh_all[lang]       + '</td><td id="F5rw_cell"><input type="checkbox" '              + refresh_all_text       +   'id="F5rw_refresh_all" >            </td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell" colspan="2" style="font-size:11px;"><br />*' + options_number_format[lang] + '</td></tr>'+
'<tr id="F5rw_row"><td id="F5rw_cell" colspan="2" align="center"><br /><input type="button" style="background-color:#FFF;" value="' + options_btn_ok[lang] + '" id="F5rw_ok">'+
'<input  type="reset" style="background-color:#FFF;"            value="' + options_btn_cancel[lang] + '" id="F5rw_cancel" onclick="document.getElementById(\'F5rw_option_box\').style.visibility=\'hidden\';">'+ 
'<input type="button" style="background-color:#FFF;color:#C00;" value="' + options_btn_abort[lang]  + '" id="F5rw_abort"></td></tr>'+
'</table><br /></form></div>';
document.body.appendChild(option_box);

/********************************************
        THE DIV FOR THE OFFLINE INFOBOX
********************************************/
var offline_box = document.createElement('div');
offline_box.innerHTML = '<div id="F5rw_offline_box" style="text-align:left; position:fixed; bottom:10px; left: 10px; margin:0px; margin:auto; padding:4px; color:#A00; border:1px solid #A00; background:#FFF; font:10px arial; z-index:99999;">' + 
offline_box_message[lang] + '</div>';


// console.log("html ok");

/* If this page is loaded the first time, do nothing until user sets a timeout for this page! */
if (timeoutset || refresh_all) {
	/*Create value inbetween 0 and the random-value entered by the user. */
	var rand = Math.round(Math.random()*random);//todo:convert already here to seconds!
	var timeout_plus_rand = toSeconds(timeout) + toSeconds(rand);
	
	/* Show time left till next reload in status bar. */
	var secs;
	var mins; 
	var hours;
	var statusbar_timeout_countdown = new Array(timeout_plus_rand); /* this is necessary to be able to cancel the timeout */
	setStatusBarTime(timeout_plus_rand);
	
	/* this single line makes the page reload! */
	var timeout_countdown = setTimeout(reloadWindow,(timeout_plus_rand * 1000));
}

/********************************************
                FUNCTIONS
********************************************/

/*Calls the corresponding Time function*/
function setStatusBarTime(time){
	/* Depending on the input format of the user, show the time left, in the statusbar. */
	for(var i = time; i >= 0; i--) {
		window.clearTimeout(statusbar_timeout_countdown[i]);
	}
	if(timeout.indexOf(":")>-1){
		if(timeout.split(":").length==3){
			setStatusBarTimeInHours(time);
		}
		if(timeout.split(":").length==2){
			setStatusBarTimeInMinutes(time);
		}
	}else{
		setStatusBarTimeInSeconds(time);
	}
}

/* The next three functions set the statusbar. Little bit crazy: the "for"-loop creates a lot of setTimeouts, 
   which -one by one- runs out of time. The first after 1 second, the next after 2 secs etc. So there are i 
   setTimeouts running in parallel, as far as I understand */
function setStatusBarTimeInHours(time){
	length_behind_time = statusbar_behind_hours[lang].length;
	for(var i = time; i >= 0; i--) {
		hours=Math.floor(i/3600);
		mins=Math.floor(i/60)-hours*60;
		if(mins<10){mins = '0'+mins;}
		secs=i-hours*3600-mins*60;
		if(secs<10){secs = '0'+i%60;}
		statusbar_timeout_countdown[i] = setTimeout("window.status='" + statusbar_before_time[lang] + hours + ':' + mins + ':' +secs + statusbar_behind_hours[lang] + "'", (time-i)*1000);	
	}
}
function setStatusBarTimeInMinutes(time){
	length_behind_time = statusbar_behind_minutes[lang].length;
	for(var i = time; i >= 0; i--) {
		mins=Math.floor(i/60);
		secs=i-mins*60;
		if(secs<10){secs = '0'+i%60;}
		statusbar_timeout_countdown[i] = setTimeout("window.status='" + statusbar_before_time[lang] + mins + ':' +secs + statusbar_behind_minutes[lang] + "'", (time-i)*1000);	
	}
}
function setStatusBarTimeInSeconds(time){
	length_behind_time = statusbar_behind_seconds[lang].length;
	for(var i = time; i >= 0; i--) {
		statusbar_timeout_countdown[i] = setTimeout("window.status='" + statusbar_before_time[lang] + i + statusbar_behind_seconds[lang] + "'", (time-i)*1000);	
	}
}

/* Just to reduce a little bit of code... */
function getEl(elemId){
	return document.getElementById(elemId);
}

/*Checks accessability of the requested page */
function reloadWindow(){
	xmlhttp.open("HEAD", window.location.href,true);
	xmlhttp.onreadystatechange=function() {
		if(xmlhttp.readyState==4) {
			if (xmlhttp.status==200){ 
				window.location.reload();
			}else{
				/* Show message in the bottom left, that the user has no connection to the site */
				document.body.appendChild(offline_box);
				setStatusBarTime(timeout_plus_rand);
				/* restart the reload of the page */
				window.clearTimeout(timeout_countdown);
				timeout_countdown = setTimeout(reloadWindow,(timeout_plus_rand * 1000));
			}
		}
	}
	xmlhttp.send(null);
}

/*Checks the input format and if correctly formatted the variable is saved, otherwise an alert is shown. */
function checkTimeFormatAndSave(elemId,varName){
	var elem = getEl(elemId).value;
	var elem_num = parseInt(elem);

	/* if timeouts are given in format hh:mm:ss, check if each element is a number. 
	   PS: i don´t care of expressions like 1:75:100 its just 1 hour, 75 minutes and 100 seconds */
	var hhmmss = elem.split(":");
	if (hhmmss.length>3){
		alert(time_format_err[lang]);
		return false;
	}
	for (var i = 0; i<hhmmss.length; i++){
		/* first kill leading zeros */
		while(hhmmss[i].charAt(0)=="0" && hhmmss[i].length>1){
			hhmmss[i] = hhmmss[i].substring(1,hhmmss[i].length);
		}
		/* then check if string is not an integer or  */
		if(hhmmss[i] != parseInt(hhmmss[i]).toString() || parseInt(hhmmss[i])<0){
			return false;
		}
	}
	/* the input seems to be ok! */
	GM_setValue(varName, elem);
	return true;
}

/* Converts every format into seconds (ok not EVERY, but all with : separated formats).  */
function toSeconds(elem){
	var elem_num = parseInt(elem);
	
	/* This is necessary, because y=x.split(":") doesn't return y.length = 1, if there is no ":" within the string. Probably split() just fails. */
	if (elem == elem_num.toString()){
		/* Format is already in seconds! */
		return elem_num;
	}
	
	/* Format is in hh:mm:ss or mm:ss or whatever else */
	elem_num = 0;
	var hhmmss = elem.split(":");
	/* Multiply hours and/or minutes up to seconds */
	for (var i = 0; i<hhmmss.length-1; i++){
		elem_num = (elem_num + parseInt(hhmmss[i]))*60;
	}
	/* Finally add seconds */
	elem_num += parseInt(hhmmss[hhmmss.length-1]);
	return elem_num;
}

function extendTimeout(){
	/*seems to be the only way to recover the time left*/
		var time_plus_right = window.status.substring(statusbar_before_time[lang].length);
		var time_left = time_plus_right.substring(0, time_plus_right.length-length_behind_time)
		if(toSeconds(time_left)<toSeconds(timeout_plus_rand)/2){
			window.clearTimeout(timeout_countdown);
			timeout_countdown = setTimeout(reloadWindow,(timeout_plus_rand * 1000));
			setStatusBarTime(timeout_plus_rand);
		}
}

/*Intercept user klicks to check if menu buttons were klicked. */
document.addEventListener('click', function(event) {
		var obox = getEl('F5rw_option_box');
		var hide = true;
		
		/* OK-button of the menu klicked */
		if(event.target.id=='F5rw_ok'){
			GM_setValue('separators', getEl('F5rw_separators').value);
			GM_setValue('separators_incl', getEl('F5rw_separators_incl').checked);
			GM_setValue('autoclose', getEl('F5rw_autoclose').checked);
			if(getEl('F5rw_hotkey').value.length==1){
				GM_setValue('hotkey', getEl('F5rw_hotkey').value);
			}else{
				alert(hotkey_err[lang]);
				hide=false;
			}
			GM_setValue('click_extend', getEl('F5rw_click_extend').checked);
			GM_setValue('refresh_all', getEl('F5rw_refresh_all').checked);
			
				
			if(!checkTimeFormatAndSave('F5rw_default_timeout','default_timeout')){
				alert(num_err_default[lang]);
				hide=false;
			}
			if(!checkTimeFormatAndSave('F5rw_random','random')){
				alert(num_err_random[lang]);
				hide=false;
			}
			
			/*Check if the timeout value has changed. Otherwise DO NOT RELOAD the page*/
			var old_timeout = GM_getValue('timeout'+thepage, default_timeout);
			if(!checkTimeFormatAndSave('F5rw_timeout','timeout'+thepage)){
				alert(num_err_timeout[lang]);
				hide=false;
			}else{
				var new_timeout = GM_getValue('timeout'+thepage, default_timeout);
				/*Reload window immediately, when reload interval has been changed */
				if (old_timeout != new_timeout || !timeoutset){
					/* timeoutset=true; */
					GM_setValue('timeoutset'+thepage,true);
					reloadWindow();
				}
			}
			if (hide){
				obox.style.visibility='hidden';
			}
		}
		
		/* Abort-button of the menu klicked, so cancel the countdown and everything related */
		if(event.target.id=='F5rw_abort'){
			/* abort the statusbar countdown only if it is set*/
			if(typeof(timeout_countdown)!='undefined'){
				window.clearTimeout(timeout_countdown);
			}
			if(typeof(statusbar_timeout_countdown)!='undefined'){
				for (var i=0;i<=statusbar_timeout_countdown.length;i++){
					window.clearTimeout(statusbar_timeout_countdown[i]);
				}
			}
			/* show abort message */
			window.status=statusbar_stop_refresh[lang];
			
			/*remove the values in the about:config */
			timeoutset=false;
			timeout=default_timeout;
			GM_deleteValue('timeoutset'+thepage);
			GM_deleteValue('timeout'+thepage);
			obox.style.visibility='hidden';
		}
		
		/* Close menu, when clicking outside of it and autoclose is active */
		if (event.target.id.substr(0,5)!='F5rw_'){
			if(getEl('F5rw_autoclose').checked){
				obox.style.visibility='hidden';
			}
			
			/* If countdown is below half timeout, reset countdown */
			if(timeoutset && getEl('F5rw_click_extend').checked){
				extendTimeout();
			}
		}
}, true);

/* Show and hide options */
document.addEventListener('keypress', function(event) {
		//console.log(event);
		/* If countdown is below half timeout, reset countdown */
		if(timeoutset && getEl('F5rw_click_extend').checked){
			extendTimeout();
		}
	/* Ignore text-input fields field. */
	if (event.target.type && event.target.type.match(/text/) ) {
		return;
	}
	
	/*show and hide the menu when correct key is pressed*/
	if (event.charCode == getEl('F5rw_hotkey').value.charCodeAt(0)) {
		
		//console.log("open!");
		var obox = getEl('F5rw_option_box');
		if(obox.style.visibility=='visible'){
			obox.style.visibility='hidden';
		}else{
			obox.style.visibility='visible';
		}
	}
}, false);
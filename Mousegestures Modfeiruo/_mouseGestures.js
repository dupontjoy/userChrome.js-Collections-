GESTURES = {
//强制转到页首
"U" : {
name : "转到页首",
cmd : function (gestures, event) {
var doc = event.target.ownerDocument;
var win = doc.defaultView;
win.scrollTo(0, 0);
}
},
//强制转到页尾
"D" : {
name : "转到页尾",
cmd : function (gestures, event) {
var doc = event.target.ownerDocument;
var win = doc.defaultView;
win.scrollTo(0, 1e10);
}
},
//后退
"L" : {
name : "后退",
cmd : function () {
getWebNavigation().canGoBack && getWebNavigation().goBack();
}
},
//前进
"R" : {
name : "前进",
cmd : function () {
getWebNavigation().canGoForward && getWebNavigation().goForward();
}
},


}
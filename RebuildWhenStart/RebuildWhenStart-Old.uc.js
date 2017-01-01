
//2015.05.20 09:00  加入moveButton重載（moveButton重載一次只能移動2个圖標，所以只好多重載幾次）
//2015.03.05 12:00  調整時間

//防止因加载延迟而没有显示(_addMenu.js的)菜单
//重复加载几次，防止第1次未加载成功

(function() {
//Addmenu 和 moveButton
setTimeout(function() {MyMoveButton.delayRun();}, 2000);//2秒
setTimeout(function() {MyMoveButton.delayRun();}, 3000);//3秒
setTimeout(function() {MyMoveButton.delayRun();}, 4000);//4秒
setTimeout(function() {addMenu.rebuild(true);MyMoveButton.delayRun();}, 5000);//5秒
setTimeout(function() {MyMoveButton.delayRun();}, 6000);//6秒
setTimeout(function() {MyMoveButton.delayRun();}, 7000);//7秒
setTimeout(function() {MyMoveButton.delayRun();}, 8000);//8秒
setTimeout(function() {MyMoveButton.delayRun();}, 9000);//9秒
setTimeout(function() {addMenu.rebuild(true);MyMoveButton.delayRun();}, 10000);//10秒
setTimeout(function() {addMenu.rebuild(true);MyMoveButton.delayRun();}, 60000);//60秒
})();
//2016.12.21  重构代码, 时间循环功能(Python基础没白学)
//2015.09.17  加入moveButton重載（moveButton重載一次只能移動2个圖標，所以只好多重載幾次）
//2015.03.05  調整時間
//2014.09.02  Create by Oos
//防止因加载延迟而没有显示(_addMenu.js的)菜单
//重复加载几次，防止第1次未加载成功
(function () {
  cars = ['2', '5', '10', '30', '60'];
  for (var i = 0; i < cars.length; i++)
  {
    //Addmenu 和 moveButton
    setTimeout(function () {
      addMenu.rebuild();
      MyMoveButton.delayRun();
      vimfx.addCommand(bootstrap());
    }, cars[i] * 1000); //单位: 1秒
  }
}) ();
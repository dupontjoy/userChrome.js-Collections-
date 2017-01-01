自動重新載入腳本配置，防止Firefox啟動後，腳本配置未能正確載入

更新:
- 使用函数循环, 简化代码
- 原始: Oos

"""
原貼地址：http://bbs.kafan.cn/thread-1768925-1-1.html

適用於外置規則的腳本，且作者定義了重載命令，如：

    keys['R'] = function() {
    KeyChanger.makeKeyset(true);//KeyChanger
    Redirector.reload();//Redirector
    UCL.rebuild();//UserCSSLoader
    anobtn.reload(true);//anobtn
    addMenu.rebuild(true);//AddmenuPlus
    MyMoveButton.delayRun();//Movebutton
    showFlagS.rebuild(true);//showFlagS
    };//群体重新载入，按顺序进行，遇到失效的将终止，所以请保证所有重载都是有效的。
"""
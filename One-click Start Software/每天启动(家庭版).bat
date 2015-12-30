::設置程序文件夾位置
set dir=D:\Program Files

::Processlaso特殊处理
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessGovernor.exe" "/logfolder=%dir%\System Tools\ProcessLassoPortable" "/configfolder=%dir%\System Tools\ProcessLassoPortable"
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessLasso.exe" "/logfolder=%dir%\System Tools\ProcessLassoPortable" "/configfolder=%dir%\System Tools\ProcessLassoPortable"

::普通啟動
start "" "%dir%\360YunPan\360cloud\360Cloud.exe"
start "" "%dir%\Tencent\Foxmail\Foxmail.exe"
start "" "%dir%\Mozilla Firefox\Software\Other\PicPick\picpick.exe"
start "" "%dir%\Mozilla Firefox\Software\GFW\Shadowsocks\Shadowsocks.exe"
start "" "%dir%\Thunder Network\Thunder\Program\Thunder.exe"
start "" "%dir%\Tencent\QQ\Bin\QQ.exe"
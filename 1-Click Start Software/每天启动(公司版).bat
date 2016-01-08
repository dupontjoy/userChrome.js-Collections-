::設置程序文件夾位置
set dir=D:\Program Files
set dir2=C:\Program Files (x86)

::Processlaso特殊处理
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessGovernor.exe" "/logfolder=%dir%\System Tools\ProcessLassoPortable" "/configfolder=%dir%\System Tools\ProcessLassoPortable"
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessLasso.exe" "/logfolder=%dir%\System Tools\ProcessLassoPortable" "/configfolder=%dir%\System Tools\ProcessLassoPortable"

::普通啟動
start "" "%dir%\360YunPan\360cloud\360Cloud.exe"
start "" "%dir%\Tencent\Foxmail\Foxmail.exe"
start "" "%dir%\Mozilla Firefox\Software\Image\PicPick\picpick.exe"
start "" "%dir%\Mozilla Firefox\Software\GFW\Shadowsocks\Shadowsocks.exe"
start "" "%dir%\Thunder Network\Thunder\Program\Thunder.exe"
start "" "%dir%\Tencent\QQ\Bin\QQ.exe"

::公司用軟件
start "" "%dir%\Jingoal\Jingoal.exe"
start "" "%dir2%\XiaoMi\MiWiFi\MiWiFi.exe"
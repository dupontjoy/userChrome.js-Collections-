::2016.01.20
::設置程序文件夾位置
set dir=D:\Program Files
set dir2=C:\Program Files (x86)

::Processlaso特殊处理
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessGovernor.exe" "/logfolder=%dir%\System Tools\ProcessLassoPortable" "/configfolder=%dir%\System Tools\ProcessLassoPortable"
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessLasso.exe" "/logfolder=%dir%\System Tools\ProcessLassoPortable" "/configfolder=%dir%\System Tools\ProcessLassoPortable" & ping localhost -n 5

::公司用軟件
start "" "%dir%\Jingoal\Jingoal.exe" & ping localhost -n 20
start "" "%dir2%\XiaoMi\MiWiFi\MiWiFi.exe" & ping localhost -n 5

::普通啟動
start "" "%dir%\Tencent\QQ\Bin\QQ.exe" & ping localhost -n 20
start "" "%dir%\Thunder Network\Thunder\Program\Thunder.exe" & ping localhost -n 5
start "" "%dir%\Tencent\Foxmail\Foxmail.exe" & ping localhost -n 5
start "" "%dir%\Mozilla Firefox\Software\Image\PicPick\picpick.exe" & ping localhost -n 5
start "" "%dir%\Mozilla Firefox\Software\GFW\Shadowsocks\Shadowsocks.exe" & ping localhost -n 5
start "" "%dir%\360YunPan\360cloud\360Cloud.exe" & ping localhost -n 5
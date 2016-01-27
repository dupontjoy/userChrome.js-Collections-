::2016.01.22

::最小化运行批处理
::From: http://www.jb51.net/article/7347.htm
@echo off
if "%1"=="h" goto begin
start mshta vbscript:createobject("wscript.shell").run("""%~nx0"" h",0)(window.close)&&exit
:begin

::設置程序文件夾位置
set dir=D:\Program Files

::Processlaso特殊处理
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessGovernor.exe" "/logfolder=%dir%\System Tools\ProcessLassoPortable" "/configfolder=%dir%\System Tools\ProcessLassoPortable"
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessLasso.exe" "/logfolder=%dir%\System Tools\ProcessLassoPortable" "/configfolder=%dir%\System Tools\ProcessLassoPortable" & ping localhost -n 5

::公司用軟件
start "" "%dir%\Jingoal\Jingoal.exe" & ping localhost -n 20
start "" "%dir%\Adobe\Photoshop\Photoshop\photoshop.exe" & ping localhost -n 20
start "" "%dir%\XiaoMi\MiWiFi\MiWiFi.exe" & ping localhost -n 5

::普通啟動
start "" "%dir%\Tencent\QQ\Bin\QQ.exe" & ping localhost -n 20
start "" "%dir%\Thunder Network\Thunder\Program\Thunder.exe" & ping localhost -n 5
start "" "%dir%\Tencent\Foxmail\Foxmail.exe" & ping localhost -n 5
start "" "%dir%\360YunPan\360cloud\360Cloud.exe" & ping localhost -n 5
start "" "%dir%\Mozilla Firefox\Software\Image\PicPick\picpick.exe" & ping localhost -n 5
start "" "%dir%\Mozilla Firefox\Software\GFW\Shadowsocks\Shadowsocks.exe" & ping localhost -n 5

::完成後退出
goto exit
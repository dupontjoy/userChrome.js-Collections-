::2016.06.05

::最小化运行批处理
::From: http://www.jb51.net/article/7347.htm
@echo off
if "%1"=="h" goto begin
start mshta vbscript:createobject("wscript.shell").run("""%~nx0"" h",0)(window.close)&&exit
:begin

::設置程序文件夾位置
set dir=D:\Program Files

::Processlaso特殊处理
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessGovernor.exe" "/configfolder=%dir%\System Tools\ProcessLassoPortable" "/logfolder=%dir%\System Tools\ProcessLassoPortable"
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessLasso.exe" "/configfolder=%dir%\System Tools\ProcessLassoPortable" "/logfolder=%dir%\System Tools\ProcessLassoPortable"

::普通啟動
::start "" "%dir%\BingDesktop2\BingDesktop.exe"
start "" "%dir%\Tencent\QQ\Bin\QQ.exe" & ping localhost -n 3
start "" "%dir%\Tencent\Foxmail\Foxmail.exe" /min
start "" "%dir%\BaiduYun\baiduyun.exe"
start "" "%dir%\CingFox\Software\Image\Picpick\Picpick.exe"
start "" "%dir%\CingFox\Software\GFW\Shadowsocks\ShadowsocksR-dotnet4.0.exe"
start "" "%dir%\CingFox\Software\Other\QT-Check\QT.lnk"
start "" "%dir%\finalspeedclient\finalspeedclient.exe"

::完成後退出
goto exit
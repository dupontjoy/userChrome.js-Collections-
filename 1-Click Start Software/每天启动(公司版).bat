::2016.04.27

::最小化运行批处理
::From: http://www.jb51.net/article/7347.htm
@echo off
if "%1"=="h" goto begin
start mshta vbscript:createobject("wscript.shell").run("""%~nx0"" h",0)(window.close)&&exit
:begin

::設置程序文件夾位置
set dir=D:\Program Files

::Processlaso特殊处理
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessGovernor.exe" "/configfolder=%dir%\System Tools\ProcessLassoPortable"
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessLasso.exe" "/configfolder=%dir%\System Tools\ProcessLassoPortable"

::公司用軟件
start "" "%dir%\Jingoal\Jingoal.exe" & ping localhost -n 10
start "" "C:\Program Files (x86)\XiaoMi\MiWiFi\MiWiFi.exe"

::普通啟動
::start "" "%dir%\BingDesktop2\BingDesktop.exe"
start "" "%dir%\Tencent\QQ\Bin\QQ.exe" & ping localhost -n 10
start "" "%dir%\Tencent\Foxmail\Foxmail.exe" /min
start "" "%dir%\BaiduYun\baiduyun.exe"
start "" "%dir%\CingFox\Software\Image\PicPick\picpick.exe"
start "" "%dir%\CingFox\Software\GFW\Shadowsocks\ShadowsocksR.exe"

::完成後退出
goto exit
::2016.02.07

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
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessLasso.exe" "/logfolder=%dir%\System Tools\ProcessLassoPortable" "/configfolder=%dir%\System Tools\ProcessLassoPortable"

::公司用軟件
start "" "%dir%\Jingoal\Jingoal.exe" & ping localhost -n 10
start "" "%dir%\Adobe\Adobe Photoshop CC\Photoshop.exe" & ping localhost -n 10
start "" "%dir%\XiaoMi\MiWiFi\MiWiFi.exe" /min & ping localhost -n 5

::普通啟動
start "" "%dir%\Tencent\QQ\Bin\QQ.exe" & ping localhost -n 30
start "" "%dir%\Tencent\Foxmail\Foxmail.exe" /min & ping localhost -n 5
start "" "%dir%\BaiduYun\baiduyun.exe" & ping localhost -n 5
start "" "%dir%\CingFox\Software\Image\PicPick\picpick.exe" & ping localhost -n 5
start "" "%dir%\CingFox\Software\GFW\Shadowsocks\Shadowsocks.exe" & ping localhost -n 5

::完成後退出
goto exit
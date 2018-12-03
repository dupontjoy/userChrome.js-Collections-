::2018.12.02

@echo off
::最小化运行批处理
::From: http://www.jb51.net/article/7347.htm
::if "%1"=="h" goto begin
::start mshta vbscript:createobject("wscript.shell").run("""%~nx0"" h",0)(window.close)&&exit

::自动以管理员身份运行bat文件
cd /d %~dp0
%1 start "" mshta vbscript:createobject("shell.application").shellexecute("""%~0""","::",,"runas",1)(window.close)&exit
::完

:begin

::設置程序文件夾位置
set dir=D:\Program Files

::Processlaso特殊处理
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessGovernor.exe" "/configfolder=%dir%\System Tools\ProcessLassoPortable\config" "/logfolder=%dir%\System Tools\ProcessLassoPortable\config"
start "" "%dir%\System Tools\ProcessLassoPortable\ProcessLasso.exe" "/configfolder=%dir%\System Tools\ProcessLassoPortable\config" "/logfolder=%dir%\System Tools\ProcessLassoPortable\config"

::初始化Listary磁盘扫描,日志(解决5.x版U盘弹出后还有文件记录)
del "%dir%\CingFox\Software\Listary Pro\UserData\DiskSearch.db"  /s /q
del "%dir%\CingFox\Software\Listary Pro\UserData\listary_log.log"  /s /q

::普通啟動
start "" "%dir%\CingFox\Software\Listary Pro\listary.exe"
start "" "%dir%\CingFox\Software\Snipaste\Snipaste.exe"
::start "" "%dir%\CingFox\Software\GFW\SSR\ShadowsocksR-dotnet4.0.exe"
start "" "%dir%\CingFox\Software\GFW\v2ray-windows-64\v2rayN.exe"
start "" "%dir%\CingFox\Software\Ditto\Ditto.exe"
start "" "%dir%\CingFox\Software\Wizmouse\WizMouseLaunch.exe"

start "" "%dir%\Nutstore\Nutstore.exe" /min
start "" "%dir%\Tencent\QQ\Bin\QQ.exe"
::start "" "%dir%\Tencent\TIM\Bin\TIM.exe"
start "" "%dir%\Tencent\Foxmail\Foxmail.exe" /min
start "" "%dir%\RimeIME Portable\weasel\WeaselServer.exe"

::完成後退出
exit
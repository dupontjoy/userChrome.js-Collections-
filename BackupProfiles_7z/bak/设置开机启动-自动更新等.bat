@echo off
pushd "%~dp0"
set appPath=%~dp0

:Select
cls

:SelectC
echo  如果是win7、8，须在本批处理上右键选择管理员运行。
echo.
echo   x、一键设置下面的1、4、7、0并运行奶牛
echo   d、一键取消设置
echo.
echo   1、设置开机启动
echo   2、取消开机启动
echo.
echo   3、更新默认配置(会覆盖自定义设置)
echo   4、每周自动更新默认配置
echo   5、取消自动更新默认配置
echo.
echo   6、每一小时自动更新CJX规则
echo   7、每两小时自动更新CJX规则
echo   8、每四小时自动更新CJX规则
echo   p、设置代理自动更新CJX规则
echo   9、取消自动更新CJX规则
echo.
echo   0、重置LSP。修复原版迅雷导致崩溃的问题
echo.
echo   m、如有问题，选择此项查看CJX规则说明
echo.

set /p id=请选择，按回车键执行:
cls
if "%id%"=="0" goto O
if "%id%"=="1" goto B
if "%id%"=="2" goto C
if "%id%"=="3" goto A
if "%id%"=="4" goto A2
if "%id%"=="5" goto A3
if "%id%"=="6" goto D
if "%id%"=="7" goto E
if "%id%"=="8" goto F
if "%id%"=="p" goto F1
if "%id%"=="9" goto G
if "%id%"=="10" goto I
if "%id%"=="11" goto K0
if "%id%"=="m" goto L
if "%id%"=="x" goto N
if "%id%"=="d" goto P
goto SelectC

:O
netsh winsock reset catalog >nul
echo.
echo  已重置LSP，如果使用中依然存在浏览器、软件崩溃现象，请重启电脑。
echo.
echo  每次更新迅雷后，都要重置LSP。
echo.
echo  请按任意键返回主菜单。
pause>nul
goto Select

:B
REG ADD HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run /v "Ad muncher" /t REG_SZ /d "\"%~dp0AdMunch.exe\" /bt" /f
echo.
echo  已设置开机启动，请按任意键返回主菜单。
pause>nul
goto Select

:C
REG DELETE HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run /v "Ad muncher" /f
echo.
echo  已取消开机启动，请按任意键返回主菜单。
pause>nul
goto Select

:A
wget -N http://cjx82630.opendrive.com/files/Ml82NjI4OTM2Nl9aRHQ1Sl8xZmU0/Update.amc
echo.
echo  已更新过滤软件列表等配置，请按任意键返回主菜单。
pause>nul
goto Select

:A2
start /B /wait sc config Schedule start= auto >nul
start /B /wait sc start Schedule >nul
schtasks /delete /tn AdMuncher3 /f
start /B /wait schtasks /create /sc weekly /mo 1 /ru "System" /tn "AdMuncher3" /tr """"%appPath%autoupdate1.bat"""
start /B /wait schtasks /run /tn "AdMuncher3"
echo.
echo  已设置每周更新过滤软件列表及设置，请按任意键返回主菜单。
pause>nul
goto Select

:A3
schtasks /delete /tn AdMuncher3 /f
echo.
echo  已取消每周更新过滤软件列表及设置，请按任意键返回主菜单。
pause>nul
goto Select

:D
start /B /wait sc config Schedule start= auto >nul
start /B /wait sc start Schedule >nul
schtasks /delete /tn AdMuncher1 /f>nul
start /B /wait schtasks /create /sc minute /mo 60 /ru "System" /tn "AdMuncher1" /tr """"%appPath%autoupdate.bat"""
start /B /wait schtasks /run /tn "AdMuncher1"
echo.
echo  已设置每一小时更新，请按任意键返回主菜单。
pause>nul
goto Select

:E
start /B /wait sc config Schedule start= auto >nul
start /B /wait sc start Schedule >nul
schtasks /delete /tn AdMuncher1 /f
start /B /wait schtasks /create /sc minute /mo 120 /ru "System" /tn "AdMuncher1" /tr """"%appPath%autoupdate.bat"""
start /B /wait schtasks /run /tn "AdMuncher1"
echo.
echo  已设置每两小时更新，请按任意键返回主菜单。
pause>nul
goto Select

:F
start /B /wait sc config Schedule start= auto >nul
start /B /wait sc start Schedule >nul
schtasks /delete /tn AdMuncher1 /f
start /B /wait schtasks /create /sc minute /mo 240 /ru "System" /tn "AdMuncher1" /tr """"%appPath%autoupdate.bat"""
start /B /wait schtasks /run /tn "AdMuncher1"
echo.
echo  已设置每四小时更新，请按任意键返回主菜单。
pause>nul
goto Select

:F1
:IP
set /p IP=请输入代理IP及端口（如127.0.0.1:8087）:
if "%IP%"=="" goto IP
(echo %IP%) >ip.txt
:IP1
set /p IP1=请输入每隔多少分钟更新（如120）:
if "%IP1%"=="" goto IP1
start /B /wait sc config Schedule start= auto >nul
start /B /wait sc start Schedule >nul
schtasks /delete /tn AdMuncher1 /f
start /B /wait schtasks /create /sc minute /mo %IP1% /ru "System" /tn "AdMuncher1" /tr """"%appPath%autoupdateP.bat"""
start /B /wait schtasks /run /tn "AdMuncher1"
echo.
echo  请按任意键返回主菜单。
pause>nul
goto Select

:G
schtasks /delete /tn AdMuncher1 /f
echo.
echo  已取消自动更新，请按任意键返回主菜单。
pause>nul
goto Select

:L
START IEXPLORE http://bbs.kafan.cn/thread-1133619-1-1.html
goto Select

:N
start /B /wait sc config Schedule start= auto >nul
start /B /wait sc start Schedule >nul
schtasks /delete /tn AdMuncher3 /f
schtasks /delete /tn AdMuncher1 /f
start /B /wait schtasks /create /sc weekly /mo 1 /ru "System" /tn "AdMuncher3" /tr """"%appPath%autoupdate1.bat"""
start /B /wait schtasks /run /tn "AdMuncher3"
start /B /wait schtasks /create /sc minute /mo 120 /ru "System" /tn "AdMuncher1" /tr """"%appPath%autoupdate.bat"""
start /B /wait schtasks /run /tn "AdMuncher1"
REG ADD HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run /v "Ad muncher" /t REG_SZ /d "\"%~dp0AdMunch.exe\" /bt" /f
netsh winsock reset catalog >nul
echo.
echo  已重置LSP。如果无效，重启电脑。
echo.
echo  每次更新迅雷后，都要重置LSP。
echo.
echo  5秒后重开奶牛。
echo.
ping -n 5 127.1 >nul
taskkill /f /im AdMunch.exe >nul
start "" "%appPath%AdMunch.exe"
echo  按任意键返回主菜单。
pause>nul
goto Select


:P
REG DELETE HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run /v "Ad muncher" /f
schtasks /delete /tn AdMuncher3 /f
schtasks /delete /tn AdMuncher1 /f
echo.
echo  已清除每周更新过滤软件列表、开机启动、每两小时更新规则。
echo.
echo  按任意键返回主菜单。
pause>nul
goto Select

::2015.06.27 11:00  添加刪除項
::2015.06.12 21:00  統一放到Local文件夾中
::2015.06.11 11:00  Create

echo off
Title 備份Plugins和Software文件夾 by Cing
ECHO.&ECHO.即將開始備份Plugins和Software文件夾! 按任意鍵繼續！&PAUSE >NUL 2>NUL

rem 設置備份路徑以及臨時文件夾
cd /d %~dp0
::从批处理所在位置到Plugins和Software文件夾，只跨了4层
set BackDir=..\..\..\..\
set TempFolder=..\..\..\..\Plugins-n-Software

rem 复制目标文件到臨時文件夾

::以下是文件夾
::Plugins：外置便携插件
xcopy "%BackDir%\Plugins" %TempFolder%\Plugins\  /s /y /i
::Software：常用軟件
xcopy "%BackDir%\Software" %TempFolder%\Software\  /s /y /i

::需要刪除的项
del %TempFolder%\Plugins\sumatrapdfcache\  /s /q 
del %TempFolder%\Software\GFW\psiphon\psiphon3.exe.orig  /s /q 
del %TempFolder%\Software\GFW\GoGoTester\gogo_cache  /s /q 

::以下是文件
::patternSubscriptions.json：FoxyProxy的訂閱列表設置。
::xcopy "%BackDir%\patternSubscriptions.json" %TempFolder%\ /y

::設置備份文件路徑以及文件名

::完整日期和時間
set tm1=%time:~0,2%
set tm2=%time:~3,2%
set tm3=%time:~6,2%
set tm4=%time:~0,8%
set da1=%date:~0,4%
set da2=%date:~5,2%
set da3=%date:~8,2%
set ArchiveName=D:\Plugins-n-Software_%da1%%da2%%da3%-%tm1%%tm2%%tm3%.7z

::小時數小于10点時的修正
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
set ArchiveName=D:\Plugins-n-Software_%da1%%da2%%da3%-%tm1%%tm2%%tm3%.7z

rem 開始備份
7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% "%TempFolder%"
@echo 備份完成！并刪除臨時文件夾！
rd "%TempFolder%" /s/q

ECHO.&ECHO.Plugins和Software文件夾已打包完成，請按任意鍵退出！&PAUSE >NUL 2>NUL

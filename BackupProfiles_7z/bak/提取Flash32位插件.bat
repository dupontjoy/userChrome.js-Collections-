
::2015.07.11 22:00  加入選項
::2015.06.27 11:00  添加提取時間
::2015.06.25 13:00  實現獲取Flash版本號
::2015.06.23 18:00  Create

@echo off
Title 提取Flash32位插件 by Cing
::color 2E
echo.
echo    *** 提取Flash32位插件 ***
echo.
echo ============================================================
echo    **注意：
echo.
echo    1.需要先安装非IE的Adobe Flash Player插件！
echo.
echo    2.本批处理用以提取32位插件，并打包
echo.
echo    3.如需提取64位Flash，请修改BackDir位置
echo.
echo    Edit By yndoc！
echo.
echo    Mod By Cing(Dupontjoy)
echo.
echo    按任意键继续……
echo =============================================================
pause>nul
cls
echo.
echo   1、到官方下载非IE版Flash插件安装后提取！
echo.
echo   2、已经安装非IE版Flash插件的直接提取！
echo.
echo   3、退出此批处理。
echo.
echo.

set /p id=请选择，按回车键执行:
cls

if "%id%"=="1" goto install
if "%id%"=="2" goto set
if "%id%"=="3" goto exit

:install
echo.
echo    按任意键进入Flash官方下载地址……
echo.
pause>nul&start "" http://www.adobe.com/in/products/flashplayer/distribution3.html
cls
echo.
echo    *请暂时不要关闭该批处理……
echo.
echo    *如果您已安装完毕Adobe Flash Player插件，请按任意键继续……
pause>nul

:set
cd /d %~dp0
set BackDir=C:\Windows\SysWOW64\Macromed\Flash
set TempFolder=D:\Flash32

::複製插件到臨時文件夾
xcopy "%BackDir%\NPSWF32*.dll" %TempFolder%\  /s /y /i
xcopy "%BackDir%\FlashPlayerPlugin*.exe" %TempFolder%\  /s /y /i
xcopy "%BackDir%\plugin.vch" %TempFolder%\  /s /y /i

::讀取版本號
::找了好久，妙終於在這個回答找到了答案：http://zhidao.baidu.com/question/289963233.html
for /f "delims=" %%i in ('dir /a-d /b "%BackDir%\NPSWF32*.dll"') do (set ver=%%i)
echo %ver%

::完整日期和時間
set tm1=%time:~0,2%
set tm2=%time:~3,2%
set tm3=%time:~6,2%
set tm4=%time:~0,8%
set da1=%date:~0,4%
set da2=%date:~5,2%
set da3=%date:~8,2%
set ArchiveName=D:\%ver%_%da1%%da2%%da3%-%tm1%%tm2%%tm3%.7z

::小時數小于10点時的修正
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
set ArchiveName=D:\%ver%_%da1%%da2%%da3%-%tm1%%tm2%%tm3%.7z

rem 開始備份
7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% "%TempFolder%"
@echo 備份完成！并刪除臨時文件夾！
rd "%TempFolder%" /s/q

ECHO.&ECHO.已打包完成，請按任意鍵退出，將跳轉到系統/控制面板/程序與功能！&PAUSE >NUL 2>NUL

::跳轉到系統/控制面板/程序與功能
appwiz.cpl
rundll32.exe shell32.dll,Control_RunDLL appwiz.cpl

@exit
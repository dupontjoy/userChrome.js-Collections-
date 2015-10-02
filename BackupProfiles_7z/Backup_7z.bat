
::2015.10.01  優化輸出地址和精簡擴展語言
::2015.09.26  開啟7zip極限壓縮
::2015.08.08  可選擇Flash下載地址
::2015.07.14  添加備份詞典和user.js到GitHub
::2015.07.14  更新Flash下载地址
::2015.07.13  4合1整合

@echo off
Title 備份批處理整合版 by Cing
::一次性设置7-zip程序地址
set zip="D:\Program Files\7-Zip\7z.exe"

:menu
MODE con: COLS=80 LINES=25
ECHO.
ECHO =============================================================================
ECHO                           備份批處理整合版                           
ECHO    #+++++++++++++++++++++++++++++++++#+++++++++++++++++++++++++++++++++++#
ECHO    # 01、備份Firefox配置文件夾             #02、CingFox完整包制作        #
ECHO    # 03、備份Plugins和Software文件夾       #04、提取Flash32位插件        #
ECHO    # 05、備份一些文件到GitHub                                            #
ECHO    #                                                                     #
ECHO    #+++++++++++++++++++++++++++++++++#+++++++++++++++++++++++++++++++++++#
ECHO =============================================================================

set /p a=.                  请输入操作序号并回车（例如07）：
if %a%==01 goto Profiles
if %a%==02 goto CingFox
if %a%==03 goto Plugins-n-Software
if %a%==04 goto Flash32
if %a%==05 goto GitHub
goto cho

:Profiles
CLS
MODE con: COLS=45 LINES=15
ECHO.
ECHO.
ECHO    **********************************
ECHO.
ECHO          備份Firefox配置文件夾
ECHO.
ECHO                1.执行
ECHO.
ECHO                2.返回
ECHO.
ECHO    **********************************
ECHO.
ECHO.
Choice /C 12 /N /M 选择（1、2）：
If ErrorLevel 1 If Not ErrorLevel 2 Goto Profiles-1
If ErrorLevel 2 If Not ErrorLevel 3 Goto menu

:Profiles-1
MODE con: COLS=80 LINES=25
Title 備份Firefox配置文件夾 by Cing
echo.
echo    *** 備份Firefox配置文件夾 ***
echo.
echo ============================================================
echo    **注意：
echo.
echo    1. 需要關閉Firefox程序，請保存必要的資料!
echo.
echo    2. 備份完成後，按任意鍵重啟Firefox
echo.
echo    By Cing
echo.
echo    按任意键继续……
echo =============================================================
pause>nul
cls

rem 設置備份路徑以及臨時文件夾
@echo 關閉火狐瀏覽器后自動開始備份……
cd /d %~dp0
::从批处理所在位置到配置文件夹（Profiles），共跨了3层
set BackDir=..\..\..
set TempFolder=..\..\..\Temp\Profiles
set TempFolder1=..\..\..\Temp\1
set TempFolder2=..\..\..\Temp\2

::備份輸出地址
set TargetFolder="D:\My Documents\Baiduyun\Firefox\Profiles"

taskkill /im firefox.exe

rem 复制目标文件到臨時文件夾

::以下是文件夾
::adblockplus：ABP規則備份。
::xcopy "%BackDir%\adblockplus" %TempFolder%\adblockplus\  /s /y /i
::autoproxy：Autoproxy規則備份。
xcopy "%BackDir%\autoproxy" %TempFolder%\autoproxy\  /s /y /i
::chrome：UC腳本。
xcopy "%BackDir%\chrome" %TempFolder%\chrome\  /s /y /i
::extensions：安裝的擴展。
xcopy "%BackDir%\extensions" %TempFolder%\extensions\ /s /y /i
::extension-data：uBlock的數據文件，包含設置。
xcopy "%BackDir%\extension-data" %TempFolder%\extension-data\ /s /y /i
::gm_scripts：安裝的油猴腳本。
xcopy "%BackDir%\gm_scripts" %TempFolder%\gm_scripts\ /s /y /i
::Plugins：便携版插件。
xcopy "%BackDir%\Plugins" %TempFolder%\Plugins\ /s /y /i
::SimpleProxy：SimpleProxy代理列表。
xcopy "%BackDir%\SimpleProxy" %TempFolder%\SimpleProxy\ /s /y /i

::刪除Lastpass的一些项目
::（一）精简Platform
del %TempFolder%\extensions\support@lastpass.com\platform\  /s /q
xcopy "%BackDir%\extensions\support@lastpass.com\platform\WINNT_x86_64-msvc" %TempFolder%\extensions\support@lastpass.com\platform\WINNT_x86_64-msvc\ /s /y /i
::（二）精简lastpass.jar中的语言
%zip% x %TempFolder%\extensions\support@lastpass.com\chrome\lastpass.jar -o%TempFolder1%\jar
del %TempFolder%\extensions\support@lastpass.com\chrome\lastpass.jar  /s /q
xcopy "%TempFolder1%\jar\locale\en-US" %TempFolder2%\jar\locale\en-US\ /s /y /i
xcopy "%TempFolder1%\jar\locale\zh-CN" %TempFolder2%\jar\locale\zh-CN\ /s /y /i
xcopy "%TempFolder1%\jar\locale\zh-TW" %TempFolder2%\jar\locale\zh-TW\ /s /y /i
%zip% a -tzip -mx9 "%TempFolder1%\lastpass.jar" "%TempFolder1%\jar\content\" "%TempFolder1%\jar\icons\" "%TempFolder1%\jar\META-INF\" "%TempFolder1%\jar\skin\" "%TempFolder2%\jar\locale\"
xcopy "%TempFolder1%\lastpass.jar" %TempFolder%\extensions\support@lastpass.com\chrome\ /s /y /i

::刪除Inspector的语言
del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\  /s /q
xcopy "%BackDir%\extensions\inspector@mozilla.org\chrome\inspector\locale\en-US" %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\en-US\ /s /y /i

::其它刪除项
del %TempFolder%\chrome\UserScriptLoader\require\  /s /q
del %TempFolder%\extensions\userChromeJS@mozdev.org\content\myNewTab\bingImg\  /s /q

::以下是文件
::bookmarks.html：自動导出的书签備份。
xcopy "%BackDir%\bookmarks.html" %TempFolder%\ /y
::cert_override.txt：储存使用者指定的例外证书(certification exceptions)。
xcopy "%BackDir%\cert_override.txt" %TempFolder%\ /y
::cert8.db：安全证书。
xcopy "%BackDir%\cert8.db" %TempFolder%\ /y
::FlashGot.exe：FlashGot的下载工具。
xcopy "%BackDir%\FlashGot.exe" %TempFolder%\ /y
::foxyproxy.xml：FoxyProxy的設置及网址列表備份。
::xcopy "%BackDir%\foxyproxy.xml" %TempFolder%\ /y
::mimeTypes.rdf：下载特定类型的档案時要执行的動作。 可刪掉来还原原来下载的設定。
xcopy "%BackDir%\mimeTypes.rdf" %TempFolder%\ /y
::MyFirefox.7z：用於官方FX的便携設置。
xcopy "%BackDir%\MyFirefox.7z" %TempFolder%\ /y
::patternSubscriptions.json：FoxyProxy的訂閱列表設置。
::xcopy "%BackDir%\patternSubscriptions.json" %TempFolder%\ /y
::permissions.sqlite：存放特定网站是否可存取密码、cookies、弹出视窗、图片载入与附加元件……等权限的资料库。
xcopy "%BackDir%\permissions.sqlite" %TempFolder%\ /y
::persdict.dat：个人的拼字字典。
xcopy "%BackDir%\persdict.dat" %TempFolder%\ /y
::pluginreg.dat：用于plugin的MIME types。
xcopy "%BackDir%\pluginreg.dat" %TempFolder%\ /y
::Portable.7z：PCXFirefox的便携設置。
xcopy "%BackDir%\Portable.7z" %TempFolder%\ /y
::prefs.js：About:config中儲存的設定。
::xcopy "%BackDir%\prefs.js" %TempFolder%\ /y
::readme.txt：个人配置修改说明。
xcopy "%BackDir%\readme.txt" %TempFolder%\ /y
::stylish.sqlite：Stylish样式數据库。
xcopy "%BackDir%\stylish.sqlite" %TempFolder%\ /y
::user.js：使用者自订的設定，在这里的設定覆盖默认設定。
xcopy "%BackDir%\user.js" %TempFolder%\ /y
::xulstore.json：界面的一些状态。
xcopy "%BackDir%\xulstore.json" %TempFolder%\ /y

::讀取版本號和日期及時間
::从批处理所在位置到Firefox程序文件夹（firefox），共跨了4层
for /f "usebackq eol=; tokens=1,2 delims==" %%i in ("..\..\..\..\Firefox\application.ini")do (if %%i==Version set ver=%%j)
::設置備份文件路徑以及文件名

::完整日期和時間
set tm1=%time:~0,2%
set tm2=%time:~3,2%
set tm3=%time:~6,2%
set tm4=%time:~0,8%
set da1=%date:~0,4%
set da2=%date:~5,2%
set da3=%date:~8,2%
::輸出文件名
set Name=Profiles_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

::小時數小于10点時的修正
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
::輸出文件名
set Name=Profiles_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

rem 開始備份
::-mx9极限压缩 -mhc开启档案文件头压缩 -r递归到所有的子目录
%zip% -mx9 -mhc -r u -up1q3r2x2y2z2w2 %TargetFolder%\%Name% "%TempFolder%"
@echo 備份完成！并刪除臨時文件夾！
rd "%TempFolder%" "%TempFolder1%" "%TempFolder2%" /s/q

ECHO.&ECHO.Firefox配置已打包完成，請按任意鍵 重啟Firefox 並退出！&PAUSE >NUL 2>NUL

@ping 127.0.0.1>nul
@start ..\..\..\..\Firefox\firefox.exe

Goto end

:CingFox
CLS
MODE con: COLS=45 LINES=15
ECHO.
ECHO.
ECHO    **********************************
ECHO.
ECHO           CingFox完整包制作
ECHO.
ECHO                1.执行
ECHO.
ECHO                2.返回
ECHO.
ECHO    **********************************
ECHO.
ECHO.
Choice /C 12 /N /M 选择（1、2）：
If ErrorLevel 1 If Not ErrorLevel 2 Goto CingFox-1
If ErrorLevel 2 If Not ErrorLevel 3 Goto menu

:CingFox-1
MODE con: COLS=80 LINES=25
Title CingFox完整包制作 by Cing
echo.
echo    *** CingFox完整包制作 ***
echo.
echo ============================================================
echo    **注意：
echo.
echo    1. 需要關閉Firefox程序，請保存必要的資料!
echo.
echo    2. 備份完成後，按任意鍵重啟Firefox
echo.
echo    By Cing
echo.
echo    按任意键继续……
echo =============================================================
pause>nul
cls

rem 設置備份路徑以及臨時文件夾
@echo 關閉火狐瀏覽器后自動開始備份……
cd /d %~dp0
::从批处理所在位置到Mozilla Firefox大文件夾，共跨了4层
set BackDir=..\..\..\..
set TempFolder=..\..\..\..\CingFox
set TempFolder1=..\..\..\..\1
set TempFolder2=..\..\..\..\2
::CingFox輸出地址
set TargetFolder="D:"

taskkill /im firefox.exe

@echo 備份firefox文件夾================================
::firefox：pcxFirefox主程序
xcopy "%BackDir%\firefox" %TempFolder%\firefox\  /s /y /i

@echo 備份Plugins文件夾================================
::Plugins：外置便携插件
xcopy "%BackDir%\Plugins" %TempFolder%\Plugins\  /s /y /i

::需要刪除的项
del %TempFolder%\Plugins\sumatrapdfcache\  /s /q

@echo 備份Software文件夾================================
::Software：常用軟件
xcopy "%BackDir%\Software" %TempFolder%\Software\  /s /y /i

::需要刪除的项
del %TempFolder%\Software\GFW\goagent\  /s /q
del %TempFolder%\Software\GFW\IP-Update\  /s /q
del %TempFolder%\Software\GFW\Shadowsocks\  /s /q
del %TempFolder%\Software\GFW\psiphon\psiphon3.exe.orig  /s /q

@echo 備份Profiles文件夾================================
rem 复制目标文件到臨時文件夾

::以下是文件夾
::adblockplus：ABP規則備份。
::xcopy "%BackDir%\Profiles\adblockplus" %TempFolder%\Profiles\adblockplus\  /s /y /i
::autoproxy：Autoproxy規則備份。
xcopy "%BackDir%\Profiles\autoproxy" %TempFolder%\Profiles\autoproxy\  /s /y /i
::chrome：UC腳本。
xcopy "%BackDir%\Profiles\chrome" %TempFolder%\Profiles\chrome\  /s /y /i
::extensions：安裝的擴展。
xcopy "%BackDir%\Profiles\extensions" %TempFolder%\Profiles\extensions\ /s /y /i
::extension-data：uBlock的數據文件，包含設置。
xcopy "%BackDir%\Profiles\extension-data" %TempFolder%\Profiles\extension-data\ /s /y /i
::gm_scripts：安裝的油猴腳本。
xcopy "%BackDir%\Profiles\gm_scripts" %TempFolder%\Profiles\gm_scripts\ /s /y /i
::Plugins：便携版插件。
xcopy "%BackDir%\Profiles\Plugins" %TempFolder%\Profiles\Plugins\ /s /y /i
::SimpleProxy：SimpleProxy代理列表。
xcopy "%BackDir%\Profiles\SimpleProxy" %TempFolder%\Profiles\SimpleProxy\ /s /y /i

::刪除Lastpass的一些项目
::（一）精简Platform
del %TempFolder%\Profiles\extensions\support@lastpass.com\platform\  /s /q
xcopy "%BackDir%\Profiles\extensions\support@lastpass.com\platform\WINNT_x86_64-msvc" %TempFolder%\Profiles\extensions\support@lastpass.com\platform\WINNT_x86_64-msvc\ /s /y /i
::（二）精简lastpass.jar中的语言
%zip% x %TempFolder%\Profiles\extensions\support@lastpass.com\chrome\lastpass.jar -o%TempFolder1%\jar
del %TempFolder%\Profiles\extensions\support@lastpass.com\chrome\lastpass.jar  /s /q
xcopy "%TempFolder1%\jar\locale\en-US" %TempFolder2%\jar\locale\en-US\ /s /y /i
xcopy "%TempFolder1%\jar\locale\zh-CN" %TempFolder2%\jar\locale\zh-CN\ /s /y /i
xcopy "%TempFolder1%\jar\locale\zh-TW" %TempFolder2%\jar\locale\zh-TW\ /s /y /i
%zip% a -tzip "%TempFolder1%\lastpass.jar" "%TempFolder1%\jar\content\" "%TempFolder1%\jar\icons\" "%TempFolder1%\jar\META-INF\" "%TempFolder1%\jar\skin\" "%TempFolder2%\jar\locale\"
xcopy "%TempFolder1%\lastpass.jar" %TempFolder%\Profiles\extensions\support@lastpass.com\chrome\ /s /y /i

::刪除Inspector的语言
del %TempFolder%\Profiles\extensions\inspector@mozilla.org\chrome\inspector\locale\  /s /q
xcopy "%BackDir%\Profiles\extensions\inspector@mozilla.org\chrome\inspector\locale\en-US" %TempFolder%\Profiles\extensions\inspector@mozilla.org\chrome\inspector\locale\en-US\ /s /y /i

::其它刪除项
del %TempFolder%\Profiles\chrome\UserScriptLoader\require\  /s /q
del %TempFolder%\Profiles\extensions\userChromeJS@mozdev.org\content\myNewTab\bingImg\  /s /q

::以下是文件
::cert_override.txt：储存使用者指定的例外证书(certification exceptions)。
xcopy "%BackDir%\Profiles\cert_override.txt" %TempFolder%\Profiles\ /y
::cert8.db：安全证书。
xcopy "%BackDir%\Profiles\cert8.db" %TempFolder%\Profiles\ /y
::FlashGot.exe：FlashGot的下载工具。
xcopy "%BackDir%\Profiles\FlashGot.exe" %TempFolder%\Profiles\ /y
::foxyproxy.xml：FoxyProxy的設置及网址列表備份。
::xcopy "%BackDir%\foxyproxy.xml" %TempFolder%\ /y
::mimeTypes.rdf：下载特定类型的档案時要执行的動作。 可刪掉来还原原来下载的設定。
xcopy "%BackDir%\Profiles\mimeTypes.rdf" %TempFolder%\Profiles\ /y
::MyFirefox.7z：用於官方FX的便携設置。
xcopy "%BackDir%\Profiles\MyFirefox.7z" %TempFolder%\Profiles\ /y
::patternSubscriptions.json：FoxyProxy的訂閱列表設置。
::xcopy "%BackDir%\patternSubscriptions.json" %TempFolder%\ /y
::permissions.sqlite：存放特定网站是否可存取密码、cookies、弹出视窗、图片载入与附加元件……等权限的资料库。
xcopy "%BackDir%\Profiles\permissions.sqlite" %TempFolder%\Profiles\ /y
::persdict.dat：个人的拼字字典。
xcopy "%BackDir%\Profiles\persdict.dat" %TempFolder%\Profiles\ /y
::pluginreg.dat：用于plugin的MIME types。
xcopy "%BackDir%\Profiles\pluginreg.dat" %TempFolder%\Profiles\ /y
::Portable.7z：PCXFirefox的便携設置。
xcopy "%BackDir%\Profiles\Portable.7z" %TempFolder%\Profiles\ /y
::prefs.js：About:config中儲存的設定。
::xcopy "%BackDir%\Profiles\prefs.js" %TempFolder%\Profiles\ /y
::readme.txt：个人配置修改说明。
xcopy "%BackDir%\Profiles\readme.txt" %TempFolder%\Profiles\ /y
::stylish.sqlite：Stylish样式數据库。
xcopy "%BackDir%\Profiles\stylish.sqlite" %TempFolder%\Profiles\ /y
::user.js：使用者自订的設定，在这里的設定覆盖默认設定。
xcopy "%BackDir%\Profiles\user.js" %TempFolder%\Profiles\ /y
::xulstore.json：界面的一些状态。
xcopy "%BackDir%\Profiles\xulstore.json" %TempFolder%\Profiles\ /y

::讀取版本號和日期及時間
::从批处理所在位置到Firefox程序文件夹（firefox），共跨了4层
for /f "usebackq eol=; tokens=1,2 delims==" %%i in ("..\..\..\..\Firefox\application.ini")do (if %%i==Version set ver=%%j)
::設置備份文件路徑以及文件名

::完整日期和時間
set tm1=%time:~0,2%
set tm2=%time:~3,2%
set tm3=%time:~6,2%
set tm4=%time:~0,8%
set da1=%date:~0,4%
set da2=%date:~5,2%
set da3=%date:~8,2%
::輸出文件名
set Name=CingFox_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

::小時數小于10点時的修正
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
::輸出文件名
set Name=CingFox_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

rem 開始備份
::-mx9极限压缩 -mhc开启档案文件头压缩 -r递归到所有的子目录
%zip% -mx9 -mhc -r u -up1q3r2x2y2z2w2 %TargetFolder%\%Name% "%TempFolder%"
@echo 備份完成！并刪除臨時文件夾！
rd "%TempFolder%" "%TempFolder%1" "%TempFolder2%" /s/q

ECHO.&ECHO.Firefox完整包已打包完成，請按任意鍵 重啟Firefox 並退出！&PAUSE >NUL 2>NUL

@ping 127.0.0.1>nul
@start ..\..\..\..\Firefox\firefox.exe

Goto end

:Plugins-n-Software
CLS
MODE con: COLS=45 LINES=15
ECHO.
ECHO.
ECHO    **********************************
ECHO.
ECHO       備份Plugins和Software文件夾
ECHO.
ECHO                1.执行
ECHO.
ECHO                2.返回
ECHO.
ECHO    **********************************
ECHO.
ECHO.
Choice /C 12 /N /M 选择（1、2）：
If ErrorLevel 1 If Not ErrorLevel 2 Goto Plugins-n-Software-1
If ErrorLevel 2 If Not ErrorLevel 3 Goto menu

:Plugins-n-Software-1
MODE con: COLS=80 LINES=25
Title 備份Plugins和Software文件夾 by Cing
echo.
echo    *** 備份Plugins和Software文件夾 ***
echo.
echo ============================================================
echo    **注意：
echo.
echo    By Cing
echo.
echo    按任意键继续……
echo =============================================================
pause>nul
cls

rem 設置備份路徑以及臨時文件夾
cd /d %~dp0
::从批处理所在位置到Plugins和Software文件夾，只跨了4层
set BackDir=..\..\..\..\
set TempFolder=..\..\..\..\Plugins-n-Software
::輸出地址
set TargetFolder="D:\My Documents\Baiduyun\Firefox\Profiles\Software & Plugins"

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
set Name=Plugins-n-Software_%da1%%da2%%da3%-%tm1%%tm2%%tm3%.7z

::小時數小于10点時的修正
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
set Name=Plugins-n-Software_%da1%%da2%%da3%-%tm1%%tm2%%tm3%.7z

rem 開始備份
::-mx9极限压缩 -mhc开启档案文件头压缩 -r递归到所有的子目录
%zip% -mx9 -mhc -r u -up1q3r2x2y2z2w2 %TargetFolder%\%Name% "%TempFolder%"
@echo 備份完成！并刪除臨時文件夾！
rd "%TempFolder%" /s/q

ECHO.&ECHO.Plugins和Software文件夾已打包完成，請按任意鍵退出！&PAUSE >NUL 2>NUL

Goto end

:Flash32
CLS
MODE con: COLS=45 LINES=15
ECHO.
ECHO.
ECHO    **********************************
ECHO.
ECHO           提取Flash32位插件
ECHO.
ECHO                1.执行
ECHO.
ECHO                2.返回
ECHO.
ECHO    **********************************
ECHO.
ECHO.
Choice /C 12 /N /M 选择（1、2）：
If ErrorLevel 1 If Not ErrorLevel 2 Goto Flash32-1
If ErrorLevel 2 If Not ErrorLevel 3 Goto menu

:Flash32-1
::color 2E
MODE con: COLS=80 LINES=25
Title 提取Flash32位插件 by Cing
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
echo    Mod By Cing
echo.
echo    按任意键继续……
echo =============================================================
pause>nul
cls
echo.
echo   01、到官方下载非IE版Flash插件安装后提取！
echo.
echo   02、已经安装非IE版Flash插件的直接提取！
echo.
echo   03、返回主菜單。
echo.
echo.

set /p id=请选择，按回车键执行（例如：07）:
cls

if "%id%"=="01" goto install
if "%id%"=="02" goto set
if "%id%"=="03" goto menu

:install
echo.
echo =============================================================
echo.
echo   01、到Flash官方下載最新正式版！
echo.
echo   02、到Flash官方下載最新beta版！
echo.
echo   03、返回主菜單。
echo.
echo.
set /p id=请选择，按回车键执行（例如：07）:
cls

if "%id%"=="01" goto download1
if "%id%"=="02" goto download2
if "%id%"=="03" goto menu

:download1
start "" http://www.adobe.com/in/products/flashplayer/distribution3.html
cls
echo.
echo    *请暂时不要关闭该批处理……
echo.
echo    *如果您已安装完毕Adobe Flash Player插件，请按任意键继续……
pause>nul
goto set

:download2
start "" http://labs.adobe.com/downloads/flashplayer.html
cls
echo.
echo    *请暂时不要关闭该批处理……
echo.
echo    *如果您已安装完毕Adobe Flash Player插件，请按任意键继续……
pause>nul
goto set

:set
cd /d %~dp0
set BackDir=C:\Windows\SysWOW64\Macromed\Flash
set TempFolder=D:\Flash32
::輸出地址
set TargetFolder="D:\My Documents\Baiduyun\Firefox\【FX共享】\Flash32位原版提取帶vch和exe"

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
set Name=%ver%_%da1%%da2%%da3%-%tm1%%tm2%%tm3%.7z

::小時數小于10点時的修正
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
set Name=%ver%_%da1%%da2%%da3%-%tm1%%tm2%%tm3%.7z

rem 開始備份
::-mx9极限压缩 -mhc开启档案文件头压缩 -r递归到所有的子目录
%zip% -mx9 -mhc -r u -up1q3r2x2y2z2w2 %TargetFolder%\%Name% "%TempFolder%"
@echo 備份完成！并刪除臨時文件夾！
rd "%TempFolder%" /s/q

ECHO.&ECHO.已打包完成，請按任意鍵退出，將跳轉到系統/控制面板/程序與功能！&PAUSE >NUL 2>NUL

::跳轉到系統/控制面板/程序與功能
appwiz.cpl
rundll32.exe shell32.dll,Control_RunDLL appwiz.cpl

Goto end

:GitHub
CLS
MODE con: COLS=45 LINES=15
ECHO.
ECHO.
ECHO    **********************************
ECHO.
ECHO        備份一些文件到GitHub
ECHO.
ECHO                1.执行
ECHO.
ECHO                2.返回
ECHO.
ECHO    **********************************
ECHO.
ECHO.
Choice /C 12 /N /M 选择（1、2）：
If ErrorLevel 1 If Not ErrorLevel 2 Goto GitHub-1
If ErrorLevel 2 If Not ErrorLevel 3 Goto menu

:GitHub-1
MODE con: COLS=80 LINES=25
Title 備份一些文件到GitHub by Cing
echo.
echo    *** 備份一些文件到GitHub ***
echo.
echo ============================================================
echo    **注意：
echo.
echo    1. 個人參數設置：user.js
echo.
echo    2. 詞典：persdict.dat
echo.
echo    3. Stylish樣式庫：stylish.sqlite
echo.
echo    By Cing
echo.
echo    按任意键继续……
echo =============================================================
pause>nul
cls

rem 設置備份路徑以及臨時文件夾
cd /d %~dp0
set dir1=..\..\..
set dir2=D:\My Documents\GitHub\Customization
xcopy "%dir1%\persdict.dat" "%dir2%\persdict.dat"  /s /y /i
xcopy "%dir1%\stylish.sqlite" "%dir2%\stylish.sqlite"  /s /y /i
xcopy "%dir1%\user.js" "%dir2%\user.js"  /s /y /i

ECHO.&ECHO.備份一些文件到GitHub已完成，請按任意鍵退出！&PAUSE >NUL 2>NUL

Goto end

:end
CLS
MODE con: COLS=45 LINES=15
ECHO.
ECHO.
ECHO    **********************************
ECHO.
ECHO             已完成！下一步？
ECHO.
ECHO                1.退出
ECHO.
ECHO                2.返回主菜單
ECHO.
ECHO    **********************************
ECHO.
ECHO.
Choice /C 12 /N /M 选择（1、2）：
If ErrorLevel 1 If Not ErrorLevel 2 Goto exit
If ErrorLevel 2 If Not ErrorLevel 3 Goto menu

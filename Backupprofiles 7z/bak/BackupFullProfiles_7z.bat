
::2015.07.05 22:00  添加刪除項，其它小調整
::2015.06.19 16:00  添加重啟
::2015.06.12 21:00  加入需要刪除的項目（先複製後刪除，不影响原文件）
::2015.06.12 18:00  Create

echo off
Title CingFox完整包制作 by Cing
ECHO.&ECHO.即將開始Firefox完整包制作。需要關閉Firefox程序，請保存必要的資料! 按任意鍵繼續！&PAUSE >NUL 2>NUL

rem 設置備份路徑以及臨時文件夾
taskkill /im firefox.exe
@echo 關閉火狐瀏覽器后自動開始備份……
cd /d %~dp0
::从批处理所在位置到Mozilla Firefox大文件夾，共跨了4层
set BackDir=..\..\..\..
set TempFolder=..\..\..\..\CingFox

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
del %TempFolder%\Software\GFW\goagent\local\proxy.user.ini  /s /q
del %TempFolder%\Software\GFW\Shadowsocks\gui-config.json  /s /q
del %TempFolder%\Software\GFW\psiphon\psiphon3.exe.orig  /s /q 
del %TempFolder%\Software\GFW\GoGoTester\gogo_cache  /s /q 

@echo 備份Profiles文件夾================================
rem 复制目标文件到臨時文件夾

::以下是文件夾
::adblockplus：ABP規則備份。
xcopy "%BackDir%\Profiles\adblockplus" %TempFolder%\Profiles\adblockplus\  /s /y /i
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

::需要刪除的项
del %TempFolder%\Profiles\chrome\UserScriptLoader\require\  /s /q
del %TempFolder%\Profiles\extensions\userChromeJS@mozdev.org\content\myNewTab\bingImg\  /s /q
del %TempFolder%\Profiles\extensions\inspector@mozilla.org\chrome\inspector\locale\de\  /s /q
del %TempFolder%\Profiles\extensions\inspector@mozilla.org\chrome\inspector\locale\en-GB\  /s /q
del %TempFolder%\Profiles\extensions\inspector@mozilla.org\chrome\inspector\locale\pl\  /s /q
del %TempFolder%\Profiles\extensions\inspector@mozilla.org\chrome\inspector\locale\ru\  /s /q
del %TempFolder%\Profiles\extensions\inspector@mozilla.org\chrome\inspector\locale\sk\  /s /q
del %TempFolder%\Profiles\extensions\support@lastpass.com\platform\Darwin\  /s /q
del %TempFolder%\Profiles\extensions\support@lastpass.com\platform\Darwin_x86_64-gcc3\  /s /q
del %TempFolder%\Profiles\extensions\support@lastpass.com\platform\Linux_x86_64-gcc3\  /s /q
del %TempFolder%\Profiles\extensions\support@lastpass.com\platform\Linux_x86-gcc3\  /s /q
del %TempFolder%\Profiles\gm_scripts\picviewer_CE.db  /s /q
del %TempFolder%\Profiles\gm_scripts\picviewer_CE.db-shm  /s /q
del %TempFolder%\Profiles\gm_scripts\picviewer_CE.db-wal  /s /q
del %TempFolder%\Profiles\gm_scripts\YouTube_Auto_Buffer_&_Auto_HD.db  /s /q
del %TempFolder%\Profiles\gm_scripts\繞過站點等待、識別碼及登錄.db  /s /q
del %TempFolder%\Profiles\gm_scripts\跳过网站等待、验证码及登录.db  /s /q
del %TempFolder%\Profiles\gm_scripts\繞過站點等待、識別碼及登錄.db-shm  /s /q
del %TempFolder%\Profiles\gm_scripts\跳过网站等待、验证码及登录.db-wal  /s /q

::以下是文件
::cert_override.txt：储存使用者指定的例外证书(certification exceptions)。
xcopy "%BackDir%\Profiles\cert_override.txt" %TempFolder%\Profiles\ /y
::cert8.db：安全证书。
xcopy "%BackDir%\Profiles\cert8.db" %TempFolder%\Profiles\ /y
::FlashGot.exe：FlashGot的下载工具。
xcopy "%BackDir%\Profiles\FlashGot.exe" %TempFolder%\Profiles\ /y
::foxyproxy.xml：FoxyProxy的設置及网址列表備份。
::xcopy "%BackDir%\foxyproxy.xml" %TempFolder%\ /y
::localstore.rdf：工具列与视窗大小／位置的設定，有時刪掉可以解决一些介面上的问题。
xcopy "%BackDir%\Profiles\localstore.rdf" %TempFolder%\Profiles\ /y
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
::readme.txt：个人配置修改说明。
xcopy "%BackDir%\Profiles\readme.txt" %TempFolder%\Profiles\ /y
::stylish.sqlite：Stylish样式數据库。
xcopy "%BackDir%\Profiles\stylish.sqlite" %TempFolder%\Profiles\ /y
::user.js：使用者自订的設定，在这里的設定覆盖prefs.js的設定。
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
set ArchiveName=D:\CingFox_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

::小時數小于10点時的修正
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
set ArchiveName=D:\CingFox_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

rem 開始備份
7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% "%TempFolder%"
@echo 備份完成！并刪除臨時文件夾！
rd "%TempFolder%" /s/q

ECHO.&ECHO.Firefox完整包已打包完成，請按任意鍵 重啟Firefox 並退出！&PAUSE >NUL 2>NUL

@ping 127.0.0.1>nul
@start ..\..\..\..\Firefox\firefox.exe

@exit

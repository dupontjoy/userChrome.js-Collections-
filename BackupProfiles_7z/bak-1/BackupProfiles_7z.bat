
::2015.07.05 22:00  添加刪除項
::2015.06.30 13:00  加入prefs.js
::2015.06.19 16:00  添加重啟
::2015.06.12 20:00  先複製後刪除，不影响原文件
::2015.06.08 14:00  添加開始備份前的提示
::2015.06.01 20:00  更名爲Profiles，刪除一些不必要的項目
::2015.05.27 18:00  換用Autoproxy，不再備份Foxy數據
::2015.04.16 08:00  更新備份項，添加說明
::2015.01.26 12:00  搞定了時間问题

echo off
Title 備份Firefox配置文件夾 by Cing
ECHO.&ECHO.即將開始Profiles配置打包。需要關閉Firefox程序，請保存必要的資料! 按任意鍵繼續！&PAUSE >NUL 2>NUL

rem 設置備份路徑以及臨時文件夾
taskkill /im firefox.exe
@echo 關閉火狐瀏覽器后自動開始備份……
cd /d %~dp0
::从批处理所在位置到配置文件夹（Profiles），共跨了3层
set BackDir=..\..\..
set TempFolder=..\..\..\Temp\Profiles

taskkill /im firefox.exe

rem 复制目标文件到臨時文件夾

::以下是文件夾
::adblockplus：ABP規則備份。
xcopy "%BackDir%\adblockplus" %TempFolder%\adblockplus\  /s /y /i
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
 
::需要刪除的项
del %TempFolder%\chrome\UserScriptLoader\require\  /s /q
del %TempFolder%\extensions\userChromeJS@mozdev.org\content\myNewTab\bingImg\  /s /q
del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\de\  /s /q
del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\en-GB\  /s /q
del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\pl\  /s /q
del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\ru\  /s /q
del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\sk\  /s /q
del %TempFolder%\extensions\support@lastpass.com\platform\Darwin\  /s /q
del %TempFolder%\extensions\support@lastpass.com\platform\Darwin_x86_64-gcc3\  /s /q
del %TempFolder%\extensions\support@lastpass.com\platform\Linux_x86_64-gcc3\  /s /q
del %TempFolder%\extensions\support@lastpass.com\platform\Linux_x86-gcc3\  /s /q
del %TempFolder%\gm_scripts\picviewer_CE.db  /s /q
del %TempFolder%\gm_scripts\picviewer_CE.db-shm  /s /q
del %TempFolder%\gm_scripts\picviewer_CE.db-wal  /s /q
del %TempFolder%\gm_scripts\YouTube_Auto_Buffer_&_Auto_HD.db  /s /q
del %TempFolder%\gm_scripts\繞過站點等待、識別碼及登錄.db  /s /q
del %TempFolder%\gm_scripts\跳过网站等待、验证码及登录.db  /s /q
del %TempFolder%\gm_scripts\繞過站點等待、識別碼及登錄.db-shm  /s /q
del %TempFolder%\gm_scripts\跳过网站等待、验证码及登录.db-wal  /s /q

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
::localstore.rdf：工具列与视窗大小／位置的設定，有時刪掉可以解决一些介面上的问题。
xcopy "%BackDir%\localstore.rdf" %TempFolder%\ /y
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
xcopy "%BackDir%\prefs.js" %TempFolder%\ /y
::readme.txt：个人配置修改说明。
xcopy "%BackDir%\readme.txt" %TempFolder%\ /y
::stylish.sqlite：Stylish样式數据库。
xcopy "%BackDir%\stylish.sqlite" %TempFolder%\ /y
::user.js：使用者自订的設定，在这里的設定覆盖prefs.js的設定。
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
set ArchiveName=D:\Profiles_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

::小時數小于10点時的修正
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
set ArchiveName=D:\Profiles_%da1%%da2%%da3%-%tm1%%tm2%%tm3%_%ver%.7z

rem 開始備份
7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% "%TempFolder%"
@echo 備份完成！并刪除臨時文件夾！
rd "%TempFolder%" /s/q

ECHO.&ECHO.Firefox配置已打包完成，請按任意鍵 重啟Firefox 並退出！&PAUSE >NUL 2>NUL

@ping 127.0.0.1>nul
@start ..\..\..\..\Firefox\firefox.exe

@exit
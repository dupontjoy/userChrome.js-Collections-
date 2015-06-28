@echo off
color 2E
echo.
echo    *** 火狐浏览器便携版flash插件便携化批处理 ***
echo.
echo    使用本批处理后FF浏览器便携版原生支持flash，从此可以放到U盘里使用了！
echo    哈哈……
echo ============================================================
echo    **注意：
echo    1.本批处理需要先安装非IE的Adobe Flash Player插件！
echo    2.请把该批处理放到与firefox.exe文件相同的目录下运行！
echo    3.64位系统仅不提取插件（firefox似乎只兼容32位）！
echo    4.本批处理没什么技术含量，自然没有病毒。放心使用~~
echo.
echo    Edit By yndoc！
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
echo   e、退出此批处理。
echo.
echo.

set /p id=请选择，按回车键执行:
cls

if "%id%"=="1" goto install
if "%id%"=="2" goto set
if "%id%"=="e" goto exit

:install
echo.
echo    按任意键进入官方插件地址……
echo.
pause>nul&start "" http://get.adobe.com/cn/flashplayer/otherversions/
cls
echo.
echo    *请暂时不要关闭该批处理……
echo.
echo    *如果您已安装完毕Adobe Flash Player插件，请按任意键继续……
pause>nul

:set
cls
if “%PROCESSOR_ARCHITECTURE%”=="x86" (goto XX86) else (goto XX64)

:XX86
md plugins
copy/y C:\Windows\System32\Macromed\Flash\npswf32*.dll plugins\&copy/y C:\Windows\System32\Macromed\Flash\*plugin*.* plugins\||cls&echo 提取flash插件失败，请确认官方flash插件是否安装成功！！&&pause>nul
echo.
cls
echo 提取flash插件绿化成功，现在按任意键进入控制面板请卸载官方flash插件（最后字符为plugin的版本）安装包！！&pause>nul&&rundll32.exe shell32.dll,Control_RunDLL appwiz.cpl 2

:XX64
echo.
echo  脚本检测到您使用的是64位系统，64位插件和32位firefox不兼容，取消提取！&echo  建议直接使用您刚刚安装的flash官方插件安装包！&echo. &echo  是否卸载已安装非IE类的flash插件包？&echo  任意键进入卸载，不卸载直接关闭本批处理（Ctrl+C）！&&pause>nul&rundll32.exe shell32.dll,Control_RunDLL appwiz.cpl 2 


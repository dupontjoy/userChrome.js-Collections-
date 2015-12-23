start "" "D:\Program Files\BaiduYun\baiduyun.exe"
start "" "D:\Program Files\Tencent\Foxmail\Foxmail.exe"
start "" "D:\Program Files\Mozilla Firefox\Software\Other\PicPick\picpick.exe"
start "" "D:\Program Files\Mozilla Firefox\Software\GFW\Shadowsocks\Shadowsocks.exe"
start "" "D:\Program Files\Thunder Network\Thunder\Program\Thunder.exe"
start "" "D:\Program Files\Tencent\QQ\Bin\QQ.exe"

::Processlaso特殊处理
set dir4=D:\Program Files\System Tools\ProcessLassoPortable
start "" "%dir4%\ProcessGovernor.exe" "/logfolder=%dir4%" "/configfolder=%dir4%"
start "" "%dir4%\ProcessLasso.exe" "/logfolder=%dir4%" "/configfolder=%dir4%"
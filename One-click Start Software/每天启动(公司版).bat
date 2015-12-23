start "" "D:\Program Files\BaiduYun\baiduyun.exe"
start "" "D:\Program Files\360YunPan\360cloud\360Cloud.exe"
start "" "D:\Program Files\Tencent\Foxmail\Foxmail.exe"
start "" "D:\Program Files\Mozilla Firefox\Software\Other\PicPick\picpick.exe"
start "" "D:\Program Files\Mozilla Firefox\Software\GFW\Shadowsocks\Shadowsocks.exe"
start "" "D:\Program Files\Thunder Network\Thunder\Program\Thunder.exe"
start "" "C:\Program Files (x86)\XiaoMi\MiWiFi\MiWiFi.exe"
start "" "D:\Program Files\Tencent\QQ\Bin\QQ.exe"
start "" "D:\Program Files\Jingoal\Jingoal.exe"

::Processlaso特殊处理
set dir4=D:\Program Files\System Tools\ProcessLassoPortable
start "" "%dir4%\ProcessGovernor.exe" "/logfolder=%dir4%" "/configfolder=%dir4%"
start "" "%dir4%\ProcessLasso.exe" "/logfolder=%dir4%" "/configfolder=%dir4%"
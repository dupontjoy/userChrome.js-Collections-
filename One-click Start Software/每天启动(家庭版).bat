::Processlaso特殊处理
set dir4=D:\Program Files\System Tools\ProcessLassoPortable
start "Processlaso" "%dir4%\ProcessGovernor.exe" "/logfolder=%dir4%" "/configfolder=%dir4%"
start "Processlaso" "%dir4%\ProcessLasso.exe" "/logfolder=%dir4%" "/configfolder=%dir4%"

::普通啟動
::start "百度雲同步" "D:\Program Files\BaiduYun\baiduyun.exe"
start "360雲同步" "D:\Program Files\360YunPan\360cloud\360Cloud.exe"
start "Foxmail" "D:\Program Files\Tencent\Foxmail\Foxmail.exe"
start "PicPick" "D:\Program Files\Mozilla Firefox\Software\Other\PicPick\picpick.exe"
start "SS" "D:\Program Files\Mozilla Firefox\Software\GFW\Shadowsocks\Shadowsocks.exe"
start "迅雷" "D:\Program Files\Thunder Network\Thunder\Program\Thunder.exe"
start "QQ" "D:\Program Files\Tencent\QQ\Bin\QQ.exe"
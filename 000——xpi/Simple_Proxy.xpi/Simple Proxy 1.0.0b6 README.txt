##Simple Proxy


#How to use

1) Full compatibility with Auto-proxy Rulelist.
  1.1) Supports  .ini and  .txt file extensions.
2) Server must match the form of server protocol::server adress::server port
  2.1) For example, socks::127.0.0.1::1080
  2.2) Supported protocol: http, socks, socks4
    2.2.1) http resolve both HTTP and HTTPS protocol, socks resolve SOCKS V5, and socks4 resolve SOCKS V4
    2.2.2) https can be defined too, but it's not recommended
3) Use remote address http:// or https:// to subscribe proxy list, compatible with base64 encoding.
  3.1） For example, https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
  3.2) Remote rulelist updates in 4 days
4) You can address absolute path using "Browse" button in about:addons
5) You can address relative path using file.txt@profile to access the rulelist in Profile\SimpleProxy\file.txt
  5.1) profile stands for Profile\SimpleProxy\
  5.2) firefox stands for Mozilla Firefox\browser\SimpleProxy\
  5.3) winuser stands for %UserProfile%\SimpleProxy\
6) If you've manually updated the rulelists, you need to click the "Reload All List" button in about:addons
7) You can clear the profile which is no longer in use by press Clear Profile X


# 使用说明

1） 完全兼容Auto-proxy规则列表
  1.1） 支持  .ini 及  .txt 文件后缀。
2) 服务器必须满足 类型::地址::端口 的格式
  2.1) 例如 socks::127.0.0.1::1080
  2.2) 支持的协议类型 http, socks, socks4
    2.2.1) http 兼容 HTTP 与 HTTPS 协议, socks 兼容 SOCKS V5, socks4 兼容 SOCKS V4
    2.2.2) https 也适用，但并不推荐。
3） 可以通过添加 http:// 或 https:// 远程连接来订阅远程规则，支持base64编码的文件。
  3.1) 例如 https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
  3.2） 订阅规则每4天自动更新一次。
4） 可以通过 about:addons 设置界面的 “浏览” 按钮来指定绝对路径中的文件。
5） 可以通过 file.txt@profile 这样的格式来访问相对路径 Profiles\SimpleProxy\file.txt 中的规则。
  5.1) profile 代表 Profile\SimpleProxy\
  5.2) firefox 代表 Mozilla Firefox\browser\SimpleProxy\
  5.3) winuser 代表 %UserProfile%\SimpleProxy\
6） 如果你手动更新了规则表，那么你需要单击about:addons页面的 Reload All List 按钮。
7） 你可以通过点击 Clear Profile X 来清理掉不再使用的档案
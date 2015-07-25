addMenuPlus.uc.js
=================

Y大地址（含详尽说明）：https://github.com/ywzhaiqi/userChromeJS/tree/master/addmenuPlus

规则定制页面：http://ywzhaiqi.github.io/addMenu_creator/

addMenuPlus 是一个非常强大的定制菜单的 uc 脚本。通过配置文件可添加、修改、隐藏菜单，修改后无需重启生效。

基于 [Griever/addMenu.uc.js](https://github.com/Griever/userChromeJS/tree/master/addMenu) 修改

 - 新增**修改原有菜单**的功能
 - 新增参数 `%FAVICON_BASE64%`：站点图标的 base64
 - 新增参数 `%IMAGE_BASE64%`：图片的 BASE64
 - 新增参数 `%TITLES%`：简短的标题

### 使用说明及技巧

 - `_addmenu.js` 文件为配置文件，默认放在 `chrome` 目录下。
 - 在 `about:config` 中可通过 `addMenu.FILE_PATH` 设置配置文件的路径（如果没有手动新建一个）。例如`local\_addMenu.js` 为相对 chrome 下的路径（windows）。
 - 菜单栏的 "工具" 菜单中有个 "addMenu 的重新载入和编辑" 菜单，左键点击重新载入配置，右键打开文件编辑（需要首先设置 about:config 中 view_source.editor.path 编辑器的路径）
 - ID 为 `addMenu-rebuild`，可添加到 rebuild_userChrome.uc.xul 统一进行管理
 - 新增 `载入配置出错提示`，点击可直接定位到第几行，需要首先设置参数，详见 [编辑器及参数说明](https://github.com/ywzhaiqi/userChromeJS#%E7%BC%96%E8%BE%91%E5%99%A8%E5%8F%8A%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E)。
 - **[addMenu 脚本配置生成器](http://ywzhaiqi.github.io/addMenu_creator/)**

### 可参考的配置

成品

 - [defpt 的配置](https://github.com/defpt/userChromeJs/tree/master/addMenuPlus)
 - [bobdylan520 的配置](http://bbs.kafan.cn/thread-1677811-1-1.html)
 - [creek560 的配置](http://bbs.kafan.cn/thread-1682712-1-1.html)

其它

 - [\_addmenu.js](https://github.com/ywzhaiqi/userChromeJS/blob/master/addmenuPlus/_addmenu.js)
 - [\_addmenu示例合集.js](https://github.com/ywzhaiqi/userChromeJS/blob/master/addmenuPlus/_addmenu%E7%A4%BA%E4%BE%8B%E5%90%88%E9%9B%86.js)
 - [Oos 的摘要](https://github.com/Drager-oos/userChrome/tree/master/Configuration)

### firefox 32+ 右键错位的问题

修改 `insertBefore: 'context-reload',` 或 `insertBefore: 'context-bookmarkpage',` 为 `insertBefore: 'context-openlinkincurrent',`

## 配置的说明

### 可添加的范围

 - page: 页面右键菜单
 - tab: 标签右键
 - tool: 工具菜单
 - app: 左上角橙色菜单（firefox 29 以下版本）

二级子菜单

    PageMenu, TabMenu, ToolMenu, AppMenu

### 标签的介绍

    label       菜单的名称
    accesskey   快捷键
    exec        启动外部应用程序。（我新增相对路径。 \\ 代表当前配置的路径，例：\\Chrome 代表配置下的Chrome文件夹）
    keyword     指定了关键字的书签或搜索引擎
    text        复制你想要的字符串到剪贴板，可与 keyword, exec 一起使用
    url         打开你想要的网址
    where       打开的位置 (current, tab, tabshifted, window)
    condition   菜单出现的条件 (select, link, mailto, image, media, input, noselect, nolink, nomailto, noimage, nomedia, noinput)
    oncommand   自定义命令
    command     命令的 id
    onclick     点击的函数
    image       添加图标 （对应图标 url 或 base64）
    style       添加样式
    ...         Firefox 菜单的其它属性

    id          标签的ID（我新增的，修改原菜单用）
    position/insertBefore/insertAfter: 位置的设置（3选1），position: 1,  insertBefore: "id",  insertAfter: "id"
    clone       false 为不克隆，直接改在原菜单上，还原必须重启生效或打开新窗口
    onshowing   新增的，当页面右键显示时会执行该函数，可用于动态更改标签标题，详见下面的示例。

参考链接：

 - [oncommand - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Attribute/oncommand)
 - [command - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/command)
 - [Attribute (XUL) - Mozilla | MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Attribute)


### 可利用的变量

    %EOL%            换行(\r\n)
    %TITLE%          标题
    %TITLES%         简化标题（我新增的，来自 faviconContextMenu.uc.xul.css）
    %URL%            地址
    %SEL%            选取范围内的文字
    %RLINK%          链接的地址
    %IMAGE_URL%      图片的 URL
    %IMAGE_BASE64%   图片的 Base64（我新增的，不支持 gif 动态图片）
    %IMAGE_ALT%      图片的 alt 属性
    %IMAGE_TITLE%    图片的 title 属性
    %LINK%           链接的地址
    %LINK_TEXT%      链接的文本
    %RLINK_TEXT%     链接的文本（上面那个的别名）
    %MEDIA_URL%      媒体 URL
    %CLIPBOARD%      剪贴板的内容
    %FAVICON%        Favicon（站点图标） 的 URL
    %FAVICON_BASE64% Favicon 的 Base64（我新增的）
    %EMAIL%          E-mail 链接
    %HOST%           当前网页的域名
    %LINK_HOST%      链接的域名
    %RLINK_HOST%     链接的域名（同上）

    %XXX_HTMLIFIED%  转义后的变量 （XXX 为 上面的 TITLE 等）
    %XXX_HTML%       转义后的变量
    %XXX_ENCODE%     encodeURIComponent 后的变量

简短的变量

    %h               当前网页(域名)
    %i               图片的 URL
    %l               链接的 URL
    %m               媒体的 URL
    %p               剪贴板的内容
    %s               选取的文字列
    %t               标题
    %u               URL

### 隐藏菜单右侧的 tab 提示

    css('.addMenu .menu-iconic-accel[value="tab"] { display: none; }');
    css('.addMenu .menu-iconic-accel[value="tabshifted"] { display: none; }');
    css('.addMenu .menu-iconic-accel[value="window"] { display: none; }');
    css('.addMenu .menu-iconic-accel[value="current"] { display: none; }');

###自定義規則

示例：用新分頁開啟鏈結左中右鍵

    {
    label: "用新分頁開啟鏈結",
    accesskey: "T",
    condition: "link",
    position: 1,
    tooltiptext: "左鍵：用新分頁開啟鏈結\n中鍵：複製鏈接網址\n右鍵：迅雷雲播放",
    onclick: function(e) {
    switch(e.button) {
    case 0:
    gBrowser.addTab(addMenu.convertText("%RLINK%"));
    closeMenus(this);
    break;
    case 1:
    addMenu.copy(addMenu.convertText("%RLINK%"));
    closeMenus(this);
    break;
    case 2:
    gBrowser.addTab("http://vod.xunlei.com/iplay.html?uvs=luserid_5_lsessionid&from=vlist&url=" + addMenu.convertText("%RLINK_OR_URL%"));
    closeMenus(this);
    break;
    }
    },
    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAZ0lEQVQ4jWNgGCyAjYGBYRIDA8NrBgaG/0Tg11D1bDADJjEwMOxmYGAQJ9JCcaj6VpjAaxI0IxvyGsb5j0chXjkmEm3FABQbwIJDHN3ZyHxGYjQQLTfwYUCMAVj9TDUXwEzHF1C0BQCpARnHXF2p+wAAAABJRU5ErkJggg=="
    }

示例：複製圖片地址左右鍵

    {
    label: "複製圖片地址",
    tooltiptext: "左鍵：複製圖片地址\n右鍵：複製圖片Base64碼",
    onclick: function(e) {
    switch(e.button) {
    case 0:
    addMenu.copy(addMenu.convertText("%IMAGE_URL%"));/*複製圖片地址*/
    closeMenus(this);
    break;
    case 2:
    addMenu.copy(addMenu.convertText("%IMAGE_BASE64%"));
    closeMenus(this);
    break;
    }
    },
    accesskey: "O",
    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAyUlEQVQ4jbWTLw6DMBjFfwaDmauq5QhY9C4wyQWQOA6whAtwBS6wO0xOzeKQO8REH6EUwsqWvaRpk37vT7+28AfYX8gZ8NIcIgf6GJESGAATpBqAc2ySFrgDCZACD6CKJU/oNW5Ad5SMnEdc9OQbgQp4SqA8QsyAWu6W+WZaoPhEblQ8sGxah+vFKKHdyFbFl0C4A064G6lDsmV+QIWc0o19G6xXDkbxffcJtdyNaht/0z/jKp6Hq2pWbyPDNSffIU8oJLT1X47jDR7gLDGf5CLwAAAAAElFTkSuQmCC"
    },
    
示例：Email地址左中右鍵

    {
    label: "Email地址",
    accesskey: "E",
    tooltiptext: "左鍵：163郵箱\n中鍵：QQ郵箱\n右鍵：Gmail郵箱",
    insertBefore: "QuickReply-sep",
    onclick: function(e) {
    switch(e.button) {
    case 0:
    addMenu.copy(addMenu.convertText('d***y@163.com'));
    goDoCommand('cmd_paste');
    closeMenus(this);
    break;
    case 1:
    addMenu.copy(addMenu.convertText('d***y@qq.com'));
    goDoCommand('cmd_paste');
    closeMenus(this);
    break;
    case 2:
    addMenu.copy(addMenu.convertText('d***y@gmail.com'));
    goDoCommand('cmd_paste');
    closeMenus(this);
    break;
    }
    },
    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAuElEQVQ4jc3SIQ7CQBCF4S8hQWCQKBQah+sJENwAj0UiuQAGjeQEWCwai8RhUPgmRXRICpRCMTDJbHY2+/55mV3+IcZIkdXMFEO4RHZrNJ3giJOgTXFA5wPxKIS90OYL5tijXSHu44xB1HcAWGKLVom4G7ZHhbMnAKyxQaNw1gp3s4e7pYBmANZRN6JelrgqBdw67rAK0PbB0VsA+TAXka8GWwn4JDLyN02+ECehNYxN3a98Cu2P4wq1e0SOXg0ncwAAAABJRU5ErkJggg=="
    }

示例：插入BBCode左中右鍵

    {
    label: "插入BBCode",
    id: "BBCode",
    accesskey: "B",
    tooltiptext: "左鍵：代碼[code]\n中鍵：鏈接[url]\n右鍵：圖片[img]",
    onclick: function(e) {
    switch(e.button) {
    case 0:
    addMenu.copy(addMenu.convertText('[code]%P[/code]'));
    goDoCommand('cmd_paste');
    closeMenus(this);
    break;
    case 1:
    addMenu.copy(addMenu.convertText('[url]%P[/url]'));
    goDoCommand('cmd_paste');
    closeMenus(this);
    break;
    case 2:
    addMenu.copy(addMenu.convertText('[img]%P[/img]'));
    goDoCommand('cmd_paste');
    closeMenus(this);
    break;
    }
    },
    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAJ1BMVEUAAAAAAADd3d1EREQiIiKIiIh3d3czMzPMzMyqqqpVVVURERHu7u6A1ky6AAAAAXRSTlMAQObYZgAAADtJREFUCNdjwASCECDAIADhIzMYBQsMpRWADBaGCiO2ALCIg6EgRCTViHMBjLEILFVjKN2AxRyEFRgAAGitCNm3Ki02AAAAAElFTkSuQmCC"
    },
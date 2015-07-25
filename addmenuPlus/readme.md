Y大地址（含详尽说明）：https://github.com/ywzhaiqi/userChromeJS/tree/master/addmenuPlus

规则定制页面：http://ywzhaiqi.github.io/addMenu_creator/

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
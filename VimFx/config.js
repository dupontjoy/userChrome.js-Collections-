//2017.07.20

/******************************************************************************************
快捷键分类:
地址栏: location
滚动: scrolling
标签页: tabs
浏览: browsing
查找: find
杂项: misc
光标模式: caret
Hint模式: hints
忽略模式: ignore


几种搜索方式:
(3)#: 搜索标题
(5)%: 搜索标签
(6)^: 搜索历史
(8)*: 搜索书签


参照配置:
https://github.com/akhodakivskiy/VimFx/wiki/Share-your-config-file
https://github.com/azuwis/.vimfx/blob/master/config.js
https://github.com/lydell/dotfiles/blob/master/.vimfx/config.js
 *******************************************************************************************/

/******************************************************************************************
 *这里是一些必要的设置, 载入库, 接入API等等, 请不要隨意更改它们.
 *******************************************************************************************/
const {classes: Cc, interfaces: Ci, utils: Cu} = Components
const nsIEnvironment = Cc["@mozilla.org/process/environment;1"].getService(Ci.nsIEnvironment)
const nsIStyleSheetService = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService)
const nsIWindowWatcher = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher)
const nsIXULRuntime = Cc['@mozilla.org/xre/app-info;1'].getService(Ci.nsIXULRuntime)
const {OS} = Cu.import('resource://gre/modules/osfile.jsm')

const globalMessageManager = Cc['@mozilla.org/globalmessagemanager;1']
  .getService(Ci.nsIMessageListenerManager)

Cu.import('resource://gre/modules/XPCOMUtils.jsm')
XPCOMUtils.defineLazyModuleGetter(this, 'AddonManager', 'resource://gre/modules/AddonManager.jsm')
XPCOMUtils.defineLazyModuleGetter(this, 'NetUtil', 'resource://gre/modules/NetUtil.jsm')
XPCOMUtils.defineLazyModuleGetter(this, 'PlacesUtils', 'resource://gre/modules/PlacesUtils.jsm')
XPCOMUtils.defineLazyModuleGetter(this, 'PopupNotifications', 'resource://gre/modules/PopupNotifications.jsm')
XPCOMUtils.defineLazyModuleGetter(this, 'Preferences', 'resource://gre/modules/Preferences.jsm')

// helper functions
let getWindowAttribute = (window, name) => {
  return window.document.documentElement.getAttribute(`vimfx-config-${name}`)
}

let setWindowAttribute = (window, name, value) => {
  window.document.documentElement.setAttribute(`vimfx-config-${name}`, value)
}

function listen(window, eventName, listener) {
  window.addEventListener(eventName, listener, true)
  vimfx.on('shutdown', () => {
    window.removeEventListener(eventName, listener, true)
  })
}

let {commands} = vimfx.modes.normal

let popup = (message, options) => {
    let window = nsIWindowWatcher.activeWindow
    if(!window)
        return
    let notify  = new PopupNotifications(window.gBrowser,
                                         window.document.getElementById('notification-popup'),
                                         window.document.getElementById('notification-popup-box'))
    let notification =  notify.show(window.gBrowser.selectedBrowser, 'notify',
                                    message, null, options, null, {
                                        popupIconURL: 'chrome://branding/content/icon128.png'
                                    })
    window.setTimeout(() => {
        notification.remove()
    }, 5000)
}

let set = (pref, valueOrFunction) => {
    let value = typeof valueOrFunction === 'function'
        ? valueOrFunction(vimfx.getDefault(pref))
        : valueOrFunction
    vimfx.set(pref, value)
}

let toggleCss = (uriString, vim) => {
    let uri = Services.io.newURI(uriString, null, null)
    let method = nsIStyleSheetService.AUTHOR_SHEET
    let basename = OS.Path.basename(uriString)
    if (nsIStyleSheetService.sheetRegistered(uri, method)) {
        nsIStyleSheetService.unregisterSheet(uri, method)
        vim.notify(`Disable ${basename}`)
    } else {
        nsIStyleSheetService.loadAndRegisterSheet(uri, method)
        vim.notify(`Enable ${basename}`)
    }
    // vimfx.on('shutdown', () => {
    //     nsIStyleSheetService.unregisterSheet(uri, method)
    // })
}

let map = (shortcuts, command, custom=false) => {
    vimfx.set(`${custom ? 'custom.' : ''}mode.normal.${command}`, shortcuts)
}

let pathSearch = (bin) => {
    if (OS.Path.split(bin).absolute)
        return bin
    let pathListSep = (nsIXULRuntime.OS == 'WINNT') ? ';' : ':'
    let dirs = nsIEnvironment.get("PATH").split(pathListSep)
    let file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile)
    for (let dir of dirs) {
        let path = OS.Path.join(dir, bin)
        file.initWithPath(path)
        if (file.exists() && file.isFile() && file.isExecutable())
            return path
    }
    return null
}

let exec = (cmd, args, observer) => {
    let file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile)
    file.initWithPath(pathSearch(cmd))
    let process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess)
    process.init(file)
    process.runAsync(args, args.length, observer)
}

let loadCss = (uriString) => {
  let uri = Services.io.newURI(uriString, null, null)
  let method = nsIStyleSheetService.AUTHOR_SHEET
  if (!nsIStyleSheetService.sheetRegistered(uri, method)) {
    nsIStyleSheetService.loadAndRegisterSheet(uri, method)
  }
  vimfx.on('shutdown', () => {
    nsIStyleSheetService.unregisterSheet(uri, method)
  })
}


/******************************************************************************************
 *这里是自定义设置, 你可以根据自己的需要来调整它们. 参照已有设置的格式, 动手将自己的想法变成现实吧.
 *******************************************************************************************/
// options选项
set('hints.chars', 'fdsagrueiwcvqtxzjklhonmypb')//Hint提示符(改了排序)
set('hints.sleep', -1)
set('prev_patterns', v => `[上前]\\s*一?\\s*[页张个篇章页] ${v}`)
set('next_patterns', v => `[下后]\\s*一?\\s*[页张个篇章页] ${v}`)

// shortcuts快捷键(一些键冲突, 重新布署)
set('mode.normal.window_new', 'W')//新建窗口
set('mode.normal.tab_select_previous', 'w')//上一个标签
set('mode.normal.tab_select_next', 'e')//下一个标签
set('mode.normal.scroll_half_page_up', 's')//向上滾动半页
set('mode.normal.stop', 'S')//停止载入当前页面
set('mode.normal.mark_scroll_position', 'M')//标记滚动位置
set('mode.ignore.exit', '<escape>')//忽略模式-->返回普通模式
set('mode.normal.follow_in_focused_tab', 'gt')//在新的前台标签页打开此链接
set('mode.normal.tab_move_to_window', 'gw')//将标签页移动到新窗口中
set('mode.normal.follow_in_window', 'gW')//在新的窗口打开此链接
set('mode.normal.follow_focus', 'gf')//聚焦/选中元素
set('mode.normal.open_context_menu', 'gc')//为元素打开上下文菜单
set('mode.normal.click_browser_element', 'gb')//点击浏览器元素
set('mode.normal.enter_mode_ignore', 'I')//进入忽略模式: 忽略所有命令
set('mode.normal.quote', 'i')//把下一个按键直接发送给页面(不触发 VimFx 内设置的快捷键)

// commands命令
vimfx.addCommand({
    name: 'goto_addons',
    description: '新标签打开about:addons',
    category: 'browsing',
}, ({vim}) => {
    vim.window.BrowserOpenAddonsMgr()
})
map(',a', 'goto_addons', true)

vimfx.addCommand({
    name: 'goto_config',
    description: '新标签打开about:config',
    category: 'browsing',
}, ({vim}) => {
    vim.window.switchToTabHavingURI('about:config', true)
})
map(',c', 'goto_config', true)

vimfx.addCommand({
  name: 'go_increment',
  description: 'URL最后一个数字递增',
  category: 'location',
}, ({vim, count}) => {
  if (!count) count = 1;
  let uri = vim.window.gBrowser.selectedBrowser.currentURI.spec;
  vim.window.gBrowser.loadURI(uri.replace(/(\d+)(?=\D*$)/, function($0) {
        return +$0 + count;
      }));
});
map(',u', 'go_increment', true)

vimfx.addCommand({
  name: 'go_decrement',
  description: 'URL最后一个数字递减',
  category: 'location',
}, ({vim, count}) => {
  if (!count) count = -1;
  let uri = vim.window.gBrowser.selectedBrowser.currentURI.spec;
  vim.window.gBrowser.loadURI(uri.replace(/(\d+)(?=\D*$)/, function($0) {
        return +$0 + count;
      }));
});
map(',d', 'go_decrement', true)

/*vimfx.addCommand({
    name: 'goto_ehh',
    description: 'EHH元素隐藏',
}, ({vim}) => {
    vim.window._ehhWrapper.toggleSelection();
})
map(',e', 'goto_ehh', true)*/

vimfx.addCommand({
    name: 'go_wallpaper',
    description: '下一张壁纸',
    category: 'misc',
}, ({vim}) => {
    //vim.window.sougouPIC.setRileGou();
    vim.window.wallpaperPIC.setRileGou();
})
map(',p', 'go_wallpaper', true)

vimfx.addCommand({
    name: 'go_close_currentfirefox',
    description: '关闭当前Firefox窗口',
    category: 'misc',
}, ({vim}) => {
    vim.window.BrowserTryToCloseWindow()
})
map(',x', 'go_close_currentfirefox', true)

//群体重新载入，按顺序进行，遇到失效的将终止，所以请保证所有重载都是有效的。
vimfx.addCommand({
    name: 'go_rebuild',
    description: '几个脚本设置重新载入',
}, ({vim}) => {
    vim.window.addMenu.rebuild();//AddmenuPlus
    vim.window.FeiRuoNet.Rebuild();//FeiRuoNet
    vim.window.MyMoveButton.delayRun();//Movebutton
    vim.window.Redirector.reload();//Redirector
    vim.window.anobtn.reload();//anobtn
    
    //vim.window.USL.rebuild();//UserScriptLoader
    //vim.window.UCL.rebuild();//UserCSSLoader

})
map(',r', 'go_rebuild', true)

vimfx.addCommand({
    name: 'restart',
    description: '重启Firefox',
}, ({vim}) => {
    Services.startup.quit(Services.startup.eRestart | Services.startup.eAttemptQuit)
})
map(',R', 'restart', true)

vimfx.addCommand({
    name: 'goto_preferences',
    description: '新标签打开选项',
    category: 'browsing',
}, ({vim}) => {
    vim.window.openPreferences()
})
map(',s', 'goto_preferences', true)

vimfx.addCommand({
    name: 'go_wordhilight',
    description: 'WordHighlight添加詞',
    category: 'find',
}, ({vim}) => {
    vim.window.gWHT.addWord()
})
map(',w', 'go_wordhilight', true)

vimfx.addCommand({
    name: 'go_wordhilight_close',
    description: '关闭WordHighlight查找栏',
    category: 'find',
}, ({vim}) => {
    vim.window.gWHT.destroyToolbar()
})
map(',W', 'go_wordhilight_close', true)

/*
vimfx.addCommand({
    name: 'pocket',
    description: 'Save to Pocket',
}, ({vim}) => {
    vim.window.document.getElementById('pocket-button').click();
});
vimfx.set('custom.mode.normal.pocket', 's');

vimfx.addCommand({
    name: 'mpv_current_href',
    description: 'Mpv play focused href',
}, ({vim}) => {
    let mpv_observer = {
        observe: (subject, topic) => {
            if (subject.exitValue !== 0)
                vim.notify('Mpv: No video')
        }
    }
    vimfx.send(vim, 'getFocusedHref', null, href => {
        if (href && href.match('^https?://')) {
            let args = ['--profile=pseudo-gui', '--cache=no', '--fs', href]
            exec('mpv', args, mpv_observer)
            vim.notify(`Mpv: ${href}`)
        } else {
            vim.notify('Mpv: No link')
        }
    })
})
map('b', 'mpv_current_href', true)

vimfx.addCommand({
    name: 'mpv_current_tab',
    description: 'Mpv play current tab',
}, ({vim}) => {
    let url = vim.window.gBrowser.selectedBrowser.currentURI.spec
    let args = ['--profile=pseudo-gui', '--cache=no', '--fs', url]
    exec('mpv', args)
    vim.notify(`Mpv: ${url}`)
})
map(',m', 'mpv_current_tab', true)*/

/*vimfx.addCommand({
    name: 'toggle_https',
    description: 'HTTP/HTTPS切换',
    category: 'location',
}, ({vim}) => {
    let url = vim.window.gBrowser.selectedBrowser.currentURI.spec
    if (url.startsWith('http://')) {
        url = url.replace(/^http:\/\//, 'https://')
    } else if (url.startsWith('https://')) {
        url = url.replace(/^https:\/\//, 'http://')
    }
    vim.window.gBrowser.loadURI(url)
})
map('gs', 'toggle_https', true)*/


vimfx.addCommand({
    name: 'ublock_bootstrap',
    description: 'uBlock第三方规则列表',
}, ({vim}) => {
    let gBrowser = vim.window.gBrowser
    let url = gBrowser.selectedBrowser.currentURI.spec
    let ublockUrl = 'chrome://ublock0/content/dashboard.html#3p-filters.html'
    if (url === ublockUrl) {
        ublockBootstrap(gBrowser.contentDocument)
    } else {
        let ublockTab = gBrowser.addTab(ublockUrl)
        gBrowser.selectedTab = ublockTab
    }
})
map('zb', 'ublock_bootstrap', true)

vimfx.addCommand({
    name: 'goto_redirector',
    description: '打开Redirector扩展设置',
    category: 'misc',
}, ({vim}) => {
    vim.window.switchToTabHavingURI('moz-extension://bf1aa2af-906f-466b-b1d8-8cc42d6e4133/redirector.html', true)
})
map('zr', 'goto_redirector', true)

vimfx.addCommand({
    name: 'umatrix_bootstrap',
    description: 'uMatrix自定义规则',
    category: 'misc',
}, ({vim}) => {
    vim.window.switchToTabHavingURI('chrome://umatrix/content/dashboard.html#user-rules', true)
})
map('zm', 'umatrix_bootstrap', true)

let bootstrap = () => {
    // install addons
    let addons = [
        //{id: 'SimpleX@White.Theme', url: 'latest/simplex'},


    ]
    addons.forEach((element) => {
        AddonManager.getAddonByID(element.id, (addon) => {
            if(!addon) {
                let url = element.url
                if(!url.startsWith('https://')) {
                    url = 'https://addons.mozilla.org/firefox/downloads/' + url
                }
                AddonManager.getInstallForURL(url, (aInstall) => {
                    aInstall.install()
                }, 'application/x-xpinstall')
            }
        })
    })
    // Open about:support to see list of addons
    // disable addons
    let disabled_addons = [
        //'firefox@getpocket.com',
        //'gmp-gmpopenh264',
        //'loop@mozilla.org',
    ]
    disabled_addons.forEach((element) => {
        AddonManager.getAddonByID(element, (addon) => {
            addon.userDisabled = true
        })
    })
    let bookmarks = PlacesUtils.bookmarks
    search_engines.forEach((element) => {
        let uri = NetUtil.newURI(element.url, null, null)
        if (!bookmarks.isBookmarked(uri)) {
            bookmarks.insertBookmark(
                bookmarks.unfiledBookmarksFolder,
                uri,
                bookmarks.DEFAULT_INDEX,
                element.title)
            PlacesUtils.keywords.insert(element)
        }
    })
    popup('Bootstrap succeeded.', {
        label: 'Open Addons',
        accessKey: 'A',
        callback: () => {
            nsIWindowWatcher.activeWindow.BrowserOpenAddonsMgr()
        }
    })
}
vimfx.addCommand({
    name: 'bootstrap',
    description: 'Bootstrap',
}, ({vim}) => {
    try {
        bootstrap()
    } catch (error) {
        vim.notify('Bootstrap failed')
        console.error(error)
        return
    }
    vim.notify('Bootstrap succeeded')
})
map(',B', 'bootstrap', true)

/******************************************************************************************
 *其它加载(如CSS和部分User.js).
 *******************************************************************************************/
//加载CSS
loadCss(`${__dirname}/../../UserCSSLoader/01-UI——UI调整.css`)
loadCss(`${__dirname}/../../UserCSSLoader/01-UI——附加组件显示版本号.css`)
loadCss(`${__dirname}/../../UserCSSLoader/02-微调——页面.css`)
loadCss(`${__dirname}/../../UserCSSLoader/02-微调——字体效果.css`)
loadCss(`${__dirname}/../../UserCSSLoader/02-微调——图标菜单.css`)
loadCss(`${__dirname}/../../UserCSSLoader/02-微调——图标替换.css`)
loadCss(`${__dirname}/../../UserCSSLoader/02-微调——图标效果&排序.css`)
loadCss(`${__dirname}/../../UserCSSLoader/02-微调——隐藏项.css`)
loadCss(`${__dirname}/../../UserCSSLoader/03-其他——Cursors for hyperlinks.css`)
loadCss(`${__dirname}/../../UserCSSLoader/03-其他——网站修正.css`)
loadCss(`${__dirname}/../../UserCSSLoader/RC-界面——关于页面.css`)
loadCss(`${__dirname}/../../UserCSSLoader/RC-界面——搜索栏.css`)
loadCss(`${__dirname}/../../UserCSSLoader/RC-界面——新标签页.css`)
loadCss(`${__dirname}/../../UserCSSLoader/RC-界面——元素调整.css`)
loadCss(`${__dirname}/../../UserCSSLoader/RC-主题——Yosemite.css`)
loadCss(`${__dirname}/../../UserCSSLoader/RC-主题——主题补丁.css`)

//加载CSS文件(未成功)
/*let {css} = Cu.import(`${__dirname}/../../UserCSSLoader/.css?${Math.random()}`, {})
loadCss(css)*/

//设置参数
Preferences.set({
//VimFx
'devtools.chrome.enabled': true,//VimFx必要
'extensions.VimFx.prevent_autofocus': true,//阻止自动聚焦输入框
'extensions.VimFx.ignore_keyboard_layout': true,//忽略键盘布局
})

//加载外置user.js文件
let {PREFS} = Cu.import(`${__dirname}/../_user.js?${Math.random()}`, {})
Preferences.set(PREFS)


/******************************************************************************************
 *other: 引导
 *******************************************************************************************/
let bootstrapIfNeeded = () => {
    let bootstrapFile = OS.Path.fromFileURI(`${__dirname}/config.js`)
    let bootstrapPref = "extensions.VimFx.bootstrapTime"
    let file = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsIFile)
    file.initWithPath(bootstrapFile)
    if (file.exists() && file.isFile() && file.isReadable()) {
        let mtime = Math.floor(file.lastModifiedTime / 1000)
        let btime = Preferences.get(bootstrapPref)
        if (!btime || mtime > btime) {
            bootstrap()
            Preferences.set(bootstrapPref, Math.floor(Date.now() / 1000))
        }
    }
}
bootstrapIfNeeded()
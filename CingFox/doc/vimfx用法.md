##VimFx用法

VimFx是一个强大的扩展, 主要功能是模拟Vim的键盘操作方式, 同类扩展有Vimperator和Pentadactyl. 

###入门: VimFx与Vimperator/Pentadactyl的比较
- Vimperator和Pentadactyl默认会把Ctrl+C, Ctrl+V这样常用的快捷键都更改, 对于新手来说并不好用. 与这两个扩展不同的是: 默认VimFx不会更改Firefox自有的快捷键, 这样用户能无缝接入VimFx扩展, 而不用专门去排除一些常的的按键.
- Vimperator和Pentadactyl的设置文件默认是保存在C盘, 要变更位置还比较麻烦, 至少我没有改成功 . 而VimFx的设置文件位置有一条参数在管理. 我是使用setRelativeEditPath.uc.js这个脚本来设置相对路径的.

```javascript
    extensions.VimFx.config_file_directory
```

###进阶篇
对于有一定动手能力的用户来说, 你也可以自定义规则, 将个性化的设置写入Config.js中. 目前我已将Keychanger.uc.js中的快捷键移植到了VimFx, 配合VimFx自带的Vim化快捷键, 用键盘操作起来更加强大.

快捷键大全:
![](https://raw.githubusercontent.com/dupontjoy/userChrome.js-Collections-/master/CingFox/img/vimfx.jpg)

####VimFx常用快捷方式：
| **快捷键:**        | **功能說明:**                       |
| :--------------- | :------------------------------ |
| <kbd>o</kbd>           | 聚焦地址栏                     |
| <kbd>O</kbd>           | 聚焦搜索栏                     |
| <kbd>H</kbd>           | 后退                     |
| <kbd>J</kbd>           | 前进                     |
| <kbd>r</kbd>           | 重新载入当前页面                     |
| <kbd>d</kbd>           | 向下滚动半屏                     |
| <kbd>u</kbd>           | 向上滚动半屏                     |
| <kbd>gg</kbd>           | 滚动到顶部                     |
| <kbd>G</kbd>           | 滚动到底部                     |
| <kbd>t</kbd>           | 新建标签页                     |
| <kbd>w</kbd>          | 上一个标签页                     |
| <kbd>e</kbd>           | 下一个标签页                     |
| <kbd>gl</kbd>           | 最近选中的标签页                     |
| <kbd>g0</kbd>           | 跳到第一个标签页                     |
| <kbd>g$</kbd>           | 跳到最后一个标签页                     |
| <kbd>x</kbd>           | 关闭标签页                     |
| <kbd>X</kbd>           | 恢复关闭标签页                     |
| <kbd>gx$</kbd>           | 关闭右边的标签页                     |
| <kbd>gxa</kbd>           | 关闭其他标签页                     |
| <kbd>f</kbd>           | 当前标签打开链接或聚焦输入框或点击按钮                     |
| <kbd>F</kbd>          | 新标签后台打开链接                     |
| <kbd>gf</kbd>          | 新标签前台打开链接                     |
| <kbd>af</kbd>           | 新标签后台打开多个链接                     |
| <kbd>gi</kbd>           | 聚焦第一个或最后聚焦过的输入框                     |
| <kbd>?</kbd>           | 显示帮助框                     |
| <kbd>,a</kbd>           | 打开附加组件(about:addons)                     |
| <kbd>,c</kbd>           | 打开about:config                   |
| <kbd>,d</kbd>           | 打开下载历史(弹窗)                   |
| <kbd>,h</kbd>           | 打开浏览历史(弹窗)                   |
| <kbd>,w</kbd>           | Wordhightbar搜索关键字                   |
| <kbd>.r</kbd>           | 几个脚本配置的重载                   |
| <kbd>,r</kbd>           | 打开Redirector扩展的设置界面                   |
| <kbd>,s</kbd>           | 打开选项(about:preferences)                   |
| <kbd>,t</kbd>           | 搜索标签                  |
| <kbd>,R</kbd>           | 重启浏览器                   |
| <kbd>zu</kbd>        | 打开uBlock第三方规则列表                   |
| <kbd>gs</kbd>           | 切换http与https                   |

初期不熟悉快捷键时, 可能经常要查询, 你可以键入<kbd>?</kbd>调出上图的快捷键列表

###样式加载: 取代Stylish扩展
另外, VimFx还能夠加载CSS文件, 而且加载效果非常优秀. 原本我一直在使用UC脚本userCSSLoader.uc.js右载CSS, 但这个脚本有个问题, 加载CSS要比Stylish扩展慢, 再者userCSSLoader.uc.js对部分CSS的支持不夠友好, 导致我还得专门安装Stylish来应付两个特殊的样式. 至少以我的CSS样式加载来看, VimFx完全可以取代Stylish, 我已经这样做了.
![](https://raw.githubusercontent.com/dupontjoy/userChrome.js-Collections-/master/CingFox/img/vimfx-css.jpg)

###两段CSS设置
- 设置Hint字体大小

```javascript
    /*VimFx 调整Hint字体*/
    #VimFxMarkersContainer .marker {
      font-size: 12px !important; /* Specific font size. */
      text-transform: lowercase !important; /* Lowercase text. */
      opacity: 1 !important; /* Semi-transparent. Warning: Might be slow! */
    }
```

- 有时怎么按快捷键都没有, 其实那是因为误按了i键进入了忽略模式, 以下CSS可以在进入忽略模式时地址栏红色显示, 一目了然

```javascript
    /*VimFx忽略模式时地址栏红色*/
    #main-window[vimfx-mode="ignore"] #urlbar {
        background: red !important;
    }
```
  
###资源
- 我的设置文件:
https://github.com/dupontjoy/userChromeJS/blob/master/Local/VimFx/config.js

- 扩展下载地址:
https://addons.mozilla.org/en-US/firefox/addon/vimfx/

- VimFx Github:
https://github.com/akhodakivskiy/VimFx
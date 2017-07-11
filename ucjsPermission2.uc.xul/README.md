## ucjsPermission2.uc.xul

![](img/ucjsPermission2-icon.jpg)

by **Alice0775 & dannylee**

利用Firefox自带**permissions.sqlite**管理第三方腳本，样式，图片，等等。数据是保存在permissions.sqlite这个文件中的，当你清理cookie时，数据就会被清理掉。因此，请做好备份！

功能挺强大，你禁用的越多，管理起来就越麻烦。所以我只用了其中一个功能：**禁止第三方脚本**。对于大部分网站来说不用另外设置就能正常访问。少部分网站的第三方脚本放行，加入白名单即可，**一般为cdn, img类**。只放行必要的第三方脚本，能起到**加快网页载入**的作用，效果还是很明显的。

比如：http://www.economist.com/ 这个网站，外挂脚本的数量堪称恐怖，默认全部加载的话，要花费很长的时间。目前只是选择性的放行了几个必要脚本，加载速度大大地提高。

<img width="650" src="img/ucjsPermission2.jpg">

### 使用方法：

第一步、将两个uc.xul文件复制到『chrome\xul』文件夹下面

第二步、将exexcept复制到『extensions\userChromeJS@mozdev.org\content』文件夹下面

<img width="650" src="img/ucjsPermission2-position.jpg">

至此，脚本安装完成！

### 操作步骤：

**左键单击**图标，选择要放行的脚本（或其他元素）

**右键单击**图标，可查看自己设置的列表：

<img width="650" src="img/ucjsPermission2-list.jpg">

### 建議使用方法：
默認禁止第三方腳本、對象和框架。<br/>

![](img/ucjsPermission2-setting.jpg)

也可以把參數寫入user.js中：

    //ucjsPermission腳本
    //簡單敎程：http://bbs.kafan.cn/thread-1527284-1-1.html，禁止第三方腳本，對象和框架，基本就能過濾掉大部分廣告和不必要的內容。
    user_pref("permissions.default.script", 3);//禁止第三方腳本
    user_pref("permissions.default.object", 3);//禁止第三方對象
    user_pref("permissions.default.subdocument", 3);//禁止第三方框架

禁止這3個就好，能過濾掉一些廣告及額外的載入內容，效果明顯，同時不致於攔截太多必要的東西，導致放行起來太麻煩。<br/>
具體原因可參考末尾的『簡單敎程』一貼。


| | |
| --- | :--- |
| **其它资源** | 個人[第三方腳本黑名單][1] |
| 簡單教程 | http://bbs.kafan.cn/thread-1527284-1-1.html |

[1]: https://github.com/dupontjoy/customization/blob/master/Rules/NoScript/ucjsPermission-Blacklist.txt
##BackupProfiles_7z

**Mod by Qing**

內含：

| | |
| --- | --- |
| 一键制作 配置包 | BackupProfiles_7z.bat |
| 一键制作 完整包 | BackupFullProfiles_7z.bat |
| 一键备份 插件和软件包 | BackupPlugins-n-Software_7z.bat |
| 一键提取 32位Flash | 提取Flash32位插件.bat |

**注意：**文件夹相对结构要调整好。不会调整的就只能按我的结构来了。

##特点：

1. 自定义需要备份的「文件夹」和「文件」，二者表达有小差別，已分组便于查找和修改

2. 添加完整的时间，支持24小時制，精确到：日期+时+分+秒。如：20150607-202728

3. 支持获取Firefox版本号，配置包名称格式：名称+时间+版本。如：Profiles_20150607-202728_38.0.5.7z

4. 添加备份进行之前/之后的提示语句，便于取消操作

5. 备份结束后重启Firefox

##更新歷史：

2015.06.25 實現獲取Flash版本號

2015.06.23 加入提取32位Flash插件批处理

打包开始：

![打包开始](img/BackupProfiles-Start.jpg)

打包结束：

![打包结束](img/BackupProfiles-End.jpg)

![打包结束-2](img/BackupFullProfiles-End.jpg)

##注意：

我的配置文件夹结构：

![文件夹结构][1]

**1. 关于批处理与配置的相对位置：**

从批处理所在位置到配置文件夹（Profiles），共跨了3层，所以批处理中会这样定义：

![批处理到Profiles-1](img/bat-to-Pofiles-1.jpg)

![批处理到Profiles-2](img/bat-to-Pofiles-2.jpg)

**2. 关于获取Firefox版本号：**

从批处理所在位置到Firefox程序文件夹（firefox），共跨了4层，所以批处理中会这样定义：

![批处理到Firefox-1](img/bat-to-Firefox-1.jpg)

![批处理到Firefox-2](img/bat-to-Firefox-2.jpg)


[1]: https://raw.githubusercontent.com/dupontjoy/userChrome.js-Collections-/master/QingFox/img/QingFox-FolderStructure.jpg

#### searchplugins

Firefox的搜索引擎列表是保存在<kbd>search.json.mozlz4</kbd>这个文件中的.
你可以通过xml文件来拓展Firefox的搜索栏, 但请注意按以下步骤来操作:
- 将搜索引擎的xml文件放入<kbd>Profd\searchplugins</kbd>中
- 刪除<kbd>search.json.mozlz4</kbd>文件
- 重启Firefox

然后你会发现searchplugins中的搜索引擎已经加入到Firefox中了, 而且新的<kbd>search.json.mozlz4</kbd>文件也生成了.
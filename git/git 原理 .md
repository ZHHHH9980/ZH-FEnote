## git 底层原理

## git 对象组成

- blob
- tree
- commit

#### git 对象

> git 核心部分是一个简单的**键值对(key:value)数据库**。你可以向该数据库插入任意类型的内容，它会返回一个键值，通过该键值可以在任意时刻再次检索内容；

内部存储的数据类型是`blob`类型；

> hash 算法：两个文件内容相同，换算出相同的 hash 值，**只会生成一个 blob 对象**；

每次写入一个版本都会生成一个 hash 值存入 git 中的 object；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201101155920582.png#pic_center)

这样就会存在一些问题：

1. 记住每一个文件的版本对应的 hash 值不现实
2. 文件名并没有保存，hash 值保存文件的**内容**

**解决方案**:树对象

#### 树对象

树对象存储的是整个项目的版本，与 git 对象不同，树对象针对的是**文件**，而不是文件的改动；

如果新版本包含了之前版本未更改的树对象，会有一个`bak`指针指向之前的版本和包裹当前版本的树：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201101164232550.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

生成的树对象同样存在一个问题，就是必须得记住 hash 值，而且也不知道每次修改提交都做了什么；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201101164347908.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

#### commit 对象

> commit 对象是对数对象的一个包裹，增加了一些作者和提交者的信息；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102100133941.png#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102100353353.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

每一个 commit 对象还会存在一个 parent 指针指向上一个版本：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224102219315.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

### 小结

项目的快照就是一个`树对象`,项目的版本就是一个`commit对象`；

- blob 对象保存数据
- tree 对象保存一个指向文件名、内容和其他 tree 的指针
- commit 对象保存 作者、信息、指针

## 高阶命令

### 增

### add 命令封装了哪些操作？

- git add .
  - git hash-object -w filename
  - git update-index (提交到暂存区)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102101955891.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

### commit 命令

- git commit -m "注释内容"
  - git write-tree
  - git commit-tree

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102103030546.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

这样就生成了一个新的 commit 对象
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224103625152.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

### git merge 原理

1. fastForward (不存在冲突的情况下)
   ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224114811464.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

直接移动指针
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224114910838.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

2. no fastForward
   这里虽然不存在冲突，但两个分支都创建了不同的文件；
   ![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224114949638.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

merge 过后会生成新的 commit
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224115122662.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

3. conflict

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224115242414.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)
解决冲突之后 需要 commit 生成新的版本
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224115358241.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

### git rebase

#### merge 与 rebase 的区别

指针指向 main 分支

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224121547340.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

merge:
git merge bugfix

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224121634791.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

rebase:

git checkout bugfix

git rebase main

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224121925827.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

区别在于 merge 会产生一个新的 commit 指向前两个父对象，而 rebase 直接将当前指向重新更改到新的分支上；

如果需要两个分支同步：

git checkout main

git rebase bugfix

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210224121953942.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

## 参考

[【原理解析】让你完全搞明白 Git 是如何管理你的代码的](https://www.bilibili.com/video/BV11z4y1X79p)
[git 练习网站](https://learngitbranching.js.org/?locale=zh_CN)


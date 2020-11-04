

## git



### 对象

#### git对象

> git核心部分是一个简单的**键值对(key:value)数据库**。你可以向该数据库插入任意类型的内容，它会返回一个键值，通过该键值可以在任意时刻再次检索内容；

内部存储的数据类型是`blob`类型；

每次写入一个版本都会生成一个hash值存入git中的object；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201101155920582.png#pic_center)

这样就会存在一些问题：

1. 记住每一个文件的版本对应的hash值不现实
2. 文件名并没有保存，hash值保存文件的**内容**

**解决方案**:树对象



#### 树对象

树对象存储的是整个项目的版本，与git对象不同，树对象针对的是**文件**，而不是文件的改动；

每生成一个版本，会有一个`bak`指针指向之前的版本和包裹当前版本的树：

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201101164232550.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

生成的树对象同样存在一个问题，就是必须得记住hash值，而且也不知道每次修改提交都做了什么；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201101164347908.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)



#### commit对象

> commit对象是对数对象的一个包裹，增加了一些作者和提交者的信息；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102100133941.png#pic_center)



![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102100353353.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)



### 小结

 项目的快照就是一个`树对象`,项目的版本就是一个`提交对象`；



## 高阶命令

### 增

### add命令封装了哪些操作？

- git add .
  - git hash-object -w filename
  - git update-index  (提交到暂存区)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102101955891.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

### commit 命令

- git commit -m "注释内容"
  - git write-tree
  - git commit-tree

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102103030546.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)



### 删

git rm <filename> 删除工作区文件，再将修改提交到暂存区

### 改

git mv <previous filename> <lastest filename> 重命名文件

### 查

#### git diff

查看当前更新未`stage`的文件；

git diff  --staged

查看哪些修改已经`staged`，只是还没有提交；



#### git status



## git 分支

### 创建分支

`git branch  <branchname>` 创建一个新的分支，在当前提交对象上创建一个指针；



:star::star::star:

`git branch name commitHash`新建一个分支，并且使分支指向对应的提交对象；

> 这个命令在**版本穿梭**中非常有用，新建之后使用switch切换到提交对象，就可以查看历史版本的文件；



### 查看分支历史

` git log --oneline --decorate --graph --all`

这个名字太长了，可以使用`git config`配置别名

input:

```
git config --global alias.sb "log --oneline --decorate --graph --all"
之后输入 git sb(showBranch)即可
```



### 删除分支

```
git branch -d newbee
```



## 远程协作

查看远程仓库

`git remote -v`



建立远程仓库的连接 [远程仓库别名（默认是origin）]

`git remote add [remote name]` https://github.com/.sample.git



建立连接之后，就会生成一个**远程跟踪分支**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102163121429.png#pic_center)



### 更新项目

`git fetch`拉取远程项目；

:boxing_glove:拉取远程项目以后，分支并不会切换，也就是在本地分支`(fetch之后)`的情况下，貌似并没有拉取到项目；这时候需要使用`git switch`来切换到远程分支才能看到fetch的最新版本项目；

:star::star::star::star::star:

`git merge [branch name]`

`switch`to 本地分支，然后输入`git merge[远程分支名]`，才能将**本地分支更新；**



### 推送代码到远程仓库

`git push[远程仓库别名]`



## 三种分支之间的关系:star:

- 远程分支
- 远程跟踪分支
- 本地分支

`远程跟踪分支`是远程分支跟本地分支的一个**媒介**；

### 不同命令的分支表现：

1. `git clone`本地分支与远程跟踪分支建立同步关系；
2. `git fetch` & `git push`都是 **远程分支和远程跟踪分支**建立同步关系；
   - 如果需要在本地分支上与远程分支建立联系，必须让本地分支与`远程跟踪分支`建立联系；

:chestnut:

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102230758153.png#pic_center)

在这种情况下，`git push`是会报错的，需要设置上游分支，即远程跟踪分支；

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020110223183390.png#pic_center) 



### git fetch

将远程仓库的**所有分支**拉取下来，但是并不会与任何分支建立连接，如果需要拉取某个分支的代码，需要手动`merge`；



### git pull

git pull 是 git fetch（更新远程跟踪分支）和 git merge（将**本地分支**合并远程跟踪分支）两个命令的封装；

:star::star::star::star::star:

使用`git pull`之前得先使用`git branch -u <remote>/<branch>` 让当前本地分支跟踪远程跟踪分支（建立联系）



### git push

> 当你想要公开分享一个分支时，需要将其推送到有写入权限的远程分支上；

`git push origin [branchName]`



#### git checkout

1. 本地分支**没有创建**的情况下，跟踪远程跟踪分支

`git checkout -b [branchName] [origin/branchName]` / 

`git checkout --track [origin/branchName]` 直接创建一个与远程跟踪分支建立联系的本地分支； 



2. 本地分支**已经创建**的情况下，跟踪远程跟踪分支

   `git branch -u origin/[branchName]`



:star::star::star:

`git branch -vv`查看设置的所有**跟踪分支；**



### 小结：一个本地分支如何去跟踪一个远程跟踪分支？

1. `git clone`的时候会自动生成一个`master`本地分支，且已经跟踪了对应的远程跟踪分支；
2. `git checkout`用于track远程跟踪分支;

3. 无论是`git push`还是`git pull`都是操作**远程跟踪分支和远程分支**,想要在本地`pull`/`push`，都必须先用本地分支**跟踪**（`push`是设置上游远程跟踪分支，`pull`是track远程跟踪分支）才能使用命令；





## merge 和 rebase的区别

其实这个时候E不应该提交，因为提交后会发生冲突。如何解决这些冲突呢？有以下两种方法：

1、git merge
用git pull命令把"origin"分支上的修改pull下来与本地提交合并（merge）成版本M，但这样会形成图中的菱形，让人很困惑。

![img](https://images2015.cnblogs.com/blog/907596/201609/907596-20160922155107949-1520786903.png)

2、git rebase
创建一个新的提交R，R的文件内容和上面M的一样，但我们将E提交废除，当它不存在（图中用虚线表示）。由于这种删除，小李不应该push其他的repository.rebase的好处是避免了菱形的产生，保持提交曲线为直线，让大家易于理解。

![img](https://images2015.cnblogs.com/blog/907596/201609/907596-20160922155132715-596060966.png)

在rebase的过程中，有时也会有conflict，这时Git会停止rebase并让用户去解决冲突，解决完冲突后，用git add命令去更新这些内容，然后不用执行git-commit,直接执行git rebase --continue,这样git会继续apply余下的补丁。
在任何时候，都可以用git rebase --abort参数来终止rebase的行动，并且mywork分支会回到rebase开始前的状态。



这两个操作的核心都是将**远程代码合并到本地，形成一个新的版本；**

无论是`git push`还是`git pull`都是操作**远程跟踪分支跟远程分支**,想要在本地`pull`/`push`，都必须先用本地分支**跟踪**（`push`是设置上游远程跟踪分支，`pull`是track远程跟踪分支）才能使用命令；



## rebase应用场景

### 1. 合并多个commit

首先`git log`查看自己`commit`的记录；

`git rebase -i HEAD~3` ：合并HEAD指向包括HEAD的三个版本；

or `git rebase -i 版本号`：合并HEAD直到指定的版本号；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104225857783.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

作用是将多个提交记录整合到一起，使git 记录更加简洁；

❗注意事项：尽量不要对已经`push`到远程仓库的代码使用`rebase`整合提交记录



### 2. rebase让分支更简洁

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104233208326.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

1. `git checkout dev`

2. `git rebase master`
3. ---------leader做的事情
4. `git checkout master`
5. `git merge dev`



### 3.拉取远程代码后使用rebase

远程代码有更新，使用`git pull`拉取代码会产生分叉；因为`pull`中包含了`merge`的操作；

所以拉取代码使用rebase更加简洁：

1. `git fetch origin/dev`
2. `git rebase origin/dev`



:exclamation: 注意事项：`git rebase`产生冲突；

1. 解决冲突，然后`git add`
2. `git rebase --continue`

## 实战

`git fetch [origin]`

在`git clone`之后使用，拉取**远程仓库的所有远程跟踪分支；**



`git checkout --track origin/master`

创建一个本地分支[master]去远程跟踪分支；



`git pull`

拉取远程跟踪分支的代码；



### 解决冲突

`git fetch [origin]`

在`git clone`之后使用，拉取**远程仓库的所有远程跟踪分支；**



`git checkout --track origin/master`

创建一个本地分支[master]去远程跟踪分支；



`git pull`

拉取远程代码

如果存在冲突，会提示先`git commit`提交版本

如果不存在冲突，就会将本地分支`merge`远程跟踪分支

公司的话一般使用`git pull --rebase`拉取代码，合并冲突；
## git 分支

### 创建分支

`git branch <branchname>` 创建一个新的分支，在当前提交对象上创建一个指针；

:star::star::star:

`git branch name commitHash`新建一个分支，并且使分支指向对应的提交对象；

> 这个命令在**版本穿梭**中非常有用，新建之后使用 switch 切换到提交对象，就可以查看历史版本的文件；

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

建立远程仓库的连接 [远程仓库别名（默认是 origin）]

`git remote add [remote name]` https://github.com/.sample.git

建立连接之后，就会生成一个**远程跟踪分支**

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201102163121429.png#pic_center)

### 更新项目

`git fetch`拉取远程项目；

:boxing_glove:拉取远程项目以后，分支并不会切换，也就是在本地分支`(fetch之后)`的情况下，貌似并没有拉取到项目；这时候需要使用`git switch`来切换到远程分支才能看到 fetch 的最新版本项目；

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
2. `git checkout`用于 track 远程跟踪分支;

3. 无论是`git push`还是`git pull`都是操作**远程跟踪分支和远程分支**,想要在本地`pull`/`push`，都必须先用本地分支**跟踪**（`push`是设置上游远程跟踪分支，`pull`是 track 远程跟踪分支）才能使用命令；

## merge 和 rebase 的区别

其实这个时候 E 不应该提交，因为提交后会发生冲突。如何解决这些冲突呢？有以下两种方法：

1、git merge
用 git pull 命令把"origin"分支上的修改 pull 下来与本地提交合并（merge）成版本 M，但这样会形成图中的菱形，让人很困惑。

![img](https://images2015.cnblogs.com/blog/907596/201609/907596-20160922155107949-1520786903.png)

2、git rebase
创建一个新的提交 R，R 的文件内容和上面 M 的一样，但我们将 E 提交废除，当它不存在（图中用虚线表示）。由于这种删除，小李不应该 push 其他的 repository.rebase 的好处是避免了菱形的产生，保持提交曲线为直线，让大家易于理解。

![img](https://images2015.cnblogs.com/blog/907596/201609/907596-20160922155132715-596060966.png)

在 rebase 的过程中，有时也会有 conflict，这时 Git 会停止 rebase 并让用户去解决冲突，解决完冲突后，用 git add 命令去更新这些内容，然后不用执行 git-commit,直接执行 git rebase --continue,这样 git 会继续 apply 余下的补丁。
在任何时候，都可以用 git rebase --abort 参数来终止 rebase 的行动，并且 mywork 分支会回到 rebase 开始前的状态。

这两个操作的核心都是将**远程代码合并到本地，形成一个新的版本；**

无论是`git push`还是`git pull`都是操作**远程跟踪分支跟远程分支**,想要在本地`pull`/`push`，都必须先用本地分支**跟踪**（`push`是设置上游远程跟踪分支，`pull`是 track 远程跟踪分支）才能使用命令；

## rebase 应用场景

### 1. 合并多个 commit

首先`git log`查看自己`commit`的记录；

`git rebase -i HEAD~3` ：合并 HEAD 指向包括 HEAD 的三个版本；

or `git rebase -i 版本号`：合并 HEAD 直到指定的版本号；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104225857783.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

作用是将多个提交记录整合到一起，使 git 记录更加简洁；

❗ 注意事项：尽量不要对已经`push`到远程仓库的代码使用`rebase`整合提交记录

### 2. rebase 让分支更简洁

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201104233208326.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

1. `git checkout dev`

2. `git rebase master`
3. ---------leader 做的事情
4. `git checkout master`
5. `git merge dev`

### 3.拉取远程代码后使用 rebase

远程代码有更新，使用`git pull`拉取代码会产生分叉；因为`pull`中包含了`merge`的操作；

所以拉取代码使用 rebase 更加简洁：

1. `git fetch origin/dev`
2. `git rebase origin/dev`

### :exclamation: 注意事项：`git rebase`产生冲突；

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

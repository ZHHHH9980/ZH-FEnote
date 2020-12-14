# git



## git stash 

现在有一个需求，当前分支上写了一些代码，并没有**commit**,现在需要将这些代码转移到另一个分支上；

相比与`cherry-pick`，`git stash`可以将暂存区，即未提交到版本库（commit）的代码缓存起来；



## 常用命令

> 必须要git add 放入暂存区的文件才能够stash!

（1）**git stash** save "save message" : 执行存储时，添加备注，方便查找，只有git stash 也要可以的，但查找时不方便识别。

（2）**git stash list** ：查看stash了哪些存储

（3）**git stash pop** ：命令**恢复之前缓存的工作目录**，将缓存堆栈中的对应stash删除，并将对应修改应用到当前的工作目录下,默认为第一个stash,即stash@{0}，如果要应用并删除其他stash，命令：git stash pop stash@{$num} ，比如应用并删除第二个：git stash pop stash@{1}

这个命令结合`git stash list`非常好用；



## 参考

https://www.cnblogs.com/zndxall/archive/2018/09/04/9586088.html
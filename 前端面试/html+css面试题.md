## html

1.如何理解HTML语义化？

```
html语义化实际上就是为html每个标签赋予一定的意义，每个标签能够表达出某种特定的语义，而不是简单的div+span，没有特定的语义。

语义化的好处
1.每个标签能够能明确表达出作用，更利于阅读和后期维护
2.利于搜索引擎的爬虫提取关键信息
3.利于盲文阅读器等读取信息
```



2.默认情况下，哪些HTML标签是块级元素、哪些是内联元素？

```html
块级元素
display: block/table
div ul ol h1 h2 table p
内联元素
display: inline/inline-block
span img input button
```



## css



###  布局

1.盒模型宽度计算

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200804214454901.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

我的回答：

标准盒模型：100px

怪异盒模型：122px



2.margin纵向重叠问题

![在这里插入图片描述](https://img-blog.csdnimg.cn/2020080421462897.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70)

我记得纵向margin会有合并的情况，取最大值，也就是4*15=60px



3.margin负值问题，对margin-top/left/  right/bottom设置负值，有什么效果？

文档流一般是从上到下，从左到右



4.BFC理解和应用？

什么是BFC，如何应用？



5.如何实现圣杯布局和双飞翼布局？



6.手写clearfix



7.通过flex实现一个三点的骰子。
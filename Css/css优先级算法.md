# [CSS优先级算法是如何计算？](https://www.cnblogs.com/love-sea520/p/5903196.html)

CSS的specificity特性或非凡性，它是一个衡量css优先级的一个标准，

既然的标准就有判定规定和计算方式，specificity用一个四位数来表示，

更像四级从左到右，左的最大级，一级大于一级，数位之间没有进制，

多个选择符用到同一个元素上时那么specificity上值高的最终获得优先级。

 

```html
css specificity

规则

1、行内样式优先级specificity值为1,0,0,0 高于外部定义

　　如<div style="height:50px; width:50px;">Div</div>  //行内样式

　　外部定义指经由<link>或<style>标签定义的规则                           

2、按CSS代码中出现的顺序决定，后者CSS样式居上；(层叠规则)

3、!important声明specificity值优先级最高

4、由继续而得到的样式没有specificity的计算，它低于一切其他规则（比如全局选择符*定义规则）
```



算法： 

当遇到多个选择符同时出现时候 
按选择符得到的Specificity值逐位相加， 
**{数位之间没有进制 比如说： 0,0,0,5 + 0,0,0,5 =0,0,0,10 而不是 0,0, 1, 0}** 
就得到最终计算得的specificity
然后在比较取舍时按照从左到右的顺序逐位比较。 

实例分析： 

1.div { font-size:12px;} 
分析： 
1个元素{ div}，Specificity值为0,0,0,1 

2.body div p{color: green;} 
分析： 
3个元素{ body div p }，Specificity值为0,0,0,**3** 



3.div .sjweb{ font-size:12px;} 
分析： 
1个元素{ div }，Specificity值为0,0,0,1 
1个类选择符{.sjweb}，Specificity值为0,0,1, 0 
最终：Specificity值为 0,0,1,1 



4.div #sjweb { font-size:12px;} 
分析： 
1个元素{ div }，Specificity值为0,0,0,1 
1个类选择符{.sjweb}，Specificity值为0,1,0, 0 
最终：Specificity值为 **0,1,0,1** 



5.html > body div [id=”totals”] ul li > p {color:red;} 
分析： 
6个元素{ html body div ul li p} Specificity值为0,0,0,6 
1个属性选择符{ [id=”totals”] } Specificity值为0,0,1,0 
2个其他选择符{ > > } Specificity值为0,0,0,0 
最终：Specificity值为 0,0,1,6 



### 小结

tag 1

class 10

id 100

内联样式 如`style="xxx"` 1000

!important > 1000



**需要注意的是：通用选择器（\*）、子选择器（>）和相邻同胞选择器（+）并不在这四个等级中，所以他们的权值都为 0**。



------------------------------------------------------------------------------------------------------------

:cookie: 引申问题

**CSS选择器有哪些？哪些属性可以继承？**

CSS选择符：

id选择器(#myid)、

类选择器(.myclassname)、

标签选择器(div, h1, p)、

相邻兄弟选择器(h1 + p)、选择后面的那一个兄弟元素

兄弟选择器(div ~ p)、 选择后面所有的兄弟元素

子选择器（ul > li）、

后代选择器（li a）、

通配符选择器（*）、

属性选择器（a[rel="external"]）、

伪类选择器（a:hover, li:nth-child）

可继承的属性：font-size, font-family, color

不可继承的样式：border, padding, margin, width, height

优先级（就近原则）：!important > [ id > class > tag ]
!important 比内联优先级高



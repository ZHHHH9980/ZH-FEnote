# line-height

> 两行文字baseline的距离；

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123105407243.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)



## line-height与行内框盒子模型

1. content area (内容区域)

   ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123110802730.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)	

2. inline boxes (内联盒子)

![image-20201123131713114](C:\Users\how浩\AppData\Roaming\Typora\typora-user-images\image-20201123131713114.png)

3. line boxes（行框盒子）

   > 每一行就是一个行框盒子，每个行框盒子由内联内联盒子组成；

4. containing box (包含盒子)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123131920195.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)



## line-height与内联元素高度机理

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123133128999.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

文字为宋体的情况下，content area height = font-size，因此加上两个半行间距就可以计算出内联元素高度。	



## line-height各类属性值

- line-height: normal 默认属性值，**不同字体或不同浏览器**会有不同的具体表现，因此我们一般会在body重置line-height;
- line-height: <number> 如1.5 则line-height: 1.5 * fontSize;
- line-height: <length> 使用具体高度作为行高值；



### :star: line-height: 1.5 / 150% / 1.5em 的区别？

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123141125755.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)



## line-height与图片的表现

### line-height会不会影响图片占据的高度？

不会。

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123144034343.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

之所以图片底部会产生一些间隙，往往是因为`line-height`与`vertical-align: baseline` (英文字母x底部的位置)对齐造成的；



### 消除图片底部间隙方法

1. 图片块状化

   ```
   img { display: block;}
   ```

2. 图片基线对齐

   ```
   img { vertical-algin: bottom;}
   ```

3. 行高足够小

   ```
   .box { line-height: 0;}
   ```

     ![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123144907550.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L1pIZ29nb2dvaGE=,size_16,color_FFFFFF,t_70#pic_center)

原理是让`line-height` < `font-size`大小，这样就不会产生下半边距；
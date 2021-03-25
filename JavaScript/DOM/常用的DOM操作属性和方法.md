# 常用的DOM操作属性和方法

操作DOM的属性和方法

 [获取]

​	getElementById

​		-> 上下文只能是document

		- 因为只有document这个实例.__proto__上才有这个方法
		- ID重复了会用第一个
		- IE6~7中会把表单元素的name当作id使用

​	<br>

​	getElementsByTagName

​		-> 获取当前上下文中所有子子孙孙标签名字为xxx的元素


<br>
​	getElementsByClassName

​		**- 弊端：IE678下不兼容**


<br>
​	getElementsByName

​		-> IE浏览器中只对表单元素的name起作用

​		-> 上下文只能是document


<br>
​	querySelelctor

​	querySelectorAll

​		-> 不兼容IE6~8

​		-> 不存在DOM映射

​	document.documentElement

​	document.body

​	document.head

​	...



<br>

[描述节点和节点之间关系的属性]						 	 							

|          | nodeType | nodeName   | nodeValue |
| -------- | :------: | ---------- | --------- |
| 元素节点 |    1     | 大写标签名 | null      |
| 文本节点 |    3     | #text      | 文本内容  |
| 注释节点 |    8     | #comment   | 注释内容  |
| 文档节点 |    9     | #document  | null      |

[详细参考mdn](https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType)

<br>



childNodes:所有子节点

children:所有元素子节点（IE6~8会把所有注释当作元素子节点)

parentNode: 父节点

previousSibling：上一个兄弟节点

previousElementSibling(IE6~8不兼容) ： 上一个兄弟**元素**节点

nextSibling: 下一个兄弟节点

nextElementSibling: 下一个兄弟**元素**节点

firstChild： 第一个子节点

lastChild：最后一个子节点


<br>

[动态操作DOM]

​	createElement

​	createDocumentElementFragment

​	appendChild

​	insertBefore

​	cloneNode(true:深克隆 false:浅克隆)

​	removeChild

​	set/get/removeAttribute

​	

[其他]

​	xxx.style.xxx = xxx 设置行内样式

​	=> xxx.style.xxx 获取行业样式

​	xxx.onclick = function...



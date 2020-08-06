# get/post

==//=>1==创建AJAX实例

```javascript
let xhr = new XMLHttpRequest();
```



==//=>2==打开请求：发送请求之前的一些配置项



1.HTTP method 请求方式

[常用]: get/post
[ 不常用 ]: delete/head/options/trace/connect/put

2.URL 向服务器端发送请求的API（Application Programming Interface）接口地址

3.async 设置AJAX请求的同步异步，默认是异步（true），false是同步，项目一般使用true,防止阻塞后续代码执行

4.user-name/user-pass 用户名和密码（一般不使用）

```javascript
xhr.open([ HTTP method], [url], [async], [user-name], [user-pass])
```



==//=>3==事件监听：一般监听的都是 `readyStateChange` 这个事件（AJAX状态改变事件），基于这个事件可以获取服务器返回的响应头响应主体内容。

```javascript
xhr.onreadystatechange = () => {
    
}
```



==//=>4==发送AJAX请求：从这步开始，当前AJAX任务开始。

如果AJAX是同步的，后续代码不会执行，要等到AJAX状态成功后执行，而异步不会阻塞代码执行。

```javascript
xhr.send([请求主体内容]);
```



## HTTP请求方式

因为http协议规定的是双向的传输协议，因此所有的请求从应用角度来讲，既可以获取数据，也可以传输数据。

从**客户端角度**来描述http请求方式

​	get: 从服务器端获取数据（给的少，拿的多）

​	post: 向服务器端推送数据（给的多，拿得少）
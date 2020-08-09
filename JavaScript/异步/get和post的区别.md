# AJAX请求过程

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

​	delete: 删除服务器端的某些内容

​	put: 向服务器上存放一些内容

​	head:只获取服务器返回的**响应头信息**

​	options: 一般使用它向服务器发送一个探测性请求，如果服务器端返回了信息，说明当前客户端和服务器端建立了连接，可以继续发送其他请求。

​	trace: 与options功能类似，回显服务器收到的请求，用于测试或诊断。但是**axios**这个ajax类库基于cross domain进行跨域请求的时候，就是先发送options请求进行探测尝试。如果能连通服务器才会继续发送其他请求。



# GET / POST

向服务器传递信息的方式不同

[get]: 基于url地址“问号传参”的方式把信息传递给服务器。
[post]: 基于“请求主体”的方式把信息传递给服务器。



[get]

```javascript
let xhr = new XMLHttpRequest();
xhr.open('get', 'https://www.baidu.com/index.html?id=10');
xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 $$ xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText))
    }
}
xhr.send(null)
```


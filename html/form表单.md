# form

form表单中的button，默认属性为`[type="submit"]`，**一旦点击就会触发表单提交**；

写react的时候遇到非常尴尬的事情，每次点击都触发页面刷新...

就是因为在form标签里的button并没有设置type，导致直接刷新了页面；

```jsx
    const login = (
      <form>
        <label>用户名</label>
        <input ref={this.usernameRef} />
        <label>密码</label>
        <input ref={this.passwordRef} />
        <button
          onClick={() => this.props.handleLogin(this.username, this.password)}
        >
          登录
        </button>
      </form>
    );
```



### button按钮的type属性  

​    button按钮的type属性有三种：submit、button、reset.

​    如果form内的button按钮有type=submit属性则，按钮会有默认的提交行为，reset属性会让按钮具备重置表单的行为，button属性会让按钮do nothing。如果编写页面时不忘写上button的type属性，那么一切异常行为都不会出现。

​	

## 引用

https://www.cnblogs.com/wisdomoon/p/3330856.html


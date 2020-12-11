# last-child &  last-of-type

```html
<form id="auth-form">
  <input id="ember367" class="ember-view ember-text-field" placeholder="Email" type="email" name="email">
  <input id="ember368" class="ember-view ember-text-field" placeholder="Password" type="password" name="password">
  <div class="clear"></div>

  <a class="pull-left forgot-password">Forgot password?</a>
  <button class="pull-right" data-ember-action="1" type="button">Sign In</button>
</form>
```



```css
/* bad */
input {
  margin-bottom: 0px;

  &:last-child {
    margin-bottom: 10px;
  }
}

/* good */
input {
  margin-bottom: 0px;

  &:last-of-type {
    margin-bottom: 10px;
  }
}
```



## 参考

https://stackoverflow.com/questions/16404376/less-css-using-last-child-selector
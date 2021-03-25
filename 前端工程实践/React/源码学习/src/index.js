import React from "react";
import ReactDOM from "react-dom";
import Counter from "./counter";
import { Provider } from "./react-redux";
import store from "./counter/store";

ReactDOM.render(
  <Provider store={store}>
    <Counter />
  </Provider>,
  document.getElementById("root")
);

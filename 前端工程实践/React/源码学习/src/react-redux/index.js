import React from "react";
import PropTypes from "prop-types";

export class Provider extends React.Component {
  static childContextTypes = {
    store: PropTypes.object,
  };

  getChildContext() {
    const store = React.createContext({
      store: this.store,
    });
    return store;
  }

  constructor(props, context) {
    super(props, context);
    console.log("props.store", props.store);
    this.store = props.store;
  }

  render() {
    return this.props.children;
  }
}

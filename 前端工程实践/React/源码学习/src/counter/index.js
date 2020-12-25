import React, { Component } from "react";
import store from "./store";
import PropTypes from "prop-types";
import * as actionCreators from "./store/actionCreators";

class Counter extends Component {
  static contextType = {
    store: PropTypes.object,
  };

  state = {};

  componentDidMount() {
    this.setState(store.getState());

    store.subscribe(() => {
      this.setState({
        number: store.getState().number,
      });
    });
  }

  render() {
    console.log("this.context", this.context);
    return (
      <>
        <div>{this.state.number}</div>
        <button onClick={this.handleButtonClick}>+1</button>
      </>
    );
  }

  handleButtonClick() {
    store.dispatch(actionCreators.handleAddNumber());
  }
}

export default Counter;

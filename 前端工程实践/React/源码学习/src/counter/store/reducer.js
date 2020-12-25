import * as actionTypes from "./constants";

const initState = {
  number: 0,
};

export default (state = initState, action) => {
  switch (action.type) {
    case actionTypes.ADD_NUMBER:
      const newState = { ...state };
      console.log("newState", newState);
      newState.number += 1;
      return newState;
    default:
      return initState;
  }
};

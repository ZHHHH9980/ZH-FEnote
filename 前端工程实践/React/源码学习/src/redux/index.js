export const createStore = (reducer) => {
  let currentState = {};
  let observers = [];

  const getState = () => {
    return currentState;
  };

  const subscribe = (fn) => {
    observers.push(fn);
  };

  const dispatch = (action) => {
    currentState = reducer(currentState, action);
    observers.forEach((fn) => fn());
  };

  // 初始化让initState挂到currentState
  dispatch({ type: "@@redux_init" });

  return {
    getState,
    subscribe,
    dispatch,
  };
};

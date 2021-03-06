import React, { useReducer, useContext, createContext } from "react";

import {
  ADD_USER_INFO,
  CHECK_USER_INFO,
  REMOVE_USER,
  SET_LOADING,
  ADD_TRANSACTION,
  GET_BALANCE,
} from "./actions";

const AppContext = createContext({});
const { Provider } = AppContext;

const reducer = (state, action) => {
  switch (action.type) {
    case ADD_USER_INFO:
      sessionStorage.setItem("user", JSON.stringify(action.payload));
      return { ...state, user: action.payload, loading: false };

    case SET_LOADING:
      return { ...state, loading: true };

    case REMOVE_USER:
      const newState = { ...state };
      delete newState.user;
      return { ...newState, loading: false };

    case CHECK_USER_INFO:
      return { ...state };

    case GET_BALANCE:
      return { ...state };

    case ADD_TRANSACTION:
      return {
        ...state,
        transactions: [...action.payload],
      };

    default:
      throw new Error("Error in reducer.");
  }
};

const UserProvider = ({ value = {}, ...props }) => {
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    loading: true,
    categories: [],
    transactions: [],
  });

  return <Provider value={[state, dispatch]} {...props} />;
};

const useAppContext = () => {
  return useContext(AppContext);
};

export { UserProvider, useAppContext };

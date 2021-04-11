import Reducer from "./Reducer";

const { useReducer, createContext } = require("react");

const initialState = { user: undefined };
export const Context = createContext(initialState);
const Store = (params) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  return (
    <Context.Provider value={[state, dispatch]}>
      {params.children}
    </Context.Provider>
  );
};
export default Store;

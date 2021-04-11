import Reducer from "./Reducer";

// https://codeburst.io/global-state-with-react-hooks-and-context-api-87019cc4f2cf
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

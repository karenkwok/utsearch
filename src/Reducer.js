/* jshint esversion: 6 */

const Reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
  }
};

export default Reducer;

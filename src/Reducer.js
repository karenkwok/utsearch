/* jshint esversion: 6 */

const Reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "EDIT_BIO":
      return { ...state, user: { ...state.user, bio: action.payload } };
    case "EDIT_BLOCKED":
      return { ...state, user: { ...state.user, blocked: action.payload } };
  }
};

export default Reducer;

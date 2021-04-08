/* jshint esversion: 6 */

const Reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "EDIT_BIO":
      return { ...state, user: { ...state.user, bio: action.payload } };
    case "EDIT_BLOCKED":
      return { ...state, user: { ...state.user, blocked: action.payload } };
    case "EDIT_FRIEND_REQUESTS":
      return {
        ...state,
        user: { ...state.user, friendRequestsSent: action.payload },
      };
    case "EDIT_LOCATION":
      return { ...state, user: { ...state.user, myLocation: action.payload } };
  }
};

export default Reducer;

/* jshint esversion: 6 */

import React, { useEffect, useContext, Children } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import SignupForm from "./authentication/signup";
import SigninForm from "./authentication/signin";
import Profile from "./functions/profile";
import RandomChat from "./functions/randomChat";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";
import { Redirect } from "react-router-dom";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import Store, { Context } from "./Store";
import axios from "axios";

export const client = new ApolloClient({
  //https://idk-lmao.herokuapp.com/graphql production  http://localhost:5000/graphql local
  uri: "https://idk-lmao.herokuapp.com/graphql",
  cache: new InMemoryCache(),
  // tell apollo client to send my session cookie to backend so that the request can be authenticated
  credentials: "include",
});

function Search() {
  return <div>search</div>;
}

function PrivateRoute({ children, ...rest }) {
  const [state, dispatch] = useContext(Context);
  const isAuthenticated = state.user != undefined && state.user != null;
  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (isAuthenticated) {
          return children;
        } else {
          return (
            <Redirect to={{ pathname: "/signin", state: { from: location } }} />
          );
        }
      }}
    />
  );
}

function AuthButton() {
  const [state, dispatch] = useContext(Context);
  const history = useHistory();
  if (state.user !== undefined && state.user !== null) {
    return (
      <p>
        <button
          onClick={() => {
            axios
              .get("https://idk-lmao.herokuapp.com/signout", {
                withCredentials: true,
              })
              .then(() => {
                dispatch({ type: "SET_USER", payload: null });
                history.push("/signin");
              });
          }}
        >
          Sign Out
        </button>
      </p>
    );
  } else {
    return null;
  }
}

function Main() {
  const history = useHistory();
  const [state, dispatch] = useContext(Context);
  console.count("main");
  let username = undefined;
  if (state.user !== undefined && state.user !== null) {
    username = state.user.username;
  } else {
    username = undefined;
  }
  useEffect(() => {
    if (state.user !== undefined) {
      return;
    } else {
      client
        .query({
          query: gql`
            query {
              profile {
                username
                email
              }
            }
          `,
        })
        .then((res) => {
          dispatch({ type: "SET_USER", payload: res.data.profile });
          history.push("/search");
          console.log(res);
        })
        .catch((err) => {
          dispatch({ type: "SET_USER", payload: null });
          console.log(err);
        });
    }
  }, [username]);
  if (state.user === undefined) {
    return <div></div>;
  }
  return (
    <div>
      <AuthButton></AuthButton>
      <Switch>
        <Route exact path="/">
          <Redirect to="/signin" />
        </Route>
        <Route path="/signup">
          <SignupForm></SignupForm>
        </Route>
        <Route path="/signin">
          <SigninForm></SigninForm>
        </Route>
        <PrivateRoute path="/search">
          <Search></Search>
        </PrivateRoute>
        <Route path="/profile">
          <Profile></Profile>
        </Route>
        <Route path="/random-chat">
          <RandomChat></RandomChat>
        </Route>
      </Switch>
    </div>
  );
}

export default function App() {
  return (
    <Store>
      <ApolloProvider client={client}>
        <Router>
          <Main></Main>
        </Router>
      </ApolloProvider>
    </Store>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

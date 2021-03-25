/* jshint esversion: 6 */

import React, { useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import SignupForm from "./authentication/signup";
import SigninForm from "./authentication/signin";
import Search from "./search/search";
import ProfileGeneric from "./search/profile-generic";
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

function PrivateRoute({ children, ...rest }) {
  const [state, dispatch] = useContext(Context);
  const isAuthenticated = state.user !== undefined && state.user !== null;
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
      <button
        id="signout-btn"
        onClick={() => {
          axios
            .get("http://localhost:5000/signout", {
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
                bio
                tags
              }
            }
          `,
        })
        .then((res) => {
          dispatch({ type: "SET_USER", payload: res.data.profile });
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
    <div id="body-wrapper">
      <header></header>
      {/* authbutton is logout button */}
      <AuthButton></AuthButton>
      <div id="meat">
        <Switch>
          <Route exact path="/">
            <Redirect to="/signin" />
          </Route>
          <Route exact path="/signup">
            <SignupForm></SignupForm>
          </Route>
          <Route exact path="/signin">
            <SigninForm></SigninForm>
          </Route>
          <PrivateRoute exact path="/search">
            <Search></Search>
          </PrivateRoute>
          <PrivateRoute exact path="/random-chat">
            <RandomChat></RandomChat>
          </PrivateRoute>
          <PrivateRoute exact path="/profile/:username">
            <ProfileGeneric></ProfileGeneric>
          </PrivateRoute>
          <PrivateRoute exact path="/profile/:username/edit">
            <Profile></Profile>
          </PrivateRoute>
        </Switch>
      </div>
      <footer></footer>
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

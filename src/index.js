/* jshint esversion: 6 */

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import SignupForm from "./authentication/signup";
import SigninForm from "./authentication/signin";
import Search from "./search/search";
import ProfileGeneric from "./search/profile-generic";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";

export const client = new ApolloClient({
  //https://idk-lmao.herokuapp.com/graphql production  http://localhost:5000/graphql local
  uri: "http://localhost:5000/graphql",
  cache: new InMemoryCache(),
  // tell apollo client to send my session cookie to backend so that the request can be authenticated
  credentials: "include",
});

export default function App() {
  useEffect(() => {
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
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  });
  return (
    <ApolloProvider client={client}>
      <Router>
        <div>
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
            <Route path="/search">
              <Search></Search>
            </Route>
            <Route path="/profile-generic">
              <ProfileGeneric></ProfileGeneric>
            </Route>
          </Switch>
        </div>
      </Router>
    </ApolloProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

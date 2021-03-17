/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import SignupForm from "./authentication/signup";
import SigninForm from "./authentication/signin";
import Search from "./search/search";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Redirect } from "react-router-dom";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";

export const client = new ApolloClient({
  //https://idk-lmao.herokuapp.com/graphql production  http://localhost:5000/graphql local
  uri: "https://idk-lmao.herokuapp.com/graphql",
  cache: new InMemoryCache(),
});

export default function App() {
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
          </Switch>
        </div>
      </Router>
    </ApolloProvider>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

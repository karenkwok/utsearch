/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import SignupForm from "./authentication/signup";
import SigninForm from "./authentication/signin";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Redirect } from "react-router-dom";

export default function App() {
  return (
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
        </Switch>
      </div>
    </Router>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "./signup.css";
import "../index.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

class SignupForm extends React.Component {
  render() {
    return (
      <div id="signupform-wrapper">
        <h1>UTSearCh</h1>
        <h2>Sign Up</h2>
        <form id="signupform">
          <p className="signupform-labels">Username</p>
          <input type="text" className="signupform-fields" name="username" />

          <p className="signupform-labels">Password</p>
          <input
            type="password"
            className="signupform-fields"
            name="password"
          />

          <p className="signupform-labels">Email</p>
          <input type="text" className="signupform-fields" name="email" />

          <input type="submit" id="createaccount-btn" value="Create Account" />
        </form>
        <Link to="/signin" id="signupform-link">Already have an account? Sign In.</Link>
      </div>
    );
  }
}

export default SignupForm;

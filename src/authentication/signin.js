/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "./signin.css";
import "../index.css";

class SigninForm extends React.Component {
  render() {
    return (
      <div>
        <h1>UTSearCh</h1>
        <h2>Sign In</h2>
        <form id="signinform">
          <p className="signinform-labels">Username</p>
          <input type="text" className="signinform-fields" name="username" />

          <p className="signinform-labels">Password</p>
          <input
            type="password"
            className="signinform-fields"
            name="password"
          />

          <input type="submit" id="signin-btn" value="Sign In" />
        </form>
      </div>
    );
  }
}

export default SigninForm;

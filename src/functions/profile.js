/* jshint esversion: 6 */

import React from "react";
import ReactDOM from "react-dom";
import "./profile.css";
import "../index.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

class Profile extends React.Component {
  render() {
    return (
      <div id="signinform-wrapper">
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
        <Link to="/signup">Dont have an account? Sign Up.</Link>
      </div>
    );
  }
}

export default Profile;

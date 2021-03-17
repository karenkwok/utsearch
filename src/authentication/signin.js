/* jshint esversion: 6 */

import React from "react";
import "./signin.css";
import "../index.css";
import { Link } from "react-router-dom";

const axios = require("axios");

class SigninForm extends React.Component {
  constructor(props) {
    super(props);
    // initial form state values
    this.state = { username: "", password: "" };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    axios
      // https://idk-lmao.herokuapp.com/signin
      .post("http://localhost:5000/signin", {
        username: this.state.username,
        password: this.state.password,
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <div id="signinform-wrapper">
        <h1>UTSearCh</h1>
        <h2>Sign In</h2>
        <form id="signinform" onSubmit={this.handleSubmit}>
          <p className="signinform-labels">Username</p>
          <input
            type="text"
            className="signinform-fields"
            name="username"
            value={this.state.username}
            onChange={this.handleUsernameChange}
          />

          <p className="signinform-labels">Password</p>
          <input
            type="password"
            className="signinform-fields"
            name="password"
            value={this.state.password}
            onChange={this.handlePasswordChange}
          />

          <input type="submit" id="signin-btn" value="Sign In" />
        </form>
        <Link to="/signup">Don't have an account? Sign Up.</Link>
      </div>
    );
  }
}

export default SigninForm;

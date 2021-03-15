/* jshint esversion: 6 */

import React from "react";
import "./signup.css";
import "../index.css";
import { Link } from "react-router-dom";
import { gql } from "@apollo/client";
import { client } from "../index";

// mutation query
const CREATE_USER = gql`
  mutation($input: CreateUserInput!) {
    CreateUser(input: $input) {
      username
      email
    }
  }
`;

class SignupForm extends React.Component {
  constructor(props) {
    super(props);
    // initial form state values
    this.state = { username: "", password: "", email: "" };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    // use apollo client to mutate with the variables from the form
    client
      .mutate({
        variables: {
          input: {
            username: this.state.username,
            password: this.state.password,
            email: this.state.email,
          },
        },
        // take the above variables into the mutation query above
        mutation: CREATE_USER,
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
      <div id="signupform-wrapper">
        <h1>UTSearCh</h1>
        <h2>Sign Up</h2>
        <form id="signupform" onSubmit={this.handleSubmit}>
          <p className="signupform-labels">Username</p>
          <input
            type="text"
            className="signupform-fields"
            name="username"
            value={this.state.username}
            onChange={this.handleUsernameChange}
          />

          <p className="signupform-labels">Password</p>
          <input
            type="password"
            className="signupform-fields"
            name="password"
            value={this.state.password}
            onChange={this.handlePasswordChange}
          />

          <p className="signupform-labels">Email</p>
          <input
            type="text"
            className="signupform-fields"
            name="email"
            value={this.state.email}
            onChange={this.handleEmailChange}
          />

          <input type="submit" id="createaccount-btn" value="Create Account" />
        </form>
        <Link to="/signin" id="signupform-link">
          Already have an account? Sign In.
        </Link>
      </div>
    );
  }
}

export default SignupForm;

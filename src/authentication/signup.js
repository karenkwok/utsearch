/* jshint esversion: 6 */

import { React, useContext, useState } from "react";
import "./signup.css";
import "../index.css";
import { Link, Redirect, useHistory } from "react-router-dom";
import { gql } from "@apollo/client";
import { client, domain } from "../index";
import { Context } from "../Store";

const axios = require("axios");

// mutation query
const CREATE_USER = gql`
  mutation($input: CreateUserInput!) {
    CreateUser(input: $input) {
      username
      email
    }
  }
`;

function SignupForm() {
  // initial form state values
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [state, dispatch] = useContext(Context);
  const history = useHistory();

  if (state.user !== null && state.user !== undefined) {
    return <Redirect to={{ pathname: "/search" }} />;
  }

  const handleUsernameChange = function (event) {
    setUsername(event.target.value);
  };

  const handlePasswordChange = function (event) {
    setPassword(event.target.value);
  };

  const handleEmailChange = function (event) {
    setEmail(event.target.value);
  };

  const handleSubmit = function (event) {
    event.preventDefault();
    // use apollo client to mutate with the variables from the form
    client
      .mutate({
        variables: {
          input: {
            username,
            password,
            email,
          },
        },
        // take the above variables into the mutation query above
        mutation: CREATE_USER,
      })
      .then((result) => {
        return axios.post(
          domain + "/signin",
          { username, password },
          { withCredentials: true }
        );
      })
      .then((result) => {
        dispatch({ type: "SET_USER", payload: result.data });
        history.push("/search");
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div id="signupform-wrapper">
      <h1>UTSearCh</h1>
      <h2>Sign Up</h2>
      <form id="signupform" onSubmit={handleSubmit}>
        <p className="signupform-labels">Username</p>
        <input
          type="text"
          className="signupform-fields"
          name="username"
          value={username}
          onChange={handleUsernameChange}
        />

        <p className="signupform-labels">Password</p>
        <input
          type="password"
          className="signupform-fields"
          name="password"
          value={password}
          onChange={handlePasswordChange}
        />

        <p className="signupform-labels">Email</p>
        <input
          type="text"
          className="signupform-fields"
          name="email"
          value={email}
          onChange={handleEmailChange}
        />

        <input type="submit" id="createaccount-btn" value="Create Account" />
      </form>
      <Link to="/signin" id="signupform-link">
        Already have an account? Sign In.
      </Link>
    </div>
  );
}

export default SignupForm;
